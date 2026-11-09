# Proposed facts for email and newsletter apps

This is a field proposal for approval, checked on 2026-11-04. The next phase should research one app at a time. The three-app test below checks whether answers can be found; it is not completed app research.

## Recording rules

- Every fact, including each price, limit, supported feature, and ownership claim, needs its own source URL and checked date in `YYYY-MM-DD` form. One source can support several facts, but the link must be attached to each fact.
- Store a short explanation of what the source actually supports. Prefer official pricing, help, API documentation, terms, release notes, and license files. A homepage is sufficient for product identity, not for hidden limits.
- Keep the source's update date separately from the date we checked it. Save the applicable plan, billing term, currency, country, product edition, and conditions alongside the answer.
- Use `yes`, `no`, `unknown`, `not applicable`, `depends on plan`, or `external provider` where relevant. A missing mention is `unknown`, never `no`. `Not applicable` needs a reason. `No` needs explicit evidence or a clearly documented product restriction.
- Unknown answers keep the URLs searched and checked date. Do not invent a citation for a missing answer. Note access problems separately from missing published information.
- Required means the researcher must check and record a result, including an honest unknown. It does not mean a vendor must publish the answer. Conditional fields are required only for the relevant use or hosting model.
- Keep vendor claims separate from independently measured results. A vendor's claimed delivery percentage is not proof of inbox placement. Accepted email can still land in spam.
- Record exact units and scope: contacts stored, contacts billed, individual recipients, emails, API requests, workflow runs, domains, and seats are different measures.
- Resolve conflicting official pages explicitly. Do not combine a new price with an old plan's limits. Keep the conflict and require another check before publishing a precise comparison.
- Recheck price, free limits, and product status before publication, ideally within 30 days. Recheck sooner when a page announces a change. Treat this as a proposed freshness rule, not proof that older records are wrong.

## Fields

Each numbered row is a fact group. Lists and price scenarios hold separately sourced items. This keeps the proposal readable without losing the detail needed for comparisons.

