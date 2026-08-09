import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  NGINX_FIXTURE_VERSION,
  NGINX_PROXY_PASS_FORMULA_VERSION,
  calculateProxyPassUri,
} from "../../../lib/nginx/proxy-pass-uri.ts";

function input(overrides = {}) {
  return {
    locationType: "prefix",
    location: "/api/",
    requestTarget: "/api/users?id=42",
    proxyPass: "http://backend/",
    rewriteState: "none",
    compareSlash: true,
    ...overrides,
  };
}

function success(candidate) {
  const actual = calculateProxyPassUri(candidate);
  assert.equal(actual.status, "success", JSON.stringify(actual));
  return actual;
}

test("pins formula and fixture versions", () => {
  assert.equal(NGINX_PROXY_PASS_FORMULA_VERSION, "nginx-proxy-pass-uri-v1");
  assert.equal(NGINX_FIXTURE_VERSION, "1.30.4");
});

test("pins a passing real NGINX fixture receipt", () => {
  const receipt = JSON.parse(readFileSync(new URL("fixtures/nginx-1.30.4.json", import.meta.url), "utf8"));
  assert.equal(receipt.image, `nginx:${NGINX_FIXTURE_VERSION}-alpine`);
  assert.equal(receipt.nginxVersion, `nginx version: nginx/${NGINX_FIXTURE_VERSION}`);
  assert.match(receipt.imageId, /^sha256:[a-f0-9]{64}$/);
  assert.match(receipt.configurationSha256, /^[a-f0-9]{64}$/);
  assert.equal(receipt.fixtures.length, 7);
  for (const fixture of receipt.fixtures) assert.equal(fixture.observedTarget, fixture.expectedTarget, fixture.id);
});

test("matches supported static URI construction fixtures", () => {
  const fixtures = [
    [input({ proxyPass: "http://backend" }), "http://backend/api/users?id=42", "absent", "/api/users"],
    [input(), "http://backend/users?id=42", "present", "/users"],
    [input({ requestTarget: "/api/users", proxyPass: "https://backend:8443/v2" }), "https://backend:8443/v2users", "present", "/v2users"],
    [input({ requestTarget: "/api/users", proxyPass: "http://backend/v2/" }), "http://backend/v2/users", "present", "/v2/users"],
    [input({ locationType: "exact", location: "/health", requestTarget: "/health?deep=1", proxyPass: "http://backend/status" }), "http://backend/status?deep=1", "present", "/status"],
    [input({ location: "/", requestTarget: "/a?x=1&x=2", proxyPass: "http://backend" }), "http://backend/a?x=1&x=2", "absent", "/a"],
    [input({ location: "/app", requestTarget: "/app/users", proxyPass: "http://backend/" }), "http://backend//users", "present", "//users"],
  ];
  for (const [candidate, finalUrl, proxyUriPresence, finalPath] of fixtures) {
    const actual = success(candidate);
    assert.equal(actual.finalUrl, finalUrl);
    assert.equal(actual.trace.proxyUriPresence, proxyUriPresence);
    assert.equal(actual.trace.finalPath, finalPath);
    assert.equal(actual.formulaVersion, NGINX_PROXY_PASS_FORMULA_VERSION);
    assert.equal(actual.fixtureVersion, NGINX_FIXTURE_VERSION);
  }
});

test("preserves raw request arguments", () => {
  const actual = success(input({
    requestTarget: "/api/users?a=1&a=2&empty=&encoded=%2F",
    proxyPass: "http://backend",
  }));
  assert.equal(actual.trace.requestArguments, "a=1&a=2&empty=&encoded=%2F");
  assert.equal(actual.finalUrl, "http://backend/api/users?a=1&a=2&empty=&encoded=%2F");
});

test("calculates a literal slash comparison without recommending either form", () => {
  const withSlash = success(input());
  assert.equal(withSlash.comparison?.proxyPass, "http://backend");
  assert.equal(withSlash.comparison?.finalUrl, "http://backend/api/users?id=42");
  const withoutSlash = success(input({ requestTarget: "/api/users", proxyPass: "http://backend/v2" }));
  assert.equal(withoutSlash.comparison?.proxyPass, "http://backend/v2/");
  assert.equal(withoutSlash.comparison?.finalUrl, "http://backend/v2/users");
  assert.equal("recommended" in withSlash, false);
});

