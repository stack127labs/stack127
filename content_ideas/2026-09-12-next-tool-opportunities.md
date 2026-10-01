# Next tool opportunities

Research date: September 12, 2026.

Recommend a restic retention simulator first, an rsync filter tester second, a Home Assistant MQTT discovery checker third, and an LXC ID mapping checker fourth. These solve recurring problems using the visitor's own inputs. None has a route or brief in the current checkout.

The opportunity is an easier way to answer an existing question. This research does not establish that nobody has built a similar tool, that the keywords have high search volume, or that stack127 can rank easily.

## Evidence and limits

- Search backend: web connector. The configured SearXNG helper failed at `http://127.0.0.1:8080/search` with `fetch failed`. It attempted `bing,duckduckgo`; it returned no evidence from either engine.
- Search engines used by the working connector: not individually available. This is not a measured Google top-ten audit.
- Browser backend: standalone Playwright CLI, version 1.60.0, Chromium, 1365 × 900. The in-app Browser returned `No browser is available` and an empty discovery list. Chromium required the approved execution boundary after its initial sandbox launch failed with `Operation not permitted`.
- Observed means a page or interaction was inspected directly. Documented means primary documentation supports the statement. Inferred means an editorial judgment from the collected evidence.
- Monthly search volume, keyword difficulty, backlink strength, stack127 Search Console impressions, and expected traffic are unknown. No traffic or ranking promise is made.
- A Reddit page fetch failed. Reddit results are used only as search-snippet demand signals, supplemented by accessible project forums, documentation, and a mailing-list thread.
- Inspected local routes, briefs, implementation-report filenames, and earlier ideas. Route existence is not evidence of production publication. Production database state was not queried.
- This is topic discovery. No implementation, publication, or deployment is included.

## Ranking

Scores are editorial judgments from 1 to 5, not SEO metrics. Gap scores describe the narrow proposed job, not all searches containing the product name. The total follows the topic-research rubric; build order also accounts for maintenance and scope.

| Priority | Tool | Demand | Gap | Fit | Feasibility | Moat | Total | Build burden |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Restic retention simulator | 4 | 5 | 5 | 4 | 4 | 22/25 | Medium, precise calendar and grouping behavior |
| 2 | Rsync filter tester | 4 | 5 | 5 | 4 | 4 | 22/25 | Medium, matching and directory traversal |
| 3 | Home Assistant MQTT discovery checker | 4 | 5 | 5 | 3 | 4 | 21/25 | Medium to high, versioned schema maintenance |
| 4 | LXC ID mapping checker | 5 | 3 | 5 | 4 | 4 | 21/25 | Medium, range validation and explanations |

The first two have the best balance of a missing browser workflow and manageable scope. The last two are strong backlog candidates. Correct rule traces and tested examples offer a modest advantage; none has a large proprietary-data moat.

## 1. Restic retention simulator

- [ ] Research and build `/restic-retention-simulator`.

**User problem.** A backup operator cannot tell which snapshots a policy will retain, especially when daily and weekly rules overlap, backups are missed, or snapshots belong to different groups.

Target queries: `restic retention policy`, `restic forget keep daily`, `restic keep weekly`, `restic retention simulator`, `restic keep within vs keep`.

