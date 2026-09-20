# Writing and SEO plan: SnapRAID and mergerfs Config Planner

Status: ready
Tool: SnapRAID and mergerfs Config Planner
Route: `/snapraid-mergerfs-planner`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-23
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 3 sections, 500 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `SnapRAID mergerfs calculator` | Turn one mixed-disk inventory into matching SnapRAID and mergerfs configuration text. | Interactive inventory, structural checks, exact code blocks. | The tool leads with data, parity, content, pool, policy, and blocksize inputs. |
| Close | `SnapRAID mergerfs configuration generator` | Avoid manually keeping the two file formats in sync. | Generator with reviewable output. | One ordered data list drives both outputs. |
| Close | `SnapRAID parity data disks mergerfs mount point planner` | Check that parity and pool paths stay outside data branches. | Path-aware planner with an audit. | Result checks and data-only fstab branches show the boundary. |
| Close | `snapraid.conf generator web` | Draft a local configuration before editing `/etc`. | Copyable configuration text with caveats. | The page returns selectable config and fstab text without host access. |

### SERP and research verification

Search discovery used the Web search connector because no SearXNG endpoint was configured. The exact query and close variants were checked on 2026-08-23. The direct interactive competitor and five adjacent storage calculators were inspected with standalone Playwright CLI Chromium 1.60.0 at 390 x 844 and 1280 x 900. The observed result shape remains tool-led: a form, an answer, and code or capacity output. The direct competitor's malformed capacity behavior is the reason to make invalid inventory a visible blocking state.

### Intent not targeted

- `SnapRAID setup guide`: a complete host installation guide belongs in a guide or official documentation, not beside this compact generator.
- `SnapRAID recovery`, `backup strategy`, or `parity sync estimate`: the planner does not inspect state, model recovery, or promise backup safety.
- `mergerfs option reference`: the page exposes two locked presets and links to official option documentation instead of becoming a full reference.

## Page promise

Enter an explicit mixed-disk layout and receive structurally checked `snapraid.conf` and mergerfs fstab text, while knowing which host facts still require verification.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1, short introduction, and inventory labels | Tool UI | `brief.md`; implementation report primary user | Do not repeat the tool promise below the result. |
| Which inputs, modes, units, or scope choices matter? | Data, parity, content, pool, policy, blocksize controls | Tool UI | Implementation report input contract | The guide names only choices that change validation or output. |
| How should someone choose meaningful inputs for the real task? | After-tool verification section | Sentences | COPY-02; official manuals | Do not narrate ordinary button clicks. |
| How should the result and terms be interpreted? | Review status, audit table, and two labeled code blocks | Table | Implementation report result contract | Prose points to the audit; it does not restate config lines. |
| Which syntax, ordering, or edge cases surprise users? | Responsibility table and path-boundary explanation | Table | COPY-01; SnapRAID manpage; mergerfs QuickStart | Keep parity, content, and data roles in the table. |
| What does the tool not inspect or prove? | Result boundary and verification section | Sentences | COPY-02; implementation non-goals | Keep caveats beside the result, not in a warning wall. |
| How are user inputs handled? | Privacy section after the result | Sentences | COPY-03; engine has no storage/network path | Say only that this tool action stays in the browser. |
| What should the reader do next? | Final verification section and official links | Sentences | COPY-02; official sources | End with host checks, not another related-tools list. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: SnapRAID and mergerfs config planner | What can I get here? | One explicit inventory produces two reviewable files. | Tool UI | Implementation report; brief | The live form is the primary answer. | n/a |
| 2 | H2: Keep parity outside the pool | Why are the branches and parity inputs separate? | SnapRAID parity and mergerfs pooling have different roles; the branch list contains data mounts only. | Table | `implementation-report.md`; mergerfs QuickStart | Use the table for repeated roles. | n/a |
| 3 | H2: Read the audit before copying | What does a ready result mean? | Pass checks describe structural relationships; the note marks host facts the browser cannot know. | Exact result visualization | `edge-cases-and-tests.md` EC-001, EC-002, EC-006 | Do not restate generated lines. | n/a |
| 4 | H2: Copy the two labeled files | What does the result return? | One block is SnapRAID config; one is the data-only mergerfs fstab line. | Exact result visualization | Implementation report; FF-001 | Let the code blocks carry exact syntax. | n/a |
| 5 | H2: Why parity stays outside the pool | Why are the branches and parity inputs separate? | SnapRAID parity and mergerfs pooling have different roles; data-only branches keep the boundary visible. | Sentences | COPY-01; SnapRAID manual; mergerfs QuickStart | One short paragraph beside the role table. | COPY-01 |
| 6 | H2: Choose paths and verify boundaries | Which inputs make the plan meaningful, and what comes next? | Use actual mount roots and content locations, then verify physical separation, permissions, versions, and mounts before saving. | Sentences | COPY-02; official manuals | One compact section; no click instructions or repeated code. | COPY-02 |
| 7 | H2: What happens to entered paths? | Are values sent or saved? | The planner does not serialize inputs into the URL or use storage/network APIs for the calculation. | Sentences | COPY-03; page test | Keep this scoped to the tool action. | COPY-03 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Parity capacity | Each parity mount must be at least the largest entered data capacity. | Audit row and field error | Implementation report; Debian `snapraid(1)` manpage | Beside parity result. |
| Content copies | The minimum is parity levels plus one; distinct known roots are checked when inferable. | Result summary and invalid state | Implementation report; SnapRAID manual | Beside content inputs. |
| Branch relationship | Data mounts are joined in order for fstab; parity and content paths never become branches. | Exact fstab code block and role table | Implementation report; mergerfs QuickStart | Beside the output labels. |
| Exact arithmetic | TB and TiB capacities are converted to whole bytes with `bigint`; fractional-byte inputs fail. | Result exact-byte line | Edge-case contract FF-003 | Keep rounded display secondary. |
| Presets | The two policy strings are locked examples, not a universal workload recommendation. | Select control plus review boundary | Implementation report; mergerfs QuickStart | Beside the policy control. |

