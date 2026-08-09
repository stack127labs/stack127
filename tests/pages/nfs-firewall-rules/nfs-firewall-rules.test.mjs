import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  NFS_FIREWALL_FORMULA_VERSION,
  NFS_FIREWALL_SOURCE_DATE,
  buildNfsFirewallPlan,
} from "../../../lib/nfs-firewall/plan.ts";

function input(overrides = {}) {
  return {
    nfsVersion: "v4_1_plus",
    protectedHost: "server",
    firewallFamily: "firewalld",
    addressFamily: "ipv4",
    peerCidr: "192.0.2.0/24",
    transport: "tcp",
    firewalldZone: "home",
    mountdPort: "",
    statdPort: "",
    lockdTcpPort: "",
    lockdUdpPort: "",
    includeRquotad: false,
    rquotadPort: "",
    v4CallbackPort: "",
    ...overrides,
  };
}

function ready(candidate) {
  const actual = buildNfsFirewallPlan(candidate);
  assert.equal(actual.status, "ready", JSON.stringify(actual));
  return actual;
}

test("pins the formula and source date", () => {
  assert.equal(NFS_FIREWALL_FORMULA_VERSION, "nfs-firewall-plan-v1");
  assert.equal(NFS_FIREWALL_SOURCE_DATE, "2026-08-09");
});

test("plans fixed NFSv4 server listeners and separates v4.0 callbacks", () => {
  const current = ready(input());
  assert.deepEqual(current.rows.map((row) => [row.endpoint, row.direction, row.service, row.protocol, row.port, row.portSource]), [
    ["server", "inbound", "nfs", "tcp", 2049, "protocol_fixed"],
  ]);
  assert.equal(current.translation.status, "ready");
  assert.deepEqual(current.translation.commands, [
    `firewall-cmd --permanent --zone=home --add-rich-rule='rule family="ipv4" source address="192.0.2.0/24" port port="2049" protocol="tcp" accept'`,
  ]);
  assert.match(current.answer, /Allow 1 listener rule on the NFS server/);
  const v40 = ready(input({ nfsVersion: "v4_0", firewallFamily: "ufw", firewalldZone: "" }));
  assert.deepEqual(v40.rows.map((row) => [row.service, row.port]), [["nfs", 2049]]);
  assert.match(v40.boundaries.join(" "), /client callback/i);
});

test("returns no new inbound listener for an NFSv4.1+ client", () => {
  for (const firewallFamily of ["firewalld", "ufw", "nftables"]) {
    const actual = buildNfsFirewallPlan(input({ protectedHost: "client", peerCidr: "192.0.2.10/32", firewallFamily }));
    assert.equal(actual.status, "no_additional_rule");
    assert.equal("rows" in actual, false);
    assert.equal("translation" in actual, false);
    assert.match(actual.answer, /No new inbound callback listener/);
    assert.match(actual.verification.join(" "), /client-established session/i);
  }
});

test("requires and plans the NFSv4.0 client callback port", () => {
  const missing = buildNfsFirewallPlan(input({ nfsVersion: "v4_0", protectedHost: "client", peerCidr: "192.0.2.10/32", firewallFamily: "ufw", firewalldZone: "" }));
  assert.equal(missing.status, "incomplete");
  assert.deepEqual(missing.missing, ["v4CallbackPort"]);
  assert.equal("translation" in missing, false);
  const actual = ready(input({ nfsVersion: "v4_0", protectedHost: "client", peerCidr: "192.0.2.10/32", firewallFamily: "ufw", firewalldZone: "", v4CallbackPort: "32768" }));
  assert.deepEqual(actual.rows.map((row) => [row.service, row.protocol, row.port, row.portSource]), [["nfs4_callback", "tcp", 32768, "user_verified"]]);
  assert.deepEqual(actual.translation.commands, ["ufw allow in proto tcp from 192.0.2.10/32 to any port 32768 comment 'NFS nfs4_callback'"]);
  assert.doesNotMatch(actual.copyText, /\t2049\t/);
});

