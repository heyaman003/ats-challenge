import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["hebbkx1anhila5yf.public.blob.vercel-storage.com"], // Allow external image domain
  },
    serverExternalPackages: ["pdf-parse"],
    eslint: {
      ignoreDuringBuilds: true,
    },
  
};

export default nextConfig;
