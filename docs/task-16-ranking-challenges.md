# Task 16 — Ranking, XP, Streaks & Ranked Challenges

Task 16 separates lifetime XP from weekly Rank Points. New valid server-side submissions award 1 XP per graded question. Rank Points use Vietnam days (`Asia/Ho_Chi_Minh`) and Monday-to-Monday weeks: 1 per unique question/day (max 30), Workout +10, Mastery +10, first study activity +5 and streak `min(days, 5)`, with one shared 60/day cap for FREE and PREMIUM. Events are append-only, source-idempotent and written under a per-user/day PostgreSQL advisory lock. No historical activity is backfilled.

Streaks count consecutive Vietnam calendar days, have no freeze or paid protection, and store current/best values. `/ranking` provides current/previous-week competition ranking, a bounded Around Me view, and points to overtake. XP is never a ranking score.

Privacy defaults to `ANONYMOUS`. `PUBLIC` exposes only display name/avatar, opaque `/learners/[publicProfileId]`, XP, streak and public competitive results. `ANONYMOUS` uses a generic identity. `HIDDEN` is excluded from public rows, counts and profiles while retaining private history.

Challenge types are Reading 100 (P5 30, P6 4 groups/16, P7 single 10/29 and multiple 5/25), Listening 100 (P1 6, P2 25, P3 13/39, P4 10/30), and Full 200. Admin generation reuses the Full Mock exact-feasibility assembler, freezes question/group order, allows published content only, audits create/generate/publish/cancel, and prevents editing after publish. Durations are 75m, 45m and 45m+75m; late starts are rejected. One database-unique run per user/challenge applies equally to FREE/PREMIUM and is outside Task 13 quotas. Scores are raw only; ties use `rank()`, no time tie-break. Percentile is `ceil(rank/visible participants*100)` and hidden below 20 participants. Live detailed review must remain locked until the derived CLOSED phase.

Deployment: back up, deploy code, then run `npm run db:migrate`. Drizzle applies missing migrations in journal order: `0010_admin_content` → `0011_practice_session_count_invariants` → `0012_ranking_challenges`. Do not run manual SQL. Existing users start at XP/streak/weekly score zero. Production smoke testing should stop at migration, readiness, Admin authorization and draft validation unless an operator intentionally publishes a real event.

Future scope explicitly excludes payments, levels, leagues, badges, social graphs and unofficial TOEIC scaled-score prediction. Task 17 is not implemented.

## Ranked attempt runtime

Migration `0013_ranked_challenge_runtime` adds the ranked parent-to-session relationship and authoritative section deadlines without rewriting the existing `0012` foundation. Starting acquires a transaction advisory lock keyed by challenge/user, returns an existing run on retry, checks LIVE state and remaining duration, then instantiates practice-session children from the frozen item order. No Task 13 usage row is created. FREE and PREMIUM therefore both receive exactly one database-unique attempt.

Reading runs use a 75-minute Reading deadline; Listening uses 45 minutes; Full begins with a 45-minute Listening deadline and transitions to a fixed 75-minute Reading deadline. Answer writes re-read ownership, active section, assignment, option ownership and deadline on the server. Browser countdowns are display-only. Expired runs retain their identity and finalize saved answers plus unanswered items as incorrect. Finalization is locked and idempotent, persists immutable raw section/total scores, removes staging rows and emits the source-idempotent Challenge gamification event.

The learner routes are `/ranking/challenges/[challengeId]`, `/ranking/challenges/run/[runId]`, and the nested result route. LIVE results expose only raw score/rank/visible participant population; practice result DTOs reject ranked child review until the parent challenge derives CLOSED. Thus solutions, explanations and transcripts stay unavailable while LIVE. After CLOSED, existing review pages become available. CANCELLED challenges retain private history but are not treated as normal published standings.

Admin routes are `/admin/challenges`, `/admin/challenges/new`, and `/admin/challenges/[id]`. Admin can create a draft, generate/regenerate its exact frozen form, inspect part/group/question composition, publish idempotently and cancel without deletion. All mutations require `CHALLENGE_MANAGE` and use the existing audit actions. There is deliberately no score editing, rank editing or attempt reset operation.

Task 15 integration is enforced by an `0013` database archive guard: content referenced by a PUBLISHED challenge whose `ends_at` is still in the future (UPCOMING or LIVE) cannot transition from published to archived. Draft references do not block archive and must be regenerated if content eligibility changes. CLOSED references remain stored and reviewable, while the pre-existing Full Mock feasibility guard still determines whether ordinary archive is safe.

## Browser verification

Use a migrated local/test database, never production scoring data: create a draft under Admin Challenges, generate and verify its exact composition, publish in a controlled LIVE window, start as a learner, refresh to verify Resume, complete with fixture/test helpers, confirm raw score and LIVE review lock, then advance only the test clock/window to CLOSED and confirm review unlock. Production smoke verification stops at migration readiness, authorization, draft generation and validation unless an operator intentionally schedules a real challenge.

## Task 16C/16D verification harness

All write-based verification refuses any database other than `127.0.0.1:15433`. Test credentials live only in the gitignored `.env.task16.local`; fixtures use generated questions and fake R2 configuration. `0014_ranked_practice_session_constraints` is append-only and removes obsolete session-type constraints exposed by real ranked runs while preserving the source and lifecycle invariants required by normal Full Mock and Ranked Challenge sessions. Migrations `0011` through `0013` were not rewritten.

Operator sequence on an empty disposable PostgreSQL 17 database:

1. `npm run test:integration:ranked-challenges:migrate`
2. `npm run test:integration:ranked-challenges`
3. Set `TASK16_TEST_MODE=true`, then run `npm run test:integration:ranked-challenges:matrix`
4. `npm run test:e2e:ranked-challenges:seed`
5. `npm run test:e2e:ranked-challenges`

The executed matrix covers fresh migrations through `0014`, Full 200, independent Reading 100 and Listening 100 frozen forms for two learners, autosave/resume/finalize, real concurrent start/finalize, transactional creation/finalize rollback, all three late-start boundaries, quota isolation, FREE/PREMIUM one-attempt equality, completion-bonus idempotency, LIVE/CLOSED owner review checks, competition ties, and PUBLIC/ANONYMOUS/HIDDEN filtering. Playwright uses password-authenticated fixture users only; it does not invoke Google OAuth, SMTP, production R2, or a production-accessible helper route. The failure hooks are service-process only and throw unless `TASK16_TEST_MODE=true` and `NODE_ENV` is not `production`.
