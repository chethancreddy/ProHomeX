import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Temporary bypass for allowedDevOrigins typing
  allowedDevOrigins: ['192.168.31.200'],
};

export default nextConfig;
