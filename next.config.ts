import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Serve tap logo at /favicon.ico so iMessage and crawlers get our icon, not Vercel's
      { source: "/favicon.ico", destination: "/tap.png" },
    ];
  },
};

export default nextConfig;
