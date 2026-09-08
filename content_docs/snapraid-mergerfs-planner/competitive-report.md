# Competitive report: SnapRAID and mergerfs Config Planner

Status: ready
Tool: SnapRAID and mergerfs Config Planner
Route: `/snapraid-mergerfs-planner`
Researched: 2026-08-23
Direct competitors reviewed: 6
Saturation exception: yes

## Research scope

### Current stack127 state

This is a new, unpublished flat tool route. No route, engine, ownership manifest, page docs, or tests exist for `/snapraid-mergerfs-planner`. The repository already has storage tools and a storage hub, but those surfaces are outside this route's write scope. The closest existing Stack127 patterns are local, deterministic storage calculators with a pure engine, an answer-first result, a short server-rendered guide, explicit reset and share behavior, and a route-owned CSS module.

The requested job is narrower than a general NAS builder: turn a user's data-disk, parity-disk, content-file, mount-path, and mergerfs policy choices into a reviewable `snapraid.conf` and mergerfs `/etc/fstab` entry. The result must not execute commands, inspect a live host, or imply that a generated configuration proves an array is safe.

### Method and coverage

I used four search shapes for the exact tool, the underlying configuration job, specialist configuration language, and recurring setup failures. Search discovery used the web search connector because no `STACK127_SEARXNG_URL` or `SEARXNG_URL` was configured; the engine was not individually exposed. The selected visual backend was standalone Playwright CLI with Chromium 1.60.0, because the in-app Browser had no connected instance. Public pages were opened read-only at 390 x 844 and, for the direct competitor, 1280 x 900. No accounts, sensitive data, purchases, or external side effects were used.

- Search backend: web connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI
- Accessed: 2026-08-23, Asia/Kolkata

The direct competitor was operated with default, valid, and malformed data-size input where the page exposed the control. Five adjacent storage calculators were also opened and measured at the narrow viewport to test whether they solve the same configuration job or only a neighboring capacity problem.

### Search saturation evidence

