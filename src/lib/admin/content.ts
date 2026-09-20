import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, listeningTranscripts, mediaAssets, passages, passageSets, questionGroupMedia, questionImportBatches, questionImportItems, questionOptions, questions, questionSolutions, rankedChallengeItems, rankedChallenges, userRoles, users } from "@/db/schema";
import { IMPORT_SCHEMA_VERSION, normalizeContent, sha256, validateImportValue, type QuestionImportFile } from "@/lib/question-import/schema";
import { assembleFullMock, assembleListeningMock, assembleReadingMock, type MockUnit } from "@/lib/full-mock/blueprint";
import { ROLE_PERMISSIONS } from "./permissions";

export const CONTENT_PAGE_SIZE = 20;
export const CONTENT_LIFECYCLES = ["draft", "published", "archived"] as const;
export const CONTENT_PROVENANCE = ["SEEDED", "ADMIN"] as const;
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type ContentLifecycle = typeof CONTENT_LIFECYCLES[number];
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Drizzle renders columns embedded in custom select SQL without their table qualifier.
// Correlated subqueries need the outer table name because their inner tables also have an id.
const outerPassageSetId = sql.raw('"passage_sets"."id"');

const TAXONOMY: Record<number, Record<string, readonly string[]>> = {
  1: { photographs: ["visual_detail", "action", "location"] },
  2: { question_response: ["direct_response", "indirect_response", "intent"] },
  3: { conversation: ["detail", "inference", "purpose", "next_action", "graphic"] },
  4: { talk: ["detail", "inference", "purpose", "next_action", "graphic"] },
  5: { grammar: ["verb_tense","subject_verb_agreement","passive_voice","word_form","prepositions","conjunctions_connectors","relative_clauses","pronouns_determiners","gerunds_infinitives","comparatives","modifiers"], vocabulary: ["business_vocabulary","contextual_vocabulary","collocations","phrasal_expressions"] },
  6: { grammar: ["word_form","tense"], vocabulary: ["contextual_vocabulary"], cohesion: ["connectors","reference_words","logical_flow"], context: ["document_context"], sentence_insertion: ["sentence_fit"] },
  7: { detail: ["explicit_information"], inference: ["implied_information"], purpose: ["document_purpose"], vocabulary_in_context: ["word_meaning"], reference: ["referent"], sentence_placement: ["logical_position"], cross_text: ["information_synthesis"] },
};
export function getAdminTaxonomy() { return TAXONOMY; }

export class ContentAdminError extends Error { constructor(readonly code: string, readonly issues: string[] = []) { super(code); } }
async function assertManage(tx: Tx, actorUserId: string) {
  const rows = await tx.select({ role: userRoles.role }).from(userRoles).innerJoin(users, eq(users.id, userRoles.userId)).where(and(eq(userRoles.userId, actorUserId), eq(users.status, "active"), sql`${userRoles.revokedAt} is null`));
  if (!rows.some((r) => r.role === "ADMIN" && ROLE_PERMISSIONS.ADMIN.includes("CONTENT_MANAGE"))) throw new ContentAdminError("ACCESS_DENIED");
}
const setTypeFor = (part: number, requested?: string) => part === 1 ? "photographs" : part === 2 ? "question_response" : part === 3 ? "conversation" : part === 4 ? "talk" : part === 6 ? "part6" : part === 7 && ["single","double","triple"].includes(requested ?? "") ? requested! : "standalone";
const passageTypeFor = (part: number, setType: string) => part === 1 ? "photo" : part === 3 ? "conversation" : part === 4 ? "talk" : part === 6 ? "text_completion" : `${setType}_passage`;

export type AdminDraftInput = { part: number; setType?: string; title: string; passage?: string; transcript?: string; mediaIds?: string[]; questions: Array<{ text: string; options: string[]; correct: number; explanationEn: string; explanationVi: string; skill: string; subSkill: string; difficulty: string }> };
export function validateDraftInput(input: AdminDraftInput) {
  const issues: string[] = []; const taxonomy = TAXONOMY[input.part];
  if (!taxonomy) issues.push("Phần TOEIC không hợp lệ.");
  if (!input.title.trim()) issues.push("Thiếu tiêu đề.");
  if (!input.questions.length) issues.push("Nhóm chưa có câu hỏi.");
  const expected = input.part === 6 ? 4 : [3,4].includes(input.part) ? 3 : null;
  if (expected && input.questions.length !== expected) issues.push(`P${input.part} yêu cầu đúng ${expected} câu hỏi.`);
  if ([6,7].includes(input.part) && !input.passage?.trim()) issues.push("Thiếu passage.");
  if (input.part === 7) { const expectedPassages = input.setType === "double" ? 2 : input.setType === "triple" ? 3 : 1; const actualPassages = input.passage?.split(/\r?\n---\r?\n/).filter((p) => p.trim()).length ?? 0; if (actualPassages !== expectedPassages) issues.push(`P7 ${input.setType} yêu cầu đúng ${expectedPassages} passage.`); }
  if (input.part <= 4 && !input.transcript?.trim()) issues.push("Thiếu transcript.");
  input.questions.forEach((q, index) => {
    const label = `Câu ${index + 1}`;
    if (!q.text.trim() && input.part > 2) issues.push(`${label}: thiếu nội dung.`);
    const requiredOptions = input.part === 2 ? 3 : 4;
    if (q.options.length !== requiredOptions || q.options.some((o) => !o.trim())) issues.push(`${label}: cần đúng ${requiredOptions} lựa chọn.`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) issues.push(`${label}: đáp án đúng không hợp lệ.`);
    if (!q.explanationEn.trim() || !q.explanationVi.trim()) issues.push(`${label}: thiếu giải thích EN/VI.`);
    if (!taxonomy?.[q.skill]?.includes(q.subSkill)) issues.push(`${label}: taxonomy không hợp lệ.`);
    if (!(DIFFICULTIES as readonly string[]).includes(q.difficulty)) issues.push(`${label}: độ khó không hợp lệ.`);
  });
  if (input.part === 7 && !["single","double","triple"].includes(input.setType ?? "")) issues.push("Cấu trúc P7 không hợp lệ.");
  return issues;
}

