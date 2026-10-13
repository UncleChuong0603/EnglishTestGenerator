# Android launch — human and external actions only

Date checked against current Google/Expo documentation: 2026-10-13

This is the remaining owner/editor/device/vendor checklist. Code-owned work is documented in `task-59-68-android-launch-completion.md`. Do not mark an item complete without retaining the listed evidence. Do not paste credentials, service-account JSON, purchase tokens or signing keys into tickets, chat or Git.

## 1. Approve and deploy the reviewed change set

Owner: repository/release owner

1. Review the local diff and the two launch reports.
2. Confirm migration `0057_import_review_audit.sql` is included before application rollout.
3. Approve a normal commit/push/deployment. Codex has intentionally not pushed or deployed.
4. Run the production migration through the normal deploy path, deploy web/API and the corrected backup/restore scripts, then run production health checks.
5. Retain the commit SHA, deployment ID, migration log and health-check result.

This approval must happen before the admin can store `IMPORT_REVIEW_COMPLETED` or the scheduled host can use the repaired media-backup script.

## 2. Review the 99 AI-assisted Mock Part 5 questions

Owner: qualified TOEIC editor with Admin `CONTENT_MANAGE`

1. Sign in to the deployed Admin and open the affected import batch reported by Task 58.
2. Select **Mở hàng đợi review**. Review every item; the queue includes published items.
3. For every question check TOEIC plausibility, grammar, exactly one defensible correct answer, distractor quality, difficulty/taxonomy, EN explanation, VI explanation and original-use/rights note.
4. If a published question is wrong, archive/withdraw it when allowed. If correction is required, clone it as Draft, correct and validate it, then publish only through the normal lifecycle. Re-run the Full Mock validator if mapped Mock content changes.
5. Only after all 99 decisions are complete, return to the batch, check the full-review attestation and select **Ghi nhận HUMAN_REVIEWED**.
6. Retain the editor name, date, batch key, list of corrected/withdrawn IDs, `IMPORT_REVIEW_COMPLETED` audit row and post-change Task 58 audit.

Never bulk-update `review_status` in SQL. The audited admin action is the evidence.

## 3. Run and adjudicate duplicate scans for Parts 1–7

Owner: TOEIC editor with Admin `CONTENT_READ` and `CONTENT_MANAGE`

1. Open `/admin/content/reports?type=DUPLICATE&status=OPEN`. Opening the unfiltered duplicate queue runs a current scan for all seven Parts and stores per-Part scan evidence.
2. Filter Part 1 through Part 7 one at a time and inspect every OPEN pair. Text similarity is only a lead; compare context, answer, transcript/passage and media.
3. Move each real issue to `IN_REVIEW`, correct or withdraw through the canonical content workflow, then mark `RESOLVED`. Mark a genuine false positive `DISMISSED`.
4. Reopen the duplicate queue after changes so all seven scan records reflect the final content version.
5. Retain a screenshot/export showing 7/7 Parts scanned, timestamps/counts and no unadjudicated blocking pair.

## 4. Editorially sample the rest of P1–P7

Owner: qualified TOEIC editor

1. Define and record a risk-based sample across every Part, both interface/explanation languages, every grouped type, all difficulty levels and Mock/Practice pools.
2. Include listening naturalness/transcript/audio alignment for P1–P4 and passage/question linkage for P6–P7.
3. Log each sampled ID and PASS/FIX/WITHDRAW decision; use Admin lifecycle actions for changes.
4. Re-run content readiness, duplicate scans and Full Mock validation after changes.

## 5. Finish production backup durability

Owner: infrastructure/backup owner

1. After the approved deployment, run the deployed `backup-media.sh` once manually and then verify the next scheduled run succeeds without temporary scripts.
2. Run `test-restore-media.sh <archive>` in an isolated directory and retain archive name, SHA-256, manifest totals and PASS output.
3. Choose an encrypted off-VPS backup destination and retention policy. Do not assume the legacy R2 destination still exists.
4. Provision least-privilege credentials in the host secret manager, copy one verified archive off the VPS and perform a second isolated restore from that copy.
5. Configure a real alert destination for backup/restore failure.
6. Reduce or expand disk usage so normal backups do not operate at the current ~90% threshold; monitor the next cycle.
7. Only after two-location recovery is proven, reconcile the 423 unreferenced media files against database ownership and import history. Produce an explicit deletion manifest and obtain destructive-action approval before cleanup.

