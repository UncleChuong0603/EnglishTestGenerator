# Task 58 — End-to-end learning journey and content readiness

Date: 2026-10-11

## Result

**Task status: PARTIAL / CONTENT NO-GO.** The catalog is structurally complete and every
referenced production media file passed integrity checks, but the product must not be
declared content-ready yet. Ninety-nine published Mock Part 5 questions are linked to a
committed `AI_ASSISTED_ORIGINAL` import whose review status is still `UNREVIEWED`, and
duplicate scanning covers 0 of 7 Parts.

This conclusion comes from a fresh aggregate-only, read-only production audit. No
production content, review status, learner data, schema or media was changed. Structural
validation is not a substitute for human editorial review of TOEIC accuracy, naturalness,
distractor quality or explanation quality.

## Readiness matrix

| Part | Published inventory (Mock / Practice) | Structure, key and explanations | Media / grouped content | Decision |
| --- | ---: | --- | --- | --- |
| Listening P1 | 150 / 100 | 0 missing solutions; 0 missing EN/VI explanations; valid 4-option keys | 250/250 groups have ready audio, image and transcript | Structurally ready; physical-device playback and TalkBack remain a human gate |
| Listening P2 | 625 / 900 | 0 missing solutions; 0 missing EN/VI explanations; valid 3-option keys | 1,525/1,525 groups have ready audio and transcript | Structurally ready; physical-device playback remains a human gate |
| Listening P3 | 975 / 900 | 0 missing solutions; 0 missing EN/VI explanations; valid 4-option keys | 625/625 three-question groups have ready audio and transcript | Structurally ready; grouped native rendering/playback still needs device evidence |
| Listening P4 | 750 / 600 | 0 missing solutions; 0 missing EN/VI explanations; valid 4-option keys | 450/450 three-question groups have ready audio and transcript | Structurally ready; grouped native rendering/playback still needs device evidence |
| Reading P5 | 750 / 1,000 | 0 missing solutions; 0 missing EN/VI explanations; valid 4-option keys | Standalone mapping valid | **Blocked:** 99 published Mock questions come from an unreviewed AI-assisted import |
| Reading P6 | 400 / 400 | 0 missing solutions; 0 missing EN/VI explanations; valid 4-option keys | 200/200 groups have one published document and four questions | Structurally ready; semantic/editorial sample review remains open |
| Reading P7 | 1,350 / 1,100 | 0 missing solutions; 0 missing EN/VI explanations; valid 4-option keys | 675/675 groups match single/double/triple document counts | Structurally ready; native large-font and long-passage device review remains open |

Across all 12,000 published questions, the audit found no invalid answer key, incorrect
option count, missing solution, missing English explanation or missing Vietnamese
explanation. It found no invalid Part 1–4 group size and no invalid Part 6–7 passage
structure. The largest published passage is 477 characters and the largest group has
three documents; these are catalog observations, not proof that every item is
pedagogically sound.

## Full Mock

The mapping layer is internally complete: 25 forms contain 5,000 mappings to 5,000
unique published Mock questions, with no Practice-pool or unpublished question in the
mapping. This satisfies the mechanical form blueprint only.

Full Mock remains **NO-GO for content sign-off** until all 99 affected Mock Part 5
questions receive real editorial review and every Part has current duplicate-scan
evidence. The release gate was not weakened, review statuses were not rewritten, and no
synthetic questions were added to make the catalog pass.

## Media readiness

- 3,116 production media records are `READY` in local persistent storage.
- All 3,116 referenced files exist under the configured media root, remain inside that
  root after path resolution, match stored byte sizes and SHA-256 checksums, and have an
  accepted MIME type.
- No missing, unsafe, size-mismatched, checksum-mismatched or invalid-metadata referenced
  file was found.
- 423 physical files are not referenced by a ready media record. They are a cleanup
  warning, not permission to delete them. Ownership/reference reconciliation and a fresh
  verified media backup must precede any removal.
- Production media backup freshness is still a release blocker from the operations
  baseline; catalog integrity does not replace recoverability.

## Journey evidence

