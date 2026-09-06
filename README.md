# VSTEP Practice

A curated, adaptive VSTEP-style Reading practice MVP for Vietnamese learners. It provides deterministic scoring, answer review, skill insights, and rule-based recommendations. It is independent practice software, not an official VSTEP examination service.

## Product flow

```text
Google sign-in → onboarding → dashboard → Start Practice
→ history-weighted question selection → answer 10 questions
→ deterministic score and review → skill insight → practise again
```

## Architecture

VSTEP Practice is a Next.js modular monolith designed for Vercel. Supabase provides Google authentication, PostgreSQL, and Row Level Security. A curated question bank supplies all practice content—there are no runtime calls to OpenAI, Gemini, or any other generative service.

The adaptive selector is ordinary TypeScript. It uses historical accuracy and question exposure to prioritize current areas to improve, guarantees baseline skill coverage where inventory permits, and caps any single skill at 40% of a set.

## Local setup

Requirements: Node.js 20.9+, npm, a hosted Supabase project, and the Supabase CLI.

```bash
npm install
cp .env.example .env.local
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
npm run seed:questions
npm run dev
```

Open <http://localhost:3000>. Keep real values in `.env.local`; Git ignores it.

### Environment variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Identifies the Supabase project. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server | Public Supabase access governed by RLS. |
| `SUPABASE_SECRET_KEY` | Server only | Reads protected curated content and performs trusted scoring writes. Never prefix with `NEXT_PUBLIC_`. |

## Database and RLS

Migrations under `supabase/migrations` are the source of truth:

1. `20260905130000_create_profiles_table.sql` creates one private profile per Google-authenticated user.
2. `20260906170000_create_question_bank_mvp.sql` pivots unfinished generated-test tables to `passages`, `questions`, `attempts`, `attempt_questions`, and `attempt_answers`.

The pivot migration removes development-only generated-test/attempt data if those unfinished tables were previously applied. It does not remove users or profiles.

Learners can read only their own attempts, selected attempt questions, and answers. The question bank contains correct answers and explanations, so browser roles receive no direct table access. Trusted Next.js server code returns sanitized questions during practice and reveals answers only on an owned, submitted result page.

Apply migrations with:

```bash
supabase db push
```

## Curated question-bank import

Starter content lives at `supabase/seed/question-bank.json`: 30 reviewed sample questions—10 each for B1, B2, and C1—across vocabulary, main idea, detail, inference, and reference.

Import it idempotently:

```bash
npm run seed:validate
npm run seed:questions
```

`scripts/import-question-bank.mjs` validates required fields, levels, skills, four A–D options, correct-answer membership, and passage/question consistency before upserting stable IDs. To grow the bank, review and add entries to the JSON file, then run the same command. The indexed bank-selection query reads at most 100 active candidates per skill, so normal practice creation does not load thousands of rows.

## Adaptive selection rules

1. Aggregate all submitted answers by skill.
2. Give lower historical accuracy a higher need weight.
3. Reduce priority for questions the learner has already seen repeatedly.
4. Add a small seeded variation so successive sets are not identical.
5. Select one question from every available core skill first.
6. Fill remaining places by weight, capped at four questions per skill in a 10-question set.

Unmeasured skills receive a neutral weight. Strong skills stay in rotation rather than disappearing.

## Google OAuth

* In Google Cloud, keep the authorized redirect URI set to the Supabase Google-provider callback shown under **Supabase → Authentication → Providers → Google**.
* In Supabase **Authentication → URL Configuration**, allow `http://localhost:3000/auth/callback` locally.
* Google credentials remain in Google Cloud/Supabase and never enter this repository.

## Main routes

* `/sign-in` — Google OAuth.
* `/onboarding` — protected learner name setup.
* `/dashboard` — history, strengths, and recommendation.
* `/practice` — creates or resumes a deterministic adaptive practice set.
* `/attempts/[attemptId]` — sanitized passages, questions, progress, and submission.
* `/results/[attemptId]` — score, correct answers, explanations, skills, and recommendation.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy to Vercel

1. Push the repository to GitHub and import it through **Vercel → Add New → Project**.
2. Add the three variables from `.env.example` in Vercel Project Settings.
3. Apply Supabase migrations and import the curated bank before opening production to learners.
4. Deploy and copy the assigned production URL.
5. In Supabase URL Configuration, set that production Site URL and add `https://YOUR_ASSIGNED_DOMAIN/auth/callback` as an allowed redirect.
6. Keep Google Cloud pointed at the Supabase provider callback; do not replace it with the Next.js callback.
7. Redeploy after environment changes.

## Intentionally out of scope

Runtime AI, question generation, Listening, Speaking, official VSTEP scoring, email/password authentication, additional OAuth providers, payments, subscriptions, teacher/admin portals, social features, and machine-learning adaptation.
