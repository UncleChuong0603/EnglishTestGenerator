import type { ResponseType } from "./domain";

export type MultipleChoiceResponse = { type: "MULTIPLE_CHOICE"; selectedOptionId: string | null };
export type LearnerResponse = MultipleChoiceResponse | { type: "TEXT"; text: string } | { type: "AUDIO"; mediaAssetId: string };
export type DeterministicEvaluation = { method: "DETERMINISTIC"; status: "COMPLETED"; isCorrect: boolean };
export type PendingEvaluation = { method: "RUBRIC" | "AI_ASSISTED"; status: "PENDING" };
export type Evaluation = DeterministicEvaluation | PendingEvaluation;

export function isSupportedResponseType(type: ResponseType): type is "MULTIPLE_CHOICE" {
  return type === "MULTIPLE_CHOICE";
}

export function responseMatchesType(responseType: ResponseType, response: LearnerResponse): boolean {
  return responseType === response.type && isSupportedResponseType(responseType);
}

export function evaluateMultipleChoice(response: MultipleChoiceResponse, correctOptionId: string): DeterministicEvaluation {
  return { method: "DETERMINISTIC", status: "COMPLETED", isCorrect: response.selectedOptionId !== null && response.selectedOptionId === correctOptionId };
}
