# Research: Ad network requirements checker

Route: /ad-network-requirements-checker
Checked: 2026-10-23
Evidence base: 44 network profiles in [recommendation-profiles-a.json](../ad-networks/recommendation-profiles-a.json) and [recommendation-profiles-b.json](../ad-networks/recommendation-profiles-b.json), with one research note per network in [../ad-networks/research/](../ad-networks/research/)
Competitors used: 6

This file replaces the earlier strict-checker research. The owner rejected a tool that graded every network against every published rule and returned mostly "can't tell". The job now is a short, estimated list of where to apply, built from published rules, reported outcomes, and clearly marked editorial judgment. The scoring model is in [recommendation-model.md](recommendation-model.md). The product contract is in [tool-spec.md](tool-spec.md).

## Who uses it

| Group | Rough share | What they know offhand | Their questions, in their words |
| --- | --- | --- | --- |
| Solo bloggers and small site owners | Most | Niche, one monthly traffic number, rough site age, maybe AdSense earnings | "What can I use at 8k traffic?" "Can I join Mediavine at 40k pageviews?" "Is Journey easier than Raptive?" |
| Growing publishers ready to switch | Some | Pageviews and sessions from GA4, Tier 1 share, current network and monthly ad revenue | "I'm on Journey, what's next?" "Raptive or Mediavine at 120k?" "Is Playwire worth it at 300k for a gaming site?" |
| Larger operators | Few | Country split, own Google Ad Manager, revenue by month | "Which managed partners take a 2M pageview site with mostly Asian traffic?" "Who can run header bidding on my own GAM?" |

What they want is a decision: where to apply first, what fits after that, and what to grow toward. They don't want 44 rows of checks. They accept an estimate if it's honest about being one.

What they can't easily supply: unique organic visitors by country for a 30-day window, the previous calendar year's ad revenue for one site, invalid traffic rates, or three months of pageview history. Networks ask for these during review. The tool shouldn't make people dig them up before they get a useful answer.

Forum examples that show the real question:

