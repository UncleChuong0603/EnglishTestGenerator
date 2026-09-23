# PostgreSQL review for a 30–50k question bank

Reviewed on `english-vps`, PostgreSQL 17.11 in Docker, 2026-09-23. This document records the measured state and the changes made for the question bank.

## Production baseline

- Database size: 18 MB; 1,991 questions (1,946 published, 45 archived), about 7,704 options, 801 passage sets, 261 attempt answers.
- Host disk: 33 GB available of 48 GB. Host RAM: 3.8 GiB total, 2.2 GiB available at review time.
- PostgreSQL: `shared_buffers=128MB`, `work_mem=4MB`, `max_connections=100`. No evidence in this review that memory settings need changing for 50k questions.
- Backup before the database change: `/root/backups/toeicgym/toeicgym-2026-09-23-pre-perf.dump`. SHA-256: `4cd8f01594b4a7e31c1e46ef4461886f292261b506c7c2a656d3541af19ec8f9`. `pg_restore -l` completed successfully.

## Findings and fixes

1. Practice selection used `LIMIT 200` for Listening and `LIMIT 500` for Reading without a rotation key. Once the bank grows, new questions outside those first rows would rarely or never be selected. Selection now starts at a random UUID cursor, wraps once, and loads complete multi-question groups. The partial `(toeic_part, id)` index keeps this bounded.
2. Admin title and question-text search used `%term%` with `ILIKE`, which ordinary B-tree indexes do not accelerate. PostgreSQL now has `pg_trgm` GIN indexes on both text fields. The admin query first resolves matching question group IDs so the text index can be used.
3. Recommendation availability transferred one row per published Reading question to the application. It now groups and counts in SQL.
4. Admin content overview transferred one row per published question to calculate group sizes. It now transfers one aggregate row per group.
5. Mock assembly used recursive combination search. Its worst case grows exponentially when a valid Part 7 mix is scarce. It now uses bounded dynamic programming over group count and question count.
6. Recent and previously answered question lookup now has indexes for `(user_id, submitted_at)` on submitted sessions and `(user_id, question_id, session_id)` on answers.

The SQL indexes and extension were applied to the live database. The code and Drizzle migration are in the local workspace; the application code takes effect when that revision is deployed. The migration is idempotent because live indexes were created ahead of the code deployment.

## Measurements

Production, before/after the partial index: the same `EXPLAIN (ANALYZE, BUFFERS)` sample query changed from a sequential scan plus sort (158 ms in that run) to an index-only scan (6.9 ms in that run). These are individual runs on a shared VPS, so the query plan and buffer counts are more useful than the absolute times.

A 50,000-row temporary question table on the same PostgreSQL instance returned a 500-ID Part sample through its partial index in 1.4 ms and a selective `ILIKE` match through GIN in 7.5 ms. This probes SQL index behavior; it is not an end-to-end user concurrency test. The temporary table disappeared when the session ended.

An adversarial local mock assembly with 50,034 groups, where the required Part 7 combination does not exist, completed in 132 ms. This checks the previously unbounded combination search on a large input; it does not include database or network time.

No partitioning is needed at 50k questions. Keep media binaries in the existing media volume, rather than moving them into question rows. Recheck query plans, `pg_stat_user_tables`, and disk capacity after each large import. Run `ANALYZE questions; ANALYZE passage_sets;` after bulk imports if autovacuum has not updated statistics yet.
