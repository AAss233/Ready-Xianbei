"use client";

// 后台自定义覆盖层：把「物资清单」与「小游戏题库」的可编辑数据存进【云端数据库】。
// - 后台保存 → PUT /api/admin-content/{key} 写云端；同时更新内存缓存并广播。
// - 所有 app 端页面通过 hook 读内存缓存；模块启动即拉云端，并每 10s 轮询同步。
//   => 你在电脑后台改，观众手机刷新（或等一轮轮询）即可看到最新内容。
// - localStorage 仅作离线镜像：首屏先用本地镜像秒开，随后被云端覆盖。
import { useSyncExternalStore } from "react";
import { TASK_TEMPLATES_ALL, type TaskTemplate } from "@/lib/prep/rules";
import { JUDGE_BANK, type JudgeQuestion } from "@/lib/prep/quiz-bank";

const MIRROR_ITEMS = "xianbei-admin-items-mirror-v12";
const MIRROR_QUIZ = "xianbei-admin-quiz-mirror-v12";
const EVENT = "xianbei-admin-change";
const POLL_MS = 10_000;

// ——— 内存缓存（同步读取的唯一数据源）———
type Cache = { items: TaskTemplate[] | null; quiz: JudgeQuestion[] | null };
const cache: Cache = { items: null, quiz: null };

function readMirror<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeMirror(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

// 用云端数据填充缓存；null 表示云端未定制 → 用内置默认。
function applyItems(data: TaskTemplate[] | null) {
  cache.items = data;
  if (data) writeMirror(MIRROR_ITEMS, data);
  else if (typeof window !== "undefined") localStorage.removeItem(MIRROR_ITEMS);
  notify();
}
function applyQuiz(data: JudgeQuestion[] | null) {
  cache.quiz = data;
  if (data) writeMirror(MIRROR_QUIZ, data);
  else if (typeof window !== "undefined") localStorage.removeItem(MIRROR_QUIZ);
  notify();
}

// ——— 云端同步 ———
async function fetchKey<T>(key: string): Promise<T | null> {
  try {
    const r = await fetch(`/api/admin-content/${key}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { ok: boolean; data: T | null };
    return j.ok ? j.data : null;
  } catch {
    return null;
  }
}

async function syncFromCloud() {
  const [items, quiz] = await Promise.all([
    fetchKey<TaskTemplate[]>("items"),
    fetchKey<JudgeQuestion[]>("quiz"),
  ]);
  // 仅当有变化时才写缓存+广播，避免无谓重渲染。
  if (JSON.stringify(items) !== JSON.stringify(cache.items)) applyItems(items);
  if (JSON.stringify(quiz) !== JSON.stringify(cache.quiz)) applyQuiz(quiz);
}

let started = false;
function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  // 首屏用本地镜像秒开
  cache.items = readMirror<TaskTemplate[]>(MIRROR_ITEMS);
  cache.quiz = readMirror<JudgeQuestion[]>(MIRROR_QUIZ);
  // 随即拉云端并轮询
  void syncFromCloud();
  setInterval(() => void syncFromCloud(), POLL_MS);
  // 页面重新可见时立即同步一次
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncFromCloud();
  });
}

// ——— 物资清单 ———
export function getItems(): TaskTemplate[] {
  ensureStarted();
  return cache.items ?? TASK_TEMPLATES_ALL;
}
export async function saveItems(items: TaskTemplate[]) {
  applyItems(items); // 本地立即生效
  await fetch("/api/admin-content/items", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: items }),
  }).catch(() => {});
}
export async function resetItems() {
  applyItems(null);
  await fetch("/api/admin-content/items", { method: "DELETE" }).catch(() => {});
}
export function isItemsCustomized(): boolean {
  return cache.items !== null;
}

// ——— 小游戏题库 ———
export function getQuiz(): JudgeQuestion[] {
  ensureStarted();
  return cache.quiz ?? JUDGE_BANK;
}
export async function saveQuiz(qs: JudgeQuestion[]) {
  applyQuiz(qs);
  await fetch("/api/admin-content/quiz", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: qs }),
  }).catch(() => {});
}
export async function resetQuiz() {
  applyQuiz(null);
  await fetch("/api/admin-content/quiz", { method: "DELETE" }).catch(() => {});
}
export function isQuizCustomized(): boolean {
  return cache.quiz !== null;
}

// ——— React 订阅：任何页面用 hook 拿到最新数据，云端一变即时刷新 ———
function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  ensureStarted();
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useAdminItems(): TaskTemplate[] {
  return useSyncExternalStore(subscribe, getItems, () => TASK_TEMPLATES_ALL);
}
export function useAdminQuiz(): JudgeQuestion[] {
  return useSyncExternalStore(subscribe, getQuiz, () => JUDGE_BANK);
}
