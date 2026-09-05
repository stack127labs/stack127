# Zigbee devices schema

## Snapshot metadata

| Field | Meaning |
| --- | --- |
| `generated_at` | UTC time when the committed snapshot was built |
| `zigbee2mqtt.package` | npm package name |
| `zigbee2mqtt.version` | exact converter package version |
| `zigbee2mqtt.source_url` | upstream source repository |
| `blakadder.commit` | exact Git commit used for compatibility records |
| `blakadder.source_url` | upstream source repository |
| `matching_rule` | human-readable join boundary |
| `excluded` | counts for ambiguous, unmatched, and out-of-scope records |

## Device record

| Field | Meaning |
| --- | --- |
| `slug` | stable repo-owned device key built from vendor and model |
| `vendor` | vendor from the Zigbee2MQTT converter definition |
| `name` | device description from the Zigbee2MQTT converter definition |
| `model` | exact marketed model used by both sources |
| `image_path` | repo-owned normalized WebP used by cards and device details |
| `image_source_url` | exact upstream image at the pinned Blakadder commit |
| `category` | normalized catalog category from the compatibility record |
| `zigbee_models` | Zigbee model identifiers from the converter definition |
| `fingerprints` | manufacturer and model fingerprints when the converter provides them |
| `zigbee2mqtt_capabilities` | flattened names from the prepared converter exposes contract |
| `zha_reported_capabilities` | community-reported capability terms from the compatibility record |
| `ota` | whether the converter definition includes OTA support |
| `battery_reporting` | whether the converter exposes a battery value |
| `date_added` | compatibility record date when provided |
| `zigbee2mqtt_url` | exact Zigbee2MQTT device page |
| `blakadder_url` | exact compatibility record page |

The snapshot never converts missing fields into a positive claim. `zha_reported_capabilities` can be empty even when the compatibility record confirms ZHA.
