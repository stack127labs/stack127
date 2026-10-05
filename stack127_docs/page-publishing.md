# Page publishing

Two commands publish tools and directories. In one database transaction, they write the registry row, family row, search metadata, card fields, catalog memberships, content, tool version, and repository fields. They check that each page is ready first, and check the public pages afterward.

Building and publishing are separate jobs. The research, build, writing, and audit skills create the page. The publisher checks that the finished page is ready, writes its data, and turns publication on.

| Job | Owner |
| --- | --- |
| Research, spec, route, engine, components, copy, and card art | Tool and page skills |
| Schema migrations | A pull request and the release workflow |
| Dataset imports and record syncs | Each dataset's own reviewed command, run before publishing |
| Readiness checks, page data, catalog memberships, and publication | The publisher |
| Building and deploying the app | Pull request CI and the release workflow |

Read [tool-pages.md](tool-pages.md), [directory-pages.md](directory-pages.md), and [tool-catalogs.md](tool-catalogs.md) for what each table holds. This document covers how the data gets there.

## Commands

```bash
npm run stack127:tools:publish -- <command> [flags]
npm run stack127:directories:publish -- <command> [flags]
```

The tools command takes tool and catalog pages. The directories command takes directory pages, including child pages such as `ad-networks/<slug>`. Both share one implementation. `--environment` defaults to `development`.

| Command | Flags | What it does | Writes |
| --- | --- | --- | --- |
| `prepare` | `--manifest`, `--out`, `--environment` | Reads the manifest and its Markdown files, checks readiness, reads the current rows from the target database, and writes a plan file. | Only the plan file |
| `preview` | `--plan`, `--environment` | Runs the whole plan in one transaction, prints the result, and rolls back. | Nothing |
| `apply` | `--plan`, `--environment`, `--confirm`, `--release-sha`, `--site`, `--wait-seconds` | Commits the plan in one transaction, then checks the database and the public pages. | The database |
| `verify` | `--plan`, `--environment`, `--release-sha`, `--site`, `--wait-seconds`, `--restored` | Checks the database and public pages against the plan without writing. | Nothing |
| `restore` | `--plan`, `--environment`, `--confirm`, `--release-sha`, `--site`, `--wait-seconds` | Puts back the plan's before values, then checks them. | The database |
| `dispatch` | `--plan`, `--environment production`, `--confirm`, `--release-sha` | Sends a reviewed production plan to the page publication workflow on GitHub. | A GitHub deployment |

There are no force or skip flags. Every gate below always runs.

- `--out` must be a new file. `prepare` won't overwrite an existing plan.
- `--wait-seconds` is a whole number from 0 to 900. It limits how long the command waits for the live release and for public pages to update.
- `--site` sets only the address the checks load pages from. It must be a bare `http` or `https` origin. Development defaults to `http://127.0.0.1:3333`. Production always loads from `https://stack127.com` and rejects any other value.
- `verify --restored` checks the restored state instead of the published one.

## Manifest

A manifest describes one batch of pages. All pages in a batch succeed or fail together.

```json
{
  "schema_version": 1,
  "kind": "tools",
  "pages": [
    {
      "slug": "dns-lookup",
      "family": "tool",
      "registry": {
        "meta_title": "DNS lookup: current records and nameservers | stack127",
        "meta_description": "Check public DNS records and compare resolver and authoritative answers.",
        "is_published": true
      },
      "content": {
        "intro_markdown": { "$file": "dns-lookup/intro.md" },
        "usage_markdown": { "$file": "dns-lookup/usage.md" },
        "content_markdown": { "$file": "dns-lookup/content.md" },
        "card_description": "Read current DNS records and see where each answer came from."
      },
      "catalogs": [
        { "slug": "dns-tools", "display_order": 1 },
        { "slug": "domain-tools", "display_order": 11 }
      ],
      "requirements": {
        "route": "app/(site)/(tools)/(dns)/dns-lookup/page.tsx",
        "assets": ["lib/card-art.ts"],
        "checks": [],
        "smoke": [{ "path": "/dns-lookup", "text": "DNS lookup" }]
      }
    }
  ]
}
```

Each page takes only these keys:

| Key | Meaning |
| --- | --- |
| `slug`, `family` | The page. `family` is `tool` or `catalog` in a tools batch, and `directory` in a directories batch. |
| `source` | Optional. `development` starts the page from its reviewed development rows instead of the target's rows. See Development source. |
| `registry` | `stack127_pages` fields to set: `label`, `meta_title`, `meta_description`, `is_published`, `cover_image_url`, `page_type`, `sitemap_priority`. |
| `content` | Family table fields to set. See the table below. |
| `catalogs` | Tools only. The full ordered catalog list. The first entry is the primary catalog. Each entry needs `slug` and a positive `display_order`. |
| `requirements` | What must already exist before the page can publish. See Readiness. |

