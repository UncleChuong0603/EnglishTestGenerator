import { z } from "zod";

export const apiVersion = "v1" as const;
export const uuidSchema = z.uuid();
export const isoDateTimeSchema = z.iso.datetime({ offset: true });
export const localeSchema = z.enum(["en", "vi"]);
export const toeicPartSchema = z.number().int().min(1).max(7);

export const apiErrorCodeSchema = z.enum([
  "BAD_REQUEST",
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "USAGE_LIMIT_REACHED",
  "IDEMPOTENCY_CONFLICT",
  "INTERNAL_ERROR",
]);

export const apiErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: apiErrorCodeSchema,
    message: z.string().min(1).max(240),
    requestId: z.string().min(8).max(128),
    details: z.record(z.string(), z.unknown()).optional(),
    retryAfterSeconds: z.number().int().positive().optional(),
  }),
});

export const paginationRequestSchema = z.strictObject({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const paginationMetaSchema = z.strictObject({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export const loginRequestSchema = z.strictObject({
  email: z.email().max(320),
  password: z.string().min(1).max(1024),
});

export const loginResponseSchema = z.strictObject({
  data: z.strictObject({
    token: z.string().min(32).max(256),
    expiresAt: isoDateTimeSchema,
  }),
});

export const logoutRequestSchema = z.strictObject({});
export const logoutResponseSchema = z.strictObject({ data: z.strictObject({ revoked: z.literal(true) }) });

export const meResponseSchema = z.strictObject({
  data: z.strictObject({
    id: uuidSchema,
    email: z.email(),
    emailVerified: z.boolean(),
    profile: z.strictObject({
      displayName: z.string().nullable(),
      avatarUrl: z.url().nullable(),
      interfaceLanguage: localeSchema,
      explanationLanguage: z.enum(["en", "vi", "both"]),
      rankingVisibility: z.enum(["PUBLIC", "ANONYMOUS", "HIDDEN"]),
      learningEmailEnabled: z.boolean(),
    }),
    authMethods: z.strictObject({ password: z.boolean(), google: z.boolean() }),
  }),
});

const accuracySummarySchema = z.strictObject({
  answered: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100).nullable(),
});

export const dashboardResponseSchema = z.strictObject({
  data: z.strictObject({
    progress: accuracySummarySchema,
    completedQuestionsToday: z.number().int().nonnegative(),
    completedLearningSessions: z.number().int().nonnegative(),
    unresolvedMistakes: z.number().int().nonnegative(),
    recommendation: z.strictObject({
      skillArea: z.enum(["LISTENING", "READING"]),
      part: toeicPartSchema.nullable(),
      skill: z.string().nullable(),
      subSkill: z.string().nullable(),
      reasonCode: z.string(),
    }).nullable(),
    resumablePractice: z.strictObject({ id: uuidSchema, part: toeicPartSchema.nullable(), questionCount: z.number().int().positive() }).nullable(),
    goal: z.strictObject({
      targetScore: z.number().int().min(10).max(990).nullable(),
      examDate: z.iso.date().nullable(),
      dailyStudyMinutes: z.number().int().positive().nullable(),
      studyDaysPerWeek: z.number().int().min(1).max(7).nullable(),
    }).nullable(),
    dailyGoal: z.strictObject({
      completedQuestions: z.number().int().nonnegative(),
      targetQuestions: z.number().int().positive(),
      remainingQuestions: z.number().int().nonnegative(),
      percent: z.number().int().min(0).max(100),
      complete: z.boolean(),
    }),
    lifecycle: z.enum(["NEW", "DIAGNOSED", "ACTIVE", "RESUMABLE", "DAILY_GOAL_COMPLETE"]),
  }),
});

export const weeklyPlanItemSchema = z.strictObject({
  slot: z.number().int().positive(),
  activity: z.enum(["WORKOUT", "FOCUSED_READING", "REVIEW", "READING", "LISTENING", "MOCK_LISTENING"]),
  minutes: z.number().int().positive(),
  reason: z.string().min(1),
  completed: z.boolean(),
  available: z.boolean(),
});

export const planResponseSchema = z.strictObject({
  data: z.strictObject({
    weekStart: z.iso.date(),
    timezone: z.literal("Asia/Ho_Chi_Minh"),
    items: z.array(weeklyPlanItemSchema),
    adjustmentReasons: z.array(z.string()),
    isPreview: z.boolean(),
  }),
});

export const createPracticeRequestSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("TODAYS_WORKOUT") }),
  z.strictObject({
    kind: z.literal("CUSTOM"),
    skillArea: z.enum(["LISTENING", "READING"]),
    part: toeicPartSchema.optional(),
    questionCount: z.number().int().min(1).max(30),
    skill: z.string().min(1).max(120).optional(),
    subSkill: z.string().min(1).max(120).optional(),
  }).superRefine((value, context) => {
    if (value.skillArea === "READING") {
      if (value.part !== undefined && value.part < 5) context.addIssue({ code: "custom", path: ["part"], message: "Reading requires Part 5–7." });
      if (![10, 15, 20].includes(value.questionCount)) context.addIssue({ code: "custom", path: ["questionCount"], message: "Reading counts are 10, 15 or 20." });
      if (value.part === undefined && (value.skill || value.subSkill)) context.addIssue({ code: "custom", path: ["skill"], message: "Mixed Reading cannot target taxonomy." });
    } else {
      if (value.part === undefined || value.part > 4) context.addIssue({ code: "custom", path: ["part"], message: "Listening requires Part 1–4." });
      if (value.part && value.part >= 3 && value.questionCount % 3 !== 0) context.addIssue({ code: "custom", path: ["questionCount"], message: "Listening groups contain three questions." });
    }
  }),
  z.strictObject({
    kind: z.literal("MASTERY_REVIEW"),
    part: toeicPartSchema.optional(),
    size: z.number().int().min(1).max(30).default(10),
    smart: z.boolean().default(false),
  }),
]);

