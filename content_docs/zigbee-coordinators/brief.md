# Brief: Zigbee coordinators

## Who is here

Someone is choosing the radio that will create a Zigbee network for Home Assistant or Zigbee2MQTT. They may know a retail model, chipset, or connection type, but they should not have to reconcile several adapter lists.

## The job

Find an exact coordinator model, see which integrations document it, compare its chipset and connection, and open the primary records before buying or changing firmware.

## Search intent

The primary query is `Zigbee coordinator`. Supporting queries are `Zigbee coordinator list`, `best Zigbee coordinator for Home Assistant`, `Zigbee2MQTT adapter`, and chipset or retail-model searches. The page should help users compare adapters, not claim one adapter is best without a tested basis.

## Coverage contract

The catalog universe is every current coordinator record in the declared Blakadder source, enriched from official Zigbee2MQTT and ZHA adapter documentation when an exact model match exists. A missing enrichment match is not an exclusion. Every coordinator needs a local product image, its image source, retail model, connection, chipset or a researched-not-published outcome, integration evidence, and direct sources. The snapshot records the source total, included total, exclusions, image coverage, detail coverage, failures, source revisions, and refresh time. Keep the route unpublished until every source coordinator is represented and the image and detail ledgers pass.

## Show vs say

Cards use the shared hardware fact-card variant of the app design: a large contained product image, one vendor/model heading, and icon-led fact rows. Grouped records without a real model use their product name. Keep compatibility and practical facts in the same plain list, with no subtitle, summary paragraph, or separate compatibility box. The detail view keeps useful adapter facts and links to compatibility reports. Missing images use a compact placeholder.

- A clear product image leads every card.
- Filters expose vendor, connection, radio family, and documented integration support.
- The card shows the exact model, connection, radio family, and documented integration support.
- The detail view separates identity, radio and firmware, integration evidence, and provenance.
- Internal import totals and source revisions stay off the public page.
- Sentences cover the migration and firmware caveats that cannot fit in a field.
- No chart or marker drawing is needed because the page compares exact hardware facts.

## Search words

Checked 2026-10-19. See "Find the words first" in `stack127_docs/writing-style.md`.

- Main phrase: best Zigbee coordinator, Zigbee coordinator comparison.
- Words top titles add: compared, ZHA, Zigbee2MQTT, best.
- SEO title: 75+ Zigbee coordinators compared for ZHA and Zigbee2MQTT. The count is rounded down; update it when the records pass the next round number.
