import { describe, expect, it } from "vitest";
import { assembleFullMock, deadlineFrom, FULL_MOCK_BLUEPRINT, type MockUnit } from "./blueprint";

function fixtures(): MockUnit[] {
  const result: MockUnit[] = [];
  const add = (part: MockUnit["part"], count: number, size: number, setType: MockUnit["setType"]) => {
    for (let i = 0; i < count; i++) result.push({ id: `p${part}-g${i}`, part, setType, questionIds: Array.from({ length: size }, (_, q) => `p${part}-g${i}-q${q}`) });
  };
  add(1, 6, 1, "photographs"); add(2, 25, 1, "question_response"); add(3, 13, 3, "conversation"); add(4, 10, 3, "talk");
  add(5, 30, 1, "standalone"); add(6, 4, 4, "part6");
  [3,3,3,3,3,3,3,3,3,2].forEach((size, i) => result.push({ id: `p7-s${i}`, part: 7, setType: "single", questionIds: Array.from({ length: size }, (_, q) => `p7-s${i}-q${q}`) }));
  add(7, 5, 5, "double"); return result;
}

describe("full mock blueprint", () => {
  it("assembles exactly 200 unique questions and all official part counts", () => {
    const form = assembleFullMock(fixtures()); expect(form).not.toBeNull(); expect(form!.questionIds).toHaveLength(200);
    for (const part of [1,2,3,4,5,6,7]) expect(form!.byPart[part].flatMap((u) => u.questionIds)).toHaveLength(FULL_MOCK_BLUEPRINT[part as keyof typeof FULL_MOCK_BLUEPRINT].questions);
    expect(form!.byPart[7].filter((u) => u.setType === "single")).toHaveLength(10);
  });
  it("fails closed for the current 45-question Listening coverage", () => {
    const units = fixtures().filter((u) => !(u.part === 1 && Number(u.id.split("g")[1]) >= 5) && !(u.part === 2 && Number(u.id.split("g")[1]) >= 10) && !(u.part === 3 && Number(u.id.split("g")[1]) >= 5) && !(u.part === 4 && Number(u.id.split("g")[1]) >= 5));
    expect(assembleFullMock(units)).toBeNull();
  });
  it("rejects duplicate questions", () => { const rows = fixtures(); rows[1].questionIds = rows[0].questionIds; expect(assembleFullMock(rows)).toBeNull(); });
  it("uses server timestamps for immutable section deadlines", () => { const at = new Date("2026-01-01T00:00:00Z"); expect(deadlineFrom(at, "LISTENING").toISOString()).toBe("2026-01-01T00:45:00.000Z"); expect(deadlineFrom(at, "READING").toISOString()).toBe("2026-01-01T01:15:00.000Z"); });
});
