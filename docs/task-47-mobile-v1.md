# Task 47 — Expo mobile v1 completion

## Native learner scope

The Expo app now exposes the supported learner journey against the same `/api/v1` services and database as web:

- email/password sign-in, dashboard, Today’s Workout, Road to Target, Weekly Plan and streak;
- native Part 1–7 practice selection, grouped questions, listening audio, images, submit and results;
- explanations and transcripts only in the submitted-result projection;
- Mistake Bank, reason capture, focused remediation, vocabulary due-list/review and server-owned SRS scheduling;
- progress summaries with bounded native bars, plan/trial status, interface language, Account & Data entry and sign-out.

Admin, CMS, blog, payment administration and the full mock UX remain web-only because they are not suitable for this mobile learner release.

## Authentication boundary

Google native sign-in is intentionally deferred. The backend does not yet expose a dedicated authorization-code + PKCE exchange contract for installed apps. The Expo app does not use a WebView, copy browser cookies or repurpose the web callback. Email/password authentication remains fully native, with the bearer session stored in `expo-secure-store`.

## Cross-platform source of truth

Practice selection/scoring, mistake mastery, remediation, vocabulary scheduling, progress, streaks and entitlement checks remain server-owned. Mobile contains presentation and interaction state only, so an action completed on either client appears through the same account projections on the other client.

## Release checks

Run from the repository root:

```text
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Run from `mobile/`:

```text
npm run check
npx expo-doctor
```

`npm run check` includes TypeScript, ESLint, Vitest and an Android Expo export. A physical-device or emulator smoke test should be recorded when an Android target is attached; absence of an attached target is reported, not simulated.
