"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { DISASTERS, type DisasterId } from "@/lib/prep/domain";
import { type JudgeQuestion } from "@/lib/prep/quiz-bank";
import { useAdminQuiz } from "@/lib/prep/custom-store";
import { usePrep } from "@/stores/prep-store";
import { relevantDisasters } from "@/lib/prep/rules";

function disasterLabel(id: string): string {
  if (id === "general") return "通用备灾";
  return DISASTERS.find((d) => d.id === id)?.name ?? "通用备灾";
}

function pickQuestion(source: JudgeQuestion[], relevant: (DisasterId | "general")[], recent: string[] = []): JudgeQuestion {
  // 按 7:3 加权：70% 从「个性化相关灾害 + 通用常识」抽，30% 从其它冷门灾害抽。
  const relSet = new Set(relevant);
  const recentSet = new Set(recent);
  let bank = source.filter((q) => !recentSet.has(q.id));
  if (bank.length === 0) bank = source; // 全部都在最近列表时兜底
  const relPool = bank.filter((q) => relSet.has(q.disaster));
  const rarePool = bank.filter((q) => !relSet.has(q.disaster));
  const useRelevant = rarePool.length === 0 || Math.random() < 0.7;
  const pool = useRelevant ? (relPool.length ? relPool : bank) : rarePool;
  return pool[Math.floor(Math.random() * pool.length)] ?? source[0];
}

/** 首页内联小游戏：一句挖坑的说法 + √/×，答对直接下一题；答错先毒舌一句再极简科普。 */
export function MicroQuiz() {
  const { recordCorrectQuiz, profile } = usePrep();
  const bank = useAdminQuiz();
  const [q, setQ] = useState<JudgeQuestion | null>(null);
  const [picked, setPicked] = useState<null | boolean>(null);

  const relevant = relevantDisasters(profile ?? null);
  const recentRef = useRef<string[]>([]);
  const MAX_RECENT = 8;

  function trackAndPick(): JudgeQuestion {
    const picked = pickQuestion(bank, relevant, recentRef.current);
    recentRef.current = [...recentRef.current, picked.id].slice(-MAX_RECENT);
    return picked;
  }

  useEffect(() => {
    recentRef.current = [];
    const first = pickQuestion(bank, relevantDisasters(profile ?? null), []);
    recentRef.current = [first.id];
    setQ(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, bank]);

  if (!q) {
    return (
      <div className="border border-ink/15 bg-card px-3 py-2.5" data-el="home-microquiz">
        <span className="font-mono-label text-[10px] text-muted-foreground">QUIZ · 加载中…</span>
      </div>
    );
  }
  const cur = q;
  const correct = picked !== null && picked === cur.truth;

  function answer(choice: boolean) {
    if (picked !== null) return;
    setPicked(choice);
    if (choice === cur.truth) recordCorrectQuiz();
  }
  function next() {
    setQ(trackAndPick());
    setPicked(null);
  }

  return (
    <div className="border border-ink/15 bg-card" data-el="home-microquiz">
      {/* 第一行：灾害类型标签 + 挖坑说法 */}
      <div className="flex items-start gap-2 border-b border-ink/15 px-3 py-1.5">
        <span className="shrink-0 bg-primary px-1.5 py-0.5 font-mono-label text-[10px] font-bold text-primary-foreground">
          {disasterLabel(cur.disaster)}
        </span>
        <span className="text-[13px] font-semibold leading-tight text-ink">{cur.statement}</span>
      </div>

      {/* 第二行：未答=√/×；已答=反馈（答错才显示毒舌+科普） */}
      {picked === null ? (
        <div className="grid grid-cols-2 gap-px bg-ink/15">
          <button
            onClick={() => answer(true)}
            aria-label="对"
            className="flex items-center justify-center bg-card py-2 text-ink active:bg-muted"
          >
            <Check className="h-5 w-5 text-primary" strokeWidth={3} />
          </button>
          <button
            onClick={() => answer(false)}
            aria-label="错"
            className="flex items-center justify-center bg-card py-2 text-ink active:bg-muted"
          >
            <X className="h-5 w-5 text-primary" strokeWidth={3} />
          </button>
        </div>
      ) : (
        <button onClick={next} className="block w-full px-3 py-2 text-left active:bg-muted">
          {correct ? (
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="text-[12px] font-semibold text-ink">答对了</span>
              <span className="ml-auto shrink-0 font-mono-label text-[10px] text-muted-foreground">下一题 ›</span>
            </span>
          ) : (
            <span className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                {/* 毒舌金句：醒目 */}
                <span className="block text-[13px] font-bold leading-snug text-ink">{cur.quip}</span>
                {/* 极简科普：弱化 */}
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{cur.fact}</span>
              </span>
              <span className="mt-0.5 shrink-0 font-mono-label text-[10px] text-muted-foreground">下一题 ›</span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
