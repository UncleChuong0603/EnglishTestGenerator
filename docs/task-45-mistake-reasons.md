# Task 45 — Mistake reason engine

## Domain

The canonical reason codes are stable, bilingual, and filtered by TOEIC Part. A learner choice is stored as `USER_SELECTED`. The engine may expose conservative `SYSTEM_SUGGESTED` choices, but it does not diagnose `CARELESS`. With no defensible evidence, inference returns `UNKNOWN`.

Each classification belongs to one user, one submitted practice session, and one incorrect question attempt. The service rechecks all three ownership links and correctness on the server. Repeated submissions update the same classification for that attempt.

## Product behavior

- Web and native result screens ask the optional question “Bạn nghĩ mình sai vì đâu?”.
- The learner can skip it and can revise a saved choice.
- Mistake Bank shows the latest known reason for a question.
- Aggregate wording is limited to “Among classified mistakes…”. It needs at least five classified mistakes, a leading count of at least three, and a leading share of at least 40%.
- No score-loss estimate, predicted score, or psychological diagnosis is produced.

## API

`POST /api/v1/practice/:id/reason` accepts an owned incorrect `questionId` and an applicable canonical `reasonCode`. Practice result and Mistake Bank responses expose reason data from the same server service used by web.

## Migration

`0050_task45_mistake_reasons.sql` is additive. It creates `mistake_reason_classifications` with stable code/evidence checks, ownership foreign keys, one row per user/attempt/question, and aggregate indexes. Historical migrations are unchanged.
