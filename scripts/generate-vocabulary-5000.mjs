// Usage: node scripts/generate-vocabulary-5000.mjs <thichhoc-dict checkout>
// Source revision: 4d6e92e8bcf8e3e762410c2b0a9f98fea8e62e5b (CC BY-SA 4.0).
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error("Pass the path to a thichhoc-dict checkout.");
const sourceRevision = "4d6e92e8bcf8e3e762410c2b0a9f98fea8e62e5b";
const checkoutRevision = execFileSync("git", ["-C", resolve(sourceRoot), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (checkoutRevision !== sourceRevision) throw new Error(`Expected dictionary revision ${sourceRevision}, found ${checkoutRevision}.`);

const output = resolve("src/lib/vocabulary/study-additional.json");
const entriesDirectory = join(resolve(sourceRoot), "dict-en-vi", "data", "entries");
const existing = JSON.parse(readFileSync(resolve("src/lib/vocabulary/study-expanded.json"), "utf8"));
const foundationSource = readFileSync(resolve("src/lib/vocabulary/study-list.ts"), "utf8");
const foundation = [...foundationSource.matchAll(/\b(?:word|phrase)\("([a-z-]+)"/g)].map((match) => match[1]);
if (foundation.length !== 100 || existing.length !== 900) throw new Error("The existing 1,000 entries have changed; review the selection before regenerating.");

const seen = new Set([...foundation, ...existing.map((entry) => entry.key)]);
const excluded = new Set([
  "about", "above", "after", "again", "against", "all", "along", "also", "among", "another", "anyone", "anything", "around", "because", "before", "below", "between", "both", "but", "can", "could", "either", "every", "everyone", "everything", "first", "from", "have", "himself", "herself", "itself", "just", "maybe", "might", "more", "most", "much", "myself", "never", "none", "not", "nothing", "one", "other", "others", "ourselves", "out", "shall", "should", "some", "someone", "something", "than", "that", "their", "theirs", "them", "there", "these", "they", "this", "those", "through", "thus", "until", "upon", "very", "were", "what", "when", "where", "whether", "which", "while", "who", "whom", "whose", "will", "with", "would", "yourself", "yourselves",
  "damn", "fuck", "fucking", "hell", "shit", "bitch",
  "thou", "thee", "thyself", "mon", "murphy", "rico", "pac", "mls", "ira", "chad", "china", "portugal", "oregon", "quebec", "washington", "perry", "bangladesh",
]);
const posRank = { n: 0, adj: 1, v: 2, adv: 3 };
const confidenceRank = { high: 0, medium: 1 };
const best = new Map();
const inflected = new Set();
const rows = [];

for (const filename of readdirSync(entriesDirectory).filter((name) => name.endsWith(".jsonl")).sort()) {
  for (const line of readFileSync(join(entriesDirectory, filename), "utf8").split(/\r?\n/)) {
    if (!line) continue;
    const row = JSON.parse(line);
    rows.push(row);
    if (/^[a-z]{3,}$/.test(row.headword)) {
      for (const form of row.inflections ?? []) {
        if (/^[a-z]{3,}$/.test(form) && form.endsWith("s") && form !== row.headword) inflected.add(form);
      }
    }
  }
}

for (const row of rows) {
    const term = row.headword;
    const meaningVi = row.senses_vi?.[0]?.trim();
    const meaningEn = row.senses_en?.[0]?.trim();
    if (!/^[a-z]{3,}$/.test(term) || seen.has(term) || excluded.has(term) || inflected.has(term) ||
        row.freq_tier > 3 || !(row.freq > 0) || !(row.pos in posRank) ||
        !(row.extra?.tag > 0) ||
        !meaningVi || !meaningEn || meaningVi.length > 130 || meaningEn.length > 180 ||
        /\b(?:US state|Canadian province|capital of|country in|nation in|republic in|city in|town in|county in|river in|island in|surname|given name|English philosopher|American philosopher|English statesman|biblical name|UN international|master's degree in)\b/i.test(meaningEn) ||
        /\b(?:tiểu bang|thủ đô|tỉnh Quebec|nhà triết học Mỹ|nhà triết học Anh|chính khách Anh|đạo luật chống tội phạm)\b/i.test(meaningVi)) continue;

    const current = best.get(term);
    const rank = (row.extra?.tag ?? 0) * 100 - posRank[row.pos] * 10 - (confidenceRank[row.extra?.llm_confidence] ?? 2);
    if (!current || rank > current.rank) {
      best.set(term, { rank, freq: row.freq, entry: {
        key: term, term, meaningVi, meaningEn, kind: "word", example: "",
      } });
    }
}

const chosen = [...best.values()]
  .sort((a, b) => b.freq - a.freq || a.entry.term.localeCompare(b.entry.term, "en"))
  .slice(0, 4000)
  .map(({ entry }) => entry);
if (chosen.length !== 4000) throw new Error(`Only ${chosen.length} suitable entries were found.`);
writeFileSync(output, `${JSON.stringify(chosen, null, 2)}\n`, "utf8");
console.log(`Wrote ${chosen.length} new terms to ${output}.`);
