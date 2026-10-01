# Platform fees plan

## Current state

The current draft is a directory of 543 entries in 49 sections. Its code, icons, source data, and docs can ship while its production registry rows remain unpublished. Development keeps the index and current section pages available for review.

The previous 15-platform reference and its six-table model are retired. Its source notes remain in [research.md](research.md). The current contract is in [brief.md](brief.md).

## Keep the foundation consistent

- Use the two current tables, `platform_fee_sections` and `platform_fee_entries`.
- Keep migrations in the canonical repository history. Do not replay the retired development experiments.
- Keep draft tables private to server-side reads. Unpublished registry rows alone do not protect direct database API access.
- Use the development sync script for directory edits. Production changes follow the release workflow.
- Preserve stable section IDs and the public slug mappings.

## Work before launch

1. Review each card's official sources and dates. Keep gaps visible and record conditions beside their rates.
2. Check the receipt headline, second rate, three facts, and additional-rate panel against the saved facts. Confirm no percentage bar presents a fixed charge or an unverified rate.
3. Check sources, icons, search, section links, and related sections at desktop and mobile widths.
4. Run `npm run quality`, the focused platform-fee checks, and the production build when route or runtime work changes.
5. Ask the owner to review the development pages. After approval, publish the exact current index and section registry rows in a separate release.

Keep retired route rows unpublished. Do not add navigation or home-page promotion until publication is approved.

## After launch

Recheck official pricing and terms when a platform announces a change. Update the source data, facts, conditions, and checked dates together. A future source-monitoring schedule needs its own implementation and activation review; the retired reference's checker is not part of this directory.
