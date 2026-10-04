export function normalizeDictation(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function dictationTokens(value: string) {
  const normalized = normalizeDictation(value);
  return normalized ? normalized.split(" ") : [];
}

function lcsLength(left: readonly string[], right: readonly string[]) {
  const row = new Array(right.length + 1).fill(0) as number[];
  for (const leftToken of left) {
    let diagonal = 0;
    for (let index = 1; index <= right.length; index += 1) {
      const above = row[index]!;
      row[index] =
        leftToken === right[index - 1]
          ? diagonal + 1
          : Math.max(row[index]!, row[index - 1]!);
      diagonal = above;
    }
  }
  return row[right.length]!;
}

export type DictationScore = {
  exact: boolean;
  accuracy: number;
  missingWords: string[];
  extraWords: string[];
};

export function scoreDictation(
  answer: string,
  transcript: string,
): DictationScore {
  const expected = dictationTokens(transcript);
  const actual = dictationTokens(answer);
  const exact =
    expected.length > 0 &&
    expected.length === actual.length &&
    expected.every((token, index) => token === actual[index]);
  const matches = lcsLength(expected, actual);
  const denominator = Math.max(expected.length, actual.length, 1);
  const expectedCounts = new Map<string, number>();
  const actualCounts = new Map<string, number>();
  for (const token of expected)
    expectedCounts.set(token, (expectedCounts.get(token) ?? 0) + 1);
  for (const token of actual)
    actualCounts.set(token, (actualCounts.get(token) ?? 0) + 1);
  const missingWords = [...expectedCounts]
    .flatMap(([token, count]) =>
      Array.from(
        { length: Math.max(0, count - (actualCounts.get(token) ?? 0)) },
        () => token,
      ),
    )
    .slice(0, 8);
  const extraWords = [...actualCounts]
    .flatMap(([token, count]) =>
      Array.from(
        { length: Math.max(0, count - (expectedCounts.get(token) ?? 0)) },
        () => token,
      ),
    )
    .slice(0, 8);
  return {
    exact,
    accuracy: Math.round((matches / denominator) * 100),
    missingWords,
    extraWords,
  };
}
