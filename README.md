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
