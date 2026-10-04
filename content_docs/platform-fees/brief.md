# Platform fees directory

## Purpose

Help makers compare what platforms charge for selling apps, software, digital products, services, and creator work. Show the fee, its conditions, and an official source. A headline percentage must not look like the total cost when other charges apply.

## Current scope

The draft has 543 listings in 49 sections, grouped into 8 category pages.

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
- Search on the index covers all 543 listings. A result opens that listing on its category page: `/platform-fees/<category>#<listing-id>`.
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

The visible category title and introduction come from the directory page row. Use the category name as the title and the group's short introduction under it. Keep the search title and description on the registry row.

Keep each fact's state accurate: verified, unverified, not public, variable, or not applicable. Record a source URL and checked date when a specific fact has been checked. Do not turn a missing fee into zero or infer a complete seller payout from a headline rate.

## Publication

Development keeps the index and 8 category pages available for review. Old section URLs stay unpublished, with no redirect to the new pages. Shipping code, data, and docs does not launch the directory.

Before publication, review the current sources, conditions, fact gaps, fee cards, filters, and mobile layout. Publish the index and the eight category routes through `public.stack127_pages`. See [plan.md](plan.md) and [maintenance.md](maintenance.md).
