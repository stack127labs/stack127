# Platform fees directory

## Purpose

Help makers compare what platforms charge for selling apps, software, digital products, services, and creator work. Show the fee, its conditions, and an official source. A headline percentage must not look like the total cost when other charges apply.

## Current scope

The draft has 542 listings in 49 sections, grouped into 8 category pages.

`/platform-fees` is the category index. Each category has its own page under `/platform-fees/<category>`. A section is a heading on its category page, with its own anchor. These pages list platforms. They are not one page per platform.

| Category | Path | Sections | Listings |
| --- | --- | --- | --- |
| Apps and software | `/platform-fees/apps-and-software` | 11 | 74 |
| Digital products and stores | `/platform-fees/digital-products-and-stores` | 5 | 72 |
| Creative assets | `/platform-fees/creative-assets` | 10 | 88 |
| Music and audio | `/platform-fees/music-and-audio` | 4 | 49 |
| Writing and books | `/platform-fees/writing-and-books` | 4 | 47 |
| Teaching and courses | `/platform-fees/teaching-and-courses` | 6 | 77 |
| Creators and communities | `/platform-fees/creators-and-communities` | 7 | 109 |
| Payments | `/platform-fees/payments` | 2 | 27 |

The old section URLs, such as `/platform-fees/communities`, are removed. There are no redirects from those URLs.

The current draft includes payment processors and checkout services. The old 15-platform reference described in [research.md](research.md) is historical research, not the current directory design.

## Page behavior

- The index shows eight category cards. A card shows its section count and listing count. It does not merge fees from different sections into one range.
- Search on the index covers all 542 listings. A result opens that listing on its category page: `/platform-fees/<category>#<listing-id>`.
- A category page server-renders every section in that category, in the directory order. Each section has an h2, its introduction, its fee cards, and its own source list. The source list uses that section's field labels.
- Search on a category page hides cards that do not match. A section with no matching cards is hidden too. Clear the search to show the whole category again.
- Section links use the stable section anchor, such as `/platform-fees/apps-and-software#app-marketplaces`. The anchor comes from `sectionSlug`.
- The sidebar lists the eight categories. On a category page it also lists that page's section anchors. The same section links appear above the sections, including on a small screen.
- Each card links to the official website. It shows the main charge, a second rate when useful, three short facts, and a control to read additional rates.
- A percentage bar appears only for a verified platform fee. Fixed amounts, revenue pools, base costs, and unknown fees keep their written units.
- Rates use the stated region and currency. The default basis is US / USD unless the card says otherwise.

## Data contract

`public.platform_fee_sections` owns section labels, grouping, fields, and related sections. `public.platform_fee_entries` owns each platform's facts, sources, conditions, dates, and fee-card data.

The editable draft is [directory.json](../../scripts/platform-fees/data/directory.json). Validation lives in [model.ts](../../lib/platform-fees/model.ts). Category paths live in [groups.ts](../../lib/platform-fees/groups.ts). Section anchors live in [section-routes.ts](../../lib/platform-fees/section-routes.ts).

The visible category title and introduction come from the directory page row. A group's `title` in `groups.ts` sets its h1; a group without one uses its name. The group's short introduction goes under it. Keep the search title and description on the registry row. Longer content for a page lives in `scripts/platform-fees/copy/<slug>.md`; a page without a file has no content.

Keep each fact's state accurate: verified, unverified, not public, variable, or not applicable. Record a source URL and checked date when a specific fact has been checked. Do not turn a missing fee into zero or infer a complete seller payout from a headline rate.

## Publication

Development keeps the index and 8 category pages available for review. Old section URLs stay unpublished, with no redirect to the new pages. Shipping code, data, and docs does not launch the directory.

Before publication, review the current sources, conditions, fact gaps, fee cards, filters, and mobile layout. Publish the index and the eight category routes through `public.stack127_pages`. See [plan.md](plan.md) and [maintenance.md](maintenance.md).

## Copy plan

