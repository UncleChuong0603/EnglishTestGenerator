import Link from "next/link";
import { AdminFilterPanel } from "@/components/admin/admin-filter-panel";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { listAdminPosts, listAdminPostTags } from "@/lib/blog/service";
import { CATEGORY_LABELS, POST_CATEGORIES, STATUS_LABELS, type PostCategory, type PostStatus } from "@/lib/blog/core";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; issues?: string }> }) {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, rows, tagRows, filters] = await Promise.all([getPreferences(actor.id), listAdminPosts(), listAdminPostTags(), searchParams]);
  const q = (filters.q || "").trim().toLocaleLowerCase();
  const activeFilterCount = [filters.q, filters.status, filters.category, filters.issues].filter(Boolean).length;
  const tagMap = new Map<string, string[]>();
  for (const row of tagRows) tagMap.set(row.postId, [...(tagMap.get(row.postId) ?? []), row.name]);
  const cmsBySlug = new Map(rows.filter(row => row.source === "cms").map(row => [row.slug, row]));
  const issueCount = (row: (typeof rows)[number]) => Number(!row.seoDescription) + Number(row.source === "cms" && !row.coverMediaId);
  const visible = rows.filter(row =>
    (!q || `${row.title} ${row.slug} ${(row.source === "cms" ? tagMap.get(row.id) ?? [] : row.tags.map(tag => tag.name)).join(" ")}`.toLocaleLowerCase().includes(q)) &&
    (!filters.status || row.status === filters.status) &&
    (!filters.category || row.category === filters.category) &&
    (!filters.issues || (filters.issues === "yes" ? issueCount(row) > 0 : issueCount(row) === 0))
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-7xl">
    <AdminNav locale={prefs.interfaceLanguage} />
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-black">Bài viết SEO</h1><p className="mt-2 text-slate-600">Bài đang trên blog và bài soạn trong CMS cùng xuất hiện ở đây.</p></div><Link className="rounded-xl bg-teal-700 px-5 py-3 font-black text-white" href="/admin/content/posts/new">Bài viết mới</Link></div>
    <p className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">Bài “Thư viện” đang đi kèm mã nguồn. Chọn “Đưa vào CMS” để tạo bản nháp có thể sửa; khi xuất bản, bản CMS sẽ thay bản thư viện trên blog.</p>
    <AdminFilterPanel activeCount={activeFilterCount} clearHref="/admin/content/posts" clearLabel="Xóa bộ lọc" label="Bộ lọc"><form className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-4" action="/admin/content/posts">
      <label className="text-sm font-bold">Tìm tiêu đề hoặc slug<input className="mt-1 w-full rounded-lg border p-2" name="q" defaultValue={filters.q} /></label>
      <label className="text-sm font-bold">Trạng thái<select className="mt-1 w-full rounded-lg border p-2" name="status" defaultValue={filters.status}><option value="">Tất cả</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="text-sm font-bold">Danh mục<select className="mt-1 w-full rounded-lg border p-2" name="category" defaultValue={filters.category}><option value="">Tất cả</option>{POST_CATEGORIES.map(category => <option key={category} value={category}>{CATEGORY_LABELS[category].vi}</option>)}</select></label>
      <label className="text-sm font-bold">Gợi ý SEO<select className="mt-1 w-full rounded-lg border p-2" name="issues" defaultValue={filters.issues}><option value="">Tất cả</option><option value="yes">Có gợi ý</option><option value="no">Không có gợi ý cơ bản</option></select></label>
      <button className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white sm:col-span-4" type="submit">Lọc bài viết</button>
    </form></AdminFilterPanel>
    <div className="mt-5 overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-100"><tr>{["Bài viết", "Nguồn", "Trạng thái", "Danh mục", "Cập nhật", "SEO", "Thao tác"].map(label => <th className="p-4" key={label}>{label}</th>)}</tr></thead><tbody>{visible.map(row => {
      const cms = cmsBySlug.get(row.slug);
      const editHref = row.source === "cms" ? `/admin/content/posts/${row.id}` : cms ? `/admin/content/posts/${cms.id}` : `/admin/content/posts/new?editorial=${encodeURIComponent(row.slug)}`;
      const active = row.source === "cms" || !cms || cms.status === "DRAFT";
      const issues = issueCount(row);
      return <tr className="border-t" key={`${row.source}-${row.id}`}><td className="p-4"><Link className="font-bold text-teal-700" href={editHref}>{row.title}</Link><p className="mt-1 font-mono text-xs text-slate-500">/blog/{row.slug}</p></td><td className="p-4">{row.source === "editorial" ? "Thư viện" : "CMS"}</td><td className="p-4 font-bold">{row.source === "editorial" && !active ? "Đã thay thế / gỡ" : STATUS_LABELS[row.status as PostStatus]}</td><td className="p-4">{CATEGORY_LABELS[row.category as PostCategory]?.vi ?? row.category}</td><td className="p-4">{row.updatedAt.toLocaleDateString("vi-VN")}</td><td className="p-4">{issues ? `${issues} gợi ý cơ bản` : "Đủ thông tin cơ bản"}</td><td className="p-4">{row.source === "editorial" ? <><Link className="text-teal-700 underline" href={editHref}>{cms ? "Sửa bản CMS" : "Đưa vào CMS"}</Link>{active && <Link className="ml-3 text-slate-700 underline" href={`/blog/${row.slug}`}>Xem blog</Link>}</> : <Link className="text-teal-700 underline" href={`/admin/content/posts/${row.id}/preview`}>Xem trước</Link>}</td></tr>;
    })}</tbody></table>{!visible.length && <p className="p-10 text-center text-slate-500">Không tìm thấy bài viết.</p>}</div>
  </div></main>;
}
