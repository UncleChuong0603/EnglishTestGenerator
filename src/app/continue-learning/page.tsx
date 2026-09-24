import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { diagnosticRuns, practiceSessions } from "@/db/schema";
import { startRecommendedPractice } from "@/app/practice/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { guestContinuationPath } from "@/lib/auth/redirect";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getDashboardData } from "@/lib/dashboard/service";
import { getUsageStatus } from "@/lib/entitlements/service";
import { StartWorkoutButton } from "@/components/diagnosis/start-workout-button";
import { retryGuestMigration } from "./actions";

export const metadata: Metadata = { title: "Tiếp tục học", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ContinueLearningPage({ searchParams }: { searchParams: Promise<{ result?: string; retry?: string }> }) {
  const [{ result, retry }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const reference = typeof result === "string" && UUID.test(result) ? result : null;
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  const destination = reference ? guestContinuationPath(reference) : "/dashboard";

  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8"><section className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-sm sm:p-8"><h1 className="text-3xl font-black">{vi ? "Tiếp tục bài vừa làm" : "Continue your learning"}</h1><p className="mt-3 text-slate-600">{vi ? "Đăng ký hoặc đăng nhập để lưu kết quả và tiếp tục luyện miễn phí." : "Create an account or sign in to save your result and continue free."}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-5 font-bold text-white" href={`/sign-up?from=guest-result&next=${encodeURIComponent(destination)}`}>{vi ? "Lưu kết quả & tiếp tục miễn phí" : "Save results & continue free"}</Link><p className="mt-4"><Link className="font-bold text-teal-800" href={`/sign-in?next=${encodeURIComponent(destination)}`}>{vi ? "Đã có tài khoản? Đăng nhập" : "Already have an account? Sign in"}</Link></p></section></main>;

  const guestHash = reference ? await getGuestOwnerHash() : null;
  const [practice, diagnostic, pendingPractice, pendingDiagnostic, dashboard, usage] = await Promise.all([
    reference ? db.select({ id: practiceSessions.id, scoreCorrect: practiceSessions.scoreCorrect, scoreTotal: practiceSessions.scoreTotal, skillArea: practiceSessions.skillArea }).from(practiceSessions).where(and(eq(practiceSessions.id, reference), eq(practiceSessions.userId, user.id), eq(practiceSessions.status, "submitted"))).limit(1) : [],
    reference ? db.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.id, reference), eq(diagnosticRuns.userId, user.id), eq(diagnosticRuns.status, "COMPLETED"))).limit(1) : [],
    reference && guestHash ? db.select({ id: practiceSessions.id }).from(practiceSessions).where(and(eq(practiceSessions.id, reference), eq(practiceSessions.guestOwnerHash, guestHash), isNull(practiceSessions.userId), eq(practiceSessions.status, "submitted"), gt(practiceSessions.expiresAt, new Date()))).limit(1) : [],
    reference && guestHash ? db.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.id, reference), eq(diagnosticRuns.guestOwnerHash, guestHash), isNull(diagnosticRuns.userId), eq(diagnosticRuns.status, "COMPLETED"), gt(diagnosticRuns.expiresAt, new Date()))).limit(1) : [],
    getDashboardData(user.id).catch(() => null),
    getUsageStatus(user.id).catch(() => null),
  ]);
  const savedPractice = practice[0];
  const savedDiagnostic = diagnostic[0];
  const saved = Boolean(savedPractice || savedDiagnostic);
  const retryAvailable = !saved && Boolean(pendingPractice[0] || pendingDiagnostic[0]);
  const resultHref = savedPractice ? `/practice/${savedPractice.id}/results` : savedDiagnostic ? `/diagnostic/${savedDiagnostic.id}/result` : null;
  const workoutUsage = usage?.entitlements.TODAYS_WORKOUT;
  const nextAvailable = Boolean(dashboard?.recommendation && workoutUsage && (workoutUsage.type === "UNLIMITED" || workoutUsage.remaining > 0));

  return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900"><div className="mx-auto max-w-2xl"><section className="rounded-3xl border border-teal-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-black uppercase tracking-wider text-teal-700">TOEICGym</p><h1 className="mt-2 text-3xl font-black">{saved ? (vi ? "Kết quả của bạn đã được lưu" : "Your result is saved") : (vi ? "Tiếp tục học cùng TOEICGym" : "Continue learning with TOEICGym")}</h1><p className="mt-3 text-slate-600">{savedPractice ? `${savedPractice.skillArea === "LISTENING" ? "Listening" : "Reading"} · ${savedPractice.scoreCorrect ?? 0}/${savedPractice.scoreTotal ?? 0} ${vi ? "câu đúng" : "correct"}` : savedDiagnostic ? (vi ? "Bài đánh giá vừa làm đã được lưu vào tài khoản." : "Your diagnostic has been saved to your account.") : retryAvailable ? (vi ? "Tài khoản đã sẵn sàng nhưng bài vừa làm chưa được lưu. Hãy thử lưu lại; bạn vẫn có thể tiếp tục luyện." : "Your account is ready, but the recent result has not been saved. Try again or continue learning.") : (vi ? "Không tìm thấy kết quả luyện thử còn hiệu lực cho tài khoản này. Bạn vẫn có thể bắt đầu bài tiếp theo." : "No available guest result was found for this account. You can still start your next practice.")}</p>
    {saved && resultHref ? <p className="mt-3"><Link className="font-bold text-teal-800 underline underline-offset-4" href={resultHref}>{vi ? "Xem lại kết quả vừa lưu" : "Review saved result"}</Link></p> : null}
    {retryAvailable ? <form action={retryGuestMigration} className="mt-3"><input name="result" type="hidden" value={reference!} /><button className="font-bold text-teal-800 underline underline-offset-4" type="submit">{vi ? "Thử lưu lại kết quả" : "Retry saving result"}</button>{retry === "failed" ? <p className="mt-2 text-sm text-red-800" role="alert">{vi ? "Chưa thể lưu kết quả. Bạn có thể thử lại sau." : "Could not save the result yet. You can retry later."}</p> : null}</form> : null}
    <div className="mt-7 rounded-2xl bg-slate-900 p-5 text-white"><h2 className="text-xl font-black">{vi ? "Bài nên làm tiếp theo" : "Your next practice"}</h2><p className="mt-2 text-sm leading-6 text-slate-200">{dashboard?.recommendation ? (dashboard.recommendation.reasonCode === "SUPPORTED_WEAKNESS" ? (vi ? "Dựa trên lịch sử học của bạn, đây là bài được đề xuất để cải thiện." : "Based on your learning history, this practice is recommended for improvement.") : (vi ? "Tiếp tục luyện để TOEICGym hiểu rõ hơn điểm mạnh và điểm cần cải thiện của bạn." : "Keep practicing to build a clearer picture of your strengths and areas to improve.")) : (vi ? "Chọn bài luyện tiếp theo để xây dựng hồ sơ học tập của bạn." : "Choose your next practice to build your learning profile.")}</p>{dashboard?.recommendation ? <p className="mt-2 font-bold">{dashboard.recommendation.skillArea === "LISTENING" ? "Listening" : "Reading"}{dashboard.recommendation.part ? ` · Part ${dashboard.recommendation.part}` : ""}</p> : null}
    {nextAvailable && !dashboard?.resumablePractice ? <form action={startRecommendedPractice} className="mt-5"><StartWorkoutButton idle={vi ? "Tiếp tục luyện" : "Continue practicing"} pending={vi ? "Đang tạo bài luyện…" : "Preparing practice…"} /></form> : <Link className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-teal-300 px-5 font-black text-slate-950" href={dashboard?.resumablePractice ? `/practice/${dashboard.resumablePractice.id}` : "/dashboard#today-workout"}>{dashboard?.resumablePractice ? (vi ? "Tiếp tục bài đang làm" : "Resume practice") : (vi ? "Xem bài hôm nay" : "See today's workout")}</Link>}</div>
  </section></div></main>;
}
