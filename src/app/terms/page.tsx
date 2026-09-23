import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
export const metadata: Metadata = { title: "Điều khoản sử dụng", description: "Các điều khoản khi sử dụng nền tảng luyện TOEIC GYM.", alternates: { canonical: "/terms" } };
export default async function TermsPage() { const user = await getCurrentUser(); const preferences = await getPreferences(user?.id); return <LegalPage locale={preferences.interfaceLanguage} signedIn={Boolean(user)} type="terms" />; }
