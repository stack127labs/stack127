# Brief: Z-Wave devices

## Who is here

Someone has a Z-Wave model or is comparing one for Home Assistant. They need the exact product identifiers and firmware boundary because retail names alone can hide regional or hardware variants.

## The job

Find an exact certified product, inspect its identifier, certification, frequency plans, regions, radio range, and any matching Z-Wave JS configuration, then verify the regional variant before buying or pairing it.

## Search intent

The primary query is `Z-Wave devices`. Supporting queries are `Z-Wave compatible devices`, `Z-Wave product database`, `Z-Wave frequency by country`, `Z-Wave Long Range devices`, and exact certification, product ID, or model searches. Certification and software configuration are different questions and must remain separate in headings and result labels.

## Coverage contract

The catalog universe is every published record in the Z-Wave Alliance Product Catalog API. The Alliance record supplies certified identity, category, region, frequency, range, command-class facts, and an image when published. An exact manufacturer ID, product type, product ID, and firmware match to Z-Wave JS adds software configuration evidence but never decides inclusion. Group repeated certifications under one product while preserving regional and firmware variants in the detail view. Every record needs its catalog detail table and source link. Use an exact local product image with provenance when available; otherwise show the explicit missing-image state. The snapshot records the Alliance total, imported total, detailed total, imaged total, Z-Wave JS match total, failures, revisions, and refresh time. Keep the route unpublished until all Alliance records and details pass a publication review.

## Show vs say

Cards use the shared hardware fact-card variant of the app design: a large contained product image, one vendor/model heading, and icon-led fact rows. Grouped records without a real model use their product name. Keep compatibility and practical facts in the same plain list, with no subtitle, summary paragraph, or separate compatibility box. The detail view keeps useful device facts and links to the original certification or software configuration. Missing images use a compact placeholder.

- An exact product image leads the card when one is published; otherwise the card says so plainly.
- Filters expose brand, category, device type, region, frequency plan, Long Range support, and Z-Wave JS configuration evidence.
- The card shows the product identifier, region or frequency plan, certification status, and software-configuration status.
- The detail view separates certified identity, radio and region, command classes, documents, software configuration, and provenance.
- Internal import totals and source revisions stay off the public page.
- Sentences explain why region, firmware, and product IDs matter.
- No chart or marker drawing is needed.

## Search words

Checked 2026-10-19. See "Find the words first" in `stack127_docs/writing-style.md`.

- Main phrase: Z-Wave devices list, Z-Wave JS supported devices.
- Words top titles add: a count, certified, Home Assistant.
- SEO title: 3,100+ Z-Wave devices for Z-Wave JS and Home Assistant. The count is rounded down; update it when the records pass the next round number.
