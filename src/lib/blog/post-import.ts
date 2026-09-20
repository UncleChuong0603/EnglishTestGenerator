import { z } from "zod";
import { POST_CATEGORIES, slugify, type PostCategory } from "./core";

const optionalText = z.string().optional().default("");
const schema = z.object({
  schemaVersion: z.literal(1).optional(), title: z.string().trim().min(1, "Thiếu title"), slug: optionalText,
  excerpt: z.string().trim().min(1, "Thiếu excerpt").max(320, "excerpt tối đa 320 ký tự"),
  content: z.string().trim().min(1, "Thiếu content Markdown"), category: z.enum(POST_CATEGORIES).optional().default("TOEIC_STRATEGY"),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([]),
  seo: z.object({ title: optionalText, description: optionalText, canonicalPath: optionalText, noindex: z.boolean().optional().default(false) }).optional(),
  social: z.object({ title: optionalText, description: optionalText }).optional(),
  editorial: z.object({ authorName: optionalText, targetTopic: optionalText, searchIntent: optionalText }).optional(), cover: z.object({ alt: optionalText }).optional(),
  seoTitle: optionalText, seoDescription: optionalText, canonicalPath: optionalText, noindex: z.boolean().optional(), socialTitle: optionalText,
  socialDescription: optionalText, authorName: optionalText, targetTopic: optionalText, searchIntent: optionalText, coverAlt: optionalText,
}).strict();

export type ImportedPost = { title:string;slug:string;excerpt:string;content:string;category:PostCategory;tags:string;seoTitle:string;seoDescription:string;canonicalPath:string;noindex:boolean;socialTitle:string;socialDescription:string;authorName:string;targetTopic:string;searchIntent:string;coverAlt:string };

export function parsePostImport(text: string): ImportedPost {
  let json: unknown;
  try { json = JSON.parse(text); } catch { throw new Error("JSON không hợp lệ"); }
  const result = schema.safeParse(json);
  if (!result.success) throw new Error(result.error.issues.map((issue) => `${issue.path.join(".") || "JSON"}: ${issue.message}`).join("; "));
  const value = result.data, tags = (Array.isArray(value.tags) ? value.tags : value.tags.split(",")).map((tag) => tag.trim()).filter(Boolean);
  return { title:value.title,slug:slugify(value.slug||value.title),excerpt:value.excerpt,content:value.content,category:value.category,tags:[...new Set(tags)].join(", "),
    seoTitle:value.seo?.title||value.seoTitle,seoDescription:value.seo?.description||value.seoDescription,canonicalPath:value.seo?.canonicalPath||value.canonicalPath,noindex:value.seo?.noindex??value.noindex??false,
    socialTitle:value.social?.title||value.socialTitle,socialDescription:value.social?.description||value.socialDescription,authorName:value.editorial?.authorName||value.authorName,
    targetTopic:value.editorial?.targetTopic||value.targetTopic,searchIntent:value.editorial?.searchIntent||value.searchIntent,coverAlt:value.cover?.alt||value.coverAlt };
}

export const POST_IMPORT_TEMPLATE = { schemaVersion:1,title:"Cách tăng 100 điểm TOEIC trong 8 tuần",slug:"cach-tang-100-diem-toeic-trong-8-tuan",excerpt:"Lộ trình thực tế giúp người học TOEIC cải thiện 100 điểm trong 8 tuần.",content:"## Xác định điểm xuất phát\n\nNội dung bài viết ở định dạng **Markdown**.",category:"STUDY_PLAN",tags:["Lộ trình TOEIC","Tăng điểm TOEIC"],seo:{title:"Cách tăng 100 điểm TOEIC trong 8 tuần",description:"Lộ trình TOEIC 8 tuần kèm mục tiêu và cách luyện tập theo từng giai đoạn.",canonicalPath:"/blog/cach-tang-100-diem-toeic-trong-8-tuan",noindex:false},social:{title:"Lộ trình tăng 100 điểm TOEIC",description:"Kế hoạch học TOEIC thực tế trong 8 tuần."},editorial:{authorName:"TOEICGym",targetTopic:"tăng 100 điểm TOEIC",searchIntent:"Hướng dẫn"},cover:{alt:"Lộ trình học TOEIC trong 8 tuần"} } as const;
