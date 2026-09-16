# Competitive report: 3-2-1 backup calculator

Status: ready
Tool: 3-2-1 backup calculator
Route: /backup-321-calculator
Researched: 2026-09-10
Direct competitors reviewed: 9
Saturation exception: no

## Research scope

### Current stack127 state

- [Observed] /backup-321-calculator has no existing route, page-specific docs, test manifest, script manifest, engine adapter, or publication row. The route is therefore a new flat tool surface, not a redesign of an existing page.
- [Observed] The current /storage-tools catalog publishes 12 related tools: /raid-calculator, /zfs-capacity-calculator, /zfs-padding-calculator, /raidz-expansion-planner, /shr-calculator, /unraid-calculator, /snapraid-mergerfs-planner, /drive-reliability, /rebuild-calculator, /ceph-capacity-calculator, /storage-growth-planner, and /storage-layout-advisor.
- [Documented] lib/storage/index.ts provides exact bigint byte arithmetic, decimal and binary units, versioned adapters, URL state helpers, structured issues and results, assumptions, derivations, sources, uncertainty, and value classifications. It has no UI, network, or analytics dependency.
- [Documented] content_docs/storage-tools/calculation-engine.md requires a new storage calculator to keep formula logic outside React, use exact bytes, version the calculator and input shape, preserve unknown values, and align the brief, formula, tests, guard, registry, and state contract during later implementation.
- [Observed] No current storage tool answers the backup-specific job of sizing retained local and off-site copies from source data, change rate, retention points, and recovery objectives.
- [Observed] The self-hosting course lesson backups-before-serious-apps teaches that a single drive is not a backup, introduces three copies, two storage types, and one off-site copy, recommends versioned snapshots and a restore test, and links the idea to external drives and rsync. It has marker art for the 3-2-1 model and restore proof. A future tool can link to this lesson without duplicating its lesson prose.
- [Inferred] The surface passes the tool decision rule. It accepts user-known inventory and policy inputs and performs a genuine calculation. It should not promise that arithmetic alone proves recoverability, backup integrity, or a universally safe plan.

### Method and coverage

The research used the four required query shapes, a named web search connector for discovery, primary technical sources for claims, community pages for pain evidence, and standalone Playwright operation of every direct competitor below. Search snippets were used for discovery and source finding only. Direct competitor observations come from opened pages and controlled input changes.

- Search backend: web connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI with Playwright 1.60.0 and the installed Chromium executable
- Browser backend limitation: the Codex in-app Browser had no connected runtime. The documented standalone fallback was used. Its first default-sandbox launch failed with Chromium's host sandbox permission error; the same read-only probe completed after the required approved host-boundary rerun.
- Browser viewports: 1440 x 900 desktop and 390 x 844 mobile
- Accessed: 2026-09-10, Asia/Kolkata
- Browser safety boundary: no sign-in, account creation, cookie acceptance, email submission, payment, file upload, share mutation, or external form submission was attempted.
- Mobile evidence limitation: no full keyboard, screen-reader, color-contrast, or assistive-technology audit was performed. The report records visible native controls, labels, ARIA signals, and document overflow only.
- Performance limitation: HTTP 200 and bounded DOM visibility were observed. No production benchmark, Core Web Vitals measurement, or load test was performed.

### Search saturation evidence

- Queries tried:
  - "3-2-1 backup calculator"
  - "how much backup storage do I need retention versions NAS"
  - "3-2-1 backup capacity calculation retention deduplication compression"
  - "backup capacity calculator offsite version retention problem"
- Repeated domains: calculator and advice results came from several different domains. No single direct competitor dominated the returned set. Direct pages from HomeServerCalc, CalcLoop, Secure Techies, Cloudzat, Home Storage Lab, Tools for Film, Calculator Academy, Rules of Thumb, and 17NAS were all opened and operated.
- Exclusions: CISA, NIST, Synology, and other vendor documentation were retained as technical sources rather than counted as competitors. Community threads were retained as pain evidence. Generic backup articles with no calculator, product pricing pages, calculators without an operable backup job, and directory pages were not counted as direct competitors.
- Saturation conclusion: nine direct or adjacent backup-planning tools were available and operated. No saturation exception is needed.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Size a 3-2-1 backup plan | "3-2-1 backup calculator" | Translate source data into local, off-site, and total copy capacity | Small planners, long articles, and strategy tools |
| Estimate retained backup capacity | "how much backup storage do I need retention versions NAS" | Account for daily change, full or incremental backups, and retention points | Retention calculators and vendor guidance |
| Choose a backup capacity formula | "3-2-1 backup capacity calculation retention deduplication compression" | Understand which assumptions are safe to use and which depend on the backup product | Technical articles, vendor documentation, and detailed calculators |
| Plan recovery limits | "backup capacity calculator offsite version retention problem" | Check whether backup frequency and restore time fit the user's tolerance | Strategy planners with RPO/RTO controls, plus community questions |
| Price the backup setup | "3-2-1 backup cost calculator" | Compare local media, cloud, off-site storage, and first-year cost | Cost planners and vendor-led recommendation pages |
| Explain confusing version policies | "backup latest versions retention full incremental" | Map policy labels to actual stored data and likely growth | Community threads and calculators with GFS or incremental modes |

