import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { validateInterfaceContractDirectory, validateInterfaceContractText } from "./validate-interface-contract.mjs";

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function contract({ brief, extraHeaders = "", resultQuestion = "When does it expire?" }) {
  return `# Interface contract: Example checker

Status: ready
Tool: Example checker
Route: \`/example-checker\`
Mode: retrofit
Depends on: \`brief.md\`
Input fingerprint: \`brief.md sha256:${hash(brief)}\`
${extraHeaders}
## User task

- Primary user: A domain owner checking one name.
- Question: When does this domain expire?
- Lead answer: The exact expiry date and time remaining.
- Next decision: Renew now or keep monitoring.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which name is checked? | User | input | Required query | Show once in answer |
| Expiry | ${resultQuestion} | Registry | lead | Primary answer | Do not repeat in metrics |
| Raw response | Can I verify it? | Registry | evidence | Source proof | Keep collapsed |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | Required | Yes | No default, user supplied | Visible | ToolTextField | Sets the query | Full width |
| 2 | Check expiry | Primary action | Not applicable | No default | Visible | ToolButton | Runs the check | Full width |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Expiry answer | ${resultQuestion} | Expiry date | ToolPrimaryResult | No second date block |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Timeline | Conditional lifecycle | No, stages have variable duration | Replace with a stage list |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Input and action | Hidden | Hidden | None | Natural order |
| Invalid | Input retained | Hidden | Hidden | Inline error | Focus input |
| Loading | Input retained, action busy | Previous result stale | Hidden | None | Announce loading |
| Success | Input retained | Expiry visible | Evidence follows | None | Announce result |

## Optional mode and state visibility

- Control mode: single
- Shared engine and normalized input mapping: One input maps directly to the engine.
- Basic assumptions and sources: Not applicable because this tool has one mode.
- Custom-value visibility in Basic: Not applicable because this tool has one mode.
- Switch retention and reset: Not applicable because this tool has one mode.
- Hidden invalid-value recovery: The visible field owns every validation error.
- Labels and mode explanation: No mode label is shown.
- URL, reload, and history restoration: The clean route remains stable.
- Equivalent-input parity evidence: Not applicable because this tool has one mode.

## Component contract

- Generic or native-looking fallback allowed: no

| Need | Existing component inspected | Disposition | Chosen component | States, accessibility, responsive behavior, and tokens | Why it fits; rejected alternative |
| --- | --- | --- | --- | --- | --- |
| Query | ToolTextField in app/tool-ui/tool-controls.tsx | reuse shared | ToolTextField | Label, error, focus, keyboard, and narrow width use shared tokens | One labelled value; search field is misleading |
| Answer | ToolPrimaryResult in app/tool-ui/tool-controls.tsx | reuse shared | ToolPrimaryResult | Success and stale states keep the answer readable at narrow width | One dominant result; metric cards repeat facts |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Input then action then result | Internationalized domain | None |
| 760px | Stacked controls and result | Internationalized domain | None |
| 320px | Single column | Long registry URL | Raw disclosure only |

## Interface wireframes

### Desktop result

\`\`\`text
[domain name                 ] [check]
18 September 2027
\`\`\`

### Narrow mobile result

\`\`\`text
[domain name]
[check]
18 September 2027
\`\`\`

### Initial, invalid, loading, empty, partial, failure, and expanded states

The state table owns the states that do not need a separate layout.

## Removed or rejected

- Remove the duplicate date metric because the lead already answers the question.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | The lead answer shows the expiry date first | Browser test |
| UI-002 | deduplication | The expiry date appears once | Browser test |
| UI-003 | visual-truth | Variable lifecycle stages do not use an equal-spacing timeline | Browser inspection |
| UI-004 | component-consistency | Controls use the approved shared stack127 components | Browser and source inspection |
| UI-005 | responsive | Mobile has no page overflow | Browser measurement |
| UI-006 | url | Opening the clean canonical route does not add query parameters or replace browser history | Browser test |

## Open questions and blockers

- None. The existing engine supplies the required result.
`;
}

