import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildAnalyticsPageLocation,
  buildAnalyticsPageReferrer,
  getGoogleAnalyticsConfig,
  isGoogleAnalyticsCookieName,
  parseAnalyticsConsent,
  serializeAnalyticsConsent,
} from "../../lib/google-analytics.ts";

const dockerfile = readFileSync(new URL("../../Dockerfile", import.meta.url), "utf8");

test("Google Analytics is enabled only for a valid GA4 measurement ID", () => {
  assert.deepEqual(
    getGoogleAnalyticsConfig({ GOOGLE_ANALYTICS_ID: " G-ZJNG8SCGE1 " }),
    { measurementId: "G-ZJNG8SCGE1" },
  );

  assert.equal(getGoogleAnalyticsConfig({}), null);
  assert.equal(getGoogleAnalyticsConfig({ GOOGLE_ANALYTICS_ID: "UA-123-4" }), null);
  assert.equal(getGoogleAnalyticsConfig({ GOOGLE_ANALYTICS_ID: "G-private value" }), null);
});

test("the production image provides the configured GA4 measurement ID", () => {
  assert.match(dockerfile, /^ENV GOOGLE_ANALYTICS_ID=G-ZJNG8SCGE1$/mu);
});

test("analytics page locations keep the path and remove query strings and fragments", () => {
  assert.equal(
    buildAnalyticsPageLocation(
      "https://stack127.com",
      "/dns-lookup?name=internal.example#answer",
    ),
    "https://stack127.com/dns-lookup",
  );
  assert.equal(
    buildAnalyticsPageLocation("https://stack127.com/ignored", "/"),
    "https://stack127.com/",
  );
  assert.equal(buildAnalyticsPageLocation("not-an-origin", "/privacy"), null);
  assert.equal(buildAnalyticsPageLocation("https://stack127.com", "privacy"), null);
});

test("analytics referrers retain the source page without query strings or fragments", () => {
  assert.equal(
    buildAnalyticsPageReferrer("https://example.com/search?q=private#result"),
    "https://example.com/search",
  );
  assert.equal(buildAnalyticsPageReferrer(""), "");
  assert.equal(buildAnalyticsPageReferrer("not-a-url"), "");
});

test("analytics consent storage is versioned and rejects malformed values", () => {
  assert.equal(ANALYTICS_CONSENT_STORAGE_KEY, "stack127.analytics-consent");
  assert.equal(parseAnalyticsConsent(serializeAnalyticsConsent("granted")), "granted");
  assert.equal(parseAnalyticsConsent(serializeAnalyticsConsent("denied")), "denied");
  assert.equal(parseAnalyticsConsent('{"choice":"granted","version":2}'), null);
  assert.equal(parseAnalyticsConsent("granted"), null);
  assert.equal(parseAnalyticsConsent(null), null);
});

test("only Google Analytics cookies are selected for consent revocation", () => {
  assert.equal(isGoogleAnalyticsCookieName("_ga"), true);
  assert.equal(isGoogleAnalyticsCookieName("_ga_ZJNG8SCGE1"), true);
  assert.equal(isGoogleAnalyticsCookieName("_gid"), true);
  assert.equal(isGoogleAnalyticsCookieName("stack127-theme"), false);
  assert.equal(isGoogleAnalyticsCookieName("session"), false);
});
