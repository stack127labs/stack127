# Tool pages

A tool page has three owners. The Next.js route owns the interactive tool. The route's `content/*.mdx` files own the introduction, usage, and article. PostgreSQL owns the title, search metadata, card fields, catalog memberships, version records, and public dates.

Read [page-content.md](page-content.md) for the content files and how to move a page to them. Follow [writing-style.md](writing-style.md) when writing. This document covers the database side, rendering, and updates.

New tools, tools going public, and changes that touch several tables go through the tool publisher. See [page-publishing.md](page-publishing.md). The card, version, and repository commands below stay for development and small edits. The database content-update command and temporary tool previews have retired. Use the publisher for reviewed development previews too.

This split applies only to interactive tools. Directories such as `/epp-status-codes` and `/tld-directory` use `stack127_directory_pages` instead. See [directory-pages.md](directory-pages.md).

## Tables

`public.stack127_pages` is the publication and SEO registry for every page.

| Column | Purpose |
| --- | --- |
| `id` | Internal identity and primary key. Family tables refer to this value. |
| `slug` | Unique URL path without a leading slash. |
| `page_family` | One of `tool`, `directory`, `course`, `catalog`, or `site`. |
| `label` | Short navigation or card label. |
| `meta_title` | Browser and search title. |
| `meta_description` | Search description. |
| `is_published` | The only switch that makes the exact slug public. |
| `row_created_at` | Internal time when the registry row was created. Never present it as the publication date. |
| `created_at` | Temporary compatibility copy of the original creation time. New code must not read it. |
| `row_updated_at` | Automatic internal time for the latest registry-row write. Do not set it manually. |
| `published_at` | Public first-publication time. It is `null` while unpublished and is preserved after publication. |
| `updated_at` | Public time of the latest meaningful content, tool, or SEO change. It is `null` while unpublished. |
| `cover_image_url` | Optional social image. |
| `page_type` | Schema.org page type. |
| `sitemap_priority` | Sitemap priority from `0` to `1`. |

`created_at` stays as a temporary compatibility column during this first release. The deployed application can keep reading the registry while the migration and new image roll out. New application code uses `row_created_at`. Remove `created_at` only in a later migration. First, check production separately and confirm that no deployed code or operational script reads it.

`public.stack127_tool_pages` adds one row per tool. Its `page_id` must point to a `stack127_pages` row whose family is `tool`.

| Column | Purpose |
| --- | --- |
| `page_id` | Primary key and foreign key to `stack127_pages.id`. |
| `title` | Visible tool-page heading. |
| `tool_version` | Semantic version of the hosted tool behavior. Content-only edits do not change it. |
| `tool_version_updated_at` | Time the hosted tool version last changed. |
| `stack127_repo_url` | Optional URL for the stack127-owned repository that contains the related public tool. |
| `stack127_repo_version` | Version currently verified in that stack127 repo. |
| `stack127_repo_commit_sha` | Exact verified commit in that stack127 repo. |
| `stack127_repo_synced_at` | Time the hosted and repository implementations were actually compared or synchronized. |
| `row_updated_at` | Automatic internal time for any tool-row write. Do not set it manually. |
| `card_name` | Short name shown on tool catalog cards and tool family sidebars. |
| `card_description` | Short task-focused description shared by every catalog card for this tool. |
| `card_icon_key` | Approved icon key for tool navigation. |
| `card_art_key` | Approved marker-art key for catalog cards. |

The `stack127_repo_*` fields describe repositories owned by stack127. They are unrelated to `public.github_projects`. That table stores third-party repository facts used by directories.

See [tool-catalogs.md](tool-catalogs.md) for tool catalog content and memberships. A tool may appear in several catalogs. Its rank-1 membership is the primary one. Card edits update every linked catalog's public date and queue those pages for revalidation.
Card-only edits leave the tool's public date alone. Their internal registry timestamp still advances so cache checks can reject an older render. Title, search metadata, and `tool_version` changes move the public date. MDX content changes don't move it; a date move for content-only tool changes comes later. No-op writes and repository-only updates keep it unchanged.

In development, tool integration updates shared card fields and the complete ordered catalog list with `npm run stack127:tool-page:catalogs:update`. The command defaults to a dry run and uses `.env.local` for development. Add `--apply` to write. The first catalog has rank 1. If display orders are omitted, new tools are appended and existing memberships keep their positions. See [tool-catalogs.md](tool-catalogs.md) for the command and checks.

