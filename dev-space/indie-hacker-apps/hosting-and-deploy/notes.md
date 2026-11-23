# Hosting and deploy research notes

Research date: 2026-11-04. This is step 1: discovery and a proposed field list. No complete per-app price or feature records have been collected.

## Result and counting rules

The main list has **225 candidate product records**: **165 active**, **48 gray**, and **12 check again**. These are not 225 confirmed active hosts or 225 independent companies.

| Primary type | Records |
| --- | ---: |
| Frontend/static | 23 |
| Managed app | 62 |
| Cloud/serverless | 26 |
| VPS/VM | 60 |
| Self-hosted deploy | 26 |
| Hosted deploy manager | 13 |
| Builder/specialist | 15 |
| Total | 225 |

`excluded.md` contains **49 excluded decisions**. Some are old names, grouped services, or entire provider classes, rather than independent apps. Do not use 49 as a count of closed companies. Main-list gray entries are not duplicated in that total.

Count unit: a directory record for a named product or a closely related retail product family. Some families contain several modes, such as Convox's own-cloud and hosted options, or Locaweb's Cloud/VPS plans. ECS Express Mode is a distinct deployment choice inside ECS/Fargate, not another vendor. Later research should model parent company, product family, and hosting mode separately before publishing provider statistics.

## Discovery source register

All sources below were searched or opened on 2026-11-04. A source can surface a product without proving any current facts about it. Main-list product links supply official existence evidence. A readable official page confirms a public offering, not a successful new account or deployment.