| Stage | Evidence in this audit | Remaining gap |
| --- | --- | --- |
| Challenge / Diagnostic → Result → Signup | Existing guarded acquisition E2E verifies actor-linked `signup_after_challenge`; scoring and diagnostic services remain server-owned | Production funnel still has only 1 signup after 13 challenge completions and 0 attributed first workouts; the end-to-end outcome is not operationally proven |
| First Workout → Next-Day Return | Task 57 added a bilingual, keyboard-reachable next-step handoff and passed VI/EN at 375, 768, 1024 and 1440 px | No new mature cohort exists; production baseline remains 0 of 26 eligible learners returning on a second meaningful learning day |
| Mistakes → Remediation → Recheck | Isolated Task 41 E2E passed the real wrong answer → three replacement questions → strengthening → second review → `MASTERED` lifecycle, including Free quota and cross-user isolation | Physical Android interaction and a production cohort completing this loop remain unproven |
| Weekly Review | Canonical dashboard/progress and mastery services provide the saved evidence | The audit did not establish a production weekly-return cohort or reminder delivery |

The isolated Task 41 E2E also passed responsive Result and Mistake Bank checks at 360,
375, 390, 430, 768, 1024 and 1440 px and in both interface languages. The Task 57 E2E
passed keyboard focus and a minimum 44 px web action target. These tests validate the
controlled journeys; they do not claim retention improvement.

## Errors fixed

1. Listening results ignored the learner's explanation-language preference and always
   selected Vietnamese when available. A shared explanation selector now honors `en`,
   `vi` and `both`, with explicit fallback behavior and unit coverage.
2. Native audio and image failures had no actionable recovery state. They now expose an
   accessible alert and a 48 dp retry action; practice reloads the canonical session and
   signed media URL rather than inventing client state.
3. Grouped web Listening P3/P4 images lacked a load-error path. They now surface the
   existing localized media-unavailable alert.
4. The remediation E2E encoded an obsolete one-question assumption. Its isolated fixture
   and assertions now verify the real 3-question focused drill without recycling the
   missed source question.
5. Reading practice dispatched the coach-progress event from inside a React state updater,
   causing a cross-component state update during render. The event now fires after the
   answer state has been derived, outside React's updater callback.
6. The production audit issued concurrent queries on one transactional PostgreSQL client.
   Queries now run sequentially within the read-only transaction before physical media
   verification.

No scoring, entitlement, mastery threshold, Full Mock readiness rule or content review
status was relaxed by these fixes.

## Content and human gates

1. Editorially review the 99 published Mock Part 5 questions associated with the
   unreviewed import. Correct or withdraw individual questions through the existing Admin
   Content QA workflow, then record the batch review decision. Do not bulk-mark the batch
   reviewed without item-level evidence.
2. Run and review duplicate scans for Parts 1–7. Current coverage is 0/7 with 0 questions
   scanned, so “0 duplicates detected” is not meaningful evidence.
3. Sample every Part in both languages for TOEIC plausibility, grammar, distractor quality,
   correct-key semantics and explanation usefulness. The database audit only proves
   presence and referential integrity.
4. Reconcile the 423 orphan media files after a fresh successful media backup. Do not
   delete by filename or age alone.
5. Complete signed Android-device checks for audio playback/interruption/retry, image
   failure/retry, P3/P4 grouped navigation, P6/P7 multi-document scrolling, font scaling,
   TalkBack order and offline/poor-network recovery.
6. Re-run this audit and the Full Mock form validator after editorial or media changes.
   Content sign-off requires zero blocking issues plus recorded human review evidence.

## Verification

- Read-only production catalog and physical-media audit: completed; intentionally exited
  non-zero because the unreviewed published content is a blocking issue.
- Task 41 guarded E2E: 5/5 passed against isolated PostgreSQL 17 through localhost SSH
  forwarding; the test refuses non-local, incorrectly named or non-QA database targets.
- Explanation-language unit coverage: 4/4 passed.
- Answer-review scoped coverage: 8/8 passed across three web test files.
- Native media/release-readiness scoped coverage: 19/19 passed across two files.
- Root ESLint and TypeScript typecheck: passed.
- Full web Vitest: 227 files passed, 2 skipped; 1,085 tests passed, 2 skipped.
- Next.js 16.3.6 production build: passed; 98 static pages generated and dynamic routes
  compiled.
- Mobile Expo lint and TypeScript typecheck: passed; 19/19 tests passed.
- Mobile Android Hermes export: passed; one 3.1 MB bundle produced.

No deployment is implied by local test success.

## Deployment

No commit, push or deployment was performed. Production access was read-only.

