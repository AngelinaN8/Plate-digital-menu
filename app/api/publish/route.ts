import {updateMenu} from "@/db/store";
import { owner, checkOrigin, getOwnMenu, menuResponse, failure, json } from "@/lib/menu-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const ownerId = await owner();
    const row = await getOwnMenu(ownerId);
    await updateMenu(ownerId,{published:row.draft,publishedAt:new Date().toISOString()});
    const next = await getOwnMenu(ownerId);
    return json({ ...menuResponse(next), url: `/menu/${next.slug}` });
  } catch (error) { return failure(error); }
}
