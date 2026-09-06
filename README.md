# VSTEP Practice

A curated, adaptive VSTEP-style Reading practice MVP for Vietnamese learners. It provides deterministic scoring, answer review, skill insights, and rule-based recommendations. It is independent practice software, not an official VSTEP examination service.
A production-oriented MVP for Vietnamese learners to generate VSTEP-style Reading practice, complete multiple-choice questions, receive deterministic scores, review explanations, and identify what to practise next. It is an independent practice tool, not an official VSTEP examination service.

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
npm run seed:questions
npm run dev
```

Open <http://localhost:3000>. Keep real values in `.env.local`; Git ignores it.
npm run dev
```

Open <http://localhost:3000>. Keep all actual values in `.env.local`; it is ignored by Git.

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
A beginner-friendly full-stack learning project for VSTEP-style English practice. This repository currently contains the Milestone 1 application foundation: a Next.js landing page, TypeScript, Tailwind CSS, linting, and Supabase environment-variable placeholders. It does **not** yet include authentication, a database, tests, scoring, recommendations, or AI features.

## Prerequisites

* Node.js 20.9 or later
* npm 10 or later

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment-variable template. The landing page works without these values; they are preparation for a later Supabase milestone.

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run lint   # Check code quality rules.
npm run build  # Create a production build.
npm run start  # Serve a completed production build.
```

## Project structure

```text
src/app/
  layout.tsx       Shared HTML document and page metadata.
  page.tsx         The landing page.
  globals.css      Global styles and Tailwind import.
docs/
  mvp-and-architecture.md  Product and technical blueprint.
