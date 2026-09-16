# Competitive report: self-hosted app resource planner

Status: ready
Tool: Self-hosted app resource planner
Route: `/self-hosted-app-resource-planner`
Researched: 2026-09-10
Direct competitors reviewed: 8
Saturation exception: no

## Research scope

### Current stack127 state

The flat route `/self-hosted-app-resource-planner` is collision-free. No route, engine, tests, scripts, or ownership manifest exist yet. The current self-host directory already renders reviewed RAM and storage facts and planning ranges from `public.self_host_apps` and `public.self_host_app_resource_estimates`. Those records carry a range, kind, confidence, basis, source URLs, note, and check date. A missing value is deliberately preserved as unknown; it is not evidence that an app needs no resource.

The current data model has reviewed RAM and storage fields, but no reviewed per-app CPU requirement field. The planner therefore needs to avoid invented CPU numbers. CPU may be a user-entered host budget, a qualitative workload factor, or a future reviewed data field, but the first product contract must not imply that a generic CPU number is an official app requirement.

The page should be a genuine calculation over the user's selected app mix, workloads, and host budget. It must not become a thin directory wrapper, a runtime monitor, a Docker inspection tool, a security judgement, or a universal compatibility claim. A custom row is important because partial curated coverage should remain usable without silently assigning a guessed requirement.

### Method and coverage

- Search backend: web connector
- Search engines: not individually available through the connector
- Visual backend: standalone Playwright CLI with headless Chromium 1.60.0; the Codex in-app Browser reported no connected runtime
- Accessed: 2026-09-10, Asia/Kolkata
- Desktop viewport: 1280 x 900
- Mobile viewport: 375 x 812
- Direct operation: each counted candidate was opened at both viewports. Native controls, first-screen output, initial or default state, and page overflow were inspected. Safe representative inputs were used where the page exposed a live calculation. No account, purchase, external submission, or sensitive data was used.
- Browser limitation: Chromium required the approved execution boundary because the default sandbox could not launch its browser process. Search saturation used the web connector because SearXNG was not configured in the environment.

Search queries used four distinct shapes:

- `self hosted app resource calculator server requirements planner`
- `Docker containers RAM CPU resource planner calculator`
- `self hosting multiple apps how much RAM requirements calculator`
- `Docker Compose resource requirements calculator memory CPU apps`
- `Docker host capacity calculator containers RAM CPU`
- `self hosted server hardware requirements calculator apps`
- `container capacity planning calculator CPU memory host`
- `homelab server requirements calculator`

### Search saturation evidence

