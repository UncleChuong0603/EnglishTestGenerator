import { describe, expect, it } from "vitest";
import { validateListeningEligibility, type ListeningEligibilityInput } from "./eligibility";

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
