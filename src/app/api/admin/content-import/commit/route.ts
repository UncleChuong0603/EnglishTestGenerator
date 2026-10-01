import { after } from "next/server";
import { requireAdmin } from "@/lib/admin/authorization";
import { syncDuplicateQuestionReports } from "@/lib/admin/question-issue-reports";
import { ImportSizeError, readBoundedImport } from "@/lib/question-import/request";
import { commitQuestionImport, QuestionImportError, recordImportFailure } from "@/lib/question-import/service";
export async function POST(request:Request){const actor=await requireAdmin("CONTENT_MANAGE");const filename=(request.headers.get("x-import-filename")??"import.json").slice(0,255);try{const result=await commitQuestionImport(actor.id,filename,await readBoundedImport(request));after(async()=>{for(const part of result.parts)await syncDuplicateQuestionReports(part);});return Response.json(result);}catch(error){const code=error instanceof ImportSizeError?"FILE_TOO_LARGE":error instanceof QuestionImportError?error.code:"IMPORT_FAILED";await recordImportFailure(actor.id,code);return Response.json({error:code,report:error instanceof QuestionImportError?error.report:undefined},{status:error instanceof ImportSizeError?413:error instanceof QuestionImportError?422:500});}}
