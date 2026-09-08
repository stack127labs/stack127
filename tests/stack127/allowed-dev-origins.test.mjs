import assert from "node:assert/strict";
import test from "node:test";

import {
  collectAllowedDevOrigins,
  isTailscaleIpv4,
} from "../../lib/allowed-dev-origins.ts";

test("Tailscale IPv4 detection accepts only the CGNAT allocation", () => {
  assert.equal(isTailscaleIpv4("100.64.0.1"), true);
  assert.equal(isTailscaleIpv4("100.127.255.254"), true);
  assert.equal(isTailscaleIpv4("100.63.255.255"), false);
  assert.equal(isTailscaleIpv4("100.128.0.1"), false);
  assert.equal(isTailscaleIpv4("192.168.1.10"), false);
  assert.equal(isTailscaleIpv4("not-an-ip"), false);
});

test("development origins include loopback and every current Tailscale IPv4 address", () => {
  const origins = collectAllowedDevOrigins({
    eth0: [
      {
        address: "192.168.1.10",
        family: "IPv4",
        internal: false,
      },
    ],
    tailscale0: [
      {
        address: "100.86.117.125",
        family: "IPv4",
        internal: false,
      },
      {
        address: "fd7a:115c:a1e0::1",
        family: "IPv6",
        internal: false,
      },
    ],
  });

  assert.deepEqual(origins, ["127.0.0.1", "100.86.117.125"]);
});

test("development origins are stable when interfaces are missing or repeated", () => {
  const origins = collectAllowedDevOrigins({
    tailscale0: [
      {
        address: "100.86.117.125",
        family: 4,
        internal: false,
      },
      {
        address: "100.86.117.125",
        family: "IPv4",
        internal: false,
      },
    ],
    unavailable: undefined,
  });

  assert.deepEqual(origins, ["127.0.0.1", "100.86.117.125"]);
});
