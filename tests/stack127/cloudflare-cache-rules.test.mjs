import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../../scripts/stack127/cache/configure-cloudflare.mjs", import.meta.url), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

async function configure(args, ready = true) {
  const writes = [];
  const queries = [];
  let reads = 0;
  const parameters = {
    "max-age": { operation: "set", value: 60 }, "must-revalidate": { operation: "remove" },
    "s-maxage": { operation: "set", value: 86400 },
  };
  const rules = {
    request: [{ id: "detail", description: "Public detail APIs: existing", action: "set_cache_settings",
      expression: '(http.host eq "stack127.com" and http.request.method eq "GET" and http.cookie eq "" and (starts_with(http.request.uri.path, "/api/self-host-apps/") or starts_with(http.request.uri.path, "/api/resource-planner-app/")))',
      action_parameters: { cache: true, edge_ttl: { mode: "bypass_by_default" }, browser_ttl: { mode: "respect_origin" } },
    }],
    response: [{ id: "html", description: "Public successful document HTML: existing", action: "set_cache_control",
      expression: '(http.host eq "stack127.com" and http.response.code eq 200 and any(http.response.headers["content-type"][*] contains "text/html"))',
      action_parameters: parameters,
    }],
  };
  const exports = {};
  await vm.runInNewContext(`(async () => { ${code} })()`, {
    exports, structuredClone, AbortSignal, console: { log() {} },
    process: { argv: ["node", "configure.mjs", ...args], env: { CLOUDFLARE_ZONE_ID: "fixture", CLOUDFLARE_API_TOKEN: "fixture" } },
    require(name) {
      assert.equal(name, "pg");
      return { default: { Pool: class {
        async query(sql) { queries.push(sql); return { rows: [{ ready, healthy_since: "2026-01-01" }] }; }
        async end() {}
      } } };
    },
    fetch: async (url, options) => {
      const parts = new URL(url).pathname.split("/");
      const set = parts[6];
      let result;
      if (options.method === "GET") {
        reads++;
        result = set ? { rules: rules[set] } : [
          { id: "request", kind: "zone", phase: "http_request_cache_settings" },
          { id: "response", kind: "zone", phase: "http_response_cache_settings" },
        ];
      } else {
        const definition = JSON.parse(options.body);
        writes.push({ set, definition });
        result = { rules: rules[set] };
      }
      return { ok: true, json: async () => ({ success: true, result }) };
    },
  });
  return { writes, queries, reads };
}

test("long TTL mode gives content, RSC, directories, and filters seven days with browser revalidation", async () => {
  const { writes, queries } = await configure(["--long-ttl", "--apply"]);
  for (const name of ["Public successful document HTML", "Public successful RSC navigation", "Public directory responses", "Public filtered responses"]) {
    const rule = writes.find(({ definition }) => definition.description.startsWith(name)).definition;
    assert.equal(rule.action_parameters["s-maxage"].value, 604800, name);
    assert.equal(rule.action_parameters["max-age"].value, 0, name);
    assert.equal(rule.action_parameters["must-revalidate"].operation, "set", name);
    assert.ok(rule.expression.includes("http.response.code eq 200"), name);
  }
  const json = writes.find(({ definition }) => definition.description.startsWith("Public detail APIs")).definition;
  for (const route of ["/api/self-host-apps/", "/api/cli-apps/index", "/api/hardware-directory/", "/api/resource-planner-index"]) {
    assert.ok(json.expression.includes(route), route);
  }
  assert.equal(json.action_parameters.edge_ttl.mode, "bypass_by_default");
  assert.equal(json.action_parameters.browser_ttl.mode, "respect_origin");
  const errors = writes.find(({ definition }) => definition.description === "Public errors: no store").definition;
  assert.equal(errors.action_parameters["no-store"].operation, "set");
  assert.ok(queries.some(sql => sql.startsWith("update public.stack127_cache_observation")));
});

test("preview mode makes no changes and short TTL mode preserves directory and filter limits", async () => {
  const preview = await configure(["--long-ttl"]);
  assert.equal(preview.writes.length, 0);
  assert.equal(preview.queries.length, 1);
  const { writes, queries } = await configure(["--apply"]);
  assert.equal(queries.length, 0);
  const ttl = name => writes.find(({ definition }) => definition.description.startsWith(name)).definition.action_parameters["s-maxage"].value;
  assert.equal(ttl("Public directory responses"), 86400);
  assert.equal(ttl("Public filtered responses"), 900);
});

test("long TTL changes stop when the existing worker health gate fails", async () => {
  await assert.rejects(configure(["--long-ttl", "--apply"], false), /seven consecutive reliable days/);
});
