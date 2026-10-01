# Launch directories research follow-up: remaining categories 3 and 4

Checked: 2026-09-29
Scope: The 19 Category 3 and 11 Category 4 candidates still held after [follow-up batch 02](research_followup_batch_02.md). This check reopens all 30. It does not repeat the four candidates already upgraded there: SaaSHub, AppRater, Startups.gallery, and SideProjectors. The four new Include decisions below supersede their Hold rows in that earlier report.

## Method

I checked each candidate's first-party submit, pricing, help, and eligibility pages where reachable. For current examples I used a live Chrome page and recorded the maker-site anchor's `href` and literal `rel` tokens. These are sample-level checks, not a promise about every listing. A blocked, timed-out, login-only, or missing page is reported as unknown; it is not treated as proof that a site is closed. Link type comes from observed anchor tokens or an explicit first-party policy; a missing site label is not evidence of dofollow.

## Ready to add

The four records below now have a current official submission route, a cost and review-time value, eligibility, and an observed example link. “Not published” records the absence of a public value; it never means free or guaranteed.

### Alternative.me — Include

- **Category:** General startup and evergreen software listings.
- **Submit here:** Create an account, then use the software-submission action in the [account dashboard](https://alternative.me/how-to/submit-software/).
- **Cost:** The official submission guide does not publish a fee or paid option. Card wording: “Price not listed on the submission guide.”
- **Review time:** No estimate is published in the current guide.
- **Eligibility:** Software submissions are generally open to everyone; an account is required.
- **Link type:** `nofollow` in the Spotify example. Sample tier: public profile; no paid tier is identified. Its “Visit Homepage” anchor points to `https://www.spotify.com/` with `rel="nofollow"`; that target resolved to `https://open.spotify.com/` (HTTP 200).
- **Sources:** [Submit software](https://alternative.me/how-to/submit-software/), [Spotify example](https://alternative.me/spotify).

### Startup Ranking — Include

- **Category:** General startup and evergreen software listings.
- **Submit here:** Use [Create Startup](https://www.startupranking.com/startup/create/url-validation); it redirects to sign-in for visitors who are not logged in.
- **Cost:** The regular submission price is not shown. Optional Faster Approval costs `$49` Basic or `$99` Premium, paid once.
- **Review time:** The standard approval queue is 80 days. Faster Approval promises under 24 hours.
- **Eligibility:** The current instructions allow a user to create their own startup or another startup/company; an account is required.
- **Link type:** `nofollow` in the Pop Up World sample. Sample tier: public listing; paid status is not identified. Its maker-site anchor points to `http://popupworld.co.uk/?utm_medium=referral&utm_source=startupranking.com` with `rel="nofollow"`; it resolved to the same site over HTTPS (HTTP 200).
- **Sources:** [How it works](https://www.startupranking.com/how-it-works), [Faster Approval pricing](https://www.startupranking.com/faster-approval), [Pop Up World example](https://www.startupranking.com/startup/pop-up-world).

### Serchen — Include

- **Category:** Software reviews, comparisons, and buyer catalogs.
- **Submit here:** [Submit a new listing](https://www.serchen.com/get-listed/new).
- **Cost:** The new Basic listing form charges `$49.95` once. Serchen also describes a free company profile, but the free profile has no website button; Basic adds one. Premium pricing is not shown in the public pages checked.
- **Review time:** The current form and membership guide give no publication estimate.
- **Eligibility:** A software company needs a product name, valid homepage, work email, and an existing Serchen category. The form says a submission to a category that does not exist will not be approved.
- **Link type:** `nofollow` in the Slack example. Its website anchor points to `https://www.slack.com/?ref=serchen.com` with `rel="nofollow noopener noreferrer"`; it resolved to `https://slack.com/intl/en-in/?ref=serchen.com` (HTTP 200). Sample tier: exact paid tier is not labeled. Serchen says free profiles have no website button, so a profile with this button uses a paid tier.
- **Sources:** [New listing form](https://www.serchen.com/get-listed/new), [membership comparison](https://www.serchen.com/blog/serchen-basic-vs-premium-membership), [Slack example](https://www.serchen.com/company/slack-2).

### GoodFirms — Include

- **Category:** Software reviews, comparisons, and buyer catalogs.
- **Submit here:** [Apply for a free listing](https://www.goodfirms.co/get-listed).
- **Cost:** Free profile forever. PRO is `$49/month`, billed annually at `$588/year`; top-of-page sponsorship is custom-priced.
- **Review time:** GoodFirms says a typical free-listing decision takes 5 to 10 business days.
- **Eligibility:** B2B software vendors and service firms may apply. GoodFirms checks a portfolio, conducts 2 to 3 client reference calls, and verifies legitimacy; it reports a 23% acceptance rate.
- **Link type:** `nofollow` in the Bitrix24 example. Sample tier: not labeled. Its “Visit Website” anchor points to `https://www.bitrix24.com/` with `rel="nofollow noopener noreferrer"`. The target opened as the current official Bitrix24 homepage in the web reader; no different redirect destination was observed.
- **Sources:** [Get listed and pricing](https://www.goodfirms.co/get-listed), [plan and review details](https://www.goodfirms.co/goodfirms-pro), [Bitrix24 example](https://www.goodfirms.co/software/bitrix24).

## Still on hold

### Category 3: general startup and evergreen software listings

#### SaaS Browser — Hold

- **Submit here:** The official [listing instructions](https://help.saasbrowser.com/portal/en/kb/articles/how) link to its add-a-SaaS form.
- **Cost and review:** Core listing is free. The current listing instructions do not give a publication ETA. A separate review guide mentions profiles typically appear within 24 hours, but it is not clearly about new submissions.
- **Eligibility:** B2B or B2C cloud software with a live page for trial, purchase, signup, or demo; a waitlist alone is excluded.
- **Sample and link type:** [SaaSLaunch](https://saasbrowser.com/en/saas/1497796/saaslaunch) returned a Cloudflare page (HTTP 403); its website anchor and `rel` could not be read.
- **Why held:** The actual example link type remains unverified.

#### Startup Stash — Hold

- **Submit here:** [List a Product](https://startupstash.com/add-listing/) embeds an intake form.
- **Cost and review:** The current public form and policy do not show a submission price or listing ETA. Its editorial policy says a product listing is separate from a paid rank in a Top Tools article.
- **Eligibility:** Vendors may submit a product, but the public intake page does not state a complete acceptance checklist.
- **Sample and link type:** [Notion for Startups](https://startupstash.com/tools/notion-for-startups/) has a “Visit Website” anchor to `https://ntn.so/startupstash` with `rel="external noopener"`. It resolved to Notion's startup-program page (HTTP 200). Sample tier: public listing; no paid tier is identified.
- **Why held:** Fee, timing, and full submission eligibility are not public.
- **Sources:** [List a Product](https://startupstash.com/add-listing/), [review policy](https://startupstash.com/how-we-review-tools/).

#### Startups FYI — Hold

- **Submit here:** [Current submission form](https://tally.so/r/3lOGLk).
- **Cost and review:** The form says featured listings start at `$29`; the separate [Boost page](https://www.startups.fyi/boost) also shows `$49/month`, early-bird `$69/month` and `$690/year`, and crossed-out `$149/month` and `$1,490/year` prices. It says submissions are vetted but gives no go-live estimate.
- **Eligibility:** The form says submissions are reviewed by a person and the site accepts startup products broadly; the public pages do not define a tighter eligibility list.
- **Sample and link type:** [Capme](https://www.startups.fyi/product/capme) has a maker anchor to `https://www.capme.app/?utm_source=startups.fyi` with no `rel` attribute; it resolved to `https://capme.app/?utm_source=startups.fyi` (HTTP 200). Sample tier: not labeled.
- **Why held:** The official pages do not reconcile the different paid offers, and no review ETA is published.

#### KillerStartups — Hold

- **Submit here:** The [submission guide](https://killerstartups.com/how-to-submit/) asks founders to join the community and send details to the editorial team; a separate [payment page](https://killerstartups.com/finalize-payment/) offers a paid feature.
- **Cost and review:** The paid-feature price is not shown. The submission guide says features publish weekly on Monday; the payment page says 7 to 10 business days. These are inconsistent publication expectations.
- **Eligibility:** Founder-submitted startup stories are considered for editorial coverage; acceptance is not promised.
- **Sample and link type:** [Jamie AI](https://killerstartups.com/jamie-ai-saas/3/) has a maker anchor to `https://www.meetjamie.ai/` with `rel="noopener"`; it resolved directly (HTTP 200). Sample tier: public editorial feature; a paid or free tier is not identified.
- **Why held:** Price and publication timing are unresolved.

#### AllTopStartups — Hold

- **Submit here:** [Submit a startup to the directory](https://alltopstartups.com/directory/submit-startup/).
- **Cost and review:** It advertises a paid permanent listing and publication in under 48 hours, but does not show the price.
- **Eligibility:** The current submit page does not say clearly which products or companies qualify.
- **Sample and link type:** [Ego Lite](https://alltopstartups.com/directory/listing/ego-lite-fastest-browser-for-ai-agents-to-run-web-automation/) has a maker anchor to `https://lite.ego.app/` with `rel="noopener"`; it resolved directly (HTTP 200). Sample tier: public listing; paid status is not identified.
- **Why held:** Cost and eligibility are incomplete.

#### StartupLift — Hold

- **Submit here:** No current working official submission route was found. The [current homepage](https://startuplift.com/) was inaccessible; the only process article found is from 2010.
- **Cost, review, and eligibility:** No current official values could be verified.
- **Sample and link type:** No current public product sample could be verified.
- **Why held:** The current service and its submission details are unknown; the old article cannot fill them in.

#### Cool Startups — Hold

- **Submit here:** No current official submission path was found on the [candidate site](https://coolstartups.io/), which was inaccessible during this check.
- **Cost, review, and eligibility:** No current official values could be verified.
- **Sample and link type:** No current public product sample could be verified.
- **Why held:** An outage alone does not establish current operation or terms.

#### Startuplist.in — Hold

- **Submit here:** The exact [startuplist.in](https://startuplist.in/) candidate did not load. I found no reliable current first-party submit route.
- **Cost, review, and eligibility:** No current terms could be verified. Similarly named services on other domains are not treated as this site.
- **Sample and link type:** No current example could be verified.
- **Why held:** The exact site and listing workflow are unknown.

#### SaaSGenius — Hold

- **Submit here:** The official [Get Listed page](https://www.saasgenius.com/get-listed/) asks vendors to email company information and a preferred category.
- **Cost and review:** Free listings are not accepted. The fee is described as a small amount, but the site asks vendors to contact it for pricing. No review ETA is published.
- **Eligibility:** Excludes B2C-only products, standalone mobile apps without desktop software, products with no US customers, and alpha/beta products.
- **Sample and link type:** The current [Trellis profile](https://www.saasgenius.com/reviews/trellis/) exposed affiliate links, but no maker-site anchor. No product link type can be assigned from this sample.
- **Why held:** The required outbound product link is absent from the inspected example; fee and timing are also incomplete.

#### SaaSWorthy — Hold

- **Submit here:** [Vendor offerings](https://www.saasworthy.com/offerings) is the current official vendor entry point.
- **Cost and review:** Standard profile is free. Premium uses annual billing, but the amount is not public; higher Core and Ultimate plans are custom-priced. Profiles are reviewed after vendor details are submitted; no ETA is published.
- **Eligibility:** SaaS products with vendor-provided company/product details.
- **Sample and link type:** The [Mapp Cloud profile](https://www.saasworthy.com/product/mapp-cloud) loaded, but its current page had no maker-site anchor in the raw external-link list.
- **Why held:** The example does not establish an outbound product link or its link type; the paid Premium amount is also missing.

#### Crozdesk — Hold

- **Submit here:** Current [vendor application entry](https://crozdesk.com/claims/new) routes to a new-listing form.
- **Cost and review:** A standard software listing is free; optional campaigns are separate and flexible-priced. The current official pages do not publish a review ETA.
- **Eligibility:** Software vendors may apply; the current public pages do not give more specific admission rules.
- **Sample and link type:** The [LiveAgent profile](https://crozdesk.com/software/liveagent) returned a Cloudflare challenge (HTTP 403); its product anchor and `rel` could not be checked.
- **Why held:** Current sample link type and review time remain unverified.

#### Softpedia — Hold

- **Submit here:** The [software catalog](https://www.softpedia.com/) is active, but no current official maker submission route was found.
- **Cost, review, and eligibility:** No current official software-listing price, review time, or admission rules could be verified.
- **Sample and link type:** The [EMCO Network Malware Cleaner page](https://www.softpedia.com/get/Antivirus/Network-Malware-Cleaner.shtml) loaded. The raw external links inspected were platform sub-sites and image files; no maker homepage anchor suitable for a card was established.
- **Why held:** A product page exists, but a current submission workflow and link type are missing.

#### F6S — Hold

- **Submit here:** The current [software catalog](https://www.f6s.com/software) could not be opened. The accessible [claim guide](https://f6s.helpscoutdocs.com/article/76-claiming-a-startup-page) explains claiming an existing company profile, not submitting a new software listing.
- **Cost and review:** No current listing fee or decision time was found.
- **Eligibility:** The claim guide concerns startup/company pages. A maker's eligibility to add a software product is not established.
- **Sample and link type:** No current product example with an inspectable maker anchor was established.
- **Why held:** New-product submission terms and link behavior are unknown.

#### Crunchbase — Hold

- **Submit here:** Its [profile creation guide](https://support.crunchbase.com/hc/en-us/articles/115011823988-How-do-I-create-a-Crunchbase-profile) says registered, socially authenticated users can create profiles.
- **Cost and review:** The guide gives no profile fee or approval time. Crunchbase Pro is a separate research subscription, not a listing fee.
- **Eligibility:** Profiles describe companies and funding; the public guide does not describe a product-launch submission.
- **Sample and link type:** The [OpenAI profile](https://www.crunchbase.com/organization/openai) returned a Cloudflare challenge (HTTP 403); raw maker-link HTML could not be checked.
- **Why held:** It is not a product launch submission path and the sample relation is unverified.

#### StartupBlink — Hold

- **Submit here:** [Add a startup](https://www.startupblink.com/startups/add).
- **Cost and review:** The public form lists no submission price or decision time.
- **Eligibility:** The form asks for the startup name and website, city, industry, subindustry, and a 30-to-350-character description. It says an official representative should submit and email-domain verification may be requested.
- **Sample and link type:** No current example profile with a raw maker-site anchor was established in this check.
- **Why held:** Price, review time, and link type remain unknown.

### Category 4: software reviews, comparisons, and buyer catalogs

#### G2 — Hold

- **Submit here:** [Create a product profile](https://sell.g2.com/create-a-profile).
- **Cost and review:** Profile creation is free; Starter is `$299/month` or `$2,999` for year one. New profile verification takes about 3 to 5 business days; claiming a profile takes 1 to 3 days.
- **Eligibility:** Public software products; B2C and alpha/beta products are excluded.
- **Sample and link type:** The [Slack reviews page](https://www.g2.com/products/slack/reviews) returned a bot challenge (HTTP 403), so its maker-site anchor and `rel` were not visible.
- **Why held:** Current sample link evidence is blocked.

#### Capterra — Hold

- **Submit here:** [Vendor information](https://www.capterra.com/vendors/) directs software vendors to the listing process.
- **Cost and review:** Basic product profiles are free; paid sponsored lead generation is available with no standard public rate. The official vendor FAQ says processing can take more than six weeks.
- **Eligibility:** Public packaged B2B or B2C software in an established category. The current guidelines exclude marketplaces, databases, personal productivity tools, personal apps, clones, and waitlist-only offers.
- **Sample and link type:** [Vendor Portal](https://www.capterra.com/p/10017069/Vendor-Portal/) returned a Cloudflare challenge (HTTP 403); the maker-site anchor could not be checked.
- **Why held:** Outbound relation is unverified.
- **Sources:** [Profile guidelines](https://www.capterra.com/legal/listing-guidelines/), [vendor listing FAQ](https://www.softwareadvice.com/vendor-listing-faq/).

#### GetApp — Hold

- **Submit here:** Its current [profile guidelines](https://www.getapp.com/listing_guidelines/) describe creating a product profile from public information or with vendor input.
- **Cost and review:** Paid PPC/PPL programs use insertion orders. The accessible official pages do not establish that every basic listing is free. The vendor FAQ says processing may take more than six weeks.
- **Eligibility:** Public packaged software in an existing category. Waitlists, databases, marketplaces, personal productivity tools, personal apps, and clones are excluded, with a limited beta exception.
- **Sample and link type:** The [Slack profile](https://www.getapp.com/collaboration-software/a/slack/) redirected in the live browser to an authentication error page; no maker anchor could be read.
- **Why held:** Price for a standard listing and sample link type are not established.

#### Software Advice — Hold

- **Submit here:** [Vendor information](https://www.softwareadvice.com/vendors/).
- **Cost and review:** Product profiles are free. Lead-generation programs are separate and have no public standard price. The official [vendor FAQ](https://www.softwareadvice.com/vendor-listing-faq/) says vetting, writing, and publication can take more than six weeks.
- **Eligibility:** Software vendors may request a product profile; the public vendor information page does not state a full public checklist.
- **Sample and link type:** The [Slack profile](https://www.softwareadvice.com/remote-support/slack-profile/) loaded, but its raw external anchors did not expose a maker-site link. A visible “Manage this product listing” link points to G2, not Slack.
- **Why held:** The sample link type cannot be verified.

#### TrustRadius — Hold

- **Submit here:** Vendors start through the [contact and claim process](https://about.trustradius.com/contact-us).
- **Cost and review:** Vendor listing and review responses are free under its [content integrity terms](https://www.trustradius.com/static/content-integrity). No review or publication estimate is published.
- **Eligibility:** Software vendors may claim profiles and respond to product reviews; no narrower public checklist was found.
- **Sample and link type:** The [Slack reviews page](https://www.trustradius.com/products/slack/reviews) loaded. Its raw external links showed vendor resources but no maker-site anchor.
- **Why held:** No public maker-link example was available to determine link type.

#### SelectHub — Hold

- **Submit here:** The [vendor portal](https://vendors.selecthub.com/session/new) starts at sign-in; the public [seller page](https://www.selecthub.com/seller/) was inaccessible.
- **Cost, review, and eligibility:** No public listing price, review estimate, or complete admission rules could be confirmed.
- **Sample and link type:** The [Slack product page](https://www.selecthub.com/p/collaboration-software-tools/slack/) loaded, but its external product-related anchors were vendor “Claim Your Product Listing,” pricing, and demo request pages. No maker-site link was exposed.
- **Why held:** Public listing terms and a sample product link are not available.

#### CompareCamp — Hold

- **Submit here:** The [Request a Review form](https://comparecamp.com/request-a-review/) asks for product and company information, website, company email, and monthly online advertising budget.
- **Cost and review:** The form is dated March 12, 2015; it gives no current fee or publication estimate.
- **Eligibility:** The old form appears to seek software review submissions from vendors but does not give current eligibility rules.
- **Sample and link type:** No current product listing example with a verified maker anchor was found. The current homepage is mostly older editorial material.
- **Why held:** The official intake is stale and the current listing terms and sample link cannot be verified.

#### ITQlick — Hold

- **Submit here:** No current public maker submission route could be verified. Official [About](https://www.itqlick.com/About), [Terms](https://www.itqlick.com/Terms), and [product page](https://www.itqlick.com/dynamic-pricing) returned Cloudflare challenges (HTTP 403).
- **Cost, review, and eligibility:** No current official public values could be verified.
- **Sample and link type:** The attempted product page was blocked; no maker anchor could be inspected.
- **Why held:** The source pages needed to establish all card facts are inaccessible.

#### SoftwareWorld — Hold

- **Submit here:** The official [Help Center](https://www.softwareworld.co/help-center/) describes a new vendor-submitted listing.
- **Cost and review:** New listing is `$99` once; claiming an existing profile is free. New entries are reviewed, but no decision deadline is promised.
- **Eligibility:** A valid business website and enough verifiable product or company information are required.
- **Sample and link type:** The [StoreForce example](https://www.softwareworld.co/software/storeforce-reviews/) returned a Cloudflare challenge (HTTP 403); the “Visit Website” anchor and its `rel` were not accessible.
- **Why held:** The sample link type remains unverified.

#### FeaturedCustomers — Hold

- **Submit here:** [Vendor Solutions](https://www.featuredcustomers.com/vendor-solutions) describes verified vendor profiles and vendor-management tools.
- **Cost and review:** A Verified Vendor profile is free. Premium pricing and review timing are not published.
- **Eligibility:** B2B vendors managing customer references, case studies, and testimonials; it is aimed at vendors with customer proof.
- **Sample and link type:** The [SpendHQ profile](https://www.featuredcustomers.com/vendor/spendhq) has a “Visit Website” anchor to `https://www.spendhq.com/` with `rel="noopener noreferrer"`; it resolved directly (HTTP 200). The raw anchor contains no `nofollow`, `ugc`, or `sponsored` token; this records the markup without claiming a site-wide promise. Sample tier: not labeled.
- **Why held:** A public maker-submission route and decision time are not clear, and the service is focused on customer proof rather than launch discovery.

#### StackShare — Hold

- **Submit here:** [List a Tool](https://stackshare.io/tools/new).
- **Cost and review:** The official [verification guide](https://stackshare.io/docs/tools/verification) says claiming and verifying an existing tool is free and may be instant or take minutes. It does not state the fee or publication time for a new tool listing.
- **Eligibility:** The current listing entry is a tool profile; the public pages do not establish all new-listing requirements.
- **Sample and link type:** The [WebsitePulse Test Tools profile](https://stackshare.io/websitepulse-test-tools) timed out in the live browser, so the maker anchor could not be read.
- **Why held:** Existing-profile verification terms do not establish new-listing cost, timing, or outbound link type.

## Coverage count

- Rechecked: **30 candidates** (Category 3: 19; Category 4: 11).
- Newly card-ready: **4** (Alternative.me, Startup Ranking, Serchen, GoodFirms).
- Still held: **26** (Category 3: 15; Category 4: 11).
- Excluded here: **0**. Existing exclusions and prior card decisions remain in the earlier batch report.
