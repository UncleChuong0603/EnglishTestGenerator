import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { MockAudio, MockNavigationGuard, MockTimer } from "@/components/full-mock/mock-controls";
import { getActiveFullMockSection, getFullMockRun } from "@/lib/full-mock/service";
import { finishMockSection, saveMockAnswer } from "../actions";

export default async function FullMockRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const [{ runId }, user] = await Promise.all([params, requireUser()]);
  const run = await getFullMockRun(runId, user.id);
  if (!run) notFound();
  if (run.status === "COMPLETED") redirect(`/full-mock/${runId}/results`);
  const active = await getActiveFullMockSection(runId, user.id);
  if (!active) notFound();
  return <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900"><MockNavigationGuard/><div className="mx-auto max-w-5xl">
    <header className="sticky top-0 z-10 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white"><h1 className="font-black">{run.status}</h1>{active.expired ? <span>Hết giờ</span> : <MockTimer deadline={active.deadline} finishAction={finishMockSection.bind(null, runId)}/>}</header>
    {active.expired ? <form action={finishMockSection.bind(null, runId)}><button className="mt-8 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Chuyển phần</button></form> : <div className="mt-6 space-y-6">
      {active.sessions.flatMap(({ session, groups, answers }) => groups.map((group) => <section className="rounded-2xl border border-slate-200 bg-white p-5" key={group.id}>
        <p className="font-black">Part {session.part}</p>
        {group.questions[0]?.media?.filter((asset) => asset.kind === "AUDIO").map((asset) => <MockAudio groupId={group.id} key={asset.id} runId={runId} url={asset.url}/>)}
        {group.questions[0]?.media?.filter((asset) => asset.kind === "IMAGE").map((asset) => <div aria-label={asset.alt} className="my-4 aspect-video max-w-2xl rounded-xl bg-contain bg-center bg-no-repeat" key={asset.id} role="img" style={{ backgroundImage: `url(${JSON.stringify(asset.url)})` }}/>) }
        {group.passages.map((passage) => <article className="my-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4" key={passage.id}>{passage.content}</article>)}
        {group.questions.map((question) => <form action={saveMockAnswer.bind(null, runId, session.id, question.id)} className="mt-5" key={question.id}>
          <p className="font-semibold">{question.number}. {question.text}</p><div className="mt-2 grid gap-2">{question.options.map((option) => <label className="rounded-lg border p-3" key={option.id}><input defaultChecked={answers[question.id] === option.id} name="optionId" type="radio" value={option.id}/> <strong>{option.key}.</strong> {option.text}</label>)}</div>
          <button className="mt-3 rounded-lg border border-teal-700 px-4 py-2 font-bold text-teal-800">Lưu đáp án</button>
        </form>)}
      </section>))}
      <form action={finishMockSection.bind(null, runId)}><button className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Hoàn tất phần</button></form>
    </div>}
  </div></main>;
}
