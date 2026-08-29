"use client";

// 轻量购物车（虚拟演示）：模块级状态 + localStorage + 订阅，无需 Provider。
import { useSyncExternalStore } from "react";

const KEY = "xianbei-cart-v2";

export type CartSource = "pack" | "self"; // pack=一键打包带入 self=用户自己加购

export interface CartItem {
  productId: string;
  qty: number;
  source: CartSource;
  checked: boolean; // 是否勾选参与结算
}

let items: CartItem[] = load();
const listeners = new Set<() => void>();

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<CartItem>[];
    // 兼容/加固：补齐字段
    return parsed.map((i) => ({
      productId: String(i.productId),
      qty: i.qty ?? 1,
      source: i.source === "pack" ? "pack" : "self",
      checked: i.checked ?? true,
    }));
  } catch {
    return [];
  }
}

function persist() {
  try {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// —— 操作 API ——
// 用户自己加购：写入 self 类、默认勾选；已存在则加数量（并归为 self、勾选）
export function addToCart(productId: string, qty = 1) {
  const found = items.find((i) => i.productId === productId);
  if (found) {
    items = items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty, source: "self", checked: true } : i));
  } else {
    items = [...items, { productId, qty, source: "self", checked: true }];
  }
  persist();
}

// 一键打包：用一批 pack 商品「替换」原有 pack 类，保留 self 类；
// 只勾选 pack 类，取消勾选 self 类（不清理 self）。
export function applyPack(packProductIds: { productId: string; qty?: number }[]) {
  const self = items
    .filter((i) => i.source === "self")
    .map((i) => ({ ...i, checked: false })); // 取消勾选自加购，但保留
  const pack: CartItem[] = packProductIds.map((p) => ({
    productId: p.productId,
    qty: p.qty ?? 1,
    source: "pack" as const,
    checked: true,
  }));
  items = [...pack, ...self];
  persist();
}

export function setQty(productId: string, qty: number) {
  if (qty <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else {
    items = items.map((i) => (i.productId === productId ? { ...i, qty } : i));
  }
  persist();
}

export function toggleChecked(productId: string) {
  items = items.map((i) => (i.productId === productId ? { ...i, checked: !i.checked } : i));
  persist();
}

// 分组总勾选：把某来源的全部项设为 checked
export function setGroupChecked(source: CartSource, checked: boolean) {
  items = items.map((i) => (i.source === source ? { ...i, checked } : i));
  persist();
}

export function removeFromCart(productId: string) {
  items = items.filter((i) => i.productId !== productId);
  persist();
}

// 移除已勾选（结算成功后清理已购）
export function removeChecked() {
  items = items.filter((i) => !i.checked);
  persist();
}

export function clearCart() {
  items = [];
  persist();
}

// —— React hooks ——
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, () => items, () => items);
}

export function useCartCount(): number {
  const list = useCart();
  return list.reduce((n, i) => n + i.qty, 0);
}
