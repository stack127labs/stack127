# Competitive re-review: SnapRAID and mergerfs Config Planner

Status: complete
Route: `/snapraid-mergerfs-planner`
Checked: 2026-08-23

## Backend and scope

The direct competitor and adjacent storage tools were re-checked against the locked product contract using standalone Playwright CLI Chromium 1.60.0. The in-app Browser runtime has no available browser instance in this session. The route itself could not be exercised through the guarded local preview because this isolated worktree has no `.env.local` or `.env.database`; no parent database credentials were used.

## Findings after implementation

| Risk or opportunity | Direct or adjacent evidence | Route response | Decision |
| --- | --- | --- | --- |
| Malformed capacity can look like a smaller valid array. | The direct DiyMediaServer calculator accepted a malformed mixed-size entry and rendered a reduced inventory. | Strict decimal parsing returns every field issue and no config or fstab text. | P0 closed. |
| Parity and pool branches can be confused. | The direct calculator emits useful config and fstab text but does not make the data-only branch invariant the central audit. | Branches are generated only from data rows; parity and content never enter fstab. | P0 closed. |
| Multiple parity levels and content minimums are easy to miss. | Adjacent storage calculators mostly solve capacity or geometry rather than this two-file relationship. | The planner supports one to three ordered parity mounts and checks content count against parity count. | P1 closed. |
| Long exact output needs containment at narrow widths. | One adjacent capacity tool showed document overflow at 390px; the direct competitor stayed contained. | Code blocks and audit/table regions are route-contained, with responsive inventory rows and focused Playwright measurements planned. | P1 addressed; visual run awaits local preview database. |
| Policy syntax needs a bounded choice. | The mergerfs QuickStart documents option syntax, while broad arbitrary option input would create an unsafe review surface. | Only balanced and most-free presets render exact option lists. | P1 closed. |

## Re-review conclusion

No contract change is required. The differentiator remains the explicit relationship between one inventory, a data-only mergerfs branch list, parity sizing, and blocking path checks. The remaining verification is environmental: run the route-owned Playwright suite through a guarded `.env.local` preview, inspect the generated result at 320, 375, 760, and 1280 CSS pixels in both themes, then remove the local preview row.

## Sources

- [DiyMediaServer SnapRAID Parity & MergerFS Pool Calculator](https://diymediaserver.com/page/tools/snapraid-calculator/), inspected 2026-08-23.
- [SnapRAID manual](https://www.snapraid.it/manual), checked 2026-08-23.
- [Debian `snapraid(1)` manpage](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html), checked 2026-08-23.
- [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/), checked 2026-08-23.
