import assert from "node:assert/strict";
import test from "node:test";
import { buildSiteSearchEntries, searchSiteEntries } from "../../lib/site-search.ts";

const page = (id, slug, page_family, extra = {}) => ({
  id, slug, page_family, label: slug, meta_description: `${slug} description`,
  is_published: true, is_indexable: true, ...extra,
});

test("the index keeps published pages and drops the homepage, drafts, noindex children, and pages without cards", () => {
  const pages = [
    page(1, "", "site"),
    page(2, "about", "site"),
    page(3, "draft-tool", "tool", { is_published: false }),
    page(4, "dns-lookup", "tool"),
    page(5, "ad-networks", "directory"),
    page(6, "ad-networks/adsense", "directory"),
    page(7, "keyboard-shortcuts/figma", "directory", { is_indexable: false }),
    page(8, "domain-registrars", "directory", { is_indexable: false }),
    page(9, "uncarded-tool", "tool"),
    page(10, "course/lesson", "course", { label: "meet <mark>Docker</mark>" }),
    page(11, "labs", "site"),
  ];
  const cards = new Map([
    ["4", { card_name: "DNS lookup", card_description: "Look up DNS records.", card_icon_key: "globe" }],
    ["5", { card_name: "Ad networks", card_description: "Compare ad networks.", card_icon_key: "ad-networks" }],
    ["6", { card_name: "AdSense", card_description: "Google's ad network.", card_icon_key: null }],
    ["7", { card_name: "Figma", card_description: "Figma shortcuts.", card_icon_key: null }],
    ["8", { card_name: "", card_description: "", card_icon_key: null }],
  ]);
  const entries = buildSiteSearchEntries(pages, cards, new Map([["10", "Install <mark>Docker</mark>"]]));

  assert.deepEqual(entries.map(entry => entry.path), [
    "/about", "/ad-networks", "/ad-networks/adsense", "/course/lesson", "/dns-lookup", "/domain-registrars", "/labs",
  ]);
  const byPath = Object.fromEntries(entries.map(entry => [entry.path, entry]));
  assert.equal(byPath["/ad-networks/adsense"].icon, "ad-networks", "a child inherits its parent's icon");
  assert.equal(byPath["/domain-registrars"].title, "domain-registrars", "an empty card name falls back to the label");
  assert.equal(byPath["/course/lesson"].title, "Install Docker", "a lesson uses its title, without markup");
  assert.equal(byPath["/labs"].icon, "labs");
  assert.equal(byPath["/about"].icon, null);
});

const entry = (title, description, path = `/${title.toLowerCase().replaceAll(" ", "-")}`) => ({
  title, description, family: "tool", path, icon: null,
});

test("search matches word prefixes, ignores case, and ranks titles above descriptions", () => {
  const entries = [
    entry("Churn rate converter", "Turn monthly churn into MRR loss."),
    entry("MRR goal", "How many customers you need."),
    entry("Break-even MRR calculator", "When revenue covers costs."),
    entry("DNS lookup", "Check DNS records."),
    entry("Self-hosted apps", "Apps to run yourself.", "/self-host-apps"),
    entry("Hammer", "Not a match for mr."),
  ];

  assert.deepEqual(searchSiteEntries(entries, "mrr").map(item => item.title), [
    "MRR goal", "Break-even MRR calculator", "Churn rate converter",
  ]);
  assert.deepEqual(searchSiteEntries(entries, "DNS").map(item => item.title), ["DNS lookup"]);
  assert.deepEqual(searchSiteEntries(entries, "self host").map(item => item.title), ["Self-hosted apps"]);
  assert.deepEqual(searchSiteEntries(entries, "  break  calc ").map(item => item.title), ["Break-even MRR calculator"]);
  assert.deepEqual(searchSiteEntries(entries, "amer"), [], "matches start at a word, not inside it");
  assert.deepEqual(searchSiteEntries(entries, "zzzz"), []);
  assert.deepEqual(searchSiteEntries(entries, "   "), []);
  assert.equal(searchSiteEntries(entries, "m", 2).length, 2);
});
