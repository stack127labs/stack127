# stack127 Storage Tools Roadmap

Date: 2026-08-01
Status: shared foundation and first three tools complete; the hub and those three tools were approved and published on 2026-08-09, and every later tool stays unpublished until it earns its own approval
Collection route: `/storage-tools`
Publication rule: keep each route unpublished until that page passes its own launch checks and receives explicit approval

This document is the control plan for the stack127 storage-tools project. We build and validate one item at a time in the order below. A ready tool can publish independently without waiting for the collection or the remaining roadmap.

The original proposal was useful, but its 17-item list contained overlapping products, claims that were too confident, and a few technically incorrect assumptions. The approved scope is 12 public tools supported by one shared calculation engine and one unpublished hub during development. Features that belong inside another tool are merged instead of receiving thin standalone pages.

## How to use this roadmap

- The first unchecked top-level item is the next item to build.
- A tool is not complete merely because its interface renders. Its calculations, invalid states, explanations, fixtures, URL state, accessibility, and page-specific tests must all pass.
- Before implementing any route, create `content_docs/<page-slug>/brief.md` and follow the visual-first and test-driven page workflows.
- Keep each route out of `public.stack127_pages` until its own publication step. Code existing in the repository does not authorize production publication.
- Record any material scope or formula decision in the decision log at the end of this document.
- Unknown or estimated results must remain visibly unknown or estimated. Do not manufacture precision to make a result look complete.

## Approved project checklist

- [x] Foundation: shared storage calculation engine
- [x] Tool 1: RAID Capacity and Level Explorer
- [x] Tool 2: ZFS Pool Capacity Calculator
- [x] Tool 3: ZFS Block Size and Padding Calculator
- [ ] Tool 4: RAIDZ Expansion Planner
- [ ] Tool 5: Synology SHR Capacity Calculator
- [ ] Tool 6: Unraid Main Array Calculator
- [ ] Tool 7: SnapRAID and mergerfs Config Planner
- [ ] Tool 8: Drive Reliability Explorer
- [ ] Tool 9: Rebuild Window and Read-Error Exposure Calculator
- [ ] Tool 10: Ceph Capacity and Failure-Domain Planner
- [ ] Tool 11: Storage Growth and TCO Planner
- [ ] Tool 12: Storage Layout Advisor
- [ ] Collection consistency gate: all shared validation and cross-tool checks pass
- [x] Publication round 1: the `/storage-tools` hub, RAID calculator, ZFS capacity calculator, and ZFS padding calculator published on 2026-08-09 through `supabase/migrations/20260809140000_publish_storage_tools.sql`
- [ ] Publication: approve each remaining ready tool independently

## Product structure

Use `/storage-tools`, not `/raid-tools`, as the collection route. The project includes ZFS, Synology SHR, Unraid, SnapRAID, mergerfs, Ceph, reliability data, and lifecycle planning, so “RAID tools” would be too narrow. Its tools keep flat canonical routes and may also appear in other collections.

The planned public routes are:

| Order | Tool | Proposed route |
| ---: | --- | --- |
| 1 | RAID Capacity and Level Explorer | `/raid-calculator` |
| 2 | ZFS Pool Capacity Calculator | `/zfs-capacity-calculator` |
| 3 | ZFS Block Size and Padding Calculator | `/zfs-padding-calculator` |
| 4 | RAIDZ Expansion Planner | `/raidz-expansion-planner` |
| 5 | Synology SHR Capacity Calculator | `/shr-calculator` |
| 6 | Unraid Main Array Calculator | `/unraid-calculator` |
| 7 | SnapRAID and mergerfs Config Planner | `/snapraid-mergerfs-planner` |
| 8 | Drive Reliability Explorer | `/drive-reliability` |
| 9 | Rebuild Window and Read-Error Exposure Calculator | `/rebuild-calculator` |
| 10 | Ceph Capacity and Failure-Domain Planner | `/ceph-capacity-calculator` |
| 11 | Storage Growth and TCO Planner | `/storage-growth-planner` |
| 12 | Storage Layout Advisor | `/storage-layout-advisor` |

Route names are proposals until each page brief is approved. Once a route is implemented, keep its URL stable.

## Shared product and calculation rules

Every tool must follow these rules:

