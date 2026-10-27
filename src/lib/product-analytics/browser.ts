"use client";

import type { z } from "zod";
import type { browserEventSchema } from "./catalog";

type BrowserEvent = z.infer<typeof browserEventSchema>;

export function trackBrowserProductEvent(
  eventName: BrowserEvent["eventName"],
  route: string,
  properties?: BrowserEvent["properties"],
) {
  try {
    const key = `tg:${eventName}:${route}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventName,
        route,
        properties,
        deduplicationKey: `${eventName}:${crypto.randomUUID()}`,
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics must never interrupt practice.
  }
}

export function acquisitionSource(): Record<string, string | number | boolean | null> {
  if (!document.referrer) return { acquisitionSource: "direct" };
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) return { acquisitionSource: "internal" };
    const host = referrer.hostname.toLowerCase().replace(/^www\./, "").slice(0, 120);
    const source = /(^|\.)(google|bing|yahoo|duckduckgo|coccoc)\./.test(host)
      ? "organic_search"
      : /(^|\.)(facebook|instagram|threads|tiktok|linkedin|x|twitter)\./.test(host)
        ? "social"
        : "referral";
    return { acquisitionSource: source, referrerHost: host };
  } catch {
    return { acquisitionSource: "unknown" };
  }
}