| Code | Kind and source | How it was used | Limitation |
| --- | --- | --- | --- |
| S1 | Problem-language searches; examples: [where to host a web app](https://dbggr.dev/articles/hosting-platforms-compared/) and [Vercel alternatives](https://omidsaffari.com/blog/vercel-alternatives) | Find the common hosted options and questions about cost, idle apps, and moving providers. Search extracts read; these articles were not authoritative product evidence. | Recent comparison pages can be promotional, stale, or wrong. No competitor facts copied from them. |
| V1 | Vendor comparison: [Railway's platform comparison](https://railway.com/guides/paas-comparison-guide) | Discover mainstream managed platforms. Page opened. | Railway sells one of the compared services. No claims about competitors accepted as fact. |
| A1 | Public list: [awesome-paas](https://github.com/debarshibasak/awesome-paas) | Discover large and small app platforms, retired names, and own-cloud managers. Page opened. | Its alive/defunct labels are leads, not our checks. Official visits contradicted several old descriptions. |
| A2 | Public static-site lists: [artasbartas list](https://github.com/artasbartas/awesome-services-for-static-websites) and [brandonhimpfen list](https://github.com/brandonhimpfen/awesome-static-website-services) | Read search extracts to discover static hosts and historical names. | Older lists contain dead services. Full list contents were not all reviewed. |
| R1 | Review category: [G2 cloud platform services](https://www.g2.com/categories/cloud-platform-as-a-service-paas?segment=all) | Category page opened. Discover mainstream platforms and enterprise cases to screen out. | Category includes unrelated enterprise products. Ratings and review counts were not copied as popularity measures. |
| C1 | Community: [Rails hosting comparison thread](https://www.reddit.com/r/rails/comments/1gay5bi/another_hosting_comparison_thread_fly_render/) | Thread opened. Find Hatchbox, Cloud 66, Flightcontrol, Kamal, and questions about server responsibility. | Reports are individual experiences, not measured reliability or current prices. |
| C2 | Communities: [Next.js alternatives thread](https://www.reddit.com/r/webdev/comments/1ntv6d2/best_alternatives_to_vercel/) and [large-site hosting thread](https://www.reddit.com/r/nextjs/comments/1f4rexz/best_vercel_alternative_to_host_a_large_site/) | Search extracts surfaced Appwrite Sites, netcup, app-server alternatives, and framework concerns. | Not every thread was opened in full. No unsourced performance or reliability conclusion used. |
| E1 | European discovery: [VPSBenchmarks alternatives](https://www.vpsbenchmarks.com/hosters/hetzner/alternatives), [European cloud/hosting list](https://www.euro-toolhub.eu/en/categories/cloud-hosting), and [European VPS list](https://europe-alternative.marketercoffee.com/vps-hosting/) | VPSBenchmarks page opened; other search extracts used for candidate names. | Candidate discovery only. Ranking methods, affiliate incentives, and pricing need independent checks. |
| I1 | Indian discovery: [getInfra.cloud](https://getinfra.cloud/) | Page opened after search discovery. Find local compute vendors beyond US platforms. | Its prices, regions, and usage claims were not accepted as vendor facts. |
| L1 | Latin America discovery: [Brazil VPS discussion](https://www.reddit.com/r/brdev/comments/1qmy0tv/vps_no_brasil/), [Brazil hosting list](https://howtohosting.guide/best-cloud-hosting-brazil/), [Argentina VPS list](https://ohmyvps.de/countries/ar/) | Search extracts discovered Magalu, Locaweb, DonWeb, and regional questions. Official product sites checked afterward. | No foreign host was described as having a local data center just because it appeared in a regional list. |
| P1 | Official platform-provider catalog: [Virtuozzo Cloud Union](https://www.virtuozzo.com/paas-partners/) | Catalog opened. Discover regional app platforms in India, Brazil, Uruguay, Thailand, Sweden, and other markets. | A platform vendor's catalog does not prove each retailer is accepting new solo buyers. Direct retailer checks remain required. |
| O | Seed names and direct official-site search | Names known from the task or adjacent official product navigation. Each main-list URL was opened. | Not independent proof of adoption. The list does not claim that every seed is widely used by indie hackers. |

## Search log

All queries below ran on 2026-11-04. Several ran in batches. Search results were screened for names, then official product pages were opened. One unrelated mistyped search was discarded and contributed no evidence.

| Purpose | Exact queries |
| --- | --- |
| Builder problem language | `"where should I host" "side project" hosting alternatives`; `Vercel alternatives hosting comparison Railway Render Fly Netlify` |
| Public app/deployment lists | `github awesome selfhosted deployment platforms paas hosting list`; `site.github.com "awesome" "static hosting" "Surge"` |
| Review discovery | `site.g2.com categories cloud platform as a service hosting alternatives`; `site.g2.com/categories/cloud-platform-as-a-service-paas` |
| First regional sweep | `India cloud VPS hosting "E2E" "Civo" "Utho"`; `Brazil cloud VPS hosting developers Magalu Locaweb KingHost Elestio` |
| Wider regional sweep | `India cloud hosting VPS developers Utho E2E AceCloud Cyfuture`; `Asia cloud VPS developers IDCloudHost BiznetCloud UpCloud Sakura ConoHa`; `Latin America cloud hosting VPS developers Chile Argentina DonWeb Dattatec`; `Europe cloud hosting VPS alternatives Hetzner Scaleway UpCloud netcup Aruba` |
| Regional and smaller app follow-up | `"India" "cloud" "Utho" "E2E" developers VPS`; `"deploy apps" "alternatives" "Koyeb" "Adaptable" "Doprax"`; `"hosting" "Asia" "IDCloudHost" "Sakura"`; `"VPS" "Latin America" "DonWeb"` |
| Status and renamed products | `site.aws.amazon.com "App Runner" "new customers" 2026`; `site.koyeb.com Mistral acquisition joining 2026`; `site.upsun.com Platform.sh renamed Upsun`; `site.ravion.com Flightcontrol renamed` |
| Official blocked-page recovery | `site.vultr.com "Cloud Compute" pricing`; `site.contabo.com "Cloud VPS" 2026`; `site.utho.com cloud compute pricing`; `site.zerops.io pricing deploy` |
| More official recovery | `site.convox.com pricing deploy`; `site.pages.edgeone.ai "Pages" hosting`; `site.tiiny.host hosting static pricing`; `site.hosthatch.com cloud compute` |
| Field feasibility | `site.coolify.io/docs backup restore scheduled tasks rollback persistent storage`; `site.docs.hetzner.com cloud traffic limit alerts spending backups SLA`; `site.vercel.com/docs logs retention cron export deployment backup` |
| Historical-product checks | `Cyclic shutting down May 2024 official cyclic.sh`; `Deta Space sunset official 2024 2025 site:deta.space`; `site.digitalocean.com Nimbella acquired functions`; `site.firebase.blog Divshot acquired shutting down` |
| Final blocked-site and status checks | `site.adaptable.io hosting shutting down sunset`; `site.openode.io hosting shutdown status`; `site.reclaimhosting.com Reclaim Cloud hosting`; `site.utho.com/docs cloud compute`; `site.nekoweb.org hosting about`; `site.interserver.net/docs VPS hosting`; `site.greencloudvps.com VPS cloud`; `site.saveincloud.com.br PaaS hospedagem` |

Official-site sweeps also followed product links rather than searching every app by name. For example, the official Cloudways navigation led to Velocity; Firebase Hosting linked to App Hosting; Deno's announcement banner led to its transition notice. `apps.md` contains all main-list URLs and their check dates.

## Changes and warnings worth carrying forward

These are discovery findings, not finished app profiles:

- **Deno Deploy:** the [official October 9, 2026 announcement](https://deno.com/blog/cloudflare) says the team joins Cloudflare and Deploy continues for six months before closing. Keep it as a transition case, not a normal fresh hosting recommendation. Do not invent a precise final shutdown day from “six months.”
- **AWS App Runner:** its [official page](https://aws.amazon.com/apprunner/) says new customers stopped April 30, 2026. Existing services continue. It points to ECS Express Mode.
- **Laravel Vapor:** the [official page](https://vapor.laravel.com/) says new signups have stopped and points to Laravel Cloud.
- **Koyeb:** its [official Mistral announcement](https://www.koyeb.com/blog/koyeb-is-joining-mistral-ai-to-build-the-future-of-ai-infrastructure) says the service continues, with new users limited to Pro or higher plans. The announcement itself describes closing conditions; do not infer legal completion from the homepage banner.
- **ConoHa VPS:** its [official page](https://vps.conoha.jp/) says new applications are temporarily suspended. A public price page does not establish current availability.
- **Northflank:** the [homepage](https://northflank.com/) carried a security-incident notice during the check. This inventory does not assess the incident or give a reliability score. Check official updates before a later recommendation.
- **Fleek, Genezio, and FL0:** their current official sites no longer present the historical hosting offer in the way older directories do. Fleek shows a coming-soon/relaunch page; Genezio and FL0 pitch different products. Legacy customer service status remains unverified.
- **Renames:** Platform.sh/Upsun, Flightcontrol/Ravion, Linode/Akamai, EdgeOne Pages/Makers, and NoVPS/Granite should not become duplicate independent alternatives.
- **Cyclic and Deta:** Cyclic's official indexed result contains a shutdown notice, but direct access failed. Deta's current official hosting offer could not be verified. Keep those evidence limits visible.

## Checks that remain unresolved

Every main-list product had an official URL opened. For 11 of the 12 `Check again` records, the public read did not establish a current operating service. ConoHa's site was readable, but new-user access is paused.

| Candidate | What happened | Useful next check |
| --- | --- | --- |
| Nekoweb | 403 access block. | Public official help/status page or a later ordinary browser visit. |
| Antel Mi Nube | Both www and bare-domain access failed/timed out; listed in P1. | Current official Antel product page and retail access information. |
| Adaptable | Official page inaccessible. | Official docs/status/closure notice. |
| opeNode | Official page inaccessible. | Current official offer or retirement notice. |
| lavela | Official page inaccessible. | Current public product/docs page. |
| MoodLensAI hosting | Cache miss. | Official product page and confirmation that app hosting is still the offer. |
| The Vibe Hosting | Official page inaccessible. | Public official docs and current access information. |
| podway | Official page inaccessible. | Official app catalog and current service notice. |
| HostHatch | Official root and products pages yielded no readable body; official indexed product extract exists. | Readable official product/docs page; do not treat an empty extract as a closure. |
| InterServer VPS | Repeated 403 access blocks. | Official VPS docs/product page through ordinary public access. |
| Utho | Root and pricing pages blocked access. | Official compute docs or readable pricing page. |
| ConoHa VPS | Readable site says new applications temporarily suspended. | Official notice that applications resumed. |

Three initial access failures were resolved: [SaveInCloud's current site](https://saveincloud.com/pt-BR/) offers Cloudlets and Nuvion; [Reclaim's official support category](https://support.reclaimhosting.com/hc/en-us/categories/360005246314-Reclaim-Cloud) documents its container hosting; and [GreenCloud's bare-domain site](https://greencloudvps.com/) was readable. Their records are active, with no claim that signup was tested. Utho and InterServer's alternate documentation pages remained blocked. Nekoweb's wiki also returned 403.

Other partial checks: E2E's homepage is now GPU-led, so its exact current general CPU product needs verification. Leapswitch's small-VM purchase path was not established. The old Back4app Containers URL redirects to a backend-focused homepage. Bolt's native hosting dependencies, and Neon functions availability, need product-level documentation.

Public web fetches can return cached/indexed content. A check date records when the source was read here, not an uptime probe or assurance that the page changed that day. No signup, capacity test, uptime measurement, or support interaction took place.

## What may still be missing

This is broad coverage across the main hosting models, not a defensible claim to have found every provider worldwide. It should be described as a first-pass inventory until the gaps below are closed.

1. **Regional depth:** Latin America has Brazil, Argentina-oriented DonWeb, a Uruguay lead, and international-region candidates, but local Chilean, Mexican, Colombian, and Peruvian app hosts need native-language discovery. Vietnam, Indonesia, Japan, Korea, India, Iran, and Thailand are represented; Bangladesh, Pakistan, Nepal, the Philippines, Malaysia, and more local providers still need deeper checks. African and Australian local providers received little targeted discovery.
2. **Platform-catalog long tail:** P1 includes more retailer brands that were not individually screened. Examples include dogado, CloudPlatform.fi, Scaleforce, Previder, neen, Hosteur, UniCloud, Axarnet, Primetel, PS.kz, VirtualCloud, WafaiCloud, Cloudlets, Savecore, Libyan Spider, Togglebox, beebyte, UKHost4u, Keliweb, YetiApp, and EdgeCloud.ph. These are backlog leads, not verified or excluded app records. Do not publish them without official retailer checks.
3. **VPS long tail:** VPSBenchmarks also surfaced Evolution Host, which was not screened. LowEndTalk/LowEndBox, regional developer communities, and local comparison sites could add many more. Apply the direct-product and useful-distinction rule instead of counting every reseller storefront.
4. **Other product modes:** This pass does not enumerate every cloud's VM family, Kubernetes product, bare-metal plan, function variant, or private-cloud edition. Alibaba's simpler app-server product, Tencent CVM, Huawei function/container products, and more regional function platforms merit a specific follow-up if the owner wants product-level breadth inside each cloud.
5. **Older public lists:** A2 and A1 contain additional historical names not all screened individually. Do not treat a missing old name as proof of closure. A dedicated retired-product pass could reduce stale-directory leakage.
6. **Specialist hosting:** Rails, PHP, Python, WordPress, and creator sites are represented. Java-specific managed hosts, Elixir-specific hosting, game servers, GPU inference, decentralized compute, and notebook/model hosting need separate scope decisions. This pass includes only a few gray examples from the last two groups.
7. **Evidence of adoption:** Regional presence and a usable-looking public product do not prove indie-hacker adoption. Use community discovery for leads and source exact adoption claims separately later. No fabricated user counts, market shares, or popularity ordering are included.

## Questions for the owner before full research

These do not block the discovery files. They guide the next approved step.

1. Keep the **15 builder/specialist records** here, move them to a later website-builder group, or leave them out? This includes Webflow, Framer, Carrd, Wix, Squarespace, WordPress.com, Ghost(Pro), Kinsta, WP Engine, SiteGround, DreamHost, CloudCannon, Bubble, Lovable, and Bolt.
2. Keep **command-line deploy tools** such as Kamal, SST, and Serverless Framework, plus catalog-first/home-server tools, alongside hosted dashboards? They need distinct type filters.
3. Keep **backend-only functions**, such as Supabase/Convex/Neon, here as well as databases/backend and auth? The current proposal keeps them with clear overlap labels.
4. Approve the **37 field groups** and the **three example workloads** in `fields.md`? The API example includes explicit workload assumptions; equal performance remains untested.
5. Expand regional discovery before starting per-app research, or approve the field list first and resolve the verification backlog in those app research tasks? The country gaps above are real.

## Files and limits

Only these four files were written, all within this task's folder:

- `dev-space/indie-hacker-apps/hosting-and-deploy/apps.md`
- `dev-space/indie-hacker-apps/hosting-and-deploy/excluded.md`
- `dev-space/indie-hacker-apps/hosting-and-deploy/fields.md`
- `dev-space/indie-hacker-apps/hosting-and-deploy/notes.md`

No code, route, database, migration, branch, commit, or production change was made. No forms were submitted and no accounts were created. No env files or secrets were read.
