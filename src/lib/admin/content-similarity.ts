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
  const leftWeights = tokenWeights(similarityTokens(left));
  const rightWeights = tokenWeights(similarityTokens(right));
  let overlap = 0;
  let total = 0;
  for (const value of leftWeights.values()) total += value;
  for (const value of rightWeights.values()) total += value;
  for (const [token, value] of leftWeights) overlap += Math.min(value, rightWeights.get(token) ?? 0);
  return total ? (2 * overlap) / total : 0;
}
