# Research notes: databases and backend

Research date: 2026-11-04. Work covered discovery, official-site checks, field design, and a three-product feasibility test. No accounts, logins, forms, database access, code changes, commits, pushes, or page work were used.

## Result and counting rules

- Main list: **211 candidate rows**: **155 active**, **55 gray**, and **1 check again**.
- Primary types: backend platforms 23; SQL and managed databases 54; document/graph databases 18; key-value/caches 13; vector/search databases 17; file/object storage 37; jobs/queues/events 32; data APIs/no-code data 10; analytical/time-series databases 7.
- Excluded log: **49 named products or old product names**, plus **1 scope rule**. Its 50 rows are not 50 distinct currently sold apps.
- Field proposal: **46 grouped fields**, including a required per-fact evidence record. There are 22 shared core fields and 24 fields used only for relevant product types.
- No statistical adoption claim follows from these counts. Some rows are software engines, some hosted products, and some product families. They are selectable alternatives, not unique companies.
- Named independent cloud products can have separate rows when they solve different jobs, such as Upstash Redis, Vector, QStash, and Workflow. A multi-engine provider such as Aiven stays one row in this pass.
- A primary type supplies one count per row. Secondary capabilities and overlaps do not add to the total.
- Gray products are retained so the owner can decide category boundaries. They should not be called 55 verified recommendations.
- The list is broad, but “every app worldwide” cannot be proven. Small providers, recently launched products, and regional services remain the largest discovery gaps.

## Discovery sources

Sources were checked or searched on 2026-11-04. Codes in apps.md point here. These sources supplied names or user problems. Only official pages support product membership and lifecycle facts.

