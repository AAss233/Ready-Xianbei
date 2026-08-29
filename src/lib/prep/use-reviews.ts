"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthorToken, getAuthorName, setAuthorName } from "@/lib/prep/review-identity";

export interface ApiReply {
  id: string;
  reviewId: string;
  parentReplyId: string | null;
  authorName: string;
  authorToken: string;
  content: string;
  createdAt: string;
}
export interface ApiReview {
  id: string;
  gearId: string;
  productId: string | null;
  authorName: string;
  authorToken: string;
  rating: number;
  content: string;
  createdAt: string;
  replies: ApiReply[];
  likes: number;
  dislikes: number;
  myVote: number; // 1 | -1 | 0
}

// 云端评价 hook：拉取 + 轮询（扫码实时同步）+ 增删改 + 点赞/点踩。
export function useReviews(gearId: string | undefined) {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useRef<string>("");

  useEffect(() => {
    token.current = getAuthorToken();
  }, []);

  const load = useCallback(async () => {
    if (!gearId) return;
    try {
      const tk = token.current || getAuthorToken();
      const res = await fetch(`/api/reviews?gearId=${encodeURIComponent(gearId)}&voterToken=${encodeURIComponent(tk)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setReviews(data.reviews as ApiReview[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [gearId]);

  // 首次加载 + 每 5s 轮询实现「扫码写→大屏实时更新」
  useEffect(() => {
    if (!gearId) return;
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [gearId, load]);

  const submitReview = useCallback(
    async (input: { rating: number; content: string; authorName: string; productId?: string }) => {
      if (!gearId) return;
      setAuthorName(input.authorName);
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, gearId, authorToken: token.current }),
      });
      await load();
    },
    [gearId, load],
  );

  const removeReview = useCallback(
    async (id: string) => {
      await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorToken: token.current }),
      });
      await load();
    },
    [load],
  );

  // 回复评价，或回复某条回复（parentReplyId 非空 = 评论别人的回复）
  const submitReply = useCallback(
    async (reviewId: string, content: string, authorName: string, parentReplyId?: string) => {
      setAuthorName(authorName);
      await fetch(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, authorName, authorToken: token.current, parentReplyId: parentReplyId ?? null }),
      });
      await load();
    },
    [load],
  );

  const removeReply = useCallback(
    async (id: string) => {
      await fetch(`/api/replies/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorToken: token.current }),
      });
      await load();
    },
    [load],
  );

  // 点赞(1)/点踩(-1)：乐观更新，再拉取校准
  const vote = useCallback(
    async (reviewId: string, value: 1 | -1) => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r;
          const was = r.myVote;
          const now = was === value ? 0 : value;
          let likes = r.likes;
          let dislikes = r.dislikes;
          if (was === 1) likes -= 1;
          if (was === -1) dislikes -= 1;
          if (now === 1) likes += 1;
          if (now === -1) dislikes += 1;
          return { ...r, myVote: now, likes, dislikes };
        }),
      );
      await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterToken: token.current, value }),
      });
      await load();
    },
    [load],
  );

  const isMine = useCallback((authorToken: string) => authorToken === token.current, []);

  return { reviews, loading, submitReview, removeReview, submitReply, removeReply, vote, isMine, defaultName: getAuthorName() };
}