- Use integer byte arithmetic, preferably `BigInt`, for capacity calculations. Convert units only for display.
- Offer decimal TB and binary TiB consistently across the suite. TB/TiB is a shared control, not a separate calculator page.
- Preserve inputs in a versioned URL state when the state is safe and reasonably sized.
- Give the answer first, followed by an exact breakdown, topology or timeline where useful, assumptions, derivation, and sources.
- Label every output as theoretical, filesystem-adjusted, observed, or estimated. These categories must not be blended.
- Return structured values, invalid-configuration reasons, assumptions, source/version information, and uncertainty from the engine. The page must not reverse-engineer meaning from formatted strings.
- Use tables for repeated exact facts and clean charts for quantitative comparisons or changes over time. Use an exact topology diagram where layout affects the answer.
- Do not use marker art to communicate exact capacity, risk, benchmark, or comparison values. One marker-art figure on the hub may explain that redundancy is not backup, because that is a concept rather than a measurement.
- Export JSON or Markdown only when the result is genuinely useful outside the page. Do not add file uploads without a demonstrated need.
- Keep assumptions visible beside the affected result. Do not bury material limitations in an oversized caveat section.
- Say that RAID and parity are not backups wherever a result could otherwise imply protection from deletion, corruption, theft, fire, or multiple failures outside the modeled fault domain.
- Do not use opaque health scores, risk scores, “best” badges, or false guarantees.

## Foundation: shared storage calculation engine

- [x] Build and validate the shared storage calculation engine before any public tool.

The shared engine prevents each page from inventing its own drive model, units, rounding, or interpretation of usable space.

### Required model

- A common drive inventory with stable IDs, capacity in bytes, role, optional path, and optional cost and power fields.
- Pure TypeScript calculation functions with no UI, database, or browser dependencies.
- Versioned calculation adapters so a changed formula cannot silently reinterpret an old shared URL.
- Structured results containing values, status, invalid states, assumptions, derivation steps, source/version references, and uncertainty.
- Shared formatters for bytes, TB, TiB, percentages, durations, rates, and ranges.
- Shared concepts for raw capacity, encoded capacity, parity, padding, reserved space, writable estimate, unavailable capacity, and operational target.
- A fixtures library that can be consumed by every tool and by cross-tool consistency tests.

### Foundation completion gate

- Property tests cover zero, minimum, maximum supported, equal-size, mixed-size, duplicate, and invalid inventories.
- Capacity cannot become negative, exceed the physically available input without an explicitly labeled compression scenario, or change when drives are only reordered.
- The same inventory and equivalent topology produce the same raw-byte total in every adapter.
- Unit switching changes presentation, never the underlying byte result.
- Formula versions and uncertainty labels survive serialization and URL restoration.
- The engine has no publication, analytics, or production-data dependency.

Completed on 2026-08-01. The version 1 contract, implementation, documentation, shared fixtures, and automated tests live in `lib/storage/`, `content_docs/storage-tools/calculation-engine.md`, and `tests/pages/storage-tools/shared/storage-engine.test.mjs`. No route or publication row was created.

## Tool 1: RAID Capacity and Level Explorer

- [x] Build and validate the RAID Capacity and Level Explorer.

The page answers: What capacity and basic failure tolerance does this exact conventional RAID layout provide, and which RAID levels are valid for these drives?

### Inputs and outputs

- Accept an explicit drive inventory rather than only a drive count and one uniform size.
- Support RAID 0, RAID 1, RAID 5, RAID 6, conventional RAID 10, RAID 50, RAID 60, linear, and JBOD.
- Require explicit mirror, RAID 50, and RAID 60 group structure where grouping changes the answer.
- Show theoretical usable capacity, parity or mirror overhead, capacity stranded by mixed drive sizes, minimum drive count, and invalid layouts.
- Explain tolerated failures in topology-aware language. For RAID 10, 50, and 60, do not reduce tolerance to a single misleading number.
- Include a compact write-penalty reference as an architectural explanation, not a performance prediction.
- Optionally produce a conservative `mdadm` command template only after the page can validate device count and topology. The template must use placeholders and require review.

### Scope boundaries

- Do not claim that theoretical array capacity is the final filesystem-usable capacity.
- Do not estimate IOPS or throughput from drive count alone.
- Do not include proprietary SHR behavior, ZFS RAIDZ allocation, Unraid parity, or distributed erasure coding here.
- The RAID comparison reference belongs within this page and the hub. It is not another standalone calculator.

