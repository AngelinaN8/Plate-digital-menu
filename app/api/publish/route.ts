import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { menus } from "@/db/schema";
import { owner, checkOrigin, getOwnMenu, menuResponse, failure, json } from "@/lib/menu-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const ownerId = await owner();
    const row = await getOwnMenu(ownerId);
    await getDb().update(menus).set({ published: row.draft, publishedAt: new Date().toISOString() }).where(eq(menus.ownerId, ownerId));
    const next = await getOwnMenu(ownerId);
    return json({ ...menuResponse(next), url: `/menu/${next.slug}` });
  } catch (error) { return failure(error); }
}
