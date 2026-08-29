import { type NextRequest, NextResponse } from "next/server";
import { productDislikeStats } from "@/lib/db/queries/reviews";

export const dynamic = "force-dynamic";

// GET /api/products/:id/dislike — 该商品的点踩统计 + 「即将下架」标识（踩率>70% 且 ≥5 票）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const stats = await productDislikeStats(id);
    return NextResponse.json({ ok: true, ...stats });
  } catch (err) {
    console.error("[product.dislike.GET]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