.env.example       Safe template for future Supabase configuration.
```

## Why this is a modular monolith

The first release uses one Next.js application for the user interface and future server endpoints. One deployable app is much easier to understand than separate frontend and backend services. We will add PostgreSQL/Supabase only when the application needs persistent learner data.

## Supabase foundation (Milestone 2)

This project is prepared for future Supabase authentication, but it does not make any Supabase requests yet.

* `src/lib/supabase/client.ts` creates a browser client for future interactive React components.
* `src/lib/supabase/server.ts` creates a server client with Next.js cookie support for future server components, route handlers, and server actions.
* `src/lib/supabase/config.ts` reads and validates the two public environment variables in one place.

Both clients use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Copy `.env.example` to `.env.local` and use your project settings. Never put a Supabase service-role key in a `NEXT_PUBLIC_` variable or commit it to Git.

## Google OAuth authentication (current milestone)

This project now uses **Google OAuth through Supabase Auth**. It intentionally does **not** provide email/password sign-up, password reset, learner profiles, application database tables, test content, or a real learner dashboard.

### Authentication flow

1. A learner selects **Continue with Google** on `/sign-in`. The browser client asks Supabase to start Google OAuth.
2. Supabase sends the learner to Google. Google verifies the learner’s Google account and returns them to Supabase.
3. Supabase redirects the learner to `/auth/callback`. The route exchanges the short-lived authorization code for a Supabase session stored in cookies.
4. `/dashboard` is a Server Component. It checks the session on the server and redirects unauthenticated visitors to `/sign-in`.
5. `src/proxy.ts` refreshes existing Supabase session cookies between requests. The dashboard sign-out action clears the session and returns to the landing page.

`/sign-up` redirects to `/sign-in`. Google OAuth creates the Supabase user automatically the first time a learner signs in, so a separate account-creation form would duplicate the same action.

### Configure Google OAuth before local testing

OAuth has two separate configuration layers. The Google client secret belongs in Google Cloud and Supabase—not in this repository or `.env.local`.

#### 1. Google Cloud

1. Create or select a Google Cloud project.
2. Configure the OAuth consent screen for your project.
3. Create a Web application OAuth client.
4. In its **Authorized redirect URIs**, add the Supabase callback URL shown in **Supabase Dashboard → Authentication → Providers → Google**. This is a Supabase URL, not the local Next.js callback URL.
5. Keep the Google client ID and client secret private.

#### 2. Supabase

1. Open **Authentication → Providers → Google** in your Supabase project.
2. Enable Google and enter the Google client ID and client secret there.
3. Open **Authentication → URL Configuration** and add this local application redirect URL:

   ```text
   http://localhost:3000/auth/callback
   ```

4. When you deploy later, add that real production callback URL too. Do not invent it now; use the deployed domain when it exists.

### What each credential represents

* **Google OAuth client ID and secret:** identify your application to Google. Configure them in Google Cloud and Supabase only.
* **Supabase project URL:** identifies your Supabase project for this application.
* **Supabase publishable key:** lets browser code use the public Supabase API for this project; it is not a service-role key.
* **Supabase user and session:** a user is the account created after Google authentication; a session is the cookie-backed proof that the user is currently signed in.
## Authentication (Milestone 3)

This milestone adds email-and-password authentication through Supabase Auth. It intentionally does **not** add a learner-profile table, application database schema, test data, or a real learner dashboard.

### Before testing sign-up

In your Supabase dashboard, open **Authentication → URL Configuration** and add this local redirect URL:

```text
http://localhost:3000/auth/callback
```

This lets Supabase return a learner to the application after email confirmation. If email confirmation is enabled in your Supabase project, a new user must click the confirmation link before they can sign in.

### Authentication flow

1. A learner submits `/sign-up`; the browser client sends the email and password to Supabase Auth. Supabase manages password storage—this application never stores passwords itself.
2. If email confirmation is required, Supabase sends the confirmation email and redirects the click back through `/auth/callback`. That route exchanges Supabase's temporary code for a session cookie.
3. `/sign-in` uses the browser client to ask Supabase Auth to create a session, then sends the learner to `/dashboard`.
4. `/dashboard` is a Server Component. It checks Supabase claims on the server and redirects unauthenticated visitors to `/sign-in`.
5. `src/proxy.ts` runs on requests to refresh an existing session and copy refreshed Supabase cookies to the response.
6. The dashboard sign-out form runs a server action that tells Supabase to end the session and redirects to the landing page.

### Important authentication files

```text
src/components/auth/sign-in-form.tsx  Google OAuth button, loading state, and error display.
src/app/sign-in/page.tsx              Sign-in route.
src/app/sign-up/page.tsx              Redirects obsolete sign-up URLs to sign-in.
src/app/auth/callback/route.ts        Exchanges the OAuth code for a session.
src/app/dashboard/page.tsx            Server-protected placeholder page.
src/app/dashboard/actions.ts          Server-side sign-out action.
src/proxy.ts                          Runs the Supabase session refresh logic.
src/lib/supabase/proxy.ts             Copies refreshed session cookies to responses.
```

The browser client starts OAuth from the interactive button. The server client is used by the callback, protected dashboard, and sign-out action because those operations need Next.js cookie access.

## Learner profile and onboarding (current milestone)

This milestone adds one application table: `public.profiles`. It stores learner-facing information only; Supabase Auth continues to own the Google account identity and session.

```text
auth.users.id  =  public.profiles.id
```

The matching IDs create a one-to-one relationship. The application never accepts a profile ID from a browser form: server code gets the authenticated user from Supabase and uses that user’s ID.

### Apply the database migration

The version-controlled migration is at:

```text
supabase/migrations/20260905130000_create_profiles_table.sql
```

Apply it to your Supabase project through your normal Supabase migration workflow (for example, `supabase db push` after linking the Supabase CLI to the project). Do not copy the schema into an unrelated migration or create a different profiles table manually.

### Row Level Security ownership rule

RLS is enabled on `public.profiles`. An authenticated learner may select, insert, or update a row only when its `id` equals `auth.uid()`—their own Supabase user ID. The policies do not allow access to another learner’s row.

### Profile flow

1. A learner signs in with Google.
2. `/dashboard` checks the authenticated user on the server.
3. If that user has no profile row, the app redirects to `/onboarding`.
4. The onboarding server action validates the full name, gets the authenticated user on the server, and upserts one profile row using that user’s ID.
5. The dashboard reads only the current learner’s profile and displays their name. A Google avatar URL is saved only when known user metadata contains a valid HTTPS URL.

The learner profile is intentionally minimal: full name and avatar URL only. There are no tests, learner level, preferences, scores, recommendations, or AI features yet.
src/app/sign-up/page.tsx                 Sign-up route.
src/app/sign-in/page.tsx                 Sign-in route.
src/components/auth/sign-up-form.tsx     Client-side sign-up validation and Supabase call.
src/components/auth/sign-in-form.tsx     Client-side sign-in validation and Supabase call.
src/app/auth/callback/route.ts           Handles the email-confirmation redirect.
src/app/dashboard/page.tsx               Server-protected placeholder page.
src/app/dashboard/actions.ts             Server-side sign-out action.
src/proxy.ts                             Runs the Supabase session refresh logic.
src/lib/supabase/proxy.ts                Copies refreshed session cookies to responses.
```

The browser client is for interactive form submissions. The server client is for protected pages, route handlers, and server actions where Next.js can read or write cookies. Using the server client on `/dashboard` means a user cannot gain access merely by changing browser-side UI state.
