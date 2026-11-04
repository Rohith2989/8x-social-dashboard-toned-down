import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    // a stray package-lock.json sits in the user's home folder; this app's root is here
    root: __dirname,
  },
};

export default nextConfig;
