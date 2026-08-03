// next.config.ts
import type { NextConfig } from "next";

const privateRoutePatterns = [
  "/admin/:path*",
  "/api/:path*",
  "/auth/:path*",
  "/account/:path*",
  "/dashboard/:path*",
  "/onboarding/:path*",
  "/callback/:path*",
  "/preview/:path*",
  "/test/:path*",
  "/workspace/:path*",
];

const nextConfig: NextConfig = {
  async headers() {
    return privateRoutePatterns.map((source) => ({
      source,
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow, noarchive, nosnippet",
        },
      ],
    }));
  },
};

export default nextConfig;
