# Task 27: User Activity Timeline and Retention Diagnostics

## Meaningful learning

A meaningful learning session is an authenticated `practice_sessions` row that:

- has `status = 'submitted'` and a non-null `submitted_at`;
- has at least one `attempt_answers` row for the same user and session with a non-null `answered_at`;
- is regular Practice, a recommended daily workout, or a mastery review;
- is not a diagnostic, full mock, ranked challenge, or demo test.

The shared SQL predicate lives in `src/lib/learning/query-policy.ts`. Learning days are distinct calendar dates after converting `submitted_at` to `Asia/Ho_Chi_Minh`.

## Retention metrics

The primary KPI is registered learners with at least two meaningful learning days in the current seven-product-day window. The window includes the current product day and the six preceding product days, with a half-open UTC interval derived from `Asia/Ho_Chi_Minh` boundaries.

The denominator is every registered learner who does not have an active Admin role. It is not limited to recent signups. Supporting counts include:

- activated: at least one lifetime meaningful learning session;
- exactly one learning day: exactly one distinct product day in the seven-day window;
- 2+ and 3+ learning days: at least that many distinct product days in the window;
- no learning yet: no lifetime meaningful learning session;
- workout return: completed a recommended workout on at least two distinct product days.

The learning-day filter on the user list is intentionally lifetime-based, while the retention panel is seven-day-based.

## Timeline

The user detail timeline normalizes existing authoritative rows with `UNION ALL`. Sources include account creation, goals, diagnostics, Practice/workout/review, full mock runs, payment orders, plan memberships, selected first-party product events, and security events. Events are ordered by timestamp descending, then priority and stable activity key. The route returns at most 50 rows per request and the Admin UI uses 30 rows per page.

No new tracking event is introduced. A product checkout event is suppressed when a payment order exists within the duplicate window. Timeline metadata is allowlisted to aggregate fields such as part, skill area, counts, accuracy, goal settings, plan source, order status, and route. Password data, tokens, question text, answers, free-form event payloads, and guest identity are never exposed.

## Query and authorization notes

- The user page uses one grouped aggregate query, one count query, and one batched last-action query for the visible page; it does not issue per-user queries.
- Timeline queries are restricted to one target user and are bounded and paginated.
- Existing indexes are reused; Task 27 adds no schema migration or backfill.
- Both Admin surfaces call `requireAdmin("USER_READ")`. Unauthenticated users are redirected to sign-in and authenticated learners without permission are redirected to the access-denied page.
- Premium state comes from current or historical `user_plan_memberships`; no predicted TOEIC score is calculated or displayed.