test("plans exact server NFSv3 TCP and explicit legacy UDP branches", () => {
  const base = input({
    nfsVersion: "v3",
    firewallFamily: "ufw",
    firewalldZone: "",
    mountdPort: "20048",
    statdPort: "32765",
    lockdTcpPort: "32766",
  });
  const tcp = ready(base);
  assert.deepEqual(tcp.rows.map((row) => [row.protocol, row.port, row.service, row.portSource]), [
    ["tcp", 111, "rpcbind", "protocol_fixed"],
    ["tcp", 2049, "nfs", "protocol_fixed"],
    ["tcp", 20048, "mountd", "user_verified"],
    ["tcp", 32765, "statd", "user_verified"],
    ["tcp", 32766, "lockd", "user_verified"],
  ]);
  const udp = ready({ ...base, transport: "tcp_udp", lockdUdpPort: "32767" });
  assert.equal(udp.rows.length, 10);
  assert.deepEqual(udp.rows.filter((row) => row.protocol === "udp").map((row) => [row.port, row.service]), [
    [111, "rpcbind"], [2049, "nfs"], [20048, "mountd"], [32765, "statd"], [32767, "lockd"],
  ]);
});

test("keeps client NFSv3 listeners separate from server services", () => {
  const actual = ready(input({
    nfsVersion: "v3",
    protectedHost: "client",
    firewallFamily: "nftables",
    peerCidr: "192.0.2.10/32",
    firewalldZone: "",
    mountdPort: "20048",
    statdPort: "32765",
    lockdTcpPort: "32766",
  }));
  assert.deepEqual(actual.rows.map((row) => row.service), ["rpcbind", "statd", "lockd"]);
  assert.doesNotMatch(actual.copyText, /mountd|\tnfs\t/);
  assert.deepEqual(actual.translation.commands, ["ip saddr 192.0.2.10/32 tcp dport { 111, 32765, 32766 } accept"]);
});

test("adds rquotad only to the selected server NFSv3 branch", () => {
  const actual = ready(input({
    nfsVersion: "v3", firewallFamily: "ufw", firewalldZone: "", mountdPort: "20048",
    statdPort: "32765", lockdTcpPort: "32766", includeRquotad: true, rquotadPort: "875",
  }));
  assert.deepEqual(actual.rows.filter((row) => row.service === "rquotad").map((row) => [row.protocol, row.port]), [["tcp", 875]]);
  const ignored = ready(input({ protectedHost: "server", includeRquotad: true, rquotadPort: "875" }));
  assert.equal(ignored.rows.some((row) => row.service === "rquotad"), false);
});

test("shows known fixed rows but withholds translation for incomplete v3", () => {
  const actual = buildNfsFirewallPlan(input({ nfsVersion: "v3", firewallFamily: "ufw", firewalldZone: "", mountdPort: "20048" }));
  assert.equal(actual.status, "incomplete");
  assert.deepEqual(actual.rows.map((row) => [row.service, row.port]), [["rpcbind", 111], ["nfs", 2049]]);
  assert.deepEqual(actual.missing, ["statdPort", "lockdTcpPort"]);
  assert.equal("translation" in actual, false);
  assert.equal("copyText" in actual, false);
});

test("rejects listener collisions instead of emitting plausible rows", () => {
  for (const overrides of [
    { mountdPort: "20048", statdPort: "20048", lockdTcpPort: "32766" },
    { mountdPort: "111", statdPort: "32765", lockdTcpPort: "32766" },
  ]) {
    const actual = buildNfsFirewallPlan(input({ nfsVersion: "v3", firewallFamily: "ufw", firewalldZone: "", ...overrides }));
    assert.equal(actual.status, "invalid");
    assert.match(Object.values(actual.errors).join(" "), /collision|share TCP port/i);
    assert.equal("rows" in actual, false);
  }
  const collisionBeforeCompleteness = buildNfsFirewallPlan(input({
    nfsVersion: "v3", firewallFamily: "ufw", firewalldZone: "", mountdPort: "111", statdPort: "", lockdTcpPort: "32766",
  }));
  assert.equal(collisionBeforeCompleteness.status, "invalid");
  assert.match(Object.values(collisionBeforeCompleteness.errors).join(" "), /(?:rpcbind and mountd|mountd and rpcbind).*TCP port 111/i);
  assert.equal("rows" in collisionBeforeCompleteness, false);
});

