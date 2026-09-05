# NUT-compatible UPS data workflow

The page uses exact reviewed entries from `data/driver.list.in` in a pinned Network UPS Tools checkout. The refresh script fetches the matching official manufacturer image and stores it locally.

```bash
node scripts/nut-compatible-ups/refresh-nut-compatible-ups.mjs <nut-checkout> <40-character-commit>
```

Every record keeps the HCL wording, driver, connection, and support level. Capacity, voltage, outlets, and runtime remain manufacturer facts. A family record is not converted into support for an unlisted regional suffix.
