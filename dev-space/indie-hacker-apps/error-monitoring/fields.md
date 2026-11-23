# Proposed facts for error monitoring apps

Proposal checked on 2026-11-04. This is a field-list test, not finished research for any app. The owner should approve or change this list before per-app research starts.

## Collection rules

1. Keep one product identity with aliases for old names. Give plans, editions, and hosted/self-hosted versions their own facts under it. Do not combine a free local edition with paid cloud features.
2. Every factual value needs its **own source URL and checked date**, including no/false answers. A homepage citation for a whole app does not prove pricing, retention, or license terms.
3. Use this evidence shape for every value: `field_id`, `value`, `unit`, `plan`, `edition`, `deployment`, `applies_to`, `source_url`, `checked_at` (`YYYY-MM-DD`), `source_updated_at` if shown, and a short `source_note`. `applies_to` names the signal or check type, such as logs, errors, or browser checks. This is a proposed record format, not a database change.
4. Use `confirmed`, `unknown`, `not_published_in_checked_sources`, `not_applicable`, `conflicting`, or `derived` as the evidence state. A field can be required while its value remains unknown. Never turn a blank table cell or a failed fetch into "no" or zero.
5. Official pricing, documentation, terms, repositories, and announcements establish facts. Comparison sites, reviews, and community threads discover candidates and questions. They do not establish facts about competitors.
6. For `conflicting`, preserve both URLs, dates, plan labels, and claims. Prefer the current plan-specific documentation when it clearly resolves the conflict. Otherwise leave the value unresolved. Do not silently pick the cheaper claim.
7. A derived price needs the official rate sources, exact workload, units, arithmetic, included allowance, chosen plan, and limitations. It must say **estimated**, not quoted. Never invent an exchange rate or substitute trial credits for an ongoing free tier.
8. Separate an app's home country, buyer eligibility, storage location, and check locations. A European company can store data elsewhere. A check location says where the probe runs, not where errors are stored.
9. "Open source" needs an exact license link for the edition being described. Separate open source, source-available, and proprietary self-hosted software. An open-source agent or SDK does not make the hosted service self-hostable.
10. Record sources without accounts or form submissions. A signup button proves only an advertised offer. Mark actual installation, ingestion, alert delivery, support quality, and performance as untested unless later authorized and tested.
11. Suggested upkeep: recheck prices, limits, overage rules, and product availability every 90 days and before any price-led chart is published. Recheck the affected fields after a rebrand, retirement, or pricing notice. These are editorial targets, not a new scheduled job.

`Required` means every later app review should address the field, allowing an evidence-backed unknown. `Required if relevant` means only the matching product type must answer it. Optional fields must never block a complete record.

## Shared fields

