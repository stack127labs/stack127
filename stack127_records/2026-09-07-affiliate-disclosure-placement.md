# Affiliate disclosure placement

The About page now includes "How we earn money" at `/about#how-we-earn-money`. It explains affiliate commissions, no extra cost to buyers, and that commissions do not influence rankings or placement. Amazon's required Associate sentence remains verbatim in that section.

A shared server-rendered paragraph appears directly below hardware directory cards and before pagination when the displayed records contain an Amazon link. Empty results and results without Amazon links omit the paragraph. This applies to all six hardware directories through the shared hardware page and the separate Zigbee page. Current confirmed links exist in Zigbee devices, Zigbee coordinators, and local security cameras.

Both hardware drawer implementations identify their Amazon purchase button as a paid link. The below-grid notice is not the only link-level disclosure. The shared footer stays unchanged and contains no Amazon statement.

The sorting functions use names, vendors, models, feature counts, and recorded dates, not affiliate status. Link enrichment maps onto records without changing their order. No product inclusion, sorting, purchase destination, tracking tag, registry publication, or database data changed.

## Verification

- Three focused regression tests passed.
- Five standalone Playwright tests passed. They covered About, all three linked directories, unlinked directories, empty results, the About anchor, paid-link buttons, desktop and mobile widths, and both themes.
- Browser runtime discovery found no connected browser, so the repo's standalone Playwright fallback was used.
- Screenshot capture uses `caret: "initial"` so Playwright does not temporarily edit input styles while the page is hydrating.
- Type checking passed in the quality gate. Static policy passed for 290 routes.
- The full quality gate stopped at 14 existing image/data/review failures, with 850 of 864 unit tests passing. Later combined-gate stages did not run.
- Development preview is served on port 3333. No production deployment was performed.

Current rules are in [Amazon Associates](../stack127_docs/amazon-associates.md) and [Amazon product linking](../stack127_docs/amazon-product-linking.md). This record supersedes the unresolved-placement follow-up in the 6 September homepage navigation record; it is not a legal certification of compliance.

## Later button-label revision

The user subsequently requested removing "Paid link" from purchase buttons. Both drawer implementations now say "Check price on Amazon" again. The About and below-card disclosures remain, as do purchase URLs and sponsored link attributes. The About copy no longer claims each paid link is labeled. Current documentation records the remaining visibility concern for visitors who open a drawer before reading the below-card notice. Focused regression tests now protect the clean button label and retained disclosures.
