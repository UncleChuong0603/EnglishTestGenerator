# Task 46 — Remediation Engine 2.0

## Learning loop

The canonical loop is `wrong → optional reason → real micro lesson → focused drill → result review → existing mastery`.

- No second mastery table or scoring model was added. A focused drill is still a `mastery_review` session and uses the existing `question_mastery` 0/2 → 1/2 → 2/2 progression. A wrong review resets the streak.
- `remediation_session_contexts` is trace metadata only. It connects the owned wrong attempt, selected reason (or `UNKNOWN`), real lesson source, drill session, and the existing mastery state.
- The server selects complete units in unseen → older seen → recent order. It targets 3–5 questions when the bank supports that range and never splits Parts 3, 4, 6, or 7 groups.

## Real content and fallback

`GRAMMAR_RULE` maps taxonomy to an existing canonical grammar article. `MISHEARD_WORD` uses a published Listening Lesson for the same Part when one exists. Other reasons use the source question's canonical bilingual explanation. If a mapped article or Listening Lesson is unavailable, the same explanation fallback is used. Nothing is generated at runtime.

## Shared web/mobile behavior

Web and Expo both start remediation through the same server selector. The practice DTO contains the same micro-lesson and reason context for both clients. Expo does not select questions or reproduce lesson mapping locally.

Mistake Bank exposes the latest `reason → lesson type → mastery stage` trail. A sufficiently supported Task 45 reason pattern may move an existing review item earlier in Weekly Plan; it never creates content or rewrites the recommendation engine.

## Safety and plan behavior

Ownership, submitted status, and incorrect-answer evidence are revalidated on the server. The existing `MASTERY_REVIEW` entitlement and Free/Premium/Trial capability path remain canonical. API creation requires an idempotency key and also reuses an already-open remediation for the same source mistake.

Migration `0051_task46_remediation_context.sql` is additive. It contains only trace metadata, foreign keys, checks, and indexes.