- [8k monthly traffic, 60% Tier 1, waiting on Journey](https://www.reddit.com/r/Blogging/comments/1r8psq0/best-ad-network-for-small-publishers-8k-traffic/): replies mix sessions and pageviews, and repeat Ezoic's old "no minimum".
- [33k-pageview game site after an AdSense rejection](https://www.reddit.com/r/adops/comments/1wlchl3/adsense-alternatives-for-a-game-website-with-33k/): niche and site type decide more than raw traffic.
- [Journey vs Raptive in 2026](https://www.reddit.com/r/Blogging/comments/1rta0d1/journeymediavine_vs_raptive_2026/): people compare upgrade paths, not single rules.

## Search intent

| Query | What the searcher wants | What current results miss |
| --- | --- | --- |
| ad networks for small sites / 8k traffic | A short list they can apply to now | "Traffic" is vague, and old no-minimum claims (Ezoic) keep circulating. |
| can I join Mediavine at 40k pageviews | A yes, a no, or the next step | Mediavine Official counts last calendar year's ad revenue, and Journey is a separate path with its own bar. |
| Raptive vs Mediavine requirements | Which one to apply to first | Pages still list Raptive at 100k and Mediavine at 50k sessions. |
| best ad network for gaming / tech / food site | Niche fit | Most lists are written for lifestyle blogs. |
| what's after Journey / AdSense alternatives | An upgrade path from where they are | Lists ignore the network the reader already uses. |
| ad network requirements checker | A quick tool | The two live tools cover few networks or use stale rules. |

### Search words

Checked 2026-10-22 for "ad network requirements checker", re-read 2026-10-23.

- Main phrase: ad network requirements checker. Close variants: "ad network qualification checker", "which ad network should I join".
- Words top titles add: free, requirements, 2026, best, small sites, and brand names (Mediavine, Raptive, Ezoic, Journey).
- Questions: traffic minimums for the main networks, which networks take small sites, how many sessions Mediavine needs, whether Raptive counts pageviews or sessions, whether Journey is easier than Mediavine.
- The gap: titles promise current requirements and deliver old numbers, mix sessions and pageviews, skip geography, and never say what to do next.

## User problems

| Problem | Evidence | What it means for the tool |
| --- | --- | --- |
| People know one number and aren't sure what it measures | 8k thread above | Take pageviews and visits or sessions separately, let either be blank, and estimate the other with a stated range. |
| Old thresholds get repeated | Ezoic "no minimum" in replies, Raptive 100k in 2025 roundups | Use current official facts with check dates. |
| Meeting a number doesn't mean approval | [AdPushup's own list](https://www.adpushup.com/blog/best-ad-networks-for-small-publishers/) warns of rejections; Newor rejected sites already on AdSense and Journey | Use fit words such as "Good fit" and "Worth a try", never "approved" or "eligible". |
| The current network shapes the next move | Journey to Mediavine, AdSense to Journey or Monumetric, Raptive to premium networks | Use the current network for upgrade paths, step-down filtering, and conflicts. |
| Niche decides more than traffic for some networks | Gaming sites go to NitroPay, Playwire, Venatus; dev sites to Carbon and EthicalAds | Niche is a ranking factor and, for specialists, a filter. |

## What the evidence covers

44 profiles, all checked 2026-10-22 or 2026-10-23. Each has official requirements as structured rules, reported publisher outcomes, an editorial inference with a confidence level, and the sources behind each claim.

| Measure | Count |
| --- | --- |
| Profiles | 44: 42 current tracked brands and 2 legacy brands (PubNation, PubGalaxy) |
| Research roles | 20 primary, 13 infrastructure, 8 supplemental, 3 sales collectives |
| Researcher confidence | 16 high, 12 medium, 16 low |
| Reported publisher outcomes | 51, of which 32 state a traffic figure |
| Sources | About 230, mostly official pages, then publisher forums and firsthand posts, then vendor case studies |

"42 current tracked brands" doesn't mean 42 open doors. Several are invite-only, curated, or sales-led (Carbon, Amazon Publisher Services, Concert), so don't write that 42 networks accept new publishers.

Snigel has a research note but no profile. It merged into Publisher Collective in February 2025, and the directory lists the combined company. The tool treats "Snigel" as a current-network alias for Publisher Collective.

## Published bars and practical fit, by network

"Published" means the network's own page states it. "Reported" means publisher posts or vendor cases. "Editorial" means our judgment from positioning, products, and reports, used only to rank. Editorial numbers never show as a requirement. The exact priors the model uses are in [recommendation-model.md](recommendation-model.md#network-priors).

### Open or entry-level

| Network | Published bar | Practical fit and notes | Confidence |
| --- | --- | --- | --- |
| Google AdSense | No traffic or age number in the eligibility checklist. Applicant 18+, supported country, original policy-compliant content. | The default first step for new and small sites. Reports show very young sites rejected, so content depth matters more than traffic. Less useful once a site qualifies for managed networks. | High |
| Journey by Mediavine | At least 1,000 sessions from Journey's Tier 1 countries in 30 days. Grow must run 30 days. Good Google standing. | The clearest entry managed path for lifestyle-type content. Reports: accepted near 15k sessions and at 70k sessions, one in review at 4.4k. The four-month domain history comes from a getting-started guide dated 2024-04-15, so it's dated guidance, not a confirmed current gate. | Medium |
| Monumetric | Propel: 10,000 pageviews a month for 3 months in a row, at least 50% from the US, UK, Canada, or Australia, English. WordPress or Blogger, six ad slots, $99 setup fee. | Real small-blog option from 10k to 80k pageviews. Higher tiers above that. A reported personal finance blog hit 10k in month four and applied at month twelve. | High |
| Newor Media | Elevate: no published pageview number, manual review, English, own GAM, two ad units a page, exclusive. Catapult: 60,000 US pageviews a month. Premier: 420,000 US pageviews a month. | Elevate is the lowest managed door that isn't Journey, but reviewed by hand: 2026 posts show rejections around 10k sessions despite AdSense and Journey approval, and an acceptance at 40k to 60k visitors. A 2025 blog's no-floor and Tier 1 wording for non-English sites conflicts with the current FAQ. Use the current FAQ. | Medium |
| Ezoic | New sites need 250,000 monthly active users. Incubator takes a limited number of smaller sites (about 20 a month). Grandfathered sites only if they ran Ezoic before 2026-02-19 without a gap. | A realistic option near or above 250k MAU. Incubator is a real but limited route, so it's named in the detail rather than ranked by default. | High |
| Infolinks | No minimum. Every site reviewed. A 2015 agreement has a 24-month prior-termination clause the current help page doesn't repeat. | Low-bar extra income beside display ads, not a main network. | Medium |
| Revcontent | No traffic minimum. Human review of each account and domain. | Native widget test for a small site. Not a display replacement. | Medium |
| PubFuture | Official FAQ: at least 100,000 pageviews a month, content safe for ads (no nudity), ads.txt lines. Net 30. | Primary option at 100k pageviews, with the clearest fit for H5 and gaming sites. Evidence for general blogs is thin. The H5 case study is no longer the basis for the number; the FAQ is. | Medium |

### Mid-size managed networks

| Network | Published bar | Practical fit and notes | Confidence |
| --- | --- | --- | --- |
| Raptive | 25,000 pageviews a month. At 25k to 99,999 pageviews, at least 50% from the US, UK, Canada, New Zealand, Australia. At 100k and up, 40%. Domain at least 6 months old. Updated 2026-09-26. | The most common next step for lifestyle content once a site clears these numbers. A reported gaming site was accepted at 25k views, six months after launch. | High |
| Mediavine Official | At least $5,000 of the site's ad revenue in the previous calendar year. Traffic source and location are reviewed, with no fixed share. | The tool only knows this month's revenue, which says nothing exact about last calendar year. Use it as a run-rate fit signal and tell people Mediavine reviews prior calendar-year earnings. Journey is the separate lower path. | High |
| SHE Media | 50,000 pageviews a month, at least 30% US, live at least 90 days. Wix sites ineligible. GA access for review. Smaller sites case by case. | Strong for women-focused lifestyle, food, parenting, DIY. Below 50k it's a case-by-case ask for strong niches, not a pass. | High |
| Clickio | Indicative monthly pageviews by audience: 100k for the US, UK, Canada, Australia, France; 250k Italy, Spain; 300k rest of Europe; 500k Portugal; 750k Brazil, Colombia, Mexico; 1M elsewhere. Or more than $500 ad revenue a month, which may need 3 months of proof. | One of the few published paths for European and non-Tier 1 traffic. The revenue route opens it to smaller sites with real earnings. | High |
| The Moneytizer | At least 300,000 unique visitors from organic traffic in the 30 days before registration, from the US, UK, and Canada (US criteria page). Own domain, server access, enough content. Wix and Jimdo excluded. | The measure can't be read from pageviews or sessions. The tool estimates a range from scale and Tier 1 share, and at most suggests it's worth a try. | High (rule), low (estimate) |
| Refinery89 | No published number. Intake form asks pageview band and country. €250 payout floor is not an entry rule. | Contact-led managed partner, stronger in Europe and local news or lifestyle. | Low |
| NitroPay | Manual review of traffic amount, geography, and content. No published number. | Gaming has the clearest fit (a 600k-pageview gaming download site reported serving with it). Editorial prior only. | Medium |
| PubPower | Help page last updated about three years ago says around 100,000 visitors a month. | Dated guidance. Anime and entertainment reports. Worth asking near that scale. | Low |

### Premium managed and sales collectives

| Network | Published bar | Practical fit and notes | Confidence |
| --- | --- | --- | --- |
| Playwire | FAQ: 500,000 monthly website pageviews (or 1,000 app DAU). Qualification page: publishers typically apply from 100,000 pageviews for full ROI. IVT at most 7%. 20% US tied to higher revenue, not a gate. | Two official numbers for two purposes. 500k is the stated requirement. 100k to 500k is a reasonable conversation, not a pass. The FAQ says its script can't run alongside AdSense or Ad Exchange tags. That doesn't establish a ban on every other provider, so the model treats it as a replacement, not a blanket conflict. | Medium |
| Freestar | At least 50% traffic from the US, UK, Canada, New Zealand, Australia. At least 50% organic. Typical publisher averages 1M pageviews a month, which is not a minimum. | Our editorial floor is 300k pageviews, kept apart from Freestar's typical 1M. It fits from there when both 50% checks pass. Reports include smaller publishers at 1M to 2M ad impressions. | Medium |
| Publift | More than $2,000 ad revenue a month is the main measure. 500,000 pageviews is a secondary signal. Fast-growing smaller sites can ask. Checked 2026-10-08 article. | Revenue-led. A gaming site at 1.4M pageviews reported a Publift forecast. | High |
| Publisher Collective | Core genres (tech, gaming, hobbies, education, sports, health) reviewed individually. Other niches need at least 3M pageviews. About €300 a day revenue is a flexible signal. | Selective and hands-on. Good fit for core-genre sites with meaningful scale. Includes Snigel since 2025. | High |
| Snack Media | No general traffic minimum. 1M impressions applies to the referral program only. | Sports and sports communities. Sales-led. | Medium |
| Venatus | No published number. Human content audit. | Gaming, sports, entertainment publishers with real scale. | Low |
| Adnimation | Standard service: "substantial traffic". MAP: no pageview minimum, every site reviewed. | A historical interview put its sweet spot at 1M to 20M monthly visitors. MAP is a smaller-site route with thin evidence. | Low |
| Concert | No open application or current publisher requirements. | Curated, invite-led marketplace for established media groups. Not a routine application. | Low |

### Add alongside your main network

| Network | Published bar | Practical fit and notes | Confidence |
| --- | --- | --- | --- |
| MGID | 3,000 unique visitors a day or 90,000 visitors a month, plus 10 current articles. | Native widget beside display. Official materials say AdSense can run with it. | High |
| Sovrn | More than 100,000 visits a month (strictly more), content updated in the last 4 months, not child-directed. Commerce is a separate product. | Extra programmatic demand above the visit floor. The coordinator opened the complete official approval page on 2026-10-23 and confirmed these rules. | High |
| EthicalAds | 50,000 pageviews a month for developer-focused sites. Fast-growing close-fit sites may get exceptions. One ad per page. | Developer sites only. Can sit beside other ads on separate pages. | Medium |
| Taboola | No number in the new-account guide. Applicant 18+. Exclusive against other recommendation widgets. | Established content sites. Old 500k to 1M claims are not policy. | Medium |
| Teads | No published number. Sales-led. | Premium editorial or video inventory at scale. | Low |
| Amazon Publisher Services | Invitation only, direct or exclusive representation, Google Ad Manager. | Header-bidding demand for large sites with their own GAM. A 45M US pageview applicant reported no reply after three weeks. | Medium |

### Runs on your own ad setup

These are yield and ad-tech services. They help sites that already run Google Ad Manager or have meaningful revenue. They aren't where a small blog starts.

| Network | Published bar | Practical fit and notes | Confidence |
| --- | --- | --- | --- |
| MonetizeMore PubGuru Premium | $5,000 ad revenue a month or 2,000,000 pageviews a month. Product-specific. | Clear published bar for larger sites. | High |
| Setupad | Self-Serve: 10M visits and up, with Business (10M to 50M) and Enterprise (50M+) plans. Managed: older pages say about 100k visits or sessions, with mixed units. | Self-Serve and managed are separate offers. Never apply the 10M floor to managed. | High (Self-Serve), low (managed) |
| AdPushup | A 2025 vendor article mentions $3,000 a month. Onboarding doesn't confirm it. | Soft signal only. | Low |
| Adapex | No number. Intake asks monthly revenue, pageviews, US share. GAM through MCM. | Mid-sized publishers with an existing stack. | Low |
| Aditude | No number. Demo-led. | Enterprise publishers with ad ops staff. | Low |
| AnyMind AnyManager | No number. Contact-led. | Asia-Pacific web and app publishers. | Low |
| Geniee SSP | No number. Signup form, tags. | Japan and Asia-Pacific media. | Low |
| Media.net | No number. Mostly organic traffic, ads.txt. Agreement limits similar competing ads. | Contextual and managed Prebid. Small-site evidence is thin. | Low |
| Opti Digital | No general number. Referral rules are not entry rules. | GAM publishers wanting managed yield, stronger in Europe. | Low |
| Publir | Pricing lists no traffic limit. No full admission checklist. | Depends on the module needed (subscriptions, adblock recovery, programmatic). | Low |
| Sparteo | No public criteria. | Education and reference publishers with operations needs. | Low |

### Legacy brands, not recommended

| Brand | Status | How the tool treats it |
| --- | --- | --- |
| PubNation | Migrated into Mediavine. Mediavine Help Center says migration is complete. | Never recommended. As a current network it means Mediavine. Directory history stays. |
| PubGalaxy | Azerion moved publisher supply into Improve Digital on 2026-09-23. | Never recommended. As a current network it's a legacy managed account. Improve Digital isn't in the directory, so the tool doesn't suggest it. |

## Conflicts and dated rules

These are where sources disagree or have aged. The model handles each one; the page doesn't need long disclaimers.

| Network | Conflict | What the model does |
| --- | --- | --- |
| Playwire | FAQ 500k pageviews vs qualification page 100k "apply for ROI" | 500k ranks as its stated requirement. 100k to 500k ranks lower, as apply guidance. |
| Journey | 1,000 Tier 1 sessions is current. Four months of domain history is from a 2024 guide. | Sessions are the scale rule. Age is a soft factor. |
| Newor | Current FAQ says English for Elevate; a 2025 blog suggests non-English sites with 50% Tier 1 | Current FAQ wins. The tool doesn't ask language, so English shows in Newor's detail as an extra need. |
| Setupad | Self-Serve 10M visits vs older managed ~100k with mixed units | Two programs on one card, picked by scale. Managed uses an editorial prior. |
| Ezoic | Old "no minimum" in forums vs 250k MAU now | 250k MAU ranks. Limited Incubator is named in the detail. |
| Mediavine | Previous calendar year revenue vs the monthly figure people know | Monthly revenue is a run-rate fit signal only. The tool never estimates last year's income. |
| The Moneytizer | Organic unique visitors from 3 countries vs the pageviews people know | Range estimate. Never confirmed. Suggest asking when the high end clears 300k. |
| PubFuture | Earlier research used a case study; the official FAQ states 100k pageviews | FAQ number is the bar. |
| Sovrn, PubFuture pay | Earlier research relied on search snippets | Complete sources were opened on 2026-10-23. Sovrn's visit rule and PubFuture's Net 30 are confirmed; PubFuture's unreconfirmed $50 minimum and payment methods were removed. |
| Publisher Collective | €300 a day is a flexible signal | Shown as guidance in euros, never converted. Ranking uses our own $9,000 a month scale level for core genres. Outside core genres, 3M pageviews is mandatory and no route gets around it. |

## Peer data: what stack127 can honestly add

Development data check, 2026-10-23: a read-only grouped query found 619 network–niche cohorts with confirmed sites. Of these, 382 have at least five distinct sites, covering 38 of the 44 tracked networks. Food has usable cohorts for 17 networks, gaming 30, and tech 32. Concert, EthicalAds, Media.net, Publir, SHE Media, and Sovrn have no cohort reaching five in this development snapshot. The model must work without a peer contribution for those cases. These counts describe detected use, not applications or acceptance rates, and the build will load fresh counts.

Stack127 tracks sites with confirmed network relationships. Each tracked site has a niche and a Chrome popularity group (top 1k, 10k, 100k, 1M, or not ranked) from the monthly CrUX top list ([traffic.mjs](../../scripts/ad-networks/traffic.mjs)).

- A popularity group is a rank band from Chrome usage. It isn't monthly pageviews, sessions, revenue, or geography. Never convert it.
- "Similar sites" means confirmed sites in the same niche. This version doesn't ask for a site address, so there's no popularity-group match.
- Counts show which networks sites in a niche really use. That's a fair ranking nudge, not proof a site will be accepted.
- Small cohorts mean nothing. Under 5 confirmed sites, the peer signal is left out, not filled in.
- The development coverage check above establishes that peers are available unevenly. Refresh the counts at build time.

## Competitor reviews

The two live checkers were tested with a normal case, a boundary case, and a bad input on 2026-10-22. Four static guides were checked against current rules.

| Competitor | What it does | Where it fails |
| --- | --- | --- |
| [PubSignal checker](https://pubsignal.in/tools/ad-network-requirements-checker) | Pageviews, one Tier 1 share, monthly revenue, domain age. Four networks. Figures dated 2026-09-30. | Treats estimates as exact passes: Journey sessions = pageviews × Tier 1, Mediavine = month × 12 including affiliate income. Only four networks. |
| [Kamal Deen checker](https://kamaldeen.com/tools/ad-network-checker) | Sessions, optional pageviews, language, US share. Broad table. | Rules "as of 2025": Raptive at 100k sessions, Ezoic no minimum. Accepts -100 sessions. |
| [AdPushup small-publisher list](https://www.adpushup.com/blog/best-ad-networks-for-small-publishers/) | 2025 editorial list | Raptive 100k, SHE 20k, Sovrn no minimum: all stale. |
| [This Week in Blogging](https://thisweekinblogging.com/ad-network-entry-requirements/) | Static guide, updated 2025-10-29 | SHE at 20k. Blurs Journey and Mediavine Official. |
| [IMC guide](https://imc.ad/the-complete-guide-to-ad-network-requirements-adsense-mediavine-adthrive-more) | Static vendor guide, 2025-09-05 | Mediavine 50k sessions, Raptive 100k. One Tier 1 share for every network. |
| [Adskeeper guide](https://www.adskeeper.com/blog/for-publishers/best-ad-networks-for-small-publishers/) | Current 2026 guide | Good advice to match units, but no tool and no per-network sources. |

None of them answer "where should I apply first, given where I am now?" None use the current network, and none rank.

## How stack127 can win

- A short ranked list, 3 to 5 places to apply, each with one short reason and an Apply link. Extra options and growth targets sit in one closed section.
- Current published facts for 42 tracked brands, with check dates, and the two legacy brands handled.
- Honest estimates: the whole result is labeled as one, statuses are Good fit, Worth a try, and Growth target, and nothing claims approval or confirmed eligibility. Pageviews and sessions stay separate, and conversions use editorial ranges.
- Upgrade paths from the current network (Journey to Mediavine, AdSense to Monumetric or Raptive), and no step-downs for sites already on a bigger network.
- Clear lanes: replace your ads, add alongside, or run on your own ad setup.
- Real tracked sites in the same niche, counted only when the cohort is big enough.
- Growth targets that tell a small site which published bar to grow toward.

## Blockers

- Peer coverage was checked in development. Counts still refresh at build time, and the model works without peers.
- Complete Sovrn approval guidance and PubFuture's JavaScript-rendered FAQ were checked on 2026-10-23. PubFuture's payment minimum and methods remain unconfirmed; Net 30 is verified.
- The editorial priors in [recommendation-model.md](recommendation-model.md) are judgment, not measurement. Recheck them when profiles change.
- Rules change often. Each profile's `checkedAt` must mean the date the source was re-read.

## Sources

Every network claim above is sourced in its profile's `sources` list and its note in [../ad-networks/research/](../ad-networks/research/). The main official pages:

- [Mediavine application requirements](https://www.mediavine.com/application-requirements/), [Publisher Path](https://help.mediavine.com/programs-and-the-publisher-path-to-growth), [Journey getting started](https://www.journeymv.com/getting-started-with-journey-by-mediavine/)
- [Raptive eligibility](https://help.raptive.com/hc/en-us/articles/360032840891-Who-is-eligible-for-Raptive)
- [SHE Media partner FAQs](https://www.shemedia.com/partner-network/faqs), [SHE Media application](https://apply.shemedia.com/)
- [Monumetric requirements](https://www.monumetric.com/what-are-the-requirements-to-work-with-monumetric/), [program overview](https://www.monumetric.com/monumetric-program-overview/)
- [Newor Media programs](https://newormedia.com/programs)
- [Ezoic requirements](https://support.ezoic.com/kb/article/getting-started-ezoics-requirements?id=getting-started-ezoics-requirements&lang=es-ES)
- [Playwire FAQ](https://www.playwire.com/faq), [qualification criteria](https://www.playwire.com/qualification-criteria)
- [Freestar publisher quality requirements](https://freestar.com/publisher-quality-requirements/)
- [Publift requirements](https://www.publift.com/blog/publift-requirements)
- [Publisher Collective FAQ](https://www.publisher-collective.com/faq)
- [Clickio entry standards](https://docs.clickio.com/books/clickio-entry-standards/page/clickio-entry-standards)
- [The Moneytizer validation criteria](https://us.themoneytizer.com/faq/validation-criteria)
- [PubFuture](https://pubfuture.com/home) FAQ, read by the coordinator 2026-10-23
- [MGID publisher help](https://help.mgid.com/publishers-general-information), [Sovrn approval requirements](https://knowledge.sovrn.com/kb/what-is-required-for-sovrn-to-approve-my-property), [EthicalAds FAQ](https://www.ethicalads.io/publishers/faq/), [Carbon FAQ](https://www.carbonads.net/faq)
- [AdSense eligibility](https://support.google.com/adsense/answer/9724?hl=en), [Infolinks eligibility](https://sites0001.infolinks.com/support/quality/what-are-the-eligibility-criteria-for-my-site-to-qualify-with-infolinks), [Revcontent account help](https://help.revcontent.com/knowledge/creating-a-revcontent-publisher-account), [Taboola new account](https://pubhelp.taboola.com/hc/en-us/articles/39280014062487-How-To-Get-New-Account)
- [PubGuru Premium](https://www.monetizemore.com/solutions/pubguru-premium/), [Setupad Self-Serve](https://setupad.com/setupad-self-serve/)
- [Google Analytics session definition](https://support.google.com/analytics/answer/1257084?hl=en), [CrUX methodology](https://developer.chrome.com/docs/crux/methodology#license)
