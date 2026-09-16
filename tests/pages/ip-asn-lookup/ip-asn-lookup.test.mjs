import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  NetworkInputError,
  parseIpLiteral,
  parseNetworkQuery,
} from "../../../lib/ip-asn/input.ts";
import {
  networkRegistryName,
  networkServiceForQuery,
  reviewedNetworkBase,
} from "../../../lib/ip-asn/bootstrap.ts";
import {
  buildNetworkResult,
  rdapStatusFromHttp,
} from "../../../lib/ip-asn/normalize.ts";
import { rdapUrlForNetworkQuery } from "../../../lib/ip-asn/resolve.ts";

function fixture(name) {
  return JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"));
}

function registeredFetch(body, overrides = {}) {
  return {
    status: "registered",
    httpStatus: 200,
    url: "https://rdap.example.test/rdap/object",
    source: "network-registry",
    body,
    error: null,
    fetchedAt: "2026-09-10T00:00:00.000Z",
    fromCache: false,
    ...overrides,
  };
}

test("classifies public IPv4, IPv6, and ASN forms without a type selector", () => {
  assert.deepEqual(parseNetworkQuery(" 1.1.1.1 "), {
    raw: "1.1.1.1",
    normalized: "1.1.1.1",
    kind: "ip",
    ipVersion: 4,
    address: "1.1.1.1",
    asn: null,
  });
  assert.equal(parseNetworkQuery("2001:4860:4860::8888").kind, "ip");
  assert.equal(parseNetworkQuery("13335").normalized, "AS13335");
  assert.equal(parseNetworkQuery("as13335").asn, 13335);
});

test("normalizes IPv6 literals with dotted IPv4 tails without changing their value", () => {
  assert.equal(parseIpLiteral("2001:4860::192.0.2.1")?.normalized, "2001:4860::c000:201");
  assert.equal(parseIpLiteral("2001:4860:0:0:0:0:192.0.2.1")?.normalized, "2001:4860::c000:201");
  assert.equal(parseIpLiteral("::ffff:192.0.2.1")?.normalized, "::ffff:c000:201");
});

test("rejects empty, malformed, CIDR, private, reserved, and private ASN input", () => {
  for (const candidate of [
    "",
    "not-an-ip",
    "1.1.1.0/24",
    "10.0.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "192.0.2.1",
    "::1",
    "fe80::1",
    "AS0",
    "AS23456",
    "AS64496",
    "AS64512",
    "AS65535",
    "AS65536",
    "AS4200000000",
    "AS4294967295",
  ]) {
    assert.throws(() => parseNetworkQuery(candidate), (error) => {
      assert.ok(error instanceof NetworkInputError);
      return true;
    }, candidate);
  }
});

test("rejects control characters, oversized input, and URL-shaped values before any network work", () => {
  for (const candidate of ["1.1.1.1\n", "https://example.com", "1.1.1.1/../../x", "x".repeat(257)]) {
    assert.throws(() => parseNetworkQuery(candidate), NetworkInputError, candidate);
  }
});

test("matches the committed IPv4 bootstrap to all five RIR services", () => {
  const expected = new Map([
    ["1.1.1.1", "APNIC"],
    ["8.8.8.8", "ARIN"],
    ["91.239.6.69", "RIPE NCC"],
    ["200.3.3.1", "LACNIC"],
    ["41.0.0.1", "AFRINIC"],
  ]);
  for (const [address, registry] of expected) {
    const query = parseNetworkQuery(address);
    const service = networkServiceForQuery(query);
    assert.equal(service?.registryName, registry, address);
    assert.equal(service?.baseUrl.startsWith("https://"), true, address);
  }
});

test("matches IPv6 and ASN bootstrap ranges and uses fixed RDAP paths", () => {
  const ip = parseNetworkQuery("2001:4860:4860::8888");
  const ipService = networkServiceForQuery(ip);
  assert.equal(ipService?.registryName, "ARIN");
  assert.equal(rdapUrlForNetworkQuery(ip, ipService), "https://rdap.arin.net/registry/ip/2001:4860:4860::8888");

  const asn = parseNetworkQuery("AS13335");
  const asnService = networkServiceForQuery(asn);
  assert.equal(asnService?.registryName, "ARIN");
  assert.equal(rdapUrlForNetworkQuery(asn, asnService), "https://rdap.arin.net/registry/autnum/13335");
  assert.equal(reviewedNetworkBase(asnService?.baseUrl ?? ""), true);
});

