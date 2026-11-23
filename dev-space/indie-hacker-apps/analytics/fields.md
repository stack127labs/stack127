# Proposed analytics research fields

Proposal checked **2026-11-04**. Approve the fields before full app research. The short test below checks whether public answers can be found. It is not a finished review of its three sample apps.

Use one product record, with child records for deployment editions, plans, prices, and detection rules. A hosted plan and a self-hosted edition can have different features, licenses, storage, and support. Keep those differences visible. Fields with several parts below are groups: each individual answer still needs its own evidence.

## Evidence rules for every answer

- Store `value`, `source_url`, `checked_at` in YYYY-MM-DD, `applies_to` (edition, plan, region, platform, and settings), and a short evidence note. A page-wide source is not enough when different claims came from different documents.
- For a numeric fact, store the unit, currency, billing period, and limits beside the number. Preserve the vendor's wording where a term such as "event" has a special meaning.
- Use official product docs, pricing, terms, privacy policies, repositories, and release notices. Comparisons and community posts can point to an answer; they do not prove a competitor's facts.
- Record `unknown`, `not_published_in_pages_checked`, `not_applicable`, or `conflicting_sources`. Never turn missing text into `no`, zero, unlimited, free, open source, or an inactive service.
- Distinguish a vendor claim from a checked behavior or our own calculation. This step performs no installations, account tests, script measurements, or website crawl.
- For derived prices, link every input source, date, workload, formula, and assumptions. Do not compare a claimed script size with a measured size as though they were the same.
- If first-party pages disagree, preserve both URLs and checked dates. Choose a value only after resolving the difference; a newer page does not silently erase a contractual term.
- Recheck prices, free access, sale status, ownership, and plan limits before publishing. Suggested upkeep: every 30 days for those facts; every 90 days for features, privacy controls, retention, and install rules; immediately after a known closure or migration notice. These are proposed upkeep intervals, not completed checks.

`Required` means the research must address the field. An honest unknown is acceptable. `Conditional` means required for applicable products only. `Optional` means do not delay a useful listing to chase it.

## Field list

