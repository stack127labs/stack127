# Launch directories: directory plan and candidate inventory

Status: The earlier development review included 165 cards: the 82 existing directory and app-catalog listings plus all 83 previously held leads, including LibHunt. Known facts stay visible; missing, blocked, or conflicting details have short explicit labels. The 29 previously excluded sites and six community-post destinations are outside the public directory. The main research was checked on 2026-09-29, with selected submission routes and current terms rechecked on 2026-09-30. The inclusion and missing-detail policy was updated on 2026-09-30. The current saved draft has 171 entries. Development keeps the page available for review; production keeps its registry row unpublished. Shipping draft code and records does not publish the directory. Publication awaits owner review.

This develops idea 4 in [site direction and topic gaps](../../content_ideas/2026-09-25-site-direction-and-topic-gaps.md). The proposed public URL is `/launch-directories`. Keep it as one directory page with categories and filters. A candidate's presence in this document does **not** establish that its site is live, accepts submissions, offers a free listing, or publishes an outbound link.

## Decision

Proceed with a focused first release. The useful question is: **Where can I submit this product, what will the submission require or cost, and what kind of listing will I actually get?** A maintained answer fits stack127's solo builder audience and directory format. The machine-checkable part is valuable, but it must be described precisely: a crawler can observe a reachable site and the HTML of a sampled public listing; it cannot prove traffic, search ranking value, acceptance, or a future review time.

