"use client";

import { useEffect, useState } from "react";
import { Check, Siren } from "lucide-react";

// 独立预览：自主演示「勾选清单 → 进度与成长值上涨」核心交互。
// 隔离数据，无 auth、无 API、无 store。
const COVER_PREVIEW_DATA = {
  tasks: ["应急饮用水", "家用急救包", "防烟面罩", "手电筒", "老人药品包"],
  city: "上海",
};

export function CoverPreview() {
  const total = COVER_PREVIEW_DATA.tasks.length;
  const [done, setDone] = useState<boolean[]>(() => COVER_PREVIEW_DATA.tasks.map(() => false));
  const [growth, setGrowth] = useState(20);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i += 1;
      if (i <= total) {
        setDone((prev) => prev.map((v, idx) => (idx < i ? true : v)));
        setGrowth((g) => g + 20);
      } else {
        // 循环重置
        i = 0;
        setDone(COVER_PREVIEW_DATA.tasks.map(() => false));
        setGrowth(20);
      }
    };
    const id = setInterval(tick, 900);
    return () => clearInterval(id);
  }, [total]);

  const completed = done.filter(Boolean).length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="mx-auto flex h-full min-h-[100dvh] w-full max-w-[520px] flex-col bg-[oklch(0.962_0.002_90)] text-[oklch(0.18_0_0)]">
      {/* 头 */}
      <div className="border-b-2 border-[oklch(0.18_0_0)] px-4 pb-3 pt-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[oklch(0.62_0.2_38)]">
          SYS-01 · EMERGENCY INTELLIGENCE
        </div>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold uppercase leading-none">READY</div>
            <div className="text-lg font-bold tracking-widest">先备</div>
          </div>
          <div className="text-right font-mono text-[10px] text-[oklch(0.44_0_0)]">{COVER_PREVIEW_DATA.city}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* 紧急按钮 */}
        <div className="flex items-center justify-between bg-[oklch(0.62_0.2_38)] px-4 py-3 text-white">
          <span className="flex items-center gap-2 font-bold uppercase">
            <Siren className="h-5 w-5" /> 紧急 · 行动指南
          </span>
        </div>

        {/* 状态卡：进度 + 成长值 */}
        <div className="border border-[oklch(0.18_0_0)] bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">备灾完成度</span>
            <span className="font-mono text-[oklch(0.62_0.2_38)]">{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full border border-[oklch(0.18_0_0)] bg-[oklch(0.935_0.002_90)]">
            <div
              className="h-full bg-[oklch(0.62_0.2_38)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1.5 font-mono text-[10px] text-[oklch(0.44_0_0)]">
            成长值 {growth} · 已完成 {completed}/{total}
          </div>
        </div>

        {/* 清单勾选动画 */}
        <div className="divide-y divide-[oklch(0.86_0_0)] border border-[oklch(0.18_0_0)] bg-white">
          {COVER_PREVIEW_DATA.tasks.map((t, i) => (
            <div key={t} className="flex items-center gap-3 p-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center border border-[oklch(0.18_0_0)] transition-colors ${
                  done[i] ? "bg-[oklch(0.62_0.2_38)] text-white" : "bg-white"
                }`}
              >
                {done[i] && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span className={`text-sm font-semibold ${done[i] ? "text-[oklch(0.44_0_0)] line-through" : ""}`}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-auto h-1.5 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, oklch(0.62 0.2 38) 0 10px, oklch(0.18 0 0) 10px 20px)",
        }}
      />
    </div>
  );
}
