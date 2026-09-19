import { requireAdmin } from "@/lib/admin/authorization";
import { IMPORT_MAX_BYTES } from "@/lib/question-import/schema";
import { validateQuestionImport } from "@/lib/question-import/service";
export async function POST(request:Request){await requireAdmin("CONTENT_MANAGE");const length=Number(request.headers.get("content-length")??0);if(length>IMPORT_MAX_BYTES)return Response.json({error:"FILE_TOO_LARGE"},{status:413});const report=await validateQuestionImport(await request.text());const safe={...report};delete safe.parsed;return Response.json(safe,{status:report.valid?200:422});}
