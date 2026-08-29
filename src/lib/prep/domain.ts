// 领域数据：6 类灾害、7 阶称号系统、成长值公式、题库等静态内容
export type DisasterId =
  | "burglary"
  | "gas"
  | "fire"
  | "earthquake"
  | "flood"
  | "typhoon";

export interface Disaster {
  id: DisasterId;
  name: string;
  nameEn: string;
  icon: string; // lucide icon name
  category: "治安" | "事故" | "自然灾害";
  bg: string; // 主题视觉素材路径
  // 通俗判定线索：帮用户判断“我现在是不是遇上了”，选择页用一句话呈现
  cue: string;
  // 兼容旧页面字段（逐步移除）
  riskDefault: number;
  riskLabel: "低" | "中" | "高";
}

// 统一 6 类灾害
export const DISASTERS: Disaster[] = [
  { id: "burglary", name: "入室抢劫", nameEn: "BURGLARY", icon: "shield-alert", category: "治安", bg: "/bg/tower.png", cue: "", riskDefault: 4, riskLabel: "低" },
  { id: "gas", name: "燃气泄漏", nameEn: "GAS LEAK", icon: "flame-kindling", category: "事故", bg: "/bg/fire.png", cue: "闻到臭鸡蛋味 / 报警器响", riskDefault: 6, riskLabel: "低" },
  { id: "fire", name: "火灾", nameEn: "FIRE", icon: "flame", category: "事故", bg: "/bg/fire.png", cue: "", riskDefault: 16, riskLabel: "中" },
  { id: "earthquake", name: "地震", nameEn: "EARTHQUAKE", icon: "activity", category: "自然灾害", bg: "/bg/earthquake.png", cue: "", riskDefault: 3, riskLabel: "低" },
  { id: "flood", name: "洪水", nameEn: "FLOOD", icon: "waves", category: "自然灾害", bg: "/bg/flood.png", cue: "", riskDefault: 8, riskLabel: "低" },
  { id: "typhoon", name: "台风", nameEn: "TYPHOON", icon: "wind", category: "自然灾害", bg: "/bg/typhoon.png", cue: "", riskDefault: 12, riskLabel: "中" },
];

export function getDisaster(id: DisasterId): Disaster | undefined {
  return DISASTERS.find((d) => d.id === id);
}

// ── 称号系统（7 阶，0-100 综合成长值）──
export interface TitleTier {
  title: string;
  min: number;
  quip: string;
}

export const TITLES: TitleTier[] = [
  { title: "两手空空", min: 0, quip: "先从第一件物资开始。" },
  { title: "略懂一二", min: 10, quip: "有点入门的意思了。" },
  { title: "渐入佳境", min: 20, quip: "越来越顺手了。" },
  { title: "有模有样", min: 40, quip: "这下真有点东西了。" },
  { title: "未雨绸缪", min: 60, quip: "关键时刻少慌一点。" },
  { title: "稳中求胜", min: 80, quip: "稳了，基本不虚。" },
  { title: "苟住大师", min: 100, quip: "真出事，你能苟住。" },
];

export function titleFromGrowth(growth: number): TitleTier {
  let tier = TITLES[0];
  for (const t of TITLES) if (growth >= t.min) tier = t;
  return tier;
}

// ── 成长值公式：清单 70% + 答题 30%（砍一刀式对数递减）──
// 答题贡献采用对数曲线：前几题涨得快，越接近满分越难，约 300 题才逼近 30 分。
// 单独刷题最多拿 30 分（到不了「有模有样」40），清单才是主成长线。
export const QUIZ_MAX_CORRECT = 300;
const QUIZ_K = 40;
const QUIZ_DENOM = Math.log(1 + QUIZ_MAX_CORRECT / QUIZ_K);

// quizCorrect：累计答对题数
export function quizContribution(quizCorrect: number): number {
  const c = Math.max(0, quizCorrect);
  return 30 * (Math.log(1 + c / QUIZ_K) / QUIZ_DENOM);
}

export function computeGrowth(listCompletionPct: number, quizCorrect: number): number {
  const listPart = Math.max(0, Math.min(100, listCompletionPct)) * 0.7;
  const quizPart = Math.min(30, quizContribution(quizCorrect));
  return Math.round(listPart + quizPart);
}

// 每答对一题累计 +1 题
export const QUIZ_POINT_PER_CORRECT = 1;

// ── 备灾知识小游戏题库（结构支持持续扩充）──
// 备灾知识小游戏题库已迁移到 quiz-bank.ts（判断题 JUDGE_BANK）。

// ── 灾后恢复 ──
export interface RecoveryCheck {
  title: string;
  brief: string;
}

export const RECOVERY_CHECKS: RecoveryCheck[] = [
  { title: "确认环境与自身安全", brief: "观察四周有无坍塌、漏电、明火或有害气体，确认自身无受伤后再行动。" },
  { title: "必要检查", brief: "检查房屋结构、门窗，以及燃气、水、电是否正常；发现异味或异常先关阀断电、暂缓使用。" },
];

export const RECOVERY_REMIND =
  "本次灾害可能影响了部分备灾物资，请到背包检查并更新旧清单。";

// 灾后状态建议：帮助情绪恢复（温和、不制造焦虑）
export const RECOVERY_MOOD_TIPS: string[] = [
  "先喝口水、深呼吸，慢慢平复下来。",
  "报个平安、做件小事，会更踏实。",
];

// ── 兼容旧页面导出（逐步迁移移除）──
export interface LevelTier {
  level: number;
  title: string;
  minGrowth: number;
  icon: string;
}
export const LEVELS: LevelTier[] = TITLES.map((t, i) => ({
  level: i + 1,
  title: t.title,
  minGrowth: t.min,
  icon: ["🌱", "🧭", "📦", "🛠️", "🛡️", "🎖️", "👑"][i] ?? "🌱",
}));
export function levelFromGrowth(growth: number): LevelTier {
  let tier = LEVELS[0];
  for (const t of LEVELS) if (growth >= t.minGrowth) tier = t;
  return tier;
}
export function nextLevel(growth: number): LevelTier | null {
  return LEVELS.find((t) => t.minGrowth > growth) ?? null;
}
export const GROWTH_RULES = {
  completeAssessment: 20,
  completeRecommendedTask: 20,
  completeCustomTask: 10,
  completeSimulation: 15,
  completeRecovery: 15,
  correctQuiz: 15,
} as const;
export const COMFORT_TIPS: string[] = [
  "灾后情绪波动是正常反应，允许自己和家人感到不安。",
  "与家人保持沟通，分享感受，互相安慰。",
  "如情绪持续低落，建议联系社区心理援助热线。",
];
export const RECOVERY_TIPS: string[] = [
  "先检查房屋结构，确认无坍塌与开裂风险再进入。",
  "检查燃气、水管、电路，闻到燃气味立即关阀通风。",
  "及时补充已消耗物资，标记缺口回到备灾清单。",
];
