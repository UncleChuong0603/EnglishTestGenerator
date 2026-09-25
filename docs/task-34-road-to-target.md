# Task 34: Road to Target and Weekly Study Plan V1

## Existing system used

- `learner_goals` stores optional target score, exam date, daily minutes, and 3/5/7 study days. All four fields can be absent.
- The dashboard already owns Today's Workout, Daily Goal, diagnosis, progress, mastery summary, usage status, and Premium preview. The Task 28 survey remains an optional section below the primary learning flow.
- `Asia/Ho_Chi_Minh` is the product timezone. The weekly plan uses Monday 00:00 through the next Monday 00:00 in that timezone; slots are called Buổi 1, Buổi 2, etc. No weekdays are assigned.
- Existing practice selectors prioritize unseen and less recent Reading content, validate Listening groups and media, and create server-owned question assignments. Existing mock readiness checks validate eligible forms. Session creation consumes quota inside transactions.

## Plan policy

The plan is derived on each dashboard request. It uses the optional goal, current recommendation, reviewable mistakes, published/eligible content, effective plan, current quota, and actual completed learning. It has no runtime AI, predicted score, readiness percentage, or new schema.

Free sees the first three suggestions. Premium sees all selected study slots, Smart Review when reviewable mistakes exist, a supported Reading weakness when eligible content exists, a Listening mock when capacity is at least 45 minutes and mock readiness and entitlement permit, and up to four recent weeks of actual completed sessions within the existing Premium history window. A lack of content leaves the plan empty or omits that action. Exhausted quota disables the corresponding CTA without replacing the entire plan.

Completing a session marks only a matching activity as studied. Completed sessions, supported weakness changes, reviewable repeated mistakes, content readiness, and quota can adjust subsequent slots. This derived model does not preserve a snapshot of a past recommendation; exact historical plan reconstruction would require persistence and is outside V1.

Every CTA calls an existing server action or the new server-recomputed focused Reading action. The browser supplies no question IDs or weakness taxonomy for a planned activity. Practice, review, and mock creation re-check entitlement and eligibility on the server.

## Deployment and verification

No migration, backfill, environment variable, or entitlement catalog change is required. Do not seed production. Verify the final revision, migrator exit status, `/api/health`, authenticated browser flow against an isolated PostgreSQL database, and read-only production pages after automatic deployment. The QA fixture in `scripts/task26b-qa-seed.mjs` and the Task 34 Playwright spec are guarded to the isolated `toeicgym_task17` database on `127.0.0.1:15433`.