| ID and field | What it means | Why a reader needs it | Value format | Normal source | Priority |
| --- | --- | --- | --- | --- | --- |
| F01 Identity and lifecycle | Current name, official URL, old names, operating company, acquisition/rebrand/closure notices, new-customer availability | Avoid buying a closed product or counting an old name twice | Text, URLs, status enum, dated notices; owner can be unknown | Official home/about, legal entity in terms, acquisition and retirement announcements | Required |
| F02 Category and directory overlap | Primary job and other supported jobs; links to other indie-hacker app groups | Distinguish traffic counting, app events, replays, mobile, and revenue tools | One primary category; secondary tags; overlap tags | Product docs and feature pages | Required |
| F03 Supported platforms and languages | Websites, native iOS/Android, desktop, games, WordPress, site builders; dashboard language | Avoid choosing a tool that does not support the project | Platform list with official/community support and constraints; language list if published | SDK matrix, plugin pages, integration docs | Required for platforms; optional for dashboard languages |
| F04 Market and account restrictions | Who may open an account, supported countries, required store or hosting account | An available website does not mean the reader can subscribe | Explicit restrictions, prerequisites, entity country, unknowns kept separate | Terms, signup docs, provider availability pages, official legal page | Required; exhaustive country lists optional |
| F05 Entry path | Free account, self-serve purchase, trial, demo-only sale, or source download | Solo builders need a practical way to start | Enum plus URL; account/card requirement | Pricing and getting-started pages | Required |
| F06 Deployment editions | Vendor cloud, paid private deployment, self-hosting, local plugin, or log analysis | Shows who operates the system and stores the data | Edition records; supported/unsupported; installation link | Official hosting and installation docs | Required |
| F07 Source license | Whether the actual product code is open source, source-available with restrictions, or closed | Visible code and open-source SDKs do not prove the whole service is open source | License name, repository and license-file URLs, scope/version | Official repository LICENSE; commercial/self-host terms | Required for code/self-host claims; optional otherwise |
| F08 Price structure | What is billed and when: events, pageviews, users, sessions, revenue, projects, or store revenue | Prices with different counting rules cannot be compared directly | Meter definition; currency; monthly/annual term; minimum commitment; tax treatment if stated | Pricing, billing docs, terms | Required |
| F09 Free plan | Permanent free hosted access and its limits; self-hosted software is separate | A free trial is not a free plan, and server costs still exist | Yes/no/unknown; quotas; feature, retention, commercial-use, and time limits | Plan table and billing docs | Required |
| F10 Trial | Duration, card requirement, and what happens when it ends | Avoid an unexpected bill or lost history | Days; card yes/no/unknown; expiry behavior; trial features | Trial and billing docs | Required |
| F11 Paid tiers and features | Current entry price, volume bands, important paid feature gates, required add-ons | A cheap traffic plan may exclude funnels, exports, or replay | Price rows by edition, plan, usage range, feature, and billing term | Pricing calculator, plan matrix, billing docs | Required; unknown for unpublished quotes |
| F12 Costs at several usage levels | Comparable estimates for stated workloads, within a category | Shows when a cheap start becomes expensive | Derived amount or quote-required; inputs and formula; included features | F08–F11 and F13; publicly accessible calculator | Optional derived output; never guess a conversion ratio |
| F13 Exceeding a limit and spend controls | Extra charges, blocked collection, forced upgrades, grace periods, caps, and alerts | Protects the budget and prevents silent gaps | Behavior enum; marginal rates; hard-cap/alert settings; upgrade threshold | Billing, overage, and usage-limit docs | Required |
| F14 Sites, projects, apps, and seats | How many projects and people a plan allows, and whether allowances are pooled | Indie hackers often run several small projects | Per-plan counts; pooling rule; extra-project/seat price | Plan tables and organization docs | Required |
| F15 Website reports | Pages, sources, countries, devices, campaigns, goals, real-time reporting, and revenue attribution | Separates a visitor counter from useful acquisition reports | Feature matrix: native/integration/paid/absent/unknown; short limits | Web-analytics documentation | Conditional: web tools |
| F16 Product reports and identity | Events, funnels, paths, retention, user groups, anonymous-to-logged-in identity, company/account reports | Shows what the builder can learn about app use and repeat visits | Feature matrix; plan/platform restrictions; identity method and reset scope | Product analytics and identity docs | Conditional: product tools |
| F17 Replays and heatmaps | Web/native replay, click/scroll maps, recording limits, and sensitive-content masking | Recording availability and privacy defaults differ across platforms | Features by platform/plan; capture quota; masking defaults and switches | Replay, heatmap, and privacy-control docs | Conditional: behavior-recording tools |
| F18 Native mobile details | Official SDKs, supported frameworks, offline event handling, and platform feature gaps | A web library inside a mobile page is not a native app SDK | SDK/version/framework matrix; webview distinction; offline limits if documented | Official mobile SDK docs and release notes | Conditional: mobile tools; offline details optional |
| F19 Revenue coverage | Billing sources; MRR (monthly recurring revenue), churn, cohorts, refunds, tax handling, multiple currencies, and metric definitions | Revenue tools can disagree because they count different things | Supported sources and metrics; native/partner/manual/API; definition links; currency and refund rules | Billing integration docs and metric reference | Conditional: revenue tools; deep tax/currency treatment optional |
| F20 Capture and setup | Manual events, automatic capture, browser script, server events, native SDK, plugin, store connection, or log file | Shows how much setup and event planning is needed | Supported capture methods; setup steps; official/community integrations | Install guide, SDK reference, store/plugin docs | Required; no invented setup-time score |
| F21 Cookies and visitor identifiers | Cookies, browser storage, device IDs, daily hashes, login IDs, and cross-site/cross-device links | "Cookieless" does not describe every kind of visitor tracking | Defaults and optional modes, identifier lifetime, collected/stored distinction | Tracker/data policy, SDK config and privacy docs | Conditional: visitor collection; revenue imports describe imported IDs instead |
| F22 Consent position and controls | Vendor's consent claim, countries/configurations it applies to, opt-in/out controls, and limitations | The reader needs the conditions, not a universal no-banner badge | Claim text; jurisdiction; edition/settings; control links; unresolved legal basis | Official implementation/privacy guidance; applicable regulator guidance | Required to address; final legal verdict is not a directory field |
| F23 Data location and agreements | Where visitor/customer data is stored and processed; available regions; DPA (data processing agreement); outside processors | Helps readers choose storage and contractual arrangements | Storage/processing/backup locations separately; selectable regions; DPA and subprocessor URLs | DPA, security page, hosting docs, subprocessor list | Required for location; detailed processor inventory optional |
| F24 Collected data and removal controls | IP addresses, URLs/query strings, forms, customer details; redaction before collection; user deletion | Avoid sending private form inputs or product content to a service | Data-type list, defaults, controls, deletion route; per SDK/edition | Data policy, SDK config, deletion docs | Required |
| F25 History and cancellation | How long events, totals, recordings, and exports remain; what happens after a trial or cancellation | Short retention can make comparisons and migrations impossible | Per-data-type/per-plan durations; reset rules; cancellation/deletion grace; backup handling if stated | Retention docs, billing terms, cancellation and account deletion docs | Required; do not use one number for every data type |
| F26 Export and API access | Downloadable reports/raw data, automated access, plan gates, documented limits | Helps the builder keep data and move away later | Export types; raw/aggregated; API features; rate limits; plan; egress fee if stated | Export docs, API reference, billing | Required |
| F27 Import and migration | Bringing past GA data, billing history, CSV, or events from another provider | Avoid starting the history from zero | Supported sources/formats; lookback; plan; retained detail; limits | Migration and import docs | Required to address; unknown is allowed |
| F28 Sampling and traffic quality | Whether all events are reported; sampling, bots, internal visits, and blocked tracking | Explains why two tools show different visitor totals | Vendor-described counting rules; configuration and plan limits | Data-quality, filtering, session-definition, and report-limit docs | Required to address; measured accuracy is outside this step |
| F29 Script/SDK weight | Published browser transfer size or native app overhead, including what was measured | Can help with page speed, but only if sizes are comparable | Bytes; compressed/uncompressed; version; optional modules; vendor-claim vs measured | Official performance page or later controlled measurement | Optional; no size league table from mixed claims |
| F30 Self-host upkeep and requirements | Resources, databases, upgrades, supported releases, paid extensions, and who fixes problems | "Free to self-host" can create work and server bills | Official minimums; dependencies; support status; latest release; separately estimated hosting cost | Maintainer docs, release page, repository, self-host terms | Conditional: self-host tools; hosting-cost estimate optional |
| F31 Public demo, docs, and support | Can someone inspect the interface and find help without subscribing? | Lets a solo builder judge the workflow before setup | URLs; public demo yes/no/unknown; support channels and paid restrictions | Official demo/docs/support pages | Optional |
| F32 Public website detection | What public page evidence could identify the product and which deployments it misses | Allows honest usage counts from stack127's existing website sample | Rule records described below; E/C/N; supported signal type; evidence and version date | Official install snippets, public tracker code, maintainer docs | Required for planned usage stats; unknown rule allowed |
| F33 Limits and suitable use | Specific missing features, edition differences, prerequisites, and cross-directory notes | Helps readers find a fit without an invented overall score | Short sourced caveats; distinguish inference from vendor statement | Findings above; cite the underlying facts | Optional, evidence-backed editorial output |

