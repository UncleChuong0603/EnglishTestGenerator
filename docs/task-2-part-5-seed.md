# Task 2: initial TOEIC Part 5 question bank

## Compatibility audit

The Task 1 schema supports this seed without a migration change. Part 5 items
are standalone `questions` with no passage or media, four relational
`question_options`, and one protected `question_solutions` row. Difficulty is
`easy`, `medium`, or `hard`; lifecycle status is `draft`, `published`, or
`archived`. Authenticated learners can read only published question prompts and
options. They have no content write access and cannot read solutions. The
service role remains the only seed/admin path.

The records are published because Task 3's existing
`getPublishedQuestionsByPart(5, limit)` query must be able to retrieve them.
They are clearly marked as original development content in `metadata` and are
not presented as official TOEIC questions.

## Distribution

| Group | Label | Count |
| --- | --- | ---: |
| Skill | grammar | 60 |
| Skill | vocabulary | 20 |
| Subskill | verb_tense | 16 |
| Subskill | word_form | 12 |
| Subskill | prepositions | 8 |
| Subskill | conjunctions_connectors | 6 |
| Subskill | relative_clauses | 6 |
| Subskill | pronouns_determiners | 6 |
| Subskill | gerunds_infinitives | 6 |
| Subskill | contextual_vocabulary | 10 |
| Subskill | business_vocabulary | 10 |
| Difficulty | easy | 20 |
| Difficulty | medium | 40 |
| Difficulty | hard | 20 |

## Validation and seeding

`npm run validate:part5` detects malformed records, blank prompts or options,
wrong option counts, duplicate labels or option text, missing/invalid answers,
missing bilingual explanations, invalid Part 5 type/part/status/taxonomy/
difficulty, duplicate deterministic keys, and normalized duplicate prompts.

`npm run seed:part5` validates first, derives stable UUIDs from each seed key,
and upserts questions, options, then protected solutions. It then verifies all
80 questions, 320 options, 80 bilingual solutions, and a ten-question
learner-safe query shape. `npm run verify:part5` performs the database checks
without writing.

The configured database must already contain the latest Task 1 migration. This
repository is intentionally not linked to a Supabase project by default; link
and push only to the intended development project before seeding.

## Manual database checks

In Supabase Table Editor, filter `questions` by `toeic_part = 5` and metadata
source `task_2_development_seed`. Confirm 80 published rows, no passage/media,
and the expected taxonomy. Confirm 320 related option rows and 80 solution
rows. In the SQL editor, use a trusted dashboard session to inspect counts:

```sql
select skill, sub_skill, difficulty, count(*)
from public.questions
where toeic_part = 5
  and metadata ->> 'source' = 'task_2_development_seed'
group by skill, sub_skill, difficulty
order by skill, sub_skill, difficulty;

select count(*) as options
from public.question_options qo
join public.questions q on q.id = qo.question_id
where q.metadata ->> 'source' = 'task_2_development_seed';

select count(*) as bilingual_solutions
from public.question_solutions qs
join public.questions q on q.id = qs.question_id
where q.metadata ->> 'source' = 'task_2_development_seed'
  and nullif(trim(qs.explanation_en), '') is not null
  and nullif(trim(qs.explanation_vi), '') is not null;
```

Also test as an authenticated learner: published questions and options should
be readable, while selecting `question_solutions` should be denied. No browser
page is added by this task.
