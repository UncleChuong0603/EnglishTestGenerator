# Task 57 — Day-1 to Day-2 retention loop

Date: 2026-10-11

## Result

**Task status: PARTIAL — the result-to-next-step UX is implemented and tested; a new
decision-grade cohort and preview-exposure instrumentation do not yet exist.**

No retention improvement is claimed. The production baseline is still 0 of 26 mature
eligible learners reaching a second meaningful learning day.

## Verified problem

- Web results recalculated a server-owned recommendation after submission, but the
  repeat action was visually primary and competed with the next useful workout.
- Native results placed only a generic Home action after a potentially long answer
  review. The next session was not explained near the completion summary.
- Native Home sent a learner with a completed daily goal to Progress even when the
  canonical dashboard response reported unresolved mistakes.
- The canonical recommendation, scoring, Mistake Bank and entitlement boundaries were
  already sufficient; no new recommendation engine or client-owned learning rule was
  needed.

## Implemented change

- Added a bilingual web next-step explanation immediately after authenticated Reading
  and Listening results. It uses the actual incorrect count, explains that the next
  recommendation was recalculated from saved evidence and falls back to the real
  Dashboard route when no recommendation is available.
- Demoted “practice this type again” when a server recommendation exists, leaving the
  recommendation card as the single strongest learning action.
- Added the same near-summary handoff to the native result screen with one 48dp primary
  action to the learner Home screen.
- Native Home now prioritizes, in order: resume an unfinished valid session; review
  canonical unresolved mistakes after completing the daily goal; view progress when
  the goal is complete with nothing unresolved; otherwise request Today's Workout
  from the server.
- A consumed Today's Workout quota no longer disables a post-goal Mistake Bank or
  Progress action. Quotas, scoring, selection and entitlement values are unchanged.
- Repaired the baseline migration invariant test so future migrations do not leave the
  full suite red through a hard-coded old terminal migration.

## Measurement contract

- **Meaningful learning day:** an eligible signed-in learner submits ordinary Practice,
  Today's Workout or mistake review with at least one actual answer, grouped in
  `Asia/Ho_Chi_Minh`; diagnostics, mocks, challenges and demos are excluded.
- **Activation:** the learner reaches their first meaningful learning day.
- **Day-2 return:** an activated learner reaches a meaningful session on a second
  distinct product day. It is not “opened the app the next calendar date.”
- **First workout completion:** the learner submits a `recommended` practice with at
  least one actual answer. Challenge attribution additionally requires that this occur
  after the actor-linked signup event.
- **Remediation/recheck completion:** a remediation-linked practice is submitted with
  a real answer; mastery is counted only when the canonical later mastery record is
  `MASTERED`, not when a lesson or drill is merely opened.

The next checkpoint should use at least 20 newly mature eligible learners after this
change. Report absolute counts below 20. Compare Day-1 completion → second learning
day and the challenge signup → first-workout stage. Do not attribute causality from
this UI change alone. A privacy-safe `next_session_preview` exposure signal is still a
measurement gap; adding it requires a precise served-versus-visible definition across
web and native rather than writing analytics from a GET request.

## Files changed

- `src/components/practice/next-learning-step.tsx`
- `src/components/practice/next-learning-step.test.tsx`
- `src/app/practice/[sessionId]/results/page.tsx`
- `src/app/practice/[sessionId]/results/listening-result.tsx`
- `mobile/src/app/result/[id].tsx`
- `mobile/src/app/(tabs)/index.tsx`
- `mobile/src/lib/model.ts`
- `mobile/src/lib/model.test.ts`
- `src/db/question-issue-reports-migration.test.ts`
- `e2e/task57-retention.spec.ts`

Schema/migration changes: none.

## Verification

- Scoped web tests: 3 files, 8/8 tests passed.
- Root ESLint: passed.
- Full web Vitest: 226 files passed, 2 skipped; 1,081 tests passed, 2 skipped.
- Root TypeScript typecheck and Next.js 16.3.6 production build: passed (98 static
  pages generated; dynamic routes compiled).
- Mobile Expo lint: passed.
- Mobile TypeScript typecheck: passed.
- Mobile Vitest: 2 files, 18/18 tests passed.
- Mobile Android bundle export: passed (1 Hermes bundle, 3.1 MB).
- A guarded Playwright test now covers VI/EN at 375/768/1024/1440, horizontal overflow,
  keyboard focus and a 44px action target. It refuses any non-local or production-named
  database. It passed against the isolated `toeicgym_task17` QA database through the
  `127.0.0.1:15433` SSH tunnel; all eight VI/EN responsive screenshots were reviewed
  for wrapping, action hierarchy and overflow. The submitted-session and auth fixtures
  were removed by the test cleanup.
- The UI uses the existing responsive web shell and native safe-area `Screen`, keeps
  bilingual wrapping, provides visible focus on web and preserves 48dp native primary
  actions. Physical TalkBack, large-font and device screenshot review remain part of
  Task65 because no Android device/emulator evidence is available in this run.

## Risks and remaining work

- No new cohort exists yet; Task57 cannot be marked outcome-complete.
- Native Google sign-in, Play Billing and signed-device testing remain separate P0
  gates and must not be conflated with retention UI readiness.
- No push reminder is enabled: production has no provider configuration, registered
  device, consent or delivery evidence.
- The current dependency findings and stale production media backup remain release
  blockers tracked in Task56.

## Deployment

No commit, push or deployment was performed. Production data was read-only.

## Next task

Task58: verify the complete learning journey and content/media readiness by Part,
without weakening Full Mock readiness gates or manufacturing content.