| ID / field name | What it means | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| F01 Name, official site, and status | Current product name, canonical URL, available/retired/merged state, and old names. | Avoid dead tools and duplicate names. | Text; URL; status; dated alias/change notes. | Official site, redirect destination, closure or rebrand notice. | Required |
| F02 Email jobs | Which jobs it supports: newsletters, marketing campaigns, app-generated email, lifecycle journeys, or message routing. | Pick a tool that does the needed job. | Multiple controlled labels; supported workflow notes. | Product pages and actual documentation. | Required |
| F03 Hosting and sender dependency | Hosted service, plugin, own-server install, or a layer that needs another sender. | Know what must be bought, connected, or operated. | Deployment options; sender included yes/no/unknown; named external dependencies. | Setup and architecture docs. | Required |
| F04 Countries, markets, and languages | Where a customer can open and pay for an account; interface/support languages. | Avoid unusable regional choices. | Country restrictions; supported languages; unknown where not published. Separate customer eligibility from delivery destination. | Signup rules, billing docs, terms, language selector. | Required check; language detail optional |
| F05 Entry and approval rules | Self-service signup, inquiry, manual sending approval, trial restrictions, business requirements, and minimum purchase. | A cheap plan is unhelpful if the user cannot send. | Access route; prerequisites; sandbox rules; published approval timing only. | Getting-started docs and plan terms. | Required |
| F06 How billing is counted | Whether price follows subscribers, emails, active profiles, seats, or another unit; treatment of unsubscribed and duplicate contacts. | Prevent unexpected bills. | Billing unit; billable-contact definition; audience deduplication rule. | Billing help and pricing FAQ. | Required |
| F07 Free plan and trial limits | Ongoing free plan versus timed trial; subscriber, send, daily, domain, feature, and branding limits. | See how far a project can start for free. | Separate free/trial objects; numeric caps and periods; restrictions. | Pricing and free-plan help. | Required |
| F08 Paid entry price and commitment | Cheapest relevant paid plan, billing currency, monthly versus annual price, minimum term, and required base subscription. | Understand the actual starting cost. | Amount + currency + interval + plan + commitment; tax treatment; promotion flag. | Official pricing and billing terms. | Required |
| F09 Newsletter cost scenarios | Price for 1,000, 5,000, 10,000, and 50,000 subscribers, each receiving four campaigns a month. | Show what growth costs under the same workload. | Four records with contacts, sends, plan, price, billing term, included jobs and calculator inputs. Mark quote-only or unavailable. | Official calculator, price table, and counting rules. | Conditional: newsletter and marketing tools |
| F10 App-email cost scenarios | Price for 3,000, 10,000, 50,000, and 100,000 outbound emails per month. | Compare delivery services fairly. | Four records; messages, daily-peak assumption, selected plan, included quota, overage. | Official pricing and usage docs. | Conditional: delivery and lifecycle tools |
| F11 Overage, caps, and rollover | What happens above the allowance: stop, charge, upgrade, throttle, or carry credits forward. | Avoid failed password resets and surprise charges. | Amount per unit; credit expiry; spending cap availability; limit action. | Billing and rate-limit docs. | Required |
| F12 Total-cost extras | Sending provider, hosting, required store/site plan, plugins, tax, domains, seats, dedicated IP, and paid support. | A low software price may omit most of the bill. | Itemized recurring/one-time/usage charges; included/excluded/unknown; scenario total with assumptions. | Pricing, setup requirements, add-on terms. | Required; own-server costs remain estimates with a named setup |
| F13 Paid newsletters | Can readers pay for email subscriptions directly, or only through another tool? | Creators need a usable way to earn. | Native/integration/custom/not supported/unknown; recurring tiers and access controls. | Paid-subscription and membership docs. | Conditional: newsletter and creator tools |
| F14 Fees, processors, and payout access | Platform cut, payment processing, billing add-ons, currency conversion, payout rules, and eligible creator countries. | Subscription revenue is not take-home revenue. | Fee components with bases; processor; supported payout countries; separate one-time fees. | Official monetization docs and linked processor terms. | Conditional: paid newsletters; do not assume all Stripe accounts have US fees |
| F15 List ownership and export | Can the user export emails, names, fields, tags, consent, unsubscribes, and content? What is missing? | Know what can leave with the creator. | Data items; export route and format; plan/access limits; stated ownership terms. | Export help, API, and terms. | Required; export access is not the same as complete ownership |
| F16 Paid-subscriber migration | Can recurring subscriptions and payment relationships move without asking everyone to buy again? | Leaving a platform must not silently stop revenue. | Supported migration path; processor/account conditions; manual assistance; exclusions. | Migration docs and subscription terms. | Optional; unknown when not published |
| F17 Consent and unsubscribe controls | Import approval, signup forms, confirmation emails, preference groups, one-click unsubscribe, and blocked-recipient lists. | Protect audience choice and avoid repeat sends to people who opted out. | Feature list; native/external/manual; restrictions per plan. | Audience, import, and unsubscribe docs. | Required check; forms may be not applicable to a pure relay |
| F18 Custom domains and branding | Own sending address, authenticated domain, newsletter website domain, link domain, and removal of vendor branding. | Build a recognizable, portable publication. | Separate capabilities, plan gates, domain counts, and fees. | Domain setup and pricing. | Required |
| F19 Writing and template tools | Visual editing, plain text, Markdown, HTML, reusable templates, variables, and conditional content. | Match the user's writing or code workflow. | Supported editors and template methods; plan limits. | Editor and template docs. | Required check |
| F20 Audience targeting | Tags, segments, custom properties, activity filters, and company/team accounts. | Send relevant messages without managing duplicate lists. | Capability list; static/live segments; plan limits; user/account distinction. | Segment and contact docs. | Conditional: tools that manage audiences |
| F21 Automation and event triggers | Scheduled sequences, branching, delays, app events, payment events, and exit rules. | Build onboarding, trial conversion, renewal, and recovery emails. | Supported triggers and actions; native/integration/custom; workflow/run limits. | Workflow docs, events API, billing integration docs. | Required check; advanced detail conditional on lifecycle use |
| F22 API, SMTP, and integrations | Supported sending connections, official code libraries, and native connections to relevant apps. | Estimate integration work. | API/SMTP availability; docs URL; supported SDKs (code libraries); plan gates. | Developer docs and integration directory. | Required check |
| F23 Events, retries, and debugging | Delivery callbacks, message logs, retries, duplicate-send protection, and inbound reply handling. | Diagnose lost or repeated messages and handle replies. | Event types; retry rules; log detail; duplicate-protection window; incoming email support. | Webhook and email API docs. | Conditional: app email; advanced detail optional elsewhere |
| F24 Domain authentication | SPF, DKIM, and DMARC setup: records that help receivers check who sent a message. | Prevent impersonation and common setup failures. | Supported/required records; setup instructions; alignment limits. | Domain verification and deliverability docs. | Required; own-server software may delegate to sender |
| F25 Bounces, complaints, and suppression | Handling failed addresses, spam complaints, and recipients who must not receive more mail. | Protect sender reputation and audience preferences. | Automatic/manual/external; event feeds; export/import controls; thresholds if public. | Bounce and complaint handling docs. | Required |
| F26 Email streams and IP choices | Whether app mail can be separated from bulk campaigns; shared or dedicated sending addresses and warm-up support. | Protect important account messages when campaign reputation changes. | Stream separation scope; shared/dedicated IP; volume rules; cost; who operates it. | Sending infrastructure docs and pricing. | Required check for delivery; optional elsewhere |
| F27 Technical sending limits | Per-second, daily, and monthly limits; batch recipients; message size; attachments; sandbox restrictions. | Decide whether the tool handles real send patterns. | Numbers + units + account/region/plan scope; increase process. | API limits and sending policy docs. | Conditional: delivery and own-server software |
| F28 Data location and privacy terms | Where subscriber data, email content, logs, and backups live, plus processing agreements and sub-processors. | Sending from Europe does not necessarily mean data stays there. | Separate storage/sending regions; linked data-processing agreement; choices and limitations. | Privacy/security pages, processing terms, region docs. | Required check; legal certification details optional |
| F29 Reporting and tracking choices | Delivery, click, open, conversion, and revenue reporting; ability to disable tracking and filter automated activity. | Read results without treating every open as a human. | Metric definitions; tracking toggles; bot/privacy filtering; plan limits. | Analytics and tracking docs. | Required check |
| F30 Retention and deletion | How long messages, logs, and contact data remain, and how deletion works. | Know what can be recovered or removed. | Days by data type; configurable defaults; deletion/export method. | Retention, privacy, and log docs. | Optional; test found uneven public coverage |
| F31 Account safeguards | Two-factor login, roles, scoped API keys, and separation between projects. | Reduce account mistakes and exposure of customer data. | Supported controls; plan gates; default versus optional. | Security and permissions docs. | Optional; check at least two-factor login for hosted tools |
| F32 Support and reliability evidence | Available human support, plan restrictions, public status page, and any contractual service promise. | Know where to turn if sending stops. | Channels/hours; status URL; published service commitment. Response time only if promised. | Support and status pages, contract terms. | Required check; response speed and uptime history optional |
| F33 Source license and maintenance | Exact license, source repository, recent release, and signs of maintenance for own-server options. | Distinguish open source from paid source access and abandoned software. | License ID/link; repository; release date/version; archived flag; known install caveats. | Official repository, license, release notes. | Conditional: source-available or self-hostable tools |
| F34 Own-server setup and work | Required database/runtime, server needs, upgrades, backups, and sender connection. | Free software still needs time and infrastructure. | Documented requirements; installation route; responsibilities; published benchmark context only. | Install and operations docs. | Conditional: self-hosting; exact staff hours optional and usually unknown |
| F35 Growth and newsletter income tools | Referrals, recommendations, ad placement, sponsorship sales, and eligibility rules. | A writer may need more than sending. | Capability and plan; eligibility; fee/revenue terms; native/integration. | Growth, advertising, and monetization docs. | Optional, newsletter tools only |
| F36 Other-directory overlaps | Relevant support, payments, hosting, backend, auth, analytics, or error-monitoring capabilities. | Connect products without hiding them from either list. | Related category labels plus the exact product/capability and source. | Official product and integration docs. | Required check; distinguish integration from being a provider |
| F37 Independent delivery evidence | A reproducible inbox placement or sending test, if available. | Add evidence beyond promotional claims. | Study URL/date; workload; providers; methodology; limitations. | Published independent test with a described method. | Optional; no universal deliverability score |
| F38 Public scale or history | Dated customer counts, sending volume, or operating history when useful and clearly defined. | Give context without confusing size with quality. | Number, definition, period, and vendor-reported/independent label. | Official dated announcement or credible original report. | Optional; exclude from mandatory completeness score |
| F39 Owner and home region | Legal operator, parent/acquirer, headquarters country if stated, and relevant rebrands. | Show who operates the service and resolve aliases. | Entity and country; relationship; effective date when published. | Terms, company page, official acquisition notice. | Optional detail; current identity in F01 remains required |
| F40 Evidence and unknowns | Links, checked dates, plan scope, conflicts, and what could not be established. | Let readers inspect each claim and see stale answers. | Per-fact evidence records; unknown reason; reviewer note; next-check trigger. | The actual supporting pages used for each fact. | Required for every populated fact |

