# Launch directories research follow-up: category 9

Checked: 2026-09-29 05:20 UTC
Scope: Recheck the six held Category 9 candidates in [research batch 05](research_batch_05.md). I used first-party pages for claims about each service.

## Link-check limits

The web reader exposed visible page text, link destinations, and some redirects, but not the outbound anchor HTML or its `rel` tokens. Direct shell requests could not resolve external hosts in this environment. I therefore do not label any inspected link dofollow, nofollow, sponsored, or UGC unless the current official source says so. A visible destination or a redirect does not reveal the anchor's `rel` value.

The parent agent checked the current JustReviews sample's raw HTML on 2026-09-29. Its product link has no restrictive `rel` token, so the card says that this sample link is follow; this is not a site-wide promise. The same browser pass inspected sample HTML for SiteInspire, Makerlist, Lapa Ninja, and Selljam. Their results are recorded below and in the Category 8 follow-up.

## Decisions

| Candidate | Decision | Card-ready result |
| --- | --- | --- |
| NextBigWhat | Include | Current paid product-launch plans, one-time prices, and a 24-hour publish target are published. A current JustReviews sample links to its product site with no restrictive `rel` token, so that sampled link is follow. |
| YourStory | Hold | The List Your Company form now returns 404, and the NIYO sample is blocked by Cloudflare. Price, review time, eligibility, and link type are unverified. |
| IndieExtensions | Hold | The official domain did not resolve in the current browser check. No current first-party submit route or sample was verified; this does not prove closure. |
| ExtensionBoss | Hold | The official domain timed out in the current browser check. No current first-party submit route or sample was verified; this does not prove closure. |
| AEO Tools Space | Hold | The owner points to a replacement host, but its TLS certificate fails validation, so its directory, form, and sample cannot be checked safely. The old domain is parked. |
| Selljam | Hold | The current specialist tools directory and public sample are active, but no public product submission route was found. Raw HTML shows a follow link in the Anchor Browser sample. |

No candidate is excluded: the unavailable sites are not proven closed, and Selljam may accept requests through a route that is not published on its current site.

## NextBigWhat - Include

