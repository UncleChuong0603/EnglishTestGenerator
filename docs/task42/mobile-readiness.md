# Task 42 — Mobile readiness foundation

Scope: architecture, contracts and shared boundaries; no Expo UI, mobile database,
new backend service, billing integration or implementation of the eleven v1 handlers.
Base: Task 41 (`8423a1e`). Task 43 implements adapters against these boundaries.

## Architecture and repo proposal

`Web actions/pages + future mobile /api/v1 → shared server services → PostgreSQL`.
The authenticated actor is obtained by the transport adapter, never from a body
userId. Clients request an activity, not a list of selected question IDs. No Firebase,
Supabase, second database, duplicate recommendation or entitlement implementation.
Future mobile lives in `/mobile`; keep this Next application in place. Import/copy
only the pure contract module through a small shared package when Task 43 actually
needs it. Never import server services, DB models, Next cookies or env into the app.

## Audit: A reusable / B transport-coupled / C mobile contract

| Flow | A: existing reusable boundary | B: remaining coupling | C: v1 adapter |
| --- | --- | --- | --- |
| Auth/session | auth/service, crypto, issueSessionToken/getSessionByToken | cookie/redirect login actions; Google browser callback | dedicated mobile credential/OAuth exchange, actor resolver |
| Profile/preferences/goal/context | goals/service, learner-context/service; profile DB | settings/actions and i18n preference cookies | me read; future validated settings mutation |
| Today's Workout | diagnosis/service, workout/policy; practice/service.startPractice | action redirect/error rendering | createPractice TODAYS_WORKOUT; server recomputation |
| Weekly Plan | weekly-plan/service and immutable snapshots | dashboard assembles inputs | plan projection using same input services |
| Weekly Review | weekly-review/service | dashboard cards | shared dashboard/plan projection; not a second algorithm |
| Practice P1–P7 | selector, queries, learner-dto, usage and evaluation | ordinary Reading/Listening submission still in practice/actions | create/read contracts; extract submission into shared service before implementing v1 |
| Mistakes/remediation | mastery queries/persistence; selector.createFocusedRemediationSession; remediation/policy | focused start action; result page labels | mistakes read; future focused start delegates to Task 41 selector |
| Vocabulary SRS | vocabulary/service and srs | review action redirect; lookup/save routes | paginated vocabulary read; future review service adapter |
| Progress | progress queries and learning-evidence | progress page presentation | server aggregates → progress projection |
| Premium/trial | entitlements/service, trial/service, premium lifecycle | trial/billing actions | entitlements projection; never trust client plan |
| Mock/diagnostic | full-mock/service, diagnostic/service | actions/pages and result release gates | defer mock handlers; retain parent release gates |
| Reports | question-reports/service | web report action/admin UI | future adapter; deletion/export include learner report text |

Practice starts for ordinary Reading, Listening, Today's Workout, weekly focus and
mastery now call the shared start boundary. Advanced targeting, focused remediation
and mock already call reusable selectors/services; do not duplicate them. Submission
extraction is a Task 43 prerequisite, not permission to copy web action code into an
API. Existing P3/P4 group review behavior must be preserved separately from the
future answer endpoint's persistence-only acknowledgement.

## Account & Data

Authenticated `/settings?section=data` provides JSON export and irreversible
deletion, localized en/vi. GET `/api/account/data-export` derives userId from the
web session, rate-limits (5/hour), has private no-store headers and an attachment.
Export runs a repeatable-read/read-only transaction; it excludes password hashes,
session/guest hashes, provider account IDs, OAuth verifiers, checkout URLs,
unsubscribe tokens, internal keys and unreleased exam correctness/scores.
The export is versioned independently (`2026-10-01`). It is not an import/restore
format and deliberately omits internal admin notes and pre-release ranked scores.

Deletion needs exact normalized email plus explicit acknowledgement. A transaction
locks the user row, removes profile/preferences, goals/context, practice and
assignments (including Task 41 mastery targets), answers/drafts, mastery, vocabulary,
plans, progress/streak/gamification, trial/free usage, OAuth bindings/state,
verification/reset/activation tokens, sessions, reports, support and lifecycle email.
Both current and other-device sessions stop validating. Already-deleted service
retries return success; an unauthenticated HTTP retry still receives an auth failure.
Failure rolls back the complete transaction. Active administrators must hand off
their role. Private media fails closed until durable blob erasure is implemented;
there is no learner private-upload flow currently. No filesystem deletion is guessed.

The user UUID remains a **pseudonymous**, disabled tombstone, not proof of legal
anonymity. Original email, password and verification are removed. Paid membership
is revoked; order/event accounting facts remain, checkout links are erased. Analytics
and security/audit records have actor/route/identifiers/properties scrubbed; learner
report free text is removed. Administrative published content/import provenance
retains a pseudonymous creator FK rather than destroying shared content.
Auth rate-limit buckets are HMAC identifiers with existing short expiration windows.
Third-party payment/email delivery records, external logs and backups are outside
this DB transaction. Before a store release, the owner must approve a documented
retention/purge schedule, backup expiry, third-party deletion procedures and privacy
notice. No statutory retention duration is asserted by this implementation.

Migration 0047 adds nullable deleted_at and guards: tombstones cannot be reactivated;
owned writes serialize against deletion and reject stale authenticated requests.
Late verified payments can settle accounting without granting access or recreating
analytics. Checkout creation rechecks the owner after the provider response.
No backfill, new secrets or infrastructure are needed. Run migration before deploying
the code; nullable column is backward-compatible, but guards intentionally make
old workers fail closed for deleted users.

## Mobile auth contract proposal (Task 43)

