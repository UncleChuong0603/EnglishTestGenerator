import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Avoid treating an unrelated lockfile higher in the user profile as the
  // application root.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
