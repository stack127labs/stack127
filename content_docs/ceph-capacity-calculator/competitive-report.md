# Competitive report: Ceph Capacity and Failure-Domain Planner

Status: ready
Tool: Ceph Capacity and Failure-Domain Planner
Route: `/ceph-capacity-calculator`
Researched: 2026-08-23
Direct competitors reviewed: 7
Saturation exception: yes

## Research scope

### Current stack127 state

The flat route `/ceph-capacity-calculator` does not exist in `app/(site)/(tools)/`, `content_docs/`, or `tests/pages/`. No route-owned engine, script, or ownership manifest exists. The storage family already contains RAID, ZFS capacity, ZFS padding, and RAIDZ expansion tools. Those pages use a framed client tool, a pure calculation boundary, and a concise server-rendered guide. The shared storage hub, sidebar, count, publication registry, migrations, and shared storage engine are outside this tool's allowed scope and must remain untouched.

The route namespace is flat and has no collision. The product should be a formula contract over user-supplied inventory and pool protection choices. It must not claim to predict `ceph df`, placement-group state, recovery time, performance, or exact free space in an installed cluster.

### Method and coverage

- Search backend: web connector
- Search engines: not individually available through the connector
- Visual backend: standalone Playwright CLI with headless Chromium 1.60.0 at 1280 x 900. The in-app Browser runtime had no connected instances, so it was not available.
- Accessed: 2026-08-23, Asia/Kolkata
- Search queries:
  - `Ceph capacity calculator`
  - `Ceph cluster usable capacity replication erasure coding planner`
  - `Ceph CRUSH failure domain host k+m size min_size capacity`
  - `Ceph mixed OSD sizes failure domain capacity calculator`
  - `Ceph capacity planning calculator online`
  - `Ceph erasure coding calculator mixed hosts`
  - `Ceph usable capacity calculator 3 node replication`
  - `Ceph capacity planning tool failure domain`

The browser probe opened and inspected Clyso, Simplified Tools, StorPool, the `ds-04/ceph_ec_calc` repository, The Home Server Blog, Ceph PG Calculator, Bennet Gallein, and euroNAS. Seven are counted as direct or close category competitors; the generic erasure-coding and cluster-planning pages are retained as adjacent evidence. Representative default, mixed-topology, invalid-boundary, or failure-reserve behavior was probed when the page exposed it. No accounts, sensitive data, purchases, or external side effects were used. Chromium required the approved execution boundary because the default sandbox could not launch its browser process.

### Search saturation evidence