| Family | Content fields |
| --- | --- |
| `tool` | `title`, `intro_markdown`, `usage_markdown`, `content_markdown`, `tool_version`, `stack127_repo_url`, `stack127_repo_version`, `stack127_repo_commit_sha`, `card_name`, `card_description`, `card_icon_key`, `card_art_key` |
| `catalog` | `heading_before`, `heading_mark`, `heading_after`, `intro`, `section_heading`, `icon_key`, `hero_art_key`, `home_art_key`, `home_order`, `card_name`, `card_description` |
| `directory` | `title`, `intro_markdown`, `content_markdown`, `card_name`, `card_description`, `card_icon_key`, `card_art_key` |

These are the plan's field names, and they stay the same across schema versions.

Catalog manifests keep `icon_key` and `home_art_key`, even though the table now calls them `card_icon_key` and `card_art_key`. The publisher writes them to whichever columns the target database has. Use the old names in catalog manifests and the new names everywhere else.

Directory card keys are nullable:

- A published directory on the homepage needs both `card_icon_key` and `card_art_key`. The homepage list is `homePageSlugs` in `lib/page-registry-helpers.ts`.
- Child pages and directories that aren't on the homepage may leave both `null`. A child page then shows its parent's icon.
- A key that isn't `null` must be registered.

Every directory plan carries both keys, even when they're `null`. A directory plan made by an older publisher has no card keys, and the publisher rejects it. Run `prepare` again to make a new plan.

A `*_markdown` field can be `{ "$file": "path.md" }`. The path must be relative and stay inside the manifest's folder after symlinks are resolved. Both the requested path and its resolved target must end in `.md` or `.markdown`. `prepare` reads the file, trims it, and copies the text into the plan. Later edits to the file don't change a prepared plan.

Keep the manifest, its Markdown files, and its plans together in `tmp/page-publishing/<batch>/` in the checkout. Git ignores `tmp/`, so nothing is committed, and the folder lasts from development integration until release. Plans are written readable only by you. The database stays the live copy.

### Existing and new pages

For an existing page, the manifest is a patch. `prepare` merges it into the current rows of the target database. Fields you leave out keep their current values. Leaving out `catalogs` keeps the tool's current memberships. Including it replaces the whole list.

A new page needs every required field, because there is nothing to merge into. The publisher fills only these defaults:

| Field | Default |
| --- | --- |
| `is_published` | `false` |
| `page_type` | `SoftwareApplication` for tools, `CollectionPage` otherwise |
| `sitemap_priority` | `0.5` |
| `cover_image_url`, `usage_markdown`, repository fields | `null` |
| `tool_version` | `1.0.0` |
| Directory `content_markdown`, `card_icon_key`, `card_art_key` | `null` |
| Catalog `heading_before`, `heading_after` | Empty |
| Catalog `icon_key`, `home_order` | `layers`, `100` |

A new catalog must set `hero_art_key` and `home_art_key` to keys registered in `lib/card-art.ts`. There is no default art.

The batch must also make sense as a whole, or nothing is written:

- A published tool needs at least one catalog, and each of its catalogs must be published.
- A catalog can't be published empty. A new catalog goes in the same tools batch as its first tool, with `family: "catalog"`.
- Display orders can't collide with another tool in the same catalog.
- A published directory child page needs a published parent directory.

The publisher keeps the existing revision rules. Database triggers raise `content_revision` when the title or Markdown changes, and set `tool_version_updated_at` when `tool_version` changes. Card and membership changes don't change either. Setting the repository fields also sets `stack127_repo_synced_at`, so set them only after a real comparison, as [tool-pages.md](tool-pages.md) describes. A repository-only change updates the registry's internal `row_updated_at` but keeps the public dates.

A page whose rows already match the plan is left alone. Retrying a plan doesn't bump any revision or date.

### Development source

`"source": "development"` takes a page's registry, content, and catalog fields from the development database at `prepare` time. Explicit `registry`, `content`, and `catalogs` values in the manifest still override them. The target's current rows become the plan's before values, as usual.

- Only the pages named in the manifest are read. Nothing else is copied.
- The page must set `registry.is_published` to `true` or `false` explicitly.
- The development page must already have its family row.
- The plan holds the frozen values only. It doesn't keep `source`, so later development edits don't change it.
- A production `prepare` with a development source reads both `.env.local` and `.env.database`.

### Directory child pages

