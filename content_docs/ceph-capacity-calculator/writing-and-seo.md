# Writing and SEO plan: Ceph Capacity and Failure-Domain Planner

Status: ready
Tool: Ceph Capacity and Failure-Domain Planner
Route: `/ceph-capacity-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-23
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 3 sections, 450 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `Ceph capacity calculator` | Model raw and usable capacity for a planned Ceph inventory while checking domain sufficiency. | Interactive calculator with replicated and EC profiles, exact capacity accounting, domain table, and largest-domain loss. | The tool answers above the guide; short supporting sections explain scope and next verification. |
| Close | `Ceph erasure coding capacity calculator` | Compare `k` and `m` overhead with the required placement domains. | EC inputs, ratio, required domains, and loss state. | EC mode and result vocabulary answer this directly. |
| Close | `Ceph failure domain calculator` | Test whether hosts, racks, or datacenters are distinct enough for a profile. | Domain batches, grouped contributions, sufficiency status, and loss scenario. | Failure-domain selector and domain table answer this directly. |
| Close | `Ceph usable capacity planner mixed OSD sizes` | Sum uneven OSD batches without hiding which domain carries the most raw capacity. | Mixed input rows and grouped exact table. | Repeated labels aggregate in the live result; one short table explains the model. |

The current search result shape is mixed: official Ceph documentation, Clyso's EC calculator, small calculators, GitHub scripts, and PG planning tools. The direct tools emphasize raw versus usable capacity and EC ratios; few put grouped domain loss and exact mixed batches beside the answer. Search verification used the web connector on 2026-08-23. Individual search engine names were not exposed by that backend. The rendered competitor surfaces in the research pass were inspected at 1280 x 900 in standalone Playwright; no in-app Browser runtime was available.

### Intent not targeted

- Ceph PG sizing: link to the PG calculator or Ceph PG documentation because PG count and autoscaler behavior are a separate decision.
- Ceph performance, recovery time, IOPS, or TCO: these need workload and hardware evidence that this capacity model does not have.
- Live cluster capacity or `ceph df` parity: the next step is a real cluster command, not a static answer from this page.

## Page promise

Model Ceph raw, usable, reserve, and failure-domain loss capacity from a local inventory, then verify the plan against real CRUSH and pool state.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1, tool controls, COPY-01 | Tool UI plus Sentences | Brief and implementation report | COPY-01 names the planning job once; do not restate the h1. |
| Which inputs, modes, units, sources, or scope choices matter? | Protection controls, OSD batches, reserve, COPY-01 | Tool UI plus Table | Implementation contract and Ceph EC profile docs | Labels and controls own input definitions; prose only explains meaningful choices. |
| How should someone choose meaningful inputs and use it for the real task? | OSD batch rows and COPY-01 | Tool UI plus Sentences | Product flow and CRUSH docs | Explain inventory grouping, not ordinary button clicks. |
| How should the result and its important terms or uncertainty be interpreted? | Metrics, bar, domain facts, COPY-02 | Exact result visualization plus Sentences | Formula fixtures and implementation report | Never repeat live numbers in prose. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Domain table and protection table | Table | CRUSH and EC profile docs | Use rows for repeated protection facts; use COPY-02 only for boundaries. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | COPY-02 | Sentences | Implementation non-goals and Ceph docs | One limitation section, no caveat panel or FAQ. |
| How are user inputs handled? | Tool privacy note and COPY-03 | Tool UI plus Sentences | Engine boundary and share contract | State local calculation and explicit URL sharing once. |
| What should the reader verify or do next? | COPY-03 and internal links | Sentences | Ceph CRUSH, pool, and hardware docs | End with commands or documentation paths, not a generic CTA. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Ceph capacity and failure-domain planner | What can I model here? | Enter OSD batches, choose protection, and see exact modeled capacity. | Tool UI | Implementation report and brief | The live tool is the answer; no introductory article block above it. | n/a |
| 2 | H2: Read the capacity answer | What do raw, modeled, overhead, reserve, and target mean? | The bar separates raw bytes from modeled protected capacity; the table exposes grouped domain contribution and largest loss. | Exact result visualization | Formula fixtures and implementation acceptance R1, R5, R6 | Do not repeat values or describe every card in prose. | n/a |
| 3 | H2: Replication and erasure coding use different ratios | Which profile choice changes the answer? | Replication uses one data copy over the replica size; EC uses `k/(k+m)` and requires `k+m` distinct placement domains. | Table | `https://docs.ceph.com/en/latest/rados/operations/erasure-code/` and `https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/` | Keep exact repeated facts in the table; no worked paragraph. | n/a |
| 4 | H2: Group capacity by the failure domain | Why do repeated batches and mixed OSD sizes matter? | The same named domain can have multiple batches; the grouped row makes the largest-domain scenario traceable. | Table | CRUSH map documentation and FF-003 | Explain aggregation only; do not restate the live table. | n/a |
| 5 | H2: What this model leaves out | Is this a live Ceph capacity or durability guarantee? | The model does not inspect CRUSH rules, pools, PGs, min_size, object overhead, recovery, or exact `ceph df` output. | Sentences | Implementation non-goals and `https://docs.ceph.com/en/latest/rados/configuration/pool-pg-config-ref/` | One compact boundary section, maximum 170 words. | COPY-01 |
| 6 | H2: Verify the plan against a real cluster | What should I check next? | Compare inventory and domain assumptions with OSD tree, pool rules, EC profile, and capacity commands. | Sentences | `https://docs.ceph.com/en/latest/rados/operations/crush-map/` and `https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/` | Give the next verification path once; do not promise a command generator. | COPY-02 |
| 7 | H2: Sharing keeps the calculation explicit | Does the page send my inventory away? | Calculation is local; Share puts normalized inputs in a versioned URL, so the user controls disclosure. | Sentences | Implementation privacy contract | Maximum 90 words; do not claim zero telemetry beyond the implemented boundary. | COPY-03 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Protection ratio | Replicated usable is raw divided by replica size; EC usable is raw multiplied by `k/(k+m)`. | The result ratio and protection comparison table. | FF-001, FF-002; Ceph EC documentation. | Put the live-model boundary in COPY-01. |
| Failure-domain requirement | Replication needs as many distinct modeled domains as copies; EC needs `k+m` domains for the profile model. | Required-domains fact and domain table. | CRUSH map and EC profile docs. | State that this is placement planning, not a durability proof. |
| Reserve and target | Reserve is a user policy applied after modeled usable capacity; target is modeled capacity minus reserve. | Exact result metrics. | FF-009 and implementation report. | COPY-01 says it is not a Ceph nearfull threshold. |
| Largest-domain loss | The scenario removes the greatest grouped raw domain and recomputes modeled bytes with the same ratio. | Loss facts in the result. | FF-006, FF-007. | COPY-01 says remaining placement may be degraded and is not a failure guarantee. |

