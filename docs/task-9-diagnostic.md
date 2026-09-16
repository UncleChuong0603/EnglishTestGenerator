# Task 9 — TOEIC onboarding diagnostic

## Architecture and lifecycle

`diagnostic_runs` is the owner/lifecycle parent. It contains seven ordered normal
`practice_sessions`, one for each TOEIC Part. This preserves the existing
`skill_area` and `part` invariants and lets Progress, Diagnosis, and Recommendation
consume submitted attempts without a second analytics pipeline.

A run is created once, expires after seven days, and is protected by a per-owner
advisory lock plus partial unique indexes. Starting again resumes the first
incomplete child. Completed child sessions remain legitimate progress if the run
is abandoned. An expired run is marked `EXPIRED`; starting again creates a fresh
selection. Content is never adaptively changed after creation.

If not-yet-started content later becomes unavailable, the run fails closed with
the localized unavailable state; answered content is never silently replaced.
Operators can expire the affected run so the learner receives a fresh complete
selection. This favors auditability over hidden content mutation.

## Default composition

- Listening: Part 1 = 3, Part 2 = 3, Part 3 = one complete 3-question
  conversation, Part 4 = one complete 3-question talk.
- Reading: Part 5 = 6; Part 6 = the closest complete passage set to 4; Part 7 =
  complete passage sets closest to 7.
- Typical total: about 29 questions; actual total is stored and displayed.

Selection prefers unseen, then older, then recent content from the latest ten
submitted sessions. Stable IDs make ties deterministic. Standalone questions
prefer distinct skill/subskill signals. Parts 3, 4, 6, and 7 always retain whole
groups.

## Security and ownership

Guest ownership reuses the hashed `tg_guest` identity and seven-day TTL. Account
conversion transactionally claims the parent, every child, and existing answers;
repeated callbacks are idempotent. The diagnostic submission response contains
only success/completion state. Correct options, correctness, transcripts, and
explanations stay behind the normal result query, which rejects access until the
parent is `COMPLETED`. Listening URLs retain the existing short-lived signed URL
refresh path and assignment authorization.

## Dashboard eligibility

`shouldRecommendDiagnostic` returns true only when there is no completed
diagnostic, total history is below 21 attempts, fewer than four Parts have at
least three attempts, and no Part has supported evidence (eight attempts).
Experienced learners therefore keep Today's Workout.

No TOEIC scaled score or score estimate is calculated or displayed.