export async function createAdminDraft(actorUserId: string, input: AdminDraftInput) {
  if (!Number.isInteger(input.part) || input.part < 1 || input.part > 7) throw new ContentAdminError("INVALID_PART");
  return db.transaction(async (tx) => {
    await assertManage(tx, actorUserId); const setType = setTypeFor(input.part, input.setType); const area = input.part <= 4 ? "LISTENING" : "READING";
    const duplicate = await tx.select({ id: passageSets.id }).from(passageSets).where(and(eq(passageSets.provenance, "ADMIN"), ilike(passageSets.title, input.title.trim()))).limit(1);
    const [group] = await tx.insert(passageSets).values({ toeicPart: input.part, skillArea: area, setType, title: input.title.trim(), status: "draft", provenance: "ADMIN", metadata: duplicate.length ? { duplicateWarning: duplicate[0].id } : {} }).returning();
    let passageId: string | null = null;
    if (input.passage?.trim()) { const documents = input.part === 7 ? input.passage.split(/\r?\n---\r?\n/).map((p) => p.trim()).filter(Boolean) : [input.passage.trim()]; const created = await tx.insert(passages).values(documents.map((content, index) => ({ toeicPart: input.part, passageType: passageTypeFor(input.part, setType), title: input.title.trim(), content, status: "draft", passageSetId: group.id, position: index + 1, documentType: input.part >= 6 ? "article" : null }))).returning({ id: passages.id }); passageId = created[0]?.id ?? null; }
    if (input.transcript?.trim()) await tx.insert(listeningTranscripts).values({ questionGroupId: group.id, content: input.transcript.trim() });
    for (const [index, q] of input.questions.entries()) {
      const [row] = await tx.insert(questions).values({ toeicPart: input.part, skillArea: area, questionType: setType, skill: q.skill, subSkill: q.subSkill, difficulty: q.difficulty, questionText: q.text.trim(), status: "draft", provenance: "ADMIN", passageSetId: group.id, passageId, questionOrder: index + 1 }).returning({ id: questions.id });
      const opts = await tx.insert(questionOptions).values(q.options.map((text, i) => ({ questionId: row.id, optionKey: String.fromCharCode(65 + i), optionText: text.trim(), displayOrder: i + 1 }))).returning();
      if (opts[q.correct]) await tx.insert(questionSolutions).values({ questionId: row.id, correctOptionId: opts[q.correct].id, explanationEn: q.explanationEn.trim(), explanationVi: q.explanationVi.trim() });
    }
    for (const id of [...new Set(input.mediaIds ?? [])]) { const [asset] = await tx.select().from(mediaAssets).where(and(eq(mediaAssets.id, id), eq(mediaAssets.status, "READY"), eq(mediaAssets.accessScope, "CONTENT"))).limit(1); if (!asset) throw new ContentAdminError("MEDIA_NOT_READY"); await tx.insert(questionGroupMedia).values({ questionGroupId: group.id, mediaAssetId: id, role: asset.kind, position: 1 }).onConflictDoNothing(); }
    await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_DRAFT_CREATED", metadata: { groupId: group.id, domain: area, part: input.part } });
    return group.id;
  });
}

export async function getAdminContentDetail(id: string) {
  const [group] = await db.select().from(passageSets).where(eq(passageSets.id, id)).limit(1); if (!group) return null;
  const [docs, qs, transcripts, media] = await Promise.all([db.select().from(passages).where(eq(passages.passageSetId, id)).orderBy(asc(passages.position)), db.select().from(questions).where(eq(questions.passageSetId, id)).orderBy(asc(questions.questionOrder)), db.select().from(listeningTranscripts).where(eq(listeningTranscripts.questionGroupId, id)), db.select({ asset: mediaAssets, role: questionGroupMedia.role }).from(questionGroupMedia).innerJoin(mediaAssets, eq(mediaAssets.id, questionGroupMedia.mediaAssetId)).where(eq(questionGroupMedia.questionGroupId, id))]);
  const ids = qs.map((q) => q.id); const [opts, sols] = ids.length ? await Promise.all([db.select().from(questionOptions).where(inArray(questionOptions.questionId, ids)).orderBy(asc(questionOptions.displayOrder)), db.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids))]) : [[], []];
  return { group, passages: docs, transcript: transcripts[0] ?? null, media, questions: qs.map((q) => ({ ...q, options: opts.filter((o) => o.questionId === q.id), solution: sols.find((s) => s.questionId === q.id) ?? null })) };
}

