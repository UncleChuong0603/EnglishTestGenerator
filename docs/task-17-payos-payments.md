# Task 17 — payOS payments

## Architecture and trust boundary

UI calls the payment service with only a `productKey`. The service resolves VND price, duration and plan from the server catalog, persists an order, then calls a `PaymentProvider`. Production uses `PayOSPaymentProvider`; tests use `FakePaymentProvider`, which is forbidden when `NODE_ENV=production`. Learning features continue to call Task 13 `getEffectivePlan()` and never import payOS.

The return and cancel URLs are UX-only. `/billing/return` reads TOEICGym's persisted order and cannot activate Premium from query parameters. Only a verified payOS webhook or authoritative server-side reconciliation can process payment.

## Configuration and secrets

Server-only environment names: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PREMIUM_30_PRICE_VND`, `PREMIUM_90_PRICE_VND`, and `PREMIUM_365_PRICE_VND`. Never use `NEXT_PUBLIC_` or log their values. A missing/invalid price makes only that product unavailable; incomplete payOS credentials make checkout unavailable without breaking Free learning pages.

The catalog contains exactly 30, 90 and 365 days. Amounts are positive integer VND. Suggested launch positioning (operator decision, not runtime defaults): **59,000₫ / 30 days; 139,000₫ / 90 days; 399,000₫ / 365 days**. This deliberately enters below established full-course products while the question bank and learning insights mature. Review conversion, retention, content depth and support cost after 6–8 weeks before raising prices.

## Lifecycle, verification and recovery

Orders use `PENDING`, `PAID`, `EXPIRED`, `CANCELLED`, `FAILED`; expiry is 30 minutes and is sent to payOS. A recent payable pending order is reused for duplicate clicks. Provider-authoritative paid reconciliation may still accept a late legitimate payment.

Webhook: `POST https://toeicgym.net/api/payments/payos/webhook`. Register this exact URL in the payOS merchant dashboard. The official `@payos/node` `webhooks.verify()` helper runs before business processing. Events have a provider/event unique key; orders are row-locked and a unique membership/payment-order link prevents a second entitlement effect. Amount, currency, provider, order code and payment-link ID must match. Rejected events retain only bounded non-secret metadata.

Premium activation and the PAID transition occur in one PostgreSQL transaction. It reuses `grantPremiumWithTx`, takes the Task 13 per-user advisory lock, extends from the latest active expiry, and records membership source `PAYMENT`. Admin/CLI grants remain `MANUAL`. Rollback leaves neither a false PAID order nor a partial membership.

## UI and admin

`/pricing` and `/billing` show configured products only; no `0₫` placeholder is used. `/billing` contains plan/expiry and user-owned history. `/admin/payments` is read-only and paginated/searchable. It has no Mark Paid or entitlement mutation action. Manual grants remain separate Task 14 operations.

Premium changes no Task 16 competitive rule: Weekly RP remains 60/day and ranked attempts remain one per challenge for both plans.

## Deployment and controlled smoke test

1. Back up the database and apply append-only migration `0015_payos_payments`.
2. Configure rotated secrets and chosen integer prices in Dokploy; never paste them into tickets/chat.
3. Register the webhook URL in payOS and deploy.
4. Confirm Free pages work with payments unavailable.
5. A human creates the smallest intentionally priced order, checks description/amount/URLs, explicitly decides whether to transfer real money, then confirms one PAID order, one PAYMENT membership and Premium UI. Repeat the webhook delivery to confirm no extension.

No automated suite performs a real payOS transaction. On provider creation failure the internal order becomes FAILED. Operators can inspect order/event records and safely retry with a new checkout; never edit an order to PAID. Roll back application code if needed while retaining migration/data for later reconciliation.

## Automated certification (Task 17B)

The write-capable runner parses its test URL and refuses anything except `127.0.0.1:15433`. It removes real payOS credentials from the Playwright child environment, forces `PAYMENT_PROVIDER=FAKE`, supplies deterministic test-only prices, and reports no connection secrets. The E2E confirmation endpoint returns 404 unless the explicit E2E flag and Fake provider are active, and always returns 404 in production.

Verified on PostgreSQL 17 with a fresh `0000` through `0015` migration: successful 30/90/365-day activation, active-Premium extension, same-event and different-event idempotency, simultaneous delivery, injected rollback followed by clean retry, amount mismatch, unknown order, cross-user read/reconcile/cancel denial, creation failure, expiry fallback, cancellation without revocation, and provider-authoritative late payment. Payment-created memberships were `PAYMENT` with an order link; manual grants remained `MANUAL` without an order.

Playwright verifies configured test prices, checkout, pending return, Fake verified payment, Premium state, PAID history, Settings, return-query spoof resistance, cross-user hiding, and read-only Admin authorization. The adapter suite mocks the official client boundary and verifies request/URL/expiry mapping, webhook helper invocation and status mapping. Real payOS traffic and real transactions remain deliberately untested; production checkout stays fail-closed while prices are absent.
