# Customer support discovery notes

Research date: 2026-11-04. Scope: candidate discovery and field design only. Read `stack127_docs/product-direction.md` and `stack127_docs/writing-style.md`. No database access, website-usage dataset access, account creation, forms, installations, code changes, commits, pushes, or branches were used. Only this folder was written.

## Counts

The main list contains 166 product candidates: 100 labelled active and 66 labelled gray. Every row has an opened official product page, documentation page, pricing page, or official download route. This confirms a public offer or project presence, not a tested account or checkout. Gray includes scope boundaries and uncertain solo buying fit.

| Discovery group | Candidates |
| --- | ---: |
| Help desks, shared inboxes, and messaging inboxes | 69 |
| Live chat and customer messaging | 25 |
| Knowledge bases, help centers, and public documentation | 23 |
| AI support agents and builders | 22 |
| Feedback and roadmap group | 21 |
| Calling/texting scope extension | 6 |
| Total | 166 |

These are non-overlapping discovery groups, not exclusive feature labels. Featurebase and Quackback sit in the feedback group but also directly provide support. Count a product once; later filters can use several tags. FreeScout modules, Tidio Lyro, Chatwoot Captain, and other bundled features are not separate app rows. Fin is separate because it has its own use/buying route with other help desks.

`excluded.md` contains 44 considered entries. This is not 44 distinct currently operating competitors:

| Reason group | Entries |
| --- | ---: |
| Enterprise, unclear solo purchase, or wider product-management boundary | 17 |
| Official site could not be confirmed after follow-up attempts | 10 |
| Old names, changed buying routes, archived project, or maintenance status | 9 |
| Other scope boundaries and one unconfirmed legacy widget | 8 |
| Total excluded/held entries | 44 |

The strongest explicit solo exclusion found was Pylon: its current official pricing FAQ says there is a minimum seat count and that the product is for teams rather than solo operators. Most other enterprise holds are weaker: no solo path was established from the pages checked. They are not claims that a small plan definitely does not exist.

## Search log

All queries below were run on 2026-11-04. Some were repeated with a narrower query or shorter result request. Search result dates and vendor article titles were not treated as proof of current prices.

| Kind | Query used | What it added / limit |
| --- | --- | --- |
| Exact problem | `best customer support software solo founder shared inbox live chat affordable` | Small-founder choices, Daykeeper, and alternatives to enterprise help desks. |
| Exact problem | `best customer support software solo founder shared inbox live chat affordable -site:reddit.com` | Non-forum lists and small-team buying questions. |
| Public source list | `github awesome self hosted customer support helpdesk knowledge base feedback` | Self-hosted candidates and public repository leads. |
| Community | `site.reddit.com SaaS customer support tool indie hacker Crisp alternatives` | Founder language and basic inbox/chat needs. |
| Review site | `site.g2.com categories help-desk free software` | Help desk category discovery. |
| Review site | `site.g2.com/categories/help-desk free` | G2's list includes free trials as well as free plans; do not copy its free label. |
| Review site | `site.capterra.com live chat software small business` | More chat product names. Search result readable; full article returned an unsupported-content error. |
| Community | `site.reddit.com/r/SaaS customer support tool Crisp HelpScout` | Founder discussions, Chatway, and Jira Service Management as a gray customer-support option. |
| AI products | `AI customer support chatbot alternatives affordable Chatbase SiteGPT DocsBot FastBots Botsonic` | AI billing and agent candidates. Vendor comparison prices were not copied as facts. |
| Feedback products | `customer feedback tools alternatives open source Astuto LogChimp UserFuzz` | Open-source feedback candidates; Astuto required a lifecycle check. UserFuzz was a search lead only; no verified official app was established. |
| Lifecycle | `Groove rebranded Helply Userlike Lime Connect Chaindesk Askli rebrand` | Official Groove and Lime notices; Chaindesk/Askli relationship remains less well documented. |
| Lifecycle | `customer support software discontinued Papercups Helpy GoSquared HelpNinja` | Triggered direct checks of old chat/helpdesk names. Do not infer closure from a failed fetch. |
| Field test | `site.help.crisp.chat remove crisp branding export data AI credits pricing self hosted` | Dedicated branding article and billing questions. |
| Field test | `site.chatbase.co/docs message credits data retention privacy export` | Public documentation and privacy leads. |
| Field test | `site.freescout.net AI integration module branding knowledge base price` | Distinction between a drafting helper, module costs, and a free core. |
| Lifecycle | `site.connect.lime-technologies.com Userlike renamed Lime Connect` | Official rebrand notice, including acquisition context. |

