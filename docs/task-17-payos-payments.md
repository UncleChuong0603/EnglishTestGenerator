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

## Production activation runbook (Task 17C)

### Exact configuration and preflight

The server contract is `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PREMIUM_30_PRICE_VND`, `PREMIUM_90_PRICE_VND`, `PREMIUM_365_PRICE_VND`, `APP_URL`, and optional `PAYMENT_PROVIDER` (defaults to `PAYOS`). Production `APP_URL` is `https://toeicgym.net`. No payment variable uses `NEXT_PUBLIC_`.

Run `npm run payments:preflight`. The npm command uses Node's `--env-file-if-exists=.env.local`: a local operator checkout automatically loads its gitignored `.env.local`, while a Dokploy/container environment without that file continues with injected `process.env`. Already-injected environment variables remain authoritative. The file is never copied into the production image. Preflight is read-only: it does not import the database client, create an order, or contact payOS. It reports only configured/not-configured secret states, non-secret integer prices, origin and calculated routes. Checkout is enabled only when provider is PAYOS, all three credentials and all three positive integer prices are present, and the production origin is valid. Fake is always blocked in production.

The four supported configuration states are: no credentials/no prices → disabled; credentials/no prices → disabled; complete credentials/complete prices → enabled; prices/incomplete credentials → disabled. Pages and Free learning continue to boot in every disabled state. Removing all three price variables is the V1 emergency kill switch for **new** checkout; it does not alter existing Premium, history, webhook verification, or reconciliation of existing orders.

### Backup and migration

From the actual Dokploy checkout directory, before deployment:

```sh
COMPOSE_ENV_FILE=.env COMPOSE_FILE_PATH=docker-compose.dokploy.yml ./scripts/backup-db.sh /opt/toeicgym/backups
```

The script uses the PostgreSQL container's existing environment, `pg_dump -Fc`, restrictive permissions, a non-empty-file check and retention cleanup; no password appears on the command line. Capture the returned archive path and verify it is readable without restoring production:

```sh
docker compose --env-file .env -f docker-compose.dokploy.yml exec -T postgres sh -c 'pg_restore -l' < /opt/toeicgym/backups/ARCHIVE.dump > /dev/null
```

Pre-migration order: commit/push code; create and verify backup; connect the production tunnel only if the chosen local workflow requires it; run `npm run validate:mock-readiness`; run `npm run payments:preflight`; confirm checkout is DISABLED. Then deploy and run `npm run db:migrate` in the configured migrator environment. Drizzle applies every missing journal entry in order (`0000` through current `0015`), not only `0015`. Any migration failure stops activation. Re-run Full Mock readiness and payment preflight afterward. Never apply SQL files manually.

The first deployment intentionally has rotated credentials configured and all price variables unset. Smoke `/`, `/sign-in`, `/dashboard`, `/practice`, `/ranking`, `/pricing`, `/billing`, `/admin`, `/admin/challenges`, and `/admin/payments`; verify learning works, payment pages render “Chưa mở bán”/equivalent, no `0 VND` appears and no checkout can start.

### Webhook and price activation

After the disabled-checkout smoke passes, the human configures this exact URL in the payOS payment channel:

`https://toeicgym.net/api/payments/payos/webhook`

The code uses `https://toeicgym.net/billing/return` and `https://toeicgym.net/billing/cancel`. Redirects are UX-only; verified webhook/reconciliation is authoritative.

When payOS/Casso validates Webhook V2 it sends a signed sample. TOEICGym first verifies it with the official SDK; a correctly signed sample with no internal order is acknowledged without a database write and cannot activate Premium. Matched real orders still require the complete transactional database flow. HTTP `400 {"error":"invalid_webhook"}` means verification failed—check that the deployed runtime has the Checksum Key from the same payOS payment channel, with no whitespace/quoting corruption, then redeploy. After this validation-sample handling is deployed, HTTP `503 {"error":"webhook_processing_unavailable"}` indicates a matched-order processing/database failure (for example, migration `0015` is missing); inspect safe logs and migration health. Never bypass signature verification or paste the key into logs/chat. Configure the webhook only after migration and preflight succeed.

If the operator chooses 59,000 / 139,000 / 399,000 VND, place them respectively in `PREMIUM_30_PRICE_VND`, `PREMIUM_90_PRICE_VND`, and `PREMIUM_365_PRICE_VND` in Dokploy. These are decisions, not source defaults. Redeploy and run preflight again; require PAYOS, three configured credential indicators, three configured prices, Fake BLOCKED, checkout ENABLED and the HTTPS URLs above.

### Controlled human real-payment smoke

1. Sign in with a normal operator-controlled learner account.
2. Open `/pricing` or `/billing`; choose the lowest-priced 30-day product.
3. Confirm its displayed VND amount exactly matches configuration, then start checkout.
4. Record the non-secret TOEICGym order identifier/orderCode.
5. The human explicitly completes payment in their banking application.
6. Return to TOEICGym. If PENDING, do not create/pay another order; wait and refresh or use the existing Check again reconciliation action.
7. On `/billing`, require one PAID order with expected product, amount and paid timestamp, plus effective PREMIUM.
8. In Settings, require PREMIUM and the correct expiry.
9. In `/admin/payments`, require provider PAYOS, expected product/amount/status and created/paid timestamps. No secret or signature should appear.
10. Refresh repeatedly and confirm the expiry never extends again: one paid order, one PAYMENT-linked membership, one activation effect.
11. Confirm a normal learning page still works.

If bank payment succeeds but the order remains PENDING: do not pay again; allow a reasonable webhook interval; refresh Billing; use Check again for authoritative server reconciliation; inspect Admin Payments and bounded application logs; contact payOS support only if authoritative status remains unresolved. Never mark PAID, edit `payment_orders`, insert a membership, delete an event, or use direct SQL. A provider creation failure remains FAILED and transfers no entitlement; if money was actually sent, treat it as reconciliation/support work rather than starting a second payment.

Credential rotation: generate replacements in payOS, update only the Dokploy secret environment, redeploy/restart, run preflight, verify checkout/webhook behavior, then retire old credentials using payOS capability. Never store values in Git, logs, documentation, chat or tickets.

Application rollback must retain payment tables/events and continue accepting verified webhook reconciliation for already-created orders. Disable new checkout by unsetting prices before rollback when necessary; do not drop migration `0015` or payment history.
