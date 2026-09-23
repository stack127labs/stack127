# Writing and SEO plan: Unraid Main Array Calculator

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready
Tool: Unraid Main Array Calculator
Route: `/unraid-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-23
Primary medium: Tool UI

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `Unraid array calculator` | Plan a real Main Array from explicit parity and data drives. | Dedicated calculator with a visible capacity result. | H1, tool UI, current result, and formula disclosure. |
| Secondary | `Unraid mixed drive capacity calculator` | Check a heterogeneous drive inventory without smallest-drive striping assumptions. | Per-drive calculator with role-aware accounting. | Explicit role rows, mixed units, role topology, and exact accounting. |
| Secondary | `Unraid parity calculator largest data disk` | Check whether parity covers the largest current data drive and a future upgrade. | Calculator plus a parity-size rule or growth warning. | Current validity state, smallest parity ceiling, and proposed-drive dependency. |
| Secondary | `Unraid usable capacity TB TiB calculator` | Reconcile advertised decimal capacity with binary display units. | Capacity result with TB/TiB conversion. | Unit selector and exact unit disclosure, while naming the array-level boundary. |

### SERP verification record

- Search backend: web connector, checked 2026-08-23. No SearXNG endpoint was configured, and its documented local request failed before returning results.
- Search engines: not individually available through the web connector. Bing or DuckDuckGo attribution is not claimed.
- Browser backend: the Codex in-app Browser was unavailable. Standalone Playwright CLI was used for the five direct competitor pages in `competitive-report.md` at `1280x900` and `390x844`; SERP result pages were checked through the web connector, so a SERP viewport was not exposed.
- Queries checked: `"Unraid array calculator"`, `Unraid mixed drive capacity calculator`, `Unraid parity calculator largest data disk`, and `Unraid usable capacity TB TiB calculator`.
- Visible result shapes: official Unraid array documentation, dedicated mixed-drive calculators, broad RAID calculators with extra risk or performance claims, and forum discussions about parity sizing. The result mix supports capacity planning and parity-ceiling intent; shopping and migration instructions remain adjacent intent.
- Representative result URLs: [Unraid Arrays](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/), [RaidSize Unraid calculator](https://raidsize.com/tools/unraid-calculator/en), [Unraid Storage Calculator](https://unraidcalculator.com/), and [Dalil Tech calculator](https://dalil-tech.com/raid-calculator).

### Intent not targeted

- Drive shopping, prices, and vendor recommendations: this page calculates roles and capacity rather than publishing expiring product data.
- Parity swaps, rebuild sequences, and migration instructions: link to official Unraid documentation after the result instead of modeling an operational procedure.
- Filesystem free space, cache-pool sizing, backup planning, performance, and failure probability: these are outside the Main Array capacity contract and should not be implied by the result.

## Page promise

Enter explicit parity and data roles for an Unraid Main Array to get array-level data capacity, raw and parity accounting, the protection boundary, and one future drive's parity-ceiling dependency. The result does not estimate filesystem-visible free space or perform a storage migration.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1, above-tool scope, and current result | Tool UI | `brief.md`; `implementation-report.md`, Product decision | Name the homelab planning job once; do not add a generic Unraid introduction. |
| Which inputs, modes, units, sources, or scope choices matter? | Parity selector, explicit role rows, proposed-drive row, result-unit selector | Tool UI | `implementation-report.md`, Inputs and normalization | Do not restate field labels in guide copy. |
| How should someone choose meaningful inputs and use it for the real task? | Explicit parity and data roles in the editor; no auto-assignment | Tool UI | `implementation-report.md`, Product decision and Scope | Explain role judgment once; do not narrate ordinary button use. |
| How should the result and its important terms or uncertainty be interpreted? | Headline, accounting bar, exact value table, role topology, and formula disclosure | Exact result visualization | `implementation-report.md`, Page composition; EC-012 through EC-020 | Treat the headline as an array-level data envelope; do not repeat exact values in prose. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Parity validity state, smallest parity ceiling, unequal dual parity, and blocked proposed-drive topology | Topology/diagram | `implementation-report.md`, Equations; `edge-cases-and-tests.md`, EC-014 through EC-020 | Keep edge behavior beside the affected result; do not add a broad FAQ. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Scope sentences and formula disclosure after the result | Sentences | `implementation-report.md`, Assumptions and exclusions; EC-017 and EC-037 | Name exclusions once: no filesystem deduction, backup guarantee, performance, or migration procedure. |
| How are user inputs handled? | Local-processing sentence and explicit share note | Sentences | `implementation-report.md`, Accessibility, privacy, security, and performance; EC-027 and EC-036 | State local calculation and share-link exposure without claiming anonymous or absolute privacy. |
| What should the reader verify or do next? | Official Unraid adding and replacing documentation links; related storage tools | Sentences | `competitive-report.md`, Evidence-backed opportunities; `implementation-report.md`, Primary sources | Link the operational next step; do not turn this page into a parity-swap guide. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Unraid Main Array Calculator: plan data capacity and parity growth | What can I plan here? | The page starts with a role-aware Main Array calculator and a visible future-drive boundary. | Tool UI | `brief.md`; `implementation-report.md`, Product decision | Put the tool before supporting explanation; no keyword-stuffed subtitle. | n/a |
| 2 | H2: Plan a Main Array from the parity and data roles you already know | Who is this for, and what answer will I get? | State the homelab planning job and the array-level boundary in two short sentences. | Sentences | `brief.md`; `implementation-report.md`, Product decision and Scope | Scope only; do not explain controls or repeat the result. | COPY-01 |
| 3 | H2: Assign parity and data roles before calculating | Which drives belong to each role? | Zero, single, and dual parity remain explicit; mixed capacities are entered per drive and never silently sorted. | Tool UI | `implementation-report.md`, Inputs and normalization; EC-002 and EC-003 | The UI owns field mechanics and role order. | n/a |
| 4 | H2: See data, parity, and raw capacity in one accounting | What is the current capacity? | The headline leads with array-level data capacity; the exact bar and table reconcile data plus assigned parity to raw installed capacity. | Exact result visualization | `implementation-report.md`, Page composition; EC-012 through EC-017 | The table is authoritative for narrow or zero segments; no prose recitation of values. | n/a |
| 5 | H2: Read the headline as array-level data capacity, not filesystem free space | What does the headline mean? | Define the result as a planning envelope from the explicit data roles, with filesystem and partition deductions left outside the model. | Sentences | `implementation-report.md`, Assumptions and exclusions; EC-017 | Add the boundary only; do not repeat the accounting bar or invent an overhead percentage. | COPY-02 |
| 6 | H2: Which drives hold each role? | Can I audit the calculation? | A role topology and exact role table show every parity and data drive in entered order. | Topology/diagram | `brief.md`; `implementation-report.md`, Page composition; EC-014 and EC-016 | Do not add a second comparison paragraph; preserve the visual as the authority. | n/a |
| 7 | H2: Zero, single, and dual parity show different protection boundaries | What does parity change? | A compact table states the protection boundary for zero, one, and two parity roles without recommending a mode. | Table | `competitive-report.md`, Technical truth to verify; `implementation-report.md`, Equations | Keep protection facts in rows; no probability, backup, or workload advice. | n/a |
| 8 | H2: A future drive above the parity ceiling needs an upgrade first | Can the proposed drive be added? | A sequence shows eligible growth or the named parity upgrades required before a blocked drive can be added; blocked growth has no projected number. | Topology/diagram | `implementation-report.md`, Equations; EC-019 and EC-020; [Unraid replacing disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/) | The diagram owns the sequence; do not describe rebuild duration or migration steps. | n/a |
| 9 | H2: Verify a planned disk change in the official Unraid docs | What should I do after a blocked growth result? | Link the reader to current adding and replacing documentation for operational decisions. | Sentences | `implementation-report.md`, Primary sources; `competitive-report.md`, Evidence-backed opportunities | Link and point; no parity-swap procedure or safety guarantee. | COPY-03 |
| 10 | H2: The model leaves filesystem and operational space unknown | Why is the result not free space? | Name excluded layers and the parity-not-backup boundary near the claim they limit. | Sentences | `implementation-report.md`, Assumptions and exclusions; EC-017 and EC-037 | No fixed filesystem percentage, performance model, license claim, or backup advice. | COPY-04 |
| 11 | H2: Your drive list stays in the browser | Are my inputs sent anywhere? | Explain synchronous local calculation, no value-bearing network or storage path, and the explicit share-link disclosure. | Sentences | `implementation-report.md`, Accessibility, privacy, security, and performance; EC-027 and EC-036 | Do not call sharing private; do not mention implementation internals beyond the local boundary. | COPY-05 |
| 12 | H3: Formula v1, exact units, and source boundary | Can I audit the number? | A native disclosure gives the role equation, exact-byte rule, TB/TiB definitions, version, official links, and exclusions. | Tool UI | `implementation-report.md`, Rounding, display, and versioning; EC-017 and EC-020 | Keep technical provenance in the disclosure; no separate worked-example article. | n/a |

No marker art, clean chart, or screenshot is needed. The live role topology, exact accounting visualization, protection table, and growth dependency explain the relevant relationships more precisely than decorative media.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Explicit role inputs | Parity mode is none, single, or dual; each current parity and data drive has its own capacity and unit; one proposed data drive is optional. | Tool UI plus native disclosure | `implementation-report.md`, Inputs and normalization | State that roles are not auto-assigned and the proposal is not part of current capacity. |
| Current accounting | `dataCapacity = sum(data drives)`; `assignedParityCapacity = sum(parity drives)`; `rawInstalledCapacity = dataCapacity + assignedParityCapacity`. | Exact result visualization and exact value table | `implementation-report.md`, Equations; FF-001 through FF-003 | Call the data result an array-level envelope, not filesystem-visible space. |
| Parity validity and ceiling | Every current parity drive must meet the largest current data drive; the future ceiling is the smallest current parity drive. | Validation state, role topology, and value table | [Unraid Arrays](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/); [Unraid adding disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/) | Show no current number for invalid roles; keep a valid current result beside a blocked future proposal. |
| Proposed-drive resolution | A proposed drive at or below the parity floor is eligible; one above it is blocked and names each undersized parity role. | Topology/diagram and result status | `implementation-report.md`, Equations; FF-007 through FF-009 | Do not project blocked capacity or imply that the tool executes a parity swap. |
| Units and display | Normalize decimal GB and TB and binary GiB and TiB to exact bytes, then format only for display in TB or TiB. | Unit control plus disclosure | [BIPM SI prefixes](https://www.bipm.org/en/measurement-units/si-prefixes); [NIST binary prefixes](https://physics.nist.gov/cuu/Units/binary.html) | Explain conversion without treating it as filesystem overhead; no static worked example is needed because the live result is the example. |

## Metadata proposal

- Registry label: `unraid calculator`
- Meta title: `Unraid Main Array Calculator: plan data capacity and parity growth`
- Meta description: `Plan an Unraid Main Array from explicit parity and data drives. See array-level data capacity, TB/TiB accounting, protection, and whether a future drive fits the parity ceiling.`
- Page type: `WebApplication`
- Publication recommendation: Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| In | `/storage-tools` | Discover adjacent storage calculators when the Unraid model is not the next question. | `storage calculators` | Collection card or storage-tool hub. |
| In | `/raid-calculator` | Redirect a reader who actually needs conventional striped RAID capacity rather than Unraid role accounting. | `RAID capacity calculator` | Related-tool link near the scope boundary. |
| Out | `/zfs-capacity-calculator` | Continue to a ZFS-specific capacity model when the storage system is ZFS rather than an Unraid Main Array. | `ZFS capacity calculator` | Related tools after the result. |
| Out | `/raidz-expansion-planner` | Continue to a RAIDZ expansion question without mixing its rules into this page. | `RAIDZ expansion planner` | Related tools after the result. |

External next-step links belong beside the proposed-drive result: [Unraid adding disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/) and [Unraid replacing disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/). They support operational verification and are not substitutes for internal navigation.

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Planned format | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Plan a Main Array from explicit roles | Identify the homelab builder's job and set the array-level promise above the tool. | `brief.md`; `implementation-report.md`, Product decision and Scope. Mention explicit parity and data roles and the capacity boundary. | Prose above the tool. | Do not call the result filesystem free space, describe ordinary controls, or add a generic Unraid history. |
| COPY-02 | Read the headline as array-level data capacity, not filesystem free space | Interpret the primary result without duplicating the exact accounting visual. | `implementation-report.md`, Assumptions and exclusions; `edge-cases-and-tests.md`, EC-017 and EC-024. Explain the envelope and unit boundary. | Prose after the first result. | Do not repeat values from the bar or table, invent a filesystem deduction, or use a worked example. |
| COPY-03 | Verify a planned disk change in the official Unraid docs | Give the next verification step when a proposed drive exceeds the current parity ceiling. | `implementation-report.md`, Primary sources; official adding and replacing disk documentation. State that this page does not perform a parity swap or rebuild. | Prose and two official links. | Do not provide migration steps, duration, risk, downtime, or a safe-to-proceed guarantee. |
| COPY-04 | The model leaves filesystem and operational space unknown | Keep the result honest about exclusions and the difference between redundancy and backup. | `implementation-report.md`, Assumptions and exclusions; official array overview; EC-017 and EC-037. Mention filesystem metadata, reservations, cache pools, free-space policies, performance, and backup limits only as exclusions. | Prose. | Do not add a fixed overhead percentage, license limit, performance estimate, failure probability, or backup recommendation. |
| COPY-05 | Your drive list stays in the browser | Explain local handling and the disclosure created by explicit sharing. | `implementation-report.md`, privacy and security plan; `edge-cases-and-tests.md`, EC-027 and EC-036. State local synchronous calculation, no request or browser storage path, and that a share URL contains capacities and roles. | Prose. | Do not claim absolute privacy or anonymity, imply that a copied share URL is secret, or mention unsupported telemetry behavior. |

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- [Unraid Arrays overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/), checked 2026-08-23. Supports Main Array and cache-pool separation, explicit parity roles, largest-data and smallest-parity rules, non-striped data, and write-mode context.
- [Unraid adding disks to array](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/), checked 2026-08-23. Supports optional parity, single and dual parity requirements, data-drive size limits, and adding-drive planning.
- [Unraid replacing disks in array](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/), checked 2026-08-23. Supports the official parity-upgrade and replacement boundary for a future larger data drive.
- [Unraid language help text](https://github.com/unraid/lang-en_US/blob/master/helptext.txt), checked 2026-08-23. Supports the role distinction, per-drive data model, parity redundancy, and Main Array terminology.
- [BIPM SI prefixes](https://www.bipm.org/en/measurement-units/si-prefixes), checked 2026-08-23. Supports decimal TB as an SI prefix boundary.
- [NIST binary prefixes](https://physics.nist.gov/cuu/Units/binary.html), checked 2026-08-23. Supports binary TiB and the separate display-unit conversion.
- [RaidSize Unraid calculator](https://raidsize.com/tools/unraid-calculator/en), checked 2026-08-23. SERP and competitor-shape evidence only, not the primary formula authority.
- [Unraid Storage Calculator](https://unraidcalculator.com/), checked 2026-08-23. SERP and competitor-shape evidence only, not the primary formula authority.
- [Dalil Tech storage calculator](https://dalil-tech.com/raid-calculator), checked 2026-08-23. SERP and competitor-shape evidence only, not the primary formula authority.

## Open questions and blockers

- None for the content stage. The in-app Browser was unavailable, so the same-day SERP verification used the web connector and recorded that limitation above. Publication is ready for the eight-tool batch; the committed migration remains unapplied until release.
