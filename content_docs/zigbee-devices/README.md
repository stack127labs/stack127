# Zigbee devices directory

## Status

Published at `/zigbee-devices`. Publication is controlled by `public.stack127_pages`.

## Product decision

This is not a general list of every product that carries a Zigbee logo. It is a source-backed union of exact device models known to either:

1. Zigbee2MQTT, through a current converter definition; or
2. the Blakadder community compatibility repository, through a device record.

When both sources name the same brand and model, the record carries evidence from both. A device stays listed when only one source knows it.

The directory does not reduce those facts to one universal "compatible" verdict. A device may join a network while exposing only some of its features. Each record keeps the sources separate:

- Zigbee2MQTT support comes only from Zigbee2MQTT.
- ZHA, deCONZ, Tasmota, ioBroker, and other hub reports come only from Blakadder, and only for the hubs that record names. A Blakadder record without a ZHA entry is not shown as ZHA support.
- The capability filter and the "Most features" sort read Zigbee2MQTT fields and Blakadder's reported features, mapped to the same short list of featured capabilities.

## Route and family

- Canonical route: `/zigbee-devices`
- Source family: `app/(site)/(directories)/zigbee-devices/`
- Page words: `content/intro.mdx` and `content/article.mdx` beside the route
- Runtime data: committed repo-owned snapshot under `lib/zigbee-devices/data/`
- Refresh code: `scripts/zigbee-devices/`

## Source contract

- Zigbee2MQTT converter definitions come from the pinned `zigbee-herdsman-converters` npm package, licensed MIT, and the pinned Zigbee2MQTT website commit.
- Community reports come from the Blakadder Zigbee Device Compatibility Repository at a recorded Git commit.
- Records join on an exact vendor and model, or an exact model when only one record has it. Ambiguous matches stay as separate records instead of being guessed.
- Coordinator records are excluded because this directory covers devices attached to a Zigbee network. Coordinators live in `/zigbee-coordinators`.
- Each record keeps its upstream image URL. Images are stored as normalized WebP copies.
- Missing evidence stays unknown. A device with no ZHA report has not failed with ZHA; nobody has reported it yet.

## Page rules

Coverage is not described as exhaustive. The page header shows when the page was last updated. The line above the cards shows when the sources were last read, labelled "Sources read". Device details link to each source: "Zigbee2MQTT support" and "Blakadder community report".

Amazon product links appear only where a reviewed match exists, with the affiliate disclosure. Regional availability, range, battery-life claims, and rankings are out of scope.
