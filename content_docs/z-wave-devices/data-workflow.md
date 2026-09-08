# Z-Wave devices data workflow

The page reads a committed reviewed subset of Z-Wave JS configuration files. Product photographs come from the matching Z-Wave Alliance product pages and are stored locally.

```bash
node scripts/z-wave-devices/refresh-z-wave-devices.mjs <zwave-js-checkout> <40-character-commit>
```

Each selected record must match the exact retail label, manufacturer ID, product type, product ID, firmware range, region, and Alliance page. Adding a model requires an explicit source mapping and a usable official photograph. The page does not infer region from the product name.
