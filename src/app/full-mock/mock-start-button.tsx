"use client";

import { useFormStatus } from "react-dom";

export function MockStartButton({
  label,
  pendingLabel,
  featured = false,
}: {
  label: string;
  pendingLabel: string;
  featured?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={featured
        ? "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-center font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-65 sm:w-auto"
        : "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-center font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-65"}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
