import { describe, expect, it } from "vitest";
import { productionListening } from "./content-manifest.mjs";
import { readingPassageSets } from "./reading-seed-data.mjs";

const choose = (sets, groups, questions, at = 0) => groups === 0 ? questions === 0 : questions > 0 && sets.length - at >= groups && sets.slice(at).some((set, offset) => choose(sets, groups - 1, questions - set.questions.length, at + offset + 1));

describe("Task 12 production manifests", () => {
  it("has stable unique Listening keys and exact Full Mock coverage", () => {
    expect(new Set(productionListening.map(item => item.externalId)).size).toBe(productionListening.length);
    expect(productionListening.every(item => item.externalId.startsWith("L-"))).toBe(true);
    expect(JSON.stringify(productionListening)).not.toMatch(/dev-listening|original synthetic/i);
    expect(productionListening.filter(item => item.part === 1).length).toBeGreaterThanOrEqual(6);
    expect(productionListening.filter(item => item.part === 2).length).toBeGreaterThanOrEqual(25);
    expect(productionListening.filter(item => item.part === 3).length).toBeGreaterThanOrEqual(13);
    expect(productionListening.filter(item => item.part === 4).length).toBeGreaterThanOrEqual(10);
  });
  it("can select ten Part 7 single groups totaling 29 questions", () => {
    expect(choose(readingPassageSets.filter(set => set.toeicPart === 7 && set.setType === "single"), 10, 29)).toBe(true);
  });
  it("can select five multiple-passage groups totaling 25 questions", () => {
    expect(choose(readingPassageSets.filter(set => set.toeicPart === 7 && ["double", "triple"].includes(set.setType)), 5, 25)).toBe(true);
  });
});
