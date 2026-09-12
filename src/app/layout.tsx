import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEIC Practice | Focused practice for Vietnamese learners",
  description: "Focused TOEIC Part 5 practice with bilingual explanations and skill progress for Vietnamese learners.",
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