## Sources actually used

Several independent kinds of source were used. `apps.md` carries a discovery code per product and its official confirmation URL. These source families have different biases.

| Kind | Sources opened or examined | Use and caution |
| --- | --- | --- |
| Exact-problem search results and small-founder lists | [fromscratch](https://fromscratch.dev/best/customer-support-tools), [Daykeeper](https://www.mydaykeeper.com/blog/best-customer-support-software), [Moorline](https://www.moorline.app/guides/best-help-desk-for-startups) | Product discovery and buying questions. Some are vendor-written or contain outdated plan claims. |
| Vendor comparisons | [Crisp alternatives](https://crisp.chat/en/alternatives/), [Featurebase Canny alternatives](https://www.featurebase.app/blog/canny-alternatives), [HelpJet alternatives](https://helpjet.com/alternatives), [eesel DocsBot alternatives](https://www.eesel.ai/blog/docsbot-alternatives), [SiteGPT AI support list](https://sitegpt.ai/blog/customer-support-ai-chatbot-platform) | Names only. Their competitor claims did not establish facts. |
| Open-source/public lists | [awesome-selfhosted repository](https://github.com/awesome-selfhosted/awesome-selfhosted), [ticketing](https://awesome-selfhosted.net/tags/ticketing.html), [knowledge tools](https://awesome-selfhosted.net/tags/knowledge-management-tools.html), [OpenAlternative feedback category](https://openalternative.co/categories/business-software/customer-support-success/feedback-feature-request-management) | Added less commercial and self-hosted names. Repository page initially loaded only navigation, so the maintained category site was used too. |
| Review sites | [G2 free help desks](https://www.g2.com/categories/help-desk/free), [G2 startup article](https://learn.g2.com/best-free-help-desk-software), [Capterra chat article](https://www.capterra.com/resources/best-live-chat-software-small-business/) | More candidate names. G2 article opened; Capterra full article did not fetch. No ratings were collected. |
| Community threads | [SaaS recommendations](https://www.reddit.com/r/SaaS/comments/1k11g3a/customer_support_recommendations/), [tool recommendation](https://www.reddit.com/r/SaaS/comments/1rzoeyp/tool_recommendation_for_customer_support/), [support tooling](https://www.reddit.com/r/SaaS/comments/1rpbcel/customer_support_tooling_for_your_saas/), [Libredesk launch](https://www.reddit.com/r/selfhosted/comments/1ng42hx/libredesk_open_source_customer_support_desk/) | Search-visible discussion supplied pain points and names. Not proof of price or quality; self-promotion can appear. |
| Official vendor pages | Every URL in `apps.md`; primary evidence in `excluded.md` | Existence, current branding, product purpose, and selected field-test evidence. No account or form submission. |

The category expansion code E is deliberately separate from these lists. Some names came from existing product knowledge or a broader category check, then their official sites were opened. We did not invent a third-party discovery source for them.

## Lifecycle findings and source limits

- [Groove's official notice](https://helply.com/blog/groove-is-now-helply) distinguishes the new Helply product from Groove Classic. The latter still operates for existing customers. This is not a shutdown. Do not carry old Groove prices into the Helply row.
- [Userlike's official notice](https://connect.lime-technologies.com/en/blog/userlike-rebranding-lime-connect/) confirms Lime Connect and describes the Lime acquisition. One product, with old and new names.
- [FeatureOS's official notice](https://featureos.com/blog/hellonext-is-now-featureos) confirms the Hellonext rebrand. featureos.app redirects to featureos.com.
- [Chatra's home](https://chatra.com/) says it is a Brevo company. Chatra still has its own public offer. This does not confirm the separate Brevo Conversations offer, whose page did not yield readable product content.
- [SnapEngage's site](https://snapengage.com/) identifies it as a TeamSupport product and sends its buying links there.
- [Quo's official page](https://www.quo.com/) identifies it as formerly OpenPhone.
- The official [Chaindesk](https://www.chaindesk.ai/) page and [Askli](https://www.askli.co/) page both use Askli branding. A dated official transition notice, current licence, and continuity of the old self-hosted edition were not established. Keep this gray.
- [Astuto's repository](https://github.com/astuto/astuto) gives an archive date of 2026-02-08. One comparison suggested a different month. The official repository date controls. The old astuto.io domain redirects to unrelated football content.
- [Papercups' repository](https://github.com/papercups-io/papercups) says maintenance mode. It does not say all use is impossible or that the company shut down. Hosted new-customer access remains unconfirmed.
- [Request Tracker's old official product URL](https://bestpractical.com/request-tracker) redirects to requesttracker.com. [Fider's old domain](https://getfider.com/) redirects to fider.io; its [official repository](https://github.com/getfider/fider) confirms hosted and self-hosted routes. [LogChimp's former address](https://logchimp.codecarrot.net/) redirects to logchimp.app. These are not extra apps.
- [Salesforce's small-business Starter Suite](https://www.salesforce.com/small-business/starter/) documents customer cases. It would be wrong to exclude all Salesforce products as enterprise-only. The main list includes this specific route as gray.
- GoSquared, Lucky Orange, and User.com have live sites, but this pass did not confirm a currently sold support-chat package for them. They are held outside this main list with analytics or email-directory referrals.

These checks screened current public identities and obvious lifecycle problems. They did not establish a complete acquisition history, ownership chain, actual service health, legal availability in every country, or new-account purchase success for all 166 products. Those remain work for individual app research where relevant. The date in the table means the official page was checked, not that the entire company was audited.

## What the field test changed

There are 40 proposed product/evidence field groups and four detection field groups. `fields.md` gives all 44 a result for Crisp, Chatbase, and FreeScout. A group can have a useful public answer while some sub-parts remain unknown. That is stated as partial rather than hidden.

- Base plans, billing units, seats, and basic channels were generally findable.
- Exact feature gates sometimes need a second source because text extraction loses pricing-table tick marks.
- Branding deserves a separate field. Crisp's official help article has a paid-plan and trial rule; Chatbase lists branding removal separately.
- AI billing needs units, quota, and model multipliers. An exact common cost per answer is not always findable or meaningful.
- FreeScout's free core still has module, hosting, email, and possible AI-provider costs. The test does not price a finished deployment.
- Export must describe contents and route. Chatbase's ticket CSV and conversation-history API have different scopes.
- Accessibility claims, complete language coverage, retention/deletion timing, and vendor support hours are optional because the sample gave incomplete answers.
- Detection is feasible for exposed public widgets, but hidden inboxes and AI features cannot be counted from a homepage. No crawl or installed-site detector validation ran.
- Feedback-specific fields remain conditional. None of the three sample products established a dedicated voting/roadmap board, so that portion needs its own short pilot if the owner keeps the boundary group.

## What may still be missing

This is a broad discovery pass, not proof that every product in the world has been found. The next sweep should use the remaining gaps, not repeat the same top-ranked vendor lists.

1. Non-English regional help desks and messaging tools, especially local WhatsApp providers. Region is intentionally unknown for most rows; do not infer headquarters from a domain suffix.
2. More WordPress help desks and small plugins. Awesome Support could not be confirmed; app-store listings and plugin maintenance dates need a separate pass.
3. Discord/Slack support-ticket bots and community-based support products. The current list covers several inboxes that connect to those channels, but not every bot or general community host.
4. Mobile-app and indie-game support products. Helpshift is held until a small-builder purchase path is established.
5. New tiny support apps found only in launch communities or marketplaces. Daykeeper and Moorline are examples of the long tail; neither is a claim that this space is exhausted.
6. The ten unreadable official products in `excluded.md`, plus the legacy Facebook widget. Retry with another public official document or an owner-directed browser check, without logging in or treating fetch failure as closure.
7. Current self-hosted licences and maintained editions for products whose old reputation differs from the current offer, including Typebot, Botpress, Tiledesk, Rocket.Chat, Faveo, and Chaindesk/Askli.
8. Official detector snippets for every potentially detectable app. This pass supplies a route per app and one concrete documented Crisp loader example, not 166 completed matching rules.

## Decisions for the owner before per-app research

1. Keep feedback/roadmap boards under customer support, or give them their own future group? Featurebase and Quackback still qualify as direct support tools.
2. Keep general customer documentation and wikis here, including GitBook, ReadMe, Mintlify, Outline, BookStack, and Wiki.js?
3. Keep the six calling/texting products here, or reserve them for a communications group? No price ceiling was invented for them.
4. What should count as affordable for a solo builder? The main list flags uncertain cost rather than imposing an arbitrary monthly cap. Keep published minimum purchases as facts, then let readers filter.
5. Approve the 44 field groups as written, or reduce optional fields before full app research. The main required set is identity, fit, buying access, editions, prices and limits, one/three-agent scenarios, channels, branding, AI billing/fallback, integrations, portability, evidence, and detection limits.

Next authorized step ends here: candidate list and field proposal only. No full app records or production data have been prepared.
