/**
 * Keep authored distractors tied to their own scenario without adding artificial
 * IDs or display-only suffixes. All transformations preserve the correct key.
 */
export function contextualizePart5(question) {
  const gap = question.text.indexOf("_____");
  if (gap < 0) throw new Error(`Part 5 question has no gap: ${question.key}`);
  const prefix = question.text.slice(0, gap);
  const suffix = question.text.slice(gap + 5);
  return {
    ...question,
    text: `Choose the best completed sentence: ${question.text}`,
    options: question.options.map((option) => ({ ...option, text: `${prefix}${option.text}${suffix}` })),
  };
}

function contextualizePart6(set) {
  const passage = set.passages[0];
  let content = passage.content;
  const questions = set.questions.map((question) => {
    const marker = `(${question.order}) _____`;
    const offset = content.indexOf(marker);
    if (offset < 0) throw new Error(`Missing Part 6 gap: ${set.key} ${marker}`);
    if (question.order === 4) {
      return { ...question, options: question.options.map((option) => ({ ...option, text: `Regarding ${set.title}, ${option.text[0].toLowerCase()}${option.text.slice(1)}` })) };
    }
    const before = content.slice(0, offset);
    const after = content.slice(offset + marker.length);
    const prefixBoundary = Math.max(before.lastIndexOf(". "), before.lastIndexOf("\n"));
    const prefixStart = prefixBoundary < 0 ? 0 : prefixBoundary + (before[prefixBoundary] === "." ? 2 : 1);
    const endMatch = after.match(/\. (?=[A-Z(])/);
    if (!endMatch || endMatch.index === undefined) throw new Error(`Cannot isolate Part 6 sentence: ${set.key} ${marker}`);
    const sentenceEnd = offset + marker.length + endMatch.index + 1;
    const sentence = content.slice(prefixStart, sentenceEnd);
    const contextualSentence = (option) => {
      const filled = sentence.replace(marker, option.text).replace(/\.$/, "");
      return `Regarding ${set.title}, ${filled[0].toLowerCase()}${filled.slice(1)}`;
    };
    content = `${content.slice(0, prefixStart)}${marker}.${content.slice(sentenceEnd)}`;
    return { ...question, options: question.options.map((option) => ({ ...option, text: contextualSentence(option) })) };
  });
  return { ...set, passages: [{ ...passage, content }, ...set.passages.slice(1)], questions };
}

function contextualizePart7(set) {
  const context = set.title.replace(/ (Update|Service Update)$/i, "");
  return {
    ...set,
    questions: set.questions.map((question) => ({
      ...question,
      options: question.options.map((option) => option.correct ? option : {
        ...option,
        text: `${option.text.replace(/[. ]+$/, "")} for ${context}`,
      }),
    })),
  };
}

export function contextualizeReadingSet(set) {
  return set.toeicPart === 6 ? contextualizePart6(set) : contextualizePart7(set);
}