| ID / field | What it means | Why a reader needs it | Value format | Normal source | Requirement |
| --- | --- | --- | --- | --- | --- |
| C01 Product identity | Current name, official URL, and old names. | Avoids dead links and duplicate choices. | Text + canonical URL + alias list. | Official site and redirect; rebrand announcement. | Required |
| C02 Jobs it covers | Errors, uptime, logs, performance, status pages, missed jobs, server health, or provider outages. | Stops a status page being mistaken for an error tracker. | One primary type + multiple capability tags; detection versus communication label. | Product pages and docs. | Required |
| C03 Availability and product changes | Active offer, beta, announced retirement, acquisition, or uncertain operation. | Avoids choosing a product that is closing or changing. | State + announcement date + successor + current source; unknown ownership allowed. | Official announcement, changelog, product page, repository. | Required |
| C04 Home region and eligible buyers | Vendor's country and any published buyer or market restrictions. | Helps readers who need a local vendor or cannot buy everywhere. | Country/region lists, restriction note, or unknown. Keep country separate from markets. | About page, company terms, supported-country policy. | Optional |
| C05 Hosted and self-hosted options | Whether the vendor runs it or you can run the complete service. | Shows who handles the server and owns the data. | Hosted / self-hosted / both / platform-only; exact edition. | Deployment and installation docs. | Required |
| C06 License and code | Exact software license and official source repository, when available. | Prevents "free to view" being confused with open source. | License identifier + license URL + repository URL + edition. | Official repository license file and commercial terms. | Required if source or self-hosting is offered |
| C07 How billing works | Currency, charging unit, monthly/annual billing, minimum bill, and commitment. | A low unit price can still require a large contract. | Currency + unit + period + minimum + commitment; store annual total and monthly equivalent separately. | Pricing page and billing docs. | Required |
| C08 Ongoing free plan | What stays free after any trial and whether commercial use is allowed. | Shows what a side project can keep using. | Yes / no / unknown; quotas, units, reset period, users, projects, retention, eligibility, and card requirement. | Free-plan terms, pricing table, billing docs. | Required |
| C09 Trial | Temporary evaluation period and card or automatic-charge rules. | Separates a free trial from a free plan. | Days, included credits, card required, auto-charge, eligibility; no trial or unknown allowed. | Trial and pricing terms. | Optional |
| C10 Smallest useful paid plan | Lowest published paid offer for the relevant job, including its limits. | Gives a useful starting cost rather than a misleading headline. | Plan + price + billing period + included usage and features + minimum; quote required / unknown allowed. | Current pricing and purchase terms. | Required |
| C11 Cost at set usage levels | Estimated recurring price for small, growing, and busy workloads. | Shows when an affordable start becomes expensive. | Three estimates for each relevant workload family, with assumptions and official rate links; unsupported / unknown allowed. | Official rate card or public calculator. | Required if price can be calculated; otherwise report why |
| C12 When a limit is exceeded | Whether data stops, is sampled, needs an upgrade, or creates a charge. | A noisy bug can hide errors or create a surprise bill. | Per quota: behavior, grace, burst rules, rate, automatic upgrade, reset period. | Quota and billing docs. | Required |
| C13 Bill controls | Hard spending cap, usage alert, per-project quota, and whether each really stops charges. | A warning email is not a spending cap. | Separate yes/no/unknown values + scope + plan + what stops. | Cost-management and quota docs. | Required |
| C14 Data retention | How long each kind of data stays searchable, viewable, or archived. | A long incident history is not necessarily long raw-log retention. | Per plan and signal: duration + unit + searchable/archive split + extension cost. Allow count-based history. | Pricing and retention docs. | Required |
| C15 People, apps, and projects | User, project, site, environment, and alert-recipient allowances. | One person with several apps may hit project limits first. | Separate counts + paid-seat cost + scope + plan. | Pricing and account docs. | Required |
| C16 Languages and frameworks | Which app stacks have a supported client library. | The monitor must work with the reader's app. | Language/framework/runtime + official/community status + supported versions if stated. | SDK and integration docs. | Required if code instrumentation is needed |
| C17 Alert channels and costs | Email, chat, webhooks, push, SMS, and phone support. | Readers need an alert they will notice and can afford. | Channel list + plan + included credits + extra cost + country restrictions. | Notification docs, pricing, delivery terms. | Required |
| C18 Alert noise and escalation | Ways to group, delay, mute, route, acknowledge, and repeat alerts. | Repeated alerts can make a solo builder ignore a real outage. | Separate capabilities with plan and limitation notes. | Alert-rule and incident docs. | Required |
| C19 Deployment fit | Browser, mobile, server, containers, serverless, and private-network compatibility. | A server agent may not run on the reader's hosting platform. | Environment tags + named supported hosts/runtimes + installation method and constraints. | Platform integration and deployment docs. | Required |
| C20 Sending data in | Supported paths for logs, errors, metrics, and traces. OpenTelemetry is a shared format for this data. | Shows whether existing clients can be reused. | Protocol/standard + signal + version or compatibility caveat; API, SDK, agent, syslog, OTLP, or webhook. | Ingestion and integration docs. | Required if the app accepts monitoring data |
| C21 Export and deletion | How to retrieve data or remove it when leaving. | Reduces lock-in and keeps sensitive data manageable. | API/export formats, archive destination, rate/plan limits, deletion controls; unknown allowed. | API, export, privacy, and deletion docs. | Required |
| C22 Sensitive-data controls | Filtering passwords, request bodies, personal details, and recorded screens. | Error and replay data can contain private user information. | Client/server filtering, default masking, exclusions, storage controls, plan limits. | Security and SDK docs. | Required when user/app data is collected |
| C23 Storage regions and data terms | Where collected data is stored and whether a data-processing agreement is available. | Helps readers with customer data-location requirements. | Per signal/edition: region choices, defaults, subprocessors/DPA URL; unknown allowed. | Data-residency docs, security terms, DPA. | Optional |
| C24 Setup path | What a builder must install or configure before useful data arrives. | Distinguishes one script from a monitoring stack that needs several services. | Short documented steps + dependencies + config/code required; do not invent minutes. | Official getting-started docs. | Required |
| C25 Help and documentation | Public docs, support channels, and any published support entitlement. | A solo builder needs a way to recover when setup fails. | Docs URL + channel + plan; response time only if contractually published. | Support policy, docs, plan table. | Optional |
| C26 Limits and source conflicts | Important gaps, unusual conditions, and unresolved contradictory claims. | Prevents a neat comparison from hiding a condition that changes the choice. | Short notes with affected fields and both sources where needed. | Field research and conflicting official sources. | Required |
| C27 Evidence and freshness | Evidence attached to every collected value. | Readers can check facts and see how old they are. | The field-level evidence shape above; include failed-check and unresolved states. | Every source actually opened. | Required for every fact |