The highest-value opening is a transparent capacity and recovery plan. Cost can be a secondary estimate, but live vendor pricing is not required for the core job.

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Retention settings do not translate cleanly into a storage target. One Synology user describes about 390 GB of source data, six months of cloud versions using about 333 GB, and twelve months of local versions requiring about 1 TB. | [Synology Hyper Backup retention capacity discussion](https://www.reddit.com/r/synology/comments/1l21dxn/struggling_configuring_hyperbackup_to_stay_within_the_limit_of_the_volume_i_have_created/) | Occasional direct thread, with the same retention-cost question appearing in related results | Show retention points and change data separately for each target. Do not multiply source data by a fixed copy count and call it retention sizing. |
| Users ask how many latest versions to keep and how advanced retention policies behave. | [Synology Active Backup retention discussion](https://www.reddit.com/r/synology/comments/tchs8u/a_question_about_number_of_latest_version_to_keep_for_advanced_retention_policy_for_active_backup/) | Repeated question pattern in search results | Use plain daily, weekly, monthly, and yearly point counts. Explain that a version is not always a full copy. |
| Versioning and snapshots can look like duplicate data, while the real storage behavior depends on changed blocks and the backup product. | [Synology versioning and snapshots discussion](https://www.reddit.com/r/synology/comments/zfe7z9/drive_versioning_snapshots_hyper_backup_versions_all_duplicate_data/) | Repeated community confusion | Include a short model explanation and a visible uncertainty note. Link to product-specific documentation for exact deduplication behavior. |
| Cloud versioning can produce an unexpected bill when old versions are retained. | [Backblaze B2 storage cost discussion](https://www.reddit.com/r/synology/comments/18ky4hm/please_help_me_lower_my_backblaze_b2_storage_costs/) | Occasional but concrete cost pain | Keep off-site capacity and recurring cost separate. Make retention and deletion protection visible before any cost estimate. |
| People confuse full image, differential, and incremental backup behavior when estimating space. | [Synology business retention discussion](https://www.reddit.com/r/synology/comments/15vuh1h/backup_for_business_retention_pc_backup/) | Occasional discussion with adjacent backup questions | Ask for the backup method or provide a clearly named conservative model. Never hide the full plus incremental assumption. |
| A plan needs more than copies. CISA recommends offline, encrypted backups and regular testing of availability and integrity. | [CISA ransomware guide](https://www.cisa.gov/stopransomware/ransomware-guide) | Primary guidance, not a community frequency estimate | Show isolation and restore-test reminders as limitations or checks, not as a false compliance score. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| The 3-2-1 rule means three copies, two different media types, and one copy off-site. | [CISA data backup options](https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf) | Documented | The rule counts the production copy in the three. A tool should not silently count only purchased targets. The PDF returned a restricted response in direct browsing, so the claim is recorded from the official CISA search result and URL. |
| Backups should be offline or isolated, encrypted where appropriate, and regularly tested for availability and integrity. | [CISA ransomware guide](https://www.cisa.gov/stopransomware/ransomware-guide) | Documented | This supports a warning and a restore-test prompt. It does not provide a capacity formula. |
| Recovery point objective is the acceptable amount of data loss measured in time, and recovery time objective is the time allowed to restore service. | [NIST SP 800-34 Rev. 1, page 30](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf) | Documented | NIST also connects longer recovery times with lower cost in a planning context. The tool should keep RPO and RTO distinct. |
| A backup storage estimate can use total data, deduplication, daily change rate, and retained versions. | [Synology backup storage calculation](https://kb.synology.com/en-in/DSM/tutorial/How_do_I_calculate_storage_size_for_backups) | Documented | Synology publishes: estimated storage = total backup data x (1 - deduplication rate) x (1 + daily change rate x retained versions). It gives example rates, but says actual telemetry can vary. |
| Full plus incremental storage is one full plus changed data for later points; full-only storage multiplies source data by the number of retained backups. | [CalcLoop retention calculator](https://calcloop.com/backup-retention-calculator/) | Documented | CalcLoop exposes this distinction and asks for frequency, retention days, and daily change rate. Exact implementation behavior still varies by backup product. |
| GFS and forever-incremental policies have different storage shapes. | [Secure Techies retention calculator](https://securetechie.com/tools/backup-retention-calculator/) | Documented | Its visible formula uses stored fulls and stored incrementals for Classic GFS, or one full plus incrementals for forever incremental. It warns that synthetic fulls and vendor behavior vary. |
| Future source data under an annual growth assumption is D(h) = D0 x (1 + g)^h when the selected model compounds. | Mathematical derivation from user inputs; related probe on HomeServerCalc and Cloudzat | Inferred | The product plan must name the growth convention. Do not combine a compounded source curve with an unlabeled linear change estimate. |
| A conservative per-target estimate can be source data plus changed data across retained points, then headroom. | Home Storage Lab calculator and the source/change model above | Inferred | Home Storage Lab explicitly excludes deduplication and compression savings. Exact point counting and reserve order must be chosen in the implementation contract. |
| Decimal TB and binary TiB are different units and should not be mixed. | Existing Stack127 storage engine and storage-tools calculation-engine.md | Documented | Use the shared exact-byte conventions. Every visible result needs a unit and a stated rounding rule. |
| Backup capacity can be reduced by compression or deduplication. | Synology documentation, Secure Techies calculator, Calculator Academy formula page | Documented | It is workload and product dependent. It should be optional and clearly conditional, not a default promise. |
| A probability percentage can prove that a plan is safe. | Rules of Thumb calculator explicitly says there is no honest published restore figure | Unknown | Do not turn a failure-rate model into a capacity result or a safety guarantee. |
| Live prices and provider catalogs are stable enough to be part of the core answer. | 17NAS and several affiliate or vendor pages | Unknown | Prices and offers were observed on pages but no stable source contract was found. Keep pricing out of the first technical core or make it user supplied. |

## Competitor reviews

### Competitor 1: HomeServerCalc 3-2-1 Backup Sizing Calculator

- URL: https://homeservercalc.com/calculators/backup-321-sizing-calculator/
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Home-server owners planning backup targets from current used data, annual growth, retention versions, planning years, headroom, and price per TB.
- Inputs and defaults: [Observed] Data held now in TB, default 6; annual growth percentage, default 25; plan years, default 3; version history selector with 10, 20, 30, 50, or 80 versions, default 30; headroom percentage, default 20; and price per TB, default 42. Presets include documents and photos, a family media library, a 4K library, a studio archive, and a large home lab.
- Action and state behavior: [Observed] Results update live on input or select changes. There is no visible calculate button. The page also has a newsletter email form, which was not submitted.
- Results and visuals: [Observed] The default result shows data at the planning horizon, a target for each of two backup copies, total copy cost, a year-by-year target table, and a cloud restore-time estimate. The page explains that backup targets are sized from used data rather than array capacity.
- Formula or data source: [Documented] The page describes future growth, version overhead, headroom, two target copies, and a target tier. [Inferred] The default 6 TB, 25 percent annual growth, three-year horizon, 30 version setting, and 20 percent headroom produce a rounded 20 TB target per copy. The exact tier rounding and version-overhead mapping are not exposed as a formal formula.
- Errors and edge behavior: [Observed] A controlled low-bound probe accepted 0.1 TB, one year, low version overhead, 10 percent headroom, and 5 dollars per TB and produced a 1 TB target per copy and 10 dollars for both. [Observed] Clearing the source field did not expose a clear required-field error; the prior result or a fallback state remained. No stale-result guarantee was visible.
- Mobile and accessibility: [Observed] The page document fit 390 px, but result tables measured about 398 px and 455 px in the mobile DOM, creating a likely table overflow region. Native number/select controls and labels were visible. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Unknown] Calculator fields appeared local to the page, but no calculator-specific data-handling statement was observed. The page presents an email lead form and a privacy-policy link; no submission was made.
- Performance: [Observed] HTTP 200 and the default DOM result appeared in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] Title and H1 target 3-2-1 backup sizing for a NAS. Useful headings cover the short answer, 3-2-1 meaning, version history, target cost, off-site copy rotation, limitations, related reading, and FAQs.
- What works: It starts from used data, exposes growth and horizon, offers recognizable presets, and makes the two purchased backup targets visible.
- What fails: It hides the version-overhead formula, has no explicit action or validation recovery, mixes planning with an affiliate product and email capture, and makes the page much longer than the sizing task.
- Do not copy: The hidden heuristic, email capture around the answer, affiliate product block, or wide result tables without a mobile-specific layout.

```text
    nav
    H1 and short answer
    product and affiliate block
    data | growth | years | versions | headroom | price
    presets
    horizon result | target per copy | cost
    year table | restore estimate
```

### Competitor 2: CalcLoop Backup Retention and 3-2-1 Calculator

- URL: https://calcloop.com/backup-retention-calculator/
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Users sizing a retained backup chain and separating the production copy from two purchased backup copies.
- Inputs and defaults: [Observed] Data size, default 500; data unit, GB or TB; backup frequency, daily or weekly; retention days, default 30; backup type, full only or full plus incremental; and daily change rate, default 3 percent.
- Action and state behavior: [Observed] An explicit Calculate button submits the form. A controlled input probe changed the result. Clearing an optional-looking numeric field did not show a useful validation error.
- Results and visuals: [Observed] The result reports number of backups, one local repository, one off-site repository, and total storage for both repositories. The page has no cost or transfer-time result.
- Formula or data source: [Documented] The page explains full-only storage as source data times retained backups, and full plus incremental as one full plus changed data for later backups. It advises measuring the change rate and says 3 to 5 percent daily is common. [Observed] The default page displayed an unexpectedly large 950 TB chain for the 500 GB default, so default unit interpretation or calculation behavior needs independent verification.
- Errors and edge behavior: [Observed] A controlled low-data probe completed and returned a small result. [Unknown] The page did not expose a clear invalid-state message when a numeric value was blanked in the generic probe. Zero and negative behavior were not fully mapped.
- Mobile and accessibility: [Observed] The document fit 390 px and the form, result, explanatory headings, and FAQ stacked vertically. Native labels and controls were visible. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Unknown] No calculator-specific privacy statement was visible in the operated content. No form or account action was attempted.
- Performance: [Observed] HTTP 200 and the result was visible in the bounded DOM probe. No benchmark claim.
- Search-content structure: [Observed] H1 is Backup Retention and 3-2-1 Calculator. Supporting headings cover the 3-2-1 rule, full versus incremental storage, daily change rate, ransomware, and compliance retention.
- What works: It keeps the input model small and makes full versus incremental assumptions explicit.
- What fails: It lacks growth, headroom, RPO, RTO, and isolation checks. The default result looked implausible and the blank-input state was not clear.
- Do not copy: An unlabeled default that can produce a giant answer, optional-looking inputs with no visible recovery, or the assumption that two repository copies alone explain a 3-2-1 plan.

```text
    nav
    H1 and intro
    data | unit | frequency | retention days
    full only | full + incremental | change rate
    Calculate
    backup count | local repo | off-site repo | total
```

### Competitor 3: Secure Techies Backup Retention Calculator

- URL: https://securetechie.com/tools/backup-retention-calculator/
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Technical backup administrators comparing Classic GFS and forever-incremental repository size across several copy locations.
- Inputs and defaults: [Observed] Source data in TB, default 2; daily change rate, default 5 percent; compression ratio, default 1.5; deduplication factor, default 1; retention method, Classic GFS or forever incremental; daily, weekly, monthly, and yearly counts; and repository copies, default 2 with options for one, two, or three repositories. The copy selector describes the production system as the third 3-2-1 copy.
- Action and state behavior: [Observed] Results update live. There is no visible Calculate button. A cookie banner offered Accept All, Essential Only, and Reject; no choice was made.
- Results and visuals: [Observed] The default result separates all backup copies, one repository, one stored full, daily incrementals, and weekly/monthly/yearly points. It also displays a conservative-model warning and a restore-test reminder.
- Formula or data source: [Documented] The page gives formulas for stored full F = source / compression / deduplication, stored incremental I = source x daily change / compression / deduplication, Classic GFS = daily points x I plus weekly/monthly/yearly points x F, and forever incremental = F plus all points x I. [Observed] A controlled low-bound probe produced a non-empty result and the expected separate rows. The page says its result is a planning model, not a product quote.
- Errors and edge behavior: [Observed] Clearing source data exposed an Enter used source data in TB message and removed the numeric result. The page retains explanatory caveats for synthetic fulls and vendor-specific behavior.
- Mobile and accessibility: [Observed] The tool stacked cleanly at 390 px with no document overflow. Native fields, select controls, and cookie buttons were visible. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Observed] A cookie-consent UI was present. [Unknown] The calculator's input storage and analytics behavior were not inspected.
- Performance: [Observed] HTTP 200 and the live result rendered in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] H1 is Backup Retention Calculator. The form uses visible groups for what is protected, how long copies are kept, and repository copies, followed by a concise result and model warnings.
- What works: It distinguishes repository size from all purchased copies and exposes the storage model instead of hiding compression, deduplication, and GFS assumptions.
- What fails: The first screen has many expert controls, the meaning of a "full" depends on the method, and the two-copy multiplication can be mistaken for a complete 3-2-1 design.
- Do not copy: The expert-heavy opening, cookie overlay around a simple task, or vendor-sensitive compression and deduplication values as casual defaults.

```text
    nav
    H1 and intro
    source | change | compression | dedup
    GFS or forever incremental
    daily | weekly | monthly | yearly points
    repository copies
    all copies | one repo | full | incrementals | GFS points
```

### Competitor 4: Cloudzat 3-2-1 Backup Planner

- URL: https://cloudzat.com/3-2-1-backup-planner/
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Users planning current data, local copies, off-site copies, annual growth, and a planning horizon, with a recommendation and current storage offers.
- Inputs and defaults: [Observed] Important data in TB, default 2; local backup copies, default 1; off-site copies, default 1; annual growth, default 20 percent; and planning years, default 5. The page also has site search, Copy URL, and share-related controls.
- Action and state behavior: [Observed] A visible Calculate recommendation button produces a recommendation and loads offer content. A controlled mixed probe set all five values to 10 and returned a 550 TB per-primary-device recommendation and 544.69 TB across 21 total copies. The latter is consistent with an inferred compounded-growth and copy-count calculation, not an exposed formal equation.
- Results and visuals: [Observed] The result states a primary-device purchase tier, total copies, total capacity across locations, and current matching offers. The page then explains recoverability, inventory, growth, retention, failure domains, hardware, overhead, transfer windows, restore tests, ransomware, and review cadence.
- Formula or data source: [Documented] The page says its recommendation considers current data, growth, retention, copies, headroom, and overhead. [Inferred] The 10 TB, 10 percent, 10-year, 21-copy probe matched 10 x 1.1^10 x 21 = 544.69 TB. [Unknown] The exact rounding, retention treatment, and offer selection rules.
- Errors and edge behavior: [Observed] A low or blank-like controlled probe returned a small 0.5 TB tier and "No fresh matching offers are available" rather than a clear invalid state. [Unknown] The minimum and negative handling were not fully mapped.
- Mobile and accessibility: [Observed] The document fit 390 px. The duplicate H1 and long content stack vertically. Native inputs, a button, and search controls were visible. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Observed] Copy URL, search, and an Amazon Associate disclosure are visible. [Unknown] Calculator input handling and offer-request behavior.
- Performance: [Observed] HTTP 200 and the recommendation DOM appeared in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] The page has duplicate H1 text, then the assumptions form, offers, long planning guidance, FAQs, official references, and related tools.
- What works: It asks for growth and horizon, separates local and off-site copies, and connects the result to a practical buying tier.
- What fails: The title includes retention but there is no retention-point input, the copy total can become very large without explaining stored versions, duplicate H1 harms search clarity, and offer availability can be empty.
- Do not copy: Duplicate H1 markup, live commerce recommendations, or a raw copy count that treats every copy as a full independent retained repository.

```text
    nav and search
    breadcrumb | Copy URL
    H1 repeated
    data | local copies | off-site copies | growth | years
    Calculate recommendation
    purchase tier | total copies | total capacity | offers
```

### Competitor 5: Home Storage Lab 3-2-1 Backup Capacity and Retention Planner

- URL: https://home-storage-lab.pages.dev/en/backup-321-calculator
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Home storage users sizing local and off-site targets, estimating retention and transfer time, and checking RPO and RTO. The page explicitly says the calculation is browser-only and no form data is sent.
- Inputs and defaults: [Observed] Protected data in TB, default 2; daily change in GB, default 20; daily restore points, default 7; weekly points, default 4; monthly points, default 6; reserve, default 20 percent; backup interval, default 24 hours; target RPO, default 24 hours; target RTO, default 12 hours; local speed, default 1000 Mbps; off-site speed, default 100 Mbps; efficiency, default 80 percent; off-site type with versioned cloud, another-site NAS, rotated removable drive, or none; and checks for a separate local device and isolated off-site copy.
- Action and state behavior: [Observed] A visible Calculate backup plan button produces capacity, retention, RPO, RTO, transfer, and failure-domain results. The default content includes a worked example for a 2 TB library and a 20 GB daily change rate.
- Results and visuals: [Observed] The result has capacity for each backup target, a retention window, both-target total, version-history allowance, copy count, RPO status, local and off-site full-copy transfer times, RTO status, and failure-domain checks. A controlled generic probe with very small values rounded the capacity display to 0 TB, which is a presentation risk.
- Formula or data source: [Documented] The page says the model carries daily change across the retention window, uses a reserve, and excludes deduplication and compression savings. [Inferred] The point-count and reserve calculation can be reconstructed from the visible inputs and worked example. [Unknown] The exact ordering, rounding, and treatment of the initial full versus changed data are not shown beside the result.
- Errors and edge behavior: [Observed] The form uses required numeric controls and minimum values. The generic probe reached a result state rather than exposing a useful explicit message for every invalid combination. A dedicated test-first implementation should define blank, zero, and impossible RPO/RTO behavior.
- Mobile and accessibility: [Observed] The 13-field form stacked at 390 px with no document overflow. Native labels, selects, checkboxes, and required fields were visible. [Unknown] Full keyboard, screen-reader, and error-announcement behavior.
- Privacy: [Documented] The page says browser-only calculation and no form data sent. No account or submission path was used.
- Performance: [Observed] HTTP 200 and the result rendered in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] The H1 names capacity and retention. The page includes How to read the plan, RPO and RTO, related checks, worked examples, and supporting explanation.
- What works: It connects capacity with recovery objectives, transfer time, isolation, and privacy. It is the closest competitor to a serious homelab planning job.
- What fails: Thirteen required controls make the first screen heavy, the formula is hidden, and small values can display as zero despite a nonzero calculation.
- Do not copy: An all-at-once expert form, exact-looking transfer times without a clear estimate label, or a checkbox that implies isolation has been proven.

```text
    nav and search
    H1 | browser-only privacy note
    protected data | daily change | daily/weekly/monthly points
    reserve | interval | RPO | RTO
    local speed | off-site speed | efficiency | off-site type
    separate-device check | isolated-copy check
    Calculate backup plan
    capacity per target | retention | copies
    RPO | RTO | transfer times | failure domains
```

### Competitor 6: Tools for Film Backup Strategy Planner

- URL: https://www.toolsforfilm.com/tools/backup-strategy
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Film and production teams planning three copies across local drives, a NAS, and cloud over a retention period.
- Inputs and defaults: [Observed] Total data in TB, default 10; monthly growth in TB, default 0.5; three copy selectors defaulting to external SSD, NAS, and Backblaze B2; and retention defaulting to 36 months. The page also provides Tools, Directory, Copy, Share, Print, Reset, Show Formula, Contents, Search, and Embed controls.
- Action and state behavior: [Observed] Results update live when fields and copy choices change. No visible Calculate button was required. Copy, share, print, and embed actions were not activated.
- Results and visuals: [Observed] The default result checks three copies, two media, and one off-site; prices an external SSD, NAS, and cloud; shows 36-month total cost; projects 10 TB to 28 TB over the horizon; and compares media by price, speed, and lifespan.
- Formula or data source: [Documented] The page explains local one-time cost as data times cost per TB, recurring cloud cost as data times monthly rate, and a monthly growth projection. [Inferred] The default result uses a fixed monthly growth increment rather than a percentage curve. [Unknown] The freshness and source quality of hardware prices, speeds, lifespans, and the production-loss story.
- Errors and edge behavior: [Observed] A controlled low data value updated the output to a small starting capacity but a very large projected capacity when the generic probe also set growth high. [Unknown] No explicit invalid state was exposed in the probe.
- Mobile and accessibility: [Observed] The mobile document scroll width was 430 px at a 390 px viewport, creating page-level horizontal overflow. Buttons and labelled inputs were visible. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Unknown] The marketing page exposes share, print, embed, and email or navigation surfaces, but no calculator-specific input privacy statement was observed.
- Performance: [Observed] HTTP 200 and the default result rendered in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] The H1 is Backup Strategy Planner with a film-specific lede. The page leads with the planner, cost summary, growth projection, media table, formula, and a case-study-style explanation.
- What works: Copy choices, retention, growth, cost, media type, and the 3-2-1 check are visible in one compact result.
- What fails: It is a production-media tool with hardcoded volatile prices, no detailed retention policy, a cost-first answer, and horizontal mobile overflow.
- Do not copy: Unverified loss stories, hardcoded price and lifespan claims, share or embed clutter, or a cost result that looks universal.

