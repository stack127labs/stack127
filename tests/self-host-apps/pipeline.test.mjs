import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { canonicalUrl } from "../../scripts/self-host-apps/lib/candidates.mjs";
import { classifySelfHostRecord, selfHostRecordClassificationError } from "../../scripts/self-host-apps/lib/classification.mjs";
import {
  buildCandidateIndexes,
  buildAppIndexes,
  classifyCandidate,
} from "../../scripts/self-host-apps/lib/dedupe.mjs";
import { normalizeRecord, validateRecord } from "../../scripts/self-host-apps/lib/schema.mjs";
import {
  itemListEntries,
  softwareApplication,
} from "../../scripts/self-host-apps/lib/structured-data.mjs";

function candidate(overrides = {}) {
  return {
    id: "candidate-1",
    canonical_source_code_key: null,
    canonical_website_key: null,
    normalized_name: "example",
    ...overrides,
  };
}

function moduleFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return moduleFiles(filePath);
    return entry.isFile() && entry.name.endsWith(".mjs") ? [filePath] : [];
  });
}

test("every self-host app pipeline module parses", () => {
  const directory = path.resolve("scripts/self-host-apps");
  for (const filePath of moduleFiles(directory)) {
    const source = ts.createSourceFile(
      filePath,
      readFileSync(filePath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    );
    const errors = source.parseDiagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    assert.deepEqual(errors, [], `${path.relative(directory, filePath)} must parse`);
  }
});

test("GitLab canonical URLs retain nested namespaces and drop route suffixes", () => {
  assert.equal(
    canonicalUrl("https://gitlab.com/group/subgroup/project/-/releases"),
    "gitlab.com/group/subgroup/project",
  );
});

test("dedupe marks exact app repository matches as duplicates", () => {
  const apps = buildAppIndexes([
    { id: "app-1", name: "Existing", source_code_url: "https://github.com/acme/tool", website_url: null },
  ]);
  const current = candidate({ canonical_source_code_key: "github.com/acme/tool" });
  const result = classifyCandidate(current, apps, buildCandidateIndexes([current]));
  assert.equal(result.action, "duplicate");
  assert.equal(result.reason, "source_code_url");
  assert.equal(result.app.id, "app-1");
});

test("dedupe marks exact app homepage matches as duplicates", () => {
  const apps = buildAppIndexes([
    { id: "app-1", name: "Existing", source_code_url: null, website_url: "https://example.com/" },
  ]);
  const current = candidate({ canonical_website_key: "example.com" });
  const result = classifyCandidate(current, apps, buildCandidateIndexes([current]));
  assert.equal(result.action, "duplicate");
  assert.equal(result.reason, "website_url");
});

test("dedupe sends name-only app matches to review", () => {
  const apps = buildAppIndexes([
    { id: "app-1", name: "Example", source_code_url: null, website_url: null },
  ]);
  const current = candidate();
  const result = classifyCandidate(current, apps, buildCandidateIndexes([current]));
  assert.equal(result.action, "review");
  assert.equal(result.reason, "name");
});

test("dedupe queues candidates without exact or name matches", () => {
  const current = candidate();
  const result = classifyCandidate(current, buildAppIndexes([]), buildCandidateIndexes([current]));
  assert.equal(result.action, "queue");
});

test("structured data extracts nested ItemList software entries", () => {
  const html = `
    <script type="application/ld+json">
      {"@context":"https://schema.org","@graph":[{"@type":"ItemList","itemListElement":[{"@type":"ListItem","position":1,"item":{"@type":"SoftwareApplication","name":"Example","url":"https://directory.test/example","description":"Example description."}}]}]}
    </script>
  `;
  assert.deepEqual(itemListEntries(html).map(({ name, url, description }) => ({ name, url, description })), [
    { name: "Example", url: "https://directory.test/example", description: "Example description." },
  ]);
});

test("structured data extracts a SoftwareApplication detail", () => {
  const html = '<script type="application/ld+json">{"@type":"SoftwareApplication","name":"Example","codeRepository":"https://github.com/acme/example"}</script>';
  assert.equal(softwareApplication(html).codeRepository, "https://github.com/acme/example");
});

test("unclassified records default self-hosting status to unknown", () => {
  assert.equal(normalizeRecord({ name: "Example", summary: "A useful example app for testing the pipeline." }).self_hosting_status, "unknown");
});

test("classification blocks dependency containers and image variants with direct evidence", () => {
  assert.equal(classifySelfHostRecord({ slug: "immich-redis", name: "immich-redis", summary: "Redis-compatible Valkey service used by Immich for background task queues.", docker_image: "valkey/valkey:9" }).kind, "dependency_container");
  assert.equal(classifySelfHostRecord({ slug: "makerworks-postgres", name: "makerworks-postgres", summary: "PostgreSQL database for the MakerWorks suite.", docker_image: "postgres:15" }).kind, "dependency_container");
  assert.equal(classifySelfHostRecord({ slug: "couchdb-offical-docker-v1-x", name: "CouchDB-Offical-Docker-v1.x" }).kind, "image_variant");
  assert.equal(classifySelfHostRecord({ slug: "couchdb-v2-x", name: "CouchDB-v2.x" }).kind, "image_variant");
  assert.equal(classifySelfHostRecord({ slug: "docker-in-docker-dind", name: "Docker-in-Docker", summary: "Runs a separate Docker daemon inside a container so build tools can create images.", docker_image: "docker:dind" }).kind, "dependency_container");
  assert.equal(classifySelfHostRecord({ slug: "elastic-search", name: "Elastic Search" }).kind, "duplicate");
  assert.equal(classifySelfHostRecord({ slug: "actualserver", name: "Actual Budget" }).kind, "duplicate");
  assert.equal(classifySelfHostRecord({ slug: "sample-deployment", name: "Sample Deployment", summary: "Example stack for a demo deployment." }).kind, "example_stack");
  const dependency = { slug: "lucia-postgresql", name: "Lucia-PostgreSQL", summary: "PostgreSQL companion for Lucia.", docker_image: "postgres:17", published: true };
  assert.match(selfHostRecordClassificationError(dependency), /dependency_container/);
  assert.ok(validateRecord(dependency).errors.some((error) => /dependency_container/.test(error)));
});

test("classification keeps standalone services and companion apps publishable", () => {
  for (const record of [
    { slug: "redis", name: "Redis", summary: "In-memory data store.", docker_image: "redis:8" },
    { slug: "postgres", name: "PostgreSQL", summary: "Relational database server.", docker_image: "postgres:18" },
    { slug: "redisinsight", name: "Redis Insight", summary: "Web interface for monitoring Redis databases.", docker_image: "redis/redisinsight:latest" },
    { slug: "pict-rs", name: "Pict-rs", summary: "Image hosting service used by Lemmy for storing and serving uploaded pictures.", docker_image: "asonix/pictrs:latest" },
  ]) assert.equal(classifySelfHostRecord(record).kind, "application", record.slug);
});
