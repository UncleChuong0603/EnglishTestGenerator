# 25 Full Mock forms

The published question bank contains 5,000 questions. The `full_mock_form_questions` table assigns every published question to exactly one of 25 forms. Each form contains 200 questions in canonical TOEIC part counts:

| Part | Per form | Bank total |
|---|---:|---:|
| 1 | 6 | 150 |
| 2 | 25 | 625 |
| 3 | 39 | 975 |
| 4 | 30 | 750 |
| 5 | 30 | 750 |
| 6 | 16 | 400 |
| 7 | 54 | 1,350 |

Part 3, Part 4, Part 6, and Part 7 content groups stay intact. Part 7 has ten single passage groups for 29 questions and five multiple passage groups for 25 questions in each form.

`scripts/plan-full-mock-forms.mjs` checks the source content for duplicate context + question + correct answer combinations, unique choices within each question, the 200-question blueprint, and 5,000 unique question identifiers. The same short answer text can occur in different contexts, as is normal for grammar and comprehension questions. Part 1 includes new spoken descriptions of existing validated photographs. The new audio files are separate and correspond to each new answer order.

The later bank-wide requirement is stronger: no *incorrect option text* may repeat anywhere in the 5,000-question mapped bank. The source planner and `scripts/audit-source-distractors.mjs --strict` enforce this after Unicode, case, and whitespace normalization. Reading options are contextualized into complete scenario-specific alternatives in `scripts/unique-question-bank-options.mjs`; correct option IDs and question IDs remain stable. This changes some Part 5 and Part 6 options from short fillers to full-sentence choices, so an editorial review should assess the resulting exam style before treating these items as official-test equivalents.

The form seed verifies published questions, options, solutions, and ready Listening media before writing assignments. It also reconciles the 100 existing imported Part 5 questions in production into the slots occupied by 100 source-only Part 5 seed questions. It verifies that no selected Part 5 question and correct answer pair repeats. The production mapping is therefore exactly 5,000 published questions, with no question assigned twice.

When a learner starts a Full Mock, the application loads the next planned form in their sequence. After form 25, the sequence starts again at form 1. Listening-only and Reading-only mocks retain their existing selection behavior. If a planned form is incomplete or its questions are unpublished, the Full Mock fails closed before consuming a learner entitlement.

## Operator commands

Run source validation and dry runs:

```sh
npm run validate:reading
npm run validate:listening
npm run validate:25-full-mocks
node scripts/audit-source-distractors.mjs --strict
node scripts/seed-reading.mjs --form25-only --dry-run
node scripts/publish-form25-listening.mjs --dry-run
node scripts/seed-full-mock-forms.mjs --dry-run
```

For a fresh database, apply Drizzle migrations, publish the complete Reading and Listening banks and their media, then run `scripts/seed-full-mock-forms.mjs`. For an existing 2,000-question production bank, `node scripts/seed-reading.mjs --form25-only` upserts only the 1,500 new Reading questions. `node scripts/publish-form25-listening.mjs` publishes only the 1,500 new Listening questions after the 810 corresponding audio files and 90 photograph copies have been generated under `.content-generated`. The scripts require the production `DATABASE_URL`; the Listening publisher also needs `LOCAL_MEDIA_ROOT`.

`scripts/apply-form25-migration.mjs` applies and records the migration for environments where the normal Drizzle migrator is unavailable. Do not run it after the migration has already been applied by Drizzle with a different hash.

After source edits, export the desired Reading and Listening content with `scripts/export-reading-option-sync.mjs` and `scripts/export-listening-option-sync.mjs`. Apply the Reading JSON with `scripts/sync-reading-option-bank.mjs` in an environment with `DATABASE_URL`. For Listening, first run `scripts/sync-listening-option-bank.mjs --dry-run --plan-output=...` to identify groups whose audio must change. Generate those recordings with the Listening media pipeline, stage them with `scripts/stage-listening-audio-sync.mjs`, then apply the Listening JSON and audio together. Run `scripts/audit-full-mock-bank.mjs` against the published database and media root; it checks all mapped options, answer keys, Listening files, and source comparisons. These scripts update existing question and option IDs, so both Full Mock and the practice selector continue to reuse the same question bank.

## Production verification, 2026-09-23

- Pre-import custom-format backup: `/root/backups/toeicgym/toeicgym-2026-09-23-pre-25-forms.dump` on `english-vps`. SHA-256: `a63ed75eb5e83d6391267e4a043e2434409d21b011744fc5b77bb25056372591`. `pg_restore -l` succeeded in the PostgreSQL container.
- Published questions by Part: 150, 625, 975, 750, 750, 400, 1,350; total 5,000.
- Form assignment table: 25 forms; 200 unique question IDs per form; 5,000 distinct IDs globally.
- Database audit: zero split content groups, zero questions with duplicate answer choices, and zero answer keys pointing to another question.
- Source validation, TypeScript check, production build, and relevant Full Mock tests passed. Production app health endpoint returned HTTP 200.
- Follow-up audit: all 2,500 Listening questions match their source options and transcripts. All 1,350 audio files and 150 Part 1 image files were readable and matched database sizes and SHA-256 checksums. The 279 changed Part 1/2 recordings were regenerated, fingerprint-checked against the current source, and published under versioned media keys. Across all 5,000 mapped questions, the live bank has zero repeated incorrect option texts and zero repeated options within a question. The existing `questions`, `question_options`, `question_solutions`, `passage_sets`, and media tables are used by both Full Mock and ordinary practice selection.
- The follow-up audit also verified that all 5,000 published questions are mapped, practice eligibility metadata is present, and Reading options, Part 5 prompts, and Part 6 passages match the authored source. A later local type check reported two errors in concurrently edited `src/app/blog/page.tsx`; the task-specific ESLint check and the earlier production build passed.

The imported questions are original development content. Automated checks establish structure, answer key completeness and exact duplicate detection; they do not replace a full human editorial review for exam difficulty or linguistic quality.
