import { requireAdmin } from "@/lib/admin/authorization";
import { QUESTION_IMPORT_TEMPLATE } from "@/lib/question-import/schema";
export async function GET(){await requireAdmin("CONTENT_READ");return new Response(`${JSON.stringify(QUESTION_IMPORT_TEMPLATE,null,2)}\n`,{headers:{"content-type":"application/json; charset=utf-8","content-disposition":"attachment; filename=toeicgym-question-import-v1.json","cache-control":"private, no-store"}});}
