import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { menus, uploads } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { DEFAULT_MENU, normalizeMenu, type Menu, type Dish, type MenuEvent, type Weekday } from "./menu-types";

import { parseNutrition } from "./nutrition";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function owner() {
  const user = await getChatGPTUser();
  if (!user) throw new ApiError(401, "Sign in to manage your menu.");
  return user.userId;
}

export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new ApiError(403, "Please make this change from the menu website.");
  }
}

export async function readLimitedBody(request: Request, limit: number, message: string): Promise<ArrayBuffer> {
  if (Number(request.headers.get("content-length") || 0) > limit) throw new ApiError(413, message);
  const reader = request.body?.getReader();
  if (!reader) return new ArrayBuffer(0);
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) {
      await reader.cancel();
      throw new ApiError(413, message);
    }
    chunks.push(value);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result.buffer;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export function failure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof SyntaxError) return json({ error: "Please send a valid menu." }, 400);
  console.error("Menu request failed", error instanceof Error ? error.message : "Unknown error");
  return json({ error: "We couldn't save that change. Please try again." }, 500);
}

export async function getOwnMenu(ownerId: string) {
  const db = getDb();
  let row = await db.select().from(menus).where(eq(menus.ownerId, ownerId)).get();
  if (!row) {
    await db.insert(menus).values({ ownerId, slug: `menu-${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`, draft: JSON.stringify(DEFAULT_MENU), updatedAt: new Date().toISOString() }).onConflictDoNothing();
    row = await db.select().from(menus).where(eq(menus.ownerId, ownerId)).get();
  }
  if (!row) throw new Error("Unable to create menu");
  return row;
}

export function menuResponse(row: typeof menus.$inferSelect) {
  return { menu: normalizeMenu(JSON.parse(row.draft) as Menu), slug: row.slug, published: Boolean(row.published), updatedAt: row.updatedAt };
}

function textValue(value: unknown, name: string, max: number, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new ApiError(400, `Please check ${name}.`);
  return value.trim();
}

