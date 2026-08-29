import { type NextRequest, NextResponse } from "next/server";
import { createReply } from "@/lib/db/queries/reviews";

export const dynamic = "force-dynamic";

// POST /api/reviews/:id/replies — 给某条评价加回复（评价的评论，可折叠）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { authorName, authorToken, content, parentReplyId } = body ?? {};
    if (!authorToken || !content?.trim()) {
      return NextResponse.json({ ok: false, error: "invalid input" }, { status: 400 });
    }
    const reply = await createReply({
      reviewId: id,
      parentReplyId: parentReplyId ?? null,
      authorName: (authorName ?? "").trim() || "匿名用户",
      authorToken,
      content: content.trim(),
    });
    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error("[replies.POST]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
