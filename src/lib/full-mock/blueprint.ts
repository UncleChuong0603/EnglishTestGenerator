export const FULL_MOCK_BLUEPRINT = {
  1: { questions: 6, groups: 6 },
  2: { questions: 25, groups: 25 },
  3: { questions: 39, groups: 13 },
  4: { questions: 30, groups: 10 },
  5: { questions: 30, groups: 30 },
  6: { questions: 16, groups: 4 },
  7: { questions: 54, groups: 15 },
} as const;

export const LISTENING_DURATION_MS = 45 * 60 * 1_000;
export const READING_DURATION_MS = 75 * 60 * 1_000;

export type MockUnit = {
  id: string;
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  setType: "standalone" | "photographs" | "question_response" | "conversation" | "talk" | "part6" | "single" | "double" | "triple";
  questionIds: string[];
};

export type MockForm = { byPart: Record<number, MockUnit[]>; questionIds: string[] };
export type MockMode = "LISTENING" | "READING" | "FULL";

function chooseExact(units: readonly MockUnit[], groupCount: number, questionCount: number): MockUnit[] | null {
  type Path = { unit: MockUnit | null; previous: Path | null };
  const states: Array<Array<Path | undefined>> = Array.from({ length: groupCount + 1 }, () => []);
  states[0][0] = { unit: null, previous: null };
  for (const unit of units) {
    const size = unit.questionIds.length;
    if (size < 1 || size > questionCount) continue;
    // Walk backward so one content group can contribute only once.
    for (let groups = groupCount - 1; groups >= 0; groups--) {
      for (let total = questionCount - size; total >= 0; total--) {
        const previous = states[groups][total];
        if (previous && !states[groups + 1][total + size]) {
          states[groups + 1][total + size] = { unit, previous };
        }
      }
    }
    const completed = states[groupCount][questionCount];
    if (completed) {
      const result: MockUnit[] = [];
      for (let node: Path | null = completed; node?.unit; node = node.previous) result.push(node.unit);
      return result.reverse();
    }
  }
  return null;
}

export function assembleMock(units: readonly MockUnit[], mode: MockMode): MockForm | null {
  const uniqueUnits = [...new Map(units.map((unit) => [unit.id, unit])).values()];
  const byPart: Record<number, MockUnit[]> = {};
  const parts = mode === "LISTENING" ? [1, 2, 3, 4] as const : mode === "READING" ? [5, 6] as const : [1, 2, 3, 4, 5, 6] as const;
  for (const part of parts) {
    const target = FULL_MOCK_BLUEPRINT[part];
    const selected = chooseExact(uniqueUnits.filter((unit) => unit.part === part), target.groups, target.questions);
    if (!selected) return null;
    byPart[part] = selected;
  }
  if (mode !== "LISTENING") {
    const singles = chooseExact(uniqueUnits.filter((unit) => unit.part === 7 && unit.setType === "single"), 10, 29);
    const multiples = chooseExact(uniqueUnits.filter((unit) => unit.part === 7 && ["double", "triple"].includes(unit.setType)), 5, 25);
    if (!singles || !multiples) return null;
    byPart[7] = [...singles, ...multiples];
  }
  const selectedUnits = Object.values(byPart).flat();
  const questionIds = selectedUnits.flatMap((unit) => unit.questionIds);
  const expected = mode === "FULL" ? 200 : 100;
  if (questionIds.length !== expected || new Set(questionIds).size !== expected || new Set(selectedUnits.map((unit) => unit.id)).size !== selectedUnits.length) return null;
  return { byPart, questionIds };
}

export const assembleListeningMock = (units: readonly MockUnit[]) => assembleMock(units, "LISTENING");
export const assembleReadingMock = (units: readonly MockUnit[]) => assembleMock(units, "READING");
export const assembleFullMock = (units: readonly MockUnit[]) => assembleMock(units, "FULL");

export function deadlineFrom(startedAt: Date, section: "LISTENING" | "READING") {
  return new Date(startedAt.getTime() + (section === "LISTENING" ? LISTENING_DURATION_MS : READING_DURATION_MS));
}
