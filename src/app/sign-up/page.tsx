import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { SignUpForm } from "@/components/auth/auth-forms";
export default async function SignUpPage() { return <SignUpForm locale={await getCookieLanguage()} />; }
