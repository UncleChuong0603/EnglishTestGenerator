import type { ListeningPart, PartBearingSkillArea, ReadingPart, ToeicPart } from "@/lib/toeic/domain";

export type Accuracy = number | null;

export type ProgressCounts = {
  attemptedCount: number;
  correctCount: number;
  accuracy: Accuracy;
  latestAttemptAt: string | null;
};

export type SubskillProgress = ProgressCounts & { name: string };
export type SkillProgress = ProgressCounts & { name: string; subskills: SubskillProgress[] };
export type PartProgress<P extends ToeicPart = ToeicPart> = ProgressCounts & { part: P; skills: SkillProgress[] };
export type SkillAreaProgress<A extends PartBearingSkillArea = PartBearingSkillArea> = ProgressCounts & {
  skillArea: A;
  parts: PartProgress<A extends "LISTENING" ? ListeningPart : ReadingPart>[];
  skills: SkillProgress[];
};

export type ToeicProgress = ProgressCounts & {
  listening: SkillAreaProgress<"LISTENING">;
  reading: SkillAreaProgress<"READING">;
  parts: PartProgress[];
};

export type ProgressAggregateRow = {
  skillArea: PartBearingSkillArea;
  part: ToeicPart;
  skill: string;
  subskill: string;
  attemptedCount: number;
  correctCount: number;
  latestAttemptAt: string | null;
};
