# Product direction

## Status and purpose

This is the agreed direction for stack127. It guides future website, product, and business changes. It records the intended model; it does not mean the website already implements every part of it.

The current implementation rules remain in the linked operating docs until the relevant work updates them. The future work section identifies what needs to be aligned with this direction.

## Positioning and audience

stack127 is a tools and directories website for tech tinkerers and hustlers.

The agreed byline is:

> Tools and directories for tech tinkerers and hustlers.

The audience includes people who explore technology, solve practical problems, build their own systems, automate work, and experiment with ways to earn money. Earning money is one motivation, not a requirement for using the site.

Homelab users belong within the tinkerer audience. They remain welcome and their resources remain part of stack127, but they no longer define the whole website's audience or business choices.

The brand can cover several subjects. Each subject needs useful resources for its own visitors. Someone using KDP tools does not need to be interested in DNS or storage tools, and a homelab visitor does not need to use the business-oriented resources.

Use concrete titles and descriptions on individual pages so people understand what they can do there. The byline gives the brand its identity; it does not need to appear on every page.

## Why the commercial approach is changing

Earlier, stack127 held back from Google Analytics and advertising because of expected preferences within its homelab audience. Those were deliberate audience and product choices, not technical restrictions. They left the business leaning heavily toward sponsorships.

That audience assumption no longer sets sitewide policy. Google Analytics and advertising are acceptable options for the broader website. Future work should not reject either merely because some homelab users may dislike them.

The working business assumption is that useful tools can earn repeat use while carrying reasonable advertising and analytics. This is a direction to implement and measure, not a claim that every tinkerer or hustler shares the same preferences.

Sponsorship remains available when it fits a resource or subject. It is one revenue option, not a prerequisite for building or sustaining a section.

## What stack127 will build

The core offering has five forms:

| Offering | Purpose |
| --- | --- |
| Tools | Help someone calculate, check, generate, convert, plan, or complete a concrete task. Tools may be free or paid and may use AI where it helps. |
| Directories | Help someone discover and compare relevant third-party software, hardware, services, or other resources using useful, maintained facts. |
| Reference pages | Make facts, specifications, rules, and other lookup information easy to find and understand. |
| Courses | Teach a subject or process through a connected sequence of lessons. |
| Software and other digital products | Provide a larger product with its own experience and commercial model, such as BaseBuddy. |

These are available formats, not a quota. A subject may need only tools. Another may justify a directory, references, a course, and a product. There is no fixed number of tools or directories per subject, and a substantial product does not have to be reduced to a small utility.

Tools, directories, and references remain central. Supporting explanations and course lessons should have the depth needed to help the reader. The growth model does not depend on long informational articles, unrelated posts, or a constant publishing schedule designed to fill a content feed.

## Subject selection and depth

Grow into subjects the founder actively explores and understands. Existing areas include self-hosting, homelabs, DNS, domains, storage, and home automation. KDP is a discussed expansion area. Trading automation is an example of a possible later area, not a committed launch.

New subjects do not need an artificial connection to homelabs. They need a clear fit with practical exploration, technology, building, or earning, and identifiable tasks that stack127 can help with.

The intent is to cover chosen subjects deeply. Build connected resources around meaningful user needs instead of publishing a few basic pages and abandoning the subject. Depth means useful coverage, accurate behavior, and maintained facts. It does not require separate pages for every keyword variation or all five offering types.

Personal experience helps identify problems and judge solutions. Research, sources, testing, and user feedback remain necessary. A new area also creates ongoing maintenance work after attention moves to another subject.

## Revenue and analytics

| Resource or capability | Agreed direction |
| --- | --- |
| Free tools | Advertising can support free use. Add it as needed while keeping the tool usable. |
| Free directories and reference pages | Advertising can help fund research and maintenance. Sponsorship is optional. |
| Paid tools | Provide paid access or capabilities with an ad-free paid tool experience. |
| AI tools | Support paid AI credits or usage-based access where appropriate. |
| Courses, software, and other digital products | Allow their own free or paid models according to the offering. |
| Sponsorships | Use selectively, including sponsorship of a particular subject or resource. |
| Google Analytics | Allowed as an analytics option. The earlier homelab-driven objection is no longer a sitewide restriction. |

