# Brief: Local security cameras

## Who is here

Someone is choosing an IP camera for Frigate, Home Assistant, or a local NVR. They care about the exact model, local video protocols, substreams, power, and whether a usable configuration has been recorded.

## The job

Find an exact camera, confirm RTSP or ONVIF evidence, compare the stream and power facts that affect a local installation, and copy the source-backed connection details needed for further setup.

## Search intent

The primary query is `RTSP cameras`. Supporting queries are `ONVIF camera list`, `Frigate compatible cameras`, `local security cameras`, `PoE cameras for Frigate`, and exact-model searches. The page must distinguish a recorded RTSP path, an ONVIF claim, and a verified Frigate configuration.

## Coverage contract

The catalog universe is every current camera record in the declared CC0 source that publishes RTSP or ONVIF support. Include the record even when it lacks a verified Frigate configuration. Preserve hardware revision and firmware notes when the source provides them. Manufacturer and ONVIF sources add exact product identity and official images. Every card needs an exact model, local protocol result, resolution, and power or connection. Use a local product image with provenance when an exact image can be verified; otherwise show the explicit missing-image state. The detail view should expose main and substream paths safely without placing credentials in examples. The snapshot records eligible source rows, imported rows, verified configurations, image coverage, detail coverage, exclusions, failures, source revision, and refresh time. Keep the route unpublished until the complete eligible universe and detail ledger pass a publication review.

## Show vs say

Cards use the shared hardware fact-card variant of the app design: a large contained product image, one vendor/model heading, and icon-led fact rows. Grouped records without a real model use their product name. Keep compatibility and practical facts in the same plain list, with no subtitle, summary paragraph, or separate compatibility box. The detail view keeps useful setup facts, stream options, and links to the original sources. Missing images use a compact placeholder.

- An exact product image leads the card when one is published; otherwise the card says so plainly.
- Filters expose brand, body type, connection, protocol, PoE, and verified Frigate configuration.
- The card shows exact model, RTSP or ONVIF status, resolution, and power or connection.
- The detail view separates local streams, video and audio, physical installation, Frigate evidence, caveats, and provenance.
- Internal import totals and source revisions stay off the public page.
- Sentences explain that firmware can change local protocol behavior.
- No chart or marker drawing is needed.

## Search words

Checked 2026-10-19. See "Find the words first" in `stack127_docs/writing-style.md`.

- Main phrase: Frigate compatible cameras, best cameras for Frigate.
- Words top titles add: RTSP, ONVIF, PoE, list.
- SEO title: 3,100+ RTSP and ONVIF cameras for Frigate and Home Assistant. The count is rounded down; update it when the records pass the next round number.
- Questions people ask and gaps in top results: not assessed in this title pass. Check them before the next content rewrite.
