import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { RestoreFeedbackButton } from "@/components/feedback-widget";
import { SupportForm } from "@/components/support-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({ title: "Góp ý & hỗ trợ", description: "Gửi góp ý cho TOEIC GYM hoặc liên hệ Zalo 0389217724 khi cần hỗ trợ gấp.", canonical: "/support" });

export default async function SupportPage() {
  const user = await getCurrentUser();
  const { interfaceLanguage: locale } = await getPreferences(user?.id);
  const vi = locale === "vi";
  return <div className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <main className="px-4 py-10 sm:py-14">
      <section id="feedback" aria-labelledby="support-title" className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 id="support-title" className="text-2xl font-bold">{vi ? "Góp ý & hỗ trợ" : "Feedback & support"}</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-500">{vi ? "Chia sẻ góp ý hoặc vấn đề bạn gặp. TOEIC GYM luôn lắng nghe bạn." : "Share your feedback or tell us what went wrong. The TOEIC GYM team is here to help."}</p>
        <SupportForm locale={locale} email={user?.email} />
        <RestoreFeedbackButton locale={locale} />
      </section>
    </main>
    <PublicFooter locale={locale} />
  </div>;
}