```text
    nav and tool actions
    H1 and film-specific lede
    data | monthly growth | copy 1 | copy 2 | copy 3 | retention
    compliance: copies | media | off-site
    CapEx | cloud/month | total over horizon
    growth projection
    media comparison table
```

### Competitor 7: Calculator Academy Backup Capacity Calculator

- URL: https://calculator.academy/backup-capacity-calculator/
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Users solving a generic backup-capacity equation from data size, redundancy factor, compression ratio, and backup capacity.
- Inputs and defaults: [Observed] Data size and unit, redundancy factor, compression ratio, backup capacity and unit, with a Calculate button and Reset. The page also includes share, customization, site-embed, and related-calculator actions.
- Action and state behavior: [Observed] The form is designed to solve for one missing value from four variables. A generic fill of all four values did not expose a useful result because the page expects exactly three known inputs. No external sharing or customization action was activated.
- Results and visuals: [Observed] The surrounding content provides the formula, examples, common values, related calculators, and FAQs. The calculator result itself was not reliably captured in the all-fields-filled probe.
- Formula or data source: [Documented] The page states BC = DS x RF / (1 - CR), converts values to GB, and gives examples including 500 GB with redundancy 1.5 and compression 0.25 producing 1,000 GB. It also explains that a redundancy factor of 2 means two copies.
- Errors and edge behavior: [Observed] The generic all-four-input probe did not show a clear recovery instruction beside the empty or over-specified state. The page says exactly three values are needed, but the visible invalid behavior needs testing.
- Mobile and accessibility: [Observed] The document fit 390 px, but result or explanatory tables measured about 420 px and 520 px in the mobile DOM, creating an overflow risk inside table regions. Native inputs and buttons were visible. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Unknown] No calculator-specific privacy statement was observed. Share and embed controls were not activated.
- Performance: [Observed] HTTP 200 and the form plus formula content rendered in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] H1 and tool panel lead into Related Calculators, Backup Capacity Formula, Common Backup Planning Values, Example Calculations, and FAQs.
- What works: The equation is explicit, unit conversion is explained, and the page teaches the algebra.
- What fails: Redundancy factor and compression ratio are abstract inputs, the tool does not model 3-2-1, retention, change rate, RPO, RTO, or failure domains, and the form's exactly-three-values rule is easy to misuse.
- Do not copy: Generic embed and customization calls to action, four-variable ambiguity, or a capacity answer without naming whether the value is a source, repository, or all-copy total.

