"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import { BlogAdminError, deleteDraft, savePost, setPostPublished } from "@/lib/blog/service";
import { POST_CATEGORIES, slugify, type PostCategory } from "@/lib/blog/core";
function value(fd:FormData,key:string){return String(fd.get(key)??"").trim();}
function input(fd:FormData){const rawCategory=value(fd,"category");return {title:value(fd,"title"),slug:slugify(value(fd,"slug")||value(fd,"title")),excerpt:value(fd,"excerpt"),content:value(fd,"content"),category:(POST_CATEGORIES.includes(rawCategory as PostCategory)?rawCategory:"TOEIC_STRATEGY") as PostCategory,seoTitle:value(fd,"seoTitle"),seoDescription:value(fd,"seoDescription"),canonicalPath:value(fd,"canonicalPath"),coverMediaId:value(fd,"coverMediaId"),coverAlt:value(fd,"coverAlt"),socialTitle:value(fd,"socialTitle"),socialDescription:value(fd,"socialDescription"),authorName:value(fd,"authorName"),targetTopic:value(fd,"targetTopic"),searchIntent:value(fd,"searchIntent"),noindex:fd.get("noindex")==="on",tags:value(fd,"tags").split(",")};}
function refresh(slug?:string){revalidatePath("/blog");revalidatePath("/sitemap.xml");if(slug)revalidatePath(`/blog/${slug}`);}
export async function savePostAction(fd:FormData){const actor=await requireAdmin("CONTENT_MANAGE"),id=value(fd,"id");let saved="";try{saved=await savePost(actor.id,input(fd),id||undefined);refresh(value(fd,"slug"));}catch(e){const code=e instanceof BlogAdminError?e.code:"FAILED";redirect(`${id?`/admin/posts/${id}`:"/admin/posts/new"}?error=${encodeURIComponent(code)}`);}redirect(`/admin/posts/${saved}?saved=1`);}
export async function publishPostAction(fd:FormData){const actor=await requireAdmin("CONTENT_MANAGE"),id=value(fd,"id"),slug=value(fd,"slug");try{await setPostPublished(actor.id,id,true);refresh(slug);}catch(e){redirect(`/admin/posts/${id}?error=${encodeURIComponent(e instanceof BlogAdminError?e.code:"FAILED")}`);}redirect(`/admin/posts/${id}?published=1`);}
export async function unpublishPostAction(fd:FormData){const actor=await requireAdmin("CONTENT_MANAGE"),id=value(fd,"id"),slug=value(fd,"slug");await setPostPublished(actor.id,id,false);refresh(slug);redirect(`/admin/posts/${id}?unpublished=1`);}
export async function deletePostAction(fd:FormData){const actor=await requireAdmin("CONTENT_MANAGE");await deleteDraft(actor.id,value(fd,"id"));refresh(value(fd,"slug"));redirect("/admin/posts?deleted=1");}