## Comparable price rules

1. Main view uses ordinary month-to-month prices, before tax, with no introductory discount. Keep annual prices separately with the full upfront amount.
2. Newsletter baseline: one publication, one user, 1,000 / 5,000 / 10,000 / 50,000 unique subscribed contacts, four emails to each per month. This is 4,000 / 20,000 / 40,000 / 200,000 recipient emails. Exclude SMS, ads, and paid-reader revenue from this baseline. Show a second scenario for paid-newsletter needs if it requires another tier.
3. Delivery baseline: one verified sender domain, one user, shared sending IP, no attachments, and the monthly email volumes in F10. Assume one recipient per message. Spread volume across the month; publish the separate daily and per-second limits. A plan that handles monthly volume but cannot handle the reader's burst must say so.
4. Lifecycle tools often charge for both profiles and sends. Use the newsletter audience/send pair for marketing journeys. Use F10 only when contact count and required workflow runs are also specified. Never quote an isolated per-email cost for a tool that also bills profiles.
5. For self-hosting and notification layers, show software price plus a named external-sender scenario. Include a stated hosting setup when calculable. Do not rank a zero-license tool as zero total cost. If comparable costs cannot be established, show `not comparable` and the missing component.
6. Keep native currencies. Currency conversion is optional, dated, and separate from vendor prices. Quote-only plans remain quote-only. Unsupported interactive price controls count as a research limitation, not a free or guessed price.