```text
    nav and search
    H1
    data size | unit | redundancy factor | compression ratio
    backup capacity | unit
    Calculate | Reset
    related calculators
    formula | common values | examples | FAQ
```

### Competitor 8: Rules of Thumb 3-2-1 Backup Calculator

- URL: https://rulesofthumb.info/computers/backup-321
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] Technical users assessing how copy location, media type, online status, and failure-rate assumptions change the chance of losing everything.
- Inputs and defaults: [Observed] Three copy rows with storage medium, location, and online/offline state; add-copy and remove-copy controls; years, annual failure rate, media failure rate, site loss rate, logical failure rate, and restore success percentage. Utility controls include favourite, snapshot, share/export, recent, units, theme, and animation pause.
- Action and state behavior: [Observed] The page uses live updates and sliders or selects. A controlled probe changed copy and failure settings. There is no capacity-sizing action.
- Results and visuals: [Observed] It displays an estimated chance of losing everything over the chosen years, copy count, media count, off-site count, failure-mode breakdowns, and long explanatory sections. The page explicitly warns that no honest published restore probability exists.
- Formula or data source: [Unknown] The page presents a probability model, but the exact independence assumptions, aggregation formula, and source for user defaults were not visible beside the result. [Inferred] The result is a user-supplied risk scenario, not a backup-capacity formula.
- Errors and edge behavior: [Observed] Defaults populate all controls, so no required-field error was encountered. [Unknown] Zero rates, 100 percent rates, duplicate media, and contradictory location states were not fully tested.
- Mobile and accessibility: [Observed] The document fit 390 px and the copy rows, rates, result, and explanations stacked. Visible controls included useful labels and ARIA-style names. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Unknown] Favourite, snapshot, recent, and share/export behavior may use browser state, but no storage or privacy statement was verified. Those actions were not activated.
- Performance: [Observed] HTTP 200 and the live result rendered in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] H1 is 3-2-1 Backup Calculator. Headings cover copies, rates, chance of losing everything, failure modes, and interpretation.
- What works: It surfaces online versus offline, location, failure domains, and the difference between a copy count and a resilience story.
- What fails: It is not a capacity planner, probability percentages can imply false precision, and long interpretation copy competes with the interactive result.
- Do not copy: A "chance of losing everything" headline, restore-probability dial, or quantitative safety score presented as a guarantee.

