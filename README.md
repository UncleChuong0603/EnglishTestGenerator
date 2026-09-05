# VSTEP Practice

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
