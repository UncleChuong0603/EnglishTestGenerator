# Task 23 - Self-hosted product analytics

## Architecture

Browser -> same-origin `/api/analytics/events` -> analytics service -> PostgreSQL `product_events` -> `/admin/analytics`.

Learning, account, and payment facts remain authoritative in their existing tables. The event table only adds acquisition and behavioral transitions that cannot be reconstructed reliably. Analytics failures are caught and logged and must never roll back a learning, authentication, or payment operation.

## Metric definitions

- Activation: the first completed authenticated `practice_sessions` row for a learner. Diagnostic, workout, practice, and mistake review sessions are meaningful learning activity; page views are not.
- DAU/WAU: distinct authenticated learners completing a learning session during the calendar day / trailing seven days. V1 displays WAU; the query foundation uses completed sessions.
- D1/D7/D30 retention: users grouped by signup timestamp who complete at least one learning session during the 24-hour window beginning 1, 7, or 30 days after signup. The UI shows returned/cohort and warns for cohorts under 20.
- Pricing -> Checkout: tracked Pricing views compared with authoritative payment orders created.
- Checkout -> Premium: authoritative paid payment orders / created payment orders. A click is never treated as payment.
- Signup -> Premium: authoritative paid payment orders / users created in the selected period.

## Privacy and identity

Authenticated events use the server-resolved user UUID. Guest events reuse the existing HMAC/SHA-derived guest owner hash; raw cookies are never stored. The browser endpoint cannot submit either actor field. No IP address, fingerprint, answer, question text, transcript, solution, media URL, auth secret, or payment secret is stored. External analytics services: none.

## Retention and operations

Raw events should be retained for 18 months. This task intentionally does not schedule production deletion; add a reviewed PostgreSQL maintenance job once volume justifies it. Expected volume is low because question-level events are excluded. Composite B-tree indexes cover event/time and actor/time filters; dashboard business metrics aggregate indexed domain timestamps and avoid JSON scans. Existing PostgreSQL backup/restore includes the table automatically. No service, port, or environment variable is added.

Tracked-visit counts are directional: bots, crawlers, browser automation, and uptime checks can distort them. They must not be described as unique humans.
