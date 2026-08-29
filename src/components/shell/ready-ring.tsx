"use client";

import { useEffect, useState } from "react";

// 备灾指数环形进度：SVG 描边动画，挂载后从 0 平滑增长到目标百分比。
// 视效与首页情报卡的警示橙/黑描边一致（用 currentColor + primary 描边）。
export function ReadyRing({
  value,
  size = 96,
  stroke = 8,
  children,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // 下一帧开始动画，触发 stroke-dashoffset 过渡
    const id = requestAnimationFrame(() => setShown(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - shown / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 轨道 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-ink/10"
        />
        {/* 进度 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-primary"
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
