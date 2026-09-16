# Release workflow speed

## Problem

The 15 September 2026 release for commit `8612dbcd` took 24 minutes and 49
seconds. The Dokploy deployment itself took 29 seconds. Most of the time was in
the quality gate:

- the complete Chromium suite took about 8 minutes and 30 seconds;
- the same 783 browser tests ran again on mobile and took about 7 minutes and
  54 seconds;
- Next.js built once before the quality command, again inside the quality
  command, and a third time in the clean Docker image build;
- the workflow kept stale releases queued when a newer commit reached `main`.

## Change

The production workflow now:

- builds once before its tests, serves that production build to Playwright,
  and does not repeat the build inside the release quality command;
- runs the full Chromium suite and a focused mobile suite that covers the
  shared shell, widths, navigation, site direction, and representative
  directory and reference layouts;
- reads page ownership manifests and leaves browser specs for non-published
  routes to explicit managed-development preview runs;
- keeps the separate Docker build because that is the deployable artifact;
- cancels an older in-progress release when a newer `main` push replaces it.

The full `npm run quality` command remains available for local checks and runs
the complete browser suite in both desktop and mobile projects.

## Expected result

This removes one Next.js build and roughly seven to eight minutes of repeated
mobile browser work from each production release. The next completed release
is the measurement that will confirm the actual duration.
