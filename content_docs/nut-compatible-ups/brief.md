# Brief: NUT-compatible UPS models

## Who is here

Someone is choosing a UPS for a Linux server, NAS, hypervisor, or Home Assistant host. They want to know whether an exact model has a Network UPS Tools driver and how strong that support record is.

## The job

Find the model, identify its NUT driver, connection type, and support level, then open the upstream compatibility record and manufacturer specification before buying.

## Search intent

The primary query is `NUT compatible UPS`. Supporting queries are `Network UPS Tools compatibility list`, `Linux UPS compatibility`, `UPS NUT driver`, and manufacturer or exact-model searches. The page should make the upstream support level and connection visible before electrical buying details.

## Coverage contract

The catalog universe is every UPS row in the pinned NUT hardware compatibility list. PDU, ATS, and solar-controller rows are counted as explicit exclusions because this route promises UPS compatibility. Preserve the upstream manufacturer and model wording, driver, connection, support level, and source references. Group rows only when the same manufacturer and model have multiple connection or driver configurations; every source row remains visible in the grouped detail. Manufacturer research adds official product links, electrical facts, form factor, and a product image where an exact model page exists. It must not turn family records into made-up retail SKUs. Use a local device image with provenance when the exact model is published; otherwise show the explicit missing-image state. The snapshot records all upstream rows, UPS rows, grouped cards, excluded device types, exact and family records, image coverage, detail coverage, researched-null outcomes, failures, source revision, and refresh time. Keep the route unpublished until the complete UPS catalog and detail ledger pass a publication review.

## Show vs say

Cards use the shared hardware fact-card variant of the app design: a large contained product image, one vendor/model heading, and icon-led fact rows. Grouped records without a real model use their product name. Keep compatibility and practical facts in the same plain list, with no subtitle, summary paragraph, or separate compatibility box. Mark family-level listings clearly. The detail view keeps driver facts and links to the NUT entry. Missing images use a compact placeholder.

- An exact product image leads the card when one is published; otherwise the card says so plainly.
- Filters expose device type, manufacturer, connection, driver, and support level.
- The card shows exact model wording, driver, connection, and support level.
- The detail view separates NUT evidence, manufacturer specifications, exact-model cautions, and provenance.
- Internal import totals and source revisions stay off the public page.
- A five-row table explains the NUT support-level scale.
- Sentences warn that a family-level record does not prove every regional suffix.
- No chart or marker drawing is needed.

## Search words

Checked 2026-10-19. See "Find the words first" in `stack127_docs/writing-style.md`.

- Main phrase: NUT compatible UPS list, Network UPS Tools hardware.
- Words top titles add: compatibility list, driver, a model count.
- SEO title: NUT compatible UPS list: 1,100+ models and their drivers. The count is rounded down; update it when the records pass the next round number.
- Count named models only. On 2026-10-19 there were 1,138 of 1,218 records; the rest are product-family rows.
- Questions people ask and gaps in top results: not assessed in this title pass. Check them before the next content rewrite.
