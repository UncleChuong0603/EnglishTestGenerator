"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callbackFailed =
    searchParams.get("error") === "oauth_callback_failed";

  async function signInWithGoogle() {
    setErrorMessage("");
    setIsSubmitting(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.url) {
      setErrorMessage(
        "Google sign-in could not be started. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }

    window.location.assign(data.url);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setErrorMessage("Enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <Link
          className="text-sm font-semibold text-teal-700 hover:text-teal-800"
          href="/"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Sign in
        </h1>

        <p className="mt-2 text-slate-600">
          Continue with your Google account to use VSTEP Practice.
        </p>

        {callbackFailed ? (
          <p
            aria-live="polite"
            className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            Google sign-in did not finish. Please try again.
          </p>
        ) : null}

        {errorMessage ? (
          <p
            aria-live="polite"
            className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}

        <button
          className="mt-8 flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={signInWithGoogle}
          type="button"
        >
          {isSubmitting
            ? "Connecting to Google…"
            : "Continue with Google"}
        </button>

        <p className="mt-6 text-slate-600">
          Or use the email address and password from your VSTEP Practice
          account.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label
            className="block text-sm font-semibold"
            htmlFor="email"
          >
            Email address
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              id="email"
              name="email"
              required
              type="email"
            />
          </label>

          <label
            className="block text-sm font-semibold"
            htmlFor="password"
          >
            Password
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              id="password"
              name="password"
              required
              type="password"
            />
          </label>

          <button
            className="w-full rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          New here?{" "}
          <Link
            className="font-semibold text-teal-700 hover:text-teal-800"
            href="/sign-up"
          >
            Create an account
          </Link>
          .
        </p>
      </section>
    </main>
  );
}