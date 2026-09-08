import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);

function source(path) {
  return readFileSync(new URL(path, root), "utf8");
}

const catalogPages = [
  "app/(site)/(catalogs)/dns-tools/page.tsx",
  "app/(site)/(catalogs)/domain-tools/page.tsx",
  "app/(site)/(catalogs)/storage-tools/page.tsx",
];

test("the three tool catalogs use one card and dotted hero system", () => {
  for (const path of catalogPages) {
    const page = source(path);
    assert.match(page, /from ["']\.\.\/_(?:components|components\/tool-catalog)/, path);
    assert.match(page, /<ToolCatalog\b/, path);
    assert.match(page, /<EntryHero\b/, path);
    assert.doesNotMatch(page, /className=["'](?:dns|domain)-tool-card/, path);
    assert.doesNotMatch(page, /<strong[^>]*>[^<]*(?:Checker|Explorer|Lookup|Calculator|Planner)/, path);
  }
});

test("catalog cards carry one simple name, one useful sentence, and generated marker art", () => {
  const component = source("app/(site)/(catalogs)/_components/tool-catalog.tsx");
  const styles = source("app/(site)/(catalogs)/_components/tool-catalog.module.css");

  assert.match(component, /type CatalogTool/);
  assert.match(component, /description: string/);
  assert.match(component, /art: string/);
  assert.match(component, /<h2/);
  assert.match(component, /<Doodle[^>]+svg=\{tool\.art\}/);
  assert.doesNotMatch(component, /reason/);
  assert.match(styles, /grid-template-columns:\s*repeat\(3,/);
  assert.match(styles, /@media \(max-width: 900px\)/);
  assert.match(styles, /@media \(max-width: 620px\)/);
});

test("home and legal entry pages use page-matched art in a dotted hero", () => {
  const home = source("app/(site)/page.tsx");
  assert.match(home, /siteHeroStack127Art/);
  assert.match(home, /<EntryHero\b/);
  assert.doesNotMatch(home, /siteDoodleStarArt/);

  for (const [path, art] of [
    ["app/(site)/(legal)/about/page.tsx", "siteHeroAboutArt"],
    ["app/(site)/(legal)/privacy/page.tsx", "siteHeroPrivacyArt"],
    ["app/(site)/(legal)/terms/page.tsx", "siteHeroTermsArt"],
  ]) {
    const page = source(path);
    assert.match(page, new RegExp(art), path);
    assert.match(page, /heroArt=\{/, path);
  }

  const infoPage = source("app/info-page.tsx");
  assert.match(infoPage, /<EntryHero\b/);
});

test("directory and course entry pages use the same dotted hero contract", () => {
  for (const path of [
    "app/(site)/(directories)/cli-apps/page.tsx",
    "app/(site)/(directories)/self-host-apps/page.tsx",
    "app/(site)/(references)/keyboard-shortcuts/keyboard-shortcuts-directory.tsx",
  ]) {
    assert.match(source(path), /<EntryHero\b/, path);
  }

  assert.match(source("app/(site)/(courses)/_components/course-shell.tsx"), /<EntryHero\b/);
  assert.match(source("app/(site)/(courses)/self-hosting-for-beginners/course.tsx"), /entryHeroArt=/);
});
