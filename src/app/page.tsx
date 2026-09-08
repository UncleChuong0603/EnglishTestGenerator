import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const learningSteps = [
  {
    number: "01",
    title: "Practise with focus",
    description:
      "Complete VSTEP-style Reading exercises selected from a curated question bank.",
  },
  {
    number: "02",
    title: "Understand your result",
    description:
      "Review every answer, explanation, and the skill tested by each question.",
  },
  {
    number: "03",
    title: "Strengthen weak skills",
    description:
      "Future practice gives more attention to skills where your recent performance is weaker.",
  },
];

const features = [
  {
    title: "Curated question bank",
    description:
      "Practise with reviewed passages and questions designed around useful VSTEP Reading skills.",
  },
  {
    title: "Instant scoring",
    description:
      "Receive deterministic scores and review every answer with a clear explanation.",
  },
  {
    title: "Adaptive practice",
    description:
      "Your practice mix changes based on previous results while keeping all important skills in rotation.",
  },
];

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/dashboard" : "/sign-in";
  const primaryLabel = user ? "Dashboard" : "Start practising";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8"
      >
        <Link className="text-lg font-bold tracking-tight" href="/">
          VSTEP Practice
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              href="/dashboard"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              href="/sign-in"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Reading practice for Vietnamese learners
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Focused practice, chosen for you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Build confidence with curated VSTEP-style Reading questions,
            instant scoring, skill insights, and practice that responds to
            your learning history.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
              href={primaryHref}
            >
              {primaryLabel}
            </Link>

            <a
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
              href="#how-it-works"
            >
              See how it works
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Independent practice inspired by VSTEP formats. Not an official
            examination service.
          </p>
        </div>

        <aside
          aria-label="Example adaptive practice"
          className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl sm:p-9"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-300">
            Your next practice
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Reading: finding details
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            Your recent results suggest that detail questions need more
            practice, so they receive extra weight in your next set.
          </p>

          <div className="mt-8 rounded-2xl bg-white/10 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">
                  Recent accuracy
                </p>

                <p className="mt-1 text-3xl font-bold">3 / 8</p>
              </div>

              <span className="text-sm font-semibold text-teal-300">
                Needs practice
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[38%] rounded-full bg-teal-400" />
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-400">
            Other skills remain in rotation so practice stays balanced instead
            of becoming repetitive.
          </p>
        </aside>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 sm:px-8 md:grid-cols-3">
        {features.map((feature) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            key={feature.title}
          >
            <h2 className="text-xl font-bold">
              {feature.title}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-6xl border-t border-slate-200 px-5 py-16 sm:px-8"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          How it works
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          One simple learning loop
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {learningSteps.map((step) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              key={step.number}
            >
              <p className="text-sm font-bold text-teal-700">
                {step.number}
              </p>

              <h3 className="mt-6 text-xl font-bold">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="rounded-3xl bg-teal-50 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
            Adaptive Reading practice
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Practice the skills that matter most right now.
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-700">
            Questions are selected from the question bank using your skill
            history, difficulty level, and recent performance. Weaker skills
            receive more attention while stronger skills stay in the mix.
          </p>

          <Link
            className="mt-6 inline-flex rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
            href={primaryHref}
          >
            {user ? "Continue practising" : "Start practising"}
          </Link>
        </div>
      </section>
    </main>
  );
}