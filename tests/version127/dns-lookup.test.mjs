import assert from "node:assert/strict";
import test from "node:test";

import {
  buildUnifiedAliasChain,
  normalizeAliasEdges,
} from "../../lib/dns/alias-chain.ts";
import { normalizeDnsInput } from "../../lib/dns/normalize-name.ts";
import {
  normalizeProviderResponse,
  nullableBoolean,
} from "../../lib/dns/normalize-provider-response.ts";
import {
  COMMON_RECORD_TYPES,
  lookupDns,
} from "../../lib/dns/lookup.ts";
import {
  clearDnsLookupLimitsForTests,
  consumeDnsLookupLimit,
  rateLimitCost,
} from "../../lib/dns/rate-limit.ts";
import { formatResolverTtl, recordFields } from "../../lib/dns/format-record.ts";

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/dns-json" },
    status,
  });
}

test("normalizes domains, URLs, trailing dots, service names, and Unicode", () => {
  assert.equal(normalizeDnsInput(" Example.COM. ").normalizedName, "example.com");
  assert.equal(normalizeDnsInput("https://www.example.com/path").normalizedName, "www.example.com");
  assert.equal(normalizeDnsInput("_sip._tcp.example.com").normalizedName, "_sip._tcp.example.com");
  assert.equal(normalizeDnsInput("https://münich.example/path").normalizedName, "xn--mnich-kva.example");
  assert.throws(() => normalizeDnsInput("example.com:8080"), /valid DNS name or HTTP/);
  assert.throws(() => normalizeDnsInput("https://user:pass@example.com"), /credentials/);
});

test("nullableBoolean preserves true, false, and missing or invalid", () => {
  assert.equal(nullableBoolean(true), true);
  assert.equal(nullableBoolean(false), false);
  assert.equal(nullableBoolean(undefined), null);
  assert.equal(nullableBoolean(null), null);
  assert.equal(nullableBoolean(0), null);
  assert.equal(nullableBoolean("false"), null);
});

test("normalizes resolver TTL and never invents missing flags", () => {
  const normalized = normalizeProviderResponse({
    provider: "cloudflare",
    requestedName: "www.example.com",
    requestedType: "A",
    rawResponse: {
      Status: 0,
      AD: true,
      CD: false,
      Answer: [
        { name: "www.example.com.", type: 5, TTL: 300, data: "edge.example.net." },
        { name: "edge.example.net.", type: 1, TTL: "bad", data: "192.0.2.10" },
      ],
    },
    cnameAsTerminal: false,
  });

  assert.deepEqual(normalized.flags, {
    authenticatedData: true,
    checkingDisabled: false,
    recursionDesired: null,
    recursionAvailable: null,
    truncated: null,
  });
  assert.equal(normalized.aliasChain[0].resolverTtlSeconds, 300);
  assert.equal(normalized.terminalRecords[0].resolverTtlSeconds, null);
  assert.equal(normalized.terminalRecords[0].ownerName, "edge.example.net");
  assert.ok(normalized.warnings.some((warning) => warning.code === "provider_field_invalid"));
});

test("distinguishes absent optional sections from reported empty sections", () => {
  const absent = normalizeProviderResponse({
    provider: "google",
    requestedName: "example.com",
    requestedType: "A",
    rawResponse: { Status: 0 },
    cnameAsTerminal: false,
  });
  assert.equal(absent.authorityRecords, null);
  assert.equal(absent.additionalRecords, null);
  assert.equal(absent.comments, null);

  const empty = normalizeProviderResponse({
    provider: "google",
    requestedName: "example.com",
    requestedType: "A",
    rawResponse: { Status: 0, Authority: [], Additional: [], Comment: [] },
    cnameAsTerminal: false,
  });
  assert.deepEqual(empty.authorityRecords, []);
  assert.deepEqual(empty.additionalRecords, []);
  assert.deepEqual(empty.comments, []);

  const invalid = normalizeProviderResponse({
    provider: "google",
    requestedName: "example.com",
    requestedType: "A",
    rawResponse: { Status: 0, Authority: {}, Additional: "bad", Comment: 1 },
    cnameAsTerminal: false,
  });
  assert.equal(invalid.authorityRecords, null);
  assert.equal(invalid.additionalRecords, null);
  assert.equal(invalid.comments, null);
  assert.ok(invalid.warnings.length >= 3);
});

test("deduplicates a compatible alias chain and keeps the lowest reported resolver TTL", () => {
  const result = buildUnifiedAliasChain("www.example.com", [
    {
      requestedType: "A",
      aliasChain: [
        { from: "www.example.com", to: "edge.example.net", resolverTtlSeconds: 300 },
        { from: "edge.example.net", to: "origin.example.net", resolverTtlSeconds: 120 },
      ],
    },
    {
      requestedType: "AAAA",
      aliasChain: [
        { from: "www.example.com", to: "edge.example.net", resolverTtlSeconds: 280 },
      ],
    },
  ]);

  assert.equal(result.consistent, true);
  assert.deepEqual(result.aliasChain, [
    { from: "www.example.com", to: "edge.example.net", resolverTtlSeconds: 280 },
    { from: "edge.example.net", to: "origin.example.net", resolverTtlSeconds: 120 },
  ]);
});

test("does not collapse inconsistent aliases", () => {
  const result = buildUnifiedAliasChain("www.example.com", [
    {
      requestedType: "A",
      aliasChain: [{ from: "www.example.com", to: "a.example.net", resolverTtlSeconds: 30 }],
    },
    {
      requestedType: "AAAA",
      aliasChain: [{ from: "www.example.com", to: "b.example.net", resolverTtlSeconds: 30 }],
    },
  ]);

  assert.equal(result.consistent, false);
  assert.deepEqual(result.aliasChain, []);
  assert.ok(result.warnings.some((warning) => warning.code === "alias_chain_inconsistent"));
});

