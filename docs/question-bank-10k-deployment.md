# Question bank 10,000: publication checklist

The target is 5,000 existing `MOCK` questions plus 5,000 new `PRACTICE` questions. The new Practice distribution is Part 1: 100, Part 2: 900, Part 3: 900, Part 4: 600, Part 5: 1,000, Part 6: 400, Part 7: 1,100. Keep `PRACTICE_POOL_ISOLATED=false` until the final database audit passes.

## Complete local media and content checks

1. Generate the remaining original Part 1 contact sheets. For each number 5 through 25, get the prompt with `node scripts/print-practice-part1-sheet-prompt.mjs NUMBER`, generate the sheet with the image tool, inspect it, then crop it with `node scripts/extract-practice-part1-sheet.mjs SHEET_PATH NUMBER`. Do not substitute generic photos or reuse Mock photos.
2. Copy all 100 authored photos into `.content-generated` with `node --conditions=react-server --import tsx scripts/content-pipeline.ts generate-media --practice-bank --parts=1`. Audio should be skipped because its fingerprints already match.
3. Run `node scripts/validate-practice-bank.mjs --require-media`, `node --conditions=react-server --import tsx scripts/audit-practice-media.ts`, `node scripts/seed-reading.mjs --practice-bank --dry-run`, `node scripts/audit-practice-distractors.mjs`, and `node --conditions=react-server --import tsx scripts/content-pipeline.ts validate --practice-bank`. Require zero errors and 1,500 audio plus 100 images.
4. Commit all authored photos. Rebase the feature branch on the current `main`, run typecheck and pool migration tests, then merge and deploy the code before publishing data.

## Production rollout

1. On `english-vps`, inspect the current Dokploy checkout and preserve its locally modified Compose file. Take and verify a fresh PostgreSQL backup before any migration or seed. Confirm the media volume and free disk space.
2. Deploy the code with `PRACTICE_POOL_ISOLATED=false`. Migration `0039_wise_gauntlet.sql` adds `bank_pool` and marks all existing Full Mock questions `MOCK`. Confirm the existing 5,000 published Mock questions and 25 mappings still pass the pool audit. With the flag false, Practice continues to use the Mock pool during the upload.
3. Transfer the complete `.content-generated` folder to a staging path on the VPS. The database-tools image intentionally excludes that folder, so bind-mount the staging directory to `/app/.content-generated:ro` when running the one-off `db-tools` container. Its configured media volume is mounted at `LOCAL_MEDIA_ROOT`.
4. Run `node --conditions=react-server --import tsx scripts/content-pipeline.ts publish --practice-bank` in `db-tools` with the generated-media bind mount. It checks every file and audio fingerprint before uploading. Rerunning after an interruption is idempotent.
5. Run `node scripts/seed-reading.mjs --practice-bank` in `db-tools`. Run `node scripts/audit-question-bank-pools.mjs --require-ready` afterward. Require exactly 5,000 `MOCK`, 5,000 `PRACTICE`, 25 intact Full Mock forms, complete answers and media, and no active challenges using Mock questions.
6. Only after the audit passes, set `PRACTICE_POOL_ISOLATED=true` in production environment and recreate the app container. Check `/api/health`, a Practice session in each Part, and a Full Mock form. Re-run the pool audit and record the final counts.

Do not turn on pool isolation while a publication step is incomplete. Existing Practice stays usable from the Mock pool with the flag false.
