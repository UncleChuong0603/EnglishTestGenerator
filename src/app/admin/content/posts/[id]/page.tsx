import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { PostForm } from "@/components/admin/post-form";
import { deletePostAction,publishPostAction,unpublishPostAction } from "../actions";
import { requireAdmin } from "@/lib/admin/authorization";
import { getPostById,listPostSuggestions,listReadyCoverImages } from "@/lib/blog/service";
import { STATUS_LABELS,type PostCategory } from "@/lib/blog/core";
import { getPreferences } from "@/lib/i18n/get-translations";
export default async function EditPost({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
  const actor=await requireAdmin("CONTENT_MANAGE"),prefs=await getPreferences(actor.id),{id}=await params,[post,images,suggestions]=await Promise.all([getPostById(id),listReadyCoverImages(),listPostSuggestions(id)]),query=await searchParams;
  if(!post)notFound();const hidden=<><input name="id" type="hidden" value={post.id}/><input name="slug" type="hidden" value={post.slug}/></>;
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-[1500px]"><AdminNav locale={prefs.interfaceLanguage}/><div className="mt-8 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">Chỉnh sửa bài viết</h1><p className="mt-2 font-bold text-slate-500">{STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]}</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-xl border bg-white px-4 py-3 font-bold" href={`/admin/content/posts/${id}/preview`}>Xem trước</Link>{post.status==="PUBLISHED"?<form action={unpublishPostAction}>{hidden}<button className="rounded-xl bg-amber-600 px-4 py-3 font-bold text-white">Gỡ xuất bản</button></form>:<form action={publishPostAction}>{hidden}<button className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white">Xuất bản bản đã lưu</button></form>}</div></div>
    {query.error&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-800">Không thể hoàn tất: {query.error}</p>}
    <PostForm images={images} suggestions={suggestions} siteUrl={process.env.APP_URL??"http://localhost:3000"} initial={{id:post.id,title:post.title,slug:post.slug,excerpt:post.excerpt,content:post.content,category:post.category as PostCategory,seoTitle:post.seoTitle??"",seoDescription:post.seoDescription??"",canonicalPath:post.canonicalPath??"",coverMediaId:post.coverMediaId??"",coverAlt:post.coverAlt??"",socialTitle:post.socialTitle??"",socialDescription:post.socialDescription??"",authorName:post.authorName??"",targetTopic:post.targetTopic??"",searchIntent:post.searchIntent??"",noindex:post.noindex,tags:post.tags.map(x=>x.name).join(", "),status:post.status as keyof typeof STATUS_LABELS,publishedAt:post.publishedAt?.toLocaleDateString("vi-VN"),updatedAt:post.updatedAt.toLocaleDateString("vi-VN")}}/>
    {post.status!=="PUBLISHED"&&<form action={deletePostAction} className="mt-8 border-t pt-6">{hidden}<button className="rounded-xl border border-red-300 px-4 py-3 font-bold text-red-700">Xóa bản nháp</button></form>}</div></main>;
}
