import type { PartBearingSkillArea, ToeicPart } from "@/lib/toeic/domain";

export type EvidenceState = "INSUFFICIENT_DATA" | "EARLY_SIGNAL" | "SUPPORTED";
export type DiagnosisLabel = "NEEDS_ATTENTION" | "DEVELOPING" | "STABLE" | "STRONG";
export type DiagnosisLevel = "SECTION" | "PART" | "SKILL" | "SUBSKILL";
export type DiagnosisIdentity = { skillArea: PartBearingSkillArea; part: ToeicPart | null; skill: string | null; subskill: string | null };
export type DiagnosisSignal = DiagnosisIdentity & { level: DiagnosisLevel; attemptedCount: number; correctCount: number; accuracy: number | null; latestAttemptAt: string | null; evidence: EvidenceState; label: DiagnosisLabel | null; priorityScore: number | null };
export type SectionDiagnosis = { skillArea: PartBearingSkillArea; overall: DiagnosisSignal; parts: DiagnosisSignal[]; skills: DiagnosisSignal[]; subskills: DiagnosisSignal[] };
export type ToeicDiagnosis = { listening: SectionDiagnosis; reading: SectionDiagnosis; rankedImprovementAreas: DiagnosisSignal[] };
export type RecommendationReasonCode = "BUILD_PROFILE" | "SUPPORTED_WEAKNESS" | "EARLY_EXPLORATION";
export type SelectionMix = { primary: number; support: number; maintenance: number };
export type WorkoutRecommendation = { kind: "EXPLORATION" | "FOCUSED"; skillArea: PartBearingSkillArea; part: ToeicPart | null; primarySkill: string | null; primarySubskill: string | null; requestedQuestionCount: number; questionCount: number; groupCount: number | null; selectionMix: SelectionMix; reasonCode: RecommendationReasonCode; evidence: Pick<DiagnosisSignal, "attemptedCount" | "correctCount" | "accuracy" | "evidence" | "label"> | null };
