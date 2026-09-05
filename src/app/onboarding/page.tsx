import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/profiles/profile";
import { createClient } from "@/lib/supabase/server";

import { saveProfile } from "./actions";

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function getSuggestedName(metadata: Record<string, unknown>): string {
  const name = metadata.full_name ?? metadata.name;

  return typeof name === "string" ? name : "";
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const [{ error: queryError }, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/sign-in");
  }

  const profileResult = await getCurrentProfile(user.id);

  if (profileResult.status === "found") {
    redirect("/dashboard");
  }

  const errorMessage =
    queryError === "invalid_name"
      ? "Enter a name between 2 and 100 characters."
      : queryError === "save_failed" || profileResult.status === "error"
        ? "We could not save your profile. Please try again."
        : null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/">
          ← Back to home
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">One last step</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Tell us what to call you</h1>
        <p className="mt-2 text-slate-600">This name will appear in your learning dashboard.</p>
        {errorMessage ? (
          <p aria-live="polite" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <form action={saveProfile} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold" htmlFor="fullName">
            Full name
            <input
              autoComplete="name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              defaultValue={getSuggestedName(user.user_metadata)}
              id="fullName"
              maxLength={100}
              minLength={2}
              name="fullName"
              required
              type="text"
            />
          </label>
          <button className="w-full rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2" type="submit">
            Save and continue
          </button>
        </form>
      </section>
    </main>
  );
}
