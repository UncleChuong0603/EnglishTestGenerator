import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getQuestionBankSettings } from "@/lib/admin/question-bank-settings";
import { getPreferences } from "@/lib/i18n/get-translations";
import { saveQuestionBankBlueprintAction } from "./actions";

export default async function Page({ searchParams }: PageProps<"/admin/settings">) {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, settings, query] = await Promise.all([
    getPreferences(actor.id),
    getQuestionBankSettings(),
    searchParams,
  ]);
  const vi = prefs.interfaceLanguage === "vi";

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl">
    <AdminNav locale={prefs.interfaceLanguage} />
    <header className="mt-8"><p className="text-xs font-black uppercase tracking-[.18em] text-teal-700">{vi ? "Vận hành" : "Operations"}</p><h1 className="mt-2 text-3xl font-black">{vi ? "Cài đặt quản trị" : "Admin settings"}</h1><p className="mt-2 text-slate-600">{vi ? "Cấu hình mục tiêu vận hành dùng trong các màn hình quản trị." : "Configure operational targets used across the admin workspace."}</p></header>

    <section id="question-bank-blueprint" className="mt-8 scroll-mt-6 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-teal-50 p-6">
      <p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">Question Bank</p>
      <h2 className="mt-2 text-2xl font-black">{vi ? "Blueprint mở rộng ngân hàng câu hỏi" : "Question bank growth blueprint"}</h2>
      <p className="mt-2 max-w-3xl leading-6 text-slate-600">{vi ? "Cơ cấu TOEIC chính thức theo Part được khóa để tránh cấu hình sai định dạng đề. Bạn có thể đặt số đề full không lặp câu mà ngân hàng cần hỗ trợ." : "The official TOEIC structure by Part is locked to prevent invalid forms. Set how many no-repeat full mocks the bank should support."}</p>
      {query.saved ? <p role="status" className="mt-4 rounded-xl bg-emerald-100 p-3 font-bold text-emerald-900">{vi ? "Đã lưu blueprint." : "Blueprint saved."}</p> : null}
      {query.error ? <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 font-bold text-red-900">{vi ? "Mục tiêu phải là số nguyên từ 1 đến 100." : "Target must be a whole number from 1 to 100."}</p> : null}
      <form action={saveQuestionBankBlueprintAction} className="mt-5 max-w-xl rounded-2xl border bg-white p-5 shadow-sm">
        <label className="block font-black" htmlFor="targetForms">{vi ? "Mục tiêu đề full không lặp" : "No-repeat full mock target"}</label>
        <p className="mt-1 text-sm text-slate-600">{vi ? "Mỗi đề gồm 200 câu; màn hình Question Bank sẽ tính deficit theo mục tiêu này." : "Each form has 200 questions; Question Bank calculates every deficit from this target."}</p>
        <div className="mt-4 flex flex-wrap items-end gap-3"><div><span className="mb-1 block text-sm font-semibold">{vi ? "Số đề" : "Forms"}</span><input id="targetForms" name="targetForms" type="number" min="1" max="100" step="1" required defaultValue={settings.targetForms} className="w-40 rounded-xl border border-slate-300 px-4 py-3 text-lg font-black" /></div><button className="rounded-xl bg-slate-900 px-5 py-3 font-black text-white" type="submit">{vi ? "Lưu blueprint" : "Save blueprint"}</button></div>
        <p className="mt-4 text-sm text-slate-500">{vi ? `Mục tiêu hiện tại tương đương ${settings.targetForms * 200} câu hợp lệ, phân bổ đúng cấu trúc.` : `The current target represents ${settings.targetForms * 200} valid questions in the required structure.`}</p>
      </form>
      <Link className="mt-5 inline-block font-black text-teal-800 underline" href="/admin/content">{vi ? "Quay lại Question Bank →" : "Back to Question Bank →"}</Link>
    </section>
  </div></main>;
}