### Completion gate

- Formula fixtures cover every level, minimum counts, mixed sizes, group boundaries, and invalid configurations.
- Linux mdraid sparse-file or loop-device fixtures verify representative layouts where local test infrastructure permits.
- RAID 10, 50, and 60 results state the exact grouping assumptions.
- Results reconcile with the shared engine and use the suite-wide TB/TiB controls.

Completed on 2026-08-01. The unpublished hub and flat RAID page, version 1 exact-byte adapter, formula contract, ownership manifests, guarded local preview workflow, and page-specific tests now live under `app/(site)/storage-tools/`, `app/(site)/(tools)/raid-calculator/`, `lib/storage/raid.ts`, `content_docs/raid-calculator/`, `scripts/storage-tools/`, and `tests/pages/raid-calculator/`. Formula, invariant, URL-state, type, static-policy, production-registry, responsive, accessibility, interaction, and production-build checks pass. A live mdraid loop-device comparison remains part of this page's publication gate because the available environment did not permit a privileged disposable Linux fixture. No production publication row or migration was created.

## Tool 2: ZFS Pool Capacity Calculator

- [ ] Build and validate the ZFS Pool Capacity Calculator.

The page answers: How is capacity allocated in this proposed ZFS pool, and how much space is likely to remain writable after parity, padding, ZFS overhead, and the user’s reserve?

### Inputs and outputs

- Support multiple top-level vdevs made from mirrors, RAIDZ1, RAIDZ2, or RAIDZ3.
- Model data drives, hot spares, SLOG, L2ARC, and special vdevs as distinct roles.
- Accept `ashift`, `recordsize`, optional `volblocksize`, and a user reserve target.
- Allow compression only as a separately labeled scenario. It must never inflate the physical-capacity result.
- Separate raw capacity, parity and mirror allocation, padding estimate, ZFS slop/reservation behavior, user reserve, and estimated writable capacity.
- Show the complete topology and a per-vdev breakdown before the pool total.
- Optionally generate a conservative `zpool create` template using `/dev/disk/by-id/` placeholders and an explicit review warning.

### Scope boundaries and cautions

- SLOG and L2ARC do not add ordinary pool capacity.
- A special vdev is permanent pool storage and needs suitable redundancy; it is not a disposable cache.
- “Usable” cannot be exact for an arbitrary future workload. Record size, compression, allocation classes, quotas, snapshots, metadata, fragmentation, and workload shape affect observed results.
- Do not promise exact future `zpool list`, `zfs list`, quota, or application-visible values.
- Mixed top-level vdev performance and fault behavior need explanation even when a raw capacity total is arithmetically valid.

### Completion gate

- Fixtures cover mirrors, RAIDZ1/2/3, multiple vdevs, mixed sizes, roles, ashift values, record sizes, zvols, and invalid topologies.
- Representative sparse pools are compared with supported OpenZFS 2.3 and 2.4 environments.
- Generated command templates are topology-correct and never place SLOG, L2ARC, or special devices into the wrong class.
- Every estimated value names the variables that prevent it from being exact.

## Tool 3: ZFS Block Size and Padding Calculator

- [ ] Build and validate the ZFS Block Size and Padding Calculator.

The page answers: How much physical space can this logical block consume on this RAIDZ layout, and how do parity and padding change across block sizes?

### Inputs and outputs

- Accept RAIDZ width, parity level, `ashift`, logical block size, `recordsize` or `volblocksize`, and an optional compression ratio scenario.
- Show physical allocation per block with data, parity, and padding separated.
- Plot a clean comparison across nearby block sizes so discontinuities are visible.
- Explain the difference between a record, a zvol block, an on-disk sector, and a full-pool estimate.
- Link compatible inputs to the ZFS Pool Capacity Calculator.

### Scope boundaries

- Do not claim one block size is universally optimal.
- Do not convert a per-block allocation result into an exact whole-pool forecast without a workload distribution.
- Do not hide padding inside a generic overhead percentage.

### Completion gate

- Calculations match documented RAIDZ allocation behavior for supported widths and ashift values.
- Boundary tests cover small blocks, large records, parity changes, and blocks that produce padding.
- The chart and table show identical source values and remain understandable without color.

## Tool 4: RAIDZ Expansion Planner

