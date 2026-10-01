# Platform fees directory

## Purpose

Help makers compare what platforms charge for selling apps, software, digital products, services, and creator work. Show the fee, its conditions, and an official source. A headline percentage must not look like the total cost when other charges apply.

## Current scope

The draft has 543 entries across 49 sections. `/platform-fees` is the searchable section index. `/platform-fees/<section>` shows the platforms in that section. These are section pages, rather than one page for each platform.

The current draft includes payment processors and checkout services. The old 15-platform reference described in [research.md](research.md) is historical research, not the current directory design.

## Page behavior

- The index shows section tiles grouped by the kind of product or work sold. Search finds platforms across sections.
- A section shows compact fee cards and search within that section.
- Each card links to the official website. It shows the main charge, a second rate when useful, three short facts, and a control to read additional rates.
- A percentage bar appears only for a verified platform fee. Fixed amounts, revenue pools, base costs, and unknown fees keep their written units.
- Section source lists show the official pages and checked dates.
- Rates use the stated region and currency. The default basis is US / USD unless the card says otherwise.

## Data contract

`public.platform_fee_sections` owns section labels, routes, grouping, fields, and related sections. `public.platform_fee_entries` owns each platform's facts, sources, conditions, dates, and fee-card data.

The editable draft is [directory.json](../../scripts/platform-fees/data/directory.json). Validation lives in [model.ts](../../lib/platform-fees/model.ts). Stable section IDs map to shorter public URLs in [section-routes.ts](../../lib/platform-fees/section-routes.ts).

Keep each fact's state accurate: verified, unverified, not public, variable, or not applicable. Record a source URL and checked date when a specific fact has been checked. Do not turn a missing fee into zero or infer a complete seller payout from a headline rate.

## Publication

Development keeps the index and 49 current section pages available for review. Production registry rows stay unpublished, including retired section URLs. Shipping code, data, and docs does not launch the directory.

Before publication, review the current sources, conditions, fact gaps, fee cards, filters, and mobile layout. Publish only the exact reviewed routes through `public.stack127_pages`. See [plan.md](plan.md) and [maintenance.md](maintenance.md).