The gap is narrower than the original idea suggested. [Toolfound's launch guide](https://toolfound.com/launch-guide) and [directree's directory list](https://www.directree.io/blog/where-to-submit-saas-2026) already publish link observations, while [LaunchRepo](https://launchrepo.dev/blog/best-startup-directories-2026/) and [theStacc](https://thestacc.com/blog/startup-directories-submit-product/) publish broad candidate lists. Their categories, prices, and link claims vary, sometimes within the same guide. stack127 should compete on **per-listing evidence, clear scope, checked dates, and corrections**, not on the largest count or a claim that no one checks links.

The original 30 to 50 site count was a starting estimate. The directory now includes major launch boards, smaller boards, app stores, and niche listing sites. Missing details alone do not prevent inclusion. Keep known facts and clearly label the remaining gaps, without claiming that an unreachable site currently accepts submissions. A niche site can qualify when its audience fits a real product type, even if it is small. Avoid traffic, domain rating, and SEO benefit scores unless a defensible first-party measurement method exists.

## Scope and page shape

- **Primary listings:** a site or catalog where a maker can submit a product, startup, app, extension, API, or open-source project and potentially receive a persistent public entry. Launch boards with a timed feature also qualify.
- **Community posts:** places such as Show HN, Reddit, and DEV are outside the directory's scope. The directory focuses on sites where makers list a product, startup, app, integration, or project.
- **Exclude from the main directory:** submission agencies, lists of directories, generic press outlets without a clear submission path, automatically scraped profiles that cannot be claimed, and deal or affiliate marketplaces that require a sales promotion. Keep relevant app stores and integration catalogs in a clearly named category because publishing an app or integration is a different workflow.
- **One public route:** `/launch-directories`, using the self-host apps directory pattern: a category filter and other useful filters beside one grid of cards. The categories in the inventory below become filter options, not separate page sections. Keep initial results server-rendered and readable on mobile. Use the existing pagination pattern if needed. There is no details drawer or per-site page.
- **Primary categories:** Launch boards; prelaunch and beta; general startup and software listings; software reviews and alternatives; AI; developer and open source; app stores and integrations; design, no-code, and creator tools; specialist and regional sites. Each site gets one primary category and optional product-fit tags.
- **Sidebar filters:** search, category, cost, and link type. Show only choices that currently have visible listings. Unknown cost and link values have their own filter choices and are not classified as free or dofollow without evidence.

## What a public card should show

Use the shared self-host app card presentation: logo, name, primary category in the same position, `+N` for other categories, a short description, and labeled fact rows with icons. Give this directory its own fact values. The card's main area opens the site's official website directly. A separate **Submit here** action at the bottom opens the verified submission form or the official page where the submission process starts. Do not open a drawer. Build the website link and submission link as separate, keyboard-accessible links; do not nest one link inside the other.

| Icon row | Display rule |
| --- | --- |
| **Best for** | The makers or products most likely to fit, such as `Indie SaaS` or `Developer tools`. The short description says what the site is. |
| **Cost** | Combine the free/paid answer and starting price: `Free`, `Free + paid from $29`, or `Paid from $49`. State the billing period when known. If it is missing, use the short labels below and preserve any known offer. |
| **Review time** | Use the site's published estimate when available. If it gives a scheduling or self-publishing process instead of a duration, explain that process briefly. Do not invent a deadline or promise acceptance. |
| **Link type** | Tell readers whether a published listing's main product link is dofollow, nofollow, sponsored, UGC, or changes by plan or rank. State combinations such as `UGC + nofollow` when present. Use `Couldn't verify` if a site blocks inspection. Check free and paid listings separately when they differ. |
| **Eligibility** | A short rule that helps the visitor decide whether they qualify, such as `Live apps only` or `Open-source projects`. Use `See submission rules` if it cannot be reduced honestly. |

The category is a badge, not a fact row. Do not add product stage, submission method, listing type, badge requirement, or last checked as separate card rows. Those facts may inform the eligibility or cost wording where needed. Show **Submit here** only for a verified official submission or start page. For a broken route, show **Submission page unavailable**. If no route was found, show **Submission page not found**. The card still opens the official website.

Use **Not stated on their site** for an unpublished detail, **Couldn't verify** for inaccessible evidence, **Conflicting info** for contradictory official terms, and **Varies by plan** for documented tier differences. Keep useful known facts alongside these labels. Retain the full findings and sources in the research record for a later pass.

`Dofollow` is familiar shorthand for a link without `nofollow`, `sponsored`, or `ugc`; there is no `dofollow` HTML attribute. It does not promise indexing or ranking. A directory may use different links on list rows, detail pages, old entries, free entries, and paid entries. A failed request, blocked page, login wall, or JavaScript-only link means the link type is unverified. Keep that status in the research record and show `Couldn't verify`. Do not turn an inaccessible page into a claimed `No link` result.

## Research record behind each card

One site record needs a stable slug, canonical name and domain, operator if known, primary category, product-fit tags, stage, region/language, listing model, official home URL, official submission URL, public example listing URL, inclusion status, and notes about duplicates or parent brands. Keep aliases and redirects so renamed sites are not listed twice. These research fields do not require a drawer or site detail page.

Agents should still research the complete submission terms: eligibility and exclusions; free and paid prices, billing and tier differences; account and ownership requirements; required materials; review, scheduling and relaunch rules; badge or reciprocal-link conditions; listing type and duration; and the link shown on a published example. Keep those facts in the research record so the five public rows and **Submit here** link are accurate. A material condition that cannot fit into an honest short label should be stated in the card description or eligibility row.

Record each changing fact in `evidence` with `status` (`verified`, `not_published`, `unverified`, or `conflicting`), `source_url`, `checked_at`, a note, and the method (`official terms`, `official form`, `public listing HTML`, or `manual review`). Store price amount and currency only when the applicable tier and billing period are clear. Preserve an observation history when a fee, policy, or link changes. `site_up` should distinguish `reachable`, `redirected`, `blocked`, `error`, and `not checked`; a timeout does not mean closed.

For link checks, use a **published product detail page**, not only the directory homepage. Save the exact page URL, product destination, `href`, `rel` tokens, redirect destination, HTTP status, page robots signals, sampled tier, and check time. Respect source terms and robots policies, rate-limit requests, and queue ambiguous results for manual review. Do not copy descriptions or entire catalogs from other sites.

## Candidate inventory

All 200 entries below began as **research leads**, including six community-post destinations. The links identify candidate sites, not verified submission URLs. The roster is intentionally broad, including basic sites and narrow niches, so research can reject weak or closed options. The completed decisions are in [research batches 01–05](.). A complete list of *every* launch directory cannot be frozen: new sites appear, old sites close, and some accept only particular products. Add new candidates through the same evidence gate rather than treating this list as final.

Lead sources used for discovery: [theStacc startup list](https://thestacc.com/blog/startup-directories-submit-product/), [theStacc SaaS list](https://thestacc.com/blog/saas-directories-list/), [LaunchRepo's category overview](https://launchrepo.dev/blog/best-startup-directories-2026/), [IndieHunt's launch places](https://indiehunt.io/100-places-to-launch-your-startup), [Places to Launch](https://www.placestolaunch.com/), and [Toolfound's comparison](https://toolfound.com/launch-guide). These are discovery sources only. The official site and its own rules must support each public fact. Some broad lists include sites that are press outlets, submission services, closed projects, or duplicate brands; those should be rejected during review.

### 1. Launch boards and small product launches

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| Product Hunt | [producthunt.com](https://www.producthunt.com/) | Uneed | [uneed.best](https://www.uneed.best/) |
| Fazier | [fazier.com](https://fazier.com/) | MicroLaunch | [microlaunch.net](https://microlaunch.net/) |
| DevHunt | [devhunt.org](https://devhunt.org/) | Peerlist Launchpad | [peerlist.io](https://peerlist.io/) |
| IndieHunt | [indiehunt.io](https://indiehunt.io/) | TinyLaunch | [tinylaunch.com](https://tinylaunch.com/) |
| Pitchwall | [pitchwall.co](https://pitchwall.co/) | LaunchBoard | [launchboard.dev](https://www.launchboard.dev/) |
| Toolfound | [toolfound.com](https://toolfound.com/) | Nick Launches | [nicklaunches.com](https://nicklaunches.com/) |
| Smol Launch | [smollaunch.com](https://smollaunch.com/) | OpenHunts | [openhunts.com](https://openhunts.com/) |
| Hype Desk | [hypedesk.com](https://hypedesk.com/) | WhatLaunched | [whatlaunched.com](https://whatlaunched.com/) |
| SuperLaunch | [superlaunch.io](https://superlaunch.io/) | Launching Next | [launchingnext.com](https://www.launchingnext.com/) |
| Startup Buffer | [startupbuffer.com](https://startupbuffer.com/) | StartupBase | [startupbase.io](https://startupbase.io/) |
| Startup Tile | [startuptile.com](https://startuptile.com/) | FastLaunch | [fastlaunch.io](https://fastlaunch.io/) |
| Kick Product | [kickproduct.com](https://kickproduct.com/) | PeerPush | [peerpush.net](https://peerpush.net/) |
| LaunchVault | [launchvault.dev](https://www.launchvault.dev/) | PromoteProject | [promoteproject.com](https://promoteproject.com/) |
| SubmitHunt | [submithunt.com](https://submithunt.com/) | IndieProducts | [indieproducts.io](https://www.indieproducts.io/) |
| TinyStartups | [tinystartups.com](https://tinystartups.com/) | startuups | [startuups.com](https://startuups.com/) |
| Product Fifty One | [productfiftyone.com](https://productfiftyone.com/) | ComingUp | [comingup.io](https://comingup.io/) |
| StartupTrusted | [startuptrusted.com](https://startuptrusted.com/) | LaunchDB | [bigideasdb.com](https://bigideasdb.com/) |
| Startup Fame | [startupfa.me](https://startupfa.me/) | SaaSCity | [saascity.io](https://saascity.io/) |

### 2. Prelaunch, beta, and early feedback

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| BetaList | [betalist.com](https://betalist.com/) | BetaPage | [betapage.co](https://betapage.co/) |
| Betabound | [betabound.com](https://www.betabound.com/) | Beta Family | [betafamily.com](https://betafamily.com/) |
| Early Access | [earlyaccess.io](https://earlyaccess.io/) | PreApps | [preapps.com](https://www.preapps.com/) |
| Startups Lab | [startupslab.io](https://startupslab.io/) | StartHQ | [starthq.com](https://starthq.com/) |
| FoundersBeta | [foundersbeta.com](https://www.foundersbeta.com/) | Erli Bird | [erlibird.com](https://erlibird.com/) |

### 3. General startup and evergreen software listings

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| SaaSHub | [saashub.com](https://www.saashub.com/) | AlternativeTo | [alternativeto.net](https://alternativeto.net/) |
| Alternative.me | [alternative.me](https://alternative.me/) | SaaS Browser | [saasbrowser.com](https://saasbrowser.com/) |
| ToolDirs | [tooldirs.com](https://tooldirs.com/) | AppRater | [apprater.net](https://apprater.net/) |
| Startup Stash | [startupstash.com](https://startupstash.com/) | Startups FYI | [startups.fyi](https://www.startups.fyi/) |
| KillerStartups | [killerstartups.com](https://www.killerstartups.com/) | AllTopStartups | [alltopstartups.com](https://alltopstartups.com/) |
| Startup Ranking | [startupranking.com](https://www.startupranking.com/) | StartupLift | [startuplift.com](https://startuplift.com/) |
| Startups.gallery | [startups.gallery](https://startups.gallery/) | Cool Startups | [coolstartups.io](https://coolstartups.io/) |
| SideProjectors | [sideprojectors.com](https://www.sideprojectors.com/) | Webwiki | [webwiki.com](https://www.webwiki.com/) |
| StartuPage | [startupage.com](https://startupage.com/) | Startuplist.in | [startuplist.in](https://startuplist.in/) |
| SaaSGenius | [saasgenius.com](https://www.saasgenius.com/) | SaaSWorthy | [saasworthy.com](https://www.saasworthy.com/) |
| Serchen | [serchen.com](https://www.serchen.com/) | Ponicorn | [ponicorn.com](https://ponicorn.com/) |
| Crozdesk | [crozdesk.com](https://crozdesk.com/) | Slant | [slant.co](https://www.slant.co/) |
| SourceForge | [sourceforge.net](https://sourceforge.net/) | Softpedia | [softpedia.com](https://www.softpedia.com/) |
| GoodFirms | [goodfirms.co](https://www.goodfirms.co/) | F6S | [f6s.com](https://www.f6s.com/) |
| Crunchbase | [crunchbase.com](https://www.crunchbase.com/) | StartupBlink | [startupblink.com](https://www.startupblink.com/) |
| Wellfound | [wellfound.com](https://wellfound.com/) | Gust | [gust.com](https://gust.com/) |

### 4. Software reviews, comparisons, and buyer catalogs

These may require a mature product, vendor verification, or customer reviews. Confirm that a founder can create or claim a product entry before including one in the public page.

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| G2 | [g2.com](https://www.g2.com/) | Capterra | [capterra.com](https://www.capterra.com/) |
| GetApp | [getapp.com](https://www.getapp.com/) | Software Advice | [softwareadvice.com](https://www.softwareadvice.com/) |
| TrustRadius | [trustradius.com](https://www.trustradius.com/) | Trustpilot | [trustpilot.com](https://www.trustpilot.com/) |
| PeerSpot | [peerspot.com](https://www.peerspot.com/) | SelectHub | [selecthub.com](https://www.selecthub.com/) |
| FinancesOnline | [financesonline.com](https://financesonline.com/) | CompareCamp | [comparecamp.com](https://comparecamp.com/) |
| ITQlick | [itqlick.com](https://www.itqlick.com/) | Software World | [softwareworld.co](https://softwareworld.co/) |
| OMR Reviews | [omr.com](https://omr.com/) | FeaturedCustomers | [featuredcustomers.com](https://www.featuredcustomers.com/) |
| StackShare | [stackshare.io](https://stackshare.io/) | Clutch | [clutch.co](https://clutch.co/) |

### 5. AI tools and agent directories

AI-only sites should never appear for a product that merely has an incidental AI feature. Several domains with similar names are distinct candidate sites; check operator identity and duplicate listings.

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| There's An AI For That | [theresanaiforthat.com](https://theresanaiforthat.com/) | Futurepedia | [futurepedia.io](https://www.futurepedia.io/) |
| FutureTools | [futuretools.io](https://www.futuretools.io/) | Toolify | [toolify.ai](https://www.toolify.ai/) |
| TopAI.tools | [topai.tools](https://topai.tools/) | AI Tools | [aitools.inc](https://aitools.inc/) |
| AI Tools Board | [aitoolsboard.com](https://aitoolsboard.com/) | AI Tools Directory | [aitoolsdirectory.com](https://aitoolsdirectory.com/) |
| AIToolboard | [aitoolboard.com](https://aitoolboard.com/) | AIxploria | [aixploria.com](https://aixploria.com/) |
| AI Parabellum | [aiparabellum.com](https://aiparabellum.com/) | AITopTools | [aitoptools.com](https://aitoptools.com/) |
| FindMyAITool | [findmyaitool.com](https://findmyaitool.com/) | Easy With AI | [easywithai.com](https://easywithai.com/) |
| RankmyAI | [rankmyai.com](https://rankmyai.com/) | AI Scout | [aiscout.net](https://aiscout.net/) |
| AI Valley | [aivalley.ai](https://aivalley.ai/) | AI Depot | [aidepot.co](https://aidepot.co/) |
| SaaS AI Tools | [saasaitools.com](https://saasaitools.com/) | ToolPilot AI | [toolpilot.ai](https://www.toolpilot.ai/) |
| AI Finder | [ai-finder.net](https://ai-finder.net/) | Insidr AI | [insidr.ai](https://www.insidr.ai/) |
| AI Tools List | [aitoolslist.io](https://aitoolslist.io/) | OpenFuture AI | [openfuture.ai](https://openfuture.ai/) |
| The Next AI Tool | [thenextaitool.com](https://thenextaitool.com/) | AI Tools Love | [aitools.love](https://aitools.love/) |
| OpenTools | [opentools.ai](https://opentools.ai/) | ainave | [ainave.com](https://www.ainave.com/) |
| AI Hubs | [aihubs.ai](https://aihubs.ai/) | AI Hunt List | [aihuntlist.com](https://aihuntlist.com/) |
| CogList AI | [coglist.com](https://coglist.com/) | EliteAI Tools | [eliteai.tools](https://eliteai.tools/) |
| AI Tools Corner | [aitoolscorner.com](https://aitoolscorner.com/) | AI Tools Arena | [aitoolsarena.com](https://aitoolsarena.com/) |
| AI Agent Store | [aiagentstore.ai](https://aiagentstore.ai/) | AI Agents Directory | [aiagentsdirectory.com](https://aiagentsdirectory.com/) |
| mcp.so | [mcp.so](https://mcp.so/) | mcpservers.org | [mcpservers.org](https://mcpservers.org/) |

### 6. Developer, API, open-source, and self-hosted listings

An awesome list or package registry may use a pull request, repository metadata, or a publisher workflow rather than a web form. Record that method explicitly.

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| LibHunt | [libhunt.com](https://www.libhunt.com/) | OpenAlternative | [openalternative.co](https://openalternative.co/) |
| Open Source Alternative | [opensourcealternative.to](https://opensourcealternative.to/) | selfh.st/apps | [selfh.st/apps](https://selfh.st/apps/) |
| Awesome Self-Hosted | [github.com/awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) | Free for Dev | [free-for.dev](https://free-for.dev/) |
| API List | [apilist.fun](https://apilist.fun/) | RapidAPI Hub | [rapidapi.com/hub](https://rapidapi.com/hub) |
| Dev Resources | [devresources.info](https://devresources.info/) | WebCurate | [webcurate.co](https://webcurate.co/) |
| Console.dev | [console.dev](https://console.dev/) | EveryDev.ai | [everydev.ai](https://www.everydev.ai/) |
| Awesome Open Source | [awesomeopensource.com](https://awesomeopensource.com/) | Open Source Software Directory | [opensourcesoftwaredirectory.com](https://opensourcesoftwaredirectory.com/) |
| Open Hub | [openhub.net](https://www.openhub.net/) | Free Software Directory | [directory.fsf.org](https://directory.fsf.org/) |
| Docker MCP Catalog | [hub.docker.com/mcp](https://hub.docker.com/mcp) | LobeHub MCP Marketplace | [lobehub.com/mcp](https://lobehub.com/mcp) |
| Cline MCP Marketplace | [cline.bot/mcp-marketplace](https://cline.bot/mcp-marketplace) | Official MCP Registry | [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/) |

### 7. App stores and integration catalogs

Publish these only for products that can actually ship on the named platform. The result is distribution through a platform catalog, not an ordinary external-site listing.

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| Chrome Web Store | [chromewebstore.google.com](https://chromewebstore.google.com/) | Firefox Add-ons | [addons.mozilla.org](https://addons.mozilla.org/) |
| Microsoft Edge Add-ons | [microsoftedge.microsoft.com/addons](https://microsoftedge.microsoft.com/addons) | Apple App Store | [apps.apple.com](https://apps.apple.com/) |
| Google Play | [play.google.com/store](https://play.google.com/store) | Microsoft Marketplace (formerly AppSource) | [appsource.microsoft.com](https://appsource.microsoft.com/) |
| Shopify App Store | [apps.shopify.com](https://apps.shopify.com/) | WordPress Plugin Directory | [wordpress.org/plugins](https://wordpress.org/plugins/) |
| Zapier App Directory | [zapier.com/apps](https://zapier.com/apps) | Make Integrations | [make.com/en/integrations](https://www.make.com/en/integrations) |
| Slack Marketplace | [slack.com/apps](https://slack.com/apps) | Atlassian Marketplace | [marketplace.atlassian.com](https://marketplace.atlassian.com/) |
| Figma Community | [figma.com/community](https://www.figma.com/community) | JetBrains Marketplace | [plugins.jetbrains.com](https://plugins.jetbrains.com/) |
| Notion Integrations | [notion.com/integrations](https://www.notion.com/integrations) | Webflow Apps | [webflow.com/apps](https://webflow.com/apps) |

### 8. Design, no-code, productivity, and creator niches

Some design galleries select sites editorially and do not accept ordinary product submissions. Verify the route and show that limitation if retained.

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| NoCode.Tech | [nocode.tech](https://www.nocode.tech/) | NoCodeFinder | [nocodefinder.com](https://www.nocodefinder.com/) |
| NoCodeList | [nocodelist.co](https://nocodelist.co/) | Remote Tools | [remote.tools](https://remote.tools/) |
| Productivity Directory | [productivity.directory](https://productivity.directory/) | Makerlist | [makerlist.io](https://makerlist.io/) |
| ToolsForCreators | [toolsforcreators.com](https://toolsforcreators.com/) | MarketingTools.com | [marketingtools.com](https://marketingtools.com/) |
| Land-book | [land-book.com](https://land-book.com/) | Lapa.ninja | [lapa.ninja](https://www.lapa.ninja/) |
| One Page Love | [onepagelove.com](https://onepagelove.com/) | SiteInspire | [siteinspire.com](https://www.siteinspire.com/) |
| SaaS Landing Page | [saaslandingpage.com](https://saaslandingpage.com/) | Startuplandingpages | [startuplandingpages.com](https://startuplandingpages.com/) |

### 9. Regional and specialist leads

These need extra checking: some may be editorial publications or company databases rather than open launch directories.

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| NextBigWhat | [nextbigwhat.com](https://nextbigwhat.com/) | StartupTalky | [startuptalky.com](https://startuptalky.com/) |
| YourStory | [yourstory.com](https://yourstory.com/) | The Hub | [thehub.io](https://thehub.io/) |
| IndieExtensions | [indieextensions.com](https://indieextensions.com/) | ExtensionBoss | [extensionboss.com](https://extensionboss.com/) |
| AEO Tools Space | [aeotools.space](https://www.aeotools.space/) | Marketing Tools List | [marketingtoolslist.com](https://marketingtoolslist.com/) |
| Sales Tools AI | [salestoolsai.top](https://salestoolsai.top/) | Selljam | [selljam.ai](https://selljam.ai/) |
| EdTech Digest | [edtechdigest.com](https://edtechdigest.com/) | PropTech Connect | [proptechconnect.com](https://www.proptechconnect.com/) |

### 10. Community posts

These six destinations remain in the original research inventory but are excluded from the public directory. They accept community posts rather than directory listings.

| Candidate | Site | Candidate | Site |
| --- | --- | --- | --- |
| Show HN | [news.ycombinator.com/showhn.html](https://news.ycombinator.com/showhn.html) | Indie Hackers | [indiehackers.com](https://www.indiehackers.com/) |
| DEV Community | [dev.to](https://dev.to/) | Reddit r/SideProject | [reddit.com/r/SideProject](https://www.reddit.com/r/SideProject/) |
| Reddit r/SaaS | [reddit.com/r/SaaS](https://www.reddit.com/r/SaaS/) | Reddit r/microsaas | [reddit.com/r/microsaas](https://www.reddit.com/r/microsaas/) |

## Research coverage and development review

All 200 inventory entries have a decision recorded in the linked research reports. Eight records were already in the development database, including LibHunt, which is now visible under the updated inclusion policy. Full evidence and historical decisions are in [research batch 01](research_batch_01.md), [batch 02](research_batch_02.md), [batch 03](research_batch_03.md), [batch 04](research_batch_04.md), [batch 05](research_batch_05.md), the [app-store research](research_app_stores.md), and the [existing-card audit](research_existing_cards_audit.md). Current checks are recorded in [follow-up batch 01](research_followup_batch_01.md), [follow-up batch 02](research_followup_batch_02.md), [follow-up batch 03](research_followup_batch_03.md), [near-ready batch 02–03](research_followup_near_ready_batch_02_03.md), [follow-up batch 04](research_followup_batch_04.md), [category 9 follow-up](research_followup_batch_05_category09.md), the [app-store follow-up](research_followup_app_stores.md), and the [remaining candidates in categories 1–2](research_followup_remaining_cat01_02.md), [categories 3–4](research_followup_remaining_cat03_04.md), and [categories 5–7](research_followup_remaining_cat05_07.md). The 2026-09-30 inclusion policy in this plan supersedes their hold decisions while retaining their evidence gaps.

The 2026-09-30 development review displayed 165 cards across nine categories. The current draft contains 171 entries; retain the reports below as dated research evidence. Every card has five fact rows, with known values or explicit missing-detail labels. All 83 former holds are included; the 29 earlier exclusions and six community-post destinations remain outside the public directory. Unknown price and link types remain unknown in filters. Link observations name the sample that was checked and do not imply that every plan uses the same link type.

The migrations create the single `public.launch_directories` table and the development route. The latest migration adds the former holds, normalizes missing-detail labels, and records submission availability without adding another table. Review the development page before publication. Code, docs, and draft records may be released while the production registry row stays unpublished and public API reads are denied. Later research passes can fill remaining gaps without changing the card design.
