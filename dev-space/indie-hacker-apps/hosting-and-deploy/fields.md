# Proposed hosting and deploy facts

Proposal checked on 2026-11-04. These fields are for the next research step. No app record here is finished research. The owner should approve the fields and the gray scope cases before the full collection starts.

## How to collect them

- Use the exact product and plan, not a claim about the whole company. Record old names, parent company, and hosting mode without counting them as more independent providers.
- A required field must be investigated. It may contain `unknown`, with the reason and the pages checked. Required does not mean we can invent a value or require a vendor to publish it.
- Use distinct values: `yes`, `no`, `unknown`, `not applicable`, `self-managed`, `external paid service`, and `contact sales`. A rented server on which you can install a feature is not the same as a managed feature included in a plan.
- Every factual value needs an exact source URL and a checked date, including limits, exceptions, eligibility, units, and the absence of a feature. When a field contains several claims, attach evidence to each claim. A homepage is enough for identity, not for a billing or legal rule.
- Use public official pricing, documentation, terms, product notices, release notes, and status pages. A vendor comparison only discovers competitors. Reviews and community posts suggest questions, not authoritative prices or support promises.
- Store `value`, `unit`, `plan`, `product/mode`, `region`, `billing period`, `source URL`, `checked on`, and `short qualification` with a fact where relevant. Also record source publication/update date when shown. Keep `checked on` separate from that date.
- A blocked fetch is `not verified`, not `not published`. No statement found in checked pages is `unknown`, not `no`. For an unknown, keep the attempted URLs, date, and why the answer remains unknown.
- Keep current official facts separate from calculations and judgments. A calculation needs its formula, all input facts and their URLs/dates, assumptions, and calculation date. Label an editorial fit judgment as such.
- No plan prices or caps should be copied into evergreen copy without their date and plan. Recheck volatile billing and access facts before publishing; propose a 30-day research freshness limit. Recheck any shutdown or signup restriction immediately before launch.

## Field table

`Required where relevant` means investigate the field for products to which it applies. A self-hosted tool's transfer fee normally points to its server provider rather than becoming zero.

