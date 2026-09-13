import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getCookieLanguage, getTranslations } from "@/lib/i18n/get-translations";

export default async function SignInPage() {
  const locale = await getCookieLanguage();
  const t = getTranslations(locale);
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-50">{t.auth.loading}</main>}><SignInForm locale={locale} /></Suspense>;
}
