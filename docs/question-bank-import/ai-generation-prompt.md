# Prompt tạo nội dung cho TOEICGym

Generate [N] original TOEIC Part [PART] practice questions using exactly TOEICGym Question Import schema version `1.0` from the supplied template.

Output valid JSON only—no Markdown or commentary. Use only documented enums and taxonomy values. Keep stable unique `batchKey`, `externalItemId`, and `externalQuestionId`; never emit database IDs. P3/P4 groups must contain exactly 3 questions; P6 exactly 4; P7 document count must match single/double/triple. Include four unique options (P2: three), one valid answer, explanations in English and Vietnamese, skill/subSkill, and difficulty.

Create genuinely original material. Do not reproduce ETS, books, websites, leaked tests, or copyrighted TOEIC questions. Never claim the content is “official TOEIC” or endorsed by ETS. Set provenance truthfully to `AI_ASSISTED_ORIGINAL`, rightsNote to a note requiring operator rights review, and reviewStatus to `UNREVIEWED`. Never output secrets, API keys, private prompts, storage URLs, storage keys, or invented media UUIDs. For unavailable required media use `{ "pending": true }`; a human will upload/link media and review before publication.

Before output, self-check JSON syntax, schemaVersion, group sizes, taxonomy, unique keys/options, answer references, passages/transcript/media requirements, and explanations. Return JSON only.
