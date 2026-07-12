import assert from "node:assert/strict";
import test from "node:test";
import {
  getUmamiConfig,
  getUmamiUpstreamUrls,
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