test("maps response statuses before inspecting the response body", () => {
  assert.equal(rdapStatusFromHttp(200), "registered");
  assert.equal(rdapStatusFromHttp(404), "not_registered");
  assert.equal(rdapStatusFromHttp(403), "blocked");
  assert.equal(rdapStatusFromHttp(429), "rate_limited");
  assert.equal(rdapStatusFromHttp(503), "registry_error");
});

test("normalizes an IP allocation, holder, abuse contact, dates, and source", () => {
  const query = parseNetworkQuery("1.1.1.1");
  const service = networkServiceForQuery(query);
  const result = buildNetworkResult({
    query,
    service,
    fetchResult: registeredFetch(fixture("apnic-ip")),
    routing: null,
    startedAt: 1000,
    now: () => new Date("2026-09-10T00:00:01.250Z"),
  });
  assert.equal(result.status, "registered");
  assert.equal(result.allocation?.range, "1.1.1.0 to 1.1.1.255");
  assert.equal(result.allocation?.name, "APNIC-LABS");
  assert.equal(result.holder?.organization, "APNIC Research and Development");
  assert.equal(result.abuse?.email, "helpdesk@apnic.net");
  assert.equal(result.registry?.name, "APNIC");
  assert.equal(result.events[0].action, "registration");
  assert.equal(result.checkedAt, "2026-09-10T00:00:01.250Z");
});

test("normalizes an ASN without inventing IP or routing fields", () => {
  const query = parseNetworkQuery("AS13335");
  const service = networkServiceForQuery(query);
  const result = buildNetworkResult({
    query,
    service,
    fetchResult: registeredFetch(fixture("arin-asn")),
    routing: null,
    startedAt: 1000,
    now: () => new Date("2026-09-10T00:00:01.000Z"),
  });
  assert.equal(result.status, "registered");
  assert.equal(result.autnum?.range, "AS13335");
  assert.equal(result.holder?.name, "Cloudflare, Inc.");
  assert.equal(result.abuse?.email, "abuse@cloudflare.com");
  assert.equal(result.allocation, null);
  assert.equal(result.routing, null);
});

test("keeps missing fields unknown and a malformed successful body unavailable", () => {
  const query = parseNetworkQuery("8.8.8.8");
  const service = networkServiceForQuery(query);
  const missing = buildNetworkResult({
    query,
    service,
    fetchResult: registeredFetch({ objectClassName: "ip network", startAddress: "8.8.8.0", endAddress: "8.8.8.255" }),
    routing: null,
    startedAt: 1000,
    now: () => new Date("2026-09-10T00:00:01.000Z"),
  });
  assert.equal(missing.allocation?.country, null);
  assert.equal(missing.holder, null);
  assert.equal(missing.abuse, null);

  const malformed = buildNetworkResult({
    query,
    service,
    fetchResult: registeredFetch({ objectClassName: "domain", ldhName: "example.com" }),
    routing: null,
    startedAt: 1000,
    now: () => new Date("2026-09-10T00:00:01.000Z"),
  });
  assert.equal(malformed.status, "registry_error");
  assert.equal(malformed.allocation, null);
});

test("keeps RIR registration and current BGP context as separate answers", () => {
  const query = parseNetworkQuery("1.1.1.1");
  const service = networkServiceForQuery(query);
  const result = buildNetworkResult({
    query,
    service,
    fetchResult: registeredFetch(fixture("apnic-ip")),
    routing: { source: "Team Cymru", asn: 13335, prefix: "1.1.1.0/24", countryCode: "AU", networkName: "CLOUDFLARENET" },
    startedAt: 1000,
    now: () => new Date("2026-09-10T00:00:01.000Z"),
  });
  assert.equal(result.holder?.organization, "APNIC Research and Development");
  assert.equal(result.routing?.asn, 13335);
  assert.ok(result.notes.some((note) => /different questions/i.test(note)));
});

test("uses no answer fields for 404, throttled, blocked, and timeout states", () => {
  const query = parseNetworkQuery("1.1.1.1");
  const service = networkServiceForQuery(query);
  for (const status of ["not_registered", "rate_limited", "blocked", "timeout", "registry_error"]) {
    const result = buildNetworkResult({
      query,
      service,
      fetchResult: registeredFetch(null, { status, httpStatus: status === "not_registered" ? 404 : null, body: null }),
      routing: null,
      startedAt: 1000,
      now: () => new Date("2026-09-10T00:00:01.000Z"),
    });
    assert.equal(result.status, status);
    assert.equal(result.allocation, null);
    assert.equal(result.holder, null);
  }
});

test("engine source stays independent of React and browser storage", () => {
  const source = readFileSync(new URL("../../../lib/ip-asn/resolve.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /react|document\.|window\.|localStorage|sessionStorage|dangerouslySetInnerHTML/i);
});
