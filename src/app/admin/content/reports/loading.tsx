import { AdminNav } from "@/components/admin/admin-nav";
import { getCookieLanguage } from "@/lib/i18n/get-translations";

export default async function LoadingQuestionReports() {
  const language = await getCookieLanguage();
  return (
    <main aria-busy="true" className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <AdminNav locale={language} />
        <p role="status" className="mt-8 text-base font-semibold text-slate-700">{language === "vi" ? "Đang tải báo lỗi câu hỏi…" : "Loading question reports…"}</p>
        <div aria-hidden="true" className="mt-6 space-y-4">
          <div className="h-14 rounded-xl border border-slate-200 bg-white" />
          <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </main>
  );
}
