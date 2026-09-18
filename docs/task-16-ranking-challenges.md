# Task 16 — Ranking, XP, Streaks & Ranked Challenges

Task 16 separates lifetime XP from weekly Rank Points. New valid server-side submissions award 1 XP per graded question. Rank Points use Vietnam days (`Asia/Ho_Chi_Minh`) and Monday-to-Monday weeks: 1 per unique question/day (max 30), Workout +10, Mastery +10, first study activity +5 and streak `min(days, 5)`, with one shared 60/day cap for FREE and PREMIUM. Events are append-only, source-idempotent and written under a per-user/day PostgreSQL advisory lock. No historical activity is backfilled.

Streaks count consecutive Vietnam calendar days, have no freeze or paid protection, and store current/best values. `/ranking` provides current/previous-week competition ranking, a bounded Around Me view, and points to overtake. XP is never a ranking score.

Privacy defaults to `ANONYMOUS`. `PUBLIC` exposes only display name/avatar, opaque `/learners/[publicProfileId]`, XP, streak and public competitive results. `ANONYMOUS` uses a generic identity. `HIDDEN` is excluded from public rows, counts and profiles while retaining private history.

Challenge types are Reading 100 (P5 30, P6 4 groups/16, P7 single 10/29 and multiple 5/25), Listening 100 (P1 6, P2 25, P3 13/39, P4 10/30), and Full 200. Admin generation reuses the Full Mock exact-feasibility assembler, freezes question/group order, allows published content only, audits create/generate/publish/cancel, and prevents editing after publish. Durations are 75m, 45m and 45m+75m; late starts are rejected. One database-unique run per user/challenge applies equally to FREE/PREMIUM and is outside Task 13 quotas. Scores are raw only; ties use `rank()`, no time tie-break. Percentile is `ceil(rank/visible participants*100)` and hidden below 20 participants. Live detailed review must remain locked until the derived CLOSED phase.

Deployment: back up, deploy code, then run `npm run db:migrate`. Drizzle applies missing migrations in journal order: `0010_admin_content` → `0011_practice_session_count_invariants` → `0012_ranking_challenges`. Do not run manual SQL. Existing users start at XP/streak/weekly score zero. Production smoke testing should stop at migration, readiness, Admin authorization and draft validation unless an operator intentionally publishes a real event.

Future scope explicitly excludes payments, levels, leagues, badges, social graphs and unofficial TOEIC scaled-score prediction. Task 17 is not implemented.
