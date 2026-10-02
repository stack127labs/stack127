# Product direction

This is what stack127 is, who it's for, and how it grows. Use it to judge new pages, tools, and business choices. The linked operating docs hold the exact rules for building them.

## Who stack127 is for

stack127 is a toolbox and reference hub for indie hackers.

That means solo developers and digital creators who build and run projects online. They ship apps and websites, sell books and digital products, and run small online businesses, mostly on their own.

The byline:

> A toolbox and reference hub for indie hackers.

When a page needs the longer version, use "indie hackers, solo developers, and digital creators".

Earning money is a common goal, but not a requirement. A visitor might be building a side project, testing an idea, or running a business that already pays.

### What changed

stack127 started with a broad scope: smart home, homelab, self-hosting, open source, and indie hackers. That was too wide to serve well. In October 2026 the focus narrowed to indie hackers.

| Area | Status |
| --- | --- |
| Home automation tools | Removed. |
| Smart home and hardware directories | Still published, but off the homepage. No new work. |
| Self-host apps and CLI apps directories | Kept. Solo developers use both. |
| Self-hosting course and self-hosting references | Kept. They serve developers who run their own apps. |

Don't plan new smart home or homelab resources. Before adding to the hardware directories, ask whether they should stay published at all.

## What stack127 builds

| Offering | What it does |
| --- | --- |
| Tools | Help someone calculate, check, generate, convert, or plan one task. Tools can be free or paid and can use AI where it helps. |
| Directories | Help someone find and compare third-party software, services, or other resources, using facts we keep up to date. |
| Reference pages | Make facts, specs, and rules easy to look up. |
| Courses | Teach a subject through lessons in order. |
| Software and digital products | Bigger products with their own experience and pricing, such as BaseBuddy. |

These are formats to choose from, not a quota. One subject may need only tools. Another may need a directory, references, a course, and a product.

Tools, directories, and references come first. Guides and lessons should be as long as the reader needs, and no longer. stack127 doesn't publish a stream of articles to fill a feed.

## Choosing subjects

Pick subjects the founder knows and uses, where indie hackers have a real, repeated task. Current subjects:

- Self-publishing on Amazon KDP
- SaaS metrics, such as MRR, churn, and margins
- Platform fees and payouts
- Domains and DNS
- Developer, hosting, and storage tools, such as CLI apps, self-hosted apps, and config checkers

Launch directories and ad networks are in progress and not published yet.

A new subject fits when indie hackers need it to build, launch, sell, or run a project, and stack127 can help with a specific task.

Cover a subject well instead of starting many. That means useful coverage, correct behavior, and facts kept current. It doesn't mean a page for every keyword or all five offering types.

Personal experience helps spot problems. Research, sources, testing, and feedback still have to back every page. Each new subject also adds upkeep after attention moves on.

## Revenue and analytics

| Resource | Plan |
| --- | --- |
| Free tools | Ads can pay for free use. The tool must stay easy to use. |
| Free directories and reference pages | Ads can pay for research and upkeep. Sponsors are optional. |
| Paid tools | Paid access or features, with no ads. |
| AI tools | Paid credits or usage-based pricing where it makes sense. |
| Courses, software, and products | Each can be free or paid. |
| Sponsorships | Used selectively, such as a sponsor for one subject or resource. |
| Affiliate links | Allowed with a clear disclosure. They never change rankings or placement. |

Keep free and paid easy to tell apart. Free pages may show ads. Paid tools don't. Not every free page needs ads from day one. Whether a purchase removes ads elsewhere is still open.

No ad provider, prices, credit packages, subscriptions, or billing provider have been chosen yet.

Ads must not hide controls, look like tool results, or get in the way of the task. Paid features need a clear purpose and price. For AI credits, decide what uses credits and what happens when a request fails before launch.

Track whether each offering earns enough to cover its running and upkeep costs. Don't assume ads will pay for every directory. AI features also need to cover their own costs.