## 6. Create the Google Play app and signing chain

Owner: Google Play Console account owner + Expo/EAS owner

1. Verify the Play developer identity/payments profile and create the app with package `net.toeicgym.app`.
2. If Play Console shows the device-verification task for a new personal account, the account owner must complete it in the Play Console mobile app on a non-rooted physical device running Android 10 or later.
3. In Expo/EAS, sign in to the owning organization and configure the project. Create/store Android upload credentials with `eas credentials`; do not export keys into the repo.
4. Build a signed preview APK for device QA, then a production AAB with the production profile. Record the EAS build URLs, artifact SHA-256, app version and version code.
5. Create the Play app first, assign the Google service-account key to the Android application identifier in EAS, then use `eas submit --platform android` or upload manually. Keep the first release on the Internal testing track with draft status until setup is complete.
6. In **Release → Setup → App integrity**, record both the upload-certificate SHA-1 and Play App Signing SHA-1.
7. Keep the initial submission as draft/internal. Production promotion needs a separate explicit approval.

The project targets Android API 36 through Expo SDK 57, matching Google Play's stated 31 August 2026 target requirement for app updates.

## 7. Configure native Google Sign-In and test it end to end

Owner: Google Cloud OAuth owner + EAS owner

1. In the intended Google Cloud project, configure the OAuth consent/branding screen and support/privacy domains.
2. Create Android OAuth clients for `net.toeicgym.app` using both certificate fingerprints: upload SHA-1 and Play App Signing SHA-1. This supports EAS-installed and Play-installed signed builds.
3. Create or select a Web OAuth client. Set its client ID as backend `GOOGLE_CLIENT_ID` and EAS environment variable `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. A client ID is public; never put a client secret in the mobile app.
4. Deploy the backend configuration, rebuild, and install the app from Play Internal testing.
5. Test new Google account creation, returning login, logout/relogin, cancelled chooser, offline error, expired/replayed nonce, disabled user and an email already owned by a password account. Confirm the collision requires explicit linking and never silently takes over the account.
6. Retain redacted API logs/security events and screen recording. Do not retain ID tokens.

## 8. Configure Google Play Billing and lifecycle notifications

Owner: Play Console payments owner + Google Cloud owner + backend operator

1. Complete the Play payments profile and merchant setup.
2. Create subscription products/base plans whose IDs exactly match the backend allowlist. Activate the intended country/price offers; do not hard-code displayed prices in the app.
3. Create a least-privilege Google service account, grant the required Play Developer API permissions for this app, and store its JSON only as the backend secret `GOOGLE_APPLICATION_CREDENTIALS_JSON` (or the deployment platform's equivalent file secret).
4. Configure Real-time developer notifications with Google Cloud Pub/Sub, grant the documented publisher/subscriber permissions, and point the subscription/push path at the deployed Google notification endpoint.
5. Add license testers and publish the signed build to Internal testing. Install it from Play; sideloading does not prove Play purchase behavior.
6. Exercise purchase success, user cancellation, pending payment, duplicate callback, restore after reinstall, renewal, cancellation with access until expiry, grace/account hold where configured, expiry, refund and revoke.
7. For every case verify server purchase records/events, obfuscated account binding, acknowledgement only after server verification and the same Premium entitlement on Android and web.
8. Retain redacted order IDs/test timestamps and backend event states. Never retain purchase tokens in the report.

## 9. Configure Android push delivery

Owner: Firebase/EAS owner + backend operator

1. Register Android package `net.toeicgym.app` in the intended Firebase project.
2. Store `google-services.json` as an EAS file secret and expose only its private file path as `GOOGLE_SERVICES_JSON` during Android builds. Do not commit the file and do not use an `EXPO_PUBLIC_` variable.
3. Configure the Firebase Cloud Messaging v1 service-account credential through EAS credentials. Configure `EXPO_PUSH_ACCESS_TOKEN` on the server only if enhanced Expo push security is enabled.
4. Rebuild the signed app and test on a physical device: permission denied, permission allowed, per-reminder opt-out, token registration/rotation, reinstall, logout/device removal, invalid-token cleanup and receipt processing.
5. Verify lock-screen payloads contain no answers, email addresses, scores or other sensitive learning/account content.
6. Retain delivery/receipt IDs and screenshots with tokens redacted.

## 10. Complete Play policy and listing forms

Owner: legal/privacy/business owner + Play Console owner

1. Review the deployed public URLs: `https://toeicgym.net/privacy`, `/terms`, `/support`, and `/delete-account`. Confirm the legal entity/contact and actual data practices are accurate.
2. In **App content**, complete Privacy policy, Data safety, Account deletion, App access, Target audience/content, Content rating, Ads declaration and any News/Health/Financial declarations that Play shows for the selected category.
3. Reconcile Data safety against the actual SDKs and server behavior: account/profile data, authentication, purchase records, learning activity/analytics, crash/diagnostic data, push token and deletion/retention behavior. Do not copy the draft blindly.
4. Declare that digital Premium purchases use Google Play Billing unless the account is enrolled in an applicable alternative-billing program.
5. Provide reviewer credentials/instructions for authenticated content without exposing a real learner or administrator account.
6. Upload bilingual listing copy, icon, feature graphic and signed-build phone screenshots. Avoid “official TOEIC” or ETS endorsement claims.
7. Save every declaration as draft and have the responsible owner sign off before submission.