test("accepts a complete retrofit contract", (context) => {
  const root = mkdtempSync(join(tmpdir(), "interface-contract-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const docs = join(root, "example-checker");
  mkdirSync(docs, { recursive: true });
  const brief = "# Brief\n\n## Who is here\nA domain owner.\n";
  writeFileSync(join(docs, "brief.md"), brief);
  writeFileSync(join(docs, "interface-contract.md"), contract({ brief }));
  const result = validateInterfaceContractDirectory(docs);
  assert.equal(result.ok, true, result.errors.join("\n"));
});

test("rejects repeated result questions", () => {
  const brief = "brief";
  const source = contract({ brief }).replace(
    "| 1 | Expiry answer | When does it expire? | Expiry date | ToolPrimaryResult | No second date block |",
    "| 1 | Expiry answer | When does it expire? | Expiry date | ToolPrimaryResult | No second date block |\n| 2 | Expiry metric | When does it expire? | Expiry date | ToolMetricGroup | Repeats the lead |",
  );
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /repeat the same user question/);
});

test("rejects a visual that is kept after failing its truth test", () => {
  const brief = "brief";
  const source = contract({ brief }).replace(
    "| Timeline | Conditional lifecycle | No, stages have variable duration | Replace with a stage list |",
    "| Timeline | Conditional lifecycle | No, stages have variable duration | Use the timeline |",
  );
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /cannot be used when its geometry fails the truth test/);
});

test("requires exactly one primary action", () => {
  const brief = "brief";
  const source = contract({ brief }).replace("| 2 | Check expiry | Primary action |", "| 2 | Check expiry | Secondary action |");
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /needs exactly one primary action/);
});

test("rejects a required result-driving input inside a disclosure", () => {
  const brief = "brief";
  const source = contract({ brief }).replace(
    "| 1 | Domain name | Required | Yes | No default, user supplied | Visible |",
    "| 1 | Domain name | Required | Yes | No default, user supplied | Disclosure |",
  );
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /result-driving required or defaulted input.*visible/i);
});

test("rejects a silently defaulted result-driving input inside a disclosure", () => {
  const brief = "brief";
  const source = contract({ brief }).replace(
    "| 1 | Domain name | Required | Yes | No default, user supplied | Visible |",
    "| 1 | Domain name | Defaulted | Yes | Product convention: example.com | Disclosure |",
  );
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /result-driving required or defaulted input.*visible/i);
});

test("requires a clean-route URL acceptance criterion", () => {
  const brief = "brief";
  const source = contract({ brief }).replace(
    "| UI-006 | url | Opening the clean canonical route does not add query parameters or replace browser history | Browser test |\n",
    "",
  );
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /need category url/);
});

test("rejects a generic fallback when a stack127 component is missing", () => {
  const brief = "brief";
  const source = contract({ brief }).replace(
    "- Generic or native-looking fallback allowed: no",
    "- Generic or native-looking fallback allowed: yes",
  );
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /reject generic or native-looking fallback/);
});

test("rejects an unapproved component disposition", () => {
  const brief = "brief";
  const source = contract({ brief }).replace("| reuse shared | ToolTextField |", "| generic fallback | Native input |");
  const result = validateInterfaceContractText(source);
  assert.match(result.errors.join("\n"), /invalid component disposition/);
});

test("rejects an incomplete basic-advanced contract", () => {
  const brief = "brief";
  const source = contract({ brief }).replace("- Control mode: single", "- Control mode: basic-advanced");
  const result = validateInterfaceContractText(source.replace(/^- Equivalent-input parity evidence:.*$/m, ""));
  assert.match(result.errors.join("\n"), /basic-advanced mode is missing Equivalent-input parity evidence:/);
});

test("rejects a stale brief fingerprint", (context) => {
  const root = mkdtempSync(join(tmpdir(), "interface-contract-stale-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const docs = join(root, "example-checker");
  mkdirSync(docs, { recursive: true });
  writeFileSync(join(docs, "brief.md"), "changed brief");
  writeFileSync(join(docs, "interface-contract.md"), contract({ brief: "old brief" }));
  const result = validateInterfaceContractDirectory(docs);
  assert.match(result.errors.join("\n"), /stale or missing fingerprint for brief\.md/);
});
