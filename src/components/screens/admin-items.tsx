"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getItems, saveItems, resetItems, isItemsCustomized } from "@/lib/prep/custom-store";
import { LIST_GROUPS, type ListGroup, type TaskTemplate } from "@/lib/prep/rules";
import { DISASTERS } from "@/lib/prep/domain";
import type { DisasterId } from "@/lib/prep/domain";

const DISASTER_OPTS: { id: DisasterId | "general"; name: string }[] = [
  { id: "general", name: "通用" },
  ...DISASTERS.map((d) => ({ id: d.id, name: d.name })),
];

export function AdminItems() {
  const [items, setItems] = useState<TaskTemplate[]>([]);
  const [customized, setCustomized] = useState(false);

  useEffect(() => {
    setItems(getItems());
    setCustomized(isItemsCustomized());
  }, []);

  const commit = (next: TaskTemplate[]) => {
    setItems(next);
    saveItems(next);
    setCustomized(true);
  };

  const update = (i: number, patch: Partial<TaskTemplate>) =>
    commit(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const remove = (i: number) => commit(items.filter((_, idx) => idx !== i));

  const add = () =>
    commit([
      ...items,
      {
        key: `admin-${Date.now()}`,
        name: "新物资",
        group: "bob",
        disaster: "general",
        reasonTags: ["自定义"],
        detail: "",
      },
    ]);

  const reset = () => {
    if (!confirm("恢复为内置默认物资？你的修改会丢失。")) return;
    resetItems();
    setItems(getItems());
    setCustomized(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="font-mono-label text-[11px] text-muted-foreground">
          共 {items.length} 项{customized ? " · 已自定义" : " · 内置默认"}
        </div>
        <div className="flex gap-2">
          {customized && (
            <button onClick={reset} className="border border-ink/30 px-2 py-1 text-[12px] font-semibold text-ink active:bg-muted">
              恢复默认
            </button>
          )}
          <button onClick={add} className="flex items-center gap-1 border-2 border-primary bg-primary px-2 py-1 text-[12px] font-bold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新增物资
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {items.map((it, i) => (
        <div key={it.key} className="flex flex-col gap-2 border border-ink/15 bg-card p-3" data-el="admin-item">
          <div className="flex items-start gap-2">
            <input
              value={it.name}
              onChange={(e) => update(i, { name: e.target.value })}
              className="min-w-0 flex-1 border-b border-ink/30 bg-transparent pb-1 text-sm font-semibold text-ink outline-none focus:border-primary"
            />
            <button onClick={() => remove(i)} aria-label="删除" className="shrink-0 text-muted-foreground active:text-primary">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={it.group}
              onChange={(e) => update(i, { group: e.target.value as ListGroup })}
              className="border border-ink/25 bg-card px-2 py-1 text-[12px] text-ink outline-none"
            >
              {LIST_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select
              value={it.disaster}
              onChange={(e) => update(i, { disaster: e.target.value as DisasterId | "general" })}
              className="border border-ink/25 bg-card px-2 py-1 text-[12px] text-ink outline-none"
            >
              {DISASTER_OPTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={it.target ?? ""}
                placeholder="数量"
                onChange={(e) => update(i, { target: e.target.value ? Number(e.target.value) : undefined })}
                className="w-16 border border-ink/25 bg-card px-2 py-1 text-[12px] text-ink outline-none"
              />
              <input
                value={it.unit ?? ""}
                placeholder="单位"
                onChange={(e) => update(i, { unit: e.target.value || undefined })}
                className="w-14 border border-ink/25 bg-card px-2 py-1 text-[12px] text-ink outline-none"
              />
            </div>
          </div>

          <textarea
            value={it.detail ?? ""}
            placeholder="一句说明（品名 / 数量 / 关键细节）"
            onChange={(e) => update(i, { detail: e.target.value })}
            rows={2}
            className="w-full resize-none border border-ink/20 bg-transparent p-2 text-[12px] text-ink outline-none focus:border-primary"
          />
        </div>
      ))}
      </div>
    </div>
  );
}
