# App directories data

The research in `dev-space/indie-hacker-apps/` feeds 12 directories, such as `/payment-providers`, `/file-storage` and `/auth-providers`. [`split-plan.md`](../../dev-space/indie-hacker-apps/split-plan.md) has the owner's decisions.

## Where things live

| What | Where |
| --- | --- |
| Research files, cards, status changes | `dev-space/indie-hacker-apps/` (the import's source) |
| Research categories, jobs, cells, cost sets | `lib/indie-hacker-apps/categories.json` |
| The 12 directories (slug, category, jobs, cost sets) | `lib/indie-hacker-apps/directories.ts` |
| App records | `public.indie_hacker_apps`, one row per app per research category |
| Directory copy for the database triggers | `public.indie_hacker_app_directories`, written by the import |
| Icons | `public/indie-hacker-apps/icons/<category>/<slug>.png` |

An app is listed in every directory that has one of its jobs. Its first job is its main job. In a directory, `main` is true when that first job is one of the directory's jobs.

## Import

The import checks every card with `check-cards.mjs` and refuses to run if any card fails. Apps with no card are skipped. It writes only the rows that changed, deletes rows whose card is gone, and copies `directories.ts` into the directory table. It ignores `job_check` and anything else that isn't a card field.

```bash
# Preview on development, then roll back.
node --experimental-strip-types scripts/indie-hacker-apps/import-apps.mjs

# Save to development.
node --experimental-strip-types scripts/indie-hacker-apps/import-apps.mjs --apply

# Production, only after the owner says so and the migration is live there.
node --experimental-strip-types scripts/indie-hacker-apps/import-apps.mjs \
  --environment production --apply --confirm stack127-production
```

It prints apps, inserts, updates, unchanged rows, deletions and icons per category, then apps and main apps per directory. An identical re-import writes nothing and moves no page dates.

Run it again after cards, research facts, `status-changes.md`, icons or `directories.ts` change. Production data needs a run of its own; a code release doesn't import.

## Pages and cache

- Server loaders are in `lib/indie-hacker-apps/index.ts`: `getAppDirectoryData(slug)` for cards, counts and changes, `getAppDirectoryApp(slug, app)` and `getAppDirectoryApps(slug, apps)` for the side panel, `listAppDirectoryAppSlugs(slug)`.
- Filtering, sorting, counts and the cost a card shows are plain functions in `lib/indie-hacker-apps/logic.ts`, tested by `logic.test.mjs` next to it.
- JSON routes: `/api/app-directories/<directory>/index` (cards) and `/api/app-directories/<directory>/apps/<app>` (one panel). Both return 404 while the directory page is unpublished.
- A changed row queues an `indie_hacker_apps` event for each published directory it belongs to, before and after the change, and touches those directory pages. Unpublished directories queue nothing and have no cache revision. Publishing or unpublishing a directory page queues its event. `scripts/stack127/cache/targets.mjs` maps the event to the category's data tag, the page, the JSON index and the `app-directory:<slug>` edge tag.
- `/api/cache/refresh` checks the served JSON index against `loadAppDirectoryIndex(slug)`, a database read past the cache, and expects 404 while the page is unpublished. Events name directories, not apps, so app panel routes aren't checked one by one; they share the index's data tag and edge tag.

## Release order

1. One pull request with the migration and the code: loaders, routes, cache wiring and the 12 pages. The release workflow applies the migration. Nothing queues `indie_hacker_apps` events in production until a directory page is published, so the cache worker never sees one before it can handle it.
2. Run the import on production, after the owner says so. With the pages unpublished it moves no dates and queues nothing.
3. Publish the pages with the directory publisher. Each publication queues that directory's event.
