"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPractice } from "@/app/practice/actions";
import type { Difficulty } from "@/lib/tests/types";

export function PracticeForm() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("B1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function startPractice() {
    setLoading(true); setMessage("");
    const result = await createPractice(difficulty);
    if (!result.ok) { setMessage(result.message); setLoading(false); return; }
    router.push(`/attempts/${result.id}`);
  }

  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <label className="block text-sm font-semibold">Practice level
      <select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3" onChange={(event) => setDifficulty(event.target.value as Difficulty)} value={difficulty}>
        <option value="B1">B1 — Intermediate</option><option value="B2">B2 — Upper intermediate</option><option value="C1">C1 — Advanced</option>
      </select>
    </label>
    <p className="mt-4 text-sm leading-6 text-slate-600">Each set contains 10 curated questions. Your previous results influence the skill mix while every set stays balanced.</p>
    {message ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{message}</p> : null}
    <button className="mt-7 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-60" disabled={loading} onClick={startPractice} type="button">{loading ? "Building your practice set…" : "Start practice"}</button>
  </div>;
}
