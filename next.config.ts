import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "www.toeicgym.net" }],
      destination: "https://toeicgym.net/:path*",
      permanent: true,
    }];
  },
  // Avoid treating an unrelated lockfile higher in the user profile as the
  // application root.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
