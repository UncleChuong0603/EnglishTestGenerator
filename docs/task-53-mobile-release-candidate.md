# Task 53 — Mobile release candidate and store submission

Date: 2026-10-04

## Outcome

The repository is prepared for authenticated EAS builds and an internal-store
submission, but no release candidate binary was built or submitted in this task.
The current workstation has no Expo session or token, no Google Play or App Store
Connect credentials, no Android SDK/device, and no macOS/Xcode environment.

Do not describe this release as built, signed, uploaded, submitted, or approved until
the corresponding EAS and store consoles show those states.

## Configuration prepared

`mobile/eas.json` defines these deliberate release lanes:

| Profile | Distribution | Android output | Purpose |
| --- | --- | --- | --- |
| `development` | Internal | Development client | Native-module development only |
| `preview` | Internal | APK | Installable device QA candidate |
| `production` | Store | AAB by default | Signed store candidate |

The production Android submit profile targets the `internal` track with `draft`
status. It must not create a public production rollout. iOS upload should go to
TestFlight first.

Signing material is intentionally absent from Git. EAS-managed credentials are the
preferred starting point; locally managed keystores, provisioning profiles, API
keys, and passwords must stay outside the repository and secret manager logs.

## Store package prepared

- Localized `vi-VN` and `en-US` title, subtitle, descriptions, release notes, URLs,
  and reviewer instructions live under `mobile/store/listing/`.
- Google Play feature graphics are exact 1024 × 500 RGB PNGs under
  `mobile/store/assets/`; their reproducible HTML source is stored alongside them.
- App icon configuration and public privacy, support, and account-deletion links are
  in place from Task 52.
- No store screenshots were fabricated. `mobile/store/screenshots/README.md` lists
  the scenes to capture from a signed preview/release binary after device QA.
- The existing 512 × 512 icon is suitable for Google Play. Apple submission still
  needs an approved 1024 × 1024 source asset with no transparency.

## Checks performed

- `npx eas-cli@latest whoami --non-interactive` → `Not logged in`.
- `npx eas-cli@latest config --platform android --profile production --non-interactive`
  → blocked because an Expo account is required.
- Store metadata limits, public URLs, feature-graphic dimensions, and PNG alpha mode
  are covered by automated tests.
- JavaScript export can validate bundle generation, but it is not a signed binary
  and must not be used as release-binary evidence.

## HUMAN ACTION — authenticated release sequence

1. Sign in from a trusted operator workstation with `npx eas-cli@latest login`, then
   run `npx eas-cli@latest init` in `mobile/`. The generated EAS project ID may be
   committed; tokens and credentials may not.
2. Confirm active Apple Developer and Google Play Console memberships and create the
   app records for `net.toeicgym.app`.
3. Configure EAS-managed Android and iOS credentials. If credentials are supplied
   manually, keep the Android keystore, passwords, certificates, provisioning
   profiles, App Store Connect API key, and Google service-account JSON outside Git.
4. Build a preview APK with
   `npx eas-cli@latest build --platform android --profile preview`. Install that exact
   artifact on a physical Android device and complete the Task 50 regression matrix.
5. Build and test the corresponding iOS preview on a registered device through EAS.
   A Windows workstation cannot run the iOS Simulator; use a physical iPhone or a
   macOS/Xcode operator environment.
6. Capture truthful VI and EN store screenshots from the signed candidate, with no
   personal data or fabricated scores. Add the approved 1024 × 1024 Apple icon.
7. Complete Google Play Data safety/content declarations and Apple App Privacy,
   export compliance, age rating, review-contact, and review-account fields using the
   actual production behavior.
8. Build signed production artifacts with
   `npx eas-cli@latest build --platform all --profile production`. Record both EAS
   build URLs and download/check the exact AAB/IPA artifacts.
9. Submit Android only to the internal track as a draft and upload iOS to TestFlight:
   `npx eas-cli@latest submit --platform android --profile production --latest` and
   `npx eas-cli@latest submit --platform ios --profile production --latest`.
10. Verify processing and installation from Play internal testing/TestFlight. Record
    store confirmation IDs, test accounts, binary hashes, and the final device QA
    evidence before requesting review or promoting any rollout.

No command in this checklist authorizes a public release. Promotion beyond internal
testing/TestFlight is a separate human decision after release-candidate verification.

## Primary references

- [EAS build profiles](https://docs.expo.dev/build/eas-json/)
- [App signing credentials](https://docs.expo.dev/app-signing/app-credentials/)
- [EAS Submit](https://docs.expo.dev/deploy/submit-to-app-stores/)
- [Submit to Google Play](https://docs.expo.dev/submit/android/)
- [Submit to TestFlight](https://docs.expo.dev/submit/testflight/)
- [Google Play preview asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
