import type { Metadata } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { getTranslations } from "@/lib/i18n/runtime";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslations(await getCookieLanguage());
  return { metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"), title: { default: t.metadata.title, template: `%s | ${t.common.brand}` }, description: t.metadata.description, openGraph: { title: t.metadata.title, description: t.metadata.description, type: "website", siteName: t.common.brand }, alternates: { canonical: "/" } };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCookieLanguage();
  return (
    <html lang={locale}>
      <body><LocaleProvider locale={locale}>{children}</LocaleProvider></body>
    </html>
  );
}
