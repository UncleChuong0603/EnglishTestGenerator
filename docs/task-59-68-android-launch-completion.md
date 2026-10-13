# Tasks 59–68 — Android launch completion

Date: 2026-10-12  
Repository: `C:\Code Project\EnglishTestGenerator`  
Decision: **NO-GO until the human/external gates in `docs/android-launch-human-actions.md` are completed.**

> Production update, 2026-10-13: commit `3dce6867764dd494f213270e99798420e43318e1` and migration 0057 were subsequently reviewed and deployed. Database/media restore tests passed, an encrypted off-VPS media copy was verified, disk usage was reduced to 88%, and final operations health passed. Content review found blocking defects and template duplicates, so the launch decision remains NO-GO. See `task-59-content-and-operations-evidence-2026-10-13.md` for the superseding execution record.

## Outcome

The remaining code-owned launch gaps were implemented locally. Acquisition continuity now binds signup to the exact challenge result. Native Android Google Sign-In uses a one-time server nonce and server-side Google ID-token verification. Google Play purchases are granted only after server verification, and acknowledgement happens only after that verification succeeds. Android FCM configuration can be injected through a private build-time file. The media backup and isolated-restore scripts now produce and verify a real archive instead of piping container progress into it. The admin now has an auditable human-review decision for imported content, and AI-assisted batches cannot be published until that decision exists.

At the time this original report was written, no commit, push, deployment, Play Console submission, production schema migration, content mutation, or store promotion had been performed. The production update above supersedes that operational state; Play Console submission, content approval and store promotion are still open.

## Task status

| Task | Status | Evidence | Remaining gate |
| --- | --- | --- | --- |
| 59 — challenge/signup/first-workout continuity | PASS in code | Exact guest result ID is preserved through auth state/cookies and used for attribution; existing first-workout telemetry remains server-owned | Deploy, then observe a real cohort |
| 60 — backup and recovery | PARTIAL | Fresh production media archive created on 2026-10-12; checksum, tar structure, manifest, 3,539 files and 1,105,296,581 bytes passed isolated restore; operations health returned `ok` | Deploy corrected cron script, configure off-VPS encrypted copy and monitor 90% disk usage |
| 61 — native Google Sign-In | PASS in code / EXTERNAL E2E OPEN | Nonce challenge, Google signature/audience/expiry/verified-email/nonce checks, one-use consumption, explicit collision policy and opaque app session implemented | Create OAuth clients/SHA credentials and verify on a Play-signed build |
| 62 — Google Play Billing | PASS in code / EXTERNAL E2E OPEN | Play product allowlist, server product details, purchase-token verification, account binding, idempotent ledger, RTDN lifecycle, restore path and server-only entitlement implemented | Configure products, Play Developer API/RTDN and license-test real signed purchases |
| 63 — telemetry and push | PARTIAL | Privacy-bounded product events and consented notification/device APIs already exist; Android FCM file is private build input | Configure Firebase/FCM v1 and prove delivery, opt-out, sign-out and token rotation on a device |
| 64 — policy and store declarations | PARTIAL | Public privacy, terms, support and account-deletion pages plus bilingual listing drafts/assets exist | Legal/business owner must validate declarations and submit Play forms |
| 65 — release QA | PARTIAL | Automated web/mobile checks, Expo Doctor and Android Hermes export pass | Physical Android accessibility/media/network matrix remains mandatory |
| 66 — signed artifact | PARTIAL | Package ID, versioning, preview APK and production AAB profiles are defined | Expo/Google account owner must create signing credentials and build the signed artifacts |
| 67 — Play closed test | BLOCKED EXTERNALLY | Internal-track draft submission profile exists | Play Console owner must create the app, upload AAB and run required testing |
| 68 — launch decision | NO-GO | Code-owned risks addressed without weakening scoring, billing, content or security gates | Complete and archive all human evidence before promotion |

## Implemented changes

### Acquisition and authentication

- Preserved the exact challenge result identifier across signup/login instead of selecting the earliest result for the same guest.
- Added `/api/v1/auth/google/challenge` and `/api/v1/auth/google`.
- A random nonce is stored only as a hash, expires after ten minutes and is consumed once in the login transaction.
- Google ID tokens are verified server-side for signature, audience, expiry, nonce and verified email.
- An existing password account with the same email is not silently linked; the API returns an explicit account-link requirement.
- Mobile uses Android Credential Manager through `react-native-nitro-google-signin`; the web client ID is public configuration, never a client secret.

### Billing

- Added the Android billing card using `expo-iap`.
- Product identifiers and displayed offerings come from the backend allowlist; localized price/title come from Google Play.
- Purchases remain pending until Google returns a purchased state and the backend verifies the purchase token and obfuscated account binding.
- The client calls `finishTransaction` only after backend verification succeeds, then refreshes the canonical server entitlement.
- Restore sends each available Play purchase back through the same server verification path. The client never writes or fabricates Premium state.

