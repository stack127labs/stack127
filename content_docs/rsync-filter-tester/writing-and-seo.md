Status: ready
Feasibility: feasible. The accepted local engine and shared Markdown renderer support this closed guide without a new service, dataset, or runtime change. This accepts planning only; integration, rendered review, audit, and publication remain separate.
SERP checked: 2026-09-19
Tool: Rsync filter tester
Route: /rsync-filter-tester
Primary medium: Tool UI

## Search intent

Target “rsync filter tester” and supporting searches about include and exclude order, wildcard scope, and dry-run debugging. The page should make a representative tree answerable without a shell or remote host.

## Page promise

Paste rules and paths, then see the first matching rule and whether each path is included, excluded, or unvisited. The page names its supported filter subset.

## Heading and media outline

| Section | Heading | Search job | Claim | Medium | Order | Source | Copy ID |
|---|---|---|---|---|---|---|---|
| H1 | Rsync filter tester | rsync filter tester | Test ordered filters locally | tool ui | 1 | engine | none |
| H2 | Path trace | rsync include exclude order | First match explains every state | exact result visualization | 2 | engine | none |
| H2 | Test rules against paths from the transfer root | meaningful input choices | Paste ordered + and - filter lines and a representative list of unique relative paths. Use a trailing slash for a directory. A standalone ! clears earlier rules. Choose the visible unmatched default, include or exclude. The model accepts at most 1000 rules and 1000 paths. Absolute paths, duplicate paths, unsupported modifiers, and character classes are rejected. | Sentences | 3 | accepted implementation and interface contracts | COPY-01 |
| H2 | Rsync pattern scope | result interpretation | Required Table in supporting content: columns Pattern, Scope, Example. Cover basename *.conf at any depth, anchored /etc/*.conf at the transfer root with a single path segment, ** crossing directories, ? matching one non-slash character, and a trailing slash matching directories. Examples explain pattern scope only and must not reproduce a live trace. | Table | 4 | accepted resolution contract and primary sources | n/a |
| H2 | Verify the result in the real system | model limits | This is a supplied-tree model. It does not run rsync or inspect symlinks, filesystem permissions, shell expansion, daemon modules, delete behavior, or per-directory merge files. Verify with rsync --dry-run at the intended transfer root and version before copying. | Sentences | 5 | primary documentation and accepted exclusions | COPY-02 |

## Formula explanation

| Concept | Plain explanation | Stop point |
|---|---|---|
| First match | Rules are checked in order and the first matching pattern decides a path. | Stop after one conflicting-rule example |
| Traversal | An excluded directory prevents the model from visiting supplied descendants. | Stop before daemon and filesystem flags |

## Metadata proposal

Registry label: rsync filter tester

Meta title: Rsync filter tester | stack127

Meta description: Test rsync include and exclude rules against a sample tree and see the winning line.

Page type: WebPage

Publication recommendation: keep unpublished pending separate central registry approval.

## Internal links

| Reader need | Link | Placement |
|---|---|---|
| Browse technical tools | /storage-tools | supporting link |
| Plan backup copies | /backup-321-calculator | related tool link |

## Manual prose handoff

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Test rules against paths from the transfer root | Choose meaningful inputs and interpret a representative run in usage_markdown. | Paste ordered + and - filter lines and a representative list of unique relative paths. Use a trailing slash for a directory. A standalone ! clears earlier rules. Choose the visible unmatched default, include or exclude. The model accepts at most 1000 rules and 1000 paths. Absolute paths, duplicate paths, unsupported modifiers, and character classes are rejected. The first matching rule decides a visited path. A basename pattern can match at any depth; an anchored slash refers to the model's transfer root. Star excludes slashes, double star crosses them, and question mark matches one non-slash character. An excluded ancestor, including one excluded by the unmatched default, makes its descendants unvisited even when a later child include would match. Use the current implementation and interface contracts, engine, and source ledger. | Explain the consequential input choices, then the governing decision rule. Use an ordered list only for the actual preparation sequence. Stop before repeating the live result rows. | No invented input mode, full-system validation, or result-value narration. |
| COPY-02 | Verify the result in the real system | Explain the boundary and next step in content_markdown. | This is a supplied-tree model. It does not run rsync or inspect symlinks, filesystem permissions, shell expansion, daemon modules, delete behavior, or per-directory merge files. Verify with rsync --dry-run at the intended transfer root and version before copying. Use the accepted exclusions and primary sources below. | Connect the model's boundary to the specific external verification needed. Stop before a system administration runbook. | No guarantee, compatibility certification, automatic fix, or claim of actions the tool did not perform. |

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is this and who needs it? | Existing page promise, H1, short introduction | Tool UI | brief.md and product decision | No second introduction. |
| Which inputs, scope, and units matter? | Visible inputs and COPY-01 | Sentences | Accepted input contract and engine | Explain decisions, not each ordinary button. |
| How are representative inputs chosen? | COPY-01 in usage_markdown | Sentences | Closed facts below | Use actual source syntax and scope. |
| What does the result mean? | Exact result table and planned interpretation table | Table | Resolution contract | Never transcribe the current rows into prose. |
| Which ordering or boundary surprises matter? | COPY-01 and interpretation table | Sentences | Accepted boundary fixtures | Explain cause once. |
| What cannot be proved? | COPY-02 | Sentences | Product exclusions | Place caveats with the claim they limit. |
| How are inputs handled? | One usage note | Sentences | Client state, pure engine, accepted privacy checks | Scope the claim to calculation inputs, not all site traffic. |
| What happens next? | COPY-02 and internal links | Sentences | Primary operational docs | Link out before adding a runbook. |

## Usage Markdown handoff

This is a closed planning contract, not final public copy. Astra writes COPY-01 into usage_markdown and COPY-02 plus the required interpretation table into content_markdown after main acceptance. Luna integrates those approved fields.

### Technical facts and representative use

Paste ordered + and - filter lines and a representative list of unique relative paths. Use a trailing slash for a directory. A standalone ! clears earlier rules. Choose the visible unmatched default, include or exclude. The model accepts at most 1000 rules and 1000 paths. Absolute paths, duplicate paths, unsupported modifiers, and character classes are rejected.

The first matching rule decides a visited path. A basename pattern can match at any depth; an anchored slash refers to the model's transfer root. Star excludes slashes, double star crosses them, and question mark matches one non-slash character. An excluded ancestor, including one excluded by the unmatched default, makes its descendants unvisited even when a later child include would match.

### State explanations

Malformed rules or paths keep both editors and show field recovery without result rows. Edits clear the old trace. Retest after reordering a rule. Included, excluded, and unvisited are distinct completed states. Copy report confirms success only after a clipboard write; failure leaves data selectable. There is no loading or server failure state.

The guide follows the whole workbench and its results. Do not insert instructions between controls and results. No basic/advanced switch exists. Evidence disclosures, where present, change neither normalized inputs nor the answer.

### Required lists and media

- One ordered list may express preparing the source input, choosing the result-driving scope, and checking again after a correction. Keep connected reasoning in sentences.
- Required Table in supporting content: columns Pattern, Scope, Example. Cover basename *.conf at any depth, anchored /etc/*.conf at the transfer root with a single path segment, ** crossing directories, ? matching one non-slash character, and a trailing slash matching directories. Examples explain pattern scope only and must not reproduce a live trace.
- Preserve the existing exact interactive output. Do not add marker art, screenshots, a chart, or a second live-result table.
- Integration must trace the ordered list if used and the required Markdown table to rendered DOM in both themes at desktop and narrow widths. Verify headers, wrapping, and no page overflow.

### Privacy boundary

The route keeps entered values in React memory and calls its local pure engine. The tool does not send these inputs to a server, host, broker, or repository and does not save them in a URL or browser storage. Copy is an explicit clipboard action. This claim concerns the tool inputs only; it does not assert that the entire website makes no requests or uses no analytics. Evidence is the accepted route client and engine plus the page-owned privacy tests. Do not broaden it to a sitewide promise.

### Sources, links, and writing constraints

Use the primary technical URLs in the source ledger for behavior, and the accepted local implementation for the tool's narrower profile. Community and competitor sources explain user needs only. Reuse the internal-link plan with a publication check before integration; unpublished sibling tools are conditional and must not become public dead links.

Follow `stack127_docs/writing-style.md`. The source ledger and implemented profile define which behavior the page can claim.

### Reconciliation with older artifacts

The brief asks for an ordered rule display beside results while the accepted interface deliberately uses one path trace and no separate disclosure. The guide explains source order without promising a second rendered rule inventory.

### Search verification record

Checked 2026-09-19. Queries: `rsync filter tester`, `rsync include exclude tester`, `rsync unvisited parent filter`. Search backend: web connector for discovery, engines not individually available. Browser backend: standalone Playwright CLI at 1440 x 900 after the in-app Browser returned no available instance. Bing result pages loaded but returned broad or unrelated results, so they cannot establish exact-query rankings or saturation. The web connector returned documentation and troubleshooting discussions consistent with the task in the accepted research. Preserve that limitation; no new competitor superiority claim follows from this check.

### Tool-build exclusion

The build stage does not draft or integrate this guide. Astra owns wording; the separate Luna integration stage owns applying and verifying approved content.

## Source ledger

- https://rsync.samba.org/ftp/rsync/rsync.1
- https://lists.samba.org/archive/rsync/2006-June/015744.html
- https://www.variedtools.com/generate-rsync-command

## Open questions and blockers

None for this scoped content plan. Current-search visibility is limited as recorded above. Integration must verify rendered content and link publication; this document does not certify either or authorize publication.