| ID and field name | What it means | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| 01. Product identity and ownership | Current product name, official URL, old names, and current parent/owner when verified. | Avoid dead links and duplicate alternatives after renames or acquisitions. | Name; URL; alias list; parent name or unknown; dated ownership note. | Product page; company page; official acquisition or rename notice. | Required identity; ownership details optional if not public. |
| 02. Operating and signup status | Is it offered now, open to new buyers, in beta, invite-only, or closing? | A live marketing site may describe a product a new user cannot buy. | Active/beta/invite-only/existing customers only/closing/closed/unverified; notice and date. | Official product, signup information, changelog, and closure notices. No signup required. | Required. |
| 03. Hosting and management model | Hosted app, static site, function, rented server, own-cloud manager, or software you install. Who maintains each layer? | Stops a cheap server from being presented as equivalent to managed hosting. | Primary type; mode list; app-host/control-panel location; responsibility notes. | Architecture and getting-started docs. | Required. |
| 04. Suitable app types and directory overlap | Public site, app API, long-running app, builder site, or packaged app only; links to other directory groups. | Show what can actually be put online and where related services belong. | Task tags; arbitrary-code yes/no/unknown; other-directory tags; short sourced restrictions. | Product and deployment docs. | Required. |
| 05. Entry cost and billing terms | Cheapest ongoing plan a solo commercial user can actually use, mandatory base/seat fees, currency, tax treatment, renewal, and commitment. | A promotional monthly equivalent can hide a large upfront or renewal bill. | Amount and native currency; month/year/hour; minimum seats; initial/renewal price; upfront total; tax inclusion; cancellation rule if published. | Official pricing and billing terms. | Required. |
| 06. Included compute and storage | The resources you get: processor allocation, memory, disk, architecture, and whether the processor is shared. | Match a plan to an app without pretending all virtual processor cores perform alike. | Plan-scoped vCPU; shared/dedicated; RAM GiB; disk GB/GiB; architecture; function allocation if relevant. | Plan specification and resource docs. | Required where relevant. |
| 07. Usage billing units and rates | What is charged as usage grows, such as CPU time, memory time, requests, or active instance time. | Explain the bill beyond a starting price. | Meter list; amount/currency per unit; included allowance; billing rounding; regional rate. | Pricing tables and metering docs. | Required where relevant. |
| 08. Ongoing free plan | A repeating free allowance, its limits, sleep rules, expiry/deletion rules, and what happens at the limit. | Distinguish a usable free host from a temporary credit. | Yes/no/unknown; limits with units and reset period; retention/inactivity; pause/charge/reject behavior. | Free-plan docs, pricing, usage policies. | Required. |
| 09. Trial and buyer requirements | Temporary credits, expiry, card requirements, identity checks, eligible countries, and payment methods when public. | A buyer in India or Latin America may not be able to use a listed offer. | Trial amount/days; card/identity yes/no/unknown; country exclusions; currencies/payment methods; personal/company eligibility. | Trial and account/billing help; eligibility terms. | Required trial/card; country/payment detail optional when not public. |
| 10. Commercial and acceptable use | Which plans allow business use, ads, affiliate sites, selling products, and restricted app categories. | Free does not always permit earning money. | Per-plan allowed/restricted/unknown; specific activities; exact policy section link. | Fair-use policy, acceptable-use policy, and plan terms. | Required. |
| 11. Data transfer and network costs | Included outgoing data, excess rates, region differences, fair-use terms, and traffic between app and database. | Traffic can cost more than the app server. | Inbound/outbound/internal/CDN allowances and per-GB/GiB rates; pooled/per-app; cap/reset; exclusions. | Network and bandwidth pricing; fair-use docs. | Required where relevant; reference the infrastructure bill for deploy tools. |
| 12. Build and deployment costs/limits | Cost and limits for turning source into a running app, including preview builds. | Frequent pushes and previews can create another bill or fail a build. | Build minutes; machine size; concurrency; maximum duration; deploy count; rate and overage; external/self-managed flag. | Build pricing and limits docs. | Required where relevant. |
| 13. Other unavoidable or easy-to-miss charges | Public IPv4 address, load balancer, gateway, disk, image processing, logs, backups, seats, and required third-party services. | Make the total cost visible instead of quoting only compute. | Line-item amount/unit; required versus optional; inclusion rule; outside-provider charge. | Product pricing and documented reference architecture. | Required investigation; record none only if supported. |
| 14. Protection against a surprise bill | Alerts, prepaid balance, enforceable caps, automatic pauses, maximum instances, and remaining charges after a stop. | An alert alone does not stop charges. | Control type; default/opt-in; scope; threshold; delay; pause effect; excluded meters; residual storage/base charges. | Spend-control and billing docs, not only a pricing slogan. | Required. |
| 15. Cost of defined example workloads | A transparent estimate for the same stated task, with unsupported cases visible. | Compare costs without treating unrelated starting plans as equivalent. | Scenario ID; compatible yes/no/unknown; selected plan/region; cost line items; monthly total/range; formula; assumptions and source inputs. | Derived from sourced prices and limits. No vendor example total copied as our estimate. | Required for compatible workloads; unknown if inputs cannot be found. |
| 16. App server and delivery regions | Where code runs, where files are delivered, and which regions can be selected. | A nearby delivery cache is not necessarily a nearby app server. | Separate compute-region and delivery-location lists; country/city/provider code; plan/mode restrictions. | Region docs and plan availability tables. | Required where relevant; provider-dependent for deploy tools. |
| 17. Data location and privacy terms | Promises about where app data, logs, builds, and backups stay, including exceptions. | A selectable server location alone does not prove data stays in that country. | Per-data-type location commitment; opt-in/plan; exceptions; data-processing agreement link. | Data-processing agreement, subprocessors list, regional service docs. | Optional; never infer a legal guarantee from marketing or region count. |
| 18. Languages, runtimes, and architecture | Which language environments and versions run, and whether you can bring a container. | Avoid finding out after signup that an app cannot run. | Runtime/version list; container support; processor architecture; native versus custom setup. | Runtime and deployment docs. | Required. |
| 19. Framework behavior | Support for chosen web frameworks and features such as server rendering, streaming, and cached page refreshes. | A logo or “Next.js support” does not prove every app feature works. | Framework + version/adapter; feature-by-feature supported/limited/unknown; restriction and source. | Official framework deployment guides and adapter docs. | Required for promoted frameworks; otherwise optional. |
| 20. Deployment inputs and tools | Ways to supply code: Git, folder upload, container image, command line, dashboard, or API. | Match a host to the builder's workflow and ability to move code. | Method tags; repository providers; private-repository rules; required external tools. | Deploy/get-started docs. | Required. |
| 21. Workers and scheduled jobs | Separate long-running background processes and jobs run on a schedule. | Many apps need work that should continue after a web request ends. | Worker yes/no/self-managed; scheduled jobs yes/no; duration/frequency limits; added price/plan. | Worker and job docs. | Required for app/runtime services; not applicable for static-only hosts. |
| 22. Network and connection support | Long-lived live connections, streaming, public ports, outgoing requests, fixed IPs, and private networking. | Live chat, webhooks, and external APIs can depend on these. | HTTP/streaming/WebSocket support; TCP/UDP; connection timeout; outbound restrictions; static IP/private network availability. | Networking and runtime limits docs. | Required core protocols for app hosts; advanced networking optional. |
| 23. Scaling, sleeping, and idle billing | Whether an idle app stops, how it starts again, and whether capacity can grow with demand. | Explain wake-up delays and whether unused apps still cost money. | Always-on/sleep/scale-to-zero; idle trigger; minimum/maximum instances; scaling controls; billing while stopped. | Scaling, free-plan, and billing docs. | Required. Do not substitute a measured cold-start number. |
| 24. Runtime and request limits | Maximum execution time, request size, concurrency, app count, and relevant resource ceilings. | A cheap plan is unusable if a normal request is rejected. | Named limit; amount/unit; scope; configurable range; per-plan exception. | Runtime limits and quota docs. | Required where relevant. |
| 25. Persistent app files | Whether saved files survive restarts/deploys, volume limits, and backup coverage. | Prevent lost uploads and mistaken reliance on temporary disk. | Temporary/persistent/object-storage-only/self-managed; capacity/rate; attachment/scaling restriction; backup exclusion. | Filesystem and disk docs. | Required for app hosts; not applicable for static-only delivery except uploaded-site storage. |
| 26. Databases and supporting services | Managed database, cache, queues, storage, and auth availability, including who maintains them. | A full app may need more than a web process and another provider bill. | Native managed/add-on/marketplace/self-managed/external; service types; linkage and costs; other-directory tags. | Service catalog and architecture docs. | Required summary; full database/auth facts belong in their own directories. |
| 27. Domains and encrypted connections | Custom domains and automatic HTTPS, meaning encrypted browser connections; subdomains and wildcard rules. | A public product needs a stable usable address. | Domain/subdomain yes/no; included count; plan; certificate issue/renewal responsibility; wildcard support. | Domain and certificate docs. | Required. |
| 28. Preview, release, and recovery workflow | Preview sites, test environments, deploy health checks, rolling updates, and return to an earlier app version. | Reduce the risk of breaking the public app during a release. | Each feature managed/self-configured/no/unknown; plan, limits, extra resources and charges; database-rollback caveat. | Deployment and release docs. | Required basic deployment/revert path; advanced features optional. |
| 29. Logs and basic monitoring | App/build logs, saved duration, export, resource charts, and alert availability. | Know how to debug a broken app and when extra tools are needed. | Feature; retention; limits/rate; export yes/no; plan. Separate app logs from visitor analytics and error monitoring. | Logging, metrics, retention, and pricing docs. | Required summary. |
| 30. Access and secret handling | Account protection, teammate permissions, deployment secrets, and who controls server access. | Protect production credentials and give helpers limited access. | Two-factor login; permission roles; secret storage scope; SSH/root control; plan restriction. | Security and team/access docs. | Optional detail; required warning if a documented limitation materially affects the app. |
| 31. Backups and restore | What is copied, how often, what is excluded, and how a restore works. | A backup of the dashboard is not a backup of the app's database. | App/config/database/disk scopes; automatic/opt-in; schedule; retention; destination; price; restore method and exclusions. | Backup and restore docs. | Required for persisted data; not applicable where nothing is persisted. |
| 32. Availability promise and status history | Public status page and the written uptime commitment, if any. | Separate a contractual promise from observed reliability. | Status URL; SLA percentage; eligible plan; exclusions; service-credit rule; no public SLA/unknown. | Official status page and full service-level agreement (SLA). | Required search; public historic uptime optional. |
| 33. Support channels and terms | Who helps, through which channel, on which plan, and any stated response promise. | A community chat is different from help during an outage. | Docs/community/email/chat/ticket; hours/time zone; guaranteed response or none found; added cost. | Support docs and plan terms. | Required channels; response targets optional. |
| 34. Exit and portability | How to move source, files, database, settings, and domain elsewhere; what remains proprietary. | Reduce the cost of leaving a product that no longer fits. | Export formats; migration procedure; required adapters; known non-exportable parts; deletion/retention rules if public. | Export, backup, migration, and account-deletion docs. | Required documented exit path; unknown allowed; difficulty score omitted. |
| 35. Software license and commercial terms | License for deploy software and conditions for business use or paid features. | Source being visible does not always mean unrestricted use. | License ID/link; edition; paid-license trigger; hosted service terms link. | Repository LICENSE file and official license/pricing terms. | Required for tools you run; hosted proprietary services may use not applicable for software license. |
| 36. Self-host requirements and ongoing work | Supported operating systems, minimum hardware, updates, backup duties, and behavior if the dashboard is unavailable. | Count the work and infrastructure needed for a supposedly free deploy tool. | Supported OS/architecture; CPU/RAM/disk minimum; root/SSH needs; update/backup owner; controller outage behavior or unknown. | Installation, architecture, maintenance, recovery docs. | Required for self-hosted and own-cloud tools; not applicable to fully managed plans. |
| 37. Evidence and freshness | The source and date for each claim, plus unresolved conflicts and derived values. | Keep the directory checkable and prevent stale facts from appearing certain. | Per-claim URLs; checked date YYYY-MM-DD; source date if shown; official/derived label; missing/conflicting reason; prior value where needed. | Research record created while reading the sources. | Required for every fact, not just once per app. |

