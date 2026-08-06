import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = join(dirname(fileURLToPath(import.meta.url)), "validate-pipeline.mjs");
const filler = "This section records a concrete, verified decision with enough detail for the downstream stage to act without guessing.";

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

function withFixture(callback) {
  const root = mkdtempSync(join(tmpdir(), "version127-tool-pipeline-"));
  const directory = join(root, "content_docs", "test-tools", "test-tool");
  mkdirSync(directory, { recursive: true });
  try {
    const competitive = `# Competitive report: Test tool
Status: ready
Tool: Test tool
Route: \`/test-tools/test-tool\`
Researched: 2026-08-03
Direct competitors reviewed: 5
Saturation exception: yes
## Research scope
### Search saturation evidence
- Queries tried: exact tool, user job, specialist variation, and failure variation.
- Repeated domains: the same five direct tools repeated across queries.
- Exclusions: remaining results were articles without an interactive tool.
## Search intent
| Intent | Evidence |
| --- | --- |
| Primary calculation | ${filler} |
| Reverse sizing | ${filler} |
| Boundary question | ${filler} |
| Specialist variation | ${filler} |
## User pain evidence
| Pain | Evidence |
| --- | --- |
| Confusing units | https://example.com/community-one ${filler} |
| Hidden assumptions | https://example.com/community-two ${filler} |
| Stale results | https://example.com/community-three ${filler} |
## Technical truth to verify
| Claim | Source |
| --- | --- |
| Formula | https://example.com/spec |
| Unit definition | https://example.com/units |
| Boundary | https://example.com/boundary |
## Competitor reviews
${[1, 2, 3, 4, 5].map((number) => `### Competitor ${number}: Tool ${number}
- URL: https://example.com/tool-${number}
- [Observed] Inputs and defaults are visible and bounded.
- [Observed] The result appears after explicit submit.
- [Documented] The formula is linked to a source.
- [Observed] Invalid input stays beside the field.
- [Unknown] Screen-reader behavior is not documented.
\`\`\`text
[Input] -> [Action] -> [Result]
\`\`\`
`).join("\n")}
## Comparison matrix
| Capability | Result |
| --- | --- |
| Exact units | ${filler} |
| Validation | ${filler} |
| Reverse sizing | ${filler} |
| Shared state | ${filler} |
| Mobile result | ${filler} |
## Formula and data disagreements
| Question | Decision |
| --- | --- |
| Rounding | ${filler} |
## Evidence-backed opportunities
1. Make unit conversion visible. ${filler}
## Sources
- https://example.com/source-one
- https://example.com/source-two
- https://example.com/source-three
- https://example.com/source-four
- https://example.com/source-five
`;
    writeFileSync(join(directory, "competitive-report.md"), competitive);

    const implementation = `# Implementation report: Test tool
