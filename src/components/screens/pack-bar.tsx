"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Check } from "lucide-react";
import { usePrep } from "@/stores/prep-store";
import { applyPack } from "@/stores/cart-store";
import { getProduct } from "@/lib/prep/products";
import {
  PACK_TIERS, PACK_QTY_BASES, buildPack, estimatePack,
  type PackTier, type PackQtyBasis,
} from "@/lib/prep/pack";

// 社区筛选区下方的「一键打包个性化背包」入口 + 选款/配量弹层
export function PackBar() {
  const router = useRouter();
  const { tasks, markTasksDoneByGear, profile } = usePrep();
  const members = profile?.members ?? 1;
  const [open, setOpen] = useState(false);
  const [basis, setBasis] = useState<PackQtyBasis>("full"); // 配量：满配 / 精简

  // 清单里能一键配齐的物资类别数（用估算的件数无关的入口文案，用性价比+满配估一版）
  const packable = estimatePack(tasks, "value", members, "full");

  const confirm = (tier: PackTier) => {
    const cart = buildPack(tasks, tier, members, basis);
    // 只勾选打包类、保留并取消勾选自加购类
    applyPack(cart.map((c) => ({ productId: c.productId, qty: c.qty })));
    // 打包的商品对应哪些物资 → 个性化清单同步勾选、数量到建议量
    const gearIds = Array.from(
      new Set(cart.map((c) => getProduct(c.productId)?.gearId).filter(Boolean) as string[]),
    );
    markTasksDoneByGear(gearIds);
    setOpen(false);
    router.push("/cart");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mx-4 mt-3 flex items-center gap-3 border-2 border-primary bg-primary px-4 py-3 text-left active:scale-[0.99]"
        data-el="pack-entry"
      >
        <Package className="h-6 w-6 shrink-0 text-primary-foreground" />
        <div className="flex-1">
          <div className="font-heading text-[15px] font-bold text-primary-foreground">一键打包你的个性化背包</div>
          <div className="font-mono-label text-[10px] text-primary-foreground/80">
            {packable.count > 0 ? `按 ${members} 人清单配齐 ${packable.count} 件 · 送到家` : "先完成风险评估生成你的清单"}
          </div>
        </div>
        <span className="font-heading text-lg font-bold text-primary-foreground">›</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-ink/45" onClick={() => setOpen(false)}>
          <div className="w-full max-w-[400px] border border-ink/20 bg-card p-4" onClick={(e) => e.stopPropagation()} data-el="pack-sheet">
            <div className="mb-1 font-heading text-lg font-bold text-ink">选择打包方案</div>
            <p className="mb-3 text-[12px] text-muted-foreground">
              仅打包清单里还没备齐的物资，连 BOB 一起组好；水、食物等按 {members} 人自动配量。
            </p>

            {/* 配量二档：满配·建议量 / 精简·最低量（按 BOB 场景×人数缩放） */}
            <div className="mb-3">
              <div className="mb-1.5 font-mono-label text-[10px] text-primary">配 量</div>
              <div className="grid grid-cols-2 gap-2">
                {PACK_QTY_BASES.map((b) => {
                  const active = basis === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBasis(b.id)}
                      className={`border-2 p-2 text-left ${active ? "border-ink bg-primary/10" : "border-ink/25 bg-background"}`}
                      data-el="pack-qty-basis"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`flex h-3.5 w-3.5 items-center justify-center border ${active ? "border-ink bg-primary text-primary-foreground" : "border-ink/40 text-transparent"}`}>
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <span className="font-heading text-[13px] font-bold text-ink">{b.label}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{b.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-1.5 font-mono-label text-[10px] text-primary">选 款</div>
            <div className="flex flex-col gap-2">
              {PACK_TIERS.map((t) => {
                const est = estimatePack(tasks, t.id, members, basis);
                return (
                  <button
                    key={t.id}
                    onClick={() => confirm(t.id)}
                    disabled={est.count === 0}
                    className="flex items-center gap-3 border border-ink/20 bg-background p-3 text-left active:bg-muted disabled:opacity-40"
                    data-el="pack-tier"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-[15px] font-bold text-ink">{t.label}</span>
                        {t.id === "value" && <span className="bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">推荐</span>}
                      </div>
                      <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{t.desc}</div>
                      <div className="mt-1 font-mono-label text-[11px] text-primary">{est.count} 件 · 约 ¥{est.total}</div>
                    </div>
                    <Check className="h-5 w-5 text-primary" />
                  </button>
                );
              })}
            </div>
            {packable.count === 0 && (
              <p className="mt-3 text-center text-[12px] text-muted-foreground">当前清单里的物资都已备齐，暂无需打包～</p>
            )}
            <button onClick={() => setOpen(false)} className="mt-3 w-full py-2 text-center text-[13px] text-muted-foreground">取消</button>
          </div>
        </div>
      )}
    </>
  );
}