### Content governance

- Added an admin action that requires `CONTENT_MANAGE`, a checked full-review attestation and a locked committed import batch before changing `UNREVIEWED` to `HUMAN_REVIEWED`.
- The decision writes `IMPORT_REVIEW_COMPLETED` with reviewer ID, timestamp, batch identity, source, item/question counts and attestation version to the append-only admin audit log.
- Publishing an `AI_ASSISTED_ORIGINAL` batch is now blocked until it is `HUMAN_REVIEWED`.
- Batch review navigation now includes published content, which is necessary for the existing 99-question Part 5 batch.
- This workflow records a real editor's decision; it intentionally does not pretend that automated structural validation is editorial review.

### Backup and recovery

- `backup-media.sh` now writes tar output directly to a bind-mounted destination, creates a count/byte manifest, validates archive readability and checksum, and includes manifests in retention.
- `test-restore-media.sh` rejects unsafe paths and special entries, validates SHA-256 and manifest totals, restores into an isolated temporary directory and removes only its verified temporary target.
- Production evidence captured during the incident response: archive `toeicgym-media-20261012T054802Z.tar.gz`, 3,539 files, 1,105,296,581 bytes, isolated restore PASS.
- Safe Docker builder/image pruning recovered about 2.16 GB. Disk remained approximately 90%, so capacity is still an operational warning.

### Android configuration and dependencies

- Added private `GOOGLE_SERVICES_JSON` file-path injection through `app.config.ts`; `google-services.json` is not tracked.
- Aligned Expo SDK 57 packages and added the supported native sign-in/billing packages.
- Upgraded production `next`/`eslint-config-next` to 16.4.0 and `sharp` to 0.35.5. Root production audit reports zero vulnerabilities.
- Full root audit still reports 9 development-toolchain findings; mobile audit reports 31 transitive Expo/Metro/React Native findings. The proposed `npm audit --force` changes are incompatible, so they were not applied. These are tracked residual toolchain risks pending supported upstream releases.

## Database and deployment impact

- Migration `0057_import_review_audit.sql` extends the strict admin-audit action allowlist with `IMPORT_REVIEW_COMPLETED`. It must be applied before deploying code that records batch review decisions.
- No other new database table or entitlement model was introduced.
- New required production configuration depends on enabled features: `GOOGLE_CLIENT_ID`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, approved Google Play product IDs, and Android build secrets described in the human checklist. Secrets must remain in server/EAS secret storage.
- The repaired backup script is local only. Until the normal deployment is approved and completed, the next scheduled production media backup still uses the old deployed script.

## Verification record

- Root dependency install: PASS.
- Root TypeScript and ESLint: PASS.
- Root full Vitest: 225 files passed, 2 skipped; 1,069 tests passed, 2 skipped.
- Final affected suite: 5 files and 29 tests passed, including the new import-review migration, admin workflow, native Google auth, API contracts and backup operations tests.
- Next.js 16.4.0 production build: PASS; 98 static pages generated and the two native Google API routes compiled.
- Root production dependency audit: 0 findings.
- Mobile lint and TypeScript: PASS; mobile Vitest: 2 files and 21 tests passed.
- Expo Doctor: 21/21 checks passed. Public Expo config resolved without a committed Firebase file.
- Android Hermes export: PASS; 1 bundle generated from 1,422 modules, approximately 3.2 MB.
- `git diff --check`: PASS; only expected Git line-ending notices were emitted.
- Production media backup integrity and isolated restore: PASS.
- Production operations health after backup: PASS (`app`, PostgreSQL, schedulers, HTTPS, database backup, media backup and operations status).

## Deferred non-blocking security work

- Rotate any legacy OAuth/payOS credentials through their owners and secret stores; do not place them in source control.
- Choose a supported off-VPS encrypted backup destination. The removed/legacy R2 path is not assumed available.
- Review Git history separately if secret exposure is suspected; ordinary file deletion does not erase history.

## Authoritative vendor references

- Google Play target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- Play production-access testing for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Play app setup: https://support.google.com/googleplay/android-developer/answer/9859152
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- Play Billing integration/backend/subscription lifecycle: https://developer.android.com/google/play/billing/getting-ready, https://developer.android.com/google/play/billing/backend, https://developer.android.com/google/play/billing/integrate, https://developer.android.com/google/play/billing/lifecycle/subscriptions
- Real-time developer notifications: https://developer.android.com/google/play/billing/rtdn-reference
- Expo Google authentication: https://docs.expo.dev/guides/google-authentication/
- Android Credential Manager Sign in with Google: https://developer.android.com/identity/sign-in/credential-manager-siwg
- Expo in-app purchases: https://docs.expo.dev/guides/in-app-purchases/
- EAS Build and Submit: https://docs.expo.dev/build/setup/, https://docs.expo.dev/submit/android/
- Expo FCM credentials: https://docs.expo.dev/push-notifications/fcm-credentials/

