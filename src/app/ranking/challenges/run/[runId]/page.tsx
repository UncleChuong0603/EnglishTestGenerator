import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { MockAudio, MockNavigationGuard, MockTimer } from "@/components/full-mock/mock-controls";
import { requireUser } from "@/lib/auth/session";
import { getRankedAttemptContent, getRankedRun } from "@/lib/challenges/service";
import { finishChallengeSection, saveChallengeAnswer } from "../../actions";

export default async function Page({ params }: { params: Promise<{ runId: string }> }) {
  const [{ runId }, user] = await Promise.all([params, requireUser()]);
  const run = await getRankedRun(runId, user.id);
  if (!run) notFound();
  if (run.run.status === "COMPLETED") redirect(`/ranking/challenges/run/${runId}/result`);
  const attempt = await getRankedAttemptContent(runId, user.id);
  if (!attempt) notFound();
  const section = attempt.run.section;
  if (section !== "LISTENING" && section !== "READING") notFound();
  const finish = finishChallengeSection.bind(null, runId, section);

  return <main className="min-h-screen bg-slate-50 px-4 py-5">
    <MockNavigationGuard />
    <div className="mx-auto max-w-5xl">
      <header className="sticky top-0 z-10 flex justify-between rounded-2xl bg-slate-900 p-4 text-white">
        <h1 className="font-black">{attempt.run.section}</h1>
        {attempt.expired ? <span>Hết giờ</span> : <MockTimer deadline={attempt.deadline} finishAction={finish} />}
      </header>
      {attempt.expired ? <form action={finish}>
        <button className="mt-6 rounded-xl bg-teal-700 p-4 font-bold text-white">Chấm phần đã lưu</button>
      </form> : <div className="mt-6 space-y-6">
        {attempt.sessions.flatMap(({ session, groups, answers }) => groups.map((group) => <section className="rounded-2xl bg-white p-5" key={group.id}>
          <h2 className="font-black">Part {session.part}</h2>
          {group.questions[0]?.media?.filter((item) => item.kind === "AUDIO").map((item) => <MockAudio groupId={group.id} key={item.id} runId={runId} url={item.url} />)}
          {group.questions[0]?.media?.filter((item) => item.kind === "IMAGE").map((item) => <Image alt={item.alt} className="my-4 h-auto max-h-96 w-auto" height={480} key={item.id} src={item.url} unoptimized width={640} />)}
          {group.passages.map((passage) => <article className="my-4 whitespace-pre-wrap bg-slate-50 p-4" key={passage.id}>{passage.content}</article>)}
          {group.questions.map((question) => <form action={saveChallengeAnswer.bind(null, runId, session.id, question.id)} className="mt-5" key={question.id}>
            <p className="font-semibold">{question.number}. {question.text}</p>
            {question.options.map((option) => <label className="mt-2 block rounded-lg border p-3" key={option.id}>
              <input defaultChecked={answers[question.id] === option.id} name="optionId" type="radio" value={option.id} /> <strong>{option.key}.</strong> {option.text}
            </label>)}
            <button className="mt-2 rounded-lg border px-4 py-2 font-bold">Lưu đáp án</button>
          </form>)}
        </section>))}
        <form action={finish}><button className="rounded-xl bg-teal-700 p-4 font-bold text-white">Hoàn tất phần</button></form>
      </div>}
    </div>
  </main>;
}