export async function updateDraftQuestion(actorUserId:string,input:{groupId:string;questionId:string;updatedAt:string;text:string;options:string[];correct:number;explanationEn:string;explanationVi:string;skill:string;subSkill:string;difficulty:string}){return db.transaction(async tx=>{await assertManage(tx,actorUserId);const[g]=await tx.select().from(passageSets).where(eq(passageSets.id,input.groupId)).for("update").limit(1);if(!g||g.status!=="draft")throw new ContentAdminError("PUBLISHED_CONTENT_IMMUTABLE");if(g.updatedAt.toISOString()!==input.updatedAt)throw new ContentAdminError("STALE_CONTENT");const[q]=await tx.select().from(questions).where(and(eq(questions.id,input.questionId),eq(questions.passageSetId,g.id),eq(questions.status,"draft"))).limit(1);if(!q)throw new ContentAdminError("NOT_FOUND");const tax=TAXONOMY[g.toeicPart];if(!tax?.[input.skill]?.includes(input.subSkill)||!(DIFFICULTIES as readonly string[]).includes(input.difficulty))throw new ContentAdminError("INVALID_TAXONOMY");const opts=await tx.select().from(questionOptions).where(eq(questionOptions.questionId,q.id)).orderBy(asc(questionOptions.displayOrder));if(opts.length!==input.options.length||input.options.some(x=>!x.trim())||!opts[input.correct])throw new ContentAdminError("INVALID_OPTIONS");const now=new Date();await tx.update(questions).set({questionText:input.text.trim(),skill:input.skill,subSkill:input.subSkill,difficulty:input.difficulty,updatedAt:now}).where(eq(questions.id,q.id));for(let i=0;i<opts.length;i++)await tx.update(questionOptions).set({optionText:input.options[i].trim()}).where(eq(questionOptions.id,opts[i].id));await tx.update(questionSolutions).set({correctOptionId:opts[input.correct].id,explanationEn:input.explanationEn.trim(),explanationVi:input.explanationVi.trim(),updatedAt:now}).where(eq(questionSolutions.questionId,q.id));await tx.update(passageSets).set({updatedAt:now}).where(eq(passageSets.id,g.id));await tx.insert(adminAuditLogs).values({actorUserId,action:"CONTENT_DRAFT_UPDATED",metadata:{groupId:g.id,questionId:q.id}});});}

export async function validateContent(id: string) { const d = await getAdminContentDetail(id); if (!d) throw new ContentAdminError("NOT_FOUND"); const input: AdminDraftInput = { part: d.group.toeicPart, setType: d.group.setType, title: d.group.title, passage: d.passages.map((p) => p.content ?? "").join("\n"), transcript: d.transcript?.content, questions: d.questions.map((q) => ({ text: q.questionText, options: q.options.map((o) => o.optionText), correct: q.options.findIndex((o) => o.id === q.solution?.correctOptionId), explanationEn: q.solution?.explanationEn ?? "", explanationVi: q.solution?.explanationVi ?? "", skill: q.skill, subSkill: q.subSkill, difficulty: q.difficulty })) }; const issues = validateDraftInput(input); if (d.group.toeicPart <= 4) { const required = d.group.toeicPart === 1 ? ["AUDIO","IMAGE"] : ["AUDIO"]; const present = new Set(d.media.filter((m) => m.asset.status === "READY").map((m) => m.role)); required.forEach((r) => { if (!present.has(r)) issues.push(`Thiếu media ${r}.`); }); } return issues; }

