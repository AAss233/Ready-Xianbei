// 一键打包：把「个性化清单里所有能买到的应急背包物资」按选款+配量一次性配齐（无脑打包送到家）。
import { PRODUCTS, packQtyForProduct, type Product } from "@/lib/prep/products";

export type PackTier = "low" | "value" | "full";
export type PackQtyBasis = "full" | "base"; // full=建议量(满配)；base=最低基线量(精简)
export interface PackLine { productId: string; qty: number; }

export const PACK_TIERS: { id: PackTier; label: string; desc: string }[] = [
  { id: "value", label: "性价比款", desc: "综合评分与口碑最优，闭眼入不踩雷（推荐）" },
  { id: "low", label: "低价款", desc: "每类挑最便宜的，先把清单凑齐最省钱" },
  { id: "full", label: "最全款", desc: "每类可选单品全都要，一次配到位" },
];

// 配量二档：按 BOB 背包场景下的二级清单量，按家庭人数自动缩放
export const PACK_QTY_BASES: { id: PackQtyBasis; label: string; desc: string }[] = [
  { id: "full", label: "满配·建议量", desc: "按建议量备足，更安心（推荐）" },
  { id: "base", label: "精简·最低量", desc: "只备最低保命量，先凑齐最省" },
];

interface OwnedTask {
  gearId?: string;
  done: boolean;
}

// 根据选款，为一批 gearId 选出商品
function pickForGear(gearId: string, tier: PackTier): Product[] {
  const list = PRODUCTS.filter((p) => p.gearId === gearId);
  if (list.length === 0) return [];
  if (tier === "full") return list;
  if (tier === "low") return [[...list].sort((a, b) => a.price - b.price)[0]];
  // value：推荐分最高
  return [[...list].sort((a, b) => b.score - a.score)[0]];
}

// 传入清单任务，返回该选款+配量下要加入购物车的商品项。
// 数量按每个单品对应二级子物品的「建议/基线量 × 家庭人数」得出（消耗品才会 >1）。
export function buildPack(
  tasks: OwnedTask[],
  tier: PackTier,
  members: number,
  basis: PackQtyBasis,
): PackLine[] {
  const gearIds = Array.from(
    new Set(
      tasks
        .filter((t) => t.gearId && PRODUCTS.some((p) => p.gearId === t.gearId))
        .map((t) => t.gearId as string),
    ),
  );
  const out: PackLine[] = [];
  gearIds.forEach((gid) => {
    pickForGear(gid, tier).forEach((p) =>
      out.push({ productId: p.id, qty: packQtyForProduct(p, members, basis) }),
    );
  });
  return out;
}

// 预估该选款+配量会打包多少件、多少钱（用于选款页展示）。count 为总件数（含数量）。
export function estimatePack(
  tasks: OwnedTask[],
  tier: PackTier,
  members: number,
  basis: PackQtyBasis,
): { count: number; total: number } {
  const cart = buildPack(tasks, tier, members, basis);
  let total = 0;
  let count = 0;
  cart.forEach((c) => {
    const p = PRODUCTS.find((x) => x.id === c.productId);
    if (p) {
      total += p.price * c.qty;
      count += c.qty;
    }
  });
  return { count, total: Math.round(total * 10) / 10 };
}
