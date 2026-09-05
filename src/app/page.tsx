import Link from "next/link";

const learningSteps = [
  {
    number: "01",
    title: "Practise with focus",
    description: "Take short VSTEP-style exercises built around one skill at a time.",
  },
  {
    number: "02",
    title: "Understand your result",
    description: "Review answers and see the skill behind each question.",
  },
  {
    number: "03",
    title: "Know what to do next",
    description: "Get a clear next practice action based on the skills you need most.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 sm:px-10 lg:px-16">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between">
        <a className="text-lg font-bold tracking-tight" href="#top">
          VSTEP Practice
        </a>
        <div className="flex items-center gap-3">
          <Link className="text-sm font-semibold text-slate-700 hover:text-teal-700" href="/sign-in">Sign in</Link>
          <Link className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800" href="/sign-up">Create account</Link>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
          Coming soon
        </span>
      </nav>

      <section id="top" className="mx-auto grid max-w-6xl gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            English practice for Vietnamese learners
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Practise English with a clear next step.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Build confidence for VSTEP-style English practice with short exercises, understandable results, and guidance that helps you choose what to study next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2" href="#how-it-works">
              See how it works
            </a>
            <a className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2" href="#first-release">
              What we are building
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            A learning tool for VSTEP-style practice — not an official VSTEP examination service.
          </p>
        </div>

        <aside className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl sm:p-9" aria-label="Example learner progress">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-300">Your next practice</p>
          <h2 className="mt-3 text-2xl font-bold">Reading: finding details</h2>
          <p className="mt-3 leading-7 text-slate-300">
            Practise locating specific information in a short passage, then review each answer.
          </p>
          <div className="mt-8 rounded-2xl bg-white/10 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-300">Example skill progress</p>
                <p className="mt-1 text-3xl font-bold">3 / 8</p>
              </div>
              <span className="text-sm font-semibold text-teal-300">Start small</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[38%] rounded-full bg-teal-400" />
            </div>
          </div>
        </aside>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl border-t border-slate-200 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">How it will work</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">One simple learning loop</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {learningSteps.map((step) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={step.number}>
              <p className="text-sm font-bold text-teal-700">{step.number}</p>
              <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="first-release" className="mx-auto max-w-6xl rounded-3xl bg-teal-50 p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">First release</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">Start with reliable reading practice.</h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-700">
          We are building the foundation before adding advanced features: a dependable app shell today, then accounts, curated reading practice, scoring, and feedback in small, testable steps.
        </p>
      </section>
    </main>
  );
}
