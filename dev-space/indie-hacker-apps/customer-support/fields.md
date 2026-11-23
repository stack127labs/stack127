# Proposed customer support facts

This is a field proposal for owner approval, checked with public sources on 2026-11-04. It is not finished research on any app. Collect the smallest set that explains fit, the real starting bill, the limits, and how someone can leave later.

## Rules for every answer

- Save each fact with its own `source_url`, `checked_on` date in `YYYY-MM-DD`, short supporting note, applicable plan/edition, and answer state. Use the exact source page, not a vendor's homepage for every detail.
- Answer states: `published`, `derived`, `unknown`, `not_published_in_checked_sources`, `conflicting`, and `not_applicable`. Never turn a missing feature mention into `no`. Record the pages tried when no answer was found.
- Required means the researcher must attempt the field and record an answer state. It does not mean the vendor must publish an answer. Optional fields can stay unknown without delaying a record. Conditional fields are required only for the relevant product type.
- Use official pricing, product documentation, licence files, legal pages, and official announcements. Competitor lists, reviews, and forum comments discover names and questions. They do not prove another app's price, ownership, security, or functionality.
- Record the source's displayed currency and billing period. Keep monthly payment separate from an annual price divided by 12. Never assume `$` means US dollars without checking. Record tax treatment as stated or unknown.
- Store source claims separately from our classification and calculations. Derived costs need links to every input, a formula, and assumptions. Dates apply to the inputs too.
- If pages disagree, keep both sources and the conflict. Current pricing beats an older vendor comparison. A live landing page alone does not prove every old edition is still sold.
- A self-hostable product can have a restrictive licence. Save the exact licence and edition. Do not label every public repository open source.
- Preserve old names, parent companies, and product relationships. An acquired app can still operate separately. A built-in AI feature does not become another app unless it has a separate buying/use route.

## Field list

Fields below are small groups where values belong together. For example, a plan price without its currency and billing period is not a usable fact. Later storage can split these groups into separate columns or child records.

