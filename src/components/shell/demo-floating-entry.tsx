"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Radio, X, Waves } from "lucide-react";

/**
 * DEMO 悬浮入口（仅用于现场演示，不接真实预警 API）。
 * 点击 → 弹出「模拟城市洪水预警」提示（带 DEMO 标）→ 确认后直达洪水灾中应急第一步。
 * 低占比、线框 / 文字型、少量警示橙，不遮挡核心应急操作。
 */
export function DemoFloatingEntry() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 应急流程中（灾中/灾后，均在 /guide）隐藏悬浮球，不遮挡核心操作；回到正常页面再出现。
  if (pathname?.startsWith("/guide")) return null;

  const trigger = () => {
    setOpen(false);
    router.push("/guide?d=flood");
  };

  return (
    <>
      {/* 悬浮球：右下角，tabbar 之上 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-el="demo-floating"
        aria-label="DEMO 演示入口"
        className="fixed right-3 z-40 flex items-center gap-1 border-2 border-ink bg-background px-2.5 py-1.5 shadow-[2px_2px_0_0_var(--color-ink)] active:translate-y-px"
        style={{ bottom: "calc(112px + env(safe-area-inset-bottom, 0px))" }}
      >
        <Radio className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
        <span className="font-mono-label text-[10px] font-bold text-ink">DEMO</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-6"
          onClick={() => setOpen(false)}
          data-el="demo-alert"
        >
          <div
            className="w-full max-w-[360px] border-2 border-ink bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部警示条 */}
            <div className="hazard-edge h-1.5 w-full" />
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="font-mono-label text-[10px] font-bold text-primary">DEMO · 模拟预警</span>
              <button onClick={() => setOpen(false)} aria-label="关闭" className="text-ink">
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 py-5">
              <Waves className="h-10 w-10 shrink-0 text-primary" strokeWidth={2} />
              <div className="font-heading text-3xl font-bold leading-tight text-ink">城市洪水预警</div>
            </div>
            <button
              onClick={trigger}
              className="flex w-full items-center justify-center border-t-2 border-ink bg-primary py-3 font-heading text-base font-bold text-primary-foreground active:opacity-90"
            >
              立即进入灾中应急
            </button>
          </div>
        </div>
      )}
    </>
  );
}
