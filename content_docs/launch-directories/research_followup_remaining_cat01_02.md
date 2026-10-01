# Launch directories research follow-up: remaining categories 1 and 2

Checked: 2026-09-29
Scope: all 23 candidates still held in categories 1 and 2 after [follow-up batch 01](research_followup_batch_01.md).

## How link types were checked

I checked each official site and its official submission, pricing, rules, or help pages. For a published example, I used the page's raw HTML in Chromium where it loaded. Each sample below is labeled with its plan or tier when the page says it; otherwise the tier is **not stated**. `rel="noopener"` without `nofollow`, `sponsored`, or `ugc` means that specific sampled anchor is followable. It does not establish a site-wide promise. A page block, missing anchor, or timeout is recorded as unknown, not as a broken or closed service.

## Card-ready records

These two sites now have accurate values for all five card fields. Link observations are explicitly sample-specific.

### PeerPush: Include

- **Website:** [PeerPush](https://peerpush.com/). The inventory's `.net` address redirects to `.com`.
- **Best for:** Product makers who want a permanent profile and community discovery.
- **Cost:** Free queue. Standard launch is $39 once; 7-day promotion is $89 once; 30-day promotion is $229 once.
- **Review time:** Paid standard launch is live immediately (the pricing page says about 60 seconds). Free launches wait behind paid users; no free-queue estimate is published.
- **Link type:** Sample only: the Home Page listing links to its maker site with `rel="noopener"` only, so that sampled link follows. PeerPush does not publish a plan-wide `rel` promise on the pages checked.
- **Eligibility:** The product must work and be reachable at the submitted website. The submitter must have the rights to the product information and assets. Rules prohibit spam, malware, illegal products, and other listed categories.
- **Submit here:** [Submit a product](https://peerpush.com/submit), which opens sign-in before the submission form.
- **Example:** [Home Page listing](https://peerpush.com/p/home-page). Tier: not stated. Raw maker href: `https://home-page.io/?utm_source=peerpush&ref=peerpush`. Raw `rel`: `noopener`. The target returned HTTP 200 at the same URL.
- **Official sources:** [home](https://peerpush.com/), [pricing](https://peerpush.com/pricing), [how it works](https://peerpush.com/how-it-works), [rules](https://peerpush.com/rules), [terms](https://peerpush.com/terms), [submit route](https://peerpush.com/submit). Terms were updated September 28, 2026.
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026.

### StartupTrusted: Include

- **Website:** [StartupTrusted](https://startuptrusted.com/).
- **Best for:** Startup founders who want a profile with a free badge-required option or a faster paid listing.
- **Cost:** Free with a verified badge on the startup's own site. Pro is $11 once; Featured is $19 once.
- **Review time:** Free listings receive manual review; no time estimate is published. Paid listings are instant.
- **Link type:** Paid plans promise dofollow. Sample only: the Aevral listing's maker link has `rel="noopener"` only, so that sampled link follows. The page does not say which plan Aevral used, and the free-plan link type is not stated. This label does not treat the sample as proof of a free-tier rule.
- **Eligibility:** A startup can submit a profile. The free plan requires adding and verifying StartupTrusted's badge on the startup's own site; paid plans do not require a backlink.
- **Submit here:** [Submit your startup](https://startuptrusted.com/submit), which redirects to sign-in.
- **Example:** [Aevral listing](https://startuptrusted.com/startup/aevral). Tier: not stated. Raw maker href: `https://aevral.com/?ref=startuptrusted`. Raw `rel`: `noopener`. The target returned HTTP 200 at the same URL.
- **Official sources:** [home](https://startuptrusted.com/), [pricing and plan rules](https://startuptrusted.com/pricing), [submit route](https://startuptrusted.com/submit), [sample listing](https://startuptrusted.com/startup/aevral).
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026.

## Candidates still held

### Category 1: launch boards and small product launches

#### MicroLaunch: Hold

- **Best for:** Makers seeking a launch campaign and product exposure over 30 days.
- **Cost:** The official page shows Launch Pro at $39 promo / $49 regular and Launch Plus at $79 promo / $99 regular. It does not state the billing interval or how those packages relate to a basic launch submission.
- **Review time:** The public homepage describes monthly new-product launches; Premium says it can skip the queue and launch anytime. A clear basic-queue ETA is not published.
- **Link type:** Premium advertises dofollow links. The Basic listing's link type is not stated.
- **Eligibility:** The pages describe product/startup launches but do not give a clear current rule for which products qualify.
- **Submit here:** [Launch manager](https://microlaunch.net/hq/launches), behind an account.
- **Example:** [Statable listing](https://microlaunch.net/p/statable). Tier: not stated. The page returned a Cloudflare challenge (HTTP 403); no maker href or `rel` could be read.
- **Decision reason:** Basic submission cost and link type remain unclear; pricing does not state its billing interval. Sources: [home](https://microlaunch.net/), [Premium](https://microlaunch.net/premium), [launch manager](https://microlaunch.net/hq/launches), [example](https://microlaunch.net/p/statable).
- **Check method:** Official pages opened September 29, 2026; Chromium raw sample request returned 403.

#### DevHunt: Hold

- **Best for:** Developer tools, including open-source tools, APIs and SDKs, frameworks and libraries, IDEs, testing tools, and monitoring products.
- **Cost:** Free queue; a $49 queue skip is advertised. Whether the $49 is recurring or one-time is not stated, so it is not safe to give it as a complete price.
- **Review time:** The official page says a free launch waits about six months on average. The paid option lets a maker choose a launch week.
- **Link type:** Sample only: the MCPIndex listing links to its npm package with `rel="nofollow noopener"`, so that sampled link is nofollow. No site-wide rule was found.
- **Eligibility:** Developer tools in the categories listed above. The submission flow requires signing in with GitHub or Google.
- **Submit here:** [Submit](https://devhunt.org/login); the current Submit action opens login.
- **Example:** [MCPIndex listing](https://devhunt.org/tool/mcpindex). Tier: not stated. Raw maker href: `https://www.npmjs.com/package/@mcpindex/server?ref=devhunt`. Raw `rel`: `nofollow noopener`. The target returned HTTP 403 at that same URL, so no redirect destination was confirmed.
- **Decision reason:** The exact billing period for the $49 fee is not published. Sources: [home](https://devhunt.org/), [about, categories and pricing](https://devhunt.org/the-story), [login/submit](https://devhunt.org/login), [sample listing](https://devhunt.org/tool/mcpindex).
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026.

#### Peerlist Launchpad: Hold

- **Best for:** Individual makers with a complete Peerlist profile and project page.
- **Cost:** No current Launchpad submission price was found in the official pages checked.
- **Review time:** Launches run in weekly groups. A submission review or publishing ETA is not published.
- **Link type:** Not verified. The current [AI Applyd project](https://peerlist.io/firstexhotic/project/ai-that-applies-for-you--ai-applyd) returned a Cloudflare challenge (HTTP 403), so its maker anchor and `rel` were not available. No official link policy was found.
- **Eligibility:** Launchpad guidelines require an individual Peerlist profile with a valid name and photo, plus a project with a name, tagline, cover image, and demo.
- **Submit here:** Start from [Launchpad](https://peerlist.io/launchpad); a direct current submission form was not established.
- **Example:** [AI Applyd project](https://peerlist.io/firstexhotic/project/ai-that-applies-for-you--ai-applyd). Tier: not stated. No href or `rel` was observable because of the challenge.
- **Decision reason:** Submission cost and maker-link type are missing. Sources: [Launchpad](https://peerlist.io/launchpad), [official guidelines](https://help.peerlist.io/individual/launchpad/guidelines-faqs), [example](https://peerlist.io/firstexhotic/project/ai-that-applies-for-you--ai-applyd).
- **Check method:** Official page review and Chromium raw requests, September 29, 2026.

#### LaunchBoard: Hold

- **Best for:** Indie makers and SaaS founders who want a weekly launch with voting and a permanent product page.
- **Cost:** The current [pricing page](https://www.launchboard.dev/pricing) says free with a badge (10 free slots per week), $19 per product, or $39 for five credits. The official [dashboard submit route](https://www.launchboard.dev/dashboard/submit) also has an indexed official version with older prices of $9 per product and $29 per five-launch pack. A direct live confirmation of the submit route timed out, so the actual checkout price is unresolved.
- **Review time:** The current [How It Works](https://www.launchboard.dev/how-it-works) page says paid submissions are usually approved within 24 hours and free badge verification takes 1 to 2 business days. Launches go live Monday at 03:30 UTC; up to 50 products enter a week.
- **Link type:** Official current pricing says paid listings are dofollow; the free weekly #1 gets a dofollow backlink. It does not state the link type for other free listings. Sample only: TutorGPT's link has `rel="noopener"` only, so that sampled link follows. The sample tier is not stated.
- **Eligibility:** Submit a public product with website and maker information; quality review applies. The free option requires a LaunchBoard badge on the maker's site.
- **Submit here:** [Submit a product](https://www.launchboard.dev/dashboard/submit).
- **Example:** [TutorGPT listing](https://www.launchboard.dev/launch/tutorgpt-1246). Tier: not stated. Raw maker href: `https://tutorgpt.io/?ref=launchboard`. Raw `rel`: `noopener`. The target returned HTTP 200 at that same URL.
- **Decision reason:** The official pricing and submission pages show different amounts. Hold until the live submit/checkout route confirms which price a maker will pay. Sources: [current pricing](https://www.launchboard.dev/pricing), [official submit route](https://www.launchboard.dev/dashboard/submit), [how it works](https://www.launchboard.dev/how-it-works), [sample listing](https://www.launchboard.dev/launch/tutorgpt-1246).
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026. Pricing page and sample loaded; live submit route timed out, while its official indexed page showed the older amount.

#### Nick Launches: Hold

- **Best for:** Founders launching an early-stage startup or product.
- **Cost:** The owner's 2026 guide says free queue or $49 to skip it. The Terms describe a one-time paid placement but do not clearly give the full standard price.
- **Review time:** The guide says the free queue averages about six months; the paid option lets makers choose a launch week.
- **Link type:** Official sources conflict. The guide says a free listing gets a permanent dofollow link without conditions; the Terms say a badge may be required. Paid placements promise a dofollow link.
- **Eligibility:** The Terms require the submitter to own or be authorized for the product. Payment does not guarantee approval.
- **Submit here:** [Submit](https://nicklaunches.com/submit/), which continues to sign-in.
- **Example:** [Oyyo AI listing](https://nicklaunches.com/products/oyyo-ai/). Tier: not stated. Current raw page returned HTTP 200 but exposed no external maker anchor, href, or `rel`. An earlier page-reader observation listed `oyyo.one`, but this was not present in the raw HTML check and was not used as a confirmed link type.
- **Decision reason:** The free backlink/badge requirement conflicts in official sources; current raw HTML did not resolve the sample link type. Sources: [home](https://nicklaunches.com/), [Terms](https://nicklaunches.com/terms/), [owner's 2026 guide](https://nicklaunches.com/blog/where-to-launch-your-startup-2026/), [submit](https://nicklaunches.com/submit/), [sample](https://nicklaunches.com/products/oyyo-ai/).
- **Check method:** Official page review plus Chromium raw sample request, September 29, 2026.

#### Hype Desk: Hold

- **Best for:** Makers who can submit a short product demo video, if the `.io` service is the intended candidate.
- **Cost:** No current price for a listing is published on the active `.io` site.
- **Review time:** The `.io` homepage says it selects six launches a week; a per-submission review ETA is not stated.
- **Link type:** No current individual product page or maker-site anchor was verified.
- **Eligibility:** The active `.io` site requests a demo video of up to five minutes; it does not publish a full eligibility or outgoing-link rule.
- **Submit here:** The `.io` submit flow begins at [hypedesk.io](https://hypedesk.io/) and requires sign-in. The inventory candidate is [hypedesk.com](https://hypedesk.com/).
- **Example:** No matching public product detail page was verified. Tier, maker href, and `rel` are not available.
- **Decision reason:** The inventory domain `.com` and active video-demo platform `.io` are not shown to be the same service. Listing price, link type, and candidate identity are unresolved. Sources: [candidate domain](https://hypedesk.com/), [active site](https://hypedesk.io/), [active-site terms](https://hypedesk.io/terms).
- **Check method:** Official domain and active-site pages reviewed September 29, 2026.

#### SuperLaunch: Hold

- **Best for:** AI-product makers seeking a short product launch feature.
- **Cost:** Free option and Launch Plus at $29 once are listed.
- **Review time:** The submit page says listings are reviewed and appear within a few hours. Its how-it-works page also lists 7-, 15-, and 30-day visibility windows.
- **Link type:** The pricing page advertises dofollow, but does not clearly say how the promise applies by tier. The example page exposed no maker-site anchor in raw HTML.
- **Eligibility:** The site features AI products, but the current pages do not give a firm eligibility rule.
- **Submit here:** [Submit a product](https://superlaunch.io/submit).
- **Example:** [Prodigent listing](https://superlaunch.io/product/prodigent). Tier: not stated. The page loaded, but raw HTML did not expose a maker-site href or `rel`.
- **Decision reason:** The official pages disagree about 7-day versus permanent listing visibility, and tier-specific link rules and eligibility are incomplete. Sources: [pricing](https://superlaunch.io/pricing), [submit](https://superlaunch.io/submit), [how it works](https://superlaunch.io/how-it-works), [sample](https://superlaunch.io/product/prodigent).
- **Check method:** Official page review plus Chromium raw sample request, September 29, 2026.

#### Launching Next: Hold

- **Best for:** Startups with a founder-controlled website that want a free queue or express review.
- **Cost:** Official pages conflict: the advertise page says $49 express, a checkout record says $99 discounted from $199, and official LLM information says express starts at $149 once. Free submission is listed as a three- or four-month wait on different pages.
- **Review time:** Paid express says one business day; free wait conflicts between three and four months.
- **Link type:** Paid placement promises a permanent dofollow link. Free listing link type is not stated.
- **Eligibility:** Startup must have a founder-controlled website; submissions are manually reviewed.
- **Submit here:** [Submit a startup](https://www.launchingnext.com/submit/), which showed a verification challenge during this check.
- **Example:** No current public product detail page was confirmed. The official checkout URL is a transaction record, not a product sample. Tier, href, and `rel` are unavailable.
- **Decision reason:** Price and free-queue time conflict across official pages; the free link type and current sample are missing. Sources: [advertise](https://www.launchingnext.com/advertise), [submit](https://www.launchingnext.com/submit/), [checkout record](https://www.launchingnext.com/thanks/?i=120106), [official LLM information](https://launchingnext.com/llm-info.html).
- **Check method:** Official pages reviewed September 29, 2026; submit page showed a verification challenge.

#### Startup Buffer: Hold

- **Best for:** Startup makers able to provide a business email, pitch, description, and screenshot.
- **Cost:** No current fee is stated on the official form; a missing price is not proof that the listing is free.
- **Review time:** No official estimate found.
- **Link type:** Not established. The current sample could not expose its maker anchor.
- **Eligibility:** The form asks for a startup URL, business email, pitch, description, and screenshot; no complete eligibility rule is published.
- **Submit here:** [Startup submission form](https://startupbuffer.com/site/submit).
- **Example:** [Workonflow listing](https://startupbuffer.com/startup/workonflow). Tier: not stated. Current raw request returned a Cloudflare challenge (HTTP 403); maker href and `rel` were not observable.
- **Decision reason:** Cost, review time, complete eligibility, and link type remain unsupported by current official evidence. Sources: [home](https://startupbuffer.com/), [submit form](https://startupbuffer.com/site/submit), [terms](https://startupbuffer.com/site/tos), [sample](https://startupbuffer.com/startup/workonflow).
- **Check method:** Official form and terms review plus Chromium raw sample request, September 29, 2026.

#### Kick Product: Hold

- **Best for:** SaaS makers, based on the site's current product positioning.
- **Cost:** Pricing still shows Free as TBD/forever, Pro as TBD/month, and Lifetime as TBD/one-time; no actual prices are given.
- **Review time:** Not stated.
- **Link type:** No official policy or published product-page anchor was verified.
- **Eligibility:** The site refers to SaaS but does not publish detailed current submission rules.
- **Submit here:** The homepage has a create-launch action, but a working public submission route was not established.
- **Example:** No current individual product listing page could be verified. Tier, maker href, and `rel` are unavailable.
- **Decision reason:** The prices, submission route, review time, eligibility details, and product-link type are incomplete. Sources: [home](https://www.kickproduct.com/), [pricing](https://www.kickproduct.com/pricing).
- **Check method:** Official homepage and pricing reviewed September 29, 2026.

#### PromoteProject: Hold

- **Best for:** Startup makers who want profile visibility or a paid homepage feature.
- **Cost:** The paid feature costs $0.99 for one day or $5.99 for one week. The standard startup-profile fee is not published.
- **Review time:** No listing review estimate found.
- **Link type:** Sample only: the Promote Startup profile links to `https://promotestartup.com/` with no `rel` attribute, so that sampled anchor is followable. Tier: not stated. The target returned HTTP 200 at the same URL.
- **Eligibility:** Startup profiles exist, but current rules for submitting a normal profile were not established.
- **Submit here:** The homepage's “Submit startup” button opens a sign-in modal; it does not expose a standard listing form before sign-in. [Feature my startup](https://www.promoteproject.com/feature_my_startup) is a paid promotion page, not proof of a standard listing offer.
- **Example:** [Promote Startup profile](https://www.promoteproject.com/startup/197104/promote-startup). Tier: not stated. Raw href: `https://promotestartup.com/`. Raw `rel`: absent.
- **Decision reason:** The profile submission path, standard listing cost, review process, and eligibility rules are not established. Sources: [home](https://www.promoteproject.com/), [help](https://www.promoteproject.com/help), [paid feature](https://www.promoteproject.com/feature_my_startup), [sample](https://www.promoteproject.com/startup/197104/promote-startup).
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026.

#### SubmitHunt: Hold

- **Best for:** Startup and AI-product makers, based on the current directory pages.
- **Cost:** No price or billing terms could be read from the official pricing page.
- **Review time:** No current review or scheduling estimate found.
- **Link type:** Not verified. The current TurboStarter listing had no external maker anchor in the raw DOM at check time.
- **Eligibility:** Official submission rules were not accessible; current pages describe a startup and AI directory.
- **Submit here:** [Submit](https://www.submithunt.com/submit); the official submit and [pricing](https://www.submithunt.com/pricing) pages returned blank content in the reader.
- **Example:** [TurboStarter listing](https://www.submithunt.com/startup/turbostarter). Tier: not stated. The page returned HTTP 200 but exposed no raw maker href or `rel`.
- **Decision reason:** Price, review time, detailed eligibility, and maker-link type cannot be supported. Sources: [home](https://www.submithunt.com/), [submit](https://www.submithunt.com/submit), [pricing](https://www.submithunt.com/pricing), [sample](https://www.submithunt.com/startup/turbostarter).
- **Check method:** Official page review plus Chromium raw sample request, September 29, 2026.

#### IndieProducts: Hold

- **Best for:** Indie makers submitting SaaS, newsletters, browser extensions, apps, or agencies.
- **Cost:** Pricing lists Silver $9.99 for a three-month front-page listing, Gold $19.99 for three months, and Diamond $49.99 for six months or up to five products. The billing interval and basic/free listing price are not stated.
- **Review time:** FAQ describes manual verification but gives no ETA.
- **Link type:** No current product-link policy or sample anchor was verified.
- **Eligibility:** FAQ lists SaaS, newsletters, extensions, apps, and agencies; verification is manual.
- **Submit here:** [Submit](https://www.indieproducts.io/submit) returned an internal error.
- **Example:** No current public product detail page with an inspectable maker link was confirmed. Tier, href, and `rel` are unavailable.
- **Decision reason:** Basic listing cost and paid billing terms are unclear; outbound link type and a current raw sample are missing. Sources: [home](https://www.indieproducts.io/), [pricing](https://www.indieproducts.io/pricing), [FAQ](https://www.indieproducts.io/faq), [submit](https://www.indieproducts.io/submit).
- **Check method:** Official pages reviewed September 29, 2026.

#### TinyStartups: Hold

- **Best for:** Makers with a working product who can provide a site backlink if needed.
- **Cost:** The homepage says pay what you want with a $69 minimum. Terms describe a free queue and upgrades from $99. The membership page says $299/year but also uses one-time wording; its FAQ and terms say it renews annually.
- **Review time:** Free queue exists, but no queue estimate is stated; paid upgrades can skip the queue.
- **Link type:** Official terms offer a $99 dofollow-backlink upgrade but do not state the free listing's type. Sample only: Pop Site links with `rel="nofollow noopener noreferrer sponsored"`, so that sampled anchor is sponsored and nofollow. Tier: not stated.
- **Eligibility:** Submit a real, working product and have authority to submit it.
- **Submit here:** Start from the submit action on [TinyStartups](https://www.tinystartups.com/).
- **Example:** [Pop Site listing](https://www.tinystartups.com/tools/pop-site). Raw href: `https://pop.site/?utm_source=tinystartups.com`. Raw `rel`: `nofollow noopener noreferrer sponsored`. The target returned HTTP 200 at the same URL.
- **Decision reason:** Current official cost and renewal terms conflict; free-tier link type is not stated. Sources: [home](https://www.tinystartups.com/), [terms](https://www.tinystartups.com/terms), [membership](https://www.tinystartups.com/membership), [sample](https://www.tinystartups.com/tools/pop-site).
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026.

#### startuups: Hold

- **Best for:** Indie hackers, solo founders, and early-stage startups seeking a scheduled weekly launch.
- **Cost:** Official pricing content lists free and Premium at $5 per launch. The official homepage and submission flow did not load reliably during this check, so the amount could not be confirmed in a usable live checkout.
- **Review time:** Launches are scheduled Monday at 08:00 UTC; free and paid launch slots are limited weekly. A review ETA is not stated.
- **Link type:** Premium promises dofollow. Official pages conflict about free launches: the pricing page says top three **or** badge, while About says top three **and** badge. No raw link was exposed in the current sample check.
- **Eligibility:** The About page targets indie hackers, solo founders, and early-stage startups.
- **Submit here:** [Submit a project](https://startuups.com/projects/submit), which continues to sign-in.
- **Example:** [Stable Commerce listing](https://startuups.com/projects/stable-commerce). Tier: not stated. A previous page-reader observation listed `stablecommerce.ai`, but the raw page timed out in this check; no raw href, `rel`, or redirect was confirmed.
- **Decision reason:** The free dofollow condition conflicts across official sources, and live checkout/pricing could not be confirmed. Sources: [pricing](https://startuups.com/pricing), [about](https://startuups.com/about), [submit](https://startuups.com/projects/submit), [sample](https://startuups.com/projects/stable-commerce).
- **Check method:** Official page review and Chromium raw requests, September 29, 2026.

#### Product Fifty One: Hold

- **Best for:** Not established from accessible official information.
- **Cost:** Not established; the official domain returned HTTP 402.
- **Review time:** Not established.
- **Link type:** Not established.
- **Eligibility:** Not established.
- **Submit here:** No current submission route could be verified.
- **Example:** No current product listing page could be verified; no tier, href, or `rel` is available.
- **Decision reason:** The official site response blocks verification. This is treated as inaccessible, not closed. Source: [official site](https://productfiftyone.com/).
- **Check method:** Official domain request, September 29, 2026; HTTP 402.

#### ComingUp: Hold

- **Best for:** Makers seeking a product listing on an upcoming-product board.
- **Cost:** No current official listing fee or billing rule could be confirmed.
- **Review time:** No current official review or scheduling estimate could be confirmed.
- **Link type:** Sample only: Aurevia's listing anchor has `rel="noopener noreferrer nofollow"`, so that sampled link is nofollow. No official plan-wide link rule was found.
- **Eligibility:** The site accepts upcoming product listings, but current detailed maker rules were not accessible.
- **Submit here:** [Submit](https://www.comingup.io/submit) returned a blank response in the reader.
- **Example:** [Aurevia listing](https://www.comingup.io/p/aurevia-shopify-ai-sales-agent), dated September 6, 2026. Tier: not stated. Raw href: `https://www.aurevia.io/?utm_source=comingup.io`. Raw `rel`: `noopener noreferrer nofollow`. The target returned HTTP 200 at the same URL.
- **Decision reason:** Current cost, timing, and full eligibility remain unverified. Sources: [home](https://www.comingup.io/), [submit](https://www.comingup.io/submit), [sample](https://www.comingup.io/p/aurevia-shopify-ai-sales-agent).
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026.

#### LaunchDB: Hold

- **Best for:** Makers who want a weekly launch and leaderboard placement.
- **Cost:** Official help says submissions are free. About says $30 buys a priority date. Terms say LaunchDB is for Pro members and refer to a one-time skip fee that may vary.
- **Review time:** Launches are scheduled Sunday at 12:00 a.m. Eastern; entries are reviewed and queued, but dates are not guaranteed.
- **Link type:** Official About says top-three entries may get dofollow when the maker adds a reciprocal badge. Sample only: Allocera's maker link has `rel="noopener noreferrer"` only, so that sampled link follows. The sample tier is not stated.
- **Eligibility:** Product submissions are reviewed; detailed product eligibility is not fully stated in the accessible rules.
- **Submit here:** [LaunchDB submit](https://bigideasdb.com/launchdb/submit), but the reader blocks that route with its robots rule.
- **Example:** [Allocera Intelligence listing](https://bigideasdb.com/launchdb/launches/allocera-intelligence). Tier: not stated. Raw maker href: `https://alloceraintelligence.com/`. Raw `rel`: `noopener noreferrer`. The target returned HTTP 200 at the same URL.
- **Decision reason:** Official help says submissions are free while Terms require Pro membership. Link rules are also limited to a top-three/badge condition. Sources: [board](https://bigideasdb.com/launchdb), [About](https://bigideasdb.com/launchdb/about), [submission help](https://bigideasdb.com/help/how-to-submit-product-launchdb), [Terms](https://bigideasdb.com/tos), [sample](https://bigideasdb.com/launchdb/launches/allocera-intelligence).
- **Check method:** Official page review plus Chromium raw HTML and target request, September 29, 2026.

### Category 2: prelaunch, beta, and early feedback

#### Betabound: Hold

- **Best for:** Product teams recruiting beta testers, rather than a current product launch directory.
- **Cost:** A 2014 official announcement said companies could request a listing for free. No current price was confirmed.
- **Review time:** No current review time or publication schedule is stated.
- **Link type:** The only inspectable maker-side sample is a 2017 beta opportunity, not a current product listing. It links to `http://beta.fitbit.com/` with no `rel` attribute, so only that old sample is followable; it does not establish the current maker-link policy.
- **Eligibility:** Current company submission rules could not be verified.
- **Submit here:** [Company announcement form](https://betabound.com/announce/) returned an internal error. The separate [tester signup](https://my.betabound.com/welcome/) is for testers, not product makers.
- **Example:** [Fitbit Community Private Beta](https://betabound.com/fitbit-community-private-beta/), dated 2017. Tier: not stated. Raw target `http://beta.fitbit.com/`; `rel` absent. It is not current evidence for maker listings.
- **Decision reason:** Current company submission terms, price, review timing, eligibility, and link policy are unavailable. Sources: [announce form](https://betabound.com/announce/), [tester signup](https://my.betabound.com/welcome/), [old example](https://betabound.com/fitbit-community-private-beta/), [2014 official announcement](https://www.centercode.com/blog/announcing-betabound-a-new-way-to-find-great-beta-testers).
- **Check method:** Official page review and Chromium raw sample request, September 29, 2026.

#### StartHQ: Hold

- **Best for:** Not established from accessible official information.
- **Cost:** Not established; no current official pricing information was accessible.
- **Review time:** Not established.
- **Link type:** Not established; no current product sample was available.
- **Eligibility:** Not established.
- **Submit here:** [Home](https://starthq.com/) and [submit](https://starthq.com/submit) returned internal errors.
- **Example:** No current public product listing could be verified; tier, href, and `rel` are unavailable.
- **Decision reason:** The official site and submit route could not be checked. Treat it as inaccessible, not closed.
- **Check method:** Official site requests, September 29, 2026.

#### Erli Bird: Hold

- **Best for:** Not established from accessible official information.
- **Cost:** Not established; official pages returned HTTP 502.
- **Review time:** Not established.
- **Link type:** Not established; no current maker listing was available.
- **Eligibility:** Not established.
- **Submit here:** [Home](https://erlibird.com/), [submit](https://erlibird.com/submit), and [pricing](https://erlibird.com/pricing) returned HTTP 502.
- **Example:** No current public maker listing could be verified; tier, href, and `rel` are unavailable.
- **Decision reason:** Official pages were unavailable; do not treat the service as closed.
- **Check method:** Official page requests, September 29, 2026.

## Coverage

- Rechecked all 23 remaining holds from categories 1 and 2.
- New card-ready records: 2 (PeerPush and StartupTrusted).
- Remaining holds: 21.
- Excluded: 0. No fresh evidence established that a candidate was closed or out of scope.
- Card-ready total across the original research and follow-ups is now 14 for these two categories. The four existing-record skips remain Product Hunt, Uneed, Fazier, and TinyLaunch.
