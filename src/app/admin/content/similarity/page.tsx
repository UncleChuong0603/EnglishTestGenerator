import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { requireAdmin } from "@/lib/admin/authorization";
import { findSimilarContent, type SimilarContentItem } from "@/lib/admin/content";
import { getPreferences } from "@/lib/i18n/get-translations";
import { archiveSimilarContentAction, deleteArchivedContentAction } from "../actions";

function scoreLabel(score: number, exact: boolean) {
  if (exact) return "Trùng hoàn toàn";
  if (score >= 0.8) return "Rất giống";
  if (score >= 0.68) return "Giống nhiều";
  return "Có điểm tương tự";
}

function lifecycleClass(lifecycle: SimilarContentItem["lifecycle"]) {
  return lifecycle === "published" ? "bg-emerald-100 text-emerald-900" : lifecycle === "draft" ? "bg-amber-100 text-amber-900" : "bg-slate-200 text-slate-700";
}

function ItemCard({ item, part, threshold, lifecycle }: { item: SimilarContentItem; part: number; threshold: number; lifecycle?: string }) {
  const hidden = <><input type="hidden" name="id" value={item.id}/><input type="hidden" name="part" value={part}/><input type="hidden" name="threshold" value={threshold}/><input type="hidden" name="lifecycle" value={lifecycle ?? ""}/><input type="hidden" name="updatedAt" value={item.updatedAt.toISOString()}/></>;
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-xs font-black ${lifecycleClass(item.lifecycle)}`}>{item.lifecycle.toUpperCase()}</span><span className="ml-2 text-xs font-bold text-slate-500">{item.provenance} · {item.questionCount} câu</span></div><time className="text-xs text-slate-500">{item.createdAt.toLocaleDateString("vi-VN")}</time></div>
    <h3 className="mt-4 text-lg font-black leading-snug">{item.title}</h3><p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{item.preview || "Không có text preview; hãy mở chi tiết để xem media."}</p>
    <div className="mt-5 flex flex-wrap gap-2"><Link className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white" href={`/admin/content/questions/${item.id}?part=${part}`}>Mở chi tiết ↗</Link>{item.lifecycle === "published" && <form action={archiveSimilarContentAction}>{hidden}<ConfirmSubmit className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900" message="Archive nhóm này? Hệ thống sẽ chặn nếu nhóm đang cần cho Full Mock hoặc challenge.">Archive</ConfirmSubmit></form>}{item.lifecycle === "archived" && <form action={deleteArchivedContentAction}>{hidden}<ConfirmSubmit className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-800" message="Xóa vĩnh viễn nhóm đã archive này? Không thể hoàn tác.">Delete vĩnh viễn</ConfirmSubmit></form>}</div>
  </article>;
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const actor = await requireAdmin("CONTENT_READ");
  const prefs = await getPreferences(actor.id);
  const query = await searchParams;
  const part = Math.min(7, Math.max(1, Number(query.part) || 5));
  const threshold = Math.min(0.95, Math.max(0.25, Number(query.threshold) || 0.58));
  const lifecycle = ["draft", "published", "archived"].includes(query.lifecycle ?? "") ? query.lifecycle : undefined;
  const result = await findSimilarContent(part, { lifecycle, threshold });
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fef3c7,_transparent_34%),linear-gradient(180deg,#f8fafc,#ecfeff)] px-4 py-6 text-slate-900"><div className="mx-auto max-w-7xl"><AdminNav locale={prefs.interfaceLanguage}/>
    <header className="mt-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-sm font-black uppercase tracking-[.2em] text-amber-700">Content quality</p><h1 className="mt-2 text-4xl font-black tracking-tight">Rà soát câu hỏi tương tự</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">So sánh trong cùng một Part bằng question, đáp án, passage và transcript. Điểm cao là tín hiệu để review, không phải kết luận tự động.</p></div><Link href={`/admin/content/questions?part=${part}`} className="rounded-xl border bg-white px-4 py-3 font-black">Xem toàn bộ Part {part} →</Link></header>
    <form className="mt-6 grid gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"><label className="text-sm font-bold">Part<select name="part" defaultValue={part} className="mt-1 block w-full rounded-lg border p-2.5">{[1,2,3,4,5,6,7].map((value)=><option key={value} value={value}>Part {value}</option>)}</select></label><label className="text-sm font-bold">Trạng thái<select name="lifecycle" defaultValue={lifecycle ?? ""} className="mt-1 block w-full rounded-lg border p-2.5"><option value="">Tất cả</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label className="text-sm font-bold">Độ nhạy<select name="threshold" defaultValue={String(threshold)} className="mt-1 block w-full rounded-lg border p-2.5"><option value="0.48">Rộng · bắt nhiều nghi ngờ</option><option value="0.58">Cân bằng</option><option value="0.7">Chặt · chỉ các cặp rất giống</option><option value="0.85">Gần như trùng</option></select></label><button className="self-end rounded-lg bg-teal-700 px-5 py-3 font-black text-white">Quét Part {part}</button></form>
    {(query.archived || query.deleted || query.error) && <p className={`mt-4 rounded-xl border p-4 font-semibold ${query.error ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>{query.error ? `Không thể thực hiện: ${query.error}` : query.deleted ? "Đã xóa vĩnh viễn nội dung trùng lặp." : "Đã archive nội dung."}</p>}
    <section className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-900 p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-slate-300">Đã quét</p><p className="mt-2 text-3xl font-black">{result.scanned}</p><p className="text-sm text-slate-300">nhóm trong Part {part}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Cặp cần xem</p><p className="mt-2 text-3xl font-black">{result.pairs.length}</p><p className="text-sm text-slate-500">từ {Math.round(result.threshold * 100)}% tương tự</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Trùng hoàn toàn</p><p className="mt-2 text-3xl font-black">{result.pairs.filter((pair)=>pair.exact).length}</p><p className="text-sm text-amber-800">nên ưu tiên xử lý</p></div></section>
    <div className="mt-6 space-y-5">{result.pairs.map((pair, index)=><section key={pair.key} className={`overflow-hidden rounded-3xl border bg-white/70 shadow-sm ${pair.exact ? "border-red-300" : "border-slate-200"}`}><div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${pair.exact ? "bg-red-50" : "bg-slate-50"}`}><div><span className="mr-3 text-sm font-black text-slate-400">#{index + 1}</span><strong>{scoreLabel(pair.score, pair.exact)}</strong><span className="ml-2 rounded-full bg-white px-2.5 py-1 text-xs font-black">{Math.round(pair.score * 100)}%</span></div>{pair.sharedTerms.length > 0 && <p className="text-xs text-slate-500">Từ chung: {pair.sharedTerms.join(" · ")}</p>}</div><div className="grid gap-4 p-4 lg:grid-cols-2"><ItemCard item={pair.left} part={part} threshold={threshold} lifecycle={lifecycle}/><ItemCard item={pair.right} part={part} threshold={threshold} lifecycle={lifecycle}/></div></section>)}{result.pairs.length === 0 && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center"><p className="text-2xl font-black text-emerald-900">Không tìm thấy cặp đáng ngờ</p><p className="mt-2 text-emerald-800">Thử giảm độ nhạy nếu bạn muốn review rộng hơn.</p></div>}</div>
  </div></main>;
}
