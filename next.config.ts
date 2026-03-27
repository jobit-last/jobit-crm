import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  // @react-pdf/renderer uses canvas which is unavailable in Next.js server context
  serverExternalPackages: ["canvas", "@react-pdf/renderer"],
};

export default nextConfig;
