"use client";

import { useEffect, type ReactNode } from "react";

// 标记封面预览已渲染就绪（替换模板起始页后使用）。
export function EazoCoverReady({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.setAttribute("data-eazo-cover-ready", "1");
    return () => {
      document.body.removeAttribute("data-eazo-cover-ready");
    };
  }, []);

  return (
    <div data-eazo-cover-ready-root className="h-full w-full">
      {children}
    </div>
  );
}
