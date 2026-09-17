import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getFullMockResult, getFullMockRun } from "@/lib/full-mock/service";

export default async function FullMockResultPage({ params }: { params: Promise<{ runId: string }> }) {
  const [{ runId }, user] = await Promise.all([params, requireUser()]); const [result, run] = await Promise.all([getFullMockResult(runId, user.id), getFullMockRun(runId, user.id)]);
  if (!result || !run) redirect(`/full-mock/${runId}`);
  const cards = [{ label: "Listening", value: result.listening }, { label: "Reading", value: result.reading }, { label: "Tổng", value: result.overall }];
  return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-4xl"><h1 className="text-3xl font-black">Kết quả Full Mock</h1>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">{cards.map(({ label, value }) => <article className="rounded-2xl bg-white p-5" key={label}><h2 className="font-black">{label}</h2><p className="mt-2 text-3xl font-black">{value.correct}/{value.attempted}</p><p>{value.accuracy}%</p></article>)}</div>
    <h2 className="mt-8 text-xl font-black">Theo Part</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{result.parts.map((part) => { const session = run.children.find((child) => child.part === part.part); return <article className="rounded-xl bg-white p-4" key={part.part}><p>Part {part.part}: <strong>{part.correct}/{part.attempted}</strong> · {part.accuracy}%</p>{session ? <Link className="mt-2 inline-flex font-bold text-teal-700" href={`/practice/${session.id}/results`}>Xem đáp án và giải thích</Link> : null}</article>; })}</div>
    <p className="mt-8 text-sm text-slate-600">Kết quả thô; không phải điểm TOEIC quy đổi. Không có điểm /495 hoặc /990.</p>
  </div></main>;
}
