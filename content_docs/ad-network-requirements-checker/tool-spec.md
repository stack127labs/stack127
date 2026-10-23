# Ad network requirements checker

Route: `/ad-network-requirements-checker`

Research: [research.md](research.md). Model: [recommendation-model.md](recommendation-model.md).

This spec replaces the earlier strict checker in full. The owner rejected that version: too many overlapping inputs, and a result made of 44 pass, short, or can't-tell rows. Nothing from its contract still applies, including its inputs, its share parameters, its statuses, and its examples route. The current code under `lib/ad-network-requirements/` and the route folder belongs to the old version and is replaced when this spec is built.

Scope of this round: research, model, and this plan. No tool code, components, tests, or database changes.

## People and questions

- **Most users are** solo bloggers and small site owners. They know their niche, one or two monthly traffic numbers, roughly how old the site is, and what they earn now.
- **Their top questions:**
  1. "Where should I apply first?"
  2. "I'm on AdSense or Journey. What's my next step?"
  3. "What should I grow toward?"
- **Basic answers them with** seven things most people know offhand: niche, pageviews, visits or sessions, site age, Tier 1 share, current network, and monthly ad revenue. Niche and pageviews are required, so every list starts from real traffic. Other blanks mean unknown, and the shortlist still works.
- **Advanced holds** one thing: the country split inside Tier 1 (US, UK, Canada, Australia, New Zealand). Publishers who know it get sharper ranking for SHE Media (US share), Newor Media (US pageviews), and Monumetric (its countries leave out New Zealand). Each field is optional. Empty means the model estimates from the Tier 1 share.
- **Left out:**
  - Domain rating. No network uses it.
  - Domain registration date, annual revenue, revenue history, and 3-month traffic history. They duplicate Basic or ask people to dig.
  - Language, platform, own Google Ad Manager, region outside Tier 1, and site address. Kept out of this version to keep the form short. Rules that depend on them show in a network's detail as "Also needs".
  - Approval odds, RPM, and earnings. Nobody publishes acceptance rates, and any number from someone else's site would be made up.
  - App programs (Playwire app DAU, AnyMind and Refinery89 SDKs). This tool is for websites.
- **Default example:** Food, 40,000 pageviews, 22,000 sessions, over a year, Tier 1 65%, current AdSense, $350 a month. It's the most searched case ("can I join Mediavine at 40k") and a typical small food blog. See [scenario 2](recommendation-model.md#2-food-blog-at-40000-pageviews).
- **Published comparison:** none. The research found no data set that measures traffic the way networks do. Tracked sites appear only as a peer count in a network's detail.
- **Domain limits:** numbers are never capped below what real sites enter. Shares must add up correctly (see validation).

## Why people will choose this tool

The searcher wants a decision: where to apply, and what to grow toward. Top results fail them:

- Stale numbers: Raptive 100k, Mediavine 50k sessions, SHE 20k, Ezoic "no minimum".
- False precision: PubSignal works out Journey sessions from pageviews and multiplies one month of revenue by 12, then calls it a pass.
- Four networks in the best competitor, and no use of the network you're already on.
- Lists written for lifestyle blogs, with nothing for gaming or developer sites.

What this tool does better:

1. A short ranked list, 3 to 5 places to apply, each with one reason and an Apply link.
2. Every status is an honest estimate: `Good fit`, `Worth a try`, or `Growth target`. Nothing claims approval or confirmed eligibility.
3. Current facts for 42 tracked brands, with legacy PubNation and PubGalaxy handled.
4. Upgrade paths from the current network, and no step-downs.
5. Niche matters: gaming, developer, and lifestyle sites get different lists.
6. Extras (add-alongside networks, ad tech for big setups, growth targets) wait in one closed section.

## Product

### Promise and scope

For a site owner with a niche and a few numbers, the tool returns an estimated shortlist of 3 to 5 ad networks to apply to, best first, each with a status, a short reason, a role, an Apply link, and a Details view. A closed section holds up to 6 more rows: networks to add alongside, ad tech for large setups, and growth targets.

**Scope:** the 44 profiles in the model's [network priors](recommendation-model.md#network-priors). Websites only. USD revenue only.

**Exclusions:** approval odds, earnings, app products, non-USD revenue, content or policy checks, and Ezoic's grandfathered path (only for sites already on Ezoic).

