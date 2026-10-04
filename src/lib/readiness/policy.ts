import type { PlanKey } from "@/lib/entitlements/catalog";
import { dateInTimeZone, daysUntilExam as goalDaysUntilExam, type GoalProfile } from "@/lib/goals/domain";
import type { ProgressCounts, ToeicProgress } from "@/lib/progress/types";

export const READINESS_MIN_SAMPLE = 20;
export const READINESS_STRONG_SAMPLE = 50;
export const READINESS_PRIORITY_MIN_SAMPLE = 10;

export type EvidenceState =
  | "INSUFFICIENT_DATA"
  | "NEEDS_WORK"
  | "DEVELOPING"
  | "STABLE"
  | "STRONG";

export type ReadinessActionCode =
  | "TAKE_DIAGNOSTIC"
  | "REVIEW_MISTAKES"
  | "PRACTICE_LISTENING"
  | "PRACTICE_READING"
  | "TAKE_FULL_MOCK"
  | "CONTINUE_WEEKLY_PLAN";

export type ReadinessFacts = {
  now: Date;
  goal: GoalProfile | null;
  progress: ToeicProgress;
  learningDays28: number;
  diagnosticCompletedAt: string | null;
  unresolvedMistakes: number;
  masteredMistakes: number;
  weeklyPlan: { planned: number; completed: number };
  mocks: { completed: number; latestCompletedAt: string | null };
  plan: PlanKey;
  mockQuotaReached: boolean;
};

export type ExamReadiness = {
  goal: {
    targetScore: number | null;
    examDate: string | null;
    daysUntilExam: number | null;
  };
  consistency: {
    state: EvidenceState;
    learningDays28: number;
    targetDays28: number | null;
  };
  listening: ReturnType<typeof areaEvidence>;
  reading: ReturnType<typeof areaEvidence>;
  diagnostic: { completed: boolean; completedAt: string | null };
  mastery: { unresolved: number; mastered: number };
  weeklyPlan: { state: EvidenceState; planned: number; completed: number };
  mocks: {
    completed: number;
    latestCompletedAt: string | null;
    recommended: boolean;
    access: "AVAILABLE" | "QUOTA_REACHED";
  };
  priorities: Array<{
    skillArea: "LISTENING" | "READING";
    part: number;
    skill: string | null;
    state: EvidenceState;
    answered: number;
    correct: number;
    accuracy: number | null;
  }>;
  actions: Array<{ code: ReadinessActionCode; href: string }>;
};

const rank: Record<EvidenceState, number> = {
  NEEDS_WORK: 0,
  DEVELOPING: 1,
  INSUFFICIENT_DATA: 2,
  STABLE: 3,
  STRONG: 4,
};

export function evidenceState(value: Pick<ProgressCounts, "attemptedCount" | "accuracy">): EvidenceState {
  if (value.attemptedCount < READINESS_MIN_SAMPLE || value.accuracy === null) return "INSUFFICIENT_DATA";
  if (value.accuracy < 60) return "NEEDS_WORK";
  if (value.accuracy < 75) return "DEVELOPING";
  if (value.accuracy < 85 || value.attemptedCount < READINESS_STRONG_SAMPLE) return "STABLE";
  return "STRONG";
}

function areaEvidence(value: ProgressCounts) {
  return {
    state: evidenceState(value),
    answered: value.attemptedCount,
    correct: value.correctCount,
    accuracy: value.accuracy,
    latestAttemptAt: value.latestAttemptAt,
    minimumSample: READINESS_MIN_SAMPLE,
  };
}

export function consistencyState(learningDays28: number, studyDaysPerWeek: number | null): EvidenceState {
  if (learningDays28 < 3) return "INSUFFICIENT_DATA";
  if (!studyDaysPerWeek) {
    if (learningDays28 >= 12) return "STRONG";
    if (learningDays28 >= 8) return "STABLE";
    return learningDays28 >= 4 ? "DEVELOPING" : "NEEDS_WORK";
  }
  const target = studyDaysPerWeek * 4;
  if (learningDays28 >= Math.ceil(target * 0.85)) return "STRONG";
  if (learningDays28 >= Math.ceil(target * 0.6)) return "STABLE";
  if (learningDays28 >= Math.ceil(target * 0.35)) return "DEVELOPING";
  return "NEEDS_WORK";
}

