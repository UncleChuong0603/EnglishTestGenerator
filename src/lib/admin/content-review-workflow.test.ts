import { describe, expect, it } from "vitest";
import fs from "node:fs";

const read = (path: string) => fs.readFileSync(path, "utf8");

describe("Admin content review workflow", () => {
  const service = read("src/lib/admin/content.ts");
  const actions = read("src/app/admin/content/actions.ts");
  const detail = read("src/app/admin/content/questions/[id]/page.tsx");
  const bank = read("src/app/admin/content/questions/page.tsx");
  const batch = read("src/app/admin/content/batches/[batchKey]/page.tsx");
  const exportRoute = read("src/app/api/admin/content-export/route.ts");

  it("keeps a deterministic filtered queue and handles its end", () => {
    expect(service).toContain("orderBy(asc(passageSets.toeicPart), asc(passageSets.createdAt), asc(passageSets.id))");
    expect(detail).toContain("queue.position");
    expect(detail).toContain("End of queue");
  });

  it("qualifies correlated passage-set IDs so draft-bank queries are not ambiguous", () => {
    expect(service).toContain("const outerPassageSetId = sql.raw");
    expect(service).toContain('"passage_sets"."id"');
    expect(service).not.toContain("q.passage_set_id=${passageSets.id}");
    expect(service).not.toContain("qi.question_group_id=${passageSets.id}");
  });

  it("publishes and advances only after canonical publish succeeds", () => {
    const publishNext = actions.slice(actions.indexOf("export async function publishAndNextAction"));
    const queueIndex = publishNext.indexOf("getReviewQueue(id,filters)");
    const publishIndex = publishNext.indexOf("publishContent(await actor");
    const redirectIndex = publishNext.indexOf("queue.next");
    expect(queueIndex).toBeGreaterThan(-1);
    expect(publishIndex).toBeGreaterThan(queueIndex);
    expect(redirectIndex).toBeGreaterThan(publishIndex);
    expect(detail).toContain("Đang publish");
  });

  it("validates a whole batch, locks drafts, publishes atomically and audits", () => {
    expect(service).toContain('throw new ContentAdminError("BATCH_VALIDATION_FAILED"');
    expect(service).toContain('.for("update")');
    expect(service).toContain('operation: "BATCH_PUBLISH"');
    expect(service).toContain("db.transaction");
    expect(batch).toContain("Không thể publish");
  });

  it("requires admin permission for batch publish and protected export", () => {
    expect(actions).toContain('actor("CONTENT_MANAGE")');
    expect(exportRoute).toContain('requireAdmin("CONTENT_READ")');
  });

  it("supports filtered bulk publish and duplicate-safe unarchive", () => {
    expect(service).toContain("export async function publishAllDrafts");
    expect(service).toContain("export async function unarchiveAllContent");
    expect(service).toContain("contentSignature(detail)");
    expect(service).toContain("CONTENT_DUPLICATE_DELETED");
    expect(service).toContain("CONTENT_UNARCHIVED");
    expect(actions).toContain("publishAllDraftsAction");
    expect(actions).toContain("unarchiveAllContentAction");
    expect(bank).toContain("Duyệt toàn bộ Draft");
    expect(bank).toContain("Unarchive toàn bộ");
  });

  it("exports filtered, group-preserving schema v1 JSON without canonical content IDs or secrets", () => {
    expect(bank).toContain("content-export");
    expect(service).toContain("schemaVersion: IMPORT_SCHEMA_VERSION");
    expect(service).toContain("passages: detail.passages.map");
    expect(service).toContain("questions: detail.questions.map");
    expect(service).not.toMatch(/storageKey|sessionTokenHash|correctOptionId:\s*q\.solution/);
    expect(exportRoute).toContain("content-disposition");
  });
});