## Metadata proposal

- Registry label: `snapraid and mergerfs planner`
- Meta title: `SnapRAID and mergerfs Config Planner`
- Meta description: `Build structurally checked snapraid.conf and mergerfs fstab text from one disk inventory. Review path boundaries before editing your host.`
- Page type: `WebApplication`
- Publication recommendation: `Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| In | `/storage-tools` | Find adjacent storage planning tools. | `storage tools` | Parent collection integration, outside this route. |
| In | `/zfs-capacity-calculator` | Continue to a different storage-capacity question. | `ZFS capacity calculator` | Collection-level discovery only, not in the tool result. |
| Out | `/storage-tools` | Return to storage-tool choices after host verification. | `storage tools` | Closing sentence only if the parent keeps the link. |
| Out | `/privacy` | Read the site privacy boundary. | `privacy notes` | Closing privacy sentence. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Keep parity outside the pool | Explain the two-layer relationship and why branch output is data-only. | SnapRAID manual, Debian `snapraid(1)`, mergerfs QuickStart, and the approved role table. | 90 words maximum; one short paragraph beside the table. | Do not repeat every input label or paste config text. |
| COPY-02 | Choose paths the host can verify | Explain meaningful path selection, result limits, and next host checks. | Implementation non-goals, EC-003/004/006/022, SnapRAID manual, mergerfs QuickStart. | 220 words maximum; two short paragraphs and a three-item list. | No backup guarantee, live mount claim, recovery promise, or generic setup tutorial. |
| COPY-03 | What happens to entered paths? | State local-browser handling for this tool action. | Engine has no fetch, storage, URL-state, or host-access path; `/privacy` for site context. | 60 words maximum; one short paragraph. | Do not promise site-wide anonymity or omit the broader privacy link. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, code block, heading, or prior section.
- Leave unresolved host facts as explicit verification notes.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. This plan is the content handoff after the technical build.

## Source ledger

- Debian `snapraid(1)` configuration: https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html, checked 2026-08-23. Supports directives, parity sizing, content copies, and blocksize.
- SnapRAID manual: https://www.snapraid.it/manual, checked 2026-08-23. Supports the parity/content model and asynchronous boundary.
- mergerfs QuickStart: https://trapexit.github.io/mergerfs/2.41.1/quickstart/, checked 2026-08-23. Supports branch expressions and fstab option shape.
- MergerFS official site: https://mergerfs.com/, checked 2026-08-23. Supports the distinction between pooled whole-file access and parity.
- Local competitive report: `competitive-report.md`, checked 2026-08-23. Records direct and adjacent result shapes and malformed-input observations.

## Open questions and blockers

- Content decisions are ready. Independent Browser QA is blocked in this worktree because neither `.env.local` nor `.env.database` is present, and the in-app Browser runtime has no available browser instance.
- The storage sidebar, collection count, and publication registry are integrated in the eight-tool batch. The committed migration remains unapplied until release, so the route is not live yet.
