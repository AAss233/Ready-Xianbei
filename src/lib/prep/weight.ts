// 应急背包(BOB)重量预算（轻量版）：只统计 bob 物资总重，对比全家总上限（人数×单人建议量）。
// 超重时给出「建议精简」排序——优先舍弃「越不关键 + 越重」的物资；水、食物为保命项，永不建议舍弃。
import { getSubItems } from "@/lib/prep/subitems";

// 单人应急背包建议负重（kg）。参考：应急撤离建议 BOB ≤ 体重 ~10–15%，20% 为红线。
// 取普通成人保守值 9kg 作为单人预算。
export const PER_PERSON_KG = 9;

// 舍弃保护名单：这些物资即便超重也不建议丢。
const NEVER_TRIM = new Set(["water", "food"]);

export interface WeightItem {
  id: string;
  name: string;
  group: "bob" | "home";
  disaster: string;
  weightKg?: number;
  personalized?: boolean;
  custom?: boolean;
  done?: boolean; // 是否已备齐（已勾选）
}

// 二级子物品数量表：物资id → { 子物品key → 数量 }
export type SubQtyMap = Record<string, Record<string, number>>;

// 某物资实际重量：有二级清单则按子物品实际数量精算，否则用固定估值 weightKg。
export function effectiveWeight(item: WeightItem, subQty?: SubQtyMap): number {
  const subs = getSubItems(item.id);
  if (subs && subQty) {
    const qtyMap = subQty[item.id] ?? {};
    return subs.reduce((s, it) => s + it.unitWeightKg * (qtyMap[it.key] ?? 0), 0);
  }
  return item.weightKg ?? 0;
}

// 全家背包重量上限：人数 × 单人建议量。
export function weightBudget(members: number): number {
  return Math.max(1, members) * PER_PERSON_KG;
}

// 应急背包已装总重：只算 bob 且「已勾选(已备齐)」的物资，反映实际装进包的重量。
export function bobWeight(tasks: WeightItem[], subQty?: SubQtyMap): number {
  return tasks
    .filter((t) => t.group === "bob" && t.done)
    .reduce((sum, t) => sum + effectiveWeight(t, subQty), 0);
}

// 「可舍弃优先级」分值：越大越该先丢。保命项（水/食物）返回 -1，永不入选。
// 规则：越不关键（通用 general 且非个性化）越该丢，其次越重越该丢。
function trimScore(t: WeightItem, w: number): number {
  if (NEVER_TRIM.has(t.id)) return -1;
  // 关键度：个性化/自定义=最需要保留(+0)，灾害针对性(+1)，纯通用(+2) 越大越可舍
  let expendable = 2;
  if (t.personalized || t.custom) expendable = 0;
  else if (t.disaster !== "general") expendable = 1;
  // 综合：关键度权重更高，重量做次级排序
  return expendable * 100 + w;
}

// 超重时的建议舍弃列表：优先拿出「非必需 + 重」的物资，累加重量直到抵消超出部分。
export function trimSuggestions(
  tasks: WeightItem[],
  overBy: number,
  subQty?: SubQtyMap,
): (WeightItem & { curWeight: number })[] {
  if (overBy <= 0) return [];
  const candidates = tasks
    .filter((t) => t.group === "bob" && t.done && !NEVER_TRIM.has(t.id))
    .map((t) => ({ ...t, curWeight: effectiveWeight(t, subQty) }))
    .filter((t) => t.curWeight > 0)
    .sort((a, b) => trimScore(b, b.curWeight) - trimScore(a, a.curWeight));
  const picked: (WeightItem & { curWeight: number })[] = [];
  let saved = 0;
  for (const t of candidates) {
    if (saved >= overBy) break;
    picked.push(t);
    saved += t.curWeight;
  }
  return picked;
}

// 一次性算出重量状态，供 UI 使用。
export function computeWeightStatus(tasks: WeightItem[], members: number, subQty?: SubQtyMap) {
  const total = bobWeight(tasks, subQty);
  const budget = weightBudget(members);
  const overBy = Math.max(0, total - budget);
  const isOver = total > budget;
  const pct = budget === 0 ? 0 : Math.round((total / budget) * 100);
  return {
    total: Math.round(total * 10) / 10,
    budget,
    overBy: Math.round(overBy * 10) / 10,
    isOver,
    pct,
    suggestions: isOver ? trimSuggestions(tasks, overBy, subQty) : [],
  };
}
