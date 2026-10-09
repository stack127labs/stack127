# Directory pages

A directory page has three owners. The Next.js route owns the layout, sidebar, filters, and record views. The route's `content/*.mdx` files own the introduction and the page's sections. PostgreSQL owns the visible title, search metadata, card text, public dates, and the records themselves. This matches the split for tools in [tool-pages.md](tool-pages.md).

Read [page-content.md](page-content.md) for the content files and how to move a page to them. Follow [writing-style.md](writing-style.md) when writing, and use the [directory writing skill](../skills/stack127/stack127-directory-writing/SKILL.md) to plan and write directory copy. This document covers the database side, rendering, and updates.

## Tables

`public.stack127_pages` is the registry. A directory row uses `page_family = 'directory'`.

`public.stack127_directory_pages` adds one row per published directory page. Its `page_id` must point to a `stack127_pages` row whose family is `directory`.

| Column | Purpose |
| --- | --- |
| `page_id` | Primary key and foreign key to `stack127_pages.id`. |
| `title` | Visible h1. Wrap the accent phrase in `<mark>`. |
| `intro_markdown`, `content_markdown` | Content for pages that haven't moved to MDX. A moved page ignores them, but the publisher still requires `intro_markdown` for a new directory. See [page-publishing.md](page-publishing.md). |
| `card_name` | Short name on homepage cards and sidebars. |
| `card_description` | Short summary on homepage cards. |
| `card_icon_key` | Optional icon key from `lib/card-icons.ts`. The h1, the homepage sidebar row, and the homepage card all use it. |
| `card_art_key` | Optional marker art key from `lib/card-art.ts` for the homepage card. |
| `row_updated_at` | Automatic internal time for any row write. Don't set it by hand. |

A published directory page with no row returns 404. The directory publisher creates the row unpublished, then publishes the page last. See [page-publishing.md](page-publishing.md).

## Child pages

Every published child page gets its own row, for example `/ad-networks/<slug>` or `/keyboard-shortcuts/<app>`. The row holds its title, search metadata, and dates, the same as a top-level directory.

Every child page also gets its own words, written for that page: an intro at least, and sections when the page needs them. They live in MDX, as [page-content.md](page-content.md) describes. A child page with its own route folder, such as `/keyboard-shortcuts/figma`, keeps them in `content/` beside its `page.tsx`. Platform fee categories share `platform-fees/[section]/`, so each category has a folder under that route's `content/`, named for its slug.

Record sync scripts own the records and the generated route files. They must not write over a child page's words, title, or search metadata. A script that generates child routes, such as the keyboard shortcuts sync, generates each `page.tsx` to pass the page's own `content/` files to the template. Write the title and search metadata with the directory writing skill, then publish them with `"source": "development"` in the manifest. See [page-publishing.md](page-publishing.md).

| Directory | Record script |
| --- | --- |
| Keyboard shortcuts | `scripts/keyboard-shortcuts/sync-pages.mjs` |
| Ad networks | `scripts/ad-networks/sync-page-copy.mjs` |
| Platform fees | `scripts/platform-fees/sync-development.mjs`, then `prepare-category-manifest.mjs` for the manifest |

## Public dates

`getRequiredDirectoryPage` returns the registry's `published_at` and `updated_at`. Use these public dates in the header. Internal row timestamps are not page dates.

Saving a different title, search metadata, or card text moves `updated_at` and queues a cache refresh. A child change also touches every registered directory ancestor. Unpublished pages keep both public dates null.

An MDX content change doesn't move the date by itself. When it matters to readers, add a `touch_reason` to the page in the directories publisher manifest for that release. Skip it for typo fixes and formatting.

| Records | Automatic date changes |
| --- | --- |
| Platform fees | Changed sections or entries touch the affected category and `/platform-fees`. Moving a section or entry touches both categories. |
| Launch directories | Changed published listings touch `/launch-directories`. |
| Ad networks | Changed network facts or confirmed publishers touch the network child and `/ad-networks`. Crawler leases and other bookkeeping do not. |
| Self-host apps | Changed published apps, category links, resource estimates, install options, or linked GitHub facts touch `/self-host-apps`. Registered app children also get touched. |
| CLI apps | Changed published terminal apps or their linked GitHub facts touch `/cli-apps`. Candidate discovery and provenance do not. |
| Software licenses | Changes to published app license counts move the date. License facts in code need an explicit touch. |
| Keyboard shortcuts | Copy syncs touch changed children and the hub. Full app records catch shortcut edits with the same count. A separate hub snapshot catches removed apps and changed catalog counts. The first run establishes a baseline. |

No-op updates and identical imports leave public dates alone. A real source check that changes a displayed verification date is visible content too.

TLDs, EPP codes, software licenses, hardware records, and other code directories need an explicit touch after meaningful fact or entry changes, the same as a content change. Skip it for code typo fixes or formatting. The same applies to a directory without record sync coverage.

```bash
node scripts/stack127/pages/touch.mjs --environment development \
  --slug tld-directory --reason "Updated TLD facts" --apply
```

Without `--apply`, the command previews and rolls back. For production, add `touch_reason` to the reviewed directory publisher manifest. Don't edit timestamps by hand.

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

The table holds page fields only. Directory records live in one of two places:

| Records | Where |
| --- | --- |
| Small, edited by hand, rarely change | Code, next to the route or in `lib/` |
| Large, or updated by a script | A database table for that directory |

Decide which in the directory's brief when you create it. The publish manifest must say which one in `requirements.records`. Code records list their files. Database records list read-only SQL checks that confirm the data is loaded. Load database records with the directory's own import command before you publish. The publisher doesn't import data or change schema.

## Rendering

Pages read their row with `getRequiredDirectoryPage(slug)` from `lib/directory-pages.ts` for the title, date, and card icon. The route imports `content/intro.mdx` under the title and each section file where that section goes. `/epp-status-codes` shows the pattern. Don't hard-code the title in the page file.

A page that hasn't moved yet renders its database Markdown through `ContentMarkdown` and `app/ui/directories/directory-page-content.tsx`. Move it before editing its content.

## Editing

| Change | How |
| --- | --- |
| Introduction or sections | Move the page first if it hasn't moved, then edit its `content/*.mdx` files. The change ships with a code release. See [page-content.md](page-content.md). |
| Title, search metadata, or card fields | The directory publisher. For a quick development check, the single-page command below. |
| A new directory, or child pages going public | The directory publisher. See [page-publishing.md](page-publishing.md). |

The single-page command previews and rolls back by default. Add `--apply` to save.

```bash
node scripts/stack127/directory-pages/update-content.mjs \
  --environment development \
  --slug tld-directory \
  --meta-title "<search title>" \
  --meta-description "<search description>"
```

Its flags are `--title`, `--meta-title`, `--meta-description`, `--card-name`, `--card-description`, `--card-icon-key`, and `--card-art-key`. It rejects keys that aren't in the registries. A saved edit queues revalidation for that page's `stack127-directory-page:<slug>` tag and its path.

For launch directories, `evidence.public_submission` holds checked free-plan requirements, backlink status, approval time, launch queue text, and dated observations. The server projects only validated public fields from that object. Signed-in and email observations describe our submission attempt, and stay separate from public rules. Unknown backlink requirements do not qualify for the free-without-required-backlink filter. Existing research notes remain private. Update these records through `scripts/stack127/database/update-launch-directories.mjs`, which checks the reviewed row version.