## What these fields could let us publish

| Reader question or insight | Fields used | What makes the result honest |
| --- | --- | --- |
| How much does a weekly newsletter cost as its audience grows? | F06, F08, F09, F11, F12 | Cost curves within the same job and feature level; show gaps and quote-only plans. |
| Which free plans can send to my whole list this week? | F05, F07, F11, F27 | Compare contact caps and send caps separately. Daily limits can matter more than monthly totals. |
| What does 10,000 or 100,000 app emails cost? | F08, F10, F11, F12, F27 | Include base subscriptions and overage; flag burst limits and sending approval. |
| What remains from paid newsletter revenue? | F13, F14, F08, F12 | Model a stated subscriber price, country, currency, and paid-reader count. Label processor assumptions. |
| Can I take my readers and payments with me? | F15, F16, F18 | Export coverage matrix; separate mailing-list export from recurring-payment migration. |
| Which tools combine campaigns and app mail? | F02, F21, F26 | Distinguish shared contacts from genuinely separate sending streams. |
| Which tools fit a SaaS onboarding or failed-payment sequence? | F20, F21, F22, F23 | Count supported events, native billing connections, exit rules, and profile/run limits. |
| What do I need to operate a self-hosted newsletter? | F03, F12, F24, F25, F33, F34 | Show software, sender, hosting, updates, and backup responsibilities separately. |
| Which services offer particular storage locations? | F04, F28, F39 | Map storage, routing, legal operator, and customer eligibility separately. Never infer residency from headquarters. |
| Which apps publish enough evidence for comparison? | F40 and all conditional fields | Show observed coverage and unknowns for each applicable field; do not punish a pure relay for lacking paid newsletters. |
| How many options support exports, own domains, or a real free plan? | F07, F15, F18 | Capability counts with checked date, denominator, and unknown category. These describe this inventory, not market share. |

