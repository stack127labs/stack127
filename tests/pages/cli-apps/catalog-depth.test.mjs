import assert from "node:assert/strict";
import test from "node:test";

import { curated } from "../../../scripts/cli-apps/curated-map.mjs";
import { curatedExpansion } from "../../../scripts/cli-apps/curated-expansion.mjs";

const publishedEntries = Object.entries(curated).filter(([, app]) => !app.skip);
const expandedEntries = Object.entries(curatedExpansion);
const requiredCategories = [
  "development",
  "devops",
  "files",
  "text",
  "networking",
  "security",
  "monitoring",
  "databases",
  "media-graphics",
  "productivity",
  "communication",
  "games-fun",
  "terminal-ui",
  "ai",
];

test("the reviewed catalog is large enough to work as a general CLI directory", () => {
  assert.ok(
    publishedEntries.length >= 200,
    `expected at least 200 reviewed apps, found ${publishedEntries.length}`,
  );
});

test("every category has enough reviewed apps to be useful", () => {
  for (const category of requiredCategories) {
    const count = publishedEntries.filter(([, app]) => app.categories?.includes(category)).length;
    assert.ok(count >= 8, `${category} has ${count} apps, expected at least 8`);
  }
});

test("new reviewed entries carry publishable identity and discovery fields", () => {
  for (const [slug, app] of expandedEntries) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${slug} is not a stable slug`);
    assert.ok(app.name || app.candidate_name, `${slug} needs an explicit name`);
    assert.ok(app.summary?.length >= 35, `${slug} needs a useful original summary`);
    assert.ok(app.summary.length <= 170, `${slug} summary is too long for a directory card`);
    assert.ok(app.website_url || app.repository_url, `${slug} needs an official URL`);
    assert.ok(app.primary_type, `${slug} needs a primary type`);
    assert.ok(app.categories?.length >= 1 && app.categories.length <= 3, `${slug} needs 1 to 3 categories`);
    assert.ok(app.platforms?.length >= 1, `${slug} needs reviewed platform support`);
    assert.ok(app.install_methods?.length >= 1, `${slug} needs a reviewed install method`);
    assert.ok(app.source_model, `${slug} needs a source model`);
    assert.ok(app.pricing_model, `${slug} needs a pricing model`);

  }
});
