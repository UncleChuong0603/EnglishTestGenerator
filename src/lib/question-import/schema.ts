import { createHash } from "node:crypto";
import { z } from "zod";

export const IMPORT_SCHEMA_VERSION = "1.0";
export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
export const IMPORT_MAX_ITEMS = 500;
export const IMPORT_SOURCE_TYPES = ["ORIGINAL", "AI_ASSISTED_ORIGINAL", "LICENSED", "OTHER_APPROVED"] as const;
export const IMPORT_REVIEW_STATUSES = ["UNREVIEWED", "HUMAN_REVIEWED"] as const;
export const IMPORT_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const IMPORT_TAXONOMY: Record<number, Record<string, readonly string[]>> = {
  1: { photographs: ["visual_detail", "action", "location"] },
  2: { question_response: ["direct_response", "indirect_response", "intent"] },
  3: { conversation: ["detail", "inference", "purpose", "next_action", "graphic"] },
  4: { talk: ["detail", "inference", "purpose", "next_action", "graphic"] },
  5: { grammar: ["verb_tense","subject_verb_agreement","passive_voice","word_form","prepositions","conjunctions_connectors","relative_clauses","pronouns_determiners","gerunds_infinitives","comparatives","modifiers"], vocabulary: ["business_vocabulary","contextual_vocabulary","collocations","phrasal_expressions"] },
  6: { grammar: ["word_form","tense"], vocabulary: ["contextual_vocabulary"], cohesion: ["connectors","reference_words","logical_flow"], context: ["document_context"], sentence_insertion: ["sentence_fit"] },
  7: { detail: ["explicit_information"], inference: ["implied_information"], purpose: ["document_purpose"], vocabulary_in_context: ["word_meaning"], reference: ["referent"], sentence_placement: ["logical_position"], cross_text: ["information_synthesis"] },
};

const key = z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const media = z.object({ assetId: z.string().uuid().optional(), pending: z.boolean().optional(), altText: z.string().trim().max(500).optional() }).strict().refine((v) => Boolean(v.assetId) !== Boolean(v.pending), "Provide exactly one of assetId or pending=true");
const question = z.object({
  externalQuestionId: key,
  text: z.string().trim().max(5000),
  options: z.array(z.object({ key: z.enum(["A","B","C","D"]), text: z.string().trim().min(1).max(2000) }).strict()).min(3).max(4),
  correctOptionKey: z.enum(["A","B","C","D"]),
  explanation: z.object({ en: z.string().trim().min(1).max(5000), vi: z.string().trim().min(1).max(5000) }).strict(),
  skill: z.string().trim().min(1).max(80), subSkill: z.string().trim().min(1).max(80), difficulty: z.enum(IMPORT_DIFFICULTIES),
}).strict();
const item = z.object({
  externalItemId: key, part: z.number().int().min(1).max(7), title: z.string().trim().min(1).max(300),
  setType: z.enum(["photographs","question_response","conversation","talk","standalone","part6","single","double","triple"]),
  passages: z.array(z.object({ title: z.string().trim().max(300).optional(), content: z.string().trim().min(1).max(30000), documentType: z.string().trim().max(80).optional() }).strict()).max(3).default([]),
  transcript: z.string().trim().min(1).max(30000).optional(),
  media: z.object({ audio: media.optional(), image: media.optional() }).strict().optional(),
  questions: z.array(question).min(1).max(20),
}).strict();
export const importFileSchema = z.object({
  schemaVersion: z.literal(IMPORT_SCHEMA_VERSION),
  batch: z.object({ batchKey: key, name: z.string().trim().min(1).max(200), description: z.string().trim().max(2000).optional(), sourceType: z.enum(IMPORT_SOURCE_TYPES), rightsNote: z.string().trim().min(1).max(2000), author: z.string().trim().max(200).optional(), generator: z.string().trim().max(200).optional(), createdAt: z.string().datetime().optional(), language: z.enum(["en","vi","bilingual"]).default("bilingual"), contentVersion: z.string().trim().max(50).optional(), reviewStatus: z.enum(IMPORT_REVIEW_STATUSES) }).strict(),
  items: z.array(item).min(1).max(IMPORT_MAX_ITEMS),
}).strict();
export type QuestionImportFile = z.infer<typeof importFileSchema>;
export type ImportSeverity = "ERROR" | "WARNING" | "INFO";
export type ImportIssue = { severity: ImportSeverity; code: string; message: string; path?: string; importKey?: string; part?: number; group?: string };
export type ImportReport = { valid: boolean; schemaVersion?: string; batchName?: string; itemCount: number; questionCount: number; counts: Record<ImportSeverity, number>; issues: ImportIssue[]; summary: Record<string, number>; fingerprint?: string; parsed?: QuestionImportFile };