Many directory child pages get their copy from records, through the sync scripts listed in [directory-pages.md](directory-pages.md). The publisher doesn't run those scripts, and you shouldn't type over their copy in a manifest. Instead:

1. Run the directory's sync in development and review the child pages there.
2. List each child page in the directories manifest with `"source": "development"` and an explicit `registry.is_published`.
3. In production, run only the directory's reviewed dataset import, if its records live in the database. Don't run the page copy sync there. The plan already holds the reviewed child copy.

## Readiness

`prepare` refuses a page whose requirements aren't met. Later commands check the repository requirements again. SQL readiness checks run for the desired published version, so `restore` and `verify --restored` skip them.

| Requirement | Check |
| --- | --- |
| `route` | Required. A `page.tsx` under the family's route group, such as `app/(site)/(tools)/`. Its path must match the slug, and dynamic segments are allowed for directory children. The `layout.tsx` beside it must use `registryLayout`. |
| `assets` | Each listed repository file must exist. |
| Icon and art keys | Tool and catalog keys, and any directory key that isn't `null`, must be registered in `lib/card-icons.ts` and `lib/card-art.ts`. Homepage directories need both keys. |
| Markdown | Every Markdown field must pass the shared Markdown validator. |
| `checks` | Each `{ "name", "sql_file", "params" }` points to a repository SQL file holding one `SELECT` or `WITH` query. It runs in a read-only transaction and must return exactly one row, `{ "ready": true }`. |
| `smoke` | Each `{ "path", "text" }` is a path under the page's own slug and text that must appear on it. The public check uses these. |

`prepare` copies each SQL query into the plan. Later commands stop if the repository file no longer matches.

Every directory must say where its records come from with `requirements.records`:

```json
{ "kind": "code", "files": ["lib/domain/status-codes.ts"] }
```

```json
{ "kind": "database", "checks": [{ "name": "records loaded", "sql_file": "scripts/<slug>/ready.sql", "params": [] }] }
```

Code records list the files that hold them. Database records list readiness checks, in the same shape as `checks`. Only directories take `records`.

Readiness checks only read. Import a directory's records with its own reviewed command before you prepare the plan. Ship any migration through a pull request. Imports and migrations aren't part of the page transaction. The publisher never copies the development database to production.

## Public checks

`apply` and `restore` always check the public pages after they commit. `verify` runs the same check on its own. The check reads the database first, then loads each page until it matches or the wait runs out. The wait is 180 seconds by default.

- A published page must return 200 and be in the sitemap. Its title, `h1`, description, canonical, and robots tags must match the plan. Its `stack127-content-revision` tag must match the registry row. A tool with a repository URL must show that link.
- Canonical and sitemap URLs use the site's configured origin, the same one `lib/seo` uses. That's `https://stack127.com` in production, and `NEXT_PUBLIC_SITE_URL` from the environment or `.env.local` in development. It falls back to `https://stack127.com` when unset. `--site` doesn't change it.
- Each smoke path must show its expected text.
- An unpublished page must return 404 and be missing from the sitemap.

After `restore`, and with `verify --restored`, the check compares against the before values. It skips the smoke text and SQL readiness checks, because those describe the published version.

The publisher doesn't purge caches itself. Database triggers queue revalidation, and the cache worker processes it. See [caching.md](caching.md).

