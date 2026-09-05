# English Practice Platform: MVP and Technical Blueprint

## 1. Product goal and first-release boundary

The product helps Vietnamese learners practise **VSTEP-style English skills**, understand their results, and choose a useful next activity. It is a learning product, not an official VSTEP examination service. Only an authorized test provider can claim to deliver an official VSTEP score.

### The MVP problem to solve

A learner should be able to:

1. Create an account and select a target level (for example B1 or B2).
2. Take one short, timed Reading practice test.
3. See an immediate, reliable score and review every answer.
4. See a simple skill breakdown (for example, detail questions versus vocabulary-in-context questions).
5. Submit one short Writing response and receive clearly labelled **AI practice feedback**.
6. Receive one recommended next practice action based on their measured weaknesses.

### Scope for version 1

| Include | Do not include yet |
| --- | --- |
| Email sign-in, learner profile, B1/B2 target | Payments, subscriptions, social features |
| Curated Reading question sets with multiple-choice answers | Full official-exam equivalence or certification |
| Timer, autosave of selected answers, submit flow | Adaptive test engine |
| Deterministic Reading score, answer review, attempt history | Listening audio delivery and Speaking recording |
| One Writing prompt with AI feedback labelled as an estimate | AI-generated questions published directly to learners |
| Rule-based recommendation of the next exercise | Teacher dashboard, live grading, notifications |

This deliberately small boundary gets a complete learner loop into production: **practise → submit → understand → choose what to do next**. Listening and Speaking need extra work (audio content, recordings, storage, transcription, and privacy); they are later milestones, not reasons to delay launch.

### Success criteria

The MVP is ready for a small beta when a new user can finish a Reading test on a phone or laptop, receive the same score every time for the same answers, view a useful review, and return later to see the attempt in their history. Before public launch, test the flow with 5–10 learners and record where they get confused.

## 2. Key user journeys

### Learner: Reading practice

1. The learner chooses a published test appropriate for their target level.
2. The app creates an `attempt`, snapshots the allotted time, and records answers as the learner works.
3. On submission (or timeout), the server calculates the score from the answer key.
4. The learner sees total correct answers, a breakdown by question skill tag, and explanations for each question.
5. The recommendation rules select the highest-priority weak skill and link to the next practice set.

### Learner: Writing feedback

1. The learner opens a published Writing prompt and submits text.
2. The app saves the submission first, then requests feedback from the AI provider on the server.
3. The learner sees strengths, improvement points, an estimated rubric band, and a suggested rewrite exercise.
4. The interface says that the feedback is AI-generated practice guidance, not an official result.

### Content author (initially, you)

For the MVP, create content directly in the database through a protected internal page or an admin tool. Every question must be reviewed by a human before `published_at` is set. Do not let an AI publish learner-facing questions unattended.

## 3. Data model

Use PostgreSQL. UUIDs are identifiers; timestamps are stored in UTC. `created_at` and `updated_at` are required on application-owned records unless noted otherwise. Store only the data needed for learning; delete raw speech audio on a defined retention schedule when Speaking is added.

### Identity and learner profile

| Table | Important columns | Purpose |
| --- | --- | --- |
| `profiles` | `id` (PK, FK to authentication user), `display_name`, `target_level`, `native_language`, `onboarding_completed_at` | Learner-specific information; authentication credentials remain with the auth provider. |
| `learner_skill_stats` | `id`, `learner_id` (FK), `skill_tag_id` (FK), `attempted_count`, `correct_count`, `accuracy`, `last_practised_at`, `updated_at` | A fast, derived summary for recommendations. Rebuildable from answers, so it must never be the source of truth. |

### Content catalogue

| Table | Important columns | Purpose |
| --- | --- | --- |
| `tests` | `id`, `title`, `description`, `target_level`, `duration_seconds`, `status` (`draft`/`published`/`archived`), `published_at`, `created_by` | A practice test or exercise container. |
| `test_sections` | `id`, `test_id` (FK), `section_type` (`reading`, `writing`, later `listening`, `speaking`), `position`, `instructions`, `duration_seconds` | Ordered sections inside a test. |
| `passages` | `id`, `section_id` (FK), `title`, `body`, `position` | Reading material. Keep the content separate so multiple questions can reference it. |
| `questions` | `id`, `section_id` (FK), `passage_id` (nullable FK), `question_type` (`multiple_choice`, `writing_prompt`), `prompt`, `position`, `skill_tag_id` (FK), `points`, `answer_key`, `explanation`, `rubric_version` (nullable) | A question. `answer_key` is server-only for learner responses; a writing question has no answer key and instead references a rubric version. |
| `question_options` | `id`, `question_id` (FK), `option_key`, `text`, `position` | Options for a multiple-choice question. The correct choice is represented by `questions.answer_key`, not exposed to the browser. |
| `skill_tags` | `id`, `code` (unique), `name`, `section_type`, `description` | Controlled labels such as `reading_main_idea`, `reading_detail`, and `vocabulary_context`. |
| `rubrics` | `id`, `name`, `version`, `criteria_json`, `is_active` | Versioned Writing rubric definition. Versioning makes feedback explainable if prompts change later. |

