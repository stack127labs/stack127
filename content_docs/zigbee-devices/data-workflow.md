# Zigbee devices data workflow

## Refresh boundary

The site reads a committed JSON snapshot and repo-owned device images. It does not call Zigbee2MQTT, npm, GitHub, or Blakadder during a page request.

The refresh script accepts two local source directories:

- an installed `zigbee-herdsman-converters` package;
- a checkout of `blakadder/zigbee`.

The operator pins both inputs, runs the refresh, reviews the count and exclusions, runs the page tests, and commits the resulting snapshot only after the diff is understood.

## Safe matching

1. Parse Blakadder front matter without executing repository content.
2. Exclude coordinators.
3. Expand every marketed Zigbee2MQTT definition, including white-label models, and flatten its exposed capability names.
4. Join a Blakadder record to a definition on exact vendor and model, or on exact model when only one record has it. Ambiguous matches are not joined.
5. Add every unjoined Blakadder record as its own device, so the catalog is the union of both sources.
6. Write deterministic records sorted by vendor, model, and slug.
7. Normalize each product image to fit within a 480 by 480 WebP and keep its upstream image URL.

Generic Zigbee identifiers such as `TS0601` do not create a match by themselves. Those identifiers are reused by unrelated devices and need manufacturer fingerprints.

## Review checks

- Device count does not fall unexpectedly.
- Every record has at least one source URL, and the snapshot records pinned source revisions.
- Every record has one local product image and an exact upstream image URL.
- Slugs and marketed models are unique.
- No coordinator appears.
- Capability values contain plain text only.
- The generated file is stable when the same source revisions are used.
