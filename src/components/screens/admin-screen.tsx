"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/ui";
import { AdminItems } from "@/components/screens/admin-items";
import { AdminQuiz } from "@/components/screens/admin-quiz";

type Tab = "items" | "quiz";

export function AdminScreen() {
  const [tab, setTab] = useState<Tab>("items");

  return (
    <AppShell withTab={false}>
      {/* 桌面友好的宽屏后台：大屏居中、编辑区更宽 */}
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-8">
        {/* 顶栏 */}
        <div className="flex items-end justify-between border-b-2 border-ink pb-3">
          <div>
            <div className="font-mono-label text-[11px] tracking-[0.2em] text-muted-foreground">ADMIN CONSOLE</div>
            <h1 className="mt-1 font-heading text-3xl font-bold leading-none text-ink">开发者后台</h1>
          </div>
          <Link href="/" className="font-mono-label text-[12px] text-primary hover:underline">← 返回应用</Link>
        </div>

        <div className="mt-3 border-l-2 border-primary bg-muted/60 px-3 py-2 text-[12px] text-muted-foreground">
          建议用电脑浏览器打开本页编辑。修改保存在本机浏览器，刷新不丢；不跨设备同步，仅用于调试内容。
        </div>

        {/* Tab 切换 */}
        <div className="mt-4 grid max-w-[420px] grid-cols-2 border border-ink/20">
          <button
            onClick={() => setTab("items")}
            className={`py-2.5 text-sm font-bold ${tab === "items" ? "bg-primary text-primary-foreground" : "bg-card text-ink"}`}
          >
            物资清单
          </button>
          <button
            onClick={() => setTab("quiz")}
            className={`py-2.5 text-sm font-bold ${tab === "quiz" ? "bg-primary text-primary-foreground" : "bg-card text-ink"}`}
          >
            小游戏题库
          </button>
        </div>

        <div className="mt-4">
          {tab === "items" ? <AdminItems /> : <AdminQuiz />}
        </div>
      </div>
    </AppShell>
  );
}
