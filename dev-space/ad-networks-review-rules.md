# Review links with an ads.txt system line

Scope: relationships with status needs_review and verification method discovery_hint_and_ads_txt_system. These rows started with a network seller-list lead and the publisher's own ads.txt containing that network's seller-system line, without a matching MANAGERDOMAIN. Read-only review on 2026-10-16 found 6,188 rows across 33 networks.

These thresholds follow the [project evidence rules](../content_docs/ad-networks/plan.md).

## Rules

| First-party evidence now | Decision |
| --- | --- |
| A fresh, successfully parsed publisher ads.txt still has the network's exact system, seller ID and seller type, and the publisher homepage has a current, distinctive tag or configuration for that network. | Confirm as active_network_use, with the matching page signature and ads.txt line in the evidence. Never label this cohort “managed by.” A shared ad wrapper, the seller-list row, or the ads.txt line by itself is not a distinctive tag. |
| The publisher ads.txt has the line, but no distinctive current tag or configuration is found. | Keep needs_review. This includes both DIRECT and RESELLER rows. An ads.txt seller line authorizes selling; it does not prove active network use. |
| The publisher ads.txt names a different MANAGERDOMAIN while the reviewed network's seller line remains. | Keep this network link in needs_review. A different manager does not prove or disprove that this network is active. Do not promote it to manager. |
| A current MANAGERDOMAIN names this network. | Route to the separate manager-evidence path for review. Do not let this cohort write a manager relationship. |
| One valid, fully parsed publisher ads.txt no longer contains the network line. | Keep under review and schedule another check at least 48 hours later. Do not count 403, 404, timeout, 5xx, parser failure, or a blank/error page as a valid absence. |
| A second valid absence occurs at least 48 hours after the first. | Keep unresolved and recheck. If the common lifecycle marks it stale, count it as kept, not dropped. |
| A third valid absence spans at least seven days from the first. | Drop the candidate link from current review, retaining its evidence and publisher record. If the store needs a terminal status, use ended with first_confirmed_at still null. |
| The seller-list row disappears, the site is blocked, or a homepage cannot be read. | Keep under review. Source disappearance or a fetch failure is not evidence that the publisher stopped using a network. |

An exact ads.txt match means the mapped system domain and seller ID match the stored signal after normalizing case and whitespace. Preserve DIRECT or RESELLER as evidence, but do not use that field alone to decide active use. A 304 response counts only when the stored parsed body and hash identify the same current file.

## Sample and estimate

The read-only query selected three rows per network, or all rows when fewer than three existed: 98 records across all 33 networks. Every sampled row's latest stored fetch was a successful 200 or 304. A live browser check of eight sites across eight networks found the exact stored line still present in all eight: stylecraze.com, nashobavalleyvoice.com, filmibeat.com, a2zwordfinder.com, francetraveltips.com, techraptor.net, appnerve.com and stylepersuit.com. Appnerve's line is RESELLER. Techraptor's current ads.txt also declares Mediavine as manager while retaining the Sovrn line. This is why a system line cannot become a manager claim.

The sample did not test distinctive homepage tags across the cohort, so it cannot estimate how many will pass the separate tag check. The conservative immediate estimate from the evidence reviewed is zero new confirmations and zero drops. Keep the rows pending until a tag is verified or the repeated-absence rule is met.

| Network | Rows | Confirm as uses | Keep in review | Drop now |
| --- | ---: | ---: | ---: | ---: |
| AdPushup | 403 | 0 | 403 | 0 |
| Adapex | 369 | 0 | 369 | 0 |
| Aditude | 21 | 0 | 21 | 0 |
| Adnimation | 127 | 0 | 127 | 0 |
| AnyMind / AnyManager | 143 | 0 | 143 | 0 |
| Clickio | 83 | 0 | 83 | 0 |
| Concert | 42 | 0 | 42 | 0 |
| Ezoic | 84 | 0 | 84 | 0 |
| Freestar | 17 | 0 | 17 | 0 |
| Infolinks | 472 | 0 | 472 | 0 |
| Journey by Mediavine | 3 | 0 | 3 | 0 |
| MGID | 187 | 0 | 187 | 0 |
| Media.net | 471 | 0 | 471 | 0 |
| Mediavine | 4 | 0 | 4 | 0 |
| Monumetric | 2 | 0 | 2 | 0 |
| Newor Media | 17 | 0 | 17 | 0 |
| NitroPay | 13 | 0 | 13 | 0 |
| Opti Digital | 77 | 0 | 77 | 0 |
| Playwire | 56 | 0 | 56 | 0 |
| PubGalaxy | 190 | 0 | 190 | 0 |
| PubPower | 106 | 0 | 106 | 0 |
| Publift | 145 | 0 | 145 | 0 |
| Publisher Collective | 19 | 0 | 19 | 0 |
| Raptive | 5 | 0 | 5 | 0 |
| Refinery89 | 25 | 0 | 25 | 0 |
| SHE Media | 1,026 | 0 | 1,026 | 0 |
| Setupad | 91 | 0 | 91 | 0 |
| Snack Media | 88 | 0 | 88 | 0 |
| Sovrn | 1,059 | 0 | 1,059 | 0 |
| Sparteo | 12 | 0 | 12 | 0 |
| Taboola | 236 | 0 | 236 | 0 |
| Teads | 541 | 0 | 541 | 0 |
| Venatus | 54 | 0 | 54 | 0 |
| Total | 6,188 | 0 | 6,188 | 0 |
