# Task 33B — Acquisition experiment runbook

## Entry and channels

- Primary URL: `https://toeicgym.net/challenge/part-5` for every campaign post. Keep the URL unchanged when sharing a result.
- Channels: Facebook Page, Facebook Groups, Threads, LinkedIn, and SEO. Record the publication date, post URL, channel, message, and any promotion spend in a private experiment log. Use the same landing URL so the page and its funnel remain comparable.
- The product does not attribute a view to one of these channels. Platform reach/click data and Search Console data are channel context, not product actor counts. Do not infer channel from Direct traffic or add channel-specific conversion claims.
- Before distribution, check the public landing page, Start action, result/share flow, canonical, robots, and sitemap. Do not create test signups or seed production for this check.

## Funnel and decisions

Use Admin Analytics → Part 5 Challenge, with a fixed record of the selected view period and extraction time. The first five steps are distinct tracked actors in the same browser/session chain:

`Viewed → Started → Completed → Signup → First workout → 2+ learning days`

`Viewed` is a browser event and can be missed. `Started` and `Completed` are server events. `Signup` requires a new account following a guest completion in the same browser. `First workout` requires a submitted recommended practice session after signup. The Admin Challenge panel currently ends here; its separate retention card is **all learners**, not this acquisition cohort. Never use that aggregate as the sixth funnel count.

For `2+ learning days`, use a read-only, user-linked cohort check: among actors with a first workout after Challenge signup, count those with meaningful submitted practice on at least two distinct `Asia/Ho_Chi_Minh` product dates in the seven product days starting on their first workout date. Meaningful practice follows `src/lib/learning/query-policy.ts`: excludes diagnostic, Full Mock, ranked challenge, and demo test, and requires at least one answered question. Count only first-workout actors whose full seven product days have elapsed in the denominator. Document this **mature denominator** beside the sixth count; it will differ from the all-time `First workout` count shown in Admin. If the linked check is unavailable, mark the sixth step “pending measurement,” not zero.

Do not conclude anything about a conversion step unless its previous step has **at least 20 distinct actors** and every actor in the denominator has had the full observation time for that step. Show absolute counts even when the threshold fails. Compare the same cohort window across reviews; do not compare raw event totals or mixed rolling windows. A low sample or immature cohort means “insufficient data,” not “poor conversion.”

Review cadence: check availability and counts daily for the first three days after each channel launch; review conversion weekly once the relevant cohort has matured. At each review, record the exact time, view cohort dates, six counts where measurable, denominator and maturity for each rate, channel posting log, and the next decision. Wait for at least seven complete product days after a first workout before judging the final step.

### Read-only check for the sixth step

Run this in production `psql` with read-only access. Change only the view-cohort interval to match the Admin Analytics period. It follows the same view → session → signup → first-workout chain as `getChallengeFunnel`; it reports a separate mature denominator for the final step. The first workout's product date is day one, and the next six product dates complete the observation window.

```sql
BEGIN READ ONLY;
WITH views AS (
  SELECT CASE WHEN user_id IS NOT NULL THEN 'u:' || user_id::text ELSE 'g:' || guest_reference END actor,
         min(occurred_at) viewed_at
  FROM product_events
  WHERE event_name = 'challenge_viewed'
    AND occurred_at >= now() - interval '30 days'
    AND (user_id IS NOT NULL OR guest_reference IS NOT NULL)
  GROUP BY 1
), starts AS (
  SELECT DISTINCT v.actor, e.session_id, e.occurred_at
  FROM views v JOIN product_events e ON e.event_name = 'challenge_started'
    AND (CASE WHEN e.user_id IS NOT NULL THEN 'u:' || e.user_id::text ELSE 'g:' || e.guest_reference END) = v.actor
    AND e.occurred_at >= v.viewed_at AND e.session_id IS NOT NULL
), completions AS (
  SELECT DISTINCT s.actor, s.session_id, e.occurred_at
  FROM starts s JOIN product_events e ON e.event_name = 'challenge_completed'
    AND e.session_id = s.session_id AND e.occurred_at >= s.occurred_at
), signups AS (
  SELECT DISTINCT c.actor, e.user_id, e.occurred_at
  FROM completions c JOIN product_events e ON e.event_name = 'signup_after_challenge'
    AND e.session_id = c.session_id AND e.user_id IS NOT NULL AND e.occurred_at >= c.occurred_at
), first_workouts AS (
  SELECT DISTINCT ON (s.actor) s.actor, s.user_id, e.occurred_at workout_at
  FROM signups s JOIN product_events e ON e.event_name = 'first_authenticated_workout_after_challenge'
    AND e.user_id = s.user_id AND e.occurred_at >= s.occurred_at
  ORDER BY s.actor, e.occurred_at
), mature AS (
  SELECT actor, user_id, (workout_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date first_day
  FROM first_workouts
  WHERE (workout_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 7
        <= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
), learning_days AS (
  SELECT m.actor, count(DISTINCT (ps.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) learning_days
  FROM mature m JOIN practice_sessions ps ON ps.user_id = m.user_id
    AND (ps.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date >= m.first_day
    AND (ps.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date < m.first_day + 7
  WHERE ps.status = 'submitted' AND ps.submitted_at IS NOT NULL
    AND ps.source NOT IN ('diagnostic', 'full_mock', 'ranked_challenge')
    AND ps.practice_type <> 'demo_test'
    AND EXISTS (
      SELECT 1 FROM attempt_answers aa
      WHERE aa.session_id = ps.id AND aa.user_id = ps.user_id AND aa.answered_at IS NOT NULL
    )
  GROUP BY m.actor
)
SELECT count(*)::int AS mature_first_workout_actors,
       count(*) FILTER (WHERE coalesce(l.learning_days, 0) >= 2)::int AS two_plus_learning_day_actors
FROM mature m LEFT JOIN learning_days l ON l.actor = m.actor;
ROLLBACK;
```

The final conversion rate is `two_plus_learning_day_actors / mature_first_workout_actors`, only when that denominator is at least 20. It must not be divided by the Admin panel's unmatured `First workout` count.

## Known attribution limitation

If one guest completes several Part 5 Challenges before signup, `recordChallengeSignup` links the signup to that guest's **earliest** completion. A later completed session may have prompted signup, so session-level attribution can be wrong. Keep this behavior for the experiment; document affected interpretation and revisit only if observed data justify a change. Guest identity is browser-bound, with no cross-device join.

## Production closeout checklist

1. Compare local `HEAD`, freshly fetched `origin/main`, the Dokploy checkout revision, and the running app revision. Record mismatches before interpreting the live pages.
2. Require `/api/health` to return HTTP 200 with `database: reachable`. Require HTTP 200 for `/challenge/part-5`, `/toeic/part-5`, and `/toeic/part-5/word-form`.
3. Confirm each page has its own `https://toeicgym.net/...` canonical, no `noindex` or `X-Robots-Tag: noindex`, and visible links between Challenge, Part 5, and Word Form. Session/result URLs remain noindex.
4. Confirm `/sitemap.xml` contains all three public URLs and `/robots.txt` advertises `https://toeicgym.net/sitemap.xml` without disallowing them.
5. Record the five Admin Challenge counts and use the linked, mature cohort definition above for the sixth step. Do not seed production.