```text
    H1 and explanation
    copy 1: medium | location | online/offline
    copy 2: medium | location | online/offline
    copy 3: medium | location | online/offline
    add copy
    years | annual failure | media failure | site loss | logical failure | restore dial
    loss probability | copy/media/off-site counts
```

### Competitor 9: 17NAS NAS Backup Strategy Planner

- URL: https://17nas.com/backup-planner.php?lang=en-US
- Accessed: 2026-09-10, Asia/Kolkata; HTTP 200; operated at 1440 x 900 and 390 x 844.
- Audience and promise: [Observed] NAS owners choosing a local backup, off-site solution, cloud option, and backup frequency based on data size, importance, budget, RTO, and change frequency.
- Inputs and defaults: [Observed] A data-size range from 0.1 to 20 TB, importance low/medium/high, budget, RTO instant/fast/normal/slow, and change frequency daily/weekly/monthly/rarely. The page also has language, login, and registration controls, which were not used.
- Action and state behavior: [Observed] The planner updates recommendations as the controls change. The default result recommends about 1 TB of local backup, a local or off-site option, a 1 TB OneDrive personal cloud option, and a first-year cost summary. A boundary-low probe produced a quarterly backup recommendation; a mixed high-importance, 20 TB, instant-RTO, daily-change probe switched to a large off-site NAS or colocation recommendation, daily frequency, and a budget warning.
- Results and visuals: [Observed] The page states the 3-copy, 2-media, and 1-off-site principles, local/off-site/cloud recommendations, initial and annual cost, a strategy summary, completeness checks, and size tiers below 500 GB, 500 GB to 2 TB, 2 TB to 10 TB, and above 10 TB.
- Formula or data source: [Unknown] No visible formula, source table, or versioned pricing rule was exposed beside the result. [Inferred] Recommendation tiers and cost values are heuristic catalog logic, not a reproducible backup-retention equation.
- Errors and edge behavior: [Observed] The range minimum and maximum were accepted, and the tool changed its recommendation at the high boundary. [Unknown] Budget zero, missing translation strings, and conflicting RTO or change-frequency combinations did not produce a documented error state.
- Mobile and accessibility: [Observed] The document fit 390 px at mobile width. Native range, select, number, and button controls were visible. [Unknown] Full keyboard and screen-reader behavior, and the exact mobile result hierarchy.
- Privacy: [Observed] Anonymous use was possible, with login and registration present elsewhere on the page. [Unknown] Input handling, account linking, and recommendation telemetry.
- Performance: [Observed] HTTP 200 and recommendation content rendered in the bounded probe. No benchmark claim.
- Search-content structure: [Observed] Title and H1 target a NAS backup strategy and 3-2-1 cost calculator. Headings cover data info, comparison, size recommendations, important notes, and related tools. Some rendered labels retained localization-key-like text such as Principle Copies and Recommend Title.
- What works: It combines data size, importance, RTO, change frequency, budget, and concrete local/off-site/cloud choices in one quick flow.
- What fails: The formula is opaque, price and catalog assumptions are not auditable, localization quality is uneven, and the result can look like a product recommendation rather than a planning model.
- Do not copy: Login pressure, opaque recommendation tiers, localization-key labels, or a vendor/catalog result without a formula receipt.

