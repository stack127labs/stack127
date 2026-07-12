import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  distDir: process.env.VERSION127_TEST_DIST_DIR ?? ".next",
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
