# Task 42 QA and release handoff

Run date: 2026-10-01 (Asia/Bangkok). The foundation was first QA'd in `codex/task42-mobile-foundation`, then merged into `main` as `079f08f` with the daytime product commit `08d198c` as the other parent. It has not been deployed.

## Isolated PostgreSQL and application QA

- Host: `ssh english-vps`; Docker network/database/container were created with the `task42-isolated` guard and an ephemeral `toeicgym_task42` database. No production database, user, cookie, or payment secret was used.
- Migration 0047 applied twice; the second run was a no-op at the expected journal revision. PostgreSQL integration exercised export allowlists, foreign-account rejection, rollback after injected failure, private-media fail-closed behavior, row-lock deletion/write races, concurrent deletion idempotency, session invalidation, late payment settlement without access grants, and checkout deletion race. All assertions passed.
- Full Vitest: **165 files passed, 799 tests passed, 2 skipped** (801 total).
- Post-merge root verification: **170 files passed, 829 tests passed, 2 skipped** (831 total), excluding nested `.tmp` worktrees from test discovery.
- `npm run lint`: **0 errors, 2 pre-existing warnings** (unused similarity filter/blog image values).
- Post-merge lint: **0 errors, 1 pre-existing warning** (`@next/next/no-img-element` in the existing blog markdown renderer).
- `npx next typegen`, `npm run typecheck`, and `npm run build`: passed. Post-merge Next build generated 86 static/dynamic pages, including the Account, learner-report, remediation and daytime SEO routes.
- Playwright (`playwright.task42.config.ts`): **11 passed**. It covered anonymous auth guards, export/download ownership and secret exclusion, wrong-email confirmation, successful deletion/session invalidation, settings/dashboard/practice/mistakes/vocabulary/progress/full-mock reachability, English/Vietnamese layouts, 375/768/1024/1440 widths, keyboard focus, and screenshots. Account & Data now hides the floating feedback widget and exposes an inline support link so the destructive control remains reachable on narrow screens.

Artifacts are retained locally under `.tmp/task42-qa-artifacts/test-results/`; screenshots contain only generated QA identities.

## Production read-only check

- `english-vps` deployment checkout: `8423a1e68155e2c019f6cf766904233fd2baf3b9` (the pre-Task-42 production revision).
- Existing migration container exited `0` at `2026-10-01T08:53:21Z`; `/api/health` returned `200`.
- Anonymous `/settings?section=data` returned the sign-in redirect marker. No authenticated production request or write was made.

This verifies the current production baseline only; merge commit `079f08f` is not yet deployed.

## Open release gates

1. Review and merge this worktree/branch after migration and account-erasure review.
2. Deploy through the normal pipeline, then run the production smoke/health/protected-route checks against the exact deployed revision.
3. Before mobile client work, document native auth, sync conflict/idempotency, secure token storage, push/deep-link handling, and store/legal prerequisites as described in `mobile-readiness.md`.

Do not mark Task 43 mobile implementation ready until those deployment checks pass.
