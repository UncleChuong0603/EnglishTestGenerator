# Task 48 — Native retention

## Shipped scope

- Push is explicit opt-in and has separate Today’s Workout, vocabulary-due, unresolved-mistake, weekly-review and real-streak preferences. The server selects at most one useful message per device per Vietnam-local day.
- Push tokens are server-owned records. Registration refuses a token owned by another account; logout/revoke removes the owned device. Expo tickets are persisted, receipts are checked after 15 minutes, and `DeviceNotRegistered` tokens are removed.
- Notification navigation uses a fixed allowlist for workout, Mistake Bank/remediation, vocabulary, weekly review and owned results. Authenticated routes use Expo Router protected routes; result and media APIs re-check account ownership.
- Listening media is served by opaque media UUID through a bearer-authenticated endpoint. Storage keys and signed storage paths are not sent to mobile. Audio supports byte ranges, a private 24-hour app-cache and cleanup. Task 52 intentionally changed playback to foreground-only so the release does not declare or request background audio service behavior.
- Limited offline mode is intentionally vocabulary-only. Due cards are cached in app-private storage and reviews are queued with stable idempotency keys. On reconnect the server schedules SRS; an authoritative conflict removes the stale queued mutation. Logout clears cached cards, pending mutations and audio.

Offline practice is not included. Shipping answer keys, entitlement decisions or final scoring to the device would weaken integrity; the server remains authoritative for all practice.

## Push cadence and content policy

The scheduler runs every 15 minutes, but the database uniqueness constraint allows only one selected reminder kind per device/day. Priority is weekly review (Sunday), vocabulary due, unresolved mistakes, then Today’s Workout. Streak text is included only when the stored current streak is greater than zero. Copy does not claim scores, deadlines or urgency that the backend has not observed.

## Human actions before real remote-push QA

The repository has no EAS project ID, application identifiers, APNs credential or FCM V1 credential. Before a development/release build can receive remote push:

1. create/link the EAS project and place its project ID in app config;
2. choose permanent iOS bundle and Android package identifiers;
3. configure APNs and FCM V1 credentials in EAS;
4. optionally enable Expo Push enhanced security and set server-only `EXPO_PUSH_ACCESS_TOKEN` in Dokploy;
5. make a development build (remote push is unavailable in Expo Go on Android), then test permission, delivery, tap navigation and uninstall/token invalidation on physical devices;
6. add Apple/Android domain association files before claiming HTTPS Universal Links/App Links. The existing `toeicgym://` custom scheme and Expo Router paths are ready now.

No production learner or synthetic push token is created for verification.

## QA

Run root typecheck/lint/tests/build, `mobile/npm run check`, `npx expo-doctor`, and the isolated PostgreSQL 17 migration matrix. Device push delivery remains a recorded human-action gate until the credentials and development build above exist.
