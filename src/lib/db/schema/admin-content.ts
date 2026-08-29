import type { InferSelectModel } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// 系统级公共内容：物资清单 / 小游戏题库 各存一行 JSON 快照。
// 后台编辑写这里，所有 app 端读这里 —— 实现「后台改→观众同步」。
export const adminContent = pgTable("admin_content", {
  key: text("key").primaryKey(), // "items" | "quiz"
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminContent = InferSelectModel<typeof adminContent>;
