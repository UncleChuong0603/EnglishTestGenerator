import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { LocaleProvider } from "@/components/locale-provider";
import { ProductEvent } from "@/components/product-event";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslations(await getCookieLanguage());
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
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCookieLanguage();
  return (
    <html className={beVietnamPro.variable} lang={locale}>
      <body><ProductEvent/><LocaleProvider locale={locale}>{children}</LocaleProvider></body>
    </html>
  );
}
