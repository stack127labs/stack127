# Directory pages

Directory routes and directory copy have separate owners. The Next.js route owns the layout, sidebar, filters, and record views. PostgreSQL owns the visible title, introduction, Markdown content, and card text. This matches the split for tools in [tool-pages.md](tool-pages.md).

Follow [writing-style.md](writing-style.md) when writing, and use the [directory writing skill](../skills/stack127/stack127-directory-writing/SKILL.md) to plan and write directory copy. This document covers storage, rendering, and updates.

## Tables

`public.stack127_pages` is the registry. A directory row uses `page_family = 'directory'`.

`public.stack127_directory_pages` adds one row per published directory page. Its `page_id` must point to a `stack127_pages` row whose family is `directory`.

| Column | Purpose |
| --- | --- |
| `page_id` | Primary key and foreign key to `stack127_pages.id`. |
| `title` | Visible h1. Wrap the accent phrase in `<mark>`. |
| `intro_markdown` | Markdown shown under the title. |
| `content_markdown` | Optional Markdown for the page's prose. Sectioned pages split it with `<!-- section:<id> -->` markers. Keep existing markers when you edit. |
| `card_name` | Short name on homepage cards and sidebars. |
| `card_description` | Short summary on homepage cards. |
| `card_icon_key` | Optional icon key from `lib/card-icons.ts`. The h1, the homepage sidebar row, and the homepage card all use it. |
| `card_art_key` | Optional marker art key from `lib/card-art.ts` for the homepage card. |
| `row_updated_at` | Automatic internal time for any row write. Don't set it by hand. |

A published directory page with no row returns 404. The directory publisher creates the row unpublished, then publishes the page last. See [page-publishing.md](page-publishing.md).

## Child pages

Every published, indexable child page gets its own row, for example `/ad-networks/<slug>` or `/keyboard-shortcuts/<app>`.

When child copy comes from records, a script writes the rows. Don't edit those rows by hand, because the next sync will overwrite them. Change the records or the script instead. The publisher doesn't run these scripts. Run the sync in development, review the pages, then publish them with `"source": "development"` in the manifest. That freezes the reviewed copy into the plan. Production needs only the directory's dataset import, not the copy sync. See [page-publishing.md](page-publishing.md).

| Directory | Script |
| --- | --- |
| Keyboard shortcuts | `scripts/keyboard-shortcuts/sync-pages.mjs` |
| Ad networks | `scripts/ad-networks/sync-page-copy.mjs` |
| Platform fees, including the overview | `scripts/platform-fees/sync-development.mjs` |

## Card icon and art

A directory on the homepage needs both card keys, and both must be in the registries. The directory publisher checks this. Leave the keys empty on child pages and on directories that aren't on the homepage.

| Page | Icon |
| --- | --- |
| A directory with `card_icon_key` | That key, in the h1, homepage sidebar, and homepage card. |
| A child page with no key, such as `/keyboard-shortcuts/<app>` | The parent directory's key. |
| A platform fees section page | Its own section icon. |
| A directory with no key yet | The route's own icon. |

`DirectoryTitleIcon` in `app/ui/directories/directory-title-icon.tsx` renders the h1 icon.

## Card counts

Homepage cards show live counts, such as apps and categories. Each directory computes its own in `card-counts.ts` beside its route, for example `app/(site)/(directories)/cli-apps/card-counts.ts`. Register it in `app/(site)/(directories)/card-counts.ts`. Counts stay in code, not in the table.

## Records

The table holds page copy only. Directory records live in one of two places:

| Records | Where |
| --- | --- |
| Small, edited by hand, rarely change | Code, next to the route or in `lib/` |
| Large, or updated by a script | A database table for that directory |

Decide which in the directory's brief when you create it. The publish manifest must say which one in `requirements.records`. Code records list their files. Database records list read-only SQL checks that confirm the data is loaded. Load database records with the directory's own import command before you publish. The publisher doesn't import data or change schema.

## Rendering

Pages read their row with `getRequiredDirectoryPage(slug)` from `lib/directory-pages.ts`. Render Markdown through `app/ui/directories/directory-page-content.tsx`. Don't hard-code the title, intro, or prose in the page file.

## Editing copy

Use the directory publisher for a new directory, child pages going public, and production changes. See [page-publishing.md](page-publishing.md).

For a small copy edit in development, use the single-page command. It previews and rolls back by default. Add `--apply` to save.

```bash
node scripts/stack127/directory-pages/update-content.mjs \
  --environment development \
  --slug tld-directory \
  --intro-file /tmp/intro.md \
  --content-file /tmp/content.md
```

Optional flags: `--title`, `--card-name`, `--card-description`, `--card-icon-key`, `--card-art-key`, and `--clear-content`. The command rejects keys that aren't in the registries.

A saved edit queues revalidation for that page's `stack127-directory-page:<slug>` tag and its path.
