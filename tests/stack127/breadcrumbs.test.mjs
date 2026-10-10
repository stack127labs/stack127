import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as seo from "../../lib/seo.ts";
import * as courses from "../../lib/courses.ts";
import * as titles from "../../lib/directory-page-content.ts";

function load(file, imports) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, URL, Date, process, require(name) {
    if (Object.hasOwn(imports, name)) return imports[name];
    throw new Error(`Unexpected import: ${name}`);
  } });
  return exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const page = (slug, page_family = "directory", label = slug) => ({
  id: slug, slug, page_family, label, is_published: true, is_indexable: true,
  page_type: "WebPage", meta_title: label, meta_description: "Description",
  updated_at: "2026-10-10T00:00:00Z", published_at: "2026-10-01T00:00:00Z",
});
const course = {
  registrySlug: "course", basePath: "/course", title: "Self-hosting <mark>for beginners</mark>",
  lessons: [{ slug: "", published: true, sidebarLabel: "Start here" },
    { slug: "install", published: true, sidebarLabel: "Install Docker" }],
};
const pages = new Map([
  page("about", "site", "About"),
  page("directory", "directory", "Useful directory"),
  page("directory/child", "directory", "Child page"),
  page("keyboard-shortcuts", "directory", "Keyboard shortcuts"),
  page("keyboard-shortcuts/claude-code", "directory", "Claude Code keyboard shortcuts"),
].map(entry => [entry.slug, entry]));
function breadcrumbs() {
  return load("lib/breadcrumbs.ts", {
    react: { cache: fn => fn },
    "./page-registry": { getExactPublishedPage: async slug => pages.get(slug), pathFromSlug: slug => slug ? `/${slug}` : "/" },
    "./tool-catalogs": { getPrimaryToolCatalog: async () => ({ page: page("dns-tools", "catalog", "DNS tools") }) },
    "./courses": courses, "./directory-page-content": titles,
    "./tool-pages": { getRequiredToolPage: async () => ({ card_name: "DNS lookup" }) },
    "./course-pages": { getRequiredCourse: async () => course },
    "./shortcuts/index": { loadShortcutApp: async () => ({ name: "Claude Code" }) },
  });
}
function registry(crumbs) {
  return load("lib/page-registry.ts", {
    react: { cache: fn => fn }, "next/cache": { unstable_cache: fn => fn },
    "next/navigation": { notFound() { throw new Error("404"); } },
    "./page-cards": {}, "./db": {}, "./public-data-api": {},
    "./seo": seo, "./page-registry-helpers": {}, "./cache-tags": {}, "./breadcrumbs": crumbs,
    "./platform-fees/queries": { getFeeDirectory: async () => ({ sections: [{ id: 1, group_name: "Creators" }],
      entries: [{ id: "one", section_id: 1, name: "Service", website_url: "https://example.com" }] }) },
    "./platform-fees/groups": { getFeeGroup: () => ({ name: "Creators" }), groupPath: () => "/platform-fees/creators" },
  });
}

test("registry breadcrumbs use the page header's labels and links for each family", async () => {
  const crumbs = breadcrumbs();
  const { getRegistryPageStructuredData } = registry(crumbs);
  for (const [entry, names, paths] of [
    [page("about", "site", "About"), ["stack127", "About"], ["/", "/about"]],
    [pages.get("directory"), ["stack127", "Useful directory"], ["/", "/directory"]],
    [pages.get("directory/child"), ["stack127", "Useful directory", "Child page"], ["/", "/directory", "/directory/child"]],
    [page("dns-lookup", "tool", "DNS lookup tool"), ["stack127", "DNS tools", "DNS lookup"], ["/", "/dns-tools", "/dns-lookup"]],
    [pages.get("keyboard-shortcuts/claude-code"), ["stack127", "Keyboard shortcuts", "Claude Code"], ["/", "/keyboard-shortcuts", "/keyboard-shortcuts/claude-code"]],
    [page("course", "course"), ["stack127", "Self-hosting for beginners"], ["/", "/course"]],
    [page("course/install", "course"), ["stack127", "Self-hosting for beginners", "Install Docker"], ["/", "/course", "/course/install"]],
  ]) {
    const data = await getRegistryPageStructuredData({ kind: "exact", index: true, page: entry });
    const lists = data.filter(item => item["@type"] === "BreadcrumbList");
    assert.equal(lists.length, 1, entry.slug);
    assert.deepEqual(plain(lists[0].itemListElement), names.map((name, index) => ({
      "@type": "ListItem", name, position: index + 1, item: seo.absoluteUrl(paths[index]),
    })));
  }
  assert.deepEqual(plain(await crumbs.getBreadcrumbs("")), []);
  const landing = await crumbs.getPageBreadcrumbs(page("course", "course"));
  assert.deepEqual(plain(landing.map(item => ({ name: item.name, path: item.href }))), plain(crumbs.buildCourseBreadcrumbs(course, course.lessons[0])));
});

test("noindex, inherited children, and missing pages emit no structured data or breadcrumb reads", async () => {
  const { getRegistryPageStructuredData } = registry({ getPageBreadcrumbs() { throw new Error("Must not read breadcrumbs"); } });
  for (const state of [
    { kind: "exact", index: false, page: page("noindex") },
    { kind: "child", index: false, page: page("directory"), parentSlug: "directory" },
    { kind: "missing" },
  ]) assert.equal(await getRegistryPageStructuredData(state), null);
});

test("home emits its page entity without an empty BreadcrumbList", async () => {
  const { getRegistryPageStructuredData } = registry(breadcrumbs());
  const data = await getRegistryPageStructuredData({ kind: "exact", index: true, page: page("", "site") });
  assert.equal(data.length, 1);
  assert.equal(data[0].url, seo.absoluteUrl("/"));
});

test("directory ItemList survives the addition of breadcrumbs", async () => {
  const { getRegistryPageStructuredData } = registry(breadcrumbs());
  const data = await getRegistryPageStructuredData({ kind: "exact", index: true, page: page("platform-fees/creators") });
  assert.equal(data[0].mainEntity["@type"], "ItemList");
  assert.equal(data[0].mainEntity.numberOfItems, 1);
  assert.equal(data[1]["@type"], "BreadcrumbList");
});

test("parent layouts using page mode do not leak JSON-LD into child HTML", async () => {
  const calls = [];
  const entry = page("directory");
  const jsx = (type, props) => ({ type, props });
  const { registryLayout, RegistryStructuredData } = load("lib/registry-layout.tsx", {
    react: { cache: fn => fn }, "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/navigation": { notFound() { throw new Error("404"); } },
    "./page-registry": {
      buildRegistryMetadata: () => ({}),
      getPagePublicationState: async path => path === "/directory" ? { kind: "exact", index: true, page: entry }
        : { kind: "child", index: false, page: entry },
      getRegistryPageStructuredData: async state => { calls.push(state); return state.index ? [{ "@type": "BreadcrumbList" }] : null; },
    },
    "@/app/ui/site/json-ld": { JsonLd: "json-ld" }, "./seo": seo,
  });
  const children = { childHtml: true };
  assert.equal(await registryLayout("/directory", { structuredData: "page" }).Layout({ children }), children);
  assert.equal(calls.length, 0);
  assert.equal(await RegistryStructuredData({ path: "/directory/unregistered" }), null);
  assert.ok(await RegistryStructuredData({ path: "/directory" }));
  const rendered = await registryLayout("/directory").Layout({ children });
  assert.ok(rendered.props.children[0]);
  assert.equal(rendered.props.children[1], children);
});
