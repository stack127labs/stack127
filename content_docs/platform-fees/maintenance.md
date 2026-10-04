# Maintain the platform fees draft

## Edit the data

Update [directory.json](../../scripts/platform-fees/data/directory.json). Keep section IDs stable, use official HTTPS links, and retain the source and checked date for each verified fact. Keep the fact order aligned with the section's fields.

The card must point back to its facts through `fact_key`. Percentage bars require a verified fact and a matching percentage. The [model validator](../../lib/platform-fees/model.ts) checks these rules before data is synced.

## Review in development

```bash
# Validate the draft without writing.
node scripts/platform-fees/sync-development.mjs

# Replace this directory's development records and keep preview routes available.
node scripts/platform-fees/sync-development.mjs --apply --preview
```

The script targets the managed development project in `.env.local` and rejects the production project. Run the canonical database migration workflow before syncing if the current tables are missing. Do not run retired SQL files by hand.

Review `/platform-fees` and at least one category page, such as `/platform-fees/apps-and-software`. Check search on the index and on the category page, section anchors, the source list for that section's own fields, official links, extra rates, icons, and the small-screen layout. A search with no matches needs a way back to the full category. Old section URLs, such as `/platform-fees/communities`, should 404. Do not add redirects. Production publication remains a separate registry change.

## Icons

Icon source URLs are in [icon-sources.json](../../scripts/platform-fees/data/icon-sources.json). The reusable [cache-icons.mjs](../../scripts/platform-fees/cache-icons.mjs) writes the required assets to `public/platform-fees/icons/`. Keep those assets with the feature and use the letter fallback when no icon is configured.

## Keep sources current

A checked date records a completed review. Advance it only after reading the current source. Keep conditional charges, fixed fees, seller-share rates, and pool-based revenue distinct. Check region, currency, billing period, and enrollment requirements before changing a card.

The older research in [research.md](research.md) is a starting record from the retired reference. Recheck its claims before using them in the current directory. There is no active automated platform-fee source checker in this implementation.
