import { type NextRequest, NextResponse } from "next/server";
import { castVote } from "@/lib/db/queries/reviews";

export const dynamic = "force-dynamic";

// POST /api/reviews/:id/vote  body:{ voterToken, value: 1 | -1 } — 点赞/点踩（同值再点=取消）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { voterToken, value } = (await request.json()) as { voterToken?: string; value?: number };
    if (!voterToken || (value !== 1 && value !== -1)) {
      return NextResponse.json({ ok: false, error: "invalid input" }, { status: 400 });
    }
    const myVote = await castVote(id, voterToken, value as 1 | -1);
    return NextResponse.json({ ok: true, myVote });
  } catch (err) {
    console.error("[vote.POST]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
