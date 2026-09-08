# App directory fact-row cards

Applied the approved Fact rows option from `/app-card-lab` to `/self-host-apps` and `/cli-apps`.

Both directories share `app/(site)/(directories)/_components/app-fact-card.tsx` and its CSS Module. Cards keep actual app images, the primary category and additional-category count, full summaries, and labeled facts with icons. Self-host cards retain resource estimates and their labels. CLI cards show all recorded platforms. No database, publication, URL, filtering, or drawer-content changes were made.

Card activation still opens the existing details drawer. Image loading now handles already-loaded self-host images, and the card's fallback initials no longer squeeze the image while it loads.

## Verification

Standalone Playwright was used because no in-app Browser was connected. The seven directory layout, image, and interaction tests passed against the managed development database. Screenshots were inspected for both directories at 1255px and 390px in dark and light themes. Width checks covered 1600, 1255, 1024, 768, 390, and 320px. Card clicks, close buttons, Enter activation, and Escape dismissal worked.

The development self-host dataset has unresearched fields that correctly remain visible as unknowns. This change does not replace those values with the lab's published-data snapshots.

Typecheck and static policy passed. The complete quality gate still encounters the existing CLI local-icon-cache and hardware-directory image/review failures, so the production registry, full SEO suite, and production build have not been certified by this pass.
