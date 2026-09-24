import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com; upgrade-insecure-requests" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

// Authentication protects the data; this header keeps application and session
// URLs out of search results even when a redirect is streamed as a 200 page.
const noindexPaths = [
  "/admin/:path*",
  "/dashboard/:path*",
  "/practice/:path*",
  "/progress/:path*",
  "/settings/:path*",
  "/demo-test/:path*",
  "/full-mock/:path*",
  "/billing/:path*",
  "/vocabulary/:path*",
  "/mistakes/:path*",
  "/listening-lessons/:path*",
  "/onboarding/:path*",
  "/continue-learning/:path*",
  "/activate-account",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/sign-in",
  "/sign-up",
  "/ranking/:path*",
  "/challenge/part-5/:sessionId/:path*",
  "/diagnostic/:runId/:path*",
];

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["toeicgym.net", "www.toeicgym.net"],
      // A listening lesson can include a 15 MiB MP3 and a 5 MiB image.
      bodySizeLimit: "22mb",
    },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      ...noindexPaths.map((source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] })),
    ];
  },
  async redirects() {
    return [{ source: "/admin/content/posts/:path*", destination: "/admin/posts/:path*", permanent: true }];
  },
  // Avoid treating an unrelated lockfile higher in the user profile as the
  // application root.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