## Comparable cost examples

These are proposed inputs, not completed estimates. Use one paying builder, a public commercial product, a custom domain, normal monthly billing, no startup credits, no annual discount, and no optional support package. Keep domain registration outside the hosting total unless mandatory. Show tax treatment and native currency; do not silently convert currencies.

| Scenario | Fixed workload | What to include | Compatibility rule |
| --- | --- | --- | --- |
| A. Small commercial static site | 100 MB deployed files; 1,000,000 HTTP requests and 100 GB outbound per month; 20 builds of 5 minutes; one private source repository; one custom domain. | Plan/base fees, delivery, requests, builds, storage, certificates, and any required delivery service. | State if the free plan bans commerce, the private repository requires another paid service, or the product cannot serve this workload. |
| B. Small commercial app API | Stateless HTTP app; 1,000,000 requests/month; assumed 100 ms active processor work and 250 ms total elapsed time per request; assumed 256 MiB working memory; 100 GB outbound; same builds/domain as A. | Function or app compute, minimum always-on allocation, requests, transfer, builds, logs required for operation, and compulsory gateway/load balancer/IP fees. | For servers, quote the smallest documented plan with at least 1 vCPU and 1 GiB RAM, running for 730 hours. This is a capacity assumption, not proof of equal speed or throughput. Flag unverified workload fit. Do not convert virtual cores into function-time performance. |
| C. App plus persistent data | Scenario B plus one Postgres database with at least 1 GiB memory and 10 GB storage; daily backup retained 7 days; 10 GB/month app-to-database traffic. | All B costs plus the actual database plan, transfer, backup storage/operations, and mandatory platform add-ons. | If Postgres must come from elsewhere, name that dependency and show the hosting subtotal separately. If self-managed on the app server, state the extra resource allowance. No claim that an app rollback restores database data. |

