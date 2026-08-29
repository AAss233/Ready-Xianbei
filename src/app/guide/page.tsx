"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { PhoneCall, ShieldCheck, RotateCcw, Check, UserRound } from "lucide-react";
import { AppShell, SysTopBar, SectionLabel, HazardBar, Panel } from "@/components/shell/ui";
import { usePrep } from "@/stores/prep-store";
import { DISASTERS, RECOVERY_CHECKS, RECOVERY_REMIND, RECOVERY_MOOD_TIPS, GROWTH_RULES, type DisasterId } from "@/lib/prep/domain";
import { getGuide } from "@/lib/prep/guide";

type Phase = "select" | "action" | "recovery";
type CallTarget = { n: string; label: string } | null;

const VALID_IDS = DISASTERS.map((d) => d.id) as string[];

export default function GuidePage() {
  return (
    <Suspense fallback={<AppShell withTab={false}><div className="p-4" /></AppShell>}>
      <GuideBody />
    </Suspense>
  );
}

function GuideBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addGrowth, flagRecheck } = usePrep();

  // 带 ?d=xxx（如 DEMO 预警）时，首帧就直接进灾中行动态，避免先闪一下「选择灾害」页。
  const paramD = searchParams.get("d");
  const initialDisaster = paramD && VALID_IDS.includes(paramD) ? (paramD as DisasterId) : null;

  const [phase, setPhase] = useState<Phase>(initialDisaster ? "action" : "select");
  const [disaster, setDisaster] = useState<DisasterId | null>(initialDisaster);
  const [checked, setChecked] = useState<boolean[]>(RECOVERY_CHECKS.map(() => false));
  const [rewarded, setRewarded] = useState(false);
  const [calling, setCalling] = useState<CallTarget>(null);

  const guide = disaster ? getGuide(disaster) : null;

  // 来源判定：带 ?d= 参数进入（如 DEMO 预警）→ 返回退回原页面；从「选择灾害」进入 → 返回回选择页
  const fromDemo = initialDisaster !== null;
  const goBackFromAction = () => {
    if (fromDemo) router.back();
    else setPhase("select");
  };

  const enterAction = (d: DisasterId) => {
    setDisaster(d);
    setPhase("action");
  };

  const confirmSafe = () => {
    if (!rewarded) {
      addGrowth(GROWTH_RULES.completeSimulation);
      setRewarded(true);
    }
    setPhase("recovery");
  };

  const allChecked = checked.every(Boolean);
  const finishRecovery = () => {
    addGrowth(GROWTH_RULES.completeRecovery);
    flagRecheck();
    router.push("/");
  };

  // ── 选择态：唯一的灾害选择页（含返回主页）──
  if (phase === "select") {
    return (
      <AppShell withTab={false}>
        <SysTopBar code="应急" title="选择灾害" back />
        <div className="flex flex-col gap-4 px-4 pb-6 pt-3" data-el="guide-select">
          {/* 灾害卡片：半色调照片满铺 + 名称叠印，统一幼线边框 */}
          <div className="grid grid-cols-2 gap-2.5" data-el="guide-disaster-select">
            {DISASTERS.map((d) => (
              <button
                key={d.id}
                onClick={() => enterAction(d.id)}
                className="relative aspect-[3/4] overflow-hidden border border-ink/20 bg-ink text-left active:opacity-90"
              >
                {/* 半色调工业照片满铺整框 */}
                <Image
                  src={`/hazard/${d.id}.png`}
                  alt={d.name}
                  fill
                  sizes="(max-width: 560px) 50vw, 280px"
                  className="object-cover"
                />
                {/* 底部压暗渐变，保证叠字可读 */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-3/5 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />

                {/* 底部：判定线索（上）+ 名称 + 英文编号 */}
                <span className="absolute inset-x-2.5 bottom-2 z-20 flex flex-col gap-0.5">
                  {d.cue && (
                    <span className="text-[11px] font-semibold leading-snug text-primary">{d.cue}</span>
                  )}
                  <span className="font-heading text-2xl font-bold leading-none text-white">{d.name}</span>
                  <span className="font-mono-label text-[9px] tracking-wide text-white/70">{d.nameEn}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // 灾害未就绪的兜底（理论上不会到达）
  if (!guide) {
    return <AppShell withTab={false}><div className="p-4" /></AppShell>;
  }

  // ── 灾中行动态（全中文、大字号、核心动作最优先）──
  if (phase === "action" && guide) {
    return (
      <AppShell withTab={false}>
        <SysTopBar code="应急" title="灾中行动" />
        <div className="flex flex-col gap-4 p-4">
          {/* 顶部最大警示语：黄金处置提示（如“切勿动火动电”） */}
          <div className="border-2 border-primary bg-primary px-4 py-4 text-primary-foreground" data-el="guide-action-header">
            <div className="font-mono-label text-[11px] opacity-80">{getGuideName(disaster)} · 立即处置</div>
            <div className="mt-1 font-heading text-3xl font-bold leading-tight">{guide.golden}</div>
          </div>

          {/* 行动步骤：中文动作词最大，编号缩小为角标 */}
          <div className="flex flex-col gap-3" data-el="guide-steps">
            {guide.steps.map((s) => (
              <div key={s.code} className="border border-ink/20 bg-card p-4">
                {/* 大标题：编号 + 几个字点明行动 */}
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-label text-sm text-muted-foreground">{s.code}</span>
                  <span className="font-heading text-4xl font-bold leading-none text-ink">{s.titleCn}</span>
                </div>
                {/* 小标题：一句话说清做什么 */}
                {s.sub && <p className="mt-2 text-lg font-bold leading-snug text-primary">{s.sub}</p>}
                {/* 细节：不明白再看 */}
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* 紧急求助：报警 + 医疗，大按钮（演示，不真实拨打） */}
          <div className="grid grid-cols-3 gap-2" data-el="guide-help">
            {[
              { n: "110", label: "报警" },
              { n: "119", label: "火警" },
              { n: "120", label: "急救" },
            ].map((c) => (
              <button
                key={c.n}
                onClick={() => setCalling(c)}
                className="flex flex-col items-center gap-1 border-2 border-ink bg-warning py-4 text-ink active:opacity-90"
              >
                <PhoneCall className="h-5 w-5" strokeWidth={2.4} />
                <span className="font-heading text-xl font-bold leading-none">{c.n}</span>
                <span className="font-mono-label text-[11px]">{c.label}</span>
              </button>
            ))}
          </div>

          {/* 紧急联系人：与上方三个报警按钮同款视效（演示，不真实拨打） */}
          <button
            onClick={() => setCalling({ n: "紧急联系人", label: "紧急联系人" })}
            className="flex items-center justify-center gap-2 border-2 border-ink bg-warning py-4 text-ink active:opacity-90"
            data-el="guide-emergency-contact"
          >
            <UserRound className="h-5 w-5" strokeWidth={2.4} />
            <span className="font-heading text-xl font-bold leading-none">紧急联系人</span>
          </button>

          <button
            onClick={confirmSafe}
            className="flex items-center justify-center gap-2 border-2 border-ink bg-secondary py-5 font-heading text-2xl font-bold text-secondary-foreground active:opacity-90"
            data-el="guide-confirm-safe"
          >
            <ShieldCheck className="h-6 w-6" /> 我已安全
          </button>
          <button onClick={goBackFromAction} className="text-center font-mono-label text-[12px] text-muted-foreground active:text-ink">
            {fromDemo ? "‹ 返回" : "‹ 返回选择灾害"}
          </button>
        </div>
        <HazardBar />

        {/* 虚拟拨号弹窗（演示） */}
        {calling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-8" onClick={() => setCalling(null)}>
            <div className="w-full max-w-[320px] border border-ink/20 bg-background p-5 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="font-mono-label text-[11px] text-primary">DEMO · 模拟拨号</div>
              <div className="mt-2 font-heading text-5xl font-bold text-ink">{calling.n}</div>
              <div className="mt-1 text-sm text-muted-foreground">正在连接{calling.label}…（演示，不会真实拨打）</div>
              <button onClick={() => setCalling(null)} className="mt-4 w-full border-2 border-primary bg-primary py-2.5 font-heading font-bold text-primary-foreground">
                知道了
              </button>
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  // ── 灾后恢复态：确认安全 → 恢复正常 → 提醒检查旧清单 ──
  return (
    <AppShell withTab={false}>
      <SysTopBar code="恢复" title="灾后恢复" back />
      <div className="flex flex-col gap-4 p-4">
        <Panel className="p-4" data-el="recovery-checklist">
          <SectionLabel en="RECOVERY CHECKLIST" cn="恢复检查清单" />
          <div className="mt-2 flex flex-col divide-y divide-border">
            {RECOVERY_CHECKS.map((c, i) => (
              <button
                key={c.title}
                onClick={() => setChecked((arr) => arr.map((v, idx) => (idx === i ? !v : v)))}
                className="flex items-start gap-3 py-3 text-left"
              >
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-primary ${checked[i] ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  {checked[i] && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className="flex flex-col">
                  <span className={`font-heading text-base font-bold ${checked[i] ? "text-muted-foreground line-through" : "text-ink"}`}>
                    {String(i + 1).padStart(2, "0")} {c.title}
                  </span>
                  <span className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{c.brief}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="p-4" data-el="recovery-tips">
          <SectionLabel en="STATUS TIPS" cn="状态建议" />
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink">
            {RECOVERY_MOOD_TIPS.map((t, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">·</span>{t}</li>
            ))}
          </ul>
          <p className="mt-3 border-t border-ink/15 pt-2 text-[12px] leading-snug text-muted-foreground">{RECOVERY_REMIND}</p>
        </Panel>

        <button
          onClick={finishRecovery}
          disabled={!allChecked}
          className="flex items-center justify-center gap-2 border-2 border-primary bg-primary py-4 font-heading text-lg font-bold text-primary-foreground disabled:opacity-40"
          data-el="recovery-finish"
        >
          <RotateCcw className="h-5 w-5" /> 恢复正常状态
        </button>
        {!allChecked && <p className="text-center font-mono-label text-[10px] text-muted-foreground">完成全部检查项后可返回</p>}
      </div>
      <HazardBar />
    </AppShell>
  );
}

function getGuideName(d: DisasterId | null): string {
  return DISASTERS.find((x) => x.id === d)?.name ?? "灾害";
}
