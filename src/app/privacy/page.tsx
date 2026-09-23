import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
export const metadata: Metadata = { title: "Chính sách quyền riêng tư", description: "Cách TOEIC GYM thu thập, sử dụng và bảo vệ thông tin của bạn.", alternates: { canonical: "/privacy" } };
export default async function PrivacyPage() { const user = await getCurrentUser(); const preferences = await getPreferences(user?.id); return <LegalPage locale={preferences.interfaceLanguage} signedIn={Boolean(user)} type="privacy" />; }
