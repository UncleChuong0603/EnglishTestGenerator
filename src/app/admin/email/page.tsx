import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { lifecycleOperations } from "@/lib/email/lifecycle";
import { getPreferences } from "@/lib/i18n/get-translations";

const names: Record<string, { vi: string; en: string }> = {
  weekly_review: { vi: "Tổng kết tuần", en: "Weekly review" },
  inactive_3d: { vi: "Không học 3 ngày", en: "Inactive for 3 days" },
  day1_return: { vi: "Quay lại sau buổi đầu", en: "Return after first session" },
  signup_no_learning: { vi: "Đăng ký chưa học", en: "Signed up without learning" },
};
export default async function AdminEmailPage() {
  const actor = await requireAdmin("ADMIN_DASHBOARD_READ");
  const [preferences, operations] = await Promise.all([getPreferences(actor.id), lifecycleOperations()]);
  const vi = preferences.interfaceLanguage === "vi";
  const { rows, audience } = operations;
  const lastSent = audience.lastSentAt ? audience.lastSentAt.toLocaleString(vi ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "medium", timeStyle: "short" }) : (vi ? "Chưa có" : "None yet");
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl"><AdminNav locale={preferences.interfaceLanguage} /><h1 className="mt-8 text-3xl font-black">{vi ? "Email học tập" : "Learning email"}</h1><p className="mt-2 text-slate-600">{vi ? "Theo dõi phạm vi người nhận, trạng thái gửi và lượt quay lại học. Không theo dõi lượt mở email." : "Monitor audience, delivery status and return-to-learning activity. Email opens are not tracked."}</p>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={vi ? "Tình trạng email học tập" : "Learning email status"}>{[
      [vi ? "Đã đồng ý nhận" : "Opted in", `${audience.optedIn}/${audience.eligible}`],
      [vi ? "Đã gửi 7 ngày" : "Sent in 7 days", String(audience.sent7d)],
      [vi ? "Gửi gần nhất" : "Last sent", lastSent],
      [vi ? "Lịch chạy" : "Schedule", "08:15 · Asia/Ho_Chi_Minh"],
    ].map(([label, value]) => <article className="rounded-2xl border border-slate-200 bg-white p-4" key={label}><p className="text-sm font-semibold text-slate-600">{label}</p><p className="mt-2 text-lg font-black tabular-nums">{value}</p></article>)}</section>
    <div className="mt-6 overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-4">{vi ? "Loại" : "Type"}</th><th className="p-4">{vi ? "Đã gửi" : "Sent"}</th><th className="p-4">{vi ? "Bỏ qua" : "Suppressed"}</th><th className="p-4">{vi ? "Lỗi" : "Failed"}</th><th className="p-4">{vi ? "Quay lại học" : "Returned"}</th></tr></thead><tbody>{Object.entries(names).map(([type, label]) => <tr className="border-b last:border-0" key={type}><th className="p-4">{label[vi ? "vi" : "en"]}</th>{["sent", "suppressed", "failed", "returned"].map(status => <td className="p-4 tabular-nums" key={status}>{rows.filter(row => row.type === type && (status === "returned" || row.status === status)).reduce((sum, row) => sum + Number(status === "returned" ? row.returned : row.count), 0)}</td>)}</tr>)}</tbody></table></div></div></main>;
}
