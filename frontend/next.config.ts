import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lionitas.instawp.site",
      },
    ],
  },
};

export default nextConfig;
