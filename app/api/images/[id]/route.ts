import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { menus, uploads } from "@/db/schema";
import { failure, json } from "@/lib/menu-server";
import type { Menu } from "@/lib/menu-types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const upload = await db.select().from(uploads).where(eq(uploads.id, id)).get();
    if (!upload || !env.BUCKET) return json({ error: "Photo not found." }, 404);
    const user = await getChatGPTUser();
    let allowed = user?.userId === upload.ownerId;
    if (!allowed) {
      const menu = await db.select().from(menus).where(eq(menus.ownerId, upload.ownerId)).get();
      if (menu?.published) { const m=JSON.parse(menu.published) as Menu; const path=`/api/images/${id}`; allowed=m.dishes.some(dish=>dish.image===path)||m.promotion?.image===path||m.events?.some(e=>e.image===path); }
    }
    if (!allowed) return json({ error: "Photo not found." }, 404);
    const object = await env.BUCKET.get(upload.objectKey);
    if (!object) return json({ error: "Photo not found." }, 404);
    return new Response(object.body, { headers: { "Content-Type": upload.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
  } catch (error) { return failure(error); }
}
