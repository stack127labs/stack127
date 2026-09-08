import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  findRepositoryRoot,
  inspectPipeline,
  normalizeRoute,
  readHeader,
} from "./inspect-tool-pipeline.mjs";

const repositoryRoot = findRepositoryRoot(import.meta.dirname);

test("normalizes routes and content_docs paths", () => {
  assert.equal(normalizeRoute("/example-tool/"), "/example-tool");
  assert.equal(normalizeRoute("content_docs/example-tool"), "/example-tool");
  assert.equal(
    normalizeRoute(`${repositoryRoot}/content_docs/example-tool`),
    "/example-tool",
  );
});

test("rejects unstable or traversing routes", () => {
  assert.throws(() => normalizeRoute("/example?state=abc"), /Invalid stable route/);
  assert.throws(() => normalizeRoute("content_docs/../app"), /Invalid stable route/);
  assert.throws(() => normalizeRoute("/"), /Invalid stable route/);
});

test("reads exactly one report header from the preamble", () => {
  const content = "Status: ready\nRoute: `/example`\n\n## Body\nRoute: ignored\n";
  assert.equal(readHeader(content, "Status"), "ready");
  assert.equal(readHeader(content, "Route"), "/example");
  assert.equal(readHeader("Status: ready\nStatus: blocked\n", "Status"), null);
});

test("recognizes a ready flat-route pipeline through test design", (context) => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "stack127-tool-orchestrator-ready-"));
  context.after(() => rmSync(fixtureRoot, { recursive: true, force: true }));
  const docsDirectory = join(fixtureRoot, "content_docs", "example-tool");
  mkdirSync(docsDirectory, { recursive: true });
  for (const artifact of ["competitive-report.md", "implementation-report.md", "interface-contract.md", "edge-cases-and-tests.md"]) {
    writeFileSync(join(docsDirectory, artifact), "Status: ready\nTool: Example Tool\nRoute: `/example-tool`\n");
  }
  writeFileSync(join(docsDirectory, "brief.md"), "# Example tool brief\n");

  const result = inspectPipeline({
    repositoryRoot: fixtureRoot,
    routeInput: "/example-tool",
    expectation: "test",
    runValidators: false,
  });
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.route, "/example-tool");
  assert.equal(result.errors.length, 0);
});

test("blocks a missing research artifact", () => {
  const result = inspectPipeline({
    repositoryRoot,
    routeInput: "/does-not-exist",
    expectation: "research",
    runValidators: false,
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /competitive-report\.md: missing required artifact/);
});

test("enforces unpublished build ownership", (context) => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "stack127-tool-orchestrator-"));
  context.after(() => rmSync(fixtureRoot, { recursive: true, force: true }));
  const route = "/synthetic-tool";
  const relativeRoute = "synthetic-tool";
  const docsDirectory = join(fixtureRoot, "content_docs", relativeRoute);
  const routeDirectory = join(fixtureRoot, "app", "(site)", "(tools)", relativeRoute);
  const manifestDirectory = join(fixtureRoot, "tests", "pages", relativeRoute);
  const testPath = join(manifestDirectory, "page.test.mjs");
  mkdirSync(docsDirectory, { recursive: true });
  mkdirSync(routeDirectory, { recursive: true });
  mkdirSync(manifestDirectory, { recursive: true });
  mkdirSync(join(fixtureRoot, "skills/stack127/stack127-tool-orchestrator"), { recursive: true });
  mkdirSync(join(fixtureRoot, "skills/stack127/stack127-tool-build"), { recursive: true });
  mkdirSync(join(fixtureRoot, "skills/stack127/stack127-tool-interface-plan"), { recursive: true });
  for (const artifact of ["competitive-report.md", "implementation-report.md", "interface-contract.md", "edge-cases-and-tests.md"]) {
    writeFileSync(join(docsDirectory, artifact), `Status: ready\nTool: Synthetic Tool\nRoute: \`${route}\`\n`);
  }
  writeFileSync(join(docsDirectory, "brief.md"), "# Synthetic brief\n");
  writeFileSync(join(routeDirectory, "page.tsx"), "export default function Page() { return null; }\n");
  writeFileSync(testPath, "// synthetic test owner\n");

  const manifestPath = join(manifestDirectory, "page.json");
  const manifest = {
    route,
    state: "unpublished",
    docs: [`content_docs/${relativeRoute}`],
    tests: [`tests/pages/${relativeRoute}/page.test.mjs`],
    scripts: [],
    skills: [
      "skills/stack127/stack127-tool-orchestrator",
      "skills/stack127/stack127-tool-build",
      "skills/stack127/stack127-tool-interface-plan",
    ],
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const ready = inspectPipeline({
    repositoryRoot: fixtureRoot,
    routeInput: route,
    expectation: "build",
    runValidators: false,
  });
  assert.equal(ready.ok, true, ready.errors.join("\n"));

  writeFileSync(
    join(docsDirectory, "writing-and-seo.md"),
    `Status: ready\nTool: Synthetic Tool\nRoute: \`${route}\`\n`,
  );
  mkdirSync(join(fixtureRoot, "skills/stack127/stack127-tool-writing"), { recursive: true });
  manifest.skills.push("skills/stack127/stack127-tool-writing");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const handoff = inspectPipeline({
    repositoryRoot: fixtureRoot,
    routeInput: route,
    expectation: "handoff",
    runValidators: false,
  });
  assert.equal(handoff.ok, true, handoff.errors.join("\n"));

  manifest.skills.pop();
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const missingWriter = inspectPipeline({
    repositoryRoot: fixtureRoot,
    routeInput: route,
    expectation: "handoff",
    runValidators: false,
  });
  assert.equal(missingWriter.ok, false);
  assert.match(missingWriter.errors.join("\n"), /stack127-tool-writing at handoff/);

  manifest.state = "published";
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const published = inspectPipeline({
    repositoryRoot: fixtureRoot,
    routeInput: route,
    expectation: "build",
    runValidators: false,
  });
  assert.equal(published.ok, false);
  assert.match(published.errors.join("\n"), /must remain unpublished/);
});
