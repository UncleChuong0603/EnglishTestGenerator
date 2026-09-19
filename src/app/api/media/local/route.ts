import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { LocalMediaStorage, safeMediaPath, verifyLocalMediaSignature } from "@/lib/media/local-storage";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const env = getServerEnv(); const url = new URL(request.url); const key = url.searchParams.get("key") ?? ""; const expires = Number(url.searchParams.get("expires")); const signature = url.searchParams.get("signature") ?? "";
  if (env.MEDIA_STORAGE_PROVIDER !== "LOCAL" || !env.LOCAL_MEDIA_ROOT || !env.MEDIA_SIGNING_SECRET || !verifyLocalMediaSignature(key, expires, signature, env.MEDIA_SIGNING_SECRET)) return new NextResponse("Forbidden", { status: 403, headers: { "Cache-Control": "private, no-store" } });
  try {
    safeMediaPath(env.LOCAL_MEDIA_ROOT, key);
    const storage = new LocalMediaStorage(env.LOCAL_MEDIA_ROOT, env.APP_URL, env.MEDIA_SIGNING_SECRET);
    if (!await storage.exists(key)) return new NextResponse("Not found", { status: 404 });
  } catch { return new NextResponse("Not found", { status: 404 }); }
  return new NextResponse(null, { status: 200, headers: { "X-Accel-Redirect": `/protected-media/${key.split("/").map(encodeURIComponent).join("/")}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
