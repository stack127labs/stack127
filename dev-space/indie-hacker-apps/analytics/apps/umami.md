# Umami

- Official URL: https://umami.is/
- apps.md row status: `active`; research marker: `Prompt`; detection class: `C`; row checked date: 2026-11-04.
- Research started: 2026-11-04 13:04:48 UTC (`date -u`).
- Research finished: 2026-11-04 13:10:12 UTC (`date -u` run again at completion).
- Minutes taken: 5.40 minutes (elapsed seconds / 60, rounded to two decimals).
- Scope: public official sources only. No crawl, installation, account creation, login, form submission, or measured tracker test.
- Row assessment: the web/product/cloud/self-hosted description and conditional detection class fit the evidence. The row's unknown owner can now be filled with the legal company below. No clear row error found.

## Facts

Each row is one evidence record. `not_published` means not found in the pages checked, not proof that the vendor never publishes it. Confirmed means documented by the vendor, not independently tested. Edition, plan, platform, and settings are in the applies-to column.

| Field ID | Field name | Value | State | Applies to | Exact source URL | Checked date | Evidence note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | Name and URL | Umami; https://umami.is/ | confirmed | Product | https://umami.is/ | 2026-11-04 | Current official branding. |
| F01 | Operating company | Umami Software, Inc.; Delaware, United States | confirmed | Hosted service | https://umami.is/terms | 2026-11-04 | Legal entity named in opening paragraph. |
| F01 | New customer availability | Free account signup is offered | confirmed | Cloud | https://docs.umami.is/docs/cloud/sign-up | 2026-11-04 | Documented signup route; not submitted. |
| F01 | Old names and ownership events | No former name, acquisition, or closure notice established | not_published | Product | https://umami.is/ | 2026-11-04 | Home, terms, current docs, and release page checked. |
| F02 | Primary category | Website analytics | confirmed | Cloud and self-hosted | https://docs.umami.is/docs | 2026-11-04 | Main acquisition and traffic job. |
| F02 | Secondary jobs and overlap | Product analytics; behavior recording; conversion and revenue attribution; performance monitoring | confirmed | Feature availability varies | https://umami.is/platform | 2026-11-04 | Directory overlap tags are our classification of documented features. |
| F03 | Web platforms | Websites and single-page apps; automatic navigation tracking | confirmed | Browser tracker | https://docs.umami.is/docs/collect-data | 2026-11-04 | Next.js uses next/script. |
| F03 | Community integrations | WordPress, Nuxt, Gatsby, VuePress, Craft CMS, Docusaurus, Publii, QloApps, Magento 2, Eleventy; Flutter integration | confirmed | Community packages | https://docs.umami.is/docs/integrations | 2026-11-04 | Official directory labels these community plugins and libraries; not official SDK maintenance guarantees. |
| F03 | Dashboard languages | Complete supported-language list not established | not_published | Dashboard | https://docs.umami.is/docs | 2026-11-04 | Visitor language metrics do not establish dashboard languages. |
| F04 | Age and legal eligibility | At least 18; local legal compliance required | confirmed | Hosted service | https://umami.is/terms | 2026-11-04 | Sections 1 and opening age requirement. |
| F04 | Country availability | No exhaustive eligible or excluded country list found | not_published | Cloud subscriptions | https://umami.is/terms | 2026-11-04 | General jurisdiction restrictions are not a country list. |
| F04 | Account prerequisites | Email verification and US/EU region selection | confirmed | Cloud | https://docs.umami.is/docs/cloud/sign-up | 2026-11-04 | Six-digit email code described. No hosting account prerequisite for Cloud. |
| F05 | Free entry | Self-serve signup at https://cloud.umami.is/signup | confirmed | Cloud | https://docs.umami.is/docs/cloud/sign-up | 2026-11-04 | Free signup, email verification. |
| F05 | Source entry | Source build or Docker installation | confirmed | Self-hosted | https://docs.umami.is/docs/install | 2026-11-04 | Source download is separate from hosted free access. |
| F06 | Editions | Vendor-managed Cloud; self-hosted open-source platform | confirmed | Product | https://docs.umami.is/docs/cloud | 2026-11-04 | Cloud handles hosting, updates, backups, scaling; self-host operator handles them. |
| F06 | Paid private deployment | Separate managed private-deployment offer not established | not_published | Enterprise | https://umami.is/pricing | 2026-11-04 | Custom enterprise plan alone does not prove private hosting. |
| F07 | Product code license | MIT; repository https://github.com/umami-software/umami | confirmed | Public repository, master at check | https://github.com/umami-software/umami/blob/master/LICENSE | 2026-11-04 | Product repository license, not merely an SDK license. Hosted service terms remain separate. |
| F08 | Billable usage definition | Each website hit/custom event counts once; each stored event property counts once; stored session data also counts | confirmed | Cloud | https://docs.umami.is/docs/cloud/faq | 2026-11-04 | Do not price pageviews with properties as pageviews alone. |
| F08 | Currency and tax | US dollars; applicable sales tax added | confirmed | Cloud purchases | https://umami.is/terms | 2026-11-04 | Section 5. |
| F08 | Billing term | Pricing FAQ says monthly; Cloud FAQ also offers annual billing | conflicting | Cloud | https://umami.is/pricing ; https://docs.umami.is/docs/cloud/faq | 2026-11-04 | Annual tariff and commitment not established; examples use displayed monthly prices. |
| F09 | Permanent free hosted plan | Hobby: $0/month; 100,000 events/month | confirmed | Cloud Hobby | https://umami.is/pricing | 2026-11-04 | Ongoing plan, separate from trial. |
| F09 | Commercial use | Services explicitly allow commercial sites, apps, products, businesses, and client work | confirmed | Hosted service, including no stated Hobby exception | https://umami.is/terms | 2026-11-04 | Section 2; no claim that infrastructure is free when self-hosting. |
| F10 | Trial duration and expiry | 14 days from purchase; full selected-plan features; regular billing afterward; cancel during trial at no charge | confirmed | Cloud paid-plan trial | https://docs.umami.is/docs/cloud/faq | 2026-11-04 | Paid subscription trial, not Hobby expiry. |
| F10 | Trial card requirement | Exact card requirement not stated in public guidance checked | not_published | Cloud trial | https://docs.umami.is/docs/cloud/subscription | 2026-11-04 | Stripe checkout is documented; that alone does not prove card requirements. |
| F11 | Pro price | $20/month; 1,000,000 included events/month; $0.00003/additional event | confirmed | Cloud Pro, monthly | https://umami.is/pricing | 2026-11-04 | Usage above allowance is extra. |
| F11 | Business price | $200/month; 10,000,000 included events/month; $0.00002/additional event | confirmed | Cloud Business, monthly | https://umami.is/pricing | 2026-11-04 | Replay billing is separate. |
| F11 | Enterprise price | Custom quote | confirmed | Cloud Enterprise | https://umami.is/pricing | 2026-11-04 | No fixed public tariff. |
| F11 | Feature gates | API and teams: Pro upward; replay and heatmaps: Business upward; self-host includes these | confirmed | Cloud versus self-hosted | https://docs.umami.is/docs/cloud | 2026-11-04 | Replay since v3.1; heatmaps since v3.2; paid cloud gates do not apply to MIT deployment. |
| F12 | Cost examples | Monthly scenarios below | confirmed | Stated workloads only | https://umami.is/pricing ; https://docs.umami.is/docs/cloud/faq | 2026-11-04 | Our calculation, not a vendor quote. |
| F13 | Paid overage rates | Pro $0.00003/event; Business $0.00002/event | confirmed | Cloud monthly paid | https://umami.is/pricing | 2026-11-04 | No forced upgrade assumed. |
| F13 | Spend control | Optional monthly USD budget; minimum equals base price; exceeding estimated budget stops recording until reset or budget increase/removal; email sent | confirmed | Monthly Pro and Business | https://docs.umami.is/docs/cloud/subscription | 2026-11-04 | Estimate excludes tax. Annual prepaid plans do not offer this budget control. |
| F13 | Hobby exhaustion | Exact collection, grace-period, reset, and upgrade behavior at 100,000 events not established | unclear | Cloud Hobby | https://umami.is/pricing ; https://docs.umami.is/docs/cloud/faq | 2026-11-04 | General overage FAQ promises continued collection, but Hobby has no published extra-event rate. Do not apply paid behavior to Hobby. |
| F14 | Site quotas | Hobby 1; Pro up to 20; Business/Enterprise unlimited | confirmed | Cloud | https://umami.is/pricing | 2026-11-04 | Per-plan websites. |
| F14 | Team member quotas | Pro up to 10; Business/Enterprise unlimited; Hobby has no team feature | confirmed | Cloud | https://umami.is/pricing ; https://docs.umami.is/docs/cloud | 2026-11-04 | Hobby single account is not an unlimited-seat offer. |
| F14 | Pooling | Usage page shows billing-period totals and entity breakdown; explicit per-site pooling contract not found | unclear | Cloud account | https://docs.umami.is/docs/cloud/usage | 2026-11-04 | Do not infer separate allowance for every website. |
| F15 | Traffic reports | Pageviews, visitors, referrers, locations, devices, real-time activity, UTM campaigns | confirmed | Web, both editions | https://docs.umami.is/docs | 2026-11-04 | Documented native reports. |
| F15 | Conversion reports | Goals, funnels, revenue, attribution | confirmed | All Cloud plans and self-hosted | https://docs.umami.is/docs/cloud | 2026-11-04 | Cloud feature comparison explicitly lists all plans. |
| F16 | Product reports | Custom events/properties, journeys, retention, segments, cohorts | confirmed | Both editions | https://docs.umami.is/docs | 2026-11-04 | Product analytics is documented. |
| F16 | Identity linking | Distinct ID via identify(), initial script attribute, or sending API; links sessions and devices without merging sessions | confirmed | Web/API | https://docs.umami.is/docs/distinct-ids | 2026-11-04 | 50-character ID limit. Earlier anonymous events need not belong to identified session; set ID from first request when possible. |
| F16 | Company/account reports and reset | Dedicated company-level identity and complete logout/reset contract not established | not_published | Product analytics | https://docs.umami.is/docs/distinct-ids | 2026-11-04 | User-level linked sessions do not prove B2B account analytics. |
| F17 | Replay platform/setup | Web recorder.js added separately; feature must be enabled | confirmed | Self-host v3.1+; Cloud Business/Enterprise | https://docs.umami.is/docs/replays | 2026-11-04 | Standard tracker alone is insufficient. |
| F17 | Replay quota | Business 5,000 included replays; $0.005/additional replay | confirmed | Cloud Business | https://umami.is/pricing | 2026-11-04 | Recurring-plan allowance; verify reset period before replay cost publication. |
| F17 | Capture defaults | Sample rate 0.15; max duration 300,000 ms (5 minutes) | confirmed | Web replay configuration | https://docs.umami.is/docs/replays | 2026-11-04 | Adjustable settings; not all visitor sessions recorded. |
| F17 | Masking | Moderate default masks all inputs; strict also masks page text; optional block selector excludes elements | confirmed | Web replay configuration | https://docs.umami.is/docs/replays | 2026-11-04 | No claim that default masks all page content. |
| F17 | Heatmaps | Click and scroll maps; sample rate 0.15; recorder required; grouped by screen width | confirmed | Self-host v3.2+; paid Cloud gates above | https://docs.umami.is/docs/heatmaps | 2026-11-04 | Live page overlay requires page framing permission; otherwise blank-canvas data remains available. |
| F18 | Native mobile coverage | Community Flutter integration listed; official native iOS/Android SDK, offline queue, and native replay parity not established | not_published | Native mobile | https://docs.umami.is/docs/integrations | 2026-11-04 | Addressed because Flutter is listed; web support does not establish native feature parity. |
| F19 | Event revenue | Send revenue and ISO 4217 currency properties; unknown currency defaults to USD; report aggregates by selected currency | confirmed | Web event revenue, both editions | https://docs.umami.is/docs/revenue | 2026-11-04 | No automatic exchange-rate conversion asserted. |
| F19 | Billing sources | Stripe, Paddle, Lemon Squeezy, Dodo Payments, Polar, WooCommerce; imports payments/refunds hourly after connection | confirmed | Cloud Pro/Business integrations | https://docs.umami.is/docs/cloud/payment-providers | 2026-11-04 | Checks previous 7 days for late changes; dedicated read-only credentials recommended. |
| F19 | Payment identity | umami_distinct_id metadata links revenue to visitor; Lemon Squeezy cannot supply that link | confirmed | Supported Cloud payment connections | https://docs.umami.is/docs/cloud/payment-providers | 2026-11-04 | Latest visit within 90 days used. |
| F19 | Recurring business metrics | MRR, churn, subscription cohorts, tax treatment and consolidated FX rules not established | not_published | Revenue reports | https://docs.umami.is/docs/revenue ; https://docs.umami.is/docs/cloud/payment-providers | 2026-11-04 | Payment attribution is not proof of subscription accounting. |
| F20 | Browser installation | Add website, copy tracker to head; automatic SPA navigation | confirmed | Browser | https://docs.umami.is/docs/collect-data | 2026-11-04 | No setup-time estimate or test performed. |
| F20 | Manual/server capture | identify and direct sending API can send custom IDs/events | confirmed | API capture | https://docs.umami.is/docs/distinct-ids | 2026-11-04 | Direct API is not a maintained native SDK claim. |
| F20 | Automatic/manual controls | data-auto-track=false disables initialization; data-auto-pageview=false keeps other tracking initialized | confirmed | Browser tracker | https://docs.umami.is/docs/tracker-configuration | 2026-11-04 | Manual event planning still needed for business actions. |
| F21 | Default visitor ID | Hash of website ID, IP, User-Agent, rotating salt; monthly salt rotation; no automatic linking across rotations | confirmed | Default anonymous analytics | https://docs.umami.is/docs/metric-definitions | 2026-11-04 | IP processed but not an analytics-session field; cookie-free does not guarantee anonymity. |
| F21 | Browser cookies/storage | Web tracker uses no cookies; optional localStorage umami.disabled opt-out flag | confirmed | Browser | https://docs.umami.is/docs/faq ; https://docs.umami.is/docs/exclude-my-own-visits | 2026-11-04 | Do not turn no cookies into a claim of no browser storage. |
| F21 | Optional persistent identity | Customer-supplied Distinct ID links cross-session/device activity | confirmed | Identified tracking | https://docs.umami.is/docs/distinct-ids | 2026-11-04 | Customer chooses identifier and personal data sent. |
| F22 | Vendor consent claims | Pricing claims no personal data/banner needed; FAQ says compliance depends on configuration and website's other services/applicable requirements | conflicting | Website use | https://umami.is/pricing ; https://docs.umami.is/docs/faq | 2026-11-04 | Broad marketing is not a jurisdiction-specific consent ruling. |
| F22 | Controls | DNT option; before-send hook can cancel payload | confirmed | Browser tracker settings | https://docs.umami.is/docs/tracker-configuration | 2026-11-04 | DNT limited/deprecated; documentation says not a full consent-management solution. |
| F22 | Visitor opt-out | Set localStorage umami.disabled=1 per website/browser | confirmed | Browser | https://docs.umami.is/docs/exclude-my-own-visits | 2026-11-04 | Manual exclusion, not a full consent banner implementation. |
| F23 | Storage region | US or EU selected at setup; read-only later; contact support about change | confirmed | Cloud analytics storage | https://docs.umami.is/docs/cloud/faq | 2026-11-04 | CDN, security, support, logs may process elsewhere. |
| F23 | Named hosting countries | United States and Germany | confirmed | Hosted service | https://umami.is/terms | 2026-11-04 | Section 10; not a promise of all processing remaining there. |
| F23 | DPA | Public data processing agreement available | confirmed | Cloud customer analytics | https://umami.is/dpa | 2026-11-04 | Contract for data processed on customer behalf. |
| F23 | Processors | Public list includes ClickHouse (USA/EU), Hetzner (EU), AWS, Cloudflare, Axiom, Vercel and others | confirmed | Hosted service | https://umami.is/subprocessors | 2026-11-04 | List dated April 24, 2026. Detailed role-by-region mapping not established. |
| F23 | Backup locations | Exact backup geography not established | not_published | Cloud | https://umami.is/dpa ; https://docs.umami.is/docs/cloud/faq | 2026-11-04 | Analytics region does not establish backup or complete processing geography. |
| F24 | Standard collected fields | URL/path/query, referrer, title, event name, browser, OS, screen, device, language, approximate location | confirmed | Standard analytics | https://docs.umami.is/docs/metric-definitions | 2026-11-04 | IP can appear in operational/security logs despite absence from analytics field. |
| F24 | Redaction before collection | Exclude URL search/hash; before-send can modify or reject payload | confirmed | Configured browser tracker | https://docs.umami.is/docs/tracker-configuration | 2026-11-04 | Must configure; not proof all sensitive query data is excluded by default. |
| F24 | Error capture privacy | Opt-in error tracking omits URL query/hash; best-effort secret/email redaction; no console logs, request bodies, cookies or local variables | confirmed | Error capture only | https://docs.umami.is/docs/error-tracking | 2026-11-04 | Different from normal pageview URL collection; docs mark feature v3.5.0. |
| F24 | Account removal | Settings > Account > Delete account removes websites, teams, analytics; cancels paid subscription | confirmed | Cloud | https://docs.umami.is/docs/cloud/delete-account | 2026-11-04 | Permanent removal warning; backup handling separately below. |
| F24 | Individual visitor erasure | Exact per-visitor deletion UI/API and completion time not established | not_published | Cloud analytics | https://docs.umami.is/docs/cloud/delete-account ; https://umami.is/dpa | 2026-11-04 | Whole-account deletion is documented; not equivalent to a single-person route. |
| F25 | Analytics history | Hobby 6 months; Pro 2 years; Business 5 years; Enterprise custom | confirmed | Cloud production analytics | https://docs.umami.is/docs/cloud/faq | 2026-11-04 | Not replay or backup retention. |
| F25 | Replay history | 30 days | confirmed | Web replays | https://docs.umami.is/docs/replays | 2026-11-04 | Saving marks a replay for access; no stated extension of this period. |
| F25 | Self-host history | Indefinite unless manually deleted | confirmed | Self-hosted analytics | https://docs.umami.is/docs/faq | 2026-11-04 | Generic analytics answer; replay-specific 30-day rule remains separate. |
| F25 | Cancellation | Non-refundable; effective at current paid-term end | confirmed | Cloud subscription | https://umami.is/terms | 2026-11-04 | Section 7. |
| F25 | Backups | Residual copies isolated from ordinary use and deleted under ordinary backup/retention cycles; legal exceptions | confirmed | Cloud deleted customer data | https://umami.is/dpa | 2026-11-04 | Section 8.3 does not state a numeric cycle. |
| F25 | Other retention and grace | Numeric backup limit, cancellation retrieval window, export-link lifetime, separate heatmap/event-total retention not established | not_published | Cloud | https://umami.is/dpa ; https://docs.umami.is/docs/cloud/faq ; https://docs.umami.is/docs/cloud/export-data | 2026-11-04 | Export before leaving; no invented grace period. |
| F26 | Raw export | Gzip CSV of selected website's pageviews, events, sessions, event data; emailed download link | confirmed | Cloud | https://docs.umami.is/docs/cloud/export-data | 2026-11-04 | One website at a time; contact support for large exports. |
| F26 | API | JSON application API; self-host authenticated /api; Cloud API key | confirmed | Self-host; Cloud paid plans | https://docs.umami.is/docs/api | 2026-11-04 | Cloud access gate documented in edition comparison. |
| F26 | Cloud API limit | 50 calls per 15 seconds per API key; /users routes and /me/password unavailable | confirmed | Cloud API | https://docs.umami.is/docs/cloud/api-key | 2026-11-04 | Endpoint https://api.umami.is/v1; US/EU region prefixes documented. |
| F26 | Egress/export fees | Separate export or egress tariff not established | not_published | Cloud | https://docs.umami.is/docs/cloud/export-data | 2026-11-04 | No fee mention is not proof of free unlimited exports. |
| F27 | Historical import | Team-assisted import from self-host PostgreSQL exports and CSV; Pro upward | confirmed | Cloud | https://docs.umami.is/docs/cloud/import-data | 2026-11-04 | Existing Cloud data unaffected; source/volume coordinated with team. |
| F27 | Named migrations | Platform advertises Google Analytics, Plausible, Matomo; exact formats, lookback and loss of detail not stated there | unclear | Historical migration | https://umami.is/platform ; https://docs.umami.is/docs/cloud/import-data | 2026-11-04 | Named migration claim supported; not proof of self-serve native connectors. |
| F28 | Bot handling | Bots excluded by default; DISABLE_BOT_CHECK changes self-host behavior | confirmed | Self-host runtime | https://docs.umami.is/docs/environment-variables | 2026-11-04 | Vendor filtering claim, not measured accuracy. |
| F28 | Internal traffic | Browser-local exclusion flag; self-host IGNORE_IP supports IPs/CIDR ranges | confirmed | Configured browser/self-host | https://docs.umami.is/docs/exclude-my-own-visits ; https://docs.umami.is/docs/environment-variables | 2026-11-04 | Defaults and exclusions affect totals. |
| F28 | Collection misses | Blockers can stop script loading; proxies can alter identification/location | confirmed | Web tracker | https://docs.umami.is/docs/collect-data ; https://docs.umami.is/docs/metric-definitions | 2026-11-04 | Shared IP/browser can combine users; IP/browser changes can split one visitor. |
| F28 | Analytics sampling | Explicit general pageview/report sampling guarantee not established | not_published | Standard analytics | https://docs.umami.is/docs/metric-definitions | 2026-11-04 | Replay/heatmap sampling is documented separately; not a guarantee about all reports. |
| F29 | Script weight | Comparable current byte size, compression, version and recorder overhead not established | not_published | Browser tracker/recorder | https://docs.umami.is/docs/collect-data ; https://docs.umami.is/docs/replays | 2026-11-04 | Checked platform/home and targeted official-site size searches too. No measurement performed. |
| F30 | Dependencies | Node.js >=20.19 (22 LTS recommended); PostgreSQL >=12.14; pnpm; source/Docker options | confirmed | Current self-host install guide | https://docs.umami.is/docs/install | 2026-11-04 | Change default admin password; operator supplies database/server. |
| F30 | Upgrades | Pull source, install, build, restart; or pull/recreate Docker; refresh DB statistics after major upgrades | confirmed | Self-hosted | https://docs.umami.is/docs/updates | 2026-11-04 | Owner operates upgrades and backups. |
| F30 | Release observed | Latest release endpoint resolves to v3.4.1, a security hotfix recommending self-host upgrades | confirmed | GitHub release at check | https://github.com/umami-software/umami/releases/tag/v3.4.1 | 2026-11-04 | Release notes mention October 2026 fixes. Some docs describe v3.5.0 features; do not assume available in this release. |
| F30 | Machine resources and support lifecycle | Minimum RAM/CPU/disk, supported-release window and paid extension requirements not established | not_published | Self-hosted | https://docs.umami.is/docs/install ; https://docs.umami.is/docs/updates | 2026-11-04 | No hosting-price estimate without workload. |
| F31 | Public documentation/support | Public docs; GitHub Discussions/issues and Discord | confirmed | Product/community | https://docs.umami.is/docs/faq | 2026-11-04 | Support channels documented without signup to read docs. |
| F31 | Public demo | Current working no-account demo URL not established | not_published | Dashboard | https://umami.is/ ; https://umami.is/platform | 2026-11-04 | Did not use dashboard screenshots as proof of interactive demo. |
| F31 | Paid support | Pro email; Business email/chat; Enterprise support | confirmed | Cloud | https://umami.is/pricing | 2026-11-04 | Hobby community support. |
| F32 | Detection class | C: conditional; proposed rules below | confirmed | Public website evidence | https://docs.umami.is/docs/tracker-configuration ; https://docs.umami.is/docs/bypass-ad-blockers | 2026-11-04 | Documentation supports visibility limits; no measured detection accuracy. |
| F33 | Fit and limits | Web traffic and product behavior share reports; managed replay requires Business; self-hosting shifts upkeep to owner | confirmed | Editorial inference from sourced facts | https://docs.umami.is/docs/cloud | 2026-11-04 | Inference about fit, not a ranking or personal test. |
| F01 | News check 2026-11-09 | News check 2026-11-09: no sale, shutdown, rebrand, product pivot away, signups closed, major paid-feature retirement, customer-data breach, regulatory action, or licence change found. The official 2026 product update says both Umami Cloud and self-hosting continue. | not_published | Lifecycle and trust sweep | https://umami.is/blog<br>https://umami.is/blog/umami-today-2026<br>https://docs.umami.is/docs/cloud/changelog<br>https://github.com/umami-software/umami/releases<br>https://status.umami.is/ | 2026-11-09 | Quick news search since January 2025 found no qualifying product change. Official blog, Cloud changelog and project releases were checked; the candidate status URL was not accessible. |

