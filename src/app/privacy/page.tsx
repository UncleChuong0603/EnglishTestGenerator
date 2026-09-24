import { LegalPage } from "@/components/legal-page";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
export const metadata = publicPageMetadata({ title: "Chính sách quyền riêng tư", description: "Cách TOEIC GYM thu thập, sử dụng và bảo vệ thông tin của bạn.", canonical: "/privacy" });
export default async function PrivacyPage() { const user = await getCurrentUser(); const preferences = await getPreferences(user?.id); return <LegalPage locale={preferences.interfaceLanguage} signedIn={Boolean(user)} type="privacy" />; }