- Queries tried: the eight queries listed above, using exact, job, technical, and pain or comparison shapes.
- Repeated domains: `docs.ceph.com`, Clyso, Simplified Tools, and community pages repeated. Most other results were documentation, product sizing pages, PG calculators, or generic EC calculators rather than another complete Ceph capacity planner.
- Exclusions: Ceph documentation and vendor sizing articles were used as technical sources, not counted as competitors. Proxmox and OpenMetal pages were examples or explanations without an inspectable standalone planner. Generic RAID and object-storage calculators did not model Ceph failure domains.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Raw to usable capacity | `Ceph capacity calculator` | Translate OSD inventory and pool protection into a credible capacity ceiling. | Vendor tools, simple calculators, code repositories |
| Cluster design | `Ceph cluster usable capacity replication erasure coding planner` | Compare `size=3` with an EC profile before buying or assigning disks. | Explanatory articles and EC-only calculators |
| Failure-domain placement | `Ceph CRUSH failure domain host k+m size min_size capacity` | Check whether hosts, racks, or zones can hold every copy or shard separately. | Official docs, PG tools, forum discussions |
| Heterogeneous hardware | `Ceph mixed OSD sizes failure domain capacity calculator` | Understand how uneven domain capacity changes the practical plan. | Community answers and broad heuristic tools |
| Failure reserve | `Ceph usable capacity after node failure` | Keep enough room to recover after the largest domain is unavailable. | Node-loss calculators and articles |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| People confuse `k+m` with a raw OSD count and miss the host or rack requirement. | [Ceph erasure coding discussion](https://www.reddit.com/r/ceph/comments/1bel1m7/confusion_with_erasure_encoding/), [Ceph erasure coding documentation](https://docs.ceph.com/en/latest/rados/operations/erasure-code/) | Repeated across community questions and official caveats. | Put required placement domains beside the profile, and distinguish OSD count from failure-domain count. |
| Mixed OSD sizes are possible but capacity balance and domain placement make the result less predictable. | [Different OSD sizes in Ceph](https://www.reddit.com/r/ceph/comments/1afe5gi/different_osd_sizes_in_ceph/), [Ceph mixed-size discussion](https://www.reddit.com/r/ceph/comments/1m693g0/erasure_coding_with_heterogenous_hdd_sizes/) | Repeated, with conflicting advice about balance and CRUSH weighting. | Accept per-domain batches with exact sizes, show imbalance, and label the result as a model rather than a `ceph df` prediction. |
| Users want to know whether a host loss leaves room to recover, not just the all-OSD total. | [Bennet Gallein Ceph calculator](https://bennetgallein.de/tools/ceph-calculator), [Ceph node-loss discussion](https://www.reddit.com/r/ceph/comments/1j1ztht/calculating_max_number_of_drive_failures/) | Common in Proxmox and homelab planning threads. | Show the largest-domain loss scenario and the capacity remaining after it, without calling it a durability guarantee. |
| Capacity answers mix pool protection, nearfull policy, and degraded PG availability into one number. | [Simplified Tools Ceph calculator](https://www.simplified.tools/calculate_ceph_capacity), [Ceph monitor configuration](https://docs.ceph.com/en/latest/rados/configuration/mon-config-ref/) | Visible in competing UI and recurring community explanations. | Keep raw capacity, modeled protection efficiency, and a user-selected planning reserve as separate values. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| Replicated pool data efficiency is approximately `1 / size` before other overheads. | [Ceph pool configuration](https://docs.ceph.com/en/latest/rados/configuration/pool-pg-config-ref/), [Ceph erasure-code overview](https://docs.ceph.com/en/latest/rados/operations/erasure-code/) | Documented | Use exact integer arithmetic for the model, then round only for display. Call it modeled usable capacity, not installed free space. |
| EC data efficiency is `k / (k + m)` and the overhead factor is `(k + m) / k`. | [Ceph erasure coding](https://docs.ceph.com/en/latest/rados/operations/erasure-code/) | Documented | Ceph also warns about small-object space amplification and recovery or backfill cost. |
| A replicated object or EC stripe uses distinct buckets at the configured CRUSH failure-domain level. | [Ceph CRUSH maps](https://docs.ceph.com/en/latest/rados/operations/crush-map/) | Documented | The planner can verify the minimum number of entered domains, but cannot reproduce a live CRUSH map. |
| A common EC plan needs at least `k + m` failure domains, with operational value in having `k + m + 1`. | [Ceph erasure coding](https://docs.ceph.com/en/latest/rados/operations/erasure-code/) | Documented | Display the minimum and the extra-domain headroom separately. Do not convert it into a blanket safe or unsafe label. |
| `m` is the number of EC chunks that can be lost for an object before data loss. | [Ceph erasure-code profiles](https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/) | Documented | This is object-level shard tolerance, not a promise that any arbitrary cluster outage remains available. |
| Raw capacity is the sum of OSD capacities, but mixed weights and CRUSH placement can produce imbalance. | [Ceph CRUSH maps](https://docs.ceph.com/en/latest/rados/operations/crush-map/), [Ceph OSD operations](https://docs.ceph.com/en/latest/rados/operations/add-or-rm-osds/) | Documented and inferred | Sum entered bytes exactly. Show largest-domain loss and domain imbalance as planning signals, not exact allocation. |
| A nearfull or full threshold should be multiplied into the headline usable answer. | [Ceph monitor configuration](https://docs.ceph.com/en/latest/rados/configuration/mon-config-ref/) | Disputed | Some calculators bake in 80%, 85%, or 95%; this conflates a policy threshold with protection efficiency. Make reserve explicit and separate from modeled usable capacity. |
| Exact free space after a failure can be predicted from inventory alone. | [Ceph CRUSH maps](https://docs.ceph.com/en/latest/rados/operations/crush-map/) | Unknown / rejected | PG count, object sizes, device classes, CRUSH weights, metadata, utilization, and recovery state are missing. Do not promise it. |

## Competitor reviews

### Competitor 1: Clyso Erasure Coding Calculator

- URL: https://docs.clyso.com/docs/kb/tools/erasure-coding-calculator/
- Accessed: 2026-08-23, viewport 1280 x 900, fully accessible in standalone Playwright.
- Audience and promise: [Observed] Ceph operators planning an EC pool; the page promises capacity, efficiency, IOPS, failure domain, and a profile command.
- Inputs and defaults: [Observed] Profile name; datacenters; racks per datacenter; servers per rack; OSD drives per server; drive capacity and unit; drive IOPS; data chunks `k`; parity chunks `m`; stripe unit; average object or file size. Defaults included one datacenter, one rack, eight servers, twelve drives, 2 TiB, 100 IOPS, `k=4`, `m=2`, 4096-byte stripe, and 4096 KB object size.
- Action and state behavior: [Observed] Results update in the documentation page without a visible submit action. A copy control is present for the generated command. No share or reset control was visible in the inspected state.
- Results and visuals: [Observed] Usable capacity, raw capacity, storage efficiency, read/write IOPS, IOPS efficiency, stripe width, failure domain, and `ceph osd erasure-code-profile set` output. The output is a vertical result list in a docs shell rather than a topology view.
- Formula or data source: [Documented] The page says it calculates EC capacity and a recommended CRUSH failure domain. It does not expose its full formula on the page; the official Ceph EC documentation supports the `k/(k+m)` and failure-domain basis.
- Errors and edge behavior: [Observed] Empty and invalid behavior was not clearly surfaced during safe inspection; no complete invalid-state contract was visible.
- Mobile and accessibility: [Observed] The form uses native inputs and selects, but the docs navigation takes substantial first-screen space. Narrow layout was not treated as a planning-specific result view.
- Privacy: [Unknown] No prominent local-only or submission statement was visible.
- Performance: [Observed] The result was available after a normal document load; this is not a benchmark.
- Search-content structure: [Observed] Title and h1 are direct; explanatory text precedes the tool; the page is nested under a knowledge-base Tools section.
- What works: It connects EC parameters to a real Ceph command and includes hierarchy inputs beyond a single host count.
- What fails: It is EC-only, assumes uniform hardware, includes IOPS and object-size claims without enough model transparency, and does not show a loss scenario or mixed-domain accounting.
- Do not copy: The command-first output and the dense documentation chrome.

```text
[Ceph docs shell and navigation]
  Erasure Coding Calculator
  intro paragraph
  [profile] [datacenters] [racks] [servers] [OSDs] [capacity]
  [IOPS] [k] [m] [stripe] [object size]
  Usable | Raw | Efficiency | IOPS | Stripe width | Failure domain
  [copy] ceph osd erasure-code-profile set ...
```

### Competitor 2: Simplified Tools Ceph Storage Capacity Calculator

- URL: https://www.simplified.tools/calculate_ceph_capacity
- Accessed: 2026-08-23, viewport 1280 x 900, fully accessible in standalone Playwright.
- Audience and promise: [Observed] A broad technical-tool audience that wants raw, usable, reserve-aware Ceph capacity and configuration guidance.
- Inputs and defaults: [Observed] Total nodes; homogeneous or heterogeneous toggle; capacity per node and units; manual capacity rows; replication or EC mode; replication size and `min_size`; EC `k`, `m`, and `min_size`; failure domain of host, OSD, or custom capacity block; custom domain capacity; domains to tolerate; OSDs per node; PG hints; data pools; nearfull and full ratios; overhead and CRUSH skew. Advanced panels add CSV, JSON, PNG, and DOCX export.
- Action and state behavior: [Observed] Inputs are reactive, with an advanced disclosure and several result tabs. Share controls and exports are prominent. The inspected DOM exposed a number of template-like button labels, suggesting a large feature surface.
- Results and visuals: [Observed] Capacity ledger, protection breakdown, recovery briefing, cluster guardrails, scheme matrix, charts, and exports. The tool calculates raw and usable figures and discusses reserves, domains, PGs, and overhead.
- Formula or data source: [Documented] The page describes raw capacity, protection efficiency, failure-domain reserve, nearfull policy, overhead, and CRUSH skew. It exposes more assumptions than most competitors, but the number of simultaneous choices can make the primary answer hard to find.
- Errors and edge behavior: [Observed] A zero-node probe did not present a clear field-level error in the visible text; the page continued to show a result surface. Treat invalid-state semantics as unclear.
- Mobile and accessibility: [Observed] Native labels and controls exist, but the control and export inventory is large. The page is a broad calculator suite rather than a narrow answer-first tool.
- Privacy: [Documented] An embed disclaimer is visible; local-only calculation was not the primary privacy message.
- Performance: [Observed] The result surface loaded and rendered in the inspected page; no performance benchmark was taken.
- Search-content structure: [Observed] Long SEO outline with Introduction, How to Use, Interpreting Results, Technical Details, formula, examples, FAQ, glossary, and references.
- What works: It covers replication, EC, heterogeneous nodes, domains, nearfull policies, and exports in one place.
- What fails: It is too broad for a fast topology decision, risks mixing policy thresholds with capacity, and does not make the simplest valid flow visually dominant.
- Do not copy: The dashboard-like tabs, export menu, and long prose-first page shape.

```text
[large tools site navigation]
  Ceph Storage Capacity Calculator
  node mode + capacity fields
  protection mode + size/k/m/min_size
  domain + reserve + PG + advanced sliders
  [Advanced] [Capacity Ledger] [Protection] [Recovery] [JSON] [exports]
  many charts and warnings
```

### Competitor 3: Bennet Gallein Ceph Calculator

- URL: https://bennetgallein.de/tools/ceph-calculator
- Accessed: 2026-08-23, viewport 1280 x 900, fully accessible in standalone Playwright.
- Audience and promise: [Observed] Proxmox and Ceph users who want usable storage that still works when the largest node fails.
- Inputs and defaults: [Observed] Accept degraded PGs checkbox; define each node manually checkbox; per-node capacity or total node count; number of replicas. The default page showed six total TB raw, 1.33 TB usable, 22% efficiency, and a 0.67 nearfull ratio.
- Action and state behavior: [Observed] The result updates as inputs change. A `+1 node` action and Save Configuration button are present. No visible EC mode was exposed.
- Results and visuals: [Observed] Raw storage, usable storage size, storage efficiency, and OSD nearfull ratio. The main differentiator is a largest-node failure assumption.
- Formula or data source: [Documented] The page explicitly says the remaining nodes should hold the data from the biggest failed node to avoid degraded PGs and data loss. It explains that per-node capacity is the sum of OSDs on that node.
- Errors and edge behavior: [Observed] Input-level error details were not visible in the first state; exact boundary behavior remains unknown.
- Mobile and accessibility: [Observed] Native controls and short sections are present. The UI is smaller and easier to scan than the broad calculators.
- Privacy: [Unknown] No local-only statement was visible in the inspected first screen.
- Performance: [Observed] Immediate result updates; not benchmarked.
- Search-content structure: [Observed] Short intro, Explanation, Settings, Outputs, and a longer Ceph and Proxmox explanation.
- What works: It explains a concrete loss scenario instead of presenting only `raw / replicas`.
- What fails: It is replication-only, has no explicit failure-domain choice, and its safe capacity differs from ordinary usable capacity without an adjacent visual explanation.
- Do not copy: The single safety number labelled as the central usable answer.

```text
Ceph Calculator
  loss assumption paragraph
  [Accept degraded PGs] [Define each node]
  [node capacity rows] [+1 node]
  replicas
  Raw Storage | Usable Storage | Efficiency | Nearfull ratio
  [Save Configuration]
```

### Competitor 4: euroNAS Ceph Storage Calculator

- URL: https://euronas.com/documentation/books/eekas-user-guide-en/page/ceph-storage-calculator
- Accessed: 2026-08-23, viewport 1280 x 900, fully accessible in standalone Playwright, but the page itself links to the advisor rather than rendering the full interactive calculator.
- Audience and promise: [Observed] Ceph and eEKAS or eEVOS planners who want usable capacity, host-level fault tolerance, and suggested protection profiles.
- Inputs and defaults: [Documented] Number of nodes, total OSDs, and disk size. The linked advisor is described as suggesting replication and EC profiles.
- Action and state behavior: [Observed] The documentation page has no active calculator form in the inspected state. A link opens the separate advisor.
- Results and visuals: [Documented] Estimated usable space, host-level fault tolerance, and performance impact. The page states that the model assumes `CRUSH failure domain = host`.
- Formula or data source: [Documented] The assumptions are clear at a high level; the detailed advisor formula was not available on the documentation page.
- Errors and edge behavior: [Unknown] No calculator interaction was available on the inspected page.
- Mobile and accessibility: [Observed] Documentation navigation and tab controls dominate the page; the actual tool behavior is not available there.
- Privacy: [Unknown] No local-only statement was visible.
- Performance: [Observed] Documentation loaded normally; the advisor was not operated.
- Search-content structure: [Observed] Documentation page with a short overview, assumptions, and a separate link.
- What works: It makes the host failure-domain assumption explicit and avoids pretending the page is a full architecture review.
- What fails: The user must leave the documentation page, and the model is too coarse for mixed domains or mixed capacities.
- Do not copy: A link-out that leaves the planner's core evidence elsewhere.

```text
euroNAS documentation
  Ceph Storage Calculator
  short purpose
  inputs: nodes | OSDs | disk size
  outputs: raw | profiles | host fault tolerance | performance
  [open Ceph Calculator and Advisor]
```

### Competitor 5: `ds-04/ceph_ec_calc`

- URL: https://github.com/ds-04/ceph_ec_calc
- Accessed: 2026-08-23, viewport 1280 x 900, fully accessible in standalone Playwright.
- Audience and promise: [Observed] Technical users who can run a Python CLI to calculate EC capacity.
- Inputs and defaults: [Documented] OSD count and OSD size, or servers, drives per server, and capacity; `k`, `m`, and an optional tabular output. The example uses 72 OSDs at 12 TB with `k=4`, `m=2`.
- Action and state behavior: [Observed] A README explains command-line flags. There is no browser form, reset, share, or validation UI.
- Results and visuals: [Observed] Raw TB, efficiency ratio, 100% capacity, and an 80% recommended capacity. Output is terminal text or a table.
- Formula or data source: [Documented] The README shows the EC ratio and an 80% safety reservation. It states “use at own risk” and does not claim a live Ceph inspection.
- Errors and edge behavior: [Unknown] CLI validation was not run in the browser review; the repository is a small calculator with one star and twelve commits at access time.
- Mobile and accessibility: [Observed] The web page is GitHub's repository UI, not a calculator surface.
- Privacy: [Unknown] The calculator itself is local CLI code.
- Performance: [Observed] Static repository page; no runtime benchmark.
- Search-content structure: [Observed] README sections for OSD calculation and server calculation.
- What works: The smallest useful formula is clear and the server model acknowledges its uniformity assumption.
- What fails: It is EC-only, uniform, terminal-only, and gives no domain placement or largest-domain loss accounting.
- Do not copy: An unexplained fixed 80% reservation as the only safety answer.

```text
GitHub repository
  ceph_ec_calc README
  [OSD count or servers/drives]
  [OSD size] [k] [m]
  Raw | efficiency | 100% | 80% reserve
  CLI examples
```

### Competitor 6: Ceph PG Calculator

- URL: https://cephpg.com/
- Accessed: 2026-08-23, viewport 1280 x 900, fully accessible in standalone Playwright. `/usable-capacity` resolves to the same calculator surface.
- Audience and promise: [Observed] OpenStack and Ceph operators sizing PG counts and pool capacity with a CRUSH-aware tool suite.
- Inputs and defaults: [Observed] Total OSD count, pool count, replication or EC profile, target PGs per OSD, expected data, OSD capacity, pool name and weight, pool type, and failure domain of host, rack, datacenter, or OSD. The landing page includes links for EC profile planning, usable capacity, PG fixes, and CRUSH helpers.
- Action and state behavior: [Observed] Explicit `CALCULATE PG COUNTS` action; result includes total PGs, actual PGs per OSD, raw capacity, usable capacity, storage utilization, replication, and warnings. Copy buttons appear on generated rows.
- Results and visuals: [Observed] A PG-focused result with capacity figures and warnings about high utilization or too many PGs. It is not a domain inventory or failure simulation.
- Formula or data source: [Documented] The page shows formulas such as `(OSDs × target_pgs_osd) / rep_factor`, EC overhead, and a minimum of three hosts for a host failure domain in example copy.
- Errors and edge behavior: [Observed] The default example warns when projected utilization is above the stated ceiling. Exact invalid field behavior was not fully visible.
- Mobile and accessibility: [Observed] Native controls are present, but the page has a dense form and a broad output surface.
- Privacy: [Observed] The page says free and no login. Local-only handling was not explicitly stated.
- Performance: [Observed] Results rendered in the initial page; no benchmark.
- Search-content structure: [Observed] Tool title, formula notes, official docs links, and explanatory sections including an FAQ.
- What works: It links capacity to PG planning and exposes failure-domain choices.
- What fails: It compresses several jobs into one PG calculator, uses simplified uniform OSD inputs, and does not show which entered domain carries the failure reserve.
- Do not copy: Combining PG correctness, capacity, and CLI generation before the capacity answer is understood.

```text
Ceph PG Calculator
  OSD count | pools | protection | PG target
  expected data | OSD capacity | pool rows | failure domain
  [CALCULATE PG COUNTS]
  PG count | PG/OSD | raw | usable | utilization warnings
  docs and CLI guidance
```

### Competitor 7: The Home Server Blog generic EC calculator

- URL: https://thehomeserverblog.com/erasure-coding-calculator/
- Accessed: 2026-08-23, viewport 1280 x 900, fully accessible in standalone Playwright. This is an adjacent generic EC competitor, not Ceph-specific.
- Audience and promise: [Observed] Homelab users comparing EC profiles, reserves, fault tolerance, and rebuild read amplification.
- Inputs and defaults: [Observed] K, M, total devices, device capacity and unit, reserve target, rebuild read speed, shard fullness, simultaneous failed shards, and workload. Presets include 4+2, 6+2, 8+3, and others.
- Action and state behavior: [Observed] Preset buttons fill the form; explicit Calculate and Print Results actions are present.
- Results and visuals: [Observed] Raw, usable, efficiency, fault tolerance, rebuild reads and time, formula, scheme grid, and placement note. The default result said 288 TB raw and 194.4 TB usable with a 10% reserve.
- Formula or data source: [Documented] It states that each stripe places K and M shards across separate devices and warns that real usable space can be lower with placement rules, metadata, snapshots, and mixed devices.
- Errors and edge behavior: [Unknown] No full invalid-state probe was performed.
- Mobile and accessibility: [Observed] Native controls and a long result page; the preset inventory can create a lot of vertical content.
- Privacy: [Unknown] No local-only statement was visible in the inspected state.
- Performance: [Observed] Initial result rendered; no benchmark.
- Search-content structure: [Observed] Heading structure, planning tips, reference tables, and related posts.
- What works: It makes reserve, fault tolerance, and rebuild cost visible rather than hiding all of them in one capacity number.
- What fails: It is not Ceph-aware, has no host or rack grouping, and includes performance estimates outside a universal formula contract.
- Do not copy: Performance and rebuild-time precision without measured hardware inputs.

```text
Generic EC Calculator
  presets: 4+2 | 6+2 | 8+3 | ...
  K | M | devices | capacity | reserve
  rebuild speed | fullness | failures | workload
  [Calculate] [Print]
  raw | usable | fault tolerance | rebuild reads/time
  formula | scheme grid | planning tips
```

## Comparison matrix

| Capability | Clyso | Simplified Tools | Bennet Gallein | euroNAS | `ceph_ec_calc` | Ceph PG | stack127 opportunity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Replicated pools | No | Yes | Yes | Suggested | No | Yes | Make replication and EC equally first-class. |
| EC `k+m` | Yes | Yes | No visible mode | Suggested | Yes | Presets | Show exact ratio and shard tolerance beside domain count. |
| Mixed domain inventory | Uniform hierarchy | Heterogeneous toggle and custom blocks | Manual node capacities | Coarse only | Uniform | Uniform | Add repeatable domain batches with per-OSD count and capacity. |
| Failure-domain choice | Recommended host | Host, OSD, or custom | Implicit node loss | Host assumption | None | Host, rack, datacenter, OSD | Make the selected domain and required number explicit. |
| Largest-domain loss | Not visible | Reserve control | Core feature | General fault tolerance | 80% reserve | Warning only | Show raw and modeled capacity after the largest entered domain disappears. |
| Nearfull or planning reserve | Not clear | Many sliders | Nearfull output | Unknown | Fixed 80% | Utilization warning | Keep reserve separate from protection efficiency and let it be explicit. |
| PG sizing | No | Yes | No | No | No | Core feature | Non-goal for the first release. |
| Performance or rebuild estimate | IOPS | Some heuristics | No | Suggested | No | No | Non-goal unless authoritative inputs exist. |
| Command generation | EC profile command | Exports | Save config | Link-out | CLI examples | Pool commands | Defer; keep answer focused on topology and capacity. |
| Share or export | Copy command | CSV, JSON, images, DOCX | Save config | No | CLI only | Copy rows | A small explicit share link is useful; no export suite. |
| Primary answer shape | Result list | Broad dashboard | Safety capacity | Documentation | Terminal table | PG dashboard | One answer-first result plus exact capacity bar and domain table. |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Should a nearfull or full threshold reduce the main usable value? | `ceph_ec_calc` uses 80%; Simplified exposes nearfull, full, overhead, and skew; basic tools show raw divided by protection only. | [Ceph monitor configuration](https://docs.ceph.com/en/latest/rados/configuration/mon-config-ref/) and [Ceph EC overview](https://docs.ceph.com/en/latest/rados/operations/erasure-code/) | Product plan should choose separate values: modeled protection capacity, optional planning ceiling, and an explicit warning that thresholds are policy. |
| How many domains are required? | EC tools often say `k+m`; replication tools use `size`; some tools calculate a largest-node reserve instead of placement eligibility. | [Ceph CRUSH maps](https://docs.ceph.com/en/latest/rados/operations/crush-map/) and [Ceph EC overview](https://docs.ceph.com/en/latest/rados/operations/erasure-code/) | Product plan should show `required domains = size` or `k+m`, plus `+1` operational headroom as a recommendation, not a validity requirement. |
| Is one-domain loss a data-loss test or a re-replication test? | Bennet targets no degraded PGs; community examples distinguish temporary degraded state from full redundancy; EC docs describe shard loss. | [Bennet Gallein calculator](https://bennetgallein.de/tools/ceph-calculator), [Ceph pool configuration](https://docs.ceph.com/en/latest/rados/configuration/pool-pg-config-ref/) | Product must label the scenario as capacity after the largest domain is unavailable, and separately state whether full placement headroom remains. |
| How should mixed capacities be converted to usable capacity? | Uniform tools use a ratio over a sum; broad tools add skew and reserve heuristics; community reports uneven balancing. | [Ceph CRUSH maps](https://docs.ceph.com/en/latest/rados/operations/crush-map/) | Sum exact raw bytes, apply the protection ratio, show domain shares, and label the result estimated because live CRUSH placement is not simulated. |
| How much EC overhead should small files add? | Generic calculators omit it; Ceph docs warn it can be significant for small objects. | [Ceph EC overview](https://docs.ceph.com/en/latest/rados/operations/erasure-code/) | Exclude object-size amplification from the formula and put it beside the result as an explicit limitation. |

## Evidence-backed opportunities

1. **Make failure-domain eligibility visible beside capacity.** Existing tools either assume host domains, hide them inside a recommendation, or expose them among many PG and performance controls. A compact inventory table can state, for example, “4+2 needs 6 separate entered domains; this plan has 5,” before showing a capacity answer.
2. **Treat mixed domains as first-class input.** A row per failure-domain batch with OSD count and per-OSD size is more honest than a single “nodes x disks x capacity” input and remains simple enough for a homelab plan.
3. **Separate three answers that competitors blend.** Show raw capacity, protection-mode modeled usable capacity, and a largest-domain-loss scenario. Keep nearfull or user headroom as an independent planning ceiling.
4. **Use one exact visual accounting surface.** A capacity bar and domain table can show the ratio and the largest loss without a dashboard of exports, PG tabs, or ungrounded performance numbers.

## Table stakes

- Replication `size` and EC `k+m` choices.
- Decimal and binary capacity units with exact normalization.
- Repeatable domain and OSD inventory, including mixed capacities.
- Required domain count and a visible invalid state when the topology cannot place a copy or shard per domain.
- Raw capacity, modeled usable capacity, protection overhead, domain count, OSD count, and a largest-domain loss scenario.
- Explicit submit, reset, repeat, keyboard submit, invalid input recovery, and stale-result clearing.
- A result that states it is a planning model, not a live cluster inspection.
- Local calculation with no API, no input logging, and explicit share state only if the user asks for it.

## Ideas to reject

- **IOPS, latency, or rebuild-time estimates:** they need measured device, network, workload, and recovery inputs that the route cannot verify.
- **PG calculator or pool-count planner:** useful, but it is a separate technical job and already exists as an adjacent competitor surface.
- **Automatic “best profile” or “safe cluster” verdict:** it would promise architecture judgment beyond the entered model and could provide unsafe reassurance.
- **A fixed 80% or 85% headline:** it hides a site policy or Ceph threshold inside the technical efficiency ratio.
- **Exact `ceph df` or `ceph osd df` prediction:** live PG distribution, weights, classes, metadata, utilization, and history are unavailable.
- **A command generator in the first release:** it adds destructive-looking operational output and distracts from the topology decision. Link to official commands in the guide instead.
- **A broad hardware and performance wizard:** it recreates the largest competitor's dashboard and weakens the two-second scan.

## Open questions and blockers

- No blocker remains for product planning. The next stage must decide the exact reserve input and whether `min_size` is displayed as a contextual field or kept out of the first release. The authoritative base formula and minimum failure-domain rules are resolved.

## Sources

- Ceph erasure coding: https://docs.ceph.com/en/latest/rados/operations/erasure-code/, accessed 2026-08-23. Documents EC overhead, `k+m` domains, small-object caveats, and profile guidance.
- Ceph erasure-code profiles: https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/, accessed 2026-08-23. Documents `k`, `m`, shard tolerance, stripe units, and profile immutability.
- Ceph CRUSH maps: https://docs.ceph.com/en/latest/rados/operations/crush-map/, accessed 2026-08-23. Documents failure-domain-aware placement and hierarchy behavior.
- Ceph pool and PG configuration: https://docs.ceph.com/en/latest/rados/configuration/pool-pg-config-ref/, accessed 2026-08-23. Documents replicated pool sizing and `min_size` context.
- Ceph monitor configuration: https://docs.ceph.com/en/latest/rados/configuration/mon-config-ref/, accessed 2026-08-23. Documents nearfull and full behavior.
- Clyso Erasure Coding Calculator: https://docs.clyso.com/docs/kb/tools/erasure-coding-calculator/, accessed 2026-08-23. Observed EC-only hierarchy form and command output.
- Simplified Tools Ceph Storage Capacity Calculator: https://www.simplified.tools/calculate_ceph_capacity, accessed 2026-08-23. Observed broad replication, EC, reserve, domain, and export surface.
- Bennet Gallein Ceph Calculator: https://bennetgallein.de/tools/ceph-calculator, accessed 2026-08-23. Observed largest-node loss planning model.
- euroNAS Ceph Storage Calculator: https://euronas.com/documentation/books/eekas-user-guide-en/page/ceph-storage-calculator, accessed 2026-08-23. Documented coarse host-level advisor and assumptions.
- `ds-04/ceph_ec_calc`: https://github.com/ds-04/ceph_ec_calc, accessed 2026-08-23. Observed CLI-only EC ratio and 80% reserve model.
- Ceph PG Calculator: https://cephpg.com/, accessed 2026-08-23. Observed PG, capacity, profile, and failure-domain suite.
- The Home Server Blog EC calculator: https://thehomeserverblog.com/erasure-coding-calculator/, accessed 2026-08-23. Observed adjacent generic EC, reserve, fault, and rebuild surface.
- StorPool capacity planner: https://kb.storpool.com/install/cluster-capacity-planner.html, accessed 2026-08-23. Observed adjacent replication and EC upgrade-planning model.
- Ceph mixed OSD discussion: https://www.reddit.com/r/ceph/comments/1afe5gi/different_osd_sizes_in_ceph/, accessed 2026-08-23. Community pain evidence only.
- Ceph heterogenous EC discussion: https://www.reddit.com/r/ceph/comments/1m693g0/erasure_coding_with_heterogenous_hdd_sizes/, accessed 2026-08-23. Community pain evidence only.
