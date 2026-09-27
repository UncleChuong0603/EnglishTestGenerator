import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as schema from "@/db/schema";

const fixture = vi.hoisted(() => ({ db: null as unknown }));
vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: fixture.db }));
vi.mock("@/lib/practice/queries", () => ({ getPracticeResult: vi.fn() }));
vi.mock("./dictionary", () => ({
  normalizeDictionaryWord: (word: string) => word,
  lookupDictionaryWord: async (term: string) => ({ term, phonetic: "/test/", audioUrl: null, partOfSpeech: "noun", meaningEn: "A saved definition", meaningVi: "Nghĩa đã lưu", example: "A saved example." }),
}));

const database = new PGlite();
let service: typeof import("./service");
const owner = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  fixture.db = drizzle(database, { schema });
  service = await import("./service");
  await database.query("insert into users (id,email,email_normalized) values ($1,'vocab-owner@example.test','vocab-owner@example.test'),($2,'vocab-other@example.test','vocab-other@example.test')", [owner, other]);
}, 60_000);
afterAll(async () => database.close());

describe("dictionary card persistence and review", () => {
  it("persists words outside the catalog, isolates owners and prevents duplicate saves", async () => {
    await service.saveDictionaryVocabulary(owner, "testwordxyz", "A context from practice.", 3);
    await service.saveDictionaryVocabulary(owner, "testwordxyz", "Another context.", 3);
    const cards = await service.getVocabularyCards(owner);
    expect(cards).toHaveLength(1);
    expect(cards[0].dictionaryCard?.phonetic).toBe("/test/");
    expect(cards[0].contextSentence).toBe("A context from practice.");
    expect(cards[0].entry.meaningEn).toBe("A saved definition");
    expect(await service.getVocabularyCards(other)).toHaveLength(0);
    expect(await service.reviewVocabulary(other, cards[0].id, true)).toBe(false);
    expect(await service.reviewVocabulary(owner, cards[0].id, true)).toBe(true);
    const [reviewed] = await service.getVocabularyCards(owner);
    expect(reviewed.reviewCount).toBe(1);
    expect(reviewed.dueAt.getTime()).toBeGreaterThan(Date.now());
    expect(await service.reviewVocabulary(owner, cards[0].id, true)).toBe(false);
  });
  it("enriches an existing study card without resetting its review schedule", async () => {
    await service.saveVocabularyFromStudyList(owner, "invoice");
    const original = (await service.getVocabularyCards(owner)).find(card => card.entryKey === "invoice")!;
    await service.reviewVocabulary(owner, original.id, true);
    await service.saveDictionaryVocabulary(owner, "invoice", "Please pay.", 5);
    const cards = (await service.getVocabularyCards(owner)).filter(card => card.entryKey === "invoice");
    expect(cards).toHaveLength(1);
    expect(cards[0].reviewCount).toBe(1);
    expect(cards[0].dictionaryCard?.meaningEn).toBe("A saved definition");
  });
});
