"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const focusRoute = /^\/(practice|diagnostic|demo-test|full-mock|ranking\/challenges\/run|challenge\/part-5)\/[^/]+/;

export function MotionOrchestrator() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const level = pathname.startsWith("/admin")
      ? "minimal"
      : focusRoute.test(pathname)
        ? "focus"
        : pathname === "/" || pathname === "/ve-toeic-gym" || pathname === "/pricing" || pathname.startsWith("/toeic") || pathname.startsWith("/blog")
          ? "rich"
          : "product";
    root.dataset.motionLevel = level;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || level === "focus" || level === "minimal") {
      root.dataset.motionReady = "true";
      return () => {
        delete root.dataset.motionLevel;
        delete root.dataset.motionReady;
      };
    }

    const main = document.querySelector("main");
    if (!main) return;
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
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
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
    };
  }, [pathname]);

  return null;
}
