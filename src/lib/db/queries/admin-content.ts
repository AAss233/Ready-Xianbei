import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { adminContent } from "@/lib/db/schema/admin-content";

// 读取某 key 的 JSON 快照；不存在返回 null（调用方回退内置默认）。
export async function getAdminContent<T>(key: string): Promise<T | null> {
  const rows = await db
    .select()
    .from(adminContent)
    .where(eq(adminContent.key, key))
    .limit(1);
  return rows.length ? (rows[0].data as T) : null;
}

// 写入/覆盖某 key 的 JSON 快照（upsert）。
export async function saveAdminContent(key: string, data: unknown): Promise<void> {
  await db
    .insert(adminContent)
    .values({ key, data: data as object, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: adminContent.key,
      set: { data: data as object, updatedAt: new Date() },
    });
}

// 删除某 key（后台「重置为默认」用）。
export async function deleteAdminContent(key: string): Promise<void> {
  await db.delete(adminContent).where(eq(adminContent.key, key));
}
