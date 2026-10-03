# Codex work priorities and self-host backlog

Saved October 3, 2026. Status is planned. This note preserves the October 2 review; local self-host tracker counts were rechecked October 3. It adds no new research. Use only Codex agents for follow-up work. This request authorizes saving the note, with no implementation or production writes approved. Publication needs separate authorization after final review.

## Suggested work order

Spend roughly 50% of future Codex effort on existing data, 30% on verification and finishing drafts, and 20% on payments resources. These are suggested allocations, not measured requirements.

| Priority | Planned work | Reason |
| --- | --- | --- |
| 1 | Verify self-host records and reconcile CLI coverage | Improve existing directories before collecting more. |
| 2 | Audit search discoverability | Identify exposure and access problems without promising rankings. |
| 3 | Finish Launch Directories | Review the publishable records and reader flow. |
| 4 | Validate the Ad Networks evidence pilot | Establish usable evidence before expanding. |
| 5 | Refresh TLD data and targeted platform fees | Resolve dated source differences and regional changes. |
| 6 | Improve KDP, SaaS, DNS, and developer workflows | Help readers finish tasks and check answers. |

Keep work within [product direction](../stack127_docs/product-direction.md) and the [September topic backlog](2026-09-25-site-direction-and-topic-gaps.md).

## October 2 observed live state

The live sitemap contained 375 URLs. Umami's trailing 28 days showed 835 pageviews, 174 visitors, and 247 visits.

| Page | Views |
| --- | ---: |
| Home | 103 |
| domain-age | 27 |
| dns-lookup | 24 |
| self-host-apps | 19 |
| domain-tools | 19 |
| dns-tools | 11 |
| storage-tools | 10 |
| keyboard-shortcuts | 9 |
| cli-apps | 8 |

Search Console for the main domain, September 1 through September 29, reported 993 page impressions, one click, and 31 page rows.

| Page | Impressions | Clicks | Average position |
| --- | ---: | ---: | ---: |
| Dockerignore Tester | 211 | 1 | 7.28 |
| Cursor shortcuts | 187 | Not recorded here | 5.49 |
| self-host-apps | 172 | Not recorded here | 55.47 |

These are small samples and may include internal use. Search rows measure exposure, not index coverage. They support no traffic or ranking promise.

Public curl checks on October 2 returned HTTP 200 for platform-fees and HTTP 404 for launch-directories and ad-networks. Platform fees was live, despite some docs and worker reports calling it unpublished. These observations do not establish today's publication state.

- [ ] Audit discoverability using current publication, sitemap, canonical, internal-link, and Search Console evidence. Keep exposure separate from indexing.

## October 2 development database snapshot

SELECT-only checks in managed development returned these counts. They are development counts, not today's live totals.

| Dataset | Recorded count |
| --- | --- |
| Published self-host apps | 4,931 |
| CLI apps | 309 |
| Platform-fee entries | 543 across 49 sections |
| Launch-directory records | 171, with 165 marked publishable |
| Ad-network identities | 45, with zero publishers |
| Self-host candidates | 285 queued and 635 needs_review |
| CLI candidate table | One row |

The six unmarked launch records are excluded community-post destinations, not unfinished research. Self-host candidate states are separate from the published-app review tracker. Current counts in the separate homelab SQLite ad queue were not inspected.

The saved August 29 CLI report recorded 84,734 candidate rows and 308 published apps. Establish environment and history before recollecting; this difference does not prove lost rows.

- [ ] Reconcile CLI history with [coverage](../scripts/cli-apps/batches/coverage.md) and the [data workflow](../content_docs/cli-apps/data-workflow.md).
- [ ] Finish Launch Directories against its [plan](../content_docs/launch-directories/plan.md), then request publication authorization.
- [ ] Validate a bounded Ad Networks evidence pilot using its [plan](../content_docs/ad-networks/plan.md) and [maintenance notes](../content_docs/ad-networks/maintenance.md). Identify the queue environment first.

## October 3 local self-host tracker

The local [review tracker](../content_docs/self-host-apps/review-progress.csv) contains 5,257 rows. Its production-visible subset is a tracker designation, not a fresh production query.

| Tracker measure | All rows | Production-visible subset |
| --- | ---: | ---: |
| Total | 5,257 | 4,931 |
| Not reviewed | 2,652 | 2,359 |
| Partial | 2,605 | 2,572 |
| App-specific estimates | 2,102 | 2,090 |
| Generic estimates | 2,893 | 2,841 |
| Estimates marked missing | 262 | 0 |

