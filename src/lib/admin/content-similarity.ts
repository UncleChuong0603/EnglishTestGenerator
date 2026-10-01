import { normalizeContent } from "@/lib/question-import/schema";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "by", "for", "from", "has", "have", "he", "her", "his", "in", "is", "it", "its", "of", "on", "or", "she", "that", "the", "their", "they", "this", "to", "was", "were", "will", "with", "you", "your",
  "according", "following", "most", "likely", "probably", "question", "answer", "choose", "best", "correct",
]);

export function similarityTokens(value: string) {
  return normalizeContent(value).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function tokenWeights(tokens: string[]) {
  const weights = new Map<string, number>();
  for (const token of tokens) weights.set(token, (weights.get(token) ?? 0) + 1);
  for (let index = 0; index < tokens.length - 1; index++) {
    const bigram = `${tokens[index]} ${tokens[index + 1]}`;
    weights.set(bigram, (weights.get(bigram) ?? 0) + 2);
  }
  return weights;
}

export function calculateContentSimilarity(left: string, right: string) {
  return calculatePreparedSimilarity(prepareContentSimilarity(left), prepareContentSimilarity(right));
}

export function prepareContentSimilarity(text: string) {
  const tokens = similarityTokens(text);
  const weights = tokenWeights(tokens);
  return { weights, terms: new Set(tokens), total: [...weights.values()].reduce((sum, value) => sum + value, 0) };
}

export function calculatePreparedSimilarity(left: ReturnType<typeof prepareContentSimilarity>, right: ReturnType<typeof prepareContentSimilarity>) {
  let overlap = 0;
  const total = left.total + right.total;
  const [smaller, larger] = left.weights.size <= right.weights.size ? [left.weights, right.weights] : [right.weights, left.weights];
  for (const [token, value] of smaller) overlap += Math.min(value, larger.get(token) ?? 0);
  return total ? (2 * overlap) / total : 0;
}
