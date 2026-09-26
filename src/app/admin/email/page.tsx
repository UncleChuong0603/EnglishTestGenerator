import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { lifecycleOperations } from "@/lib/email/lifecycle";
import { getPreferences } from "@/lib/i18n/get-translations";

const names: Record<string, string> = { weekly_review: "Tổng kết tuần", inactive_3d: "Không học 3 ngày", day1_return: "Quay lại sau buổi đầu", signup_no_learning: "Đăng ký chưa học" };
export default async function AdminEmailPage() {
  const actor = await requireAdmin("ADMIN_DASHBOARD_READ");
  const [preferences, rows] = await Promise.all([getPreferences(actor.id), lifecycleOperations()]);
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl"><AdminNav locale={preferences.interfaceLanguage} /><h1 className="mt-8 text-3xl font-black">Email học tập</h1><p className="mt-2 text-slate-600">Số email đã gửi, bỏ qua và lỗi theo loại. Không theo dõi lượt mở.</p><div className="mt-6 overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-4">Loại</th><th className="p-4">Đã gửi</th><th className="p-4">Bỏ qua</th><th className="p-4">Lỗi</th><th className="p-4">Quay lại học</th></tr></thead><tbody>{Object.entries(names).map(([type, label]) => <tr className="border-b last:border-0" key={type}><th className="p-4">{label}</th>{["sent", "suppressed", "failed", "returned"].map(status => <td className="p-4" key={status}>{rows.filter(row => row.type === type && (status === "returned" || row.status === status)).reduce((sum, row) => sum + Number(status === "returned" ? row.returned : row.count), 0)}</td>)}</tr>)}</tbody></table></div></div></main>;
}
