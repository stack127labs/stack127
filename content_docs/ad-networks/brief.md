# Ad network directory brief

The reader wants to find an ad network and see which publisher websites currently have a verified relationship with it. The parent directory lists the reviewed network roster. Each network page lists confirmed publisher domains with a precise relationship label and last checked date.

The draft has 45 network identities and uses `/ad-networks` and `/ad-networks/<slug>`, plus `/ad-networks/niches`, `/ad-networks/niches/<niche>`, `/ad-networks/stats`, and the `/ad-network-checker` tool. See [plan.md](plan.md). Search and pagination stay on these routes through query parameters. Candidate domains and ambiguous matches never appear in the public list. Empty network pages explain that no sites have been verified yet. The pages remain unpublished in `stack127_pages` until the data collection and verification work has been reviewed.

The source of truth is the three table model in [plan.md](plan.md): network identity, globally deduplicated publisher domain, and a separate verified relationship. A discovery source is a lead, not proof of network use. The relationship row provides the evidence for a public claim. Niche, platform, domain age, and traffic group come from later data runs. Until a run fills a field, the page says "Not listed". The pages make no earnings claims.

## Current release boundary

The parent and 45 child registry rows remain unpublished in development and production. Shipping their code, identity data, and docs does not launch the directory. The managed publisher and relationship tables remain empty; the independent homelab SQLite queue is preserved.

The two GitHub discovery and verification workflows are manual previews. They have no schedules and run without `--apply`, so they do not save candidates or verification results. Enabling production writes, copying reviewed SQLite results, scheduling production refreshes, and publishing pages each need a separate activation review.

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