| ID / field | What it means | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| F01 Identity | Current product name, official URL, old names, parent product, and operating state. | Avoid buying a dead product or counting a rebrand twice. | Text; URLs; aliases list; active / legacy / closed / unknown; effective dates if published. | Official home, announcement, repository. | Required |
| F02 Type and fit | Main job, other jobs, scope boundary, and overlap with another sub-directory. | Find apps for the actual support task. | Main type; tags; one plain sentence; boundary reason; overlap list. | Official product pages; our labelled classification. | Required |
| F03 Company and markets | Legal owner, home country, buying restrictions, and regional offers where published. | Check whether someone can buy and receive local service. | Owner; country; market restrictions; source per claim. Unknown allowed. | Terms, about page, regional pricing. | Optional; restrictions conditional for calling/regional products |
| F04 Buying access | Can one person start? Self-service, demo, invitation, or existing customers only? | Know whether the product is a practical option. | Access enum; signup URL; solo eligibility; required platform/account. | Signup explanation, pricing FAQ, official transition notice. | Required |
| F05 Editions and licence | Vendor-hosted, self-hosted, plugin, desktop, or both; exact source licence per edition. | Separate software cost from running it yourself. | Edition list; hosting model; repository URL; licence identifier/text link. | Product, repository licence, installation docs. | Required; licence conditional for public-source/self-hosted editions |
| F06 Free plan | Is there an ongoing free offer, a temporary offer, or no published free offer? | Avoid mistaking a trial for free use. | Yes / no / temporary / unknown; eligibility; expiry conditions. | Pricing and plan documentation. | Required |
| F07 Free limits | Free seats, inboxes, sites, contacts, conversations, messages, articles, storage, AI, and history. | Know the first limit that forces a paid plan. | Limit rows: resource; value; unit; reset period; scope; condition. `Unlimited` only when explicitly stated. | Pricing table, free-plan FAQ. | Conditional: free offer |
| F08 Trial | Trial length, card requirement, and what happens afterward. | Try an app without an unexpected charge or data loss. | Days; card yes / no / unknown; post-trial state. | Trial FAQ, pricing, terms. | Required |
| F09 Paid plans | Public plan names, amount, currency, monthly/annual billing, and taxes as stated. | Compare prices on the same basis. | Plan rows; decimal price; currency; invoice cadence; annual commitment; tax note. | Official pricing and billing docs. | Required; quote-only is a valid answer |
| F10 Billing unit | What creates a charge: seat, inbox, workspace, contact, ticket, message, conversation, outcome, minute, or credits. | Understand why the bill grows. | Unit list; vendor definition; counting/reset rules; paid versus viewer roles. | Billing help and pricing FAQ. | Required |
| F11 Minimum purchase | Minimum seats, spend, contract term, setup fee, and mandatory add-ons. | A low per-seat headline can hide an expensive starting bill. | Quantity; minimum total; term; fee type; required dependencies; unknown allowed. | Pricing FAQ, order terms. | Required |
| F12 Cost for one person | Lowest suitable published plan for one working support agent, with clear included features. | Compare a solo starting bill. | Monthly-payment total and annual-payment total, each with plan, currency, assumptions, and unknown parts. | Derived from F09 to F11. | Required when calculable |
| F13 Cost for three people | Same calculation for three working support agents. | See the cost of adding help. | Same as F12; minimum purchased seats may exceed three; viewer seats do not count. | Derived from F09 to F11. | Required when calculable |
| F14 AI charges | AI fee, included allowance, counted unit, model multipliers, add-on requirement, and external model-provider costs. | One AI credit may buy less than one answer. | Rate rows; unit definition; quota; model multiplier; external bill; plan. | AI billing docs, model credit table, pricing. | Conditional: AI capability |
| F15 AI cost examples | Comparable small-volume examples only where the vendor's unit can be mapped honestly. | See what base price plus AI could cost. | Base plus 100 and 500 billable units; explicitly name messages/resolutions/etc.; unknown if conversion is not published. | Derived from F09 to F14; official unit definition. | Optional; never force a cross-unit comparison |
| F16 Extra charges and stopping rules | Overages, hard stops, auto-recharge, credits expiring, inactivity deletion, and third-party channel fees. | Avoid surprise bills and lost support history. | Resource; threshold; extra rate; stop/recharge behavior; external fee source; unknown allowed. | Billing and lifecycle docs, channel-provider pricing. | Required |
| F17 Customer channels | Email, website chat, in-app chat, WhatsApp, Instagram, Messenger, SMS, voice, Slack, Discord, and ticket forms. | Match where customers already ask for help. | One row per channel: native / integration / not supported / unknown; plan; extra cost; inbound/outbound limits. | Product/channel docs and pricing. | Required |
| F18 Inbox workflow | Assignment, private notes, saved replies, collision warnings, rules, and business hours. | One founder and three helpers need different coordination. | Feature rows; yes / no / unknown; plan; important limits. | Inbox docs and plan comparison. | Conditional: help desk/shared inbox |
| F19 Branding removal | Can the chat widget, help center, and outgoing email remove vendor branding? | Keep the support experience under the reader's own brand. | Per surface: allowed / not allowed / unknown; first plan; extra cost; trial restrictions. | Branding help article and pricing. | Conditional: customer-facing surface |
| F20 Sites and brands | How many websites, products, inboxes, phone numbers, or separate brands one account can serve. | Many indie hackers run several small products. | Resource limits; separation rules; extra unit price; plan. | Plans, workspace/brand docs. | Required |
| F21 Help center | Public articles, search, custom domain, article limits, translations, and article feedback. | Let customers find answers without a conversation. | Capability rows; plan; limits; public/private distinction. | Help-center docs and pricing. | Conditional: help content |
| F22 AI role | Autonomous customer answers, agent drafting, summarizing, search, or fixed flows. | Avoid comparing a writing helper with a support agent. | Role tags; availability; plan; explicit product claim. | AI product docs. | Required, including unknown/no published AI |
| F23 AI knowledge | Content sources, size limits, source citations, update schedule, and manual approval controls. | Know whether answers stay current and can be checked. | Source types; limits; sync cadence; citations yes / no / unknown; plan. | Data-source and AI setup docs. | Conditional: knowledge-based AI |
| F24 Human fallback | Can customers reach a person, and does the history transfer? What happens outside working hours? | A bot must have a useful way out. | Handoff modes; transcript transfer; destination; triggers; plan; unknown parts. | Escalation, live-chat, and ticket docs. | Conditional: AI/bot/chat |
| F25 Customer actions | Can the agent look up orders, change accounts, issue refunds, or call custom actions? What verifies the customer? | Distinguish answers from actions that affect customer accounts. | Named actions; integration; identity check; approval option; plan; limits. | Action and identity-verification docs. | Optional; AI/action products |
| F26 Connections | Relevant links to Shopify, WooCommerce, Stripe, Slack, Discord, Linear, GitHub, email, and automation services. | Fit the current product stack. | Named integration; native/third-party; plan; extra subscription; source. Do not collect a marketing integration count. | Official integration directory and individual guide. | Required: check the relevant subset |
| F27 Developer access | Public API, webhooks, and widget/app libraries. API means software access; webhooks send changes to another service. | Connect support to an app without manual copying. | Docs URLs; availability; plan; limits if public. | Official developer documentation. | Required |
| F28 Taking data out | Export customers, conversation text, attachments, articles, and feedback; formats and restrictions. | Understand the work needed to move away. | Per object: method; format; contents; plan; exclusions; unknown. | Export/migration docs, API reference. | Required |
| F29 Running it yourself | Setup needs, paid modules, backups, upgrades, and maintenance status for self-hosted software. | A free licence still needs a server and time. | Runtime/database requirements; supported install paths; release date; paid module dependencies; operator tasks. No invented labour hours. | Install guide, release page, official module store. | Conditional: self-hostable/plugin |
| F30 Data location and AI use | Hosting regions, choice of region, subprocessors, and any published training-use policy. | Know where customer messages may go. | Separate hosting, region-choice, AI provider, and training-policy claims; exact source and scope. | Trust page, privacy notice, data-processing terms. | Optional; do not make legal-compliance conclusions |
| F31 Retention and deletion | How long history stays, export window, deletion options, and any published timing. | Avoid losing needed support history or keeping data unexpectedly. | Retention per object/plan; deletion process; published days; backups caveat. | Retention guide, privacy/processing terms. | Optional; keep partial answers |
| F32 Languages | Languages for agent interface, widget, help articles, and AI answers separately. | Customer language support can differ from the agent interface. | Named languages or documented count per surface; translation method; plan. | Locale and translation docs. | Optional |
| F33 Accessibility | Published accessibility statement or audit for the customer widget/help pages. | Check whether customers using assistive tools can get help. | Statement URL; named standard/version; date; tested surface; unknown otherwise. | Vendor accessibility page or published audit. | Optional; never infer from a badge |
| F34 Devices and platform needs | Agent mobile/desktop apps, customer app libraries, and required host platform such as WordPress, Shopify, Gmail, or macOS. | Avoid buying an app that cannot run in the reader's setup. | Platform list; role; dependency; edition. | Download and installation documentation. | Required |
| F35 Feedback features | Customer ideas, comments, voting, private boards, roadmap, changelog, and update notifications. | Relevant if feedback boards stay in this directory. | Feature rows; plan; boards/voter limits; privacy choices; unknown. | Official feedback/roadmap docs and pricing. | Conditional: feedback product; scope pending |
| F36 Reporting | Conversation reports, response-time reports, satisfaction surveys, and failed AI-answer review. | Know whether recurring problems can be spotted. | Named reports; export; plan; vendor definition. | Reporting docs. | Optional; no invented quality score |
| F37 Vendor support | Help channels available to the buyer and published support hours. | Know how to get help when the tool itself breaks. | Email/chat/forum/docs; published hours; plan; paid support option. | Support plan page. | Optional; do not estimate actual response speed |
| F38 Freshness and changes | Last product check, current release/announcement, rebrand/shutdown evidence, and next review date. | Stop old prices and dead products staying in the directory. | Dates; lifecycle state; official announcement URL; next review; uncertainty note. | Official changelog, release feed, status/transition notice. | Required; a live home alone is weaker evidence |
| F39 Evidence per fact | Where each answer came from and when it was read. | Let readers verify a claim and its age. | Source URL; checked date; supporting note; edition; answer state; conflict link. | Every source used. | Required for every fact, including derived inputs |
| F40 Cost assumptions | Exact comparison scenario, selected plan, formula, and unknown extras. | Keep headline prices and comparisons honest. | Scenario ID; agent count; channel/task requirements; quotas; cadence; formula; excluded/unknown costs. | Our calculation linked to published inputs. | Required for all derived costs |
| D01 Public detection surface | Widget, linked help center, board, self-hosted portal, or no dependable homepage signal. | Explain which kinds of usage can be counted. | W / H / B / S / N, plus easy / moderate / hard and reasons. | Official install docs and proposed observation surface. | Required |
| D02 Candidate matching rule | Exact script/frame host or path, global variable, asset path, or linked vendor subdomain that may identify an app. | Make counting repeatable. | Rule list; location in HTML; required supporting matches; exclusions; hostname boundaries. | Official installation snippet, public source, default template. | Conditional: potentially detectable product |
| D03 Rule evidence and readiness | Source for a rule and whether it has been tested for mistaken matches. | Separate a plausible idea from a reliable detector. | Evidence URL/date; candidate / tested / retired; positive/negative example plan; version; known aliases. | Installation docs; later approved detector tests. | Required; all rules in this pass remain candidates |
| D04 Blind spots | Conditions under which an app cannot be seen or can be mistaken for something else. | Prevent hidden usage being reported as zero. | Limitations list; confidence words tied to evidence, not an invented numeric score. | Deployment docs; explicit study limits; later tests. | Required |

