"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getQuiz, saveQuiz, resetQuiz, isQuizCustomized } from "@/lib/prep/custom-store";
import type { JudgeQuestion } from "@/lib/prep/quiz-bank";
import { DISASTERS } from "@/lib/prep/domain";
import type { DisasterId } from "@/lib/prep/domain";

const DISASTER_OPTS: { id: DisasterId | "general"; name: string }[] = [
  { id: "general", name: "通用" },
  ...DISASTERS.map((d) => ({ id: d.id, name: d.name })),
];

export function AdminQuiz() {
  const [qs, setQs] = useState<JudgeQuestion[]>([]);
  const [customized, setCustomized] = useState(false);

  useEffect(() => {
    setQs(getQuiz());
    setCustomized(isQuizCustomized());
  }, []);

  const commit = (next: JudgeQuestion[]) => {
    setQs(next);
    saveQuiz(next);
    setCustomized(true);
  };

  const update = (i: number, patch: Partial<JudgeQuestion>) =>
    commit(qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  const remove = (i: number) => commit(qs.filter((_, idx) => idx !== i));

  const add = () =>
    commit([
      ...qs,
      { id: `admin-${Date.now()}`, disaster: "general", statement: "新题目：一个容易踩的误区？", truth: false, quip: "", fact: "" },
    ]);

  const reset = () => {
    if (!confirm("恢复为内置默认题库？你的修改会丢失。")) return;
    resetQuiz();
    setQs(getQuiz());
    setCustomized(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="font-mono-label text-[11px] text-muted-foreground">
          共 {qs.length} 题{customized ? " · 已自定义" : " · 内置默认"}
        </div>
        <div className="flex gap-2">
          {customized && (
            <button onClick={reset} className="border border-ink/30 px-2 py-1 text-[12px] font-semibold text-ink active:bg-muted">
              恢复默认
            </button>
          )}
          <button onClick={add} className="flex items-center gap-1 border-2 border-primary bg-primary px-2 py-1 text-[12px] font-bold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新增题目
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {qs.map((q, i) => (
        <div key={q.id} className="flex flex-col gap-2 border border-ink/15 bg-card p-3" data-el="admin-quiz">
          <div className="flex items-start gap-2">
            <textarea
              value={q.statement}
              onChange={(e) => update(i, { statement: e.target.value })}
              rows={2}
              className="min-w-0 flex-1 resize-none border-b border-ink/30 bg-transparent pb-1 text-sm font-semibold text-ink outline-none focus:border-primary"
            />
            <button onClick={() => remove(i)} aria-label="删除" className="shrink-0 text-muted-foreground active:text-primary">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={q.disaster}
              onChange={(e) => update(i, { disaster: e.target.value as DisasterId | "general" })}
              className="border border-ink/25 bg-card px-2 py-1 text-[12px] text-ink outline-none"
            >
              {DISASTER_OPTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="flex overflow-hidden border border-ink/25">
              <button
                onClick={() => update(i, { truth: true })}
                className={`px-3 py-1 text-[12px] font-bold ${q.truth ? "bg-primary text-primary-foreground" : "bg-card text-ink"}`}
              >
                √ 正确
              </button>
              <button
                onClick={() => update(i, { truth: false })}
                className={`px-3 py-1 text-[12px] font-bold ${!q.truth ? "bg-primary text-primary-foreground" : "bg-card text-ink"}`}
              >
                × 错误
              </button>
            </div>
          </div>

          <input
            value={q.quip}
            placeholder="答错时的一句金句（可空）"
            onChange={(e) => update(i, { quip: e.target.value })}
            className="w-full border border-ink/20 bg-transparent p-2 text-[12px] text-ink outline-none focus:border-primary"
          />
          <textarea
            value={q.fact}
            placeholder="一句科普：讲清“为什么”"
            onChange={(e) => update(i, { fact: e.target.value })}
            rows={2}
            className="w-full resize-none border border-ink/20 bg-transparent p-2 text-[12px] text-ink outline-none focus:border-primary"
          />
        </div>
      ))}
      </div>
    </div>
  );
}
