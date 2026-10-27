import {findPublishedMenu} from "@/db/store";
import { failure, json, publicMenu } from "@/lib/menu-server";
import { normalizeMenu } from "@/lib/menu-types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const row = await findPublishedMenu(slug);
    if (!row?.published) return json({ error: "This menu hasn't been published yet." }, 404);
    return json({ menu: publicMenu(normalizeMenu(JSON.parse(row.published))), slug: row.slug, updatedAt: row.publishedAt });
  } catch (error) { return failure(error); }
}