export const practiceQuestionSchema = z.strictObject({
  id: uuidSchema,
  number: z.number().int().positive(),
  part: toeicPartSchema,
  text: z.string(),
  skill: z.string(),
  subSkill: z.string(),
  passageSetId: uuidSchema.nullable(),
  selectedOptionId: uuidSchema.nullable(),
  options: z.array(z.strictObject({ id: uuidSchema, key: z.string().min(1).max(8), text: z.string() })).min(2).max(4),
  media: z.array(z.strictObject({ id: uuidSchema, kind: z.enum(["AUDIO", "IMAGE"]), url: z.url(), alt: z.string() })).optional(),
});

export const practiceSessionSchema = z.strictObject({
  id: uuidSchema,
  status: z.literal("in_progress"),
  source: z.string(),
  skillArea: z.enum(["LISTENING", "READING"]),
  part: toeicPartSchema.nullable(),
  questionCount: z.number().int().positive(),
  questions: z.array(practiceQuestionSchema),
  groups: z.array(z.strictObject({
    id: uuidSchema,
    part: toeicPartSchema,
    setType: z.enum(["standalone", "part6", "single", "double", "triple", "photographs", "question_response", "conversation", "talk"]),
    title: z.string().nullable(),
    questionIds: z.array(uuidSchema),
    passages: z.array(z.strictObject({ id: uuidSchema, title: z.string().nullable(), content: z.string(), position: z.number().int().positive(), documentType: z.string() })),
  })),
});

export const createPracticeResponseSchema = z.strictObject({ data: z.strictObject({ id: uuidSchema, resumed: z.boolean() }) });

export const answerPracticeRequestSchema = z.strictObject({
  questionId: uuidSchema,
  selectedOptionId: uuidSchema,
  responseTimeMs: z.number().int().min(0).max(86_400_000).optional(),
});

// Deliberately acknowledges persistence only. Correctness and solutions are
// unavailable until the authoritative submit operation completes.
export const answerPracticeResponseSchema = z.strictObject({
  data: z.strictObject({ accepted: z.literal(true), questionId: uuidSchema, updatedAt: isoDateTimeSchema }),
});

export const submitPracticeRequestSchema = z.strictObject({});
export const submitPracticeResponseSchema = z.strictObject({
  data: z.strictObject({
    id: uuidSchema,
    status: z.literal("submitted"),
    scoreCorrect: z.number().int().nonnegative(),
    scoreTotal: z.number().int().positive(),
    submittedAt: isoDateTimeSchema,
    results: z.array(z.strictObject({
      questionId: uuidSchema,
      number: z.number().int().positive(),
      part: toeicPartSchema,
      text: z.string(),
      options: z.array(z.strictObject({ id: uuidSchema, key: z.string().min(1).max(8), text: z.string() })).min(2).max(4),
      selectedOptionId: uuidSchema.nullable(),
      correctOptionId: uuidSchema,
      isCorrect: z.boolean(),
      explanationEn: z.string().nullable(),
      explanationVi: z.string().nullable(),
    })),
  }),
});

// GET supports resuming in-progress work and an owned, released result after
// submit. Handlers must enforce the parent mock/diagnostic/challenge gates too.
export const getPracticeResponseSchema = z.strictObject({
  data: z.union([practiceSessionSchema, submitPracticeResponseSchema.shape.data]),
});