In Cloudflare mode, the production publication workflow rebuilds and deploys the static export right after the transaction commits, before the public check, while it still holds the production concurrency group. The rebuild captures the queued events and acknowledges only their exact versions, so a newer edit stays queued. This adds several minutes. Legacy mode is the default until both `vars.STACK127_FRONTEND_HOSTING` and the Supabase `cache-worker` secret are set to `cloudflare`. See [cloudflare.md](cloudflare.md#static-frontend-on-cloudflare).

In development, the public check needs `npm run dev` and `npm run stack127:cache:watch:local` running as background services.

These HTTP checks confirm the data is live. They don't replace looking at the page in a browser.

## Development

1. Write the manifest and Markdown files from the reviewed copy and the spec.
2. Start the dev server and the local cache watcher.
3. Run `prepare`. Fix any readiness failure it reports.
4. Run `preview` and read the result. Check that only the pages you meant changed.
5. Run `apply`. It also runs the public check.
6. Open each changed page and catalog at desktop and mobile width. For a tool, run one correct and one invalid example.

```bash
npm run stack127:tools:publish -- prepare --manifest tmp/page-publishing/dns-lookup/manifest.json --out tmp/page-publishing/dns-lookup/plan-dev-1.json
npm run stack127:tools:publish -- preview --plan tmp/page-publishing/dns-lookup/plan-dev-1.json
npm run stack127:tools:publish -- apply --plan tmp/page-publishing/dns-lookup/plan-dev-1.json
```

Workers may run all of these against development.

## Production

Production publication is part of "push to prod". When the user has authorized the release, the coordinator runs these steps without asking again.

The code the pages need must be live first. Merge the pull request and let the release workflow finish.

`prepare` records the current commit as the plan's source commit. Production `prepare`, `apply`, `restore`, and `dispatch` stop when there are uncommitted changes in `app`, `lib`, `scripts`, `.github`, `supabase`, `public`, the Next.js and TypeScript config, or the package files. Every route, asset, SQL, and records file the plan names must also be tracked by git and unchanged.

Production `apply`, `verify`, `restore`, and `dispatch` also need a full `--release-sha`. It must equal the current `origin/main` commit and the local `HEAD`, and contain the plan's source commit. Run them from a checkout of the exact released commit.

1. From a clean checkout of the released commit, run `prepare` with `--environment production`. The plan now holds the reviewed desired values and the production values they replace.
2. Run `preview` with `--environment production`. Read the result.
3. Run `dispatch`:

   ```bash
   npm run stack127:tools:publish -- dispatch \
     --plan tmp/page-publishing/dns-lookup/plan-prod-1.json \
     --environment production \
     --confirm stack127-production \
     --release-sha <full origin/main SHA>
   ```

`dispatch` creates a GitHub deployment with task `page-publication` in the `stack127-page-publication` environment. The reviewed plan travels in the deployment payload. Don't commit it, because that would make a second live copy of the content.

The page publication workflow, `.github/workflows/stack127-publish-pages.yml`:

1. Checks that the sender has write, maintain, or admin access to the repository, and that the release SHA is still the current `main` commit.
2. Waits up to 10 minutes for the live health SHA to match the release SHA. It stops without writing if the release never goes live.
3. Joins the shared `stack127-production` concurrency group. Release and publication jobs queue there in order and never cancel each other. GitHub holds up to 100 pending jobs in the group.
4. Runs `apply` with the plan. It repeats the SQL readiness checks after the live release wait, commits the batch, and runs the public check.
5. Records success or failure on the GitHub deployment.

In legacy mode the workflow doesn't build or deploy the app. In Cloudflare mode, step 4 also rebuilds and deploys the static frontend after the commit and before the public check. It finishes and records its result even if the agent's session ends. Watch the run and read its result.

A direct production `apply` from the homelab runs the same gates. Use `dispatch` for normal releases.

### Keep the plan

The reviewed plan is the exact data that gets published, and its before values are what `restore` needs. Keep the plan file until the pages are checked. Nothing else needs recording. Don't make separate receipts, hashes, or evidence files.

After publication, check the changed pages on `https://stack127.com` at desktop and mobile width. For a tool, run one correct and one invalid example on the live page.

## Failures and recovery

`apply` prints the database result before the public check starts. If the check then fails, the command says the batch committed and verification didn't finish.

| What happened | What it means | Do this |
| --- | --- | --- |
| `prepare` or `preview` fails | Nothing was written. | Fix the manifest, page, or data, then prepare a new plan. |
| `apply` fails before commit | The transaction rolled back. | Fix the cause and run `apply` again. |
| `apply` says the batch committed, then the public check fails | The data is saved. The pages haven't been confirmed. | Check the cache worker, then run `verify` with the same plan. Running `apply` again is also safe. In Cloudflare mode, check the frontend rebuild in the workflow log first. A failed rebuild leaves the events queued for `stack127-frontend-refresh.yml`. |
| `apply` reports a publishing conflict | Someone changed a page after `prepare`. | Prepare a new plan from the current rows. |
| The published data is wrong | The batch saved what it was given. | Publish a corrected plan, or run `restore` with the same plan. |

`restore` stops if a page no longer matches the plan, so it never overwrites a newer edit.

- An existing page gets its old registry and family values back exactly. If it had no family row before, the row is removed again.
- A page the batch created stays as an unpublished draft with its content and memberships. `restore` doesn't delete it. Its memberships to catalogs that the restore takes back to having no family row are removed.

Check a restore later with `verify --restored`.

## Narrow edits

The older single-purpose commands still work:

- `stack127:tool-page:content:update`
- `stack127:tool-page:catalogs:update`
- `stack127:tool-page:version:update`
- `stack127:tool-page:repo:sync`
- `scripts/stack127/directory-pages/update-content.mjs`

Use them in development and for a small fix to one live page. Use the publisher for a new page, a page going public, and any change that touches several tables at once.
