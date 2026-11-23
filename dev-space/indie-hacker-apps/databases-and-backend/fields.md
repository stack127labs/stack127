# Proposed facts to collect

Proposal date: 2026-11-04. Owner approval is still needed before full per-app research. This is a field design, not a finished comparison or a database schema.

Use a shared core, then only the sections that match the product. A backend platform can have database, file, vector, and job sections. A pure object store does not need a database transaction row. A queue does not need a fake database-storage allowance.

**Required** means research the field or explicitly mark it unknown. It does not mean invent an answer when a vendor does not publish one. **Optional** means collect it when useful and directly supported. “Required attempt” makes that rule especially clear for facts often missing from public pages.

## Evidence and value rules

1. Attach a direct source URL and an ISO checked date (`YYYY-MM-DD`) to every factual value, including each number in a limit list. Save the page title and section so a later researcher can find it again. Store a short paraphrase, not a copied pricing page.
2. Tie every value to the named product, edition, plan, deployment mode, billing period, region, currency, and relevant product version. Account-wide, per-project, per-database, and per-user limits must remain distinct.
3. Use these evidence states: **published**, **derived**, **not published after search**, **blocked**, **conflicting**, **not yet checked**, **not applicable**. A separate true/false/unknown value describes a feature. Unknown and not applicable must never become zero, false, or “free.”
4. An unsuccessful search is evidence of a gap in this research, not proof a feature does not exist. For unknowns, record the official URLs searched and why they did not answer the question.
5. Prefer official price tables, docs, licenses, and lifecycle notices. A vendor comparison may supply a candidate name; it does not prove a competitor's price or limit. Community and review pages identify needs and leads, not authoritative product facts.
6. A derived estimate must link every input rate and allowance, show its arithmetic and assumptions, and state excluded costs. If a material meter is unknown, publish an incomplete estimate or range, never an exact total.
7. Preserve GB versus GiB, seconds versus compute-hours, operation counts versus billable blocks, rounding, minimum charges, cached versus uncached transfer, and tax treatment. Do not convert currencies without a dated conversion source. Prefer original currency in this pass.
8. A lasting free tier, trial credits, development-only workspace, and free self-host software are four different things. Record whether a card is required and whether commercial production is allowed when stated.
9. Do not infer legal compliance from a server location or a badge. Collect the vendor's data-location control and link any relevant terms; legal conclusions need separate work.
10. Recheck prices, free limits, and lifecycle status before public release. Suggested maintenance: monthly for prices/limits, quarterly for feature docs, and immediately after a shutdown/rebrand notice. Show each field's actual checked date rather than replacing all dates with the page release date.

## Core

