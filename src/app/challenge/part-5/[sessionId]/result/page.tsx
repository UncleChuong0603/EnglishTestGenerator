import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AnswerReviewCard } from "@/components/practice/answer-review-card";
import { UnifiedRecommendationCard } from "@/components/diagnosis/recommendation-card";
import { guestContinuationPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";
import { part5ChallengeResult } from "@/lib/challenge/part-5-result";
import { loadRecommendedWorkout } from "@/lib/diagnosis/service";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { getPreferences } from "@/lib/i18n/get-translations";
import { taxonomyLabel } from "@/lib/i18n/labels";
import { getPracticeResult } from "@/lib/practice/queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Part5ChallengeResultPage({ params }: PageProps<"/challenge/part-5/[sessionId]/result">) {
  const [{ sessionId }, user, guestOwnerHash] = await Promise.all([params, getCurrentUser(), getGuestOwnerHash()]);
  if (!UUID.test(sessionId)) notFound();
  if (!user && !guestOwnerHash) redirect("/challenge/part-5");
  const result = await getPracticeResult(sessionId, user ? { userId: user.id } : { guestOwnerHash: guestOwnerHash! });
  if (!result) notFound();
  if (result === "in_progress") redirect(`/challenge/part-5/${sessionId}`);
  if (result.mode !== "part_5" || result.scoreTotal !== 10 || result.questions.length !== 10 || result.questions.some((question) => question.part !== 5)) notFound();
  const [preferences, recommendation] = await Promise.all([getPreferences(user?.id), user ? loadRecommendedWorkout(user.id).catch(() => null) : null]);
  const locale = preferences.interfaceLanguage;
  const vi = locale === "vi";
  const insight = part5ChallengeResult(result);
  const continuation = guestContinuationPath(sessionId);
  const primaryHref = user ? continuation : `/sign-up?from=guest-result&next=${encodeURIComponent(continuation)}`;
  const badge = (signal: "early" | "strong" | "needs_work" | "neutral") => signal === "strong" ? "Strong" : signal === "needs_work" ? "Needs work" : signal === "early" ? (vi ? "Dữ liệu ban đầu" : "Early data") : (vi ? "Đang theo dõi" : "Developing");
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-black uppercase tracking-[.18em] text-teal-700">TOEIC GYM / PART 5 CHALLENGE</p>
      <section className="mt-5 rounded-3xl bg-slate-900 p-6 text-white sm:p-9">
        <p className="text-sm font-bold uppercase tracking-wider text-teal-300">{vi ? "Kết quả của bạn" : "Your result"}</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">{insight.correct}/{insight.total} <span className="text-xl font-bold text-slate-300 sm:text-2xl">{vi ? "câu đúng" : "correct"}</span></h1>
        <p className="mt-2 text-xl font-bold text-teal-300">{vi ? "Độ chính xác" : "Accuracy"}: {insight.accuracy}%</p>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-300">{vi ? "Đây là kết quả của 10 câu bạn vừa làm. Cần thêm bài làm để nhận xét chắc chắn về từng kỹ năng; đây không phải điểm TOEIC dự đoán." : "This is your result across these 10 questions. More answers are needed to assess each skill reliably; this is not a predicted TOEIC score."}</p>
      </section>
      <section className="mt-6 rounded-3xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
        <h2 className="text-2xl font-black">{vi ? "Bài luyện nên làm tiếp" : "Your next workout"}</h2>
        <p className="mt-2 leading-7 text-slate-700">{user ? (vi ? "Đề xuất được tính từ lịch sử học của bạn. Hệ thống sẽ tính lại khi bạn tiếp tục." : "This recommendation uses your learning history and will be recalculated when you continue.") : (vi ? "Lưu kết quả để nhận bài luyện tiếp theo. Hệ thống sẽ tính lại đề xuất sau khi gắn kết quả vào tài khoản của bạn." : "Save this result to get your next workout. The recommendation is recalculated after your result joins your account.")}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-6 text-center font-black text-white" href={primaryHref}>{vi ? "Tiếp tục luyện miễn phí" : "Continue practicing free"}</Link>{!user ? <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-teal-700 px-5 text-center font-bold text-teal-800" href={`/sign-in?next=${encodeURIComponent(continuation)}`}>{vi ? "Đã có tài khoản? Đăng nhập" : "Already have an account? Sign in"}</Link> : null}</div>
      </section>
      {recommendation ? <div className="mt-6"><UnifiedRecommendationCard compact locale={locale} recommendation={recommendation} /></div> : null}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-2xl font-black">{vi ? "Kết quả theo kỹ năng" : "By skill"}</h2>
        <p className="mt-2 text-sm text-slate-600">{vi ? "Số câu đúng trong thử thách này; nhãn đánh giá chỉ xuất hiện khi bạn đã trả lời ít nhất 5 câu cùng nhóm." : "Correct answers in this challenge; a performance label requires at least five answered questions in the same group."}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{insight.skills.map((skill) => <div className="rounded-2xl border border-slate-200 p-4" key={skill.name}><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-black">{taxonomyLabel(skill.name, locale)}</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{badge(skill.signal)}</span></div><p className="mt-3 text-lg font-black">{skill.correct}/{skill.attempted} · {skill.accuracy}%</p></div>)}</div>
        {insight.subskills.some((item) => item.answered >= 5) ? <div className="mt-6"><h3 className="font-black">{vi ? "Theo chủ điểm" : "By subskill"}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{insight.subskills.filter((item) => item.answered >= 5).map((item) => <div className="rounded-xl bg-slate-50 p-4" key={`${item.skill}:${item.name}`}><p className="font-bold">{taxonomyLabel(item.name, locale)}</p><p className="mt-1 text-sm">{item.correct}/{item.attempted} · {item.accuracy}% · {badge(item.signal)}</p></div>)}</div></div> : <p className="mt-5 text-sm text-slate-600">{vi ? "Mỗi chủ điểm hiện có dưới 5 câu đã trả lời; cần luyện thêm trước khi nhận xét theo chủ điểm." : "Each subskill has fewer than five answered questions. Practice more for a useful subskill assessment."}</p>}
      </section>
      <section className="mt-8 pb-10"><h2 className="text-2xl font-black">{insight.mistakes.length ? (vi ? `Xem lại ${insight.mistakes.length} câu sai` : `Review ${insight.mistakes.length} missed questions`) : (vi ? "Bạn đã làm đúng cả 10 câu" : "You answered all 10 correctly")}</h2><p className="mt-2 text-slate-600">{insight.mistakes.length ? (vi ? "Đáp án đúng và lời giải đầy đủ ở từng câu." : "The correct answer and full explanation are below each question.") : (vi ? "Bạn có thể xem lời giải của từng câu nếu muốn." : "You can still review the explanation for every question.")}</p><div className="mt-5 space-y-4">{(insight.mistakes.length ? insight.mistakes : result.questions).map((question) => <AnswerReviewCard explanationLanguage={preferences.explanationLanguage} key={question.id} locale={locale} question={question} />)}</div></section>
    </div>
  </main>;
}
