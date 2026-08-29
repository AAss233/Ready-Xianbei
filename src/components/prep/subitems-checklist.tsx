"use client";

import { useRouter } from "next/navigation";
import { Plus, Minus, Check, ChevronRight } from "lucide-react";
import { Panel, SectionLabel } from "@/components/shell/ui";
import { getSubItems, scaledRecommended, scaledBaseline } from "@/lib/prep/subitems";
import { productForSub } from "@/lib/prep/products";
import { usePrep } from "@/stores/prep-store";

// 二级清单交互组件：带勾选(toggle) 与 数量累加(count) 的子物品清单。
// 子物品数量/勾选变化会通过 store 联动一级清单与背包重量。
// 建议量/基线量按家庭人数缩放（perPerson 子物品 × 人数）。
export function SubItemsChecklist({ itemId }: { itemId: string }) {
  const router = useRouter();
  const { subQty, setSubQty, profile } = usePrep();
  const members = profile?.members ?? 1;
  const subs = getSubItems(itemId);
  if (!subs) return null;
  const qtyOf = (key: string) => subQty[itemId]?.[key] ?? 0;

  return (
    <Panel className="p-4" data-el="item-subitems">
      <SectionLabel en="WHAT'S INSIDE" cn="里面具体装什么" />
      <ul className="mt-2 divide-y divide-ink/10">
        {subs.map((s) => {
          const qty = qtyOf(s.key);
          const rec = scaledRecommended(s, members);
          const base = scaledBaseline(s, members);
          const packed = qty >= rec;
          const pick = productForSub(itemId, s.key); // 每个子物品各自匹配对应商品（无精确匹配则回退到该物资推荐单品）
          return (
            <li key={s.key} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  disabled={!pick}
                  onClick={() => pick && router.push(`/product/${pick.id}`)}
                  className="flex items-center gap-1.5 text-left text-[13px] font-bold text-ink disabled:cursor-default"
                >
                  <span className={pick ? "underline decoration-primary/40 decoration-dotted underline-offset-2" : ""}>{s.name}</span>
                  {s.essential && (
                    <span className="border border-red-500/50 px-1 text-[9px] font-bold text-red-600">必需</span>
                  )}
                  {s.scale === "perPerson" && members > 1 && (
                    <span className="border border-primary/40 px-1 text-[9px] font-bold text-primary">×{members}人</span>
                  )}
                  {pick && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />}
                </button>
                {s.note && <div className="text-[11px] leading-snug text-muted-foreground">{s.note}</div>}
                <div className="mt-0.5 font-mono-label text-[10px] text-primary">
                  建议 {rec}{s.unit ?? ""}
                  {s.type === "count" && base ? ` · 最低 ${base}${s.unit ?? ""}` : ""}
                </div>
              </div>

              {s.type === "toggle" ? (
                <button
                  onClick={() => setSubQty(itemId, s.key, packed ? 0 : 1)}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center border-2 ${
                    packed ? "border-ink bg-primary text-primary-foreground" : "border-ink/30 bg-card text-transparent"
                  }`}
                  aria-label={packed ? "取消" : "勾选"}
                >
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setSubQty(itemId, s.key, Math.max(0, qty - 1))}
                    className="flex h-7 w-7 items-center justify-center border border-ink/30 bg-card active:bg-muted"
                    aria-label="减少"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <div className="min-w-[3.2rem] text-center">
                    <span className={`font-heading text-base font-bold ${packed ? "text-primary" : "text-ink"}`}>
                      {qty}
                    </span>
                    <span className="text-[11px] text-muted-foreground">/{rec}{s.unit ?? ""}</span>
                  </div>
                  <button
                    onClick={() => setSubQty(itemId, s.key, qty + 1)}
                    className="flex h-7 w-7 items-center justify-center border border-ink/30 bg-card active:bg-muted"
                    aria-label="增加"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