The free and paid distinction should be understandable. Free resources may carry ads; paid tools should not. This does not require ads on every free page from the first release. Whether a purchase removes ads elsewhere on stack127 remains a pricing and account-design decision.

Google Analytics measures use. Advertising services such as AdSense provide ad monetization. Both can be considered independently. No ad provider, placement system, pricing schedule, credit package, subscription structure, or billing provider has been selected by this direction document.

Ads should fit the existing performance and interface standards. They should not obscure controls, look like tool results, or make completing a task difficult. Paid capabilities should have a clear purpose and price. For AI usage, define what consumes credits and how failed work is handled before launch.

Track whether revenue supports the cost of running and maintaining each offering. Advertising income is a possible funding source, not an assumed guarantee that every directory pays for itself. Paid AI usage also needs to account for the cost of providing the result.

stack127 uses self-hosted Umami for aggregate analytics and optional Google Analytics after visitor consent. Google Analytics complements Umami. The privacy policy and environment inventory must stay aligned with any change in data collection.

## Site structure and URLs

### Root-level resources

Standalone tools, directories, references, and course entry pages keep short root-level URLs.

| Resource | Example |
| --- | --- |
| Tool | `/dns-lookup` |
| Directory | `/self-host-apps` |
| Reference | `/epp-status-codes` |
| Course entry | `/self-hosting-for-beginners` |

Do not require `/tools/`, `/directories/`, `/references/`, or `/courses/` prefixes. Source route groups can continue to organize the repository without changing public URLs.

A resource keeps one canonical address even when several indexes or topic landing pages link to it. Creating a topic landing page does not move existing tools beneath that topic's URL.

### Child pages

Use `/<main-page>/<sub-page>` when the child belongs to the main resource. Course lessons and reference subpages commonly need this structure. Directories and tools may also have genuine child pages when their task requires them.

For example, `/self-hosting-for-beginners/install-docker` is a lesson within the course. A standalone DNS tool linked from `/dns-tools` still keeps its own root URL.

Child routes are allowed by this direction. They are different from nesting every independent tool beneath a collection.

### Pagination

Keep the existing query-parameter pagination style. For example, the second page of the self-host apps listing is `/self-host-apps?page=2`. Filtered listings retain their filter parameters alongside `page`. Page one uses the listing URL without a `page` parameter.

Each pagination sequence belongs to its listing. Implement pagination where it is useful rather than requiring it everywhere. Changing the pagination URL format is not part of this transition.

Keep the current policy in [seo.md](seo.md): paginated query variants remain `noindex, follow`, stay out of the sitemap, and use the clean listing URL as their canonical. Genuine child pages still follow the central publication rules; pagination does not require new child routes.

### Index pages

Index pages group related stack127 resources so people can find them together. Examples include `/dns-tools`, `/domain-tools`, and a future `/kdp-tools`.

An index can link to a tool also listed elsewhere. It organizes discovery and does not own the tool's URL. In the current repository vocabulary, tool index pages are catalogs; directories describe third-party entries.

There is no need to create a dedicated topic area before enough useful resources exist. An index such as `/kdp-tools` can be the first entry point.

### Topic landing pages

Later, broader landing pages such as `/kdp` and `/homelab` can bring together everything stack127 offers for a subject. They may include tools, directories, references, courses, and links to products.

These pages have a broader job than a tool index. `/kdp-tools` helps visitors find KDP tools; `/kdp` can introduce the whole KDP offering. Keep both only when each has a useful purpose.

Topic landing pages should use the shared stack127 identity. Their precise layout, navigation, and repository ownership will be planned when they are needed. The discussion did not approve separate mini-brands for each subject.

### Software and digital products

Software products and other digital products can use their own subdomains. The agreed example is `basebuddy.stack127.com`.

Present products consistently as part of the stack127 offering and link to them from relevant pages. Their application experiences can operate separately from the main resource website.

