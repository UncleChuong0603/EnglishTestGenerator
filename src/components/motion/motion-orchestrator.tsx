"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const focusRoute = /^\/(practice|diagnostic|demo-test|full-mock|ranking\/challenges\/run|challenge\/part-5)\/[^/]+/;
const marketingRoute = /^\/(?:$|ve-toeic-gym(?:\/|$)|pricing(?:\/|$)|toeic(?:\/|$)|luyen-thi-toeic-online(?:\/|$)|thi-thu-toeic-online(?:\/|$))/;

export function MotionOrchestrator() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const surface = pathname.startsWith("/admin")
      ? "admin"
      : focusRoute.test(pathname)
        ? "focus"
        : marketingRoute.test(pathname)
          ? "marketing"
          : "product";
    const level = pathname.startsWith("/admin")
      ? "minimal"
      : focusRoute.test(pathname)
        ? "focus"
        : pathname === "/" || pathname === "/ve-toeic-gym" || pathname === "/pricing" || pathname.startsWith("/toeic")
          ? "rich"
          : "product";
    root.dataset.uiSurface = surface;
    root.dataset.motionLevel = level;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || level === "focus" || level === "minimal") {
      root.dataset.motionReady = "true";
      return () => {
        delete root.dataset.motionLevel;
        delete root.dataset.motionReady;
        delete root.dataset.uiSurface;
      };
    }

    const main = document.querySelector("main");
    if (!main) {
      root.dataset.motionReady = "true";
      return () => {
        delete root.dataset.motionLevel;
        delete root.dataset.motionReady;
        delete root.dataset.uiSurface;
      };
    }
    const selector = level === "rich"
      ? ":scope > section, :scope > article > section, [data-motion-reveal]"
      : ":scope > div > header, :scope > div > section, [data-motion-reveal]";
    const targets = Array.from(main.querySelectorAll<HTMLElement>(selector)).slice(0, level === "rich" ? 20 : 6);
    targets.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--motion-order", String(Math.min(index, 4)));
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-reveal-visible");
        observer.unobserve(entry.target);
      });
    }, level === "rich"
      ? { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
      : { rootMargin: "0px 0px -5% 0px", threshold: 0.01 });
    targets.forEach((element) => observer.observe(element));
    requestAnimationFrame(() => { root.dataset.motionReady = "true"; });

    let frame = 0;
    const updateHeader = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(".public-header")?.toggleAttribute("data-scrolled", window.scrollY > 24);
      });
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateHeader);
      targets.forEach((element) => {
        element.classList.remove("motion-reveal", "motion-reveal-visible");
        element.style.removeProperty("--motion-order");
      });
      delete root.dataset.motionLevel;
      delete root.dataset.motionReady;
      delete root.dataset.uiSurface;
    };
  }, [pathname]);

  return null;
}
