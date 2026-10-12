# Task 56 — Android launch baseline and product gap audit

Date: 2026-10-11 (Asia/Bangkok)

## Result

**Task status: PASS — the audit and execution ledger are complete.**

This status applies to the audit deliverable, not to Android release readiness. The
product release state is **NO-GO** at this checkpoint because there is no signed or
installed Android candidate, Google Play Billing is not present in the native client,
Google mobile authentication is absent, the production media-backup health gate is
failing, and current dependency audits contain high-severity findings.

The earlier `docs/task-56-road-to-target-retention.md` is a retention proposal from the
previous Task 45–55 program. It remains useful product context but is not the Task 56
baseline requested by the Android-first execution program.

## Repository and production baseline

- Local branch/HEAD at audit start: `main` at
  `f10c8c34957523d72eda16a151640e7972aaad95`; `origin/main` matched and the working
  tree was clean.
- Production Dokploy checkout reported the same revision. The app and PostgreSQL 17
  containers were healthy with zero restarts; both schedulers and media service were
  running. HTTPS `/api/health` returned `200`.
- Production has 57 applied migrations. The latest migration is present. The only
  mismatch is the accepted historical `0017_question_bank_import` drift; the ledger
  and historical SQL were not changed.
- Root disk use was 86% (41/48 GB). The database backup from 2026-10-11 02:00 UTC was
  current. The newest media archive was still the 2026-10-04 recovery-drill archive.
  `ops-health-check.sh` failed with media backup age 599,482 seconds. Cron is active
  and the 03:00 media job is installed and writing its log, but no new archive is
  produced. This is a current operational failure, not a documentation-only risk.
- No production record was written. Task 42B and Task 55 scripts used read-only or
  aggregate-only database transactions and emitted no learner identifiers or secrets.

## Current production outcome baseline

Snapshot time: 2026-10-11 09:15:18 UTC.

| Measure | Current evidence | Interpretation |
| --- | ---: | --- |
| Eligible registered / verified | 26 / 26 | decision-grade baseline |
| Activated learners | 11 / 26 | activation exists but remains weak |
| Mature for two days | 26 | meets the minimum cohort threshold |
| Reached two learning days | 0 / 26 | confirmed P0 retention failure |
| Challenge actor funnel | 40 viewed → 20 started → 13 completed → 1 signup → 0 first workout | post-challenge handoff remains broken; later stages are small |
| Learning loop | 60 wrong → 0 reasons → 1 remediation → 1 drill → 0 mastered | pipeline exists but is almost unused |
| Mobile production evidence | 0 devices, 0 opt-ins, 0 deliveries, 0 store purchases | no device/store outcome may be claimed |

The canonical meaningful-learning-day definition remains: a non-admin, non-deleted,
non-QA signed-in learner submits ordinary Practice, Today's Workout or mistake review
with at least one real answer, grouped by the `Asia/Ho_Chi_Minh` product day. Diagnostic,
Full Mock, ranked challenge and demo sessions do not count.

## Verified readiness ledger

| Area | Status | Priority | Repository/runtime evidence | Verification | Execution task |
| --- | --- | --- | --- | --- | --- |
| Acquisition → learning funnel | PARTIAL | P0 | actor-linked challenge events exist; production funnel ends at 0 first workouts; acquisition source is empty | aggregate Task 55 production checkpoint | Task57 |
| First session / Day-2 return | PARTIAL | P0 | dashboard lifecycle, daily goal and result recommendation exist; production return is 0/26 | production checkpoint plus result/dashboard code review | Task57 |
| Daily Goal / Workout / Road / Weekly Review | PARTIAL | P0 | shared server policies and web/mobile surfaces exist; the result-to-next-session hierarchy still competed with repeat/progress actions | policy tests and UI review | Task57 |
| Reading Parts 5–7 | PASS | P1 | 2,500 validated Reading questions: P5 750, P6 400, P7 1,350 | `npm run validate:reading`; `npm run validate:part5` | Task58 regression |
| Listening Parts 1–4 / media | PARTIAL | P1 | 2,500 validated Listening questions; production registry has 2,861 READY audio and 255 READY images | `npm run validate:listening`; production aggregate | Task58 device/media QA |
| Content quality / explanations / provenance | PARTIAL | P1 | schema/validators and reporting surfaces exist; duplicate scan history is empty and absence of reports is not quality proof | validators and production aggregate | Task58 |
| Mistake Bank / remediation / mastery | PARTIAL | P0 | shared reason/remediation/mastery services exist, but production shows 0 reasons and 0 mastered-after-remediation | aggregate checkpoint and service tests | Task57/59 |
| Diagnostic/challenge → signup → workout | PARTIAL | P0 | challenge attribution exists; one actor-linked signup and zero first workouts | aggregate checkpoint | Task57/59 |
| Free/Premium lifecycle and billing | PARTIAL | P0 | shared entitlement and store-verification backend exists; payOS is configured; Google Play runtime config and native purchase client are absent | architecture tests and runtime booleans | Task62 |
| Mobile API and Android UX parity | PARTIAL | P0 | native Part 1–7, result, mistakes, remediation, vocabulary, progress and account data use `/api/v1`; email login works; Google login and physical-device evidence are absent | mobile lint/typecheck/tests/export and source review | Task61/65 |
| Reliability / privacy / security | PARTIAL | P0 | account export/deletion and public privacy routes exist; DB restore proof exists; media backup is stale, off-host restore is unproved, deferred provider rotations remain | production health gate and dependency audits | Task60/64/65 |
| Google Play technical/policy readiness | BLOCKED | P0 | package `net.toeicgym.app`, listings, graphics and EAS profiles exist; no signed AAB/install/console upload; Expo Doctor fails dependency alignment | config review, Expo Doctor, store-account/device human gates | Task66/67 |

