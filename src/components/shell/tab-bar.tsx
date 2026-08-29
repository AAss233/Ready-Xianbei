"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Backpack, Layers } from "lucide-react";
import { cn } from "@/utils/utils";
import { HazardBar } from "@/components/shell/ui";

const TABS = [
  { href: "/", label: "首页", labelEn: "HOME", code: "01", icon: Home, key: "home" },
  { href: "/bag", label: "背包", labelEn: "PACK", code: "02", icon: Backpack, key: "bag" },
  { href: "/community", label: "社区", labelEn: "DATA", code: "03", icon: Layers, key: "community" },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      data-el="app-tabbar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-secondary text-secondary-foreground"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto max-w-[560px]">
        <HazardBar />
      </div>
      <ul className="mx-auto grid max-w-[560px] grid-cols-3">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          const Icon = t.icon;
          return (
            <li key={t.key} className="border-l border-white/10 first:border-l-0">
              <Link
                href={t.href}
                data-el={`nav-${t.key}`}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-secondary-foreground/70",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                <span className="text-[11px] font-semibold leading-none">{t.label}</span>
                <span className="font-mono-label text-[8px] leading-none opacity-60">{t.labelEn}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