export const normalizeContent = (value: string) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").replace(/[^\p{L}\p{N} ]/gu, "").trim();
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export function itemFingerprint(item: QuestionImportFile["items"][number]) { return sha256(JSON.stringify({ part:item.part, passages:item.passages.map((p)=>normalizeContent(p.content)), transcript:normalizeContent(item.transcript??""), questions:item.questions.map((q)=>({ text:normalizeContent(q.text), options:q.options.map((o)=>normalizeContent(o.text)), answer:q.correctOptionKey })) })); }
export function batchFingerprint(file: QuestionImportFile) { return sha256(JSON.stringify({ schemaVersion:file.schemaVersion,batchKey:file.batch.batchKey,items:file.items.map((i)=>[i.externalItemId,itemFingerprint(i)]) })); }

function issue(issues: ImportIssue[], item: QuestionImportFile["items"][number], code: string, message: string, path?: string, severity: ImportSeverity = "ERROR") { issues.push({ severity, code, message, path, importKey:item.externalItemId, part:item.part, group:item.externalItemId }); }
export function validateImportValue(value: unknown): ImportReport {
  const parsed = importFileSchema.safeParse(value);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((e):ImportIssue=>({ severity:"ERROR", code:e.path[0]==="schemaVersion"?"UNSUPPORTED_SCHEMA_VERSION":"SCHEMA_VALIDATION_ERROR", message:e.message, path:e.path.join(".") }));
    return { valid:false,itemCount:0,questionCount:0,counts:{ERROR:issues.length,WARNING:0,INFO:0},issues,summary:{} };
  }
  const file=parsed.data, issues:ImportIssue[]=[]; const itemKeys=new Set<string>(), questionKeys=new Set<string>(), fingerprints=new Set<string>();
  for(const item of file.items){
    if(itemKeys.has(item.externalItemId)) issue(issues,item,"DUPLICATE_IN_BATCH","externalItemId bị lặp trong tệp.","externalItemId"); itemKeys.add(item.externalItemId);
    const fp=itemFingerprint(item); if(fingerprints.has(fp)) issue(issues,item,"DUPLICATE_IN_BATCH","Nội dung nhóm bị lặp trong tệp."); fingerprints.add(fp);
    const expectedType={1:"photographs",2:"question_response",3:"conversation",4:"talk",5:"standalone",6:"part6"}[item.part];
    if(expectedType && item.setType!==expectedType) issue(issues,item,"INVALID_SET_TYPE",`Part ${item.part} yêu cầu setType ${expectedType}.`,"setType");
    if(item.part===7 && !["single","double","triple"].includes(item.setType)) issue(issues,item,"INVALID_SET_TYPE","Part 7 yêu cầu single, double hoặc triple.","setType");
    const expectedQuestions=item.part===6?4:[3,4].includes(item.part)?3:1;
    if(item.part!==7 && item.questions.length!==expectedQuestions) issue(issues,item,"GROUP_SIZE_MISMATCH",`Part ${item.part} yêu cầu đúng ${expectedQuestions} câu hỏi.`,"questions");
    const expectedDocs=item.part===6?1:item.part===7?(item.setType==="double"?2:item.setType==="triple"?3:1):0;
    if(item.passages.length!==expectedDocs) issue(issues,item,"STIMULUS_COUNT_MISMATCH",`Cần đúng ${expectedDocs} passage.`,"passages");
    if(item.part<=4&&!item.transcript) issue(issues,item,"MISSING_TRANSCRIPT","Listening yêu cầu transcript.","transcript");
    if(item.part<=4&&!item.media?.audio) issue(issues,item,"MEDIA_PENDING","Chưa có audio; nhóm được nhập Draft nhưng không thể publish.","media.audio","WARNING");
    if(item.part===1&&!item.media?.image) issue(issues,item,"MEDIA_PENDING","Chưa có image; nhóm được nhập Draft nhưng không thể publish.","media.image","WARNING");
    for(const [index,q] of item.questions.entries()){
      if(questionKeys.has(q.externalQuestionId)) issue(issues,item,"DUPLICATE_IMPORT_KEY",`externalQuestionId ${q.externalQuestionId} bị lặp.`,`questions.${index}.externalQuestionId`); questionKeys.add(q.externalQuestionId);
      if(item.part>2&&!q.text) issue(issues,item,"MISSING_QUESTION_TEXT","Thiếu nội dung câu hỏi.",`questions.${index}.text`);
      const optionCount=item.part===2?3:4; if(q.options.length!==optionCount) issue(issues,item,"INVALID_OPTION_COUNT",`Cần đúng ${optionCount} lựa chọn.`,`questions.${index}.options`);
      const optionKeys=q.options.map((o)=>o.key); if(new Set(optionKeys).size!==optionKeys.length||new Set(q.options.map((o)=>normalizeContent(o.text))).size!==q.options.length) issue(issues,item,"DUPLICATE_OPTION","Key hoặc nội dung lựa chọn bị lặp.",`questions.${index}.options`);
      if(!optionKeys.includes(q.correctOptionKey)) issue(issues,item,"INVALID_CORRECT_ANSWER","Đáp án đúng không tồn tại trong options.",`questions.${index}.correctOptionKey`);
      if(!IMPORT_TAXONOMY[item.part]?.[q.skill]?.includes(q.subSkill)) issue(issues,item,"UNKNOWN_TAXONOMY",`Taxonomy ${q.skill}/${q.subSkill} không hợp lệ cho Part ${item.part}.`,`questions.${index}.subSkill`);
    }
  }
  const counts={ERROR:issues.filter((x)=>x.severity==="ERROR").length,WARNING:issues.filter((x)=>x.severity==="WARNING").length,INFO:issues.filter((x)=>x.severity==="INFO").length};
  return { valid:counts.ERROR===0,schemaVersion:file.schemaVersion,batchName:file.batch.name,itemCount:file.items.length,questionCount:file.items.reduce((n,i)=>n+i.questions.length,0),counts,issues,summary:Object.fromEntries([1,2,3,4,5,6,7].map((p)=>[`part${p}`,file.items.filter((i)=>i.part===p).reduce((n,i)=>n+i.questions.length,0)])),fingerprint:batchFingerprint(file),parsed:file };
}