Status: ready
Tool: Test tool
Route: \`/test-tools/test-tool\`
Depends on: \`competitive-report.md\`
Input fingerprint: \`competitive-report.md sha256:${hash(competitive)}\`
Contract type: formula
## Product decision
- Primary user: A technical operator planning a real change.
- Job: Calculate one exact answer without hidden assumptions.
- Product thesis: Make the formula and boundary visible in the result.
- Evidence: The competitive report shows repeated unit confusion.
## Scope
### Table stakes
Accept valid input and return the exact answer.
### Launch differentiators
Show the formula boundary in the result visualization.
### Deferred
Keep export outside the first release.
### Non-goals
Do not predict effects the inputs cannot establish.
## Formula and data contract
### Inputs and normalization
| Input | Rule |
| --- | --- |
| Value | Accept a bounded decimal and normalize its unit. |
### Equations or resolution order
Multiply the normalized input by the documented factor.
### Rounding, display, and versioning
Keep source precision, round only the displayed value, and version shared inputs as v1.
### Invalid, unknown, absent, and partial states
An invalid input returns no value and clears any stale result.
### Assumptions and exclusions
The answer covers only the documented conversion and excludes external system effects.
### Primary sources
https://example.com/spec defines the exact conversion.
## User flow
\`\`\`mermaid
flowchart TD
  A["Input"] --> B{"Valid?"}
  B -->|"Yes"| C["Result"]
  B -->|"No"| D["Recovery"]
\`\`\`
## Interface wireframes
\`\`\`text
[Input][Unit][Calculate]
\`\`\`
\`\`\`text
[Input][Unit][Calculate]
[Exact result visualization]
\`\`\`
## Interaction contract
| Event | Response | Result | Focus | URL |
| --- | --- | --- | --- | --- |
| Valid submit | Calculate | Show current result | Announce answer | Encode input |
| Invalid submit | Block | Clear stale result | Focus first error | No update |
## Page composition
| Claim | Medium | Position | Reason |
| --- | --- | --- | --- |
| Primary answer | Tool UI | First | It is the user's job. |
| Exact relationship | Clean chart | Result | It is faster than prose. |
## Technical plan
Own the route in app/, pure math in lib/, tests in tests/, and contracts in content_docs/. ${filler}
## Acceptance criteria
| ID | Criterion | Evidence |
| --- | --- | --- |
| R1 | The exact answer is visible after valid input. | Unit and Browser test |
`;
    writeFileSync(join(directory, "implementation-report.md"), implementation);

    const brief = `# Brief: Test tool
## Who is here
A technical operator needs an exact answer before changing a real system.
## The job
They leave with a verified value and understand the one boundary that limits it.
## Show vs say
The tool UI and result show the relationship. One short sentence carries the caveat.
`;
    writeFileSync(join(directory, "brief.md"), brief);

    const edgeCases = `# Edge cases and tests: Test tool
Status: ready
Tool: Test tool
Route: \`/test-tools/test-tool\`
Depends on: \`competitive-report.md\`, \`implementation-report.md\`, \`brief.md\`
Input fingerprint: \`competitive-report.md sha256:${hash(competitive)}\`
Input fingerprint: \`implementation-report.md sha256:${hash(implementation)}\`
Input fingerprint: \`brief.md sha256:${hash(brief)}\`
## Risk model
${filler}
## Requirement traceability
| Requirement | Cases |
| --- | --- |
| R1 | EC-001 through EC-008 and FF-001 through FF-003 |
## Coverage checklist
| Family | Cases or reason |
| --- | --- |
| Input grammar | EC-001 |
| Numeric boundaries | EC-002 |
| Configuration dependencies | EC-002 |
| Technical truth | EC-003 |
| Submission and concurrency | EC-004 |
| Network and upstream | Not applicable: deterministic formula makes no upstream request |
| Persistence and sharing | EC-005 |
| Accessibility | EC-006 |
| Responsive and themes | EC-007 |
| Security and privacy | EC-008 |
| SSR and SEO | EC-005 |
| Performance | EC-004 |
## Edge-case matrix
| ID | Priority | Category | Input | System outcome | User experience | Side effects | Test file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Invalid input | letters | No result | Recovery beside field | No URL update | tests/test.test.mjs | R1 |
| EC-002 | P0 | Boundary | value above maximum | No result | Boundary shown beside field | No URL update | tests/test.test.mjs | R1 |
| EC-003 | P0 | Precision | repeating decimal | Preserve source precision | Rounded display names rule | URL keeps source value | tests/test.test.mjs | R1 |
| EC-004 | P1 | Concurrency | rapid repeat submit | One deterministic result | No duplicate feedback | One URL update | tests/page.spec.mjs | R1 |
| EC-005 | P1 | Shared state | malformed query | Restore clean state | Explain recovery | Replace invalid URL | tests/page.spec.mjs | R1 |
| EC-006 | P1 | Accessibility | keyboard submit | Calculate once | Result is announced | URL may update | tests/page.spec.mjs | R1 |
| EC-007 | P1 | Responsive | long result on narrow screen | Exact value remains intact | No clipping | No side effect | tests/page.spec.mjs | R1 |
| EC-008 | P0 | Security | HTML-like pasted input | Reject as invalid | Render as inert text | No logs or analytics | tests/test.test.mjs | R1 |
## Formula or resolution fixtures
| ID | Input | Output | Oracle | Branch |
| --- | --- | --- | --- | --- |
| FF-001 | 1 | 1 | Primary specification | Valid formula branch |
| FF-002 | 0 | 0 | Hand derivation from specification | Minimum boundary |
| FF-003 | maximum | documented maximum result | Primary specification | Maximum boundary and display rounding |
## Test plan
### Pure engine and unit tests
Test exact arithmetic, validation, serialization, and every branch.
### API or route tests
No API is needed for this formula contract.
### Browser tests
Test focus, keyboard submit, reset, history, and responsive result layout.
### Static and SEO tests
Test route ownership, publication state, canonical behavior, and server-rendered explanation.
## Manual verification
| State | View | Check | Pass condition |
| --- | --- | --- | --- |
| Clean | Desktop dark | Hierarchy | Tool is primary |
| Result | Desktop light | Exact visual | Values fit |
| Invalid | Mobile dark | Recovery | Error stays local |
| Long value | Mobile light | Overflow | No clipping |
## Plan completion criteria
Every P0 and P1 case has an owner, deterministic fixture, and expected user experience.
`;
    writeFileSync(join(directory, "edge-cases-and-tests.md"), edgeCases);

    const writing = `# Writing and SEO plan: Test tool
Status: ready
Tool: Test tool
Route: \`/test-tools/test-tool\`
Depends on: \`competitive-report.md\`, \`implementation-report.md\`, \`edge-cases-and-tests.md\`, \`brief.md\`
Input fingerprint: \`competitive-report.md sha256:${hash(competitive)}\`
Input fingerprint: \`implementation-report.md sha256:${hash(implementation)}\`
Input fingerprint: \`edge-cases-and-tests.md sha256:${hash(edgeCases)}\`
Input fingerprint: \`brief.md sha256:${hash(brief)}\`
SERP checked: 2026-08-03
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 1 section, 120 words maximum
## Search intent
${filler}
## Page promise
${filler}
## Heading and media outline
| Order | Heading | Question | Takeaway | Medium | Evidence | Limit | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Test tool | What is the answer? | The current result | Tool UI | Product contract | Do not repeat | n/a |
| 2 | Where the value goes | How do parts relate? | Exact allocation | Clean chart | Formula | No prose recap | n/a |
| 3 | What the result excludes | What is the boundary? | One caveat | Sentences | Primary source | 80 words | COPY-01 |
## Formula explanation
| Concept | Need | Medium | Source | Caveat |
| --- | --- | --- | --- | --- |
| Inputs | What changes the answer | Tool labels | https://example.com/spec | Beside input |
| Boundary | What is excluded | One sentence | https://example.com/boundary | Beside result |
## Metadata proposal
- Registry label: test tool
- Meta title: Test tool for an exact answer
- Meta description: Calculate the exact result and see the documented boundary.
- Page type: WebPage
- Publication recommendation: Unpublished until explicit approval.
## Internal links
| Direction | Destination | Reason | Anchor | Placement |
| --- | --- | --- | --- | --- |
| In | /test-tools | Find this tool | test tool | Hub |
| Out | /related | Continue the job | related reference | After result |
## Manual prose handoff
| Section ID | Heading | Purpose | Facts | Word limit and shape | Repetition guard |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | What the result excludes | State one boundary | Formula and primary source | 80 words, one paragraph | Do not repeat the chart |
## Source ledger
- https://example.com/spec supports the formula.
- https://example.com/units supports unit handling.
- https://example.com/boundary supports the caveat.
`;
    writeFileSync(join(directory, "writing-and-seo.md"), writing);

    callback({ directory, files: { competitive, implementation, brief, edgeCases, writing } });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function run(directory, ...extra) {
  return spawnSync(process.execPath, [script, directory, ...extra], { encoding: "utf8" });
}

