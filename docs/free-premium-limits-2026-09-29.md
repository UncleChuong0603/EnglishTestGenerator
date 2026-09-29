# Free and Premium limits — 2026-09-29

The Free plan should support a repeatable weekly TOEIC study habit. With several competing sites offering substantial free practice, learners should experience the product's feedback and progress loop before quotas force an upgrade decision. The limits below are a product hypothesis; retention and conversion still need measurement.

| Benefit | Free | Premium |
| --- | --- | --- |
| Today's Workout | 1 new session/day | Unlimited |
| Manual practice | 5 new sessions/day | Unlimited |
| Mistake Bank review | 2 new sessions/day | Unlimited, including Smart Review |
| New Mock runs | 4/month, shared across ready Mock modes | Unlimited where content is ready |
| Weekly Plan | All 3, 5, or 7 basic sessions | All sessions, with eligible focused Reading work and recent study history |
| Progress | 30-day trends and Part summaries | 90-day trends and skill/subskill breakdown |

Daily and monthly allowances reset at 00:00 Vietnam time. Resuming an existing session does not consume another allowance. The Reading demo has its own route and does not use the new-Mock allowance. New Mock access still requires ready content.

The server enforces the four numeric allowances from `src/lib/entitlements/catalog.ts`; pricing derives them from the same source. A shared weekly-plan count of seven makes all supported study-day goals visible to Free, including saved plans and Weekly Review completion.

Track Free registration to first completed session, weekly active learners, sessions per active learner, Mock starts, quota exhaustion, and Free-to-Premium conversion. Review after enough cohorts have had at least a month to use the Mock allowance. If many engaged learners reach a quota and leave without returning, adjust the specific allowance or the upgrade message rather than reducing the whole Free plan.
