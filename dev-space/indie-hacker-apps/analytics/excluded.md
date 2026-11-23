# Excluded, merged, and unresolved candidates

Checked or attempted on **2026-11-04**. These are not all dead products. Reasons are separated so a failed fetch is never reported as a shutdown. `gray` means the owner can revisit the scope decision. `check again` means current product availability was not established. Main-list gray candidates remain only in apps.md, not counted again here.

## Closed products, old names, and products moving elsewhere

| Name considered | Official URL checked or attempted | Decision and reason | Evidence or remaining uncertainty |
| --- | --- | --- | --- |
| June | https://www.june.so/ | Ended as a separate product; use Amplitude row. | Official homepage announcement dated 2025-08-08 says goodbye to June and describes the move to Amplitude. |
| Gauges | https://get.gaug.es/ | Closed and migrated; use Fathom row. | Site redirects to Fathom. [Fathom's announcement](https://usefathom.com/blog/fathom-acquires-gauges) says Gauges ended 2026-04-30; August update says customers and history moved. |
| Hotjar | https://www.hotjar.com/ | Merged name; use Contentsquare row. Do not add another app count. | Original site fetch failed. [Current official landing page](https://contentsquare.com/hotjar/) and [support explanation](https://support.contentsquare.com/hc/en-us/articles/37271913608721-Hotjar-is-now-part-of-Contentsquare-Plans-and-Pricing) explain the current route for new users. |
| Smartlook | https://www.smartlook.com/ | Past end of sale; exclude for new buyers, rather than call it already shut down. | [Cisco bulletin](https://www.cisco.com/c/en/us/products/collateral/software/smartlook-com-eol.html): last order 2026-05-31, last renewal/addition 2026-08-31, support ends 2027-08-31. Homepage alone hides this distinction. |
| Flurry Analytics | https://www.flurry.com/ | Closed mobile analytics service. | Fetch failed, but the [official sunset announcement](https://www.flurry.com/blog/flurry-sunsetting/) is available through indexed official content. It gives 2024-03-15 as the scheduled end date. Do not claim a live service because its old blog still appears in searches. |
| Beam Analytics at beamanalytics.io | https://beamanalytics.io/ | Closure notice; exclude. Distinct from Beam at beam-privacy.com. | Official indexed [event guide](https://beamanalytics.io/blog/custom-events-on-beam) carries a 2026-09-01 shutdown notice. Direct homepage and guide fetches failed. |
| Wide Angle Analytics | https://wideangle.co/ | Closed hosted analytics product. | Site redirects to Input Objects. Opened the vendor's [archived closure announcement](https://web.archive.org/web/20260614220046/https://wideangle.co/blog/saying-good-bye-to-wide-angle). It announces operation only through August 2026. The [independent record](https://www.elsop.com/analytics-tools/wide-angle/) helped recover that primary source. |
| Highlight.io | https://www.highlight.io/ | Acquired brand now routes to LaunchDarkly; hold separate listing. | Root redirects. [Official acquisition announcement](https://launchdarkly.com/blog/welcome-highlight-to-launchdarkly/) includes replay. Open-source continuity and the current independent hosted entry need separate checks; do not label all code dead. Error monitoring overlap. |
| Indicative | https://www.indicative.com/ | Folded into mParticle analytics; hold a standalone entry. | Original site fetch failed. [Current mParticle usage docs](https://docs.mparticle.com/guides/platform-guide/usage/) describe Indicative as its customer analytics service; [API docs](https://support.mparticle.com/hc/en-us/articles/11368205250061-Accessing-the-REST-API) distinguish legacy customers. Current solo entry not established. |
| SessionCam | https://www.sessioncam.com/ | Merged brand; no separate app entry. | Redirects to [Glassbox's SessionCam page](https://www.glassbox.com/sessioncam/). Check Glassbox separately if the audience expands. |
| SaaSOptics | https://saasoptics.com/ | Old brand now Maxio; no separate app entry. | Redirects to [Maxio's explanation](https://www.maxio.com/saasoptics). Maxio's revenue-accounting suite needs its own price and solo-fit check; not assumed affordable. |
| Firebase Analytics / Google Analytics for Firebase | https://firebase.google.com/products/analytics | Same analytics product family already counted under Google Analytics 4. | Official page calls the offering Google Analytics. Keep mobile SDK and Firebase setup facts on the existing row; backend overlap. |
| Panelbear | https://cronitor.io/real-user-monitoring | Old name, included as Cronitor RUM. | Current Cronitor offering provides website analytics. Keep old script signatures as aliases, not a second app. |
| Visual Studio App Center Analytics | https://learn.microsoft.com/en-us/appcenter/retirement | Retirement path, not a normal new choice. | **Not already shut down:** official 2026-04-15 update extends Analytics and Diagnostics support through March 2027. Azure Monitor Mobile Analytics is in public preview. Recheck that replacement separately; error monitoring/backend overlap. |
| Amazon Pinpoint | https://aws.amazon.com/pinpoint/ | End of support has passed; exclude the analytics service. | [Official lifecycle notice](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html), opened 2026-11-04: new customers stopped 2025-05-20; console/resources including analytics became unavailable after 2026-10-30. Messaging APIs have a separate continuation path, not a continuation of Pinpoint analytics. |

## Enterprise, adjacent tasks, or uncertain solo fit

These decisions are about the audience, not claims that the product is unavailable. A quote-only page by itself does not prove enterprise-only pricing.