Use a database constraint or application validation to enforce unique `(test_id, position)`, `(section_id, position)`, `(question_id, position)`, and `(learner_id, skill_tag_id)` values. Index foreign keys plus `tests(status, target_level)` and `attempts(learner_id, submitted_at desc)`.

### Attempts, answers, and results

| Table | Important columns | Purpose |
| --- | --- | --- |
| `attempts` | `id`, `learner_id` (FK), `test_id` (FK), `status` (`in_progress`, `submitted`, `expired`), `started_at`, `expires_at`, `submitted_at`, `test_snapshot_json`, `score_raw`, `score_percent`, `result_version` | One learner sitting. The snapshot preserves what the learner was shown even if content changes later. |
| `attempt_answers` | `id`, `attempt_id` (FK), `question_id` (FK), `selected_option_key` (nullable), `written_response` (nullable), `is_correct` (nullable), `points_awarded` (nullable), `answered_at` | One answer per question; unique `(attempt_id, question_id)`. `is_correct` and points are server-calculated. |
| `attempt_skill_results` | `id`, `attempt_id` (FK), `skill_tag_id` (FK), `question_count`, `correct_count`, `score_percent` | Per-attempt breakdown shown to the learner and used to update long-term stats. |
| `recommendations` | `id`, `learner_id` (FK), `attempt_id` (nullable FK), `recommendation_type`, `reason`, `action_label`, `target_test_id` (nullable FK), `priority`, `status`, `created_at` | A saved, explainable recommendation. The reason should name the evidence, not be a vague AI claim. |

### AI records and operations

| Table | Important columns | Purpose |
| --- | --- | --- |
| `ai_feedback` | `id`, `attempt_answer_id` (FK), `provider`, `model`, `prompt_version`, `rubric_version`, `status`, `feedback_json`, `estimated_score`, `generated_at`, `failure_reason` | Auditable result for Writing feedback. Store structured output, not only a prose blob. |
| `audit_events` | `id`, `actor_id` (nullable), `event_type`, `entity_type`, `entity_id`, `metadata_json`, `created_at` | Minimal operational audit trail, especially for content publishing and AI failures. |

`feedback_json` should have a validated shape such as: `summary`, `strengths[]`, `improvements[]`, `criterion_scores[]`, `next_exercise`, and `safety_notes[]`. Keep API keys, complete provider request headers, and authentication secrets out of the database.

### Relationship summary

```text
profile 1--* attempts *--1 tests 1--* test_sections 1--* questions 1--* question_options
                              |                         |
                              |                         *--1 skill_tags
                              *--* attempt_answers *--1 questions
attempts 1--* attempt_skill_results *--1 skill_tags
profile 1--* learner_skill_stats *--1 skill_tags
attempt_answers 1--0..1 ai_feedback
profile 1--* recommendations
```

## 4. Application architecture

Choose a **modular monolith** for the first launch: one deployable web application, one PostgreSQL database, and managed services. This is easier to understand and operate than separate frontend, API, worker, and microservice deployments.

```text
Browser (Next.js pages/components)
        |
        | HTTPS; authenticated requests
        v
Next.js server (route handlers / server actions)
  ├── Authentication and authorization checks
  ├── Test delivery (without answer keys)
  ├── Attempt and deterministic scoring service
  ├── Recommendation rules service
  ├── Writing-feedback orchestration service
  └── Admin content publishing service
        |                 |
        v                 v
PostgreSQL + Auth      AI provider API
(Supabase)             (server-side only)
        |
        v
Object storage later for Listening/Speaking media
```

### Module boundaries

* **Authentication:** verifies who the request belongs to. A learner can access only their own attempts and feedback.
* **Content:** fetches published content and validates it before publication. It never exposes `answer_key` in the test-delivery response.
* **Attempts and scoring:** creates attempts, validates answers, closes attempts, calculates scores, and writes results in a database transaction.
* **Recommendations:** converts actual skill statistics into the next suggested action using documented rules.
* **AI feedback:** accepts saved Writing text, builds a controlled prompt, validates structured model output, and stores it with model and prompt versions.
* **Admin:** protected tools for authoring, previewing, and publishing reviewed content.

### Important security and reliability rules

1. Perform scoring and authorization on the server, never in browser JavaScript.
2. Enforce row-level authorization in the database as a second line of defence; application checks alone are not enough.
3. Send the AI provider only the minimum needed text (the prompt, learner answer, and rubric); never send passwords, tokens, or unrelated profile data.
4. Rate-limit submissions and AI-feedback requests per user to control abuse and cost.
5. Make submission idempotent: repeating a network request must not create two finalized results or two AI jobs.
6. Log failures with an opaque request ID, not learner answer text or secrets.
7. Back up the database and test restoring a backup before inviting real users.

