# Zigbee coordinators data workflow

The page reads a committed JSON snapshot and local WebP images. It makes no upstream request while rendering.

Refresh from a pinned `blakadder/zigbee` checkout:

```bash
node scripts/zigbee-coordinators/refresh-zigbee-coordinators.mjs <checkout> <40-character-commit>
```

The script keeps coordinator records with a source image, records each listed integration without turning it into a guarantee, infers the connection and radio family from the source record, and normalizes every image to fit within 480 by 480 pixels. Review unknown chipsets and duplicate retail models before accepting a refresh.
