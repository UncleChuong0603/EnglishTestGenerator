import { describe, expect, expectTypeOf, it } from "vitest";
import {
  answerPracticeResponseSchema,
  apiErrorResponseSchema,
  apiV1Contracts,
  createPracticeRequestSchema,
  getPracticeResponseSchema,
  saveMistakeReasonRequestSchema,
  type CreatePracticeRequest,
} from "./contracts";

describe("mobile API v1 contracts", () => {
  it("defines every Task 42 endpoint under the versioned prefix", () => {
    expect(Object.values(apiV1Contracts).map((contract) => contract.path)).toEqual([
      "/api/v1/auth/login",
      "/api/v1/auth/logout",
      "/api/v1/me",
      "/api/v1/dashboard",
      "/api/v1/plan",
      "/api/v1/practice",
      "/api/v1/practice/:id",
      "/api/v1/practice/:id/answer",
      "/api/v1/practice/:id/submit",
      "/api/v1/practice/:id/reason",
      "/api/v1/mistakes",
      "/api/v1/vocabulary",
      "/api/v1/progress",
      "/api/v1/entitlements",
    ]);
  });

  it("does not accept client-selected question IDs when starting practice", () => {
    expect(createPracticeRequestSchema.safeParse({ kind: "TODAYS_WORKOUT", questionIds: ["00000000-0000-4000-8000-000000000001"] }).success).toBe(false);
    const request: CreatePracticeRequest = { kind: "CUSTOM", skillArea: "READING", part: 5, questionCount: 10 };
    expect(createPracticeRequestSchema.parse(request)).toEqual(request);
    expectTypeOf(request).toMatchTypeOf<CreatePracticeRequest>();
  });

  it("prevents correctness leakage from in-progress and answer acknowledgement payloads", () => {
    const session = {
      data: {
        id: "00000000-0000-4000-8000-000000000001",
        status: "in_progress",
        source: "custom",
        skillArea: "READING",
        part: 5,
        questionCount: 1,
        groups: [],
        questions: [{
          id: "00000000-0000-4000-8000-000000000002",
          number: 1,
          part: 5,
          text: "Question",
          skill: "grammar",
          subSkill: "verbs",
          passageSetId: null,
          selectedOptionId: null,
          options: [
            { id: "00000000-0000-4000-8000-000000000003", key: "A", text: "A" },
            { id: "00000000-0000-4000-8000-000000000004", key: "B", text: "B" },
          ],
        }],
      },
    };
    expect(getPracticeResponseSchema.safeParse(session).success).toBe(true);
    expect(getPracticeResponseSchema.safeParse({ ...session, data: { ...session.data, correctOptionId: "00000000-0000-4000-8000-000000000003" } }).success).toBe(false);
    expect(answerPracticeResponseSchema.safeParse({ data: { accepted: true, questionId: session.data.questions[0].id, updatedAt: "2026-10-01T12:00:00.000Z", isCorrect: true } }).success).toBe(false);
  });

  it("standardizes error envelopes", () => {
    expect(apiErrorResponseSchema.parse({ error: { code: "UNAUTHENTICATED", message: "Authentication is required.", requestId: "request-123" } })).toBeTruthy();
  });

  it("rejects inconsistent Reading/Listening sizes and parts", () => {
    expect(createPracticeRequestSchema.safeParse({ kind: "CUSTOM", skillArea: "READING", part: 2, questionCount: 10 }).success).toBe(false);
    expect(createPracticeRequestSchema.safeParse({ kind: "CUSTOM", skillArea: "READING", part: 5, questionCount: 3 }).success).toBe(false);
    expect(createPracticeRequestSchema.safeParse({ kind: "CUSTOM", skillArea: "LISTENING", part: 3, questionCount: 10 }).success).toBe(false);
    expect(createPracticeRequestSchema.safeParse({ kind: "CUSTOM", skillArea: "LISTENING", part: 3, questionCount: 9 }).success).toBe(true);
  });

  it("accepts only canonical learner-selectable mistake reasons", () => {
    const questionId = "00000000-0000-4000-8000-000000000002";
    expect(saveMistakeReasonRequestSchema.safeParse({ questionId, reasonCode: "VOCAB_UNKNOWN" }).success).toBe(true);
    expect(saveMistakeReasonRequestSchema.safeParse({ questionId, reasonCode: "UNKNOWN" }).success).toBe(false);
    expect(saveMistakeReasonRequestSchema.safeParse({ questionId, reasonCode: "LOW_CONFIDENCE" }).success).toBe(false);
  });
});