- [ ] Build and validate the RAIDZ Expansion Planner.

The page answers: What changes immediately and over time when a disk is added to an existing RAIDZ vdev?

### Inputs and outputs

- Accept existing width, parity level, drive sizes, allocated data, proposed added drive, and optional rewrite assumptions.
- Require an OpenZFS 2.3-or-newer compatibility acknowledgement.
- Show old width, new width, parity count, newly available capacity, and the distinction between old and newly allocated blocks.
- Provide immediate and eventual rewritten scenarios without pretending all data is redistributed at attach time.
- Accept a user-provided throughput range for a duration scenario instead of inventing a device benchmark.
- Explain that adding a drive does not increase the RAIDZ parity level.

### Scope boundaries and correction

- RAIDZ expansion shipped in OpenZFS 2.3, not 2.2.
- Expansion reads allocated space and changes the physical distribution of data. Existing blocks retain their prior data-to-parity ratio until rewritten.
- Do not provide an exact completion time without observed throughput and allocated-space inputs.
- Do not describe expansion as equivalent to rebuilding a new vdev from scratch.

### Completion gate

- Tests cover RAIDZ1/2/3 widths, minimum and invalid widths, mixed-size warnings, empty and populated pools, and rewrite scenarios.
- Sparse-pool fixtures validate representative expansion behavior in a supported OpenZFS test environment.
- OpenZFS version behavior is cited and the page fails safely for unsupported versions.

## Tool 5: Synology SHR Capacity Calculator

- [ ] Build and validate the Synology SHR Capacity Calculator.

The page answers: How much capacity should this mix of drives provide under SHR or SHR-2, and why can the result differ from conventional RAID 5 or RAID 6?

### Inputs and outputs

- Accept an explicit mixed-size drive inventory and SHR-1 or SHR-2.
- Show the internal capacity tiers used by the estimate so the result is inspectable.
- Separate array-level capacity from Synology’s per-drive system reserve and filesystem estimate.
- Present Btrfs and ext4 filesystem adjustments separately when the applicable official guidance supports them.
- Compare the same drives with conventional RAID 5 or RAID 6 without implying that either comparison is universally preferable.
- Apply model-specific drive-count or volume constraints only when backed by a maintained official source.

### Scope boundaries and cautions

- Synology documents roughly 10 GB reserved per drive, followed by filesystem-related reductions that can be up to about 4% for Btrfs and about 2% for ext4. These are estimates, not permission to fake an exact UI value.
- The example inventory 2 TB + 3 TB + 4 TB + 4 TB under SHR-1 is expected to be around 8.18 TiB before scenario-specific adjustments and must become a regression fixture.
- Synology’s complete proprietary implementation is not documented as a public algorithm. The tool must describe itself as a documented-behavior estimate and test against the official calculator.

### Completion gate

- A broad set of equal-size and mixed-size fixtures is compared with the official Synology RAID Calculator.
- SHR-1, SHR-2, invalid drive counts, reserve behavior, and filesystem estimates are independently testable.
- Any known mismatch with the official calculator is visible and blocks completion until explained.

## Tool 6: Unraid Main Array Calculator

- [ ] Build and validate the Unraid Main Array Calculator.

The page answers: How much usable capacity does this Unraid main array provide, and what must change before another drive can be added?

### Inputs and outputs

- Accept mixed-size data drives and zero, one, or two parity drives.
- Validate that every parity drive is at least as large as the largest data drive.
- Show data capacity, parity capacity, invalid assignments, and the capacity gained by adding a proposed data drive.
- Show the dependency chain when the proposed drive first requires a larger parity drive.
- Explain the protection implications of zero, one, and two parity drives without calling parity a backup.

### Scope boundaries

- Cover the Unraid main array only.
- Keep ZFS pools, Btrfs cache pools, application data placement, and cache-mover behavior outside the capacity formula. Link to separate explanations where useful.
- Do not model speed from disk count or assume every file is spread across drives.

### Completion gate

- Official Unraid rules are represented as fixtures for mixed drives, parity upgrades, additions, and invalid layouts.
- Results remain correct when drives are reordered or role assignments change.
- The page clearly distinguishes main-array capacity from pools and caches.

## Tool 7: SnapRAID and mergerfs Config Planner

- [ ] Build and validate the SnapRAID and mergerfs Config Planner.

