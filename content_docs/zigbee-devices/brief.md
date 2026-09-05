# Brief: Zigbee devices

## Who is here

Someone is considering a specific Zigbee device, or already owns one, and wants to know whether Home Assistant can use it through ZHA, Zigbee2MQTT, or both. They know a model name or device category, but they should not need to understand converters or quirks before searching.

## The job

Find the exact retail model, confirm the available support evidence for ZHA and Zigbee2MQTT, inspect the capabilities Zigbee2MQTT exposes, and leave with the primary source needed to verify the device before buying or troubleshooting it.

## Search intent

The primary query is `Zigbee compatible devices`. Supporting queries are `Zigbee2MQTT supported devices`, `ZHA compatible devices`, `Home Assistant Zigbee devices`, and exact model searches. The title and h1 should answer the broad compatibility query. Headings, filters, and server-rendered record text should answer the narrower questions naturally. Do not repeat query variants as decorative copy.

## Coverage contract

The catalog universe is the union of current Zigbee2MQTT device definitions and Blakadder compatibility records. A device stays in the catalog when only one source knows it. Exact-model joins add evidence but never decide inclusion. Coordinator records belong in `/zigbee-coordinators` and are excluded here with a counted reason. Every included record needs a local product image, an image source, exact model identity, support status by source, useful capabilities, and a source link. The snapshot records source totals, union size, matched records, one-source records, exclusions, image coverage, failures, revisions, and refresh time. Keep the route unpublished until the union, details, and images are complete.

## Show vs say

- A clear product image leads every card so people can recognize the physical device before reading the model and support facts.
- Filters expose category, vendor, capability, OTA support, and battery reporting without turning the page into a form-heavy tool.
- A larger product image and structured detail view separate identity, compatibility, capabilities, and provenance.
- The card shows the exact model, one compatibility result, and two practical facts. It does not show raw source bookkeeping or unknown values.
- A compact coverage block reports how many source records, details, and images are present in the current snapshot.
- A compact evidence table explains what each support label proves and what it does not prove.
- Sentences explain why an exact model matters, why ZHA has no complete official device list, and why firmware or white-label variants can still behave differently.
- No chart is useful because the page does not compare a measured quantity.
- No marker art is useful because the main problem is exact model evidence, not a vague concept.
