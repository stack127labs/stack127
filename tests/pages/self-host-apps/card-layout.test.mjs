import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function source(path) {
  return readFileSync(new URL(path, root), "utf8");
}

const card = source("app/(site)/(directories)/self-host-apps/directory-app-card.tsx");
const styles = source("app/(site)/(directories)/_components/directory.css");

test("self-host app cards use the compact three-column content hierarchy", () => {
  assert.match(card, /app\.categories\.slice\(0,\s*1\)/);
  assert.match(card, /<p className="directory-card-summary">\{app\.summary\}<\/p>/);
  assert.match(card, /formatCardDate\(app\.release_published_at \?\? app\.github_last_commit_at\)/);
  assert.match(card, /className="directory-card-stat-last-commit"/);
  assert.match(card, /app\.maintenance_status !== "active"/);
  assert.match(card, />\s*last update\s*<\/span>/);
  assert.doesNotMatch(card, />\s*deploy\s*<\/span>/);
  assert.doesNotMatch(card, /className="directory-card-flags"/);
});

test("self-host app cards remain readable in a three-column grid", () => {
  assert.match(
    styles,
    /\.directory-results\s*\{[\s\S]*container-type:\s*inline-size;/,
  );
  assert.match(
    styles,
    /\.directory-results\s*\{[\s\S]*padding:\s*30px\s+clamp\(var\(--space-10\),\s*2\.5vw,\s*36px\)\s+44px;/,
  );
  assert.match(
    styles,
    /\.directory-card-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/,
  );
  assert.match(
    styles,
    /\.directory-card\s*\{[\s\S]*gap:\s*var\(--space-6\);[\s\S]*padding:\s*var\(--space-8\);/,
  );
  assert.match(
    styles,
    /\.directory-card-icon\s*\{[\s\S]*height:\s*54px;[\s\S]*width:\s*54px;/,
  );
  assert.match(
    styles,
    /\.directory-card-summary\s*\{[\s\S]*-webkit-line-clamp:\s*3;/,
  );
  assert.match(
    styles,
    /\.directory-card-stats\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*0\.8fr\)\s+minmax\(0,\s*0\.8fr\)\s+minmax\(0,\s*1\.25fr\);/,
  );
  assert.match(
    styles,
    /@container\s*\(max-width:\s*900px\)\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
  );
  assert.match(
    styles,
    /@container\s*\(max-width:\s*650px\)\s*\{[\s\S]*grid-template-columns:\s*1fr;/,
  );
});
