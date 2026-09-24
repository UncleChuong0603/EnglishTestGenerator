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

## Known attribution limitation

If one guest completes several Part 5 Challenges before signup, `recordChallengeSignup` links the signup to that guest's **earliest** completion. A later completed session may have prompted signup, so session-level attribution can be wrong. Keep this behavior for the experiment; document affected interpretation and revisit only if observed data justify a change. Guest identity is browser-bound, with no cross-device join.

## Production closeout checklist

1. Compare local `HEAD`, freshly fetched `origin/main`, the Dokploy checkout revision, and the running app revision. Record mismatches before interpreting the live pages.
2. Require `/api/health` to return HTTP 200 with `database: reachable`. Require HTTP 200 for `/challenge/part-5`, `/toeic/part-5`, and `/toeic/part-5/word-form`.
3. Confirm each page has its own `https://toeicgym.net/...` canonical, no `noindex` or `X-Robots-Tag: noindex`, and visible links between Challenge, Part 5, and Word Form. Session/result URLs remain noindex.
4. Confirm `/sitemap.xml` contains all three public URLs and `/robots.txt` advertises `https://toeicgym.net/sitemap.xml` without disallowing them.
5. Record the five Admin Challenge counts and use the linked, mature cohort definition above for the sixth step. Do not seed production.