test("validates ports as bounded decimal strings", () => {
  for (const value of ["0", "65536", "-1", "+1", "1.5", "1e3", "0x6f", "1,024", "12 34", "port"]) {
    const actual = buildNfsFirewallPlan(input({ nfsVersion: "v4_0", protectedHost: "client", v4CallbackPort: value }));
    assert.equal(actual.status, "invalid", value);
    assert.equal(actual.errors.v4CallbackPort.length > 0, true);
  }
  for (const value of ["1", "65535", " 00001 "]) {
    const actual = ready(input({ nfsVersion: "v4_0", protectedHost: "client", firewallFamily: "ufw", firewalldZone: "", v4CallbackPort: value }));
    assert.equal(actual.rows[0].port, Number(value));
  }
});

test("validates IPv4 CIDR and warns for every-source prefixes", () => {
  for (const peerCidr of ["192.0.2.0/24", "192.0.2.1/32"]) assert.equal(ready(input({ peerCidr })).warnings.length, 0);
  assert.match(ready(input({ peerCidr: "0.0.0.0/0" })).warnings.join(" "), /every IPv4 source/i);
  for (const peerCidr of ["192.0.2.999/24", "192.0.2/24", "192.0.2.1/33", "01.2.3.4/24", "192.0.2.1", "example.com/24", "192.0.2.1//24", "2001:db8::/64"]) {
    const actual = buildNfsFirewallPlan(input({ peerCidr }));
    assert.equal(actual.status, "invalid", peerCidr);
    assert.match(actual.errors.peerCidr, /IPv4 CIDR/);
  }
});

test("validates IPv6 CIDR including compressed and embedded IPv4 forms", () => {
  for (const peerCidr of ["2001:DB8::/64", "::1/128", "2001:db8::192.0.2.1/128"]) {
    const actual = ready(input({ addressFamily: "ipv6", peerCidr, firewallFamily: "ufw", firewalldZone: "" }));
    assert.equal(actual.peerCidr, peerCidr.toLowerCase());
  }
  assert.match(ready(input({ addressFamily: "ipv6", peerCidr: "::/0", firewallFamily: "ufw", firewalldZone: "" })).warnings.join(" "), /every IPv6 source/i);
  for (const peerCidr of ["2001::db8::/64", "1:2:3:4:5:6:7:8:9/64", "2001:db8::gg/64", "2001:db8::/129", "fe80::1%eth0/64", "[2001:db8::1]/64", "2001:db8::1:2049", "2001:db8::1", "192.0.2.0/24"]) {
    const actual = buildNfsFirewallPlan(input({ addressFamily: "ipv6", peerCidr }));
    assert.equal(actual.status, "invalid", peerCidr);
    assert.match(actual.errors.peerCidr, /IPv6 CIDR/);
  }
});

test("keeps a neutral plan ready when firewalld context is missing", () => {
  const actual = ready(input({ firewalldZone: "" }));
  assert.equal(actual.translation.status, "missing_context");
  assert.equal("commands" in actual.translation, false);
  assert.equal("copyText" in actual, false);
  assert.match(actual.translation.note, /active firewalld zone/i);
});

test("rejects hostile zones and translates IPv6 firewalld explicitly", () => {
  for (const firewalldZone of ["home zone", "home/zone", `home'`, "home;id", "home\nzone", "$()", "`id`", "a".repeat(33), "høme"]) {
    const actual = buildNfsFirewallPlan(input({ firewalldZone }));
    assert.equal(actual.status, "invalid", JSON.stringify(firewalldZone));
    assert.equal("rows" in actual, false);
  }
  const actual = ready(input({ addressFamily: "ipv6", peerCidr: "2001:db8::/64", firewalldZone: "trusted_lab" }));
  assert.match(actual.translation.commands[0], /family="ipv6" source address="2001:db8::\/64"/);
});

