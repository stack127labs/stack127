# Recommendation model: ad network requirements checker

Research: [research.md](research.md). Product contract: [tool-spec.md](tool-spec.md). Evidence: [recommendation-profiles-a.json](../ad-networks/recommendation-profiles-a.json), [recommendation-profiles-b.json](../ad-networks/recommendation-profiles-b.json).

This is the backstage model. It turns a few numbers into a short, estimated list of where to apply. The person sees one `Estimate` label on the whole result, a status per network (`Good fit`, `Worth a try`, or `Growth target`), and one short reason. Scores, weights, bases, and ranges stay backstage.

Every number in [Expected rankings](#expected-rankings) was recalculated from the rules in this file after the first arithmetic review. A fresh review is planned. If a later change to a prior moves a scenario, update the scenario in the same change and say why.

## Principles

1. **Everything is an estimate.** No status means approved, eligible, or confirmed. The strongest word is `Good fit`.
2. **Three kinds of evidence, kept apart.** Official (the network's own page), reported (publisher posts, vendor cases), editorial (our judgment). Editorial numbers rank. They never show as a requirement.
3. **Units stay separate.** Pageviews, sessions, visits, visitors, and monthly active users are different measures. Conversions use editorial ratio ranges.
4. **Small sites never see sales-led enterprise products.** Scale floors, evidence weight, access weight, and the low-evidence cap keep them down.
5. **No acceptance odds, no RPM, no earnings, no invented history.** Monthly revenue is used as it is, a current run rate. It's never turned into last year's income or derived from traffic. Revenue is never converted between currencies.
6. **Peers only when real.** Same niche, confirmed relationship, at least 5 sites. Otherwise the peer factor is left out.

## Inputs the model reads

From the [tool-spec](tool-spec.md#inputs). Everything except niche can be blank.

| Key | Meaning |
| --- | --- |
| `niche` | One of the 20 `adNetworkNiches` slugs, or `other` |
| `pageviews` | Pageviews in a typical recent month |
| `visits` + `visitsUnit` | A second traffic number and what the analytics calls it: `sessions`, `visits`, or `users` |
| `siteAge` | `lt3m`, `3to6m`, `6to12m`, `gt12m`, or blank |
| `tier1Share` | % of traffic from the US, UK, Canada, Australia, and New Zealand |
| `current` | A network slug, `snigel`, `none`, `other`, or blank |
| `adRevenueMonth` | USD ad revenue in a typical recent month |
| Advanced: `shareUS`, `shareGB`, `shareCA`, `shareAU`, `shareNZ` | Optional country split inside Tier 1 |

There are no inputs for language, site platform, Google Ad Manager, region outside Tier 1, or site address in this version. Rules that depend on those are named in a network's detail, not used to filter.

## Step 1. Estimate the measures

Each measure is an interval `[lo, hi]` with an `exact` flag. An entered value is `[v, v]`, exact.

The ratio ranges below are editorial assumptions, picked wide on purpose so the model stays careful. They aren't measured from data.

| Ratio | Range | Used for |
| --- | --- | --- |
| Pageviews per session | 1.2 to 2.0 | Pageviews from sessions, and sessions from pageviews |
| Visitors per session | 0.6 to 0.9 | Visitors and monthly active users from sessions, and sessions from users |
| US inside Tier 1 | 0.55 to 0.9 of Tier 1 | Prior for the US share |
| US, UK, Canada inside Tier 1 | 0.85 to 0.98 of Tier 1 | Prior for The Moneytizer's countries |
| New Zealand inside Tier 1 | 0 to 3 points | Prior for Monumetric's countries: [Tier 1 lo − 3, Tier 1 hi], floored at 0 |
| Organic share | 0.5 to 1.0 | The Moneytizer only |

### Countries

**Reconcile the inputs first.** Let `K` be the sum of the entered splits.

| Inputs | Tier 1 used | Validation |
| --- | --- | --- |
| All five splits, Tier 1 blank | `[K, K]`, exact | `K` ≤ 100 |
| All five splits and Tier 1 | `[K, K]`, exact. Tier 1 is normalized to `K`. | `split_mismatch` when they differ by more than 0.5 points |
| Some splits and Tier 1 | `[max(Tier 1, K), max(Tier 1, K)]`, exact | `shares_over_tier1` when `K` > Tier 1 + 0.5 |
| Some splits, Tier 1 blank | `[K, 100]`, estimated | `K` ≤ 100 |
| Tier 1 only | `[Tier 1, Tier 1]`, exact | |
| Nothing | `[0, 100]`, estimated, and flagged `noCountryInput` | |

**Feasible bounds for a set of countries.** For a set `A` (such as US, UK, Canada for The Moneytizer), take `KA` = entered shares inside `A`, the unknown countries inside `A` (`UA`) and outside it (`UB`), and the remaining Tier 1 `R` = [Tier 1 lo − K, Tier 1 hi − K], floored at 0.

| Case | Feasible share of `A` |
| --- | --- |
| No unknown countries in `A` | `[KA, KA]`, exact. This respects entered zeros. |
| Unknowns only inside `A` | `[KA + R lo, KA + R hi]`, exact when Tier 1 is exact |
| Unknowns inside and outside `A` | `[KA, KA + R hi]`, estimated |

**Then intersect with the editorial prior** when the feasible interval isn't exact. If the intersection is empty, use the feasible interval alone. A point never appears unless the inputs make it one.

| Aggregate | Set | Prior |
| --- | --- | --- |
| US share | US | Tier 1 × [0.55, 0.9] |
| Monumetric share | US, UK, Canada, Australia | [Tier 1 lo − 3, Tier 1 hi] |
| Moneytizer share | US, UK, Canada | Tier 1 × [0.85, 0.98] |

Examples:

- Tier 1 60 and UK 50, the rest blank: US feasible [0, 10], prior [33, 54], no overlap, so US is [0, 10]. Monumetric [57, 60]. Moneytizer [51, 58.8].
- US, UK, Canada 0, Australia 50, New Zealand 50: Tier 1 is 100, exact. Moneytizer share is [0, 0], exact.
- Five splits adding up to 55 with Tier 1 65: `split_mismatch`. With Tier 1 55.4: Tier 1 becomes 55.

### Traffic and revenue

| Measure | How it's built | Exact when |
| --- | --- | --- |
| Pageviews | Entered, or sessions × [1.2, 2.0] | Entered |
| Sessions | `visits` when the unit is `sessions` or `visits`. From `users`: users ÷ [0.9, 0.6]. Else pageviews ÷ [2.0, 1.2]. | Entered as sessions or visits |
| Visits (Sovrn) | Equal to sessions | Entered with unit `visits` |
| Visitors and monthly active users | `visits` when the unit is `users`, else sessions × [0.6, 0.9] | Never: an analytics user count isn't the network's visitor or MAU count |
| Tier 1 sessions in 30 days (Journey) | Sessions × Tier 1 | Never |
| US pageviews (Newor) | Pageviews × US share | Pageviews entered and US share exact |
| Organic US/UK/CA uniques in 30 days (Moneytizer) | Visitors × Moneytizer share × [0.5, 1.0] | Never |
| Ad revenue a month | Entered only | Entered |

Estimated measures never give the `published_number` basis, and detail lines say "about".

## Step 2. Pick the program

Before any filter or score, networks with several programs pick one. This fixes the program's tier for the step-down filter and for `TM`.

| Network | Rule | Tier |
| --- | --- | --- |
| Newor Media | Premier when US pageviews lo ≥ 420,000. Else Catapult when US pageviews lo ≥ 60,000. Else Elevate, including a US pageview range that only straddles 60,000. | Elevate 1, Catapult 2, Premier 3 |
| Setupad | Self-Serve when visits lo ≥ 10,000,000. Else Managed. | 3 |
| Adnimation | Standard. MAP is named in the detail only. | 3 |

Picking by `lo` keeps it deterministic: a program is chosen only when the low end clears its bar.

## Step 3. Filter out what can't apply

A network is dropped before scoring when any of these is true:

- It's a legacy brand: `pubnation`, `pubgalaxy`.
- It's the current network, or in its family. Family `mediavine` holds Journey and Mediavine Official. Current Journey drops Journey only. Current Mediavine or PubNation drops both. Current `snigel` drops Publisher Collective.
- It's niche-gated and the niche isn't allowed: Carbon (tech only), EthicalAds (tech, education).
- It's a specialist and the niche isn't one of its strong niches: NitroPay, Venatus, Snack Media.
- It's a main-lane network whose program tier is below the current network's tier (a step down). Mediavine Official is never a step down from Journey or PubNation.

**Current network tier.** The profile's tier. PubNation and PubGalaxy count as 2, `snigel` as 3. The input never names a program, so a current network with programs counts as its lowest program's tier: Newor Media 1 (Elevate), Setupad 3, Adnimation 3. This is soft on purpose. For Newor it hides only tier 0 networks and never assumes Premier from large traffic. `other`, `none`, and blank have no tier.

Language, platform, and own-GAM rules aren't filters, because the tool doesn't ask. They appear in the network's detail as "Also needs".

## Step 4. Score each remaining network

### Routes and requirements

Each network has **scale routes** and **requirements**.

- **Routes are alternatives.** Clearing any one route is enough. A route is official (`hard`, `soft`) or editorial (`editorial`, `editorial_gate`), as the priors table shows. When a network has two editorial routes, that's our own judgment of two ways a site can show scale, not an official "or". Only routes marked official in the table are official alternatives.
- **Requirements are mandatory.** Every requirement must be met: geography gates, niche gates, and Publisher Collective's 3,000,000 pageviews outside its core genres. A route can never get around a requirement.

### Scale fit `S`

For each route, with the person's interval `[lo, hi]`, floor `F`, and comfortable level `C`:

| Condition | `S` |
| --- | --- |
| Kind `none` (official no minimum) | 1.0 |
| Kind `pref` (no minimum, editorial comfortable level) | 0.5 + 0.5 × min(1, lo ÷ C). Unknown: 0.5. |
| lo ≥ C | 1.0 |
| lo ≥ F | 0.85 + 0.15 × (lo − F) ÷ (C − F) |
| hi ≥ F | 0.6 |
| hi ≥ 0.7 × F | 0.35 |
| Otherwise | 0.1 |

When a traffic measure can't be built at all: `S` is 0.5 if F ≤ 10,000, 0.35 if F ≤ 50,000, 0.2 if F ≤ 250,000, else 0.05.

**Route gate.**

| Kind | Passes when |
| --- | --- |
| `hard`, `editorial_gate` | hi ≥ F, or the traffic measure is unknown |
| `soft` | Main lane: hi ≥ 0.5 × F, or unknown. Other lanes: always. |
| `editorial`, `none`, `pref` | Always |
| Any revenue route with revenue blank | Neither passes nor fails |

- At least one route passes: the network goes on. `S` is the highest `S` among passing routes (ties: official first). That route is the deciding route.
- No route passes and at least one fails: the network fails its scale gate.
- No route passes or fails (only revenue routes, revenue blank): hidden. Not a growth target.

`editorial_gate` is Mediavine's run-rate heuristic. It's a ranking heuristic, not a requirement. A gated Mediavine becomes a growth target that shows Mediavine's own published bar.

**SHE Media case-by-case.** When its pageview route fails, pageviews lo ≥ 25,000, and the niche is strong, the route passes with `S` 0.5 and basis `review_led`.

**Starter decay.** AdSense's `S` is multiplied by 1.0 under 25,000 pageviews, 0.75 under 100,000, 0.45 under 500,000, and 0.3 above. Blank pageviews count as under 25,000.

### Geography `G`

Share requirements use one rule. With the aggregate interval `[lo, hi]` and threshold `X`:

| Case | `G` |
| --- | --- |
| `noCountryInput` | 0.6 |
| lo ≥ X | 1.0 |
| lo < X ≤ hi (straddles) | 0.7 |
| hi < X | Requirement fails |

| Network | Aggregate and threshold |
| --- | --- |
| Raptive | Tier 1 ≥ 50 when pageviews lo < 100,000, ≥ 40 from 100,000 |
| Freestar | Tier 1 ≥ 50 |
| Monumetric | Monumetric share ≥ 50 |
| SHE Media | US share ≥ 30 |

Leaning networks have no requirement:

| Leaning | `G` |
| --- | --- |
| Tier 1 (Journey, Mediavine, Carbon, EthicalAds, Playwire, Publift, Media.net) | clamp(Tier 1 lo ÷ 60, 0.3, 1.0). `noCountryInput`: 0.8. |
| Region (AnyMind, Geniee, Refinery89, Opti Digital) | 0.75, because the tool doesn't ask region |
| None | 1.0 |

### Site age `Aage`

Soft for every network. A band can't prove a domain's age, and Monumetric's 3 months in a row can't be known from one month.

| Rule | Band at or over | Band straddles | Band under | Blank |
| --- | --- | --- | --- | --- |
| Raptive 6, SHE Media 3, Journey 4, Monumetric 3 (months) | 1.0 | 0.85 | 0.5 | 0.8 |

Bands: `lt3m` 0 to 3, `3to6m` 3 to 6, `6to12m` 6 to 12, `gt12m` 12 and up. A band under the rule makes the network unlikely to make the list, but it's never a gate. Networks with an age rule never get the `published_number` basis.

### Scale tier match `TM`

`ut` comes from pageviews lo and monthly revenue, whichever gives the higher tier:

| `ut` | Pageviews lo | Or revenue a month |
| --- | --- | --- |
| 0 | under 10,000 | |
| 1 | 10,000 | |
| 2 | 50,000 | $500 |
| 3 | 250,000 | $3,000 |
| 4 | 2,000,000 | $15,000 |

Pageviews here can be estimated from visits. With pageviews and revenue both unknown, `ut` is unknown.

Main lane: `diff` = program tier − `ut`. 0 → 1.0, −1 → 0.85, +1 → 0.75, −2 or less → 0.55, +2 or more → 0.4. Other lanes and unknown `ut`: 0.8.

### Current network `Cc`

Main lane only. No current tier: 0.8. Program tier above the current tier: 1.0. Same tier: 0.7. Mediavine Official from Journey or PubNation: 1.0, flagged as an upgrade. Other lanes: 0.8.

### Peers `P`

Confirmed sites in the same niche using the network. `P` = min(1, count ÷ 20) when the count is at least 5. Under 5, `P` is left out and its weight shared out. The [expected rankings](#expected-rankings) use no peers.

### Access, evidence, niche

| Access | `A` | Evidence | `E` | Niche | `Nmult` |
| --- | --- | --- | --- | --- | --- |
| Open signup | 1.0 | High | 1.0 | Strong | 1.0 |
| Application form | 0.95 | Medium | 0.9 | Neutral | 0.92 |
| Contact or sales-led | 0.8 | Low | 0.75 | Weak | 0.75 |
| Invite only | 0.6 | | | | |

`Aeff` = 1 − (1 − A) × max(0, (3 − ut) ÷ 3). With `ut` unknown, `Aeff` = `A`. Niche `other` is neutral, except for niche-gated networks and specialists, which it drops.

### The score

```
base  = weighted average of S (0.40), TM (0.20), G (0.20), Cc (0.10), P (0.10, only when present)
score = 100 × base × E × Aeff × Aage × Nmult
```

When `E` is low and `S` < 0.85, the score is capped at 40.

### Basis and rank

| Basis | When, in order |
| --- | --- |
| `review_led` | SHE Media's case-by-case path. The Moneytizer always (when not hidden). |
| `no_minimum` | Deciding route `none` or `pref`. Newor Elevate with `S` ≥ 0.6. |
| `review_led` | Deciding route `editorial`, or Newor Elevate, with `S` ≥ 0.35 |
| hidden | `S` < 0.35 |
| `review_led` | `S` < 0.6 |
| `published_number` | Deciding route `hard`, `S` ≥ 0.85, the route's measure exact, every requirement's aggregate exact, and no age rule |
| `estimate` | Everything else (`hard`, `soft`, `editorial_gate`) |

Rank = score + 6 (`published_number`), 3 (`estimate`), 0 (`no_minimum`), −6 (`review_led`), + 8 for an upgrade, + 5 for a specialist.

## Step 5. Public status

| Status | When |
| --- | --- |
| `good_fit` | Basis isn't `review_led`, and score ≥ 70 |
| `worth_a_try` | Any other shortlisted network |
| `growth_target` | Failed its scale gate or a requirement. Shown only in the closed section. |

## Step 6. Build the result

### Main list

1. Candidates: main lane, plus own-setup networks with `S` ≥ 0.85 when the site is large (pageviews lo ≥ 1,000,000 or revenue ≥ $5,000).
2. Keep scores ≥ 45.
3. Sort by rank, then higher `E`, higher `A`, slug.
4. One card per family. Mediavine family: the first of Journey and Mediavine Official in rank order.
5. Take up to 5.
6. AdSense pin: when `current` is `none` or blank and pageviews lo is under 25,000 (or unknown), AdSense is in the list if its score is at least 45. If it isn't in the top 5, it replaces the fifth.

### Closed section: "More options"

At most 6 rows.

- **Add alongside:** supplemental lane, score ≥ 45, up to 2, in rank order. At most one native widget (MGID, Revcontent, Taboola). None when the current network is Carbon. When the current network is exclusive (Raptive, Mediavine, SHE Media, Newor, Playwire, Freestar), each row's reason is `check_contract`.
- **Runs on your own ad setup:** own-setup networks not in the main list, score ≥ 50, up to 2, only when the site is large.
- **Growth targets:** see below.

### Growth targets

Main-lane networks that passed the filters but failed a scale gate or a requirement.

**Closeness.** Each failed item gets a ratio: the person's hi ÷ the bar, capped at 1. A failed scale gate uses the best ratio among its failing routes, so an "or" counts the closer route. A network's closeness is the product of the ratios of everything it failed. Two failures multiply, so a network that fails twice ranks behind one that fails once by the same margin.

Count each distinct predicate once. After selecting the closest failed route, combine it with failed mandatory requirements and deduplicate by metric, comparator, threshold, currency, period, and country or niche scope. A program or route label alone doesn't create another predicate. Publisher Collective's 3M pageview route and its mandatory 3M rule outside core genres are the same predicate: scenario 6 contributes `600,000 / 3,000,000 = 0.20` once, not `0.20 × 0.20`.

**Selection.** Closeness at least 0.2. Sort by closeness, then lower program tier, higher `E`, slug. Take 2.

The row shows the network's published bar in its own words, with its currency and period, such as "25,000 pageviews a month", "$5,000 ad revenue in the previous calendar year", or "3,000,000 pageviews a month outside its core genres". Never "you have", never a gap.

### Lead

| Result | Lead |
| --- | --- |
| Main list has cards | `Apply to <first> first`, and the count |
| Main empty, growth targets exist | `Grow toward <first growth target> next` |
| Main and growth empty, current network set | `No clear step up from <current> right now`. More options shows any add-alongside or own-setup rows. |
| Main and growth empty, no current network | `No network stands out for these numbers yet` |

The lead never asks for more input and never says "can't tell". The suggestion line below follows its own rules.

### One input that would help most

At most one line, first match wins:

1. `adRevenueMonth`, when blank and pageviews lo ≥ 20,000 or pageviews unknown.
2. `tier1Share`, when it and every split are blank.
3. `siteAge`, when blank.
4. `pageviews`, when only visits were given.

## Network priors

All 44 profiles. Tier: 0 starter, 1 entry managed, 2 mid managed, 3 premium managed, 4 enterprise. Lane: main (replaces your ads), add (adds alongside), setup (runs on your own ad setup).

Route kinds: `hard` and `soft` are official. `editorial` and `editorial_gate` are ours. `none` is an official no minimum. `pref` is an official no minimum with an editorial comfortable level. Several routes in one cell are alternatives. "Official or" means the network itself publishes the alternative.

Lifestyle niches (`L`): food, travel, lifestyle, parenting, personal-finance, home-diy, crafts, health-fitness, beauty-fashion, gardening, pets, outdoors, education.

| Network | Lane | Tier | Access | E | Scale routes: unit F → C (kind) | Requirements | Strong niches | Weak niches | Geography | Detail notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Google AdSense | main | 0 | open | high | pageviews 0 (none) | | all neutral | | none | Starter decay, pin rule |
| Journey by Mediavine | main | 1 | form | medium | Tier 1 sessions 1,000 → 5,000 (hard) | | L | news | Tier 1 leaning | Age 4 months from dated 2024 guidance. Grow for 30 days. |
| Monumetric | main | 1 | form | high | pageviews 10,000 → 20,000 (hard) | Monumetric share ≥ 50 | personal-finance, food, travel, lifestyle, home-diy, parenting, crafts, health-fitness | | requirement | Age 3 months (history). Also needs: English, WordPress or Blogger for Propel, $99 setup. |
| Newor Media | main | by program | form | medium | Elevate: pageviews 10,000 → 40,000 (editorial). Catapult: US pageviews 60,000 → 420,000 (hard). Premier: US pageviews 420,000 → 420,000 (hard). | | | | none | Also needs: English, exclusive, Elevate own GAM |
| Carbon Ads | main | 1 | form (0.9) | medium | pageviews 20,000 → 100,000 (editorial) | Niche tech | tech | | Tier 1 leaning | Invite review. Runs alone site-wide. Also needs: English. |
| PubFuture | main | 1 | open | medium | pageviews 100,000 → 200,000 (hard, official FAQ) | | gaming | all except gaming, entertainment, education | none | Content safe for ads, ads.txt. Net 30. |
| PubPower | main | 1 | form | low | visitors 100,000 → 200,000 (soft, dated help page) | | entertainment, gaming | | none | |
| Raptive | main | 2 | form | high | pageviews 25,000 → 50,000 (hard) | Tier 1 ≥ 50 or ≥ 40 by size | food, lifestyle, home-diy, parenting, travel, crafts, personal-finance, health-fitness, beauty-fashion, gardening, pets | | requirement | Domain 6 months |
| Mediavine Official | main | 2 | form | high | revenue $420 → $700 a month (`editorial_gate`) | | L | news | Tier 1 leaning | The run rate only ranks. Mediavine's own bar, shown in detail and growth targets: $5,000 of the site's ad revenue in the previous calendar year. No claim about the site's past earnings. |
| SHE Media | main | 2 | form | high | pageviews 50,000 → 100,000 (hard) | US share ≥ 30 | lifestyle, food, parenting, home-diy, beauty-fashion, health-fitness, crafts, travel | gaming, tech, automotive, sports, news, business | requirement | Live 90 days. Case-by-case path. Also needs: not Wix, GA access. |
| Ezoic | main | 2 | open | high | monthly active users 250,000 → 400,000 (hard) | | tech, news, education | | none | Incubator is real and limited (about 20 sites a month). It isn't ranked; the detail names it under 250,000. |
| Clickio | main | 2 | contact | high | Official or: pageviews 100,000 → 200,000 when Tier 1 lo ≥ 50, else 1,000,000 → 2,000,000 (soft, indicative); revenue more than $500 → $1,000 a month (hard) | | | | in route | Europe and Latin America bars sit between 250k and 750k. The tool uses the rest-of-world bar because it doesn't ask region. |
| The Moneytizer | main | 2 | form | high | organic US/UK/CA uniques 300,000 → 450,000 (hard) | | | | in measure | Always `review_led`. Also needs: own domain, not Wix or Jimdo. |
| NitroPay | main | 2 | form | medium | pageviews 25,000 → 100,000 (editorial) | | gaming, entertainment | | none | Specialist |
| Refinery89 | main | 2 | contact | low | pageviews 100,000 → 500,000 (editorial) | | news, lifestyle | | region leaning | |
| Playwire | main | 3 | form | medium | pageviews 100,000 → 500,000 (soft) | | gaming, education, entertainment, travel | | Tier 1 leaning | 500k is the FAQ requirement, 100k is apply guidance. Replaces AdSense and Ad Exchange tags. |
| Freestar | main | 3 | contact | medium | pageviews 300,000 → 1,000,000 (editorial) | Tier 1 ≥ 50 | sports, news, personal-finance, automotive, gaming, entertainment | | requirement | 300k is our floor. Freestar's own figure is a typical 1M pageviews, shown as guidance. 50% organic can't be checked. |
| Publift | main | 3 | contact | high | Official or: revenue more than $2,000 → $4,000 a month (hard); pageviews 500,000 → 1,000,000 (soft, its secondary signal) | | gaming | | Tier 1 leaning | |
| Publisher Collective | main | 3 | contact | high | Core genres: pageviews 300,000 → 1,000,000 (editorial) or revenue $9,000 → $15,000 a month (editorial scale level). Other niches: pageviews 3,000,000 → 6,000,000 (hard). | Other niches: pageviews ≥ 3,000,000 | tech, gaming, crafts, education, sports, health-fitness | | none | Its own signal, shown as guidance: about €300 a day in revenue. The $9,000 is our scale level, not a converted figure. |
| Snack Media | main | 3 | contact | medium | pageviews 250,000 → 1,000,000 (editorial) | | sports, entertainment | | none | Specialist |
| Venatus | main | 3 | contact | low | pageviews 250,000 → 1,000,000 (editorial) | | gaming, sports, entertainment | | none | Specialist |
| Adnimation | main | 3 | form | low | pageviews 1,000,000 → 3,000,000 (editorial) | | news, automotive | | none | MAP named in detail |
| Concert | main | 4 | invite | low | pageviews 10,000,000 → 30,000,000 (editorial) | | news, entertainment | | none | Curated, invite-led |
| Media.net | main | 0 | form | low | pageviews 50,000 → 250,000 (editorial) | | news, personal-finance, tech | | Tier 1 leaning | Limits similar competing ads |
| Infolinks | add | 0 | open | medium | pageviews 0 (none) | | | | none | |
| Revcontent | add | 0 | form | medium | pageviews 0 (none) | | news, entertainment | | none | Native widget |
| Taboola | add | 0 | form | medium | pageviews 0 → 100,000 (pref) | | news, entertainment, lifestyle | | none | Native widget, exclusive against other widgets |
| MGID | add | 0 | open | high | visitors 90,000 → 180,000 (hard) | | news, entertainment, sports | | none | Native widget. Its other route, 3,000 daily uniques, isn't modeled. 10 current articles. |
| Sovrn | add | 0 | form | high | visits 100,001 → 200,000 (hard) | | | | none | More than 100,000 |
| EthicalAds | add | 0 | form | medium | pageviews 50,000 → 100,000 (hard) | Niche tech or education | tech | | Tier 1 leaning | |
| Teads | add | 4 | contact | low | pageviews 1,000,000 → 5,000,000 (editorial) | | news, education, entertainment | | none | |
| Amazon Publisher Services | setup | 4 | invite | medium | pageviews 1,000,000 → 5,000,000 (editorial) | | news | | none | Also needs own GAM |
| MonetizeMore PubGuru | setup | 3 | contact | high | Official or: revenue $5,000 → $10,000 a month (hard); pageviews 2,000,000 → 4,000,000 (hard) | | food | | none | |
| AdPushup | setup | 3 | form | low | revenue $3,000 → $6,000 a month (editorial, from a vendor article); pageviews 500,000 → 1,000,000 (editorial) | | tech | | none | |
| Adapex | setup | 3 | contact | low | pageviews 500,000 → 2,000,000 (editorial); revenue $3,000 → $10,000 (editorial) | | | | none | Also needs own GAM |
| Aditude | setup | 4 | contact | low | pageviews 1,000,000 → 5,000,000 (editorial); revenue $10,000 → $30,000 (editorial) | | gaming, entertainment | | none | |
| AnyMind AnyManager | setup | 4 | contact | low | pageviews 1,000,000 → 3,000,000 (editorial); revenue $5,000 → $15,000 (editorial) | | news, gaming | | region leaning | |
| Geniee SSP | setup | 4 | form | low | pageviews 1,000,000 → 3,000,000 (editorial) | | news | | region leaning | |
| Opti Digital | setup | 4 | contact | low | pageviews 1,000,000 → 3,000,000 (editorial); revenue $5,000 → $15,000 (editorial) | | | | region leaning | Also needs own GAM |
| Publir | setup | 3 | form | low | pageviews 100,000 → 500,000 (editorial) | | | | none | |
| Setupad | setup | 3 | form | low (Managed), high (Self-Serve) | Managed: visits 100,000 → 500,000 (editorial). Self-Serve: visits 10,000,000 → 50,000,000 (hard). | | | | none | Self-Serve also needs own GAM |
| Sparteo | setup | 4 | contact | low | pageviews 1,000,000 → 3,000,000 (editorial) | | education | | none | |
| PubNation | legacy | | | | | | | | | Never shown. As current network: Mediavine, tier 2. |
| PubGalaxy | legacy | | | | | | | | | Never shown. As current network: tier 2, no family. |

Revenue floors written "more than $X" use F = X + 0.01.

Where the editorial levels came from:

- Carbon 20k, Media.net 50k, NitroPay 25k, Newor Elevate 10k: the lowest scale where reports or positioning show real use. Newor's reported rejections near 10k sessions set its floor.
- Freestar 300k: reports of smaller accepted publishers at 1M to 2M ad impressions, well under its typical 1M pageviews.
- Publisher Collective 300k pageviews or $9,000 a month, Venatus and Snack 250k: selective review, and gaming and sports reports well above 100k. The $9,000 is a scale level we set; it isn't €300 a day converted.
- Refinery89 and Publir 100k: contact-led partners whose intake asks for a pageview band.
- Adapex and AdPushup: "mid-sized" positioning, and AdPushup's vendor-stated $3,000 a month.
- 1M for Aditude, AnyMind, Geniee, Opti Digital, Sparteo, Teads, Amazon Publisher Services, Adnimation: enterprise, invite, or sales-led products with reported cases from 1M to 100M.
- Concert 10M: a curated marketplace for media groups.
- Mediavine $420 to $700 a month: a ranking heuristic near $5,000 ÷ 12. It ranks; it doesn't qualify anyone.

## Reasons on a card

The engine returns a reason code and its values. The frontend owns the words: one short line, about 12 words at most.

| Code | When | Says |
| --- | --- | --- |
| `published_bar` | Basis `published_number` | The bar and the person's own number in that unit: "Asks for 25,000 pageviews; you have 40,000" |
| `estimated_bar` | Basis `estimate`, hard route | The bar, with "about": "Asks for 1,000 Tier 1 sessions; you're likely above" |
| `apply_guidance` | Soft route decides | "Sites usually apply from 100,000 pageviews" |
| `revenue_signal` | Mediavine | "Revenue makes it worth checking; reviews prior calendar-year earnings" |
| `revenue_bar` | A revenue route decides | "Asks for over $2,000 ad revenue a month" |
| `no_minimum` | Basis `no_minimum` | "No traffic minimum; content is reviewed" |
| `case_by_case` | SHE Media's path | "Smaller sites reviewed case by case" |
| `niche_specialist` | Specialist | "Built for gaming sites" |
| `sales_led` | Editorial route, contact or invite access | "Talks to sites your size; no published bar" |
| `upgrade` | Upgrade flag | "Next step from Journey" |
| `check_contract` | Add row under an exclusive current network | "Check your current network's contract first" |
| `fit_estimate` | Any shortlisted card not matched by a more specific reason | "Estimated fit for your site's size; individual review still applies" |

Use the first applicable reason in this order: `upgrade`, `check_contract`, `niche_specialist`, `revenue_signal`, `case_by_case`, `revenue_bar`, `published_bar`, `estimated_bar`, `apply_guidance`, `no_minimum`, `sales_led`, `fit_estimate`. `revenue_bar` requires a published revenue route; editorial revenue levels never become an "asks for" claim. The fallback guarantees every shortlisted card has a reason, including Carbon in scenario 3 and Newor Elevate in R9.

## Expected rankings

All with no peers. Scores and ranks are rounded to 2 decimals. "Next" lists the best networks that missed the main list.

### 1. Tiny food blog

Food, 3,000 pageviews, visits blank, 3 to 6 months, Tier 1 60%, current none, revenue blank.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Google AdSense | Good fit | 89.96 | 89.96 | no_minimum |
| 2 | Journey by Mediavine | Worth a try | 54.10 | 57.10 | estimate |

- Add: Infolinks 77.28, Revcontent 73.42.
- Growth: Monumetric 0.30. Raptive (0.12), SHE Media (0.06), and PubFuture (0.03) fall under 0.2.
- Suggestion: none.
- Not shown: Mediavine (revenue blank), Publift, Publisher Collective, every sales-led product.

### 2. Food blog at 40,000 pageviews (default example)

Food, 40,000 pageviews, 22,000 sessions, over a year, Tier 1 65%, current AdSense, $350 a month.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Monumetric | Good fit | 96.67 | 99.67 | estimate |
| 2 | Raptive | Good fit | 88.72 | 91.72 | estimate |
| 3 | Journey by Mediavine | Good fit | 87.00 | 90.00 | estimate |
| 4 | Newor Media (Elevate) | Good fit | 80.04 | 80.04 | no_minimum |
| 5 | SHE Media | Worth a try | 69.81 | 63.81 | review_led |

- Add: Infolinks 77.28, Revcontent 74.70.
- Growth: Mediavine 0.8333 ($350 ÷ $420.00), Clickio 0.70 (its revenue route, $350 ÷ $500.01, beats its pageview route at 0.40). PubFuture 0.40 is third. Ezoic 0.0792 is under 0.2.
- Suggestion: none.

### 3. Developer and design site

Tech, 60,000 pageviews, 35,000 sessions, over a year, Tier 1 55%, current none.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Raptive | Good fit | 88.46 | 91.46 | estimate |
| 2 | Monumetric | Good fit | 85.44 | 88.44 | estimate |
| 3 | Journey by Mediavine | Good fit | 75.39 | 78.39 | estimate |
| 4 | Newor Media (Elevate) | Good fit | 76.90 | 76.90 | no_minimum |
| 5 | Carbon Ads | Worth a try | 77.66 | 71.66 | review_led |

- Add: EthicalAds 76.24, Infolinks 77.28.
- Growth: PubFuture 0.60, PubPower 0.315.
- Next: SHE Media 68.20 / 71.20 (weak niche), AdSense 70.53 (not pinned above 25,000 pageviews).
- Suggestion: monthly ad revenue.

### 4. Gaming site

Gaming, 300,000 pageviews, 150,000 sessions, over a year, Tier 1 45%, current AdSense, $900 a month.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Clickio | Good fit | 87.71 | 93.71 | published_number (revenue route) |
| 2 | Raptive | Good fit | 88.93 | 91.93 | estimate |
| 3 | Publisher Collective | Worth a try | 93.33 | 87.33 | review_led |
| 4 | PubFuture | Good fit | 81.00 | 87.00 | published_number |
| 5 | Mediavine Official | Good fit | 83.82 | 86.82 | estimate |

- Add: Sovrn 82.80, MGID 79.73.
- Growth: Monumetric 0.90 (share [42, 45] against 50, tier 1), Freestar 0.90 (Tier 1 45 against 50, tier 3). Ezoic 0.54 is third. Publift isn't gated: its revenue route fails, but its soft pageview route passes (300,000 ≥ 0.5 × 500,000).
- Next: NitroPay 87.00 / 86.00, Playwire 82.00 / 85.00, Newor Media (Catapult) 74.70 / 77.70.
- Suggestion: none.

### 5. High volume, mostly outside Tier 1

Education, 2,000,000 pageviews, 1,100,000 sessions, over a year, Tier 1 10%, current AdSense, $2,500 a month.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Ezoic | Good fit | 90.00 | 93.00 | estimate |
| 2 | Publisher Collective | Worth a try | 96.67 | 90.67 | review_led |
| 3 | Clickio | Good fit | 82.80 | 88.80 | published_number |
| 4 | MonetizeMore PubGuru | Good fit | 79.73 | 85.73 | published_number |
| 5 | PubFuture | Good fit | 74.52 | 80.52 | published_number |

- Add: MGID 85.87, Sovrn 85.87.
- Own setup: Amazon Publisher Services 73.14, Sparteo 67.50.
- Growth: The Moneytizer 0.3234, SHE Media 0.30. Raptive is gated (Tier 1 10 against 40) at 0.25, third.
- Next: Publift 74.60 / 77.60, Mediavine 74.40 / 77.40.
- Suggestion: none.

### 6. High revenue site already on Raptive

Food, 600,000 pageviews, 330,000 sessions, over a year, Tier 1 80%, US 70%, current Raptive, $12,000 a month.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | MonetizeMore PubGuru | Good fit | 93.33 | 99.33 | published_number |
| 2 | Publift | Good fit | 92.00 | 98.00 | published_number |
| 3 | Mediavine Official | Good fit | 93.33 | 96.33 | estimate |
| 4 | SHE Media | Good fit | 93.33 | 96.33 | estimate |
| 5 | Clickio | Good fit | 85.87 | 91.87 | published_number |

Mediavine and SHE Media tie on rank and `E`. `A` ties too, so slug order puts Mediavine first.

- Add: MGID, Sovrn (85.87 each), both with `check_contract`.
- Own setup: AdPushup 64.40, Publir 64.40.
- Growth: The Moneytizer 0.7762, Publisher Collective 0.20 (food is outside its core genres: 600,000 ÷ 3,000,000. Its revenue route can't get around that requirement).
- Next: Newor Media (Premier) 82.80 / 88.80 (US pageviews exactly 420,000, chosen before the filter, tier 3), Playwire 82.80 / 85.80, Freestar 79.60 / 73.60.
- Hidden as step-downs: Monumetric, Journey, AdSense.

### 7. Unknowns: one visits number

Lifestyle, visits 25,000 (unit visits), everything else blank.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Google AdSense | Good fit | 76.67 | 76.67 | no_minimum |
| 2 | Newor Media (Elevate) | Good fit | 76.48 | 76.48 | no_minimum |
| 3 | Monumetric | Worth a try | 68.74 | 71.74 | estimate |
| 4 | Raptive | Worth a try | 60.32 | 63.32 | estimate |
| 5 | Journey by Mediavine | Worth a try | 52.59 | 55.59 | estimate |

- Add: Infolinks 77.28, Revcontent 74.70.
- Growth: PubFuture 0.50, PubPower 0.225.
- Mediavine is hidden: its only route is revenue, and revenue is blank.
- Suggestion: monthly ad revenue.

### 8. On Journey

Food, 120,000 pageviews, 70,000 sessions, over a year, Tier 1 70%, current Journey, $1,100 a month.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Mediavine Official | Good fit | 98.33 | 109.33 | estimate, upgrade |
| 2 | Raptive | Good fit | 98.33 | 101.33 | estimate |
| 3 | SHE Media | Good fit | 98.33 | 101.33 | estimate |
| 4 | Monumetric | Good fit | 91.78 | 94.78 | estimate |
| 5 | Clickio | Good fit | 85.87 | 91.87 | published_number |

- Add: Infolinks 77.28, Revcontent 75.99.
- Growth: Publift 0.55, Ezoic 0.252.
- Next: Newor Media (Elevate) 76.00, Playwire 71.70 / 74.70.

### 9. Dev site on Carbon

Tech, 150,000 pageviews, 90,000 sessions, over a year, Tier 1 50%, current Carbon.

| # | Network | Status | Score | Rank | Basis |
| --- | --- | --- | --- | --- | --- |
| 1 | Raptive | Good fit | 90.47 | 93.47 | estimate |
| 2 | Clickio | Good fit | 83.00 | 86.00 | estimate (soft pageview route) |
| 3 | Monumetric | Good fit | 78.40 | 81.40 | estimate (share [47, 50] straddles 50, `G` 0.7) |
| 4 | Newor Media (Elevate) | Good fit | 75.99 | 75.99 | no_minimum |
| 5 | Journey by Mediavine | Good fit | 72.98 | 75.98 | estimate |

- US pageviews are [41,250, 67,500], so the low end misses 60,000 and Newor picks Elevate.
- Add: none. Carbon needs its ads to run alone, so EthicalAds isn't offered.
- Growth: Ezoic 0.324, Publift 0.30.
- Suggestion: monthly ad revenue.

### Regression cases

| Case | Inputs | Expected |
| --- | --- | --- |
| R1 partial split | Lifestyle, 80,000 pageviews, over a year, Tier 1 60, UK 50, current none | US [0, 10]. SHE Media growth target, 0.3333. Main: Raptive 96.15, Monumetric 92.87 (share [57, 60]), Journey 83.58, Newor Elevate 76.90, AdSense 70.53. Growth: PubFuture 0.80, SHE Media 0.3333. |
| R2 Moneytizer zeros | Lifestyle, 1,000,000 users, over a year, US 0, UK 0, CA 0, AU 50, NZ 50, current none | Tier 1 100. Moneytizer share [0, 0], uniques [0, 0]: gated at closeness 0, so not a growth target. Main: Raptive, Publift (soft pageview route), Monumetric, Ezoic, Clickio. Own setup: PubGuru, Amazon Publisher Services. |
| R3 Newor straddle | Sports, 100,000 pageviews, over a year, Tier 1 70, current none | US pageviews [38,500, 63,000]. Newor picks Elevate (76.90). |
| R4 Newor Catapult | Same with US 62 | US pageviews 62,000, exact. Newor picks Catapult: `S` 0.85 + 0.15 × 2,000 ÷ 360,000 = 0.8508, `published_number`, score 74.21, rank 80.21. |
| R5 current Concert | News, 20,000 pageviews, over a year, Tier 1 50, current Concert | Every main-lane network is below tier 4. Main and growth are empty. Lead: `No clear step up from Concert right now`. Add: Revcontent, Infolinks. Suggestion: monthly ad revenue. |
| R6 current Newor (program unknown) | Food, 150,000 pageviews, over a year, Tier 1 70, current Newor, $900 | Current tier 1. Only tier 0 is hidden: AdSense goes, Journey stays (score 82.60, rank 85.60, just outside). Main: Mediavine, Raptive, SHE Media, Monumetric, Clickio. |
| R7 young band | Food, 40,000 pageviews, 3 to 6 months, Tier 1 60, current none | Raptive `Aage` 0.5: score 43.29, rank 46.29. Under 45, so not shortlisted and not a growth target. Main: Monumetric, Newor Elevate, AdSense, Journey (`Aage` 0.85), SHE Media. |
| R8 complete split | Food, 40,000 pageviews, over a year, Tier 1 55.4, US 40, UK 8, CA 4, AU 3, NZ 0, current none | Tier 1 normalized to 55. Monumetric share 55, exact. |
| R9 niche only | Food | `ut` unknown. Main: AdSense 85.87, Newor Elevate 55.94, Monumetric 47.29, Journey 45.60, the last three Worth a try. Suggestion: monthly ad revenue. |
| R10 split mismatch | Five splits adding up to 55, Tier 1 65 | `split_mismatch` on `shareUS`. The last good result stays. |
| R11 small traffic, real revenue | Personal finance, 8,000 pageviews, over a year, Tier 1 70, current none, $6,000 a month | `ut` 3 from revenue. Main: Mediavine 94.44 / 97.44 (estimate), Publift 89.96 / 95.96, Clickio 86.89 / 92.89, MonetizeMore PubGuru 80.96 / 86.96 (all `published_number` on revenue), AdSense 80.76 (pinned under 25,000 pageviews). Own setup: AdPushup 64.40, Adapex 61.77. Growth: Monumetric 0.80, Raptive 0.32. With current AdSense, AdSense leaves. Journey has Tier 1 sessions [2,800, 4,666.67], `S` 0.9175, score 77.70 and rank 80.70, but the family rule removes it because Mediavine Official is already first. AdPushup therefore takes fifth (score 64.40, rank 58.40, Worth a try); Adapex remains in own-setup options. |

## Calibration checks

Any change to priors or weights must keep these true:

- A site under 10,000 pageviews, with revenue blank or under $500 a month, never sees a tier 3 or 4 network, or any low-evidence network, in the main list. Real revenue opens revenue routes at any traffic level (see R11).
- No main list shows two Mediavine family cards.
- No public text says approved, eligible, qualifies, or meets.
- A network below the current network's tier never shows.
- With revenue blank, Mediavine doesn't show.
- Specialists never show outside their niches.
- A route never bypasses a requirement.
- An entered country share of 0 is never estimated upward.
- The closed section never holds more than 6 rows.
