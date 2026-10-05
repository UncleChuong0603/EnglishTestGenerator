"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";

type MistakeFilterPanelProps = {
  activeCount: number;
  children: ReactNode;
  clearHref: string;
  clearLabel: string;
  label: string;
};

export function MistakeFilterPanel({
  activeCount,
  children,
  clearHref,
  clearLabel,
  label,
}: MistakeFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            open
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-800 hover:border-teal-600 hover:text-teal-800"
          }`}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          <span>{label}</span>
          {activeCount > 0 ? (
            <span
              className={`grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-xs ${
                open ? "bg-white text-slate-900" : "bg-teal-100 text-teal-900"
              }`}
            >
              {activeCount}
            </span>
          ) : null}
          <svg
            aria-hidden="true"
            className={`size-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m7 10 5 5 5-5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        {activeCount > 0 ? (
          <Link
            className="inline-flex min-h-11 items-center text-sm font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            href={clearHref}
          >
            {clearLabel}
          </Link>
        ) : null}
      </div>
      <div
        aria-label={label}
        className="mt-3 rounded-2xl border border-slate-200 bg-white p-4"
        hidden={!open}
        id={panelId}
        role="region"
      >
        {children}
      </div>
    </div>
  );
}
