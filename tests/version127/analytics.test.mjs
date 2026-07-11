import assert from "node:assert/strict";
import test from "node:test";
import { getUmamiConfig } from "../../lib/analytics.ts";

test("getUmamiConfig builds a production tracker configuration", () => {
  assert.deepEqual(
    getUmamiConfig({
      UMAMI_URL: "https://umami.example.com/",
      UMAMI_WEBSITE_ID: "94db1cb1-74f4-4a40-ad6c-962362670409",
    }),
    {
      scriptUrl: "https://umami.example.com/script.js",
      websiteId: "94db1cb1-74f4-4a40-ad6c-962362670409",
    },
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