**Evidence.** A June 2026 [restic forum question](https://forum.restic.net/t/too-few-snapshots-with-restic-forget-keep-weekly/10896) asks why four requested weekly snapshots appear to produce only three. A separate [2024 discussion](https://forum.restic.net/t/confusion-about-keep-daily-option/7888) asks why two snapshots on the same day both survive. These are concrete requests to understand selection behavior, not just requests for a backup tutorial. The [official retention documentation](https://restic.readthedocs.io/en/stable/060_forget.html) defines the rules, and the [JSON scripting contract](https://github.com/restic/restic/blob/master/doc/075_scripting.rst) exposes snapshot groups and retention reasons.

**Competition.** The searches for restic retention simulators and visualizers returned documentation, forums, and broader backup applications. I did not identify a dedicated restic browser simulator in those results. Proxmox has an [official prune simulator](https://pbs.proxmox.com/docs/prune-simulator/), which I operated. This establishes an existing adjacent tool, not an empty market for all retention calculators. A restic implementation must follow restic semantics rather than copy Proxmox's algorithm.

**MVP.** Accept a backup schedule or pasted snapshot JSON and a bounded set of restic retention flags. Show a calendar and a table of snapshot time, group, kept/removed result, and every matching reason. Include missed-backup examples and the relevant dry-run command. Required fields include timestamp, snapshot ID, host, paths, tags, grouping choice, policy, and rule version. Keep input processing in the browser.

**Why a standalone tool fits.** It calculates the answer from user-specific snapshots and policy. It does not need a curated app inventory. The entity name identifies a rule engine, not a lookup of editorial facts.

**Build boundary.** Test against a pinned restic release and representative dry-run output. Start with last, daily, weekly, monthly, yearly, and clearly defined within behavior. Mark unsupported flags explicitly. A preview must never claim a backup is safe or recoverable, estimate exact reclaimed bytes from snapshot counts, or execute deletion. The existing 3-2-1 calculator addresses backup planning, not snapshot selection.

**SEO judgment.** Strong narrow gap, medium confidence. The natural demand is mostly expressed as retention questions rather than the word simulator. The page needs worked examples for those questions alongside the tool. Search volume is unknown.

## 2. Rsync filter tester

- [ ] Research and build `/rsync-filter-tester`.

**User problem.** A user writes include and exclude rules, but a wanted file is skipped because a parent directory was excluded or an earlier rule already matched.

Target queries: `rsync exclude not working`, `rsync include exclude`, `rsync filter tester`, `rsync exclude pattern`, `rsync include subdirectory`.

**Evidence.** The [official rsync manual](https://rsync.samba.org/ftp/rsync/rsync.1) documents rule order, transfer-root anchoring, parent traversal, and `--debug=FILTER`. The project's [mailing-list discussion](https://lists.samba.org/archive/rsync/2006-June/015744.html) records filter and quoting confusion. Search results also surfaced [a 2024 rule-order discussion](https://www.reddit.com/r/commandline/comments/1ego4n0/) and [a 2026 exclude-from problem](https://www.reddit.com/r/techsupport/comments/1u3a6jj/rsync_excludefrom_wont_exclude_filenames_starting/). The Reddit evidence is snippet-only.

**Competition.** Several rsync command generators exist, including [VariedTools](https://www.variedtools.com/generate-rsync-command), [Rynctl](https://rynctl.com/), and [FireLinux](https://www.firelinux.com/tools/rsync-command-generator/). I inspected VariedTools in Chromium. Its visible workflow builds a command from paths and flags; it does not provide a file-tree filter trace. The filter-tester and playground queries did not surface a dedicated equivalent. That is a bounded search finding, not proof of absence.

**MVP.** Paste ordered rules and a small file tree. Return included, excluded, or not visited for each path, with the first matching rule or excluded parent. Fields include relative path, file/directory type, transfer root, rule text, rule order, disposition, and explanation. Support source trailing-slash behavior and a few worked examples. A tree plus a rule-result table makes the answer inspectable.

**Why a standalone tool fits.** Every result follows from the user's rules and paths. No external service or app catalog is needed. The Dockerignore tester is a useful implementation-pattern reference, but its matching semantics must not be reused as rsync rules.

**Build boundary.** Begin with common sender-side include/exclude syntax. Treat merge files, receiver-side deletion filters, shell expansion, and missing filesystem context as explicit unsupported cases unless implemented and verified. Validate the engine against real rsync on synthetic fixtures. The page reports filter selection, not a guarantee about the complete transfer or deletion outcome.

**SEO judgment.** Strong narrow gap, medium confidence. It covers more general Linux and NAS workflows than the other shortlisted tools, but tutorial publishers also compete for the problem queries. A generic command generator would lose the distinction.

## 3. Home Assistant MQTT discovery checker

Retired on October 1, 2026. Home automation tools are outside the current product focus.

**User problem.** An MQTT message reaches the broker, but Home Assistant does not create the expected device or entity. The user needs to find a malformed topic or payload without repeated publish-and-restart attempts.

Target queries: `home assistant mqtt discovery not working`, `mqtt discovery payload`, `mqtt discovery validator`, `home assistant mqtt discovery json schema`.

**Evidence.** In [MQTT Discovery JSON Schemas](https://community.home-assistant.io/t/mqtt-discovery-json-schemas/905165), several developers ask for machine-readable schemas and explain the limits of manual testing. A separate [discovery troubleshooting thread](https://community.home-assistant.io/t/mqtt-discovery-does-not-seem-to-run/336276) concerns a payload field. The [official integration documentation](https://www.home-assistant.io/integrations/mqtt) and [discovery implementation](https://github.com/home-assistant/core/blob/dev/homeassistant/components/mqtt/discovery.py) provide the technical basis.

**Competition.** Search results emphasized documentation, example code, and libraries such as [ha-mqtt-discoverable](https://github.com/unixorn/ha-mqtt-discoverable). These help generate messages; they do not establish an existing paste-topic-and-payload browser checker. No dedicated direct competitor was identified in the checked results, so no such competitor was operated.

**MVP.** Accept discovery topic, JSON payload, configured prefix, and the supported Home Assistant rule version. Expand abbreviations and show field-specific errors with expected values. Check the discovery envelope and topic structure for all documented message forms. Add component-specific checks only where the schema is implemented; return an explicit incomplete result elsewhere. Required data includes platform, message form, normalized keys, field paths, rule IDs, and source version.

**Why a standalone tool fits.** It parses and evaluates user-supplied configuration against a finite protocol contract. It does not ask visitors to choose an app from an incomplete curated catalog. Common-envelope checks remain useful even where deeper platform validation is incomplete.

**Build boundary.** This is the highest-maintenance candidate. Investigate schema extraction against a pinned Home Assistant release before committing to the full build. Never report that discovery will work merely because the supplied payload passes checks. Broker connectivity, retained-message state, templates, and live entity conflicts may remain unknown. It is distinct from the existing energy-entity checker, which evaluates entity attributes after an entity exists.

**SEO judgment.** Strong apparent gap and excellent audience fit, medium confidence. Only some discovery failures are payload failures, so the page must help the user identify that boundary quickly.

## 4. LXC ID mapping checker

- [ ] Research and build `/lxc-idmap-checker`.

**User problem.** A Proxmox operator has a bind mount showing unexpected ownership or a container that reports a `newuidmap` or `newgidmap` error. They need to understand their existing mapping.

Target queries: `lxc idmap checker`, `proxmox uid gid mapping`, `newgidmap range not allowed`, `proxmox lxc bind mount permissions`.

**Evidence.** The [Proxmox forum tool thread](https://forum.proxmox.com/threads/lxc-id-mapping-tool.143186/) includes reports of confusion about mapping direction and generated output. Several additional user-mapping questions surfaced in search, including [UIDs between LXCs](https://www.reddit.com/r/Proxmox/comments/1q8esij/uids_between_lxcs/). Technical mapping behavior is documented in the [LXC configuration manual](https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html). The Proxmox unprivileged-container wiki returned HTTP 403 through the web connector.

**Competition.** [DiyMediaServer](https://diymediaserver.com/page/tools/proxmox-lxc-idmap/) and [Kloknibor](https://kloknibor.github.io/proxmox-lxc-id-mapper/) already have generators. I operated DiyMediaServer with UID 1000 and GIDs 44 and 104 and observed generated mapping lines and subordinate-ID output. Its visible inputs focus on generation. Do not pitch another basic generator as an unbuilt idea.

**MVP.** Paste existing `lxc.idmap` lines plus optional subordinate-ID grants and an ID to trace. Show host/container ranges, overlaps, holes affecting the requested ID, and whether supplied grants cover the mapping. Required fields include mapping type, container start, host start, length, grant owner, grant start/length, and queried UID/GID. Show UID and GID results separately.

**Why a standalone tool fits.** Range arithmetic and grant coverage are computed entirely from user inputs. App-specific examples can illustrate the same generic engine without an app picker or compatibility database.

**Build boundary.** A hole in a mapping is not automatically an error. Distinguish unmapped IDs from malformed or overlapping ranges. Do not reduce all filesystem access failures to UID arithmetic, or claim to prove security, ACL behavior, or live mount access. Review the actual Proxmox and Linux subordinate-ID rules during tool-specific research.

**SEO judgment.** More visible competition than the first three. Worth building only around diagnosis and error queries. A simple generator is not recommended.

## Ideas to hold or reject

| Idea | Decision | Evidence |
| --- | --- | --- |
| Generic Docker/ARM image checker | Hold. Reconsider only for checking all public image references in a Compose file together. | [RepoFlow](https://www.repoflow.io/tools/docker-image-browser), [registry explorer](https://explore.ggcr.dev/), registry UIs, and [Arm's official inspection guide](https://learn.arm.com/learning-paths/cross-platform/docker/check-images/) already cover parts of the task. The earlier July proposal overstated the absence of browser lookups. |
| Zigbee/Wi-Fi channel planner | Reject as a low-competition priority. | Direct tools surfaced at [WhatIsMyIP](https://www.whatismyip.com/wifi-interference-planner/), [Division Software](https://divsoftware.nl/en/tools/zigbee-wifi-channel/), and [Home Automations](https://home-automations.net/tools/zigbee-wifi-channel-planner/). Search evidence only; no quality ranking between them. |
| WireGuard AllowedIPs calculator | Reject as a low-competition priority. | [Pro Custodibus](https://www.procustodibus.com/blog/2021/03/wireguard-allowedips-calculator/) and [Tim Crisp](https://tim-crisp.github.io/wireguard-allowed-ips-calculator/) already provide direct calculators. |
| Generic LLM VRAM/KV-cache calculator | Reject as a low-competition priority. | Numerous direct tools surfaced, including [LLMFit](https://llmfit.dev/tools/vram-calculator/), [Spoold](https://spoold.com/tools/llm-ram), and [HeyTensor](https://heytensor.com/tools/kv-cache-calculator). |
| Compose checker, Dockerignore tester, energy-entity checker, storage calculators, app-resource planner | Exclude as duplicates. | Routes and briefs exist in this checkout, including uncommitted work. No claim about their public launch status. |

## Browser observations

All observations below were made on September 12, 2026 at 1365 × 900 using standalone Chromium. These were functional spot checks, not complete competitor audits or mobile reviews.

| Page | Input/state | Observed result |
| --- | --- | --- |
| DiyMediaServer LXC mapping tool | UID `1000`; GIDs `44, 104`; unprivileged mode | Generated UID/GID mapping ranges and subordinate-ID text. Visible workflow has separate UID/GID lists and no pasted-existing-config input. |
| Proxmox prune simulator | `keep-last=1`; daily and weekly fields blank; Update Simulation | Newest displayed snapshot marked kept for keep-last; following snapshots marked remove. Calendar and reason table present. |
| Proxmox prune simulator | Daily and weekly fields set to `0` | Inline minimum-value errors appeared. This is an invalid-input observation, not evidence that zero is a supported policy value. |
| VariedTools rsync generator | Source `/srv/photos/`; destination `/backup/photos/` | Path fields accepted the sample input. The inspected generated-command text remained blank during the check, so successful generation was not verified. No file-tree filter trace in the inspected interface. |

## Query record

The following exact queries were among those submitted to the web connector. They cover problem wording, named tools, alternatives, and primary evidence. URLs used to support decisions are linked in the sections above. Search-result snippets were not treated as operated tools.

| Candidate | Queries |
| --- | --- |
| Restic | `restic retention policy simulator calculator`; `restic forget retention visualizer online`; `restic retention policy visualizer`; `restic forget keep daily weekly unexpected forum`; `restic retention simulator web tool`; `"restic" "simulator"` |
| Rsync | `rsync filter tester online`; `rsync exclude filter tester playground`; `rsync exclude not working include parent directory`; `rsync filter tester online tool playground simulator`; `rsync command generator online`; `rsync filter include exclude confusion site:lists.samba.org` |
| MQTT | `home assistant mqtt discovery payload validator`; `home assistant mqtt discovery not working payload`; `mqtt discovery validator tool online home assistant json`; `mqtt home assistant discovery json validator github` |
| LXC | `proxmox lxc uid gid mapping calculator`; `proxmox lxc idmap validator checker` |
| Docker architecture | `docker compose image architecture checker online`; `docker image architecture check online manifest browser`; `container registry explorer architecture explore.ggcr.dev`; `"no matching manifest" "arm64" site:github.com/issues` |
| Rejections | `zigbee wifi channel interference calculator`; `wireguard allowedips calculator tester online`; `LLM VRAM calculator context KV cache` |

## Build and search validation order

1. Run tool-specific research and product planning for restic. Pin semantics and prove sample results against the real program before UI work.
2. Follow with rsync, keeping the first release limited to an accurately modeled rule set.
3. Prototype MQTT schema extraction before assigning it a delivery date.
4. Advance LXC only with an existing-config diagnostic contract.

Each page should keep its examples, rule explanations, and limitations server-rendered on one flat canonical URL. Link restic and rsync from relevant backup/storage pages and the self-hosting course. Link MQTT from the existing Home Assistant and device content. Avoid creating near-identical pages for each error phrase.

After launch, use actual Search Console query impressions and tool-use data to decide expansion. An early review after roughly six to eight weeks can identify indexing problems and initial query fit; it is not a deadline for ranking. Sparse competition without impressions may indicate low demand, not a missed SEO trick.
