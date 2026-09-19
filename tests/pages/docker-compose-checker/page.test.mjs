import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const routeRoot = path.join(root, "app/(site)/(tools)/docker-compose-checker");
const manifest = JSON.parse(readFileSync(path.join(root, "tests/pages/docker-compose-checker/page.json"), "utf8"));

test("owns a published route with the required page artifacts", () => {
  assert.equal(manifest.route, "/docker-compose-checker");
  assert.equal(manifest.state, "published");
  assert.ok(manifest.reason);
  assert.equal(manifest.repositories.length, 0);
  for (const file of [
    "docker-compose-checker.test.mjs",
    "docker-compose-checker.spec.ts",
    "page.test.mjs",
    "fixtures/valid-current-compose.yml",
  ]) assert.ok(existsSync(path.join(root, "tests/pages/docker-compose-checker", file)), file);
});

test("keeps route-owned styling and local-only implementation boundaries explicit", () => {
  const source = existsSync(path.join(routeRoot, "docker-compose-checker.tsx"))
    ? readFileSync(path.join(routeRoot, "docker-compose-checker.tsx"), "utf8")
    : "";
  const styles = existsSync(path.join(routeRoot, "docker-compose-checker.module.css"))
    ? readFileSync(path.join(routeRoot, "docker-compose-checker.module.css"), "utf8")
    : "";
  assert.equal(existsSync(path.join(root, "lib/docker-compose-checker/parser.ts")), true);
  assert.equal(existsSync(path.join(root, "lib/docker-compose-checker/engine.ts")), true);
  assert.match(readFileSync(path.join(root, "package.json"), "utf8"), /"yaml"\s*:/);
  assert.match(styles, /diagnostic|result|editor/i);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML|localStorage|sessionStorage|indexedDB|navigator\.clipboard\.read|fetch\(/i);
  assert.doesNotMatch(readFileSync(path.join(root, "app/globals.css"), "utf8"), /docker-compose-checker/i);
});

test("does not add the checker to publication or route-local SEO code", () => {
  const routeFiles = existsSync(routeRoot)
    ? readFileSync(path.join(routeRoot, "page.tsx"), "utf8")
    : "";
  assert.doesNotMatch(routeFiles, /generateMetadata|metadata|canonical|robots|json-ld|application\/ld\+json/i);
});

test("guards the development-only preview mutation", () => {
  const source = readFileSync(path.join(root, "scripts/docker-compose-checker/preview-local-page.mjs"), "utf8");
  assert.match(source, /phhrfvmncpqqmmgruktx/);
  assert.match(source, /tulgfrqamtcshdtmhvpx/);
  assert.match(source, /--remove/);
  assert.match(source, /Refusing.*production/i);
  assert.match(source, /public\.stack127_pages/);
  assert.match(source, /public\.stack127_tool_pages/);
  assert.match(source, /delete from public\.stack127_pages/);
  assert.match(source, /tool_version.*1\.0\.0/);
});