Do not promise customer market share, guaranteed inbox placement, universal ROI, support speed, or a single best-app score. This pass does not collect evidence for those claims.

## Feasibility test: three different apps

Test date: 2026-11-04. Samples: beehiiv, a managed creator publication; Resend, a hosted developer sender with campaign features; listmonk, own-server newsletter software using a separate sender. These test different operating models, not every marketing or lifecycle product. A later SaaS-specific field check should use a tool such as Loops or Userlist.

`E` = easy to find in inspected official material. `H` = hard: needs multiple pages, technical interpretation, a calculator, or an outside dependency. `N` = not published in the inspected material, so keep unknown; this is not a claim that no public answer exists anywhere. `A` = not applicable to the tested deployment/job. Mixed entries state what was and was not findable.

Sources opened for this test, all checked 2026-11-04:

- B1: https://www.beehiiv.com/ and https://www.beehiiv.com/pricing
- B2: https://www.beehiiv.com/support/article/12258595483543-exporting-post-content-or-subscriber-data-from-beehiiv
- B3: https://www.beehiiv.com/support/article/14492990172823-how-to-use-a-custom-domain-for-your-publication
- R1: https://resend.com/pricing
- R2: https://resend.com/docs/introduction and https://resend.com/docs/api-reference/rate-limit
- R3: https://resend.com/docs/webhooks/introduction
- R4: https://resend.com/security/gdpr/
- R5: https://resend.com/changelog/exports-general-availability
- L1: https://listmonk.app/ and https://listmonk.app/docs/
- L2: https://listmonk.app/docs/configuration/
- L3: https://listmonk.app/docs/apis/subscribers/ and https://listmonk.app/docs/external-integration/
- L4: https://listmonk.app/docs/bounces/
- L5: https://github.com/knadh/listmonk/blob/master/LICENSE

