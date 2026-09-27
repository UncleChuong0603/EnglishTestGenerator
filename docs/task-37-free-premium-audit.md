# Task 37: Free/Premium depth and pricing truth

Audit date: 2026-09-27. The plan economics remain unchanged. `PLAN_CATALOG` still gives Free one Today's Workout, three manual sessions and one mistake review per Vietnam day, plus one new Mock run per month. Active Premium bypasses those four quotas. `PLAN_CAPABILITIES` controls advanced targeting, Smart Review, 90-day trends, skill breakdown, reassessment and advanced Mock history. Expired membership returns to Free for new actions; owned answers, sessions and results remain stored.

## Product status

| Benefit | Public pricing status | Evidence |
| --- | --- | --- |
| Explanations, daily workout, manual practice, Mistake Bank basics, 30-day progress, Road to Target preview and basic Weekly Review | AVAILABLE NOW for Free | Shared answer views, usage catalog, weekly policies and Free UI |
| Advanced targets, Smart Review, full Weekly Plan, detailed Weekly Review, 90-day trends and skill breakdown | AVAILABLE NOW for active Premium | Capability checks and server-side query policy |
| Diagnostic reassessment | AVAILABLE NOW after baseline and 30-day cooldown | Server eligibility and transactional creation guard |
| New Mock runs and advanced Mock history | READINESS-GATED in public pricing | `getMockHubReadiness()` controls the comparison row; run creation also checks content readiness |
| AI coach, predicted score, score improvement promise, Premium trial | NOT ADVERTISED | No corresponding product or supported claim |

Reading demo on `/full-mock` is a separate free route. It does not consume the quota for new runs created by the Mock engine. Pricing now says this explicitly. The monthly quota is shared by Mock-engine Listening, Reading and Full runs if those modes are available; the Reading card currently links to the separate demo.

## Corrections

- Pricing shows Smart Review and Weekly Plan/Review depth, with the Free value visible alongside it. Mock quota and history claims disappear when no quota-controlled mode can start. Reassessment copy describes a cooldown, not an automatic scheduled assessment.
- Homepage Mistake Bank copy no longer labels the Free retry flow as Premium Smart Review.
- Low-data Premium Preview uses generic value copy. Personal metrics and weakness messages remain backed by stored attempts, mistakes and compatible Mock results.
- Practice quota paywall describes personalized targets only when learning history exists. Mock History gives learners without results an empty state instead of an upgrade prompt.
- Progress and Weekly Review sample thresholds now come from the matching analytics policies.

## Deferred product and billing findings

- The Reading demo and quota-controlled Reading Mock are two different routes; any future unified Reading Mock entry requires an explicit product decision and regression test. No quota changed here.
- `getMembershipState()` labels any past Premium row with no active membership as `EXPIRED`, including a revoked grant. Billing and Settings consequently show expired wording after a revoke. This is a membership lifecycle wording defect for the billing task; effective Free entitlements remain correct.
- Recheck the published content and media readiness before selling Mock access. A paid plan bypasses quota, not readiness.

## Verification scope

No schema or environment changes. Isolated QA database `toeicgym_task17` on `english-vps` was migrated through the existing Drizzle journal. Task 37 Playwright uses only guarded `127.0.0.1:15433/toeicgym_task17` fixtures and checks anonymous pricing at 360/390/430/1024/1440, Free, Premium, expired Premium, retained progress, low-data copy and no-data Mock history. Production checks are read-only. No production user, payment or QA seed is created.
