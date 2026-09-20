import { requireAdmin } from "@/lib/admin/authorization";
import { POST_IMPORT_TEMPLATE } from "@/lib/blog/post-import";
export async function GET(){await requireAdmin("CONTENT_READ");return new Response(`${JSON.stringify(POST_IMPORT_TEMPLATE,null,2)}\n`,{headers:{"cache-control":"private, no-store","content-disposition":"attachment; filename=toeicgym-seo-post-v1.json","content-type":"application/json; charset=utf-8"}});}