| Code | Kind | Source | How used / limits |
| --- | --- | --- | --- |
| P | Owner's prompt | Names and scope supplied in the task | Starting candidates; every official site was then opened or attempted. Turso was correctly classified as SQLite-based after opening its own site, rather than assuming it is Postgres or MySQL. |
| K | Coverage seed | Known product names, followed by official-site checks | Fills obvious gaps across cloud platforms, self-hosted engines, and backend jobs. This is explicitly prior-knowledge discovery, not a claim that every name appeared in a search result. |
| O | Official navigation | Product links, redirects, retirement notices, and related products on the opened official sites | Examples include Bunny Database, Sevalla storage, Cloudflare products, and new canonical domains. The linked page in each row is the direct evidence. |
| S1 | Problem-phrased searches | Queries in the dated search log below | Find products people use for small apps, database hosting, and background jobs. Search rank is not product quality. |
| S3 | Long-tail and gap searches | Queries about open-source backends and managed Postgres in the search log | Leads often need name/domain correction. Similar names and old descriptions caused false matches. |
| L1 | Public developer list | [free-for-dev](https://github.com/ripienaar/free-for-dev), especially BaaS, Managed Data Services, Messaging, and storage sections | Broad independent-name discovery. Listed free allowances were not accepted without official research; no old limits were copied into app records. |
| L2 | Public backend list | [Open-source self-hosted BaaS gist](https://gist.github.com/seifscape/ca9ffb2097c0fab84a16447eb8ba585d) | Found backend servers and boundary cases. Its older star counts and feature descriptions are not evidence of current operation. |
| L3 | Public topic/catalog search | [GitHub backend-as-a-service topic](https://github.com/topics/backend-as-a-service?o=desc&s=updated), [OpenSourcePicks](https://opensourcepicks.com/categories/backend-as-a-service/), [open-source software category](https://opensourcesoftware.io/opensource-backend-as-a-service-baas-software/) | Search-result discovery of smaller self-hosted backends and API layers. Some category pages mix libraries, CMS products, and backends. |
| L4 | Public object-storage lists | [awesome-object-storage](https://github.com/mixpeek/awesome-object-storage), [S3-compatible alternatives](https://github.com/hbmartin/comparison-S3-Compatible-Object-Storage-Alternatives) | Both opened. The first is maintained by a vendor in the broader data space and is not neutral pricing proof. Its provider names guided direct checks. |
| R1 | Review-site category | [G2 database-as-a-service category](https://www.g2.com/categories/database-as-a-service-dbaas) | Opened to discover providers and large-enterprise boundary cases. No rankings, reviews, scores, or category market-size totals were imported. |
| V1 | Vendor comparisons | [Pinecone comparisons](https://www.pinecone.io/compare/) | Opened to discover vector/search competitors and products offered by larger clouds. Competitor limits, prices, and shutdown claims were checked against their own sites. |
| V2 | Vendor comparison | [Trigger.dev versus Inngest](https://trigger.dev/vs/inngest) | Opened to discover job-system names and the worker-hosting distinction. Used Inngest's own site to confirm Inngest. |
| C1 | Community discussion | [Choosing a vector database](https://www.reddit.com/r/vectordatabase/comments/1v5ezl7/how_do_you_decide_which_vector_database_to_use/) | Opened. Surfaced app-data versus separate-vector-store questions and names such as LanceDB, turbopuffer, Neon, and Render. Comments are not proof of performance or suitability. |
| C2 | Community searches | [Storage discussion](https://www.reddit.com/r/webdev/comments/1j73q0i/european_devs_wishing_to_minimise_their/), [S3 alternatives discussion](https://www.reddit.com/r/aws/comments/1d9g35z/looking_for_alternative_to_s3_that_has/), [managed Postgres costs](https://www.reddit.com/r/devops/comments/1ve2jsa/is_18mo_just_the_price_for_a_small_app_that_needs/), [hosting migration discussion](https://www.reddit.com/r/rails/comments/1t7u9iv/migrating_off_heroku_what_deployment_setups_are/) | Search excerpts only; not full thread verification. Leads included regional hosts, Sliplane, and Nearbase. All retained names got a separate official check. |

The attempted vendor URL `https://www.inngest.com/compare-to-trigger-dev` did not open. The accessible Trigger.dev comparison supplied that discovery route instead. The attempted Reddit thread `https://www.reddit.com/r/SideProject/comments/1ah8yi6` also failed to open; another community thread above was successfully read.

## Search log

All queries below were submitted on **2026-11-04**. Multi-query batches sometimes returned mostly results for one phrase. A submitted query is not proof of complete result coverage.

| Purpose | Queries |
| --- | --- |
| Small app/backend problems (S1) | `best backend database for solo developer side project Supabase alternatives`; `free database hosting postgres mysql redis indie hacker`; `github awesome backend as a service databases storage queues` |
| Independent discovery kinds | `github awesome baas backend as a service list`; `site.g2.com categories database as a service vector databases`; `site.reddit.com cheap object storage S3 alternatives indie developers`; `site.inngest.com compare background jobs trigger dev temporal alternatives` |
| Job and vector comparisons | `site.inngest.com "vs" "Trigger.dev"`; `site.pinecone.io vector database alternatives comparison`; `site.reddit.com "database" "Neon" "Turso" "Xata"`; `Fauna shutdown 2025 official Xata new Postgres database 2026` |
| Backend and Postgres gaps (S3) | `backend as service alternatives "Manifest" "InsForge"`; `managed postgres "Ubicloud" "Tembo" "Stackhero"`; `serverless database "Sealos" "Sequelize" "Kinsta" "D1" alternatives` |
| Lifecycle checks | `site.fauna.com shutdown May 30 2025`; `site.databricks.com "Crunchy Data" acquired`; `site.databricks.com "bit.io" acquired shutdown`; `site.mongodb.com "App Services" "end-of-life"` |
| Official domain and product recovery | `site.vultr.com "Managed Databases" pricing`; `site.sevalla.com "database" "Kinsta"`; `site.tigrisdata.com "object storage" "pricing"`; `site.fly.io "Managed Postgres"` |
| Old services | `site.cyclic.sh "shutting" "2024"`; `site.deta.space "sunset"`; `site.fauna.com "May 30" "2025"`; `site.defer.run "acquired"` |

Official pages were then opened in product-type batches. apps.md records the final official URL and confirmation date for every retained row. excluded.md records named rejected candidates and the source or failed attempt. fields.md records every source used for its three-product test.

## Shutdowns, rebrands, and acquisitions

These are material corrections to older app lists, checked on 2026-11-04. Effective service dates are separate from the date checked.

| Product/name | What the official evidence says | Directory treatment |
| --- | --- | --- |
| Instant | [Team joins OpenAI](https://www.instantdb.com/essays/instant_team_joins_openai): new cloud signups closed; shutdown scheduled for 2027-08-31; a self-host migration guide is linked. | Exclude Instant Cloud; keep self-hosted software gray pending maintenance review. |
| Chroma | [Replit announcement](https://www.trychroma.com/blog/chroma-joins-replit) and [cloud timeline](https://www.trychroma.com/cloud-wind-down): cloud writes stop 2026-12-07, reads stop 2026-12-22. Open source continues. | Keep self-hosted Chroma, exclude the retiring cloud offer. |
| Turso | [Joining Supabase](https://turso.tech/blog/turso-is-joining-supabase): platform and databases continue. | Keep Turso. Acquisition alone does not mean the product was merged away. |
| Neon | [Current official site](https://neon.com/) identifies it as part of Databricks and still offers a backend product. | Keep Neon; do not confuse the parent platform with a second indie database offer. |
| Crunchy Data | [Snowflake annual filing](https://www.sec.gov/Archives/edgar/data/1640147/000164014726000008/snow-20260131_htm.xml) records acquisition on 2025-06-06; [Crunchy Bridge](https://www.crunchydata.com/products/crunchy-bridge) is still offered. | Keep Bridge; do not treat acquisition as closure. |
| Timescale | [timescale.com](https://www.timescale.com/) redirects to [Tiger Data](https://www.tigerdata.com/). | One current Tiger Cloud / TimescaleDB family row; gray because specialized database scope needs approval. |
| EdgeDB / Gel | [Official announcement](https://www.geldata.com/blog/gel-joins-vercel) dated 2025-12-02 says Gel Data shuts down, the team joins Vercel, and cloud service closes on January 31 of the following year. Open source remains. | Exclude hosted Gel Cloud; keep self-hosted Gel gray. This is stronger evidence than the still-live home page's cloud login link. |
| MinIO | [Official repository](https://github.com/minio/minio) says archived 2026-04-25; [AIStor site](https://www.min.io/) remains active. | Exclude the archived community project from the active list. Hold commercial AIStor out until solo terms are established. |
| MongoDB | [App Services deprecations](https://www.mongodb.com/docs/app-services-deprecation/) distinguish retired app features from the continuing database. | Keep Atlas database; exclude the former full App Services bundle. |
| Mergent | [Official notice](https://blog.mergent.co/mergent-acquired-by-resend): acquired by Resend, service ends 2025-07-28. | Exclude Mergent. Its email successor belongs to the email directory; general jobs need another provider. |
| ElephantSQL, CloudMQTT, CloudKarafka | Each [official](https://www.elephantsql.com/) [home](https://www.cloudmqtt.com/) [page](https://www.cloudkarafka.com/) now says discontinued. | Exclude old hosted services; keep CloudAMQP. |
| Kinsta backend hosting | [Official notice](https://kinsta.com/changelog/paas-moving-to-sevalla/) says the platform moved under Sevalla on 2026-02-02. | Use Sevalla database and object-storage rows, not duplicate Kinsta entries. |
| DataStax | [Official IBM page](https://www.ibm.com/products/datastax) says DataStax is an IBM company and still names Astra DB. | Retain Astra DB gray until current self-service terms are checked. |
| Dgraph | [Old official domain](https://dgraph.io/) redirects to its [docs](https://docs.dgraph.io/). | Self-hosted candidate remains; no verified managed service claim. |
| SQLite Cloud | [Old domain](https://sqlitecloud.io/) redirects to [SQLite AI](https://www.sqlite.ai/), which still lists SQLite Cloud. | Keep the actual database product once. |
| Electric | [Old official domain](https://electric-sql.com/) redirects to [electric.ax](https://electric.ax/), with a broader agent/sync platform. | Gray backend-layer candidate; recheck current product boundaries. |
| Dagster | [Official site](https://dagster.io/) says it is part of Prefect. | Exclude from the default app-backend list for its data-pipeline focus, not because the product is dead. |
| Tembo, Deskree, Manifest | Current official sites describe coding agents, a tools lab, and an LLM gateway respectively. | Exclude old database/BaaS descriptions. Do not assume stale third-party descriptions are still sold. |
| Redis Labs, Linode, Vercel legacy data names | Official redirects and current docs point to Redis, Akamai, and current provider integrations. | Record aliases/integration paths, not extra independent apps. |

## Verification limits and recovered checks

- **Northflank is the one main-list check-again row.** Its site is active, but [its linked incident page](https://status.northflank.com/cmvv0rn5a092f14rutwccodpp) was still marked Monitoring for a security incident. The latest displayed update was 2026-11-02. This is a reason for another current-status check before recommending it, not a claim that Northflank has shut down.
- Fly.io's guessed old paths failed. Its [current managed Postgres page](https://docs.fly.io/postgres) opened after following the official `/docs/mpg/` redirect. It is now marked active.
- Vultr marketing pages returned 403, but [official database docs](https://docs.vultr.com/products/storage/databases) and [storage docs](https://docs.vultr.com/products/storage/object-storage) opened. Both products are marked active using those direct sources.
- Tigris's root/docs pages returned an unsupported `text/markdown` response in the web reader, but [its pricing page](https://www.tigrisdata.com/pricing/) opened. It is now active. No competitor pricing from that page was used.
- Backblaze's initial product-page request returned 403. [Its official docs](https://www.backblaze.com/docs) opened and identified B2 as app/backend object storage.
- Parse's home page returned no readable lines; [its official repository](https://github.com/parse-community/parse-server) opened. The current server is separate from original Parse hosting.
- FerretDB's website paths returned 404, but [its official repository](https://github.com/FerretDB/FerretDB) opened. It stays gray because current releases and support need checking.
- Fauna's official closure notice, Deta's service history, Defer's current status, Redis To Go, Kinvey, FreeSQLDatabase, and Pantry could not be directly confirmed. They are held out, with the actual failure recorded.
- The old db4free.net domain redirected to unrelated content. It must not be reused as a working free database recommendation.
- Wrong domain forms such as `www.insforge.dev`, `www.hatchet.run`, `www.convoy.io`, `www.oban.pro`, and `www.bullmq.io` failed; canonical domains were found and checked. Failed exploratory URLs such as `www.nile.dev`, `www.dbneon.com`, `www.dbs.io`, `www.dbnest.io`, and `www.scaledb.com` produced no verified named product. They were not turned into invented apps.
- `www.chromadb.com` was an incorrect Chroma domain and led to a parked domain. The official Chroma site is `www.trychroma.com`. Nearbase's `.com` was parked; its verified product site is `nearbase.dev`.
- No paid plan, card requirement, country's signup availability, service latency, restore time, or reliability was verified by creating an account or running a workload.

## What the field test showed

The full 46-row test matrix and source list are in fields.md.

- Pricing, free allowances, file limits, connection options, and basic hosted/self-hosted choices were usually visible.
- Supabase shows why pause rules, account/project scope, backup coverage, and cap exclusions matter.
- R2 shows why storage classes, request fees, minimum-retention billing, location controls, and S3 operation compatibility need separate facts.
- Trigger.dev shows why managed execution, invocation costs, worker dependencies, log retention, and bill controls cannot be reduced to a price per task.
- Vendor home, exact deletion timing, full export scope, queue survival, complete transfer cost, and guaranteed cold-start/recovery times were harder or not found in the inspected sources.
- Kept important missing facts as required attempts with unknown permitted. Made deep/less general details optional. Removed generic scores and unsupported performance statistics.
- Before collecting all vector records, use one dedicated vector provider to confirm dimension, index, and billing-unit fields. The three-product test included a vector-capable backend but not a dedicated vector cloud.

## What may still be missing

1. **Regional providers.** Europe and major English-language clouds are better covered than India, mainland China, Japan, South Korea, Latin America, and Africa. Only a small sample of Alibaba/Tencent products was checked. Do not infer international signup access from English pages.
2. **Smaller hosted databases.** New Postgres/SQLite hosts and resellers launch often. The list includes several small providers, but there is no stable complete registry. Additional database products discovered on broad provider sites still need their own checks.
3. **Specialist stores.** Time-series, graph, offline-sync, analytical databases, MQTT brokers, and streaming platforms have fuzzy scope boundaries. Several are gray or excluded; this is not an exhaustive survey of every engine or data warehouse.
4. **Object storage beyond the sampled lists.** Small regional S3 providers, decentralized storage gateways, and more self-hosted engines may be missing. General consumer drive/backup products were not expanded into app storage merely because a file API exists.
5. **Jobs beyond TypeScript.** Paid self-run job systems in Ruby, Elixir, Java, and .NET are represented as gray. A full survey of every framework queue library was deliberately not attempted.
6. **New product generations.** Current vendor pages may cover generations with different limits. Firebase SQL Connect, Cockroach Continuum, PlanetScale's current product range, Google's moved vector docs, and newly named cloud products need version/edition fields in the later research.
7. **Maintenance after acquisition.** A live repository or archived release is not proof of future maintenance. Instant self-hosted, Gel, FerretDB, KeyDB, and RethinkDB need close attention.
8. **No adoption statistics yet.** The list does not establish user counts, market share, benchmark performance, customer satisfaction, or growth. Those require separate comparable sources and are not necessary to approve this field set.

## Owner decisions for the coordinator to raise

These do not block this discovery deliverable.

- Keep all nine primary types, or move the seven analytical/time-series candidates into analytics and the ten API/no-code/sync candidates elsewhere?
- Include embedded engines and paid self-run job libraries in the main directory with clear filters, or show them in a separate self-hosted/software section?
- Keep closely related families together, as in this pass, or split every engine/edition into selectable offers later? Preserve parent/alias links either way.
- Approve the 46 grouped fields and the proposed workload scenarios before per-app research. Are India/Asia regions and INR context a priority, while keeping original billing currency authoritative?
- What budget counts as a realistic solo-production path? No hard cutoff was invented; costlier/unclear cases are gray or held out.
- Should uncertain legacy services be revisited before research starts, or retained only in a retirement/history note?
- Approve a dedicated-vector pilot before bulk vector price estimates, since engine-specific billing units may prevent an honest single cost number.

## Files and boundaries

Only these requested Markdown files were written:

- `dev-space/indie-hacker-apps/databases-and-backend/apps.md`
- `dev-space/indie-hacker-apps/databases-and-backend/excluded.md`
- `dev-space/indie-hacker-apps/databases-and-backend/fields.md`
- `dev-space/indie-hacker-apps/databases-and-backend/notes.md`

No other worker's folder was edited. No code checks or builds were run because the deliverable is research Markdown only.

