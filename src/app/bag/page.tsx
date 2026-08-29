"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Check, AlertTriangle, Trash2, MapPin, ChevronRight, Pencil, PartyPopper, Backpack, ShieldCheck } from "lucide-react";
import { AppShell, AtmosphereBg, Content } from "@/components/shell/ui";
import { MenuButton } from "@/components/shell/side-drawer";
import { TabBar } from "@/components/shell/tab-bar";
import { usePrep } from "@/stores/prep-store";
import { LIST_GROUPS, type ListGroup, profileSummary } from "@/lib/prep/rules";
import { getDisaster } from "@/lib/prep/domain";
import { computeWeightStatus, PER_PERSON_KG } from "@/lib/prep/weight";
import { getSubItems, scaledBaseline, subItemsProgress, prepStatus } from "@/lib/prep/subitems";

// 清单全部备齐后随机出现的夸赞语
const PRAISES = [
  "你简直就是中国贝爷！",
  "备灾满级，灾神见了都绕道！",
  "这波准备，堪称家庭防灾天花板！",
  "全齐了！你就是小区里最靠谱的那个人！",
  "教科书级别的备灾，给你点一万个赞！",
  "荒野求生导师本师，稳得一批！",
];

export default function BagPage() {
  const {
    hasProfile, profile, tasks, progress,
    completedCount, totalCount, toggleTask, addCustomTask, removeTask, title,
    subQty, setSubQty,
  } = usePrep();
  const [addingGroup, setAddingGroup] = useState<ListGroup | null>(null);
  const [draft, setDraft] = useState("");
  const [activeGroup, setActiveGroup] = useState<ListGroup>("bob");
  const [swiped, setSwiped] = useState<string | null>(null);
  const dragStartX = useRef<number | null>(null);

  const summary = profileSummary(profile);

  const submit = (g: ListGroup) => {
    if (draft.trim()) addCustomTask(draft.trim(), g);
    setDraft("");
    setAddingGroup(null);
  };

  const remaining = totalCount - completedCount;
  const allDone = totalCount > 0 && remaining === 0;
  // 备灾阶段分级：通用必备(general)未打勾数=必备缺口；打勾但未 100% 或非必备未备=可更完善空间
  const essentialTasks = tasks.filter((t) => t.disaster === "general");
  const essentialGap = essentialTasks.filter((t) => !t.done).length;
  const essentialDone = essentialTasks.length > 0 && essentialGap === 0;

  // 全部备齐时随机挑一句夸赞；每次从「未齐」变「全齐」都重新随机
  const [praise, setPraise] = useState(PRAISES[0]);
  useEffect(() => {
    if (allDone) setPraise(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
  }, [allDone]);

  return (
    <AppShell>
      <Content className="flex flex-col gap-4 p-4" style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))" }}>
        {/* 顶部头卡：与首页同一视觉（菜单 + 先备 + 当前称号 + 大字进度 + 一句话总结/定位），仅指标为「背包进度」 */}
        <div className="relative overflow-hidden bg-card" data-el="bag-progress">
          <AtmosphereBg src="/hazard/backpack-run.png" opacity={0.16} className="!bg-top" />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-4 -right-3 z-0 select-none font-heading text-[110px] font-bold leading-none text-ink/[0.05]"
          >
            背包
          </span>

          {/* 顶部：菜单 + 先备 + 当前称号 */}
          <div className="relative z-10 flex items-end justify-between gap-2 border-b border-ink/15 px-4 pb-3 pt-3">
            <div className="flex items-end gap-2.5">
              <div className="mb-0.5"><MenuButton /></div>
              <div>
                <div className="font-mono-label text-[11px] tracking-[0.2em] text-muted-foreground">BAG</div>
                <h1 className="mt-0.5 font-heading text-4xl font-bold leading-none tracking-wide text-ink">背包</h1>
              </div>
            </div>
            <div className="pb-0.5 text-right">
              <span className="mb-1 ml-auto block h-0.5 w-6 bg-primary" aria-hidden />
              <div className="font-heading text-xl font-bold leading-none text-primary">{title.title}</div>
            </div>
          </div>

          {/* 中部：背包进度（仅清单进度）+ 一句话总结 + 定位 */}
          <div className="relative z-10 px-4 pb-4 pt-3">
            <span className="font-mono-label text-[11px] text-muted-foreground">背包进度 · BAG PROGRESS</span>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div className="flex items-baseline">
                <span className="font-heading text-7xl font-bold leading-none text-primary">{progress}</span>
                <span className="ml-1 font-heading text-3xl font-bold text-primary">%</span>
              </div>
              <div className="max-w-[56%] pb-1 text-right">
                {hasProfile ? (
                  <Link href="/assess" className="inline-flex flex-col items-end active:opacity-70" data-el="bag-summary-entry">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold leading-snug text-ink">
                      {summary}
                      <Pencil className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </span>
                  </Link>
                ) : (
                  <Link href="/assess" className="inline-flex flex-col items-end active:opacity-70" data-el="bag-summary-entry">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold leading-snug text-ink">
                      {summary}
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                    </span>
                    <span className="mt-0.5 font-mono-label text-[10px] text-primary">点这里去评估</span>
                  </Link>
                )}
                <div className="mt-1 flex items-center justify-end gap-1 text-[12px] font-semibold text-ink">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {profile?.city || "?"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 未评估引导入口（已评估时不再显示「你的情况」栏，改从头部一句话标签点进调整） */}
        {!hasProfile && (
          <Link href="/assess" className="block" data-el="bag-profile-entry">
            <div className="flex items-center gap-3 border-l-4 border-primary bg-primary/5 px-4 py-3 active:bg-primary/10">
              <div className="flex-1">
                <div className="text-sm font-bold text-ink">让清单更懂你</div>
                <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  下面是每家都该常备的清单；挑几个和你有关的标签，就能帮你增删更贴合的物资。
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
            </div>
          </Link>
        )}

        {/* 左右 Tab：应急背包 / 家中常备 */}
        <div className="grid grid-cols-2 border border-ink/20" data-el="bag-group-tabs">
          {LIST_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => { setActiveGroup(g.id); setAddingGroup(null); }}
              className={`py-2.5 text-sm font-bold transition-colors ${
                activeGroup === g.id ? "bg-primary text-primary-foreground" : "bg-card text-ink"
              }`}
              data-el={`bag-tab-${g.id}`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* 应急背包重量预算：只在 bob Tab 显示，全家总重对比 人数×单人上限 */}
        {activeGroup === "bob" && (() => {
          const members = profile?.members ?? 1;
          const w = computeWeightStatus(tasks, members, subQty);
          const barPct = Math.min(100, w.pct);
          return (
            <div
              className={`mb-3 border p-3 ${w.isOver ? "border-red-500/50 bg-red-50" : "border-ink/20 bg-card"}`}
              data-el="bag-weight-budget"
            >
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <Backpack className="h-4 w-4" />
                  已装重量
                </div>
                <div className="font-heading text-sm font-bold">
                  <span className={w.isOver ? "text-red-600" : "text-ink"}>{w.total}</span>
                  <span className="text-muted-foreground"> / {w.budget} kg</span>
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden bg-ink/10">
                <div
                  className={`h-full transition-all ${w.isOver ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                上限＝家庭人数 {members} × 单人建议 {PER_PERSON_KG}kg（约体重的 15%，撤离仍能持续行走）
              </p>

              {w.isOver && (
                <div className="mt-2.5 border-t border-red-500/20 pt-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    超重约 {w.overBy}kg，建议从背包里拿出这些（水、食物为保命项已保留）
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {w.suggestions.map((s) => {
                      const subs = getSubItems(s.id);
                      const onTrim = () => {
                        if (subs) {
                          // 有二级清单：降到生存基线量（必需子物品保留更多），而非整包拿出
                          subs.forEach((it) => setSubQty(s.id, it.key, scaledBaseline(it, members)));
                        } else {
                          toggleTask(s.id); // 普通物资：从背包拿出（取消勾选）
                        }
                      };
                      return (
                        <button
                          key={s.id}
                          onClick={onTrim}
                          className="flex items-center gap-1 border border-red-500/40 bg-card px-2 py-1 text-[11px] font-semibold text-ink active:bg-red-100"
                        >
                          {s.name}
                          <span className="text-muted-foreground">{Math.round(s.curWeight * 10) / 10}kg</span>
                          <span className="text-red-500">{subs ? "减到最低" : "拿出"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {LIST_GROUPS.filter((g) => g.id === activeGroup).map((g) => {
          // 排序权重：保命项(水/食物)永远最前 → 个性化/自定义 → 灾害针对性物资 → 通用其余排最后
          // 背包保命项 water/food；家中常备保命项 waterstore/homefood，两个 Tab 同一套权重
          const rank = (t: typeof tasks[number]) => {
            if (t.id === "water" || t.id === "waterstore") return 0;
            if (t.id === "food" || t.id === "homefood") return 1;
            if (t.personalized || t.custom) return 2;
            if (t.disaster !== "general") return 3; // 地震/台风/洪水/火灾等针对性物资，优先于纯通用项
            return 4;
          };
          const list = tasks
            .filter((t) => t.group === g.id)
            .slice()
            .sort((a, b) => rank(a) - rank(b));
          return (
            <div key={g.id} data-el={`bag-group-${g.id}`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono-label text-[10px] text-muted-foreground">{g.desc}</div>
                <button
                  onClick={() => setAddingGroup(addingGroup === g.id ? null : g.id)}
                  className="flex items-center gap-1 border border-ink/25 px-2 py-0.5 text-[11px] font-semibold text-ink active:bg-muted"
                  data-el={`bag-add-${g.id}`}
                >
                  <Plus className="h-3 w-3" /> 添加
                </button>
              </div>
              {addingGroup === g.id && (
                <div className="mb-2 flex gap-2">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit(g.id)}
                    placeholder="输入自定义物资 / 任务"
                    className="flex-1 border-b-2 border-ink/40 bg-transparent px-1 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button onClick={() => submit(g.id)} className="bg-primary px-3 font-bold text-primary-foreground">确认</button>
                </div>
              )}

              <div className="flex flex-col divide-y divide-border border border-ink/15 bg-card">
                {list.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">暂无项目，可点「添加」自定义</div>
                ) : (
                  list.map((t) => {
                    const dz = t.disaster !== "general" ? getDisaster(t.disaster) : null;
                    const subKey = t.gearId ?? t.id;
                    const hasSub = !!getSubItems(subKey);
                    const subPct = hasSub ? subItemsProgress(subKey, subQty[subKey], profile?.members ?? 1) : 0;
                    const qtyText = hasSub
                      ? `${subPct}%`
                      : t.target
                        ? `${t.done ? t.target : 0}/${t.target}${t.unit ?? ""}`
                        : null;
                    const isSwiped = swiped === t.id;
                    return (
                      <div key={t.id} className="relative overflow-hidden" data-el="bag-task-item">
                        {/* 底层：向左滑出的删除按钮 */}
                        <button
                          onClick={() => { removeTask(t.id); setSwiped(null); }}
                          className="absolute inset-y-0 right-0 flex w-20 items-center justify-center gap-1 bg-primary text-primary-foreground"
                          aria-label="删除该项"
                          data-el="bag-task-delete"
                        >
                          <Trash2 className="h-4 w-4" /> 删除
                        </button>

                        {/* 上层：内容，左滑露出删除；同时兼容鼠标拖拽与触摸 */}
                        <div
                          className="relative z-10 flex items-center gap-3 bg-card p-3 transition-transform duration-200"
                          style={{ transform: isSwiped ? "translateX(-5rem)" : "translateX(0)", touchAction: "pan-y" }}
                          onPointerDown={(e) => { dragStartX.current = e.clientX; }}
                          onPointerUp={(e) => {
                            if (dragStartX.current === null) return;
                            const dx = e.clientX - dragStartX.current;
                            dragStartX.current = null;
                            if (dx < -35) setSwiped(t.id);
                            else if (dx > 35) setSwiped(null);
                          }}
                        >
                          {/* 左：警示橙勾选框 */}
                          <button
                            onClick={() => toggleTask(t.id)}
                            className={`grid h-6 w-6 shrink-0 place-items-center border-2 ${t.done ? "border-primary bg-primary text-card" : "border-primary bg-card text-transparent"} active:scale-95`}
                            aria-label={t.done ? "取消勾选" : "勾选已备"}
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </button>

                          {/* 中：物资名 + 标签（点名跳详情） */}
                          <Link href={`/item/${t.gearId ?? t.id}`} className="min-w-0 flex-1">
                            <div className={`text-sm font-semibold ${t.done ? "text-muted-foreground line-through" : "text-ink"}`}>
                              {t.name}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              {t.custom ? (
                                <span className="bg-primary px-1 py-px font-mono-label text-[9px] font-bold text-primary-foreground">自选</span>
                              ) : t.personalized ? (
                                <span className="bg-primary px-1 py-px font-mono-label text-[9px] font-bold text-primary-foreground">为你加的</span>
                              ) : null}
                              {dz && <span className="font-mono-label text-[9px] text-primary">{dz.name}</span>}
                            </div>
                          </Link>

                          {/* 右：数量 + 状态；已滑出时给个删除图标提示 */}
                          {isSwiped ? (
                            <button onClick={() => setSwiped(null)} className="shrink-0 font-mono-label text-[11px] text-muted-foreground">收起</button>
                          ) : (
                            <div className="shrink-0 text-right">
                              {qtyText && (
                                <div className={`text-[13px] font-bold ${t.done ? "text-ink" : "text-muted-foreground"}`}>{qtyText}</div>
                              )}
                              <div className={`font-mono-label text-[11px] ${prepStatus(t.done, hasSub ? subPct : (t.done ? 100 : 0)).cls}`}>
                                {prepStatus(t.done, hasSub ? subPct : (t.done ? 100 : 0)).label}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* 底部条：未齐→建议补充；全齐→随机夸赞 */}
        {allDone ? (
          <div className="flex items-center gap-3 bg-emerald-600 px-4 py-3 text-white" data-el="bag-praise">
            <PartyPopper className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <div className="font-heading text-sm font-bold">{praise}</div>
              <div className="font-mono-label text-[10px] opacity-80">ALL SET · FULLY PREPARED</div>
            </div>
          </div>
        ) : essentialDone ? (
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground" data-el="bag-essential-done">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <div className="font-heading text-sm font-bold">必备已妥，还能更完善（{remaining} 项可补充）</div>
              <div className="font-mono-label text-[10px] opacity-80">ESSENTIALS READY · {remaining} MORE TO GO</div>
            </div>
          </div>
        ) : essentialGap > 0 ? (
          <div className="flex items-center gap-3 bg-red-600 px-4 py-3 text-white" data-el="bag-essential-gap">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <div className="font-heading text-sm font-bold">还缺 {essentialGap} 项必备物资，先补齐</div>
              <div className="font-mono-label text-[10px] opacity-80">MISSING {essentialGap} ESSENTIALS FIRST</div>
            </div>
          </div>
        ) : remaining > 0 ? (
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground" data-el="bag-remaining">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <div className="font-heading text-sm font-bold">建议补充 {remaining} 项物资</div>
              <div className="font-mono-label text-[10px] opacity-80">RECOMMEND TO COMPLETE {remaining} ITEMS</div>
            </div>
          </div>
        ) : null}
      </Content>

      <TabBar />
    </AppShell>
  );
}