- Queries tried: `SnapRAID mergerfs calculator`; `SnapRAID mergerfs configuration generator`; `SnapRAID parity data disks mergerfs mount point planner`; `SnapRAID mergerfs setup common mistakes path edge cases`; `snapraid.conf MergerFS calculator`; `SnapRAID MergerFS Calculator -diymediaserver`; `snapraid.conf generator web`; and `mergerfs snapraid config generator`.
- Repeated domains: diymediaserver.com was the only interactive SnapRAID plus mergerfs configuration calculator returned consistently. snapraid.it, mergerfs.com, trapexit.github.io, GitHub, Zack Reed, SumGuy, and community forums repeated as documentation, scripts, or troubleshooting sources rather than competing configurators.
- Exclusions: TrueNAS RAIDZ and RaidSize model block-device or RAIDZ expansion, not SnapRAID configuration. jro.io, HexOS, and Servnet model static ZFS or RAID layouts. GitHub guides and blog posts provide commands or shell helpers but no interactive planner. The SnapRAID daemon has a local Web UI for a configured daemon, not a public preflight generator. These were reviewed as adjacent evidence, not counted as direct competitors.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Generate a first config | `SnapRAID mergerfs calculator` | A valid `snapraid.conf` and mergerfs mount line from a mixed disk inventory. | One direct generator plus setup guides. |
| Size parity | `how many parity drives SnapRAID needs` | A parity count and minimum parity capacity grounded in SnapRAID's rules. | FAQ tables, calculators, and manual pages. |
| Keep parity out of the pool | `SnapRAID parity drive mergerfs glob` | A branch pattern and mount layout that cannot accidentally pool parity. | Guides and troubleshooting discussions. |
| Choose mergerfs policy | `mergerfs category.create minfreespace moveonenospc` | A conservative, explicit policy line for file placement and full-disk recovery. | MergerFS documentation and configuration examples. |
| Check an existing setup | `validate snapraid.conf mergerfs fstab` | A non-destructive review of names, paths, parity, content copies, and branches. | Manual pages and forum answers, with no focused public checker. |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| A parity mount can be swallowed by a broad mergerfs branch glob and then receive ordinary data. | [DiyMediaServer calculator](https://diymediaserver.com/page/tools/snapraid-calculator/); [Zack Reed FAQ](https://zackreed.me/posts/snapraid-and-mergerfs-faq/) | Repeated across guides and discussions | Treat parity exclusion as a structural validation error, not a prose warning. |
| Users confuse the pooled mergerfs path with the individual paths SnapRAID must read. | [SnapRAID manual](https://www.snapraid.it/manual); [OpenMediaVault discussion](https://forum.openmediavault.org/index.php?postID=346401&thread%2F47353-recovering-mergerfs-snapraid-configuration-on-new-system-help-requested%2F=) | Repeated | Generate individual `data NAME DIR` entries and a separate mergerfs branch expression. Never accept the pool mount as a SnapRAID data disk. |
| Parity sizing is easy to under-specify when data disks have mixed sizes or when more parity is planned later. | [Debian SnapRAID manpage](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html); [DiyMediaServer calculator](https://diymediaserver.com/page/tools/snapraid-calculator/) | Repeated | Show largest data capacity, total parity capacity, parity count, and the exact rule that each parity level needs. |
| Content files are required for recovery but are often treated as an afterthought. | [Debian SnapRAID manpage](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html) | Documented requirement, recurring setup omission | Make content copies an explicit inventory with one-copy-per-disk validation and a parity-count-aware minimum. |
| A copied fstab line can be syntactically plausible while its branch, target, or policy does not match the user's layout. | [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/); [Zack Reed guide](https://zackreed.me/posts/snapraid-mergerfs-on-ubuntu-24.04/) | Repeated in setup scripts and guides | Generate a readable fstab line from named branches and keep policy options separate and inspectable. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| SnapRAID parity capacity must be at least as large as the largest protected data disk, and additional parity levels are declared separately. | [Debian `snapraid(1)` configuration](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html#parity_FILE_[,FILE]_...) | Documented | The manual says the total space available for each parity level must meet the largest data disk requirement. The planner should validate each parity tier independently. |
| `content` is mandatory and can appear multiple times; at least one content copy is required for each parity disk plus one. | [Debian `snapraid(1)` content](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html#content_FILE) | Documented | The engine must reject duplicate paths and should make the minimum count visible. It must not promise recovery from a single content copy. |
| Each `data NAME DIR` name must be unique and identifies a separate filesystem mount point. | [Debian `snapraid(1)` data](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html#data_NAME_DIR) | Documented | The config uses individual branches, not the mergerfs pool mount. |
| SnapRAID parity is file-level and asynchronous; the config does not provide real-time RAID protection. | [SnapRAID manual](https://www.snapraid.it/manual) | Documented | Copy text must say the generated file needs a later `sync` and scheduled `scrub`, and that the result is not a backup. |
| MergerFS combines branch directories into one namespace, does not stripe or mirror files, and uses a placement policy for new files. | [MergerFS](https://mergerfs.com/); [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/) | Documented | The planner should generate a branch list or safe glob, a pool mount point, and explicit policies such as `category.create`, `func.getattr`, `cache.files`, and `minfreespace`. |
| MergerFS fstab syntax is branch expression, mount point, filesystem type, options, dump, and pass. | [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/) | Documented | The exact output is deterministic; paths must be escaped or rejected when they cannot be represented safely. |
| The SnapRAID daemon's Web UI edits a configured local daemon and binds to loopback by default. | [SnapRAID daemon manual](https://www.snapraid.it/manual-daemon) | Documented | It is an adjacent operational interface, not a reason to add remote APIs or host inspection to this planner. |

## Competitor reviews

### Competitor 1: DiyMediaServer SnapRAID Parity & MergerFS Pool Calculator

- URL: https://diymediaserver.com/page/tools/snapraid-calculator/
- Accessed: 2026-08-23
- Audience and promise: [Observed] A home server builder who wants parity recommendations plus ready-to-copy `snapraid.conf` and mergerfs `/etc/fstab` output.
- Inputs and defaults: [Observed] Comma or space separated data drive sizes in TB, optional parity-drive sizes, data-drive mount prefix, parity-drive mount prefix, and pool mount point. Defaults are `/mnt/pool/disk`, `/mnt/pool/parity`, and `/mnt/storage`.
- Action and state behavior: [Observed] The result updates while typing. Three copy buttons are shown for the summary, SnapRAID config, and fstab line. No explicit calculate, reset, share, or validation action was visible.
- Results and visuals: [Observed] The page shows data count, sum capacity, largest data drive, recommended parity count, shopping list, a generated config, and one generated mergerfs line. Supporting explanations call out parity exclusion and post-copy steps.
- Formula or data source: [Documented] The page says its parity bands follow the official SnapRAID FAQ guideline and that parity drives must meet the largest data drive. It treats usable data capacity as the sum of data drives. The page does not expose an exact source-precedence model for all generated options.
- Errors and edge behavior: [Observed] With `8, 8, 4, 12`, it generated four data entries, one 12 TB parity recommendation, content entries, and a branch glob. With malformed input `8, nope`, it silently reduced the inventory to one 8 TB data drive and generated a plausible one-disk config rather than showing an invalid state. Optional existing parity sizes did not visibly become a strict error state in the probe.
- Mobile and accessibility: [Observed] At 390 x 844, the page had no document overflow and the form/result fit the viewport. The drive-size input did not expose a useful accessible label in the captured control metadata. The generated code is long but wraps in the page.
- Privacy: [Unknown] No calculator-specific local-only or retention statement was observed.
- Performance: [Observed] The initial page became usable in about 2 seconds in the bounded Playwright run and result updates were immediate. This is not a benchmark.
- Search-content structure: [Observed] H1, short intro, input form, three result blocks, parity rule table, parity exclusion explanation, and after-copy checklist.
- What works: It is the only direct interactive generator found, keeps parity outside the data glob by default, and gives copyable configuration output quickly.
- What fails: Silent malformed-input reduction, no separate configuration validation state, no content-placement validation, no visible policy choice, and no distinction between an estimated recommendation and a fully checked host configuration.
- Do not copy: Silent parsing, copy-only controls without a primary validation action, default claims that sound like a complete array recommendation, and a large guide that repeats the generated output.

```text
[site header]
[SnapRAID Parity & MergerFS Pool Calculator]
[short promise]
[data sizes] [parity sizes]
[data prefix] [parity prefix] [pool mount]
[array summary] [Copy]
[snapraid.conf] [Copy]
[mergerfs fstab] [Copy]
[parity rule table]
[parity exclusion explanation]
[after-copy steps]
```

### Competitor 2: TrueNAS RAIDZ Extension Calculator (adjacent, not direct)

- URL: https://www.truenas.com/docs/references/extensioncalculator/
- Accessed: 2026-08-23 at 390 x 844
- Classification: [Observed] Adjacent, not direct. It models RAIDZ block-device expansion, not SnapRAID and mergerfs configuration.
- Controls: [Observed] The page exposes an expansion-specific calculator rather than configuration-file inputs.
- Observed: [Observed] The h1, documentation sidebar, input controls, and comparison tables loaded within the narrow viewport. Its scope is useful evidence for separating a config generator from a RAIDZ calculator.
- What works: [Observed] It states the expansion operation and exposes before/after capacity comparisons.
- What fails for this tool: [Observed] It does not generate mount or parity configuration and its invalid-width behavior is unrelated to the requested contract.

```text
[documentation shell + deep sidebar]
[RAIDZ Extension Calculator]
[inputs and calculate controls]
[all-at-once table]
[one-at-a-time table]
```

### Competitor 3: RaidSize RAIDZ Expansion Calculator (adjacent, not direct)

- URL: https://raidsize.com/tools/raidz-expansion/en
- Accessed: 2026-08-23 at 390 x 844
- Classification: [Observed] Adjacent, not direct. It estimates RAIDZ capacity after expansion.
- Controls: [Observed] The page exposes five expansion inputs and updates a capacity result rather than a filesystem configuration.
- Observed: [Observed] Live controls for RAIDZ level, drives before, drive size, drives to add, and fill percentage. The result gives usable-before, usable-right-after, native same-width capacity, a temporary gap, and a verdict. The page had no horizontal overflow at the captured viewport.
- What works: [Observed] The answer hierarchy is fast to scan and the result distinguishes immediate from native capacity.
- What fails for this tool: [Inferred] It does not know mount paths, parity files, content copies, mergerfs policies, or generated configuration syntax.

```text
[RAIDZ Expansion Calculator]
[level] [drives before] [drive size]
[drives to add] [fill]
[before] [right after] [native] [gap]
[verdict]
[formula trace]
```

### Competitor 4: jro.io OpenZFS Capacity Calculator (adjacent, not direct)

- URL: https://jro.io/capacity/
- Accessed: 2026-08-23 at 390 x 844
- Classification: [Observed] Adjacent, not direct. It is a broad OpenZFS layout calculator.
- Controls: [Observed] The page exposes disk inventory, vdev, recordsize, ashift, slop, reservation, and display controls.
- Observed: [Observed] Many disk, vdev, recordsize, ashift, swap, slop, reservation, and display controls loaded, but the document scroll width was 1200 CSS pixels at a 390-pixel viewport. The page has no SnapRAID or mergerfs config output.
- What works: [Observed] It exposes technical assumptions and an audit-friendly result matrix.
- What fails for this tool: [Inferred] The spreadsheet surface is much broader than a config task and is not usable as a narrow-screen model for generated text.

```text
[global disk controls]
[new vdev controls]
[recordsize] [ashift] [swap] [slop]
[many wide capacity matrices ---------------->]
```

### Competitor 5: HexOS / TrueNAS Pool Planner (adjacent, not direct)

- URL: https://hexoscalculator.com/
- Accessed: 2026-08-23 at 390 x 844
- Classification: [Observed] Adjacent, not direct. It estimates static ZFS pool capacity.
- Controls: [Observed] The page exposes pool layout, vdev count, width, drive sizes, and advanced ZFS accounting choices.
- Observed: [Observed] A responsive form offers layout, units, vdev count, drive width, mixed-width, accounting, recordsize, ashift, swap, slop, reserve, and per-drive sizes. The viewport fit at 390 pixels, but the surface includes recommendations and dRAID controls outside the requested job.
- What works: [Observed] It separates a main pool builder from advanced modes and states that the estimate is geometry-based.
- What fails for this tool: [Inferred] It does not generate SnapRAID or mergerfs configuration and mixes product recommendations into the storage result.

```text
[pool builder]
[layout] [units] [vdev count] [width]
[advanced ZFS controls]
[per-drive inventory]
[summary + recommendations]
```

### Competitor 6: Servnet ZFS / RAIDZ Capacity Calculator (adjacent, not direct)

- URL: https://www.servnetuk.com/zfs-raidz-calculator
- Accessed: 2026-08-23 at 390 x 844
- Classification: [Observed] Adjacent, not direct. It models ZFS and RAID layouts, not a SnapRAID and mergerfs config.
- Controls: [Observed] The page exposes RAID choices, vdev count, drive width, and capacity inputs rather than path configuration.
- Observed: [Observed] The page loaded with an explicit multi-step form, many RAID choices, drive controls, capacity summaries, and charts. The document fit within the narrow viewport.
- What works: [Observed] It makes the setup sequence and result hierarchy explicit.
- What fails for this tool: [Inferred] Its many RAID and performance branches would obscure a smaller config contract, and it has no `snapraid.conf` or mergerfs output.

```text
[choose RAID level]
[configure vdevs and drives]
[capacity and risk results]
[charts and explanations]
```

## Comparison matrix

| Capability | DiyMediaServer direct generator | Guides and shell helpers | Adjacent ZFS calculators | Stack127 opportunity |
| --- | --- | --- | --- | --- |
| Mixed data-disk inventory | Comma-separated sizes | Manual or host-specific | Usually static RAID layout | Named drive rows with explicit path ownership and deterministic parsing |
| Parity count and size | Recommends count and largest-size target | Explained in prose | RAIDZ parity, not SnapRAID | Validate each parity tier and show the exact rule |
| SnapRAID config | Generates basic `snapraid.conf` | Examples only | None | Generate with unique data names, content copies, excludes, blocksize, and clearly labeled assumptions |
| MergerFS fstab | Generates one default line | Examples or scripts | None | Generate branch expression, pool target, and selected policy options separately |
| Parity exclusion | Default prefix convention and explanation | Warned in guides | Not applicable | Structural error if parity can match a branch expression or pool target |
| Content files | Generates repeated defaults | Manual instructions | Not applicable | Explicit content inventory with parity-aware minimum and unique physical paths |
| Validation and recovery | Malformed input silently narrows | User must inspect | Varies | Invalid state clears output, preserves input, and gives a concrete recovery path |
| Policy transparency | Fixed defaults | Depends on example | Not applicable | Show why `category.create`, `func.getattr`, `cache.files`, and `minfreespace` are in the line |
| Privacy and side effects | Not stated; copy output only | Manual commands may be run | Usually local calculation | State that the planner runs locally, emits text only, and never touches a host |
| Narrow-screen behavior | No page overflow at 390 px | Not applicable | jro overflowed; others fit | Keep inventory rows and code blocks within the workbench with measured long-output behavior |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| How many parity drives should be proposed? | DiyMediaServer uses a banded FAQ guideline. Users may prefer explicit parity count rather than a recommendation. | [DiyMediaServer](https://diymediaserver.com/page/tools/snapraid-calculator/); [SnapRAID manual](https://www.snapraid.it/manual) | No. Product should expose the count as an editable input or a clearly labeled recommendation, never claim universal safety. |
| How large must parity be? | Tools use the largest data disk as the minimum; real parity space can be split across multiple files. | [Debian manpage](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html) | No. Validate total capacity for each tier and disclose unused or insufficient space. |
| How many content copies are enough? | The manual requires at least one per parity disk plus one; guides often show extra copies without a count rule. | [Debian manpage](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html) | No. Use the documented minimum as a warning or invalid state, while allowing more copies. |
| Which mergerfs policy is correct? | Examples vary between `pfrd`, `mfs`, `epmfs`, `mspmfs`, cache settings, and `minfreespace` values. | [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/); [mergerfs site](https://mergerfs.com/) | Yes, but product can resolve it by offering a small documented policy preset set instead of pretending one policy is universally correct. |
| Should the planner use a glob or explicit branch list? | Guides use both. A glob is shorter but can catch parity or unrelated paths; explicit lists are verbose but auditable. | [DiyMediaServer](https://diymediaserver.com/page/tools/snapraid-calculator/); [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/) | Product decision: default to explicit branches for safety and offer a carefully checked glob only as an advanced option, if it earns its complexity. |
| Should the result include commands? | Guides show commands, while a planner can produce copyable config text. | [SnapRAID manual](https://www.snapraid.it/manual); [Zack Reed guide](https://zackreed.me/posts/snapraid-mergerfs-on-ubuntu-24.04/) | No. Output config and a short verification checklist; never execute or include a destructive command. |

## Evidence-backed opportunities

1. **Make the configuration boundary visible**: a direct competitor produces output but silently accepts malformed inventory input. A reviewable planner can keep data, parity, content, branch, and pool paths as separate typed inputs and refuse to emit plausible config when those sets overlap.
2. **Generate both files from one named inventory**: guides make users duplicate paths between `snapraid.conf` and `/etc/fstab`. One deterministic inventory can generate unique SnapRAID names, explicit mergerfs branches, and a parity-exclusion check together.
3. **Turn policy into a small, inspectable choice**: mergerfs policies change placement behavior. A focused preset plus an exact rendered option list is more useful than a fixed string or an unbounded option editor.
4. **Offer a configuration review, not a safety verdict**: show parity sufficiency, content-copy count, duplicate paths, branch overlap, invalid mount-point relationships, and required real-host checks. The tool can be trusted because it says what it cannot inspect.
5. **Keep generated text answer-first**: use one compact summary, then two copyable code blocks with line numbers or labels, followed by one short verification table. No long dashboard of unrelated NAS recommendations.

## Table stakes

- Accept a mixed list of data-drive mount points or a repeatable path prefix, plus data capacity when parity sizing is requested.
- Support one or more parity levels and validate each parity tier against the largest data drive.
- Generate `parity`, `content`, `data`, and exclusion lines with stable ordering.
- Generate a mergerfs fstab line with branches, pool mount, filesystem type, and selected options.
- Keep parity and content paths out of mergerfs branches by construction or reject them.
- Validate unique names, nonempty absolute paths, path overlap, and safe option syntax.
- Show warnings for facts that require host verification, such as mounted filesystems, UUIDs, permissions, systemd ordering, installed versions, and backup status.
- Provide copy feedback, reset, explicit validation, keyboard submission, and no automatic URL serialization.

## Ideas to reject

- **Execute `mount`, `snapraid sync`, or any shell command**: it creates an external side effect and cannot be justified by browser-only input.
- **Inspect a real host over SSH or the SnapRAID daemon API**: it expands scope into network access, credentials, and a safety claim.
- **Claim a universal “best” parity count or mergerfs policy**: workload, number of data disks, recovery goals, and filesystem versions change the decision.
- **Treat mergerfs as redundancy**: it pools files and does not replace SnapRAID parity or a backup.
- **Accept the pool mount as a SnapRAID data path**: it hides branch identity and can make the generated array incorrect.
- **Silently drop invalid drive tokens or clamp paths**: the direct competitor's malformed-input behavior is a trust failure.
- **Add unrelated performance, IOPS, rebuild-time, or drive-buying recommendations**: they are not required to generate or review these two config files.
- **Default to a broad glob that can include parity**: a short line is not worth a configuration footgun.

## Open questions and blockers

- No research blocker remains. The direct category is narrow and has one operated public generator; the saturation exception is supported by the recorded queries, repeated domains, five operated adjacent calculators, and exclusions above.
- The product stage must choose whether capacity is required for parity validation, or whether the first version accepts explicit parity paths and validates only path/configuration relationships. This is a product decision, not a formula gap.
- The product stage must choose a small mergerfs policy preset set and the exact default. The official docs establish syntax and behavior but do not name one universal policy.

## Sources

- [SnapRAID CLI manual](https://www.snapraid.it/manual), accessed 2026-08-23. Pooling relationship, parity workflow, and asynchronous protection boundary.
- [Debian `snapraid(1)` manpage](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html), accessed 2026-08-23. Parity, content, data, blocksize, and path semantics.
- [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/), accessed 2026-08-23. Branch syntax, fstab shape, and policy options.
- [MergerFS official site](https://mergerfs.com/), accessed 2026-08-23. Whole-file union behavior and the distinction from RAID.
- [SnapRAID daemon manual](https://www.snapraid.it/manual-daemon), accessed 2026-08-23. Local Web UI and daemon boundary.
- [DiyMediaServer calculator](https://diymediaserver.com/page/tools/snapraid-calculator/), accessed 2026-08-23. Direct competitor controls, output, and malformed-input observation.
- [DoTheEvo NAS MergerFS SnapRAID guide](https://github.com/DoTheEvo/NAS-MergerFS-SnapRAID), accessed 2026-08-23. Static setup and fstab generation pattern.
- [Zack Reed SnapRAID plus mergerfs guide](https://zackreed.me/posts/snapraid-mergerfs-on-ubuntu-24.04/), accessed 2026-08-23. Host-side fstab helper and operational verification steps.
