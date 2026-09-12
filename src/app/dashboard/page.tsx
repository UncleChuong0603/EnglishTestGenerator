import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/profiles/profile";
import { createClient } from "@/lib/supabase/server";

import { signOut } from "./actions";

const foundationHighlights = [
  ["Parts 1–7", "One question model supports every Listening and Reading part."],
  ["Curated content", "Only reviewed, published questions will be available to learners."],
  ["Secure grading", "Answer keys remain behind the trusted server boundary."],
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const profileResult = await getCurrentProfile(user.id);

  if (profileResult.status === "missing") {
    redirect("/onboarding");
  }

  if (profileResult.status === "error") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            We could not load your profile
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Please try again in a moment.
          </p>
          <Link
            className="mt-6 inline-flex rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/"
          >
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  const welcomeName = profileResult.profile.full_name ?? user.email ?? "learner";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-xl font-black" href="/">
            TOEIC Practice
          </Link>
          <form action={signOut}>
            <button
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-10 rounded-3xl bg-slate-900 p-8 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-300">
            Your learning space
          </p>
          <h1 className="mt-3 text-4xl font-black">Welcome, {welcomeName}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            The TOEIC Listening &amp; Reading question bank foundation is ready.
            Curated Part 5 practice will be enabled after the initial content has
            been reviewed and published.
          </p>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          {foundationHighlights.map(([title, body]) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-6"
              key={title}
            >
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
