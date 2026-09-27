export type QuestionBankPool = "MOCK" | "PRACTICE";

export function resolveQuestionBankPool(requested: QuestionBankPool, isolated: boolean): QuestionBankPool {
  return requested === "MOCK" || isolated ? requested : "MOCK";
}
