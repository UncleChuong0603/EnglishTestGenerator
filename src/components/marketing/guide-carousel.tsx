"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./guide-carousel.module.css";

export type FeaturedGuide = {
  category: string;
  description: string;
  href: string;
  title: string;
};

type Props = {
  allGuidesLabel: string;
  allGuidesHref: string;
  itemLabel: string;
  items: readonly FeaturedGuide[];
  label: string;
  locale: "vi" | "en";
  nextLabel: string;
  previousLabel: string;
  readLabel: string;
  tone?: "light" | "dark";
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
    <path d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
  </svg>;
}

export function GuideCarousel({ allGuidesHref, allGuidesLabel, itemLabel, items, label, locale, nextLabel, previousLabel, readLabel, tone = "light" }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [range, setRange] = useState({ start: 1, end: 1 });
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(items.length > 1);

  const updatePosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cards = Array.from(viewport.children) as HTMLElement[];
    const origin = cards[0]?.offsetLeft ?? 0;
    const left = viewport.scrollLeft;
    const right = left + viewport.clientWidth;
    const visible = cards
      .map((card, index) => ({ end: card.offsetLeft - origin + card.offsetWidth, index, start: card.offsetLeft - origin, width: card.offsetWidth }))
      .filter(card => Math.min(card.end, right) - Math.max(card.start, left) >= card.width / 2);
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    setRange({
      start: (visible[0]?.index ?? 0) + 1,
      end: (visible.at(-1)?.index ?? 0) + 1,
    });
    setCanGoBack(left > 2);
    setCanGoForward(left < maxScroll - 2);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const scheduleUpdate = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(updatePosition);
    };
    const observer = new ResizeObserver(scheduleUpdate);

    observer.observe(viewport);
    viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", scheduleUpdate);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [updatePosition]);

  function move(direction: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cards = Array.from(viewport.children) as HTMLElement[];
    const origin = cards[0]?.offsetLeft ?? 0;
    const current = cards.findIndex(card => card.offsetLeft - origin >= viewport.scrollLeft - 2);
    const targetIndex = Math.min(items.length - 1, Math.max(0, current + direction));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    viewport.scrollTo({ left: (cards[targetIndex]?.offsetLeft ?? origin) - origin, behavior: reduceMotion ? "auto" : "smooth" });
  }

  const status = range.start === range.end
    ? `${itemLabel} ${range.start} / ${items.length}`
    : `${itemLabel} ${range.start}–${range.end} / ${items.length}`;

  return <div aria-label={label} aria-roledescription="carousel" className={`${styles.carousel} ${tone === "dark" ? styles.dark : ""}`} role="region">
    <div className={styles.toolbar}>
      <p aria-atomic="true" aria-live="polite" className={styles.status}>{status}</p>
      <div className={styles.controls}>
        <button aria-label={previousLabel} disabled={!canGoBack} onClick={() => move(-1)} type="button"><ArrowIcon direction="left" /></button>
        <button aria-label={nextLabel} disabled={!canGoForward} onClick={() => move(1)} type="button"><ArrowIcon direction="right" /></button>
      </div>
    </div>

    <div className={styles.viewport} ref={viewportRef}>
      {items.map((item, index) => <article aria-label={`${index + 1} / ${items.length}`} aria-roledescription="slide" className={styles.slide} key={item.href}>
        <Link className={styles.card} href={item.href} lang={locale}>
          <span className={styles.cardTop}><span>{item.category}</span><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></span>
          <span className={styles.cardBody}>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </span>
          <span className={styles.readMore}>{readLabel}<span aria-hidden="true">↗</span></span>
        </Link>
      </article>)}
    </div>

    <Link className={styles.allGuides} href={allGuidesHref}>{allGuidesLabel}<span aria-hidden="true">↗</span></Link>
  </div>;
}
