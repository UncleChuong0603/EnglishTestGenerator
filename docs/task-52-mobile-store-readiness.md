# Task 52 — Mobile device QA, store compliance and privacy readiness

Date: 2026-10-04

App: TOEIC GYM 1.0.0

Package identity: `net.toeicgym.app` on Android and iOS

## Outcome

The code-level release foundations are implemented: fixed app identifiers/build
numbers, foreground-only learning audio, native authenticated data export, native
account deletion, public deletion instructions, current privacy disclosures and
store-declaration drafts. The app does not request microphone, camera, contacts,
location or photo-library access. Generated Android permissions contain only
`android.permission.MODIFY_AUDIO_SETTINGS`.

Store submission is **not yet approved**. Physical-device/accessibility QA,
production push/store credentials, final legal/operator review and a 1024×1024
store icon remain required. This document does not represent unavailable device
tests as passed.

## App identity and assets

| Field | Value / status |
| --- | --- |
| Display name | TOEIC GYM |
| Version | 1.0.0 |
| iOS bundle / build | `net.toeicgym.app` / `1` |
| Android package / version code | `net.toeicgym.app` / `1` |
| Custom scheme | `toeicgym` |
| Orientation / appearance | Portrait; iPhone-only on iOS; light interface only |
| Icon | Current brand artwork is wired, but the source is 512×512; replace with an approved 1024×1024 source before submission |
| Splash | Current mark on `#f7f6f1`; source mark is 128×128 and must be visually reviewed on devices |
| Adaptive icon | Foreground mark plus `#031E3F` background; Android monochrome asset configured |

Version/build increments are an operator responsibility for every submitted build.
Do not change package identifiers after store records are created.

## Account deletion and export

- `GET /api/v1/account/data-export` derives the owner from the bearer session,
  rate-limits the operation and returns the existing allowlisted export boundary.
- The app writes the JSON payload only to its private cache, then opens the native
  share sheet so the learner chooses a destination.
- `POST /api/v1/account/delete` requires the signed-in email and explicit
  acknowledgement. The native UI adds a second destructive system confirmation.
- Successful deletion clears the SecureStore session token, push-device reference,
  offline vocabulary queue/cache and listening cache before showing the completion
  screen. Every server session is invalidated by the shared deletion transaction.
- A public, reachable web resource is available at
  `https://toeicgym.net/delete-account`; signed-in web users can complete deletion
  at Settings → Data.

