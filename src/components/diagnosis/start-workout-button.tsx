"use client";

import { useFormStatus } from "react-dom";

export function StartWorkoutButton({ idle, pending }: { idle: string; pending: string }) {
  const status = useFormStatus();
  return <button aria-disabled={status.pending} className="min-h-12 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-70" disabled={status.pending} type="submit">{status.pending ? pending : idle}</button>;
}
