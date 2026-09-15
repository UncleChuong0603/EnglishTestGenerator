import { describe, expect, it } from "vitest";
import { validateListeningEligibility, validateListeningGroupEligibility, type ListeningEligibilityInput, type ListeningGroupEligibilityInput } from "./eligibility";

function valid(part: 1 | 2): ListeningEligibilityInput { return { skillArea: "LISTENING", part, responseType: "MULTIPLE_CHOICE", questionCount: 1, options: Array.from({ length: part === 1 ? 4 : 3 }, (_, i) => ({ id: `o${i}` })), correctOptionId: "o0", explanationEn: "Curated explanation", explanationVi: null, transcript: "Original synthetic transcript", media: [{ kind: "AUDIO", role: "AUDIO", accessScope: "CONTENT", status: "READY" }, ...(part === 1 ? [{ kind: "IMAGE" as const, role: "IMAGE", accessScope: "CONTENT" as const, status: "READY" as const }] : [])] }; }

describe("Listening eligibility", () => {
  it("accepts valid Part 1 with exactly four options", () => expect(validateListeningEligibility(valid(1))).toEqual({ eligible: true }));
  it("accepts valid Part 2 with exactly three options", () => expect(validateListeningEligibility(valid(2))).toEqual({ eligible: true }));
  it.each([
    ["missing Part 1 image", (x: ListeningEligibilityInput) => { x.media = x.media.filter((m) => m.kind !== "IMAGE"); }],
    ["missing audio", (x: ListeningEligibilityInput) => { x.media = x.media.filter((m) => m.kind !== "AUDIO"); }],
    ["wrong media kind", (x: ListeningEligibilityInput) => { x.media = [{ kind: "IMAGE", role: "AUDIO", accessScope: "CONTENT", status: "READY" }, { kind: "IMAGE", role: "IMAGE", accessScope: "CONTENT", status: "READY" }]; }],
    ["private media", (x: ListeningEligibilityInput) => { x.media = x.media.map((m) => ({ ...m, accessScope: "PRIVATE_USER" })); }],
    ["archived media", (x: ListeningEligibilityInput) => { x.media = x.media.map((m) => ({ ...m, status: "ARCHIVED" })); }],
    ["failed media", (x: ListeningEligibilityInput) => { x.media = x.media.map((m) => ({ ...m, status: "FAILED" })); }],
  ])("rejects %s", (_, mutate) => { const input = valid(1); mutate(input); expect(validateListeningEligibility(input).eligible).toBe(false); });
  it("rejects three options for Part 1 and four for Part 2", () => { const p1 = valid(1); p1.options = p1.options.slice(0, 3); const p2 = valid(2); p2.options = [...p2.options, { id: "o3" }]; expect(validateListeningEligibility(p1).eligible).toBe(false); expect(validateListeningEligibility(p2).eligible).toBe(false); });
  it("rejects non-ready/private Part 2 audio", () => { const failed = valid(2); failed.media = failed.media.map((asset) => ({ ...asset, status: "UPLOADING" })); const privateAsset = valid(2); privateAsset.media = privateAsset.media.map((asset) => ({ ...asset, accessScope: "PRIVATE_USER" })); expect(validateListeningEligibility(failed).eligible).toBe(false); expect(validateListeningEligibility(privateAsset).eligible).toBe(false); });
});

function validGroup(part: 3 | 4): ListeningGroupEligibilityInput { return { skillArea: "LISTENING", part, setType: part === 3 ? "conversation" : "talk", status: "published", transcript: "Original synthetic transcript", media: [{ kind: "AUDIO", role: "AUDIO", accessScope: "CONTENT", status: "READY" }], questions: [1,2,3].map((order) => ({ order, responseType: "MULTIPLE_CHOICE", options: [0,1,2,3].map((n) => ({ id: `q${order}o${n}` })), correctOptionId: `q${order}o0`, explanationEn: "Original explanation", explanationVi: null })) }; }
describe.each([3, 4] as const)("Listening Part %i group eligibility", (part) => {
  it("accepts a complete three-question group", () => expect(validateListeningGroupEligibility(validGroup(part))).toEqual({ eligible: true }));
  it.each([2, 4])("rejects %i questions", (count) => { const input = validGroup(part); input.questions = input.questions.slice(0, count); if (count === 4) input.questions = [...input.questions, { ...input.questions[0], order: 4 }]; expect(validateListeningGroupEligibility(input).eligible).toBe(false); });
  it("accepts one optional READY CONTENT image", () => { const input = validGroup(part); input.media = [...input.media, { kind: "IMAGE", role: "IMAGE", accessScope: "CONTENT", status: "READY" }]; expect(validateListeningGroupEligibility(input).eligible).toBe(true); });
  it.each(["PRIVATE_USER", "FAILED", "ARCHIVED"])("rejects invalid media %s", (value) => { const input = validGroup(part); input.media = input.media.map((m) => value === "PRIVATE_USER" ? { ...m, accessScope: value } : { ...m, status: value as "FAILED" | "ARCHIVED" }); expect(validateListeningGroupEligibility(input).eligible).toBe(false); });
  it("rejects missing/wrong audio and invalid graphic", () => { const missing = validGroup(part); missing.media = []; const wrong = validGroup(part); wrong.media = [{ kind: "IMAGE", role: "AUDIO", accessScope: "CONTENT", status: "READY" }]; expect(validateListeningGroupEligibility(missing).eligible).toBe(false); expect(validateListeningGroupEligibility(wrong).eligible).toBe(false); });
  it("rejects duplicate or missing order", () => { const input = validGroup(part); input.questions = input.questions.map((q, i) => ({ ...q, order: i === 2 ? 2 : q.order })); expect(validateListeningGroupEligibility(input).eligible).toBe(false); });
  it("invalidates the whole group for bad options, answer, transcript, or explanation", () => { for (const mutate of [(x: ListeningGroupEligibilityInput) => { x.questions[0].options = []; }, (x: ListeningGroupEligibilityInput) => { x.questions[0].correctOptionId = "foreign"; }, (x: ListeningGroupEligibilityInput) => { x.transcript = ""; }, (x: ListeningGroupEligibilityInput) => { x.questions[0].explanationEn = ""; }]) { const input = validGroup(part); mutate(input); expect(validateListeningGroupEligibility(input).eligible).toBe(false); } });
});
