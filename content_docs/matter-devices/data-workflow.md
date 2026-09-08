# Matter devices data workflow

The page reads every visible certification record from a pinned Matter Database checkout. Each record must include a CSA certification link and certificate ID. A verified product image is attached when the source publishes one; a missing manufacturer image never hides an otherwise complete certification record.

```bash
node scripts/matter-devices/refresh-matter-devices.mjs <matter-database-checkout> <40-character-commit>
```

The script copies and normalizes the source images, records Thread, Wi-Fi, and Bluetooth commissioning fields, and keeps unknown EAN values unknown. Certification is not rewritten as a Home Assistant feature claim.
