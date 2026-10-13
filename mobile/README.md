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

Google sign-in uses Android Credential Manager through Nitro Google Sign-In.
Before each attempt the backend issues a 10-minute one-use nonce; the backend
then verifies the ID-token signature, audience, expiry, verified email and
nonce before issuing an opaque TOEIC GYM session. Configure the public OAuth
web client ID as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. The app does not use a
WebView, scrape browser cookies or bundle an OAuth client secret.

## Current V1 surface

- Home / Today's Workout
- Native Part 1–7 practice with grouped Listening/Reading content
- Server-persisted answers and authoritative submit/results
- Shared progress view
- Mistake Bank/remediation, Vocabulary SRS, streak and bounded progress views
- Settings, granular learning reminders, plan/trial status, Google Play purchase/restore, logout and Account & Data entry
- 24-hour private listening-audio cache and vocabulary-only offline review queue

Remote push delivery requires the EAS/FCM human actions documented in
`docs/task-48-native-retention.md`. Offline scored practice remains excluded;
store submission remains an owner-controlled release action.

The Android Play Billing client reads only server-approved product IDs and the
server-generated obfuscated account binding. Purchases and restores are
verified against Google Play on the backend before the client acknowledges the
transaction or refreshes entitlement. It never unlocks Premium locally. Play
Console products, service credentials and licensed-test builds are required for
end-to-end validation.
