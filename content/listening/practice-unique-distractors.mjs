const normalize = value => String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();

function contextualizeWrong(item, text, used) {
  const base = text.trim().replace(/[.!?]+$/, "");
  const context = item.distractorContext;
  if (!context) throw new Error(`Missing distractor context: ${item.externalId}`);
  let candidates;
  if (item.part === 2) {
    const project = `${context.company}${context.company.endsWith("s") ? "'" : "'s"} ${context.project}`;
    candidates = [
      `${base} for ${project}.`,
      `${base} for ${project} on ${context.day}.`,
      `${base} for ${project} at ${context.time} on ${context.day}.`,
      `${base} for ${project}, according to ${context.person} on ${context.day}.`,
      `${base} for ${project}, according to ${context.person} at ${context.time} on ${context.day}.`,
    ];
  } else {
    candidates = [
      `${base} ${base.includes(context.site) ? "during" : "at"} ${base.includes(context.site) ? `the ${context.topic}` : context.site}.`,
      `${base} during the ${context.topic} at ${context.site}.`,
      `${base} during the ${context.topic} at ${context.site} on ${context.day}.`,
      `${base} during the ${context.topic} at ${context.site} before ${context.time} on ${context.day}.`,
    ];
  }
  const next = candidates.find(candidate => !used.has(normalize(candidate)));
  if (!next) throw new Error(`No unique distractor context: ${item.externalId}`);
  return next;
}

export function uniquifyPracticeDistractors(items) {
  // This short response is already an incorrect option in the Mock bank.
  const used = new Set([normalize("At the training center.")]);
  for (const item of items) {
    for (const question of item.questions ?? [item.question]) {
      for (const option of question.options) {
        if (option.key === question.correctKey) continue;
        let key = normalize(option.text);
        if (used.has(key)) {
          option.text = contextualizeWrong(item, option.text, used);
          key = normalize(option.text);
        }
        if (used.has(key)) throw new Error(`Repeated practice distractor after contextualization: ${item.externalId}:Q${question.order}`);
        used.add(key);
      }
    }
    if (item.part === 2) {
      const prompt = item.transcript.match(/^Question:\s*(.+?)(?:\r?\n|$)/)?.[1];
      if (!prompt) throw new Error(`Missing question prompt: ${item.externalId}`);
      item.transcript = `Question: ${prompt}\n${item.question.options.map(option => `${option.key}. ${option.text}`).join("\n")}`;
      item.script = [item.script[0], { speaker: "NARRATOR", text: item.question.options.map(option => `${option.key}. ${option.text}`).join(" ") }];
    }
  }
  return items;
}
