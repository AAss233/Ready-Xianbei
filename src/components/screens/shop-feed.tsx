"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ThumbsUp, Search, X, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";
import { PRODUCTS, allProducts, topReview, type Product } from "@/lib/prep/products";
import { getGear, gearDisplayName } from "@/lib/prep/gear";
import { DISASTERS } from "@/lib/prep/domain";
import { usePrep } from "@/stores/prep-store";
import { PackBar } from "@/components/screens/pack-bar";
import { useCartCount } from "@/stores/cart-store";

const SORTS: { id: string; label: string }[] = [
  { id: "recommend", label: "推荐" },
  { id: "rating", label: "评分" },
  { id: "sales", label: "销量" },
];

// 爱奇艺式筛选行：维度名固定在左侧，右侧选项横向滑动（不显示滚动轨道）
function FilterRow({
  dimLabel, options, active, onSelect, dataEl,
}: {
  dimLabel: string;
  options: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
  dataEl: string;
}) {
  return (
    <div className="flex items-center gap-2" data-el={dataEl}>
      <span className="shrink-0 border border-primary bg-primary/10 px-2 py-1 font-mono-label text-[12px] font-bold text-primary">
        {dimLabel}
      </span>
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto touch-pan-x overscroll-x-contain whitespace-nowrap pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={`shrink-0 px-2.5 py-1 text-[13px] font-semibold ${active === o.id ? "text-primary" : "text-ink/70"}`}
            data-el={`${dataEl}-tab`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 爱奇艺式排序行：纯文字 + 竖线分隔，选中高亮；评分/销量带正反序上下箭头
function SortRow({ active, dir, onSelect }: { active: string; dir: "asc" | "desc"; onSelect: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3" data-el="shop-sort">
      {SORTS.map((s, i) => {
        const isActive = active === s.id;
        const sortable = s.id === "rating" || s.id === "sales";
        return (
          <div key={s.id} className="flex items-center gap-3">
            {i > 0 && <span className="h-3 w-px bg-ink/20" aria-hidden />}
            <button
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-0.5 text-[14px] ${isActive ? "font-bold text-ink" : "font-medium text-muted-foreground"}`}
              data-el="shop-sort-tab"
            >
              {s.label}
              {sortable && (
                <span className="flex flex-col leading-none" aria-hidden>
                  <ChevronUp className={`h-2.5 w-2.5 ${isActive && dir === "asc" ? "text-primary" : "text-ink/25"}`} strokeWidth={3} />
                  <ChevronDown className={`-mt-0.5 h-2.5 w-2.5 ${isActive && dir === "desc" ? "text-primary" : "text-ink/25"}`} strokeWidth={3} />
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FeedCard({ p, tall, onOpen }: { p: Product; tall: boolean; onOpen: () => void }) {
  const review = topReview(p.id);
  return (
    <button onClick={onOpen} className="mb-2 flex w-full break-inside-avoid flex-col overflow-hidden rounded-xl border border-ink/15 bg-card text-left active:bg-muted" data-el="shop-feed-card">
      <div className={`halftone flex items-center justify-center border-b border-ink/10 bg-muted ${tall ? "h-40" : "h-28"} text-5xl`}>{p.emoji}</div>
      <div className="p-2">
        <div className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">{p.name}</div>

        {/* 评分（社区首页主打口碑，不显示价格/销量/品牌） */}
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-heading text-sm font-bold text-primary">{p.rating}</span>
          <span className="font-mono-label text-[10px] text-muted-foreground">分</span>
        </div>

        {/* 一条高赞评论 */}
        {review && (
          <div className="mt-1.5 border-l-2 border-primary/40 bg-muted/50 py-1 pl-2">
            <p className="line-clamp-2 text-[11px] leading-snug text-ink/80">“{review.text}”</p>
            <div className="mt-1 flex items-center gap-1 font-mono-label text-[9px] text-muted-foreground">
              <ThumbsUp className="h-2.5 w-2.5" />{review.likes} · {review.user}
            </div>
          </div>
        )}

        <div className="mt-1.5 text-[10px] text-muted-foreground">{gearDisplayName(p.gearId)}</div>
      </div>
    </button>
  );
}

export function ShopFeed() {
  const router = useRouter();
  const { tasks } = usePrep();
  const [disaster, setDisaster] = useState("all"); // 灾害种类（含「你的」/通用）
  const [cat, setCat] = useState("all");           // 物品分类
  const [sort, setSort] = useState("recommend");   // 排序
  const [dir, setDir] = useState<"asc" | "desc">("desc"); // 评分/销量的正反序（默认降序）
  // 点同一项：评分/销量在正反序间切换；点不同项：切到该项并回到默认降序
  const handleSort = (id: string) => {
    if (id === sort && (id === "rating" || id === "sales")) {
      setDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSort(id);
      setDir("desc");
    }
  };
  const [query, setQuery] = useState("");           // 搜索关键词
  const cartCount = useCartCount();

  // 你的清单：出现过的 gearId 集合，以及每个 gearId 是否已勾选（备齐）
  const owned = useMemo(() => {
    const set = new Set<string>();
    const doneMap = new Map<string, boolean>();
    tasks.forEach((t) => {
      if (!t.gearId) return;
      set.add(t.gearId);
      // 同一 gearId 只要有任一未勾选就视为「还没齐」
      doneMap.set(t.gearId, (doneMap.get(t.gearId) ?? true) && t.done);
    });
    return { set, doneMap };
  }, [tasks]);

  // 先只按「灾害维度」过滤出候选商品（不含物资分类），用于派生物资分类选项和最终列表
  const disasterFiltered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // all → 全部；yours → 你的清单；general → 通用物资；具体灾害 → 该灾害专属
      if (disaster === "yours") return owned.set.has(p.gearId);
      if (disaster === "all") return true;
      const g = getGear(p.gearId);
      const ds = g?.disasters ?? [];
      return disaster === "general" ? ds.includes("general") : ds.includes(disaster as never);
    });
  }, [disaster, owned]);

  // 物资分类随灾害动态变化：只展示当前灾害范围内实际存在的物资（真正一对一联动）
  const catOpts = useMemo(() => {
    const seen = new Map<string, string>();
    disasterFiltered.forEach((p) => {
      if (!seen.has(p.gearId)) seen.set(p.gearId, gearDisplayName(p.gearId));
    });
    return [{ id: "all", label: "全部" }, ...[...seen].map(([id, label]) => ({ id, label }))];
  }, [disasterFiltered]);

  // 当前物资分类归一化：灾害切换后若旧分类已不在新选项里，视为「全部」（派生，不写 state）
  const effectiveCat = catOpts.some((c) => c.id === cat) ? cat : "all";

  const list = useMemo(() => {
    const arr = disasterFiltered.filter((p) => effectiveCat === "all" || p.gearId === effectiveCat);
    return [...arr].sort((a, b) => {
      // 「你的」优先展示还没备齐（未勾选）、更该尽快买的，已勾选往后排
      if (disaster === "yours") {
        const aDone = owned.doneMap.get(a.gearId) ? 1 : 0;
        const bDone = owned.doneMap.get(b.gearId) ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone; // 未勾选(0)在前
      }
      if (sort === "rating") return dir === "asc" ? a.rating - b.rating : b.rating - a.rating;
      if (sort === "sales") return dir === "asc" ? a.sales - b.sales : b.sales - a.sales;
      return b.score - a.score; // recommend
    });
  }, [disasterFiltered, effectiveCat, sort, dir, disaster, owned]);

  const disasterOpts = [
    { id: "all", label: "全部" },
    { id: "yours", label: "你的" },
    { id: "general", label: "通用" },
    ...DISASTERS.map((d) => ({ id: d.id, label: d.name })),
  ];

  // 搜索优先：有关键词时跨全部商品按「商品名 / 物资名」搜索（忽略灾害/分类筛选）；否则用筛选结果
  const q = query.trim().toLowerCase();
  const displayList = useMemo(() => {
    if (!q) return list;
    return allProducts().filter((p) => {
      const gearName = gearDisplayName(p.gearId);
      return p.name.toLowerCase().includes(q) || gearName.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    });
  }, [q, list]);

  return (
    <div className="flex flex-col">
      {/* 搜索框：按商品名 / 物资名 / 品牌搜索 */}
      <div className="flex items-center gap-2 border-b border-ink/10 bg-background px-4 py-2.5" data-el="shop-search">
        <div className="flex flex-1 items-center gap-2 border border-ink/20 bg-card px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜商品名 / 物资名，如「灭火器」「甲牌」"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted-foreground"
            data-el="shop-search-input"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="清空" className="shrink-0 text-muted-foreground active:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => router.push("/cart")}
          aria-label="购物车"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center border border-ink/20 bg-card active:bg-muted"
          data-el="shop-cart-entry"
        >
          <ShoppingCart className="h-4.5 w-4.5 text-ink" />
          {cartCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center border border-ink bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* 筛选区：搜索时隐藏，回到浏览态才显示（爱奇艺式：维度名固定左侧、选项右侧滑动） */}
      {!q && (
        <div className="flex flex-col gap-2.5 border-b-2 border-ink bg-background px-4 py-3" data-el="shop-filter">
          <FilterRow dimLabel="灾害" options={disasterOpts} active={disaster} onSelect={setDisaster} dataEl="shop-disaster" />
          <FilterRow dimLabel="物资" options={catOpts} active={effectiveCat} onSelect={setCat} dataEl="shop-cat" />
          <div className="pt-0.5"><SortRow active={sort} dir={dir} onSelect={handleSort} /></div>
        </div>
      )}

      {!q && <PackBar />}

      {q && (
        <div className="px-4 pt-3 font-mono-label text-[11px] text-muted-foreground">
          搜索「{query.trim()}」· 找到 {displayList.length} 件
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center" data-el="shop-empty">
          <div className="flex h-14 w-14 items-center justify-center border border-ink/20 bg-muted">
            <Search className="h-7 w-7 text-ink/60" />
          </div>
          <p className="text-sm font-semibold text-ink">
            {q ? `没找到和「${query.trim()}」相关的商品` : "当前筛选下暂无商品"}
          </p>
          <button
            onClick={() => { setQuery(""); setDisaster("all"); setCat("all"); }}
            className="border border-ink/25 bg-card px-5 py-2 text-[13px] font-bold text-ink active:bg-muted"
            data-el="shop-empty-reset"
          >
            {q ? "清空搜索" : "重置筛选"}
          </button>
        </div>
      ) : (
        <div className="columns-2 gap-2 px-4 pb-4 pt-3">
          {displayList.map((p, i) => (
            <FeedCard key={p.id} p={p} tall={i % 3 === 0} onOpen={() => router.push(`/product/${p.id}`)} />
          ))}
        </div>
      )}

      <p className="pb-4 text-center font-mono-label text-[10px] text-muted-foreground">
        商品均为演示数据 · 社区自营商城即将上线
      </p>
    </div>
  );
}