export async function publishContent(actorUserId: string, id: string, expectedUpdatedAt?: string) { return db.transaction(async (tx) => { await assertManage(tx, actorUserId); const [g] = await tx.select().from(passageSets).where(eq(passageSets.id, id)).for("update").limit(1); if (!g) throw new ContentAdminError("NOT_FOUND"); if (g.status === "published") return false; if (g.status !== "draft") throw new ContentAdminError("INVALID_LIFECYCLE"); if (expectedUpdatedAt && g.updatedAt.toISOString() !== expectedUpdatedAt) throw new ContentAdminError("STALE_CONTENT"); const issues = await validateContent(id); if (issues.length) throw new ContentAdminError("VALIDATION_FAILED", issues); const now = new Date(); await tx.update(passageSets).set({ status: "published", publishedAt: now, updatedAt: now }).where(and(eq(passageSets.id, id), eq(passageSets.status, "draft"))); await tx.update(passages).set({ status: "published", updatedAt: now }).where(eq(passages.passageSetId, id)); await tx.update(questions).set({ status: "published", publishedAt: now, updatedAt: now }).where(and(eq(questions.passageSetId, id), eq(questions.status, "draft"))); await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_PUBLISHED", metadata: { groupId: id, part: g.toeicPart, previousLifecycle: "draft", newLifecycle: "published" } }); return true; }); }

async function allPublishedUnits(tx: Tx, excluding?: string) {
  const [rows, standalone] = await Promise.all([
    tx.select({ id: passageSets.id, part: passageSets.toeicPart, setType: passageSets.setType, qid: questions.id }).from(passageSets).innerJoin(questions, and(eq(questions.passageSetId, passageSets.id), eq(questions.status, "published"))).where(and(eq(passageSets.status, "published"), excluding ? sql`${passageSets.id} <> ${excluding}` : undefined)),
    tx.select({ id: questions.id }).from(questions).where(and(eq(questions.toeicPart, 5), eq(questions.status, "published"), sql`${questions.passageSetId} is null`)),
  ]);
  const map = new Map<string, MockUnit>();
  for (const row of rows) {
    const type = row.part === 1 ? "photographs" : row.part === 2 ? "question_response" : row.part === 3 ? "conversation" : row.part === 4 ? "talk" : row.setType;
    const unit = map.get(row.id) ?? { id: row.id, part: row.part as MockUnit["part"], setType: type as MockUnit["setType"], questionIds: [] };
    unit.questionIds.push(row.qid); map.set(row.id, unit);
  }
  return [...map.values(), ...standalone.map((row) => ({ id: row.id, part: 5 as const, setType: "standalone" as const, questionIds: [row.id] }))];
}
export async function archiveContent(actorUserId: string, id: string, expectedUpdatedAt?: string) {
  return db.transaction(async (tx) => {
    await assertManage(tx, actorUserId);
    const [group] = await tx.select().from(passageSets).where(eq(passageSets.id, id)).for("update").limit(1);
    if (!group) throw new ContentAdminError("NOT_FOUND");
    if (group.status !== "published") throw new ContentAdminError("INVALID_LIFECYCLE");
    if (expectedUpdatedAt && group.updatedAt.toISOString() !== expectedUpdatedAt) throw new ContentAdminError("STALE_CONTENT");
    const [active] = await tx.select({ id: rankedChallengeItems.challengeId })
      .from(rankedChallengeItems)
      .innerJoin(rankedChallenges, eq(rankedChallenges.id, rankedChallengeItems.challengeId))
      .where(and(eq(rankedChallengeItems.groupId, id), eq(rankedChallenges.status, "PUBLISHED"), sql`${rankedChallenges.endsAt} > now()`))
      .limit(1);
    if (active) throw new ContentAdminError("CONTENT_USED_BY_ACTIVE_CHALLENGE");
    if (!assembleFullMock(await allPublishedUnits(tx, id))) throw new ContentAdminError("CONTENT_REQUIRED_FOR_FULL_MOCK");
    const now = new Date();
    await tx.update(passageSets).set({ status: "archived", archivedAt: now, updatedAt: now }).where(eq(passageSets.id, id));
    await tx.update(passages).set({ status: "archived", updatedAt: now }).where(eq(passages.passageSetId, id));
    await tx.update(questions).set({ status: "archived", archivedAt: now, updatedAt: now }).where(eq(questions.passageSetId, id));
    await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_ARCHIVED", metadata: { groupId: id, part: group.toeicPart, previousLifecycle: "published", newLifecycle: "archived" } });
  });
}

export async function cloneContent(actorUserId: string, id: string) { const source = await getAdminContentDetail(id); if (!source) throw new ContentAdminError("NOT_FOUND"); const newId = await createAdminDraft(actorUserId, { part: source.group.toeicPart, setType: source.group.setType, title: `${source.group.title} (copy)`, passage: source.passages.map((p) => p.content ?? "").join("\n\n"), transcript: source.transcript?.content, mediaIds: source.media.map((m) => m.asset.id), questions: source.questions.map((q) => ({ text: q.questionText, options: q.options.map((o) => o.optionText), correct: Math.max(0, q.options.findIndex((o) => o.id === q.solution?.correctOptionId)), explanationEn: q.solution?.explanationEn ?? "", explanationVi: q.solution?.explanationVi ?? "", skill: q.skill, subSkill: q.subSkill, difficulty: q.difficulty })) }); await db.transaction(async (tx) => { await tx.update(passageSets).set({ revisionOfId: id }).where(eq(passageSets.id, newId)); await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_CLONED", metadata: { sourceGroupId: id, groupId: newId } }); }); return newId; }
export async function discardDraft(actorUserId: string, id: string) { return db.transaction(async (tx) => { await assertManage(tx, actorUserId); const [g] = await tx.select().from(passageSets).where(eq(passageSets.id, id)).for("update").limit(1); if (!g || g.status !== "draft") throw new ContentAdminError("INVALID_LIFECYCLE"); const now = new Date(); await tx.update(passageSets).set({ status: "archived", archivedAt: now, updatedAt: now }).where(eq(passageSets.id, id)); await tx.update(passages).set({ status: "archived", updatedAt: now }).where(eq(passages.passageSetId, id)); await tx.update(questions).set({ status: "archived", archivedAt: now, updatedAt: now }).where(eq(questions.passageSetId, id)); await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_DRAFT_DISCARDED", metadata: { groupId: id } }); }); }

export async function listAdminContent(filters: { search?: string; domain?: string; part?: number; lifecycle?: string; difficulty?: string; skill?: string; subSkill?: string; provenance?: string; batch?: string; setType?: string; page?: number }) { const page = Math.max(1, filters.page ?? 1); const conditions = []; if (filters.domain) conditions.push(eq(passageSets.skillArea, filters.domain)); if (filters.part) conditions.push(eq(passageSets.toeicPart, filters.part)); if (filters.setType === "single") conditions.push(eq(passageSets.setType, "single")); if (filters.setType === "multiple") conditions.push(sql`${passageSets.setType} in ('double', 'triple')`); if (filters.lifecycle) conditions.push(eq(passageSets.status, filters.lifecycle)); if (filters.provenance) conditions.push(eq(passageSets.provenance, filters.provenance)); if (filters.batch) conditions.push(sql`exists(select 1 from question_import_items qi join question_import_batches qb on qb.id=qi.import_batch_id where qi.question_group_id=${outerPassageSetId} and qb.batch_key=${filters.batch})`); if (filters.search?.trim()) { const q = `%${filters.search.trim().slice(0, 200)}%`; conditions.push(or(ilike(passageSets.title, q), sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and (qx.question_text ilike ${q} or qx.id::text ilike ${q}))`)!); } if (filters.difficulty) conditions.push(sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and qx.difficulty=${filters.difficulty})`); if (filters.skill) conditions.push(sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and qx.skill=${filters.skill})`); if (filters.subSkill) conditions.push(sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and qx.sub_skill=${filters.subSkill})`); const where = conditions.length ? and(...conditions) : undefined; const [rows, totals] = await Promise.all([db.select({ id: passageSets.id, title: passageSets.title, part: passageSets.toeicPart, domain: passageSets.skillArea, setType: passageSets.setType, lifecycle: passageSets.status, provenance: passageSets.provenance, updatedAt: passageSets.updatedAt, questions: sql<number>`(select count(*)::int from questions q where q.passage_set_id=${outerPassageSetId})`, batchKey: sql<string|null>`(select qb.batch_key from question_import_items qi join question_import_batches qb on qb.id=qi.import_batch_id where qi.question_group_id=${outerPassageSetId} limit 1)` }).from(passageSets).where(where).orderBy(desc(passageSets.updatedAt), desc(passageSets.id)).limit(CONTENT_PAGE_SIZE).offset((page - 1) * CONTENT_PAGE_SIZE), db.select({ value: count(), questions: sql<number>`coalesce(sum((select count(*) from questions q where q.passage_set_id=${outerPassageSetId})),0)::int` }).from(passageSets).where(where)]); return { rows, total: Number(totals[0].value), totalQuestions: Number(totals[0].questions), page, pageSize: CONTENT_PAGE_SIZE }; }
export async function getContentOverview() { const [lifecycle, unitRows] = await Promise.all([db.select({ status: passageSets.status, value: count() }).from(passageSets).groupBy(passageSets.status), db.select({ id: passageSets.id, part: passageSets.toeicPart, area: passageSets.skillArea, setType: passageSets.setType, qid: questions.id }).from(passageSets).innerJoin(questions, and(eq(questions.passageSetId, passageSets.id), eq(questions.status, "published"))).where(eq(passageSets.status, "published"))]); const grouped = new Map<string, typeof unitRows>(); unitRows.forEach((r) => grouped.set(r.id, [...(grouped.get(r.id) ?? []), r])); const units: MockUnit[] = [...grouped].map(([id, rs]) => ({ id, part: rs[0].part as MockUnit["part"], setType: (rs[0].part === 1 ? "photographs" : rs[0].part === 2 ? "question_response" : rs[0].part === 3 ? "conversation" : rs[0].part === 4 ? "talk" : rs[0].part === 5 ? "standalone" : rs[0].setType) as MockUnit["setType"], questionIds: rs.map((r) => r.qid) })); const listeningReady=Boolean(assembleListeningMock(units)),readingReady=Boolean(assembleReadingMock(units)),form = assembleFullMock(units); const countPart = (part: number) => units.filter((u) => u.part === part); const p7s = units.filter((u) => u.part === 7 && u.setType === "single"), p7m = units.filter((u) => u.part === 7 && u.setType !== "single"); return { lifecycle: Object.fromEntries(lifecycle.map((r) => [r.status, Number(r.value)])), ready: Boolean(form), listeningReady, readingReady, listening: { p1: countPart(1).length, p2: countPart(2).length, p3Groups: countPart(3).filter((u) => u.questionIds.length === 3).length, p3Questions: countPart(3).flatMap((u) => u.questionIds).length, p4Groups: countPart(4).filter((u) => u.questionIds.length === 3).length, p4Questions: countPart(4).flatMap((u) => u.questionIds).length }, reading: { p5: countPart(5).flatMap((u) => u.questionIds).length, p6Groups: countPart(6).filter((u) => u.questionIds.length === 4).length, p6Questions: countPart(6).flatMap((u) => u.questionIds).length, p7SingleGroups: p7s.length, p7SingleQuestions: p7s.flatMap((u) => u.questionIds).length, p7MultipleGroups: p7m.length, p7MultipleQuestions: p7m.flatMap((u) => u.questionIds).length, p7SingleFeasible: Boolean(assembleReadingMock([...units.filter((u) => u.part !== 7), ...p7s, ...p7m])), p7MultipleFeasible: readingReady } }; }

export async function listAdminMedia(page = 1) { const safe = Math.max(1, page); const rows = await db.select({ id: mediaAssets.id, kind: mediaAssets.kind, mimeType: mediaAssets.mimeType, byteSize: mediaAssets.byteSize, status: mediaAssets.status, duration: mediaAssets.audioDurationMs, width: mediaAssets.imageWidth, height: mediaAssets.imageHeight, createdAt: mediaAssets.createdAt, references: sql<number>`((select count(*) from question_group_media g where g.media_asset_id=${mediaAssets.id}) + (select count(*) from stimulus_media s where s.media_asset_id=${mediaAssets.id}) + (select count(*) from listening_transcripts t where t.media_asset_id=${mediaAssets.id}))::int`, publishedReferences: sql<number>`(select count(*) from question_group_media gm join passage_sets ps on ps.id=gm.question_group_id where gm.media_asset_id=${mediaAssets.id} and ps.status in ('published','archived'))::int` }).from(mediaAssets).orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id)).limit(CONTENT_PAGE_SIZE).offset((safe - 1) * CONTENT_PAGE_SIZE); const [total] = await db.select({ value: count() }).from(mediaAssets); return { rows, total: Number(total.value), page: safe, pageSize: CONTENT_PAGE_SIZE }; }

export type ReviewFilters = { domain?: string; part?: number; setType?: string; lifecycle?: string; difficulty?: string; skill?: string; subSkill?: string; provenance?: string; batch?: string; search?: string };

function reviewConditions(filters: ReviewFilters) {
  const conditions = [];
  if (filters.domain) conditions.push(eq(passageSets.skillArea, filters.domain));
  if (filters.part) conditions.push(eq(passageSets.toeicPart, filters.part));
  if (filters.setType === "single") conditions.push(eq(passageSets.setType, "single"));
  if (filters.setType === "multiple") conditions.push(sql`${passageSets.setType} in ('double', 'triple')`);
  if (filters.search?.trim()) { const q = `%${filters.search.trim().slice(0, 200)}%`; conditions.push(or(ilike(passageSets.title, q), sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and qx.question_text ilike ${q})`)!); }
  if (filters.lifecycle) conditions.push(eq(passageSets.status, filters.lifecycle));
  if (filters.provenance) conditions.push(eq(passageSets.provenance, filters.provenance));
  if (filters.difficulty) conditions.push(sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and qx.difficulty=${filters.difficulty})`);
  if (filters.skill) conditions.push(sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and qx.skill=${filters.skill})`);
  if (filters.subSkill) conditions.push(sql`exists(select 1 from questions qx where qx.passage_set_id=${outerPassageSetId} and qx.sub_skill=${filters.subSkill})`);
  if (filters.batch) conditions.push(sql`exists(select 1 from question_import_items qi join question_import_batches qb on qb.id=qi.import_batch_id where qi.question_group_id=${outerPassageSetId} and qb.batch_key=${filters.batch})`);
  return conditions.length ? and(...conditions) : undefined;
}

export async function getReviewQueue(currentId: string, filters: ReviewFilters) {
  const rows = await db.select({ id: passageSets.id, title: passageSets.title }).from(passageSets)
    .where(reviewConditions(filters)).orderBy(asc(passageSets.toeicPart), asc(passageSets.createdAt), asc(passageSets.id));
  const index = rows.findIndex((row) => row.id === currentId);
  return { total: rows.length, position: index < 0 ? null : index + 1, previous: index > 0 ? rows[index - 1] : null, next: index >= 0 && index + 1 < rows.length ? rows[index + 1] : null };
}

export async function getImportContextForGroup(groupId: string) {
  const [row] = await db.select({ id: questionImportBatches.id, batchKey: questionImportBatches.batchKey, name: questionImportBatches.name, externalItemId: questionImportItems.externalItemId })
    .from(questionImportItems).innerJoin(questionImportBatches, eq(questionImportBatches.id, questionImportItems.importBatchId))
    .where(eq(questionImportItems.questionGroupId, groupId)).limit(1);
  return row ?? null;
}

export async function getImportBatchSummary(batchKey: string) {
  const [batch] = await db.select({ batch: questionImportBatches, importedBy: users.email }).from(questionImportBatches)
    .innerJoin(users, eq(users.id, questionImportBatches.createdBy)).where(eq(questionImportBatches.batchKey, batchKey)).limit(1);
  if (!batch) return null;
  const items = await db.select({ groupId: passageSets.id, title: passageSets.title, part: passageSets.toeicPart, status: passageSets.status, updatedAt: passageSets.updatedAt, externalItemId: questionImportItems.externalItemId })
    .from(questionImportItems).innerJoin(passageSets, eq(passageSets.id, questionImportItems.questionGroupId))
    .where(eq(questionImportItems.importBatchId, batch.batch.id)).orderBy(asc(passageSets.toeicPart), asc(questionImportItems.createdAt), asc(passageSets.id));
  const validations = await Promise.all(items.map(async (item) => ({ groupId: item.groupId, issues: item.status === "draft" ? await validateContent(item.groupId) : [] })));
  const blocked = validations.filter((item) => item.issues.length);
  return {
    ...batch.batch, importedBy: batch.importedBy, items, validations,
    counts: { imported: items.length, draft: items.filter((i) => i.status === "draft").length, published: items.filter((i) => i.status === "published").length, archived: items.filter((i) => i.status === "archived").length, blocked: blocked.length },
    partDistribution: Object.fromEntries([1,2,3,4,5,6,7].map((part) => [part, items.filter((i) => i.part === part).length])),
    valid: blocked.length === 0,
  };
}

export async function publishImportBatch(actorUserId: string, batchKey: string) {
  await db.transaction(async (tx) => { await assertManage(tx, actorUserId); });
  const summary = await getImportBatchSummary(batchKey);
  if (!summary) throw new ContentAdminError("BATCH_NOT_FOUND");
  const drafts = summary.items.filter((item) => item.status === "draft");
  if (!drafts.length) return { published: 0 };
  const failures = summary.validations.filter((item) => item.issues.length);
  if (failures.length) throw new ContentAdminError("BATCH_VALIDATION_FAILED", failures.flatMap((item) => item.issues.map((issue) => `${item.groupId}: ${issue}`)));
  return db.transaction(async (tx) => {
    await assertManage(tx, actorUserId);
    const locked = await tx.select({ id: passageSets.id, status: passageSets.status, updatedAt: passageSets.updatedAt }).from(passageSets).where(inArray(passageSets.id, drafts.map((item) => item.groupId))).for("update");
    if (locked.length !== drafts.length || locked.some((item) => item.status !== "draft" || item.updatedAt.toISOString() !== drafts.find((draft) => draft.groupId === item.id)?.updatedAt.toISOString())) throw new ContentAdminError("BATCH_CHANGED_RETRY");
    const now = new Date(); const ids = locked.map((item) => item.id);
    await tx.update(passageSets).set({ status: "published", publishedAt: now, updatedAt: now }).where(inArray(passageSets.id, ids));
    await tx.update(passages).set({ status: "published", updatedAt: now }).where(inArray(passages.passageSetId, ids));
    await tx.update(questions).set({ status: "published", publishedAt: now, updatedAt: now }).where(and(inArray(questions.passageSetId, ids), eq(questions.status, "draft")));
    await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_PUBLISHED", metadata: { operation: "BATCH_PUBLISH", importBatchId: summary.id, batchKey, itemCount: ids.length, previousLifecycle: "draft", newLifecycle: "published" } });
    return { published: ids.length };
  });
}

function contentSignature(detail: NonNullable<Awaited<ReturnType<typeof getAdminContentDetail>>>) {
  return sha256(JSON.stringify({
    part: detail.group.toeicPart,
    setType: detail.group.setType,
    passages: detail.passages.map((item) => normalizeContent(item.content ?? "")),
    transcript: normalizeContent(detail.transcript?.content ?? ""),
    questions: detail.questions.map((question) => ({
      text: normalizeContent(question.questionText),
      options: question.options.map((option) => normalizeContent(option.optionText)),
      answer: question.options.findIndex((option) => option.id === question.solution?.correctOptionId),
    })),
  }));
}

async function matchingGroupIds(filters: ReviewFilters, lifecycle: ContentLifecycle) {
  return db.select({ id: passageSets.id }).from(passageSets)
    .where(and(reviewConditions({ ...filters, lifecycle }), eq(passageSets.status, lifecycle)))
    .orderBy(asc(passageSets.createdAt), asc(passageSets.id));
}

export type BulkContentResult = { processed: number; published: number; unarchived: number; duplicatesDeleted: number; failed: Array<{ id: string; issues: string[] }> };

export async function publishAllDrafts(actorUserId: string, filters: ReviewFilters): Promise<BulkContentResult> {
  await db.transaction(async (tx) => { await assertManage(tx, actorUserId); });
  const groups = await matchingGroupIds(filters, "draft");
  const result: BulkContentResult = { processed: groups.length, published: 0, unarchived: 0, duplicatesDeleted: 0, failed: [] };
  for (const group of groups) {
    try {
      await publishContent(actorUserId, group.id);
      result.published++;
    } catch (error) {
      result.failed.push({ id: group.id, issues: error instanceof ContentAdminError ? [error.code, ...error.issues] : ["FAILED"] });
    }
  }
  return result;
}

async function deleteArchivedDuplicate(tx: Tx, actorUserId: string, id: string, duplicateOfId: string) {
  const questionRows = await tx.select({ id: questions.id }).from(questions).where(eq(questions.passageSetId, id));
  const questionIds = questionRows.map((question) => question.id);
  await tx.delete(questionImportItems).where(eq(questionImportItems.questionGroupId, id));
  if (questionIds.length) {
    await tx.delete(questionSolutions).where(inArray(questionSolutions.questionId, questionIds));
    await tx.delete(questionOptions).where(inArray(questionOptions.questionId, questionIds));
    await tx.delete(questions).where(inArray(questions.id, questionIds));
  }
  await tx.delete(listeningTranscripts).where(eq(listeningTranscripts.questionGroupId, id));
  await tx.delete(questionGroupMedia).where(eq(questionGroupMedia.questionGroupId, id));
  await tx.delete(passages).where(eq(passages.passageSetId, id));
  await tx.delete(passageSets).where(and(eq(passageSets.id, id), eq(passageSets.status, "archived")));
  await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_DUPLICATE_DELETED", metadata: { groupId: id, duplicateOfId, operation: "BULK_UNARCHIVE" } });
}

export async function unarchiveAllContent(actorUserId: string, filters: ReviewFilters): Promise<BulkContentResult> {
  await db.transaction(async (tx) => { await assertManage(tx, actorUserId); });
  const [archived, published] = await Promise.all([matchingGroupIds(filters, "archived"), matchingGroupIds({}, "published")]);
  const publishedSignatures = new Map<string, string>();
  for (const group of published) {
    const detail = await getAdminContentDetail(group.id);
    if (detail) publishedSignatures.set(contentSignature(detail), group.id);
  }
  const result: BulkContentResult = { processed: archived.length, published: 0, unarchived: 0, duplicatesDeleted: 0, failed: [] };
  for (const group of archived) {
    try {
      const detail = await getAdminContentDetail(group.id);
      if (!detail) throw new ContentAdminError("NOT_FOUND");
      const signature = contentSignature(detail);
      const duplicateOfId = publishedSignatures.get(signature);
      if (duplicateOfId) {
        await db.transaction(async (tx) => {
          await assertManage(tx, actorUserId);
          const [locked] = await tx.select({ status: passageSets.status }).from(passageSets).where(eq(passageSets.id, group.id)).for("update").limit(1);
          if (!locked || locked.status !== "archived") throw new ContentAdminError("BULK_CHANGED_RETRY");
          await deleteArchivedDuplicate(tx, actorUserId, group.id, duplicateOfId);
        });
        result.duplicatesDeleted++;
        continue;
      }
      const issues = await validateContent(group.id);
      if (issues.length) throw new ContentAdminError("VALIDATION_FAILED", issues);
      await db.transaction(async (tx) => {
        await assertManage(tx, actorUserId);
        const [locked] = await tx.select({ status: passageSets.status }).from(passageSets).where(eq(passageSets.id, group.id)).for("update").limit(1);
        if (!locked || locked.status !== "archived") throw new ContentAdminError("BULK_CHANGED_RETRY");
        const now = new Date();
        await tx.update(passageSets).set({ status: "published", archivedAt: null, publishedAt: now, updatedAt: now }).where(eq(passageSets.id, group.id));
        await tx.update(passages).set({ status: "published", updatedAt: now }).where(eq(passages.passageSetId, group.id));
        await tx.update(questions).set({ status: "published", archivedAt: null, publishedAt: now, updatedAt: now }).where(eq(questions.passageSetId, group.id));
        await tx.insert(adminAuditLogs).values({ actorUserId, action: "CONTENT_UNARCHIVED", metadata: { groupId: group.id, previousLifecycle: "archived", newLifecycle: "published", operation: "BULK_UNARCHIVE" } });
      });
      publishedSignatures.set(signature, group.id);
      result.unarchived++;
    } catch (error) {
      result.failed.push({ id: group.id, issues: error instanceof ContentAdminError ? [error.code, ...error.issues] : ["FAILED"] });
    }
  }
  return result;
}

export type ExportFilters = ReviewFilters & { ids?: string[] };
export async function exportQuestions(filters: ExportFilters): Promise<QuestionImportFile> {
  if (!filters.part || filters.part < 1 || filters.part > 7) throw new ContentAdminError("PART_REQUIRED");
  const selected = filters.ids?.filter(id => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 500);
  if (filters.ids && (!selected?.length || selected.length !== filters.ids.length)) throw new ContentAdminError("INVALID_SELECTION");
  const groups = await db.select({ id: passageSets.id }).from(passageSets).where(and(reviewConditions(filters), selected ? inArray(passageSets.id, selected) : undefined)).orderBy(asc(passageSets.createdAt), asc(passageSets.id));
  if (selected && groups.length !== selected.length) throw new ContentAdminError("INVALID_SELECTION");
  const details = await Promise.all(groups.map((group) => getAdminContentDetail(group.id)));
  const batchContexts = await Promise.all(groups.map((group) => getImportContextForGroup(group.id)));
  const usedItems = new Set<string>(); const usedQuestions = new Set<string>();
  const unique = (candidate: string, used: Set<string>) => { let value = candidate; let suffix = 2; while (used.has(value)) value = `${candidate}-${suffix++}`; used.add(value); return value; };
  const items = details.flatMap((detail, index) => {
    if (!detail) return [];
    const context = batchContexts[index]; const externalItemId = unique(context?.externalItemId ?? `EXPORT-P${detail.group.toeicPart}-${String(index + 1).padStart(4,"0")}`, usedItems);
    return [{
      externalItemId, part: detail.group.toeicPart, title: detail.group.title, setType: detail.group.setType as QuestionImportFile["items"][number]["setType"],
      passages: detail.passages.map((p) => ({ ...(p.title ? { title: p.title } : {}), content: p.content ?? "", ...(p.documentType ? { documentType: p.documentType } : {}) })),
      ...(detail.transcript ? { transcript: detail.transcript.content } : {}),
      ...(detail.media.length ? { media: Object.fromEntries(detail.media.map((m) => [m.role.toLowerCase(), { pending: true, ...(m.asset.kind === "IMAGE" ? { altText: "Re-link the source image before publishing." } : {}) }])) } : {}),
      questions: detail.questions.map((q, questionIndex) => ({
        externalQuestionId: unique(typeof q.metadata?.externalQuestionId === "string" ? q.metadata.externalQuestionId : `${externalItemId}-Q${questionIndex + 1}`, usedQuestions), text: q.questionText,
        options: q.options.map((o) => ({ key: o.optionKey as "A"|"B"|"C"|"D", text: o.optionText })), correctOptionKey: (q.options.find((o) => o.id === q.solution?.correctOptionId)?.optionKey ?? "A") as "A"|"B"|"C"|"D",
        explanation: { en: q.solution?.explanationEn ?? "", vi: q.solution?.explanationVi ?? "" }, skill: q.skill, subSkill: q.subSkill, difficulty: q.difficulty as "easy"|"medium"|"hard",
      })),
    }];
  });
  const file: QuestionImportFile = { schemaVersion: IMPORT_SCHEMA_VERSION, batch: { batchKey: `export-p${filters.part}-${new Date().toISOString().slice(0,10)}-${Date.now()}`, name: `TOEICGym Part ${filters.part} export`, description: "Admin export for offline review and round-trip import.", sourceType: "OTHER_APPROVED", rightsNote: "Exported from TOEICGym Admin; operator must confirm rights before re-import.", createdAt: new Date().toISOString(), language: "bilingual", reviewStatus: "UNREVIEWED" }, items };
  const report = validateImportValue(file); if (!report.valid) throw new ContentAdminError("EXPORT_VALIDATION_FAILED", report.issues.map((i) => i.message));
  return file;
}
