"use client";

import { AppShell, AtmosphereBg, Content } from "@/components/shell/ui";
import { MenuButton } from "@/components/shell/side-drawer";
import { TabBar } from "@/components/shell/tab-bar";
import { ShopFeed } from "@/components/screens/shop-feed";

export default function CommunityPage() {
  return (
    <AppShell>
      <Content className="flex flex-col" style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))" }}>
        {/* 顶部头卡：与背包/首页同一视觉，大字「社区」 */}
        <div className="relative overflow-hidden border-b border-ink/15 bg-card" data-el="community-head">
          <AtmosphereBg src="/bg/tower.png" opacity={0.1} />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-4 -right-3 z-0 select-none font-heading text-[110px] font-bold leading-none text-ink/[0.05]"
          >
            社区
          </span>
          <div className="relative z-10 flex items-end justify-between gap-2 px-4 pb-3 pt-3">
            <div className="flex items-end gap-2.5">
              <div className="mb-0.5"><MenuButton /></div>
              <div>
                <div className="font-mono-label text-[11px] tracking-[0.2em] text-muted-foreground">COMMUNITY</div>
                <h1 className="mt-0.5 font-heading text-4xl font-bold leading-none tracking-wide text-ink">社区</h1>
              </div>
            </div>
            <div className="pb-1 text-right text-[12px] font-semibold text-muted-foreground">大家都说行 · 那才有点东西</div>
          </div>
        </div>

        <ShopFeed />
      </Content>

      <TabBar />
    </AppShell>
  );
}
