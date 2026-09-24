import { AdminNav } from "@/components/admin/admin-nav";
import { PostForm } from "@/components/admin/post-form";
import { requireAdmin } from "@/lib/admin/authorization";
import { getEditorialPost } from "@/lib/blog/editorial";
import { listPostSuggestions, listReadyCoverImages } from "@/lib/blog/service";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function NewPost({ searchParams }: { searchParams: Promise<{ editorial?: string; error?: string }> }) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const [prefs, images, suggestions, query] = await Promise.all([getPreferences(actor.id), listReadyCoverImages(), listPostSuggestions(), searchParams]);
  const editorial = query.editorial ? getEditorialPost(query.editorial) : null;
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-[1500px]"><AdminNav locale={prefs.interfaceLanguage}/><h1 className="mt-8 text-3xl font-black">{editorial ? "Đưa bài thư viện vào CMS" : "Bài viết mới"}</h1>
    {editorial && <p className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">Nội dung bài gốc đã được điền vào biểu mẫu. Lưu để tạo bản nháp, chỉnh sửa rồi xuất bản khi sẵn sàng.</p>}
    {query.error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-4 font-bold text-red-800">Không thể lưu bài viết: {query.error}</p>}
    <PostForm images={images} suggestions={suggestions} siteUrl={process.env.APP_URL??"http://localhost:3000"} initial={{title:editorial?.title??"",slug:editorial?.slug??"",excerpt:editorial?.excerpt??"",content:editorial?.content??"",category:editorial?.category??"TOEIC_STRATEGY",seoTitle:editorial?.seoTitle??"",seoDescription:editorial?.seoDescription??"",canonicalPath:editorial?.canonicalPath??"",coverMediaId:"",coverAlt:editorial?.coverAlt??"",socialTitle:editorial?.socialTitle??"",socialDescription:editorial?.socialDescription??"",authorName:editorial?.authorName??"",targetTopic:editorial?.targetTopic??"",searchIntent:editorial?.searchIntent??"",noindex:false,tags:editorial?.tags.map(tag=>tag.name).join(", ")??""}}/>
  </div></main>;
}
