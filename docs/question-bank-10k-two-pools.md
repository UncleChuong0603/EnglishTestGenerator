# 10,000-question bank: separate mock and practice pools

## Target

Keep the 5,000 published questions already assigned to 25 full mocks as the
`MOCK` pool. Add 5,000 new, editorially reviewed questions to a `PRACTICE`
pool. A question belongs to one pool, and every child of a Listening or Reading
group belongs to the same pool. Full, Listening, and Reading mocks draw from
`MOCK`; workouts, manual practice, diagnostic, and recommendations draw from
`PRACTICE`. Mistake review may revisit a question the learner has already
answered, regardless of its source pool.

| Part | Mock now | New practice | Target total | New practice groups |
|---|---:|---:|---:|---:|
| 1 | 150 | 100 | 250 | 100 photographs |
| 2 | 625 | 900 | 1,525 | 900 responses |
| 3 | 975 | 900 | 1,875 | 300 conversations |
| 4 | 750 | 600 | 1,350 | 200 talks |
| 5 | 750 | 1,000 | 1,750 | 1,000 standalone questions |
| 6 | 400 | 400 | 800 | 100 four-question texts |
| 7 | 1,350 | 1,100 | 2,450 | Complete single and multiple-passage sets |
| **Total** | **5,000** | **5,000** | **10,000** | |

The new practice distribution has 2,500 Listening and 2,500 Reading questions.
Part 2 and Part 5 receive more volume than their exam share because short,
focused sessions can target those skills repeatedly. Part 1 needs original
photographs as well as audio, so 100 additional items provide substantial
practice without consuming a disproportionate share of the media budget.
Part 3, Part 4, Part 6,
and Part 7 counts preserve intact content groups. Part 7's exact split between
single and multiple passages should be chosen as each batch is authored; a
starting target is 600 single and 500 multiple-passage questions.

## Release sequence

1. Add a pool designation and indexes. Backfill the 5,000 mapped questions as
   `MOCK`; leave current learner selection behavior active during production.
2. Create original practice content in small, idempotent batches. Import as
   draft, attach ready media, validate answer keys and group structure, then
   conduct human editorial review before publishing.
3. Audit published counts, duplicate context/question/answer combinations,
   Listening media, explanations, option quality, and set integrity. Verify
   that no `MOCK` question or group is also in `PRACTICE`.
4. Activate pool isolation only when every Part has enough eligible practice
   content for its learner flows. Run
   `npm run audit:question-bank-pools -- --require-ready`, then set
   `PRACTICE_POOL_ISOLATED=true` in the app environment and deploy. Check
   diagnostic, recommendations, manual practice, guest sessions, ranked
   challenges, and all three mock modes before cutover.
5. Preserve all 25 existing form assignments and each learner's form sequence.
   Do not regenerate or renumber those forms when practice content is added.

## Operational notes

- The existing JSON importer caps files at 2 MiB and 500 groups. Use multiple
  versioned batches; do not raise the cap to accept one giant file.
- Keep Listening media outside PostgreSQL. Verify storage space and backups
  before generating approximately 1,500 new Listening groups.
- The migration marks all existing mapped questions as `MOCK`. New questions
  default to `PRACTICE`; the 25-form seed explicitly marks its source questions
  as `MOCK` for fresh database builds. While the isolation flag is unset,
  learners continue to use the current practice selection behavior.
- Do not count drafts, archived rows, missing media, or incomplete groups toward
  the 10,000-question published target.
- The target is a count of distinct questions. Rephrasing an old question or
  swapping answer order does not make a new practice item.
