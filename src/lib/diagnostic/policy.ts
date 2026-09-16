import type { SelectionUnit } from "@/lib/practice/selection";
import type { ToeicProgress } from "@/lib/progress/types";

export function shouldRecommendDiagnostic(progress: ToeicProgress, hasCompletedDiagnostic: boolean) {
  if (hasCompletedDiagnostic) return false;
  const coveredParts = progress.parts.filter((part) => part.attemptedCount >= 3).length;
  const supportedParts = progress.parts.filter((part) => part.attemptedCount >= 8).length;
  return progress.attemptedCount < 21 && coveredParts < 4 && supportedParts === 0;
}

export function chooseDiverseUnits<T extends SelectionUnit & { skill?: string; subSkill?: string }>(units: readonly T[], target: number) {
  const remaining = [...units].sort((a, b) => a.id.localeCompare(b.id)); const selected: T[] = []; const skills = new Set<string>(); const subskills = new Set<string>(); let total = 0;
  while (remaining.length && total < target) { remaining.sort((a, b) => Number(subskills.has(a.subSkill ?? "")) - Number(subskills.has(b.subSkill ?? "")) || Number(skills.has(a.skill ?? "")) - Number(skills.has(b.skill ?? "")) || a.id.localeCompare(b.id)); const next = remaining.shift()!; selected.push(next); total += next.questionIds.length; skills.add(next.skill ?? ""); subskills.add(next.subSkill ?? ""); }
  return selected;
}
