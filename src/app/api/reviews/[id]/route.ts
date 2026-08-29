import { type NextRequest, NextResponse } from "next/server";
import { deleteReview } from "@/lib/db/queries/reviews";

export const dynamic = "force-dynamic";

// DELETE /api/reviews/:id  body:{ authorToken } — 只能删自己（token 匹配）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { authorToken } = (await request.json().catch(() => ({}))) as { authorToken?: string };
    if (!authorToken) return NextResponse.json({ ok: false, error: "token required" }, { status: 400 });
    const ok = await deleteReview(id, authorToken);
    if (!ok) return NextResponse.json({ ok: false, error: "not yours or not found" }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reviews.DELETE]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
