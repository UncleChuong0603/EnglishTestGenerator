import { TOEIC_PARTS_BY_SKILL, type ListeningPart, type PartBearingSkillArea, type ReadingPart, type ToeicPart } from "../toeic/domain";
import type { PartProgress, ProgressAggregateRow, ProgressCounts, SkillAreaProgress, SkillProgress, SubskillProgress, ToeicProgress } from "./types";

// Product-wide presentation rule: nearest integer percentage; null means no data.
export function progressAccuracy(correctCount: number, attemptedCount: number): number | null {
  return attemptedCount === 0 ? null : Math.round((correctCount / attemptedCount) * 100);
}

function combine(rows: ProgressAggregateRow[]): ProgressCounts {
  const attemptedCount = rows.reduce((sum, row) => sum + row.attemptedCount, 0);
  const correctCount = rows.reduce((sum, row) => sum + row.correctCount, 0);
  const dates = rows.flatMap((row) => row.latestAttemptAt ? [row.latestAttemptAt] : []);
  return { attemptedCount, correctCount, accuracy: progressAccuracy(correctCount, attemptedCount), latestAttemptAt: dates.sort().at(-1) ?? null };
}

function skillBreakdown(rows: ProgressAggregateRow[]): SkillProgress[] {
  const skills = new Map<string, ProgressAggregateRow[]>();
  for (const row of rows) skills.set(row.skill, [...(skills.get(row.skill) ?? []), row]);
  return [...skills.entries()].map(([name, skillRows]) => {
    const subskills: SubskillProgress[] = skillRows.map((row) => ({ name: row.subskill, ...combine([row]) }))
      .sort((a, b) => b.attemptedCount - a.attemptedCount || a.name.localeCompare(b.name));
    return { name, ...combine(skillRows), subskills };
  }).sort((a, b) => b.attemptedCount - a.attemptedCount || a.name.localeCompare(b.name));
}

function partProgress(part: ToeicPart, rows: ProgressAggregateRow[]): PartProgress {
  const ownRows = rows.filter((row) => row.part === part);
  return { part, ...combine(ownRows), skills: skillBreakdown(ownRows) };
}

function areaProgress<A extends PartBearingSkillArea>(skillArea: A, rows: ProgressAggregateRow[]): SkillAreaProgress<A> {
  const ownRows = rows.filter((row) => row.skillArea === skillArea);
  const partNumbers = TOEIC_PARTS_BY_SKILL[skillArea] as readonly ToeicPart[];
  return { skillArea, ...combine(ownRows), parts: partNumbers.map((part) => partProgress(part, ownRows)) as SkillAreaProgress<A>["parts"], skills: skillBreakdown(ownRows) };
}

export function calculateToeicProgress(rows: ProgressAggregateRow[]): ToeicProgress {
  const listening = areaProgress("LISTENING", rows) as SkillAreaProgress<"LISTENING">;
  const reading = areaProgress("READING", rows) as SkillAreaProgress<"READING">;
  return { ...combine(rows), listening, reading, parts: [...listening.parts, ...reading.parts] };
}

export type { ListeningPart, ReadingPart };