## Cost comparisons that would be fair

For F12 and F13, publish two views rather than one misleading cheapest-price column:

1. Cheapest ongoing offer for that number of working agents, with its supported task stated. Show free-plan limits beside it.
2. A task-matched paid example: one product, one support email address, 100 customer conversations a month, and one or three working agents. Show a second example for website chat. If the app cannot do the task, mark it not applicable. If the vendor counts contacts or tickets differently, show the mismatch instead of assuming equivalence.

Keep AI off in the base comparison. Show AI examples separately using the vendor's actual unit. A conversation can contain many replies; a resolved ticket is not a message. F15 stays optional because a public conversion between these units is often missing. Never convert Crisp's approximate automated conversations into an exact guaranteed allowance.

For self-hosted tools, show licence/module purchase cost separately from hosting, email delivery, model-provider bills, and maintenance. A one-time module purchase is not a monthly subscription. Do not invent a total hosting bill without a stated deployment and source.

## How detection could work without a new crawl

`apps.md` assigns a proposed route to every app. Start with the homepage HTML already held by stack127. Do not submit messages, call private endpoints, fetch support transcripts, or infer customer identities. No crawl or dataset access was run for this task.

| Route | What to look for later | Expected ease | Main limit |
| --- | --- | --- | --- |
| W: public widget | A vendor-owned loader script or frame URL; sometimes a named initialization call. Use the exact installed code pattern, not a plain product-name mention. | Easy when the loader is present in the saved HTML; otherwise uncertain. | Consent blocks, delayed scripts, bundled code, custom proxies, and logged-in-only widgets can hide it. |
| H: hosted help center | A homepage link to a vendor-specific customer help hostname or a documented widget for help articles. | Moderate. | Custom domains hide the vendor. A link to the vendor's marketing site is not a customer's help center. |
| B: feedback board | A board URL or an embedded feedback script with a customer board identifier. | Moderate. | Board only inside an app, custom domains, or plain links without vendor identity. |
| S: self-hosted software | A linked public portal with a distinctive, documented template or asset signature. | Hard from homepage HTML alone. | Its domain is the customer's, branding may be removed, and the portal may not be linked. Do not add extra page fetches without a separate crawl decision. |
| N: private workflow | None for an email-only inbox, a private help desk, backend AI integration, desktop support app, or phone system. | Usually not detectable. | A `mailto:`, `tel:`, Slack, Discord, or WhatsApp link does not identify the app managing the conversation. |