Email/password: a future POST `/api/v1/auth/password` accepts email/password,
uses existing normalization, Argon2 verification, verified/active account checks,
and rate-limits by trusted IP plus normalized identity. On success return opaque
session token and expiresAt once, no password or DB hash. This route is not created.
Use the existing 32-byte random token, HMAC hash stored server-side, 30-day absolute
expiry, individual revoke and logout-all. No JWT signing secret or SESSION_SECRET
belongs in mobile. Task 43 must decide a bounded rotation/renewal policy (revalidate
identity; never extend an erased/revoked session) before enabling long-lived use.

Mobile sends `Authorization: Bearer <opaque token>`, validated by
getSessionByToken in the Next-independent auth/session-core module, stores it only in iOS Keychain/Android secure storage, deletes
it on logout/expiry and redacts it from logs. Not AsyncStorage, URLs or analytics.
Web keeps HttpOnly/Secure/SameSite=Lax cookies; existing Server Action same-origin
checks apply. Future cookie-authenticated API mutations additionally require explicit
Origin/CSRF validation. Bearer routes reject ambiguous simultaneous cookie/bearer
identities and never weaken web CSRF. No wildcard credentialed CORS.

Google: retain existing browser flow for web. Mobile needs provider authorization
with state/nonce + PKCE, registered native redirect identifiers and server verification
of issuer/audience/expiry/verified email. Use short-lived, one-use server exchange
codes; never put the session token in a deep-link URL. Do not reuse web cookie redirects
as a native auth API or link identities by an unverified email. Configure separate
approved client IDs and implement/test the exchange in Task 43.

Logout revokes that DB session; logout-all revokes all owned sessions. Account
deletion destroys all owned sessions and blocks session issuance. App tokens never
outlive server acceptance. Auth response bodies/cache headers must be no-store.

## API v1 rules

`src/lib/api-v1/contracts.ts` is pure Zod/TypeScript and defines all eleven requested
operations, strict input and safe response schemas, versioned paths, errors and cursor
pagination. Unknown input fields are rejected, including questionIds/userId. Adapter
projection must run the response schema too, never serialize raw DB/service rows.
Errors use code/message/requestId/details; no stack, DB/provider messages or secrets.
Map auth 401, owner/not-found 404 (do not reveal foreign records), validation 400,
forbidden 403, conflict 409, rate/usage 429 and internal 500. Retry-After is seconds.

Requests to create/answer/submit require an Idempotency-Key (bounded length); Task 43
must implement a transactional ledger scoped to actor + endpoint + key + canonical
body hash. Same key/body returns original result; different body →409. Keep a bounded,
documented TTL and unique constraint; a header alone is not idempotency. Submit also
locks owned session and scores once. Answer overwrites only assigned questions/options
and returns acceptance, not correctness. Client IDs in an answer refer to existing
server assignments; they cannot create an assignment.

Pagination: opaque, validated keyset cursor with stable (timestamp,id) ordering,
limit 1–100/default20. Bind cursor to authenticated scope/filter. Do not use arbitrary
SQL/offset input. Cross-owner practice read/answer/submit are rejected server-side.
Reading sizes are10/15/20; Listening P3/P4 use intact groups of3. The selector's
Listening count is **groups** for P3/P4: adapter converts API questionCount/3.
Practice media is authorized short-lived URL only; no storageKey/transcript/solution
before its actual release boundary. Mock/diagnostic parent completion and ranked
challenge release gates apply even to already-submitted child sessions.
Rate limits are durable server-side per actor/IP, enforced before service execution.
Task 43 defines per-operation budgets; mobile must not bypass existing usage limits.

## Sync semantics

| Data | Source of truth / policy |
| --- | --- |
| Profile/preferences/goal/context | PostgreSQL owned rows; server validates writes; web preference cookie is a UI hint, not authoritative |
| History/mastery/Mistake Bank | submitted owned attempts + mastery reconciliation; no client scoring |
| Weekly Plan/Review | shared services + versioned server snapshots; regenerate via existing policy only |
| Vocabulary SRS | server dueAt/interval/reviewCount; use existing review service/time |
| Premium/trial/usage | server memberships, payment verification and usage ledger; no optimistic unlocking |
| Streak/progress | shared learning-evidence/gamification and server timezone; no device-clock awards |

Online-first. Offline cached display is allowed after encrypted, account-scoped
storage design; authoritative practice start/submit/review require connectivity.
No offline mutation queue in Task 42. Task 43 uses last server-accepted answer for an
open question, idempotent submit and conflict responses for closed sessions. A future
profile/review write API needs expected revision/updatedAt checks where last-write-wins
would lose intent. Clearing account/logout must clear local cached personal data.
One account sees the same server state on web and mobile; reconnect refreshes server
projections, not merges client-generated plan/mastery/entitlements.

## Store prerequisites, explicitly deferred

In-app export/deletion screens must call these server boundaries. Document personal
data flows to PostgreSQL, Google auth, email/payment providers, logs/backups and
device secure storage; review privacy/store disclosures before release. Current
web payment entitlement is not authorization to sell digital access in native stores.
Apple IAP/Google Play billing, receipts/refunds/restore and subscription reconciliation
need a separate design and approved implementation; none here.
Deep links need associated domains/app links, safe allowlisted destinations and one-use
auth exchange. Push needs opt-in consent, device token lifecycle/revocation, delivery
service and data minimization; no push/deep-link implementation here.

## Verification and release

QA scripts and Playwright use a fresh, explicitly guarded database/container through
`ssh english-vps`; never seed/export/delete production learners. Production verification
is read-only health/revision/protected-route checks. Do not push main (auto-deploy)
until review, migration and quality gates pass. Task 42 is not COMPLETE while deployment
revision/migration exit and requested QA remain unverified. See qa-results.md.
