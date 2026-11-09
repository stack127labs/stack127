# Analytics discovery notes

Research date: **2026-11-04**. Read `stack127_docs/product-direction.md` and `stack127_docs/writing-style.md` first. This is app discovery and a field proposal only. No final ranking, page design, published dataset, account signup, installation, or full per-app research was done.

## Result and counting rules

- **145 main-list candidates:** 77 web, 12 product, 23 replay/heatmap, 18 mobile, 15 revenue.
- **120 active and 25 gray** main-list candidates. Active describes a current official offering, not measured uptime, accuracy, or a purchase recommendation. Gray cases include complex setup, uncertain upkeep, bundled features, and possibly unsuitable costs.
- **43 excluded or held names:** 15 closed/merged/alias/retirement cases, 12 enterprise/adjacent/uncertain-fit cases, and 16 failed or incomplete official checks. Not all 43 are separate products, and not all are closed. The first group includes aliases already represented on the main list.
- Each candidate has one primary counting category. Secondary capabilities can overlap. Google Analytics for Firebase is included in GA4, and Hotjar is included in Contentsquare. Cloud and self-hosted editions share a row. Heap remains its own product under the same parent company.
- Each main row has an official URL and 2026-11-04 check date. A public product page, plugin listing, official documentation, or maintainer repository was read. No signup or data flow was tested. Failed root URLs sometimes had readable official docs elsewhere; those recoveries are explained in the row or excluded list.
- Exact licenses, ownership chains, country eligibility, plan features, and self-hosted maintenance are not complete. Only the limited facts needed to identify the candidate are recorded. `Unknown` is deliberate.

## Discovery source key

Vendor lists were useful for finding names, not establishing competitor prices, features, licenses, privacy claims, or service health. Search snippets were leads. Official pages supplied inclusion evidence. Exceptions where only indexed official text was readable are explicitly marked in excluded.md.

| Code | Source kind | URL used on 2026-11-04 | How it contributed |
| --- | --- | --- | --- |
| Prompt | Owner's named examples | This task brief | Starting names across all five jobs. |
| Seed | Researcher's candidate list | Official URLs in apps.md and excluded.md | Known names followed by public official-page checks. This is not a claim that each name appeared in a comparison list. Includes site-builder reports and monitoring products with real usage/replay features. |
| G1 | Public GitHub list | https://github.com/oxnr/awesome-analytics | Broad web, privacy, mobile, heatmap, and legacy discovery. Followed product links, including smaller projects. Its old `0xnr` URL redirects to `oxnr`. |
| G2 | Public self-hosted list | https://awesome-selfhosted.net/tags/analytics.html | Self-hosted software and log analyzers; also exposed general data tools that do not meet this directory's scope. The GitHub repository shell was less useful than this rendered category. |
| W1 | Public comparison directory | https://analytics-alternatives.com/tools/ | Privacy-first website tools and smaller hosted services. Do not copy its prices or licenses. |
| R1 | Review site and editorial roundup | https://www.g2.com/categories/product-analytics and https://learn.g2.com/best-free-product-analytics-software | Product analytics and larger vendors with potentially usable free plans. Verified current entry on official pages where needed. No G2 rating or review count was imported. |
| V1 | Vendor comparison | https://posthog.com/compare/best-open-source-analytics-tools | Open-source analytics leads, particularly OpenPanel and OpenReplay. Original /blog/ link redirects here. |
| V2 | Vendor and independent replay comparisons | https://anyreplay.com/guides/hotjar-alternatives and https://www.lilachbullock.com/hotjar-alternatives/ | First source: vendor list naming Clarity, Mouseflow, Lucky Orange, Fullstory, PostHog, Smartlook. Second source: independent roundup adding Crazy Egg and Plerdy. LiveSession was also a seed candidate from replay searches; its official site supplied the evidence. |
| V3 | Revenue-analytics vendor comparison | https://baremetrics.com/blog/best-saas-metrics-platforms | RevenueCat and adjacent subscription-reporting leads. Putler was a revenue-comparison search/seed candidate checked on its own official site. No competitor fact copied from Baremetrics. |
| C1 | Community: open-source/privacy analytics | https://www.reddit.com/r/degoogle/comments/1p8pd7v/a_list_of_15_open_source_alternatives_to_google/ and https://www.reddit.com/r/degoogle/comments/1ppeaj6/what_are_you_using_instead_of_google_analytics_ga4/ | Broadened the web-tool list beyond established brands, including Vemetric and Rybbit. Betterlytics was a separate seed candidate checked on its own site. |
| C1 | Community: maintainer discussion | https://www.reddit.com/r/selfhosted/comments/1eb59n5 | Swetrix lead. A founder post is not independent evidence of privacy or quality. |
| C2 | Community: product analytics | https://www.reddit.com/r/ProductManagement/comments/1aji74p/what_are_your_favourite_product_analytics_tools/ and https://www.reddit.com/r/analytics/comments/1p7yuns/alternatives_for_mixpanel/ | User questions about product events and retention; Usermaven lead. Some replies are vendor promotion. |
| C3 | Community: mobile developers | https://www.reddit.com/r/iOSProgramming/comments/1r4376v/what_are_folks_using_for_app_analytics/ and https://www.reddit.com/r/iOSProgramming/comments/1vrjcbj/what_do_you_use_for_analytics_or_do_you_just_rely/ | TelemetryDeck, Aptabase, and store-dashboard leads. No forum legal claim was treated as authority. |