## Fields that depend on the product type

| ID / field | What it means | Why a reader needs it | Value format | Normal source | Requirement |
| --- | --- | --- | --- | --- | --- |
| E01 Error grouping and coverage | Which crashes and handled/unhandled errors are collected and how repeats form an issue. | Ten thousand events might be one bug or many. | Error types + grouping/merge controls + dropped-event counters + plan. | Error capture and grouping docs. | Required for error trackers |
| E02 Readable error locations | Stack traces, source maps, native symbols, and code context. These turn a crash into a readable code location. | A notification alone may not tell you what to fix. | Supported platforms + mapping/symbol upload method + storage limits. | SDK, source-map, and symbol docs. | Required for error trackers |
| E03 Release and fix tracking | Link errors to a deployment, version, commit, or recurring problem. | Shows whether a new release caused or fixed a bug. | Supported links + regression/release controls + plan. | Deployment and release docs. | Required for error trackers |
| E04 Context and replay | Breadcrumbs, affected users, request context, or a replay of the failing session. | Helps reproduce a problem that only some users see. | Per context type: support, platform, privacy setting, quota, extra price. | Context, replay, and privacy docs. | Optional |
| U01 Check types | Website, API, port, DNS, browser action, keyword, or other service check. | A page can load while login or checkout is broken. | Check/protocol list + assertions + authentication/private-endpoint support. | Check-type docs. | Required for uptime/synthetic tools |
| U02 Check frequency and timeout | How often a check runs and how long it waits. | A five-minute check can miss a short failure. | Free and entry-paid minimum interval in seconds, supported range, timeout, per-check limits. | Pricing and check settings docs. | Required for uptime/synthetic tools |
| U03 Probe locations and check counting | Where checks run, whether private probes exist, and how multiple locations consume allowance. | Five locations may create five times the billable checks. | Location list + selectable count + private-probe support + billable-run rule. | Probe docs, location lists, billing definitions. | Required for uptime/synthetic tools |
| U04 Failure confirmation and maintenance | Retries, location agreement, recovery tests, and planned pauses. | Prevents one bad probe or planned work from raising a false alarm. | Published retry/confirmation rules + maintenance behavior + unknown where unstated. | Check behavior and alert docs. | Required for uptime/synthetic tools |
| U05 Certificate and domain expiry | Warnings before certificates or domains expire. | These can take a healthy app offline. | Certificate/domain/DNS checks + notice windows + plan. | Expiry and DNS docs. | Optional |
| L01 Log allowances and loss | How log size or count is measured, and when records are trimmed, sampled, or rejected. | Compressed GB and raw GB are different amounts of app data. | Raw/compressed/indexed unit, event size, rate limits, sampling/dropping rules, counters. | Ingestion limits and metering docs. | Required for log products |
| L02 Searching and archives | Search, live log viewing, structured queries, and archived-data retrieval. | Old data may exist but be slow or expensive to retrieve. | Search functions + archive method + retrieval limits/costs + plan. | Search, storage, and archive docs. | Required for log products |
| L03 Query and extra-data charges | Charges beyond data sent in, such as storage, scanning, indexes, or export. | Ingest-only charts can understate the real bill. | Published billable operations + rates + included quota + plan. | Billing definitions and rate cards. | Required if separately charged; otherwise explicit none/unknown |
| A01 Slow-request diagnosis | Traces, slow database queries, service links, and code profiling. A trace follows one request through the app. | Explains why the app is slow, rather than only reporting that it is slow. | Separate supported features + runtime/plan limits. | APM and tracing docs. | Required for APM tools |
| A02 Performance-data sampling | How requests are selected for storage and counted for billing. | A low-cost plan may keep only part of the evidence. | Sampling mode/rate controls + retained/ingested units + exclusions + plan. | Tracing collection and billing docs. | Required for APM tools |
| A03 Real-user performance | Slow pages, network failures, and mobile freezes experienced by real users. | Uptime probes cannot show every user's experience. | Browser/mobile support + measured signals + session allowance and price. | Real-user monitoring and mobile docs. | Optional |
| S01 Status-page limits and branding | Page/component counts, own domain, branding, and private pages. | A free page may not support the product's domain or audience. | Separate limits and feature values by plan. | Status-page docs and plan table. | Required for status-page tools |
| S02 Subscriber notifications | Who can subscribe and how outage updates reach them. | A status page needs a way to inform waiting customers. | Subscriber limits + channels + credits/costs + plan. | Subscription and notification docs. | Required for status-page tools |
| S03 Status update source | Manual updates, monitor-driven updates, integrations, and incident history. | A hosted page may not detect outages by itself. | Manual / automated / both; trigger source + history duration + supported integrations. | Automation and incident docs. | Required for status-page tools |
| J01 Schedule and grace rules | Schedule syntax, time zone, allowed delay, and expected duration. | A backup can fail by starting late or running too long. | Schedule modes + timezone/DST handling + grace/duration controls. | Cron and heartbeat docs. | Required for job monitors |
| J02 Job failure signals | Missing ping, explicit failure, start/end signals, and captured job output. | Detects more than a job that never starts. | Supported signals + run-history limit + alert triggers. | Job integration and ping API docs. | Required for job monitors |
| H01 Self-host requirements | The server, storage, database, and other services required. | A free license can need more infrastructure than the app itself. | Official minimum/recommended CPU, memory, disk, dependencies, architecture; workload caveat. | Installation and sizing docs. | Required for self-hostable options; unknown sizing allowed |
| H02 Self-host running cost | Estimated hosting, storage, backup, and paid-license cost for the same workload. | Makes hosted/self-hosted comparisons less misleading. | Scenario estimate with host rate sources, assumptions, and excluded labor; unknown if sizing is missing. | Official sizing/license docs + named host's public pricing. | Optional; do not publish guessed costs |
| H03 Self-host upkeep | Upgrade, backup, restore, security, and supported-release guidance. | The owner becomes responsible for keeping the monitor running. | Docs URLs + release/support state + backup/restore procedure availability; no subjective maintenance score. | Project releases, security policy, operations docs. | Required for self-hostable options |

