import type { Metadata } from "next";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { SignUpForm } from "@/components/auth/auth-forms";
export const metadata: Metadata = { title: "Đăng ký", robots: { index: false, follow: true } };
export default async function SignUpPage() { return <SignUpForm locale={await getCookieLanguage()} />; }