## Price comparisons worth preparing

Keep separate charts for separate jobs. Show currency, plan, required add-ons, and billing term next to every estimate. Use original currencies unless we later choose and date an exchange-rate source.

| Job | Proposed workloads | Fixed assumptions to record |
| --- | --- | --- |
| Website traffic | 10,000; 100,000; 1,000,000 monthly pageviews | One site, one user, pageviews only. If custom events share the allowance, add a separate event workload. |
| Product analytics | 100,000; 1,000,000; 10,000,000 monthly events | Define event count and active-user count separately. No fake conversion from events to users. |
| Session replay | 1,000; 10,000; 100,000 monthly recorded sessions | State recording length, capture rate, retention, web/native, and whether a heatmap add-on is needed. |
| Mobile usage | 1,000; 10,000; 100,000 monthly active users | Use only user-based prices directly. For event pricing, a separate explicit workload can assume 20 events/user/month; label it a scenario. |
| Revenue analytics | $1,000; $10,000; $50,000 MRR | State whether the vendor meters MRR, ARR (yearly recurring revenue), total payments, tracked revenue, or app-store proceeds. Treat each definition separately. |

The price is `quote_required` or `not_comparable` when the public tariff cannot price the workload. For self-hosting, show software license cost and estimated hosting cost separately. Do not rank it at $0 beside a fully operated hosted service.

