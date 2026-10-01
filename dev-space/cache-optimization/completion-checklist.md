# Cache optimization completion checklist

Goal: keep pages fast and cached, while edits reach the live site within 2 minutes. Removed and unpublished pages must stop being served.

Keep the [original plan](cache-and-speed-plan.md) as the record of what we started with. This checklist includes our later decision to review after 2 healthy days instead of waiting 7 days. The running code still uses the 7-day rule; it has not been changed yet.

## What is already done

Last verified on 1 October 2026. Production release: `e01659a1`.

- [x] Enable the Supabase worker. Database changes wake it, and a backup check runs every 30 seconds.
- [x] Group repeated import changes, allow one processor at a time, and keep each run within its time limit.
- [x] Retry failed updates after 15 seconds, 1 minute, then every 5 minutes. Recover missed changes every 15 minutes.
- [x] Rebuild and check fresh pages before clearing Cloudflare. Check the public copy before acknowledging an update.
- [x] Preserve newer edits when an older edit finishes processing.
- [x] Refresh affected pages, catalogs, tool sidebars, homepage counts, sitemap, planner, CLI pages, and license counts.
- [x] Cache rendered pages where possible. Keep publication and SEO controlled by the page registry.
- [x] Cache app details, planner entries and lists, license counts, CLI data, and reusable directory data.
- [x] Limit search and filter caches to 500 results per directory. Include filters, search, sort, and page number in cache keys.
- [x] Add and measure the two planner search indexes. Preserve literal searches for `%`, `_`, and backslash, and check two-letter searches.
- [x] Remove the duplicate source-model index.
- [x] Make browsers check for fresh copies. Keep HTML and client navigation caches separate.
- [x] Keep unpublished, missing, private, and error responses out of the public cache.
- [x] Refresh changed icons and images during deployment. Keep versioned bundles immutable.
- [x] Pass quality checks, focused tests, production build, and desktop/mobile page checks.
- [x] Deploy to OVH and match the release commit, main branch, image tag, and live health revision.
- [x] Verify a production edit reached a cached live page in about 25 seconds.
- [x] Verify the maintenance workflow can apply the initial cache policy and refuses the premature longer-cache switch.

Release: [successful deployment](https://github.com/stack127labs/stack127/actions/runs/36768405452). Maintenance: [successful policy check](https://github.com/stack127labs/stack127/actions/runs/36769403651).

## Next review: after 2 healthy days

Observation started on 30 September 2026 at 18:08 UTC, or 11:38 PM IST. The earliest two-day review is 2 October at 11:38 PM IST, if the healthy clock has not restarted. Use the actual database status at review time.

- [ ] Read worker status: enabled, recent successful checks, recent reconciliation, no error, and no updates waiting longer than 2 minutes.
- [ ] Confirm 48 continuous healthy hours. Errors, missed updates, delayed updates, or gaps in checks restart the clock.
- [ ] Review worker failures, queue retries, and any delayed-update alerts across the observation period.
- [ ] Confirm ordinary edits and automatic imports were processed correctly. If no real imports occurred, check a representative import in development.
- [ ] Check that scheduled GitHub processing has stopped after its existing one-day gate. Check the workflow result, not only the source code.
- [ ] Run the final freshness and cache checks below.

Production status command, using the production database environment:

```bash
node --env-file=.env.database scripts/stack127/cache/status.mjs
```

## Final freshness and cache checks

Use development for destructive or forced-failure checks. Any production test must preserve and restore the original content and publication state.

- [ ] Edit page copy or metadata. Confirm the page, navigation, catalogs, and sitemap reflect the change within 2 minutes.
- [ ] Publish, unpublish, delete, and change a slug. Confirm removed URLs return an uncached 404 and leave navigation and sitemap.
- [ ] Change tool content or a catalog card. Confirm affected tool pages and sidebars refresh.
- [ ] Change an app, category, install option, or resource estimate. Confirm details, directory, planner, counts, and license reference refresh.
- [ ] Change GitHub facts and CLI records. Confirm both app and CLI views refresh.
- [ ] Confirm a failed refresh keeps its event and retries. Confirm a newer edit survives an older acknowledgement.
- [ ] Confirm a missed change or deletion is recovered by reconciliation.
- [ ] Check that different filters, sorts, searches, and page numbers return the correct different results.
- [ ] Check repeated public requests become Cloudflare hits. Check eligible origin pages become Next.js hits without rebuilding their page data.
- [ ] Check browser revalidation, client navigation freshness, and separate HTML/navigation responses. Cookies and authorization must bypass public edge caching.
- [ ] Check errors, unpublished pages, health, private endpoints, and live DNS/IP results are not publicly cached.
- [ ] Check robots, sitemap, query-page canonicals, and `noindex, follow` behavior.
- [ ] Check a representative page and tool on desktop and mobile, including valid and invalid input.
- [ ] Confirm one app instance is running. Multiple instances require a shared cache before expanding.

Reuse earlier passing tests where the code has not changed. Repeat checks when a new change or failure makes them necessary.

## Finish the rollout

Do these after the two-day review passes. Do not fake an older observation date or bypass the health checks.

- [ ] Change the longer-cache gate from 7 days to 2 days in both `scripts/stack127/cache/status.mjs` and `scripts/stack127/cache/configure-cloudflare.mjs`.
- [ ] Update workflow wording and operating documentation to match the two-day decision.
- [ ] Keep GitHub processing as a manual backup. Remove its old scheduled processing once Supabase reliability is verified.
- [ ] Decide what to do with the remaining scheduled status job: keep it for health checks, or remove its cron after the longer policy is applied. It must not remain an ordinary update processor.
- [ ] Verify the changed gate rejects less than 48 healthy hours and accepts a genuinely healthy completed window.
- [ ] Run the checks appropriate to the final changes. Run quality/build if application runtime or production configuration changes require them.
- [ ] Commit and release the final changes, preserving unrelated work. Run production deployment preflight.
- [ ] Apply the longer cache policy through the verified maintenance workflow or guarded policy script.
- [ ] Confirm the observation table records that longer cache times were enabled, and verify actual Cloudflare rules and response headers.
- [ ] Confirm the live revision matches the deployed commit and run a fresh edit through the full update process again.
- [ ] Update this checklist and operating documentation. Mark the goal complete only after the final state is verified.

## Final cache times

| Content | Cloudflare time |
| --- | --- |
| Tools, courses, references, legal pages, and catalogs | 7 days |
| Homepage, directories, and app/device details | 24 hours |
| Search and filters | 15 minutes |
| Sitemap and robots | 1 hour |
| Mutable icons, logos, and favicons | 30 days |
| Versioned bundles | 1 year |
| Errors, private endpoints, health, and live DNS/IP results | No public cache |

Browsers check mutable content each time. Content edits clear affected caches before these times expire. Keep the existing RDAP cache: 24 hours for registered domains and 1 hour for unregistered domains. Keep Traefik response caching off.

## Conditional work when more pages launch

These pages are currently outside the published implementation. Their checks become required when they are built and published.

- [ ] Add and tag caches for launch directories, advertising, and platform fee data.
- [ ] Map their edits to lists, details, counts, and related pages, then verify publishing and removal.
- [ ] Handle countdowns or other time-based text in the browser, or queue updates when the displayed value should change.

Current operating instructions are in `stack127_docs/cloudflare.md` on the deployed main branch. Runtime changes should be reviewed against that branch; the local workspace contains separate unfinished work.
