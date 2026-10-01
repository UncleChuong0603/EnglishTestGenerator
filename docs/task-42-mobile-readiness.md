# Task 42 — Mobile readiness foundation

## Decision

The future native client is another presentation layer over the existing PostgreSQL-backed server. Web Server Actions and `/api/v1` must call the same server/domain services. The client never selects question IDs, calculates recommendations, decides entitlement access, scores answers, or writes PostgreSQL directly.

Recommended future location: `/mobile` in this repository. Do not convert the repository into a monorepo before the first client proves a concrete packaging need. The API schemas currently live in `src/lib/api-v1`; when `/mobile` exists, move only transport-safe contracts and validation into a small shared package if direct type generation/import is still useful.

## Current coupling audit

| Flow | Reusable server/domain layer | Current web coupling | Mobile contract/boundary needed |
| --- | --- | --- | --- |
| Auth/session | `lib/auth/service`, transport-neutral `issueSessionToken` and `getSessionByToken` | Cookie read/write, redirects and OAuth callback remain Next.js adapters | Login, Google code exchange, refresh/renewal policy, logout/revoke in Task 43 |
| Learner profile/goal/context | `lib/profiles`, `lib/goals/service`, `lib/learner-context/service`, i18n preferences | Settings actions parse `FormData` and revalidate routes | `/me` plus later profile/goal mutations |
| Today's Workout | diagnosis, progress, workload and selectors now composed by `lib/practice/service.startPractice` | Redirect/error mapping stays in `app/practice/actions` | `POST /practice` with `TODAYS_WORKOUT` |
| Weekly Plan/Review | `lib/weekly-plan/service`, `lib/weekly-review/service` | Dashboard page composes reads | `GET /plan`; weekly review can be added after v1 baseline |
| Practice P1–P7 | selectors, safe learner DTO, owned queries; start boundary is reusable | Reading submission and Listening group submission transactions still live in a Server Action | Task 43 extracts answer/submit adapters into the practice service before endpoints call them |
| Mistakes/remediation | `lib/mastery/queries`, `lib/mastery/persistence`; review start uses `practiceService` | Filters and redirects are web adapters | `GET /mistakes`; review starts through `POST /practice` |
| Vocabulary SRS | `lib/vocabulary/service` and schedule policy | Server Actions only parse forms/revalidate | `GET /vocabulary`; later save/review mutations |
| Progress | `lib/progress/queries`, presentation helpers | Page composes premium preview and charts | `GET /progress` |
| Premium/trial | `lib/entitlements/service`, premium lifecycle/trial policy | Pages/actions map limits to UI | `GET /entitlements`; server remains authoritative |
| Mock | `lib/full-mock/service` | Thin actions already call service | Deferred from the minimum Task 43 API list |
| Account data | `lib/account-data/service` | Protected export Route Handler and delete Server Action are adapters | Can be exposed to mobile after re-auth policy is finalized |

Known coupling intentionally left for Task 43: practice answer/submit logic in `app/practice/actions.ts`, page-level dashboard orchestration, and request transport authentication. No second recommendation, entitlement, scoring, or selection implementation should be created.

## Mobile authentication contract

### Email/password

The future API authenticates credentials through `authenticatePassword`, then calls `issueSessionToken`. The API returns the opaque token once over TLS; only its HMAC hash is stored by the server. Password hashes and `SESSION_SECRET` never leave the server.

### Google

Use Authorization Code with PKCE in the system browser. The redirect uses an allowlisted HTTPS universal/app link. The app sends the one-time code and verifier to the server; the server validates state, nonce/audience, verified email and linking rules before issuing its own opaque TOEICGym session. Do not ship a Google client secret or TOEICGym session secret in the app.

### Lifecycle and storage

- Initial v1 model: one opaque, revocable session token with the existing 30-day absolute expiry. Rotation/refresh can be added before release without changing domain services.
- Store the token only in iOS Keychain or Android Keystore-backed secure storage. Never use AsyncStorage, logs, analytics properties or crash breadcrumbs.
- `Authorization: Bearer <token>` is the mobile transport. Web continues using the `HttpOnly`, `Secure` (production), `SameSite=Lax` cookie.
- Mobile bearer requests do not rely on cookies and therefore do not use browser CSRF defenses. Web cookie mutations retain Origin/Host and SameSite protections. CORS is not an authentication control.
- Logout revokes the presented session. “Log out all devices,” password reset and account deletion revoke all sessions. Server revocation/expiry is authoritative even if a device retains stale local state.

