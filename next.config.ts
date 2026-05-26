import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile devices on the same LAN to access dev server JS assets
  allowedDevOrigins: ["10.201.8.36", "localhost"],
};

export default nextConfig;