The page answers: How should these disks, mount points, parity files, content files, exclusions, mergerfs policies, and maintenance schedules be expressed as a reviewable configuration?

### Inputs and outputs

- Accept disks, stable mount paths, data and parity roles, content-file placement, exclusions, block size, hash choice, sync schedule, scrub schedule and percentage, mergerfs branches, create policy, search policy, and minimum free-space value.
- Validate parity-drive sizing and explain file-count or block-size constraints that can affect SnapRAID metadata and configuration.
- Generate a reviewable `snapraid.conf` and `/etc/fstab` mergerfs entry.
- Generate systemd service/timer examples as the primary scheduling output, with cron as a secondary option.
- Explain why scheduled parity snapshots are not continuous real-time protection.
- Version generated syntax and defaults against the SnapRAID and mergerfs documentation used by the planner.

### Scope boundaries and corrections

- This is not the first configuration generator in the market. DiyMediaServer already provides adjacent guidance and output. The stack127 advantage must be validation, current-version awareness, clear tradeoffs, and safe generated examples.
- mergerfs currently documents `pfrd` as a default create policy, but there is no universally best policy. Inputs and explanations must reflect workload intent.
- Do not execute commands, mount filesystems, overwrite user files, or suggest destructive sync operations.
- Do not add a universal standalone scrub planner. Scrub scheduling belongs here and in the relevant ZFS guidance because the right policy is technology- and workload-dependent.

### Completion gate

- Generated configuration parses with the supported SnapRAID version and representative mergerfs mount options.
- A throwaway mount environment verifies path escaping, branch ordering, minimum-free-space behavior, and failure messages.
- Tests cover multiple parity files, content-file placement, excluded content, paths with spaces, invalid role combinations, and scheduling output.
- Generated files contain prominent review instructions and no environment-specific device guesswork.

## Tool 8: Drive Reliability Explorer

- [ ] Build and validate the Drive Reliability Explorer.

The page answers: What does the published Backblaze fleet data report for this drive model or cohort, and how strong is the evidence?

### Data pipeline and interface

- Build a quarterly extraction pipeline that produces a small, repository-owned static snapshot from Backblaze’s published dataset.
- Preserve model, manufacturer, capacity, period, drive days, failures, annualized failure rate, cohort age where available, inclusion rules, and an approximate uncertainty interval.
- Keep quarterly, annual, and lifetime views separate.
- Allow filtering and comparison while keeping drive count and drive days visible beside AFR.
- Show that a zero-failure observation is not proof of zero risk.
- Link a selected model to the rebuild-exposure scenario without presenting Backblaze AFR as a home-NAS prediction.

### Scope boundaries and data responsibility

- Backblaze’s Q1 2026 fleet total of 341,263 drives is a useful source check, but every imported period must reconcile against its own published totals.
- Backblaze permits derived use with attribution and responsibility for the resulting analysis; the project must not resell or republish the raw dataset as its own product.
- The population is a data-center fleet. Model, workload, age, environment, firmware, purchase channel, and cohort selection limit transfer to a home NAS.
- Do not rank a universal “best drive,” create a reliability score, or treat AFR as the probability that one specific drive will fail next year.
- A separate SMR checker is excluded from the initial suite because per-model classification requires continuous maintenance and partial coverage could mislead users. Verified recording-technology facts may be displayed here when an authoritative model-level source exists.

### Completion gate

- Imported drive days, failures, counts, and period totals reconcile with source files and published summaries.
- Inclusion thresholds and derived formulas are documented and tested.
- Every chart exposes cohort size and period and avoids comparing incompatible annual, quarterly, and lifetime metrics.
- The generated static snapshot is small, reproducible, attributed, and safe to commit.

## Tool 9: Rebuild Window and Read-Error Exposure Calculator

- [ ] Build and validate the Rebuild Window and Read-Error Exposure Calculator.

The page answers: How long could this rebuild take, how much data must be read, and what error or independent-drive-failure exposure exists during that window under the stated assumptions?

### Inputs and outputs

- Accept layout, drive sizes, bytes that must be read or reconstructed, observed throughput range, utilization where relevant, replacement or hot-spare delay, a user-selected URE-rate scenario, and an optional independent second-drive AFR scenario.
- Show rebuild duration as a range, total bytes read, probability of encountering at least one URE under the selected independent-bit model, independent second-drive failure scenario, and remaining topology margin.
- Keep the URE encounter calculation and the independent second-drive scenario separate.
- Explain which failures the current layout can still tolerate and which combinations would exceed its redundancy.

