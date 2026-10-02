import { describe, expect, it } from "vitest";
import { TOEIC_FORMAT_ROWS, TOEIC_SECTION_TIMES, toeicFormatTotals } from "./toeic-format";

describe("TOEIC Listening and Reading format", () => {
  it("matches the official seven-part, 200-question structure", () => {
    expect(TOEIC_FORMAT_ROWS.map((row) => row.part)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(toeicFormatTotals()).toEqual({ Listening: 100, Reading: 100, all: 200 });
    expect(TOEIC_SECTION_TIMES).toEqual({ Listening: 45, Reading: 75 });
  });
});
