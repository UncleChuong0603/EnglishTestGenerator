# VSTEP Practice

A production-oriented MVP for Vietnamese learners to generate VSTEP-style Reading practice, complete multiple-choice questions, receive deterministic scores, review explanations, and identify what to practise next. It is an independent practice tool, not an official VSTEP examination service.

## Product flow

```text
Google sign-in → onboarding → dashboard → generate test → take test
→ submit → score and review → skill insights → practise again
```

## Technology and architecture

This is a modular monolith: one Next.js App Router application deployed to Vercel. Supabase provides Google authentication, PostgreSQL, and Row Level Security. OpenAI generates structured reading content from server-only code. Scoring, skill aggregation, and recommendations are deterministic TypeScript/PostgreSQL logic—not AI judgements.

## Local setup

Requirements: Node.js 20.9+, npm, a hosted Supabase project, Supabase CLI, and an OpenAI API key.

```bash
npm install
cp .env.example .env.local
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
npm run dev
```

Open <http://localhost:3000>. Keep all actual values in `.env.local`; it is ignored by Git.

### Environment variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Identifies the Supabase project. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server | Public Supabase API access governed by RLS. |
| `SUPABASE_SECRET_KEY` | Server only | Trusted generated-content and scoring writes. Never expose or prefix with `NEXT_PUBLIC_`. |
| `OPENAI_API_KEY` | Server only | Authorizes test generation. |
| `OPENAI_MODEL` | Server only, optional | Overrides the default generation model. |

## Database migrations

Migrations live in `supabase/migrations` and are the source of truth:

1. `20260905130000_create_profiles_table.sql` creates one private profile per `auth.users` row.
2. `20260906150000_create_reading_mvp.sql` creates private generated tests, learner-safe questions, protected answer keys, attempts, attempt answers, indexes, RLS policies, and the atomic submission function.

Apply pending migrations with `supabase db push`. Learners may read only their own tests, attempts, and answers. Correct-answer keys have no learner policy or grant. Normal profile operations use the learner session and RLS; only trusted Next.js server code uses the Supabase secret for generated-content and scoring writes.

## Google OAuth configuration

There are two different callback URLs:

* **Google Cloud authorized redirect URI:** use the Supabase provider callback shown under **Supabase → Authentication → Providers → Google**. Google returns to Supabase here.
* **Next.js application callback:** add `http://localhost:3000/auth/callback` under **Supabase → Authentication → URL Configuration**. Supabase returns to the application here.

Enable Google in Supabase and store the Google client ID/secret in Supabase—not in this repository.

## How the MVP works

* `/sign-in` starts Google OAuth. `/auth/callback` exchanges the temporary code for cookie-backed Supabase authentication.
* `/onboarding` creates the profile with the authenticated server-side user ID.
* `/tests/new` validates generation options, calls OpenAI server-side, validates structured JSON with Zod, and saves only valid content.
* `/attempts/[attemptId]` exposes passage, questions, and choices but never answer keys.
* Submission verifies ownership and calls a server-only PostgreSQL function that locks the attempt, calculates correctness from protected keys, stores every answer, and safely returns the existing result after duplicate submission.
* `/results/[attemptId]` derives the skill breakdown and recommendation from stored answers.
* `/dashboard` shows recent attempts and aggregate progress.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project**, import the repository, and keep the detected Next.js settings.
3. Add every variable from `.env.example` in **Project Settings → Environment Variables**. Use production values; never paste them into source files.
4. Deploy and copy the assigned production URL.
5. In Supabase **Authentication → URL Configuration**, set the production Site URL and add `https://YOUR_ASSIGNED_DOMAIN/auth/callback` to redirect URLs.
6. Keep the Google Cloud authorized redirect URI pointing to the Supabase provider callback. Do not replace it with the Next.js callback.
7. Redeploy after environment-variable changes and complete the post-deployment checklist below.

## Post-deployment checklist

* Landing page and mobile navigation render correctly.
* Google sign-in returns to the production `/auth/callback`.
* New learners complete onboarding; returning learners reach the dashboard.
* Test generation produces exactly the requested 10 or 20 questions.
* Correct answers are absent from test-taking network payloads.
* Submission is idempotent and the displayed score matches a manual count.
* Review, skill insights, recommendations, and attempt history render correctly.
* Refresh preserves the session; sign-out protects `/dashboard` again.
* A second learner cannot access copied profile, test, attempt, or result URLs.

## Intentionally out of scope

Listening, Speaking, official VSTEP certification/scoring, email/password auth, other OAuth providers, payments, subscriptions, admin/teacher portals, social features, and adaptive testing.
