import {createUpload} from "@/db/store";
import { env } from "cloudflare:workers";
import { owner, checkOrigin, failure, json, ApiError, readLimitedBody } from "@/lib/menu-server";

export const dynamic = "force-dynamic";
const LIMIT = 8 * 1024 * 1024;

function detectMime(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const ownerId = await owner();
    const contentType = request.headers.get("content-type");
    if (!contentType?.startsWith("multipart/form-data")) throw new ApiError(400, "Please upload a photo.");
    if (!env.BUCKET) throw new Error("Image storage unavailable");
    const body = await readLimitedBody(request, LIMIT + 64 * 1024, "Please choose a photo under 8 MB.");
    const form = await new Response(body, { headers: { "content-type": contentType } }).formData();
    if (form.get("rightsConfirmed") !== "true") throw new ApiError(400, "Please confirm that you own or have permission to use this authentic dish photo.");
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > LIMIT) throw new ApiError(400, "Please choose a JPEG, PNG or WebP photo under 8 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectMime(bytes);
    if (!mime || file.type !== mime) throw new ApiError(400, "Please choose a genuine JPEG, PNG or WebP photo.");
    const id = crypto.randomUUID();
    const objectKey = `menus/${id}`;
    await env.BUCKET.put(objectKey, bytes, { httpMetadata: { contentType: mime } });
    const now = new Date().toISOString();
    try { await createUpload({id,ownerId,objectKey,mime,rightsConfirmedAt:now,rightsSource:"restaurant-attested-original-or-licensed",createdAt:now}); }
    catch (error) { await env.BUCKET.delete(objectKey); throw error; }
    return json({ id, url: `/api/images/${id}` }, 201);
  } catch (error) { return failure(error); }
}
