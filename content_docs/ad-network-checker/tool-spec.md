# Ad network checker: tool spec

Route: `/ad-network-checker`. Family: `tool`. Primary catalog: Domain tools, for now. A Publisher tools catalog comes later. Research: [research.md](research.md). Design: `dev-space/ad-networks-mockups/site.html`. Why there are no per-site pages: `dev-space/ad-networks-build-plan.md`.

## People and questions

Most people are bloggers and small publishers sizing up an ad network, plus site buyers. They bring three questions:

1. Which ad network does this site use?
2. Does a network manage its ads, and since when?
3. Which similar sites use the same network?

Basic is one field: the site. Nothing else changes the answer, so there is no Advanced section. Pros get the depth in the result itself: the ads.txt summary, every network with its status and dates, and a link to the raw file.

Left out:

- A live scan of sites we haven't checked. The answer comes from our verifier, which reads ads.txt on a schedule and keeps history. A one-off scan in the browser would skip the checks that stop false positives.
- Traffic, revenue, and authority estimates. We have no source we trust. Fields show `Not listed` until the data runs fill them.

## Inputs

| Input | Rules |
| --- | --- |
| Website, required | A bare domain or any URL. Trim, lowercase, drop the scheme, path, query, port, trailing dot, and a leading `www.`. Must have a dot, labels of letters, digits, and hyphens, 253 characters at most, and an ending of two or more letters. Unicode names are converted to punycode by the browser's URL parser. |

Example input, filled in on load: `collegefashion.net`, a confirmed Mediavine site with `MANAGERDOMAIN=mediavine.com`. Network lookups run only when the person presses the button.

Shared link: `?site=<domain>`. It fills the field and runs right away. Other parameters are ignored.

## Result

In order:

1. Site header: letter tile, the domain linking to the live site, and the date we last checked it.
2. Answer: `Managed by <network>` when the site has a `MANAGERDOMAIN` we match to a network. Otherwise `Uses <network>` (or `Uses <network> and <n> more`) for confirmed use. Otherwise `No network confirmed`.
3. Six facts: main ad network, traffic, niche, platform, domain registered, publisher. Unknown values say `Not listed`.
4. Networks table: network, role, status, first confirmed, last confirmed.
   - Role: `Manages its ads` only when the site's manager is this network. `Uses it` for other known use. `Not listed` when the type is unknown.
   - Status: `Confirmed`, `Not seen lately` (stale), `Ended`.
5. Changes we've seen: dated events from first confirmed and ended dates, oldest first. Our history starts on 26 September 2026.
6. ads.txt file: lines, companies, direct, reseller, and lines we couldn't read, a direct and reseller bar, and the companies with the most lines as a horizontal bar chart. A link opens the live `/ads.txt`.
7. Similar sites: up to six domains from the API, each one checks that site in place.
8. Check another site: a second form at the end of the result.

Copy link shares `?site=<domain>`.

## States

| State | Shows |
| --- | --- |
| Empty, before the first run | The result shape with `—` values. |
| Loading | The previous result, stepped back, with `Checking…` status. |
| Found | The full result above. |
| Not in our data | `Not in our list yet`, the domain, and a link to its `/ads.txt`. No fake facts. |
| Invalid input | Field error, focus on the field, last result stays stepped back. |
| Error | `Couldn't check this site`, with Try again. |

## Words

- Button: `Check site`. Label: `Website`. Hint: `A domain or any page address on the site.`
- Errors: `Enter a website.` and `Enter a domain such as example.com.`
- Never say "uses" for an ended relationship, and never "managed by" without `MANAGERDOMAIN`.

## Backend contract (Sol)

Types: `lib/ad-networks-types.ts`, `AdNetworkSiteResponse`. A cached GET endpoint under `app/api/ad-networks/` takes the normalized domain and returns `{ domain, found, site }`. 400 for a bad domain, with `{ error: { message } }`.

## Files

| Owner | Files |
| --- | --- |
| Opus | `app/(site)/(tools)/ad-network-checker/**`, this spec, research, MDX content |
| Sol | `lib/ad-networks*.ts`, `app/api/ad-networks/**`, sync scripts |

## Catalog and card

Domain tools, display order 13. Card name `Ad network checker`. Card art is still needed: a `toolSpot` showing an ads.txt file with one `MANAGERDOMAIN` line pointing to a network badge.