| Name considered | Official URL opened | Status and reason left off the main list | What would change the decision |
| --- | --- | --- | --- |
| Adobe Analytics | https://business.adobe.com/products/analytics/adobe-analytics.html | Excluded: explicitly positioned as enterprise digital analytics; no realistic solo entry established. | Published small-project entry with workable setup and terms. |
| Glassbox | https://www.glassbox.com/ | Excluded: enterprise experience-analytics focus; no realistic solo entry established. | Public self-serve small-project plan. |
| Quantum Metric | https://www.quantummetric.com/ | Excluded: large-team customer-experience analysis and guided sales; solo entry not established. | A small-builder plan and simple setup path. |
| HockeyStack | https://www.hockeystack.com/ | Excluded: B2B sales and marketing attribution system; current offer is much broader than small-app usage reporting. | Evidence of a practical solo usage-analytics product. |
| InnerTrends | https://www.innertrends.com/ | gray: current site sells a fractional data department, meaning an outside team managing data work. Not clearly a self-serve analytics app now. | Current app access, features, and solo pricing. |
| Localytics | https://www.localytics.com/ | gray: current site presents marketing agents, data, and personalization. Standalone mobile analytics and solo access unclear. | Current usage-analytics product and entry terms. |
| Grid, formerly SaaSGrid | https://www.saasgrid.com/ | gray: redirects to withgrid.com; current offer combines billing, forecasting, and revenue operations. Solo analytics access unconfirmed. | Current analytics-only plan or practical small-founder bundle. |
| Count at count.co | https://count.co/ | Excluded: general analysis and research product, not an app/site audience collector or packaged SaaS metrics service. | A distinct audience-analytics offering. Do not confuse it with Countly or Counter.dev. |
| Kubiks | https://kubiks.ai/ | Excluded: traces, logs, and technical service health. No dedicated audience/product-usage offering established. | Product-use analytics beyond runtime diagnostics. Error monitoring/backend overlap. |
| HubSpot marketing analytics | https://www.hubspot.com/products/marketing/analytics | gray: analytics exists, but this page does not establish which useful traffic reports are available to a solo user without a larger paid bundle. | Plan-specific proof of useful free or small-team reports. Email/newsletters and customer support overlap. |
| Trench | https://trench.dev/ | gray: self-hosted event storage, queries, and routing infrastructure. Current page does not establish ready-made audience reports comparable to the main list. | A packaged user-facing analytics interface, or owner approval to include infrastructure building blocks. Databases/backend overlap. |
| Recurly Analytics | https://docs.recurly.com/recurly-subscriptions/docs/monthly-recurring-revenue | gray: subscription analytics exists, but current official MRR documentation excludes Starter and Pro plans. Solo access to the useful metrics is not established. | An affordable plan with the required MRR/churn reports. Payment providers overlap. |

## Failed official checks and incomplete availability evidence

All of these remain **check again**, not confirmed closed. Retry the official public pages or the maintainer's repository before adding them. The date below is an attempt date, not a successful site confirmation.

| Name | Official URL attempted | What happened on 2026-11-04 | Discovery route |
| --- | --- | --- | --- |
| SessionStack | https://www.sessionstack.com/ | Root and pricing fetch failed. Founder [public acquisition announcement](https://www.linkedin.com/posts/zlatkov_im-happy-to-announce-that-sessionstack-has-activity-7363106168891727872-6bo6) confirms an acquisition, not current availability. Third-party claims about PlaybookUX need primary confirmation. | Seed; status search |
| Howuku | https://howuku.com/ | Current root is a blog archive. Current app and new-customer route not established. | V2 |
| UXtweak | https://www.uxtweak.com/ | Page requires JavaScript and exposed no product evidence. Needs a retry; do not rule out session recording from this failure. | Seed |
| UXLENS | https://uxlens.com/ | User-recording marketing page exists, but membership-only wording and old content leave new-customer availability unclear. | Seed |
| Chargebee RevenueStory | https://www.chargebee.com/revenuestory/ | Product-path fetch failed. Need current feature name, price, and bundled-plan requirements. Payment providers overlap. | Seed |
| Nibspace | https://nibspace.com/ | Empty page in fetch, last indexed long ago. | G1 |
| Metrical | https://metrical.xyz/ | Fetch failed. | G1 |
| Stomatopod | https://stoma.top/ | Fetch failed; official source repository not followed in this pass. | G1 |
| Kindmetrics | https://kindmetrics.io/ | Domain fetch failed. [Official repository](https://github.com/kindmetrics/kindmetrics) is accessible, but current install and maintenance not established. | G1 |
| Lupa | https://getlupa.ru/ | Fetch failed; needs maintainer/source check, not a guessed shutdown. | G1 |
| Lomen | https://lomenanalytics.com/ | Fetch failed. | G1 |
| twelvebit | https://twelvebit.app/ | Fetch failed. | G1 |
| Hoot Lens | https://hootlens.com/ | Fetch failed. | G1 |
| Upsight | https://www.upsight.com/ | Fetch failed; current brand, ownership, and product availability unknown. | G1 |
| ANALOG | https://www.analog.cx/ | Fetch failed; check maintained forks and current release availability before listing this log analyzer. | G2 |
| Squarespace Analytics | https://www.squarespace.com/analytics | Marketing page failed. Official [traffic help article](https://support.squarespace.com/hc/en-us/articles/360024598852-Understanding-your-site-s-traffic-patterns) appears in search, but opening it returned an inaccessible Zendesk redirect. Real product likely; hold until direct official evidence can be read. | Seed |

## Boundaries for the next discovery pass

General chart builders, database engines, business-intelligence dashboards, event-routing libraries, tag managers, ad-only reporting, uptime monitors, and crash-only tools are not automatically audience analytics. They can support analytics without providing the reports this reader needs. This is a scope rule, not a claim that every product in those groups was reviewed.

Do not add a separate row for every old domain, hosted edition, SDK, or dashboard client. Do include a separate current product when it has its own access path and feature set, even if its parent company owns another app here. Heap and Contentsquare illustrate that distinction.