### Technical contract

**Inputs**

| Key | Type | Parsing and bounds |
| --- | --- | --- |
| `niche` | `NicheSlug \| "other"` | Required. One of `adNetworkNiches` or `other`. |
| `pageviews` | whole number | 0 to 10,000,000,000. Commas and spaces stripped. |
| `visits` | whole number | Same bounds |
| `visitsUnit` | `sessions \| visits \| users` | Default `sessions`. Ignored when `visits` is blank. |
| `siteAge` | `lt3m \| 3to6m \| 6to12m \| gt12m` | Optional |
| `tier1Share` | number | 0 to 100, up to 1 decimal |
| `shareUS`, `shareGB`, `shareCA`, `shareAU`, `shareNZ` | number | 0 to 100, up to 1 decimal. Sum at most 100. With `tier1Share` entered: a partial split adds up to at most `tier1Share` + 0.5, and a complete split (all five) must be within 0.5 of it. Tier 1 is then normalized to the split total. An entered 0 is a real 0. See [Countries](recommendation-model.md#countries). |
| `current` | network slug, `snigel`, `none`, or `other` | Optional. Slugs from the 44 profiles. No program is asked: a current network with programs counts as its lowest program's tier. |
| `adRevenueMonth` | number | USD, 0 to 100,000,000, up to 2 decimals |

**Estimates, ranking, status, and output:** exactly as [recommendation-model.md](recommendation-model.md), steps 1 to 6. The model doc is the source of truth for every ratio, prior, weight, threshold, and tie-break.

**Unknowns:** every blank input has a defined effect in the model. A blank never errors and never blanks the result.

**Invalid:** errors return per field. The last good result stays.

**Privacy:** everything runs in the browser except the static page data. Nothing the person types is sent anywhere.

### Backend contract

**Files**

| File | Holds |
| --- | --- |
| `lib/ad-network-requirements/types.ts` | Input, output, and profile types. Replaces the old file. |
| `lib/ad-network-requirements/profiles.ts` | `adNetworkProfiles`: the 44 priors from the model's table, plus each network's apply URL, published bar facts, "also needs" keys, and sources with `checkedAt`, copied from the profile JSON. Replaces `rules.ts`. |
| `lib/ad-network-requirements/estimate.ts` | `estimateMeasures` |
| `lib/ad-network-requirements/engine.ts` | `validateRecommendationInput`, `recommendAdNetworks`, `parseRecommendationQuery`, `recommendationShareParams` |
| `lib/ad-network-requirements/page-data.ts` | Server only. `loadRequirementsPageData`. Replaces `examples.ts`. |

Delete `lib/ad-network-requirements/rules.ts`, `lib/ad-network-requirements/examples.ts`, and `app/api/ad-networks/requirement-examples/route.ts`. Peer counts come with the static page data, so the tool needs no API route.

`profiles.ts` facts must agree with the directory's `network-facts.ts`. The directory is updated separately by the directory writer and coordinator.

**Types**

```ts
type VisitsUnit = "sessions" | "visits" | "users";
type SiteAge = "lt3m" | "3to6m" | "6to12m" | "gt12m";
type InputKey = "niche" | "pageviews" | "visits" | "visitsUnit" | "siteAge" | "tier1Share"
  | "shareUS" | "shareGB" | "shareCA" | "shareAU" | "shareNZ" | "current" | "adRevenueMonth";

type RecommendationInput = {
  niche: NicheSlug | "other";
  pageviews?: number; visits?: number; visitsUnit: VisitsUnit;
  siteAge?: SiteAge; tier1Share?: number;
  shares?: Partial<Record<"US" | "GB" | "CA" | "AU" | "NZ", number>>;
  current?: string;                    // a profile slug, "snigel", "none", or "other"
  adRevenueMonth?: number;             // USD, a typical recent month, ads only
};

type InputErrorCode = "required" | "not_a_number" | "negative" | "not_whole" | "too_many_decimals"
  | "too_large" | "over_100" | "shares_over_100" | "shares_over_tier1" | "split_mismatch" | "invalid_choice";

type Interval = { lo: number; hi: number; exact: boolean };
type Measures = Partial<Record<"pageviews" | "sessions" | "visits" | "visitors" | "monthlyActiveUsers"
  | "tier1Sessions30d" | "tier1Share" | "usShare" | "monumetricShare" | "moneytizerShare" | "usPageviews"
  | "adRevenueMonth" | "moneytizerUniques30d", Interval>> & { noCountryInput: boolean };
// Shares: feasible bounds from every entered share, intersected with the editorial prior; empty intersection keeps the feasible bounds.

type Lane = "main" | "add" | "setup";
type Status = "good_fit" | "worth_a_try" | "growth_target";
type Basis = "published_number" | "estimate" | "no_minimum" | "review_led";
type ReasonCode = "published_bar" | "estimated_bar" | "apply_guidance" | "revenue_signal" | "revenue_bar"
  | "no_minimum" | "case_by_case" | "niche_specialist" | "sales_led" | "upgrade" | "check_contract" | "fit_estimate";

type BarFact = {                       // a network's own published rule, for detail and growth targets
  metric: "pageviews" | "tier1_sessions_30d" | "visits" | "visitors" | "monthly_active_users"
    | "us_pageviews" | "ad_revenue_month" | "ad_revenue_previous_calendar_year"
    | "tier1_share" | "us_share" | "organic_unique_visitors_30d" | "none";
  comparator: "at_least" | "more_than" | "none";
  amount: number | null;
  currency: "USD" | "EUR" | null;      // money only, never converted: Publisher Collective is EUR
  period: "month" | "day" | "30_days" | "previous_calendar_year" | null; // e.g. EUR 300 a day
  scope: string | null;                // "outside core genres", "US, UK, Canada, Australia"
  program: string | null;              // "Catapult", "Self-Serve", null
  kind: "requirement" | "guidance";    // guidance: Playwire 100k, Freestar typical 1M, Clickio indicative, Publisher Collective EUR 300 a day
  sourceUrl: string; checkedAt: string;
};

type Recommendation = {
  slug: string; program: string | null; lane: Lane; status: Exclude<Status, "growth_target">;
  reason: { code: ReasonCode; values: Record<string, number | string> }; // e.g. { bar: 25000, yours: 40000 }
  upgrade: boolean; checkContract: boolean; applyUrl: string;
  detail: { bars: BarFact[]; alsoNeeds: string[]; peers: number | null; directoryHref: string };
  debug: { score: number; rank: number; basis: Basis; S: number; TM: number; G: number; Cc: number;
    P: number | null; Aeff: number; Aage: number; Nmult: number; estimated: (keyof Measures)[] };
};
type GrowthTarget = { slug: string; program: string | null; bar: BarFact };

type Lead =
  | { kind: "apply"; slug: string; count: number }
  | { kind: "grow"; slug: string }
  | { kind: "no_step_up"; current: string }
  | { kind: "none_stand_out" };

type RecommendationResult = {
  lead: Lead;                          // model Step 6, Lead
  main: Recommendation[];              // 0 to 5, ranked
  more: { add: Recommendation[]; setup: Recommendation[]; growth: GrowthTarget[] }; // up to 2 each
  suggestInput: InputKey | null;
};
```

`debug` is for the focused test and the development preview. The frontend never renders it. `alsoNeeds` holds fact keys (such as `english`, `wordpress_or_blogger`, `own_gam`, `not_wix`, `ga_access`, `exclusive`, `incubator_limited`), and the frontend owns their words. `peers` is null when the count is under 5 or niche is `other`.

**Functions**

```ts
// Raw strings in. Empty string = not given.
export function validateRecommendationInput(raw: Partial<Record<InputKey, string>>):
  { ok: true; input: RecommendationInput } | { ok: false; errors: Partial<Record<InputKey, InputErrorCode>> };
// shares_over_100, shares_over_tier1, and split_mismatch are reported on shareUS.

export function estimateMeasures(input: RecommendationInput): Measures;

export function recommendAdNetworks(input: RecommendationInput,
  peers: Partial<Record<string, number>> | null,          // slug → confirmed sites in the niche
  profiles?: AdNetworkProfile[]): RecommendationResult;   // pure, deterministic

export function parseRecommendationQuery(params: URLSearchParams):
  { shared: boolean; raw: Partial<Record<InputKey, string>> };
export function recommendationShareParams(raw: Partial<Record<InputKey, string>>): Record<string, string>;
```

**Share parameters**

| Param | Field |
| --- | --- |
| `niche` | Niche |
| `pv` | Pageviews |
| `visits`, `unit` | Visits and its unit (`sessions`, `visits`, `users`) |
| `age` | Site age band |
| `t1` | Tier 1 share |
| `us`, `gb`, `ca`, `au`, `nz` | Country split |
| `current` | Current network |
| `rev` | Ad revenue a month |

`shared` is true only when `niche` is present. Empty values are left out. Any other parameter is ignored, including the old version's `traffic`, `rev_prev`, `pv_min3`, `domain_on`, and `site`.

**Page data (server)**

```ts
export async function loadRequirementsPageData(): Promise<{
  networks: { slug: string; name: string; logo: NetworkLogoFile | null; directoryHref: string }[]; // 44 profiles
  peers: Record<NicheSlug, Partial<Record<string, number>>>; // confirmed sites per niche per network
  defaultResult: RecommendationResult;                         // the default example, with food peers
}>;
```

- Peers count confirmed relationships only, by niche. One grouped query over `public.ad_network_publishers` and `public.ad_network_publisher_relationships`, as the old examples loader did, without the site or band arguments.
- `unstable_cache` with `revalidate: false` under the existing ad-networks tag, so the page stays static and refreshes on demand.
- Names come from `listAdNetworks()`. Legacy brands keep their directory names. A profile slug missing from the database throws at build.

### Known examples

The focused test covers the nine [expected rankings](recommendation-model.md#expected-rankings) and regressions R1 to R11: the lead, the main list in order with scores to 2 decimals, each status, and what's in the closed section. It also checks the [calibration rules](recommendation-model.md#calibration-checks). A fresh arithmetic review confirms these numbers before the build starts.

Boundary and unit cases:

| Input | Expected |
| --- | --- |
| 22,000 sessions, pageviews blank | Pageviews estimated 26,400 to 44,000 |
| 40,000 pageviews, visits blank | Sessions estimated 20,000 to 33,333 |
| 50,000 users | Sessions 55,556 to 83,333. Visitors and monthly active users 50,000, estimated. |
| Visits 100,000, unit visits | Sovrn isn't offered (strictly more than 100,000). At 100,001 it can appear under `Add alongside` with basis `published_number`. The same numbers with unit `sessions` are estimated visits, so the basis is `estimate`. |
| Gaming, 99,999 pageviews, over a year, Tier 1 40, current none | PubFuture is the first growth target (0.99999). At 100,000 it's third in the main list (79.00). |
| Food, 120,000 pageviews, over a year, Tier 1 70, current none, $419 a month | Mediavine is the first growth target (closeness 0.9976), shown with its own bar ($5,000 ad revenue in the previous calendar year). At $420 it's fourth in the main list (score 89.59) with reason `revenue_signal`. No result anywhere contains a prior-year revenue figure. |
| Tier 1 50, splits blank | Monumetric share [47, 50] straddles 50: `G` 0.7, estimated. With US 40, UK 6, CA 3, AU 1 (NZ blank): [50, 50], exact, `G` 1.0. |
| Tier 1 60, UK 50, rest blank | US [0, 10]: the prior [33, 54] doesn't overlap, so the feasible bounds stand. SHE Media becomes a growth target. |
| US 0, UK 0, CA 0, AU 50, NZ 50 | Tier 1 100. Moneytizer share [0, 0], exact. The zeros are never estimated upward. |
| Five splits adding up to 55, Tier 1 65 | `split_mismatch`. With Tier 1 55.4: Tier 1 becomes 55. |
| Sports, 100,000 pageviews, Tier 1 70 | Newor picks Elevate (US pageviews [38,500, 63,000]). With US 62: Catapult, `S` 0.8508, `published_number`. |
| Food, 600,000 pageviews, $12,000 a month | Publisher Collective fails its 3,000,000 requirement outside core genres. Its revenue route can't get around it. |
| Current Concert, 20,000 pageviews | Lead `no_step_up`. Main and growth empty. |
| Food, 40,000 pageviews, 3 to 6 months, Tier 1 60, current none | Raptive isn't gated, but `Aage` 0.5 puts it at 43.29, under 45, so it's not shortlisted (R7). |
| Current `pubnation` | Mediavine and Journey are both dropped. |
| Current `snigel` | Publisher Collective is dropped. |
| Current `buysellads-carbon-ads` | `more.add` is empty. |
| Niche `other` | No specialist, Carbon, or EthicalAds. `peers` null. |
| Only niche entered (food) | Main: AdSense 85.87, Newor Elevate 55.94, Monumetric 47.29, Journey 45.60. `suggestInput` is `adRevenueMonth`. |
| Personal finance, 8,000 pageviews, Tier 1 70, $6,000 a month | Revenue routes open premium networks at low traffic: Mediavine, Publift, Clickio, PubGuru, then AdSense (R11). |
| Invalid | `pv=-5` gives `negative`. `pv=abc` gives `not_a_number`. `pv=9.5` gives `not_whole`. `t1=101` gives `over_100`. `us=60&gb=50` gives `shares_over_100`. `t1=40&us=45` gives `shares_over_tier1`. `age=2y` and `current=foo` give `invalid_choice`. Empty niche gives `required`. |

### Ownership

| Owner | Files |
| --- | --- |
| Sol (backend) | Everything under `lib/ad-network-requirements/`, deleting the old examples route, focused test `tests/pages/ad-network-requirements-checker/engine.test.mjs`, and the development preview row |
| Opus (frontend) | `app/(site)/(tools)/ad-network-requirements-checker/*-tool.tsx`, `*-from-url.tsx`, `*.module.css`, a new `recommendation-card.tsx`, removing `network-detail.tsx`, and every word in them |
| Integration | `page.tsx`, `layout.tsx`, `content/*.mdx`, card art, publish manifest, catalogs |

### Catalog placement

- **Primary: Publisher tools** (`/publisher-tools`), as planned in [the publisher tools brief](../publisher-tools/brief.md). The reader's task is making money from a content site.
- **Secondary: none.**
- **Links:** from `/ad-networks` and each network page's joining tab.

**Card art** (`toolSpot`, art key `ad-network-requirements-checker`):

- **Takeaway:** a short list of where to go next.
- **Focal subject:** a signpost with three arrows of different lengths, the top one marked as the pick.
- **Supporting object:** a small browser window at the foot of the post.
- **Tone:** hopeful and neutral. No red or green, no visible words. Reads at card size in both themes.

## Interface

### Flow

- **Question:** "Where should I apply?"
- **Lead answer:** the top pick by name, with the count: `Apply to Monumetric first` and `5 places to try`. The `Estimate` label sits beside it, once, for the whole result.
- **Opens on:** the default example, its result showing and marked `Example`.
- **Button:** `Find networks`, with `Reset` beside it.

### Inputs

| Input | Basic or Advanced | Required or optional | Hint | What it changes |
| --- | --- | --- | --- | --- |
| Niche | Basic | Required | none | Niche fit, specialists, niche-gated networks, peers |
| Pageviews a month | Basic | Optional | `From your analytics, a typical recent month.` | Every pageview bar and the scale tier |
| Visits or sessions a month, with unit `Sessions`, `Visits`, `Users` | Basic | Optional | `Pick the name your analytics uses.` | Journey, Sovrn, MGID, Ezoic, and pageviews when blank |
| Site age: `Under 3 months`, `3 to 6 months`, `6 to 12 months`, `Over a year`, `Not sure` | Basic | Optional. `Not sure` sends a blank, so the choice can always be undone. | none | Raptive, SHE Media, Journey, Monumetric ranking |
| Tier 1 share | Basic | Optional | `US, UK, Canada, Australia, and New Zealand together.` | Raptive, Freestar, Monumetric, Journey, and every Tier 1 leaning network |
| Current ad network | Basic | Optional | `Choose None if you don't run ads yet.` | Upgrades, step-downs, the AdSense pin, add-alongside conflicts |
| Ad revenue a month, `USD` suffix | Basic | Optional | `Ads only, in a typical recent month. Leave out affiliate income.` | Mediavine, Publift, PubGuru, Clickio, the scale tier |
| US, UK, Canada, Australia, New Zealand shares | Advanced: `Country split` | Optional | US: `Part of your Tier 1 share.` Others none | SHE Media, Newor Media, Monumetric, and the Tier 1 share when that's blank |

The Advanced summary uses `uiSetSummary`. Current network options: `None`, then the 42 current brands by name, `PubNation`, `PubGalaxy`, `Snigel (now Publisher Collective)`, and `Another network`.

### Result

1. **Lead:** from `lead`, with the `Estimate` label. `apply`: `Apply to <network> first` and `<n> places to try`. `grow`: `Grow toward <network> next`. `no_step_up`: `No clear step up from <current> right now`. `none_stand_out`: `No network stands out for these numbers yet`. The lead never asks for more input and never says "can't tell".
2. **Ranked cards,** 3 to 5, one per row. Each card: rank number, `NetworkLogo`, name and program, status word (`Good fit` or `Worth a try`), the role tag, one reason line, and two actions: `Apply` (external, the profile's apply URL) and `Details`. The ranked order is the visual: logos down a numbered list read faster than any chart, and there's no number worth plotting.
3. **Details** opens in place under the card as a short labeled list: `What they ask` (published requirements in plain words), `Their guidance` (guidance bars), `Also needs`, `Sites we track` (`1,943 food sites use it`, only at 5 or more), and `Source` (page link and check date). Then a link to the network's directory page. No scores, no weights. A new run closes any open Details.
4. **One suggestion line** when `suggestInput` is set: `Add your monthly ad revenue to place Mediavine and Publift.` with a button that focuses the field.
5. **`More options`**, one closed `UiDisclosure` with a count summary. Inside, three short groups, each only when it has rows: `Add alongside`, `For your own ad setup`, `Grow toward`. Add and setup rows are compact: logo, name, status word, reason, `Apply`. Growth rows: logo, name, `Growth target`, the published bar ("At least 25,000 pageviews a month"), and a `Details` link to the directory page.
6. **`UiShareAction`** at the end.

Status words never use success or danger colors. `Good fit` uses the accent text, `Worth a try` the normal text, `Growth target` muted.

### Components

**Existing:**

| Component | Import |
| --- | --- |
| `ToolWorkbench`, `ToolFieldRow`, `ToolResult` | `app/ui/tools/tool-workbench.tsx` |
| `UiSelect`, `UiComboBox`, `UiNumberField`, `UiQuantityInput`, `UiChoiceGroup`, `UiButton`, `UiDisclosure`, `uiSetSummary`, `UiShareAction` | `app/ui/controls.tsx` |
| `UiResultLead`, `UiStatus`, `UiStatusWord` | `app/ui/display.tsx` |
| `NetworkLogo`, `networkLogo` (server) | `app/ui/ad-networks/network-logo.tsx`, `network-logo-src.ts` |
| `useInitialQuery` | `app/ui/tools/use-initial-query.ts` |

**New shared components:** none.

**Tool-specific:**

- `ad-network-requirements-checker-tool.tsx`: form, state, and result.
- `ad-network-requirements-checker-from-url.tsx`: shared-link wrapper.
- `recommendation-card.tsx`: the ranked card with its in-place detail, and the compact row used in `More options`.

### Layout

- **Basic rows:**
  1. Niche | Current ad network.
  2. Pageviews a month | Visits or sessions a month (with its unit select).
  3. Tier 1 share | Ad revenue a month.
  4. Site age, a visible choice row of five, including `Not sure`.
  Then the action row.
- **Advanced:** `Country split`, one row of five share fields.
- **Desktop:** the lead at the left edge, then the cards as a numbered vertical list at reading width (about 44rem). Each card is one line of logo, name, status, and role, with the reason under the name and the actions on the right. `More options` sits under the list.
- **Phones:** every field row stacks. The five share fields go two per line. The age choices wrap to two per line. Cards become three lines: logo, name, and status, then the reason, then the actions.

### States

- **Example:** the default result marked `Example`.
- **Stale:** after an edit, `ToolResult stale` with `Inputs changed`. The result stays.
- **Invalid:** errors under each field on pressing the button, focus on the first. If it's inside `Country split`, open it first. The last good result stays, stepped back.
- **Thin result:** fewer than 3 cards is fine. The lead still names the top pick, and `More options` holds the growth targets.
- **Nothing in the main list:** the lead follows its `lead.kind`. A very small site on AdSense gets `grow`. A site on a top-tier network such as Concert gets `no_step_up`. The card region keeps its height.
- **Niche `Something else`:** no peers, no specialists.
- **Shared link:** opens and calculates at once. Invalid values show their errors the same way.
- **Reset:** back to the example.

### Accessibility

- Cards are an ordered list. Each `Details` is a button with `aria-expanded`.
- The status is in text, not color alone.
- The live region announces the lead line after a run.

## Content

Written in the writing round on 2026-10-23 with `skills/stack127/tools/stack127-tool-writing/SKILL.md`.

### Search intent and title

Main phrase: "ad network requirements checker". Words top titles add: free, requirements, 2026, and brand names. Questions: which networks take small sites, Mediavine at 40k, Raptive pageviews or sessions, Journey vs Mediavine. See [Search words](research.md#search-words), checked 2026-10-22.

Handoff for integration. These go in the publish manifest and `public.stack127_tool_pages`, never in page files:

| Field | Value |
| --- | --- |
| H1 (`title`) | Which ad network should you apply to? |
| SEO title (`meta_title`) | Free ad network requirements checker: where to apply |
| SEO description (`meta_description`) | Put in your niche, traffic, and ad revenue to get 3 to 5 ad networks to apply to, best first, from AdSense to Mediavine. Rules checked in October 2026. |
| Card name | Ad network requirements |
| Card description | Find the ad networks to apply to, best first. |

The SEO title is 52 characters and the description 151. The card name stays the same as the current sidebar label. The description names a check month, so update it when the rules are rechecked. The tool behavior changed from the strict checker, so integration confirms the `tool_version` with the coordinator.

### Reader questions

| Question | Answered in |
| --- | --- |
| Where should I apply first? | Tool result (lead and cards) |
| What do I need to enter, and what if I don't know a number? | Usage |
| What do the statuses and Details mean? | Usage |
| What does each network publish? | Content: requirements table |
| Can I join Mediavine at 40k pageviews? | Content |
| Is Journey easier than Mediavine? | Content |
| Does Raptive count sessions or pageviews? | Content |
| Sessions or pageviews: which do I enter? | Usage and content |
| What is Tier 1 traffic? | Content |
| Which networks take small sites? | Content |
| Why is a network I know missing? | Content |
| How is the order picked? | Content |

### Outline

- **Intro:** the reader's situation, what they put in, what they get, and that it's an estimate every network still reviews.
- **Usage:** what to enter (bullets per input), how to read the result (statuses, reason, Apply, Details, Estimate, More options), one worked example on the default, Copy link and Reset.
- **Content:** a requirements table with each network's own page linked; then question headings for Mediavine at 40k, Journey vs Mediavine, Raptive's unit, sessions vs pageviews, Tier 1, small sites, missing networks, and how the order is picked. Links to the [ad networks directory](/ad-networks) and the [ad network checker](/ad-network-checker) sit inside sentences.

### Facts, limits, and sources

Every number in the table comes from the network's own page, linked in the table, read on 2026-10-22 or 2026-10-23 (PubFuture's FAQ). The page says: results are estimates; every network reviews each site; no approval is promised; Mediavine counts the previous calendar year's ad revenue; Journey counts Tier 1 sessions; AdSense and Taboola have no published traffic minimum.

The page must not say approved, eligible, qualifies, or guaranteed, give an earnings, RPM, or acceptance-rate figure, or turn monthly revenue into last year's income.

### Interface words

Final words in the frontend, after the writing pass:

- Reason lines are one or two short sentences, such as "Asks for 25,000 pageviews. You have 40,000.", "Asks for 1,000 Tier 1 sessions a month. You likely have more.", "No published traffic minimum. Every site is reviewed.", and "Your ad revenue makes it worth a look. It counts last calendar year's earnings."
- The role line shows only on cards outside the main lane, such as "Runs on your own ad setup" when PubGuru reaches the main list. Main cards don't repeat "Replaces your ads".
- Details reads the network's own source list and labels when the backend sends them, and falls back to the sources behind its bars.

### Next step

Link the [ad networks directory](/ad-networks) for full network pages, and the [ad network checker](/ad-network-checker) to see which networks a real site uses.
