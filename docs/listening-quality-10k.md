# Listening quality rules

The 10k question bank contains 2,500 Listening questions in each of the Mock and Practice pools.

## Content checks

- Incorrect option text must be unique across both Listening pools after NFKC, whitespace and case normalization.
- Correct answers may repeat across different questions. Every question still has distinct options and exactly one correct answer.
- Part 1 Practice keeps its original answer keys when replacing distractors, preserving existing attempt scoring.
- Part 2 transcript and spoken options are rebuilt from the published choices.

Run `node scripts/audit-listening-distractors.mjs --strict` before publication. Add `--database` with `DATABASE_URL` configured to compare every published Listening option and answer key with source, and check uniqueness in the database.

## Audio timing

| Boundary | Silence |
| --- | ---: |
| Part 1/2 option label to spoken choice | 400 ms |
| Part 1/2 between choices | 1,000 ms |
| Part 2 question label to prompt | 450 ms |
| Part 2 prompt to first choice | 1,200 ms |
| Part 3 between speaker turns | 550 ms |
| Part 4 between sentences | 450 ms |

These are application timing choices. Audio generation trims leading/trailing TTS silence before adding the intervals. The media fingerprint includes the segment text and intervals. Publication rejects stale fingerprints and updates file checksums and duration metadata.

## Corrective publication

Back up both the database and Listening media before replacing files. Publish Practice Listening with `publish --practice-bank`; publish Mock Part 3/4 with `publish --include-baseline --parts=3,4`. Use the same selectors for `generate-media` first. Compare the aggregate correct-option ID hash before and after publication, then run the database audit and `scripts/audit-question-bank-pools.mjs --require-ready`.

Exact text uniqueness is an automated check; it does not prove every distractor is pedagogically strong or semantically unambiguous.
