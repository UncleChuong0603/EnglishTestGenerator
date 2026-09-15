import { describe, expect, it } from "vitest";
import { canUnlockListeningGroupReview, hasExactCompleteGroupAnswers } from "./group-submission";

const ids = ["q1", "q2", "q3"];
describe("Listening grouped submission security", () => {
  it("accepts exactly three complete answers regardless of request order", () => expect(hasExactCompleteGroupAnswers(ids, [{ questionId: "q3", selectedOptionId: "o3" }, { questionId: "q1", selectedOptionId: "o1" }, { questionId: "q2", selectedOptionId: "o2" }])).toBe(true));
  const invalidCases = [
    [{ questionId: "q1", selectedOptionId: "o1" }],
    [{ questionId: "q1", selectedOptionId: "o1" }, { questionId: "q2", selectedOptionId: "o2" }],
    [{ questionId: "q1", selectedOptionId: "o1" }, { questionId: "q2", selectedOptionId: "o2" }, { questionId: "foreign", selectedOptionId: "o3" }],
    [{ questionId: "q1", selectedOptionId: "o1" }, { questionId: "q2", selectedOptionId: "o2" }, { questionId: "q3", selectedOptionId: null }],
  ];
  it("rejects partial, foreign, or unanswered payloads", () => { for (const answers of invalidCases) expect(hasExactCompleteGroupAnswers(ids, answers)).toBe(false); });
  it("does not unlock transcript, answers, correctness, or explanations after one/two persisted children", () => { expect(canUnlockListeningGroupReview(ids, ["q1"])).toBe(false); expect(canUnlockListeningGroupReview(ids, ["q1", "q2"])).toBe(false); });
  it("unlocks the entire review only after all three children persist", () => expect(canUnlockListeningGroupReview(ids, ids)).toBe(true));
});
