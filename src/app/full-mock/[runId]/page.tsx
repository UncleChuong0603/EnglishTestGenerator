import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { MockAudio, MockExitLink, MockNavigationGuard, MockTimer } from "@/components/full-mock/mock-controls";
import { getActiveFullMockSection, getFullMockRun } from "@/lib/full-mock/service";
import { finishMockSection, saveMockAnswer } from "../actions";

export default async function FullMockRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const [{ runId }, user] = await Promise.all([params, requireUser()]);
  const run = await getFullMockRun(runId, user.id);
  if (!run) notFound();
  if (run.status === "COMPLETED") redirect(`/full-mock/${runId}/results`);
  const active = await getActiveFullMockSection(runId, user.id);
  if (!active) notFound();
  const sectionSessions = run.children.filter((session) => session.skillArea === run.status);
  const total = sectionSessions.reduce((count, session) => count + session.questionCount, 0);
  const answered = active.sessions.reduce((count, item) => count + Object.values(item.answers).filter(Boolean).length, 0);
  const parts = sectionSessions.map((session) => session.part).filter((part): part is number => part !== null);
  const partLabel = parts.length ? `Part ${Math.min(...parts)}${Math.max(...parts) !== Math.min(...parts) ? `–${Math.max(...parts)}` : ""}` : "";
  const submitLabel = run.mode === "FULL" && run.status === "LISTENING" ? "Hoàn tất Listening" : "Nộp bài";
  return <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-4 pb-10 text-slate-900 sm:px-6"><MockNavigationGuard/><div className="mx-auto max-w-6xl">
    <header className="sticky top-0 z-20 rounded-2xl bg-slate-900 p-3 text-white shadow-lg sm:p-4"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-teal-300">{run.status === "LISTENING" ? "Listening" : "Reading"}{partLabel ? ` · ${partLabel}` : ""}</p><h1 className="mt-0.5 text-base font-black sm:text-lg">{active.expired ? "Hết giờ" : `${answered}/${total} câu đã lưu`}</h1></div><div className="font-mono text-lg font-black tabular-nums" aria-label="Thời gian còn lại">{active.expired ? "00:00" : <MockTimer deadline={active.deadline} finishAction={finishMockSection.bind(null, runId)}/>}</div><div className="col-span-2 flex items-center gap-2 lg:col-span-1"><MockExitLink href="/full-mock" label="Thoát"/><form action={finishMockSection.bind(null, runId)} className="flex-1"><button className="min-h-11 w-full rounded-xl bg-teal-400 px-4 text-sm font-black text-slate-950 hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{submitLabel}</button></form></div></div><div aria-label={`${answered}/${total} câu đã lưu`} aria-valuemax={total} aria-valuemin={0} aria-valuenow={answered} className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700" role="progressbar"><div className="h-full rounded-full bg-teal-300" style={{ width: `${total ? answered / total * 100 : 0}%` }}/></div></header>
    {active.expired ? <form action={finishMockSection.bind(null, runId)}><button className="mt-8 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">{run.mode === "FULL" && run.status === "LISTENING" ? "Chuyển sang Reading" : "Nộp bài"}</button></form> : <div className="mt-6 space-y-6">
      {active.sessions.flatMap(({ session, groups, answers }) => groups.map((group) => <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" key={group.id}>
        <p className="font-black">Part {session.part}</p>
        {group.questions[0]?.media?.filter((asset) => asset.kind === "AUDIO").map((asset) => <MockAudio groupId={group.id} key={asset.id} runId={runId} url={asset.url}/>)}
        {group.questions[0]?.media?.filter((asset) => asset.kind === "IMAGE").map((asset) => <div aria-label={asset.alt} className="my-4 aspect-video max-w-2xl rounded-xl bg-contain bg-center bg-no-repeat" key={asset.id} role="img" style={{ backgroundImage: `url(${JSON.stringify(asset.url)})` }}/>) }
        {group.passages.map((passage) => <article className="my-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4" key={passage.id}>{passage.content}</article>)}
        {group.questions.map((question) => <form action={saveMockAnswer.bind(null, runId, session.id, question.id)} className="mt-5 scroll-mt-36" id={`question-${question.number}`} key={question.id}>
          <p className="font-semibold leading-7">{question.number}. {question.text}</p><div className="mt-3 grid gap-2">{question.options.map((option) => <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700 has-checked:border-teal-600 has-checked:bg-teal-50" key={option.id}><input className="mt-1" defaultChecked={answers[question.id] === option.id} name="optionId" type="radio" value={option.id}/> <span className="min-w-0 break-words"><strong>{option.key}.</strong> {option.text}</span></label>)}</div>
          <button className="mt-3 min-h-11 rounded-lg border border-teal-700 px-4 py-2 font-bold text-teal-800">Lưu đáp án</button>
        </form>)}
      </section>))}
      <form action={finishMockSection.bind(null, runId)}><button className="min-h-12 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">{submitLabel}</button></form>
    </div>}
  </div></main>;
}
