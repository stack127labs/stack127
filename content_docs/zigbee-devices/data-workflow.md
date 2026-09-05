# Zigbee devices data workflow

## Refresh boundary

The site reads a committed JSON snapshot and repo-owned device images. It does not call Zigbee2MQTT, npm, GitHub, or Blakadder during a page request.

The refresh script accepts two local source directories:

- an installed `zigbee-herdsman-converters` package;
- a checkout of `blakadder/zigbee`.

The operator pins both inputs, runs the refresh, reviews the count and exclusions, runs the page tests, and commits the resulting snapshot only after the diff is understood.

## Safe matching

1. Parse Blakadder front matter without executing repository content.
2. Keep records whose compatibility list includes both `zha` and `z2m`.
3. Exclude coordinators.
4. Group records by case-normalized marketed model.
5. Exclude model groups with conflicting identity fields.
6. Match the remaining model exactly to one Zigbee2MQTT definition.
7. Prepare the converter definition and flatten exposed capability names.
8. Write deterministic records sorted by vendor, model, and slug.
9. Normalize each matching Blakadder image to fit within a 480 by 480 WebP and store it under `public/zigbee-device-images/`.

Generic Zigbee identifiers such as `TS0601` do not create a match by themselves. Those identifiers are reused by unrelated devices and need manufacturer fingerprints.

## Review checks

- Device count does not fall unexpectedly.
- Every record has both source URLs and pinned source revisions.
- Every record has one local product image and an exact upstream image URL.
- Slugs and marketed models are unique.
- No coordinator appears.
- Capability values contain plain text only.
- The generated file is stable when the same source revisions are used.
