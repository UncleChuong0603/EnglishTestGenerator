import { describe, expect, it } from "vitest";
import { readingAssignmentSetId, validReadingAssignment } from "./reading-assignment";

describe("reading session assignments", () => {
  it("loads imported Part 5 questions as standalone even when their source retains a set", () => {
    expect(validReadingAssignment(5, "import-set", null)).toBe(true);
    expect(validReadingAssignment(5, null, null)).toBe(true);
    expect(validReadingAssignment(5, "import-set", "import-set")).toBe(true);
    expect(readingAssignmentSetId(5, "import-set")).toBeNull();
    expect(validReadingAssignment(5, "import-set", "other-set")).toBe(false);
    expect(validReadingAssignment(5, null, "other-set")).toBe(false);
  });

  it("keeps Part 6 and 7 questions inside their assigned passage set", () => {
    expect(validReadingAssignment(6, "set-a", "set-a")).toBe(true);
    expect(validReadingAssignment(7, "set-a", "set-b")).toBe(false);
    expect(validReadingAssignment(7, "set-a", null)).toBe(false);
    expect(readingAssignmentSetId(7, "set-a")).toBe("set-a");
  });
});
