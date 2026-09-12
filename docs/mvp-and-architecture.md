# TOEIC question-bank foundation

## Product boundary

The product is moving from generated VSTEP reading tests to curated TOEIC Listening & Reading practice. Task 1 establishes content storage and security only. Practice sessions, attempts, mastery statistics, weakness detection, and adaptive selection are later milestones.

## Audit and cleanup record

### Kept

- Next.js App Router, React, TypeScript, and Tailwind setup.
- Supabase browser/server clients, cookie refresh proxy, and server-only admin client.
- Google OAuth callback, protected-route checks, profile migration, onboarding, and sign-out.
- Generic error and not-found boundaries.

### Removed

- OpenAI generation client, prompt, structured generated-test schema, and generator tests.
- Generated-test actions, pages, forms, and runtime code. Historical migrations remain immutable; the new migration explicitly replaces their obsolete tables.
- VSTEP-specific adaptive selection and analysis logic.
- VSTEP seed/import script and its rigid four-option, B1/B2/C1 validation.
- Stale email/password form; `/sign-up` continues to redirect into the retained Google flow.

### Refactored

- Product copy and the protected dashboard now describe the TOEIC curated-bank milestone.
- Question-domain code now lives in `src/lib/questions` and distinguishes learner-safe content from server-only solutions.

## Database design

### `passages`

A shared content container for Part 3 conversations, Part 4 talks, Part 6 text completion, and Part 7 single/double/triple passages. `audio_url`, `image_url`, and JSON metadata cover media and import metadata without introducing a premature asset system.

### `questions`

Stores TOEIC part (1–7), extensible question type, skill/sub-skill labels, easy/medium/hard difficulty, prompt, optional passage/media, metadata, and lifecycle status. Partial indexes optimize published taxonomy queries.

### `question_options`

Options are rows instead of JSONB. This provides stable option IDs for grading, preserves display order, allows the TOEIC-specific three-or-four-choice variation, and makes editing/import validation straightforward. Uniqueness constraints prevent duplicate keys or positions per question.

### `question_solutions`

Stores the correct option and bilingual explanations behind a server-only boundary. A composite foreign key guarantees that the selected correct option belongs to the same question. Separating this table prevents the learner-facing `questions` SELECT policy from exposing answer keys or explanations before submission.

## Security model

RLS is enabled on all question-bank tables. Authenticated users receive SELECT only on published passages, published questions, and options belonging to published questions. There are no learner write policies and no learner grant or policy on solutions. The service role receives management access and bypasses RLS; it must remain in server-only code.

Future grading should run in trusted server code (preferably an ownership-checking database function) that compares submitted option IDs with `question_solutions`. The client must never decide whether an answer is correct. Explanations should be returned only after the server verifies that the learner owns a submitted attempt.
