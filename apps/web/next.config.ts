import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@timebeat/ui",
    "@timebeat/core",
    "@timebeat/hooks",
    "@timebeat/utils",
    "@timebeat/types",
    "@timebeat/constants",
  ],
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
