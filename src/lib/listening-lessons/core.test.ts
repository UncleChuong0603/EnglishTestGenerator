import { describe, expect, it } from "vitest";
import { normalizeTranscript, transcriptFingerprint, validateLesson } from "./core";

describe("listening study lessons", () => {
  it("treats spacing and case variants as the same transcript", () => {
    expect(transcriptFingerprint("  Welcome   TO the office.\nPlease sit down. ")).toBe(transcriptFingerprint("welcome to the office. please sit down."));
    expect(transcriptFingerprint("Manager: We'll begin soon!")).toBe(transcriptFingerprint("MANAGER We'll begin soon."));
    expect(normalizeTranscript("  A\n B  ")).toBe("a b");
  });

  it("requires a meaningful transcript and an image for Part 1", () => {
    const lesson = { title: "Office conversation", description: "", transcript: "The manager will arrive at three o'clock.", toeicPart: 1, imageAlt: "Office scene", hasImage: false };
    expect(validateLesson(lesson)).toBe("PART_1_IMAGE_REQUIRED");
    expect(validateLesson({ ...lesson, hasImage: true })).toBeNull();
    expect(validateLesson({ ...lesson, toeicPart: 3, transcript: "hi" })).toBe("TRANSCRIPT_INVALID");
  });
});
