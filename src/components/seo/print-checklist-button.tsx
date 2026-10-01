"use client";

import type { InterfaceLanguage } from "@/lib/i18n/config";

export function PrintChecklistButton({ locale }: { locale: InterfaceLanguage }) {
  return <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#245a43] px-5 font-bold text-white hover:bg-[#184631] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#245a43]">
    {locale === "vi" ? "In checklist tuần học" : "Print weekly checklist"}
  </button>;
}
