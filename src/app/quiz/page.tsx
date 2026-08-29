"use client";

import { useRef, useState } from "react";
import { Check, X, Flame, Share2 } from "lucide-react";
import { AppShell, SysTopBar, HazardBar, Panel } from "@/components/shell/ui";
import { usePrep } from "@/stores/prep-store";
import { GROWTH_RULES, DISASTERS } from "@/lib/prep/domain";
import { type JudgeQuestion } from "@/lib/prep/quiz-bank";
import { getQuiz, useAdminQuiz } from "@/lib/prep/custom-store";

function randomJudge(source: JudgeQuestion[], recent: string[] = []): JudgeQuestion {
  // 避开最近出过的题，避免相邻重复
  const recentSet = new Set(recent);
  let pool = source.filter((q) => !recentSet.has(q.id));
  if (pool.length === 0) pool = source;
  return pool[Math.floor(Math.random() * pool.length)] ?? source[0];
}
function disasterLabel(id: string): string {
  if (id === "general") return "通用备灾";
  return DISASTERS.find((d) => d.id === id)?.name ?? "通用备灾";
}

export default function QuizPage() {
  const { growth, quizStreak, title, recordCorrectQuiz } = usePrep();
  const bank = useAdminQuiz();
  const recentRef = useRef<string[]>([]);
  const [q, setQ] = useState<JudgeQuestion>(() => {
    const first = randomJudge(getQuiz());
    recentRef.current = [first.id];
    return first;
  });
  const [picked, setPicked] = useState<boolean | null>(null);
  const [scored, setScored] = useState(false);

  const answered = picked !== null;
  const correct = answered && picked === q.truth;

  const pick = (choice: boolean) => {
    if (answered) return;
    setPicked(choice);
    if (choice === q.truth && !scored) {
      recordCorrectQuiz();
      setScored(true);
    }
  };
  const nextQ = () => {
    const nq = randomJudge(bank, recentRef.current);
    recentRef.current = [...recentRef.current, nq.id].slice(-8);
    setQ(nq);
    setPicked(null);
    setScored(false);
  };

  return (
    <AppShell withTab={false}>
      <SysTopBar code="SYS-Q" title="备灾误区判断" back />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between border border-ink/15 bg-secondary px-4 py-2.5 text-secondary-foreground" data-el="quiz-stat">
          <span className="font-mono-label text-[11px]">成长值 <span className="text-primary">{growth}</span></span>
          <span className="font-mono-label text-[11px]">连对 <span className="text-primary">{quizStreak}</span></span>
        </div>

        {/* 题目：一句挖坑的说法，判断对/错 */}
        <Panel className="p-4" data-el="quiz-question">
          <span className="inline-block bg-primary px-1.5 py-0.5 font-mono-label text-[10px] font-bold text-primary-foreground">
            {disasterLabel(q.disaster)}
          </span>
          <h2 className="mt-2 text-lg font-bold leading-relaxed text-ink">{q.statement}</h2>

          {/* √ / × 两个大按钮 */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[true, false].map((choice) => {
              const isPicked = picked === choice;
              const isTruth = q.truth === choice;
              let cls = "border border-ink/25 bg-card text-ink";
              if (answered) {
                if (isTruth) cls = "border-2 border-steel bg-steel text-white";
                else if (isPicked) cls = "border-2 border-primary bg-primary text-primary-foreground";
                else cls = "border border-border bg-card text-muted-foreground";
              }
              return (
                <button
                  key={String(choice)}
                  onClick={() => pick(choice)}
                  disabled={answered}
                  className={`flex items-center justify-center py-5 ${cls}`}
                  data-el="quiz-option"
                >
                  {choice ? <Check className="h-7 w-7" strokeWidth={3} /> : <X className="h-7 w-7" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </Panel>

        {/* 答对：简短祝贺 + 连对火焰；答错：毒舌金句 + 极简科普 */}
        {answered && (
          <Panel className={`p-4 ${correct ? "border-steel" : ""}`} data-el="quiz-feedback">
            {correct ? (
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-lg font-bold text-primary">答对了！+{GROWTH_RULES.correctQuiz} 成长值</span>
                {quizStreak >= 2 && (
                  <span className="flex items-center gap-1 border border-ink/25 bg-warning px-2 py-0.5 font-heading text-sm font-bold text-ink animate-[pulse_0.6s_ease-in-out]" data-el="quiz-streak">
                    <Flame className="h-4 w-4" /> 连对 {quizStreak}
                  </span>
                )}
              </div>
            ) : (
              <>
                <p className="font-heading text-lg font-bold leading-snug text-ink">{q.quip}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{q.fact}</p>
              </>
            )}
          </Panel>
        )}

        <button
          onClick={nextQ}
          className="w-full border-2 border-primary bg-primary py-3 font-heading font-bold uppercase text-primary-foreground"
          data-el="quiz-next"
        >
          {answered ? "下一题 · NEXT" : "换一题 · SKIP"}
        </button>

        {/* 可截图分享的成绩卡：称号 + 成长值 + 连对 */}
        <div className="relative overflow-hidden border border-ink/20 bg-card p-4" data-el="quiz-scorecard">
          <span aria-hidden className="pointer-events-none absolute -bottom-5 -right-2 select-none font-heading text-[88px] font-bold leading-none text-ink/[0.05]">先备</span>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[10px] tracking-[0.2em] text-muted-foreground">MY READY CARD</span>
              <span className="flex items-center gap-1 font-mono-label text-[10px] text-muted-foreground"><Share2 className="h-3 w-3" /> 截图分享</span>
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-heading text-2xl font-bold text-ink">{title.title}</span>
              <span className="mb-0.5 text-[12px] text-muted-foreground">{title.quip}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="border border-ink/15 bg-secondary px-3 py-2">
                <div className="font-mono-label text-[10px] text-muted-foreground">备灾指数</div>
                <div className="font-heading text-2xl font-bold leading-none text-primary">{growth}<span className="text-base">%</span></div>
              </div>
              <div className="border border-ink/15 bg-secondary px-3 py-2">
                <div className="font-mono-label text-[10px] text-muted-foreground">当前连对</div>
                <div className="flex items-baseline gap-1 font-heading text-2xl font-bold leading-none text-primary">{quizStreak}<span className="text-[11px] font-semibold text-muted-foreground">题</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HazardBar />
    </AppShell>
  );
}