Concrete feasibility examples, all checked on 2026-11-04:

- Crisp's [official web SDK package guide](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/npm/) documents the default `https://client.crisp.chat/l.js` loader and also a custom loader URL option. Its [web SDK guide](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/) documents `$crisp`. Proposed rule: exact loader host/path in executable script context, supported by initialization context if present. A `$crisp` mention in a tutorial is insufficient. Expected easy for the default public widget; custom loaders are a blind spot.
- Chatbase's [channel guide](https://www.chatbase.co/docs/user-guides/chatbot/channels) and [Framer guide](https://www.chatbase.co/docs/user-guides/integrations/framer) confirm an embeddable website widget. Its [Weebly guide](https://www.chatbase.co/docs/user-guides/integrations/weebly) confirms an iframe route. Exact script/frame rules remain unverified: the dedicated chat-bubble installation page did not fetch. Expected easy when a vendor-hosted script/frame is exposed; mark D02 as unfinished rather than guessing a path.
- FreeScout's [official core](https://freescout.net/), [module store](https://freescout.net/modules/), and [installation guide](https://github.com/freescout-help-desk/freescout/wiki/Installation-Guide) describe a self-hosted mailbox with optional public-facing modules. It can be used entirely through email. There is no dependable homepage signature for that use. A future portal/module rule needs separate public-template evidence.
- Fin may run behind Intercom or another help desk. Seeing an Intercom widget cannot prove that Fin is enabled. Apply the same rule to Lyro, Captain, Fibi, and other optional AI features: the enclosing app's script proves neither the AI feature nor its plan.
- HubSpot and other suites share scripts across marketing and service products. The suite's generic tracking script cannot prove Service Hub use. Likewise a WordPress or Shopify signature alone cannot identify a support plugin.
- Rebrands need old and new signatures, but not duplicate app counts. Userlike/Lime Connect, Hellonext/FeatureOS, and OpenPhone/Quo need an alias map. A preserved old script can still belong to the current product.

