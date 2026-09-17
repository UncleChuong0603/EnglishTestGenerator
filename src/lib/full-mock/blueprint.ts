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

function chooseExact(units: readonly MockUnit[], groupCount: number, questionCount: number): MockUnit[] | null {
  const search = (at: number, chosen: MockUnit[], total: number): MockUnit[] | null => {
    if (chosen.length === groupCount) return total === questionCount ? chosen : null;
    if (at >= units.length || total >= questionCount || chosen.length + units.length - at < groupCount) return null;
    for (let index = at; index < units.length; index++) {
      const found = search(index + 1, [...chosen, units[index]], total + units[index].questionIds.length);
      if (found) return found;
    }
    return null;
  };
  return search(0, [], 0);
}

export function assembleFullMock(units: readonly MockUnit[]): MockForm | null {
  const uniqueUnits = [...new Map(units.map((unit) => [unit.id, unit])).values()];
  const byPart: Record<number, MockUnit[]> = {};
  for (const part of [1, 2, 3, 4, 5, 6] as const) {
    const target = FULL_MOCK_BLUEPRINT[part];
    const selected = chooseExact(uniqueUnits.filter((unit) => unit.part === part), target.groups, target.questions);
    if (!selected) return null;
    byPart[part] = selected;
  }
  const singles = chooseExact(uniqueUnits.filter((unit) => unit.part === 7 && unit.setType === "single"), 10, 29);
  const multiples = chooseExact(uniqueUnits.filter((unit) => unit.part === 7 && ["double", "triple"].includes(unit.setType)), 5, 25);
  if (!singles || !multiples) return null;
  byPart[7] = [...singles, ...multiples];
  const selectedUnits = Object.values(byPart).flat();
  const questionIds = selectedUnits.flatMap((unit) => unit.questionIds);
  if (questionIds.length !== 200 || new Set(questionIds).size !== 200 || new Set(selectedUnits.map((unit) => unit.id)).size !== selectedUnits.length) return null;
  return { byPart, questionIds };
}

export function deadlineFrom(startedAt: Date, section: "LISTENING" | "READING") {
  return new Date(startedAt.getTime() + (section === "LISTENING" ? LISTENING_DURATION_MS : READING_DURATION_MS));
}
