const STOP_WORDS = new Set([
  "a", "an", "and", "are", "at", "be", "been", "being", "by", "for", "from", "has", "have", "he", "her", "hers", "him", "his", "in", "into", "is", "it", "its", "of", "on", "or", "she", "that", "the", "their", "them", "they", "this", "to", "was", "were", "will", "with", "you", "your",
]);

const WORD_PATTERN = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;

export type TranscriptSegment = { text: string; highlighted: boolean };

function normalize(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/’/g, "'");
}

export function findAnswerKeywords(transcript: string, correctAnswer: string): string[] {
  const transcriptWords = new Set((transcript.match(WORD_PATTERN) ?? []).map(normalize));
  const seen = new Set<string>();

  return (correctAnswer.match(WORD_PATTERN) ?? []).filter((word) => {
    const normalized = normalize(word);
    if (seen.has(normalized) || STOP_WORDS.has(normalized) || (!/\d/.test(normalized) && normalized.length < 3)) return false;
    seen.add(normalized);
    return transcriptWords.has(normalized);
  });
}

export function buildTranscriptSegments(transcript: string, keywords: readonly string[]): TranscriptSegment[] {
  const normalizedKeywords = new Set(keywords.map(normalize));
  if (!normalizedKeywords.size) return [{ text: transcript, highlighted: false }];

  const segments: TranscriptSegment[] = [];
  let cursor = 0;
  for (const match of transcript.matchAll(WORD_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ text: transcript.slice(cursor, index), highlighted: false });
    segments.push({ text: match[0], highlighted: normalizedKeywords.has(normalize(match[0])) });
    cursor = index + match[0].length;
  }
  if (cursor < transcript.length) segments.push({ text: transcript.slice(cursor), highlighted: false });
  return segments;
}