## Cost examples

Our calculation, checked 2026-11-04. Inputs: [monthly tariff](https://umami.is/pricing), [usage counting rules](https://docs.umami.is/docs/cloud/faq), and [tax/currency terms](https://umami.is/terms). USD, before tax; one site, one user; no replay, paid integrations, custom properties, or stored session properties. A pageview contributes one billable event in this scenario. No event-to-user conversion.

Formula: `base + max(0, billable events - included events) × additional-event rate`.

| Job | Monthly workload | Plan | Formula | Result, USD/month |
| --- | --- | --- | --- | --- |
| Website | 10,000 pageviews | Hobby | 0 within allowance | $0 |
| Website | 100,000 pageviews | Hobby | 0 within allowance | $0 |
| Website | 1,000,000 pageviews | Pro | 20 + 0 | $20 |
| Product | 100,000 events, zero properties | Hobby | 0 within allowance | $0 |
| Product | 1,000,000 events, zero properties | Pro | 20 + 0 | $20 |
| Product | 10,000,000 events, zero properties | Business | 200 + 0 | $200 |
| Product alternative | 10,000,000 events, zero properties | Pro | 20 + (10,000,000 - 1,000,000) × 0.00003 | $290 |
| Property scenario | 100,000 pageviews + 100,000 custom events each storing two properties | Pro | Billable events = 100,000 + 100,000 + 2 × 100,000 = 400,000; price = 20 + 0 | $20 |

Hobby scenarios exactly at its quota leave no room for extra events or properties. Workloads assume no paid-only feature is required. No automatic plan-switching assumed.

Replay estimates are withheld: [pricing](https://umami.is/pricing) gives a 5,000-replay allowance and marginal price but does not explicitly label the allowance reset period. [Replay docs](https://docs.umami.is/docs/replays) specify default 15% capture, five-minute maximum and 30-day retention. A fair replay scenario also needs a defined event workload for the shared Cloud bill. Native MAU and MRR scenarios are not comparable to this event tariff. Self-host software is MIT; hosting/operations cost is not estimated or ranked at $0.

## Public detection rules

No crawl was run. These are candidate rules for later implementation, not observed installs. Checked 2026-11-04; product ID `umami`; current brand Umami; company Umami Software, Inc.; no legacy alias established.

| Rule | Edition and signal | Bounded match and location | Primary source and short evidence | Confidence | Exclusions and misses |
| --- | --- | --- | --- | --- | --- |
| UMAMI-CLOUD-1 | Default Cloud browser tracker | Actual executable script element; parsed URL hostname exactly cloud.umami.is, pathname exactly /script.js; nonempty data-website-id. Allow query string without broadening host/path. | https://umami.is/blog/umami-cloud-error-tracking-integrations ; 2026-11-04; official October 27 snippet contains src="https://cloud.umami.is/script.js" and data-website-id. | Strong product-specific install evidence; overall class C | Exclude comments, escaped snippets, documentation/code examples, logos and text mentions. Presence does not prove successful collection or any particular paid feature. |
| UMAMI-CUSTOM-2 | Self-hosted or first-party/proxied tracker | data-website-id plus corroborating Umami-specific configuration or identifiable tracker code in already fetched assets. No final generic code fingerprint validated. | https://docs.umami.is/docs/tracker-configuration ; 2026-11-04; documents data-host-url override and website ID. https://docs.umami.is/docs/bypass-ad-blockers ; 2026-11-04; script and endpoint can be renamed/proxied. | Supporting evidence only until product-specific corroboration; C | data-website-id, UUID, /script.js, or /api/send alone are insufficient. Custom domain and script filename can hide default Cloud signal. |
| UMAMI-RECORDER-3 | Replay/heatmap recorder | Executable recorder.js script with website ID plus corroborated Umami endpoint or tracker. Do not identify from filename alone. | https://docs.umami.is/docs/replays ; https://docs.umami.is/docs/heatmaps ; 2026-11-04; recorder is separate from tracking script. | Supporting evidence only | Cannot infer paid plan, recording success, or whether both heatmaps and replay are enabled. |

Additional misses: consent-gated or delayed scripts, login-only app pages, bundled packages, first-party copies, custom collector endpoint, native/community SDK, server-only collection, and trackers absent from the sampled homepage. gateway.umami.is is documented ingestion infrastructure in the [proxy guide](https://docs.umami.is/docs/bypass-ad-blockers), not a reason to count an unrelated text mention. No positive/negative sample set, tested detector version, measured accuracy, or confirmed misses exists yet.

## Conflicts and unknowns

- **Consent and personal data:** [pricing](https://umami.is/pricing) makes blanket anonymization/no-banner claims. The [FAQ](https://docs.umami.is/docs/faq) makes compliance depend on use. [Metric definitions](https://docs.umami.is/docs/metric-definitions) describe IP processing and possible operational logs; [Distinct IDs](https://docs.umami.is/docs/distinct-ids) allow persistent linking. Preserve the conflict; no legal conclusion assigned.
- **Monthly versus annual:** [pricing](https://umami.is/pricing) says monthly billing, while the [Cloud FAQ](https://docs.umami.is/docs/cloud/faq) and [subscription guide](https://docs.umami.is/docs/cloud/subscription) discuss annual plans. Annual price/terms remain unknown.
- **Overage interruption:** pricing's general uninterrupted-collection wording has a documented budget-stop exception in the subscription guide. This is a conditional exception, not proof of unavoidable uninterrupted collection. Hobby exhaustion remains unclear.
- **Release scope:** [latest release](https://github.com/umami-software/umami/releases/tag/v3.4.1) is v3.4.1 while [error docs](https://docs.umami.is/docs/error-tracking) label error tracking v3.5.0. The [Cloud launch notice](https://umami.is/blog/umami-cloud-error-tracking-integrations) supports Cloud availability. Exact self-host stable-release availability of newer features is unresolved.
- **Import detail:** platform names GA, Plausible and Matomo; import guide describes team-assisted CSV/database import. A named migration claim is not a documented dedicated import connector. Limits, lookback and field mapping remain unknown.
- Unknown searches: home/platform/terms/releases for old names and owner events; terms/signup for country restrictions; subscription/pricing/Cloud FAQ for card, annual price and Hobby exhaustion; DPA/Cloud FAQ/deletion/export for backup geography, deletion timings and retrieval windows; install/updates for machine minimums and support window; integrations/current docs for native SDK/offline parity and dashboard languages; home/platform plus official-site script-size searches for script size/demo. Pages checked are linked in the relevant fact rows.

## Field problems

- F01 to F33 are groups, not atomic fields. Several have confirmed and unknown parts. Counts below distinguish group coverage from evidence-row states.
- F08/F12 need the stored-property billing rule. A price per pageview hides this cost.
- F17 needs separate collection defaults, replay retention, quota reset period and edition. A simple replay yes/no field loses useful facts.
- F18 applies only cautiously: community Flutter support does not establish a vendor native mobile product.
- F19 mixes revenue attribution with recurring subscription accounting. Keep these uses separate.
- F22 cannot be reduced to a universal consent exemption. Sources disagree in how broadly they state privacy claims.
- F25 must preserve the replay-specific 30-day rule beside generic analytics retention. Saved replay retention and heatmap history were not resolved.
- F29 has no comparable current size found. Leave it unknown rather than using an old unqualified marketing number.
- F32 has no validated universal self-host fingerprint. Generic attributes are weak evidence. No crawl or validation performed.

## Counts

- Field groups attempted: 33 of 33 (F01 to F33), including conditional and optional groups.
- Evidence rows: 95. A group can contribute several states.
- confirmed: 74 evidence rows.
- not_published: 16 evidence rows.
- unclear: 3 evidence rows.
- conflicting: 2 evidence rows.
- not_applicable: 0 evidence rows.
- check_failed: 0 evidence rows.