export function parseAndValidateImport(text: string): ImportReport {
  if(Buffer.byteLength(text,"utf8")>IMPORT_MAX_BYTES) return {valid:false,itemCount:0,questionCount:0,counts:{ERROR:1,WARNING:0,INFO:0},issues:[{severity:"ERROR",code:"FILE_TOO_LARGE",message:`Tệp vượt giới hạn ${IMPORT_MAX_BYTES} bytes.`}],summary:{}};
  try{return validateImportValue(JSON.parse(text));}catch{return {valid:false,itemCount:0,questionCount:0,counts:{ERROR:1,WARNING:0,INFO:0},issues:[{severity:"ERROR",code:"MALFORMED_JSON",message:"JSON không hợp lệ."}],summary:{}};}
}

export const QUESTION_IMPORT_TEMPLATE = {
  schemaVersion: IMPORT_SCHEMA_VERSION,
  batch: { batchKey:"replace-with-unique-batch-key",name:"DEVELOPMENT / FORMAT EXAMPLE",description:"Replace all example content before production use.",sourceType:"AI_ASSISTED_ORIGINAL",rightsNote:"Operator confirms original, reviewed content and usage rights.",author:"Operator",generator:"External AI model (optional)",createdAt:"2026-09-19T00:00:00.000Z",language:"bilingual",contentVersion:"1",reviewStatus:"UNREVIEWED" },
  items:[{externalItemId:"P5-EXAMPLE-001",part:5,title:"DEVELOPMENT / FORMAT EXAMPLE — Part 5",setType:"standalone",passages:[],questions:[{externalQuestionId:"P5-EXAMPLE-001-Q1",text:"The manager _____ the report yesterday.",options:[{key:"A",text:"review"},{key:"B",text:"reviewed"},{key:"C",text:"reviewing"},{key:"D",text:"reviews"}],correctOptionKey:"B",explanation:{en:"The past-time marker requires simple past.",vi:"Dấu hiệu thời gian quá khứ yêu cầu thì quá khứ đơn."},skill:"grammar",subSkill:"verb_tense",difficulty:"easy"}]}]
} as const;
