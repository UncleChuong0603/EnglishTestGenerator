import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getAdminOverview } from "@/lib/admin/service";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function AdminPage() {
  const actor = await requireAdmin("ADMIN_DASHBOARD_READ"); const preferences = await getPreferences(actor.id); const vi = preferences.interfaceLanguage === "vi"; const data = await getAdminOverview();
  const cards = [[vi ? "Tổng người dùng" : "Total users", data.total], [vi ? "Đang hoạt động" : "Active users", data.active], [vi ? "Đã tạm khóa" : "Suspended users", data.suspended], ["Free", data.free], ["Premium", data.premium], [vi ? "Mới trong 7 ngày" : "New in 7 days", data.new7], [vi ? "Mới trong 30 ngày" : "New in 30 days", data.new30]];
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl"><AdminNav locale={preferences.interfaceLanguage} /><h1 className="mt-8 text-3xl font-black">{vi ? "Tổng quan quản trị" : "Admin overview"}</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={label}><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>)}</div></div></main>;
}
