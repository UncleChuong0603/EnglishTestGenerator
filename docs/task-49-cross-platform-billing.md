# Task 49 — Cross-platform Premium and billing

## One entitlement model

`user_plan_memberships` remains the only source used by the effective-plan and quota resolver. Its durable sources are now `PAYOS`, `APPLE_IAP`, `GOOGLE_PLAY`, `TRIAL`, `PROMOTION`, and `ADMIN`. Migration `0053_cross_platform_billing` relabels existing `PAYMENT` history to `PAYOS` and `MANUAL` history to `ADMIN`; it does not delete or recreate a grant.

payOS remains the web checkout provider. Apple and Google records use `store_purchases` plus the append-only, provider-event-deduplicated `store_purchase_events` ledger. Renewals append a membership window; expiration naturally removes effective access; verified refund/revoke events mark the related windows revoked. A trial-to-paid analytics event is shared by payOS and native stores. Active grants from any platform resolve to the same Premium capabilities, so an account sees the same entitlement on web, iOS and Android.

The account UI distinguishes `REVOKED` from natural `EXPIRED`. Learning history is never deleted by expiry, refund, or revocation.

## Trust boundaries

- The mobile client never sends an amount, duration, expiry, entitlement, or Premium flag.
- Apple proofs are verified with Apple's official App Store Server Node library and Apple root certificates. App Account Token must equal the authenticated TOEICGym user UUID.
- Google proofs are fetched from `purchases.subscriptionsv2.get` with the server service account. The returned obfuscated external account ID must equal TOEICGym's server-derived account binding.
- Raw signed transactions and Google purchase tokens are not persisted. Only an HMAC reference, provider transaction facts and non-secret lifecycle metadata are stored.
- Apple Notification V2 JWS and Google Pub/Sub OIDC identity are verified before notification processing. `(provider, provider_event_id)` makes retries safe. An out-of-order older event cannot shorten a newer verified purchase window.
- Restore uses the same server verification and ownership checks as purchase. A store proof already owned by another TOEICGym account is rejected.

Authenticated mobile foundation endpoints:

- `GET /api/v1/billing/store/config`
- `POST /api/v1/billing/store/verify` with an `Idempotency-Key`

Provider notification endpoints:

- `POST /api/store/apple/notifications`
- `POST /api/store/google/notifications`

## HUMAN ACTION — native stores are intentionally disabled

No App Store Connect application/product credentials, Google Play product/service-account credentials, production bundle/package IDs, or native purchase SDK configuration are present in the repository. Therefore no sandbox purchase was fabricated or run.

Before enabling iOS:

1. Set the final Expo/EAS iOS bundle identifier and App Store app ID.
2. Create the Premium subscription product(s) in App Store Connect and pass their IDs in `APPLE_IAP_PRODUCT_IDS`.
3. Base64-encode the required Apple root CA DER certificates, separated by `;`, in `APPLE_ROOT_CA_B64`; set `APPLE_BUNDLE_ID` and `APPLE_APP_ID`.
4. Configure App Store Server Notifications V2 to `https://toeicgym.net/api/store/apple/notifications` for sandbox and production.
5. Add the native StoreKit purchase client, always setting the server-provided `appAccountToken`, then test purchase, restore, renewal, expiry and refund in sandbox/TestFlight.

Before enabling Android:

1. Set the final Android package name and create the Premium subscription/base plan in Play Console.
2. Grant a least-privilege service account access to the Play Developer API. Base64-encode its JSON as `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_B64`; set `GOOGLE_PLAY_PACKAGE_NAME` and `GOOGLE_PLAY_PRODUCT_IDS`.
3. Configure Real-time Developer Notifications through Pub/Sub push to `https://toeicgym.net/api/store/google/notifications`, using authenticated push. Set its exact audience and service-account email in `GOOGLE_PLAY_RTDN_AUDIENCE` and `GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL`.
4. Add the native Play Billing client, always setting the server-provided obfuscated account ID, acknowledge purchases in the supported client/server flow, then test purchase, restore, renewal, expiry, revoke and refund with license testers.

Do not set a partial environment group: startup validation rejects partially configured Apple or Google verification.