```text
    nav | language | login | register
    H1
    data-size range | importance | budget | RTO | change frequency
    local recommendation | off-site recommendation | cloud recommendation
    initial cost | annual cost | year-one total
    3 copies | 2 media | 1 off-site | frequency
    completeness checks
```

## Comparison matrix

The matrix is a labeled synthesis of the operated-page observations above. "Partial" means the capability exists but is hidden, heuristic, vendor-specific, or incomplete.

| Capability | HomeServerCalc | CalcLoop | Secure Techies | Cloudzat | Home Storage Lab | Tools for Film | Calculator Academy | Rules of Thumb | 17NAS | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Source data input | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | Yes | High |
| Growth horizon | Yes | No | No | Yes | No | Yes | No | No | No | High |
| Daily change rate | No | Yes | Yes | No | Yes | No | No | No | No | High |
| Retention points | Version selector | Days | GFS points | No | Daily/weekly/monthly points | Months only | No | No | No | High |
| Full versus incremental model | Partial | Yes | Yes | No | Partial | No | No | No | Unknown | High |
| Local and off-site targets | Two targets | Two repositories | Repository copies | Copy counts | Per-target capacity | Copy choices | Generic capacity | Locations | Recommendations | High |
| Isolation or failure domain | No | No | No | Guidance only | Checks | 3-2-1 check | No | Online/offline | Completeness checks | High |
| RPO and RTO | No | No | No | No | Yes | No | No | No | RTO selector | High |
| Transfer or restore time | Cloud restore estimate | No | No | No | Local/off-site estimate | No | No | Restore dial | No | Medium |
| Cost estimate | Yes | No | No | Offers | No | Yes | No | No | Yes | Medium |
| Formula transparency | Partial | Yes | Yes | Inferred | Partial | Partial | Yes | Unknown | No | High |
| Invalid-state recovery | Weak | Weak | Visible source error | Weak | Partial | Unknown | Partial | Defaults only | Unknown | High |
| Narrow layout | Table overflow risk | Pass | Pass | Pass | Pass | Fail, 430 px | Table overflow risk | Pass | Pass | High |
| Browser-only privacy statement | Unknown | Unknown | Unknown | Unknown | Documented | Unknown | Unknown | Unknown | Unknown | Medium |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| What does 3-2-1 count? | CISA counts the production copy plus two backups. HomeServerCalc and CalcLoop show two purchased targets, while Cloudzat and 17NAS count copy slots or recommendations. | [CISA data backup options](https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf), [HomeServerCalc](https://homeservercalc.com/calculators/backup-321-sizing-calculator/) | Yes. State "three copies including the source" and show local and off-site targets as separate result rows. |
| How should retention become capacity? | CalcLoop uses full-only or full plus incremental. Secure Techies uses GFS or forever incremental. Synology uses deduplication, daily change, and retained versions. HomeServerCalc maps a version selector to a hidden overhead. Home Storage Lab carries daily change across point counts. | [Synology backup storage calculation](https://kb.synology.com/en-in/DSM/tutorial/How_do_I_calculate_storage_size_for_backups), [CalcLoop](https://calcloop.com/backup-retention-calculator/), [Secure Techies](https://securetechie.com/tools/backup-retention-calculator/) | Yes. Product planning must choose a conservative, named model and expose the retention-point counts and changed-data assumption. |
| Is future growth linear or compounded? | HomeServerCalc and the Cloudzat probe behave like compounded annual growth. Tools for Film adds a monthly TB increment. 17NAS does not expose growth. | [HomeServerCalc](https://homeservercalc.com/calculators/backup-321-sizing-calculator/), [Cloudzat](https://cloudzat.com/3-2-1-backup-planner/), [Tools for Film](https://www.toolsforfilm.com/tools/backup-strategy) | Yes. Pick one default, show the equation or wording beside it, and keep growth separate from daily backup change. |
| Should compression and deduplication reduce the target? | Secure Techies and Calculator Academy expose them. Synology includes deduplication in its formula. Home Storage Lab explicitly excludes both. | [Synology backup storage calculation](https://kb.synology.com/en-in/DSM/tutorial/How_do_I_calculate_storage_size_for_backups), [Home Storage Lab](https://home-storage-lab.pages.dev/en/backup-321-calculator) | Yes. Launch should be conservative by default and make any savings assumption optional and conditional. |
| How should units and small values round? | Calculator Academy converts to GB. HomeServerCalc rounds to purchase tiers. Home Storage Lab displayed 0 TB for a small controlled result. The Stack127 storage engine uses exact bigint bytes. | Stack127 content_docs/storage-tools/calculation-engine.md, [Calculator Academy](https://calculator.academy/backup-capacity-calculator/) | Yes. Keep exact internal bytes, display decimal or binary units explicitly, and never round a nonzero small result to a misleading zero without a more precise fallback. |
| Should recovery time be part of sizing? | Home Storage Lab calculates transfer time and RPO/RTO. 17NAS uses a qualitative RTO selector. NIST defines RPO and RTO but does not supply a consumer calculator formula. | [NIST SP 800-34](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), [Home Storage Lab](https://home-storage-lab.pages.dev/en/backup-321-calculator/) | Yes. Include an optional check or result section, clearly marked as a transfer estimate with user-supplied speed and efficiency. |
| Can a risk percentage certify safety? | Rules of Thumb estimates loss probability. CISA instead emphasizes isolation, testing, and integrity. No primary source supports a universal restore probability. | [Rules of Thumb](https://rulesofthumb.info/computers/backup-321), [CISA ransomware guide](https://www.cisa.gov/stopransomware/ransomware-guide) | No. Reject a safety score. State what arithmetic can and cannot verify. |
| Should the tool include live prices? | 17NAS and Tools for Film use catalogs or price presets. HomeServerCalc uses a price per TB. These values can age quickly and are not needed to calculate capacity. | [17NAS](https://17nas.com/backup-planner.php?lang=en-US), [Tools for Film](https://www.toolsforfilm.com/tools/backup-strategy) | No for the technical core. If later added, use explicit user-entered cost assumptions with date and currency. |

## Evidence-backed opportunities

1. **Make the backup job explicit**: Ask for protected source data, daily changed data, retention points, and backup method. The community pain and CalcLoop, Secure Techies, and Home Storage Lab all show that "how much data" is not enough.
2. **Show the answer per target and in total**: Give local target, off-site target, and total backup storage, while separately stating that the source makes the third 3-2-1 copy. This resolves the copy-count ambiguity found across CISA guidance and competitor pages.
3. **Lead with a conservative model and a formula receipt**: Display the full backup, changed-data allowance, retention window, reserve, and rounding rule. Synology's documented formula and Home Storage Lab's conservative limitation make this credible.
4. **Add a recovery check without claiming proof**: An optional RPO, RTO, transfer speed, and efficiency section can show whether a full restore is plausible. NIST supplies the definitions; Home Storage Lab demonstrates the user value.
5. **Separate resilience from pricing**: Capacity and isolation should work without an offer catalog. 17NAS and Tools for Film show the engagement value of recommendations, but their opaque or volatile pricing is not suitable as the technical source of truth.
6. **Treat isolation as a visible assumption**: Let the user mark a local target as a separate device and an off-site target as isolated or offline, then state that the tool cannot verify it. This follows CISA and addresses the difference between duplicate data and recoverable backups.
7. **Use the course as the learning handoff**: Link the finished result to the backups-before-serious-apps lesson for restore drills, compose data, external copies, and the 3-2-1 explanation. The tool should answer the sizing question and the course should carry the broader habit-building lesson.
8. **Keep the first screen small**: Home Storage Lab has the strongest technical coverage but requires 13 fields. A staged advanced section can preserve its RPO/RTO value without making the first interaction feel like an audit form.

## Table stakes

- Source data, daily change or a clearly named alternative, backup frequency, retention points, and an explicit full or incremental model.
- Local and off-site target capacity, total repository capacity, and a note that the production source is one of the three copies.
- Visible units, exact input bounds, sensible defaults, reset behavior, and one primary Calculate action.
- Invalid, zero, tiny, and very large input states with no stale result presented as current.
- A result explanation showing source data, changed data, retention contribution, reserve, assumptions, and rounding.
- An optional RPO/RTO and transfer-time estimate with "estimated" language and explicit speed and efficiency inputs.
- Isolation and restore-test guidance that does not produce a false compliance or safety badge.
- Browser-local calculation or a clear data-handling statement. No account, email, affiliate, or vendor catalog is needed for the core answer.
- Responsive layout at 390 px with no page-level horizontal scrolling and no result value that is hidden in a wide table.
- Server-rendered explanatory content with a stable flat route and a link from the storage-tools catalog.
- Related links to /rebuild-calculator, /drive-reliability, /storage-growth-planner, and the backup course lesson only when they help the next decision.

## Ideas to reject

- **A probability of losing everything score**: the Rules of Thumb model is not a primary capacity source and can create false safety precision.
- **A universal "3-2-1 compliant" badge**: arithmetic cannot verify media independence, isolation, restore integrity, or a successful drill.
- **Live cloud or hardware catalog recommendations in the core**: prices, availability, and policies change, and the calculation should remain reproducible.
- **Hidden compression and deduplication savings**: these depend on the backup product and workload. Defaults should not promise them.
- **A generic redundancy-factor-only calculator**: Calculator Academy shows the algebra, but it does not answer retention, change-rate, off-site, or recovery questions.
- **Thirteen required fields on first load**: retain advanced RPO/RTO and efficiency controls behind a deliberate section.
- **Automatic email, affiliate, login, or share capture**: these add trust and privacy cost without improving the capacity answer.
- **A raw copy-count multiplier**: it overstates or understates retained storage and hides whether copies are full repositories or changed data.
- **A single precise cost or restore-time number**: keep user assumptions, uncertainty, and exclusions next to the result.

## Open questions and blockers

- None for research readiness. The nine direct competitor minimum, primary-source review, formula comparison, operated-page evidence, wireframes, and backend limitations are complete.
- Product planning must choose the launch retention model, growth convention, unit display, reserve order, optional compression or deduplication treatment, and whether RPO/RTO is in the first screen or an advanced section.
- Implementation must verify the shared storage-engine adapter, URL state shape, input bounds, and publication guard against the current storage catalog.

## Sources

- [HomeServerCalc 3-2-1 Backup Sizing Calculator](https://homeservercalc.com/calculators/backup-321-sizing-calculator/), accessed 2026-09-10. Operated with standalone Playwright at desktop and mobile widths; inputs, live result, low-bound probe, and mobile table widths observed.
- [CalcLoop Backup Retention and 3-2-1 Calculator](https://calcloop.com/backup-retention-calculator/), accessed 2026-09-10. Operated with standalone Playwright; form, explicit action, retention modes, result, and default-output concern observed.
- [Secure Techies Backup Retention Calculator](https://securetechie.com/tools/backup-retention-calculator/), accessed 2026-09-10. Operated with standalone Playwright; GFS, forever-incremental, compression, deduplication, copies, invalid source state, and mobile layout observed.
- [Cloudzat 3-2-1 Backup Planner](https://cloudzat.com/3-2-1-backup-planner/), accessed 2026-09-10. Operated with standalone Playwright; assumptions, recommendation action, controlled growth probe, duplicate H1, and mobile layout observed.
- [Home Storage Lab 3-2-1 Backup Capacity and Retention Planner](https://home-storage-lab.pages.dev/en/backup-321-calculator), accessed 2026-09-10. Operated with standalone Playwright; privacy statement, full input model, result groups, transfer estimates, and mobile layout observed.
- [Tools for Film Backup Strategy Planner](https://www.toolsforfilm.com/tools/backup-strategy), accessed 2026-09-10. Operated with standalone Playwright; copy selectors, growth, retention, cost result, media table, and 430 px mobile overflow observed.
- [Calculator Academy Backup Capacity Calculator](https://calculator.academy/backup-capacity-calculator/), accessed 2026-09-10. Operated with standalone Playwright; algebra, four-field model, exact-three-values behavior, table overflow risk, and adjacent SEO controls observed.
- [Rules of Thumb 3-2-1 Backup Calculator](https://rulesofthumb.info/computers/backup-321), accessed 2026-09-10. Operated with standalone Playwright; copy failure domains, risk controls, live result, and no-capacity scope observed.
- [17NAS NAS Backup Strategy Planner](https://17nas.com/backup-planner.php?lang=en-US), accessed 2026-09-10. Operated with standalone Playwright; default, boundary-low, and mixed high-importance probes, recommendations, costs, and mobile width observed.
- [CISA data backup options](https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf), checked 2026-09-10. Official source for three copies, two media types, and one off-site copy; direct PDF access was restricted in the connector.
- [CISA ransomware guide](https://www.cisa.gov/stopransomware/ransomware-guide), checked 2026-09-10. Official source for offline or isolated backups and regular testing of availability and integrity.
- [NIST SP 800-34 Rev. 1](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), checked 2026-09-10. Official source for RPO, RTO, and recovery-planning tradeoffs; relevant definitions are on page 30.
- [Synology backup storage calculation](https://kb.synology.com/en-in/DSM/tutorial/How_do_I_calculate_storage_size_for_backups), checked 2026-09-10. Official formula source for data, deduplication, daily change, and retained versions; page body access was sparse but the official search result exposed the formula.
- [Synology C2 backup scheduling](https://kb.synology.com/en-us/C2/tutorial/Schedule_backups_C2_Backup), checked 2026-09-10. Official source showing daily, weekly, monthly, and yearly retention concepts.
- [Synology Hyper Backup retention capacity discussion](https://www.reddit.com/r/synology/comments/1l21dxn/struggling_configuring_hyperbackup_to_stay_within_the_limit_of_the_volume_i_have_created/), checked 2026-09-10. Community pain evidence for source size versus local and cloud retained storage.
- [Synology Active Backup retention discussion](https://www.reddit.com/r/synology/comments/tchs8u/a_question_about_number_of_latest_version_to_keep_for_advanced_retention_policy_for_active_backup/), checked 2026-09-10. Community pain evidence for confusing latest-version and advanced-retention settings.
- [Synology versioning and snapshots discussion](https://www.reddit.com/r/synology/comments/zfe7z9/drive_versioning_snapshots_hyper_backup_versions_all_duplicate_data/), checked 2026-09-10. Community pain evidence for duplicate-data and versioning confusion.
- [Backblaze B2 storage cost discussion](https://www.reddit.com/r/synology/comments/18ky4hm/please_help_me_lower_my_backblaze_b2_storage_costs/), checked 2026-09-10. Community pain evidence for retention-driven cloud cost.
- [Synology business retention discussion](https://www.reddit.com/r/synology/comments/15vuh1h/backup_for_business_retention_pc_backup/), checked 2026-09-10. Community pain evidence for full, differential, and retention questions.
- [Stack127 storage calculation engine](https://github.com/stack127labs/stack127), repository context checked 2026-09-10. Local repository source for exact-byte, versioned, structured storage-calculation conventions; implementation must follow the checked-out docs and code.
