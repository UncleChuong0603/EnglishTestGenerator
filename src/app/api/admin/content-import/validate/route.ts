import { requireAdmin } from "@/lib/admin/authorization";
import { ImportSizeError, readBoundedImport } from "@/lib/question-import/request";
import { validateQuestionImport } from "@/lib/question-import/service";
export async function POST(request:Request){await requireAdmin("CONTENT_MANAGE");try{const report=await validateQuestionImport(await readBoundedImport(request));const safe={...report};delete safe.parsed;return Response.json(safe,{status:report.valid?200:422});}catch(error){return Response.json({error:error instanceof ImportSizeError?"FILE_TOO_LARGE":"INVALID_UPLOAD"},{status:error instanceof ImportSizeError?413:400});}}
