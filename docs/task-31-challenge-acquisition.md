# Task 31 — Part 5 Challenge acquisition

The result page shares only a score in short copy and the public `/challenge/part-5` URL. Touch devices use Web Share when available; desktop and fallback copy the URL. No result ID, account data, referral ID, or tracking parameter is shared.

## Funnel definition

The Admin funnel uses a cohort of tracked actors who viewed `/challenge/part-5` in the selected trailing period. Guest actors are the existing server-hashed guest cookie; signed-in actors are server-resolved user IDs. It counts distinct actors at each step, following the same actor through a server-created challenge session. Signup bridges guest to a newly created account only when that guest completed the challenge in the same browser. First workout is the first submitted `recommended` practice session after that signup. The cohort can mature after the selected view period; counts are not independent event totals. A conversion rate is shown only when the previous step has at least 20 actors. Small samples always show counts.

When one guest completes multiple Challenges before signup, the signup event currently attaches to the guest's earliest completed session. This may misattribute which completion prompted signup. Document and monitor this limitation; do not change the join before data show that it matters. The Task 33B experiment runbook is in `docs/task-33b-acquisition-experiment.md`.

`challenge_viewed` is a browser event and can be missed when JavaScript or network requests are blocked. Start and completion are server events tied to practice sessions. Signup and workout are server events tied to new account and submitted practice data. Bot and automation traffic may affect views. The funnel is limited to one browser; it has no fingerprint or cross-device join. Task 28's self-reported acquisition source remains the only user-reported source. This funnel does not infer social or search origin from Direct traffic.

## Operations

Migration `0034_square_tinkerer.sql` only extends the existing `product_events_name_check`; all old event names remain valid. No environment variable, service, campaign dashboard, referral system, or production seed is needed. The QA fixture and Playwright spec require the explicitly guarded `127.0.0.1:15435/task31` database. `scripts/task31-production-funnel.sql` is read-only and can be piped into production `psql` after deployment to verify counts and the constraint. Deploy the migration before the app code. Confirm app revision, migrate success, `/api/health`, result share control, Admin protection, and that read-only query after automatic deployment.
