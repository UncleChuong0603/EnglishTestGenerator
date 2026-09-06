"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateTest } from "@/app/tests/actions";
import type { Difficulty, Focus } from "@/lib/tests/types";

export function GenerationForm() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("B1");
  const [focus, setFocus] = useState<Focus>("mixed");
  const [questionCount, setQuestionCount] = useState<10 | 20>(10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true); setMessage("");
    const result = await generateTest({ difficulty, focus, questionCount });
    if (!result.ok) { setMessage(result.message); setLoading(false); return; }
    router.push(`/tests/${result.id}`);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 sm:grid-cols-3">
        <label className="text-sm font-semibold">Difficulty
          <select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3" onChange={(e) => setDifficulty(e.target.value as Difficulty)} value={difficulty}>
            <option value="B1">B1 — Intermediate</option><option value="B2">B2 — Upper intermediate</option><option value="C1">C1 — Advanced</option>
          </select>
        </label>
        <label className="text-sm font-semibold">Questions
          <select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3" onChange={(e) => setQuestionCount(Number(e.target.value) as 10 | 20)} value={questionCount}>
            <option value={10}>10 questions</option><option value={20}>20 questions</option>
          </select>
        </label>
        <label className="text-sm font-semibold">Focus
          <select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3" onChange={(e) => setFocus(e.target.value as Focus)} value={focus}>
            <option value="mixed">Mixed skills</option><option value="vocabulary">Vocabulary</option><option value="main_idea">Main idea</option><option value="detail">Detail</option><option value="inference">Inference</option>
          </select>
        </label>
      </div>
      {message ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{message}</p> : null}
      <button className="mt-7 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} onClick={handleGenerate} type="button">
        {loading ? "Generating your reading test…" : "Generate test"}
      </button>
      <p className="mt-3 text-sm text-slate-500">Generation can take up to a minute. Keep this page open.</p>
    </div>
  );
}
