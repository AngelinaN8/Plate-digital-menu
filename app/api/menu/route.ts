import {updateMenu} from "@/db/store";
import { owner, checkOrigin, getOwnMenu, menuResponse, validateMenu, failure, json, ApiError, readLimitedBody } from "@/lib/menu-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return json(menuResponse(await getOwnMenu(await owner()))); }
  catch (error) { return failure(error); }
}

export async function PUT(request: Request) {
  try {
    checkOrigin(request);
    const ownerId = await owner();
    const payload = new TextDecoder().decode(await readLimitedBody(request, 500 * 1024, "This menu is too large."));
    const body = JSON.parse(payload);
    if (!body || typeof body !== "object") throw new ApiError(400, "A menu is required.");
    const menu = await validateMenu(body.menu, ownerId);
    await getOwnMenu(ownerId);
    await updateMenu(ownerId,{draft:JSON.stringify(menu),updatedAt:new Date().toISOString()});
    return json(menuResponse(await getOwnMenu(ownerId)));
  } catch (error) { return failure(error); }
}
