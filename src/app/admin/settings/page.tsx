import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { PendingSubmit } from "@/components/admin/pending-submit";
import { requireAdmin } from "@/lib/admin/authorization";
import { getQuestionBankSettings } from "@/lib/admin/question-bank-settings";
import { getPreferences } from "@/lib/i18n/get-translations";
import {
  saveContentQualitySettingsAction,
  saveQuestionBankBlueprintAction,
  saveSupportSettingsAction,
} from "./actions";

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-black shadow-inner focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100";
const buttonClass = "rounded-xl bg-slate-900 px-5 py-3 font-black text-white shadow-sm hover:bg-teal-800";

export default async function Page({ searchParams }: PageProps<"/admin/settings">) {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, settings, query] = await Promise.all([
    getPreferences(actor.id),
    getQuestionBankSettings(),
    searchParams,
  ]);
  const vi = prefs.interfaceLanguage === "vi";
  const saved = typeof query.saved === "string" ? query.saved : "";
  const error = typeof query.error === "string" ? query.error : "";

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dff7f3,_transparent_32%),linear-gradient(180deg,#f8fafc,#fff7ed)] px-4 py-6 text-slate-900 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <AdminNav locale={prefs.interfaceLanguage} />
      <header className="mt-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-teal-700">{vi ? "Vận hành" : "Operations"}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{vi ? "Cài đặt quản trị" : "Admin settings"}</h1>
          <p className="mt-2 max-w-3xl text-slate-600">{vi ? "Điều chỉnh các mục tiêu vận hành mà đội admin cần thay đổi theo quy mô, không phải deploy lại ứng dụng." : "Tune operational targets that the admin team may need to change as the product scales, without redeploying the app."}</p>
        </div>
        {settings.updatedAt ? <p className="rounded-full border bg-white px-4 py-2 text-xs font-bold text-slate-500">{vi ? "Cập nhật gần nhất" : "Last updated"}: {settings.updatedAt.toLocaleString(vi ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh" })}</p> : null}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section id="question-bank-blueprint" className="scroll-mt-6 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">Question Bank</p>
          <h2 className="mt-2 text-2xl font-black">{vi ? "Blueprint tăng trưởng" : "Growth blueprint"}</h2>
          <p className="mt-2 leading-6 text-slate-600">{vi ? "Cơ cấu TOEIC theo Part được khóa. Chỉ đặt số đề full không lặp mà ngân hàng cần hỗ trợ." : "The TOEIC structure by Part stays locked. Set only how many no-repeat full mocks the bank must support."}</p>
          {saved === "1" ? <Status>{vi ? "Đã lưu blueprint." : "Blueprint saved."}</Status> : null}
          {error === "INVALID_TARGET_FORMS" ? <Error>{vi ? "Mục tiêu phải là số nguyên từ 1 đến 100." : "Target must be a whole number from 1 to 100."}</Error> : null}
          <form action={saveQuestionBankBlueprintAction} className="mt-5">
            <label className="block font-black" htmlFor="targetForms">{vi ? "Số đề full không lặp" : "No-repeat full mocks"}</label>
            <p className="mt-1 text-sm text-slate-600">{vi ? "Mỗi đề gồm 200 câu; Question Bank tính deficit từ mục tiêu này." : "Each mock has 200 questions; Question Bank calculates deficits from this target."}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <input id="targetForms" name="targetForms" type="number" min="1" max="100" step="1" required defaultValue={settings.targetForms} className={inputClass} />
              <PendingSubmit className={buttonClass} pendingLabel={vi ? "Đang lưu…" : "Saving…"}>{vi ? "Lưu blueprint" : "Save blueprint"}</PendingSubmit>
            </div>
            <p className="mt-4 text-sm font-semibold text-orange-800">{vi ? `${settings.targetForms * 200} câu hợp lệ theo đúng cơ cấu.` : `${settings.targetForms * 200} valid questions in the required structure.`}</p>
          </form>
          <Link className="mt-5 inline-block font-black text-teal-800 underline" href="/admin/content">{vi ? "Mở Question Bank →" : "Open Question Bank →"}</Link>
        </section>

        <section id="content-quality" className="scroll-mt-6 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.18em] text-teal-700">{vi ? "Chất lượng nội dung" : "Content quality"}</p>
          <h2 className="mt-2 text-2xl font-black">{vi ? "Ngưỡng phát hiện tương tự" : "Similarity detection threshold"}</h2>
          <p className="mt-2 leading-6 text-slate-600">{vi ? "Đặt độ nhạy mặc định khi admin mở công cụ rà soát câu hỏi giống nhau. Vẫn có thể đổi tạm thời trên màn hình quét." : "Set the default sensitivity when admins open duplicate-content review. It can still be overridden for an individual scan."}</p>
          {saved === "content-quality" ? <Status>{vi ? "Đã lưu cài đặt chất lượng nội dung." : "Content quality settings saved."}</Status> : null}
          {error === "INVALID_SIMILARITY_THRESHOLD" ? <Error>{vi ? "Ngưỡng phải là số nguyên từ 25% đến 95%." : "Threshold must be a whole number from 25% to 95%."}</Error> : null}
          <form action={saveContentQualitySettingsAction} className="mt-5">
            <label className="block font-black" htmlFor="similarityThresholdPercent">{vi ? "Mức tương tự tối thiểu (%)" : "Minimum similarity (%)"}</label>
            <p className="mt-1 text-sm text-slate-600">{vi ? "Thấp hơn sẽ bắt nhiều cặp nghi ngờ hơn; 58% là mức cân bằng hiện tại." : "Lower values surface more suspected pairs; 58% is the current balanced baseline."}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <input id="similarityThresholdPercent" name="similarityThresholdPercent" type="number" min="25" max="95" step="1" required defaultValue={settings.similarityThresholdPercent} className={inputClass} />
              <PendingSubmit className={buttonClass} pendingLabel={vi ? "Đang lưu…" : "Saving…"}>{vi ? "Lưu ngưỡng" : "Save threshold"}</PendingSubmit>
            </div>
          </form>
          <Link className="mt-5 inline-block font-black text-teal-800 underline" href="/admin/content/similarity">{vi ? "Mở công cụ rà soát →" : "Open similarity review →"}</Link>
        </section>

        <section id="support-operations" className="scroll-mt-6 rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-sm lg:col-span-2">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-sky-700">{vi ? "Hỗ trợ người dùng" : "User support"}</p>
              <h2 className="mt-2 text-2xl font-black">{vi ? "Mục tiêu phản hồi ticket" : "Ticket response target"}</h2>
              <p className="mt-2 leading-6 text-slate-600">{vi ? "Ticket mới vượt quá thời gian này sẽ được đánh dấu nổi bật trong hàng đợi hỗ trợ. Khi chuyển sang Đang xử lý, ticket được xem là đã có phản hồi đầu tiên." : "New tickets older than this target are highlighted in the support queue. Moving a ticket to In progress counts as the first response."}</p>
              {saved === "support" ? <Status>{vi ? "Đã lưu mục tiêu hỗ trợ." : "Support target saved."}</Status> : null}
              {error === "INVALID_SUPPORT_RESPONSE_TARGET" ? <Error>{vi ? "Mục tiêu phải là số nguyên từ 1 đến 168 giờ." : "Target must be a whole number from 1 to 168 hours."}</Error> : null}
            </div>
            <form action={saveSupportSettingsAction} className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
              <label className="block font-black" htmlFor="supportResponseTargetHours">{vi ? "Phản hồi trong (giờ)" : "Respond within (hours)"}</label>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <input id="supportResponseTargetHours" name="supportResponseTargetHours" type="number" min="1" max="168" step="1" required defaultValue={settings.supportResponseTargetHours} className={inputClass} />
                <PendingSubmit className={buttonClass} pendingLabel={vi ? "Đang lưu…" : "Saving…"}>{vi ? "Lưu SLA" : "Save target"}</PendingSubmit>
              </div>
              <Link className="mt-4 inline-block text-sm font-black text-teal-800 underline" href="/admin/support">{vi ? "Mở hàng đợi hỗ trợ →" : "Open support queue →"}</Link>
            </form>
          </div>
        </section>
      </div>
    </div>
  </main>;
}

function Status({ children }: { children: React.ReactNode }) {
  return <p role="status" className="mt-4 rounded-xl bg-emerald-100 p-3 font-bold text-emerald-900">{children}</p>;
}

function Error({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 font-bold text-red-900">{children}</p>;
}
