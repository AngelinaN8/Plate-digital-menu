import {updateMenu} from "@/db/store";
import { ApiError, checkOrigin, failure, getOwnMenu, json, menuResponse, owner, readLimitedBody } from "@/lib/menu-server";
import type { Menu } from "@/lib/menu-types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const ownerId = await owner();
    const body = JSON.parse(new TextDecoder().decode(await readLimitedBody(request, 1024, "This availability update is too large.")));
    if (!body || typeof body !== "object" || typeof body.dishId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(body.dishId) || typeof body.available !== "boolean") throw new ApiError(400, "Choose a dish and its availability.");
    for (let attempt = 0; attempt < 3; attempt++) {
      const row = await getOwnMenu(ownerId);
      const draft = JSON.parse(row.draft) as Menu;
      const dish = draft.dishes.find(item => item.id === body.dishId);
      if (!dish) throw new ApiError(404, "This dish is no longer in your menu.");
      if (body.available && dish.price === null) throw new ApiError(400, "Add a price before making this dish available.");
      dish.available = body.available;
      let published = row.published;
      let publishedChanged = false;
      if (published) {
        const publishedMenu = JSON.parse(published) as Menu;
        const publishedDish = publishedMenu.dishes.find(item => item.id === body.dishId);
        if (publishedDish && body.available && publishedDish.price === null) throw new ApiError(400, "Publish the dish price before making it available to guests.");
        if (publishedDish && publishedDish.available !== body.available) {
          publishedDish.available = body.available;
          published = JSON.stringify(publishedMenu);
          publishedChanged = true;
        }
      }
      const now = new Date().toISOString();
      // Compare both JSON snapshots before writing so a concurrent save or
      // publish cannot be silently overwritten by this narrow update.
      const updated = await updateMenu(ownerId,{draft:JSON.stringify(draft),published,updatedAt:now,publishedAt:publishedChanged?now:row.publishedAt},{draft:row.draft,published:row.published});
      if (updated) return json({ ...menuResponse(updated), publishedChanged });
    }
    throw new ApiError(409, "Your menu changed while updating availability. Please try again.");
  } catch (error) { return failure(error); }
}
