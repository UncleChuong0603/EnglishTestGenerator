# Task 4 — Listening Part 3 and Part 4

Part 3 conversations and Part 4 talks reuse `passage_sets`, group media, transcripts, practice sessions and per-question attempt rows. A set is eligible only when its published group has exactly three ordered questions, four options and a valid solution/explanation per question, one READY CONTENT audio, at most one READY CONTENT image, and a transcript.

The fixture manifest in `scripts/listening-fixture-data.mjs` is original deterministic developer-created content. It contains five Part 3 groups and five Part 4 groups; the first group of each part demonstrates the optional graphic. Asset references are storage keys, never signed URLs. Operators should create/upload the referenced audio/image files with the existing R2 ingestion workflow, attach the resulting READY CONTENT assets to the matching `passage_set`, and import the group/questions/options/solutions/transcript in one database transaction. No new environment variables or migration are required.

Validate manifests with:

```bash
npm run validate:listening
```

## Manual smoke test

1. Sign in, open Practice, and start Part 3.
2. Confirm one complete set, shared audio and optional graphic load; play and replay audio.
3. Select Q1 and Q2 and confirm no transcript, correctness, solution, or explanation appears or exists in the learner payload.
4. Answer Q3 and submit the set. Confirm all three results and transcript appear together.
5. Continue through the next set and repeat the flow for Part 4.
6. At narrow mobile width, verify wrapping, image aspect ratio, audio access, tap targets, and no horizontal overflow.
7. Regression-smoke Part 1, Part 2 and Reading Parts 5–7.

## Production/R2 operator verification

1. Upload each `fixtures/listening/p3-g*.mp3` and `p4-g*.mp3` object, plus the referenced `g1.png` graphics, through the existing media ingestion service.
2. Verify each DB asset is `READY`, `CONTENT`, and attached with its `AUDIO` or `IMAGE` role to the correct group.
3. Deploy the application with the existing R2 variables, run `npm run validate:listening`, and start one session for Parts 1–4.
4. Verify initial signed delivery, replay, and URL refresh after expiry. Confirm another user/session and unattached or non-ready assets cannot be signed.

Real production R2 browser smoke testing requires operator verification when production credentials/assets are unavailable locally.