## 11. Run physical Android release QA

Owner: QA tester with at least one real Android phone; preferably low/mid/high configurations

1. Install the preview APK for broad QA, then repeat release-critical checks using the Play Internal build.
2. Test fresh install, update, cold/warm start, background/foreground, airplane mode, slow network and interrupted requests.
3. Verify P1–P4 audio start/pause/interruption/retry, P1 images and retry, P3/P4 three-question grouping and navigation.
4. Verify P5 answers/explanations, P6 four-question documents and P7 single/double/triple long-passage scrolling without clipped content.
5. Verify wrong answer → reason → focused three-question drill → recheck → mastered; challenge → signup → exact result → first workout; Full Mock pause/resume/result.
6. Test Google Sign-In, purchase/pending/restore and notification flows from the prior sections.
7. Set Android font/display scaling to the largest supported values and run TalkBack. Confirm reading order, labels, focus, touch targets and that audio/image errors announce an actionable retry.
8. Capture device model, Android version, build SHA/version code, case result and screenshot/video for failures. A simulator alone does not close this gate.

## 12. Closed test and final launch decision

Owner: Play Console owner + product owner

1. Start the closed test only after Internal testing and physical QA are green.
2. If this is a personal developer account created after 13 November 2023, recruit at least 12 testers who remain opted in continuously for at least 14 days, then apply for production access in Play Console. Follow the Console if it imposes a stricter account-specific requirement.
3. During testing, monitor crashes/ANRs, sign-in failures, billing verification/RTDN, push receipts, support tickets and the learning funnel.
4. After deployment, wait for at least 20 eligible learners with sufficient maturity. Measure challenge → signup → exact first workout, first workout → second meaningful learning day, and reason → remediation → recheck → mastered. Do not claim retention improvement before that cohort exists.
5. Re-run content readiness, Full Mock, media integrity, backup/restore and production health checks against the exact release candidate.
6. Product, editorial, privacy, operations and release owners sign the evidence bundle. Promote to production only after an explicit final approval.

## Official references

- Google Play app setup: https://support.google.com/googleplay/android-developer/answer/9859152
- New-account physical-device verification: https://support.google.com/googleplay/android-developer/answer/14316361
- Target API level: https://support.google.com/googleplay/android-developer/answer/11926878
- Personal-account testing requirement: https://support.google.com/googleplay/android-developer/answer/14151465
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- Billing preparation, integration, backend and subscriptions: https://developer.android.com/google/play/billing/getting-ready, https://developer.android.com/google/play/billing/integrate, https://developer.android.com/google/play/billing/backend, https://developer.android.com/google/play/billing/lifecycle/subscriptions
- RTDN: https://developer.android.com/google/play/billing/rtdn-reference
- Expo Google authentication: https://docs.expo.dev/guides/google-authentication/
- Android Sign in with Google: https://developer.android.com/identity/sign-in/credential-manager-siwg
- Expo IAP: https://docs.expo.dev/guides/in-app-purchases/
- EAS Build/Submit: https://docs.expo.dev/build/setup/, https://docs.expo.dev/submit/android/
- Expo FCM credentials: https://docs.expo.dev/push-notifications/fcm-credentials/