## 5. Technology choices

| Technology | Role | Why it is a good beginner choice |
| --- | --- | --- |
| TypeScript | Language | Catches many common mistakes before deployment while still using one language on browser and server. |
| Next.js | Web framework | One project can render pages and provide server endpoints, reducing setup and deployment complexity. |
| React | User interface | Component model is good for reusable timers, question cards, progress indicators, and result views. |
| PostgreSQL | Relational database | Strong fit for users, tests, questions, attempts, and reports with clear relationships and transactions. |
| Supabase | Managed Postgres, Auth, storage | Avoids operating a database and login system yourself; its Postgres foundation remains portable. |
| Drizzle ORM + SQL migrations | Database access and schema history | Typed queries help learning, while checked-in SQL migrations make database changes reproducible. Learn basic SQL rather than hiding it completely. |
| Zod | Runtime validation | Checks untrusted form/API/AI data at runtime; TypeScript types alone disappear when the app runs. |
| Vercel | Web deployment | Simple continuous deployment for a Next.js beginner project. |
| OpenAI API | Writing-feedback generation | Produces structured, rubric-guided feedback when called from the server; keep it behind one small service module so it can be changed later. |
| Vitest + Playwright | Tests | Vitest covers fast scoring/unit tests; Playwright verifies the learner journey in a real browser. |
| Sentry (after beta starts) | Error monitoring | Shows real production failures without relying on users to describe technical errors. |

Start with managed services. “Self-host everything” is a valuable later learning project but is not necessary to learn full-stack fundamentals or launch safely.

## 6. Deterministic logic versus AI

### Must be deterministic (code and database rules)

These outcomes need to be repeatable, explainable, and testable:

* Authentication, permissions, attempt ownership, time limits, and submission state transitions.
* Multiple-choice answer checking, raw point totals, percentages, and score conversions.
* Which questions appear in a selected, fixed test and their displayed order.
* Skill-breakdown calculations from question tags and answer results.
* Recommendation priority: for example, recommend the skill with enough attempts and the lowest accuracy; use a default practice set when evidence is insufficient.
* Content publication checks, data validation, rate limits, and audit records.
* Any eligibility, payment, certificate, or official-result claim.

### Appropriate uses for AI

AI adds value where language judgement and coaching are useful, but it should be constrained:

* Feedback on a Writing response using a visible, versioned rubric.
* Plain-language explanations of a learner's repeated mistake pattern, grounded in deterministic results supplied to the model.
* Suggested practice activities or example improvements, marked as suggestions.
* Drafting internal content for a human author to review.

### AI guardrails

* Label any Writing band as an **AI estimate**, never an official VSTEP score.
* Ask the model for JSON that fits a defined schema, then validate it with Zod before saving or displaying it.
* Version the prompt, model, and rubric for each feedback item so results are traceable.
* Show the concrete evidence beside an AI summary (for example, “3/8 vocabulary-in-context questions correct”).
* Give users a retry message if AI feedback fails; do not block deterministic test results.
* Do not use an LLM to decide correct multiple-choice answers at submission time.

## 7. Small build milestones

Each milestone ends with a demoable outcome and should be committed separately. Do not begin the next milestone until the previous one works locally and has basic tests.

### Milestone 0 — Product and content preparation

* Write 3 learner stories and a one-page definition of “done.”
* Create one reviewed B1 Reading test: passage(s), questions, answer keys, explanations, and skill tags.
* Write the first Writing prompt and simple rubric.
* **Done when:** a friend can read the prototype content and understands what they will practise.

### Milestone 1 — Foundations and deployment hello world

* Create the Next.js + TypeScript project, configure formatting/linting, environment variables, and a preview deployment.
* Create Supabase project and local database migration workflow.
* Add a small health page and error reporting setup.
* **Done when:** every push can create a preview URL and the production skeleton loads.

### Milestone 2 — Login and learner profile

* Add email authentication, protected routes, profile creation, and target-level onboarding.
* Add row-level security policies and tests proving one learner cannot read another learner's data.
* **Done when:** two test accounts see only their own profiles.

### Milestone 3 — Author and deliver Reading content

* Add the content schema and a protected way to seed or author one published test.
* Build the test list, instructions, question UI, timer, answer selection, and autosave.
* Ensure browser responses never contain answer keys.
* **Done when:** a learner can start and resume an unfinished practice attempt.

### Milestone 4 — Deterministic results and review

* Implement server-side submission, scoring transaction, results page, question review, and attempt history.
* Write unit tests for score totals, timeout behaviour, duplicate submissions, and missing answers.
* **Done when:** the same saved answers always create the same score and review.

