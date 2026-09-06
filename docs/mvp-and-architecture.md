# VSTEP Practice MVP and Architecture

## Product boundary

VSTEP Practice helps Vietnamese learners improve Reading through curated VSTEP-style practice. It does not provide official tests, certification, or affiliation with Vietnamese education authorities.

The MVP loop is:

```text
Google authentication → private profile → adaptive practice selection
→ deterministic submission → review → skill insight → recommendation
```

## Modular-monolith architecture

One Next.js App Router application contains UI, protected Server Components, and trusted Server Actions. It is deployed to Vercel. Hosted Supabase provides Google Auth, PostgreSQL, and RLS. There is no runtime generative model, separate API service, queue, Redis, or external database.

Browser code receives only sanitized practice content. The server authenticates ownership and uses a server-only Supabase secret for question-bank reads and scoring functions that browser roles cannot invoke.

## Persisted model

### `profiles`

`profiles.id` is both its primary key and a foreign key to `auth.users.id`. RLS allows a learner to select, insert, and update only their own row.

### `passages`

Reusable curated reading passages have stable IDs, difficulty, topic, source label, and active status. The difficulty index supports a growing bank.

### `questions`

Each question belongs to one passage and contains four options, correct answer, explanation, skill, optional sub-skill, difficulty, topic, and active status. The initial controlled skills are vocabulary, main idea, detail comprehension, inference, and reference.

Because correct answers and explanations live in the bank, authenticated browser roles have no direct access to this table. Trusted server code strips both fields before sending questions to a test-taking Client Component.

### `attempts` and `attempt_questions`

An attempt belongs to one authenticated learner and records lifecycle plus final score. `attempt_questions` is the normalized snapshot of which reusable bank questions were selected and in what order. A partial unique index prevents two open attempts at the same level for one learner.

### `attempt_answers`

Each selected question has at most one stored answer. Correctness is written only by the trusted submission function.

Recommendations and aggregate skill statistics are derived from these normalized rows rather than persisted in extra tables.

## Row Level Security

* Learners can read only attempts where `attempts.user_id = auth.uid()`.
* Learners can read attempt-question and answer rows only through an attempt they own.
* Browser roles cannot read the raw curated question bank or perform learner-data writes.
* The server-only secret is never included in browser bundles or named with `NEXT_PUBLIC_`.

## Adaptive algorithm

The selector is deterministic business logic with a supplied variation seed—not machine learning.

1. Historical submitted answers are aggregated by skill.
2. Need weight increases as accuracy decreases; unseen skills receive neutral weight.
3. Questions seen repeatedly receive a novelty penalty.
4. A stable seeded variation prevents identical ordering while remaining testable.
5. One question from every available core skill is selected before weighted filling.
6. No single skill may exceed 40% of a 10-question set.

This emphasizes current areas to improve without removing stronger skills. A strength requires at least two observations and 75% accuracy. Below 60% is described as a “current area to improve,” not a permanent weakness.

## Deterministic scoring

The browser submits only question IDs and selected A–D values. The server verifies the authenticated attempt owner. A restricted PostgreSQL function locks the attempt, reads correct answers from the protected bank, scores all selected questions, writes answer correctness and totals, and returns an existing score for a repeated submission.

AI, browser state, and client-supplied score fields never determine the result.

## Question-bank operations

Version-controlled starter content lives in `supabase/seed/question-bank.json`. `npm run seed:questions` validates and idempotently upserts stable passage/question IDs. Editorial review happens before content is added to this file. Active flags allow content retirement without breaking historical attempt references.

The selection query fetches a bounded candidate pool per skill using indexed difficulty, skill, topic, and active fields. This remains practical as the bank grows into thousands of questions.

## Routes

| Route | Responsibility |
| --- | --- |
| `/` | Product explanation and authentication-aware entry. |
| `/sign-in` | Google OAuth initiation. |
| `/auth/callback` | Cookie-backed Supabase session exchange. |
| `/onboarding` | Protected profile setup. |
| `/dashboard` | History, skill summary, recommendation, and Start Practice. |
| `/practice` | Level selection and adaptive attempt creation/resume. |
| `/attempts/[attemptId]` | Sanitized practice experience. |
| `/results/[attemptId]` | Owned submitted result and answer review. |

## Deployment and security checklist

* Apply every migration with `supabase db push`.
* Import reviewed questions with `npm run seed:questions`.
* Configure only the public Supabase URL/key and server-only Supabase secret in Vercel.
* Configure the production Site URL and Next.js callback in Supabase after Vercel assigns a domain.
* Keep Google Cloud’s redirect pointed to Supabase’s provider callback.
* Run lint, typecheck, unit tests, and production build before deployment.
* Verify two-account RLS isolation, answer-key absence during practice, idempotent submission, and mobile usability after deployment.
