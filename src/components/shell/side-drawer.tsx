"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Menu, X, RotateCcw, Pencil } from "lucide-react";
import { usePrep } from "@/stores/prep-store";
import { levelFromGrowth } from "@/lib/prep/domain";
import { clearCart } from "@/stores/cart-store";
import { resetIdentity } from "@/lib/prep/review-identity";

interface DrawerCtx {
  open: () => void;
  close: () => void;
}
const Ctx = createContext<DrawerCtx | null>(null);

export function useSideDrawer(): DrawerCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSideDrawer must be used within SideDrawerProvider");
  return c;
}

/** 左上角菜单按钮：点击拉出左侧侧边栏 */
export function MenuButton({ className }: { className?: string }) {
  const { open } = useSideDrawer();
  return (
    <button
      onClick={open}
      aria-label="菜单"
      data-el="menu-button"
      className={`flex h-9 w-9 items-center justify-center border border-ink/20 bg-card text-ink active:bg-muted ${className ?? ""}`}
    >
      <Menu className="h-5 w-5" strokeWidth={2.4} />
    </button>
  );
}

export function SideDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { growth, nickname, setNickname, resetAll } = usePrep();
  const level = levelFromGrowth(growth);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);

  // 打开时锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const close = () => {
    setEditing(false);
    setIsOpen(false);
  };
  const saveName = () => {
    setNickname(draft);
    setEditing(false);
  };

  return (
    <Ctx.Provider value={{ open: () => setIsOpen(true), close }}>
      {children}

      {/* 遮罩 */}
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-[70] bg-ink/50 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* 左侧抽屉 */}
      <aside
        data-el="side-drawer"
        className={`fixed inset-y-0 left-0 z-[80] flex w-[82%] max-w-[340px] flex-col bg-background shadow-[4px_0_0_0_rgba(0,0,0,0.06)] transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 顶栏 */}
        <div
          className="flex items-center justify-between border-b-2 border-ink px-4 pb-3"
          style={{ paddingTop: "max(44px, env(safe-area-inset-top, 0px))" }}
        >
          <div>
            <div className="font-mono-label text-[10px] tracking-[0.2em] text-muted-foreground">READY</div>
            <div className="font-heading text-2xl font-bold leading-none text-ink">先备</div>
          </div>
          <button
            onClick={close}
            aria-label="关闭"
            className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink active:bg-muted"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
          {/* 身份卡：头像 + 昵称（可改）+ 当前称号 */}
          <div className="flex items-center gap-3" data-el="drawer-user">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-ink/20 bg-muted text-3xl">
              {level.icon}
            </div>
            <div className="min-w-0 flex-1">
              {editing ? (
                <input
                  autoFocus
                  value={draft}
                  maxLength={12}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  onBlur={saveName}
                  placeholder="给自己起个名"
                  className="w-full border-b-2 border-ink/40 bg-transparent pb-1 font-heading text-xl font-bold text-ink outline-none focus:border-primary"
                />
              ) : (
                <button
                  onClick={() => {
                    setDraft(nickname);
                    setEditing(true);
                  }}
                  className="flex items-center gap-1.5 active:opacity-70"
                  data-el="drawer-edit-name"
                >
                  <span className="truncate font-heading text-xl font-bold text-ink">{nickname}</span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              )}
              <div className="mt-1 inline-flex items-center gap-1.5">
                <span className="h-2 w-2 bg-primary" aria-hidden />
                <span className="font-heading text-sm font-bold text-primary">{level.title}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-ink/10" />

          {/* 重置演示数据 */}
          <button
            onClick={() => {
              if (confirm("确定重置为初始（未填写评估）状态？仅用于演示。")) {
                resetAll();
                clearCart();        // 清空购物车
                resetIdentity();    // 重置本地评价身份（昵称+token）
                close();
              }
            }}
            className="flex items-center justify-center gap-2 border border-ink/30 py-3 font-heading text-sm font-bold text-ink active:bg-muted"
            data-el="drawer-reset"
          >
            <RotateCcw className="h-4 w-4" /> 重置演示数据
          </button>
        </div>

        <div className="hazard-edge h-1.5 w-full" />
      </aside>
    </Ctx.Provider>
  );
}