Products start under the shared domain. Once demand and revenue are proven, a product may justify its own domain. A move is a deliberate business decision, not an automatic requirement for a successful product.

This is a branding and operating model. It makes no promise about automatic search authority sharing between the main site and product subdomains.

## Standards that continue to apply

Move fast and update fast while keeping the existing standards:

- Keep pages fast, small, responsive, accessible, and consistent with the shared design system. Dark mode remains the default feel.
- Keep important page content server-rendered and readable by search crawlers and AI agents.
- Use the format that explains the subject best. Tables compare repeated facts, precise charts show measured quantities, and marker art explains concepts.
- Preserve clear labels, useful results, recovery from errors, and the shared tool interface patterns.
- Use verified sources for directory facts and reference material. Keep uncertainty explicit; an unknown value is better than invented precision.
- Test calculations and behavior, inspect rendered interfaces, and apply the existing quality gates before publication.
- Keep the shared writing voice. Explain what people need to know without filler, keyword repetition, or a word-count target.
- Maintain existing resources as the site expands. Free and paid offerings share the same accuracy standard.

AI should help with research, drafting, implementation, checks, and maintenance. Generated output still needs source verification, meaningful tests, and review appropriate to the work. AI makes the process faster; it does not establish correctness by itself.

The five commercial offering types do not replace the repository's page-family taxonomy. Catalogs, info pages, legal pages, and the other implementation families continue to serve their existing structural purposes.

## Current implementation scope

The first pass updates the existing website code and development metadata for this direction. Production release is a separate step. Verification and release status are recorded in [the first-pass record](../stack127_records/2026-09-15-product-direction-first-pass.md).

This pass covers:

- Update the homepage byline, introduction, and recommendations using existing published destinations.
- Update About while preserving the founder's history, name origin, and current affiliate disclosures.
- Make the homepage the general discovery destination in shared navigation and missing-page recovery.
- Align the shared site description and homepage, About, and Terms metadata.
- Describe the existing offering accurately in the Terms introduction and scope.
- Update agent guidance, topic-research criteria, page briefs, and relevant tests.

Keep the existing page layouts, collection grid, generated artwork, specialist content, canonical resource URLs, and query-parameter pagination. Advertising, paid tools, AI credits, new product listings, and broad topic landing pages are later work. This scope does not introduce those features or describe them as already available.

## Future implementation work

The remaining work builds on the first pass. This document does not schedule or execute it.

| Area | Work to plan |
| --- | --- |
| Navigation and discovery | Make resource types and subject indexes easy to find. Add broad topic landing pages when there is enough material to justify them. |
| Page architecture | Document ownership for broad topic landing pages and any new child-page patterns. Preserve canonical URLs, central publication rules, and route coverage. |
| Advertising | Select a provider and placements, define eligible free pages, and verify performance and the ad-free paid experience. |
| Analytics | Review page-view reports before adding events. Keep tool inputs and query strings out of analytics data. |
| Paid tools and credits | Define pricing, accounts, payments, access, usage accounting, and failure handling for the first paid offering. |
| Product discovery | Decide how subdomain products appear alongside relevant resources and how users recognize them as stack127 products. |
| Growth and maintenance | Track use, revenue, running costs, and freshness by offering or subject. Use those results to choose what to improve and expand. |

Specific providers, prices, launch order, paid entitlements, credit rules, layouts, and the next subject's exact resource list remain open. These are implementation decisions, not reasons to revisit the agreed audience or return to a sponsor-dependent model.

## Related operating docs

- [Page families](page-families.md) describes current page ownership and shared structure.
- [Design system](design-system.md) and [tool interface](tool-interface.md) govern appearance and interaction.
- [Writing style](writing-style.md) and [visual-first planning](visual-first.md) govern explanation and format choices.
- [SEO](seo.md) and [tool pages](tool-pages.md) govern publication, metadata, and content ownership.
- [Environment inventory](environment-inventory.md) records the current runtime configuration.
- [Repository structure](repo-structure.md) and [stack127 repos](stack127-repos.md) govern file and repository ownership.
