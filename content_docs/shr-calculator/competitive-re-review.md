# Post-build competitive re-review: Synology SHR Capacity Calculator

Status: ready
Tool: Synology SHR Capacity Calculator
Route: `/shr-calculator`
Reviewed: 2026-08-23
Visual backend: standalone Playwright CLI with Chromium

## Review scope

The finished route was operated after implementation with mixed 4 TB, 4 TB, 8 TB, and 8 TB drives in both SHR-1 and SHR-2. The same flows covered the empty state, invalid minimums, stale-result clearing, explicit share and restore, malformed state recovery, clipboard actions, light mode, and 320, 375, and 760 pixel widths. The eight operated competitor records in `competitive-report.md` were used as the comparison baseline, with Synology's official calculator and the tier-based tools weighted highest for the technical review.

## Competitive comparison

| Review question | Finished route | Strongest observed competitor pattern | Decision |
| --- | --- | --- | --- |
| How quickly can a user reach a mixed-drive answer? | Add individual drives, enter exact units, and press one explicit calculate action | Synology, StashRaid, and SHRCalculator.com update live from presets | Keep the explicit action because it makes the calculation boundary and stale-result behavior testable. The first result remains one short interaction away. |
| Can the user see why mixed sizes change capacity? | Exact capacity-band table plus allocation bar | StashRaid explains slicing, while the official calculator shows categories without a visible tier equation | Keep the exact table as the primary differentiator. It carries numbers without making the explanatory page text-heavy. |
| Are protection, unused space, and system reserve distinct? | Three result metrics, allocation legend, and tier columns keep them separate | Synology exposes all three categories; several broad calculators merge or rename them | Keep separate categories and the fresh-pool note beside the result. |
| Does SHR-2 expose the surprising high tier? | 4, 4, 8, 8 in SHR-2 shows 8 TB unused in the high tier | The official calculator exposes unused space; broad RAID tools often fold it into overhead | Keep an explicit `Unused` column and result metric. |
| Is the page focused? | Only the SHR tool, without NAS model shopping, cost, rebuild risk, or generic RAID comparison | Dalil Tech, Need to Know IT, TerabyteWise, and PCCaseLab broaden the page into a storage dashboard | Keep scope narrow. Link to neighboring tools later only where a real boundary is useful. |
| Does the user understand state and privacy? | Clean URL until Share, versioned input-only state after explicit Share, no fetch or storage in the route | Some competitors offer Save or Share without a visible state contract | Keep the share action explicit and disclose that the encoded URL contains configuration, not a secret. |
| Does mobile remain usable? | Drive rows reflow, tables stay inside a scroll container, and measured document overflow stayed at zero at 320, 375, and 760 px | Competitor mobile behavior was less explicit or not fully observable in the research pass | Keep the compact rows and verify the final prose does not widen the tool. |

## Findings and disposition

### P0 and P1 findings

None. No calculation mismatch, stale-result leak, state-restore failure, privacy violation, keyboard recovery failure, console error, or viewport overflow was found in the independent pass.

### Repairs completed during build review

- Rejected non-canonical signed or prefixed byte strings in shared state before `BigInt` conversion.
- Kept protection and unused tiers as separate exact values instead of a single overhead category.
- Added a route-local visual allocation bar and the exact capacity-band table.
- Kept the route unpublished and avoided adding it to the storage sidebar, count, or publication registry.

### Safe P2 follow-ups

- A future expansion planner can model an existing SHR pool, drive swaps, and expansion history. This route intentionally models a fresh pool only.
- A future filesystem or volume calculator can add Btrfs and ext4 metadata, snapshots, quotas, and application-visible free space. Those are not part of the pool allocation engine.
- A future route-family pass can add the calculator to shared discovery surfaces after the parent task explicitly approves publication and collection integration.

## Review conclusion

The route now competes on the specific gap identified in research: a focused, mixed-drive SHR calculator that makes the tier math and unused high space inspectable. It avoids the vendor prompt, generic RAID dashboard, product recommendations, and uncited rebuild or filesystem precision that made the broad competitors less direct for this job.
