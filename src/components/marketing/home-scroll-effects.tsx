"use client";

import { useEffect } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function HomeScrollEffects({ locale }: { locale: string }) {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>("[data-home-page]");
    if (!page) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const hero = page.querySelector<HTMLElement>("[data-home-hero]");
    const heroVisual = page.querySelector<HTMLElement>("[data-home-hero-visual]");
    const progress = page.querySelector<HTMLElement>("[data-home-progress-value]");
    const roadmap = page.querySelector<HTMLElement>("[data-home-roadmap]");
    const roadmapItems = Array.from(page.querySelectorAll<HTMLElement>("[data-home-roadmap-item]"));
    const revealTargets = Array.from(page.querySelectorAll<HTMLElement>("[data-home-reveal]"));

    if (reduceMotion.matches) {
      page.dataset.homeMotion = "reduced";
      revealTargets.forEach((element) => { element.dataset.homeVisible = "true"; });
      roadmapItems.forEach((element) => { element.dataset.homeActive = "true"; });
      return () => {
        revealTargets.forEach((element) => { delete element.dataset.homeVisible; });
        roadmapItems.forEach((element) => { delete element.dataset.homeActive; });
        delete page.dataset.homeMotion;
      };
    }

    page.dataset.homeMotion = "enhanced";

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.homeVisible = "true";
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    revealTargets.forEach((element) => revealObserver.observe(element));

    let scrollFrame = 0;
    const updateScrollEffects = () => {
      scrollFrame = 0;
      const viewportHeight = window.innerHeight;
      const scrollableHeight = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
      const pageProgress = clamp(window.scrollY / scrollableHeight);
      progress?.style.setProperty("transform", `scaleX(${pageProgress})`);

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const heroProgress = clamp(-rect.top / Math.max(rect.height, 1));
        hero.style.setProperty("--hero-grid-y", `${heroProgress * 28}px`);
        hero.style.setProperty("--hero-circle-y", `${heroProgress * -18}px`);
        hero.style.setProperty("--hero-circle-scale", (1 + heroProgress * 0.08).toFixed(4));
        hero.style.setProperty("--hero-orbit-y", `${heroProgress * -42}px`);
        hero.style.setProperty("--hero-orbit-rotate", `${heroProgress * 8}deg`);
        hero.style.setProperty("--hero-copy-y", `${heroProgress * -12}px`);
        hero.style.setProperty("--hero-sample-y", `${heroProgress * -24}px`);
        hero.style.setProperty("--hero-line-scale", (0.4 + heroProgress * 0.6).toFixed(4));
      }

      if (roadmap) {
        const rect = roadmap.getBoundingClientRect();
        const travel = rect.height + viewportHeight * 0.45;
        const roadmapProgress = clamp((viewportHeight * 0.72 - rect.top) / Math.max(travel, 1));
        roadmap.style.setProperty("--roadmap-progress", roadmapProgress.toFixed(4));
        const activeCount = Math.min(roadmapItems.length, Math.ceil(roadmapProgress * roadmapItems.length));
        roadmapItems.forEach((item, index) => {
          if (index < activeCount) item.dataset.homeActive = "true";
          else delete item.dataset.homeActive;
        });
      }
    };

    const requestScrollUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollEffects);
    };

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });
    updateScrollEffects();

    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const commitPointer = () => {
      pointerFrame = 0;
      heroVisual?.style.setProperty("--pointer-x-shift", `${pointerX * 7}px`);
      heroVisual?.style.setProperty("--pointer-y-shift", `${pointerY * 5}px`);
      heroVisual?.style.setProperty("--pointer-rotate-x", `${pointerY * -1}deg`);
      heroVisual?.style.setProperty("--pointer-rotate-y", `${pointerX * 1.25}deg`);
    };
    const updatePointer = (event: PointerEvent) => {
      if (!heroVisual || !finePointer.matches) return;
      const rect = heroVisual.getBoundingClientRect();
      pointerX = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
      pointerY = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(commitPointer);
    };
    const resetPointer = () => {
      pointerX = 0;
      pointerY = 0;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(commitPointer);
    };

    heroVisual?.addEventListener("pointermove", updatePointer, { passive: true });
    heroVisual?.addEventListener("pointerleave", resetPointer);

    return () => {
      revealObserver.disconnect();
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(pointerFrame);
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", requestScrollUpdate);
      heroVisual?.removeEventListener("pointermove", updatePointer);
      heroVisual?.removeEventListener("pointerleave", resetPointer);
      revealTargets.forEach((element) => { delete element.dataset.homeVisible; });
      roadmapItems.forEach((element) => { delete element.dataset.homeActive; });
      ["--hero-grid-y", "--hero-circle-y", "--hero-circle-scale", "--hero-orbit-y", "--hero-orbit-rotate", "--hero-copy-y", "--hero-sample-y", "--hero-line-scale"].forEach((property) => hero?.style.removeProperty(property));
      ["--pointer-x-shift", "--pointer-y-shift", "--pointer-rotate-x", "--pointer-rotate-y"].forEach((property) => heroVisual?.style.removeProperty(property));
      roadmap?.style.removeProperty("--roadmap-progress");
      progress?.style.removeProperty("transform");
      delete page.dataset.homeMotion;
    };
  }, [locale]);

  return null;
}
