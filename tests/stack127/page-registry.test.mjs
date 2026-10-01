import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isHomeFeaturePage,
  isHomePageSlug,
  isHomeVisiblePage,
  isMainPageSlug,
} from "../../lib/page-registry-helpers.ts";

const registrySource = readFileSync(new URL("../../lib/page-registry.ts", import.meta.url), "utf8");

test("missing required registry pages resolve through the 404 boundary", () => {
  assert.match(registrySource, /import \{ notFound \} from "next\/navigation"/);
  assert.match(
    registrySource,
    /getRequiredPublishedPage[\s\S]*if \(!page\) \{\s*notFound\(\);\s*\}/,
  );
  assert.doesNotMatch(registrySource, /Published page registry row is required/);
});

test("isMainPageSlug accepts only published root pages", () => {
  assert.equal(isMainPageSlug(""), false);
  assert.equal(isMainPageSlug("self-host-apps"), true);
  assert.equal(isMainPageSlug("software-licenses-for-self-hosting"), true);
  assert.equal(isMainPageSlug("self-hosting-for-beginners"), true);
  assert.equal(isMainPageSlug("self-hosting-for-beginners/install-docker"), false);
  assert.equal(isMainPageSlug("about"), true);
  assert.equal(isMainPageSlug("dns-lookup"), false);
  assert.equal(isMainPageSlug("dockerignore-tester"), false);
  assert.equal(isMainPageSlug("nginx-proxy-pass-calculator"), false);
  assert.equal(isMainPageSlug("nfs-firewall-rules"), false);
  assert.equal(isHomePageSlug("storage-tools"), false);
});

test("isHomeFeaturePage excludes legal and about utility pages", () => {
  assert.equal(
    isHomeFeaturePage({ slug: "self-host-apps", page_type: "CollectionPage" }),
    true,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "software-licenses-for-self-hosting", page_type: "WebPage" }),
    true,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "self-hosting-for-beginners", page_type: "Course" }),
    true,
  );
  for (const slug of [
    "dockerignore-tester",
    "nginx-proxy-pass-calculator",
    "nfs-firewall-rules",
  ]) {
    assert.equal(isHomeFeaturePage({ slug, page_type: "WebApplication" }), false, slug);
  }
  assert.equal(
    isHomeFeaturePage({ slug: "about", page_type: "AboutPage" }),
    false,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "privacy", page_type: "PrivacyPolicy" }),
    false,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "terms", page_type: "TermsOfService" }),
    false,
  );
  assert.equal(
    isHomeFeaturePage({
      slug: "self-hosting-for-beginners/install-docker",
      page_type: "LearningResource",
    }),
    false,
  );
});

test("isHomeVisiblePage excludes retired Immich page entries", () => {
  assert.equal(
    isHomeVisiblePage({ slug: "immich", label: "Immich", meta_title: "Immich | stack127" }),
    false,
  );
  assert.equal(
    isHomeVisiblePage({
      slug: "immich-alternatives",
      label: "Immich alternatives",
      meta_title: "Immich alternatives | stack127",
    }),
    false,
  );
  assert.equal(
    isHomeVisiblePage({
      slug: "self-host-apps",
      label: "self-host apps",
      meta_title: "Self-host apps | stack127",
    }),
    true,
  );
});

test("hardware directories stay off homepage navigation and cards", () => {
  for (const slug of [
    "local-security-cameras",
    "matter-devices",
    "nut-compatible-ups",
    "z-wave-devices",
    "zigbee-coordinators",
    "zigbee-devices",
  ]) {
    assert.equal(isHomeVisiblePage({ slug }), false, slug);
    assert.equal(isHomeFeaturePage({ slug, page_type: "CollectionPage" }), false, slug);
  }

  for (const [slug, page_type] of [
    ["self-host-apps", "CollectionPage"],
    ["cli-apps", "CollectionPage"],
    ["self-hosting-for-beginners", "Course"],
  ]) {
    assert.equal(isHomeVisiblePage({ slug }), true, slug);
    assert.equal(isHomeFeaturePage({ slug, page_type }), true, slug);
  }
});