export const mistakesResponseSchema = z.strictObject({
  data: z.array(z.strictObject({
    questionId: uuidSchema,
    status: z.enum(["UNRESOLVED", "MASTERED"]),
    skillArea: z.enum(["LISTENING", "READING"]),
    part: toeicPartSchema,
    skill: z.string(),
    subSkill: z.string(),
    wrongCount: z.number().int().positive(),
    lastMissedAt: isoDateTimeSchema,
    available: z.boolean(),
  })),
  pagination: paginationMetaSchema,
});

export const vocabularyResponseSchema = z.strictObject({
  data: z.array(z.strictObject({
    id: uuidSchema,
    term: z.string(),
    meaningEn: z.string(),
    meaningVi: z.string(),
    contextSentence: z.string(),
    toeicPart: toeicPartSchema,
    dueAt: isoDateTimeSchema,
    intervalDays: z.number().int().nonnegative(),
    correctStreak: z.number().int().nonnegative(),
    reviewCount: z.number().int().nonnegative(),
  })),
  pagination: paginationMetaSchema,
});

export const progressResponseSchema = z.strictObject({
  data: z.strictObject({
    overall: accuracySummarySchema,
    listening: accuracySummarySchema,
    reading: accuracySummarySchema,
    parts: z.array(z.strictObject({ part: toeicPartSchema, summary: accuracySummarySchema })),
    latestAttemptAt: isoDateTimeSchema.nullable(),
  }),
});

const usageSchema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("UNLIMITED"), used: z.number().int().nonnegative(), resetAt: z.null() }),
  z.strictObject({ type: z.literal("LIMITED"), used: z.number().int().nonnegative(), limit: z.number().int().positive(), remaining: z.number().int().nonnegative(), resetAt: isoDateTimeSchema }),
]);

export const entitlementsResponseSchema = z.strictObject({
  data: z.strictObject({
    effectivePlan: z.enum(["FREE", "PREMIUM"]),
    premiumExpiresAt: isoDateTimeSchema.nullable(),
    membershipStatus: z.enum(["ACTIVE", "EXPIRED", "FREE"]),
    isTrial: z.boolean(),
    capabilities: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
    usage: z.record(z.enum(["TODAYS_WORKOUT", "MANUAL_PRACTICE", "MASTERY_REVIEW", "FULL_MOCK"]), usageSchema),
  }),
});

export const apiV1Contracts = {
  login: { method: "POST", path: "/api/v1/auth/login", auth: "anonymous", request: loginRequestSchema, response: loginResponseSchema },
  logout: { method: "POST", path: "/api/v1/auth/logout", auth: "session", request: logoutRequestSchema, response: logoutResponseSchema },
  me: { method: "GET", path: "/api/v1/me", auth: "session", response: meResponseSchema },
  dashboard: { method: "GET", path: "/api/v1/dashboard", auth: "session", response: dashboardResponseSchema },
  plan: { method: "GET", path: "/api/v1/plan", auth: "session", response: planResponseSchema },
  createPractice: { method: "POST", path: "/api/v1/practice", auth: "session", request: createPracticeRequestSchema, response: createPracticeResponseSchema, idempotency: "required" },
  getPractice: { method: "GET", path: "/api/v1/practice/:id", auth: "session+ownership", response: getPracticeResponseSchema },
  answerPractice: { method: "POST", path: "/api/v1/practice/:id/answer", auth: "session+ownership", request: answerPracticeRequestSchema, response: answerPracticeResponseSchema, idempotency: "required" },
  submitPractice: { method: "POST", path: "/api/v1/practice/:id/submit", auth: "session+ownership", request: submitPracticeRequestSchema, response: submitPracticeResponseSchema, idempotency: "required" },
  mistakes: { method: "GET", path: "/api/v1/mistakes", auth: "session", query: paginationRequestSchema, response: mistakesResponseSchema },
  vocabulary: { method: "GET", path: "/api/v1/vocabulary", auth: "session", query: paginationRequestSchema, response: vocabularyResponseSchema },
  progress: { method: "GET", path: "/api/v1/progress", auth: "session", response: progressResponseSchema },
  entitlements: { method: "GET", path: "/api/v1/entitlements", auth: "session", response: entitlementsResponseSchema },
} as const;

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
export type PlanResponse = z.infer<typeof planResponseSchema>;
export type CreatePracticeRequest = z.infer<typeof createPracticeRequestSchema>;
export type PracticeSessionContract = z.infer<typeof practiceSessionSchema>;
export type CreatePracticeResponse = z.infer<typeof createPracticeResponseSchema>;
export type GetPracticeResponse = z.infer<typeof getPracticeResponseSchema>;
export type AnswerPracticeRequest = z.infer<typeof answerPracticeRequestSchema>;
export type SubmitPracticeResponse = z.infer<typeof submitPracticeResponseSchema>;
export type ProgressResponse = z.infer<typeof progressResponseSchema>;
export type EntitlementsResponse = z.infer<typeof entitlementsResponseSchema>;
