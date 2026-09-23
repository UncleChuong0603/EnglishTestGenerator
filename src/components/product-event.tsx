"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const routes = { "/": "landing_viewed", "/try": "try_viewed", "/pricing": "pricing_viewed", "/sign-up": "signup_started", "/challenge/part-5": "challenge_viewed" } as const;
export function ProductEvent() {
  const pathname = usePathname();
  const route = pathname as keyof typeof routes;
  const eventName = routes[route];
  useEffect(() => {
    if (!eventName) return;
    const bucket = Math.floor(Date.now() / 1_800_000);
    const key = `tg:${eventName}:${bucket}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch("/api/analytics/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventName, route, deduplicationKey: `${eventName}:${bucket}:${crypto.randomUUID()}` }), keepalive: true }).catch(() => undefined);
  }, [eventName, route]);
  return null;
}
