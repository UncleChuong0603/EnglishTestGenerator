import {
  flattenUniqueQuestionIds,
  rankPreferUnseen,
  type ContentHistory,
  type SelectionUnit,
} from "@/lib/practice/selection";
import { SHORT_MOCK_QUESTION_COUNT } from "./config";

export function hasShortMockCapacity(units: readonly SelectionUnit[]) {
  return flattenUniqueQuestionIds(units).length >= SHORT_MOCK_QUESTION_COUNT;
}

export function selectShortMockQuestionIds(
  units: readonly SelectionUnit[],
  history: ContentHistory,
) {
  return flattenUniqueQuestionIds(
    rankPreferUnseen(units, history).slice(0, SHORT_MOCK_QUESTION_COUNT),
  ).slice(0, SHORT_MOCK_QUESTION_COUNT);
}