## Metadata proposal

- Registry label: `ceph capacity planner`
- Meta title: `Ceph capacity and failure-domain planner`
- Meta description: `Model Ceph raw, usable, reserve, and failure-domain loss capacity without live cluster inspection.`
- Page type: `WebApplication`
- Publication recommendation: Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/storage-tools` | Return to the storage planning collection after this focused calculation. | `storage tools` | End of COPY-02. |
| Out | `/zfs-capacity-calculator` | Compare a local ZFS pool model when the user is choosing a filesystem layer rather than Ceph. | `ZFS capacity calculator` | End of COPY-02, only when the surrounding sentence makes the distinction useful. |
| Out | `https://docs.ceph.com/en/latest/rados/operations/crush-map/` | Verify the real CRUSH hierarchy and failure-domain buckets. | `Ceph CRUSH map documentation` | COPY-02. |
| Out | `https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/` | Verify the live EC profile and its placement setting. | `Ceph EC profile documentation` | Protection table or COPY-02. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | What this model leaves out | Establish the model boundary and prevent false confidence. | Mention no live CRUSH, PG, pool, `min_size`, object-overhead, recovery, performance, or exact `ceph df` inspection. Cite the implementation contract and the official Ceph pool reference. | 170 words; two short paragraphs. | Do not repeat the result metrics, protection table, or claim durability. |
| COPY-02 | Verify the plan against a real cluster | Give a concrete next verification path. | Point readers to the OSD tree, CRUSH hierarchy, pool rule, EC profile, and capacity commands. Link official CRUSH and EC profile docs. | 190 words; one paragraph plus a short command list if reviewed. | Do not invent command output, recommend a profile, or imply the calculator reads the cluster. |
| COPY-03 | Sharing keeps the calculation explicit | Explain local computation and deliberate URL sharing. | State that calculation has no API request, and Share places normalized entered inventory in a versioned URL. Explain that shared URLs disclose those inputs. | 90 words; one compact paragraph. | Do not claim anonymity, no telemetry, or encrypted secrecy beyond the route contract. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, chart, wireframe, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- Ceph Erasure Code: https://docs.ceph.com/en/latest/rados/operations/erasure-code/, checked 2026-08-23. Supports `k/(k+m)`, chunk loss, and EC deployment context.
- Ceph Erasure Code Profile: https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/, checked 2026-08-23. Supports profile parameters and failure-domain configuration.
- Ceph CRUSH map: https://docs.ceph.com/en/latest/rados/operations/crush-map/, checked 2026-08-23. Supports hierarchical buckets and placement domains.
- Ceph pool configuration: https://docs.ceph.com/en/latest/rados/configuration/pool-pg-config-ref/, checked 2026-08-23. Supports pool-level settings that this model does not inspect.
- Ceph hardware recommendations: https://docs.ceph.com/en/latest/start/hardware-recommendations/, checked 2026-08-23. Supports the boundary between capacity planning and hardware or performance planning.
- Clyso EC calculator: https://docs.clyso.com/docs/kb/tools/erasure-coding-calculator/, checked 2026-08-23. Supports current competitor result shapes and user inputs.
- Ceph PG calculator: https://cephpg.com/, checked 2026-08-23. Supports adjacent PG and EC planning intent that belongs outside this tool.

## Open questions and blockers

- None. Registry metadata, shared navigation, and publication are integrated for the eight-tool batch. The committed migration remains unapplied until release.
- The content specialist worker stalled before writing; the main agent authored this plan locally from the ready artifacts and current search check.