Planned with the directory writing skill for `/platform-fees` and `/platform-fees/digital-products-and-stores`. The other seven categories keep their current copy.

### What a visitor runs into

- The hub h1 is a count ("542 listings across 8 categories"). It says nothing about what the page answers.
- The hub tiles show only a category name and counts. Someone selling Notion templates or a podcast can't tell which category to open.
- The category h1 is the bare category name, and its intro repeats the section names.
- Cards say "You keep 90% before other fees" for Gumroad, whose fee is 10% + 50¢. A visitor can read that as their payout.
- Merch cards lead with "Base cost", which is unclear without context.
- Search runs when you press Enter, not as you type.

### Searches and questions

Top results for "where to sell digital products", "Gumroad vs Payhip fees", and "platform fees for creators" are vendor blogs ranking their own product, with conflicting and stale numbers and few sources or dates. Common questions, and where each is answered:

| Question | Answered in |
| --- | --- |
| What does Gumroad, Etsy, Payhip, or Shopify charge? | Cards; search on both pages |
| Which category covers what I sell? | Hub content table, tiles |
| What will I really keep from a sale? | Category content: worked $20 example |
| Marketplace or my own store? | Category content |
| Is a monthly plan cheaper than a cut? | Category content: formula and Payhip example |
| Who handles sales tax and VAT? | Category content table; full rule in each card's sources |
| What do commission, card fees, merchant of record, base cost mean? | Hub content table |
| What does "Base cost" mean on merch cards? | Category content |
| How current and trustworthy are the fees? | Hub content; "Last checked" and "Sources and dates" on each section |

### Outline

Hub: h1 and intro say what the page answers and how to start. Content: "Which category fits what I sell?" (table with links), "What do the terms on a card mean?" (table plus one line on the bar), "How are the fees checked?" (short paragraphs).

Category: h1 names the task and well-known platforms. Intro says what is compared and how to start. Content: "What will I actually pay on a sale?" (example box), "Should I sell on a marketplace or from my own page?" (bullets), "Is a monthly plan cheaper than a cut of each sale?" (formula and example), "Who handles sales tax and VAT?" (table, link to Payments), "What does Base cost mean on merch cards?" (paragraph).

### Left out on purpose

- Per-platform fee lists and ranges: the cards and the rates panel show them.
- "Best platform" picks: the records don't support a ranking.
- Payout fees, regional rates, Offsite Ads details, and plan caps beyond the examples: on each card and in Sources and dates.
- Video sales and AI creations: their section intros cover them; there is no common confusion to fix.
- Exact counts in titles and descriptions: the hub listing line computes them.
- Payhip in the tax table: its record lists only Canadian tax collection, and other sites say it handles EU and UK VAT. Recheck the record first.

### Facts stated and their sources

All from `scripts/platform-fees/data/directory.json`, checked 2026-09-30, with sources on each card.

- Gumroad: direct sales 10% + $0.50; card processing 2.9% + $0.30; Discover 30%; merchant of record; sales tax on fees may apply.
- Lemon Squeezy: 5% + $0.50 including card processing and tax; +1.5% for international or PayPal; marketplace 30%; US bank payout $0.
- Payhip: plans $0, $29, $99 a month with fees of 5%, 2%, 0%; processor fees on every plan; no extra marketplace fee.
- Etsy: 6.5% transaction fee; Offsite Ads 15% under $10k yearly sales, 12% above, max $100 per order; collects VAT and US sales tax where required.
- itch.io: seller-set share 0 to 100%, same on marketplace sales; handles VAT in Payouts mode.
- Fourthwall: merchant of record. Sellfy, Ko-fi Shop, DPD: seller files and pays tax. Stan Store and Big Cartel: plan, no cut.
- Redbubble: 50%, 20%, 0% of earnings by account. TeePublic and Displate: fixed pay per item. Spring, Printful: retail minus base cost.

Links: each category page from the hub table, and `/platform-fees/payments` from the category tax section.
