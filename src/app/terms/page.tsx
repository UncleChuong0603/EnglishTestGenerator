import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
export const metadata: Metadata = { title: "Terms", description: "Beta terms of use for TOEIC Gym.", alternates: { canonical: "/terms" } };
export default async function TermsPage() { const user = await getCurrentUser(); const preferences = await getPreferences(user?.id); return <LegalPage locale={preferences.interfaceLanguage} signedIn={Boolean(user)} type="terms" />; }
