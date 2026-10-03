# Directory pages

Directory routes and directory copy have separate owners. The Next.js route owns the layout, sidebar, filters, and record views. PostgreSQL owns the visible title, introduction, Markdown content, and card text. This matches the split for tools in [tool-pages.md](tool-pages.md).

Follow [writing-style.md](writing-style.md) when writing. This document covers storage, rendering, and updates.

## Tables

`public.stack127_pages` is the registry. A directory row uses `page_family = 'directory'`.

`public.stack127_directory_pages` adds one row per published directory page. Its `page_id` must point to a `stack127_pages` row whose family is `directory`.

| Column | Purpose |
| --- | --- |
| `page_id` | Primary key and foreign key to `stack127_pages.id`. |
| `title` | Visible h1. Wrap the accent phrase in `<mark>`. |
| `intro_markdown` | Markdown shown under the title. |
| `content_markdown` | Optional Markdown for the page's prose. Sectioned pages split it with `<!-- section:<id> -->` markers. Keep existing markers when you edit. |
| `content_revision` | Internal revision number. It goes up on its own when the title or Markdown changes. |
| `card_name` | Short name on homepage cards and sidebars. |
| `card_description` | Short summary on homepage cards. |
| `row_updated_at` | Automatic internal time for any row write. Don't set it by hand. |

A published directory page with no row returns 404. Create the row before you publish the page.

## Child pages

Every published, indexable child page gets its own row, for example `/ad-networks/<slug>` or `/keyboard-shortcuts/<app>`.

When child copy comes from records, a script writes the rows. Don't edit those rows by hand, because the next sync will overwrite them. Change the records or the script instead.

| Directory | Script |
| --- | --- |
| Keyboard shortcuts | `scripts/keyboard-shortcuts/sync-pages.mjs` |
| Ad networks | `scripts/ad-networks/sync-page-copy.mjs` |
| Platform fees, including the overview | `scripts/platform-fees/sync-development.mjs` |

## Records

The table holds page copy only. Directory records live in one of two places:

| Records | Where |
| --- | --- |
| Small, edited by hand, rarely change | Code, next to the route or in `lib/` |
| Large, or updated by a script | A database table for that directory |

Decide which in the directory's brief when you create it.

## Rendering

Pages read their row with `getRequiredDirectoryPage(slug)` from `lib/directory-pages.ts`. Render Markdown through `app/ui/directories/directory-page-content.tsx`. Don't hard-code the title, intro, or prose in the page file.

## Editing copy

The command previews and rolls back by default. Add `--apply` to save.

```bash
node scripts/stack127/directory-pages/update-content.mjs \
  --environment development \
  --slug tld-directory \
  --intro-file /tmp/intro.md \
  --content-file /tmp/content.md
```

Optional flags: `--title`, `--card-name`, `--card-description`, and `--clear-content`.

A saved edit queues revalidation for that page's `stack127-directory-page:<slug>` tag and its path.
