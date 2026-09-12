# TOEIC Practice

A Next.js 16 and Supabase foundation for a curated TOEIC Listening & Reading practice platform for Vietnamese learners.

## Current scope

This milestone provides:

- Google OAuth through Supabase Auth
- learner profiles and protected onboarding/dashboard routes
- a curated question-bank schema for TOEIC Parts 1–7
- published-content RLS and a server-only answer-key boundary
- TypeScript question-bank types and a learner-safe server query
- 80 original, bilingual, validated Part 5 development questions

It currently provides authenticated TOEIC Part 5 practice with trusted server-side grading and basic answer review. Adaptive learning, skill analytics, test generation, AI tutoring, payments, and an administration UI are intentionally out of scope.

## Local setup

Requirements: Node.js 20.9+, npm, a Supabase project, and the Supabase CLI.

```bash
npm install
cp .env.example .env.local
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
npm run dev
```

Set these environment variables:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server | Public client key governed by RLS. |
| `SUPABASE_SECRET_KEY` | Server only | Trusted grading and content-management access. |

Never expose `SUPABASE_SECRET_KEY` in browser code or prefix it with `NEXT_PUBLIC_`.

The Part 5 seed script also accepts the legacy server-only variable name
`SUPABASE_SERVICE_ROLE_KEY` to support older local environments.

## Database

Migrations in `supabase/migrations` are the source of truth:

1. `20260905130000_create_profiles_table.sql` creates private learner profiles without changing Supabase Auth.
2. The two `20260906...` migrations are retained migration history for the old prototype.
3. `20260912120000_create_toeic_question_bank.sql` removes that obsolete prototype data model and creates `passages`, `questions`, `question_options`, and protected `question_solutions`. It never modifies `auth.users` or `profiles`.
4. `20260912150000_create_part5_practice.sql` adds owned practice sessions, assigned questions, server-graded answers, RLS, and transactional start/submission functions.

Authenticated learners can select only published passages, questions, and their options. Browser roles cannot insert, update, or delete bank content and cannot read `question_solutions`. Service-role server code manages content and grades an authenticated learner's owned attempt before returning a review.

### Content model

- `questions.toeic_part` supports Parts 1–7.
- `skill` and `sub_skill` are intentionally flexible text fields for an MVP taxonomy.
- Difficulty is `easy`, `medium`, or `hard`, a simple product-relative scale suited to filtering and future selection.
- Choices use relational rows rather than JSONB, allowing three or four options (or future formats) without rewriting a whole question document.
- A nullable `passage_id` lets multiple questions share Part 3/4 audio or Part 6/7 content.
- `audio_url` and `image_url` exist on both passages and questions: shared media belongs on the passage, while question-specific media (for example a Part 1 photo or Part 2 recording) belongs on the question.
- Draft, published, and archived statuses provide a content-review lifecycle.

## Google OAuth

Keep the Google client credentials in Google Cloud and Supabase—not in this repository.

1. Enable Google under **Supabase Dashboard → Authentication → Providers**.
2. Add the Supabase provider callback URL to the Google OAuth client's authorized redirect URIs.
3. Add `http://localhost:3000/auth/callback` (and the production equivalent) to Supabase Authentication URL Configuration.

The application callback exchanges the temporary code for a cookie-backed session. Existing profile and onboarding behavior remains unchanged.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Part 5 development seed

The seed is an explicit development/admin operation; it is not included in a
production migration. It uses deterministic question and option UUIDs plus
upserts, so rerunning it updates the same 80 records instead of adding copies.

Apply the Task 1 schema to the intended development project, then validate,
seed, and verify:

```bash
npx supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_REF
npx supabase db push
npm run validate:part5
npm run seed:part5
npm run verify:part5
```

`seed:part5` and `verify:part5` load `.env.local` and require
`NEXT_PUBLIC_SUPABASE_URL` plus either `SUPABASE_SECRET_KEY` or the legacy
`SUPABASE_SERVICE_ROLE_KEY`. The seed records are published so the next
milestone can exercise the existing learner-safe query; answer keys and both
explanations remain in the server-only `question_solutions` table.

## Next task

Task 4 — Results + Skill Analytics. The stored Task 3 attempt data is the source of truth; do not add analytics until explicitly approved.
