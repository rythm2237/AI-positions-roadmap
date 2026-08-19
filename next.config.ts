// next.config.ts
import type { NextConfig } from "next";

const LEGACY_PUBLIC_HOST = "career.rythm-os.com";
const PRIMARY_PUBLIC_ORIGIN = "https://www.airolepath.com";

const privateRoutePatterns = [
  "/admin/:path*",
  "/api/:path*",
  "/auth/:path*",
  "/account/:path*",
  "/dashboard/:path*",
  "/login/:path*",
  "/onboarding/:path*",
  "/profile/:path*",
  "/callback/:path*",
  "/preview/:path*",
  "/test/:path*",
  "/workspace/:path*",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_PUBLIC_HOST }],
        destination: `${PRIMARY_PUBLIC_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
  },
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
