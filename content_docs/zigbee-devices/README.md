# Zigbee devices directory

## Status

Implementation approved on 2026-08-29. Keep `/zigbee-devices` unpublished until a separate publication review.

## Product decision

This is not a general list of every product that carries a Zigbee logo. It is a source-backed intersection of exact device models that have:

1. a current Zigbee2MQTT converter definition; and
2. a community compatibility record that names both ZHA and Zigbee2MQTT.

The directory does not reduce those facts to one universal "compatible" verdict. A device may join a network while exposing only some of its features. Each record keeps the two sources separate.

## Route and family

- Canonical route: `/zigbee-devices`
- Source family: `app/(site)/(directories)/zigbee-devices/`
- Publication state: unpublished
- Runtime data: committed repo-owned snapshot under `lib/zigbee-devices/data/`
- Refresh code: `scripts/zigbee-devices/`

## Initial source contract

- Zigbee2MQTT converter definitions come from the pinned `zigbee-herdsman-converters` npm package, licensed MIT.
- Cross-gateway confirmation comes from the Blakadder Zigbee Device Compatibility Repository at a recorded Git commit.
- Device images come from that same pinned Blakadder revision. The refresh stores normalized WebP copies locally and keeps the upstream image URL and repository licenses with the generated assets.
- Records join only on an exact marketed model identifier after case normalization.
- Ambiguous duplicate models are excluded instead of guessed.
- Coordinator records are excluded because this directory covers devices attached to a Zigbee network. Coordinators remain a separate planned catalog.
- Missing evidence stays unknown. Absence from the ZHA quirks repository does not mean a standards-compliant device is unsupported.

## Launch boundary

The first complete snapshot may contain every safe exact-model intersection. Coverage is not described as exhaustive, and the page must show the snapshot date and source revisions. Price, regional availability, range, battery-life claims, rankings, and affiliate links are out of scope.
