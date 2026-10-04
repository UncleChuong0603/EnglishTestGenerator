# TOEICGym Task 45–55 Program Result

Date: 2026-10-04

## Completed Tasks

- **45 — Mistake Reason:** shared web/mobile canonical reason capture with conservative
  inference, ownership checks and aggregate guardrails.
- **46 — Remediation:** shared reason → real lesson → focused drill → existing mastery
  loop without a second scoring or recommendation engine.
- **47 — Mobile V1:** native email login, dashboard, practice/results, Mistake Bank,
  remediation, vocabulary, progress and account settings on shared server APIs.
- **48 — Native retention:** explicit push preferences, scheduler/device lifecycle,
  secure media, notification routing and vocabulary-only offline queue.
- **49 — Billing:** one entitlement model across payOS, Apple and Google, with
  server-verified store lifecycle and idempotent ledgers. Native stores remain off
  until credentials and sandbox QA exist.
- **50 — Dictation:** shared Listening dictation engine and bilingual web/mobile UX,
  backed by canonical audio/content and server scoring.
- **51 — Exam readiness:** evidence-bounded readiness on web/mobile; no fabricated
  score or date certainty.
- **52 — Store readiness:** stable app identity, foreground-only audio, account export/
  deletion, public policy surfaces and store declaration drafts.
- **53 — Release candidate preparation:** EAS build/submit lanes, bilingual listings
  and Google feature graphics. No signed binary or submission was claimed.
- **54 — Reliability:** atomic checksum backups, isolated restore/app-boot drill,
  media backup, scheduled health checks, integrity audit and recovery runbooks.
- **55 — Product checkpoint:** aggregate-only production measurement and feature
  freeze; the decision-grade leak is day-2 retention.

## Web Status

The web product is deployed and healthy with the complete Listening/Reading learner
path, adaptive workout/plan, learning tools, account/privacy controls, billing,
content/admin surfaces and recovery gates. The Task 55 cohort has 25 eligible verified
learners, 9 activated learners and 0 of 20 mature learners reaching a second learning
day. Feature development is frozen in favor of retention and operations.

## Mobile Status

The Expo app is a native API client rather than a WebView or separate backend. It
shares auth, practice/scoring, entitlement, learning history and content with web.
Code/bundle readiness passed during the release-candidate work, but there is no signed
AAB/IPA, internal-store/TestFlight install or physical-device evidence. Production
mobile usage is therefore **NO DATA**.

## Learning System

- **Mistake Reason:** shipped web/mobile; 0 eligible production users so far.
- **Remediation:** shipped and linked to existing mastery; 1 learner completed 1 drill.
- **Vocabulary:** SRS and limited offline native review shipped; 0 production cards.
- **Dictation:** shared engine/UX shipped; 0 production sessions.
- **Exam Readiness:** shipped with evidence and maturity guardrails; no unsupported
  score claims.

## Retention

- **Weekly Plan:** 11 eligible users and 11 snapshots.
- **Lifecycle email:** production scheduler is running; this checkpoint did not expose
  delivery/open attribution suitable for a retention claim.
- **Push:** system and scheduler exist, but zero devices/opt-ins/deliveries and provider
  credentials are absent.
- **Offline:** vocabulary-only by design; offline practice is intentionally excluded.
- **Streak:** shared server truth is exposed; the mature cohort still has 0% day-2
  return, so streak UI is not treated as habit evidence.

## Monetization

- **Free:** one eligible meaningful learner without an active membership; too small
  for quota decisions.
- **Premium:** unified entitlement is operational, but 24/25 eligible accounts have
  promotion/admin grants and none has an eligible paid membership, so behavioral
  comparison is not valid.
- **Trial:** zero eligible/started/converted records; no conversion conclusion.
- **payOS:** configured; raw inventory has one paid and two pending orders.
- **Apple / Google:** backend verification is implemented but runtime credentials,
  native purchase client and sandbox evidence are absent; no store purchases exist.

## Mobile Release

- **Android:** source and preview/production profiles prepared; no signed or installed
  candidate.
- **iOS:** source and profiles prepared; Apple 1024×1024 icon, signing and physical
  device/TestFlight QA remain.
- **Store submission:** none. Only internal Android draft/TestFlight are authorized as
  the next human-controlled lanes.

## Reliability

- **Backup:** checksum-valid mode-0600 local DB and media copies with 14-day retention;
  daily schedules installed.
- **Restore:** isolated PG17 restore, integrity verifier and exact production-app boot
  passed.
- **Deployment:** Dokploy rollout requires checkout, migration, replacement runtime ID
  and health verification; checkout alone is not accepted.
- **Security:** root production dependency audit was clean. Production secrets are not
  printed by diagnostics. Mobile dependency advisories and provider rotations remain
  documented risk.

## Remaining Human Actions

- Create encrypted off-VPS backup copies and test restoration from them; connect and
  test external alerts; increase disk headroom.
- Authenticate EAS/store accounts, create signed preview builds, complete physical
  Android/iPhone/accessibility QA and capture real store screenshots.
- Configure APNs/FCM/Expo Push and Apple/Google store billing, then verify only in
  sandbox/internal/TestFlight lanes.
- Complete current store privacy/data-safety/rating/reviewer forms and final legal/
  operator review against the actual binaries.

## Deferred Security Debt

Accepted, explicitly tracked items remain: Google provider secret rotation, payOS
provider secret rotation, legacy R2 revocation, Git-history secret-artifact cleanup
and historical migration `0017_question_bank_import` hash drift. The migration SQL or
ledger must not be rewritten.

## Final Product State

TOEICGym V1 has a production web learning system and a code-complete native learner
client sharing one backend. The main product constraint is not another feature: it is
repeat learning. Reliability is functional and tested locally on the VPS, but lacks
off-host disaster recovery and external alerts. Mobile is release-candidate prepared,
not released.

## Feature Freeze Verdict

**V1 NEEDS RETENTION WORK**

The decision-grade evidence is 0 of 20 mature eligible learners reaching a second
meaningful learning day. New AI Coach, gamification, Speaking/Writing and content
expansion remain frozen.

## Recommended Next 3–5 Priorities

1. Improve and measure first-day → day-2 return using existing workout/plan/lifecycle
   surfaces; wait for another mature cohort of at least 20.
2. Complete encrypted off-host backup, restore proof, tested external alerts and disk
   capacity work.
3. Produce signed internal Android/TestFlight builds and complete physical-device QA,
   then measure mobile adoption with privacy-safe platform attribution.
4. Repair measurement gaps: acquisition source, mobile funnel/crashes and duplicate
   scan history.
5. Only after retention is nonzero, evaluate the observed Reason/Remediation/Vocab/
   Dictation loop and Premium conversion; do not expand features from opinion.

The program stops after Task 55. There is no automatic Task 56.
