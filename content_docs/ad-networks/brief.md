# Ad network directory brief

The reader wants to find an ad network and see which publisher websites currently have a verified relationship with it. The parent directory lists the reviewed network roster. Each network page lists confirmed publisher domains with a precise relationship label and last checked date.

The directory has 44 network identities and uses `/ad-networks` and `/ad-networks/<slug>`, plus `/ad-networks/niches`, `/ad-networks/niches/<niche>`, `/ad-networks/stats`, and the `/ad-network-checker` tool. See [plan.md](plan.md). Search and pagination stay on these routes through query parameters. Candidate domains and ambiguous matches never appear in the public list. Empty network pages explain that no sites have been verified yet.

The source of truth is the three table model in [plan.md](plan.md): network identity, globally deduplicated publisher domain, and a separate verified relationship. A discovery source is a lead, not proof of network use. The relationship row provides the evidence for a public claim. Until a data run fills a field, the page says "Not listed". The pages make no earnings claims.

## Current release boundary

The directory and its network pages are live in production. See [production-runbook.md](production-runbook.md) and [maintenance.md](maintenance.md) for how the data refreshes.

The October 2026 enrichment of network facts and copy, from `recommendation-profiles-a.json`, `recommendation-profiles-b.json`, and `research/<slug>.md`, is development-only until the coordinator reviews and releases it through a pull request.

## Copy plan: network pages

Checked 2026-10-22 to 2026-10-23. All 44 network pages and the parent article were rewritten in two batches of 22. PubNation (moved to Mediavine) and PubGalaxy (moved to Improve Digital) remain tracked legacy pages with no standalone application route. The other 42 profiles cover current services, including sales-led and invitation-only offers.

The problem: network pages said "Not public" over and over instead of telling a reader whom the network suits and how to approach it. The fact rows already show every published number and list what's missing, so the words do a different job.

| Part | Job | Leave out |
| --- | --- | --- |
| Intro | What this product is and who it's for, in two sentences. Distinct per network. | Numbers the header and fact rows show. |
| Joining | How to apply, with the official link, and what the review weighs: program, audience, platform, setup, dated or conflicting rules. | Lists of unpublished fields. |
| Pay | Only what the rows can't say: which program a rate covers, dated terms, conflicts between sources. | Repeating the rows. |
| Rules | Exclusivity in plain terms (site-wide, per page, or per slot), contract length, notice. | "Not public" lists. |
| Service | What the network actually does for you. | Filler when nothing is known. |
| Article | Fit, alternatives, and the few questions a reader brings, with dated first-hand reports where they help. | The generic ads.txt checker answer on every page. |

Evidence rules:

- Official facts, dated publisher reports, and editorial judgment stay separate. A report names its date and source and says it's one case.
- Never turn reports into rejection odds or thresholds. No traffic estimates without a published basis.
- Keep the network's own metric: Ezoic monthly active users, MGID daily or monthly visitors, Mediavine previous calendar year revenue, Monumetric three months in a row, Journey Tier 1 sessions.
- A missing number is not an easy approval. AdSense and Newor Elevate publish no traffic minimum, but both review sites.
- Keep separate products apart: Setupad managed versus Self-Serve, Adnimation managed versus MAP, Sovrn Ad Exchange versus Commerce, Playwire's FAQ rule versus its ROI guidance, and referral-program rules (Opti Digital, Snack Media) versus entry rules.
- Dated sources keep their date in the copy, such as Infolinks' 2015 agreement, AdPushup's 2021 terms, APS's 2023 fee, and Journey's April 2024 domain-history guidance.

## Search words

Checked 2026-10-20. See "Find the words first" in `stack127_docs/writing-style.md`.

| Page | Main phrase | Words top titles add | The gap |
| --- | --- | --- | --- |
| Network pages | "<network> requirements", "<network> payout", "<network> minimum traffic" | the year, "how to qualify", the minimum itself, "review", "alternatives" | Many top results still quote old minimums, such as 100,000 pageviews for Raptive, 50,000 sessions for Mediavine, or 10,000 for Ezoic. Few link the network's own page, and none show which sites run it. |
| Niche pages | "best ad networks for <niche> blogs", "<niche> websites" | best, a count (top 10), the year | Lists are opinion, often written by a network that ranks itself first, and many are from 2024. None show which networks real sites in the niche run. |
| Niches index | "ad networks by niche", "best ad networks for <niche>" | best, the niche names | No result compares niches side by side. |
| Directory home | "ad networks for publishers", "best ad networks for publishers" | best, the year, a count, "requirements", "high paying" | Vendor blogs list themselves. Requirement tables go stale and give no sources. |
| Stats | "ad network market share" | statistics, the year | W3Techs shows Google at 99% of sites, which says nothing about managed networks such as Mediavine or Raptive. |
| Checker | "which ad network does a site use", "ad network checker", "detector" | find, free, extension | Most tools are small browser extensions. Few say how they decide, or tell a listing in ads.txt from the network that runs the site. |

Questions people ask: how many pageviews does Raptive or Mediavine need, does Ezoic still take small sites, which ad network pays the most, what is the AdSense payout minimum, and which ad network does a given site use.

### Titles

- Network pages: "<Network> requirements (2026): <the main rule>". The rule is the joining minimum when the network publishes one, then its share or payout terms. Networks that publish neither lead with the sites we list. The H1 says "What it takes to join <Network>, what it pays, and N+ sites using it". Facts come from `network-facts.ts` and `research/<slug>.md`. The year goes in because these rules change.
- Niche pages: "Ad networks for <niche> blogs or sites: what N+ real ones run". The H1 asks "Which ad networks do <niche> sites use? We checked N+". The description names the networks after AdSense with the most sites in that niche.
- Counts are rounded down from the smaller of the development and production counts, with room for normal drift. Update a title when its count passes the next round number, or a network changes the rule the title names. Titles skip counts under 100, and pages with no listed sites don't mention sites.
- No title says "best". The records show which networks sites run, not which one is best for a reader.