### Scope boundaries and corrections

- Rename the proposed “rebuild risk calculator” because it cannot responsibly calculate one universal probability of data loss.
- The familiar URE formula estimates an encounter probability under strong independence and vendor-rate assumptions. A URE encounter is not automatically data loss, especially in a double-parity layout.
- Do not combine unlike probabilities into an opaque risk score.
- Do not publish a five-year probability of data loss or definitive MTTDL from sparse consumer inputs.
- Do not imply novelty: RAIDSize and ThisCalc already publish rebuild-oriented calculators. The value must be topology clarity, transparent assumptions, ranges, and careful interpretation.

### Completion gate

- Probability calculations are independently reviewed and tested at boundary values.
- Layout-specific read-volume and remaining-margin fixtures cover RAID 1/5/6/10 and compatible shared-engine topologies.
- Every scenario labels independence, rate, and throughput assumptions next to the number.
- The page never converts URE encounter probability into a data-loss claim.

## Tool 10: Ceph Capacity and Failure-Domain Planner

- [ ] Build and validate the Ceph Capacity and Failure-Domain Planner.

The page answers: Does this Ceph replicated or erasure-coded layout fit the available OSDs and failure domains, and what raw and operational capacity should be expected?

### Inputs and outputs

- Accept hosts, racks or zones, OSD inventories and sizes, replicated copy count or erasure-code `k+m`, CRUSH failure domain, and near-full or operational reserve targets.
- Show raw capacity, encoded capacity, operational target, placement requirements, nominal tolerated loss, and impossible placement states.
- Explain why a mathematically sufficient number of OSDs may still be an invalid failure-domain layout.
- Optionally generate conservative, reviewable Ceph profile or pool command examples after validation.
- Recommend capacity headroom and failure-domain distribution without pretending a calculator replaces a CRUSH simulation.

### Scope boundaries and corrections

- Narrow this tool to Ceph. A generic erasure-coding formula is not a trustworthy calculator for Ceph, MinIO, Garage, and SeaweedFS because their placement, replication, shard, and operational rules differ.
- Ceph generally needs at least `k+m` distinct placement targets for a `k+m` profile and recommends additional room such as `k+m+1` for operational safety, subject to the selected failure domain and cluster design.
- Garage uses replication-factor concepts, and SeaweedFS documents modes such as warm-storage 10+4; neither should be represented by a Ceph form.
- The MinIO community repository was archived in April 2026. Do not make it a new maintained calculator target without a separate product decision and current authoritative requirements.

### Completion gate

- Fixtures cover replication and erasure coding across host, rack, and zone failure domains, including impossible placements.
- Representative profiles are checked with `crushtool` or a disposable Ceph test cluster.
- The UI separates mathematical encoding overhead from operational headroom and placement validity.
- Generated commands are optional, versioned, and never presented as production-ready without review.

## Tool 11: Storage Growth and TCO Planner

- [ ] Build and validate the Storage Growth and TCO Planner.

The page answers: How will usable capacity, bay consumption, replacement dependencies, power use, and cumulative cost change under this storage expansion plan?

### Inputs and outputs

- Accept a current layout from a compatible calculator or a manual inventory.
- Accept dated drive additions, replacements, parity upgrades, chassis or HBA purchases, electricity assumptions, drive power assumptions, and optional adapters or expansion hardware.
- Show a dated capacity and cumulative-cost timeline.
- Calculate usable TiB-years as a planning measure with the formula and limitations exposed.
- Flag bay exhaustion, parity-size dependencies, unsupported transitions, and expensive dead ends.
- Allow an optional manual cloud-storage comparison using user-entered rates, retrieval, operation, and egress assumptions.

### Scope boundaries and corrections

- Merge the proposed standalone TCO calculator into this growth planner. Cost without a dated topology plan is too thin to justify a separate product.
- Do not maintain a global live cloud-pricing database in the first version. Prices, tiers, minimums, retrieval costs, operation charges, taxes, and regions change too frequently.
- Do not label the cheapest scenario as the best scenario. Availability, recovery work, backup, lock-in, and operator time are not reducible to one price.
- Existing RAID expansion calculators mean the product cannot claim that expansion planning is absent from the market. Cross-technology, cost-over-time planning remains useful.

