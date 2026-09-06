"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startAttempt } from "@/app/tests/actions";

export function StartTestButton({ testId }: { testId: string }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function start() { setLoading(true); setError(""); const result = await startAttempt(testId); if (!result.ok) { setError(result.message); setLoading(false); return; } router.push(`/attempts/${result.id}`); }
  return <div>{error ? <p className="mb-3 text-sm text-red-700" role="alert">{error}</p> : null}<button className="rounded-xl bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-60" disabled={loading} onClick={start} type="button">{loading ? "Starting…" : "Start practice"}</button></div>;
}
