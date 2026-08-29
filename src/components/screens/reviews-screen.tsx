"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Trash2, MessageSquare, ChevronDown, ChevronUp, PenLine, AlertTriangle } from "lucide-react";
import { AppShell, SysTopBar, Content, HazardBar, Panel } from "@/components/shell/ui";
import { getProduct } from "@/lib/prep/products";
import { gearDisplayName } from "@/lib/prep/gear";
import { useReviews, type ApiReview, type ApiReply } from "@/lib/prep/use-reviews";
import { getAuthorName } from "@/lib/prep/review-identity";

function StarRow({ n, size = 3.5 }: { n: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5 text-primary">
      {Array.from({ length: n }).map((_, k) => (
        <Star key={k} className="fill-primary text-primary" style={{ width: `${size * 4}px`, height: `${size * 4}px` }} />
      ))}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

// 小回复输入框（回复评价 / 回复某条回复）
function ReplyBox({ defaultName, placeholder, onSubmit, onCancel }: {
  defaultName: string; placeholder: string; onSubmit: (content: string, name: string) => Promise<void>; onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [name, setName] = useState(defaultName);
  return (
    <div className="mt-2 flex flex-col gap-2 border-l-2 border-ink/15 pl-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="昵称（选填）" className="border border-ink/25 bg-background px-2 py-1.5 text-[12px] outline-none" maxLength={24} />
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} rows={2} className="border border-ink/25 bg-background px-2 py-1.5 text-[12px] outline-none" maxLength={300} />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 border border-ink/25 py-1.5 text-[12px]">取消</button>
        <button disabled={!text.trim()} onClick={async () => { await onSubmit(text, name); setText(""); }} className="flex-1 border-2 border-primary bg-primary py-1.5 text-[12px] font-bold text-primary-foreground disabled:opacity-40">发布</button>
      </div>
    </div>
  );
}

// —— 写评价表单 ——
function WriteForm({ onSubmit }: { onSubmit: (r: { rating: number; content: string; authorName: string }) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const openForm = () => {
    setName(getAuthorName()); // 打开时读取最新昵称（重置后为空）
    setOpen(true);
  };

  if (!open) {
    return (
      <button onClick={openForm} className="flex w-full items-center justify-center gap-2 border-2 border-primary bg-primary py-3 font-heading font-bold text-primary-foreground active:scale-[0.99]" data-el="review-write-open">
        <PenLine className="h-4 w-4" /> 写评价 · 打个分
      </button>
    );
  }
  return (
    <Panel className="flex flex-col gap-3 p-4" data-el="review-write-form">
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-ink">评分</span>
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1}星`}>
            <Star className={i < rating ? "h-6 w-6 fill-primary text-primary" : "h-6 w-6 text-ink/25"} />
          </button>
        ))}
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="你的昵称（选填）" className="border border-ink/20 bg-background px-3 py-2 text-[13px] text-ink outline-none" maxLength={24} />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="说说你的使用体验，帮助更多人备灾～" rows={3} className="border border-ink/20 bg-background px-3 py-2 text-[13px] text-ink outline-none" maxLength={500} />
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 border border-ink/25 py-2 text-[13px] text-ink active:bg-muted">取消</button>
        <button
          disabled={busy || !content.trim()}
          onClick={async () => { setBusy(true); await onSubmit({ rating, content, authorName: name }); setBusy(false); setContent(""); setOpen(false); }}
          className="flex-1 border-2 border-primary bg-primary py-2 font-bold text-primary-foreground disabled:opacity-40"
          data-el="review-submit"
        >
          {busy ? "提交中…" : "发布评价"}
        </button>
      </div>
    </Panel>
  );
}

// —— 单条回复（可再被回复：评论别人的回复） ——
function ReplyItem({ rp, isMine, defaultName, onReply, onDelete }: {
  rp: ApiReply; isMine: (t: string) => boolean; defaultName: string;
  onReply: (parentReplyId: string, content: string, name: string) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [replying, setReplying] = useState(false);
  return (
    <div className="text-[13px]" data-el="review-reply">
      <span className="font-bold text-ink">{rp.authorName}</span>
      <span className="ml-2 text-ink/85">{rp.content}</span>
      <div className="mt-0.5 flex items-center gap-3 font-mono-label text-[10px] text-muted-foreground">
        <span>{timeAgo(rp.createdAt)}</span>
        <button onClick={() => setReplying((v) => !v)} className="active:text-ink">回复</button>
        {isMine(rp.authorToken) && <button onClick={() => onDelete(rp.id)} className="active:text-ink">删除</button>}
      </div>
      {replying && (
        <ReplyBox
          defaultName={defaultName}
          placeholder={`回复 @${rp.authorName}…`}
          onSubmit={async (content, name) => { await onReply(rp.id, content, name); setReplying(false); }}
          onCancel={() => setReplying(false)}
        />
      )}
    </div>
  );
}

// —— 单条评价（点赞/点踩 + 可折叠回复 + 回复的回复） ——
function ReviewCard({ r, isMine, onDelete, onReply, onDeleteReply, onVote, defaultName }: {
  r: ApiReview;
  isMine: (t: string) => boolean;
  onDelete: (id: string) => void;
  onReply: (reviewId: string, content: string, name: string, parentReplyId?: string) => Promise<void>;
  onDeleteReply: (id: string) => void;
  onVote: (reviewId: string, value: 1 | -1) => void;
  defaultName: string;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);

  // 顶层回复（parentReplyId 为空），其下挂它的子回复
  const topReplies = r.replies.filter((p) => !p.parentReplyId);
  const childrenOf = (id: string) => r.replies.filter((p) => p.parentReplyId === id);

  return (
    <div className="border-b border-ink/10 pb-4 last:border-0" data-el="review-card">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold text-ink">{r.authorName}</span>
        <StarRow n={r.rating} />
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink/90">{r.content}</p>

      {/* 点赞 / 点踩 */}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() => onVote(r.id, 1)}
          className={`flex items-center gap-1 border px-2 py-1 text-[11px] ${r.myVote === 1 ? "border-primary bg-primary text-primary-foreground" : "border-ink/25 text-muted-foreground active:bg-muted"}`}
          data-el="review-like"
        >
          <ThumbsUp className="h-3.5 w-3.5" />{r.likes}
        </button>
        <button
          onClick={() => onVote(r.id, -1)}
          className={`flex items-center gap-1 border px-2 py-1 text-[11px] ${r.myVote === -1 ? "border-ink bg-ink text-background" : "border-ink/25 text-muted-foreground active:bg-muted"}`}
          data-el="review-dislike"
        >
          <ThumbsDown className="h-3.5 w-3.5" />{r.dislikes}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-4 font-mono-label text-[11px] text-muted-foreground">
        <span>{timeAgo(r.createdAt)}</span>
        <button onClick={() => setReplying((v) => !v)} className="flex items-center gap-1 active:text-ink"><MessageSquare className="h-3.5 w-3.5" />评论</button>
        {r.replies.length > 0 && (
          <button onClick={() => setShowReplies((v) => !v)} className="flex items-center gap-1 active:text-ink" data-el="review-toggle-replies">
            {r.replies.length} 条评论 {showReplies ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
        {isMine(r.authorToken) && (
          <button onClick={() => onDelete(r.id)} className="ml-auto flex items-center gap-1 active:text-ink" data-el="review-delete"><Trash2 className="h-3.5 w-3.5" />删除</button>
        )}
      </div>

      {replying && (
        <ReplyBox
          defaultName={defaultName}
          placeholder="评论这条评价…"
          onSubmit={async (content, name) => { await onReply(r.id, content, name); setReplying(false); setShowReplies(true); }}
          onCancel={() => setReplying(false)}
        />
      )}

      {/* 评价的评论（可折叠）；回复下可再挂回复 */}
      {showReplies && topReplies.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 border-l-2 border-ink/15 pl-3" data-el="review-replies">
          {topReplies.map((rp) => (
            <div key={rp.id} className="flex flex-col gap-2">
              <ReplyItem rp={rp} isMine={isMine} defaultName={defaultName} onDelete={onDeleteReply}
                onReply={(parentId, content, name) => onReply(r.id, content, name, parentId)} />
              {/* 回复的回复（再缩进一层） */}
              {childrenOf(rp.id).length > 0 && (
                <div className="ml-3 flex flex-col gap-2 border-l-2 border-ink/10 pl-3">
                  {childrenOf(rp.id).map((c) => (
                    <ReplyItem key={c.id} rp={c} isMine={isMine} defaultName={defaultName} onDelete={onDeleteReply}
                      onReply={(_pid, content, name) => onReply(r.id, content, name, rp.id)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReviewsScreen({ productId }: { productId: string }) {
  const product = getProduct(productId);
  const gearId = product?.gearId;
  const { reviews, submitReview, removeReview, submitReply, removeReply, vote, isMine, defaultName } = useReviews(gearId);

  // 商品「即将下架」标识（踩率>70% 且 ≥5 票，云端聚合）
  const [flagged, setFlagged] = useState(false);
  useEffect(() => {
    let alive = true;
    const check = () => {
      fetch(`/api/products/${productId}/dislike`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => { if (alive && d.ok) setFlagged(d.flagged); })
        .catch(() => {});
    };
    check();
    const t = setInterval(check, 5000);
    return () => { alive = false; clearInterval(t); };
  }, [productId, reviews.length]);

  const avg = product?.rating ?? 5;
  const total = reviews.length;

  return (
    <AppShell withTab={false}>
      <SysTopBar code="REVIEWS" title="全部评价" back />
      <Content className="flex flex-col gap-4 p-4 pb-24">
        {product && (
          <div className="flex items-center justify-between border-b-2 border-ink pb-3">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-ink">{product.name}</div>
              <div className="font-mono-label text-[11px] text-muted-foreground">{gearDisplayName(product.gearId)} · 共 {total} 条用户评价</div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-heading text-3xl font-bold leading-none text-primary">{avg}</span>
            </div>
          </div>
        )}

        {flagged && (
          <div className="flex items-center gap-2 border border-ink/20 bg-ink px-3 py-2 text-background" data-el="product-downlist">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-[13px] font-bold">大家都不喜欢 · 即将下架</span>
          </div>
        )}

        <WriteForm onSubmit={(r) => submitReview({ ...r, productId })} />

        {/* 云端真实评价（扫码实时，含预置口碑，均可点赞/点踩） */}
        <div className="flex flex-col gap-4">
          {reviews.length === 0 && (
            <p className="py-6 text-center text-[13px] text-muted-foreground">还没有评价，来做第一个吧～</p>
          )}
          {reviews.map((r) => (
            <ReviewCard key={r.id} r={r} isMine={isMine} onDelete={removeReview} onReply={submitReply} onDeleteReply={removeReply} onVote={vote} defaultName={defaultName} />
          ))}
        </div>
      </Content>
      <HazardBar />
    </AppShell>
  );
}
