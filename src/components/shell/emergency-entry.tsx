"use client";

import Link from "next/link";
import { Siren } from "lucide-react";

/**
 * 紧急入口：首页放一个高权重按钮，点击进入应急指南的灾害选择页（唯一的选择入口）。
 */
export function EmergencyEntry() {
  return (
    <div data-el="home-emergency">
      <Link
        href="/guide"
        className="hazard-edge block w-full overflow-hidden border-2 border-ink p-0.5"
        aria-label="紧急入口"
      >
        <span className="flex w-full flex-col items-center justify-center gap-1.5 bg-primary px-4 py-6 text-primary-foreground">
          <Siren className="h-8 w-8" strokeWidth={2.4} />
          <span className="font-heading text-2xl font-bold uppercase tracking-wide">紧急入口 · EMERGENCY</span>
          <span className="font-mono-label text-[10px] text-primary-foreground/80">灾害发生时 · 立即进入应急指南</span>
        </span>
      </Link>
    </div>
  );
}
