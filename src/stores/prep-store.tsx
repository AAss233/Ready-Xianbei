"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FamilyProfile, FamilyTag, ListGroup } from "@/lib/prep/rules";
import { computeTags, matchTasks, commonEssentials } from "@/lib/prep/rules";
import { getItems } from "@/lib/prep/custom-store";
import { hasLocalRisk, lowRiskConcerns } from "@/lib/prep/geo-risk";
import { getSubItems, scaledRecommended, scaledBaseline } from "@/lib/prep/subitems";
import type { DisasterId, TitleTier } from "@/lib/prep/domain";
import {
  computeGrowth,
  titleFromGrowth,
  QUIZ_POINT_PER_CORRECT,
} from "@/lib/prep/domain";

// 把任务模板映射为清单项（未完成、非自定义），保留数量字段
function templateToTask(m: {
  key: string; name: string; group: ListGroup; disaster: DisasterId | "general";
  gearId?: string; reasonTags: string[]; detail?: string; target?: number; unit?: string;
  requireTags?: unknown[]; weightKg?: number;
}, done = false): Task {
  return {
    id: m.key, name: m.name, group: m.group, disaster: m.disaster,
    gearId: m.gearId, reasonTags: m.reasonTags, detail: m.detail,
    target: m.target, unit: m.unit, done, custom: false,
    weightKg: m.weightKg,
    // 有 requireTags = 由用户特征匹配出来的「个性化」物资，展示时优先靠前
    personalized: Array.isArray(m.requireTags) && m.requireTags.length > 0,
  };
}

// 默认清单：未评估时也展示的「人人家中常备」通用必备物资（完成度从 0 开始）
function buildDefaultTasks(): Task[] {
  return commonEssentials(getItems()).map((m) => templateToTask(m, false));
}

// 地域过滤：剔除「本地无风险且用户未强制加入」的地域灾害物资。
// general 与非地域灾害（火灾/燃气/入室抢劫）恒保留；forceInclude 中的灾害也保留。
function geoFilterTasks(
  tasks: Task[],
  province: string | undefined,
  forceInclude: DisasterId[],
): Task[] {
  return tasks.filter((t) => {
    if (t.disaster === "general") return true;
    const d = t.disaster as DisasterId;
    if (hasLocalRisk(province, d)) return true;
    return forceInclude.includes(d); // 本地低风险：仅当用户「就要加」才保留
  });
}

// 前端阶段：本地状态 + localStorage。后端接入时整体替换为真实 API 读写。
export interface Task {
  id: string;
  name: string;
  group: ListGroup;
  disaster: DisasterId | "general";
  gearId?: string;
  reasonTags: string[];
  detail?: string;
  done: boolean;
  custom: boolean;
  target?: number; // 目标数量（可量化物资，如 8）
  unit?: string;   // 单位（如 L / 包 / 套）
  weightKg?: number; // 装进应急背包的估算总重（kg），仅 bob 物资有
  personalized?: boolean; // 是否由用户特征匹配出的个性化物资（展示优先）
}

// 持久化的原子状态（不含派生值）
interface PrepState {
  hasProfile: boolean;
  profile: FamilyProfile | null;
  tags: FamilyTag[];
  tasks: Task[];
  quizPoints: number; // 后台累计答题积分
  quizStreak: number;
  highestGrowth: number; // 历史最高综合成长值（用于最高称号）
  needRecheck: boolean; // 灾后回首页提醒检查物资
  nickname: string; // 本地昵称（demo：各手机独立，不接真实登录）
  // 用户「就要加」的本地低风险地域灾害（覆盖默认过滤，把这些物资加回清单）
  forceIncludeDisasters: DisasterId[];
  // 二级清单：物资id → { 子物品key → 已备数量 }（count 为数量，toggle 为 0/1）。
  subQty: Record<string, Record<string, number>>;
}

interface PrepContextValue extends PrepState {
  ready: boolean;
  // 派生值
  completedCount: number;
  totalCount: number;
  progress: number; // 清单完成度 %
  growth: number; // 综合成长值 0-100（后台）
  title: TitleTier; // 当前称号
  highestTitle: TitleTier; // 历史最高称号
  // 用户在意、但本地实际无风险的地域灾害（未被“就要加”覆盖的那些，用于提醒条）
  lowRiskAlerts: DisasterId[];
  // 动作
  saveProfile: (p: FamilyProfile) => void;
  setForceInclude: (disaster: DisasterId, include: boolean) => void; // 低风险灾害：加回/移除
  dismissConcern: (disaster: DisasterId) => void; // 「算了」：从在意灾害中移除并同步取消评估勾选
  setSubQty: (itemId: string, subKey: string, qty: number) => void; // 设置二级子物品已备数量（含一级联动）
  toggleTask: (id: string) => void;
  markTasksDoneByGear: (gearIds: string[]) => void; // 一键打包后：把对应物资勾选、子物品数量同步到建议量
  addCustomTask: (name: string, group: ListGroup) => void;
  removeTask: (id: string) => void; // 从清单删除某项
  recordCorrectQuiz: () => void;
  addGrowth: (n: number) => void; // 兼容旧调用：折算为答题积分
  flagRecheck: () => void; // 灾后触发提醒
  clearRecheck: () => void; // 用户处理后清除提醒
  setNickname: (name: string) => void; // 修改本地昵称
  resetAll: () => void; // 重置为初始（未填写）状态，用于演示
}

