"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, MapPin, Pencil } from "lucide-react";
import { AppShell, AtmosphereBg, Content, SectionLabel, Panel } from "@/components/shell/ui";
import { TabBar } from "@/components/shell/tab-bar";
import { EmergencyEntry } from "@/components/shell/emergency-entry";
import { MenuButton } from "@/components/shell/side-drawer";
import { MicroQuiz } from "@/components/shell/micro-quiz";
import { usePrep } from "@/stores/prep-store";
import { profileSummary } from "@/lib/prep/rules";
import { getSubItems, subItemsProgress, prepStatus } from "@/lib/prep/subitems";

// 模拟城市（区县级）+ 经纬度，未填画像时随机选一个演示（第一版不接真实定位）
const DEMO_CITIES = [
  { city: "四川 · 成都 · 武侯区", coord: "30.6413°N 104.0430°E" },
  { city: "浙江 · 杭州 · 西湖区", coord: "30.2595°N 120.1300°E" },
  { city: "广东 · 广州 · 天河区", coord: "23.1240°N 113.3610°E" },
  { city: "湖北 · 武汉 · 江汉区", coord: "30.6018°N 114.2700°E" },
  { city: "陕西 · 西安 · 雁塔区", coord: "34.2130°N 108.9480°E" },
];

export default function HomePage() {
  const router = useRouter();
  const { hasProfile, profile, tasks, growth, title, needRecheck, clearRecheck, toggleTask, subQty } = usePrep();
  const members = profile?.members ?? 1;

  const summary = profileSummary(profile);

  // 未填画像：客户端随机一个模拟城市；已填画像：用画像城市
  const [demo, setDemo] = useState(DEMO_CITIES[0]);
  useEffect(() => {
    setDemo(DEMO_CITIES[Math.floor(Math.random() * DEMO_CITIES.length)]);
  }, []);
  const cityText = profile?.city || "?";
  const coordText = profile?.city ? demo.coord : "";

  // 先备物资：有画像→真实清单（可勾选）；无画像→通用必备（仅展示，引导去评估）。
  // 先备物资：统一用真实 tasks（可勾选、可进详情），与背包页一致。
  // 有画像：优先展示个性化/待补充；无画像：展示默认通用必备前几项。
  // 顺序「快照」：仅进入本页时排序一次，停留期间顺序固定，勾选只改 done、不重排/不消失；
  // 离开再回来（页面重挂载）才刷新排序。tasks 异步到达时用 effect 补算一次首帧快照。
  const rankIds = (ts: typeof tasks) =>
    ts
      .slice()
      .sort((a, b) => {
        const ad = a.done ? 1 : 0;
        const bd = b.done ? 1 : 0;
        if (ad !== bd) return ad - bd;
        return (a.personalized || a.custom ? 0 : 1) - (b.personalized || b.custom ? 0 : 1);
      })
      .slice(0, 3)
      .map((t) => t.id);
  const [snapshotIds, setSnapshotIds] = useState<string[]>(() => rankIds(tasks));
  const snapReady = useRef(snapshotIds.length > 0);
  useEffect(() => {
    // 首帧 tasks 为空时补算一次快照；之后不再随勾选变化。
    if (!snapReady.current && tasks.length > 0) {
      snapReady.current = true;
      setSnapshotIds(rankIds(tasks));
    }
  }, [tasks]);
  // 用固定顺序取回实时 task（保留最新 done 状态）；已删除的项过滤掉。
  const list = snapshotIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is (typeof tasks)[number] => Boolean(t));

  return (
    <AppShell>
      <Content className="flex flex-col gap-4 p-4" style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))" }}>
        {/* ① 情报头卡：菜单 + READY/先备 LOGO + 当前称号 + 备灾指数 + 画像/定位 融合为一块 */}
        <Link href="/bag" className="block" data-el="home-index">
          <div className="relative overflow-hidden bg-card">
            <AtmosphereBg src="/bg/tower.png" opacity={0.1} />
            {/* 背景手稿水印 */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-4 -right-3 z-0 select-none font-heading text-[110px] font-bold leading-none text-ink/[0.05]"
            >
              先备
            </span>

            {/* 顶部：菜单 + 先备（中文主角大字）+ READY 小字系统标签 + 当前称号（直接文字） */}
            <div className="relative z-10 flex items-end justify-between gap-2 border-b border-ink/15 px-4 pb-3 pt-3">
              <div className="flex items-end gap-2.5">
                {/* 菜单：拉出侧边栏，阻止冒泡到卡片跳转 */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="mb-0.5"
                >
                  <MenuButton />
                </div>
                <div>
                  <div className="font-mono-label text-[11px] tracking-[0.2em] text-muted-foreground">READY</div>
                  <h1 className="mt-0.5 font-heading text-4xl font-bold leading-none tracking-wide text-ink">先备</h1>
                </div>
              </div>
              <div className="pb-0.5 text-right">
                <span className="mb-1 ml-auto block h-0.5 w-6 bg-primary" aria-hidden />
                <div className="font-heading text-xl font-bold leading-none text-primary">{title.title}</div>
              </div>
            </div>

            {/* 中部：备灾指数 + 画像 + 定位（标签与定位同处数字右侧） */}
            <div className="relative z-10 px-4 pb-4 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-label text-[11px] text-muted-foreground">备灾指数 · READY INDEX</span>
              </div>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div className="flex items-baseline">
                  <span className="font-heading text-7xl font-bold leading-none text-primary">{growth}</span>
                  <span className="ml-1 font-heading text-3xl font-bold text-primary">%</span>
                </div>
                {/* 家庭标签 + 定位：都放数字右侧，标签上、定位下一行 */}
                <div className="max-w-[56%] pb-1 text-right">
                  {hasProfile ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push("/assess");
                      }}
                      className="inline-flex items-center gap-1 text-sm font-semibold leading-snug text-ink active:opacity-70"
                      data-el="home-summary-entry"
                    >
                      {summary}
                      <Pencil className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </button>
                  ) : (
                    <div className="text-sm font-semibold leading-snug text-ink">{summary}</div>
                  )}
                  <div className="mt-1 flex items-center justify-end gap-1 text-[12px] font-semibold text-ink">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {cityText}
                  </div>
                  {coordText && <div className="mt-0.5 font-mono-label text-[10px] text-muted-foreground">{coordText}</div>}
                </div>
              </div>

            </div>
          </div>
        </Link>

        {/* 灾后回首页提示：挪到小游戏上方 */}
        {needRecheck && (
          <div className="border-l-4 border-primary bg-primary/5" data-el="home-recheck">
            <p className="px-3 pt-2.5 text-sm font-semibold leading-snug text-ink">
              灾害可能消耗了部分物资，需要检查补充吗？
            </p>
            <div className="mt-2 flex divide-x divide-primary/30 border-t border-primary/20">
              <button
                onClick={clearRecheck}
                className="flex-1 py-2 font-heading text-sm font-bold text-ink active:bg-muted"
              >
                未消耗物资
              </button>
              <Link
                href="/bag"
                onClick={clearRecheck}
                className="flex flex-1 items-center justify-center bg-primary py-2 font-heading text-sm font-bold text-primary-foreground active:opacity-90"
              >
                去背包整理
              </Link>
            </div>
          </div>
        )}

        {/* ③ 轻量小游戏（内联，一两行） */}
        <MicroQuiz />

        {/* ④ 紧急入口：单按钮 → 弹出 6 灾害选择 */}
        <EmergencyEntry />

        {/* ⑤ 先备物资：与背包页一致（可勾选、可进详情、状态分级） */}
        <Panel className="p-4" data-el="home-prepare-list">
          <SectionLabel
            en="PREPARE LIST"
            cn="先备物资"
            right={
              hasProfile ? (
                <Link href="/bag" className="font-mono-label text-[11px] text-primary">全部 ›</Link>
              ) : (
                <Link href="/assess" className="font-mono-label text-[11px] text-primary">完善画像 ›</Link>
              )
            }
          />
          <div className="mt-2 flex flex-col divide-y divide-border">
            {list.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">重要物资已全部备齐 ✓</div>
            ) : (
              list.map((t) => {
                const subKey = t.gearId ?? t.id;
                const hasSub = !!getSubItems(subKey);
                const pct = hasSub ? subItemsProgress(subKey, subQty[subKey], members) : (t.done ? 100 : 0);
                const st = prepStatus(t.done, pct);
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2.5" data-el="home-prepare-item">
                    {/* 左：警示橙勾框，可点勾选 */}
                    <button
                      type="button"
                      aria-label={t.done ? "取消勾选" : "勾选已备"}
                      onClick={() => toggleTask(t.id)}
                      className={`grid h-5 w-5 shrink-0 place-items-center border-2 active:scale-95 ${t.done ? "border-primary bg-primary text-card" : "border-primary bg-card text-transparent"}`}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={4} />
                    </button>
                    {/* 中：物资名（点跳详情）+ 说明 */}
                    <Link href={`/item/${subKey}`} className="min-w-0 flex-1">
                      <span className={`block text-sm font-semibold ${t.done ? "text-muted-foreground line-through" : "text-ink"}`}>{t.name}</span>
                      {t.detail && (
                        <span className="mt-0.5 block truncate text-[11px] leading-snug text-muted-foreground">{t.detail}</span>
                      )}
                    </Link>
                    {/* 右：状态分级 + 百分比 */}
                    <div className="shrink-0 text-right">
                      {hasSub && <div className={`text-[13px] font-bold ${t.done ? "text-ink" : "text-muted-foreground"}`}>{pct}%</div>}
                      <div className={`font-mono-label text-[11px] ${st.cls}`}>{st.label}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </Content>

      <TabBar />
    </AppShell>
  );
}
