import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const service = readFileSync("src/lib/mistake-reasons/service.ts", "utf8");
const route = readFileSync("src/app/api/v1/practice/[id]/reason/route.ts", "utf8");
const result = readFileSync("src/components/practice/mistake-reason-control.tsx", "utf8");

describe("Task 45 mistake reason boundaries", () => {
  it("checks answer and session ownership and accepts only submitted wrong answers", () => {
    expect(service).toContain("eq(attemptAnswers.userId, input.userId)");
    expect(service).toContain("eq(practiceSessions.userId, input.userId)");
    expect(service).toContain('eq(practiceSessions.status, "submitted")');
    expect(service).toContain("if (attempt.isCorrect)");
  });

  it("validates mobile ownership server-side and never trusts a client evidence source", () => {
    expect(route).toContain("requireApiActor(request)");
    expect(route).not.toMatch(/evidenceSource:\s*body/);
    expect(service).toContain('evidenceSource: "USER_SELECTED"');
  });

  it("keeps self-report optional and accessible", () => {
    expect(result).toContain("Bỏ qua");
    expect(result).toContain('aria-live="polite"');
    expect(result).toContain("aria-pressed");
  });
});
