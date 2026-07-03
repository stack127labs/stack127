# Version127 Scripts

Scripts are grouped by page or product surface so future directories can grow without mixing workflows.

## Script Groups

| surface | folder | manifest |
| --- | --- | --- |
| Self-host apps | `scripts/self-host-apps` | `scripts/self-host-apps/scripts.json` |
| Sitewide Version127 | `scripts/version127` | n/a |

Each group owns its own README, validation rules, importers, and database helpers.

Temporary scripts belong in the matching `temp/` subfolder and should not be added to `package.json`.
