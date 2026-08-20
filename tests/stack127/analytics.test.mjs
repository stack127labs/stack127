import assert from "node:assert/strict";
import test from "node:test";
import {
  getUmamiConfig,
  getUmamiUpstreamUrls,
  prepareUmamiEventBody,
} from "../../lib/analytics.ts";

test("getUmamiConfig builds a production tracker configuration", () => {
  assert.deepEqual(
    getUmamiConfig({
      UMAMI_URL: "https://umami.example.com/",
      UMAMI_WEBSITE_ID: "94db1cb1-74f4-4a40-ad6c-962362670409",
    }),
    {
      scriptUrl: "/vitals/core.js",
      websiteId: "94db1cb1-74f4-4a40-ad6c-962362670409",
    },
  );
});

test("getUmamiUpstreamUrls exposes only the tracker and collection endpoint", () => {
  assert.deepEqual(
    getUmamiUpstreamUrls({ UMAMI_URL: "https://umami.example.com/" }),
    {
      eventUrl: "https://umami.example.com/api/send",
      scriptUrl: "https://umami.example.com/script.js",
    },
  );

  assert.equal(getUmamiUpstreamUrls({}), null);
  assert.equal(
    getUmamiUpstreamUrls({ UMAMI_URL: "http://umami.example.com" }),
    null,
  );
});

test("getUmamiConfig disables tracking when configuration is missing or invalid", () => {
  assert.equal(getUmamiConfig({}), null);
  assert.equal(
    getUmamiConfig({
      UMAMI_URL: "http://umami.example.com",
      UMAMI_WEBSITE_ID: "94db1cb1-74f4-4a40-ad6c-962362670409",
    }),
    null,
  );
  assert.equal(
    getUmamiConfig({
      UMAMI_URL: "https://umami.example.com",
      UMAMI_WEBSITE_ID: "not-a-uuid",
    }),
    null,
  );
});

test("prepareUmamiEventBody injects the Cloudflare client IP", () => {
  const body = JSON.stringify({
    type: "event",
    payload: {
      ip: "198.51.100.20",
      url: "/dns-tools",
      website: "94db1cb1-74f4-4a40-ad6c-962362670409",
    },
  });

  assert.deepEqual(
    JSON.parse(
      prepareUmamiEventBody(
        body,
        new Headers({ "cf-connecting-ip": "203.0.113.42" }),
      ),
    ),
    {
      type: "event",
      payload: {
        ip: "203.0.113.42",
        url: "/dns-tools",
        website: "94db1cb1-74f4-4a40-ad6c-962362670409",
      },
    },
  );
});

test("prepareUmamiEventBody does not trust spoofable fallback headers", () => {
  const body = JSON.stringify({
    type: "event",
    payload: {
      url: "/",
      website: "94db1cb1-74f4-4a40-ad6c-962362670409",
    },
  });

  assert.equal(
    prepareUmamiEventBody(
      body,
      new Headers({ "x-forwarded-for": "203.0.113.42" }),
    ),
    body,
  );
  assert.equal(
    prepareUmamiEventBody(
      body,
      new Headers({ "cf-connecting-ip": "not-an-ip-address" }),
    ),
    body,
  );
});

test("prepareUmamiEventBody preserves malformed or unexpected request bodies", () => {
  const headers = new Headers({ "cf-connecting-ip": "2001:db8::127" });

  assert.equal(prepareUmamiEventBody("not-json", headers), "not-json");
  assert.equal(prepareUmamiEventBody("[]", headers), "[]");
  assert.equal(
    prepareUmamiEventBody(JSON.stringify({ type: "event" }), headers),
    JSON.stringify({ type: "event" }),
  );
});
