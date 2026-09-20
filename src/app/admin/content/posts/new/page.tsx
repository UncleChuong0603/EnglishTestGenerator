import { AdminNav } from "@/components/admin/admin-nav";
import { PostForm } from "@/components/admin/post-form";
import { requireAdmin } from "@/lib/admin/authorization";
import { listPostSuggestions, listReadyCoverImages } from "@/lib/blog/service";
import { getPreferences } from "@/lib/i18n/get-translations";
export default async function NewPost(){const actor=await requireAdmin("CONTENT_MANAGE"),prefs=await getPreferences(actor.id),[images,suggestions]=await Promise.all([listReadyCoverImages(),listPostSuggestions()]);return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-[1500px]"><AdminNav locale={prefs.interfaceLanguage}/><h1 className="mt-8 text-3xl font-black">Bài viết mới</h1><PostForm images={images} suggestions={suggestions} siteUrl={process.env.APP_URL??"http://localhost:3000"} initial={{title:"",slug:"",excerpt:"",content:"",category:"TOEIC_STRATEGY",seoTitle:"",seoDescription:"",canonicalPath:"",coverMediaId:"",coverAlt:"",socialTitle:"",socialDescription:"",authorName:"",targetTopic:"",searchIntent:"",noindex:false,tags:""}}/></div></main>}
