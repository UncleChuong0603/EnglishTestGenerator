import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function getCanonicalUrl(requestUrl: string, host: string | null) {
  if (host?.split(":", 1)[0].toLowerCase() !== "www.toeicgym.net") return null;
  const url = new URL(requestUrl);
  url.protocol = "https:";
  url.hostname = "toeicgym.net";
  url.port = "";
  return url;
}

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0].trim();
  const canonicalUrl = getCanonicalUrl(request.url, forwardedHost ?? request.headers.get("host"));
  return canonicalUrl ? NextResponse.redirect(canonicalUrl, 308) : NextResponse.next();
}
