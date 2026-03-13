import type { NextConfig } from "next";

// Static export is required for Tauri/Desktop builds
// Set STATIC_EXPORT=true to enable
const isStaticExport = process.env.STATIC_EXPORT === "true";

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

  // Conditional: Static export for Tauri, standard for Vercel
  ...(isStaticExport && {
    output: "export",
    distDir: "out",
  }),

  images: {
    // Unoptimized required for static export
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
