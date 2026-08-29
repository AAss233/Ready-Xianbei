"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ChevronRight, Search, RotateCcw, EyeOff, Star, ThumbsUp } from "lucide-react";
import { AppShell, SysTopBar, Content, Panel, SectionLabel, HazardBar } from "@/components/shell/ui";
import { getProduct, productsByGear, reviewsFor, type Product } from "@/lib/prep/products";
import { gearDisplayName } from "@/lib/prep/gear";
import { addToCart, useCartCount } from "@/stores/cart-store";

// 双列同类商品卡（可长按弹菜单）
function MiniCard({ p, onOpen, onLongPress }: { p: Product; onOpen: () => void; onLongPress: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => { timer.current = setTimeout(onLongPress, 500); };
  const clear = () => { if (timer.current) clearTimeout(timer.current); };
  return (
    <button
      onClick={onOpen}
      onPointerDown={start}
      onPointerUp={clear}
      onPointerLeave={clear}
      className="flex flex-col border border-ink/15 bg-card text-left active:bg-muted"
      data-el="product-mini-card"
    >
      <div className="halftone flex h-28 items-center justify-center border-b border-ink/10 bg-muted text-4xl">{p.emoji}</div>
      <div className="p-2">
        <div className="line-clamp-2 text-[12px] font-semibold leading-snug text-ink">{p.name}</div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-heading text-sm font-bold text-primary">¥{p.price}{p.unit ? <span className="text-[10px] font-normal text-muted-foreground">/{p.unit}</span> : null}</span>
          <span className="font-mono-label text-[9px] text-muted-foreground">已售 {p.sales}</span>
        </div>
      </div>
    </button>
  );
}

export function ProductScreen({ id }: { id: string }) {
  const router = useRouter();
  const product = getProduct(id);
  const [toast, setToast] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<Product | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const cartCount = useCartCount();

  if (!product) {
    return (
      <AppShell withTab={false}>
        <SysTopBar code="PRODUCT" title="商品" back />
        <Content className="p-8 text-center text-sm text-muted-foreground">未找到该商品</Content>
      </AppShell>
    );
  }

  const gearName = gearDisplayName(product.gearId);
  // 同类其余单品（排除当前 + 已隐藏）
  const siblings = productsByGear(product.gearId).filter((p) => p.id !== product.id && !hidden.has(p.id));
  // 用户评价（按点赞降序）
  const reviews = reviewsFor(product.id);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  return (
    <AppShell withTab={false}>
      <SysTopBar code="PRODUCT" title={gearName} back />
      <Content className="flex flex-col gap-4 p-4 pb-24">
        {/* 商品主图 + 名称 + 品牌 */}
        <div className="flex flex-col gap-3">
          <div className="halftone flex h-52 items-center justify-center border border-ink/20 bg-muted text-7xl" data-el="product-hero">
            {product.emoji}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold leading-tight text-ink">{product.name}</h1>
            <div className="mt-1 font-mono-label text-[11px] text-primary">应急推荐 · {gearName}</div>
          </div>
        </div>

        {/* 评分（放大突出，社区口碑重点） */}
        <div className="flex items-center gap-3 border-y-2 border-ink py-3" data-el="product-rating">
          <span className="font-heading text-6xl font-bold leading-none text-primary">{product.rating}</span>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-0.5 text-primary">
              {Array.from({ length: Math.round(product.rating) }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </span>
            <span className="font-mono-label text-[11px] text-muted-foreground">综合评分 · {reviews.length} 条评价</span>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5">
          {product.tags.map((t) => (
            <span key={t} className="bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{t}</span>
          ))}
        </div>

        {/* 描述 */}
        <Panel className="p-4">
          <SectionLabel en="ABOUT" cn="商品说明" />
          <p className="mt-2 text-[13px] leading-relaxed text-ink">{product.desc}</p>
        </Panel>

        {/* 用户评价区（重点：放在参数前，仅展示高赞前 2 条，可跳全部） */}
        <Panel className="p-4" data-el="product-reviews">
          <SectionLabel en="REVIEWS" cn={`用户评价 · ${reviews.length} 条`} right={
            <span className="flex items-center gap-1 font-mono-label text-[11px] text-primary">
              <Star className="h-3 w-3 fill-primary text-primary" />{product.rating}
            </span>
          } />
          <div className="mt-3 flex flex-col gap-3">
            {reviews.slice(0, 2).map((r, i) => (
              <div key={i} className="border-b border-ink/10 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-ink">{r.user}</span>
                  <span className="flex items-center gap-0.5 text-primary">
                    {Array.from({ length: r.rating }).map((_, k) => (
                      <Star key={k} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/90">{r.text}</p>
                <div className="mt-1.5 flex items-center gap-1 font-mono-label text-[10px] text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" />{r.likes} 人觉得有用
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push(`/product/${product.id}/reviews`)}
            className="mt-3 flex w-full items-center justify-center gap-1 border border-ink/20 py-2 text-[13px] font-semibold text-ink active:bg-muted"
            data-el="product-reviews-all"
          >
            查看全部 {reviews.length} 条评价 <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </Panel>

        {/* 参数表 */}
        <Panel className="p-4" data-el="product-specs">
          <SectionLabel en="SPECS" cn="商品参数" />
          <dl className="mt-2 divide-y divide-ink/10 text-[13px]">
            {[
              ["品牌 / 店铺", product.brand],
              ["规格", product.spec],
              ["所属物资", gearName],
              ["参考价", `¥${product.price}${product.unit ? ` / ${product.unit}` : ""}`],
              ["累计销量", `${product.sales.toLocaleString()} 件`],
              ["综合评分", `${product.rating} / 5.0`],
              ["推荐指数", `${product.score}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        {/* 下滑：双列同类商品 */}
        <div>
          <SectionLabel en="SIMILAR" cn={`更多同类 · ${gearName}`} />
          {siblings.length === 0 ? (
            <div className="mt-2 py-6 text-center text-[12px] text-muted-foreground">暂无更多同类商品</div>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {siblings.map((p) => (
                <MiniCard key={p.id} p={p} onOpen={() => router.push(`/product/${p.id}`)} onLongPress={() => setMenuFor(p)} />
              ))}
            </div>
          )}
          <p className="mt-2 text-center font-mono-label text-[10px] text-muted-foreground">长按商品可「找同类 / 换一个 / 减少此类推荐」</p>
        </div>
      </Content>

      {/* 底部：加入购物车 / 立即购买 */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] items-center gap-2 border-t border-ink/15 bg-card px-4 py-3" data-el="product-buy-bar">
        <button
          className="relative flex flex-col items-center px-2 text-ink"
          onClick={() => router.push("/cart")}
          data-el="product-cart-entry"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-mono-label text-[9px]">购物车</span>
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-1 flex h-4 min-w-4 items-center justify-center border border-ink bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">{cartCount}</span>
          )}
        </button>
        <button
          onClick={() => { addToCart(product.id); flash("已加入购物车"); }}
          className="flex flex-1 items-center justify-center gap-2 border border-ink/25 bg-background py-3 font-heading font-bold uppercase text-ink active:scale-[0.99]"
          data-el="product-addcart"
        >
          加入购物车
        </button>
        <button
          onClick={() => { addToCart(product.id); router.push("/cart"); }}
          className="flex flex-1 items-center justify-center gap-2 border-2 border-primary bg-primary py-3 font-heading font-bold uppercase text-primary-foreground active:scale-[0.99]"
          data-el="product-buy"
        >
          立即购买
        </button>
      </div>

      {/* 长按菜单 */}
      {menuFor && (
        <div className="fixed inset-0 z-40 flex items-end bg-ink/40" onClick={() => setMenuFor(null)}>
          <div className="mx-auto w-full max-w-[480px] border-t border-ink/15 bg-card p-2" onClick={(e) => e.stopPropagation()} data-el="product-longpress-menu">
            <div className="px-3 py-2 text-[12px] font-semibold text-muted-foreground">{menuFor.name}</div>
            <button className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-semibold text-ink active:bg-muted"
              onClick={() => { const m = menuFor; setMenuFor(null); router.push(`/product/${m.id}`); }}>
              <Search className="h-4 w-4 text-primary" /> 找同类（查看该商品与更多同类）
            </button>
            <button className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-semibold text-ink active:bg-muted"
              onClick={() => {
                const next = productsByGear(product.gearId).find((p) => p.id !== product.id && p.id !== menuFor!.id && !hidden.has(p.id));
                setMenuFor(null);
                if (next) router.push(`/product/${next.id}`); else flash("没有更多可换的同类商品了");
              }}>
              <RotateCcw className="h-4 w-4 text-primary" /> 换一个推荐（评分次高的另一款）
            </button>
            <button className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-semibold text-ink active:bg-muted"
              onClick={() => { setHidden((s) => new Set(s).add(menuFor!.id)); setMenuFor(null); flash("已减少此类推荐"); }}>
              <EyeOff className="h-4 w-4 text-muted-foreground" /> 减少此类推荐（不想看这种）
            </button>
            <button className="mt-1 w-full border-t border-ink/10 px-3 py-3 text-center text-sm text-muted-foreground" onClick={() => setMenuFor(null)}>取消</button>
          </div>
        </div>
      )}

      {/* 轻提示 */}
      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-6">
          <div className="border border-ink/20 bg-ink px-4 py-2 text-sm font-semibold text-card">{toast}</div>
        </div>
      )}

      <HazardBar />
    </AppShell>
  );
}
