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
  const root = mkdtempSync(join(tmpdir(), "stack127-tool-pipeline-"));
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

    const interfaceContract = `# Interface contract: Test tool
Status: ready
Tool: Test tool
Route: \`/test-tools/test-tool\`
Mode: pipeline
Depends on: \`brief.md\`, \`implementation-report.md\`
Input fingerprint: \`brief.md sha256:${hash(brief)}\`
Input fingerprint: \`implementation-report.md sha256:${hash(implementation)}\`
## User task
- Primary user: A technical operator planning a real change.
- Question: What exact value follows from this input?
- Lead answer: The calculated value with its unit.
- Next decision: Whether the value fits the operator's stated boundary.
## Information decisions
| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Input value | What should be calculated? | User | input | It changes the answer. | Show once in the control. |
| Calculated value | What is the answer? | Engine | lead | It is the user's primary job. | Do not repeat it in a summary card. |
| Formula boundary | What does the value exclude? | Product contract | supporting | It prevents misuse. | State once beside the answer. |
| Internal precision | How was rounding stored? | Engine | omit | It does not change the next decision. | Keep out of the interface. |
## Input contract
| Order | Input or action | Required, default, or derived | Affects lead answer | Effective value | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Value | Required | Yes | User-entered number | Visible | ToolNumberInput | It defines the calculation. | Full row. |
| 2 | Calculate | Primary action | Not applicable | Commits the current input | Visible | ToolButton | It commits the input. | Full row below input. |
## Result contract
| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Answer | What exact value follows from this input? | Calculated value and unit | Large answer | No duplicate summary. |
| 2 | Boundary | What does this answer exclude? | Contract exclusion | One quiet supporting row | No formula essay. |
## Visual semantics
| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large answer | One exact conclusion | Yes, hierarchy encodes primacy rather than magnitude. | Use one lead answer. |
| Progress bar | Position within a known range | No, the answer has no meaningful denominator. | Omit. |
## State contract
| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Input enabled | Absent | Absent | No error | Focus input. |
| Invalid | Input enabled | Cleared | Absent | One field error | Focus invalid input. |
| Loading | Input locked briefly | Prior result hidden | Absent | Cancel not needed | Announce calculation. |
| Success | Input enabled | Current answer | Boundary visible | No error | Announce answer. |
| Failure | Input enabled | Cleared | Absent | One retry action | Focus recovery. |
## Component contract
- Generic or native-looking fallback allowed: no
| Need | Existing component inspected | Disposition | Chosen component | States, accessibility, responsive behavior, and tokens | Why it fits; rejected alternative |
| --- | --- | --- | --- | --- | --- |
| Exact numeric input | ToolNumberField in app/tool-ui/tool-controls.tsx | reuse shared | ToolNumberField | Label, error, focus, keyboard, and narrow width use shared tokens. | Preserves label and numeric keyboard; free text lacks numeric controls. |
| Dominant result | ToolPrimaryResult in app/tool-ui/tool-controls.tsx | reuse shared | ToolPrimaryResult | Success and stale states remain readable at narrow width. | Makes one conclusion primary; metric cards repeat equal-weight facts. |
## Responsive contract
| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Input, action, answer, boundary | 999,999,999.99 units | None. |
| 390px | Input, action, answer, boundary in one column | 999,999,999.99 units | Answer wraps safely. |
| 320px | Same order with full-width action | 999,999,999.99 units | None. |
## Interface wireframes
### Desktop result
\`\`\`text
[Value                         ][Calculate]
42 units
Boundary: documented scope only
\`\`\`
### Narrow mobile result
\`\`\`text
[Value              ]
[Calculate          ]
42 units
Boundary: documented scope only
\`\`\`
### Initial, invalid, loading, empty, partial, failure, and expanded states
The state table defines every applicable state; no empty, partial, or expanded state applies to this deterministic result.
## Removed or rejected
- Remove the repeated metric summary because it answers the same question as the lead value.
## Acceptance criteria
| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Success shows one dominant answer. | Browser inspection. |
| UI-002 | deduplication | No formatted result value is repeated. | Browser test. |
| UI-003 | visual-truth | The result uses no geometry without a real scale. | Browser inspection. |
| UI-004 | component-consistency | The input and answer use their approved stack127 components. | Browser and source inspection. |
| UI-005 | responsive | The 320px page has no horizontal overflow. | Browser test. |
| UI-006 | url | Opening the clean canonical route leaves the URL unchanged through hydration. | Browser test. |
## Open questions and blockers
- None. The product and information decisions are closed.
`;
    writeFileSync(join(directory, "interface-contract.md"), interfaceContract);

    const edgeCases = `# Edge cases and tests: Test tool
Status: ready
Tool: Test tool
Route: \`/test-tools/test-tool\`
Depends on: \`competitive-report.md\`, \`implementation-report.md\`, \`interface-contract.md\`, \`brief.md\`
Input fingerprint: \`competitive-report.md sha256:${hash(competitive)}\`
Input fingerprint: \`implementation-report.md sha256:${hash(implementation)}\`
Input fingerprint: \`interface-contract.md sha256:${hash(interfaceContract)}\`
Input fingerprint: \`brief.md sha256:${hash(brief)}\`
## Risk model
${filler}
## Requirement traceability
| Requirement | Cases |
| --- | --- |
| R1 | EC-001 through EC-008 and FF-001 through FF-003 |
| UI-001 | EC-001 verifies a single current answer. |
| UI-002 | EC-004 verifies one recovery surface. |
| UI-003 | EC-006 verifies the visual treatment. |
| UI-004 | EC-006 verifies the approved component treatment. |
| UI-005 | EC-007 verifies narrow layout. |
| UI-006 | EC-009 verifies clean-route URL stability. |
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
| Control mode, switching, parity, and hidden-state recovery | Not applicable: this fixture has one visible control mode |
| Accessibility | EC-006 |
| Responsive and themes | EC-007 |
| Security and privacy | EC-008 |
| SSR and SEO | EC-005 |
| Performance | EC-004 |
## Edge-case matrix
| ID | Priority | Category | Input | System outcome | User experience | Side effects | Test file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Invalid input | letters | No result | Recovery beside field | No URL update | tests/test.test.mjs | R1, UI-001 |
| EC-002 | P0 | Boundary | value above maximum | No result | Boundary shown beside field | No URL update | tests/test.test.mjs | R1 |
| EC-003 | P0 | Precision | repeating decimal | Preserve source precision | Rounded display names rule | URL keeps source value | tests/test.test.mjs | R1 |
| EC-004 | P1 | Concurrency | rapid repeat submit | One deterministic result | No duplicate feedback | One URL update | tests/page.spec.mjs | R1, UI-002 |
| EC-005 | P1 | Shared state | malformed query | Restore clean state | Explain recovery | Replace invalid URL | tests/page.spec.mjs | R1 |
| EC-006 | P1 | Accessibility | keyboard submit | Calculate once | Result uses the approved controls and is announced without false geometry | URL may update | tests/page.spec.mjs | R1, UI-003, UI-004 |
| EC-007 | P1 | Responsive | long result on narrow screen | Exact value remains intact | No clipping | No side effect | tests/page.spec.mjs | R1, UI-005 |
| EC-008 | P0 | Security | HTML-like pasted input | Reject as invalid | Render as inert text | No logs or analytics | tests/test.test.mjs | R1 |
| EC-009 | P0 | Clean route | Open the canonical route without query parameters | Keep initial defaults | No unexpected announcement | URL and history remain unchanged | tests/page.spec.mjs | UI-006 |
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
Depends on: \`competitive-report.md\`, \`implementation-report.md\`, \`interface-contract.md\`, \`edge-cases-and-tests.md\`, \`brief.md\`
Input fingerprint: \`competitive-report.md sha256:${hash(competitive)}\`
Input fingerprint: \`implementation-report.md sha256:${hash(implementation)}\`
Input fingerprint: \`interface-contract.md sha256:${hash(interfaceContract)}\`
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

    callback({ directory, files: { competitive, implementation, brief, interfaceContract, edgeCases, writing } });
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
    for (const file of ["implementation-report.md", "brief.md", "interface-contract.md", "edge-cases-and-tests.md", "writing-and-seo.md"]) {
      rmSync(join(directory, file));
    }
    const result = run(directory, "--stage=research");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Tool-page research stage ready/);
  });
});

test("validates the interface stage before test design", () => {
  withFixture(({ directory }) => {
    for (const file of ["edge-cases-and-tests.md", "writing-and-seo.md"]) {
      rmSync(join(directory, file));
    }
    const result = run(directory, "--stage=interface");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Tool-page interface stage ready/);
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

test("rejects an untested interface requirement", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(
      join(directory, "edge-cases-and-tests.md"),
      files.edgeCases.replace(/, UI-004/g, ""),
    );
    const result = run(directory, "--stage=test");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /UI-004 has no edge-case coverage/);
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

test("accepts useful prose-led explanation without length or media-ratio quotas", () => {
  withFixture(({ directory, files }) => {
    let writing = files.writing
      .replace(/^Prose is the minority:.*\n/m, "")
      .replace(/^Static prose budget:.*\n/m, "")
      .replace("80 words, one paragraph", "Explain the boundary and when to verify it; stop before implementation internals");
    const outline = [];
    const assignments = [];
    for (let number = 2; number <= 7; number++) {
      const id = `COPY-${String(number).padStart(2, "0")}`;
      outline.push(`| ${number + 2} | Reader question ${number} | Meaningful uncertainty ${number} | Verified interpretation | Sentences | Primary source | Avoid repeating the result | ${id} |`);
      assignments.push(`| ${id} | Reader question ${number} | Resolve this uncertainty | Verified source and product contract | Explain the consequence and stop when the next check is clear | Do not repeat earlier explanations |`);
    }
    writing = writing.replace("## Formula explanation", `${outline.join("\n")}\n## Formula explanation`);
    writing = writing.replace("## Source ledger", `${assignments.join("\n")}\n## Source ledger`);
    writeFileSync(join(directory, "writing-and-seo.md"), writing);
    const result = run(directory);
    assert.equal(result.status, 0, result.stderr);
  });
});

test("does not enforce a legacy default word ceiling on a sourced content plan", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(join(directory, "writing-and-seo.md"), files.writing.replace("120 words maximum", "1200 words maximum"));
    const result = run(directory);
    assert.equal(result.status, 0, result.stderr);
  });
});

test("still rejects a prose assignment without facts or a stopping point", () => {
  withFixture(({ directory, files }) => {
    writeFileSync(join(directory, "writing-and-seo.md"), files.writing.replace("Formula and primary source | 80 words, one paragraph", " | "));
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /needs facts, a depth\/stopping point, and repetition guard/);
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