Before any rule becomes publishable, check it against at least a genuine installed example and a page that merely discusses or documents the product. We did neither test here. All detection routes and rule ideas remain proposals.

For later usage measurements, keep a separate observation set with site identifier, scan date, page URL, fetch success, raw-HTML versus rendered-page method, rule version, evidence match, and result. Store `not observed`, `fetch failed`, and `not detectable` separately. Do not expose customer tokens or unique widget account IDs in public results.

The denominator must be the eligible sites successfully inspected in that scan, not an assumed 123,000. A site can use several support apps, so percentages may add to more than 100%. Count each site/product once, normalize redirects and duplicate domains, and disclose the sample's selection and age. Homepage observations show visible installs in this sample, not the whole market, paid customers, revenue, AI use, or active conversations. A trend needs repeated comparable scans; one scan cannot show growth.

## Three-app feasibility test

Tested a hosted chat/support suite (Crisp), an AI support agent (Chatbase), and a self-hosted mailbox (FreeScout). This tests public availability of the fields, not product quality. No account was created and no product was installed.

`Easy` means the answer or a useful partial answer was clear in a named public source. `Hard` means it needs several pages, plan interpretation, an unresolved ambiguity, or later validation. `Not published` means not found in the sources inspected in this short test, not proof it exists nowhere. `N/A` is a conditional field outside the product/use case. Derived answers are labelled. Evidence rules apply to each source below; all were checked on 2026-11-04.

### Sources used for the test

