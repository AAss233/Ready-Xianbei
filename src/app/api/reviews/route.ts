import { type NextRequest, NextResponse } from "next/server";
import { listReviews, createReview } from "@/lib/db/queries/reviews";

export const dynamic = "force-dynamic";

// GET /api/reviews?gearId=xxx&voterToken=yyy — 列出该物资类别的全部评价（含票数与我的投票）
export async function GET(request: NextRequest) {
  const gearId = request.nextUrl.searchParams.get("gearId");
  const voterToken = request.nextUrl.searchParams.get("voterToken") ?? undefined;
  if (!gearId) return NextResponse.json({ ok: false, error: "gearId required" }, { status: 400 });
  try {
    const reviews = await listReviews(gearId, voterToken);
    return NextResponse.json({ ok: true, reviews });
  } catch (err) {
    console.error("[reviews.GET]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

// POST /api/reviews — 任何人可写（匿名 token 标识作者）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gearId, productId, authorName, authorToken, rating, content } = body ?? {};
    if (!gearId || !authorToken || !content?.trim() || !rating) {
      return NextResponse.json({ ok: false, error: "invalid input" }, { status: 400 });
    }
    const review = await createReview({
      gearId,
      productId: productId ?? null,
      authorName: (authorName ?? "").trim() || "匿名用户",
      authorToken,
      rating: Number(rating),
      content: content.trim(),
    });
    return NextResponse.json({ ok: true, review });
  } catch (err) {
    console.error("[reviews.POST]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
