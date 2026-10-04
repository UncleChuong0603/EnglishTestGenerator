# Task 55 — Web + mobile product and retention checkpoint

Date: 2026-10-04

## Result

**COMPLETE — FEATURE FREEZE**

**Classification: V1 NEEDS RETENTION WORK**

Task 55 added no product feature. `scripts/task55-production-checkpoint.mjs` queried
production in a read-only transaction and emitted aggregates only. It excluded one
deleted account, two active administrators and accounts in the known QA-domain set.
No production learner, payment, practice session or event was created for this audit.

The decision threshold is 20 eligible learners/stage observations. Rates below that
threshold are descriptive only. The production snapshot was generated at
`2026-10-04T10:51:26.394Z`.

## Production baseline and retention

| Measure | Result | Decision use |
| --- | ---: | --- |
| Eligible registered / verified | 25 / 25 | Sufficient baseline |
| Activated by a meaningful learning day | 9 / 25 (36%) | Sufficient denominator |
| Meaningful sessions / learning days | 10 / 9 | Descriptive |
| Mature at least 2 days | 20 | Meets threshold |
| Reached 2+ learning days | 0 / 20 (0%) | Sufficient: proven retention failure |
| Mature at least 3 days | 20 | Meets threshold |
| Reached 3+ learning days | 0 / 20 (0%) | Sufficient: confirms no repeated habit |
| Exactly one learning day | 9 | All activated learners stopped after day one |
| Today's Workout | 5 completions by 5 users | Below threshold |
| Weekly Plan | 11 snapshots by 11 users | Below threshold |

The largest measurable leak is **day-2 return**, not acquisition, learning depth or
Premium conversion: the mature retention cohort reaches the minimum threshold and
has zero returns. Activation is also weak at 36%, but nine learners did activate;
none formed a second-day habit. The later stages have fewer than 20 observations and
are not ranked against retention.

## Acquisition

The actor-linked challenge path was `34 viewed → 15 started → 10 completed → 1
signup → 0 first workout → 0 second learning day`. Only the viewed stage exceeds the
decision threshold; signup and post-signup conversion are too small for a reliable
rate or optimization verdict. Anonymous lifetime product events show 236 landing
views, 25 try views, 20 pricing views and 6 signup starts, but they do not provide a
reliable SEO/channel attribution model. No eligible learner has a self-reported
acquisition source. SEO traffic and channel performance are therefore **NO DATA**.

## Learning loop and feature usage

The observed loop was `45 wrong answers → 0 reasons captured → 1 remediation started
→ 1 drill completed → 0 mastered`. It spans only nine learners, so it proves that
the pipeline can be used but is too small to rank the reason/remediation design.

Classification rule: **USED** means at least three eligible users; **LOW USAGE**
means one or two; **UNUSED** means an instrumented feature has zero eligible users;
**NO DATA** means the required signal is unavailable. Small cohorts are not deletion
evidence.

| Classification | Features / evidence |
| --- | --- |
| USED | Weekly Plan 11 users; Mistake Bank 9 users/56 mastery records; Today's Workout 5 users |
| LOW USAGE | Remediation 1 user/1 drill; Mistake Review 1 user/1 session |
| UNUSED | Mistake Reason, Vocabulary SRS, Dictation, Diagnostic, Full Mock and Ranked Challenge: 0 eligible users in their canonical records |
| NO DATA | SEO source, mobile install/login/crash attribution, notification-to-learning attribution |

Vocabulary contains zero saved/reviewed cards and Dictation contains zero sessions.
These new capabilities must remain frozen and measured; this checkpoint does not
justify expanding them or deleting them.

## Free, Premium and trial

- 24 of 25 eligible accounts have an active promotion/admin grant, so this cohort is
  not suitable for comparing normal Free and Premium behavior.
- One useful learner currently has no active membership; the usefulness of Free is
  observable but the sample is not decision-grade.
- Trial eligible, started, expired and converted are all zero. Trial conversion is
  **UNUSED/NO OUTCOME**, not a zero-rate finding with a valid cohort.
- No eligible learner has a verified paid membership. Raw payment inventory contains
  one paid and two pending payOS orders, but it is not evidence of eligible-cohort
  conversion. There are no store-purchase records.
- Quotas and prices remain unchanged because this data cannot support a change.

## Mobile and store state

Android and iOS source, API integration, EAS profiles and bilingual store copy are
prepared. There is no signed RC, Play internal build, TestFlight build, install or
tester cohort. Production has zero mobile push devices, opt-ins and deliveries.
Apple Store, Google Play and Expo Push runtime configuration are disabled; payOS is
configured. Mobile login, first workout, web sync, notification learning and crash
rates are **NO DATA**, not passes.

Physical Android/iPhone regression and accessibility QA, the approved Apple
1024×1024 icon, store-console declarations, signing credentials, APNs/FCM and native
store billing remain human gates. No public rollout is authorized.

## Content quality

- Learner question reports: 0; system/learner issue reports: 0; support tickets: 0.
- Duplicate-scan history: 0 parts scanned, so duplicates are **NO DATA**, not zero.
- Media registry: 2,861 audio and 255 image assets, all in `READY`; no failed media
  status was observed.
- With no reports and no duplicate scan, the admin QA workload is currently empty,
  but content quality cannot be inferred from absence of reports alone.

## Reliability

Task 54 proved a checksum-valid local database backup, isolated PostgreSQL 17 restore,
application boot against the restore and a checksum-valid media backup. Production
app/PostgreSQL/schedulers/HTTPS were healthy and migrations were current except for
the accepted historical 0017 hash drift. The final health gate passed at the 90%
disk ceiling.

Risk remains: backups are on the same VPS, no external alert channel is proven, and
disk headroom is narrow. These do not invalidate the product data, but they require
operational work before a broad mobile/user rollout.

## Data-based next priorities

1. **Retention/habit:** freeze feature expansion and improve the existing first-day
   handoff into the next useful workout. Measure a new mature cohort of at least 20
   and require nonzero day-2 return before considering deeper feature work.
2. **Reliability:** copy DB and media backup/checksum pairs to encrypted off-VPS
   storage, prove restore from that copy, add a tested external alert path and create
   disk headroom below the current 90% ceiling.
3. **Mobile adoption:** complete signed Android/iOS preview builds, physical-device
   QA and internal/TestFlight distribution; add privacy-safe platform/install/login/
   first-workout/crash measurements before evaluating mobile retention.
4. **Measurement quality:** capture self-reported acquisition source and trustworthy
   anonymous-to-account attribution; run the duplicate-content scan. Reassess the
   challenge funnel only when each decision stage reaches 20 actors.
5. **Learning depth after retention:** once learners return, measure Mistake Reason,
   Remediation, Vocabulary and Dictation cohorts before changing quotas, adding AI,
   gamification, Speaking/Writing or expanding content.

## Quality and production boundaries

- Audit script boundary tests: 4/4 passed.
- Web: 208 test files passed and 2 skipped; 962 tests passed and 2 skipped. Typecheck
  and production build passed. ESLint had zero errors and one pre-existing
  `no-img-element` warning in the blog Markdown renderer.
- Mobile: lint/typecheck passed, 18/18 tests passed, Android and iOS exports passed,
  and Expo Doctor passed 21/21 checks. These exports are bundle checks, not signed
  or installed native binaries.
- Production deployment identity and post-deploy health are recorded in the Task 55
  handoff after this checkpoint revision is pushed.
- Schema/migration: none in Task 55.
- QA writes: none.