| Field | beehiiv | Resend | listmonk | Keep or change after test |
| --- | --- | --- | --- | --- |
| F01 Identity and status | E, B1 | E, R2 | E, L1 | Keep required; corporate history can wait. |
| F02 Email jobs | E, B1 | E, R2 | E, L1 | Keep; multiple jobs need separate labels. |
| F03 Hosting and sender dependency | E, B1 | E, R2 | E, L1/L2 | Keep; dependency changes cost comparisons. |
| F04 Availability and languages | N, complete eligibility not established in B1 | N, full eligibility not in R1/R4 | H, own-server choice in L1/L2; external-sender rules remain unknown | Keep required check; do not require a complete supported-country list. |
| F05 Entry and approval | H, B1 has signup/trial; approval detail not established | H, domain setup in R2; full sending-review conditions need more help pages | E, installation/configuration route in L1/L2; sender approval is external | Keep; approval timing optional if absent. |
| F06 Billing unit | E, B1 | E, R1 distinguishes sending from audience billing | E, L1/L2 identifies separate sender | Keep; billable-contact edge cases can stay unknown. |
| F07 Free limits | H, B1 dynamic plan view needs care | E, R1 has free plan and daily cap | E, L1 has free software; external sending is not included | Keep; never call software's unlimited contacts unlimited free delivery. |
| F08 Paid entry and commitment | H, B1 defaults to annual billing | E, R1 | A for free software license; H for complete stack, L1/L2 | Keep and separate annual display from month-to-month billing. |
| F09 Newsletter scenarios | H, B1 audience selector and changing plan information | H, R1 separate campaign billing and workload choices | H, L2 plus chosen sender/host, not priced in this test | Keep conditional; four scenario totals were not researched here. |
| F10 App-email scenarios | A for tested publication job | E for rate schedule in R1; full scenario calculation still needed | H, L1/L2 plus chosen sender | Keep conditional; do not invent an API-email comparison for every publisher. |
| F11 Overages and cap behavior | N, exact billing action not established in B1 | E, R1/R2 | H, L2 for app controls plus outside sender terms | Keep required check, allowing unknown. |
| F12 Total-cost extras | H, B1 and processor conditions | E for listed add-ons, R1; workload may add other charges | H, L1/L2 require host and sender | Keep; own-server totals must carry assumptions. |
| F13 Paid newsletters | E, B1 | N, native paid-reader workflow not established in R1/R2 | N, native billing workflow not established in L1/L3 | Keep conditional; do not infer support from an API. |
| F14 Fees and payouts | H, B1 platform share visible; processor/country detail needs more sources | A unless a separate paid-reader integration is modeled | A unless a separate paid-reader integration is modeled | Keep conditional; processor costs are not universal. |
| F15 Export and ownership | E for export, B2; H for complete legal/data scope | E for export availability, R5; H for complete ownership/scope | E for subscriber export, L3; H for complete dataset and consent history | Keep; export checkbox alone is too shallow. |
| F16 Paid-subscriber migration | N, payment continuity not settled by B2 | A for tested sender job | A for tested deployment | Mark optional; list export does not answer it. |
| F17 Consent and unsubscribe | H, B2/B3 only cover part; dedicated docs still needed | E for newsletter unsubscribe responsibilities, R1 | E for documented audience/unsubscribe operations, L3/L4 | Keep; full consent-history export may remain unknown. |
| F18 Domains and branding | H, B1/B3; help article warns of ongoing updates | E, R1/R2 | H, L2 plus external sender's domain setup | Keep separate sending, website, tracking, and branding controls. |
| F19 Editors and templates | E for basic editing, B1 | E for developer templates, R1/R2 | E, L1 documentation index and product page | Keep basic check; advanced conditional content needs deeper docs. |
| F20 Audience targeting | E for basic capability, B1 | H, R1/R2, contact/segment detail needs deeper docs | E, L1/L3 | Keep conditional; do not force audience fields on a relay. |
| F21 Automation/events | E for advertised automation, B1; H for exact event/exit coverage | H, R1 names automation usage; exact trigger coverage needs docs | N for built-in event journeys in inspected docs; external API approach is H, L3 | Keep capability check; detailed SaaS triggers need a fourth sample later. |
| F22 Developer interfaces | E for API availability, B1/B2 | E, R2 | E, L1/L3 | Keep required check; distinguish receiving a webhook from sending email. |
| F23 Events, retries, debugging | N for detailed guarantees in inspected B sources | E for event callbacks, R3; H for complete guarantees | H, L2/L4 describes retries and incoming bounce events, not a hosted-provider contract | Keep conditional; do not mark whole group yes from one webhook. |
| F24 Authentication | H, B3 domain setup; exact record coverage needs deeper docs | E, R1/R2 | H, L2, depends on selected sender | Keep with external-provider label. |
| F25 Bounces and suppression | N for complete mechanisms in B1/B2/B3 | E for basic controls, R1 | E, L4 | Keep required check; numbers and thresholds optional. |
| F26 Streams and IPs | N in inspected B sources | E for IP offer, R1; N for complete isolation guarantees | H, L2 and external sender; isolation not established | Keep basic check; isolation guarantees optional. |
| F27 Technical quotas | N for full technical limits in B sources | E, R1/R2 | H, L2 and outside sender caps | Keep conditional with per-unit scope. |
| F28 Data location/privacy | N in bounded B source set | E, R4 separates stored data from sending region | H, operator chooses infrastructure, L1/L2; outside sender still matters | Keep check; never use headquarters as a substitute. |
| F29 Analytics/tracking | E for basic analytics, B1; N for full privacy/bot detail | E for basic tracking, R1; N for full bot-filter method | E for product-level reporting, L1; H for exact configuration | Keep basic reporting; advanced filtering detail optional. |
| F30 Retention/deletion | N in inspected B sources | E for listed log retention, R1/R4; H for all data types | H, self-operated data, L2/L3; no hosted retention promise | Optional: uneven coverage and different data types. |
| F31 Safeguards | N in inspected B sources | E for listed controls, R1; confirm actual plan gates before filling | H, L1 points to role/permission docs; deeper check needed | Optional detail; do not read blank pricing icons as yes. |
| F32 Support/reliability | E for plan-level support, B1; N for measured speed | E for channels and service promises, R1; N for independently measured speed | H, L1 community/docs route; no commercial sender service promise | Keep access channels; make response time and uptime optional. |
| F33 License/maintenance | A for hosted service | A for hosted service; SDK license is not service license | E for license and visible release, L1/L5 | Conditional; separate software from service. |
| F34 Own-server work | A | A | E for setup, L1/L2; N for universal labor hours | Keep documented responsibilities, cut assumed hours. |
| F35 Growth/income tools | E for availability, B1; H for eligibility economics | N for built-in referral/ad network in R1/R2 | N for built-in referral/ad network in L1/L3 | Optional; custom integration is not a native feature. |
| F36 Directory overlaps | H, B1 developer/payment connections need exact capability classification | E for email focus, R2; do not classify as auth merely because it sends reset emails | H, L1/L2 dependencies must not become false backend-provider tags | Keep overlap check with precise relationship. |
| F37 Independent delivery tests | N in inspected official source set | N in inspected official source set | N; depends heavily on external sender and setup | Optional; no comparable benchmark established. |
| F38 Public scale/history | H, B1 promotional figures need definitions/date | H, R1 customer logos do not give a customer count | H, L1 project history is visible but installed-user count is unknown | Optional; never turn GitHub stars into active users. |
| F39 Owner/home region | N for full legal ownership in test sources | N for full legal ownership in test sources | H, L1/L5 identify project source; do not infer legal operator or headquarters | Optional company detail; use separate first-party terms research later. |
| F40 Evidence/unknowns | E, B sources linkable | E, R sources linkable | E, L sources linkable | Keep per-fact records. |

### Changes made because of the test

- Keep two different workload-based price comparisons. Own-server tools and routing layers need a visible external-cost component.
- Keep required checks for exports, approval, quota behavior, domains, and unsubscribe handling. These are useful even when the answer is unknown.
- Make paid-payment migration, detailed retention, account-control detail, growth economics, scale/history, legal-company detail, and independent performance studies optional.
- Cut universal deliverability percentage, universal uptime, guaranteed support response speed, and a self-hosting labor estimate from the required dataset. The inspected pages do not support fair values across the three models.
- Do not publish all price points from scraped page headings. beehiiv's search extracts used older plan labels while the opened page showed a different lineup; its domain help page also warned of updates. Resend's page contains some unlabelled feature icons in extracted tables. Those need a fresh first-party check of the exact plan before recording values.
- The test establishes a workable field structure, not completed coverage. Exact price totals, full terms, all country restrictions, and every feature sub-item remain for the approved app-by-app phase.