Another 326 tracked rows are not production-visible. Among production-visible records, 287 have recorded held fields and 2,262 have recorded production changes. These groups overlap; do not add them.

Tracker statuses do not prove all data is wrong, absent, or never reviewed previously. Partial means some fields were checked. A summary or estimate correction does not establish full-record verification. Held fields indicate unresolved or deferred evidence, not ready-to-apply updates.

At 40 apps per batch, 2,359 unreviewed published apps require 59 rounded-up batches. The 2,841 generic estimates require 72 rounded-up batches, correcting the earlier rough figure of 71. These batches overlap. Do not add them or predict hours or tokens.

The [August 30 QA report](../content_docs/self-host-apps/full-qa-report.json) covers only 2,076 published records and is stale. Use the [self-host workflow](../content_docs/self-host-apps/data-workflow.md) and [directory-quality guidance](../scripts/stack127/directory-quality/README.md) for later authorized work.

- [ ] Refresh a scoped current baseline and prioritize useful developer apps.
- [ ] Rank held fields by actual user risk.
- [ ] Review licensing, source models, and app versus component identity.
- [ ] Validate categories and summaries against primary sources.
- [ ] Check official Docker, Compose, and install URLs.
- [ ] Replace generic RAM and storage estimates with app-specific, sourced estimates. Preserve unknowns.
- [ ] Record reviewed fields and unresolved fields without advancing whole-record verification. Keep checked-but-not-published work distinct.
- [ ] Review a bounded development apply under a later authorized task. Production changes require separate authorization.

Each completed batch should record primary-source links and dates, accurate identities, reviewed fields, and unresolved fields. Separate publisher requirements from estimates. Use dedupe and field-review guards, development checks, and final review when the later task authorizes changes. Add no extra process machinery.

## Targeted data refreshes

- [ ] Reconcile the [TLD JSON](../lib/domain/data/tld-directory.json), fetched July 28 with 1,438 endings, against the October 2 IANA list of 1,437 ending names plus its header. Identify the actual difference and source version before using the [refresh script](../scripts/domain-tools/refresh-tld-directory.mjs). Source: [IANA list](https://data.iana.org/TLD/tlds-alpha-by-domain.txt).
- [ ] Review Apple EU changes effective October 1. Local platform-fee facts were all checked September 30. Preserve regional basis; this does not invalidate the whole dataset. Use [Apple's EU guidance](https://developer.apple.com/support/apps-in-the-eu/), [maintenance notes](../content_docs/platform-fees/maintenance.md), and the [fee data](../scripts/platform-fees/data/directory.json).

## Payments resources already on the backlog

- [ ] Extend platform-fee payment sections with seller-country eligibility where useful. Record supported seller, entity, and bank countries, product restrictions, payout methods and currencies, sources, and dates. Use supported, not supported, or unknown; never imply approval. A separate directory or slug needs justification.
- [ ] Plan a merchant-of-record total-cost calculator using price, order count, international, subscription, and payment mix, plus payout frequency. Use documented tax-inclusive fee bases, keep unknown fees explicit, and reuse owned verified facts.

Starting sources are [Lemon Squeezy countries](https://docs.lemonsqueezy.com/help/getting-started/supported-countries), [Lemon Squeezy fees](https://docs.lemonsqueezy.com/help/getting-started/fees), and [Polar countries](https://polar.sh/docs/merchant-of-record/supported-countries).

## Workflow improvements and deferred work

- [ ] Order the 15 KDP tools around page estimation, final setup, PDF checking, pricing, and metadata. Distinguish estimates from final measurements; promise no acceptance.
- [ ] Review the 10 SaaS tools for normalized monthly recurring revenue versus cash, and correct retention cohorts and time periods.
- [ ] Add symptom-driven DNS/domain next steps after holds, nameserver changes, and DNSSEC failures.
- [ ] Compare supported restic, rsync, Dockerignore, and Compose examples with real commands. Keep limits explicit. Consult the existing [shortcut audit](../content_docs/keyboard-shortcuts/coverage-audit.md) before related work.

Defer bulk SaaS calculators, generic AI cost calculators, broad shortcut expansion, new hardware or home automation work, and tax guidance without qualified review.
