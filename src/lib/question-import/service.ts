import "server-only";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, listeningTranscripts, mediaAssets, passages, passageSets, questionGroupMedia, questionImportBatches, questionImportItems, questionOptions, questions, questionSolutions } from "@/db/schema";
import { batchFingerprint, itemFingerprint, normalizeContent, parseAndValidateImport, type ImportIssue, type ImportReport, type QuestionImportFile } from "./schema";

function publicReport(report: ImportReport) { const safe={...report}; delete safe.parsed; return safe; }

export async function validateQuestionImport(text:string):Promise<ImportReport>{
  const report=parseAndValidateImport(text); if(!report.parsed||!report.valid) return report;
  const file=report.parsed, issues=[...report.issues];
  const fingerprint=batchFingerprint(file);
  const [sameBatch, imported, existingQuestions]=await Promise.all([
    db.select({id:questionImportBatches.id,batchKey:questionImportBatches.batchKey,fingerprint:questionImportBatches.fingerprint}).from(questionImportBatches).where(inArray(questionImportBatches.batchKey,[file.batch.batchKey])),
    db.select({fingerprint:questionImportItems.contentFingerprint}).from(questionImportItems).where(inArray(questionImportItems.contentFingerprint,file.items.map(itemFingerprint))),
    db.select({text:questions.questionText}).from(questions),
  ]);
  if(sameBatch.some(x=>x.fingerprint===fingerprint)) issues.push({severity:"ERROR",code:"ALREADY_IMPORTED",message:"Tệp này đã được import trước đó."});
  else if(sameBatch.length) issues.push({severity:"ERROR",code:"BATCH_KEY_CONFLICT",message:"batchKey đã được dùng cho một tệp khác."});
  const importedSet=new Set(imported.map((x)=>x.fingerprint)); const normalizedExisting=new Set(existingQuestions.map((x)=>normalizeContent(x.text)));
  for(const item of file.items){
    if(importedSet.has(itemFingerprint(item))) issues.push({severity:"ERROR",code:"DUPLICATE_EXISTING",message:"Nhóm nội dung đã được import.",importKey:item.externalItemId,part:item.part,group:item.externalItemId});
    else if(item.questions.some((q)=>normalizedExisting.has(normalizeContent(q.text)))) issues.push({severity:"WARNING",code:"POTENTIAL_CONTENT_DUPLICATE",message:"Có câu hỏi trùng nội dung chuẩn hóa với question bank hiện tại.",importKey:item.externalItemId,part:item.part,group:item.externalItemId});
  }
  const assetIds=file.items.flatMap((i)=>[i.media?.audio?.assetId,i.media?.image?.assetId]).filter((x):x is string=>Boolean(x));
  const assets=assetIds.length?await db.select().from(mediaAssets).where(inArray(mediaAssets.id,[...new Set(assetIds)])):[]; const assetMap=new Map(assets.map((a)=>[a.id,a]));
  for(const item of file.items) for(const [role,ref] of Object.entries(item.media??{})) if(ref?.assetId){const asset=assetMap.get(ref.assetId); const expected=role==="audio"?"AUDIO":"IMAGE"; if(!asset) issues.push(mediaIssue(item,"MEDIA_NOT_FOUND",`${role} asset không tồn tại.`,`media.${role}`)); else if(asset.kind!==expected) issues.push(mediaIssue(item,"MEDIA_TYPE_MISMATCH",`${role} tham chiếu asset loại ${asset.kind}.`,`media.${role}`)); else if(asset.status!=="READY"||asset.accessScope!=="CONTENT") issues.push(mediaIssue(item,"MEDIA_NOT_READY",`${role} asset chưa READY cho content.`,`media.${role}`));}
  const counts={ERROR:issues.filter((x)=>x.severity==="ERROR").length,WARNING:issues.filter((x)=>x.severity==="WARNING").length,INFO:issues.filter((x)=>x.severity==="INFO").length};
  return {...report,valid:counts.ERROR===0,counts,issues};
}
function mediaIssue(item:QuestionImportFile["items"][number],code:string,message:string,path:string):ImportIssue{return{severity:"ERROR",code,message,path,importKey:item.externalItemId,part:item.part,group:item.externalItemId};}