| Code | Official source | Used for |
| --- | --- | --- |
| C1 | [Crisp pricing](https://crisp.chat/en/pricing/) | Plans, seats, trial, channel and feature headings, AI allowance, cloud model. Some feature-table tick marks were lost in text extraction. |
| C2 | [Crisp branding help](https://help.crisp.chat/en/article/how-to-remove-the-we-run-on-crisp-branding-links-dkrg1d/) | Branding eligibility and trial exception. |
| C3 | [Crisp web SDK](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/) and [package guide](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/npm/) | Public widget, developer controls, detection example. |
| C4 | [Crisp security practices](https://docs.crisp.chat/guides/others/security-practices/) | Security/hosting documentation availability, not a compliance judgment. |
| T1 | [Chatbase pricing](https://www.chatbase.co/pricing) | Plans, seats, credits, trial, add-ons. No ongoing free-plan section was found in this fetched page. |
| T2 | [Chatbase introduction](https://www.chatbase.co/docs/user-guides/quick-start/introduction) | Agent role, actions, integrations. |
| T3 | [Chatbase channels](https://www.chatbase.co/docs/user-guides/chatbot/channels) | Channel and widget surfaces. |
| T4 | [Chatbase data sources](https://www.chatbase.co/docs/user-guides/chatbot/data-sources) | Knowledge inputs and update behavior. |
| T5 | [Chatbase takeover](https://www.chatbase.co/docs/user-guides/chatbot/help-desk/takeover) | Human fallback. |
| T6 | [Chatbase ticket export](https://www.chatbase.co/docs/user-guides/chatbot/help-desk/exporting-tickets) and [conversation export API](https://www.chatbase.co/docs/api-reference/v2/conversations/export-conversations) | Export scope differs by route: ticket CSV omits message text; a separate API documents conversation history. |
| T7 | [Chatbase privacy](https://www.chatbase.co/legal/privacy) | Company location, data location, deletion policy. |
| T8 | [Chatbase model comparison](https://www.chatbase.co/docs/user-guides/chatbot/models-comparison) | Different credit costs per message. |
| T9 | [Framer install](https://www.chatbase.co/docs/user-guides/integrations/framer) and [Weebly install](https://www.chatbase.co/docs/user-guides/integrations/weebly) | Widget/frame installation routes; exact candidate rule still unfinished. |
| F1 | [FreeScout home](https://freescout.net/) | Free core, mailbox role, self-hosted product. |
| F2 | [FreeScout modules](https://freescout.net/modules/) | Separately offered features, licensing, branding and integration modules. Some purchase amounts were not readable without the store interaction. |
| F3 | [FreeScout repository](https://github.com/freescout-help-desk/freescout) and [installation guide](https://github.com/freescout-help-desk/freescout/wiki/Installation-Guide) | Licence, hosting needs, setup paths, platform information. |
| F4 | [FreeScout AI module](https://freescout.net/module/ai-integration/) | Agent drafting/summarizing and model-provider connections. This is not evidence of an autonomous customer agent. |

### Field-by-field result

| Field | Crisp | Chatbase | FreeScout |
| --- | --- | --- | --- |
| F01 Identity | Easy: official product C1 | Easy: official product T2 | Easy: product and repo F1/F3 |
| F02 Type and fit | Easy: classify from C1 | Easy: classify from T2 | Easy: classify from F1 |
| F03 Company and markets | Easy partial: country in C1 footer; restrictions not published there | Easy partial: company location T7; buying restrictions not published there | Not published: company/market facts in F1 to F3 |
| F04 Buying access | Easy: direct start links C1 | Easy: trial/start links T1 | Easy: download/install F3 |
| F05 Editions and licence | Easy partial: cloud C1; do not infer a self-host licence | Easy partial: hosted offer T1/T3; no self-host licence found | Easy: source licence/install F3 |
| F06 Free plan | Easy: ongoing free tier C1 | Hard: T1 has a trial; old free-plan claims need current confirmation | Easy: free core F1 |
| F07 Free limits | Easy: free-tier headings C1 | Hard: current ongoing free eligibility unresolved T1 | Easy partial: core limits F1; paid modules separate F2 |
| F08 Trial | Easy: trial details C1 | Easy partial: days in T1; card/end behavior needs more billing docs | N/A: free core; paid-module trial terms not established |
| F09 Paid plans | Easy: public plan amounts C1 | Easy: public plan amounts/cadence T1 | Hard: module offers F2; some amounts not readable |
| F10 Billing unit | Easy: workspace and seats C1 | Easy: plans plus credits T1/T8 | Easy: core and module-licence model F1/F2 |
| F11 Minimum purchase | Easy partial: included seats C1; legal commitment details need terms | Easy partial: seat tiers T1; unpublished contract extras remain unknown | Easy partial: instance licensing F2; hosting bill external |
| F12 One-person cost | Easy derived: plan arithmetic C1; task must be named | Easy derived: seat tier T1; AI extra | Hard derived: core licence clear F1; paid task configuration/hosting separate |
| F13 Three-person cost | Easy derived: included-seat arithmetic C1 | Easy derived: team size changes eligible tier T1 | Hard derived: core licence clear F1; same hosting/module caveat |
| F14 AI charges | Hard: monetary credits and approximate conversations C1 | Easy partial: credits T1 plus model table T8; actual bill depends on usage | Hard: model-provider bill outside FreeScout F4 |
| F15 AI cost examples | Hard: exact conversation conversion not guaranteed C1 | Hard: messages/model mix must be fixed T1/T8 | N/A for autonomous-agent comparison; helper model bill would need separate assumptions F4 |
| F16 Extras and stops | Hard: AI/extra-seat detail needs billing help beyond C1 | Easy partial: recharge/storage/branding in T1; inactivity needs confirmation | Hard: add-ons F2 and outside hosting/email/model fees F3/F4 |
| F17 Channels | Hard: list clear but some plan tick marks lost C1 | Easy: channel guide T3; plan gates T1 | Hard: core plus module channel list F1/F2 |
| F18 Inbox workflow | Hard: feature list readable, gates need care C1 | Easy partial: helpdesk guide links T2; full gates not tested | Easy partial: core F1/F3; module workflows F2 |
| F19 Branding removal | Easy: dedicated plan/trial rule C2 | Easy: explicit extra charge T1 | Hard: rebranding module exists F2; surface coverage/amount needs detail |
| F20 Sites and brands | Hard: workspace model clear; multi-product separation needs more docs C1 | Easy partial: agent/member allowances T1; site-use rules need more docs | Easy partial: instance licensing F2; multi-brand setup needs more docs |
| F21 Help center | Hard: feature headings C1; first eligible plan needs confirmation | Easy partial: standalone Help Page T3; do not equate it with a full article knowledge base | Hard: knowledge module headings F2; capabilities/gates need module guide |
| F22 AI role | Easy: support AI described C1 | Easy: customer agent T2 | Easy: helper drafting/summarizing F4 |
| F23 AI knowledge | Hard: needs AI setup docs beyond C1 | Easy: dedicated source/sync guide T4 | N/A for core drafting helper; no grounded autonomous agent established F4 |
| F24 Human fallback | Hard: chat/inbox present C1; exact fallback needs workflow docs | Easy: dedicated takeover guide T5 | N/A: human mailbox is core; no autonomous agent established F1/F4 |
| F25 Customer actions | Hard: public developer surface C3, enabled actions not established | Easy partial: named actions T2; identity/approval rules need action docs | N/A for core AI helper F4 |
| F26 Connections | Easy partial: ecommerce/inbox connections C1; individual gates need docs | Easy partial: integrations T2/T3; gates T1 | Hard: modules and outside services F2/F3 |
| F27 Developer access | Easy: public SDK/API links C3 | Easy: public developer/API routes T2/T6 | Easy partial: API module F2, docs linked F3 |
| F28 Taking data out | Hard: export heading C1; objects/format not established | Hard but findable: CSV and API scopes differ T6 | Hard: own database F3 is not a documented portable conversation export |
| F29 Running it yourself | N/A: cloud offer tested C1 | N/A: hosted offer tested T1 | Easy for software needs F3; total operating bill remains outside this test |
| F30 Data location / AI use | Easy partial: security docs C4; training/subprocessor scope needs detail | Easy partial: location T7; AI policy detail needs terms | N/A for vendor hosting: operator controls deployment F3; external AI terms separate F4 |
| F31 Retention and deletion | Hard: retention headings C1; exact deletion behavior not established | Easy partial: policy T7; plan-specific history needs more docs | Not published as a single policy: self-hosted database/backups depend on operator F3 |
| F32 Languages | Hard: multilingual feature heading C1; per-surface list not established | Easy partial: localization T3; complete surface lists need more docs | Hard: product/module translation details F1/F2; no unified promise |
| F33 Accessibility | Not published in C1 to C4 | Not published in T1 to T9 | Not published in F1 to F4 |
| F34 Devices/platform needs | Easy: agent apps and SDK links C1/C3 | Easy partial: customer mobile libraries T3; agent app availability not established | Easy: requirements and app routes F3 |
| F35 Feedback boards | N/A: no dedicated voting board established in sample | N/A: answer ratings do not establish a roadmap board | N/A: ticketing core is not a roadmap board |
| F36 Reporting | Easy partial: named reports C1; gates need care | Easy partial: analytics headings T1/T2 | Easy partial: reports module F2; gates/price need detail |
| F37 Vendor support | Hard: support channel/plan detail needs more than C1 | Hard: support tier headings T1; hours not established | Easy partial: community/support routes F3; no response-time promise established |
| F38 Freshness and changes | Easy partial: live pricing and updated branding guide C1/C2; full lifecycle history not tested | Easy partial: current docs and policy date T2/T7 | Easy partial: current repo and module version F3/F4 |
| F39 Evidence per fact | Easy: direct pages C1 to C4 | Easy: direct pages T1 to T9 | Easy: direct pages F1 to F4 |
| F40 Cost assumptions | Easy derived for named non-AI task C1 | Easy derived for base plan T1; AI assumptions T8 | Hard derived: core licence separate from operating costs F1 to F4 |
| D01 Detection surface | Easy: widget C3 | Easy: widget/frame T3/T9 | Hard: public module/portal may be absent F1/F2 |
| D02 Matching rule | Easy candidate: default loader documented C3 | Hard: widget route found, exact snippet page inaccessible T9 | Hard: no universal external loader for core email use F3 |
| D03 Evidence/readiness | Hard: candidate source found C3; no installed-site test run | Hard: T9 supports route, exact rule and tests unfinished | Hard: F3 supports deployment model; portal rule/testing unfinished |
| D04 Blind spots | Easy to identify: custom loader option C3; visibility still unmeasured | Easy to identify: per-channel deployment T3; visibility unmeasured | Easy to identify: email-only self-hosted use F1/F3 |

### Changes made after the test

- Keep one-person and three-person costs, but require a named task and billing period. Included seats can change which plan is usable.
- Keep AI rate, quota, unit definition, and multipliers. Make a single comparable AI-answer price optional. Never equate message credits, resolutions, and conversations.
- Keep branding as a separate field for each public surface. Trial behavior can differ from the paid plan.
- Keep export contents and method, not a single yes/no. A CSV can omit the conversation text even when another export route includes it.
- Mark accessibility, complete language coverage, data location/training policies, deletion timing, and vendor support hours optional. The test often found partial or no public answers.
- Do not require a public founder name, founding date, funding, revenue, customer count, vendor market share, exact response speed, exact setup hours, or uptime percentage. They did not answer the main buying questions or could not be compared fairly from these sources. Customer/revenue claims would need a separate dated dataset with clear definitions.
- Do not require a published company country to admit an app. Country of ownership is not data residency or service eligibility.
- Keep detection as a separate evidence-backed proposal. No rule passed real-site validation in this task.
- F35 was N/A for all three test products. It is conditional, not shown to be unfindable. The owner should approve the feedback-board boundary before a dedicated feedback-field pilot.

## Stats and insights these fields could support later

These are planned outputs. This discovery pass does not supply the finished values or any website usage counts.

| Output | Fields needed | Limits to show with it |
| --- | --- | --- |
| Price chart for one versus three agents | F09 to F13, F40 | Same task, currency, payment cadence, tax basis, and required add-ons. Separate quote-only and unknown totals. |
| Free-plan limits comparison | F06/F07/F16 | Count contacts, tickets, conversations, and messages separately. Temporary promotions are not permanent free plans. |
| AI billing model chart | F10/F14/F15/F22 | Separate helper AI from autonomous agents; separate messages from outcomes; show models and mandatory base desk cost. |
| Cost of removing branding | F19/F09/F11 | Widget, help center, and email may have different rules. Add-on and minimum-plan costs both matter. |
| Channel coverage table | F17/F26 | Native versus third-party support and extra channel-provider charges. |
| Help center and feedback comparison | F21/F35 | Conditional categories; do not penalize email inboxes for not being roadmap tools. |
| Self-hosted alternatives and cost components | F05/F29/F14 | Free source does not mean free hosting, mail, modules, upgrades, or AI. Separate source-available licences. |
| Multi-product founder comparison | F20/F09/F11 | Per-site versus workspace versus brand limits; what is actually separated. |
| Migration and portability comparison | F28/F31 | Objects and message text included, API/plan gates, and unknowns. No unsourced lock-in score. |
| Visible widget/board installations in the scanned sample | D01 to D04 plus later observation records | Only detectable products and successful eligible scans; no claim of total market share. |
| Co-occurrence of support chat and help-center tools | Later site/app observations; F02 | A site may have several apps; suite-wide scripts do not prove support modules. |
| Changes in visible installs over time | Repeated observations with same rules/sample | Need comparable dates, coverage, and rule versions. Account for redirects and rebrands. |
| How much of the directory has public prices and current evidence | F09/F38/F39 | Publish the checked denominator and unknown/conflicting counts. This measures our coverage, not product quality. |

Do not publish a universal winner, market growth, resolution success, reply speed, or AI accuracy ranking from these fields alone. Those need a separate, controlled study.
