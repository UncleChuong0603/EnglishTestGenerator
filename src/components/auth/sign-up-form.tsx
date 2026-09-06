"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!email.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setSuccessMessage("Account created. Check your email to confirm your address, then sign in.");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/">← Back to home</Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-2 text-slate-600">Start with an email address and password. Your learning profile comes later.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold" htmlFor="email">
            Email address
            <input autoComplete="email" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" id="email" name="email" required type="email" />
          </label>
          <label className="block text-sm font-semibold" htmlFor="password">
            Password
            <input autoComplete="new-password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" id="password" minLength={8} name="password" required type="password" />
          </label>
          <label className="block text-sm font-semibold" htmlFor="confirmPassword">
            Confirm password
            <input autoComplete="new-password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" id="confirmPassword" name="confirmPassword" required type="password" />
          </label>
          {errorMessage ? <p aria-live="polite" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p> : null}
          {successMessage ? <p aria-live="polite" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{successMessage}</p> : null}
          <button className="w-full rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">Already have an account? <Link className="font-semibold text-teal-700 hover:text-teal-800" href="/sign-in">Sign in</Link>.</p>
      </section>
    </main>
  );
}
