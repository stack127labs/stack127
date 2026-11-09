# Mixpanel

- Official URL: https://mixpanel.com/
- apps.md status: `active`; research marker: `Prompt`; detection: `C`; row checked date: 2026-11-04.
- Research started: 2026-11-04 13:10:45 UTC (`date -u`).
- Research finished: 2026-11-04 13:20:49 UTC (`date -u` run again at completion).
- Minutes taken: 10.07 minutes (elapsed seconds / 60, rounded to two decimals).
- Scope: public official documents only. No crawl, installation, account creation, login, forms, script measurement, or behavior test.
- Row assessment: product/mobile/replay categories and conditional detection match the evidence. Owner can be updated from Unknown to Mixpanel, Inc. Web analytics, heatmaps, experiments and flags are additional supported jobs. No clear row error found.

## Facts

Confirmed means vendor-documented, not independently tested. `not_published` means not found in pages checked. Each row states its edition, platform, plan or settings under applies to. Historical plans can differ from current plans.

| Field ID | Field name | Value | State | Applies to | Exact source URL | Checked date | Evidence note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | Name and operating entity | Mixpanel; Mixpanel, Inc. | confirmed | Hosted service | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | Current terms name contracting company. |
| F01 | Availability | Free signup and online Growth purchase offered | confirmed | Current Cloud plans | https://mixpanel.com/pricing/ | 2026-11-04 | Public entry paths, not account-tested. |
| F01 | Ownership history | Former names, acquisition/closure notices and ultimate parent not established | not_published | Product | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | Terms and current product/pricing/docs checked. |
| F02 | Primary category | Product analytics | confirmed | Product | https://docs.mixpanel.com/docs/what-is-mixpanel | 2026-11-04 | Introduction describes event-based product analysis. |
| F02 | Other jobs | Web/mobile analytics, replay, heatmaps, experiments and feature flags | confirmed | Feature and plan limits apply | https://mixpanel.com/pricing/ | 2026-11-04 | Overlap tags are our classification of listed products. |
| F03 | Official SDK platforms | JavaScript, Android, Swift, React Native, Flutter, Unity; server libraries include Python, Node.js, Ruby, PHP, Go, Java | confirmed | SDK integrations | https://docs.mixpanel.com/docs/tracking-methods/sdks | 2026-11-04 | Client and server libraries are different capture paths. |
| F03 | Desktop | Electron replay supported | confirmed | Replay | https://docs.mixpanel.com/docs/session-replay | 2026-11-04 | Does not establish every desktop framework. |
| F03 | Site builders and dashboard languages | Complete builder/plugin support and dashboard-language lists not established | not_published | Web/dashboard | https://docs.mixpanel.com/docs/tracking-methods/sdks | 2026-11-04 | A website script is not proof of a maintained WordPress plugin. |
| F04 | Account use and restrictions | Internal business use; authority to bind customer; export/sanctions restrictions | confirmed | Hosted service | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | Sections 1 and 9.3; no exhaustive eligible-country list inferred. |
| F04 | Country and account prerequisites | Exhaustive country list and minimum account age not established | not_published | Cloud account | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | Sanctions clause is conditional, not a country availability table. |
| F05 | Entry route | Free signup https://mixpanel.com/register/; no credit card | confirmed | Free | https://mixpanel.com/pricing/ | 2026-11-04 | Enterprise uses sales quote. |
| F06 | Deployment | Vendor cloud; default US or configured regional storage | confirmed | Hosted analytics | https://docs.mixpanel.com/docs/privacy/eu-residency | 2026-11-04 | Documentation identifies Google Cloud Platform US servers by default. |
| F06 | Self-host/private deployment | Full analytics server self-host offer or private deployment not established | not_published | Product editions | https://docs.mixpanel.com/docs/tracking-methods/first-party-domains | 2026-11-04 | Self-hosted proxy is documented; that does not self-host the analytics backend. |
| F07 | Service license | Proprietary hosted service access under commercial terms | confirmed | Analytics service | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | Limited access rights; Mixpanel reserves service intellectual property. |
| F07 | SDK license | Apache-2.0, mixpanel/mixpanel-js | confirmed | JavaScript SDK, master checked | https://github.com/mixpanel/mixpanel-js/blob/master/LICENSE | 2026-11-04 | SDK license does not make the hosted product open source. |
| F08 | Meter and pooling | Monthly qualifying events across organization projects; normally ingestion-time billing | confirmed | Current event-billed plans | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Some legacy accounts use event timestamps. |
| F08 | Excluded usage | Identify, alias, merge, opt-in, recording-checkpoint events and profile updates excluded | confirmed | Monthly event tally | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Replay has separate quota. |
| F08 | Currency/payment | US dollars; billed in advance; default credit-card billing unless order says otherwise | confirmed | Paid subscriptions | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | Non-refundable during term; country-specific Israeli VAT responsibility appears in Schedule 1. |
| F08 | Tax | General worldwide tax-inclusive/exclusive treatment not established | not_published | Public tariff | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | Examples exclude any tax; no universal tax rate assumed. |
| F09 | Free hosted allowance | $0/month; 1M events/month; 10K replays/month; unlimited seats | confirmed | Current Free | https://mixpanel.com/pricing/ | 2026-11-04 | Permanent free plan. |
| F09 | Saved-work limits | 5 saved reports/seat; cohorts cannot be saved | confirmed | Free | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Not an unlimited-workspace claim. |
| F09 | Ambiguous quota wording | Docs say both “1M total events” and “1M monthly events” | unclear | Free | https://docs.mixpanel.com/docs/pricing/ ; https://mixpanel.com/pricing/ | 2026-11-04 | Monthly interpretation corroborated by reset policy; preserve isolated ambiguous sentence. |
| F10 | Main trial | Free plan has no trial needed | confirmed | Main product | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | No automatic Free-plan expiry inferred. |
| F10 | Add-on trial | Data Pipelines has a 30-day trial | confirmed | Data Pipelines | https://docs.mixpanel.com/docs/export-methods/export-all-data | 2026-11-04 | Separate from permanent free analytics. |
| F10 | Add-on trial conditions | Card rule, trial caps and expiry/deletion behavior not established | not_published | Data Pipelines trial | https://docs.mixpanel.com/docs/export-methods/export-all-data | 2026-11-04 | Duration alone is not full trial terms. |
| F11 | Growth tariff | 1M/month: $0; 1.5M: $140/month or $1,200/year; 10M: $1,176/month or $10,080/year | confirmed | Current Growth event volume | https://mixpanel.com/pricing/ | 2026-11-04 | Annual equivalents: $100 and $840/month, billed yearly. |
| F11 | Enterprise tariff | Custom quote | confirmed | Enterprise | https://mixpanel.com/pricing/ | 2026-11-04 | No single public all-in price. |
| F11 | B2B add-on | Group Analytics available on Growth/Enterprise | confirmed | Paid add-on | https://docs.mixpanel.com/docs/data-structure/group-analytics | 2026-11-04 | Company-level unit of measurement. |
| F11 | Legacy/user-priced offer | MTU Enterprise starts $20,000/year; sales only | confirmed | Alternative Enterprise meter | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | MTU means monthly tracked users; not used for event examples. |
| F12 | Derived costs | See scenarios below | confirmed | Explicit workloads | https://mixpanel.com/pricing/ | 2026-11-04 | Our calculations, not quotes. |
| F13 | Free excess | Collection continues; reports blocked at quota until upgrade or next month; no overage charge | confirmed | Free | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Access loss differs from collection loss. |
| F13 | Paid excess | Base 1M Growth additional rate $0.00028/event; add-on overages: pipelines +20%, groups +40% | confirmed | 1M Growth plan | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Higher committed volumes have different account rates. |
| F13 | Alerts | Emails at 85%, 100%, 110%, 120%, 200%, 300%, 400% of paid plan volume | confirmed | Paid organization | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Owners/billing admins and invoice CCs. |
| F13 | Hard budget cap | Automatic spend cap not established | not_published | Growth | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Alerts do not guarantee a hard cap. |
| F14 | Seats | Unlimited | confirmed | Free/Growth/Enterprise | https://mixpanel.com/pricing/ | 2026-11-04 | Access permissions can still vary. |
| F14 | Project cap and site count | Explicit per-plan project/site count cap and extra-project price not established | not_published | Organization | https://docs.mixpanel.com/docs/orgs-and-projects/managing-projects | 2026-11-04 | Multiple projects documented; not proof of unlimited. Events pooled as F08. |
| F15 | Web acquisition reports | Native web analytics and campaign reporting; multi-touch attribution on paid plans | confirmed | Current plan comparison | https://mixpanel.com/pricing/ | 2026-11-04 | Does not make event configuration unnecessary. |
| F15 | Website dimensions | Browser/OS, device, location and URL dimensions | confirmed | SDK-specific defaults | https://docs.mixpanel.com/docs/data-structure/property-reference/default-properties | 2026-11-04 | Defaults differ by SDK. |
| F15 | Goals/realtime details | Separate goal-object limits and exact real-time report freshness not established | not_published | Web reports | https://docs.mixpanel.com/docs/reports | 2026-11-04 | Funnels are documented; not equated to a separate goals feature. |
| F16 | Product reports | Insights, Funnels, Flows, Retention | confirmed | Core analysis | https://docs.mixpanel.com/docs/reports | 2026-11-04 | Event frequency, conversion, paths and return behavior. |
| F16 | Anonymous/login linkage | Simplified ID Merge uses device_id/user_id; first shared event creates mapping | confirmed | Simplified ID Merge projects | https://docs.mixpanel.com/docs/tracking-methods/id-management/identifying-users-simplified | 2026-11-04 | Original ID Merge projects have separate behavior. |
| F16 | Logout reset | reset() clears cookie/local storage and creates new distinct ID | confirmed | JavaScript SDK | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript | 2026-11-04 | Call on logout to separate shared-device users. |
| F16 | Account reports | Group Analytics measures grouped users, including companies | confirmed | Growth/Enterprise add-on | https://docs.mixpanel.com/docs/data-structure/group-analytics | 2026-11-04 | Explicit company/account analysis, not merely a company profile string. |
| F17 | Replay platforms/allowance | Web, iOS, Android, React Native, Electron; Free 10K, Growth/Enterprise 20K monthly included | confirmed | Latest eligible plans | https://docs.mixpanel.com/docs/session-replay | 2026-11-04 | Free allowances reset monthly, no rollover. Flutter has a separate guide in docs index. |
| F17 | Web capture defaults | 0% SDK initializations; max 86,400,000 ms (24 hours); minimum 0 ms | confirmed | Web replay config | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript/javascript-replay | 2026-11-04 | Must enable capture; maximum reached starts new replay. |
| F17 | Web masking | Inputs/non-input text masked by default; configurable masking/blocking suppresses original data client-side | confirmed | Web replay | https://docs.mixpanel.com/docs/session-replay/session-replay-privacy-controls | 2026-11-04 | Interactions with masked/blocked elements still captured. |
| F17 | Heatmaps | Web click maps/coordinate maps; replay capture required; clicks only from recorded sessions | confirmed | Web heatmaps | https://docs.mixpanel.com/docs/session-replay/heatmaps | 2026-11-04 | Enabled heatmap data adds no billable events; dynamic layouts can distort coordinate maps. |
| F17 | Scroll/native heatmaps | Scroll maps and native heatmap feature parity not established | not_published | Heatmaps | https://docs.mixpanel.com/docs/session-replay/heatmaps | 2026-11-04 | Do not infer from click heatmaps. |
| F17 | Replay upgrade price | Numeric tariff beyond included replay quota not established | not_published | Paid replay add-on | https://mixpanel.com/pricing/ ; https://docs.mixpanel.com/docs/session-replay | 2026-11-04 | Public quota is not a marginal replay price. |
| F18 | Mobile SDKs | Official Android/Swift, React Native, Flutter; Objective-C deprecated | confirmed | Native collection | https://docs.mixpanel.com/docs/tracking-methods/sdks ; https://docs.mixpanel.com/docs/tracking-methods/sdks/ios | 2026-11-04 | Objective-C guide explicitly says deprecated; use Swift for new projects. |
| F18 | iOS replay versions | 2.x: iOS 15+, Xcode 26/27; 1.x: iOS 13+, Xcode 26, critical fixes until April 2027 | confirmed | iOS replay | https://docs.mixpanel.com/docs/tracking-methods/sdks/swift/swift-replay | 2026-11-04 | Separate replay package; analytics SDK alone does not establish recording. |
| F18 | Android replay | Minimum API 21; Compose masking limited; WebView masking all-or-none | confirmed | Android replay | https://docs.mixpanel.com/docs/tracking-methods/sdks/android/android-replay | 2026-11-04 | Manual sensitive-view marking may be needed. |
| F18 | Native masking | Inputs always masked; text/images/WebViews masked by default; Android replay config sampling defaults 100% | confirmed | Android replay | https://docs.mixpanel.com/docs/tracking-methods/sdks/android/android-replay | 2026-11-04 | Differs from Web's 0% default. |
| F18 | iOS masking | Input text cannot be unmasked; text/images/WKWebViews/MKMapViews masked by default | confirmed | iOS replay | https://docs.mixpanel.com/docs/tracking-methods/sdks/swift/swift-replay | 2026-11-04 | Custom drawing needs explicit review; do not claim automatic masking covers all content. |
| F18 | Mobile batching | Analytics events batch every 60 seconds and on background; manual flush available | confirmed | Swift/Android | https://docs.mixpanel.com/docs/tracking-methods/sdks/swift ; https://docs.mixpanel.com/docs/tracking-methods/sdks/android | 2026-11-04 | Swift 6.8+ flushes pending events on initialization unless flush interval zero. |
| F18 | Offline guarantees | Exact offline queue cap, retry lifetime and replay parity not established | not_published | Mobile SDKs | https://docs.mixpanel.com/docs/tracking-methods/sdks/swift ; https://docs.mixpanel.com/docs/tracking-methods/sdks/android | 2026-11-04 | Batching is not proof of unlimited offline storage. |
| F19 | Revenue scope | Purchase-event revenue can be attributed to campaigns | confirmed | Product event analytics | https://docs.mixpanel.com/docs/tracking-methods/id-management/identifying-users-simplified | 2026-11-04 | Not proof of a turnkey subscription ledger. |
| F19 | Revenue accounting detail | Native billing-source matrix, MRR/churn/refund/tax/FX definitions not established | not_published | Revenue analysis | https://docs.mixpanel.com/docs/reports ; https://docs.mixpanel.com/docs/tracking-methods/id-management/identifying-users-simplified | 2026-11-04 | Custom event calculations are not standardized accounting metrics. |
| F20 | Installation/capture | CDN script or npm package; track() for explicit events | confirmed | JavaScript | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript | 2026-11-04 | Requires project token; no claimed setup-time score. |
| F20 | Autocapture | Configurable pageviews, clicks, form interactions | confirmed | Enabled JavaScript autocapture | https://docs.mixpanel.com/docs/tracking-methods/autocapture | 2026-11-04 | Autocapture off does not turn replay off. |
| F20 | Server capture | Server SDKs alongside client SDKs | confirmed | Server APIs | https://docs.mixpanel.com/docs/tracking-methods/sdks | 2026-11-04 | Server-only collection may be invisible in public HTML. |
| F21 | Web persistence | Cookies or configured localStorage; documented cookie lifetime 365 days; cross-subdomain cookie support | confirmed | JavaScript SDK | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript | 2026-11-04 | LocalStorage does not share identity across subdomains. Configurable, not daily-reset IDs. |
| F21 | User identity | Device ID for anonymous visitor; customer user ID links identified activity | confirmed | Simplified ID Merge | https://docs.mixpanel.com/docs/tracking-methods/id-management/identifying-users-simplified | 2026-11-04 | Cross-device user recognition depends on supplying consistent IDs. |
| F22 | Consent position | Customer responsible for lawful notice/consent | confirmed | Hosted collection | https://mixpanel.com/legal/terms-of-use/ | 2026-11-04 | No blanket no-banner exemption recorded. |
| F22 | Controls | opt_out_tracking_by_default, opt-in/out methods; persistent opt-out flag | confirmed | Client SDKs | https://docs.mixpanel.com/docs/privacy/protecting-user-data | 2026-11-04 | Mobile opt-out deletes unsent queue. Server events require separate consent logic. |
| F23 | US/EU storage | Default US GCP; EU processing/storage option at project creation using api-eu.mixpanel.com | confirmed | Configured residency | https://docs.mixpanel.com/docs/privacy/eu-residency | 2026-11-04 | Wrong endpoint can prevent EU ingestion; old US forwarding ended July 2026 for most affected projects. |
| F23 | India storage | India processing/storage; contact account manager; api-in.mixpanel.com required | confirmed | India residency | https://docs.mixpanel.com/docs/privacy/in-residency | 2026-11-04 | DPA describes India as purchased option; region choice is not account-country eligibility. |
| F23 | DPA and processors | Public DPA and linked authorized subprocessor list | confirmed | Hosted customer data | https://mixpanel.com/legal/dpa/ ; https://mixpanel.com/legal/subprocessor-list/ | 2026-11-04 | DPA governs third-country transfers; no claim all support processing stays in chosen storage region. |
| F23 | Backups and full processing geography | Exact backup locations and full regional support/log processing map not established | not_published | Cloud | https://mixpanel.com/legal/dpa/ ; https://docs.mixpanel.com/docs/privacy/eu-residency | 2026-11-04 | Residency headline alone does not answer backup location. |
| F24 | Default analytics data | Event/user IDs, browser/OS, device, URL, referrer and location, depending on SDK | confirmed | SDK-specific | https://docs.mixpanel.com/docs/data-structure/property-reference/default-properties | 2026-11-04 | Custom user properties may contain customer details. |
| F24 | IP handling | IP used for geolocation, not stored per privacy guide; configurable disabling | confirmed | Web/mobile SDK analytics | https://docs.mixpanel.com/docs/privacy/protecting-user-data | 2026-11-04 | Guide's analytics claim is not independently tested or a guarantee about all infrastructure logs. |
| F24 | Autocapture controls | Inputs/text excluded by default; mp-no-track/mp-sensitive and selector/URL blocking | confirmed | Autocapture | https://docs.mixpanel.com/docs/tracking-methods/autocapture | 2026-11-04 | Default HTML attributes still collected; review configuration for sensitive sites. |
| F24 | Replay extra data | Web console capture defaults true; network capture false, metadata-only when enabled unless headers/bodies configured | confirmed | Web recorder | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript/javascript-replay | 2026-11-04 | Visual masking alone does not describe all recorder data. |
| F24 | End-user removal/export | Deletion API available to all; personal export via Data & Privacy settings | confirmed | Personal data rights | https://docs.mixpanel.com/docs/privacy/gdpr-compliance | 2026-11-04 | Profile deletion and full end-user event erasure are distinct operations. |
| F25 | Event history | 2 years from event date; pre-2025-09-01 projects keep 5 years until plan modification or move to Free | confirmed | Production analytics | https://docs.mixpanel.com/docs/privacy/gdpr-compliance | 2026-11-04 | Missing event date uses received date. |
| F25 | Profile history | User data retained during active subscription; profile deletion via Engage API | confirmed | Profiles | https://docs.mixpanel.com/docs/privacy/gdpr-compliance | 2026-11-04 | Not the same as event lifetime. |
| F25 | Replay history | Default 30 days from ingestion; Enterprise paid replay add-on can configure 7 to 360 days | confirmed | Session Replay | https://docs.mixpanel.com/docs/session-replay | 2026-11-04 | Must set UI retention after entitlement provisioned. |
| F25 | Add-on removal | Group analysis stops immediately; group data recoverable for 45 days, then permanently deleted | confirmed | Group Analytics removal | https://docs.mixpanel.com/docs/data-structure/group-analytics | 2026-11-04 | Separate from whole-account cancellation. |
| F25 | Downgrade | Free starts next billing date, after monthly/annual term | confirmed | Paid-to-Free | https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Existing account remains active. |
| F25 | Termination deletion | DPA says within 90 days of termination/expiration or on deletion request | confirmed | Contract termination | https://mixpanel.com/legal/dpa/ | 2026-11-04 | Not a promised 90-day customer download window. |
| F25 | Cancellation access and backups | Guaranteed retrieval grace, backup purge cycle, export-link lifetime and separate heatmap retention not established | not_published | Cloud | https://mixpanel.com/legal/terms-of-use/ ; https://mixpanel.com/legal/dpa/ | 2026-11-04 | Terms disclaim post-termination maintenance/access obligation. |
| F26 | Export formats | Raw events/properties/timestamps as JSONL; profiles via Engage; UI CSV | confirmed | Current plans | https://docs.mixpanel.com/docs/export-methods/export-all-data | 2026-11-04 | Identity mappings require Data Pipelines. |
| F26 | API gates | Raw export/Engage/UI CSV on Free upward; Query API paid; continuous Data Pipelines paid add-on | confirmed | Export/API | https://docs.mixpanel.com/docs/export-methods/export-all-data | 2026-11-04 | Some older Free projects lack raw export; support route documented. |
| F26 | Export limits | Raw: 60 queries/hour, 3/second, 100 concurrent; Engage: 60/hour, 5 concurrent | confirmed | Per project, all plans | https://docs.mixpanel.com/docs/export-methods/export-all-data | 2026-11-04 | Excess returns 429. Separate ingestion limits not inferred. |
| F26 | Export fees | Separate one-time export/egress fee not established | not_published | Raw export | https://docs.mixpanel.com/docs/export-methods/export-all-data | 2026-11-04 | Paid continuous pipeline is separate. |
| F27 | Historical import | Older than 5 days: /import, not mobile SDK /track | confirmed | Historical events | https://docs.mixpanel.com/docs/tracking-methods/sdks/swift ; https://docs.mixpanel.com/docs/tracking-methods/sdks/android | 2026-11-04 | Historical ingestion can affect billed month under ingestion-time billing. |
| F27 | GA4 migration | GA4 BigQuery export -> Mixpanel connector; One Time backfill or Append; new Simplified ID Merge project | confirmed | Historical GA4 data | https://docs.mixpanel.com/docs/migration/google-analytics | 2026-11-04 | Requires accessible GA4 BigQuery data; no recovery of history never exported asserted. |
| F27 | Migration costs/limits | Complete connector plan gates, historical lookback and mapping-loss guarantees not established | not_published | Migration | https://docs.mixpanel.com/docs/migration/google-analytics | 2026-11-04 | BigQuery Append change-history window is distinct from analytics retention. |
| F28 | Report sampling | Optional query-time 10% user sample, toggle off; saved reports use full dataset | confirmed | Analytics reports | https://docs.mixpanel.com/docs/reports | 2026-11-04 | Vendor says no sampling/dropping for ingestion sampling; filtering/rejected data still separate. |
| F28 | Bots/internal traffic | JS filters listed common bots; other bots can affect data; $ignore drops unwanted events | confirmed | Configured capture | https://docs.mixpanel.com/docs/tracking-best-practices/bot-traffic | 2026-11-04 | Internal IP/user patterns need implementation. Not measured accuracy. |
| F28 | Blocked requests | Blockers can prevent ingestion; managed first-party endpoint or proxy can reduce misses | confirmed | Browser collection | https://docs.mixpanel.com/docs/tracking-methods/first-party-domains | 2026-11-04 | Consent and SDK configuration create additional gaps. |
| F29 | SDK/script size | Comparable current transfer bytes, compression, version and recorder/native overhead not established | not_published | JS/native SDKs | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript ; https://docs.mixpanel.com/docs/tracking-methods/sdks/swift | 2026-11-04 | No bundle measurement made. |
| F30 | Self-host upkeep | No researched full self-host edition; no server sizing/cost record | not_applicable | Hosted analytics record | https://docs.mixpanel.com/docs/tracking-methods/first-party-domains | 2026-11-04 | Proxy upkeep is different from operating Mixpanel. F06 leaves unestablished editions unknown. |
| F31 | Docs and support | Public docs; community; support available on all plans | confirmed | Product | https://mixpanel.com/pricing/ | 2026-11-04 | Priority/account-management options vary. |
| F31 | Public interactive demo | Working no-account demo not established | not_published | Dashboard | https://mixpanel.com/pricing/ | 2026-11-04 | Book-a-demo route is not proof of open demo; general FAQ fetch failed. |
| F32 | Public detection | C; default CDN/init signals, custom-domain and server-only misses | confirmed | Web SDK | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript ; https://docs.mixpanel.com/docs/tracking-methods/first-party-domains | 2026-11-04 | Proposed rules below; no crawl or validation. |
| F33 | Fit/limits | Suitable for event-based web/native analysis; group analytics needs paid add-on; free quota exhaustion blocks reports | confirmed | Editorial inference | https://docs.mixpanel.com/docs/data-structure/group-analytics ; https://docs.mixpanel.com/docs/pricing/ | 2026-11-04 | Sourced fit judgment; no ranking or claimed hands-on test. |