## Build, content and dependency evidence

- Web typecheck passed before implementation work. The initial full suite ran 1,081
  tests: 1,078 passed, 2 skipped and one stale migration test failed because it still
  hard-coded `0054` after migrations `0055` and `0056` were added. Task57 repaired the
  invariant to compare the journal with the actual latest migration.
- Mobile lint and typecheck passed; 18/18 tests passed; Android bundle export succeeded.
- Expo Doctor: 20/21 checks passed. Seven SDK 57 packages are one patch behind the
  expected set (`expo`, `@expo/ui`, asset, constants, linking, notifications, router).
- Android launcher assets now reference only Git-tracked TOEIC GYM artwork. The
  optional monochrome icon reference was removed because its local file was ignored
  by Git and contained a generic template glyph; release tests now reject missing or
  untracked primary/adaptive icon files.
- Content validators passed: 2,500 Reading questions, 2,500 Listening questions and
  25 disjoint Full Mock forms covering 5,000 unique questions. This proves structural
  inventory, not answer/explanation quality or physical-device playback.
- Current `npm audit --omit=dev`: web has 3 high findings involving Next.js 16.3.6,
  sharp and source-map-js. Mobile reports 19 high and 12 moderate findings in the
  Expo/Metro toolchain. The suggested mobile force-fix would install incompatible or
  breaking versions and was not run.

## Current Google Play checks

- Expo SDK 57 targets Android API 36, which matches the Google Play requirement for
  new phone apps and updates effective 2026-08-31:
  <https://support.google.com/googleplay/android-developer/answer/11926878>.
- If the developer account is a personal account created after 2023-11-13, production
  access requires a closed test with at least 12 opted-in testers continuously for 14
  days: <https://support.google.com/googleplay/android-developer/answer/14151465>.
  Account type/date must be confirmed in Play Console; it cannot be inferred from Git.
- A supported Play Billing client is mandatory before selling Premium in the Android
  app. Billing Library 7 stopped being accepted for normal submissions after
  2026-08-31; current official setup examples use Billing 9.1.0:
  <https://developer.android.com/google/play/billing/deprecation-faq> and
  <https://developer.android.com/google/play/billing/getting-ready>.

## Execution order

### P0

1. Task57: remove the result/dashboard handoff ambiguity and measure a new mature
   cohort without claiming an outcome before data exists.
2. Task60: restore daily media backups, diagnose the installed cron failure, then add
   encrypted off-VPS copies and a restore proof.
3. Task61–62: complete Android Google auth/app links and a supported native Play
   Billing purchase/restore client before any Premium sale.
4. Task65: resolve dependency/security findings through compatible upgrades and run
   Android accessibility/device regression.
5. Task66–67: create, install and test a signed candidate, then upload only to an
   internal/draft lane under owner control.

### P1

1. Task58: verify representative answer keys, explanations, grouped passages and
   physical-device media for every Part; run the duplicate scan.
2. Task59: close only evidenced learner-journey defects after Task57/58.
3. Task63–64: enable consented push only after credentials exist; reconcile actual
   binary behavior with privacy/Data Safety declarations.

### P2

- Improve acquisition-source measurement and optional content depth only after the
  P0 release/retention gates. No AI generation, gamification expansion, Speaking/
  Writing or broad content expansion is authorized in this program.

## Human gates and deferred risk

- Google OAuth provider secret rotation, payOS secret rotation, legacy R2 revocation
  and Git-history cleanup remain explicitly deferred by the owner. No claim of a
  fully clean security state is made.
- EAS/Google Play login, app creation, signing ownership, tester enrollment, legal
  declarations and physical Android devices require owner-controlled access.
- Encrypted off-VPS storage destination and external alert channel are not available
  in the repository.
- No push, payment, email or learner write was performed in production.

## Deployment

No commit, push or deployment was performed by Task56. Production was inspected
read-only.
