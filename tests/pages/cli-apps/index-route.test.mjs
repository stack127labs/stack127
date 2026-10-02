import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "../../helpers/load-typescript.mjs";

function route(apps) {
  const state = { published: true, fail: false, loads: 0 };
  const { GET } = loadTypeScript(new URL("../../../app/api/cli-apps/index/route.ts", import.meta.url), {
    "next/server": { NextResponse: { json: (value, options) => Response.json(value, options) } },
    "@/lib/page-registry": {
      getPublishedPage: async slug => {
        assert.equal(slug, "cli-apps");
        return state.published ? {} : null;
      },
    },
    "@/lib/terminal-apps": {
      getTerminalApps: async () => {
        state.loads++;
        if (state.fail) throw new Error("database unavailable");
        return apps;
      },
    },
  });
  return { GET, state };
}

test("the CLI index returns the full loader result in its original order with long shared caching", async () => {
  const apps = Array.from({ length: 65 }, (_, index) => ({
    slug: `app-${index}`, name: `App ${index}`, aliases: ["alias"], summary: "A terminal app",
    primary_type: "cli", additional_types: [], categories: ["development"], platforms: ["linux"], language: "go",
    install_methods: ["binary"], website_url: null, docs_url: null, repository_url: null, source_model: "open_source",
    pricing_model: "free", license: "MIT", latest_version: "1.0", latest_release_at: new Date("2026-01-01"),
    stars: index, last_commit_at: null, maintenance_status: "active", icon_url: null, screenshot_url: null, last_verified_at: null,
  }));
  const { GET, state } = route(apps);
  const response = await GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Cache-Control"), /s-maxage=31536000/);
  assert.ok(response.headers.get("Cache-Tag").includes("cli-apps-catalog"));
  assert.deepEqual(await response.json(), JSON.parse(JSON.stringify(apps)));
  assert.equal(state.loads, 1);
});

test("unpublished CLI directories return an uncached 404 without loading app data", async () => {
  const { GET, state } = route([]);
  state.published = false;
  const response = await GET();
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(state.loads, 0);
});

test("an empty published list is valid and loader failures propagate", async () => {
  const { GET, state } = route([]);
  assert.deepEqual(await (await GET()).json(), []);
  state.fail = true;
  await assert.rejects(GET(), /database unavailable/);
});
