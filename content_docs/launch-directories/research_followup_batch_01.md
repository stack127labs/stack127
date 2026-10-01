# Launch directories research follow-up, batch 01

Checked: 2026-09-29
Scope: Recheck of the 27 candidates marked Hold in categories 1 and 2 of [research batch 01](research_batch_01.md).

## Method and link evidence

I rechecked official pages and current public examples where the page reader could open them. It shows visible link destinations on some listing pages, but it does not expose the HTML `rel` attribute. I report a link as dofollow or nofollow only when the directory itself states that policy. When clicking a product link returned a cache miss, I record that result instead of treating it as a broken product site. A blocked or inaccessible page is not treated as closed.

Four candidates now have complete card values from current official sources: Smol Launch, StartupBase, LaunchVault, and FastLaunch. For FastLaunch, a live sample page and its product href and redirect were checked. The page reader does not expose raw HTML `rel` tokens, so the link-type card value uses FastLaunch's explicit current pricing policy.

## Card-ready records

| Site | Category | What it is | Website | Submit here | Best for | Cost | Review and schedule | Link type | Eligibility | Live example and link check |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Smol Launch | Launch boards and small product launches | Weekly launch board for indie products and software | [smollaunch.com](https://smollaunch.com/) | [Submit a product](https://smollaunch.com/submit) | Indie makers with a working product or public demo who can take part during launch week | Free standard listing. Free dofollow option requires a verified badge on your site. Premium is $19 once per launch. Maker Pass is $99/year and auto-renews. | Most submissions are reviewed within 24 hours. Launch week runs Monday 9:00 a.m. to Sunday 11:59 p.m. Pacific Time. | Standard free: nofollow. Free badge-verified: dofollow while the badge stays verified. Premium and Maker Pass: permanent dofollow, no badge required. | Needs a working public product or clickable demo, a clear audience and maker participation during launch week. A coming-soon page alone is not enough. | [Kandidate.ai listing](https://smollaunch.com/products/kandidate-ai). Its Visit Website href is `kandidate.ai`; clicking led to `https://kandidate.ai/?ref=smollaunch` and returned a reader cache miss. Raw `rel` was not exposed. Sources: [2026 maker guide](https://smollaunch.com/guides/launching-on-smol-launch), [Maker Pass](https://smollaunch.com/maker-pass), [submit page](https://smollaunch.com/submit). |
| StartupBase | Launch boards and small product launches | Product launch board with permanent product pages and launch queues | [startupbase.io](https://startupbase.io/) | [Submit a product](https://startupbase.io/submit) (continues to sign-in) | Working software products that want a permanent listing and launch date | Free standard queue; free badge-verified queue. Paid plans are one-time: Launch $39, Boost $99, Ultimate $499. | Standard free queue: estimated 10+ weeks. Badge-verified free queue: about 4–5 weeks. Paid plans let an approved product choose a date up to 30 days ahead. Every submission is reviewed. | Paid: permanent dofollow. Badge-verified free requires a link from the maker's site to StartupBase; StartupBase does not promise a dofollow product link for free listings. Standard free link type is not stated. | Must have a working website and real product. The site rejects placeholders, agencies or consultancies without a product, resold software and thin listings. | [AI Content Drop listing](https://startupbase.io/products/ai-content-drop). Its product href is `aicontentdrop.com`; click went to `https://aicontentdrop.com/?ref=startupbase` and returned a reader cache miss. Raw `rel` was not exposed. Sources: [current pricing, queues, eligibility and link policy](https://startupbase.io/about), [submit route](https://startupbase.io/submit). |
| LaunchVault | Launch boards and small product launches | Daily launch board with permanent project pages | [launchvault.dev](https://www.launchvault.dev/) | [Submit a project](https://www.launchvault.dev/projects/submit) (continues to sign-in) | Indie makers, bootstrapped SaaS founders and makers of legitimate working products | Free if you add and verify a dofollow link from your site to LaunchVault. Premium is currently $9.99 promo price ($19.99 regular) per launch. | Launches go live daily at 8:00 a.m. UTC. Free submissions need a verified backlink before choosing a date. Premium skips the free queue with priority review; the site says launches happen in days rather than months but gives no exact review ETA. | Free: requires a dofollow link from your site to LaunchVault; LaunchVault does not promise a dofollow link back. Premium: guaranteed permanent dofollow from LaunchVault to the product. | Submit a legitimate project with truthful information. False or misleading listings, spam, illegal content and rights-infringing projects are prohibited. Terms require users to be 13+; users under 18 need parental consent for paid services. | [ShipBoost listing](https://www.launchvault.dev/projects/shipboost). Its Visit Website href is `shipboost.io`; the page's product details identify ShipBoost and launch date. Raw `rel` was not exposed; the product link click could not be confirmed in this reader. Sources: [pricing and timing](https://www.launchvault.dev/pricing), [official explanation of link direction](https://www.launchvault.dev/blog/dofollow-backlink-explained-launchvault), [terms](https://www.launchvault.dev/legal/terms), [submit route](https://www.launchvault.dev/projects/submit). |
| FastLaunch | Launch boards and small product launches | Daily product launch board | [fastlaunch.io](https://fastlaunch.io/) | [Submit a project](https://fastlaunch.io/projects/submit) (sign-in required) | Makers who want to schedule a product launch on a daily board | Free. Premium is currently $9.90 promo price ($29 regular) per launch. Sponsorship is a separate ad purchase and is not included here. | Launches go live daily at 8:00 a.m. UTC. Free has a standard queue and can be scheduled up to 180 days ahead. Premium gets priority scheduling. The site does not publish a review-time estimate. | Free: dofollow only for daily top-three projects. Premium: guaranteed dofollow. | Submitter must be at least 13 or the legal minimum age where they live; under 18 requires parent or guardian permission. Submitter must own or have rights to the submitted content. Unlawful, infringing and spam content is prohibited. | [Soro 2 listing](https://fastlaunch.io/projects/soro-2), launched April 25, 2026. Its Visit href is `soro2.ai`; clicking led to [soro2.ai](https://soro2.ai/). Raw `rel` was not exposed. The link-type value above comes from the official pricing policy. Sources: [current pricing and schedule](https://fastlaunch.io/pricing), [terms and content requirements](https://fastlaunch.io/legal/terms), [submit route](https://fastlaunch.io/projects/submit). |

## Candidates that remain on hold

### Category 1: launch boards and small product launches

#### MicroLaunch

- **Website / start:** [MicroLaunch](https://microlaunch.net/); [launch manager](https://microlaunch.net/hq/launches) shows Basic Launch and an automatic scheduling queue. The route requires an account.
- **Cost and timing found:** A basic queue is shown, but its public price and billing terms are not settled on the official pages checked. [Premium](https://microlaunch.net/premium) currently shows $39 sale / $49 regular pricing for a 30-day campaign; it does not clearly state the billing interval or how that price maps to standard listings. Homepage says new products launch monthly.
- **Eligibility and link policy:** The [launch guide](https://microlaunch.net/blog/micro-launch-study-guide) covers startup/product launches. Premium advertises a dofollow link; the Basic listing's outbound link policy is not stated clearly.
- **Example check:** [Statable](https://microlaunch.net/p/statable) is a current public product page. Its Visit Website href is `statable.com`; clicking it did not yield a usable destination in the reader. Raw `rel` was not exposed.
- **Hold because:** Current baseline submission price/billing and Basic listing link type are not clear enough to fill the card accurately. Sources: [home](https://microlaunch.net/), [Premium](https://microlaunch.net/premium), [launch guide](https://microlaunch.net/blog/micro-launch-study-guide), [launch manager](https://microlaunch.net/hq/launches).

#### DevHunt

- **Website / start:** [DevHunt](https://devhunt.org/); [login/start](https://devhunt.org/login) requires GitHub or Google sign-in.
- **Cost and timing found:** Free queue is described as averaging about six months. Queue skip is advertised at $49; current public material checked does not clearly state the billing interval.
- **Eligibility and link policy:** The site is for developer tools, including APIs, frameworks, IDE tools, testing and monitoring products. Current official sources do not establish the listing's outbound link type.
- **Example check:** [MCPIndex](https://devhunt.org/tool/mcpindex) is linked from the current homepage, but the individual page returned a cache miss. No product href, raw `rel` or redirect could be inspected.
- **Hold because:** The normal listing link type is unknown, the current sample's destination could not be checked, and the paid billing interval is not stated. Sources: [home](https://devhunt.org/), [about](https://devhunt.org/the-story), [login/start](https://devhunt.org/login).

#### Peerlist Launchpad

- **Website / start:** [Peerlist Launchpad](https://peerlist.io/launchpad/); the current [Week 40 board](https://peerlist.io/launchpad/2026/week/40) covers September 28 to October 4, 2026. No direct submission form was established; a maker needs a Peerlist profile and project.
- **Cost and timing found:** A current launch price was not established. Launches are organized by week; the current week board had no products when checked.
- **Eligibility and link policy:** Official [Launchpad guidelines](https://help.peerlist.io/individual/launchpad/guidelines-faqs) say to launch as an individual with a valid name and photo, and to have the project on Peerlist with its name, tagline, cover and demo. Product outbound link type is not published in the checked sources.
- **Example check:** [AI Applyd](https://peerlist.io/firstexhotic/project/ai-that-applies-for-you--ai-applyd) is a public project listing. The reader did not expose the product anchor href or raw `rel`.
- **Hold because:** Current submission price and product-link policy are missing. Sources: [current board](https://peerlist.io/launchpad/2026/week/40), [official guidelines](https://help.peerlist.io/individual/launchpad/guidelines-faqs), [example](https://peerlist.io/firstexhotic/project/ai-that-applies-for-you--ai-applyd).

#### LaunchBoard

- **Website / start:** [LaunchBoard](https://www.launchboard.dev/); [submit route](https://www.launchboard.dev/dashboard/submit).
- **Cost and timing found:** Current [pricing](https://www.launchboard.dev/pricing) shows free with a badge and paid plans at $19 per product or $39 for five credits. It lists 10 free spots weekly; [how it works](https://www.launchboard.dev/how-it-works) says 50 products total can launch each week, on Monday at 03:30 UTC. The 10-free / 50-total figures fit together. Badge review is listed as 1–2 business days.
- **Eligibility and link policy:** Product-focused launch board; a tighter current eligibility rule was not established. Paid dofollow is stated, but the free-link rule conflicts: pricing introduction says weekly winners get a backlink, while the free-plan row says only weekly #1 does. The same free-plan area also contains paid-plan bullets, so it is not reliable enough to resolve the conflict.
- **Example check:** Current Week 40 projects are visible on the homepage, but linked project detail pages returned cache misses. No sample product href, raw `rel` or redirect was inspected.
- **Hold because:** The free-link winner rule conflicts across the same official pricing page, and a detail-page sample could not be checked. Sources: [pricing](https://www.launchboard.dev/pricing), [how it works](https://www.launchboard.dev/how-it-works), [submit](https://www.launchboard.dev/dashboard/submit), [home](https://www.launchboard.dev/).

#### Nick Launches

- **Website / start:** [Nick Launches](https://nicklaunches.com/); [submit](https://nicklaunches.com/submit/) continues to sign-in.
- **Cost and timing found:** The [owner's September 10, 2026 guide](https://nicklaunches.com/blog/where-to-launch-your-startup-2026/) says a free queue averages about six months and queue skip costs $49. Current [terms](https://nicklaunches.com/terms/) describe a one-time paid placement but do not settle all pricing details.
- **Eligibility and link policy:** Terms require ownership or authorization and say payment does not guarantee approval. The September guide says a free listing gets a permanent dofollow link without conditions; the current terms say a free listing may require a badge. That changes whether the free product link and reciprocal link are guaranteed.
- **Example check:** [Oyyo AI](https://nicklaunches.com/products/oyyo-ai/) is a public page; its product href is `oyyo.one`. Clicking went to `https://oyyo.one/?ref=nicklaunches&utm_medium=referral&utm_source=nicklaunches.com` and returned a reader cache miss. Raw `rel` was not exposed.
- **Hold because:** The free-link/badge requirement conflicts between current official terms and the newer owner guide. Sources: [home](https://nicklaunches.com/), [terms](https://nicklaunches.com/terms/), [owner guide](https://nicklaunches.com/blog/where-to-launch-your-startup-2026/), [sample](https://nicklaunches.com/products/oyyo-ai/).

#### Hype Desk

- **Website / start:** Inventory points to [hypedesk.com](https://hypedesk.com/), which did not provide usable current details. The active [hypedesk.io](https://hypedesk.io/) is a video-demo launch platform; its submit flow leads to sign-in.
- **Cost and timing found:** The `.io` homepage describes six selected launches each week, starting Monday. It asks for a demo video of up to five minutes and says launches are reviewed/selected. No current price is shown.
- **Eligibility and link policy:** The `.io` site asks makers to submit a demo; it does not publish a clear full eligibility or outgoing-link policy. Its [terms](https://hypedesk.io/terms) are older and describe a different promotional submission-management service.
- **Example check:** Current `.io` homepage features products, but no matching public product detail page or external product href/rel was verified.
- **Hold because:** It is not established that `.com` and `.io` are the same candidate, and the current `.io` price and outgoing link rules are missing. Sources: [candidate domain](https://hypedesk.com/), [active site](https://hypedesk.io/), [terms](https://hypedesk.io/terms).

#### SuperLaunch

- **Website / start:** [SuperLaunch](https://superlaunch.io/); [submit](https://superlaunch.io/submit) says listings are reviewed and shown within a few hours.
- **Cost and timing found:** Official [pricing](https://superlaunch.io/pricing) shows Free and a one-time Launch Plus option at $29. The submit page says free for 7 days. [How it works](https://superlaunch.io/how-it-works) describes 7-, 15- and 30-day visibility windows while the pricing page calls listings permanent. It is not clear whether “permanent” means the product page only, while board exposure ends.
- **Eligibility and link policy:** Site presents AI products; no firm eligibility rule was found. Pricing advertises dofollow, including free, but the exact terms by free/paid tier and visibility period need clarification.
- **Example check:** [Prodigent](https://superlaunch.io/product/prodigent) is a public product page. The page reader did not expose an outbound product href or raw `rel`.
- **Hold because:** Official pages do not clearly reconcile the free seven-day statement, listed visibility windows and permanent listing claim; full eligibility and sample product link behavior remain unverified. Sources: [pricing](https://superlaunch.io/pricing), [submit](https://superlaunch.io/submit), [how it works](https://superlaunch.io/how-it-works), [example](https://superlaunch.io/product/prodigent).

#### Launching Next

- **Website / start:** [Launching Next](https://www.launchingnext.com/); [submit](https://www.launchingnext.com/submit/) currently shows a verification challenge. [Advertise/submission details](https://www.launchingnext.com/advertise) remain readable.
- **Cost and timing found:** Official pages conflict on paid price: Advertise shows $49 express; one official checkout record shows $99 discounted from $199; official [LLM info](https://launchingnext.com/llm-info.html) says express starts at $149 once. Free wait is described as three months on Advertise and four months on the checkout page. Paid timing is one business day.
- **Eligibility and link policy:** It accepts startups with a founder-controlled website and uses manual review. Paid placement promises a permanent dofollow link. The standard free listing's link type was not found.
- **Example check:** No current public product detail page was confirmed. The checkout URL is a payment confirmation, not a listing example.
- **Hold because:** Current official pages disagree on express price and free wait; standard free link type and a current product example are also missing. Sources: [advertise](https://www.launchingnext.com/advertise), [submit](https://www.launchingnext.com/submit/), [official checkout record](https://www.launchingnext.com/thanks/?i=120106), [official info](https://launchingnext.com/llm-info.html).

#### Startup Buffer

- **Website / start:** [Startup Buffer homepage](https://startupbuffer.com/) returned a database error, but the [startup submission form](https://startupbuffer.com/site/submit) is available and asks for a URL, business email, pitch, description and screenshot.
- **Cost and timing found:** No current official price or review estimate was found. No fee appearing on the form is not proof that submission is free.
- **Eligibility and link policy:** The form requests detailed business/product information. Current official sources do not clarify full eligibility or outgoing-link type.
- **Example check:** [Workonflow](https://startupbuffer.com/startup/workonflow) is an old public listing (last crawled about 1.2 years ago). It has a Visit Website link, but its target and raw `rel` were not exposed.
- **Hold because:** Current cost, review time, link policy and a current verifiable sample link are missing. Sources: [home](https://startupbuffer.com/), [submit](https://startupbuffer.com/site/submit), [terms](https://startupbuffer.com/site/tos), [sample](https://startupbuffer.com/startup/workonflow).

#### Kick Product

- **Website / start:** [Kick Product](https://www.kickproduct.com/). The homepage has a create-launch call to action, but a working public submission form was not established.
- **Cost and timing found:** Current [pricing](https://www.kickproduct.com/pricing) marks Free as TBD/forever, Pro as TBD/month, and Lifetime as TBD/one-time. Launch time and review period are not stated.
- **Eligibility and link policy:** The site refers to SaaS products, but current detailed eligibility and product-link rules were not found.
- **Example check:** No public individual product listing page or external link could be verified.
- **Hold because:** Exact prices, schedule, working start route, link policy and sample page are unavailable. Sources: [home](https://www.kickproduct.com/), [pricing](https://www.kickproduct.com/pricing).

#### PeerPush

- **Website / start:** The inventory's [peerpush.net](https://peerpush.net/) redirects to [peerpush.com](https://peerpush.com/). [Submit](https://peerpush.com/submit) continues to sign-in.
- **Cost and timing found:** Current [pricing](https://peerpush.com/pricing) shows Free behind the paid queue, Standard Launch $39 once, 7-day promotion $89 once, and 30-day promotion $229 once. Review time is not clearly stated.
- **Eligibility and link policy:** Product submissions are supported, but the regular listing's dofollow/nofollow/sponsored policy is not stated. The separate Outrank ad product says `sponsored nofollow`; that policy cannot be applied to product listings.
- **Example check:** [Home Page](https://peerpush.com/p/home-page) has a product link href `home-page.io`; click went to `https://home-page.io/?ref=peerpush&utm_source=peerpush` and returned a cache miss. Raw `rel` was not exposed.
- **Hold because:** The product-listing outbound link type is not published. Sources: [pricing](https://peerpush.com/pricing), [how it works](https://peerpush.com/how-it-works), [rules](https://peerpush.com/rules), [submit](https://peerpush.com/submit), [example](https://peerpush.com/p/home-page).

#### PromoteProject

- **Website / start:** [PromoteProject](https://www.promoteproject.com/) has startup profiles and an article section; no current baseline product-listing submission route was confirmed.
- **Cost and timing found:** [Feature my startup](https://www.promoteproject.com/feature_my_startup) sells promotion for $0.99/day or $5.99/week. This is a promotion add-on, not verified as the cost of a standard listing. No review time was found.
- **Eligibility and link policy:** Help mentions article/link submissions, but current startup-listing eligibility and product link type were not established.
- **Example check:** [Promote Startup profile](https://www.promoteproject.com/startup/197104/promote-startup) is a public product profile. Its product href is `promotestartup.com`; the raw `rel` and redirect were not exposed.
- **Hold because:** A standard listing offer, fee, review process and product-link policy are missing. Sources: [home](https://www.promoteproject.com/), [help](https://www.promoteproject.com/help), [paid feature](https://www.promoteproject.com/feature_my_startup), [sample](https://www.promoteproject.com/startup/197104/promote-startup).

#### SubmitHunt

- **Website / start:** [SubmitHunt](https://www.submithunt.com/); [submit](https://www.submithunt.com/submit) and [pricing](https://www.submithunt.com/pricing) returned blank content in the reader.
- **Cost and timing found:** The current official pages did not expose a price, billing terms or review/scheduling time.
- **Eligibility and link policy:** Current product pages describe a startup and AI directory; official submission eligibility and link policy were not accessible.
- **Example check:** [TurboStarter](https://www.submithunt.com/startup/turbostarter) is a current public listing. The reader did not expose its product link href or raw `rel`. Other listing text shows an “Official website” value, but not a checkable anchor.
- **Hold because:** Price, review time, detailed eligibility and outgoing product-link policy are missing from current official pages. Blank reader output is not treated as closure. Sources: [home](https://www.submithunt.com/), [submit](https://www.submithunt.com/submit), [pricing](https://www.submithunt.com/pricing), [example](https://www.submithunt.com/startup/turbostarter).

#### IndieProducts

- **Website / start:** [IndieProducts](https://www.indieproducts.io/); [submit](https://www.indieproducts.io/submit) returned an internal error.
- **Cost and timing found:** Current [pricing](https://www.indieproducts.io/pricing) lists Silver $9.99 for a three-month front-page listing, Gold $19.99 for three months, and Diamond $49.99 for six months/up to five products. The billing interval or one-time status is not stated, and the price of a basic/free listing is not shown.
- **Eligibility and link policy:** Its [FAQ](https://www.indieproducts.io/faq) names SaaS, newsletters, extensions, apps and agencies and describes manual verification. It does not state the product link type.
- **Example check:** No current public product detail page with a checkable outgoing anchor was confirmed.
- **Hold because:** Basic listing cost/billing and outbound link policy are unclear, and the sample link could not be verified. Sources: [home](https://www.indieproducts.io/), [pricing](https://www.indieproducts.io/pricing), [FAQ](https://www.indieproducts.io/faq), [submit](https://www.indieproducts.io/submit).

#### TinyStartups

- **Website / start:** [TinyStartups](https://www.tinystartups.com/); the homepage's submit call to action is the current start route.
- **Cost and timing found:** The current homepage says pay-what-you-want with a $69 minimum, but current [terms](https://www.tinystartups.com/terms) describe a free queue and paid upgrades starting at $99. The [membership page](https://www.tinystartups.com/membership) lists $299/year; it says one-time payment near the top but its FAQ and terms say annual renewal.
- **Eligibility and link policy:** Terms require a real working product and authority to submit it. Paid upgrades include a $99 skip-queue option and a $99 dofollow-backlink option; free listing link type is not stated.
- **Example check:** [Pop Site](https://www.tinystartups.com/tools/pop-site) has a product href `pop.site`; click went to `https://pop.site/?utm_source=tinystartups.com` and returned a cache miss. Raw `rel` was not exposed.
- **Hold because:** Free submission cost and free link policy conflict or remain unclear; membership renewal wording also conflicts. Sources: [home](https://www.tinystartups.com/), [terms](https://www.tinystartups.com/terms), [membership](https://www.tinystartups.com/membership), [sample](https://www.tinystartups.com/tools/pop-site).

#### startuups

- **Website / start:** [startuups](https://startuups.com/); [submit](https://startuups.com/projects/submit) continues to sign-in.
- **Cost and timing found:** Official pricing search content shows Free and Premium at $5 once per launch. Free has 25 slots/week and can schedule up to four weeks ahead; Premium has 10 slots/week and up to 30-day scheduling. Launches run Mondays at 8:00 a.m. UTC.
- **Eligibility and link policy:** Official About describes indie hackers, solo founders and early-stage startups. The pricing page says a free launch gets dofollow if Top 3 or badge; official [About](https://startuups.com/about) says top-three launches get dofollow only if the maker installs a reciprocal badge. Premium advertises guaranteed dofollow.
- **Example check:** [Stable Commerce](https://startuups.com/projects/stable-commerce) has href `stablecommerce.ai`; click went to `https://stablecommerce.ai/?utm_source=startuups.com` and returned a cache miss. Raw `rel` was not exposed.
- **Hold because:** The free dofollow condition conflicts between “Top 3 or badge” and “Top 3 and badge”. Sources: [pricing](https://startuups.com/pricing), [about](https://startuups.com/about), [submit](https://startuups.com/projects/submit), [sample](https://startuups.com/projects/stable-commerce).

#### Product Fifty One

- **Website / start:** [Product Fifty One](https://productfiftyone.com/) returned HTTP 402 to the page reader.
- **Cost, timing, eligibility and link policy:** The official site could not be read, so current submission route, price/billing, review schedule, eligibility and link policy could not be established.
- **Example check:** No current public product listing could be checked.
- **Hold because:** Current evidence is blocked by the site response. This is treated as inaccessible, not closed. Source: [official site](https://productfiftyone.com/).

#### ComingUp

- **Website / start:** [ComingUp](https://www.comingup.io/) homepage timed out in the reader; [submit](https://www.comingup.io/submit) returned a blank body. Product pages are still available.
- **Cost and timing found:** Official fee, billing, review time and scheduling terms could not be confirmed. Third-party audits claim free submission and nofollow links, but those claims are not used as official evidence.
- **Eligibility and link policy:** The site presents upcoming product submissions, but current official rules and outgoing-link type were not found.
- **Example check:** [Aurevia](https://www.comingup.io/p/aurevia-shopify-ai-sales-agent) is a current product listing dated September 6, 2026. Its href is `www.aurevia.io`; clicking went to `https://www.aurevia.io/?utm_source=comingup.io` and returned a cache miss. Raw `rel` was not exposed.
- **Hold because:** Current official price, review/scheduling, eligibility and link policy are missing. Sources: [home](https://www.comingup.io/), [submit](https://www.comingup.io/submit), [sample](https://www.comingup.io/p/aurevia-shopify-ai-sales-agent).

#### StartupTrusted

- **Website / start:** [StartupTrusted](https://startuptrusted.com/); [submit](https://startuptrusted.com/submit) continues to sign-in.
- **Cost and timing found:** Current [pricing](https://startuptrusted.com/pricing) shows Free with a required verified badge, Pro at $11 once and Featured at $19 once. Paid listings are instant. Free review time is not stated.
- **Eligibility and link policy:** Free requires a backlink from the maker's own site to StartupTrusted. Paid tiers promise dofollow from StartupTrusted. The outbound product-link type for free submissions is not specified.
- **Example check:** [Aevral listing](https://startuptrusted.com/startup/aevral) returned a cache miss, so the product href and raw `rel` could not be inspected.
- **Hold because:** Free review ETA and free outbound product link type are missing, and the sample listing could not be opened. Sources: [pricing](https://startuptrusted.com/pricing), [submit](https://startuptrusted.com/submit), [sample](https://startuptrusted.com/startup/aevral).

#### LaunchDB

- **Website / start:** [LaunchDB board](https://bigideasdb.com/launchdb) is active. [Submit](https://bigideasdb.com/launchdb/submit) was blocked by the reader's robots rule.
- **Cost and timing found:** Official [help](https://bigideasdb.com/help/how-to-submit-product-launchdb) says submissions are free and launches are scheduled weekly. Official [About](https://bigideasdb.com/launchdb/about) says launches happen Sunday at 12 a.m. Eastern Time and $30 buys a priority date. Current [terms](https://bigideasdb.com/tos) say LaunchDB is available only to Pro members and describe a one-time skip fee that may vary.
- **Eligibility and link policy:** Products are reviewed and queued; dates are not guaranteed. About says top-three projects may receive a dofollow link when the submitter adds a reciprocal badge. The Pro-membership requirement conflicts with the free-submission help page.
- **Example check:** Current projects appear on the board, but a detail page such as [Allocera Intelligence](https://bigideasdb.com/launchdb/launches/allocera-intelligence) returned a cache miss. Product href and raw `rel` were not inspected.
- **Hold because:** Official current sources conflict on whether a paid Pro membership is required; sample product-link behavior also remains unverified. Sources: [board](https://bigideasdb.com/launchdb), [About](https://bigideasdb.com/launchdb/about), [submission help](https://bigideasdb.com/help/how-to-submit-product-launchdb), [terms](https://bigideasdb.com/tos).

#### Betabound

- **Website / start:** [Betabound](https://betabound.com/) is a beta-testing community. Its [company announcement form](https://betabound.com/announce/) returned an internal error; tester [sign-up](https://my.betabound.com/welcome/) is available.
- **Cost and timing found:** A 2014 [official Centercode announcement](https://www.centercode.com/blog/announcing-betabound-a-new-way-to-find-great-beta-testers) said companies could request an announcement for free. No current price, review time or schedule was confirmed.
- **Eligibility and link policy:** The service recruits testers for beta opportunities, but current company submission rules and maker-facing link policy were not established.
- **Example check:** [Fitbit Community Private Beta](https://betabound.com/fitbit-community-private-beta/) is a public opportunity page from 2017; it is not a current launch example, and its outbound link policy was not checked.
- **Hold because:** Current maker-facing submission terms and a current example are missing. The broken form is not treated as evidence the service is closed. Sources: [announce](https://betabound.com/announce/), [tester signup](https://my.betabound.com/welcome/), [old example](https://betabound.com/fitbit-community-private-beta/).

#### StartHQ

- **Website / start:** [StartHQ](https://starthq.com/) and its [submit route](https://starthq.com/submit) returned internal errors in the reader.
- **Cost, timing, eligibility and link policy:** No current official information was accessible for price, billing, review time, eligibility or product links.
- **Example check:** No current public product listing could be verified.
- **Hold because:** The site could not be checked. Treat it as inaccessible, not closed. Sources: [home](https://starthq.com/), [submit](https://starthq.com/submit).

#### Erli Bird

- **Website / start:** [Erli Bird](https://erlibird.com/), [submit](https://erlibird.com/submit) and [pricing](https://erlibird.com/pricing) returned 502 errors during this check.
- **Cost, timing, eligibility and link policy:** Current official values could not be established.
- **Example check:** No current public maker listing could be verified.
- **Hold because:** The official pages were unavailable, so no closure or discontinued-service claim is made. Sources: [home](https://erlibird.com/), [submit](https://erlibird.com/submit), [pricing](https://erlibird.com/pricing).

## Coverage

- Rechecked all 27 assigned Hold candidates.
- New card-ready records: 4 (Smol Launch, StartupBase, LaunchVault, FastLaunch).
- Remaining holds: 23.
- Excluded: 0. No checked evidence showed that a remaining candidate had stopped offering a relevant listing product or was a duplicate/out of scope.