| Field name | Plain meaning | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| C01 identity and old names | Current product, vendor, official URL, and former names. | Avoid duplicate or dead entries. | Text; canonical URLs; alias list. | Official home/about pages and redirect destination. | Required |
| C02 primary type and other roles | Main job, data model tags, and overlaps with other directories. | Find products that solve the right problem. | One primary type; multiple secondary tags; short scope note. | Product overview and docs; researcher labels marked as judgments. | Required |
| C03 hosting and license | Hosted service, self-hosted software, embedded library, or a mix; exact license per edition. | Know who runs it and whether paid software terms apply. | Mode list; license identifier/link; edition; known cloud feature gaps. | Official deployment docs, license file, and edition comparison. | Required; license details only when software is available |
| C04 lifecycle and access stage | Operating, beta, waitlist, maintenance-only, closed to new users, or retiring; parent-company changes. | Avoid building on an unavailable or closing offer. | State; notice URL; effective dates; successor; last release if relevant. | Official notices, changelog, repository, acquirer statement. | Required |
| C05 vendor home and main markets | Stated business location and markets served; not server locations. | Understand provider context without pretending it proves data location. | Country/market list or unknown; exact stated entity when useful. | Official legal/about pages. | Optional |
| C06 signup and use restrictions | Public self-service access, card requirement, trial length, country/account limits, and commercial-use restrictions. | Know whether a solo builder can actually start and keep using it. | Yes/no/unknown per condition; country list; trial duration; plan scope. | Pricing FAQ, signup docs, eligibility terms; never submit signup forms. | Required attempt |
| C07 included backend services | Database, login, files, functions, live updates, jobs, and APIs actually included. | See which extra providers will still be needed. | Capability-to-plan map; native/integration/not offered/unknown. | Official feature docs and plan comparison. | Required |
| C08 app connection options | Supported database protocols, APIs, official client libraries, and runtime limits. | Check whether it works with the reader's language and host. | Protocol list; official SDK languages; server/client/edge support; links. | Quickstart, API, connection, and SDK docs. | Required |
| C09 free offer type | Lasting free allowance, time-limited trial, credit, non-production demo, or free software only. | A free trial is not a lasting free backend. | Offer enum; expiry; reset period; eligibility; production permission. | Pricing page and free-use terms. | Required |
| C10 free limits | Included database/file space, reads/writes, compute, users, projects, seats, and jobs where relevant. | See what the free offer can actually hold or run. | Repeated limit records: metric, value, unit, period, scope, plan, hard/soft. | Pricing and limits docs; never just an unsourced free-plan badge. | Required for any free offer |
| C11 inactivity, pause, and deletion | Whether idle projects sleep, pause, expire, or lose data, and how to restore them. | Avoid a broken app or lost data after a quiet month. | Rule; idle interval; retention window; resume method; unknown if unstated. | Free-plan FAQ, pause/restore docs, retention policy. | Required attempt for hosted products |
| C12 least paid commitment | Smallest ongoing paid plan that permits the target use, including account, project, or seat minimums. | Know the cash needed after free use ends. | Amount; currency; billing term; mandatory seats/projects; tax status; promo flag. | Official prices and billing terms. | Required attempt for hosted/commercial products |
| C13 billing meters | What causes charges, including extra projects, idle instances, failed work, and add-ons. | Explain why the bill grows. | Rate records: amount, currency, unit, tier, rounding, minimum, region, allowance. | Pricing tables, billing docs, official calculator assumptions. | Required for paid usage |
| C14 idle compute and scale to zero | Whether compute stops charging when unused, how it wakes, and which costs continue. | Choose for side projects with uneven traffic. | Supported/unsupported/unknown/N/A; plan; idle threshold; remaining fees; wake behavior. | Autoscaling, sleep, and billing docs. | Required attempt for hosted compute; N/A for storage-only services |
| C15 data transfer costs | Charges for moving data out, between regions, or to another provider; any free allowance. | Large downloads can cost more than storing files. | Rate records with direction, origin/destination, unit, allowance, restrictions. | Network/egress price tables and relevant integration docs. | Required attempt; never infer free from silence |
| C16 overages and bill controls | What happens at a quota; hard limits, budget alerts, spend caps, and their exclusions. | Avoid treating a warning email as a guaranteed bill cap. | Action enum; cap/alert scope; grace period; excluded meters; cutoff/resume behavior. | Billing-limit docs and pricing FAQ. | Required attempt for metered hosted services |
| C17 regions and data location | Where data, backups, workers, and replicas can live; choice versus a best-effort hint. | Choose a nearby location and understand data-location controls. | Region identifiers; component; plan; guarantee/hint; migration restrictions. | Region matrix, residency docs, deployment docs. | Required attempt; legal suitability is not inferred |
| C18 data access controls | How apps restrict records/files and protect service credentials; network/private-access options. | Know what must be configured to keep users' data private. | Feature records; defaults; plan restrictions; setup-doc links. | Official security and access docs, not generic certification badges. | Required basic access; advanced network options optional |
| C19 leaving and deleting | Export formats, backup download, migration path, account deletion, and stated data-removal timing. | Know how to move or close an app. | Export formats; tools; limitations; deletion scope/time; costs linked to C15. | Official migration, export, backup, and deletion docs. | Required attempt; exact deletion timing may be unknown |
| C20 support and service promises | Help included on small plans, public status page, and any contract uptime promise. | Know who helps when the app breaks. | Support channels by plan; status URL; optional SLA percentage, terms, exclusions. | Support FAQ, pricing, status page, formal service-level agreement (SLA). | Required support path; SLA optional |
| C21 small-project and idle cost estimate | Estimated recurring cost for a stated workload and for keeping it idle. | Compare the same job with all required charges shown. | Scenario ID; assumptions; line items; total/range/unknown; currency; formula; date. | Derived from sourced rate records; never call an estimate a vendor quote. | Optional; only when all material inputs are known |
| C22 evidence for every fact | The source and checked date attached to each value, including negative findings. | Let a reader inspect and refresh the claim. | Value; source URL; checked date; source section; plan/mode/region; evidence state; note. | Direct official page/repository; derived values link every input. | Required on every factual value |

