"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { AppShell, SysTopBar, Content, AtmosphereBg, SectionLabel, HazardBar, Panel, Tag } from "@/components/shell/ui";
import { getGear, getKnowledge } from "@/lib/prep/gear";
import { getItems } from "@/lib/prep/custom-store";
import { getSubItems } from "@/lib/prep/subitems";
import { SubItemsChecklist } from "@/components/prep/subitems-checklist";
import { MedGuide } from "@/components/prep/med-guide";
import { usePrep } from "@/stores/prep-store";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const gear = getGear(id);
  const { tasks } = usePrep();
  const subItems = getSubItems(id);

  // 二级清单面板（带勾选 / 数量累加），仅当该物资已细化时显示
  const subItemsPanel = subItems ? <SubItemsChecklist itemId={id} /> : null;

  // 没有对应「装备」详情时，回退到清单项（含防丢绳、卫生巾、检查类任务等无 gearId 的物资），
  // 用清单里的名称/说明渲染一个简版详情，而不是直接 404。
  if (!gear) {
    const task =
      tasks.find((t) => t.id === id) ??
      getItems().find((m) => m.key === id);
    if (!task) return notFound();
    const reasonTags = task.reasonTags?.length ? task.reasonTags : ["个性化推荐"];
    const qty = task.target ? `建议数量：${task.target}${task.unit ?? ""}` : null;
    return (
      <AppShell withTab={false}>
        <SysTopBar code="ITEM" title={task.name} back />
        <Content className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-ink">{task.name}</h2>
            <Tag>清单物资</Tag>
          </div>

          {/* 有二级清单时：清单紧跟标题，优先呈现（与装备详情页顺序保持一致） */}
          {subItemsPanel}

          <Panel className="p-4" data-el="item-reason">
            <SectionLabel en="WHY RECOMMENDED" cn="为什么推荐" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reasonTags.map((r) => (
                <span key={r} className="bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{r}</span>
              ))}
            </div>
          </Panel>

          {(task.detail || qty) && (
            <Panel className="p-4" data-el="item-learn">
              <SectionLabel en="HOW TO USE" cn="怎么准备" />
              <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-ink">
                {qty && <p><span className="font-mono-label text-[10px] text-primary">数量 </span>{qty}</p>}
                {task.detail && <p>{task.detail}</p>}
              </div>
            </Panel>
          )}

          <Link href="/bag" className="text-center font-mono-label text-[11px] text-primary">‹ 返回背包清单</Link>
        </Content>
        <HazardBar />
      </AppShell>
    );
  }

  // 从清单里找到该装备对应任务的推荐理由（匹配原因）
  const relatedTask = tasks.find((t) => t.gearId === gear.id);
  const reasonTags = relatedTask?.reasonTags ?? ["通用必备"];
  const knowledge = gear.relatedKnowledge ? getKnowledge(gear.relatedKnowledge) : null;
  // 标题与一级清单保持一致：优先用清单里该物资的名称
  const displayName = relatedTask?.name ?? gear.name;

  return (
    <AppShell withTab={false}>
      <SysTopBar code="ITEM" title={displayName} back />

      <Content className="flex flex-col gap-4 p-4">
        {/* 装备图区（无二级清单时展示；有二级清单则省去大图，优先显示清单） */}
        {!subItems && (
          <div className="halftone relative flex h-40 items-center justify-center overflow-hidden border border-ink/20 bg-muted" data-el="item-hero">
            <AtmosphereBg src="/bg/fire.png" opacity={0.12} />
            <span className="relative z-10 font-heading text-2xl font-bold uppercase text-ink/70">{gear.nameEn}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-ink">{displayName}</h2>
          <Tag>{gear.category}</Tag>
        </div>

        {/* 有二级清单时：清单紧跟标题，优先呈现 */}
        {subItemsPanel}

        {/* 急救包专属：药症速查卡 */}
        {id === "firstaid" && <MedGuide />}

        {/* 匹配原因（仅子页面展示） */}
        <Panel className="p-4" data-el="item-reason">
          <SectionLabel en="WHY RECOMMENDED" cn="为什么推荐" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reasonTags.map((r) => (
              <span key={r} className="bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{r}</span>
            ))}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{gear.why}</p>
        </Panel>

        {/* 学习内容 */}
        <Panel className="p-4" data-el="item-learn">
          <SectionLabel en="HOW TO USE" cn="适用场景与使用说明" />
          <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-ink">
            <p><span className="font-mono-label text-[10px] text-primary">场景 </span>{gear.scene}</p>
            <p><span className="font-mono-label text-[10px] text-primary">用法 </span>{gear.usage}</p>
            {knowledge && (
              <div className="mt-1 flex items-start gap-2 border-t border-ink/10 pt-2 text-muted-foreground">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p><span className="font-mono-label text-[10px] text-primary">要点 </span>{knowledge.content}</p>
              </div>
            )}
          </div>
        </Panel>

        <Link href="/bag" className="text-center font-mono-label text-[11px] text-primary">‹ 返回背包清单</Link>
      </Content>

      <HazardBar />
    </AppShell>
  );
}
