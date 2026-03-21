import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer uses canvas which is unavailable in Next.js server context
  serverExternalPackages: ["canvas"],
};

export default nextConfig;
