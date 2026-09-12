"use client";

import { useFormStatus } from "react-dom";

export function StartButton() {
  const { pending } = useFormStatus();
  return <button className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? "Starting practice..." : "Start practice"}</button>;
}