const STORAGE_KEY = "xianbei-ready-state-v6";

const DEFAULT_STATE: PrepState = {
  hasProfile: false,
  profile: null,
  tags: [],
  tasks: buildDefaultTasks(), // 未评估也显示默认常备清单
  quizPoints: 0,
  quizStreak: 0,
  highestGrowth: 0,
  needRecheck: false,
  nickname: "先备用户",
  forceIncludeDisasters: [],
  subQty: {},
};

const PrepContext = createContext<PrepContextValue | null>(null);

export function PrepProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrepState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = { ...DEFAULT_STATE, ...parsed };
        // 兼容旧存档：未评估且清单为空时，回填默认常备清单
        if (!merged.hasProfile && (!merged.tasks || merged.tasks.length === 0)) {
          merged.tasks = buildDefaultTasks();
        }
        setState(merged);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const value = useMemo<PrepContextValue>(() => {
    const completedCount = state.tasks.filter((t) => t.done).length;
    const totalCount = state.tasks.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    const growth = computeGrowth(progress, state.quizPoints);
    const title = titleFromGrowth(growth);
    const highestTitle = titleFromGrowth(Math.max(growth, state.highestGrowth));

    // 用户在意、但本地无风险、且未选择「就要加」的地域灾害 → 提醒条展示
    const lowRiskAlerts = lowRiskConcerns(
      state.profile?.province,
      state.profile?.concernedDisasters,
    ).filter((d) => !state.forceIncludeDisasters.includes(d));

    // 派生后同步最高成长值（副作用放在渲染后由 action 触发；这里只读）
    return {
      ...state,
      ready,
      completedCount,
      totalCount,
      progress,
      growth,
      title,
      highestTitle,
      lowRiskAlerts,
      saveProfile: (p) => {
        const tags = computeTags(p);
        const matched = matchTasks(tags, getItems());
        setState((prev) => {
          const prevMap = new Map(prev.tasks.map((t) => [t.id, t]));
          const nextTasks: Task[] = geoFilterTasks(
            matched.map((m) => {
              const existing = prevMap.get(m.key);
              return { ...templateToTask(m, existing?.done ?? false) };
            }),
            p.province,
            prev.forceIncludeDisasters,
          );
          const customs = prev.tasks.filter((t) => t.custom);
          return { ...prev, hasProfile: true, profile: p, tags, tasks: [...nextTasks, ...customs] };
        });
      },
      setForceInclude: (disaster, include) => {
        setState((prev) => {
          const nextForce = include
            ? Array.from(new Set([...prev.forceIncludeDisasters, disaster]))
            : prev.forceIncludeDisasters.filter((d) => d !== disaster);
          if (!prev.profile) return { ...prev, forceIncludeDisasters: nextForce };
          // 重建清单以加回 / 移除该灾害物资，保留已勾选与自定义项
          const matched = matchTasks(prev.tags, getItems());
          const prevMap = new Map(prev.tasks.map((t) => [t.id, t]));
          const nextTasks = geoFilterTasks(
            matched.map((m) => ({ ...templateToTask(m, prevMap.get(m.key)?.done ?? false) })),
            prev.profile.province,
            nextForce,
          );
          const customs = prev.tasks.filter((t) => t.custom);
          return { ...prev, forceIncludeDisasters: nextForce, tasks: [...nextTasks, ...customs] };
        });
      },
      dismissConcern: (disaster) => {
        // 「算了」：从在意灾害中移除该灾害（评估页同步取消勾选），并清掉强制加入
        setState((prev) => {
          if (!prev.profile) return prev;
          const nextConcerned = (prev.profile.concernedDisasters ?? []).filter((d) => d !== disaster);
          const nextForce = prev.forceIncludeDisasters.filter((d) => d !== disaster);
          const nextProfile = { ...prev.profile, concernedDisasters: nextConcerned };
          return { ...prev, profile: nextProfile, forceIncludeDisasters: nextForce };
        });
      },
      setSubQty: (itemId, subKey, qty) => {
        setState((prev) => {
          const subs = getSubItems(itemId);
          if (!subs) return prev;
          const clamped = Math.max(0, qty);
          const cur = { ...(prev.subQty[itemId] ?? {}) };
          cur[subKey] = clamped;
          const nextSubQty = { ...prev.subQty, [itemId]: cur };
          // 一级联动：所有「必需」子物品达到最低配置(baseline) → 该物资自动勾选（非必需可不备）
          const members = prev.profile?.members ?? 1;
          const allDone = subs.every((s) => !s.essential || (cur[s.key] ?? 0) >= scaledBaseline(s, members));
          const tasks = prev.tasks.map((t) => (t.id === itemId ? { ...t, done: allDone } : t));
          const done = tasks.filter((t) => t.done).length;
          const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);
          const g = computeGrowth(pct, prev.quizPoints);
          return { ...prev, subQty: nextSubQty, tasks, highestGrowth: Math.max(prev.highestGrowth, g) };
        });
      },
      toggleTask: (id) => {
        setState((prev) => {
          const nextDone = !prev.tasks.find((t) => t.id === id)?.done;
          const tasks = prev.tasks.map((t) => (t.id === id ? { ...t, done: nextDone } : t));
          // 若该物资有二级清单：勾选→子物品全部到建议量；取消→全部清零
          let nextSubQty = prev.subQty;
          const subs = getSubItems(id);
          if (subs) {
            const members = prev.profile?.members ?? 1;
            const filled: Record<string, number> = {};
            subs.forEach((s) => (filled[s.key] = nextDone ? scaledRecommended(s, members) : 0));
            nextSubQty = { ...prev.subQty, [id]: filled };
          }
          const done = tasks.filter((t) => t.done).length;
          const total = tasks.length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          const g = computeGrowth(pct, prev.quizPoints);
          return { ...prev, tasks, subQty: nextSubQty, highestGrowth: Math.max(prev.highestGrowth, g) };
        });
      },
      markTasksDoneByGear: (gearIds) => {
        setState((prev) => {
          const set = new Set(gearIds);
          let nextSubQty = { ...prev.subQty };
          const members = prev.profile?.members ?? 1;
          const tasks = prev.tasks.map((t) => {
            if (!t.gearId || !set.has(t.gearId) || t.done) return t;
            // 勾选该物资，并把其二级子物品数量同步到建议量
            const subs = getSubItems(t.id);
            if (subs) {
              const filled: Record<string, number> = {};
              subs.forEach((s) => (filled[s.key] = scaledRecommended(s, members)));
              nextSubQty = { ...nextSubQty, [t.id]: filled };
            }
            return { ...t, done: true };
          });
          const done = tasks.filter((t) => t.done).length;
          const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);
          const g = computeGrowth(pct, prev.quizPoints);
          return { ...prev, tasks, subQty: nextSubQty, highestGrowth: Math.max(prev.highestGrowth, g) };
        });
      },
      addCustomTask: (name, group) => {
        setState((prev) => ({
          ...prev,
          tasks: [
            ...prev.tasks,
            {
              id: `custom-${Date.now()}`,
              name,
              group,
              disaster: "general",
              reasonTags: ["自定义"],
              done: false,
              custom: true,
            },
          ],
        }));
      },
      removeTask: (id) => {
        setState((prev) => {
          const tasks = prev.tasks.filter((t) => t.id !== id);
          const done = tasks.filter((t) => t.done).length;
          const total = tasks.length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          const g = computeGrowth(pct, prev.quizPoints);
          return { ...prev, tasks, highestGrowth: Math.max(prev.highestGrowth, g) };
        });
      },
      recordCorrectQuiz: () => {
        setState((prev) => {
          const quizPoints = prev.quizPoints + QUIZ_POINT_PER_CORRECT;
          const g = computeGrowth(progress, quizPoints);
          return {
            ...prev,
            quizPoints,
            quizStreak: prev.quizStreak + 1,
            highestGrowth: Math.max(prev.highestGrowth, g),
          };
        });
      },
      // 兼容旧调用：把外部加分折算为答题积分
      addGrowth: (n) =>
        setState((prev) => {
          const quizPoints = Math.max(0, prev.quizPoints + n);
          const g = computeGrowth(progress, quizPoints);
          return { ...prev, quizPoints, highestGrowth: Math.max(prev.highestGrowth, g) };
        }),
      flagRecheck: () => setState((prev) => ({ ...prev, needRecheck: true })),
      clearRecheck: () => setState((prev) => ({ ...prev, needRecheck: false })),
      setNickname: (name) =>
        setState((prev) => ({ ...prev, nickname: name.trim() || "先备用户" })),
      resetAll: () => setState(DEFAULT_STATE),
    };
  }, [state, ready]);

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}

export function usePrep(): PrepContextValue {
  const ctx = useContext(PrepContext);
  if (!ctx) throw new Error("usePrep must be used within PrepProvider");
  return ctx;
}
