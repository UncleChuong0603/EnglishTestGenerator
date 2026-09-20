import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getContentOverview } from "@/lib/admin/content";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function Page() {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, d] = await Promise.all([getPreferences(actor.id), getContentOverview()]);
  const vi = prefs.interfaceLanguage === "vi";
  const parts = [
    { label: "Part 1", part: 1, count: `${d.listening.p1} / 6`, area: "Listening" },
    { label: "Part 2", part: 2, count: `${d.listening.p2} / 25`, area: "Listening" },
    { label: "Part 3", part: 3, count: `${d.listening.p3Groups} nhóm · ${d.listening.p3Questions} câu`, area: "Listening" },
    { label: "Part 4", part: 4, count: `${d.listening.p4Groups} nhóm · ${d.listening.p4Questions} câu`, area: "Listening" },
    { label: "Part 5", part: 5, count: `${d.reading.p5} câu`, area: "Reading" },
    { label: "Part 6", part: 6, count: `${d.reading.p6Groups} nhóm · ${d.reading.p6Questions} câu`, area: "Reading" },
    { label: "Part 7 · Single", part: 7, setType: "single", count: `${d.reading.p7SingleGroups} nhóm · ${d.reading.p7SingleQuestions} câu`, area: "Reading" },
    { label: "Part 7 · Multiple", part: 7, setType: "multiple", count: `${d.reading.p7MultipleGroups} nhóm · ${d.reading.p7MultipleQuestions} câu`, area: "Reading" },
  ];
  const statuses = [["Listening Mock", d.listeningReady], ["Reading Mock", d.readingReady], ["Full Mock", d.ready]] as const;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl"><AdminNav locale={prefs.interfaceLanguage}/>
    <header className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">{vi ? "Ngân hàng câu hỏi" : "Question Bank"}</h1><p className="mt-1 text-slate-600">{vi ? "Độ phủ, trạng thái và quản lý nội dung TOEIC." : "TOEIC coverage, readiness and content management."}</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-lg bg-teal-700 px-4 py-2 font-bold text-white" href="/admin/content/new">{vi ? "+ Tạo nội dung" : "+ Create content"}</Link><Link className="rounded-lg border bg-white px-4 py-2 font-bold" href="/admin/content/import">{vi ? "Nhập JSON" : "Import JSON"}</Link><Link className="rounded-lg border bg-white px-4 py-2 font-bold" href="/admin/content/questions">{vi ? "Duyệt và xuất JSON" : "Browse and export JSON"}</Link><Link className="rounded-lg border bg-white px-4 py-2 font-bold" href="/admin/content/media">Media</Link></div></header>
    <section className="mt-8"><h2 className="text-sm font-black uppercase tracking-widest text-slate-500">{vi ? "Sẵn sàng tạo đề" : "Mock readiness"}</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{statuses.map(([label, ready])=><article className={`rounded-2xl border p-5 ${ready ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`} key={label}><h3 className="font-black">{label}</h3><p className="mt-2 font-semibold">{ready ? (vi ? "Sẵn sàng" : "Ready") : (vi ? "Chưa sẵn sàng" : "Not ready")}</p>{!ready && <p className="mt-2 text-sm text-slate-700">{vi ? "Chưa đáp ứng đủ cấu trúc đề và nhóm câu hỏi." : "The required blueprint and group structure are not yet satisfied."}</p>}</article>)}</div><details className="mt-3 rounded-xl border bg-white p-4 text-sm"><summary className="cursor-pointer font-bold">{vi ? "Chi tiết kiểm tra Part 7" : "Part 7 feasibility details"}</summary><p className="mt-2">Single: {d.reading.p7SingleGroups} groups / {d.reading.p7SingleQuestions} questions · {d.reading.p7SingleFeasible ? "Ready" : "Not feasible"}</p><p>Multiple: {d.reading.p7MultipleGroups} groups / {d.reading.p7MultipleQuestions} questions · {d.reading.p7MultipleFeasible ? "Ready" : "Not feasible"}</p></details></section>
    <section className="mt-8"><h2 className="text-sm font-black uppercase tracking-widest text-slate-500">{vi ? "Câu hỏi theo Part" : "Questions by Part"}</h2>{["Listening", "Reading"].map(area=><div key={area}><h3 className="mt-5 text-xl font-black">{area}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{parts.filter(p=>p.area===area).map(p=><Link href={`/admin/content/questions?part=${p.part}${p.setType ? `&setType=${p.setType}` : ""}`} className="rounded-2xl border bg-white p-5 transition hover:border-teal-500 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-teal-700" key={p.label}><span className="font-bold text-teal-800">{p.label} →</span><span className="mt-2 block text-lg font-black">{p.count}</span></Link>)}</div></div>)}</section>
    <section className="mt-8 rounded-2xl border bg-white p-5"><h2 className="font-black">{vi ? "Vòng đời nội dung" : "Content lifecycle"}</h2><div className="mt-3 flex flex-wrap gap-3">{[["draft",vi?"Bản nháp":"Draft"],["published",vi?"Đã xuất bản":"Published"],["archived",vi?"Đã lưu trữ":"Archived"]].map(([key,label])=><Link className="rounded-lg border px-4 py-3 font-semibold hover:border-teal-500" href={`/admin/content/questions?lifecycle=${key}`} key={key}>{label}: {d.lifecycle[key] ?? 0} →</Link>)}</div></section>
  </div></main>;
}
