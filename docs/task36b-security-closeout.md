# Task 36B security closeout

Status: **BLOCKED — external provider rotation needs owner confirmation.**

## Completed on the VPS

- Generated fresh session, app PostgreSQL password, PostgreSQL bootstrap/admin password, media signing secret and Server Actions encryption key without displaying them.
- Updated encrypted authoritative Dokploy Compose configuration and regenerated its environment file. Rotated both PostgreSQL roles without resetting data.
- Migrator connected successfully (exit 0). Recreated only the application's app, scheduler and PostgreSQL services.
- Rebuilt app without cache, then compared its embedded Server Actions key with authoritative configuration in memory: match. Normal builds can reuse a layer despite a changed BuildKit secret.
- Read-only checks: HTTPS health 200 and DB reachable, synchronized app/scheduler session secrets, signed media authorization, scheduler rejects missing authorization. SMTP connection/authentication verification succeeded without sending mail.
- Google and payOS configuration are present; provider-side rotation/validity remains pending. No real login, payment or learner operation was performed.

## Exposure scope

Potentially exposed names: `SESSION_SECRET`, `DATABASE_URL`, `APP_DATABASE_PASSWORD`, `POSTGRES_ADMIN_PASSWORD`, `SMTP_USER`, `SMTP_PASSWORD`, `MEDIA_SIGNING_SECRET`, `GOOGLE_CLIENT_SECRET`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PAYOS_CLIENT_ID`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. `CASSO_WEBHOOK_SECRET` was a placeholder. Scheduler authentication derives from the session secret. Public URLs and other nonsecret configuration were not rotated.

History scan found exact matches to local credential values in `.next-seo-audit` artifacts introduced at `917aaf9`, removed from the current tree at `957a622`. Matches included session, app DB password, Google, SMTP, media, payOS API key and Server Actions key. A scan of 5,820 historical blobs found no reconstructable base64 env payload. Removing files in a later commit does not remove old blobs.

No history rewrite or force-push was performed. Agree scope for the affected branches, tags, clones/forks and hosting caches before rewriting history. Never attach the affected blob contents to a ticket.

## Required human actions

In the provider console, revoke/replace exposed credentials, then update **Dokploy → this Compose project → Environment** directly:

| Provider | Variables |
| --- | --- |
| Resend SMTP | `SMTP_PASSWORD`; `SMTP_USER` if changed by provider |
| Google OAuth | `GOOGLE_CLIENT_SECRET` |
| payOS | `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`; `PAYOS_CLIENT_ID` if reissued |
| Cloudflare R2 legacy | Revoke the key behind `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`; remove stale variables if unused |

Do not paste secrets into chat. Report only the completed provider names. Redeploy using Dokploy and repeat safe checks. Merely replacing an environment value does not revoke a provider credential.

Dokploy itself emitted warnings that its database uses legacy default credentials and `BETTER_AUTH_SECRET` is not configured. The platform owner should schedule the official Dokploy hardening procedure separately; this task did not restart unrelated platform workloads.

## QA

- Isolated PostgreSQL migration: passed.
- Task 36 integration with mock SMTP: passed, including failure/retry and duplicate processing.
- Lifecycle policy unit tests: 5 passed.
- Playwright: 4 passed — Free/Premium preference persistence, anonymous unsubscribe and token reuse rejection, admin summary and learner access denial.
- Changed-file ESLint, TypeScript and whitespace checks: passed before the concurrent question-bank update; rerun relevant checks against the final revision.
- No production test users, test email, real payment, DB reset or learner-data writes were made by Task 36B.

Task 36 must remain incomplete until every exposed provider credential has been rotated/revoked.