- Queries tried: the eight queries above, including exact phrase, underlying job, Docker or container specialist, and hardware or homelab variations.
- Repeated domains: SelfHostPicks, The Home Server Blog, Serverkueche, SmartMur, SelfHost Atlas, FindMeTool, ioTools, and GlobalCalc were the usable direct or close calculator surfaces. Docker Docs and project documentation appeared repeatedly as technical sources, not competitors.
- Exclusions: `figured.fyi/docker-resource-calculator` returned a DNS resolution failure during direct operation; `techtoolverse.com/docker-resource-calculator` was a parked GoDaddy domain; CalculatorBeacon is a cost calculator, not a hardware or app-mix planner; Docker Resource Usage is runtime monitoring; Docker and app requirement pages are specifications, not planners; generic VPS price calculators do not model a selected self-hosted app mix.
- The category has more than five usable direct or close tools, so the narrow-category saturation exception is not needed. The direct set is mixed: three app-stack planners, one hardware workload planner, three container capacity planners, and one static app requirement checklist. That mix is itself evidence that the user job is fragmented rather than owned by one coherent model.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| App mix sizing | `self hosted app resource calculator` | Add the apps they plan to run and see a realistic starting envelope. | App checklists and app-stack calculators |
| Server buying decision | `how much RAM for self hosted apps` | Choose between a Pi, mini PC, NAS, or VPS without overbuying. | Hardware guides and vendor-linked calculators |
| Existing host fit | `can my server run these Docker containers` | Compare selected workload against RAM and storage already available. | Docker host calculators and forum answers |
| Container capacity | `Docker containers RAM CPU host calculator` | Convert per-container requests or limits into host utilization. | Generic container calculators |
| Growth planning | `homelab server requirements calculator` | Include users, storage growth, backups, and headroom. | Broad homelab sizing calculators |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Users confuse hard memory limits, soft reservations, CPU shares, and Compose support. | [r/docker memory and CPU constraints](https://www.reddit.com/r/docker/comments/1qk8mpj/memorycpu_constraints/) shows the question, attempted fields, and follow-up confusion about `deploy.resources`, `mem_limit`, and `cpu_shares`. | Repeated replies in one thread plus matching Docker documentation caveats. | Keep planning estimates separate from Docker enforcement fields, and link to the next runtime verification step. |
| People want a defensible way to estimate several services before buying hardware, but future growth and workload matter. | [r/homelab sizing discussion](https://www.reddit.com/r/HomeServer/comments/1tomzp3/foolproof_method_to_estimate_my_needs/) asks for a method that accounts for what will be run now and later. | Repeated in search results and homelab planning threads. | Let users edit app quantity or workload assumptions and expose headroom as an input, not hidden magic. |
| A RAM number alone does not explain media, OCR, NVR, AI, or database spikes. | The operated SelfHostPicks and Home Server Blog tools both add workload or hardware caveats around media, OCR, cameras, users, and transcodes. | Visible across app-specific and hardware calculators. | Show an assumption or workload note beside each estimate, and make an unknown explicit. |
| Users can overcommit a host when they add container limits without reserving the host OS and Docker overhead. | [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/) documents unbounded defaults, hard versus soft memory limits, and OOM risk. | Primary documentation plus the FindMeTool and GlobalCalc result warnings. | Show host budget, reserved overhead, selected app estimate, and binding resource as separate values. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| A Docker container has no resource constraint by default, and memory or CPU settings change runtime enforcement rather than predicting application demand. | [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/) | Documented | Do not label a planning estimate as a Compose limit or guarantee. |
| Hard memory limits cap usage; soft reservations do not guarantee a cap; CPU shares arbitrate priority rather than reserve a fixed amount. | [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/) | Documented | This is why the planner should not turn app estimates directly into `deploy.resources` YAML. |
| `docker stats` reports observed CPU, memory, network, and block I/O for running containers. | [Docker container stats](https://docs.docker.com/reference/cli/docker/container/stats/) | Documented | The page should provide a verification handoff instead of claiming runtime accuracy. |
| Current Stack127 planning ranges are not publisher requirements and must retain basis, confidence, source URLs, workload, and review explanation. | `content_docs/self-host-apps/schema.md` and `content_docs/self-host-apps/data-workflow.md` | Documented | Use `(estimated)` or equivalent evidence language and keep nulls visible. |
| Adding selected app ranges produces an exact planning total for the selected data, but not a universal hardware requirement. | Current resource-estimate schema plus controlled calculator probes | Inferred | The total is arithmetic; the input ranges and workload assumptions remain uncertain. |
| Per-app CPU can be summed from the current directory in the same way as RAM. | Current Stack127 data model | Unknown / rejected | There is no reviewed per-app CPU requirement field. Do not invent one to match competitors. |
| A fixed OS overhead or fixed headroom percentage is correct for every host and app mix. | Competitors use different values; no universal primary source | Disputed | Make headroom explicit and describe it as a planning choice. |
| Missing curated coverage means the app cannot run on the host. | Current Stack127 data workflow | Unknown / rejected | A missing match is not a negative compatibility or resource claim. |

## Competitor reviews

### Competitor 1: SelfHostPicks Homelab Resource Calculator

- URL: https://selfhostpicks.com/tools/homelab-resource-calculator/
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, fully accessible.
- Audience and promise: [Observed] A self-hosting reader choosing a Pi, mini PC, or NAS. It promises a sourced RAM estimate and a hardware tier for a selected app mix.
- Inputs and defaults: [Observed] Sixteen app checkboxes with displayed RAM figures, a household-size select, and an optional email capture. The first state showed 0.5 GB recommended RAM. A safe probe selecting Immich and Jellyfin produced 21.4 GB and recommended a 32 GB mini PC or NAS with hardware transcoding notes.
- Action and state behavior: [Observed] Results update as app selections change. There is no host-budget input, custom app row, CPU input, storage input, or visible reset control.
- Results and visuals: [Observed] Recommended RAM, hardware tier, app-specific media or ARM caveats, then a source table. The result is answer-first and understandable.
- Formula or data source: [Documented] The page says it sums app recommendations, adds about 0.5 GB for OS and Docker, applies a household factor, and adds 30% headroom. [Inferred] The visible displayed app values do not expose enough detail to reproduce every output exactly.
- Errors and edge behavior: [Observed] Empty selection remains a valid 0.5 GB baseline and asks the user to pick apps; invalid numeric input is not applicable.
- Mobile and accessibility: [Observed] Native checkboxes and a select remain usable at 375 px with no page overflow. Label text is dense but readable.
- Privacy: [Observed] An email capture appears below the result; no prominent local-only calculation statement was visible.
- Performance: [Observed] Initial result was available after normal document load; no benchmark was taken.
- Search-content structure: [Observed] Direct h1, short explanation, how-to steps, app checklist, result, source table, method, and links to deeper app pages.
- What works: It has the closest match to the target job, app-level provenance, and workload caveats without requiring a host schema.
- What fails: It cannot answer whether a known host has enough room, has no visible unknown-app path, and compresses CPU and storage into prose.
- Do not copy: An optional email capture in the working flow or opaque household multipliers.

```text
title and promise
  how to use
  [app checkbox grid with RAM labels]
  [household size]
  recommended RAM + hardware tier
  media/ARM caveats
  source table + method
```

### Competitor 2: The Home Server Blog Server Sizing Calculator

- URL: https://thehomeserverblog.com/server-sizing-calculator/
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, fully accessible.
- Audience and promise: [Observed] Home lab builders planning mixed NAS, Proxmox, media, NVR, database, and GPU workloads. It promises CPU, memory, usable storage, network, power, heat, and rack estimates.
- Inputs and defaults: [Observed] Named workload presets; hardware class; peak active users; VMs; containers; media transcodes; game slots; camera count, bitrate, and retention; existing data; annual growth; planning window; protection layout; backup copies; and headroom. Decimal or binary storage units are visible.
- Action and state behavior: [Observed] Explicit `Calculate Server Size` and `Print Results` actions. Preset buttons populate a broad form.
- Results and visuals: [Observed] A long sizing breakdown with recommended CPU, memory, storage, network, power, cooling, and footprint. The first screen is form-heavy before the answer.
- Formula or data source: [Documented] The page says workload profile and hardware class set CPU, memory, I/O, and network weighting, and headroom applies across resources. [Unknown] The complete weighting formula is not exposed in the visible page.
- Errors and edge behavior: [Unknown] Detailed invalid and zero-input behavior was not exhaustively probed.
- Mobile and accessibility: [Observed] Native labels and controls fit at 375 px with no page overflow, but the long form requires substantial scrolling.
- Privacy: [Unknown] No local-only calculation statement was prominent in the inspected tool area.
- Performance: [Observed] Defaults and result sections rendered during normal load; no benchmark was taken.
- Search-content structure: [Observed] Strong descriptive h1, sizing breakdown, planning guide, and related calculator links.
- What works: It treats storage growth, backups, workload types, and headroom as first-class inputs.
- What fails: It is too broad for a user who already knows their app list, and its exact model is hard to audit.
- Do not copy: A long form that delays the first resource answer for a narrow app-mix question.

```text
title and explanation
  presets
  workload profile + hardware class
  users | VMs | containers | transcodes | cameras
  data growth | protection | backups | headroom
  [Calculate] [Print]
  sizing breakdown across six resource types
```

### Competitor 3: SmartMur Hardware Requirements Calculator

- URL: https://smartmur.github.io/smartmur-homelab-platform/reference/hardware-calculator/
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, accessible as a documentation page but not as a fully working calculator.
- Audience and promise: [Observed] Homelab builders selecting services and a hardware tier. The page says it can calculate hardware from selected services.
- Inputs and defaults: [Observed] A checklist of fixed service rows with RAM and CPU figures, including Traefik, Pi-hole, Jellyfin, Immich, Nextcloud, Frigate, databases, and monitoring services. Tier tables cover five to ten, fifteen to twenty-five, thirty to fifty, and fifty-plus services.
- Action and state behavior: [Observed] Service checkboxes appear in the rendered documentation, but no live result or calculate action was available in the inspected page. It behaves as a static reference.
- Results and visuals: [Observed] Service lists, tier tables, storage, power, budget, and example sections. No computed selected-stack result was observed.
- Formula or data source: [Unknown] Fixed values are shown, but the page does not expose provenance or a reproducible calculation in the visible surface.
- Errors and edge behavior: [Unknown] No active calculation state was available.
- Mobile and accessibility: [Observed] Documentation navigation, native checkboxes, and headings work at 375 px without page overflow; the sidebar chrome competes with the content.
- Privacy: [Unknown] No local-only statement was visible.
- Performance: [Observed] Static documentation loaded normally; no tool benchmark.
- Search-content structure: [Observed] Many headings and a table of contents provide broad search coverage, but the h1 includes a documentation anchor marker.
- What works: It demonstrates demand for app-level rows and makes CPU visible alongside RAM.
- What fails: Hard-coded rows look authoritative without provenance, and the claimed calculator is not visibly interactive.
- Do not copy: A checklist that claims exact hardware without a live result or source status.

```text
documentation shell
  Hardware Requirements Calculator
  [service checklist with RAM + CPU]
  service-count tiers
  storage | power | budget
  examples and decision matrix
```

### Competitor 4: Serverkueche Server Calculator

- URL: https://serverkueche.de/en/server-calculator/
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, fully accessible.
- Audience and promise: [Observed] People choosing a netcup server for a selected self-hosting stack. It promises an RAM and CPU estimate plus a matching provider recommendation.
- Inputs and defaults: [Observed] User tier S, M, or L; a search field; approximately thirty app checkboxes grouped by files, media, productivity, documents, tasks, and business tools; reset selection; provider links.
- Action and state behavior: [Observed] App selections and user tier drive a live recommendation. The result can be reached through `Jump to result`; there is reset but no host budget or custom app.
- Results and visuals: [Observed] Recommended server with RAM and CPU language, a netcup recommendation, and a caveat that the values include Debian, Docker, and a safety margin.
- Formula or data source: [Documented] The page says values are conservative base load plus a safety margin and that user tier controls simultaneous-access headroom. [Unknown] Per-app numbers and exact formula are not exposed as a source table.
- Errors and edge behavior: [Observed] Reset selection is available; empty and invalid numeric states are not applicable.
- Mobile and accessibility: [Observed] Native checkboxes, search, and tier controls fit at 375 px with no page overflow, but the large app list creates a long scroll.
- Privacy: [Unknown] No local-only statement was visible; provider recommendation and outbound links are part of the result.
- Performance: [Observed] Live result updates after selection; no benchmark.
- Search-content structure: [Observed] Clear h1, three numbered steps, method explanation, FAQ, and recommendation sections.
- What works: It makes user count explicit and gives a direct buying decision quickly.
- What fails: The provider recommendation introduces commercial coupling, hides per-app evidence, and does not let a user compare an existing host.
- Do not copy: A vendor recommendation as the primary answer when the user asked for a neutral capacity plan.

```text
h1 and promise
  1. user tier S/M/L
  2. app search + checkbox groups
  3. live RAM/CPU estimate
  provider recommendation
  method + FAQ
```

### Competitor 5: SelfHost Atlas Build Your Stack

- URL: https://selfhostatlas.com/build-your-stack
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, fully accessible.
- Audience and promise: [Observed] A user picking self-hosted apps and a low-cost VPS. It promises a RAM estimate and the cheapest VPS that fits.
- Inputs and defaults: [Observed] Category filters, app search, and many app checkboxes. The page shows per-app RAM values such as Immich 4096 MB, Nextcloud 2048 MB, and Vaultwarden 256 MB. No user count, CPU, storage, or host-budget input was visible.
- Action and state behavior: [Observed] App selection is live; the selected app list and `Your server` result update without a visible submit button.
- Results and visuals: [Observed] App picks, per-app RAM labels, and a server recommendation. The page includes an affiliate disclosure and provider-oriented path.
- Formula or data source: [Observed] The page describes a starting RAM estimate, not a guarantee. [Unknown] The visible page does not show source links or a detailed formula for the displayed values.
- Errors and edge behavior: [Observed] Search and category filtering are available; empty selection behavior was not deeply probed.
- Mobile and accessibility: [Observed] Search and checkbox controls fit at 375 px with no page overflow; the category and app inventory requires scrolling.
- Privacy: [Observed] Affiliate disclosure is visible; no local-only calculation statement was prominent.
- Performance: [Observed] Initial app inventory and result rendered normally; no benchmark.
- Search-content structure: [Observed] Direct h1, pick-apps heading, your-server heading, and category labels.
- What works: Broad app coverage and fast selection make it easy to get a first answer.
- What fails: It offers RAM-only guidance, no evidence table, no storage or existing-host comparison, and provider coupling.
- Do not copy: A single RAM total presented as a server-fit answer without unknowns.

```text
h1 and short disclaimer
  category filters + app search
  app grid with RAM values
  YOUR PICKS
  YOUR SERVER
  cheapest VPS recommendation
```

### Competitor 6: FindMeTool Docker Resource Calculator

- URL: https://findmetool.com/tools/docker-resource-calculator/
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, fully accessible.
- Audience and promise: [Observed] Docker users comparing a fleet of identical containers to one host. It promises a technical budget, not an application requirement.
- Inputs and defaults: [Observed] Running container count, per-container CPU limit, memory limit, CPU reservation, memory reservation, host vCPU, host RAM, OS reserve percentage, swap toggle, Compose CPU shares, and total CPU shares. Defaults were 12 containers, 0.5 CPU limit, 512 MiB memory limit, 0.25 CPU reservation, 256 MiB reservation, 8 vCPU, 32 GiB, and 10% OS reserve.
- Action and state behavior: [Observed] Result is available in the initial state and updates as values change. Copy output and related tools are present.
- Results and visuals: [Observed] Total CPU and memory limits and reservations, host schedulable budget, utilization percentages, CPU-share warning, and a `docker stats` verification note.
- Formula or data source: [Documented] The page describes summing limits and reservations against host capacity. Docker's official docs support the distinction between limits, reservations, and shares.
- Errors and edge behavior: [Observed] Warning behavior is visible for CPU shares; detailed invalid-field behavior was not exhaustively probed.
- Mobile and accessibility: [Observed] Native numeric inputs and labels fit at 375 px without page overflow. The result remains close to the controls.
- Privacy: [Observed] The page states that input is processed locally and is not uploaded; it also says it is not a security audit.
- Performance: [Observed] Result appeared in the initial page; no benchmark.
- Search-content structure: [Observed] Strong h1, input and result headings, formula explanation, examples, FAQ, privacy, and related tools.
- What works: Clear distinction between limits, reservations, host budget, utilization, and runtime validation.
- What fails: It plans identical container rows rather than a mixed app stack and treats user-supplied limits as the source of truth.
- Do not copy: Mapping Docker limits directly to app requirements.

```text
h1 + local-processing note
  Containers: count | limit | reservation
  Host: vCPU | RAM | OS reserve | swap
  result: totals | schedulable host | utilization | warnings
  what it does + formula + docker stats handoff
```

### Competitor 7: ioTools Docker Container Resource Calculator

- URL: https://iotools.cloud/tool/docker-container-resource-calculator/
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, fully accessible.
- Audience and promise: [Observed] Docker and Kubernetes users wanting per-container requests and limits plus generated commands.
- Inputs and defaults: [Observed] Workload type preset, host CPU cores, host RAM GB, and container count. The default workload was Web Server and the default host was 4 CPU and 8 GB RAM.
- Action and state behavior: [Observed] A `Try an example` action is present. The first page state showed `No data yet` in the output rather than an automatic result.
- Results and visuals: [Documented] The page promises recommended resources, a Docker run command, and a Kubernetes resources block, with copy and download actions.
- Formula or data source: [Unknown] The preset recommendations and caps were not explained in the visible first state.
- Errors and edge behavior: [Observed] Empty output is explicit before the example or calculation action; invalid handling was not observed.
- Mobile and accessibility: [Observed] Native fields and output sections fit at 375 px without page overflow; the page has a long product shell and related sections.
- Privacy: [Observed] The page exposes API, MCP, and embed options; local-only processing was not the primary claim.
- Performance: [Observed] First page rendered with an empty output; no benchmark.
- Search-content structure: [Observed] Direct h1, Input, Output, guides, REST API, MCP, embed, and related tools.
- What works: It turns an input model into deployment-shaped output and keeps the first form small.
- What fails: It optimizes for generated Docker or Kubernetes configuration rather than transparent app sizing and provenance.
- Do not copy: A generated limit or YAML block before explaining the estimate behind it.

```text
h1 + short promise
  Input: workload preset | host CPU | host RAM | count
  Output: No data yet
  [Try an example]
  recommended resources | docker run | Kubernetes block
  API/MCP/embed and guides
```

### Competitor 8: GlobalCalc Container Resources Calculator

- URL: https://globalcalc.net/c/us/container-resources-calculator/
- Accessed: 2026-09-10, viewports 1280 x 900 and 375 x 812, fully accessible.
- Audience and promise: [Observed] Container operators planning replicas across nodes. It promises total CPU and memory requests, nodes needed, and the remainder after system reserve.
- Inputs and defaults: [Observed] Replicas, CPU per replica in millicores, memory per replica in MB, cores per node, memory per node in GB, and system reserve percentage. Quick examples include twenty replicas at 500m and 512 MB on 8-core, 32 GB nodes with 15% reserve.
- Action and state behavior: [Observed] Results update as inputs change, with reset, print, copy, pin, link, and embed controls.
- Results and visuals: [Observed] For the default example, two nodes are needed and CPU is limiting; each node fits thirteen replicas after reserve; total requested CPU is 10 cores, total memory is 10 GB, and spare CPU and memory are shown.
- Formula or data source: [Documented] It describes replica multiplication, node packing, and system reserve. [Inferred] It is a uniform-replica model and does not account for app-specific spikes or storage.
- Errors and edge behavior: [Observed] Quick examples and reset are present; complete invalid-boundary behavior was not exhaustively probed.
- Mobile and accessibility: [Observed] Native text inputs and live result fit at 375 px without page overflow; the chart and result controls require scrolling.
- Privacy: [Observed] The page says calculations run in the browser and no account is required; analytics are opt-in in the visible text.
- Performance: [Observed] Live results and a chart rendered during normal load; no benchmark.
- Search-content structure: [Observed] Direct h1, notes, quick estimate examples, input, results, working, FAQ, and source explanation.
- What works: It shows the binding resource and spare capacity instead of only a total.
- What fails: It assumes uniform replicas, is not app-aware, and can look more precise than the workload model warrants.
- Do not copy: A chart or node count that hides the difference between app estimates and container requests.

```text
h1 + short model statement
  quick examples
  replicas | CPU/replica | memory/replica
  cores/node | memory/node | system reserve
  live result: nodes | limiting resource | spare capacity
  working + FAQ + source notes
```

## Comparison matrix

| Capability | SelfHostPicks | Home Server Blog | Serverkueche | SelfHost Atlas | FindMeTool | ioTools | GlobalCalc | Stack127 opportunity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mixed app selection | Yes, fixed apps | Workload profiles | Yes, fixed apps | Yes, fixed apps | No, identical containers | No, workload preset | No, identical replicas | App rows plus custom row |
| RAM estimate | Yes | Yes | Yes | Yes | User-supplied limits | Recommended output | User-supplied requests | Reviewed range with evidence status |
| CPU result | Qualitative caveat | Yes, weighted | Yes | No visible CPU | Yes, limits/reservations | Recommended output | Yes, millicores | Keep qualitative or user-entered until reviewed data exists |
| Storage result | Separate note | Yes, growth and protection | No | No | No | No | No | Use reviewed storage range and separate workload growth input |
| Existing host budget | No | Hardware class comparison | No | Provider fit | Yes | Yes | Yes | Core differentiator for a neutral planner |
| Headroom | Documented 30% | Explicit input | Hidden safety margin | Not visible | OS reserve | Host cap | System reserve | Explicit user input plus visible baseline |
| User count or workload | Household size | Many workload inputs | S/M/L | No | Container count | Preset | Replica count | App quantity and workload notes, no opaque multiplier |
| Provenance | Source table and docs links | Broad explanation | Not per app | Not visible | Formula plus Docker docs | Not visible in first state | Formula notes | Source URL, basis, confidence, and unknown state |
| Unknown or custom app | No visible path | Not app-specific | No | No | Not applicable | Not applicable | Not applicable | Required custom row with no guessed evidence |
| Binding resource | Hardware tier | Multi-resource breakdown | Provider tier | RAM/server | Utilization warnings | Resource output | CPU or memory | Show RAM, storage, and qualitative constraints separately |
| Runtime verification | Caveats | No clear handoff | No clear handoff | No clear handoff | `docker stats` note | Generated config | No app runtime | Link to `docker stats` and app docs as next step |
| Local processing | Not prominent | Unknown | Unknown | Unknown | Explicit | Not primary | Browser calculation | Keep user inputs in browser and say so |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Should an app contribute a point value or a range? | SmartMur, SelfHost Atlas, and several competitors show one number. Stack127 already stores reviewed ranges with confidence and basis. | `content_docs/self-host-apps/schema.md`; current directory UI | Product stage must choose display and aggregation rules for range min, typical, and max. |
| Should CPU be summed per app? | SmartMur and some calculators expose per-app CPU; SelfHostPicks leaves CPU qualitative; the current Stack127 data model has no reviewed CPU field. | Current data model plus [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/) | Do not add invented CPU totals. Use host CPU as an optional user input and qualitative workload flags until a reviewed field exists. |
| How much host overhead should be reserved? | SelfHostPicks documents about 0.5 GB plus 30%; Serverkueche uses a conservative base; other tools use 10% or 15% reserve. | Competitor probes; no universal primary source | Make overhead and headroom editable and show the calculation. |
| Does user count scale RAM linearly? | Serverkueche uses S/M/L; SelfHostPicks uses a hidden or compact multiplier; Home Server Blog uses separate workload fields. | Competitor probes and app-specific documentation | Prefer explicit workload or quantity controls for apps where concurrency matters; do not hide a universal multiplier. |
| Can the planner say a host can run the selected apps? | Competitors use fit language, but runtime behavior depends on load, configuration, storage, and hardware acceleration. | [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/); [docker stats](https://docs.docker.com/reference/cli/docker/container/stats/) | Use planning language such as `within this budget` and `needs verification`, never `guaranteed`. |
| What does missing app data mean? | Competitors either omit the app or silently rely on a generic estimate. Stack127 keeps nulls and unknowns explicit. | `content_docs/self-host-apps/data-workflow.md` | Custom rows must remain usable but visibly unverified. |

## Evidence-backed opportunities

1. **A neutral app-mix planner that respects Stack127's reviewed data**: existing tools split between fixed app checklists and generic container budgets. Stack127 can combine selected app ranges, source status, and a host budget while preserving unknowns instead of guessing.
2. **A binding-resource answer against an existing host**: most app-stack tools recommend a product, while container tools assume limits are already known. Let the user enter RAM and storage budgets, then show which budget is closest and what remains.
3. **An honest estimate-to-verification handoff**: Docker's own documentation distinguishes configured constraints from observed usage. The result should say what the estimate covers and point to the app documentation and `docker stats` for the next check.
4. **Custom rows without false precision**: a user should be able to add an unlisted app, quantity, and known range or note. The row can affect a total only when the user supplies a value; otherwise it appears in the unknowns list.
5. **Visible evidence quality**: show whether an app value is an official minimum, a reviewed estimate, or unknown. This is a stronger trust signal than another opaque hardware tier.

## Table stakes

- Select several apps and adjust quantity or a workload assumption where the app supports it.
- Enter host RAM and storage budgets, with explicit OS or headroom reserve.
- Show an answer-first summary, per-app contributions, remaining budget, and the binding resource.
- Keep RAM and storage units clear and stable.
- Preserve a usable empty state and a recoverable invalid state.
- Show source or evidence status for every curated estimate.
- Keep unknown app requirements visible and provide a custom row.
- Work entirely in the browser for user-entered planning data and say so.
- State that the result is a starting estimate, not a compatibility, security, or runtime guarantee.
- Provide the next verification step without generating deployment limits by default.

## Ideas to reject

- **A universal per-app CPU table in the first release**: the current Stack127 data model does not support it, and a guessed number would look more authoritative than the evidence.
- **Automatic Docker Compose or Kubernetes limits**: limits, reservations, and runtime usage are different concepts; generated configuration would overstate what the planner knows.
- **Live host inspection or Docker socket access**: it adds privacy and security risk and conflicts with a small browser-local planning tool.
- **A provider or hardware affiliate recommendation as the headline**: it narrows a neutral capacity question into a buying funnel.
- **An exact `will run` or `safe` label**: workload spikes, acceleration, storage, and application configuration are not captured by a simple sum.
- **Huge application coverage without provenance**: broad stale lists would make missing and uncertain values harder to see.
- **A dashboard full of charts, exports, or cost estimates in the MVP**: these are secondary to the resource envelope and would delay the answer.

## Open questions and blockers

- Product planning must choose whether a range aggregates as minimum, typical, maximum, or a displayed envelope with all three.
- Product planning must decide whether the first result includes only RAM and storage, or a qualitative CPU pressure band; no reviewed CPU dataset exists today.
- Builder must define how a user-supplied custom range is labeled and kept separate from curated app facts.
- Builder must decide whether app quantity is enough for the first release or whether a small number of workload controls is needed for media, OCR, NVR, and AI apps.
- Browser QA must verify narrow layouts for the app editor, source status, long unknown-app lists, and result tables.

## Sources

- Docker resource constraints: https://docs.docker.com/engine/containers/resource_constraints/, accessed 2026-09-10. Documented hard and soft memory behavior, CPU limits and shares, and OOM risk.
- Docker container stats: https://docs.docker.com/reference/cli/docker/container/stats/, accessed 2026-09-10. Documented runtime observation fields and verification boundary.
- SelfHostPicks calculator: https://selfhostpicks.com/tools/homelab-resource-calculator/, accessed 2026-09-10. Observed app selection, RAM result, source table, workload caveats, and mobile behavior.
- The Home Server Blog calculator: https://thehomeserverblog.com/server-sizing-calculator/, accessed 2026-09-10. Observed mixed workload, storage growth, backup, and hardware inputs.
- SmartMur hardware calculator: https://smartmur.github.io/smartmur-homelab-platform/reference/hardware-calculator/, accessed 2026-09-10. Observed static service checklist and tier model.
- Serverkueche calculator: https://serverkueche.de/en/server-calculator/, accessed 2026-09-10. Observed user tiers, app selection, live recommendation, and provider coupling.
- SelfHost Atlas builder: https://selfhostatlas.com/build-your-stack, accessed 2026-09-10. Observed app categories, RAM labels, and VPS result.
- FindMeTool Docker calculator: https://findmetool.com/tools/docker-resource-calculator/, accessed 2026-09-10. Observed limits, reservations, host budget, utilization, local processing, and `docker stats` handoff.
- ioTools Docker calculator: https://iotools.cloud/tool/docker-container-resource-calculator/, accessed 2026-09-10. Observed workload preset, host inputs, empty output, and generated resource output promise.
- GlobalCalc container calculator: https://globalcalc.net/c/us/container-resources-calculator/, accessed 2026-09-10. Observed replica packing, binding resource, spare capacity, live results, and browser calculation note.
- r/docker memory and CPU constraints: https://www.reddit.com/r/docker/comments/1qk8mpj/memorycpu_constraints/, accessed 2026-09-10. Community pain evidence about soft versus hard limits and Compose configuration.
- r/HomeServer sizing discussion: https://www.reddit.com/r/HomeServer/comments/1tomzp3/foolproof_method_to_estimate_my_needs/, accessed 2026-09-10. Community demand evidence about estimating a future self-hosting workload.
- Stack127 self-host app schema: `content_docs/self-host-apps/schema.md`, inspected 2026-09-10. Documented current RAM and storage fact and planning-range model.
- Stack127 self-host app data workflow: `content_docs/self-host-apps/data-workflow.md`, inspected 2026-09-10. Documented evidence, review, null, and estimate rules.