function weeklyState(planned: number, completed: number): EvidenceState {
  if (planned === 0) return "INSUFFICIENT_DATA";
  if (completed >= planned) return "STRONG";
  if (completed === 0) return "NEEDS_WORK";
  if (completed * 2 >= planned) return "STABLE";
  return "DEVELOPING";
}

function daysUntilExam(examDate: string | null, now: Date) {
  return examDate ? goalDaysUntilExam(examDate, dateInTimeZone(now)) : null;
}

function priorityEvidence(progress: ToeicProgress): ExamReadiness["priorities"] {
  return progress.parts
    .filter((part) => part.attemptedCount > 0)
    .map((part) => {
      const supportedSkill = [...part.skills]
        .filter((skill) => skill.attemptedCount >= READINESS_PRIORITY_MIN_SAMPLE)
        .sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101) || b.attemptedCount - a.attemptedCount)[0];
      return {
        skillArea: part.part <= 4 ? "LISTENING" as const : "READING" as const,
        part: part.part,
        skill: supportedSkill?.name ?? null,
        state: evidenceState(part),
        answered: part.attemptedCount,
        correct: part.correctCount,
        accuracy: part.accuracy,
      };
    })
    .sort((a, b) => rank[a.state] - rank[b.state] || (a.accuracy ?? 101) - (b.accuracy ?? 101) || b.answered - a.answered)
    .slice(0, 3);
}

export function buildExamReadiness(facts: ReadinessFacts): ExamReadiness {
  const listening = areaEvidence(facts.progress.listening);
  const reading = areaEvidence(facts.progress.reading);
  const mockRecommended = facts.diagnosticCompletedAt !== null
    && ["STABLE", "STRONG"].includes(listening.state)
    && ["STABLE", "STRONG"].includes(reading.state);
  const actions: ExamReadiness["actions"] = [];
  if (!facts.diagnosticCompletedAt) actions.push({ code: "TAKE_DIAGNOSTIC", href: "/diagnostic" });
  if (facts.unresolvedMistakes > 0) actions.push({ code: "REVIEW_MISTAKES", href: "/mistakes" });
  if (mockRecommended) actions.push({ code: "TAKE_FULL_MOCK", href: "/full-mock" });
  else {
    const weakest = rank[listening.state] <= rank[reading.state] ? "LISTENING" : "READING";
    actions.push({ code: weakest === "LISTENING" ? "PRACTICE_LISTENING" : "PRACTICE_READING", href: "/practice" });
  }
  if (facts.weeklyPlan.planned > facts.weeklyPlan.completed) actions.push({ code: "CONTINUE_WEEKLY_PLAN", href: "/dashboard#weekly-plan-heading" });

  return {
    goal: {
      targetScore: facts.goal?.targetScore ?? null,
      examDate: facts.goal?.examDate ?? null,
      daysUntilExam: daysUntilExam(facts.goal?.examDate ?? null, facts.now),
    },
    consistency: {
      state: consistencyState(facts.learningDays28, facts.goal?.studyDaysPerWeek ?? null),
      learningDays28: facts.learningDays28,
      targetDays28: facts.goal?.studyDaysPerWeek ? facts.goal.studyDaysPerWeek * 4 : null,
    },
    listening,
    reading,
    diagnostic: { completed: facts.diagnosticCompletedAt !== null, completedAt: facts.diagnosticCompletedAt },
    mastery: { unresolved: facts.unresolvedMistakes, mastered: facts.masteredMistakes },
    weeklyPlan: { state: weeklyState(facts.weeklyPlan.planned, facts.weeklyPlan.completed), ...facts.weeklyPlan },
    mocks: {
      ...facts.mocks,
      recommended: mockRecommended,
      access: facts.mockQuotaReached ? "QUOTA_REACHED" : "AVAILABLE",
    },
    priorities: priorityEvidence(facts.progress),
    actions: actions.filter((action, index) => actions.findIndex((candidate) => candidate.code === action.code) === index).slice(0, 3),
  };
}