This behavior follows [Apple's account-deletion requirement](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
and provides the web resource requested by the
[Google Play account-deletion policy](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en-EN).

## Device and accessibility QA evidence

| Target | Result | Evidence / next action |
| --- | --- | --- |
| Android physical device | **Not executed** | No controllable USB/network device was available |
| Android emulator | **Not executed** | `adb` and `emulator` are absent; `%LOCALAPPDATA%\Android\Sdk` does not exist |
| iOS simulator | **Not executable on host** | Current host is Windows; no Xcode/simulator |
| Physical iPhone | **Not executed** | No controllable device or signed build was available |
| Expo configuration | Pass | Public config resolves both identifiers/builds and only `MODIFY_AUDIO_SETTINGS` on Android |
| Expo dependency compatibility | Pass | `expo-doctor`: 21/21 checks |
| Native TypeScript/lint/unit tests | Pass when recorded in Task 52 QA | Run again on the release commit |
| Android JS export | Pass when recorded in Task 52 QA | This is a bundle check, not an installed-device test |

Before claiming any App Store accessibility nutrition label, test every common task
on the submitted build as required by
[Apple's accessibility-label guidance](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels/).
Required manual matrix:

1. 375, 768, 1024 and 1440 px-equivalent layouts where applicable, both Vietnamese
   and English, default and largest practical system text sizes.
2. TalkBack and VoiceOver: first launch, sign-in, tab navigation, start/answer/submit
   practice, audio controls, export, deletion confirmation, notification settings
   and sign-out. Check focus order, labels, roles and announcements.
3. Keyboard open/close, autofill, submit-key behavior and error focus on sign-in and
   account deletion; verify no control is hidden by the keyboard or safe area.
4. Foreground audio interruption by phone call/other media, Bluetooth route changes,
   screen lock and background/foreground transitions. Task 52 intentionally disables
   background playback; audio must not continue as a background service.
5. Airplane mode and mid-request network loss for sign-in, practice save/submit,
   vocabulary queue, export and deletion. A timed-out deletion must be reconciled by
   signing in again before retrying.
6. `toeicgym://` navigation and notification tap targets. Only the existing
   allowlisted notification destinations may open. Universal Links/App Links are not
   configured and must not be claimed.
7. Push opt-in, denial, token rotation, sign-out revocation and invalid-token cleanup
   using production APNs/FCM/Expo credentials.
8. SecureStore persistence across restart, clearing after sign-out/deletion and no
   token exposure in logs, URLs, AsyncStorage or screenshots.
9. Light appearance only. Dark mode is not supported or declared in version 1.0.0.

## Actual data inventory and retention

| Data | Purpose | Implemented retention / deletion behavior |
| --- | --- | --- |
| Email, optional name/avatar, preferences, auth method | Account and personalization | While active; direct identifiers removed on account deletion |
| Password credential and session token | Authentication | Password is hashed server-side; raw mobile token is SecureStore-only and server session validity is 30 days unless revoked/deleted |
| Verification/reset token records | Account security | Verification is valid 24 hours; password reset 60 minutes; an expired-row purge schedule is not yet implemented |
| Learning goals, answers, response times, history, mastery, vocabulary, streaks | Learning features and recommendations | While active; deleted with the account |
| Dictation input | Immediate evaluation | Raw learner-entered answer is not retained in dictation history |
| First-party product/security events | Operation, security and product improvement | Actor data is scrubbed on deletion; a general active-account purge window is not yet codified |
| Push token/preferences/deliveries | Opted-in learning reminders | Token is revoked locally on sign-out and server rows are removed on account deletion; user can disable delivery without deleting the token; delivery-log TTL is not yet codified |
| Listening cache | Faster replay | Private app cache, max age 24 hours; cleared on sign-out/deletion |
| Vocabulary cache and offline review queue | Limited offline review | Stored in AsyncStorage until refreshed/processed or cleared by sign-out/deletion; no time TTL |
| Payment/order/store-purchase facts | Entitlement, accounting and audit | Direct identifiers/checkout URL removed at deletion; facts remain under a disabled pseudonymous account reference; retention duration requires owner/legal approval |
| Database backup | Recovery | Deployment backup script deletes local backup files older than 14 days; off-server backup policy and verified deletion procedure still require operator approval |
| Provider logs | Email, Google auth, push and payment delivery | Outside the database deletion transaction; review each provider's retention/deletion controls before submission |

The public privacy notice now documents these categories and limitations in English
and Vietnamese. It is an implementation disclosure, not a substitute for legal advice.
The [Apple review privacy rules](https://developer.apple.com/app-store/review/guidelines/uk/)
and [Google Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-en)
must be rechecked against the final production build and every third-party SDK.

## Store declaration drafts — operator must verify in console

### Apple privacy details

Suggested categories for the current build:

- Contact Info: email address and optional name, linked to the user, for app
  functionality/account management and developer communications.
- Identifiers: user ID and push/device token, linked to the user, for app
  functionality and notifications.
- Purchases: purchase history, linked to the user, for app functionality.
- User Content: support messages and question reports, linked to the user, for app
  functionality/customer support.
- Usage Data: product interaction, linked to the user, for app functionality and
  first-party analytics.
- No advertising data, third-party advertising, cross-app tracking, precise/coarse
  location, contacts, microphone recordings or crash-reporting SDK in this build.

Do not claim VoiceOver, Larger Text, Dark Interface or another accessibility feature
until the physical-device common-task evaluation is complete. Fill App Store Connect
from Apple's current [privacy-details workflow](https://developer.apple.com/go/?id=info-1),
not from this draft alone.

### Google Play Data safety

Candidate collected types: email/name/user ID, purchase history, app interactions,
support/question-report content and push/device identifier. Collection is for account
management, core learning functionality, opted-in notifications, security/support
and first-party analytics. Production transport is HTTPS. Account deletion is
available in-app and at `https://toeicgym.net/delete-account`.

No data is sold and no advertising SDK is present. Whether each service-provider
transfer counts as “sharing” must be answered using Google's current definitions and
the final provider contracts. Mark required versus optional per feature: account
email/user ID are required; profile name/avatar, Google link, support content and
push token are optional; purchase history exists only when a purchase occurs.

### Age/content rating and review notes

- Educational TOEIC practice; no violence, sexual content, drugs, gambling or
  unrestricted chat is implemented.
- Public rankings can display a learner-selected display name according to their
  visibility choice; disclose this limited user-provided content in the rating
  questionnaire rather than guessing the final rating.
- The stores assign the rating from the completed questionnaire. Follow the current
  [Google content-rating process](https://support.google.com/googleplay/android-developer/answer/9859655?hl=en).
- Review notes should explain test credentials, sign-in, practice/audio, opt-in push,
  export/deletion paths, the absence of native external-payment prompts, and any
  server feature flags. Credentials and store IDs belong to Task 53 and must not be
  committed.

## Dependency and security audit

- Web production dependency audit: 0 vulnerabilities.
- Mobile production dependency audit: 31 findings (19 high, 12 moderate, 0 critical).
  They are currently reported through the Expo/Metro/React Native build graph,
  including `node-forge`, `braces`/`micromatch`, Metro packages,
  `decode-uri-component`/`query-string`, `uuid` and `xcode`.
- npm's proposed remediations include incompatible forced downgrades such as Expo 44,
  React Native 0.72 or mismatched Expo Router/Sharing versions. No
  `npm audit fix --force` was applied. Expo SDK 57 compatibility is confirmed by
  `expo-doctor`; reassess advisories and upgrade through an Expo-supported SDK patch
  or release, not an unsafe forced downgrade.
- No secrets belong in app config, source, review notes or committed EAS files.

## Remaining P0 release gates

- Complete and record the physical Android and iPhone matrix above.
- Produce/approve a 1024×1024 store icon and visually validate all splash/adaptive
  variants.
- Obtain Apple/Google/Expo signing and notification credentials and verify push.
- Approve external-provider, backup and payment retention with the operator/legal
  reviewer; update disclosures if the final answer changes.
- Complete App Store privacy/accessibility forms, Google Data safety/content rating,
  reviewer credentials and localized store metadata against the actual binary.
- Re-run dependency audit immediately before building and record accepted residual
  risk with an owner and upgrade date.
