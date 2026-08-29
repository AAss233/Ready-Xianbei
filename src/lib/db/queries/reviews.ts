import { desc, eq, and, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews, reviewReplies, reviewVotes, type Review, type ReviewReply } from "@/lib/db/schema/reviews";

function rid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export interface ReviewWithMeta extends Review {
  replies: ReviewReply[];
  likes: number;
  dislikes: number;
  myVote: number; // 1 | -1 | 0
}

// 读取某物资类别下的全部评价（含回复 + 点赞/点踩票数 + 我的投票），按时间倒序。
export async function listReviews(gearId: string, voterToken?: string): Promise<ReviewWithMeta[]> {
  const rvs = await db
    .select()
    .from(reviews)
    .where(eq(reviews.gearId, gearId))
    .orderBy(desc(reviews.createdAt));
  if (rvs.length === 0) return [];
  const ids = rvs.map((r) => r.id);

  const reps = await db
    .select()
    .from(reviewReplies)
    .where(inArray(reviewReplies.reviewId, ids))
    .orderBy(reviewReplies.createdAt);

  // 票数聚合
  const tallies = await db
    .select({
      reviewId: reviewVotes.reviewId,
      likes: sql<number>`count(*) filter (where ${reviewVotes.value} = 1)`.mapWith(Number),
      dislikes: sql<number>`count(*) filter (where ${reviewVotes.value} = -1)`.mapWith(Number),
    })
    .from(reviewVotes)
    .where(inArray(reviewVotes.reviewId, ids))
    .groupBy(reviewVotes.reviewId);

  // 我的投票
  let mine: { reviewId: string; value: number }[] = [];
  if (voterToken) {
    mine = await db
      .select({ reviewId: reviewVotes.reviewId, value: reviewVotes.value })
      .from(reviewVotes)
      .where(and(inArray(reviewVotes.reviewId, ids), eq(reviewVotes.voterToken, voterToken)));
  }

  return rvs.map((r) => {
    const t = tallies.find((x) => x.reviewId === r.id);
    const mv = mine.find((x) => x.reviewId === r.id);
    return {
      ...r,
      replies: reps.filter((p) => p.reviewId === r.id),
      likes: (t?.likes ?? 0) + (r.seedLikes ?? 0), // 种子基础赞 + 真实点赞
      dislikes: t?.dislikes ?? 0,
      myVote: mv?.value ?? 0,
    };
  });
}

// 某商品的点踩率（聚合该商品所属类别下、且 productId 命中的评价投票）。
// 返回 { likes, dislikes, rate, flagged }。flagged: 踩率>70% 且总票数≥5。
export async function productDislikeStats(productId: string): Promise<{ likes: number; dislikes: number; rate: number; flagged: boolean }> {
  const rows = await db
    .select({
      likes: sql<number>`count(*) filter (where ${reviewVotes.value} = 1)`.mapWith(Number),
      dislikes: sql<number>`count(*) filter (where ${reviewVotes.value} = -1)`.mapWith(Number),
    })
    .from(reviewVotes)
    .innerJoin(reviews, eq(reviewVotes.reviewId, reviews.id))
    .where(eq(reviews.productId, productId));
  const likes = rows[0]?.likes ?? 0;
  const dislikes = rows[0]?.dislikes ?? 0;
  const total = likes + dislikes;
  const rate = total === 0 ? 0 : dislikes / total;
  return { likes, dislikes, rate, flagged: total >= 5 && rate > 0.7 };
}

export async function createReview(input: {
  gearId: string;
  productId?: string | null;
  authorName: string;
  authorToken: string;
  rating: number;
  content: string;
}): Promise<Review> {
  const row = {
    id: rid("rv"),
    gearId: input.gearId,
    productId: input.productId ?? null,
    authorName: input.authorName.slice(0, 24) || "匿名用户",
    authorToken: input.authorToken,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    content: input.content.slice(0, 500),
  };
  const [created] = await db.insert(reviews).values(row).returning();
  return created;
}

// 只能删自己：token 必须匹配。连带清理回复与投票。
export async function deleteReview(id: string, token: string): Promise<boolean> {
  const res = await db
    .delete(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.authorToken, token)))
    .returning({ id: reviews.id });
  if (res.length) {
    await db.delete(reviewReplies).where(eq(reviewReplies.reviewId, id));
    await db.delete(reviewVotes).where(eq(reviewVotes.reviewId, id));
  }
  return res.length > 0;
}

export async function createReply(input: {
  reviewId: string;
  parentReplyId?: string | null;
  authorName: string;
  authorToken: string;
  content: string;
}): Promise<ReviewReply> {
  const [created] = await db
    .insert(reviewReplies)
    .values({
      id: rid("rp"),
      reviewId: input.reviewId,
      parentReplyId: input.parentReplyId ?? null,
      authorName: input.authorName.slice(0, 24) || "匿名用户",
      authorToken: input.authorToken,
      content: input.content.slice(0, 300),
    })
    .returning();
  return created;
}

export async function deleteReply(id: string, token: string): Promise<boolean> {
  const res = await db
    .delete(reviewReplies)
    .where(and(eq(reviewReplies.id, id), eq(reviewReplies.authorToken, token)))
    .returning({ id: reviewReplies.id });
  return res.length > 0;
}

// 投票：同值再投=取消(删除)，异值=切换。返回最新我的投票值。
export async function castVote(reviewId: string, voterToken: string, value: 1 | -1): Promise<number> {
  const existing = await db
    .select({ value: reviewVotes.value })
    .from(reviewVotes)
    .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.voterToken, voterToken)))
    .limit(1);
  if (existing.length && existing[0].value === value) {
    await db.delete(reviewVotes).where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.voterToken, voterToken)));
    return 0;
  }
  await db
    .insert(reviewVotes)
    .values({ reviewId, voterToken, value })
    .onConflictDoUpdate({ target: [reviewVotes.reviewId, reviewVotes.voterToken], set: { value } });
  return value;
}