### Completion gate

- Timeline math is invariant under display-unit changes and correctly handles additions, replacements, role changes, and one-time costs.
- Every cost is traceable to a user input or a dated, cited default.
- Cross-tool imports preserve inventory and topology without silently changing a calculation version.
- Dead-end warnings are deterministic and explain the exact limiting bay, parity, topology, or hardware assumption.

## Tool 12: Storage Layout Advisor

- [ ] Build and validate the Storage Layout Advisor last.

The page answers: Which two or three supported storage layouts best fit these stated constraints, and what tradeoffs remain for the user to decide?

### Inputs and outputs

- Accept current drives, bay limits, expected growth, real-time versus scheduled protection, workload shape, license tolerance, lock-in tolerance, checksum and snapshot needs, individual-disk access, spindown goals, recovery skill, and backup posture.
- Reuse the completed calculators and validation rules. Do not recreate capacity or topology formulas in the advisor.
- Return a transparent shortlist table with reasons for inclusion, disqualifying constraints, estimated capacity, growth path, operational tradeoffs, and links to the exact prefilled calculators.
- Allow “not enough information” when the inputs cannot support a responsible shortlist.

### Scope boundaries and cautions

- This is a decision aid, not an objective winner generator.
- Do not calculate an opaque risk score or turn subjective preferences into fake precision.
- RAID, parity, checksums, snapshots, and backup answer different failure modes. The advisor must keep them distinct.
- Btrfs RAID 1 and RAID 10 may be considered with current documentation and testing. Do not recommend Btrfs RAID 5 or RAID 6 while the official status continues to mark them unstable or not for production use.
- The advisor is built last because every recommendation must be backed by an already-tested engine and destination calculator.

### Completion gate

- Every recommendation and exclusion can be traced to a visible input and named rule.
- Prefilled destination tools reproduce the capacity shown in the shortlist.
- Tests cover conflicting preferences, impossible inventories, insufficient backup information, and cases with no suitable option.
- Editorial review confirms that the page helps the user decide without pretending one technology is universally best.

## Features deliberately merged or deferred

The following original ideas do not receive standalone routes in the first suite:

| Original idea | Decision |
| --- | --- |
| TB vs TiB converter | Merge into every capacity tool as a consistent unit control. |
| RAID comparison matrix | Include as a reference in the RAID tool and storage-tools hub. |
| Standalone TCO calculator | Merge into the Storage Growth and TCO Planner. |
| Universal scrub planner | Include technology-specific scheduling guidance in ZFS and SnapRAID contexts. |
| Generic erasure-coding calculator | Narrow to Ceph because products have incompatible placement and operating rules. |
| SMR drive checker | Defer because trustworthy model-level coverage requires continuous maintenance. |
| Single “rebuild risk” score | Replace with transparent rebuild-window and exposure scenarios. |

## Shared visual plan

Each calculator should use the smallest visual set that makes its exact relationships clear:

1. Controls for the inventory, topology, and assumptions.
2. An answer-first result in a calm, readable composition.
3. A topology diagram when grouping or failure domains affect the answer.
4. An exact table that explains every component of the result.
5. A clean chart only for quantitative comparisons, block-size effects, or timelines.
6. Short, local caveats attached to the affected values.
7. Sources and formula derivation at the end.

Avoid dashboard grids filled with fragments, decorative status cards, colored left-border callouts, and a card for every fact. The suite should feel like a coherent technical reference, not twelve unrelated widgets.

## Shared validation and launch gate

No storage-tool route is published until every applicable item below passes:

