# Ad network checker: research

Checked 2026-10-16. Short brief for the `/ad-network-checker` tool. The ad networks section research lives in `content_docs/ad-networks/` and `dev-space/ad-networks-mockups/HANDOFF.md`.

## Who searches for this

| Person | What they want to know |
| --- | --- |
| Bloggers and site owners choosing an ad network | Which network a site like theirs uses, and which networks similar sites use. |
| Publishers checking their own site | Whether their ads.txt names the right manager, and what we see in it. |
| Site buyers and flippers | How a site makes money from ads, and since when. |
| Ad ops and sales people | Which network manages a site before they pitch it. |

## Questions people ask

- What ad network does this website use?
- Is this site on Mediavine, Raptive, or Ezoic?
- How do I find out which ad network a site uses? (View source, read `/ads.txt`.)
- What does `MANAGERDOMAIN` mean in ads.txt?
- Why does a site's ads.txt list dozens of companies?
- What's the difference between `DIRECT` and `RESELLER`?
- Which similar sites use the same network?

## Search intent

The query is a task: type a site, get an answer. People also want proof, because a list of ad companies in ads.txt is confusing. They want the one network that runs the ads, in plain words, with the line that shows it.

## Competitors

| Tool | What it does | Where it falls short |
| --- | --- | --- |
| [whichadnetwork.com](https://whichadnetwork.com/) | Search sites, networks, niches. Labels such as "Confirmed both ways". | One big table, symbols that need a legend, paid CSV. |
| [fathom.tools](https://www.fathom.tools/) | Network pages with traffic and revenue estimates. | Dense, jargon (bidders, DR), revenue guesses. |
| [Ad Network Detector, aruljohn.com](https://aruljohn.com/ad-network) | Scans a page for known ad scripts. | One live scan, no history, no ads.txt proof, no similar sites. |
| [Ad Inspector extension](https://chromewebstore.google.com/detail/einojhjhdknldenehhkieabcidohkkga) | Detects monetization on the open tab. | Needs an install, few users. |
| [adWMG ads.txt and sellers.json checker](https://chromewebstore.google.com/detail/gdmhmbejelimkohnpineofcgdigocdog) | Validates ads.txt lines on the open tab. | For ad ops, not a plain answer. |

## Facts we rely on

- `MANAGERDOMAIN` names the primary or exclusive partner that manages the site's ad inventory. [IAB ads.txt 1.1](https://iabtechlab.com/wp-content/uploads/2022/04/Ads.txt-1.1.pdf). It doesn't prove exclusivity.
- `OWNERDOMAIN` names the business that owns the site, not a network.
- An ads.txt seller line names an ad system, an account ID, and `DIRECT` or `RESELLER`. A long list usually comes from one network's partners.
- A missing line, a timeout, or a block is unknown, not proof a network left. Our verifier marks a relationship stale only after a second valid absence 48 hours or more apart, and ended after a third absence spanning seven days. See `content_docs/ad-networks/plan.md`.
- Our history starts on 2026-09-26. Dates before that aren't in our data.

## How we do better

- The answer first, in words: "Managed by Mediavine", not a list of 58 ad companies.
- "Managed by" only when the site's ads.txt has `MANAGERDOMAIN`. "Uses" for other confirmed use. "Not listed" for anything we don't know.
- The ads.txt summary, so the long list makes sense.
- Similar sites on the same network, one click away.
- No paywall, no estimates we can't back.
