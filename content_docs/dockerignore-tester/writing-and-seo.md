# Writing and SEO plan: `.dockerignore` Pattern Tester

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready
Tool: `.dockerignore` Pattern Tester
Route: `/dockerignore-tester`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-07
Primary medium: Tool UI

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `.dockerignore pattern tester`, `test dockerignore` | Test one effective ignore file against several representative paths | Batch verdicts with deciding rules | The workbench returns Included or Excluded, the deciding line, and an ordered trace for every probe |
| Close | `how to test dockerignore file` | Check rules without first instrumenting a build | Tool plus an honest verification boundary | The matcher answers immediately, then the guide explains when a real build is still required |
| Close | `dockerignore negate pattern not working` | Understand why a later exception did or did not change the result | Ordered rule evidence | The trace distinguishes Direct and Parent evidence and keeps the final two-state verdict clear |
| Close | `dockerignore pattern syntax checker` | Understand Docker-specific pattern forms and malformed input | Diagnostics plus concise syntax reference | Rule diagnostics preserve line numbers and the guide covers the small set of useful Docker forms |

The page deliberately does not target generators, preset libraries, generic glob testing, Git ignore behavior, repository uploads, Dockerfile parsing, security scanning, or complete current-Docker emulation.

## Page promise

Paste one effective `.dockerignore` file and context-relative path probes to get local Included or Excluded verdicts, deciding lines, and ordered traces under the pinned Moby v0.6.1 compatibility contract. The probes need not exist, and the result does not replace a real Docker build.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1 introduction | Sentences | `brief.md`; implementation R6 and R16 | Do not repeat the promise below the tool |
| Which source and inputs matter? | Source selector, editor labels, and effective-file section | Tool UI and Sentences | Docker build-context docs; implementation R11 | Explain precedence once |
| How should someone use it meaningfully? | Probe-selection paragraph | Sentences | Implementation input contract and user pain evidence | Explain representative probes, not button clicks |
| How should the result be interpreted? | Dynamic result, trace, and deciding-rule section | Exact result visualization and Sentences | Implementation R6; FF-002, FF-003, and FF-012 | Do not narrate every result row |
| Which syntax and concepts commonly surprise users? | Pattern reference and Parent example | Table and Sentences | Docker syntax docs; Moby v0.6.1 | No generic glob or Git-ignore tutorial |
| What does the tester not prove? | Boundary table | Table | Implementation non-goals, R16, and R18 | State each exclusion once |
| How are inputs handled? | Adjacent privacy sentence and Local handling boundary | Tool UI and Table | Implementation R16 | Keep the claim scoped to pattern testing |
| What should the reader verify next? | Final Docker verification section | Sentences and links | Docker docs and stack127 Docker guide | One real-build step, not another tutorial |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: `.dockerignore` Pattern Tester: see which rule decides each path | What is this and what answer will I get? | Name the effective file and path probes, exact verdict shape, local handling, and build boundary | Sentences | `brief.md`; implementation R6 and R16 | Two or three sentences; do not explain syntax here | COPY-01 |
| 2 | Interactive tester | What should I provide? | One effective file and one context-relative path probe per line | Tool UI | Implementation inputs and R11 | Keep labels exact and accept no second rule set | n/a |
| 3 | Dynamic result sentence and rows | What happened? | Lead with Included and Excluded counts, then path, verdict, and deciding rule | Exact result visualization | Implementation R6 and R9 | Do not restate the rows in prose | n/a |
| 4 | Trace and rule diagnostics | Which lines matched and how were they normalized? | Preserve source order, Direct or Parent evidence, state changes, and inactive line diagnostics | Exact result visualization | Moby fixtures; EC-003, EC-006, and EC-007 | Keep exact evidence on demand | n/a |
| 5 | H2: `Start with the file Docker will actually use` | Which file and probes matter? | Explain root versus Dockerfile-specific precedence and representative boundary probes | Sentences | Docker docs; implementation R11 | No button instructions and no repeated privacy claim | COPY-02 |
| 6 | H2: `Docker patterns are ordered, not combined` | Which syntax changes the answer? | Show path, wildcard, recursive wildcard, one-character wildcard, exception, and comment forms | Table | Docker docs; Moby parser and matcher fixtures | Keep this a debugging reference, not a full syntax tutorial | n/a |
| 7 | H2: `The deciding rule is the answer; the trace explains it` | How should I read the verdict and Parent evidence? | Explain initial Included state, last-match behavior, Direct, Parent, and the built-in exception example | Sentences | FF-002, FF-003, and FF-012 | One worked example only | COPY-03 |
| 8 | H2: `When a result surprises you, check these four things` | What should I inspect first? | Check effective source, line order, normalization, and builder-control behavior | Sentences | Competitive user pain; implementation R6, R11, and R18 | Four concise items; no generic troubleshooting essay | COPY-04 |
| 9 | H2: `What this tester proves, and what it cannot` | How far can I trust the result? | Separate probes, matcher evidence, build proof, safety, control files, compatibility, and local handling | Table | Implementation non-goals, R16, and R18 | Each boundary appears once | n/a |
| 10 | Result provenance | Which compatibility contract produced this? | Show Moby version, Linux slash behavior, and pinned commit | Exact result visualization | Implementation R3 and R18 | Keep metadata quiet and mono | n/a |
| 11 | H2: `Confirm the final context with Docker` | What should I do before relying on this in a build? | Run the actual build, verify relevant COPY or ADD behavior, and follow official or installation guidance | Sentences | Docker docs; current BuildKit receipt | One short next-step paragraph | COPY-05 |