export async function validateMenu(value: unknown, ownerId: string): Promise<Menu> {
  if (!value || typeof value !== "object") throw new ApiError(400, "A menu is required.");
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.dishes) || raw.dishes.length > 250) throw new ApiError(400, "A menu can contain up to 250 dishes.");
  const currency = textValue(raw.currency, "currency", 3, true);
  if (!/^[A-Z]{3}$/.test(currency)) throw new ApiError(400, "Use a three-letter currency code, such as AED.");
  const accent = textValue(raw.accent, "brand colour", 7, true);
  if (!/^#[a-fA-F0-9]{6}$/.test(accent)) throw new ApiError(400, "Choose a valid brand colour.");
  const seen = new Set<string>();
  const dishes: Dish[] = [];
  for (const item of raw.dishes) {
    if (!item || typeof item !== "object") throw new ApiError(400, "Please check your dishes.");
    const d = item as Record<string, unknown>;
    const id = textValue(d.id, "dish identifier", 80, true);
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || seen.has(id)) throw new ApiError(400, "Every dish needs a unique identifier.");
    seen.add(id);
    if (typeof d.available !== "boolean") throw new ApiError(400, "Please check dish availability.");
    if (d.price !== null && (typeof d.price !== "number" || !Number.isFinite(d.price) || d.price < 0 || d.price > 100000)) throw new ApiError(400, "Please enter a valid dish price.");
    if (d.price === null && d.available) throw new ApiError(400, "Add a price before making this dish available.");
    if (!Array.isArray(d.allergens) || d.allergens.length > 20) throw new ApiError(400, "Please check allergens.");
    const image = await validatePhoto(d.image, ownerId);
    let nutrition;
    try { nutrition = parseNutrition(d.nutrition); } catch (e) { throw new ApiError(400, (e as Error).message); }
    const recipe = d.recipe === undefined ? "" : textValue(d.recipe, "recipe", 5000);
    const recipeServings = d.recipeServings === undefined ? 1 : d.recipeServings;
    if (typeof recipeServings !== "number" || !Number.isFinite(recipeServings) || recipeServings < 1 || recipeServings > 1000) throw new ApiError(400, "Enter the number of servings in this recipe.");
    dishes.push({ id, name: textValue(d.name, "dish name", 150, true), category: textValue(d.category, "category", 80, true), price: d.price === null ? null : Math.round((d.price as number) * 100) / 100, description: textValue(d.description, "description", 1500), portion: textValue(d.portion, "portion", 200), preparation: textValue(d.preparation, "preparation", 500), allergens: d.allergens.map(a => textValue(a, "allergen", 60, true)), image, available: d.available, nutrition, recipe, recipeServings });
  }
  const template = raw.template === undefined ? "editorial" : raw.template;
  if (template !== "editorial" && template !== "gallery" && template !== "classic") throw new ApiError(400, "Choose a valid menu template.");
  const featured = raw.featuredDishIds === undefined ? [] : raw.featuredDishIds;
  if (!Array.isArray(featured) || featured.length > 10 || featured.some(id => typeof id !== "string" || !seen.has(id)) || new Set(featured).size !== featured.length) throw new ApiError(400, "Choose up to 10 different specialties from your menu.");
  let promotion: Menu["promotion"] = { enabled: false, title: "", description: "", days: [] };
  if (raw.promotion !== undefined) {
    if (!raw.promotion || typeof raw.promotion !== "object" || Array.isArray(raw.promotion)) throw new ApiError(400, "Please check your weekly promotion.");
    const p = raw.promotion as Record<string, unknown>;
    if (typeof p.enabled !== "boolean") throw new ApiError(400, "Please check promotion availability.");
    const allowedDays = new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    if (!Array.isArray(p.days) || p.days.length > 7 || p.days.some(day => typeof day !== "string" || !allowedDays.has(day)) || new Set(p.days).size !== p.days.length) throw new ApiError(400, "Choose valid, different promotion days.");
    promotion = { enabled: p.enabled, title: textValue(p.title, "promotion title", 100, p.enabled), description: textValue(p.description, "promotion description", 500), days: p.days as Menu["promotion"]["days"], image: await validatePhoto(p.image ?? "", ownerId), afterCategory: textValue(p.afterCategory ?? "", "banner position", 80) };
  }
  const rawEvents = raw.events === undefined ? [] : raw.events;
  if (!Array.isArray(rawEvents) || rawEvents.length > 12) throw new ApiError(400, "Add up to 12 events to your menu.");
  const eventIds = new Set<string>();
  const events: MenuEvent[] = await Promise.all(rawEvents.map(async value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(400, "Please check your events.");
    const event = value as Record<string, unknown>;
    const id = textValue(event.id, "event identifier", 80, true);
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || eventIds.has(id)) throw new ApiError(400, "Every event needs a unique identifier.");
    eventIds.add(id);
    if (typeof event.enabled !== "boolean") throw new ApiError(400, "Please check event availability.");
    if (event.recurrence !== "weekly" && event.recurrence !== "last-weekday-monthly" && event.recurrence !== "one-off") throw new ApiError(400, "Choose a valid event schedule.");
    const allowedDays = new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    if (!Array.isArray(event.days) || event.days.length > 7 || event.days.some(day => typeof day !== "string" || !allowedDays.has(day)) || new Set(event.days).size !== event.days.length) throw new ApiError(400, "Choose valid event weekdays.");
    if ((event.recurrence === "weekly" && event.days.length === 0) || (event.recurrence === "last-weekday-monthly" && event.days.length !== 1)) throw new ApiError(400, "Choose the weekday for this recurring event.");
    const date = textValue(event.date, "event date", 10);
    if (date || event.recurrence === "one-off") {
      const parsed = new Date(`${date}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new ApiError(400, "Choose a valid calendar date for this event.");
    }
    const startTime = textValue(event.startTime, "event start time", 5);
    const endTime = textValue(event.endTime, "event end time", 5);
    for (const time of [startTime, endTime]) if (time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new ApiError(400, "Use a valid event time, such as 17:00.");
    const timezone = textValue(event.timezone, "event timezone", 80, true);
    try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format(); }
    catch { throw new ApiError(400, "Choose a valid event timezone."); }
    return { id, title: textValue(event.title, "event title", 100, event.enabled), description: textValue(event.description, "event description", 1000), enabled: event.enabled, recurrence: event.recurrence, days: event.days as Weekday[], date, startTime, endTime, timezone, image: await validatePhoto(event.image ?? "", ownerId), afterCategory: textValue(event.afterCategory ?? "", "event banner position", 80) };
  }));
  return { restaurantName: textValue(raw.restaurantName, "restaurant name", 150, true), tagline: textValue(raw.tagline, "tagline", 300), currency, accent, template, featuredDishIds: featured as string[], promotion, events, dishes };
}

export async function validatePhoto(value: unknown, ownerId: string) {
  const image = textValue(value, "photo", 2048);
    if (image.startsWith("/api/images/")) {
      const imageId = image.slice("/api/images/".length);
      const upload = await getDb().select().from(uploads).where(and(eq(uploads.id, imageId), eq(uploads.ownerId, ownerId))).get();
      if (!upload) throw new ApiError(400, "Please upload your own photo for this dish.");
  } else if (image.startsWith("/images/") && DEFAULT_MENU.dishes.some(dish => dish.image === image)) {
      // Bundled illustrative demo asset; arbitrary local paths are not accepted.
  } else if (image) {
      let url: URL;
      try { url = new URL(image); } catch { throw new ApiError(400, "Use an HTTPS photo address."); }
      if (url.protocol !== "https:" || url.username || url.password) throw new ApiError(400, "Use an HTTPS photo address.");
  }
  return image;
}

// Recipes and estimation notes remain in the restaurant workspace.
export function publicMenu(menu: Menu): Menu {
  return { ...menu, dishes: menu.dishes.map(({recipe, recipeServings, ...dish}) => ({ ...dish, nutrition: dish.nutrition?.reviewed && dish.nutrition.visible ? {...dish.nutrition, notes: ""} : null })) };
}