## Comparable cost scenarios

Use separate workloads, not one overall cheapest-app ranking. These are proposed editorial inputs, not claims about typical indie-hacker usage. Keep results unknown until researched.

| Family | Small | Growing | Busy | Conditions held constant |
| --- | --- | --- | --- | --- |
| Error tracking | 5,000 reports/month | 50,000 reports/month | 500,000 reports/month | One builder, three apps, 30 days of error detail, no paid replay or AI extras. Show unsupported retention or project count. |
| Uptime | 5 endpoints | 25 endpoints | 100 endpoints | 60-second HTTP checks, one location, 30-day month, email alerts, one own-domain status page. Required runs are endpoints × 43,200; add extra confirmation runs if billed. Show three-location cost separately. |
| Browser checks | 1 critical user flow | 5 critical flows | 20 critical flows | Every five minutes, one location, 30-day month; one run is the vendor-defined full execution. Keep separate from cheap HTTP checks. |
| Logs | 5 GB/month | 50 GB/month | 250 GB/month | 30-day searchable retention, one builder, no archiving; state raw versus compressed GB. Query volume is unknown unless the estimate specifies it. |
| Performance | 1 million requests/month | 10 million requests/month | 50 million requests/month | Two app services on two 1-vCPU hosts, one builder, 10% trace sampling, 14-day trace retention. Ten spans per sampled request and 1 KB per span only when byte metering needs an estimate; label as assumed. Host-unit products may need a different explicit estimate. |
| Scheduled jobs | 5 jobs | 25 jobs | 100 jobs | Each runs hourly, with start and success signals: jobs × 1,440 pings/month; email failure alerts. State when a vendor counts jobs instead of pings. |
| Status pages | 1 page / 100 subscribers | 1 page / 1,000 subscribers | 3 pages / 10,000 subscribers | Public pages, own domains, 10 components/page, email updates; assume four incident updates/month for notification-priced services. Detection cost is separate. |

