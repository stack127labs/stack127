import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../../", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");
const card = source("app/(site)/(directories)/self-host-apps/directory-app-card.tsx");
const cli = source("app/(site)/(directories)/cli-apps/cli-app-browser.tsx");
const sharedPath = "app/(site)/(directories)/_components/app-fact-card";

test("app card and drawer dates use the same calendar day in every timezone", () => {
  const drawer = source("app/(site)/(directories)/self-host-apps/directory-app-browser.tsx");
  for (const code of [card, cli, drawer]) {
    assert.match(code, /new Intl\.DateTimeFormat\("en",\s*\{\s*timeZone: "UTC"/);
  }
});

test("both app directories use the approved shared fact-row card", () => {
  for (const code of [card, cli]) assert.ok(code.includes("<AppFactCardContent"));
  for (const label of ["Source", "Pricing", "RAM", "Storage", "Last update"]) {
    assert.ok(card.includes(`label: "${label}"`));
  }
  for (const label of ["Stars", "Pricing", "License", "Platforms", "Version", "Last commit"]) {
    assert.ok(cli.includes(`label: "${label}"`));
  }
  assert.ok(card.includes("hasRamEstimate(app)"));
  assert.ok(card.includes("hasStorageEstimate(app)"));
  assert.ok(card.includes("app.release_published_at ?? app.github_last_commit_at"));
  assert.ok(cli.includes("formatList(app.platforms)"));
  assert.ok(!cli.includes("cli-card-type"));
});

test("shared cards keep categories, labeled icons and readable facts", () => {
  const content = source(`${sharedPath}.tsx`);
  const css = source(`${sharedPath}.module.css`);
  for (const fragment of ["categories.slice(1)", "data-category-more", "title={more.map", "<dl", '<dt><Icon aria-hidden="true"', "estimated"]) {
    assert.ok(content.includes(fragment), fragment);
  }
  for (const fragment of ["grid-template-rows: auto auto 1fr", "overflow-wrap: anywhere", "box-shadow: var(--focus-ring)"]) {
    assert.ok(css.includes(fragment), fragment);
  }
  assert.doesNotMatch(css, /line-clamp|text-overflow: ellipsis/);
});