## Database details

| Field name | Plain meaning | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| D01 engine and query model | Exact database engine, query language, and compatibility scope. | Postgres-compatible is not always the same as Postgres. | Engine; version policy; SQL/document/graph/key-value; native/emulated; caveats. | Official engine and compatibility docs. | Required for database products |
| D02 transactions and consistency | Whether changes commit together and when other readers see them. | Prevent the wrong choice for money, inventory, or shared state. | Documented transaction/consistency modes; scope and limits, in plain English. | Official database semantics and limitations. | Required attempt for databases; no invented correctness claims |
| D03 capacity and connection limits | Stored size, query/request limits, concurrent connections, pool limits, and per-record size. | See what may break before a free quota runs out. | Metric records with value, unit, scope, plan, changeability. | Official limits, connection, and pooling docs. | Required applicable limits |
| D04 test environments and branches | Separate dev/production projects and copy-on-write database branches, if any. | Test changes without touching live data; include extra cost. | Supported/not supported/unknown; plan; count; lifetime; data-copy behavior. | Branching, local-dev, project, and pricing docs. | Optional |
| D05 backups and restore | Automatic/manual backups, retained days, exact-point recovery, price, and files excluded. | Backups must cover the data the app can lose. | Backup type; scope; frequency; retention; restore path; extra fee; exclusions. | Backup/recovery docs and pricing. | Required attempt for persistent databases |
| D06 replicas and failover | Read copies and automatic switch to a healthy server after failure. | Know whether reliability costs extra. | Features; locations; plan; manual/automatic; additional billable resources. | Replication, availability, and plan docs. | Optional |
| D07 live updates and offline sync | Updates sent to clients and behavior when an app loses its connection. | Differentiate live notifications from full offline data sync. | Live events/offline reads/offline writes/conflict handling; mode; limitations. | Realtime, sync, and client docs. | Optional |
| D08 extensions and specialized indexes | Supported extensions for location data, text search, or vectors. | Avoid a second service where the existing database works. | Supported extension/index names and versions; plan and host limitations. | Extension catalog and search docs. | Optional |

## File storage details

| Field name | Plain meaning | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| F01 storage prices | Price for keeping database-independent files, split by hot/archive class. | Estimate file storage without hiding tier differences. | Currency per GB-month/GiB-month; class; region; allowance; replicas billed. | Official storage price tables. | Required for storage; also collect in BaaS storage modules |
| F02 file request and retrieval prices | Prices for upload, list, read, retrieval, and image-processing requests. | A tiny file can have a large request bill. | Rate records per operation/class; billing block; cache behavior; retrieval unit. | Storage billing docs and examples. | Required attempt for metered storage |
| F03 minimum storage and early deletion | Minimum billed capacity, object size, and retention time even after deleting files. | Find hidden floors and early-delete charges. | Capacity floor; billed object size; retained/billed days by class; exemptions. | Pricing footnotes, retention and billing docs. | Required attempt for object storage |
| F04 upload and file limits | Maximum file size, single/multipart uploads, resumable support, and file restrictions. | Know whether user uploads will work. | Size/unit; upload method; request limits; plan; allowed types. | Upload and limits docs. | Required for file storage |
| F05 S3 and other API compatibility | Which storage APIs and individual operations work. | Check if existing upload and backup tools can move across providers. | Protocol; supported/partial; key missing operations; official matrix link. | Official API compatibility docs. | Required attempt for object storage |
| F06 delivery and private files | Public/private buckets, temporary signed links, custom domains, and CDN availability. | Serve app uploads safely and budget file delivery. | Feature records; defaults; plans; separate delivery charges. | Storage access, signed URL, custom-domain, and CDN docs. | Required for app file storage |
| F07 file recovery and protection | Version history, delete recovery, locks, replication, and backup options. | Replication alone does not undo accidental deletion. | Feature; retention; scope; class; plan; limitations; extra charge. | Official versioning, durability, locking, and recovery docs. | Required attempt; advertised durability is optional |

