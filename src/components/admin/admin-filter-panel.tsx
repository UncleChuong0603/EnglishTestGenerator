"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";

type AdminFilterPanelProps = {
  activeCount?: number;
  children: ReactNode;
  className?: string;
  clearHref?: string;
  clearLabel?: string;
  label: string;
  summary?: string;
};

export function AdminFilterPanel({
  activeCount = 0,
  children,
  className = "mt-6",
  clearHref,
  clearLabel = "Clear filters",
  label,
  summary,
}: AdminFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className={`group inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-black shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            open
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-800 hover:border-teal-600 hover:text-teal-800"
          }`}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          </svg>
          <span>{label}</span>
          {activeCount > 0 ? (
            <span className={`grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-xs ${open ? "bg-white text-slate-900" : "bg-teal-100 text-teal-900"}`}>
              {activeCount}
            </span>
          ) : null}
          <svg
            aria-hidden="true"
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path d="m7 10 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
        {summary ? <span className="text-sm font-semibold text-slate-600">{summary}</span> : null}
        {activeCount > 0 && clearHref ? (
          <Link className="text-sm font-bold text-teal-800 underline-offset-4 hover:underline" href={clearHref}>
            {clearLabel}
          </Link>
        ) : null}
      </div>
      <div aria-label={label} className="mt-3" hidden={!open} id={panelId} role="region">
        {children}
      </div>
    </div>
  );
}