test("accepts a substantive, fingerprinted pipeline", () => {
  withFixture(({ directory }) => {
    const result = run(directory);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Tool-page content stage ready: \/test-tools\/test-tool/);
  });
});

test("validates the research stage without downstream artifacts", () => {
  withFixture(({ directory }) => {
    for (const file of ["implementation-report.md", "brief.md", "edge-cases-and-tests.md", "writing-and-seo.md"]) {
      rmSync(join(directory, file));
    }
    const result = run(directory, "--stage=research");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Tool-page research stage ready/);
  });
});

test("rejects an empty required section", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(
      join(directory, "implementation-report.md"),
      files.implementation.replace(/## Product decision[\s\S]*?## Scope/, "## Product decision\n## Scope"),
    );
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /section ## Product decision is not substantive/);
  });
});

test("does not accept a required heading hidden inside a code fence", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(
      join(directory, "implementation-report.md"),
      files.implementation.replace(
        /## Product decision[\s\S]*?## Scope/,
        `\`\`\`text\n## Product decision\n${filler}\n\`\`\`\n## Scope`,
      ),
    );
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing heading ## Product decision/);
  });
});

test("rejects a stale fingerprint", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(join(directory, "competitive-report.md"), `${files.competitive}\nNew upstream decision.\n`);
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /stale or missing fingerprint for competitive-report.md/);
  });
});