## Vector details

| Field name | Plain meaning | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| V01 vector/index limits | How many numbers each vector can contain and limits on indexes, records, and metadata. | Check embedding-model and tenant fit. | Dimensions; record/index/namespace limits; data type; plan; index mode. | Vector limits and index docs. | Required for dedicated vector products; optional for others |
| V02 filters and mixed search | Combine meaning-based search with keywords and data filters. | Match the app's search needs, not just a vector badge. | Dense/sparse/keyword/hybrid support; filters; multi-tenant isolation; limits. | Official query and search docs. | Optional |
| V03 embedding and reranking extras | Whether turning text into vectors or reordering results needs another service and bill. | A database quote may omit AI-model costs. | Included/optional/external; provider; model; token/request rates; data path. | Embedding/reranking docs and pricing; external provider sources if needed. | Optional |

## Job details

| Field name | Plain meaning | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| J01 execution model and languages | Whether the service runs code or only coordinates workers you host; supported languages. | Do not compare a queue-only fee with an all-in worker price. | Managed compute/bring workers/HTTP delivery; languages; worker hosting dependency. | Architecture and quickstart docs. | Required for job/queue/workflow products |
| J02 run limits and pricing | Execution seconds, invocations, memory/CPU, concurrency, timeout, waiting time, and retry billing. | Estimate jobs and see whether a long task can finish. | Metric/rate records; per-run limits; plan; whether waits and retries are charged. | Pricing, machine, duration, and concurrency docs. | Required applicable values |
| J03 delivery and failure behavior | Retries, duplicate protection, ordering, failed-message handling, and replay. | Jobs can be delivered twice or fail halfway through. | Documented guarantees; retry policy; deduplication scope/window; caveats. | Queue semantics, retries, ordering, and idempotency docs. | Required attempt |
| J04 schedules and queue retention | Delayed/recurring work, how long queued messages survive, and maximum payload. | Make sure tomorrow's work is still there tomorrow. | Delay/retention/time-zone/payload limits; plan; configurable versus fixed. | Schedule, queue, and limits docs. | Required attempt |
| J05 logs and run history | How long debug logs and results remain and whether failed work can be replayed. | Fix failures after the fact without paying for a larger plan unknowingly. | Days; bytes; plan; export/replay method; additional charge. | Logs, monitoring, run-history docs and pricing. | Required attempt |

## Self-host details

| Field name | Plain meaning | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| H01 operating requirements and feature gaps | What you must run, update, and back up yourself; hosted-only features; published resource minimums. | Free software still needs hardware, backups, and work. | Dependency list; upgrade/backup links; feature gaps; optional official RAM/CPU minimum. | Official self-host/deployment/release docs; no unsourced cheapest-server estimate. | Required self-host instructions; resource minimums optional |

## Cost scenarios to approve before collecting prices

Compare like jobs within a type. Publish separate charts for managed databases, full backends, file stores, vector stores, and job services. Never rank a free database library against a managed platform as if both include hosting.

Proposed starter scenarios:

| Scenario | Fixed assumptions | Important extras and limits |
| --- | --- | --- |
| Small SQL/document app | One production database; 1 GB stored for a full month; 100,000 reads and 20,000 writes; 10 peak connections; 5 GB internet transfer; 730 hours when an always-on instance is required | Record smallest plan that supports the workload. Query counts do not predict CPU or engine-specific request units. If conversion is unknown, mark cost incomplete. Backups and high availability are separate named variants. |
| Full app backend | The small database scenario plus 1,000 monthly active users, 1 GB of files, 100,000 file reads, 10,000 uploads, 20 GB total internet transfer, and 10,000 short function calls | State function duration/memory before pricing. Include external email/SMS only if known; otherwise flag them as omitted. Do not compare this total directly with a database-only total. |
| Small file store | 100 GB average hot storage for a 30-day month; 100,000 writes; 1 million reads; 100 GB internet transfer; files stay for the month | Use original vendor GB/GiB units with any conversion shown. State single-part/multipart assumptions and public versus private delivery. Include request rounding, minimum retained days, and any required CDN/plan. |
| Small vector search app | 100,000 vectors; 1,536 float32 values each; 1 KiB metadata each; 100,000 searches and 10,000 updates per month; 5 GB internet transfer | Raw vector size is not billed index size. Query units, filters, index overhead, replicas, and embedding-model costs need explicit inputs; otherwise show unknown. |
| Small job workload | 10,000 jobs per month; each actively runs for 1 second; 0.5 vCPU and 0.5 GB RAM where that machine exists; peak 5 concurrent jobs; no retries or waiting in this base case | Separate invocation, orchestration, worker compute, logs, and transfer fees. Add a retry/wait variant. If workers run elsewhere, include their sourced hosting cost or label the estimate incomplete. |
| Idle project | Same retained data as the chosen scenario, zero requests and zero job execution for a month | Keep subscription, allocated compute, stored data, backup, and minimum-capacity fees. Record whether a free project pauses or is deleted. “Scale to zero” does not mean all costs reach zero. |

