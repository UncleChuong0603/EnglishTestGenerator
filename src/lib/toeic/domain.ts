export const TOEIC_SKILL_AREAS = ["LISTENING", "READING", "SPEAKING", "WRITING"] as const;
export type ToeicSkillArea = (typeof TOEIC_SKILL_AREAS)[number];

export const ACTIVE_PRACTICE_AREAS = ["LISTENING", "READING"] as const satisfies readonly ToeicSkillArea[];
export const TOEIC_PARTS_BY_SKILL = { LISTENING: [1, 2, 3, 4], READING: [5, 6, 7] } as const;

export type ListeningPart = (typeof TOEIC_PARTS_BY_SKILL.LISTENING)[number];
export type ReadingPart = (typeof TOEIC_PARTS_BY_SKILL.READING)[number];
export type ToeicPart = ListeningPart | ReadingPart;
export type PartBearingSkillArea = keyof typeof TOEIC_PARTS_BY_SKILL;

export function isToeicSkillArea(value: unknown): value is ToeicSkillArea {
  return typeof value === "string" && TOEIC_SKILL_AREAS.includes(value as ToeicSkillArea);
}

export function isPartBearingSkillArea(value: ToeicSkillArea): value is PartBearingSkillArea {
  return value === "LISTENING" || value === "READING";
}

export function partsForSkillArea(skillArea: PartBearingSkillArea): readonly ToeicPart[] {
  return TOEIC_PARTS_BY_SKILL[skillArea];
}

export function skillAreaForPart(part: ToeicPart): PartBearingSkillArea {
  return part <= 4 ? "LISTENING" : "READING";
}

export function isValidSkillPart(skillArea: ToeicSkillArea, part: number): part is ToeicPart {
  return isPartBearingSkillArea(skillArea) && (TOEIC_PARTS_BY_SKILL[skillArea] as readonly number[]).includes(part);
}

export function assertValidSkillPart(skillArea: ToeicSkillArea, part: number): asserts part is ToeicPart {
  if (!isValidSkillPart(skillArea, part)) throw new Error("INVALID_TOEIC_SKILL_PART");
}

export const RESPONSE_TYPES = ["MULTIPLE_CHOICE", "TEXT", "AUDIO"] as const;
export type ResponseType = (typeof RESPONSE_TYPES)[number];
export const ACTIVE_RESPONSE_TYPES = ["MULTIPLE_CHOICE"] as const satisfies readonly ResponseType[];

export type MediaReference = { assetId: string; kind: "CONTENT_AUDIO" | "CONTENT_IMAGE" | "PRIVATE_USER_AUDIO"; altText?: string };
export type Stimulus =
  | { type: "TEXT"; content: string }
  | { type: "AUDIO"; media: MediaReference & { kind: "CONTENT_AUDIO" } }
  | { type: "IMAGE"; media: MediaReference & { kind: "CONTENT_IMAGE" } };

export type QuestionGroup = { id: string; skillArea: PartBearingSkillArea; part: ToeicPart; stimuli: readonly Stimulus[]; questionIds: readonly string[] };

export function validateQuestionGroup(group: QuestionGroup): boolean {
  if (!isValidSkillPart(group.skillArea, group.part) || group.questionIds.length === 0) return false;
  if (group.part === 1) return group.questionIds.length === 1 && group.stimuli.some((item) => item.type === "IMAGE") && group.stimuli.some((item) => item.type === "AUDIO");
  if (group.part === 2) return group.questionIds.length === 1 && group.stimuli.some((item) => item.type === "AUDIO");
  if (group.part === 3 || group.part === 4) return group.questionIds.length === 3 && group.stimuli.some((item) => item.type === "AUDIO");
  if (group.part === 5) return group.questionIds.length === 1 && group.stimuli.length === 0;
  return group.stimuli.some((item) => item.type === "TEXT");
}
