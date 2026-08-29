"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, Check } from "lucide-react";
import { AppShell, SysTopBar, Content, Panel } from "@/components/shell/ui";
import { getProduct } from "@/lib/prep/products";
import { gearDisplayName } from "@/lib/prep/gear";
import { PackBar } from "@/components/screens/pack-bar";
import { TabBar } from "@/components/shell/tab-bar";
import { usePrep } from "@/stores/prep-store";
import {
  useCart, setQty, removeFromCart, clearCart, toggleChecked, setGroupChecked, removeChecked,
  type CartItem, type CartSource,
} from "@/stores/cart-store";

function Box({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={on ? "取消勾选" : "勾选"} className="shrink-0">
      <span className={`flex h-5 w-5 items-center justify-center border-2 ${on ? "border-primary bg-primary text-primary-foreground" : "border-ink/40 bg-background text-transparent"}`}>
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function Row({ item }: { item: CartItem }) {
  const product = getProduct(item.productId);
  if (!product) return null;
  return (
    <Panel className="flex gap-3 p-3" data-el="cart-row">
      <div className="flex items-center"><Box on={item.checked} onClick={() => toggleChecked(item.productId)} /></div>
      <div className="halftone flex h-14 w-14 shrink-0 items-center justify-center border border-ink/10 bg-muted text-2xl">{product.emoji}</div>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-[13px] font-semibold text-ink">{product.name}</div>
        <div className="font-mono-label text-[10px] text-muted-foreground">{gearDisplayName(product.gearId)} · {product.spec}</div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-primary">¥{product.price}{product.unit ? <span className="text-[11px] font-normal text-muted-foreground">/{product.unit}</span> : null}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(item.productId, item.qty - 1)} className="flex h-6 w-6 items-center justify-center border border-ink/25 text-ink active:bg-muted">−</button>
            <span className="w-5 text-center text-[13px] font-semibold text-ink">{item.qty}</span>
            <button onClick={() => setQty(item.productId, item.qty + 1)} className="flex h-6 w-6 items-center justify-center border border-ink/25 text-ink active:bg-muted">＋</button>
            <button onClick={() => removeFromCart(item.productId)} className="ml-1 text-muted-foreground active:text-ink"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Group({ source, title, hint, items }: { source: CartSource; title: string; hint: string; items: CartItem[] }) {
  if (items.length === 0) return null;
  const allChecked = items.every((i) => i.checked);
  return (
    <div className="flex flex-col gap-2" data-el={`cart-group-${source}`}>
      <div className="flex items-center gap-2 pt-1">
        <Box on={allChecked} onClick={() => setGroupChecked(source, !allChecked)} />
        <span className="font-heading text-[15px] font-bold text-ink">{title}</span>
        <span className="font-mono-label text-[10px] text-muted-foreground">{hint} · {items.length} 件</span>
      </div>
      {items.map((it) => <Row key={it.productId} item={it} />)}
    </div>
  );
}

export function CartScreen() {
  const router = useRouter();
  const cart = useCart();
  const { markTasksDoneByGear } = usePrep();
  const [paid, setPaid] = useState(false);

  const packItems = cart.filter((i) => i.source === "pack" && getProduct(i.productId));
  const selfItems = cart.filter((i) => i.source === "self" && getProduct(i.productId));

  const checked = cart.filter((i) => i.checked && getProduct(i.productId));
  const total = checked.reduce((s, i) => s + getProduct(i.productId)!.price * i.qty, 0);
  const checkedCount = checked.reduce((s, i) => s + i.qty, 0);
  const isEmpty = packItems.length + selfItems.length === 0;

  // 完成下单：已购物资对应的清单项自动勾选、数量同步，再清理已购项
  const finishOrder = () => {
    const gearIds = Array.from(
      new Set(checked.map((i) => getProduct(i.productId)!.gearId)),
    );
    markTasksDoneByGear(gearIds);
    removeChecked();
    setPaid(false);
    router.push("/bag");
  };

  return (
    <AppShell withTab={false}>
      <SysTopBar code="CART" title="购物车" back />
      <Content className="flex flex-col gap-3 p-4" style={{ paddingBottom: "calc(180px + env(safe-area-inset-bottom, 0px))" }}>
        {/* 一键打包入口（购物车内也可打包） */}
        <PackBar />

        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center" data-el="cart-empty">
            <div className="flex h-16 w-16 items-center justify-center border border-ink/20 bg-muted">
              <ShoppingCart className="h-8 w-8 text-ink/70" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-ink">购物车还是空的</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                用上方「一键打包」按人数配齐，<br />或去社区按需选购单品。
              </p>
            </div>
            <button
              onClick={() => router.push("/community")}
              className="mt-1 border-2 border-primary bg-primary px-6 py-2.5 font-heading font-bold text-primary-foreground active:scale-[0.99]"
              data-el="cart-empty-shop"
            >
              去社区选购 ›
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end">
              <button onClick={clearCart} className="flex items-center gap-1 text-[12px] text-muted-foreground active:text-ink">
                <Trash2 className="h-3.5 w-3.5" /> 清空
              </button>
            </div>

            <Group source="pack" title="一键打包" hint="按你的清单配齐" items={packItems} />
            <Group source="self" title="自己添加" hint="你手动加购的" items={selfItems} />

            <p className="pt-1 text-center font-mono-label text-[10px] text-muted-foreground">虚拟演示 · 不产生真实交易</p>
          </>
        )}
      </Content>

      {/* 底部结算条：按已勾选计算（浮在底部导航栏之上） */}
      {!isEmpty && (
        <div
          className="fixed inset-x-0 z-30 mx-auto flex max-w-[480px] items-center gap-3 border-t border-ink/15 bg-card px-4 py-3"
          style={{ bottom: "calc(66px + env(safe-area-inset-bottom, 0px))" }}
          data-el="cart-checkout"
        >
          <div className="flex items-baseline gap-1">
            <span className="text-[12px] text-muted-foreground">已选 {checkedCount} 件 · 合计</span>
            <span className="font-heading text-2xl font-bold text-primary">¥{Math.round(total * 10) / 10}</span>
          </div>
          <button
            disabled={checkedCount === 0}
            onClick={() => setPaid(true)}
            className="ml-auto border-2 border-primary bg-primary px-5 py-2.5 font-heading font-bold uppercase text-primary-foreground active:scale-[0.99] disabled:opacity-40"
            data-el="cart-pay"
          >
            结算({checkedCount})
          </button>
        </div>
      )}

      {/* 付款成功（虚拟）：只清理已勾选，保留未勾选 */}
      {paid && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-8" onClick={() => setPaid(false)}>
          <div className="w-full max-w-[320px] border border-ink/20 bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary text-primary-foreground"><Check className="h-6 w-6" /></div>
            <h3 className="font-heading text-xl font-bold text-ink">下单成功（演示）</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">已勾选的物资已「打包送出」，未勾选的仍留在购物车。</p>
            <button
              onClick={finishOrder}
              className="mt-4 w-full border-2 border-primary bg-primary py-2.5 font-heading font-bold text-primary-foreground"
            >
              完成 · 返回背包
            </button>
          </div>
        </div>
      )}

      <TabBar />
    </AppShell>
  );
}
