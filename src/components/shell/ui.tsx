"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/utils/utils";
import { MenuButton } from "@/components/shell/side-drawer";

// 报刊应急情报风格 UI 原语

/**
 * 页面外壳：满宽无灰边（背景铺满整个视口），内容内层保持移动端阅读宽度。
 * withTab 时底部为固定 TabBar 留白。
 */
export function AppShell({
  children,
  withTab = true,
  className,
}: {
  children: ReactNode;
  withTab?: boolean;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative flex min-h-full w-full flex-col bg-background",
        className,
      )}
    >
      {children}
      {/* 底部占位：为固定导航栏留出真实滚动空间（padding 在 flex 容器里可能被压掉，用不可压缩的 spacer 更稳）。 */}
      {withTab ? (
        <div aria-hidden className="shrink-0" style={{ height: "calc(120px + env(safe-area-inset-bottom, 0px))" }} />
      ) : (
        <div aria-hidden className="shrink-0" style={{ height: "max(16px, env(safe-area-inset-bottom, 0px))" }} />
      )}
    </main>
  );
}

/**
 * 天灾氛围背景层：黑白半色调 + 少量橙叠印的天灾照片，低透明度铺在留白区。
 * 放在需要背景的容器内（容器需 relative）。
 */
export function AtmosphereBg({
  src,
  opacity = 0.14,
  className,
}: {
  src: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-0 bg-cover bg-center", className)}
      style={{
        backgroundImage: `url(${src})`,
        opacity,
        mixBlendMode: "multiply",
      }}
    />
  );
}

/** 顶部系统栏：SYS-编号 + 中文标题 + 可选返回/右侧动作（细线） */
export function SysTopBar({
  code,
  title,
  right,
  back = false,
  menu = false,
}: {
  code: string;
  title: string;
  right?: ReactNode;
  back?: boolean;
  menu?: boolean;
}) {
  const router = useRouter();
  return (
    <header
      data-el="sys-topbar"
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink/15 bg-background px-4 pb-2.5"
      style={{ paddingTop: "max(44px, env(safe-area-inset-top, 0px))" }}
    >
      {menu && <MenuButton className="-ml-1 h-8 w-8 border-0" />}
      {back && (
        <button
          onClick={() => router.back()}
          data-el="topbar-back"
          className="-ml-1 flex h-8 w-8 items-center justify-center text-ink"
          aria-label="返回"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </button>
      )}
      <div className="flex-1">
        <div className="font-mono-label text-[10px] text-primary">{code}</div>
        <h1 className="font-heading text-lg font-bold uppercase tracking-wide text-ink">{title}</h1>
      </div>
      {right}
    </header>
  );
}

/** 内容内层容器：保持移动端阅读宽度（满宽背景之上的内容不过宽） */
export function Content({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div style={style} className={cn("relative z-10 mx-auto w-full max-w-[560px]", className)}>{children}</div>;
}

/** 分区标题：Mono 英文标签 + 中文 */
export function SectionLabel({
  en,
  cn: cnLabel,
  className,
  right,
}: {
  en: string;
  cn: string;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div className={cn("flex items-baseline justify-between", className)}>
      <div>
        <div className="font-mono-label text-[10px] text-muted-foreground">{en}</div>
        <div className="text-sm font-bold text-ink">{cnLabel}</div>
      </div>
      {right}
    </div>
  );
}

/** 状态标签 */
export function StatusPill({
  kind = "normal",
  children,
}: {
  kind?: "normal" | "watch" | "warning" | "alert";
  children: ReactNode;
}) {
  const map = {
    normal: "bg-steel text-white",
    watch: "bg-steel text-white",
    warning: "bg-warning text-ink",
    alert: "bg-primary text-primary-foreground",
  } as const;
  return (
    <span className={cn("px-2 py-0.5 text-[11px] font-bold uppercase font-mono-label", map[kind])}>
      {children}
    </span>
  );
}

/** 标签胶囊（硬边框） */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-ink/20 px-2 py-0.5 text-[11px] font-semibold text-ink">
      {children}
    </span>
  );
}

/** 进度条（细线方块分段填充） */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full border border-ink/25 bg-muted", className)}>
      <div
        className="h-full bg-primary transition-[width] duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** 橙黑警示条 */
export function HazardBar({ className }: { className?: string }) {
  return <div className={cn("hazard-edge h-1.5 w-full", className)} />;
}

/** 报刊卡片（硬边框、不透明，工业数据终端） */
export function Panel({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative z-10 border border-ink/15 bg-card", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
