import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  distDir: process.env.STACK127_TEST_DIST_DIR ?? ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tulgfrqamtcshdtmhvpx.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/stack127-media/directories/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "phhrfvmncpqqmmgruktx.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/stack127-media/directories/**",
        search: "",
      },
    ],
  },
  output: "standalone",
  outputFileTracingIncludes: {
    "/local-security-cameras": ["./lib/hardware-directories/data/local-security-cameras.json"],
    "/matter-devices": ["./lib/hardware-directories/data/matter-devices.json"],
    "/nut-compatible-ups": ["./lib/hardware-directories/data/nut-compatible-ups.json"],
    "/z-wave-devices": ["./lib/hardware-directories/data/z-wave-devices.json"],
    "/zigbee-coordinators": ["./lib/hardware-directories/data/zigbee-coordinators.json"],
  },
  async redirects() {
    return [
      { source: "/dns-tools/caa-checker", destination: "/caa-checker", permanent: true },
      { source: "/dns-tools/dns-change-checker", destination: "/dns-change-checker", permanent: true },
      { source: "/dns-tools/dns-lookup", destination: "/dns-lookup", permanent: true },
      { source: "/dns-tools/dns-trace", destination: "/dns-trace", permanent: true },
      { source: "/dns-tools/dnssec-checker", destination: "/dnssec-checker", permanent: true },
      { source: "/dns-tools/nameserver-checker", destination: "/nameserver-checker", permanent: true },
      { source: "/dns-tools/soa-checker", destination: "/soa-checker", permanent: true },
      { source: "/domain-tools/domain-age", destination: "/domain-age", permanent: true },
      { source: "/domain-tools/domain-availability", destination: "/domain-availability", permanent: true },
      { source: "/domain-tools/domain-expiry", destination: "/domain-expiry", permanent: true },
      { source: "/domain-tools/domain-lookup", destination: "/domain-lookup", permanent: true },
      { source: "/domain-tools/domain-owner", destination: "/domain-owner", permanent: true },
      { source: "/domain-tools/domain-registrar", destination: "/domain-registrar", permanent: true },
      { source: "/domain-tools/domain-report", destination: "/domain-report", permanent: true },
      { source: "/domain-tools/epp-status-codes", destination: "/epp-status-codes", permanent: true },
      { source: "/domain-tools/multi-tld-availability", destination: "/multi-tld-availability", permanent: true },
      { source: "/domain-tools/punycode-converter", destination: "/punycode-converter", permanent: true },
      { source: "/domain-tools/tld-directory", destination: "/tld-directory", permanent: true },
      { source: "/domain-tools/transfer-readiness", destination: "/transfer-readiness", permanent: true },
      { source: "/storage-tools/raid-calculator", destination: "/raid-calculator", permanent: true },
      { source: "/storage-tools/raidz-expansion-planner", destination: "/raidz-expansion-planner", permanent: true },
      { source: "/storage-tools/zfs-capacity-calculator", destination: "/zfs-capacity-calculator", permanent: true },
      { source: "/storage-tools/zfs-padding-calculator", destination: "/zfs-padding-calculator", permanent: true },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