Show two supported costs when possible: the eligible recurring free allowance applied, and the normal paid path after that allowance or trial is unavailable. Label trial/promotion amounts separately. Use one specified region per comparison; compare additional regions only with their own sourced rates.

These are proposed assumptions, not measured benchmarks. Do not run these workloads or create accounts during the field-approval step.

## Short feasibility test

Checked on 2026-11-04 using public pages only. Samples: **Supabase** (a backend bundle), **Cloudflare R2** (file/object storage), and **Trigger.dev** (managed jobs). This tests whether the fields can be researched; it does not finish research for these products.

**Easy** = directly visible in the inspected official pages. **Hard** = split across docs, plan-dependent, requires calculation, or only partly answered. **Not published** = not found in the inspected pages after this bounded test, not a claim about every page on the site. **N/A** = does not describe the sampled main product. Reference codes below point to pages opened during the test. All carry the same checked date, 2026-11-04.

Three checks show why the proposed fields matter:

- Supabase's pricing page states a 1-week inactivity pause for free projects. Its backup docs say database backups exclude stored file objects. Those need separate fields. [Pricing](https://supabase.com/pricing), [backup scope](https://supabase.com/docs/guides/platform/backups).
- R2 publishes storage, request, and retrieval rates separately. Its Standard free allowance and Infrequent Access minimum duration have different rules. A single “price per GB” hides that. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
- Trigger.dev publishes compute and invocation charges. Its cost guide describes billing limits; the pricing FAQ emphasizes alerts. Research must capture enforcement details, rather than equating alerts with a hard cap. [Pricing](https://trigger.dev/pricing), [cost controls](https://trigger.dev/docs/how-to-reduce-your-spend).

| Field | Supabase | Cloudflare R2 | Trigger.dev | Result for the field design |
| --- | --- | --- | --- | --- |
| C01 | Easy S0 | Easy R0 | Easy T0 | Name and official product page are clear. |
| C02 | Easy S0 | Easy R0 | Easy T0 | Primary type is an editorial label supported by the product description. |
| C03 | Hard S5 | Easy R0 | Hard T2 | Deployment paths are clear. License details still need the exact repository file. |
| C04 | Easy S0 | Easy R0 | Easy T0 | Pages present current offers; no account was created. This does not prove service uptime. |
| C05 | Not published S0,S1 | Not published R0,R1 | Not published T0,T1 | Home country/legal entity was not found in the inspected product/pricing pages. Keep optional; legal pages may answer it later. |
| C06 | Hard S1 | Not published R1 | Hard T1 | Trigger's card rule is explicit. Full signup/country eligibility was not established for any sample. |
| C07 | Easy S0,S1 | Easy R0 | Easy T0 | Bundle versus single storage/job product can be recorded without forcing false feature rows. |
| C08 | Easy S7 | Easy R5 | Easy T3 | Official connection/API/task docs expose the integration path. |
| C09 | Easy S1 | Easy R1 | Easy T1 | Type of free offer is visible; production and other detailed terms may need follow-up. |
| C10 | Easy S1 | Easy R1 | Easy T1,T4 | Free allowances use different meters. Preserve their original units and scope. |
| C11 | Easy S1,S6 | Not published R1,R3 | Not published T1,T4 | Pause is clear for the backend sample. No universal no-idle-deletion claim is justified for the other two. |
| C12 | Easy S1 | Easy R1 | Easy T1 | Base/usage pricing is public. R2 is usage billing, so do not invent a monthly subscription floor. |
| C13 | Hard S1,S2 | Easy R1 | Easy T1 | Supabase spreads relevant meters across a larger platform. Trigger shows both compute and invocation rates. |
| C14 | Hard S1,S2 | N/A R1 | Easy T1 | Keeping files is not compute. For Trigger the billed execution period is stated; a platform minimum may still apply. |
| C15 | Easy S1 | Easy R1 | Not published T1,T4 | Trigger's separate transfer rate was not found in inspected sources. Silence is not a zero rate. |
| C16 | Easy S2 | Not published R1 | Hard T1,T5 | Supabase's cap has exclusions. Trigger's pricing FAQ and detailed cost guide need reading together. |
| C17 | Easy S4 | Easy R3 | Hard T4 | Trigger region paths tried did not open. R2 distinguishes a placement hint from a jurisdiction control. |
| C18 | Hard S6,S7 | Easy R4,R5 | Hard T2,T3 | A feature badge is easy; defaults and plan limits need detailed access docs. |
| C19 | Hard S3,S5 | Hard R5,R7 | Hard T2,T4 | Data can have several parts. Exporting code or a database alone may not preserve files, run history, or settings. |
| C20 | Easy S1 | Hard R0,R1 | Easy T1 | Support paths are visible for two. A contract SLA was not validated; keep the SLA detail optional. |
| C21 | Hard S1,S2 | Easy R1 | Hard T1,T4 | A storage-only scenario is straightforward. Full backend and worker totals need extra assumptions and all material rates. |
| C22 | Easy S1 | Easy R1 | Easy T1 | Each source has a stable URL; the researcher supplies the checked date. Vendor page-update dates are separate. |
| D01 | Easy S7 | N/A | N/A | Supabase describes its engine. Storage and jobs are not relational engines. |
| D02 | Hard S7 | N/A | N/A | Need detailed engine behavior, not only a Postgres name. R2's own consistency docs can be collected separately when relevant. |
| D03 | Hard S1,S7 | N/A | N/A | Connection, compute, and stored-size limits live in different sections. |
| D04 | Easy S1 | N/A | N/A | Preview/development support is also visible for Trigger under J02/T1; it is not a database branch. |
| D05 | Easy S3 | N/A | N/A | Backup scope and excluded files are directly documented. |
| D06 | Hard S6,S7 | N/A | N/A | Feature references exist; a complete failover/plan claim needs deeper docs. |
| D07 | Hard S0,S7 | N/A | N/A | A live-updates feature is clear; durable offline writes and conflict handling were not established. |
| D08 | Easy S8,S9 | N/A | N/A | Vector and mixed search docs are reachable; other extensions need their own check. |
| F01 | Easy S1 | Easy R1 | N/A | Storage charges are stated separately from request and transfer charges. |
| F02 | Hard S1 | Easy R1 | N/A | Supabase is a platform bundle; do not assume its file-request meter matches a standalone object store. |
| F03 | Not published S1,S10 | Easy R1 | N/A | No full minimum-retention/early-delete policy was found for Supabase in these sources. |
| F04 | Easy S10 | Easy R2 | N/A | Both have dedicated file/upload limit docs. |
| F05 | Easy S11 | Easy R5 | N/A | Compatibility is a matrix of operations, not a complete yes/no guarantee. |
| F06 | Hard S10,S11 | Easy R4 | N/A | Supabase's source pages link the access guides; a complete private-delivery claim still needs those guides. |
| F07 | Hard S3,S11 | Hard R5,R6 | N/A | Supabase database backup excludes file objects. R2 locks and API versioning support must be read separately. |
| V01 | Hard S8 | N/A | N/A | Vector dimensions are documented, but usable/indexed limits depend on type/index/version. No dedicated vector cloud was sampled. |
| V02 | Easy S9 | N/A | N/A | Mixed keyword/vector search guide exists. Treat it as a capability, not proof of search quality. |
| V03 | Hard S8,S9 | N/A | N/A | External embedding/model bills are separate. Full provider/model pricing was not collected in this test. |
| J01 | N/A for primary-product test | N/A | Easy T0,T1,T3 | Supabase also has Cron/Queues, but those secondary modules were not researched in this short test. |
| J02 | N/A for primary-product test | N/A | Easy T1,T3,T4 | Machine rates and run/concurrency limits are public; check each applicable task type. |
| J03 | N/A for primary-product test | N/A | Hard T3,T4 | Retry settings are public; a complete ordering/deduplication guarantee needs specific docs. |
| J04 | N/A for primary-product test | N/A | Hard T1,T4 | Schedule and payload limits are findable; maximum time a queued run survives was not established. |
| J05 | N/A for primary-product test | N/A | Hard T1,T4 | Log retention is public. Export/replay behavior still needs its specific guide. |
| H01 | Hard S5 | N/A | Hard T2 | Self-hosting guides exist; neither basic setup nor a laptop demo proves a production hardware budget. |

### Official pages used in the test

| Code | Public source | Checked date |
| --- | --- | --- |
| S0 | [Supabase product](https://supabase.com/) | 2026-11-04 |
| S1 | [Pricing](https://supabase.com/pricing) | 2026-11-04 |
| S2 | [Control your costs](https://supabase.com/docs/guides/platform/cost-control) | 2026-11-04 |
| S3 | [Database backups](https://supabase.com/docs/guides/platform/backups) | 2026-11-04 |
| S4 | [Regions and data location](https://supabase.com/docs/guides/platform/regions) | 2026-11-04 |
| S5 | [Self-hosting](https://supabase.com/docs/guides/self-hosting) | 2026-11-04 |
| S6 | [Production checklist](https://supabase.com/docs/guides/deployment/going-into-prod) | 2026-11-04 |
| S7 | [Database overview and connection links](https://supabase.com/docs/guides/database/overview) | 2026-11-04 |
| S8 | [Vector columns](https://supabase.com/docs/guides/ai/vector-columns) | 2026-11-04 |
| S9 | [Hybrid search](https://supabase.com/docs/guides/ai/hybrid-search) | 2026-11-04 |
| S10 | [File upload limits and related access links](https://supabase.com/docs/guides/storage/uploads/file-limits) | 2026-11-04 |
| S11 | [Storage S3 compatibility](https://supabase.com/docs/guides/storage/s3/compatibility) | 2026-11-04 |
| R0 | [R2 overview](https://developers.cloudflare.com/r2/) | 2026-11-04 |
| R1 | [R2 pricing and billing examples](https://developers.cloudflare.com/r2/pricing/) | 2026-11-04 |
| R2 | [Limits](https://developers.cloudflare.com/r2/platform/limits/) | 2026-11-04 |
| R3 | [Data location](https://developers.cloudflare.com/r2/reference/data-location/) | 2026-11-04 |
| R4 | [Public buckets and access](https://developers.cloudflare.com/r2/buckets/public-buckets/) | 2026-11-04 |
| R5 | [S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/) | 2026-11-04 |
| R6 | [Bucket locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/) | 2026-11-04 |
| R7 | [Object lifecycle rules](https://developers.cloudflare.com/r2/buckets/object-lifecycles/) | 2026-11-04 |
| R8 | [Consistency model](https://developers.cloudflare.com/r2/reference/consistency/) | 2026-11-04 |
| T0 | [Trigger.dev product](https://trigger.dev/) | 2026-11-04 |
| T1 | [Pricing](https://trigger.dev/pricing) | 2026-11-04 |
| T2 | [Self-hosting and feature differences](https://trigger.dev/docs/self-hosting/overview) | 2026-11-04 |
| T3 | [Task options, retry, and queue links](https://trigger.dev/docs/tasks/overview) | 2026-11-04 |
| T4 | [Limits and retention](https://trigger.dev/docs/limits) | 2026-11-04 |
| T5 | [Cost controls and linked billing-limit guide](https://trigger.dev/docs/how-to-reduce-your-spend) | 2026-11-04 |

The attempted Trigger.dev paths `/docs/regions` and `/docs/deployment/regions` did not open. The attempted `/docs/runs`, `/docs/runs/overview`, `/docs/runs/retention`, and `/docs/tasks/errors-and-retrying` also failed. Accessible task and limits pages still answered part of those questions. These failures should not become “no regions,” “no replay,” or “no retries.”

### Changes made after this test

- Keep the core fields. Pricing, free limits, and major product/deployment choices are generally findable, but a complete platform bill takes more work.
- Keep **idle deletion**, **transfer fees**, **spend-cap scope**, and **queue retention** as required attempts with unknown allowed. They can affect the choice even when public docs are incomplete.
- Keep vendor home, formal SLA, replica details, deep offline-sync behavior, advanced search, AI-model extras, and resource minimums optional. They are useful in the right comparison, but not necessary for every record.
- Do not require one exact small-project price for every app. Store underlying rates first. Publish a total only when the workload maps to the billing units and all material fees are known.
- Do not collect universal cold-start milliseconds, real-world queries per second, “how many users it supports,” actual restore minutes, or a cheapest safe server price. These depend on workload or testing. This public-doc test cannot support comparable numbers.
- Do not collect a numeric vendor-lock-in score, developer-friendliness score, or generic “best” rating. Replace them with export formats, supported protocols, self-host terms, included services, and explicit limitations.
- Add a vector-only pilot before bulk vector research. Supabase proves vector docs are reachable, but it does not establish that dedicated providers publish enough detail for a complete comparable cost.
- Recheck current docs rather than copying old comparison matrices. For example, R2's current lock documentation is more specific than older lists that say no object locks. A native bucket lock and S3 Object Lock compatibility must remain separate facts. [Current locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/), [S3 operation matrix](https://developers.cloudflare.com/r2/api/s3/api/).

## Stats and insights these fields can support

These are future outputs enabled by approved, completed records. They are not findings from this discovery list.

| Output | Fields needed | Publication rule |
| --- | --- | --- |
| Count of available products by job and hosting mode | C01–C04 | Separate products from vendors; remove duplicate names; show gray/unconfirmed rows separately. |
| Lasting free tiers versus trials versus free software | C06, C09, C10 | Exclude trial credits and non-production demos from the lasting-free total. Show sample coverage. |
| Which free backends pause or expire | C11 | Separate sleep, manual restore, expiry, and deletion. Exclude unknowns from the yes/no denominator and show their count. |
| Cost of leaving a quiet project online | C12–C16, C21; relevant storage/backup fields | Separate compute scaling from subscription and retained-data cost. Compare within product type. |
| Small-project monthly cost charts | C10, C12–C16, C21; D/F/V/J detail | Use the same dated workload, region, currency, and required features. Show incomplete estimates; never rank them as zero. |
| Storage cost split into space, requests, and transfer | C15, F01–F03, C21 | State class, object duration, request mix, rounding, and minimums. Separate delivery-provider costs. |
| Cost of a download-heavy app or moving data out | C15, C19, F01–F06 | Use stated transfer routes and allowances; do not call every egress exemption unlimited. |
| Spend cap versus warning-only comparison | C16 | Show exactly which meters are capped and what stops after the limit. |
| Backups available on free and smallest paid plans | C10, C12, D05, F07 | Database records and file objects are separate. Do not treat replication as backup. |
| Regions and explicit data-location controls | C17 | Count selectable regions separately from hints; show component and plan differences; no inferred legal-compliance badge. |
| Open/self-hosted alternatives and missing cloud features | C03, C18, C19, H01 | Name the exact edition/license; free source code is not free hosting or a promise of feature parity. |
| Backend bundles versus services you must add | C07, C08, C12 | Show login, files, functions, queues, and APIs separately, with extra-provider dependencies. |
| Cost and limits of long-running jobs | J01–J05, C13–C16, C21 | Distinguish coordinator fees, code execution, waiting, retries, and external workers. |
| When a current database can also do vector search | D01, D08, V01–V03 | A capability table, not an unsupported claim that one engine is faster or higher quality. |
| Search filters and app-language fit | C08, D01, F05, V02, J01 | Official support only; do not treat a third-party client as an official SDK. |
| Maintenance and market-change notes | C04, C22 | Link notices with effective dates. Acquired does not automatically mean retired. |

For every share or chart, publish the eligible record count, unknown count, checked-date range, and exact filter. This directory is a researched selection, so its counts are not market share or measured developer adoption. Omit unsourced user counts, growth claims, benchmark rankings, and review scores from this first field set.