test("translates source-scoped UFW and existing-chain nftables syntax", () => {
  const ufw = ready(input({ addressFamily: "ipv6", peerCidr: "2001:db8::/64", firewallFamily: "ufw", firewalldZone: "" }));
  assert.deepEqual(ufw.translation.commands, ["ufw allow in proto tcp from 2001:db8::/64 to any port 2049 comment 'NFS nfs'"]);
  assert.match(ufw.translation.note, /IPv6 is enabled in UFW/i);
  const nft = ready(input({
    nfsVersion: "v3", addressFamily: "ipv6", peerCidr: "2001:db8::/64", firewallFamily: "nftables", firewalldZone: "",
    mountdPort: "20048", statdPort: "32765", lockdTcpPort: "32766",
  }));
  assert.deepEqual(nft.translation.commands, ["ip6 saddr 2001:db8::/64 tcp dport { 111, 2049, 20048, 32765, 32766 } accept"]);
  assert.doesNotMatch(nft.translation.commands[0], /nft add rule|table|chain|hook/i);
});

test("includes bounded verification and a reviewable plain-text copy", () => {
  const actual = ready(input({ nfsVersion: "v3", firewallFamily: "ufw", firewalldZone: "", mountdPort: "20048", statdPort: "32765", lockdTcpPort: "32766" }));
  assert.match(actual.verification.join(" "), /rpcinfo -p/);
  assert.match(actual.verification.join(" "), /ss -lntup/);
  assert.match(actual.verification.join(" "), /Test the mount from the NFS client with mount -t nfs -o vers=3,proto=tcp/);
  assert.doesNotMatch(actual.verification.join(" "), /from the modeled peer/i);
  assert.match(actual.verification.join(" "), /findmnt/);
  assert.match(actual.verification.join(" "), /access denied/i);
  assert.match(actual.copyText, /nfs-firewall-plan-v1/);
  assert.match(actual.copyText, /source date\t2026-08-09/);
  assert.match(actual.copyText, /rpcbind\tinbound\t192\.0\.2\.0\/24\ttcp\t111\tprotocol fixed/);
  assert.match(actual.copyText, /Test the mount from the NFS client/);
  const protectedClient = ready(input({ nfsVersion: "v4_0", protectedHost: "client", firewallFamily: "ufw", firewalldZone: "", peerCidr: "192.0.2.10/32", v4CallbackPort: "32768" }));
  assert.match(protectedClient.verification.join(" "), /Test the mount from the NFS client with mount -t nfs -o vers=4\.0/);
  assert.doesNotMatch(protectedClient.verification.join(" "), /from the modeled peer/i);
});

test("rejects malformed public inputs, unknown keys, and prototype payloads", () => {
  const invalid = [
    null,
    [],
    input({ nfsVersion: "v5" }),
    input({ addressFamily: "inet" }),
    input({ includeRquotad: "yes" }),
    { ...input(), extra: "hostile" },
    Object.assign(Object.create(null), { ...input(), __proto__: "hostile" }),
  ];
  for (const candidate of invalid) {
    const actual = buildNfsFirewallPlan(candidate);
    assert.equal(actual.status, "invalid");
    assert.equal("rows" in actual, false);
    assert.equal("translation" in actual, false);
  }
  assert.equal({}.polluted, undefined);
});

test("is deterministic, immutable, local, and fast for the longest branch", () => {
  const candidate = Object.freeze(input({
    nfsVersion: "v3", transport: "tcp_udp", firewallFamily: "nftables", firewalldZone: "",
    addressFamily: "ipv6", peerCidr: "2001:db8::/64", mountdPort: "20048", statdPort: "32765",
    lockdTcpPort: "32766", lockdUdpPort: "32767", includeRquotad: true, rquotadPort: "875",
  }));
  const first = buildNfsFirewallPlan(candidate);
  const started = performance.now();
  for (let index = 0; index < 10_000; index += 1) assert.deepEqual(buildNfsFirewallPlan(candidate), first);
  assert.ok(performance.now() - started < 5_000);
  assert.equal(candidate.mountdPort, "20048");
});