## API v1 foundation

Typed Zod schemas and the endpoint registry are in `src/lib/api-v1/contracts.ts`. Standard errors are in `src/lib/api-v1/errors.ts`.

Planned endpoints:

- `GET /api/v1/me`
- `GET /api/v1/dashboard`
- `GET /api/v1/plan`
- `POST /api/v1/practice`
- `GET /api/v1/practice/:id`
- `POST /api/v1/practice/:id/answer`
- `POST /api/v1/practice/:id/submit`
- `GET /api/v1/mistakes`
- `GET /api/v1/vocabulary`
- `GET /api/v1/progress`
- `GET /api/v1/entitlements`

Task 42 does not register these routes. Task 43 implements handlers as adapters over existing services.

### Safety rules

- Major version is in the URL. Additive fields are allowed within v1; removing/changing semantics requires v2.
- Parse path, query and JSON body with strict schemas. Reject unknown mutation fields.
- Every error uses `{ error: { code, message, requestId, details?, retryAfterSeconds? } }` with appropriate HTTP status.
- `401` means no/expired/revoked authentication; `403` means authenticated but disallowed; ownership misses normally return `404` to avoid enumeration.
- Cursor pagination is opaque, stable and ownership-scoped; default 20, maximum 100.
- Rate-limit login, session issuance, practice creation/answer/submit and export/delete by a server-derived account/IP key. Return `429` and `Retry-After`.
- Require an `Idempotency-Key` for practice creation, answer writes and submit. Persist key + actor + operation + request digest + response; identical retries replay and different payloads return `IDEMPOTENCY_CONFLICT`.
- Re-read ownership and assigned question/option relationships on every practice operation. The server selects questions and calculates results.
- In-progress practice payloads exclude solution rows, correct option IDs, explanations, answer keys, password/session/token hashes, guest hashes and storage keys. Correctness appears only after authoritative submit (or after an atomic Listening group is intentionally finalized by the existing product rule).

## Account and data

`Settings → Account & data` is protected by the settings page auth guard.

- Export is an authenticated, `no-store` JSON download built from an explicit allowlist. It contains only the current user's data and excludes secrets, provider account IDs and internal storage keys.
- Delete requires the signed-in email plus a separate acknowledgement. The user ID always comes from the server session.
- Deletion locks the user row and executes in one transaction. A retry sees the deletion tombstone and succeeds idempotently.
- Learning/profile/preferences/OAuth/token/session/lifecycle-email data is removed. Product/security analytics are anonymized. Support records are removed.
- Payment-backed membership and order facts are retained for accounting/legal needs under a disabled anonymized user tombstone; checkout URLs and direct identifiers are cleared. Non-payment membership and usage records are deleted.
- Active administrators are refused with `ADMIN_HANDOFF_REQUIRED` so ownership/audit obligations are not silently broken.

## Sync semantics

PostgreSQL is the source of truth for profile, goals, learning history, mastery, Weekly Plan, Mistake Bank, Vocabulary SRS, entitlements/trial, streak and progress. One account therefore observes the same state on web and mobile.

The first mobile release is online-first. It may cache server responses for display, but cannot start a new server-authoritative session, spend an entitlement, reveal an answer or finalize progress offline. Queue only explicitly idempotent mutations. On reconnect, server version/time wins; immutable learning events are append-only, while preferences/goals use last accepted server write. A stale entitlement or plan cache can never authorize an action.

## Store readiness

- Account deletion and export exist on web; Task 43 should expose equivalent authenticated mobile entry points or a clearly reachable web flow before store submission.
- Update privacy disclosures/data maps for credentials, learning responses, diagnostics, vocabulary, analytics, support, lifecycle email and payment retention. Document subprocessors and retention windows before release.
- Apple/Google billing is deferred. Before selling digital Premium in native apps, decide store billing and entitlement reconciliation; do not direct native users to an impermissible external purchase flow.
- Reserve and verify universal/app-link domains for Google callback, password verification/reset and learner destinations. Push requires APNs/FCM credentials, consent UX, device-token registration/revocation and privacy documentation; all deferred.

## Production policy

This task adds an additive nullable column and backward-compatible code. Never test account deletion against production or create/mutate a production learner. Production verification is read-only: deployed revision, successful migration, `/api/health`, protected Account & Data route, and existing learner smoke paths.
