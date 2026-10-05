# Platform fees plan

## Current state

The current draft is 542 listings in 49 sections on 8 category pages, plus the index at `/platform-fees`. Its code, icons, source data, and docs can ship while its production registry rows remain unpublished. Development keeps the index and the category pages available for review.

A section is an anchor on its category page. The old public section URLs are removed. Nothing redirects them to the category pages.

The previous 15-platform reference and its six-table model are retired. Its source notes remain in [research.md](research.md). The current contract is in [brief.md](brief.md).

## Keep the foundation consistent

- Use the two current tables, `platform_fee_sections` and `platform_fee_entries`.
- Keep migrations in the canonical repository history. Do not replay the retired development experiments.
- Keep draft tables private to server-side reads. Unpublished registry rows alone do not protect direct database API access.
- Use the development sync script for directory edits. Production changes follow the release workflow.
- Preserve stable section ids and the section anchor slugs.
- Publish category paths from `lib/platform-fees/groups.ts`. Do not publish one registry row per section.

## Work before launch

1. Review each card's official sources and dates. Keep gaps visible and record conditions beside their rates.
2. Check the receipt headline, second rate, three facts, and additional-rate panel against the saved facts. Confirm no percentage bar presents a fixed charge or an unverified rate.
3. Check the index, one category page, section anchors, source lists, search, and the small-screen jump links. A category card shows counts only, never a range mixed from different fee types.
4. Run `npm run quality`, the focused platform-fee checks, and the production build when route or runtime work changes.
5. Publish the index and the eight category rows. Leave the old section URLs unpublished and do not add redirects.

Keep retired route rows unpublished. Do not add navigation or home-page promotion until publication is approved.

## After launch

Recheck official pricing and terms when a platform announces a change. Update the source data, facts, conditions, and checked dates together. A future source-monitoring schedule needs its own implementation and activation review; the retired reference's checker is not part of this directory.
