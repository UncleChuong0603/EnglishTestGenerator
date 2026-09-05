import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/profiles/profile";
import { createClient } from "@/lib/supabase/server";

import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
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
          <h1 className="text-3xl font-bold tracking-tight">We could not load your profile</h1>
          <p className="mt-4 leading-7 text-slate-600">Please try again in a moment.</p>
          <Link className="mt-6 inline-flex rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50" href="/">
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  const { profile } = profileResult;
  const signedInWithGoogle = user.app_metadata.provider === "google";
  const welcomeName = profile.full_name ?? user.email ?? "learner";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Protected page</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Welcome, {welcomeName}</h1>
        <p className="mt-4 leading-7 text-slate-600">
          You are signed in as <strong className="font-semibold text-slate-900">{user.email ?? "your account"}</strong>.
        </p>
        {signedInWithGoogle ? <p className="mt-3 text-sm font-medium text-teal-700">Authenticated with Google</p> : null}
        <p className="mt-3 leading-7 text-slate-600">
          This is only a profile and authentication placeholder. The learner dashboard will be built in a later milestone.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <form action={signOut}>
            <button className="rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" type="submit">
              Sign out
            </button>
          </form>
          <Link className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
