# Task 12: Production content pipeline

Task 12 keeps authored production content in versioned ESM manifests. Listening additions live in `content/listening/task-12-listening.mjs`; Reading additions use the established `scripts/part7-seed-data.mjs` manifest. Human-authored dependencies use stable external IDs such as `L-P2-PROD-011`; database UUIDs and R2 keys are derived deterministically.

## Workflow

```bash
npm run content:listening:validate
npm run content:listening:generate-media
npm run content:listening:report
npm run content:listening:publish -- --dry-run
npm run content:listening:publish
npm run content:reading:validate
npm run content:reading:publish
npm run validate:listening
npm run validate:reading
npm run validate:mock-readiness
```

Generated binaries and the Markdown review report are placed in `.content-generated/`, which is ignored by Git. The generated Part 1 scene is an original repository-generated PNG. Audio generation uses the OpenAI speech endpoint and writes MP3 files. Set `OPENAI_API_KEY`; `CONTENT_TTS_MODEL` is optional and defaults to `gpt-4o-mini-tts`. No credential is committed or logged.

Publishing requires `DATABASE_URL`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`. Run it only in the intended trusted content-generation environment. The dry run never connects to DB or R2 and reports planned mutations.

## Safety and idempotency

The importer validates the entire manifest before mutation. It validates MIME, size, checksum, dimensions/duration metadata, uploads through the same `MediaStorage` implementation used at runtime, verifies every object with a private-bucket HEAD request, and only then publishes its group in a transaction. Stable IDs, stable object keys, and upserts make reruns idempotent. A failed upload never publishes its group; a failed group transaction rolls back its database records and can be rerun.

Content is versioned with `version` in the manifest and stored in passage-set metadata. Corrections update the stable record. A meaningfully new question receives a new external ID. Test fixtures remain outside `content/` and are never inserted by this publisher.

Part 7 passage structure is explicit (`single`, `double`, or `triple`) and never inferred from question count. Six new original single passages provide five 2-question groups and one 3-question group. Together with four existing 4-question groups, the assembler can select exactly 10 groups and 29 questions. Existing double groups already provide five groups of five questions.

## Review and rollback

Run `content:listening:report` and listen to representative P1–P4 files before production activation. Automated checks cannot assess naturalness fully. To roll back, set the affected `passage_sets`, `passages`, and `questions` to `archived`; keep referenced media private and mark it `ARCHIVED`. Physical deletion remains an explicit operator cleanup and is blocked while references exist.

Troubleshooting: `MISSING_ENV` names only absent variables; `MISSING_GENERATED_MEDIA` means generation must run first; `UPLOAD_NOT_VERIFIED` means R2 did not confirm the object; and media validation errors indicate a malformed or unsupported file. R2 stays private, and learner access continues through signed URLs.
