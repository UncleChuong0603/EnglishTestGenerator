# Task 56 — Road to Target Day-2 Retention Experiment

Date proposed: 2026-10-05

## Why this is the next product action

Task 55 found the decision-grade leak: 0 of 20 mature eligible learners reached a
second meaningful learning day. Nine learners activated, but every activated learner
stopped after one day. This outweighs opinion-based pressure to add more independent
features.

The public-product review reinforces the same positioning:

> TOEIC GYM should not give learners a pile of tools. It should know what they are
> struggling with and make the next useful study decision clear.

The repository already contains most required foundations: learner goals, study
purpose, diagnostic, Today's Workout, weekly planning/review, mistake reasons,
remediation, vocabulary SRS, lifecycle email, native push infrastructure and canonical
retention measurement. The immediate gap is the handoff between these systems.

## Outcome

A new learner should move through one coherent contract:

1. Tell TOEIC GYM the purpose, target and realistic study capacity.
2. Complete a diagnostic or balanced exploration without receiving a fabricated score.
3. See one recommended Day 1 session with an evidence-based reason.
4. Finish Day 1 and see exactly what will be waiting on the next product day.
5. Return on Day 2 through the same canonical web/mobile learning record.

The experiment succeeds only when a new mature cohort of at least 20 eligible learners
has nonzero second-learning-day return. Until then, deeper feature expansion stays
frozen.

## 56A — Measurement contract first

- Preserve the Task 55 definition of a meaningful learning day: a signed-in learner
  submits Practice, Today's Workout or mistake review with at least one real answer.
- Add or verify actor-linked milestones for onboarding completion, goal completion,
  diagnostic start/completion, first recommended workout start/completion, next-session
  preview exposure and second learning day.
- Keep Asia/Ho_Chi_Minh as the product-day boundary.
- Exclude administrators, deleted accounts and guarded QA identities exactly as Task 55
  does. Do not create production learners or sessions for measurement.
- Report absolute counts below 20 observations; do not rank small-sample percentages.

## 56B — Short Road to Target onboarding

Replace the name-only onboarding handoff with one short, skippable sequence that uses
the existing canonical models:

- profile name;
- study purpose: graduation, job/career, upcoming exam, English improvement or other;
- target score, including “not decided”;
- expected exam date or an honest “not decided” state;
- daily capacity: 10, 20, 30, 45 or 60 minutes;
- weekly capacity: 3, 5 or 7 sessions.

Save profile, goal and learner context atomically where practical. Do not ask the
acquisition-source question in the primary learning setup; collect it later without
blocking study. After setup, send the learner directly to the diagnostic or the safest
available balanced exploration.

## 56C — Day 1 and Day 2 open loop

The authenticated dashboard must lead with a compact Road to Target hierarchy:

- target and honest days remaining when an exam date exists;
- “learning day N” based on actual distinct learning days, separate from streak and
  separate from calendar days remaining;
- this week's completed sessions versus the learner's selected capacity;
- one recommended session with approximate minutes, question count and a concise
  evidence reason;
- reviewable mistakes and due vocabulary only when canonical records exist.

After completing the first meaningful session, the result handoff should state:

- what was completed, using correct/total rather than a fake scaled score;
- what evidence changed, only when sample thresholds support the claim;
- which mistakes or vocabulary items are scheduled for review;
- one concrete next-product-day promise, such as “Tomorrow: revisit 2 unresolved
  mistakes”, without promising content that may be unavailable.

Lifecycle email and opted-in push may repeat this server-owned next action. They must
not send generic “Study now” copy, exceed existing frequency controls or bypass user
notification preferences.

## 56D — Experiment checkpoint

Run a read-only checkpoint after at least 20 newly mature eligible learners:

- onboarding start → completion;
- diagnostic/exploration start → completion;
- first workout start → completion;
- Day 1 completion → next-session preview;
- Day 1 completion → second learning day;
- notification delivery → second learning day only when attribution is trustworthy.

If second-day return remains zero, iterate the setup and completion handoff rather than
adding AI, gamification or another content surface. If return becomes nonzero, inspect
Mistake Reason, Remediation, Vocabulary SRS and Dictation usage before changing limits
or expanding their feature sets.

## Product guardrails

- No predicted or unofficial TOEIC score.
- No invented Day N, streak, weakness, improvement or tomorrow task.
- No Premium quota or upgrade interruption in first-use setup.
- All steps remain skippable except information required to create the account.
- One primary action per state; full keyboard access, visible focus and 44px targets.
- Review Vietnamese and English at 375, 768, 1024 and 1440px.
- Preserve server-owned practice selection, scoring, entitlement and content readiness.

## Direction after Task 56

The external product review is retained as five epics, ordered by evidence and
dependency rather than feature count:

1. **Content & Exam Readiness:** run a complete inventory/duplicate/difficulty/media/
   explanation audit, then close proven Part 1–7 and Full Mock readiness gaps. Full
   Mock becomes first-class only when complete original forms and timed UX pass QA.
2. **Road to Target:** complete this retention experiment and keep daily/weekly
   recommendations as the core product surface.
3. **Learning Loop 3.0:** connect mistake reason → concise mini lesson → focused drill
   → vocabulary extraction/SRS → scheduled review → mastery using existing canonical
   engines rather than a second recommendation model.
4. **Mobile & Retention:** complete signed internal/TestFlight builds, physical-device
   accessibility QA and provider-backed push. The focused native hierarchy remains
   Today, Practice, Review, Progress and Me.
5. **Commercial & Trust Readiness:** sell outcome acceleration rather than quota,
   verify checkout/entitlements/recovery, repair SEO/index/cache consistency and add
   only consented real learner proof or aggregate metrics with adequate samples.

## Explicit non-goals

Do not build PvP, a social feed, a forum, a generic AI chatbot, a teacher marketplace,
live classes, a large video-course catalog, a complex CRM, dozens of achievements,
full AI Speaking/Writing, a fake scaled score or a large unreviewed AI question bank.

