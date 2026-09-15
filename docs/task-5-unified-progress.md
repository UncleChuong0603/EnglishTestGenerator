# Task 5 — Unified Listening + Reading Progress

## Architecture

`attempt_answers` and question taxonomy remain the source of truth. The server-only
`getToeicProgress(userId)` query produces grouped rows, and the pure progress domain
turns them into the strongly typed `ToeicProgress` DTO. UI code only renders that DTO.
The existing Reading analytics and recommendation engine remains Reading-only.

Accuracy is rounded to the nearest integer. It is `null` when `attemptedCount` is zero,
so a genuine 0/1 result is distinguishable from no history.

## Query strategy

One SQL query joins submitted sessions, attempt answers, and questions, scoped to the
server-authenticated user's id. It groups by `skill_area`, `toeic_part`, `skill`, and
`sub_skill`, and calculates count, correct count, and latest answer time in PostgreSQL.
No full answer history is loaded and there is no N+1 query per part or taxonomy node.

The query requires the session and question `skill_area` values to match and validates
the part against the section before creating the DTO. This keeps Listening Parts 1–4
and Reading Parts 5–7 isolated. Part 3/4 groups are naturally counted by child answer
because each child question has its own `attempt_answers` row.

## Data and cache

No migration or backfill is required. Existing Reading sessions use the existing
`READING` default/classification and remain valid. Practice submission revalidates
`/progress` and `/dashboard` after the transaction commits (and, for grouped Listening,
only after the final group completes the session).

## Manual smoke checklist

- New user: both sections say “No data yet”; no section displays `0%`.
- Complete Listening Part 1: Part 1 and Listening totals update; Reading is unchanged.
- Complete one Part 3 group: attempted count increases by three and 2/3 displays 67%.
- Complete Reading Part 5: Part 5 and Reading update; Listening is unchanged.
- Complete Listening then Reading: both sections retain independent counts.
- Switch English/Vietnamese: progress headings and empty states are localized.
- Mobile viewport: Part cards wrap without horizontal scrolling.

Production verification must be performed after deployment with a real learner account;
the automated suite does not mutate or inspect production data.