## Rendering

Every tool route loads its row with `getRequiredToolPage` and renders through `app/ui/site/tool-page-content.tsx`:

- `ToolPageHeader` shows the title, version, date, and repository link from the row. Its `intro` takes the page's `content/intro.mdx`.
- The interactive tool comes next.
- `ToolPageArticle` holds `content/usage.mdx`, when there is one, then `content/article.mdx`, in one server-rendered prose region.

`/cac-payback-calculator` shows the whole pattern. `intro` is required. Tool pages have no database-content fallback. Missing MDX imports fail the build or TypeScript check.

Keep controls, live results, accessibility behavior, and operational states in the tool's code. Formulas, worked examples, callouts, and charts that explain the tool go in the MDX content. See [page-content.md](page-content.md) for the blocks content can use.

Content tables use the reading column's width and wrap explanations, links, and inline code. Wide comparison tables may scroll inside their own region on narrow screens. Don't split identifiers into fragments to make every column fit. Check computed styles as well as page width, since general prose rules can override table wrapping. Interactive result tables and raw-output viewers keep their own overflow behavior.

## Content changes

A content change edits the introduction, usage, or article. It leaves the tool's inputs, calculations, data sources, results, and behavior unchanged.

1. Read the current files and [page-content.md](page-content.md).
2. Edit the files in the route's `content/` folder.
3. Run `npm run quality` and check the page at desktop and mobile width.
4. The change ships with the next code release, through a pull request.

When correcting claims about tool coverage, data handling, accuracy, or limits, check the search title and description too. A corrected guide must not leave the old promise in a search snippet. Title and search metadata stay in the database and follow [seo.md](seo.md). Tool writing supplies them. Integration applies them to development with the tools publisher and checks the rendered metadata. Production changes go through the publisher as part of an authorized release.

## Functional tool changes

A functional change affects inputs, validation, formulas, resolution behavior, data-source interpretation, results, interactive visuals, or privacy behavior. Any other change a user can observe in the tool also counts.

1. Change the route, engine, fixtures, and tests through the normal test-first tool workflow.
2. Raise `tool_version` when shipped inputs, outputs, calculations, validation, or other user-visible tool behavior changes. Keep it unchanged for copy, cards, styling, and repository metadata. Choose the next semantic version. Use a patch for a compatible correction. Use a minor version for compatible new behavior and a major version for an incompatible contract change.
3. Dry-run the version update against development, then apply it after the implementation and tests pass:

   ```bash
   npm run stack127:tool-page:version:update -- \
     --slug dns-lookup \
     --version 1.1.0 \
     --apply
   ```

4. Check the rendered page and pass the full quality gate. Set the same version in the publisher manifest for production, after the release that ships the code is live.

The command changes `tool_version` and `tool_version_updated_at`. For a published row it updates the public `stack127_pages.updated_at`.

If the functional release also needs content changes, edit the MDX in the same pull request. The version still changes only for behavior.

## stack127 repo synchronization

Record a repository sync only after comparing or synchronizing the hosted implementation with a repository owned by stack127. A repository page view or release check is not a sync.

```bash
npm run stack127:tool-page:repo:sync -- \
  --slug dns-lookup \
  --repo-url https://github.com/stack127labs/dns-tools \
  --repo-version 1.1.0 \
  --commit-sha 0123456789abcdef0123456789abcdef01234567 \
  --apply
```

This command updates only the `stack127_repo_*` fields and their internal row timestamp. It does not change `tool_version` or the public `updated_at`. If the sync also changes the hosted tool, complete the functional version workflow separately.

These commands default to a dry run. The publisher can set the version and repository fields too, in the same batch as the title, search metadata, and cards. They read `.env.local` for development or `.env.database` for production. They reject `--database-url` overrides. Production writes require an explicit production environment, confirmation phrase, and `--apply`. Development mode also stops if `.env.local` and `.env.database` contain the same database URL.

## Publication and access

Only `stack127_pages.is_published` controls publication. The tool row doesn't publish its route. The publisher turns publication on last, after the page's rows and readiness checks are in place.

Row-level security lets anonymous and authenticated readers see a tool row only when its parent is a published tool. Server rendering still uses the joined registry check in `lib/tool-pages.ts`. Normal routes stay flat and live in the repo.
