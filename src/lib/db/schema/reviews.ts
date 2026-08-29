import type { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

// 公共评价表：扫码任何人可写（匿名昵称 + 客户端 token 标识作者，只删自己）。
// 属公共/系统级数据，不绑定 users.id，实现「扫码写→所有人实时看到」。
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id"),
  gearId: text("gear_id").notNull(),
  authorName: text("author_name").notNull(),
  authorToken: text("author_token").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  seedLikes: integer("seed_likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 评价的回复；parentReplyId 指向被回复的回复 → 支持「评论别人的评价/回复」再嵌套一层。
export const reviewReplies = pgTable("review_replies", {
  id: text("id").primaryKey(),
  reviewId: text("review_id").notNull(),
  parentReplyId: text("parent_reply_id"),
  authorName: text("author_name").notNull(),
  authorToken: text("author_token").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 评价点赞/点踩：每个 token 对每条评价只有一票（value: 1=赞, -1=踩），可切换/取消。
export const reviewVotes = pgTable(
  "review_votes",
  {
    reviewId: text("review_id").notNull(),
    voterToken: text("voter_token").notNull(),
    value: integer("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.reviewId, t.voterToken] }) }),
);

export type Review = InferSelectModel<typeof reviews>;
export type ReviewReply = InferSelectModel<typeof reviewReplies>;
export type ReviewVote = InferSelectModel<typeof reviewVotes>;