test("rejects an unfilled placeholder even when it is long", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(
      join(directory, "implementation-report.md"),
      files.implementation.replace(
        "Multiply the normalized input by the documented factor.",
        "[[Exact numbered derivation, algorithm, or source precedence.]]",
      ),
    );
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /contains an unfilled template placeholder/);
  });
});

test("rejects an edge case that references an unknown requirement", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(
      join(directory, "edge-cases-and-tests.md"),
      files.edgeCases.replace("tests/test.test.mjs | R1", "tests/test.test.mjs | R999"),
    );
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /references unknown R999/);
  });
});

test("rejects a token edge-case plan that skips required coverage", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(
      join(directory, "edge-cases-and-tests.md"),
      files.edgeCases.replace(/^\| EC-00[2-8].*\n/gm, ""),
    );
    const result = run(directory, "--stage=test");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /needs at least eight concrete cases/);
    assert.match(result.stderr, /references missing EC-002/);
  });
});

test("rejects prose disguised as an unrecognized medium", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(join(directory, "writing-and-seo.md"), files.writing.replace("| Sentences |", "| FAQ |"));
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unrecognized medium \"faq\"/);
  });
});

test("rejects five competitors without documented saturation", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(join(directory, "competitive-report.md"), files.competitive.replace("Saturation exception: yes", "Saturation exception: no"));
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /five to seven competitors require a saturation exception/);
  });
});

test("accepts a tool-only route with concise interface language", () => {
  withFixture(({ directory }) => {
    const repositoryRoot = dirname(dirname(dirname(directory)));
    const routeFile = join(repositoryRoot, "app", "test-tools", "test-tool", "page.tsx");
    mkdirSync(dirname(routeFile), { recursive: true });
    writeFileSync(
      routeFile,
      `export default function Page() { return <main className="tool frame result layout compact responsive dark light stable"><h1>Test tool</h1><label>Value<input /></label><button>Calculate</button><output>42</output></main>; }\n`,
    );
    const result = run(directory, "--tool-only");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /with tool-only audit/);
  });
});

test("rejects explanatory prose even when fragmented across JSX", () => {
  withFixture(({ directory }) => {
    const repositoryRoot = dirname(dirname(dirname(directory)));
    const routeFile = join(repositoryRoot, "app", "test-tools", "test-tool", "page.tsx");
    mkdirSync(dirname(routeFile), { recursive: true });
    writeFileSync(
      routeFile,
      "export default function Page() { return <main><h1>Test tool</h1><p>This result uses the <strong>documented formula and excludes</strong> effects outside that formula.</p></main>; }\n",
    );
    const result = run(directory, "--tool-only");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /tool-only build contains prose-length public text/);
  });
});