Other discovery search results included [a mobile tools roundup](https://www.statwharf.com/best/mobile-app-analytics-tools/), [a replay comparison directory](https://www.4analytics.com/tools/category/session-replay-heatmaps/), and [a developer tool discussion](https://www.reddit.com/r/reactjs/comments/1eo2690/favorite_session_replay_debug_ux_monitoring_tool/). Their descriptions were not imported as product facts.

## Search log

All queries below were run on **2026-11-04**. Groups reflect the reason for the search; some exact queries returned little or unrelated content. Repeated official-page opens are not repeated as searches. Every main-list official link was also opened directly. Primary feasibility and detection URLs are recorded in fields.md rather than copied here.

| Purpose | Queries used |
| --- | --- |
| Broad website analytics | `privacy friendly web analytics alternatives list open source github awesome analytics`; `github awesome analytics web analytics Ackee GoatCounter Shynet Offen`; `privacy friendly website analytics alternatives Plausible Fathom Simple Analytics list` |
| Product usage | `product analytics tools solo startup alternatives Mixpanel Amplitude June`; `G2 product analytics software free startup Mixpanel Amplitude Heap alternatives`; `site:reddit.com analytics indie hacker analytics tools what using` |
| Replay/heatmaps | `session replay heatmap tools Hotjar alternatives`; `Hotjar alternatives session replay heatmap tools Lucky Orange Mouseflow Smartlook` |
| Mobile | `mobile app analytics tools independent developer TelemetryDeck Aptabase Countly UXCam` |
| Revenue | `subscription revenue analytics ChartMogul Baremetrics Profitwell alternatives`; `SaaS subscription analytics tools ChartMogul Baremetrics ProfitWell Paddle sunset` |
| June lifecycle | `June analytics acquired sunset Amplitude 2025 2026`; `site:amplitude.com June acquisition June shutdown 2025 2026`; `site:amplitude.com "June" "sunset"`; `site:june.so "sunset"` |
| Hotjar change | `site:hotjar.com Contentsquare Hotjar 2026`; `Hotjar now Contentsquare free pricing` |
| Smartlook lifecycle | `site:smartlook.com end of sale shutdown 2026`; `site:smartlook.com "end" "2026"`; `site:smartlook.com "2026" "sale"`; `Smartlook end of sale May 2026 Cisco` |
| Flurry lifecycle | `site:flurry.com sunset March 2024`; `site:flurry.com "sunset"`; `site:help.yahoo.com flurry discontinued`; `Flurry analytics shutdown March 15 2024 Yahoo official` |
| Wide Angle closure | `"Wide Angle Analytics" shutdown`; `site:wideangle.co "August"`; `site:wideangle.co "discontinu"`; `Wide Angle Analytics closure August 2026 Input Objects`; `site:wideangle.co shutting down May 2026` |
| Beam status / namesake distinction | `"Beam Analytics" official`; `"Beam Analytics" beamanalytics`; `Beam Analytics site:beamanalytics.io` |
| Unclear availability | `"Vemetric" analytics official`; `"SessionStack" shutdown acquisition`; `"SessionStack" "acquired"` |
| Ownership and current brands | `site:usefathom.com Gauges acquired`; `site:launchdarkly.com highlight shutdown`; `site:launchdarkly.com highlight acquisition observability`; `site:mparticle.com Indicative acquisition analytics`; `site:statsig.com OpenAI acquisition`; `site:amplitude.com Statsig May 2026 acquisition`; `site:adapty.io Qonversion acquisition` |
| Native site-builder reports | `site:wix.com "Wix Analytics"`; `site:squarespace.com "analytics" visitors`; `site:ghost.org "native analytics"` |
| Revenue feature check | `site:purchasely.com analytics`; `site:docs.lemonsqueezy.com analytics MRR`; `site:polar.sh/docs analytics metrics MRR`; `site:recurly.com "Analytics" "Starter"` |
| Sentry replay | `site:docs.sentry.io "Session Replay" free`; `site:sentry.io "Session Replay" "Developer"` |
| Plausible feasibility | `site:plausible.io/docs data retention script size export proxy cookies self hosting`; `site:plausible.io "data retention" pricing`; `site:plausible.io/docs "script" "pa-"`; `site:plausible.io "30-day" "$9"`; `site:plausible.io/docs lightweight script size`; `site:plausible.io/docs self hosting community edition` |
| PostHog feasibility | `site:posthog.com/docs data retention cookie consent script size self hosting`; `site:posthog.com "gzipped" "KB" javascript`; `site:posthog.com/docs "consent" "cookies"`; `site:posthog.com/docs session replay masking inputs`; `site:posthog.com/docs export data API` |
| ChartMogul feasibility | `site:chartmogul.com pricing free data retention analytics integrations privacy export`; `site:chartmogul.com "data retention"`; `site:chartmogul.com "cookie" "tracking" javascript` |
| Consent field limits | `site:cnil.fr audience measurement exemption cookies conditions` |
| Detection examples | `site.usefathom.com "cdn.usefathom.com/script.js"`; `site:docs.umami.is "data-website-id"`; `site:developers.cloudflare.com/web-analytics "beacon.min.js"`; `site:learn.microsoft.com/clarity "clarity.ms/tag"`; `site:developers.google.com/analytics "G-" "gtag/js"` |
| Pinpoint lifecycle follow-up | `site:docs.aws.amazon.com/pinpoint "October 30, 2026" "new customers"` |

## Important discoveries

- **Old lists overstate current choice.** June, Gauges, and Hotjar need alias/migration handling. Smartlook's homepage still describes features, but Cisco says it is past its last sale date. Support for existing customers continues; that is different from availability to a new builder.
- **An acquisition does not always end the product.** ProfitWell Metrics still has an official offering. Heap remains separately marketed. For Statsig, [Amplitude's announcement](https://amplitude.com/blog/amplitude-and-statsig-partnership), checked 2026-11-04, says it took on the brand/customers and will continue the platform. Do not use the older OpenAI announcement alone to assign today's product owner.
- **Check dates against today's date.** AWS's [Pinpoint notice](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html), checked 2026-11-04, says its analytics resources became unavailable after 2026-10-30. Microsoft's App Center notice, in contrast, extends Analytics/Diagnostics support through March 2027. They are different lifecycle cases.
- **Some failed pages were recoverable.** Vemetric worked without `www`; Tianji now uses tianji.dev; Rybbit uses rybbit.com; Vercel's current docs and Netlify's web-analytics docs establish their products after marketing URL changes. AppMetrica's public about page works without entering its login page.
- **A fetch error is not a shutdown.** Sentry pages returned `Unsupported content-type: text/markdown`; official replay blog material was readable, so Sentry remains a gray candidate. Squarespace's official help text appears in search, but direct opening failed through a Zendesk redirect, so its row is held. UXtweak exposed only a JavaScript-required message.
- **Open source is not the same as self-hostable today.** Vemetric's homepage describes public code but says its self-host Community Edition is not ready. UXWizz is paid self-hosted software. PostHog's official self-hosting docs explicitly call deployments unsupported. Detailed license review belongs in the next step.
- **Built-in reports matter.** Shopify, Wix, Framer, Webflow, Ghost, store dashboards, Stripe, Paddle, Polar, and Lemon Squeezy can be useful baselines. Keep platform restrictions and bundled fees visible. Do not count a payment button as evidence that the site's owner uses a particular revenue dashboard.

## What may still be missing

This was a broad English-language pass with a small regional check. It cannot prove worldwide completeness. The most useful next discovery work would be:

1. Regional directories and native-language sources for China, Japan, Korea, Latin America, and other markets. Yandex and Baidu are included, but phone/account requirements and country eligibility are not verified.
2. New or renamed small analytics apps outside the public lists. Check niche launch communities again near publication. Candidates whose official sites failed are already named in excluded.md, so they are not silently lost.
3. Current maintenance, release dates, and usable installation instructions for older self-host projects. A repository being public does not prove someone still fixes it.
4. Mobile SDK feature differences, app-store reporting limits, game analytics, and marketing-attribution pricing. These are particularly hard to infer from website homepages.
5. Broader billing suites and builder-native reports after the owner decides how much bundled software to show. Chargebee RevenueStory, Recurly, Grid/Maxio, HubSpot, and Squarespace are explicitly held, not assumed irrelevant.
6. The exact overlap with the other agents' lists. No other folder or data source was changed to reconcile records. Stable product/parent/alias IDs should be agreed after research approval.

No usage crawl was run. The 123,000+ site count is supplied background, not a new verified statistic. No product-specific market share, native-app adoption count, script-size measurement, live price scenario, or legal-compliance verdict is claimed.

## Decisions for the owner/main agent

- Approve or trim the **33 field groups** in fields.md before full app research. Required means address the question; it does not require inventing a value.
- Decide the main-list gray cases after current pricing/setup checks. There are **25**; keep them visible while deciding. Excluded gray cases are separate and not part of that number.
- Decide whether to give built-in reports and attribution specialists their own filters. They are included now under the broad brief.
- Choose the first jurisdictions for sourced consent explanations. Avoid a single worldwide cookie-banner yes/no field.
- Agree on scenario workloads, currency display, and the detector's permitted inputs. Raw homepage HTML, downloaded JavaScript, rendered pages, and network requests have different detection coverage; none was assumed to be available from stack127's existing crawler.
- Keep this discovery list separate from finished research. No code, routes, database operations, publication batches, commits, or pushes were performed.

## Files delivered

- `dev-space/indie-hacker-apps/analytics/apps.md`
- `dev-space/indie-hacker-apps/analytics/excluded.md`
- `dev-space/indie-hacker-apps/analytics/fields.md`
- `dev-space/indie-hacker-apps/analytics/notes.md`