stack127 uses self-hosted Umami for aggregate analytics. Google Analytics runs only after a visitor agrees. Keep the privacy policy and [environment inventory](environment-inventory.md) up to date whenever data collection changes.

## URLs and site structure

### Root URLs

Tools, directories, references, and course entry pages get short root URLs.

| Resource | Example |
| --- | --- |
| Tool | `/dns-lookup` |
| Directory | `/platform-fees` |
| Reference | `/epp-status-codes` |
| Course | `/self-hosting-for-beginners` |

Don't add `/tools/`, `/directories/`, `/references/`, or `/courses/` prefixes. Route groups organize the code without changing public URLs.

Each resource has one canonical URL, even when several pages link to it.

### Child pages

Use `/<main-page>/<sub-page>` when the page belongs to the main resource. Course lessons and reference sections often need this. For example, `/self-hosting-for-beginners/install-docker` is a lesson in the course.

An independent tool listed in a catalog keeps its own root URL. `/dns-lookup` stays at the root even though `/dns-tools` lists it.

### Pagination

Listings use query pagination, such as `/self-host-apps?page=2`. Filters stay in the query next to `page`. Page one has no `page` parameter.

Paginated and filtered URLs are `noindex, follow`, stay out of the sitemap, and point their canonical at the clean listing URL. See [seo.md](seo.md).

### Catalogs and topic pages

A catalog groups related stack127 tools, such as `/kdp-tools`, `/saas-tools`, or `/dns-tools`. A tool can appear in several catalogs. The catalog doesn't own the tool's URL. In this repo, catalogs list our tools and directories list third-party entries.

Later, a topic page such as `/kdp` can bring together everything stack127 offers on one subject: tools, references, courses, and products. Build one only when there's enough useful material, and keep both `/kdp` and `/kdp-tools` only if each has its own job. Topic pages use the shared stack127 design, not a separate brand.

### Products on subdomains

Software products can live on subdomains, such as `basebuddy.stack127.com`. Link to them from relevant pages and present them as part of stack127. A product that proves its demand and revenue can move to its own domain later. That's a business decision, not an automatic step.

## Standards

Move fast, but keep these:

- Pages are fast, small, responsive, accessible, and follow the shared design system. Dark mode is the default.
- Important content is server-rendered, so search engines and AI agents can read it.
- Tools have clear labels, useful results, and a way to recover from errors.
- Directory and reference facts come from verified sources. Unknown beats fake precision.
- Test calculations and behavior, look at the real page, and pass the quality checks before publishing.
- All writing follows [writing-style.md](writing-style.md).
- Keep old resources accurate as the site grows. Free and paid work meet the same bar.

AI helps with research, drafts, code, checks, and upkeep. Its output still needs sources, tests, and review. AI makes the work faster. It doesn't make it correct.

The five offering types are a business view. They don't replace the page families in [page-families.md](page-families.md).

## Later work

| Area | What to plan |
| --- | --- |
| Smart home directories | Decide whether to unpublish them, based on traffic. |
| Navigation | Make resource types and catalogs easy to find. Add topic pages when there's enough material. |
| Ads | Pick a provider and placements, choose which free pages get ads, and check speed and the ad-free paid experience. |
| Analytics | Review page-view reports before adding events. Keep tool inputs and query strings out of analytics. |
| Paid tools and credits | Decide pricing, accounts, payments, access, usage tracking, and failure handling for the first paid tool. |
| Products | Decide how subdomain products appear next to related resources. |
| Growth | Track use, revenue, costs, and freshness per offering. Use that to choose what to improve next. |

## Related docs

- [Page families](page-families.md): page types and shared structure.
- [Design system](design-system.md) and [tool interface](tool-interface.md): look and interaction.
- [Writing style](writing-style.md): writing, visuals, and search wording.
- [SEO](seo.md) and [tool pages](tool-pages.md): publication, metadata, and tool content.
- [Environment inventory](environment-inventory.md): runtime configuration.
- [Repository structure](repo-structure.md) and [stack127 repos](stack127-repos.md): files and repositories.