## Detecting apps from public website code

No crawl was run. Detection classes for **every main-list product** are in apps.md. They describe likely visibility, not measured detection accuracy. Homepage-only data will miss trackers placed only inside an authenticated app or on other pages.

Each proposed rule needs:

| Rule part | What to store |
| --- | --- |
| Product and edition | Stable product ID, edition, current brand, legacy aliases, and parent company |
| Signal | Script host/path, embedded initializer, unique attribute combination, or known bundled SDK marker |
| Match rule | Exact host/path or carefully bounded pattern; where to look in HTML or already fetched assets |
| Primary evidence | Official installation/source URL, checked date, and a short supporting excerpt |
| Confidence class | Strong product-specific install evidence; supporting evidence only; unknown; not publicly observable |
| Exclusions | Documentation examples, comments, integration logos, textual mentions, unrelated libraries, and old snippets |
| Visibility limits | Consent-gated, loaded later, bundled, first-party/proxied, self-hosted, native SDK, server-only, or dashboard-only |
| Later validation | Known positive and negative examples, version tested, and confirmed misses. These do not exist yet. |

Start with these evidence-backed families, all checked **2026-11-04**:

| App/family | Candidate public signal and method | Ease and limits | Primary evidence |
| --- | --- | --- | --- |
| GA4 | A Google tag setup that configures a `G-` measurement ID, often near `gtag/js` or `gtag('config', ...)` | Usually easy if explicit. A `GTM-` container, `GT-` tag, or Ads `AW-` ID alone does not prove GA4. Browser bundles and server-only collection can hide it. | [Google tag types](https://developers.google.com/tag-platform/gtagjs/configure), [existing tags](https://developers.google.com/tag-platform/devguides/existing) |
| Plausible | Current `plausible.io/js/pa-…js` personalized script with initialization; also research older `/js/script…js` variants | Easy for hosted snippets; conditional for custom-domain proxy, bundled package, and Community Edition. Do not require the old `data-domain` form exclusively. | [Current snippet example](https://plausible.io/docs/proxy/guides/netlify), [proxy overview](https://plausible.io/docs/proxy/introduction) |
| Fathom | `cdn.usefathom.com/script.js` and `data-site` in an actual script element | Easy for default hosted installs; custom serving can hide host. `data-site` by itself is not unique. Keep Fathom Lite separate. | [Official embed](https://usefathom.com/docs/script/embed) |
| Cloudflare Web Analytics | `static.cloudflareinsights.com/beacon.min.js` beacon reference | Easy default signal for the browser beacon. Do not infer Web Analytics merely from a Cloudflare CDN header or managed hosting. | [Collection documentation](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/) |
| Umami | A script with `data-website-id`, backed by Umami-specific host/configuration or tracker code | Conditional: arbitrary self-hosted domains and filenames; generic UUID/data attributes alone are weak evidence. | [Tracker configuration](https://docs.umami.is/docs/tracker-configuration) |
| PostHog | Product-specific initializer/SDK plus configured PostHog ingestion endpoint | Conditional: package imports, proxy URLs, self-hosting, and server SDKs. Shared infrastructure strings are not proof that a particular product feature is enabled. | [Web SDK setup](https://posthog.com/docs/libraries/js), [configuration](https://posthog.com/docs/libraries/js/config) |
| Vemetric | `cdn.vemetric.com/main.js` with its setup attributes/initializer | Easy for the documented snippet; conditional for bundled SDKs. | [Official homepage installation examples](https://vemetric.com/) |
| Logly | `logly.uk/p.js` in a live script element | Easy default snippet; first-party serving still needs review. | [Official homepage embed example](https://logly.uk/) |
| Other E-labelled web/replay products | Take their product-specific hosted script or counter image from the official install guide; match a real install rather than a vendor-name mention | Likely easy for defaults. Exact patterns are **not researched yet**. Includes hosted web trackers, hosted counters, and most dedicated heatmap tools. | Each product's official URL in apps.md is the starting point; add install-doc evidence during per-app research |
| Other C-labelled web/product products | Look for a documented initializer, distinctive bundled code, first-party collector configuration, or plugin asset | Conditional. A site-builder marker proves the platform, not paid analytics activation. Generic `/script.js`, `analytics`, and a WordPress folder alone are insufficient. | Per-app install/plugin docs and license/source links to collect later |
| GoAccess, AWStats, Netlify Web Analytics, Mitzu | No reliable visitor-facing snippet expected for their server-log/host-side/warehouse use | N: do not infer non-use from clean HTML. A public report link can suggest use, not identify every installation. | [GoAccess](https://goaccess.io/), [AWStats](https://www.awstats.org/), [Netlify](https://docs.netlify.com/manage/monitoring/web-analytics/overview/), [Mitzu](https://mitzu.io/) |
| All Mobile-section products | Native SDKs and store dashboards are normally absent from website HTML | N for a homepage survey. Some vendors also have a web SDK: a separate validated rule could detect that web use only. Do not turn it into proof of native app use. | Official product/SDK pages listed in apps.md |
| All Revenue-section products | Imported billing/store data usually goes to a private dashboard or server connection | N for revenue analytics. Stripe checkout, RevenueCat/Superwall web paywalls, badges, or payment links can be visible but do not prove a metrics dashboard is used. | [ChartMogul import methods](https://help.chartmogul.com/article/132-getting-started-with-importing-data-for-subscription-analytics); each vendor's setup docs |

Before publishing usage counts, deduplicate redirects and domains, remove failed pages from the measurable-page denominator, and keep the observation date and sample rules. Say **"detected on X of Y successfully inspected homepages in stack127's sample"**, not "global market share." The stated 123,000+ websites are background from the brief; their current count and eligibility were not checked here.

Count products once per site but allow multiple products on one site. Category percentages can exceed 100% when features overlap. Brand counts and parent-company counts need separate charts. A surviving legacy snippet does not prove a closed product is still working; report it separately as an old installation signal.

No detection cannot mean no analytics. Consent, login pages, blockers, downloaded-code limits, and first-party proxies create misses. Do not publish comparative mobile or revenue adoption percentages from homepage detection.

## Feasibility test: three different kinds of app

Test date: **2026-11-04**. Sample: Plausible (website traffic), PostHog (product platform with replay), ChartMogul (private revenue imports). Only public primary pages were read. No account, calculator interaction, SDK install, billing purchase, or crawl was performed.

**E = easy:** answer or clear feature/plan evidence appeared in the opened primary pages. **H = hard:** spread across pages, requires plan/edition interpretation, uses an interactive control, or has conflicting wording. **NP = not published in the public pages checked:** no answer established; not proof it is unpublished everywhere. **NA = not applicable to that use.** A mixed entry explains which part needs more work.

Source keys below link to pages checked on that date. Ratings are field-list feasibility findings, not product ratings or final app facts.

| Key | Public primary pages checked |
| --- | --- |
| P1 | [Plausible home, features and pricing](https://plausible.io/), [subscription plans and metering](https://plausible.io/docs/subscription-plans) |
| P2 | [Visitor data policy](https://plausible.io/data-policy), [service privacy policy](https://plausible.io/privacy), [proxy guide](https://plausible.io/docs/proxy/introduction) |
| P3 | [Integration guides](https://plausible.io/docs/integration-guides), [data access](https://plausible.io/docs/data-access), [exports](https://plausible.io/docs/export-stats), [troubleshooting](https://plausible.io/docs/troubleshoot-integration) |
| P4 | [Community Edition announcement](https://plausible.io/blog/community-edition), [published script-weight claim](https://plausible.io/lightweight-web-analytics) |
| H1 | [PostHog home](https://posthog.com/), [pricing](https://posthog.com/pricing), [product analytics](https://posthog.com/docs/product-analytics) |
| H2 | [SDK comparison](https://posthog.com/docs/libraries), [web install](https://posthog.com/docs/libraries/js), [web configuration](https://posthog.com/docs/libraries/js/config) |
| H3 | [Privacy overview](https://posthog.com/docs/privacy), [data storage and deletion](https://posthog.com/docs/privacy/data-storage), [cookieless modes](https://posthog.com/tutorials/cookieless-tracking), [replay masking](https://posthog.com/docs/session-replay/privacy) |
| H4 | [Self-hosting](https://posthog.com/docs/self-host), [API](https://posthog.com/docs/api), [file exports](https://posthog.com/docs/data-pipelines/file-download-exports) |
| C1 | [ChartMogul home](https://chartmogul.com/), [plans and prices](https://chartmogul.com/pricing/) |
| C2 | [Import sources and data](https://help.chartmogul.com/article/132-getting-started-with-importing-data-for-subscription-analytics), [integration directory](https://chartmogul.com/integrations/), [API introduction](https://dev.chartmogul.com/docs/introduction/) |
| C3 | [Data retention policy](https://chartmogul.com/privacy/data-retention/), [deletion help](https://help.chartmogul.com/article/238-chartmogul-will-delete-my-data-how-do-i-prevent-this), [security](https://chartmogul.com/security/), [privacy](https://chartmogul.com/privacy/) |
| C4 | [CSV exports](https://help.chartmogul.com/article/233-exporting-data-to-csv), [export destinations](https://help.chartmogul.com/article/192-getting-started-with-destinations) |

| Field | Plausible | PostHog | ChartMogul |
| --- | --- | --- | --- |
| F01 Identity/lifecycle | E name/site; H full owner chain (P1/P2) | E name/site; H full owner chain (H1/H3) | E name/site; H full owner chain (C1/C3) |
| F02 Category/overlap | E (P1) | E (H1) | E (C1/C2) |
| F03 Platforms/languages | E integrations; NP full language list (P3) | E SDK matrix; NP full language list (H2) | E billing/data integrations; NP full language list (C2) |
| F04 Account/market restrictions | H terms and entity details; NP exhaustive eligibility (P2) | H region choice is not an eligibility list (H3) | H location/privacy details; NP full eligibility list (C3) |
| F05 Entry path | E trial and self-host choices (P1/P4) | E free and usage-based entry (H1/H4) | E free and paid entry (C1) |
| F06 Editions | E cloud vs Community Edition (P4) | E unsupported self-host distinction (H4) | E hosted use; NP separate self-host offer (C1/C2) |
| F07 License | E named CE license; H current scope/version (P4) | E license named in self-host docs; H commercial folders (H4) | NP server-software license; SDK/API access is not enough (C2) |
| F08 Price meter | E usage definition and terms (P1) | E per-product meters; H combined bill (H1) | E revenue-based meter and annual/monthly terms (C1) |
| F09 Free plan | E trial vs free self-host distinction (P1/P4) | E hosted allowances and limits (H1) | E eligibility and plan restrictions (C1/C2) |
| F10 Trial | E duration and card rule (P1) | E permanent free entry; not a trial (H1) | H trial route shown; complete trial conditions not established (C1) |
| F11 Paid tiers | E plan gates; H volume slider (P1) | E rate structure; H multiple products and volume tiers (H1) | H slider emits several price values without an unambiguous selected state (C1) |
| F12 Scenario costs | H public slider and feature gates; do later (P1) | H several meters and tiered rates; do later (H1) | H interactive price-to-revenue mapping; do later (C1) |
| F13 Overages/caps | E explanation in billing docs; confirm chosen tier (P1) | E stop/paid-limit behavior shown (H1) | E free-plan threshold blocks additions; H paid tier changes (C1/C2) |
| F14 Project/seat quotas | E plan table (P1) | E project and seat limits (H1) | E seats and connected-source limits (C1) |
| F15 Web reports | E feature/plan pages (P1) | E suite; H web-specific plan detail (H1/H2) | NA for billing-import use; not visitor collection (C2) |
| F16 Product reports/identity | H goals/journeys are not full persistent-user identity (P1/P2) | E reports and identity links (H1/H2) | NA for raw app-event analysis; customer revenue segments separate (C1/C2) |
| F17 Replay/heatmaps | NP supported recording offer in checked pages; do not infer absence (P1/P3) | E features and masking; H per-platform differences (H1/H3) | NA for subscription imports (C2) |
| F18 Mobile details | H server-event route is not proof of maintained native SDKs (P3) | E official/community SDK matrix; H offline parity (H2) | NA; no native event-collection SDK needed for this use (C2) |
| F19 Revenue metrics | H revenue goals differ from recurring-billing accounting (P1/P3) | H payment/warehouse analysis requires setup (H1/H2) | E metrics and source types; H detailed tax/FX definitions (C1/C2) |
| F20 Capture/setup | E install/API options (P3) | E SDKs and configuration (H2) | E billing connection, CSV, API paths (C2) |
| F21 Identifiers/cookies | E visitor data policy (P2) | H defaults and cookieless modes differ (H3) | NA browser collector; E imported customer identifiers (C2/C3) |
| F22 Consent position | E vendor claim; H country/configuration application (P2) | H configuration-dependent guidance (H3) | NA browser banner for billing imports; H processing basis remains separate (C2/C3) |
| F23 Data location/DPA | E region and processor links; H backups (P2) | E selectable region/docs; H complete processing chain (H3) | H security/privacy pages require deeper location review (C3) |
| F24 Data/removal controls | E collected data; H deletion details (P2/P3) | E controls; H many SDK settings (H2/H3) | E imported-data list; H removal/backup handling (C3) |
| F25 Retention/cancellation | H active-plan statements differ from older indexed snippets; cancellation separate (P1/P3) | H events, replays, and other products have separate docs (H1/H3) | H active-account policy and cancellation help use different timelines (C3) |
| F26 Exports/API | E options and plan gates (P1/P3) | E API/export routes; H full rate/plan limits (H4) | E exports; H which exports the Free plan excludes (C1/C4) |
| F27 Imports/migration | E GA import and export caveats (P1/P3) | H sources exist; full historical-import limits not established (H1/H4) | E billing, CSV, API, and manual inputs (C2) |
| F28 Sampling/bots | H troubleshooting reveals exclusions; not a measured accuracy result (P3) | H transformations and bot treatment depend on mode (H3) | NA visitor sampling/bots; H imported billing reconciliation (C2) |
| F29 Weight | E vendor claim; H compression/version comparability (P4) | NP one comparable stable browser-size figure (H2) | NA public browser collector in this use (C2) |
| F30 Self-host upkeep | H CE exists; current minimum resources need more docs (P4) | E unsupported status; H operating resources/cost (H4) | NA for hosted billing-import use (C1/C2) |
| F31 Demo/docs/help | E demo and docs links (P1/P3) | E docs and help routes (H1/H2) | E help/API docs; H public no-account demo (C1/C2) |
| F32 Public detection | E hosted snippet; H proxies/self-host (P2/P3) | H bundled/proxied SDKs (H2) | E evidence of private import workflow; no reliable homepage detector (C2) |
| F33 Suitable use/limits | H editorial conclusions require completed plan facts (P1–P4) | H do after edition and bill research (H1–H4) | H do after pricing and retention conflicts resolve (C1–C4) |

### What the test changed

- **Keep price scenarios, but make them derived and optional.** Public pages often expose a slider without a clear machine-readable price for each workload. No scenario costs were calculated here.
- **Keep consent as a conditional claim, not yes/no legal advice.** Cookie settings and use matter. [CNIL's official guide](https://www.cnil.fr/fr/node/677), checked 2026-11-04, explains that analytics exemptions have conditions and national variation. A vendor's no-banner claim is not a blanket exemption for the whole website.
- **Split retention by data type, plan, and account state.** ChartMogul's policy describes active retention and deactivation after cancellation; help describes a later grace period. Those are related stages, not necessarily a contradiction. Confirm the whole timeline before publishing. Plausible's current plan table and older indexed retention descriptions also differ.
- **Keep export detail.** A service can allow standard CSV exports while reserving particular MRR histories for a paid plan. A yes/no export badge would hide that difference.
- **Make script weight, exact self-host cost, complete country/language lists, and setup time optional.** Comparable answers were not consistently available. Do not require a performance claim for a billing-import product.
- **Cut universal fields for measured accuracy, guaranteed setup minutes, global adoption, financial health, customer count, and exact real-world page-speed impact.** None can be fairly established across the three from these public docs. A vendor's customer-count claim can be optional later, with its date and definition; do not combine it with homepage detections.

## Stats and insights these fields could support

These are proposals, not results. Use active entries, edition-aware facts, and known-value denominators. Show how many products have unknown values. Keep gray entries visibly separate until the owner decides.

| Proposed view | Inputs | Useful insight and limit |
| --- | --- | --- |
| App counts by job and deployment | F01/F02/F06/F07 | How much choice exists; open-source/self-hosted options. Count products once and describe overlapping tags. |
| Entry-price and free-plan comparison | F05/F08–F14 | Which tools have a lasting free hosted path and what ends it. Exclude trials and software-only free downloads from that count. |
| Price-at-scale lines within each job | F08–F14 | Where costs rise, features unlock, or a quote is needed. No line connecting incomparable pageviews, users, and revenue. |
| Feature matrix | F03/F15–F20 | Traffic only vs funnels, user retention, native mobile, replay, and revenue; expose paid gates. |
| Privacy and storage comparison | F21–F25 | Default identifiers, available regions, masking, and history limits. Show conditions rather than a legal-compliance score. |
| Data portability comparison | F25–F27 | Which services let a founder bring old history and take useful data away. Keep raw vs aggregate export separate. |
| Self-host ownership/work comparison | F06/F07/F30 | Open source vs source-available vs paid self-hosting, support, dependencies, and maintenance. Do not equate self-hosting with zero cost. |
| Detected web installations | F01/F02/F32 and later observations | Counts and share within the existing measurable homepage sample. It cannot measure global adoption or native mobile/revenue dashboard use. |
| Co-use and category overlap | F02/F32 and later observations | Which traffic counters appear alongside a replay or product tool; no causal claims about business success. |
| Observed change over time | Repeated dated F32 observations on a consistent sample | Growth, removals, migrations, and lingering closed-product snippets. A changed sample or detector must be reported. |
| Coverage and freshness | Per-fact sources/dates and F01 | How many apps have prices, retention, and privacy details checked recently; distinguishes researched facts from unknowns. |