Publish a total only when every required billed component is either priced or explicitly documented as included. If the source does not support a precise rate, use unknown or a labelled range with assumptions. No “from $5” ranking presented as the cost of the same app. Deployment tools need software/control-panel cost plus an explicitly named server configuration, including capacity for the tool itself.

Before final cost charts, confirm with the owner whether these workloads represent the target users. For existing products, confirm feature compatibility through documentation; actual load capacity would need a later deployment test.

## Short feasibility test

Test date: 2026-11-04. Products: **Vercel** (managed frontend/functions), **Hetzner Cloud** (rented servers), and **Coolify self-hosted** (deployment software). Only public pages were used. No accounts, deployments, benchmarks, or complete product records were created.

Labels: **Easy** = the checked public pages exposed useful evidence for the field. **Hard** = evidence is spread out, has a dynamic page/extraction problem, needs a calculation or a chosen external provider, or only answers part of the field. **Not found** = no usable answer in this bounded page sample; this is not a claim that the vendor never publishes it. **N/A** = not a vendor-provided feature in this model, with the reason shown. The table evaluates findability, not feature quality.

### Official test sources

All URLs below were opened on 2026-11-04. Search results were used only to find the moved Coolify backup pages.

| Code | Source |
| --- | --- |
| V1 | [Vercel pricing](https://vercel.com/pricing) |
| V2 | [Hobby plan and commercial restrictions](https://vercel.com/docs/plans/hobby) |
| V3 | [Spend management](https://vercel.com/docs/spend-management) |
| V4 | [Functions limits](https://vercel.com/docs/functions/limitations) |
| V5 | [Compute and delivery regions](https://vercel.com/docs/regions) |
| V6 | [Deployments](https://vercel.com/docs/deployments) |
| V7 | [Framework matrix](https://vercel.com/docs/frameworks) |
| V8 | [General limits, including logs and builds](https://vercel.com/docs/limits) |
| H1 | [Hetzner Cloud product and price interface](https://www.hetzner.com/cloud/) |
| H2 | [Cloud billing FAQ](https://docs.hetzner.com/cloud/billing/faq/) |
| H3 | [Cloud locations and product availability](https://docs.hetzner.com/cloud/general/locations/) |
| H4 | [Terms and conditions](https://www.hetzner.com/legal/terms-and-conditions/) |
| H5 | [Backups and snapshots](https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/) |
| H6 | [Cloud server SLA](https://docs.hetzner.com/general/company-and-policy/slas-cloud/) |
| C1 | [Coolify pricing and responsibility split](https://coolify.io/pricing) |
| C2 | [Self-host installation and requirements](https://coolify.io/docs/start-with-self-hosted) |
| C3 | [Application deployment model](https://coolify.io/docs/applications/) |
| C4 | [Application operations and linked settings](https://coolify.io/docs/applications/operations/overview) |
| C5 | [Database backups](https://coolify.io/docs/databases/backups) |
| C6 | [Coolify instance backups](https://coolify.io/docs/core/backup-and-recovery/instance-backup) |
| C7 | [Official repository and license listing](https://github.com/coollabsio/coolify) |

### Findability by field

| Field | Vercel | Hetzner Cloud | Coolify self-hosted |
| --- | --- | --- | --- |
| 01. Identity and ownership | Easy identity V1; owner detail not tested. | Easy identity H1/H4. | Easy identity/project C7; legal owner detail not tested. |
| 02. Operating/signup status | Easy public offer V1; actual signup not attempted. | Easy public offer H1; stock cannot be inferred. | Easy installation path C2; no account needed for self-hosting. |
| 03. Management model | Easy V4/V6. | Easy H1/H2. | Easy C1/C2/C3; app servers are still yours. |
| 04. App types/overlap | Easy V4/V6. | Easy broad server model H1; each application is your setup. | Easy C3/C7; custom apps distinct from catalog services. |
| 05. Entry cost/billing | Easy base/currency/tax V1; full seat and renewal rules Hard. | Hard H1: live price cards were missing values in the text extract. H2 explains billing separately. | Easy software price C1; total hosting bill Hard because the server is separate. |
| 06. Included resources | Easy function ceilings V4; exact allocation still plan-specific. | Hard H1/H3: model and shared/dedicated distinction visible, exact plan cards not usable. | Easy minimum C2; app capacity needs a chosen server. |
| 07. Usage units/rates | Hard V1/V4: several meters and regional rates, not one price. | Easy billing method H2; exact compute rate Hard H1. | N/A software metering for free self-hosted mode C1; underlying host rate remains required. |
| 08. Ongoing free plan | Easy V2; caps and stop behavior need plan-specific capture. | Hard: no free offer found in H1/H2; absence is not a fully checked “no free plan.” | Easy C1: free software clearly separated from required infrastructure. |
| 09. Trial/buyer requirements | Easy trial link V1; card and country/payment requirements Not found in checked pages. | Not found for trial/card/country eligibility in this sample; do not infer universal access. | N/A vendor trial/card for software install C1/C2; server provider requirements still apply. |
| 10. Commercial use | Easy V2: explicit Hobby restriction. | Hard H4: contractual review required; no free-tier rule to copy. | Easy license lead C7; paid hosted terms would be a separate mode. |
| 11. Data transfer | Hard V1: included data and flat-rate/usage modes must be distinguished. | Easy region-dependent billing policy H2; exact scenario rates require careful extraction. | N/A software transfer charge C1; external server/network costs cannot be treated as zero. |
| 12. Builds | Easy duration/deploy limits V8; complete bill Hard V1. | N/A managed builder; your build process uses purchased server/external resources H1. | Easy build-on-your-server model C2/C3; actual build cost Hard. |
| 13. Other charges | Hard V1: several separate resources and regional prices. | Hard H1/H2/H5: server and optional services are split. | Easy warning C1 that infrastructure is separate; total extras Hard. |
| 14. Surprise-bill protection | Easy V3: explicit pause behavior, delay, and charges that can continue. | Easy H2: email alerts are not an enforced account-wide spending cap. | N/A global cloud billing cap in self-hosted software; combine C1/C2 with chosen provider policy. |
| 15. Scenario cost | Hard: derive from V1/V3/V4, not a published single comparable total. | Hard: exact prices not extracted from H1; no reliable total yet. | Hard: C1/C2 plus external infrastructure and controller resource allowance needed. |
| 16. Regions | Easy V5; compute regions and delivery locations are distinct. | Easy H3: location and product availability table. | N/A vendor compute regions; choose connected provider C1/C2. |
| 17. Data location/privacy guarantee | Hard: V5 gives locations, not a complete data-location contract. | Hard: H3 location is not a full data/backup/log residency promise. | Hard: C2 shows control of the server; does not settle telemetry or hosted-control-service data location. |
| 18. Runtimes | Easy V4's runtime section; exact versions need further guides. | Self-managed by model H1; OS/version/architecture detail Hard in this sample. | Easy container model C3; supported OS/architecture C2. |
| 19. Framework behavior | Hard V7: matrix labels were extracted but feature cells were blank. Do not convert blanks into support. | N/A native managed framework certification; self-configured H1. | Hard C3/C4: container support and examples are not proof of every framework feature. |
| 20. Deployment inputs | Easy V6: supported deployment methods and Git providers. | Easy API/CLI availability H1; app deployment is self-configured. | Easy C3: source/container input methods. |
| 21. Workers/scheduled jobs | Hard V4/V8: dedicated product docs needed to establish current limits. | Self-managed H1; not an included managed-worker feature. | Easy scheduled-task path C4; job limits depend on app/server. |
| 22. Connections/networking | Hard V4: runtime limits and separate networking/protocol docs needed. | Easy private-network lead H1; exact ports and restrictions Hard. | Hard C2/C4: server/proxy configuration affects capability. |
| 23. Sleep/scaling/idle bill | Hard V4 establishes concurrency; full mode behavior needs more docs. | Easy H2: server remains billable while off until deleted. | Self-managed scaling model C2/C3; automatic sleep behavior Not found in checked pages. |
| 24. Runtime/request limits | Easy V4/V8. | Hard: hardware model H1, account-specific quotas may require further public docs. | Hard C4 exposes resource-limit configuration; limits depend on server and app. |
| 25. Persistent files | Hard V1 lists storage products, not a complete app-filesystem contract. | Easy distinction H5 between server disk and attached volumes. | Easy C4: persistent mounts differ from replaceable container files. |
| 26. Databases/extras | Easy marketplace/storage leads V1; exact service management and price Hard. | Self-managed server use H1; managed services must be researched separately. | Easy C3/C5/C7; do not call self-hosted databases a managed cloud service. |
| 27. Domain/HTTPS | Easy pricing inclusion V1; exact domain limits V8. | N/A automatic app certificate in raw VM model H1; builder configures it. | Hard C2/C4: proxy/domain guide needed for exact certificate/renewal claims. |
| 28. Preview/revert workflow | Easy previews V6; full rollback/health-check behavior Hard. | Self-configured app deploys H1; server snapshot H5 is a different recovery mechanism. | Easy feature paths C4; complete rollout restrictions Hard. |
| 29. Logs/monitoring | Easy V8: separate build/runtime retention. | Self-managed app logs H1; infrastructure metrics need a separate guide. | Easy basic runtime/deploy views C4; retention/export Hard. |
| 30. Access/secrets | Hard V1/V8: broad features and secret-size limits visible, full policy scattered. | Hard H1: infrastructure control visible, team/security detail outside this sample. | Hard C2/C4/C6: access and permissions visible, full account/secret model needs more docs. |
| 31. Backup/restore | Not found as a complete app/data backup policy in V1 to V8; deployment history is not enough. | Easy H5: disk snapshots, daily backups, and attached-volume exclusions. | Easy C5/C6: database backups and controller backups are separate. |
| 32. SLA/status | Easy plan-scoped SLA lead V1; full terms/status history Hard. | Easy H6: public contractual availability and credits. | N/A vendor app-hosting SLA for software you run; external host SLA separate C1/C2. |
| 33. Support | Easy support-plan lead V1; guaranteed response detail Not found in sample. | Hard H3: provider support information exists, plan response guarantee not established. | Easy C1: community versus limited hosted email support. |
| 34. Exit | Hard V6: deployment methods are clear, complete data/settings export not established. | Hard H5 supports recovery; complete cross-provider image/data export not established. | Hard C6: instance recovery is documented, whole-app migration still needs more investigation. |
| 35. License | N/A license for proprietary hosted service; terms link still needed V1. | N/A host software license; customer terms H4. | Easy project license listing C7; read the actual license file in full research. |
| 36. Self-host work | N/A managed platform V4/V6; app code still belongs to the builder. | Easy raw-server responsibility H1/H2; OS/update detail needs further guides. | Easy minimum setup C2; controller outage behavior Not found in checked sample. |
| 37. Evidence/freshness | Easy page URLs/dates to capture; pricing tables still need careful scope. | Easy URLs; old document creation dates coexist with current contents, so keep checked date separately. | Easy URLs; two old backup URLs failed and new official paths worked. |

### What the test changes

1. Keep the 37 field groups, but allow scoped unknown values. The useful information exists for the core decision in all three models. Many advanced details need several pages.
2. Keep cost examples as derived estimates. Exact plan-price extraction and missing dependency prices can block a total. The Hetzner page illustrates a dynamic-page problem, not evidence that prices are unpublished.
3. Keep commercial eligibility and bill controls required. Vercel has explicit plan restrictions and pause caveats. Hetzner documents alerts separately from an enforced spend limit. These cannot be reduced to a single “budget protection: yes.”
4. Keep provider-dependent values for deploy tools. Coolify's free software does not determine transfer costs, app uptime, server location, or the total server bill.
5. Keep framework compatibility, data-location guarantees, exit details, and deep security facts scoped or optional. A feature logo, region selector, or open-source label cannot supply those answers alone.

### Fields cut or deferred after the test

| Candidate fact | Vercel test | Hetzner test | Coolify test | Decision |
| --- | --- | --- | --- | --- |
| Actual latency, requests/second, or measured uptime | Not found as comparable measurements for our workload in V1 to V8. | Not found for the same workload in H1 to H6. | Not found for a defined hardware/workload pair in C1 to C7. | Cut from ordinary record research. A later controlled benchmark must name region, workload, period, failures, and method. |
| Exact cold-start milliseconds | No comparable measured number established in checked pages. | N/A for an always-running VM; app startup is separate. | Provider/app-dependent; no comparable measurement established. | Cut the number. Keep documented sleeping and wake-up behavior under field 23. |
| Typical deployment time or maintenance hours | No controlled typical figure established. | Depends on app and operator. | Depends on hardware, build, and operator. | Cut. Record steps and responsibilities instead of inventing a time estimate. |
| Hosting market share, revenue, and customer count | No common definition or comparable market denominator tested. | Same problem. | Project stars, installations, and paying customers are different measures. | Cut from cross-provider charts. A separately sourced dated company claim may be an optional profile note, not a ranking. |
| Guaranteed human response time on every plan | Not found in checked sample. | Not found in checked sample. | Not found for community support in checked sample. | Optional within field 33. Use unknown, not “no support.” |

## Stats and insights the fields can support

These are proposed outputs after research, not current findings. Every chart must state the eligible set, known-value count, checked date, exclusions, and treatment of unknowns. Do not use this discovery list as a market census.

| Output | Inputs | Important limit |
| --- | --- | --- |
| Share of checked hosts with a commercial-use free plan | 02, 08, 10, 37 | Count unknown policy separately; trials do not count as ongoing free plans. |
| Cost for a static site, API, and app with a database | 05 to 15, 26 | Show line items, native currency, tax, plan, region, and compatible workload. No fake equal-performance claim. |
| How costs change at 10 GB, 100 GB, and 1 TB outbound | 07, 11, 13, 15 | Recompute request/plan effects where relevant; region and included allowances matter. |
| Hosts with enforceable stop controls versus alerts only | 14, 23 | Show opt-in state, reaction delay, and charges that continue. “Hard cap” needs evidence. |
| Free-plan limits: sleeping, build time, commercial rules, and inactivity | 08 to 12, 23, 24 | Compare one named plan at a time, with expiry next to the allowance. |
| Where apps can run: India, Asia, Europe, and Latin America | 16, 17 | Separate compute regions from delivery-network locations and company headquarters. |
| Supported deployment models and runtime coverage | 03, 04, 18 to 22 | Count documented native support separately from containers, adapters, and manual installation. |
| Hosting choices for long-running jobs, live connections, or saved files | 21 to 25 | Show exact duration, connection, persistence, and scaling restrictions. |
| What a “free self-hosted platform” actually needs | 03, 05, 13, 15, 35, 36 | Include server and maintenance responsibilities. Do not assign a cash value to unpaid labor without an explicit assumption. |
| Recovery and portability comparison | 25, 28, 31, 34 | Separate code rollback, database restore, file backup, and full-provider migration. No untested ease score. |
| Base plan versus compulsory total bill | 05 to 07, 11 to 15 | Separate steady base costs, usage costs, and optional extras. |
| Providers and product families by current access/status | 01 to 03, 37 | Deduplicate aliases and parent companies; product count is not vendor count or popularity. |

No best-host score, invented popularity ranking, or reliability league table is proposed. These fields support filters and transparent comparisons once the facts are gathered.
