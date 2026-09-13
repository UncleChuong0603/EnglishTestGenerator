import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
export const metadata: Metadata = { title: "Privacy", description: "Beta privacy notice for TOEIC Practice.", alternates: { canonical: "/privacy" } };
export default async function PrivacyPage() { const user = await getCurrentUser(); const preferences = await getPreferences(user?.id); return <LegalPage locale={preferences.interfaceLanguage} signedIn={Boolean(user)} type="privacy" />; }