### Milestone 5 — Skill analysis and deterministic recommendations

* Calculate per-skill results; update learner skill statistics after a completed attempt.
* Implement the first simple recommendation rule and make its reason visible.
* **Done when:** a learner with weak detail-question accuracy gets a specific, evidence-based next action.

### Milestone 6 — Writing and AI feedback

* Add Writing submission, a server-only AI call, structured-output validation, stored feedback, failure handling, and clear AI-estimate labels.
* Add cost limits and a test double so tests do not call the paid API.
* **Done when:** a learner receives saved Writing feedback without affecting Reading scoring if the provider is unavailable.

### Milestone 7 — Beta quality and launch

* Add mobile/accessibility review, privacy policy, deletion request flow, analytics for funnel steps, monitoring, backup/restore test, and end-to-end tests.
* Invite 5–10 learners, watch sessions, and fix the three biggest points of confusion.
* **Done when:** beta users complete the full loop and you can detect and recover from common production failures.

### Later milestones

Add Listening first (curated audio, player, deterministic questions), then Speaking (recording consent, object storage, transcription, and carefully labelled AI feedback). Only consider adaptive testing after enough attempt data exists to validate whether it helps learners.

## 8. What to learn in order

1. HTML/CSS and React components by building static test and result screens with fake data.
2. TypeScript types and form validation.
3. SQL basics: tables, primary/foreign keys, indexes, and transactions.
4. Authentication and authorization, including why users must not query all data.
5. Server endpoints and deterministic scoring tests.
6. Deployment, environment variables, logs, and database migrations.
7. AI API integration, structured outputs, cost controls, and evaluation with a small set of reviewed learner answers.

The most important learning habit is to keep each change small: write the user-visible behaviour first, implement one vertical slice, test it, deploy it, and record what you learned before moving on.

## 9. Milestone 1 implementation status

The initial application foundation is now in place.

### Implemented

* A Next.js App Router project using TypeScript and the `src/` directory layout.
* Tailwind CSS v4 for utility-first styling; the landing page uses Tailwind classes directly.
* ESLint configuration using the Next.js core web-vitals and TypeScript rule sets.
* A responsive static landing page that explains the learning loop and clearly states that the product is not an official VSTEP examination service.
* An `.env.example` template with empty `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` variables. No database client, schema, authentication, or secret is included yet.
* A README with local setup, commands, and an explanation of the simple single-application architecture.

### Intentional decisions

Tailwind is included because it lets a beginner build responsive, consistent screens without designing a separate CSS architecture first. shadcn/ui is intentionally deferred: it is a collection of copied, owned components rather than a requirement for Next.js. Add individual shadcn components only when a real feature needs them, so the project does not begin with unused dependencies and generated files.

The Supabase variables are a placeholder only. Keeping the integration out of this milestone means the landing page remains simple and runnable without an external account, while its future configuration names are established without risking secrets in Git.

### Not implemented yet

Authentication, Supabase/PostgreSQL access, database migrations, test content, scoring, recommendations, AI features, payments, and advanced interface components are all intentionally deferred.

## 10. Milestone 2: Supabase foundation status

The project now has the smallest useful Supabase integration boundary, without adding a database schema or an authentication flow.

* `@supabase/supabase-js` supplies the base Supabase JavaScript client and `@supabase/ssr` supplies the Next.js-compatible browser/server client helpers.
* `src/lib/supabase/client.ts` is for future interactive browser components. `src/lib/supabase/server.ts` is for future server components, route handlers, and server actions, where session cookies must be read and written on the server.
* `src/lib/supabase/config.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the environment and fails clearly if either is missing.
* `.env.example` names the required values but contains no credentials. Local project values belong only in the Git-ignored `.env.local` file.

No authentication calls, database tables, learner profile, dashboard, test data, or authorization policies have been introduced. Those belong to later, separately testable milestones.

## 11. Milestone 3: Authentication status

Basic Supabase email-and-password authentication is now implemented without an application database schema.

* `/sign-up` validates email, password length, and confirmation in the browser, then calls Supabase Auth. If the Supabase project requires confirmation, the user is told to check their email; otherwise they are sent to the protected page.
* `/auth/callback` receives Supabase's confirmation redirect and exchanges its temporary code for the session stored in cookies.
* `/sign-in` creates a Supabase session, then redirects to `/dashboard`.
* `/dashboard` is protected on the server by checking Supabase claims. Unauthenticated visitors are redirected to `/sign-in`; it is not protected by client-side state alone.
* `src/proxy.ts` refreshes existing Supabase sessions and preserves refreshed cookies between requests. The dashboard server action signs the user out and redirects home.

There is still no `profiles` table because Supabase Auth owns account identity and password handling. The future application-specific profile is a separate concern that will be added only when learner attributes are needed.
