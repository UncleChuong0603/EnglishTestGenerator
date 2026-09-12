import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEIC Practice | Focused practice for Vietnamese learners",
  description: "Curated TOEIC Listening and Reading practice for Vietnamese learners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
