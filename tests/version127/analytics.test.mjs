import assert from "node:assert/strict";
import test from "node:test";
import {
  getUmamiConfig,
  getUmamiProxyRewrites,
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

test("getUmamiProxyRewrites exposes only the tracker and collection endpoint", () => {
  assert.deepEqual(
    getUmamiProxyRewrites({ UMAMI_URL: "https://umami.example.com/" }),
    [
      {
        destination: "https://umami.example.com/script.js",
        source: "/vitals/core.js",
      },
      {
        destination: "https://umami.example.com/api/send",
        source: "/vitals/api/send",
      },
    ],
  );

  assert.deepEqual(getUmamiProxyRewrites({}), []);
  assert.deepEqual(
    getUmamiProxyRewrites({ UMAMI_URL: "http://umami.example.com" }),
    [],
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
