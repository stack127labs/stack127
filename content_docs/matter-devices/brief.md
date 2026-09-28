# Brief: Matter devices

## Who is here

Someone is checking whether a retail smart-home product is Matter certified and whether it uses Thread or Wi-Fi. They may also need to know whether the product is native Matter hardware or a bridged accessory.

## The job

Find an exact product, inspect its certification ID and transport, and leave with the CSA record needed to verify the claim before buying or commissioning it.

## Search intent

The primary query is `Matter devices list`. Supporting queries are `Matter compatible devices`, `Matter certified products`, `Matter over Thread devices`, `Matter over Wi-Fi devices`, and exact certification or retail-model searches. The page should answer certification and network transport first, then explain ecosystem-specific behavior as a separate concern.

## Coverage contract

The catalog universe is every Matter certification record exposed by the declared CSA source. Community product databases may add retail naming, EAN, transport, buying links, and images, but they never decide whether a certification is included. Group repeated certificates under one product while preserving every regional, firmware, and certificate variant in the detail view. Every record needs a certificate ID, certified name, manufacturer, category or device type, transport when published, and the CSA source. Use a local product image with provenance when an exact image exists; otherwise show the explicit missing-image state. The snapshot records CSA totals, imported totals, enriched totals, image coverage, detail coverage, grouped variants, failures, source revision, and refresh time. Keep the route unpublished until the complete certification universe and detail ledger pass a publication review.

## Show vs say

Cards use the shared hardware fact-card variant of the app design: a large contained product image, one vendor/model heading, and icon-led fact rows. Grouped records without a real model use their product name. Keep compatibility and practical facts in the same plain list, with no subtitle, summary paragraph, or separate compatibility box. The detail view keeps useful product facts and links to the original certification. Missing images use a compact placeholder.

- An exact product image leads the card when one is published; otherwise the card says so plainly.
- Filters expose category, manufacturer, Thread, Wi-Fi, and Bluetooth commissioning support.
- The card shows the exact certified name, certificate ID, device type, and transport.
- The detail view separates certification, identity, transport and commissioning, retail enrichment, and provenance.
- Internal import totals and source revisions stay off the public page.
- Sentences explain that Matter certification does not promise every optional feature or ecosystem behavior.
- No chart or marker drawing is needed.
