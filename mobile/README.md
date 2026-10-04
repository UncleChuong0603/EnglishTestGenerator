# TOEIC GYM Mobile V1

Expo/React Native client for the TOEIC GYM mobile vertical slice. It uses the
same `/api/v1` services, PostgreSQL data, entitlements, recommendations and
learning history as the web app. It does not contain a mobile database or
server business logic.

## Requirements

- Node.js and npm supported by Expo SDK 57
- Expo Go or a development build for a physical device
- Android Studio/SDK for an Android emulator (optional)
- The root web app running when testing against a local API

## API environments

The client reads only the public, non-secret variable `EXPO_PUBLIC_API_URL`.
Never put credentials, signing secrets or privileged API keys in Expo env
files because public Expo variables are included in the bundle.

| Environment | Configuration |
| --- | --- |
| Local Android emulator | Default in development: `http://10.0.2.2:3000/api/v1` |
| Local physical device | Set `EXPO_PUBLIC_API_URL=http://<LAN-IP>:3000/api/v1` in `.env.local` |
| Staging | Set `EXPO_PUBLIC_API_URL=https://<staging-host>/api/v1` in the staging build profile |
| Production | Default release URL: `https://toeicgym.net/api/v1` |

Release builds reject a non-HTTPS API URL. Copy `.env.example` to
`.env.local` only when an override is needed.

## Commands

```bash
npm install
npm start
npm run android
npm run web
npm run check
```

`npm run check` runs lint, TypeScript, unit tests and an Android production
bundle export. `npx expo-doctor` validates Expo package compatibility.

## Authentication and retry behavior

- Email/password login returns an opaque server session token.
- The token is stored with `expo-secure-store`, never AsyncStorage.
- App launch validates the token with `/me`; an explicit `UNAUTHENTICATED`
  response clears it. A temporary offline launch does not destroy it.
- Logout requests server revocation and always clears the local credential.
- Practice create, answer and submit requests use a fresh idempotency key per
  user action and reuse that key for the automatic network/timeout retry.

Google sign-in is intentionally deferred until the backend has a native PKCE
exchange. The app does not use WebView login, browser-cookie scraping,
Firebase or Supabase.

## Current V1 surface

- Home / Today's Workout
- Native Part 1–7 practice with grouped Listening/Reading content
- Server-persisted answers and authoritative submit/results
- Shared progress view
- Mistake Bank/remediation, Vocabulary SRS, streak and bounded progress views
- Settings, granular learning reminders, plan/trial status, logout and Account & Data entry
- 24-hour private listening-audio cache and vocabulary-only offline review queue

Remote push delivery requires the EAS/APNs/FCM human actions documented in
`docs/task-48-native-retention.md`. Offline scored practice remains excluded;
native store checkout and store submission are not part of this mobile release.

The mobile API now exposes server-owned Apple/Google product configuration and
purchase/restore verification contracts. A later native StoreKit/Play Billing
client must use the returned account binding and must never unlock Premium
locally. Store console, credential, notification and sandbox actions are listed
in `docs/task-49-cross-platform-billing.md`.
