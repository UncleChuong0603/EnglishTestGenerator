import { Suspense } from "react";

import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-50">Loading sign in…</main>}>
      <SignInForm />
    </Suspense>
  );
}
