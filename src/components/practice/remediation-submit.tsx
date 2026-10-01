"use client";

import { useFormStatus } from "react-dom";

export function RemediationSubmit({ locale }: { locale: "vi" | "en" }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      disabled={pending}
      type="submit"
    >
      {pending
        ? locale === "vi"
          ? "Đang tạo bài ôn…"
          : "Building review…"
        : locale === "vi"
          ? "Ôn dạng này"
          : "Review this skill"}
    </button>
  );
}
