import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { LocaleProvider } from "@/components/locale-provider";
import { ProductEvent } from "@/components/product-event";
import { FeedbackWidget } from "@/components/feedback-widget";
import { MascotCoach } from "@/components/mascot/mascot-coach";
import { MotionOrchestrator } from "@/components/motion/motion-orchestrator";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { getTranslations } from "@/lib/i18n/runtime";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

// Set the route surface before first paint so dark product/admin pages do not
// flash the light public theme while the client orchestrator hydrates.
const initialSurfaceScript = `(function(){var p=location.pathname;var f=/^\\/(practice|diagnostic|demo-test|full-mock|ranking\\/challenges\\/run|challenge\\/part-5)\\/[^/]+/;var m=/^\\/(?:$|ve-toeic-gym(?:\\/|$)|pricing(?:\\/|$)|toeic(?:\\/|$)|luyen-thi-toeic-online(?:\\/|$)|thi-thu-toeic-online(?:\\/|$))/;document.documentElement.dataset.uiSurface=p.indexOf('/admin')===0?'admin':f.test(p)?'focus':m.test(p)?'marketing':'product'})()`;

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslations(await getCookieLanguage());
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: t.metadata.title, template: `%s | ${t.common.brand}` },
    description: t.metadata.description,
    openGraph: {
      title: t.metadata.title,
      description: t.metadata.description,
      type: "website",
      siteName: t.common.brand,
      images: [{ url: "/brand/toeic-gym-social.png", width: 1200, height: 630, alt: "TOEIC GYM: luyện tập, theo dõi tiến bộ và tập trung vào điểm yếu" }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/toeic-gym-social.png"] },
    verification: googleVerification ? { google: googleVerification } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCookieLanguage();
  return (
    <html className={beVietnamPro.variable} lang={locale} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: initialSurfaceScript }} /></head>
      <body><ProductEvent/><LocaleProvider locale={locale}>{children}<MotionOrchestrator /><MascotCoach /><FeedbackWidget /></LocaleProvider></body>
    </html>
  );
}
