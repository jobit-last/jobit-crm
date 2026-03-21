import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ["@react-pdf/renderer"],
  webpack: (config) => {
    // @react-pdf/renderer uses canvas which is unavailable in Next.js server context
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
