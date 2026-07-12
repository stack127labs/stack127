import type { NextConfig } from "next";
import { getUmamiProxyRewrites } from "./lib/analytics";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  distDir: process.env.VERSION127_TEST_DIST_DIR ?? ".next",
  output: "standalone",
  rewrites: async () => getUmamiProxyRewrites(),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
