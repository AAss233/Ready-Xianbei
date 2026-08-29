import { type NextRequest, NextResponse } from "next/server";
import {
  getAdminContent,
  saveAdminContent,
  deleteAdminContent,
} from "@/lib/db/queries/admin-content";

// 系统级公共内容读写（items / quiz）。demo 场景：读写不强制登录。
// key 由路由段决定，白名单校验。
const ALLOWED = new Set(["items", "quiz"]);

export const dynamic = "force-dynamic";

function guard(key: string) {
  return ALLOWED.has(key);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!guard(key)) return NextResponse.json({ ok: false }, { status: 404 });
  const data = await getAdminContent<unknown>(key);
  return NextResponse.json(
    { ok: true, data },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!guard(key)) return NextResponse.json({ ok: false }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.data)) {
    return NextResponse.json({ ok: false, error: "data must be array" }, { status: 400 });
  }
  await saveAdminContent(key, body.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!guard(key)) return NextResponse.json({ ok: false }, { status: 404 });
  await deleteAdminContent(key);
  return NextResponse.json({ ok: true });
}