- **What it is:** A product launch listing for founders, makers, startups, and people building in technology. The current page presents SaaS, AI, and emerging technology products to founders, operators, buyers, and product readers.
- **How to submit:** The official [NextBigWhat homepage](https://nextbigwhat.com/) links to [Submit your product](https://submit.nextbigwhat.com/). The old `/submit-your-startup/` address redirects to the new page. After checkout, the maker submits the product name, tagline, description, link, and image.
- **Submission cost vs. ads:** Lite is **$39 one time** and Pro is **$79 one time**. Both buy a permanent product page and include homepage and newsletter visibility. Lite gets a focused 2-day promotion; Pro gets an extended 5-day promotion. These are combined launch-listing and promotion plans, not a separate advertising price.
- **Review time:** The current page says a completed submission is published within 24 hours. The editorial team may edit unsupported promotional claims. It does not promise acceptance.
- **Eligibility:** The page targets founders and makers launching products in startups, SaaS, AI, and emerging technology. It gives no detailed acceptance checklist or exclusions.
- **Representative sample:** The current homepage displays product cards such as AI Chatbot by Elfsight and JustReviews by Elfsight, dated September 27, 2026. The [JustReviews detail page](https://nextbigwhat.com/justreviews-by-elfsight/) is live. Its “Get it” link points to `https://justreviews.io/?ref=nextbigwhat.com` and has no `rel` attribute. That is a follow link in this sample; it is not a site-wide plan promise.
- **Link treatment:** Use **“Follow in the JustReviews sample.”** The current paid-plan page says a permanent product page includes a link to the product, but does not specify `dofollow`, `nofollow`, `sponsored`, or `ugc` for every listing.
- **Old terms to ignore:** An older indexed [submission page](https://submit.nextbigwhat.com/submit-your-startup) described a free listing and a paid dofollow backlink. That route currently returns 404. The current homepage points to the new $39/$79-only launch page, which does not promise a dofollow link. Do not use the old free or dofollow claims in the card.
- **Sources:** [Current official submission page](https://submit.nextbigwhat.com/), [official homepage](https://nextbigwhat.com/), [current JustReviews sample](https://nextbigwhat.com/justreviews-by-elfsight/), [older product submission route](https://submit.nextbigwhat.com/submit-your-startup), [older WorkWeave page](https://nextbigwhat.com/workweave/).

## YourStory - Hold

- **What it is:** A curated database of Indian companies and startups, with company profiles. It is a company directory, not a product-specific launch board.
- **How to submit:** The current [Company Listing page](https://yourstory.com/companies) has a “List Your Company” link to a [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSetnejE9KBrZoqrnqR3Ts4Pd3e3N3MjB-honhmImL59HPu14Eg/viewform). In the 2026-09-29 browser check, the form returned Google Drive's “file does not exist” page.
- **Submission cost vs. ads:** The directory page does not publish a listing fee. It also has a separate “Advertise with us” link; this is an advertising route and must not be reported as the company-listing price. No standard ad price was verified.
- **Review time:** No listing turnaround is published on the directory page. The inaccessible form did not provide verifiable timing.
- **Eligibility:** YourStory describes the entries as companies curated by its media team. It does not give a public current acceptance checklist on the accessible page.
- **Representative sample:** [NIYO SOLUTIONS](https://yourstory.com/companies/niyo-solutions) returned a Cloudflare challenge in the 2026-09-29 browser check, so its current markup could not be inspected.
- **Link treatment:** No live sample `rel` or official link-type policy could be verified.
- **Decision reason:** The directory link points to a form that currently returns 404. Price, review time, eligibility, and sample link type are unverified, so there is no accurate Submit here card yet.
- **Sources:** [Company directory and form link](https://yourstory.com/companies), [NIYO profile](https://yourstory.com/companies/niyo-solutions), [submission form](https://docs.google.com/forms/d/e/1FAIpQLSetnejE9KBrZoqrnqR3Ts4Pd3e3N3MjB-honhmImL59HPu14Eg/viewform).

## IndieExtensions - Hold

- **Current official site:** The inventoried [indieextensions.com](https://indieextensions.com/) and its `www` version did not return a page in the web reader. Direct shell requests could not resolve the host. These access failures do not prove the service is closed.
- **How to submit:** No current first-party submission form or instructions could be verified.
- **Submission cost vs. ads:** Unknown. I found no accessible current first-party pricing or advertising terms.
- **Review time and eligibility:** Unknown; no current official terms were accessible.
- **Representative sample:** No current official extension profile could be verified.
- **Link treatment:** No representative external product link or HTML `rel` value could be inspected.
- **Decision reason:** Keep it on hold until the official site or an owner-controlled submission route is reachable. Do not use third-party directory roundups to fill its listing facts.
- **Source checked:** [Official domain](https://indieextensions.com/).

## ExtensionBoss - Hold

- **Current official site:** The inventoried [extensionboss.com](https://extensionboss.com/) and its `www` version did not return a page in the web reader. Direct shell requests could not resolve the host. These access failures do not prove the service is closed.
- **How to submit:** No current first-party submission form or instructions could be verified.
- **Submission cost vs. ads:** Unknown. I found no accessible current first-party pricing or advertising terms.
- **Review time and eligibility:** Unknown; no current official terms were accessible.
- **Representative sample:** No current official extension profile could be verified.
- **Link treatment:** No representative external product link or HTML `rel` value could be inspected.
- **Decision reason:** Keep it on hold until the official site or an owner-controlled submission route is reachable. Do not rely on third-party claims about a free tier or user reviews.
- **Source checked:** [Official domain](https://extensionboss.com/).

## AEO Tools Space - Hold

- **Current identity and host:** Mihir Naik's current [official homepage](https://www.mihirnaik.com/) describes AEOTools.Space as a curated directory of AI search visibility and AEO tools, and links “Browse the directory” to [aeotools.mihirnaik.com](https://aeotools.mihirnaik.com/). That owner-controlled page establishes the intended replacement host.
- **Current submission route:** An official directory-page snapshot links “Submit Tool” to [aeotools.mihirnaik.com/submit-tool](https://aeotools.mihirnaik.com/submit-tool). The current host and that route both returned a cache miss to the reader, so I could not test the form or confirm its current fields.
- **Submission cost vs. ads:** No current-host listing fee or advertising offer could be verified. The current route's content was unavailable.
- **Review time and eligibility:** The owner describes a curated AEO directory. An older [privacy policy on aeotools.space](https://www.aeotools.space/privacy), last updated December 16, 2025, says submitted tools are reviewed for relevance to AI search visibility, but it does not publish a fee or turnaround. Do not treat this legacy policy as current terms for the replacement host.
- **Representative sample:** The replacement directory has a first-party [Google AI Overviews category page](https://aeotools.mihirnaik.com/platform/google-ai-overviews) with listings including Wellows, Profound, and Scrunch AI. The page text is available from an older crawl; the new-host product detail page could not be fetched during this check.
- **Link treatment:** The category page exposes destinations such as `wellows.com`, but the reader did not expose the external anchor HTML or `rel` tokens. No official dofollow/nofollow policy was found.
- **Old domain status:** The legacy [aeotools.space](https://www.aeotools.space/) root and its old [submit-tool path](https://www.aeotools.space/submit-tool) now show a domain parking page. Do not link makers to the legacy form.
- **Decision reason:** Keep it on hold until the current replacement host and form can be opened and its fee, timing, eligibility, and link behavior can be checked.
- **Sources:** [Owner homepage](https://www.mihirnaik.com/), [replacement directory](https://aeotools.mihirnaik.com/), [replacement submit path](https://aeotools.mihirnaik.com/submit-tool), [replacement category sample](https://aeotools.mihirnaik.com/platform/google-ai-overviews), [legacy privacy policy](https://www.aeotools.space/privacy), [legacy domain](https://www.aeotools.space/).

## Selljam - Hold

- **What it is:** A current curated AI tools directory for ecommerce sellers, digital creators, service businesses, and other online sellers. Its [tools page](https://selljam.ai/tools) describes a hand-picked collection for ecommerce, digital products, and workflow automation.
- **How to submit:** I found no maker submission form or instructions on the [homepage](https://selljam.ai/), [tools page](https://selljam.ai/tools), [About page](https://selljam.ai/about), or [Terms & Conditions](https://selljam.ai/conditions). The current navigation covers tools, suppliers, services, learning, articles, and its toolkit, but no submit/list action. The footer's Contact link resolved back to the homepage in this reader, so no working submission route was verified.
- **Submission cost vs. ads:** No listing price or advertising/featured-placement price was published in the pages checked. “Featured Tools” is a content label; without an official sales page, do not treat it as a paid ad package.
- **Review time and eligibility:** The directory calls itself curated and names seller-focused tool categories, but it does not publish maker-submission criteria or a review estimate.
- **Representative sample:** [Anchor Browser](https://selljam.ai/tools/anchor-browser) is a current public tool profile with categories, description, features, and a “View Website” link.
- **Link treatment:** The “View Website” anchor points to `https://anchorbrowser.com/` and has `rel="noopener noreferrer"` only, so it is follow in this sample. Following it redirects to `anchorbrowser.io`.
- **Decision reason:** Hold. The directory is relevant to online sellers, but there is no verified action for a maker to submit or start a listing.
- **Sources:** [Homepage](https://selljam.ai/), [tools directory](https://selljam.ai/tools), [About](https://selljam.ai/about), [Terms](https://selljam.ai/conditions), [Anchor Browser sample](https://selljam.ai/tools/anchor-browser), [sample destination after redirect](https://anchorbrowser.io/).

## Follow-up summary

- **Include:** NextBigWhat, using its current $39/$79 one-time plans and 24-hour target. A follow link was observed on the current JustReviews sample; do not repeat the old site-wide dofollow claim.
- **Hold:** YourStory, IndieExtensions, ExtensionBoss, AEO Tools Space, and Selljam for the reasons above.
- **Exclude:** None. I could not prove a service was closed, and the remaining evidence does not prove a site is outside the catalogue's scope.
- The parent's direct browser checks were run on 2026-09-29. They provide sample-specific link observations only; they do not establish a site-wide policy.