Use monthly billing when available. Show annual-billing savings in a separate value. Keep original currencies. Conversion needs a named dated exchange-rate source later. Show taxes, SMS/calls, query scanning, extended retention, extra seats, and required bundles beside the estimate when they are excluded. Do not rank a quote-only price as zero or invent a quote.

For logs and traces, processed bytes, stored bytes, and queried bytes may differ. If a public calculator needs unknown query or compression inputs, report a range from explicitly chosen inputs or leave the estimate unknown. For host-based APM, state host size and active hours; do not pretend requests alone set the bill.

## Feasibility test on three different apps

Checked on 2026-11-04 using only public pages. Honeybadger tests a developer error-monitoring bundle. UptimeRobot tests an outside uptime monitor. Grafana Cloud tests a metered logs/performance platform. No accounts or calculators requiring submission were used. No completed app records were created.

- **Easy**: a clear answer or directly usable source was found in the sampled official pages.
- **Hard**: the field needs several docs, plan-specific interpretation, arithmetic, or resolution of conflicting text. Some hard fields remain unresolved.
- **Not published**: no usable answer was found in the bounded sources checked. This does not assert that the vendor never publishes it elsewhere.
- **N/A**: the field does not apply to the tested hosted offer. N/A is not evidence that the entire vendor lacks that feature.

Evidence keys below are links, all checked on 2026-11-04:

- **HP**: [Honeybadger plans and quota FAQ](https://www.honeybadger.io/plans/).
- **HD**: [Honeybadger docs index](https://docs.honeybadger.io/), including SDK, API, release, source-map, and check-in documentation links.
- **HU**: [Honeybadger uptime guide](https://docs.honeybadger.io/guides/uptime/).
- **HS**: [Honeybadger security](https://www.honeybadger.io/security/).
- **HF**: [Honeybadger sensitive-data filtering](https://docs.honeybadger.io/lib/javascript/errors/filtering-sensitive-data/).
- **UP**: [UptimeRobot pricing and comparison table](https://uptimerobot.com/pricing/).
- **UH**: [UptimeRobot help center](https://uptimerobot.com/help/).
- **UL**: [UptimeRobot check locations](https://uptimerobot.com/help/locations/).
- **GP**: [Grafana Cloud pricing](https://grafana.com/pricing/).
- **GB**: [Grafana Cloud cost management](https://grafana.com/docs/grafana-cloud/platform/cost-management-and-billing/).
- **GR**: [Grafana Cloud stack management](https://grafana.com/docs/grafana-cloud/platform/security-and-account-management/account-management/cloud-stacks/create-update-stacks/).
- **GU**: [Grafana Cloud Synthetic Monitoring](https://grafana.com/docs/grafana-cloud/observe-and-act/testing/synthetic-monitoring/).
- **GL**: [Grafana Loki open-source product](https://grafana.com/oss/loki/). This establishes a separate self-managed component, not self-hosting of Grafana Cloud.

A docs index makes a field harder when the underlying answer was not resolved during this short test. It is not a finished source for every linked feature.

| Field | Honeybadger | UptimeRobot | Grafana Cloud |
| --- | --- | --- | --- |
| C01 Identity | Easy: HP | Easy: UP | Easy: GP |
| C02 Jobs covered | Easy: HP, HD | Easy: UP | Easy: GP, GU |
| C03 Availability/changes | Hard: live offer HP; ownership history not settled | Hard: live offer UP; ownership history not settled | Hard: live offer GP; ownership history not settled |
| C04 Home region/eligible buyers | Not published in sampled pages | Not published in sampled pages | Not published in sampled pages; stack region is a different fact |
| C05 Delivery options | Hard: HP puts self-host inquiries in custom sales | Hard: hosted offer clear; no complete self-host documentation found in UH | Easy: GP versus separate OSS in GL |
| C06 Exact license | N/A for tested hosted plan; private deployment terms unresolved | N/A for tested hosted plan | Hard: GL links source; component licenses need separate review |
| C07 Billing basis | Easy: HP | Easy for visible plans: UP; dynamic tiers harder | Hard: GP, GB; platform fee plus different meters |
| C08 Ongoing free plan | Easy: HP | Hard: UP has conflicting feature copy | Easy: GP |
| C09 Trial rules | Hard: HP, HD; all card/charge conditions not resolved | Hard: UP, UH; full trial terms not resolved | Hard: GP; trial and ongoing free allowances need separation |
| C10 Useful paid entry | Easy for base bundle: HP | Hard: UP shows monthly/annual prices together | Easy for platform entry: GP; workload total separate |
| C11 Three usage costs | Hard: HP calculator and several allowances | Hard: UP monitor tiers, run frequency, and branding | Hard: GP, GB; ingest, storage, and query assumptions |
| C12 Over-limit behavior | Easy: HP quota FAQ | Not published clearly in UP/UH sample | Hard: GP, GB; behavior differs by plan and signal |
| C13 Bill controls | Hard: HP describes project limits and optional overages | Not published clearly in UP/UH sample | Hard: GB documents usage alerts; a universal hard stop was not established |
| C14 Retention by signal | Easy: HP separates errors and logging | Easy for listed history periods: UP | Easy: GP separates signals and plans |
| C15 People/apps/projects | Easy for core limits: HP | Hard: UP seat and recipient rules differ | Hard: GP, GR; needs product-specific details |
| C16 Languages/frameworks | Easy: HD | N/A for ordinary outside checks | Hard: GP/GU and integration docs must be separated |
| C17 Alert channels/costs | Hard: HP, HD; channels and any delivery charges need individual checks | Hard: UP, UH; paid channels and message credits | Hard: GP, GB, GU; notification integration page attempted but failed |
| C18 Noise/escalation | Hard: HP, HD link several rule types | Hard: UP, UH; feature gates need resolution | Hard: GU and linked alerting docs |
| C19 Deployment fit | Easy for major paths: HD | Easy for public endpoints: UP; private apps need more work | Hard: GP, GU; instrumented and outside checks differ |
| C20 Data-in protocols | Easy as source discovery: HD; exact compatibility still per SDK | N/A for normal outside checks; push checks handled in J02 | Hard: GP, GL and signal-specific docs |
| C21 Export/deletion | Hard: HD links APIs and archives; deletion terms need more work | Hard: UH API path found; deletion terms unresolved | Hard: GR, GB; export and deletion depend on service |
| C22 Sensitive-data controls | Easy for JavaScript filtering: HF | Hard: request secrets/auth rules need more docs than UP | Hard: GP/GL show several collection paths; masking not resolved |
| C23 Storage/DPA | Hard: HS and HD residency link; plan scope not resolved | Not published in sampled sources; UL is probe geography | Hard: GR; region selection found, signal coverage needs work |
| C24 Setup path | Easy: HD and Ruby getting-started guide | Easy for basic monitor: UH | Hard: GU plus separate ingest setup |
| C25 Help/docs | Easy: HP, HD | Easy: UH, UP | Easy: GP and docs |
| C26 Conflicts/caveats | Easy to capture: HP, HU | Easy to flag conflict: UP; resolution hard | Easy to record metering caveats: GP, GB |
| C27 Evidence/date | Easy to attach to retrieved sources | Easy to attach to retrieved sources | Easy to attach to retrieved sources |
| E01 Error capture/grouping | Hard: HP, HD; exact capture behavior per SDK | N/A | Hard: GP frontend versus application services need separate docs |
| E02 Code locations | Hard: HD links source maps and error reporting | N/A | Not published as one unified field in sampled pages |
| E03 Release tracking | Hard: HD links deploy tracking | N/A | Not published as one unified field in sampled pages |
| E04 Context/replay | Hard: HD; context found, replay limits not resolved | N/A | Hard: GP; service-specific quotas needed |
| U01 Check types | Easy for HTTP: HU | Hard: UP contains conflicting free/paid descriptions | Easy to locate check docs: GU; detail needs follow-up |
| U02 Frequency/timeout | Hard: HP gives plan frequencies; HU covers timeouts | Easy for intervals: UP; detailed timeout needs UH | Hard: GU links check configuration; limits not resolved |
| U03 Locations/check counting | Hard: HU says distributed network, no complete list found | Hard: UL gives locations; metering and selected probes need more docs | Hard: GU explains execution per probe; precise intervals/allowances need more docs |
| U04 Failure/maintenance rules | Hard: HU; not all confirmation rules resolved | Hard: UH; not resolved from pricing copy | Hard: GU; check-specific rules needed |
| U05 Certificate/domain expiry | Easy for certificate warnings: HU; domain support unresolved | Hard: UP conflicting inclusion text | Hard: GU check-type documentation needed |
| L01 Log meter/loss | Hard: HP daily ingestion versus monthly errors | N/A | Hard: GP/GB process, write, retain meters |
| L02 Search/archives | Hard: HD, HP; search and archive sources found | N/A: uptime history is not log management | Hard: GP, GL; archive retrieval not settled |
| L03 Query/extra charges | Hard: HP; bundle and archive costs need separation | N/A | Hard: GP, GB; one ingest rate is insufficient |
| A01 Slow-request diagnosis | Hard: HD lists framework dashboards; depth needs checking | N/A: response time alone is not APM | Hard: GP; features split across services |
| A02 Sampling | Not published in sampled sources at a usable per-signal level | N/A | Hard: GB/GP point to controls; rates need signal-specific docs |
| A03 Real-user performance | Not published in sampled pages | N/A | Easy to locate product offer: GP; exact plan support hard |
| S01 Page limits/branding | Hard: HP quotas visible; per-feature gates need docs | Easy for listed page/domain limits: UP | Not published for a simple customer-facing status page in sample |
| S02 Subscribers/channels | Not published fully in HP/HD sample | Not published fully in UP/UH sample | Not published in sampled sources |
| S03 Page update source | Easy for monitor integration: HU; history needs more docs | Hard: UP/UH; manual versus automated rules need docs | Not published in sampled sources |
| J01 Schedules/grace | Hard: HP/HD; advanced cron is plan-specific | Hard: UP/UH; complete schedule rules not resolved | Not published for a dedicated cron product in sample |
| J02 Job failure signals | Hard: HD check-in docs need follow-up | Hard: UH/UP; exact push behavior needs docs | Not published for a dedicated cron product in sample |
| H01 Self-host requirements | N/A for tested hosted plan | N/A | N/A for Cloud; OSS component requirements separate |
| H02 Self-host cost | N/A for tested hosted plan | N/A | N/A for Cloud; not a $0 OSS hosting estimate |
| H03 Self-host upkeep | N/A for tested hosted plan | N/A | N/A for Cloud; GL is only a separate project starting point |

The self-host fields also received a narrow public-source check using [Uptime Kuma's official repository](https://github.com/louislam/uptime-kuma), checked on 2026-11-04. Installation, license, and storage constraints were easy to locate. Workload-specific sizing, a comparable hosting bill, and a complete upkeep review were hard or unresolved. Keep H01/H03 with unknowns allowed; keep H02 optional. No deployment was performed.

### What the test changed

- Keep billing units, overage behavior, data retention by signal, plan restrictions, and evidence conflicts as required. Their absence can change the choice or the bill.
- Keep headquarters/market restrictions, storage-region details, trial conditions, support promises, replay extras, and self-host cost optional. Missing details must not force guesses.
- For Honeybadger, error quota and log ingestion use different periods. Its retention table also distinguishes error detail from log/event data. HP made these fields easy to locate.
- UptimeRobot's UP table and its FAQ do not agree on all Free versus Solo features. Record the conflict before claiming which plan includes a feature. Its free-plan marketing also needs checking against current commercial-use terms.
- Grafana Cloud's GP/GB pages show why cost needs more than ingestion: platform fees and several data meters matter. Budget alerts must not be described as a guaranteed bill cap.
- Do not require a published "time to first alert," setup minutes, CPU overhead, false-alert rate, outage detection accuracy, or support response speed. These need controlled testing or a published guarantee, neither of which this task includes.
- Do not collect estimated customer counts, revenue, funding, employee totals, market share, or review scores by default. They add upkeep and do not establish whether the app catches a failure or fits the budget.
- "Not published" here is a research-gap label. Later per-app research should follow the relevant official links before finalizing unknowns. The test did not establish complete values for every field.

## Stats and insights these facts could support

| Output | Fields used | Rule for an honest comparison |
| --- | --- | --- |
| Verified choice counts by job | C01 to C03 | Count unique active product identities; show gray and unverified totals separately. Multi-capability counts can overlap and must say so. |
| Ongoing-free versus trial-only options | C07 to C10 | Keep commercial eligibility and each allowance beside the label. Exclude trials from free-plan totals. |
| Cost curves for each workload family | C07 to C15; L01/L03; A02; U03 | Use the same workload, retention, currency basis, billing term, and excluded extras. Leave unknowns off a price ranking. |
| What a free plan actually covers | C08, C14 to C17, U02, S01 | Compare error reports to error reports, not to log lines or trace bytes. Show project limits as well as data limits. |
| Retention versus monthly cost | C11, C14 | Plot searchable error/log/trace retention separately; archive retention is not equivalent. |
| Unexpected-bill and dropped-data rules | C12, C13, L01/L03, A02 | Distinguish hard caps, notification-only warnings, opt-in overages, rejected data, and sampling. No invented risk score. |
| Fast uptime checks for a fixed budget | C11, U01 to U04 | Hold check type and location count constant. Check interval is not measured detection time. |
| Hosted versus self-hostable choices | C05/C06, C24, H01 to H03 | Separate software license from hosting cost; label paid-only features and operator responsibilities. |
| Stack compatibility map | C16/C19/C20, E02, A01 | Show native SDK, community adapter, and protocol-only compatibility separately. |
| Monitoring bundle coverage | C02, C10/C11, E/U/L/A/S/J fields | Show which jobs one subscription covers and which require paid add-ons. Do not imply feature depth is equal. |
| Alert delivery comparison | C17/C18, S02 | Show paid SMS/call credits, recipient limits, and region restrictions. Supported channel is not proof of delivery reliability. |
| Data-location and privacy filters | C22/C23, E04 | Unknown stays visible; do not label a product compliant based only on a marketing badge. |
| "What this tool will not catch" summaries | C02/C26, U01, A01, J02, S03 | For example, a public status page needs another source to detect an outage. Absence claims need evidence. |
| Retirement and migration watchlist | C01/C03/C27 | Preserve old names, dated notices, and successor links. Acquisition alone is not shutdown. |

These are possible charts and comparisons after field approval and per-app research. No market-size, adoption, or reliability claims can be calculated from this discovery list.