## Cost examples

Our calculations, checked 2026-11-04. [Tariff inputs](https://mixpanel.com/pricing/), [qualifying-event rules](https://docs.mixpanel.com/docs/pricing/), [USD terms](https://mixpanel.com/legal/terms-of-use/). One site/project and one seat; no add-ons or startup credits; before any tax. Events below mean qualifying events, not automatically generated identity/profile operations. No invented conversion from events to users.

| Job | Workload/month | Plan and inputs | Formula | Result |
| --- | --- | --- | --- | --- |
| Website | 10K / 100K / 1M pageviews, each one event | Free, no other billable events | Each <=1M | $0/month each |
| Product | 100K / 1M events | Free | Each <=1M | $0/month each |
| Product | 10M events | Growth monthly published band | 1 × $1,176 | $1,176/month |
| Product | 10M events/month | Growth annual published band | 12 × $840 | $10,080/year; $840 monthly equivalent |
| Mobile scenario | 1K / 10K monthly active users, assumed 20 events/user/month | Free | 1,000 × 20 = 20K; 10,000 × 20 = 200K | $0/month each |
| Mobile scenario | 100K monthly active users, assumed 20 events/user/month | Growth monthly, 2M-event band | 100,000 × 20 = 2M; 1 × $259 | $259/month |
| Replay | 1K / 10K recorded sessions | Free allowance; 100% target capture; sessions assumed 5 minutes, Web, 30-day retention; <=1M qualifying analytics events | Each <=10K | $0/month each |
| Replay | 100K recorded sessions | Paid replay tariff not established | Not calculable | quote_required |

Pageview-only and mobile scenarios must exclude other automatic billable events. At the exact Free threshold, consult the quota policy before relying on uninterrupted report access. Heatmaps use replay data without additional event billing. MRR scenarios are `not_comparable`: current prices meter events/replays, not MRR. Higher-volume example prices use purchased bands, not the base-plan overage rate. No silent currency conversion or rounding.

## Public detection rules

No crawl was run. Product ID `mixpanel`; brand Mixpanel; operating company Mixpanel, Inc.; older aliases/ultimate parent not established. Evidence checked 2026-11-04. Overall class C.

| Rule | Edition/signal | Bounded match/location | Exact source and evidence | Confidence and exclusions |
| --- | --- | --- | --- | --- |
| MIXPANEL-CDN-1 | Default Web SDK | Executable script source or active loader in HTML: parsed host exactly cdn.mxpnl.com, path exactly /libs/mixpanel-2-latest.min.js; corroborate configured Mixpanel initializer/token | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript ; 2026-11-04; official loader names that asset and mixpanel.init | Strong product-specific install evidence; exclude comments, code examples, textual names, logos, unrelated mxpnl assets. Does not prove events arrive. |
| MIXPANEL-INIT-2 | Bundled/custom-served Web SDK | mixpanel-browser import or Mixpanel-specific initialization plus corroborating SDK/collector configuration in HTML or already fetched JavaScript | https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript ; 2026-11-04; documents npm/snippet and initialization | Strong only with contextual corroboration; generic track()/identify()/UUID strings insufficient. Minification or wrappers can hide names. No bundled-code fingerprint validated. |
| MIXPANEL-REGION-3 | Regional collection | Configured endpoints api.mixpanel.com, api-eu.mixpanel.com or api-in.mixpanel.com with actual SDK/init context | https://docs.mixpanel.com/docs/privacy/eu-residency ; https://docs.mixpanel.com/docs/privacy/in-residency ; 2026-11-04; documented ingestion hosts | Supporting evidence; endpoint string in prose alone insufficient. Do not infer user country or native SDK use. |
| MIXPANEL-FIRSTPARTY-4 | Enterprise domain or self-run proxy | Custom collection URL requires corroborating product code/initializer; no universal hostname pattern | https://docs.mixpanel.com/docs/tracking-methods/first-party-domains ; 2026-11-04; managed custom domains and self-hosted proxies documented | Conditional/unknown without corroboration. Backend remains Mixpanel; proxy does not establish self-hosted analytics. |

Visibility limits: consent-gated, delayed, bundled, first-party/proxied, authenticated-only or server-only tracking; native SDKs absent from public HTML. A site may load analytics without enabling replay, experiments or any paid feature. No positive/negative validation set, tested detector version, measured accuracy or confirmed misses exists yet.

## Conflicts and unknowns

- **Free quota wording:** pricing docs have an isolated “1M total events” sentence. Their exhaustion policy and current pricing specify monthly quota/reset. Recorded as ambiguous wording, not resolved by silently deleting it. Exact sources: https://docs.mixpanel.com/docs/pricing/ and https://mixpanel.com/pricing/ (2026-11-04).
- **Included versus purchasable replay volume:** Growth's “up to 500K” headline is a purchasable maximum, not its included quota. Replay docs explicitly give 20K included monthly. Sources: https://mixpanel.com/pricing/ and https://docs.mixpanel.com/docs/session-replay (2026-11-04).
- **History changes with project/plan:** two-year default and qualifying five-year older history are conditional rules, not contradictory values. Downgrading can reduce historical retention. https://docs.mixpanel.com/docs/privacy/gdpr-compliance (2026-11-04).
- **Native versus Web defaults:** Web recording default is 0%; Android replay configuration defaults to 100%. These apply to different SDKs. Do not publish one universal capture default. The separate SDK sources are in F17/F18.
- Unknown searches: terms/pricing/docs for old names/ownership events, country/age eligibility, trial card/caps, automatic spend caps, project quotas and complete tax treatment; residency/DPA/subprocessors for backup geography and purge timing; export guide for egress fees and trial expiry; SDK docs for exact offline limits and script weight; reports/identity docs for standardized subscription accounting; replay/pricing for extra replay tariff, native heatmap parity and scroll maps; pricing and FAQ route for public demo. Exact pages checked appear in fact rows.
- Retrieval limitations: docs-index `.md` URLs returned unsupported content-type/access errors; equivalent HTML pages were successfully read. The guessed web-analytics report route and general FAQ route failed. No missing fact was filled from those failed requests. Shell network lookup failed; research continued through web tools. No login or crawl was used.

## Field problems

- F01 to F33 group many separate facts. Evidence-row counts below are separate from field coverage.
- F08/F11/F12 need current versus legacy billing, purchased volume bands, overage rates and add-ons. “Starts at $0” is not a usable all-in price.
- F13 must distinguish ongoing collection from blocked report access. An alert is not a spend cap.
- F17/F18 need platform-specific capture/masking defaults and replay-SDK requirements. Native analytics alone does not enable replay.
- F19 mixes event-based revenue analysis with subscription accounting. Do not assume standardized MRR, churn, refunds or currency rules.
- F22 needs configuration and customer obligations, not a universal consent badge.
- F25 must retain event-date, project-age, plan-change, profile, replay and add-on removal rules separately.
- F30 is not applied to the full cloud backend; self-running a proxy is a separate operation.
- F32 needs later validation. SDK presence does not prove successful collection, paid-feature use or native app adoption.

## Counts

- Field groups attempted: 33 of 33 (F01 to F33), including applicable conditional fields and optional fields.
- Evidence rows: 97. One field group can have several states.
- confirmed: 76 evidence rows.
- not_published: 19 evidence rows.
- unclear: 1 evidence rows.
- conflicting: 0 evidence rows.
- not_applicable: 1 evidence rows.
- check_failed: 0 evidence rows.
