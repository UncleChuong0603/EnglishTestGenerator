# Task 5: TOEIC Reading question bank

## Architecture

The original TOEIC schema already separated learner-readable questions/options from server-only solutions. It also had a `passages` table, but a passage row represented both a document and a single/double/triple grouping. Task 5 keeps the solution boundary and Part 5 practice relationships intact, then adds `passage_sets` as the group and makes `passages` the ordered documents inside that group.

- Part 5: standalone question; `passage_set_id` and `passage_id` are null.
- Part 6: one `part6` set, one ordered document, normally four ordered questions.
- Part 7 single: one set and one document.
- Part 7 double: one set and two documents at positions 1 and 2.
- Part 7 triple: one set and three documents at positions 1, 2, and 3.
- A Part 7 cross-text question belongs to its set and may have no single `passage_id`.

`src/lib/questions/queries.ts` returns complete learner-safe groups. A taxonomy filter identifies matching sets, then the helper returns every passage and every question in each selected set. It never selects `question_solutions`.

## Final development-bank distribution

- Part 5: 200 questions
- Part 6: 80 questions in 20 sets
- Part 7: 150 questions in 20 single, 10 double, and 5 triple sets
- Total: 430 questions, 55 sets, 75 passages, and 1,720 options
- Difficulty: 140 easy, 195 medium, 95 hard

Skills:

- Part 5: grammar 148; vocabulary 52
- Part 6: grammar 20; vocabulary 15; cohesion 20; context 5; sentence insertion 20
- Part 7: detail 50; inference 30; purpose 30; vocabulary in context 10; reference 5; sentence placement 5; cross-text 20

## Commands

This repository is currently connected by API keys but does not contain a Supabase CLI project configuration or a database URL. Apply the migration through the Supabase SQL Editor, or link the CLI first:

```powershell
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

For a disposable, already-initialized local Supabase project, reset and apply every migration with:

```powershell
npx supabase db reset
```

Then validate, seed idempotently, and verify:

```powershell
npm run validate:reading
npm run seed:reading
npm run verify:reading
```

The seed uses stable UUIDs and upserts in dependency order. Re-running it updates the same records rather than duplicating the bank.

## Supabase inspection queries

Counts by part:

```sql
select toeic_part, count(*) as questions
from public.questions
where status = 'published' and toeic_part between 5 and 7
group by toeic_part order by toeic_part;
```

Part 5 standalone integrity:

```sql
select id, question_text, skill, sub_skill, difficulty
from public.questions
where toeic_part = 5 and status = 'published'
  and passage_id is null and passage_set_id is null
order by created_at, id limit 10;
```

Part 6 complete sets:

```sql
select ps.id, ps.title, count(distinct p.id) as passages, count(distinct q.id) as questions
from public.passage_sets ps
join public.passages p on p.passage_set_id = ps.id
join public.questions q on q.passage_set_id = ps.id
where ps.toeic_part = 6 and ps.set_type = 'part6' and ps.status = 'published'
group by ps.id, ps.title order by ps.title;
```

Part 7 shape counts:

```sql
select ps.set_type, count(*) as sets, min(x.passage_count) as min_passages,
  max(x.passage_count) as max_passages
from public.passage_sets ps
join lateral (
  select count(*) as passage_count from public.passages p where p.passage_set_id = ps.id
) x on true
where ps.toeic_part = 7 and ps.status = 'published'
group by ps.set_type order by ps.set_type;
```

Inspect one ordered single, double, or triple set by changing `set_type`:

```sql
with chosen as (
  select id, title, set_type from public.passage_sets
  where toeic_part = 7 and set_type = 'triple' and status = 'published'
  order by created_at, id limit 1
)
select c.title, c.set_type, p.position, p.document_type, p.title, p.content
from chosen c join public.passages p on p.passage_set_id = c.id
order by p.position;
```

Inspect its stable questions and options without exposing solutions:

```sql
with chosen as (
  select id from public.passage_sets
  where toeic_part = 7 and set_type = 'triple' and status = 'published'
  order by created_at, id limit 1
)
select q.question_order, q.question_text, q.skill, q.sub_skill,
  o.display_order, o.option_key, o.option_text
from chosen c
join public.questions q on q.passage_set_id = c.id
join public.question_options o on o.question_id = q.id
order by q.question_order, o.display_order;
```

Server-only completeness check (run only in the SQL Editor, never from a learner client):

```sql
select count(*) filter (where s.question_id is null) as missing_solutions,
  count(*) filter (where nullif(trim(s.explanation_en), '') is null) as missing_en,
  count(*) filter (where nullif(trim(s.explanation_vi), '') is null) as missing_vi
from public.questions q
left join public.question_solutions s on s.question_id = q.id
where q.toeic_part between 5 and 7 and q.status = 'published';
```

## Manual editorial spot check

The implemented spot check covered 10 Part 5 questions; Part 6 sets `p6-01`, `p6-06`, `p6-11`, `p6-16`, and `p6-20`; Part 7 single sets `p7-single-01`, `05`, `10`, `15`, and `20`; double sets `p7-double-01`, `06`, and `10`; and triple sets `p7-triple-01` and `05`. It checked the passage/question relationship, answer defensibility, option uniqueness, taxonomy, and bilingual explanation presence.

The bank is original development/beta content. Its deterministic checks are comprehensive for structure, but a larger human editorial review is still recommended before treating all 430 items as production-calibrated exam content.