- [ ] Property and invariant tests cover all shared calculations.
- [ ] Cross-tool consistency tests prove shared inventories and equivalent topologies produce compatible results.
- [ ] Linux mdraid loop-device or sparse-file fixtures verify representative conventional RAID calculations.
- [ ] OpenZFS 2.3 and 2.4 sparse-pool fixtures cover mirrors, RAIDZ, ashift, record sizes, zvols, mixed roles, and RAIDZ expansion.
- [ ] Synology SHR regression fixtures reconcile with the official calculator or document and resolve every difference.
- [ ] Unraid fixtures enforce current official main-array and parity rules.
- [ ] SnapRAID and mergerfs generated configuration parses and works in a throwaway test environment.
- [ ] Backblaze dataset totals and derived values reconcile with their source periods.
- [ ] Ceph placement and failure-domain cases are checked with CRUSH tooling or a disposable cluster.
- [ ] Versioned URL state round-trips and remains backward-safe.
- [ ] Keyboard, screen-reader, focus, contrast, reduced-motion, narrow-screen, and no-JavaScript reading checks pass where applicable.
- [ ] Every version-dependent claim names the supported version and every estimate is labeled.
- [ ] Page briefs, ownership manifests, route tests, scripts, and public-facing copy are complete and aligned.
- [ ] An unpublished production-like crawl and rendered-page review finds no broken routes, clipped results, hydration failures, missing sources, or accidental indexing.
- [ ] Review the complete collection periodically for formula drift, duplicated content, inconsistent terminology, and contradictory advice without blocking individually ready tools.

The main delivery risk is access to realistic validation environments. Before implementation reaches the affected tools, arrange a ZFS test VM, Synology calculator fixtures or suitable test access, an Unraid test environment, and a disposable Ceph cluster. Rigorous implementation is likely a multi-month project, not a quick batch of calculator pages.

## Primary references

These sources anchor the approved scope. Recheck current versions when implementing each tool.

- [OpenZFS pool properties and space reporting](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html)
- [OpenZFS RAIDZ pool structure](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html)
- [OpenZFS special vdev behavior](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Special%20vdev.html)
- [OpenZFS 2.3.0 release](https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0)
- [OpenZFS `zpool attach` and RAIDZ expansion behavior](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html)
- [Synology RAID Calculator](https://www.synology.com/en-us/support/RAID_calculator)
- [Unraid array disk and parity rules](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/)
- [SnapRAID manual](https://www.snapraid.it/manual)
- [mergerfs configuration and policy guidance](https://trapexit.github.io/mergerfs/2.42.0/faq/configuration_and_policies/)
- [Backblaze hard-drive test data](https://www.backblaze.com/cloud-storage/resources/hard-drive-test-data)
- [Ceph erasure-code documentation](https://docs.ceph.com/en/umbrella/rados/operations/erasure-code/)
- [Garage documentation](https://garagehq.deuxfleurs.fr/documentation/)
- [Archived MinIO community repository](https://github.com/minio/minio)
- [Btrfs feature status](https://btrfs.readthedocs.io/en/latest/Status.html)
- [DiyMediaServer mergerfs and SnapRAID guidance](https://diymediaserver.com/post/2026/mergerfs-media-servers-2026/)
- [RAIDSize expansion planner](https://raidsize.com/blog/en/expand-raid-array)
- [RAIDSize rebuild calculator](https://raidsize.com/tools/rebuild/en)
- [ThisCalc RAID rebuild calculator](https://thiscalc.com/calculators/raid-rebuild)

## Decision log

Record future material decisions here so the roadmap remains the source of truth.

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-08-01 | Use `/storage-tools` as the family root. | The suite extends beyond conventional RAID. |
| 2026-08-01 | Build sequentially and originally hold publication until the whole suite passes. | This release strategy was superseded by the independent-tool decision below. |
| 2026-08-06 | Give every tool a flat canonical route and independent publication gate. | A useful tool should not wait for a category to be complete, and one tool may belong in several collections. |
| 2026-08-01 | Approve 12 public tools plus a shared engine and hub. | Overlapping ideas were merged and unreliable standalone ideas were deferred. |
| 2026-08-01 | Build the Storage Layout Advisor last. | Its recommendations must consume validated calculators rather than duplicate untested logic. |
| 2026-08-01 | Defer the standalone SMR checker. | Reliable model-level identification requires an ongoing authoritative data-maintenance program. |
| 2026-08-01 | Complete shared storage calculation engine version 1. | The exact-byte, inventory, evidence, state, adapter, fixture, and validation contracts now pass the repository quality checks. |
| 2026-08-01 | Complete Tool 1 without an `mdadm` command generator. | The calculator validates and explains conventional RAID capacity without executing storage commands; a command template was optional and would add risk without improving the capacity answer. |
| 2026-08-01 | Model conventional RAID 10 as adjacent mirror pairs and RAID 50/60 as explicit equal-count groups. | Capacity and failure language must follow a visible, deterministic topology rather than hide grouping assumptions. |