export async function commitQuestionImport(actorUserId:string,filename:string,text:string){
  const report=await validateQuestionImport(text); if(!report.valid||!report.parsed) throw new QuestionImportError("VALIDATION_FAILED",publicReport(report)); const file=report.parsed; const started=Date.now();
  return db.transaction(async(tx)=>{
    const [batch]=await tx.insert(questionImportBatches).values({batchKey:file.batch.batchKey,fingerprint:report.fingerprint!,filename:filename.slice(0,255)||"import.json",schemaVersion:file.schemaVersion,name:file.batch.name,sourceType:file.batch.sourceType,rightsNote:file.batch.rightsNote,author:file.batch.author,generator:file.batch.generator,reviewStatus:file.batch.reviewStatus,itemCount:file.items.length,questionCount:report.questionCount,warningCount:report.counts.WARNING,createdBy:actorUserId}).returning({id:questionImportBatches.id});
    let groups=0,stimuli=0;
    for(const item of file.items){
      const area=item.part<=4?"LISTENING":"READING";
      const [group]=await tx.insert(passageSets).values({toeicPart:item.part,skillArea:area,setType:item.setType,title:item.title,status:"draft",provenance:"ADMIN",metadata:{importBatchId:batch.id,externalItemId:item.externalItemId,sourceType:file.batch.sourceType,rightsNote:file.batch.rightsNote,reviewStatus:file.batch.reviewStatus}}).returning({id:passageSets.id}); groups++;
      const docs=item.passages.length?await tx.insert(passages).values(item.passages.map((p,index)=>({toeicPart:item.part,passageType:item.part===6?"text_completion":`${item.setType}_passage`,title:p.title??item.title,content:p.content,documentType:p.documentType??(item.part>=6?"article":null),status:"draft",passageSetId:group.id,position:index+1}))).returning({id:passages.id}):[]; stimuli+=docs.length;
      if(item.transcript) await tx.insert(listeningTranscripts).values({questionGroupId:group.id,content:item.transcript});
      for(const [index,q] of item.questions.entries()){
        const [created]=await tx.insert(questions).values({toeicPart:item.part,skillArea:area,questionType:item.setType,skill:q.skill,subSkill:q.subSkill,difficulty:q.difficulty,questionText:q.text,status:"draft",provenance:"ADMIN",passageSetId:group.id,passageId:docs[0]?.id??null,questionOrder:index+1,metadata:{externalQuestionId:q.externalQuestionId,importBatchId:batch.id}}).returning({id:questions.id});
        const opts=await tx.insert(questionOptions).values(q.options.map((o,i)=>({questionId:created.id,optionKey:o.key,optionText:o.text,displayOrder:i+1}))).returning({id:questionOptions.id, key:questionOptions.optionKey}); const answer=opts.find((o)=>o.key===q.correctOptionKey)!;
        await tx.insert(questionSolutions).values({questionId:created.id,correctOptionId:answer.id,explanationEn:q.explanation.en,explanationVi:q.explanation.vi});
      }
      for(const [role,ref] of Object.entries(item.media??{})) if(ref?.assetId) await tx.insert(questionGroupMedia).values({questionGroupId:group.id,mediaAssetId:ref.assetId,role:role.toUpperCase(),position:1,altText:ref.altText});
      await tx.insert(questionImportItems).values({importBatchId:batch.id,externalItemId:item.externalItemId,contentFingerprint:itemFingerprint(item),questionGroupId:group.id});
    }
    await tx.insert(adminAuditLogs).values({actorUserId,action:"IMPORT_COMMITTED",metadata:{importBatchId:batch.id,batchKey:file.batch.batchKey,schemaVersion:file.schemaVersion,itemCount:file.items.length,questionCount:report.questionCount,warningCount:report.counts.WARNING}});
    return {importId:batch.id,batchKey:file.batch.batchKey,questionsCreated:report.questionCount,groupsCreated:groups,stimuliCreated:stimuli,duplicatesSkipped:0,warnings:report.counts.WARNING,blockedItems:0,durationMs:Date.now()-started};
  });
}
export class QuestionImportError extends Error{constructor(readonly code:string,readonly report?:Omit<ImportReport,"parsed">){super(code)}}
export async function recordImportFailure(actorUserId:string,code:string){await db.insert(adminAuditLogs).values({actorUserId,action:"IMPORT_FAILED",metadata:{code:code.slice(0,80)}});}
export async function listImportHistory(){return db.select().from(questionImportBatches).orderBy(desc(questionImportBatches.createdAt)).limit(20);}
