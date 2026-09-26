import { archivePostAction } from "@/app/admin/posts/actions";
import { getPublicationQuality } from "@/lib/blog/service";
import { contentPath } from "@/lib/seo/routes";

export async function PublicationPanel({ id, slug, status, redirectPath, reviewedAt }: { id: string; slug: string; status: string; redirectPath: string | null; reviewedAt: Date | null }) {
  const quality = await getPublicationQuality(id);
  return <section className="mt-6 rounded-xl border bg-white p-5">
    <h2 className="text-lg font-black">Kiểm tra xuất bản và quản lý URL</h2>
    <p className="mt-2 font-mono text-sm">{contentPath(slug)} · {status}</p>
    <p className="mt-2 text-sm">{quality?.errors.length ? "Cần sửa trước khi xuất bản:" : "Đạt các kiểm tra nội dung hiện có. Khi xuất bản, server kiểm tra lại liên kết và ảnh."}</p>
    {quality?.errors.map(error => <p key={error} className="mt-1 text-sm text-red-800">{error}</p>)}
    {reviewedAt && <p className="mt-2 text-xs text-slate-500">Kiểm tra gần nhất: {reviewedAt.toLocaleString("vi-VN")}</p>}
    <form action={archivePostAction} className="mt-5 border-t pt-4">
      <input type="hidden" name="id" value={id} /><input type="hidden" name="slug" value={slug} />
      <label className="block text-sm font-bold">Chuyển hướng đến URL đang công khai (tùy chọn)<input className="mt-2 block w-full rounded-lg border p-3" name="redirectPath" defaultValue={redirectPath ?? ""} placeholder="/toeic/part-5" /></label>
      <p className="mt-2 text-sm text-slate-600">Lưu trữ giữ lại nội dung để sửa hoặc xuất bản lại. Điền URL đích để chuyển hướng vĩnh viễn; bỏ trống để gỡ trang khỏi website và sitemap.</p>
      <button className="mt-3 rounded-lg border border-amber-600 px-4 py-3 font-bold text-amber-900">Lưu trữ / áp dụng chuyển hướng</button>
    </form>
  </section>;
}