No marker art, clean chart, or screenshot is justified. The live result, ordered trace, diagnostics, pattern table, and boundary table are the exact visuals the reader needs.

## Formula explanation

| Concept | What the reader needs | Presentation | Example or source | Caveat placement |
| --- | --- | --- | --- | --- |
| Effective source | A Dockerfile-specific ignore file takes precedence over the root file | Source selector and COPY-02 | Docker build-context docs; implementation R11 | State that files are not merged beside the source explanation |
| Ordered result | Each path starts Included and the last effective match decides | Result rows, trace, and COPY-03 | FF-002 and FF-003 | Keep two verdicts only |
| Parent evidence | Parent means the same rule matched an ancestor while resolving the probe | Trace and built-in example | FF-012 and current BuildKit receipt | Say evidence, not a third verdict |
| Pattern forms | Docker uses Go-style matching plus `**`, preprocessing, comments, and ordered exceptions | Pattern table | Docker docs and Moby v0.6.1 | Do not imply braces, extglob, or Git semantics |
| Compatibility | The TypeScript port is pinned to Moby `patternmatcher` v0.6.1 | Result provenance and boundary table | Pinned fixture corpus | Do not claim every current Docker build is identical |
| Limits and privacy | Probes are local matcher inputs, not discovered files or build proof | Adjacent privacy statement and boundary table | Implementation R16 and non-goals | Keep safety and build caveats next to the result boundary |

## Metadata proposal

- Registry label: `.dockerignore tester`
- Meta title: `.dockerignore Pattern Tester: see the deciding rule`
- Meta description: `Test .dockerignore rules against path probes and see Included or Excluded verdicts, deciding lines, and ordered traces. Matching stays local.`
- Page type: `WebApplication`
- Publication recommendation: `Publish under the exact flat slug after approval on 2026-08-07.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/self-hosting-for-beginners/install-docker` | The reader needs Docker before performing the real-build verification step | `install Docker` | Final verification paragraph |
| Out | `https://docs.docker.com/build/concepts/context/#dockerignore-files` | The reader needs the primary source for file placement, syntax, exceptions, and control-file behavior | `official Docker documentation` | Final verification paragraph |

Publication does not require adding the tool to home, navigation, or a collection. Those discovery placements remain separate editorial decisions.

## Manual prose handoff

| Section ID | Heading | Purpose | Required facts and sources | Planned format | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | H1 introduction | Define the tool, inputs, answer, local handling, and main boundary | `brief.md`; implementation R6 and R16 | Prose. | No syntax lesson, best claim, security claim, or build parity claim |
| COPY-02 | `Start with the file Docker will actually use` | Explain effective-file precedence and meaningful probe selection | Docker docs; implementation R11 and input contract | Prose. | No click instructions, presets, or repeated result narration |
| COPY-03 | `The deciding rule is the answer; the trace explains it` | Explain verdict state, Direct, Parent, and one exact exception example | FF-002, FF-003, and FF-012 | Prose. | No third verdict or parent-blocking claim |
| COPY-04 | `When a result surprises you, check these four things` | Give the shortest useful troubleshooting sequence | Implementation R6, R11, and R18 | Four ordered items. | No generic methodology or duplicated syntax table |
| COPY-05 | `Confirm the final context with Docker` | Send the reader to real-build verification and primary guidance | Docker build-context docs and stack127 Docker installation guide | Prose. | No claim that browser matching proves COPY, ADD, safety, or current-Docker parity |

### Page constraints

- Keep the tool primary and do not repeat a result, table, trace, heading, or prior section.
- Keep generator advice outside this checker's scope.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The later `$stack127-tool-writing` stage owns the content integration.

## Source ledger

- Docker build context and `.dockerignore` documentation: https://docs.docker.com/build/concepts/context/#dockerignore-files, checked 2026-08-07. Supports file precedence, preprocessing, syntax, negation order, and builder-control-file behavior.
- Moby `patternmatcher` v0.6.1: https://github.com/moby/patternmatcher/tree/v0.6.1, checked 2026-08-07. Supports the pinned matcher contract and fixtures.
- Moby matcher source: https://github.com/moby/patternmatcher/blob/v0.6.1/patternmatcher.go, checked 2026-08-07. Supports ordered state and Parent evidence.
- Moby ignore-file parser: https://github.com/moby/patternmatcher/blob/v0.6.1/ignorefile/ignorefile.go, checked 2026-08-07. Supports preprocessing and source-line behavior.
- BuildKit v0.29.0 filter: https://github.com/moby/buildkit/blob/v0.29.0/vendor/github.com/tonistiigi/fsutil/filter.go, checked 2026-08-07. Supports the separate current parent-exception traversal receipt.

## Open questions and blockers

- None. Publication was approved on 2026-08-07. Any later change to the competitive, implementation, test, or brief artifact invalidates these fingerprints and requires this plan to be reviewed again.
