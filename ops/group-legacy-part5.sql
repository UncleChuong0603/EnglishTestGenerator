-- Give the 200 published legacy Part 5 questions their own content groups.
-- Their question, option, and solution IDs stay unchanged, so existing answers remain valid.
-- Run with psql -v ON_ERROR_STOP=1. The transaction is safe to rerun.
BEGIN;

CREATE TEMP TABLE part5_candidates ON COMMIT DROP AS
SELECT id, metadata, provenance, published_at
FROM questions
WHERE toeic_part = 5
  AND status = 'published'
  AND passage_set_id IS NULL
  AND metadata ->> 'source' = 'task_5_reading_development_seed';

DO $check$
DECLARE candidate_count integer;
BEGIN
  SELECT count(*) INTO candidate_count FROM part5_candidates;
  IF candidate_count NOT IN (0, 200) THEN
    RAISE EXCEPTION 'Expected 200 ungrouped legacy Part 5 questions, found %', candidate_count;
  END IF;

  IF EXISTS (
    SELECT 1 FROM part5_candidates c
    JOIN questions q ON q.id = c.id
    WHERE nullif(trim(q.question_text), '') IS NULL
       OR q.skill_area <> 'READING'
       OR q.question_type <> 'incomplete_sentence'
       OR q.passage_id IS NOT NULL
       OR (SELECT count(*) FROM question_options o WHERE o.question_id = c.id) <> 4
       OR (SELECT count(DISTINCT o.option_key) FROM question_options o WHERE o.question_id = c.id) <> 4
       OR NOT EXISTS (
         SELECT 1 FROM question_solutions s
         JOIN question_options correct ON correct.id = s.correct_option_id AND correct.question_id = c.id
         WHERE s.question_id = c.id
           AND nullif(trim(s.explanation_en), '') IS NOT NULL
           AND nullif(trim(s.explanation_vi), '') IS NOT NULL
       )
  ) THEN
    RAISE EXCEPTION 'A legacy Part 5 question lacks a valid prompt, options, or bilingual solution';
  END IF;
END
$check$;

INSERT INTO passage_sets (
  id, toeic_part, skill_area, set_type, title, metadata, status, provenance, published_at
)
SELECT
  md5('legacy-part5-group:' || c.id::text)::uuid,
  5, 'READING', 'standalone',
  'TOEICGym Part 5 ' || coalesce(nullif(c.metadata ->> 'seed_key', ''), left(c.id::text, 8)),
  jsonb_build_object(
    'source', 'legacy_part5_grouping_2026_09_23',
    'question_id', c.id::text,
    'seed_key', c.metadata ->> 'seed_key'
  ),
  'published', c.provenance, coalesce(c.published_at, now())
FROM part5_candidates c
ON CONFLICT (id) DO NOTHING;

DO $check$
BEGIN
  IF EXISTS (
    SELECT 1 FROM part5_candidates c
    LEFT JOIN passage_sets ps ON ps.id = md5('legacy-part5-group:' || c.id::text)::uuid
    WHERE ps.id IS NULL
       OR ps.toeic_part <> 5
       OR ps.skill_area <> 'READING'
       OR ps.set_type <> 'standalone'
       OR ps.status <> 'published'
       OR ps.metadata ->> 'question_id' IS DISTINCT FROM c.id::text
  ) THEN
    RAISE EXCEPTION 'A deterministic Part 5 group is missing or conflicts with existing content';
  END IF;
END
$check$;

UPDATE questions q
SET passage_set_id = md5('legacy-part5-group:' || c.id::text)::uuid,
    question_order = 1,
    updated_at = now()
FROM part5_candidates c
WHERE q.id = c.id;

DO $check$
BEGIN
  IF (SELECT count(*) FROM passage_sets WHERE metadata ->> 'source' = 'legacy_part5_grouping_2026_09_23') <> 200
     OR (SELECT count(*) FROM questions q JOIN passage_sets ps ON ps.id = q.passage_set_id
         WHERE q.toeic_part = 5 AND q.status = 'published' AND ps.status = 'published') <> 300
     OR EXISTS (SELECT 1 FROM questions WHERE toeic_part = 5 AND status = 'published' AND passage_set_id IS NULL)
     OR EXISTS (
       SELECT 1 FROM passage_sets ps
       JOIN questions q ON q.passage_set_id = ps.id
       WHERE ps.metadata ->> 'source' = 'legacy_part5_grouping_2026_09_23'
       GROUP BY ps.id HAVING count(*) <> 1
     )
  THEN
    RAISE EXCEPTION 'Part 5 postcondition failed; rolling back';
  END IF;
END
$check$;

COMMIT;

SELECT count(*) AS published_part5_groups
FROM passage_sets ps
JOIN questions q ON q.passage_set_id = ps.id
WHERE ps.status = 'published' AND q.status = 'published' AND ps.toeic_part = 5;
