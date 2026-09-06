import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VSTEP Practice | English practice made clear",
  description: "A practical English practice platform for Vietnamese VSTEP learners.",
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
