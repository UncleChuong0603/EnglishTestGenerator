import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import { requireUser } from "@/lib/auth/session";
import { getActiveFullMock, getFullMockHistory, getFullMockReadiness } from "@/lib/full-mock/service";
import { getPreferences } from "@/lib/i18n/get-translations";
import { startFullMock } from "./actions";

export default async function FullMockPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const [readiness, active, history, preferences] = await Promise.all([getFullMockReadiness(), getActiveFullMock(user.id), getFullMockHistory(user.id), getPreferences(user.id)]);
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-4xl"><LearnerNav locale={preferences.interfaceLanguage}/>{query.error === "usage_limit" ? <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900" role="alert">Bạn đã dùng hết lượt Full Mock miễn phí tháng này. <Link className="font-bold underline" href="/pricing">Xem Premium</Link></div> : null}
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10"><p className="text-sm font-black uppercase tracking-wider text-teal-700">TOEIC L&amp;R</p><h1 className="mt-2 text-3xl font-black">Full Mock Test</h1><p className="mt-3 text-slate-600">200 câu · Listening 45 phút · Reading 75 phút. Đồng hồ không tạm dừng.</p>
      {active ? <Link className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" href={`/full-mock/${active.id}`}>Tiếp tục bài thi</Link> : readiness.ready ? <form action={startFullMock}><button className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Bắt đầu Full Mock</button></form> : <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-amber-900"><strong>Sắp ra mắt</strong><p className="mt-1 text-sm">Ngân hàng đề đang được hoàn thiện. Hệ thống sẽ không tạo đề thiếu hoặc lặp câu.</p></div>}
    </section>
    {history.some(Boolean) ? <section className="mt-8"><h2 className="text-xl font-black">Lịch sử Full Mock</h2><div className="mt-3 space-y-3">{history.flatMap((item) => item ? [<Link className="block rounded-xl bg-white p-4" href={`/full-mock/${item.id}/results`} key={item.id}>{new Date(item.completedAt).toLocaleDateString("vi-VN")} · Listening {item.listening.correct}/100 · Reading {item.reading.correct}/100 · Tổng {item.overall.correct}/200</Link>] : [])}</div></section> : null}
  </div></main>;
}