test("detects alias loops and excessive depth", () => {
  const loop = normalizeAliasEdges("a.example", [
    { from: "a.example", to: "b.example", resolverTtlSeconds: 10 },
    { from: "b.example", to: "a.example", resolverTtlSeconds: 10 },
  ]);
  assert.ok(loop.warnings.some((warning) => warning.code === "alias_loop_detected"));

  const edges = Array.from({ length: 17 }, (_, index) => ({
    from: `n${index}.example`,
    to: `n${index + 1}.example`,
    resolverTtlSeconds: 10,
  }));
  const deep = normalizeAliasEdges("n0.example", edges, 16);
  assert.equal(deep.aliasChain.length, 16);
  assert.ok(deep.warnings.some((warning) => warning.code === "alias_depth_exceeded"));
});

test("explicit CNAME lookup keeps the alias as a terminal requested result", () => {
  const normalized = normalizeProviderResponse({
    provider: "cloudflare",
    requestedName: "www.example.com",
    requestedType: "CNAME",
    rawResponse: {
      Status: 0,
      Answer: [{ name: "www.example.com.", type: 5, TTL: 300, data: "edge.example.net." }],
    },
    cnameAsTerminal: true,
  });
  assert.equal(normalized.aliasChain.length, 1);
  assert.equal(normalized.terminalRecords.length, 1);
  assert.equal(normalized.terminalRecords[0].type, "CNAME");
});

test("Common records uses separate allowlisted types and fixed DO/CD values", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(new URL(url));
    return response({ Status: 0, AD: true, Answer: [] });
  };

  const result = await lookupDns(
    { name: "example.com", selection: "common", resolver: "cloudflare" },
    { fetchImpl },
  );

  assert.equal(calls.length, COMMON_RECORD_TYPES.length);
  assert.deepEqual(calls.map((url) => url.searchParams.get("type")), COMMON_RECORD_TYPES);
  assert.ok(calls.every((url) => url.searchParams.get("do") === "false"));
  assert.ok(calls.every((url) => url.searchParams.get("cd") === "false"));
  assert.ok(result.queryResults.every((query) => query.flags.authenticatedData === true));
});

test("Common records excludes CNAME edges from terminal counts and preserves raw responses", async () => {
  const fetchImpl = async (url) => {
    const type = new URL(url).searchParams.get("type");
    if (type === "A") {
      return response({
        Status: 0,
        Answer: [
          { name: "www.example.com.", type: 5, TTL: 200, data: "edge.example.net." },
          { name: "edge.example.net.", type: 1, TTL: 100, data: "192.0.2.1" },
        ],
      });
    }
    if (type === "CNAME") {
      return response({
        Status: 0,
        Answer: [{ name: "www.example.com.", type: 5, TTL: 190, data: "edge.example.net." }],
      });
    }
    return response({ Status: 0, Answer: [] });
  };

  const result = await lookupDns(
    { name: "www.example.com", selection: "common", resolver: "google" },
    { fetchImpl },
  );
  const aResult = result.queryResults.find((query) => query.requestedType === "A");
  const cnameResult = result.queryResults.find((query) => query.requestedType === "CNAME");

  assert.equal(result.aliasChain.length, 1);
  assert.equal(aResult.terminalRecords.length, 1);
  assert.equal(aResult.terminalRecords[0].ownerName, "edge.example.net");
  assert.equal(cnameResult.terminalRecords.length, 0);
  assert.ok(aResult.rawResponse);
  assert.ok(cnameResult.rawResponse);
});

test("weighted limits allow 20 Common bundles or 100 individual requests per window", () => {
  clearDnsLookupLimitsForTests();
  for (let index = 0; index < 20; index += 1) {
    assert.equal(consumeDnsLookupLimit("common", rateLimitCost("common")).allowed, true);
  }
  assert.equal(consumeDnsLookupLimit("common", rateLimitCost("common")).allowed, false);

  clearDnsLookupLimitsForTests();
  for (let index = 0; index < 100; index += 1) {
    assert.equal(consumeDnsLookupLimit("single", rateLimitCost("A")).allowed, true);
  }
  assert.equal(consumeDnsLookupLimit("single", rateLimitCost("A")).allowed, false);
});

test("formats Resolver TTL as remaining resolver cache time", () => {
  assert.equal(formatResolverTtl(300), "300 seconds, about 5 minutes remaining");
  assert.equal(formatResolverTtl(null), "Not reported");
});

test("parses type-specific record fields without changing the raw normalized record", () => {
  const mx = { ownerName: "example.com", type: "MX", typeCode: 15, value: "10 mail.example.com.", resolverTtlSeconds: 60 };
  assert.deepEqual(recordFields(mx), [
    { label: "Priority", value: "10" },
    { label: "Mail exchanger", value: "mail.example.com" },
  ]);
  assert.equal(mx.value, "10 mail.example.com.");

  const caa = { ownerName: "example.com", type: "CAA", typeCode: 257, value: "\\# 22 00 05 69 73 73 75 65 6c 65 74 73 65 6e 63 72 79 70 74 2e 6f 72 67", resolverTtlSeconds: 60 };
  assert.deepEqual(recordFields(caa), [
    { label: "Flags", value: "0" },
    { label: "Property", value: "issue" },
    { label: "Value", value: "letsencrypt.org" },
  ]);
  assert.match(caa.value, /^\\# 22/);
});
