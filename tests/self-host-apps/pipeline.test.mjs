import assert from "node:assert/strict";
import test from "node:test";
import { canonicalUrl } from "../../scripts/self-host-apps/lib/candidates.mjs";
import {
  buildCandidateIndexes,
  buildProjectIndexes,
  classifyCandidate,
} from "../../scripts/self-host-apps/lib/dedupe.mjs";
import { normalizeRecord } from "../../scripts/self-host-apps/lib/schema.mjs";
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

test("GitLab canonical URLs retain nested namespaces and drop route suffixes", () => {
  assert.equal(
    canonicalUrl("https://gitlab.com/group/subgroup/project/-/releases"),
    "gitlab.com/group/subgroup/project",
  );
});

test("dedupe marks exact project repository matches as duplicates", () => {
  const projects = buildProjectIndexes([
    { id: "project-1", name: "Existing", source_code_url: "https://github.com/acme/tool", website_url: null },
  ]);
  const current = candidate({ canonical_source_code_key: "github.com/acme/tool" });
  const result = classifyCandidate(current, projects, buildCandidateIndexes([current]));
  assert.equal(result.action, "duplicate");
  assert.equal(result.reason, "source_code_url");
  assert.equal(result.project.id, "project-1");
});

test("dedupe marks exact project homepage matches as duplicates", () => {
  const projects = buildProjectIndexes([
    { id: "project-1", name: "Existing", source_code_url: null, website_url: "https://example.com/" },
  ]);
  const current = candidate({ canonical_website_key: "example.com" });
  const result = classifyCandidate(current, projects, buildCandidateIndexes([current]));
  assert.equal(result.action, "duplicate");
  assert.equal(result.reason, "website_url");
});

test("dedupe sends name-only project matches to review", () => {
  const projects = buildProjectIndexes([
    { id: "project-1", name: "Example", source_code_url: null, website_url: null },
  ]);
  const current = candidate();
  const result = classifyCandidate(current, projects, buildCandidateIndexes([current]));
  assert.equal(result.action, "review");
  assert.equal(result.reason, "name");
});

test("dedupe queues candidates without exact or name matches", () => {
  const current = candidate();
  const result = classifyCandidate(current, buildProjectIndexes([]), buildCandidateIndexes([current]));
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
  assert.equal(normalizeRecord({ name: "Example", summary: "A useful example project for testing the pipeline." }).self_hosting_status, "unknown");
});