test("returns unknown with no plausible output for unresolved NGINX state", () => {
  const fixtures = [
    [input({ locationType: "regex", location: "~ ^/api/(.*)$" }), "regex-location"],
    [input({ locationType: "named", location: "@fallback" }), "named-location"],
    [input({ proxyPass: "http://$backend/" }), "variables"],
    [input({ proxyPass: "http://backend$request_uri" }), "variables"],
    [input({ rewriteState: "break" }), "rewrite-break"],
    [input({ rewriteState: "last" }), "rewrite-last"],
    [input({ proxyPass: "http://backend/base?fixed=1" }), "proxy-query"],
    [input({ requestTarget: "/api/a%2Fb" }), "normalization-sensitive"],
    [input({ requestTarget: "/api/a/../b" }), "normalization-sensitive"],
    [input({ location: "/api//" }), "normalization-sensitive"],
  ];
  for (const [candidate, reason] of fixtures) {
    const actual = calculateProxyPassUri(candidate);
    assert.equal(actual.status, "unknown", JSON.stringify(actual));
    assert.equal(actual.reason, reason);
    assert.equal("finalUrl" in actual, false);
    assert.equal("comparison" in actual, false);
  }
});

test("rejects mismatches and malformed or hostile inputs", () => {
  const invalid = [
    input({ locationType: "exact", location: "/health", requestTarget: "/health/" }),
    input({ location: "" }),
    input({ requestTarget: "relative/path" }),
    input({ proxyPass: "ftp://backend/" }),
    input({ proxyPass: "backend:3000" }),
    input({ proxyPass: "http://user:secret@backend/" }),
    input({ proxyPass: "http://backend:0/" }),
    input({ proxyPass: "http://backend:65536/" }),
    input({ requestTarget: "/api/users#fragment" }),
    input({ requestTarget: "/api/\u0000" }),
    input({ location: "/" + "x".repeat(512) }),
    input({ requestTarget: "/" + "x".repeat(4096) }),
    input({ proxyPass: "http://" + "x".repeat(2048) }),
    { ...input(), extra: "bad" },
    null,
    [],
  ];
  for (const candidate of invalid) {
    const actual = calculateProxyPassUri(candidate);
    assert.equal(actual.status, "invalid", JSON.stringify(actual));
    assert.equal("finalUrl" in actual, false);
  }
});

test("reports simultaneous field errors together", () => {
  const actual = calculateProxyPassUri(input({
    location: " ",
    requestTarget: "relative/path",
    proxyPass: "ftp://backend/",
  }));
  assert.equal(actual.status, "invalid");
  assert.deepEqual(Object.keys(actual.errors), ["location", "requestTarget", "proxyPass"]);
});

test("accepts boundary ports and bracketed IPv6", () => {
  assert.equal(success(input({ proxyPass: "http://backend:1/" })).finalUrl, "http://backend:1/users?id=42");
  assert.equal(success(input({ proxyPass: "https://backend:65535/" })).finalUrl, "https://backend:65535/users?id=42");
  assert.equal(success(input({ proxyPass: "http://[2001:db8::1]:8443/" })).finalUrl, "http://[2001:db8::1]:8443/users?id=42");
});

test("rejects malformed bracketed IPv6 authorities", () => {
  for (const proxyPass of ["http://[:::]:8443/", "http://[2001:db8::zz]:8443/", "http://[]:8443/"]) {
    const actual = calculateProxyPassUri(input({ proxyPass }));
    assert.equal(actual.status, "invalid", JSON.stringify(actual));
    assert.equal("finalUrl" in actual, false);
  }
});

test("is deterministic, immutable, and within its performance budget", () => {
  const candidate = Object.freeze(input());
  const expected = calculateProxyPassUri(candidate);
  const started = performance.now();
  for (let index = 0; index < 1_000; index += 1) assert.deepEqual(calculateProxyPassUri(candidate), expected);
  assert.ok(performance.now() - started < 10_000);
  assert.deepEqual(candidate, input());
});
