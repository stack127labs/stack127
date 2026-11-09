# Customer support app candidates

Checked on 2026-11-04. This is discovery, not finished app research or a ranked recommendation. Prices and plan details still need their own research after field approval.

`active` means an official product page opened and offered the product, a trial, a download, or current documentation. It does not mean we tested the service. `gray` means the official page opened, but scope, cost, maintenance, or access for a solo builder needs a decision. Unconfirmed sites are in `excluded.md`, not counted here.

One row is one product. Features such as Tidio's Lyro and Chatwoot's Captain are not extra apps. Fin has its own row because it can be bought for another help desk. Old names are recorded in `excluded.md`. A general wiki or documentation tool is marked gray because it can serve customers but is not a dedicated help center.

Region `Unknown` means not researched in this discovery pass. It does not mean worldwide availability. Company location, hosting location, supported languages, and countries allowed to buy are different facts. Only put a region here when an opened official source supported it.

## How names were found

- B: named in the owner's brief.
- V1: [Crisp's alternatives list](https://crisp.chat/en/alternatives/). Names only; competitor claims were not used.
- V2: [Featurebase's Canny alternatives](https://www.featurebase.app/blog/canny-alternatives). Names only.
- V3: [HelpJet's chatbot comparisons](https://helpjet.com/alternatives), [eesel's DocsBot alternatives](https://www.eesel.ai/blog/docsbot-alternatives), or [SiteGPT's AI support list](https://sitegpt.ai/blog/customer-support-ai-chatbot-platform). Names only.
- G: [awesome-selfhosted ticketing](https://awesome-selfhosted.net/tags/ticketing.html) or [knowledge tools](https://awesome-selfhosted.net/tags/knowledge-management-tools.html).
- R: [SaaS support recommendations](https://www.reddit.com/r/SaaS/comments/1k11g3a/customer_support_recommendations/), [support tool discussion](https://www.reddit.com/r/SaaS/comments/1rzoeyp/tool_recommendation_for_customer_support/), or [Libredesk's community post](https://www.reddit.com/r/selfhosted/comments/1ng42hx/libredesk_open_source_customer_support_desk/).
- L: [G2's free help desk list](https://learn.g2.com/best-free-help-desk-software) or [Capterra's small-business live chat results](https://www.capterra.com/resources/best-live-chat-software-small-business/). These supplied names, not proof of a free plan. Capterra's full page could not be read by the fetch tool.
- Q: exact-problem searches led to [Daykeeper's small-business list](https://www.mydaykeeper.com/blog/best-customer-support-software), [Moorline's startup list](https://www.moorline.app/guides/best-help-desk-for-startups), or [fromscratch's support list](https://fromscratch.dev/best/customer-support-tools).
- O: a related product linked from an official vendor site opened during this pass.
- E: category expansion from known product names, followed by opening the official page. This is not a claim that a comparison page listed it.
- V4: [Quackback's open-source feedback list](https://quackback.io/blog/open-source-feedback-tools) and [OpenAlternative's feedback category](https://openalternative.co/categories/business-software/customer-support-success/feedback-feature-request-management). Names only.

The official URL in each row is the source for its existence and short inclusion reason. A different evidence page is linked in the reason when needed. All source codes above were checked on 2026-11-04. See `notes.md` for queries and limits.

## Detection routes

These are proposals, not tested fingerprints. Every app has a route below. `W` means inspect the public widget's script or frame address; usually easy when installed in visible code. `H` means inspect a linked hosted help center; moderate and often absent from the homepage. `S` means inspect a linked self-hosted portal or its assets; hard with custom domains and branding. `B` means inspect the board link or embedded feedback widget; moderate. `N` means no dependable homepage signal for the main service. A second route is an alternative. Exact matching rules need official installation evidence later. See `fields.md`.

## Help desks and shared inboxes

| Name | Official URL | Type | Home region or main markets | Why it belongs / limits / overlap | Found | Status | Site confirmed | Detection |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Help Scout | [helpscout.com](https://www.helpscout.com/) | Help desk | Unknown | Shared support inbox and customer help content. | B; V1; R | active | 2026-11-04 | W / H |
| Zendesk | [zendesk.com](https://www.zendesk.com/) | Help desk | Unknown | Customer tickets, messaging, and self-service. Research the entry plan separately from enterprise offers. | B; V1; L | active | 2026-11-04 | W / H |
| Freshdesk | [freshworks.com/freshdesk](https://www.freshworks.com/freshdesk/) | Help desk | Unknown | Customer support tickets and automation. | B; V1; L | active | 2026-11-04 | W / H |
| Zoho Desk | [zoho.com/desk](https://www.zoho.com/desk/) | Help desk | Unknown | Customer inbox, tickets, and help center. | V1; L | active | 2026-11-04 | W / H |
| Plain | [plain.com](https://www.plain.com/) | Help desk | Unknown | Support for software businesses, including developer connections. | B; Q | active | 2026-11-04 | W / N |
| Front | [front.com](https://front.com/) | Shared inbox | Unknown | Team inbox with customer service workflows. Check minimum seats. | B; V1; L | active | 2026-11-04 | W / N |
| Missive | [missiveapp.com](https://missiveapp.com/) | Shared inbox | Unknown | Shared email with private team discussion. | Q | active | 2026-11-04 | N |
| Hiver | [hiverhq.com](https://hiverhq.com/) | Shared inbox | Unknown | Shared support inbox with chat and help center options. | V1; L | active | 2026-11-04 | W / H |
| Gmelius | [gmelius.com](https://gmelius.com/) | Shared inbox | Unknown | Gmail collaboration and AI workflow product; confirm current support-specific package. | V1 | gray | 2026-11-04 | N |
| Drag | [dragapp.com](https://www.dragapp.com/) | Shared inbox | Unknown | Shared Gmail inbox and customer service workflows. | Q; E | active | 2026-11-04 | N / W |
| Helpwise | [helpwise.io](https://helpwise.io/) | Shared inbox | Unknown | Shared support inbox across email and messaging. | V1 | active | 2026-11-04 | W / H |
| SupportBee | [supportbee.com](https://supportbee.com/) | Help desk | Unknown | Email tickets, customer portal, and knowledge base. | Q | active | 2026-11-04 | H / N |
| Helply | [helply.com](https://helply.com/) | Help desk | Unknown | Inbox, help center, and AI support. B2B software only; solo cost needs checking. | Q; Groove redirect | gray | 2026-11-04 | W / H |
| HelpCrunch | [helpcrunch.com](https://helpcrunch.com/) | Help desk | Unknown | Chat, support inbox, help center, and email campaigns. Also email and newsletters. | V1 | active | 2026-11-04 | W / H |
| LiveAgent | [liveagent.com](https://www.liveagent.com/) | Help desk | Unknown | Email, chat, calls, and self-service support. | V1; L | active | 2026-11-04 | W / H |
| HappyFox | [happyfox.com](https://www.happyfox.com/) | Help desk | Unknown | Ticketing and help center; small-business offer exists, minimum purchase needs checking. | V1 | gray | 2026-11-04 | W / H |
| Kayako | [kayako.com](https://kayako.com/) | Help desk | Unknown | Customer inbox, chat, knowledge base, and AI. Current solo offer needs checking. | V1 | gray | 2026-11-04 | W / H |
| Re:amaze | [reamaze.com](https://www.reamaze.com/) | Help desk | Unknown | Inbox, live chat, and FAQ for online businesses. | V1 | active | 2026-11-04 | W / H |
| Gorgias | [gorgias.com](https://www.gorgias.com/) | Help desk | Unknown | Support for ecommerce shops. Check small-volume plan despite enterprise homepage wording. | V1 | active | 2026-11-04 | W / H |
| eDesk | [edesk.com](https://www.edesk.com/) | Help desk | Unknown | Support across stores and marketplaces, including Amazon and eBay. | V1 | active | 2026-11-04 | W / H |
| Richpanel | [richpanel.com](https://www.richpanel.com/) | Help desk | Unknown | Ecommerce support and AI. Demo-led current offer; solo fit unclear. | V1 | gray | 2026-11-04 | W / H |
| Trengo | [trengo.com](https://trengo.com/) | Shared inbox | European-owned; homepage | Email, WhatsApp, social messages, chat, and voice. Bundle cost needs checking. | V1 | gray | 2026-11-04 | W / N |
| respond.io | [respond.io](https://respond.io/) | Shared inbox | Unknown | Messaging inbox includes conversational support as well as sales. | L; E | active | 2026-11-04 | W / N |
| DelightChat | [delightchat.io](https://www.delightchat.io/) | Shared inbox | Unknown | Ecommerce support inbox and WhatsApp communications. | E | active | 2026-11-04 | W / N |
| Desk365 | [desk365.io](https://www.desk365.io/) | Help desk | Unknown | Customer tickets and Microsoft Teams connection. Distinguish customer support from internal IT. | V1 | active | 2026-11-04 | H / N |
| HelpDesk | [helpdesk.com](https://www.helpdesk.com/) | Help desk | Unknown | Text's separate ticketing product for customer teams. | O; E | active | 2026-11-04 | H / N |
| Jitbit Helpdesk | [jitbit.com/helpdesk](https://www.jitbit.com/helpdesk/) | Help desk; self-host option | Unknown | Email tickets, public portal, and chat; hosted and self-hosted editions. | E | active | 2026-11-04 | S / W |
| Deskpro | [deskpro.com](https://www.deskpro.com/) | Help desk | Unknown | Customer tickets, shared inbox, and knowledge base. Check entry contract and hosting editions. | E | active | 2026-11-04 | W / H |
| HelpSpot | [helpspot.com](https://www.helpspot.com/) | Help desk; self-host option | Unknown | Email support and help content; cloud and self-hosted choices. | E | active | 2026-11-04 | S / H |
| Teamwork Desk | [teamwork.com/desk](https://www.teamwork.com/desk/) | Help desk | Unknown | Customer tickets connected to client project work. | E | active | 2026-11-04 | H / N |
| ProProfs Help Desk | [proprofsdesk.com](https://www.proprofsdesk.com/) | Help desk | Unknown | Support tickets, shared inboxes, and automation. | V1 | active | 2026-11-04 | H / N |
| BoldDesk | [bolddesk.com](https://www.bolddesk.com/) | Help desk | Unknown | Ticketing, live chat, knowledge base, and AI. | E | active | 2026-11-04 | W / H |
| SupportPal | [supportpal.com](https://www.supportpal.com/) | Help desk; self-hosted | Unknown | Self-hosted shared inbox and self-service articles. Not labelled open source without licence research. | E | active | 2026-11-04 | S |
| OneDesk | [onedesk.com](https://onedesk.com/) | Help desk | Unknown | Client support and customer portal alongside project management. Wider scope; check minimum purchase. | E | gray | 2026-11-04 | W / H |
| Vision Helpdesk | [visionhelpdesk.com](https://www.visionhelpdesk.com/) | Help desk | Unknown | Customer support tickets and live chat; verify edition and hosting choices. | E | active | 2026-11-04 | S / W |
| Jira Service Management | [atlassian.com](https://www.atlassian.com/software/jira/service-management) | Help desk | Unknown | Can receive customer requests, though current positioning is internal service management. | L; R | gray | 2026-11-04 | H / N |
| TeamSupport | [teamsupport.com](https://www.teamsupport.com/) | Help desk | Unknown | B2B customer support, ticketing, and messaging. Solo purchase needs checking. | V1 | gray | 2026-11-04 | W / H |
| HubSpot Service Hub | [hubspot.com/products/service](https://www.hubspot.com/products/service) | Help desk | Unknown | Customer service suite; separate free tools from paid Service Hub. Also email and newsletters. | V1 | active | 2026-11-04 | W / H |
| Salesforce Starter Suite | [salesforce.com/small-business/starter](https://www.salesforce.com/small-business/starter/) | Help desk within CRM suite | Unknown | Customer cases and email-to-case in the small-business suite. Include this route rather than treating all Salesforce service products as enterprise-only. Also email and newsletters. | V1; L; official small-business page | gray | 2026-11-04 | N / H |
| UseResponse | [useresponse.com](https://www.useresponse.com/) | Help desk | Unknown | Help desk, help center, chat, and feedback tools. Check hosted and self-hosted terms. | E | active | 2026-11-04 | W / S |
| FreeScout | [freescout.net](https://freescout.net/) | Help desk; self-hosted; open source | Unknown | Shared support mailbox; free core with separately offered modules. | G | active | 2026-11-04 | S / N |
| Zammad | [zammad.org](https://zammad.org/) | Help desk; self-hosted; open source | Unknown | Open-source support tickets with current downloadable release. | G | active | 2026-11-04 | S / W |
| osTicket | [osticket.com](https://osticket.com/) | Help desk; self-hosted; open source | Unknown | Support ticket system, with cloud offer branded SupportSystem. | E | active | 2026-11-04 | S / H |
| UVdesk | [uvdesk.com](https://www.uvdesk.com/en/) | Help desk; open-source edition | Unknown | Customer tickets and ecommerce support. Separate open-source and hosted editions later. | E | active | 2026-11-04 | S / H |
| Frappe Helpdesk | [frappe.io/helpdesk](https://frappe.io/helpdesk) | Help desk; open source | Unknown | Customer ticket system; hosting and self-hosting need separate cost records. | G | active | 2026-11-04 | S / H |
| Libredesk | [libredesk.io](https://libredesk.io/) | Help desk; self-hosted; open source | Unknown | Shared email, live chat, and WhatsApp support. | G; R | active | 2026-11-04 | W / S |
| Faveo Helpdesk | [faveohelpdesk.com](https://www.faveohelpdesk.com/) | Help desk | Unknown | Customer ticket system; check community, paid, and self-hosted editions separately. | E | active | 2026-11-04 | S / H |
| Request Tracker | [requesttracker.com](https://requesttracker.com/request-tracker/) | Help desk; open source | Unknown | Email request tracking; Best Practical's old product URL redirects here. | G | active | 2026-11-04 | S / N |
| OTOBO | [otobo.io](https://otobo.io/de/) | Help desk; open source | German-language site; not an eligibility limit | Customer service is an explicit use alongside internal service management. More setup work for a solo builder. | G | gray | 2026-11-04 | S |
| Znuny | [znuny.org](https://www.znuny.org/en) | Help desk; open source | Unknown | Maintained OTRS Community Edition fork. Broader service-desk scope. | E | gray | 2026-11-04 | S |
| OpenSupports | [opensupports.com](https://www.opensupports.com/) | Help desk; open source | Unknown | Customer tickets and articles; current maintenance needs a repository check. | E | gray | 2026-11-04 | S |
| Fluent Support | [fluentsupport.com](https://fluentsupport.com/) | Help desk; WordPress; self-hosted | Unknown | Support tickets inside a WordPress site. | E | active | 2026-11-04 | S |
| SupportCandy | [supportcandy.net](https://supportcandy.net/) | Help desk; WordPress; self-hosted | Unknown | Customer ticket plugin and AI options. | E | active | 2026-11-04 | S |
| ThriveDesk | [thrivedesk.com](https://www.thrivedesk.com/) | Help desk | Unknown | Ecommerce support inbox, chat, and help content. | E | active | 2026-11-04 | W / H |
| Desku | [desku.io](https://desku.io/) | Help desk | Unknown | Shared support inbox, chat, and support automation. | E | active | 2026-11-04 | W / H |
| Heroic Inbox | [herothemes.com](https://herothemes.com/plugins/heroic-inbox/) | Shared inbox; WordPress; self-hosted | Unknown | Shared email support inside WordPress. | O | active | 2026-11-04 | N / S |
| Enchant | [enchant.com](https://www.enchant.com/) | Help desk | Unknown | Support inbox, messenger, and knowledge base. Also email and newsletters. | E | active | 2026-11-04 | W / H |
| HelpSpace | [helpspace.com](https://helpspace.com/) | Help desk | Unknown | Customer help desk for email support and help content. | E | active | 2026-11-04 | H / W |
| Fernand | [getfernand.com](https://getfernand.com/) | Help desk | Unknown | Support inbox, help center, and AI aimed at software teams. | E | active | 2026-11-04 | W / H |
| HelpNinja | [helpninja.com](https://helpninja.com/) | Help desk | Unknown | Email support with ticket-like states. Site is live; current feature and maintenance claims need a recheck. | E | gray | 2026-11-04 | N |
| Zoho TeamInbox | [zoho.com/teaminbox](https://www.zoho.com/teaminbox/) | Shared inbox | Unknown | Shared incoming email and messaging; separate from Zoho Desk. | O | active | 2026-11-04 | N |
| Daykeeper | [mydaykeeper.com](https://www.mydaykeeper.com/) | Help desk | Unknown | Support inbox for humans and AI agents. Small/new vendor; verify public offer in detail later. | Q | active | 2026-11-04 | W / N |
| Moorline | [moorline.app](https://www.moorline.app/) | Help desk; desktop app | Unknown | Support for software founders on macOS; one-person desktop option. | Q | active | 2026-11-04 | N |
| Wati | [wati.io](https://www.wati.io/) | Messaging inbox | Unknown | WhatsApp and social customer support alongside marketing. | E | active | 2026-11-04 | W / N |
| Interakt | [interakt.shop/pricing](https://www.interakt.shop/pricing/) | Messaging inbox | Unknown; regional plans need checking | Support Hub for WhatsApp and other channels. Homepage timed out; pricing/product page opened. | E | active | 2026-11-04 | W / N |
| Callbell | [callbell.eu](https://www.callbell.eu/en/) | Messaging inbox | Unknown | Team inbox for WhatsApp, social messages, and web chat. | E | active | 2026-11-04 | W / N |
| Zoko | [zoko.io](https://www.zoko.io/) | Messaging inbox | Unknown | WhatsApp team inbox and order questions for Shopify sellers. | E | active | 2026-11-04 | W / N |
| Rasayel | [rasayel.io](https://www.rasayel.io/) | Messaging inbox | Unknown | Shared customer conversations on WhatsApp; current homepage focuses on sales. | E | gray | 2026-11-04 | N |
| TimelinesAI | [timelines.ai](https://timelines.ai/) | Messaging inbox | Unknown | Shared WhatsApp conversations and CRM connections. | E | active | 2026-11-04 | N |

## Live chat and customer messaging

| Name | Official URL | Type | Home region or main markets | Why it belongs / limits / overlap | Found | Status | Site confirmed | Detection |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Crisp | [crisp.chat](https://crisp.chat/en/) | Live chat and support suite | France; official pricing/footer | Website chat, support inbox, help center, and AI. | B; V1; R | active | 2026-11-04 | W / H |
| Intercom | [intercom.com](https://www.intercom.com/) | Live chat and support suite | Unknown | Customer messenger, help desk, and help center; Fin recorded separately. | B; V1; Q | active | 2026-11-04 | W / H |
| tawk.to | [tawk.to](https://www.tawk.to/) | Live chat and support suite | Unknown | Website chat and support inbox, with help content. | B; V1; R | active | 2026-11-04 | W / H |
| Chatwoot | [chatwoot.com](https://www.chatwoot.com/) | Live chat and support suite; open source | Unknown | Shared support inbox, widget, AI, and help center; self-hostable edition. | B | active | 2026-11-04 | W / S |
| Tidio | [tidio.com](https://www.tidio.com/) | Live chat and AI | Unknown | Live customer chat and AI support. Lyro belongs under this record. | V1; V3 | active | 2026-11-04 | W |
| LiveChat | [livechat.com](https://www.livechat.com/) | Live chat | Unknown | Text's customer chat product; separate from HelpDesk and ChatBot. | V1 | active | 2026-11-04 | W |
| Olark | [olark.com](https://www.olark.com/) | Live chat and AI | Unknown | Customer questions and human handoff; current focus includes marketing. Verify classic live chat offer. | V1 | gray | 2026-11-04 | W |
| Chatra | [chatra.com](https://chatra.com/) | Live chat | Unknown | Web chat and email/social messaging. Homepage says it is a Brevo company. | V1 | active | 2026-11-04 | W |
| JivoChat | [jivochat.com](https://www.jivochat.com/) | Live chat | Unknown | Customer website chat and messaging channels. | V1 | active | 2026-11-04 | W |
| Smartsupp | [smartsupp.com](https://www.smartsupp.com/) | Live chat and AI | Unknown | Website support chat plus email and social messages. | V1 | active | 2026-11-04 | W |
| Lime Connect | [connect.lime-technologies.com](https://connect.lime-technologies.com/de/) | Live chat and messaging | Europe; official rebrand notice | Formerly Userlike. Chat, messaging inbox, and AI. Current solo pricing needs checking. | V1; official redirect | gray | 2026-11-04 | W |
| Chaport | [chaport.com](https://www.chaport.com/) | Live chat | Unknown | Customer web chat, chatbots, and knowledge base. | E | active | 2026-11-04 | W / H |
| Chatway | [chatway.app](https://chatway.app/) | Live chat | Unknown | Web chat, shared conversations, and human/AI support. | R | active | 2026-11-04 | W |
| Formilla | [formilla.com](https://www.formilla.com/) | Live chat and AI | Unknown | Chat and bots for customer questions. | V1 | active | 2026-11-04 | W |
| Pure Chat | [purechat.com/our-pricing](https://purechat.com/our-pricing/) | Live chat | Unknown | Website chat; current official pricing page opened after homepage fetch failed. | V1 | active | 2026-11-04 | W |
| Chatlio | [chatlio.com](https://chatlio.com/) | Live chat | Unknown | Website chat answered from Slack. | V1 | active | 2026-11-04 | W |
| LiveHelpNow | [livehelpnow.net](https://livehelpnow.net/) | Live chat and support suite | Unknown | Chat, tickets, and knowledge base in one product. | V1 | active | 2026-11-04 | W / H |
| Zoho SalesIQ | [zoho.com/salesiq](https://www.zoho.com/salesiq/) | Live chat | Unknown | Visitor chat and customer communication, alongside sales tools. | O | active | 2026-11-04 | W |
| Freshchat | [freshworks.com/live-chat-software](https://www.freshworks.com/live-chat-software/) | Live chat | Unknown | Freshworks' separate messaging product. Do not merge with Freshdesk. | O | active | 2026-11-04 | W |
| Tiledesk | [tiledesk.com](https://tiledesk.com/) | Chat and AI builder | Unknown | Customer conversation automation with human involvement. Verify self-hosted edition and current licence. | E | active | 2026-11-04 | W / S |
| Kommunicate | [kommunicate.io](https://www.kommunicate.io/) | Chat and AI | Unknown | Customer support automation with human handoff. | E | active | 2026-11-04 | W |
| Collect.chat | [collect.chat](https://collect.chat/) | Chatbot | Unknown | Website questions, forms, and feedback. Boundary: lead capture is a major use. | E | gray | 2026-11-04 | W |
| Shopify Inbox | [apps.shopify.com/inbox](https://apps.shopify.com/inbox) | Live chat | Unknown | Customer chat for Shopify shops. Requires the Shopify platform. | V1 | active | 2026-11-04 | W |
| Rocket.Chat | [rocket.chat](https://www.rocket.chat/) | Messaging; self-host option | Unknown | Broader messaging platform. Current homepage stresses secure internal communications; verify external support edition. | V1 | gray | 2026-11-04 | S / W |
| 3CX Live Chat | [3cx.com/live-chat](https://www.3cx.com/live-chat/) | Live chat and calling | Unknown | Website chat connected to a phone system; includes self-hosted deployment routes. | V1 | gray | 2026-11-04 | W / S |

## Knowledge bases and help centers

| Name | Official URL | Type | Home region or main markets | Why it belongs / limits / overlap | Found | Status | Site confirmed | Detection |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HelpKit | [helpkit.so](https://www.helpkit.so/) | Help center | Unknown | Turns Notion documents into a customer help center. | B | active | 2026-11-04 | H / W |
| Document360 | [document360.com](https://document360.com/) | Knowledge base | Unknown | Customer documentation and self-service knowledge base. Current solo cost needs checking. | B | gray | 2026-11-04 | H / W |
| HelpDocs | [helpdocs.io](https://www.helpdocs.io/) | Help center | Unknown | Hosted customer articles and embedded answers. | E | active | 2026-11-04 | H / W |
| Helpjuice | [helpjuice.com](https://helpjuice.com/) | Knowledge base | Unknown | Public customer knowledge base; current minimum package needs checking. | E | gray | 2026-11-04 | H |
| KnowledgeBase | [knowledgebase.com](https://www.knowledgebase.com/) | Help center | Unknown | Text's customer knowledge base product. | O | active | 2026-11-04 | H / W |
| ProProfs Knowledge Base | [proprofskb.com](https://www.proprofskb.com/) | Knowledge base | Unknown | Public customer help content; distinct from ProProfs Help Desk. | O | active | 2026-11-04 | H / W |
| Stonly | [stonly.com](https://stonly.com/) | Guided help | Unknown | Guided customer answers and agent knowledge. Current offer is demo-led; solo fit unclear. | E | gray | 2026-11-04 | W / H |
| Archbee | [archbee.com](https://www.archbee.com/) | Knowledge portal | Unknown | Customer and technical documentation portals. Boundary with developer documentation. | E | gray | 2026-11-04 | H |
| GitBook | [gitbook.com](https://www.gitbook.com/) | Documentation | Unknown | Can publish customer-facing product docs. General documentation boundary. | E | gray | 2026-11-04 | H |
| ReadMe | [readme.com](https://readme.com/) | Developer documentation | Unknown | Helps customers use an API. API means a way for software to talk to other software. Boundary with developer tools. | E | gray | 2026-11-04 | H |
| Mintlify | [mintlify.com](https://www.mintlify.com/) | Developer documentation | Unknown | Public product docs and answers for developer customers. Boundary with developer tools. | E | gray | 2026-11-04 | H |
| Docsie | [docsie.io](https://www.docsie.io/) | Knowledge base | Unknown | Customer self-service content alongside technical and training documents. | E | active | 2026-11-04 | H / W |
| BookStack | [bookstackapp.com](https://www.bookstackapp.com/) | Wiki; self-hosted; open source | Unknown | Can provide public product help. General wiki boundary. | E | gray | 2026-11-04 | S |
| Wiki.js | [js.wiki](https://js.wiki/) | Wiki; self-hosted; open source | Unknown | Public documentation possible; needs customer-help fit decision. | E | gray | 2026-11-04 | S |
| phpMyFAQ | [phpmyfaq.de](https://www.phpmyfaq.de/) | FAQ; self-hosted; open source | Unknown | Public searchable customer questions and answers. | E | active | 2026-11-04 | S |
| Outline | [getoutline.com](https://www.getoutline.com/) | Wiki; self-host option; source available | Unknown | Team knowledge base with possible public sharing. Check customer-help suitability and licence; do not call it open source by default. | E | gray | 2026-11-04 | S / H |
| XWiki | [xwiki.org](https://www.xwiki.org/) | Wiki; open source | Unknown | Could publish customer help, but broader platform setup may be excessive. | E | gray | 2026-11-04 | S |
| BetterDocs | [betterdocs.co](https://betterdocs.co/) | Help center; WordPress | Unknown | Customer knowledge base plugin and AI answers. | E | active | 2026-11-04 | S / W |
| Heroic KB | [herothemes.com](https://herothemes.com/plugins/heroic-wordpress-knowledge-base/) | Help center; WordPress | Unknown | Customer help content, search, and article feedback inside WordPress. | E | active | 2026-11-04 | S / W |
| weDocs | [wedocs.co](https://wedocs.co/) | Help center; WordPress | Unknown | WordPress product documentation and help articles. | E | active | 2026-11-04 | S / W |
| Echo Knowledge Base | [echoknowledgebase.com](https://www.echoknowledgebase.com/) | Help center; WordPress | Unknown | Customer knowledge base with search and AI options. | E | active | 2026-11-04 | S / W |
| LibreKB | [librekb.com](https://librekb.com/) | Help center; self-hosted; open source | Unknown | Dedicated public knowledge base using PHP and MySQL. | G | active | 2026-11-04 | S |
| Discourse | [discourse.org](https://www.discourse.org/) | Community support; open source | Unknown | Customer support forum is an explicit use. Boundary: community product rather than a help desk. | E | gray | 2026-11-04 | H / S |

## AI support agents and builders

| Name | Official URL | Type | Home region or main markets | Why it belongs / limits / overlap | Found | Status | Site confirmed | Detection |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chatbase | [chatbase.co](https://www.chatbase.co/) | AI support agent | US; [privacy notice](https://www.chatbase.co/legal/privacy) | Answers customer questions across chat and other channels. | B; V3 | active | 2026-11-04 | W |
| Fin | [fin.ai](https://fin.ai/) | AI support agent | Unknown | Intercom's separately offered customer agent. Record required help desk and minimum spend later. | B; L; V3 | active | 2026-11-04 | W / N |
| SiteGPT | [sitegpt.ai](https://sitegpt.ai/) | AI support agent | Unknown | Customer answers trained on website content. | V3 | active | 2026-11-04 | W |
| DocsBot | [docsbot.ai](https://docsbot.ai/) | AI support agent | Unknown | Customer answers and actions based on supplied knowledge. | V3 | active | 2026-11-04 | W |
| CustomGPT.ai | [customgpt.ai](https://customgpt.ai/) | AI support agent | Unknown | Customer answers grounded in company content; enterprise positioning makes current solo cost worth checking. | V3 | gray | 2026-11-04 | W |
| ChatNode | [chatnode.ai](https://www.chatnode.ai/) | AI support agent | Unknown | Website and data-trained customer support agent. | E | active | 2026-11-04 | W |
| Dante AI | [dante-ai.com](https://www.dante-ai.com/) | AI support agent | Unknown | Customer questions answered from a website and documents. | E | active | 2026-11-04 | W |
| Askli | [askli.co](https://www.askli.co/) | AI support agent | Unknown | Chaindesk's domain now serves Askli branding; widgets, inbox, and human takeover. Rebrand relationship needs a dated notice. | E; official Chaindesk site | gray | 2026-11-04 | W / N |
| My AskAI | [myaskai.com](https://myaskai.com/) | AI support agent | Unknown | AI added to existing help desks; base desk cost is extra. Check affordability. | V3 | gray | 2026-11-04 | N / W |
| eesel AI | [eesel.ai](https://www.eesel.ai/) | AI support agent | Unknown | AI customer service on top of a help desk. Check current minimum spend. | V3 | gray | 2026-11-04 | N / W |
| Botpress | [botpress.com](https://botpress.com/) | AI support builder | Unknown | Builds customer support agents. Separate current cloud service from old open-source versions. | V3 | gray | 2026-11-04 | W |
| Voiceflow | [voiceflow.com](https://www.voiceflow.com/) | AI support builder | Unknown | Builds customer conversation agents. Wider builder product; current solo plan needs checking. | V3 | gray | 2026-11-04 | W |
| Typebot | [typebot.com](https://typebot.com/) | Chatbot builder; self-host option | Unknown | Support flows and website bots. Source is public; current licence needs checking before an open-source label. | E | gray | 2026-11-04 | W / S |
| ChatBot | [chatbot.com](https://www.chatbot.com/) | AI support agent | Unknown | Text's separate customer support chatbot product. | O; V3 | active | 2026-11-04 | W |
| FastBots | [fastbots.ai](https://fastbots.ai/) | AI support agent | Unknown | Website/customer support bots with messaging connections. | E | active | 2026-11-04 | W |
| Aidbase | [aidbase.ai](https://www.aidbase.ai/) | AI support agent | Unknown | Support bots, help content, tickets, and email for SaaS startups. | E | active | 2026-11-04 | W |
| Inkeep | [inkeep.com](https://inkeep.com/) | AI support agent | Unknown | Answers customer questions from product knowledge. Current solo purchase needs checking. | E | gray | 2026-11-04 | W / N |
| Mendable | [mendable.ai](https://www.mendable.ai/) | AI support search | Unknown | Embedded technical answers for sales and support. Live site links Firecrawl; current standalone offer needs checking. | E | gray | 2026-11-04 | W / N |
| HelpJet | [helpjet.com](https://helpjet.com/) | AI support agent | Unknown | Small-business website support bot; linked by HeroThemes. | O; V3 | active | 2026-11-04 | W |
| Chatling | [chatling.ai](https://chatling.ai/) | AI support agent | Unknown | Customer agents on web and messaging with human handoff. | V3 | active | 2026-11-04 | W |
| Wonderchat | [wonderchat.io](https://wonderchat.io/) | AI support agent | Unknown | AI support and human help desk. Check limits directly; comparisons disagree. | V3 | active | 2026-11-04 | W |
| Botsonic | [botsonic.com](https://botsonic.com/) | AI support agent | Unknown | Customer bot trained on website, files, and help content. | V3 | active | 2026-11-04 | W |

## Feedback and roadmap boards: boundary cases

Every row in this section needs the owner's scope decision. They gather customer requests and close the feedback loop, but do not necessarily resolve support tickets. Featurebase and Quackback also have direct support products, so their main inclusion does not depend on feedback boards being approved.

| Name | Official URL | Type | Home region or main markets | Why it belongs / limits / overlap | Found | Status | Site confirmed | Detection |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Canny | [canny.io](https://canny.io/) | Feedback board | Unknown | Requests, customer comments, and prioritization. Boundary. | B; V2 | gray | 2026-11-04 | B |
| Featurebase | [featurebase.app](https://www.featurebase.app/) | Help desk and feedback | Unknown | Direct support inbox, help center, AI, and feedback. Feedback portion is boundary; support is in scope. | B; V2 | active | 2026-11-04 | W / B |
| Upvoty | [upvoty.com](https://upvoty.com/) | Feedback board | Unknown | Customer requests, voting, and public roadmap. Boundary. | B; V2 | gray | 2026-11-04 | B |
| Fider | [fider.io](https://www.fider.io/) | Feedback board; self-hosted; open source | Unknown | Feature requests and voting. [Official repository](https://github.com/getfider/fider) confirms cloud and self-hosted options. Old getfider.com redirects here. Boundary. | B; V2; V4 | gray | 2026-11-04 | B / S |
| Frill | [frill.co](https://frill.co/) | Feedback board | Unknown | Ideas, roadmap, announcements, and surveys. Boundary. | V2 | gray | 2026-11-04 | B |
| Nolt | [nolt.io](https://nolt.io/) | Feedback board | Unknown | Customer request boards and updates. Boundary. | V2 | gray | 2026-11-04 | B |
| Sleekplan | [sleekplan.com](https://sleekplan.com/) | Feedback board | Unknown | Customer feedback, roadmap, and satisfaction surveys. Boundary. | V2 | gray | 2026-11-04 | B |
| FeatureOS | [featureos.com](https://featureos.com/) | Feedback board | Unknown | Requests, roadmap, and customer updates. [Official notice](https://featureos.com/blog/hellonext-is-now-featureos) confirms the Hellonext rebrand. Boundary. | V2 | gray | 2026-11-04 | B |
| FeedBear | [feedbear.com](https://www.feedbear.com/) | Feedback board | Unknown | Requests, public roadmap, and announcements. Boundary. | V2 | gray | 2026-11-04 | B |
| Rapidr | [rapidr.io](https://rapidr.io/) | Feedback board | Unknown | Customer feedback and feature request management. Boundary. | V2 | gray | 2026-11-04 | B |
| Feature Upvote | [featureupvote.com](https://featureupvote.com/) | Feedback board | Unknown | User suggestions and voting, including games and SaaS. Boundary. | V2 | gray | 2026-11-04 | B |
| Userback | [userback.io](https://userback.io/) | Feedback and bug reports | Unknown | Customer feedback, screenshots, and feature portal. Boundary; also error monitoring through user-reported bugs, not automatic error tracking. | V2 | gray | 2026-11-04 | W / B |
| Savio | [savio.io](https://www.savio.io/) | Feedback management | Unknown | Collects support feedback and tells customers when requests ship. Boundary. | E | gray | 2026-11-04 | N / B |
| Beamer | [getbeamer.com](https://www.getbeamer.com/) | Product updates and feedback | Unknown | Customer announcements and feedback. Boundary; also email and newsletters for product updates. | V2 | gray | 2026-11-04 | W / B |
| Changemap | [changemap.co](https://changemap.co/) | Feedback board | Unknown | Customer suggestions, voting, and roadmap. Boundary. | E | gray | 2026-11-04 | B |
| ProductLift | [productlift.dev](https://www.productlift.dev/) | Feedback and help content | Unknown | Feedback, roadmap, and knowledge base. Feedback boundary; help-content portion is in scope. | E | gray | 2026-11-04 | B / H |
| Supahub | [supahub.com](https://supahub.com/) | Feedback board | Unknown | Feature requests and customer update loop. Boundary. | E | gray | 2026-11-04 | B |
| Convas | [convas.io](https://convas.io/) | Feedback board | Unknown | Customer feedback page, widget, and public roadmap. Boundary. | E | gray | 2026-11-04 | B |
| ClearFlask | [clearflask.com](https://clearflask.com/) | Feedback board; open source | Unknown | Feedback, roadmap, and announcements with source available to inspect. Boundary. | V4 | gray | 2026-11-04 | B / S |
| LogChimp | [logchimp.app](https://logchimp.app/) | Feedback board; open source | Unknown | Customer requests, votes, and roadmap. Old codecarrot subdomain redirects here. Boundary. | V4 | gray | 2026-11-04 | B / S |
| Quackback | [quackback.io](https://quackback.io/) | Help desk and feedback | Unknown | Support inbox, help center, widget, and feedback. Verify source licence and self-hosted edition later. Feedback portion is boundary. | V4 | active | 2026-11-04 | W / B |

## Calling and text messages: scope extension for owner review

These products fit the broad request to talk to customers, but are outside the five examples in the brief. Keep them separate until the owner decides whether calling deserves its own group. A phone link cannot identify the software behind it.

| Name | Official URL | Type | Home region or main markets | Why it belongs / limits / overlap | Found | Status | Site confirmed | Detection |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quo | [quo.com](https://www.quo.com/) | Calling and SMS | Unknown; phone-country eligibility must be checked | Former OpenPhone; shared calls and texts for small businesses. Boundary. | E | gray | 2026-11-04 | N |
| Aircall | [aircall.io](https://aircall.io/) | Calling and SMS | Unknown; number availability must be checked | Support calls and shared customer communications. Check minimum seats. Boundary. | E | gray | 2026-11-04 | N |
| JustCall | [justcall.io](https://justcall.io/) | Calling and SMS | Unknown; number availability must be checked | Calling and messaging for support as well as sales. Boundary. | E | gray | 2026-11-04 | N |
| CloudTalk | [cloudtalk.io](https://www.cloudtalk.io/) | Calling | Unknown; number availability must be checked | Support calling and routing; solo minimum package needs checking. Boundary. | E | gray | 2026-11-04 | N |
| Dialpad | [dialpad.com](https://www.dialpad.com/) | Calling | Unknown; number availability must be checked | Customer calls; separate business phone from contact-center edition. Boundary. | E | gray | 2026-11-04 | N |
| RingCentral | [ringcentral.com](https://www.ringcentral.com/) | Calling | Unknown; number availability must be checked | Business phone can handle customer calls. Do not equate entry phone pricing with contact-center pricing. Boundary. | E | gray | 2026-11-04 | N |
