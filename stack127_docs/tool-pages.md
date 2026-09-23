# Tool pages

Tool routes and tool copy have separate owners. The Next.js route owns the interactive tool, while PostgreSQL owns its title, introduction, supporting Markdown, public dates, and version records.

Use [writing-style.md](writing-style.md) for writing guidance. This document covers content storage, rendering, and updates.

This split applies only to interactive tools. References and directories such as `/epp-status-codes` and `/tld-directory` are catalogs. They do not get rows in `stack127_tool_pages`.

## Tables

`public.stack127_pages` is the universal publication and SEO registry.

| Column | Purpose |
| --- | --- |
| `id` | Internal identity and primary key. Family tables refer to this value. |
| `slug` | Unique URL path without a leading slash. |
| `page_family` | One of `tool`, `catalog`, `course`, `info`, or `legal`. |
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

`created_at` remains as a temporary compatibility column during this first release so the currently
deployed application can keep reading the registry while the migration and new image roll out. New
application code uses `row_created_at`. Remove `created_at` only in a later migration, after a
separate production verification confirms that no deployed code or operational script reads it.

`public.stack127_tool_pages` is the one-to-one tool extension. Its `page_id` must point to a `stack127_pages` row whose family is `tool`.

| Column | Purpose |
| --- | --- |
| `page_id` | Primary key and foreign key to `stack127_pages.id`. |
| `title` | Visible tool-page heading. |
| `intro_markdown` | Markdown rendered before the interactive tool. |
| `usage_markdown` | Optional Markdown rendered after the interactive tool and before supporting content. Existing rows may remain `null` until reviewed. |
| `content_markdown` | Markdown rendered after the interactive tool. |
| `content_revision` | Internal revision number. Increment only when `title`, `intro_markdown`, `usage_markdown`, or `content_markdown` changes. |
| `tool_version` | Semantic version of the hosted tool behavior. Content-only edits do not change it. |
| `tool_version_updated_at` | Time the hosted tool version last changed. |
| `stack127_repo_url` | Optional URL for the stack127-owned repository that contains the related public tool. |
| `stack127_repo_version` | Version currently verified in that stack127 repo. |
| `stack127_repo_commit_sha` | Exact verified commit in that stack127 repo. |
| `stack127_repo_synced_at` | Time the hosted and repository implementations were actually compared or synchronized. |
| `row_updated_at` | Automatic internal time for any tool-row write. Do not set it manually. |

The `stack127_repo_*` fields describe repositories owned by stack127. They are unrelated to `public.github_projects`, which stores third-party repository facts used by directories.

## Markdown boundary

Store readable copy in Markdown. Raw HTML is not rendered. GitHub-flavored tables, lists, links, inline code, fenced code, headings, and blockquotes are supported. The shared content components and copyable examples are documented in [shared-ui.md](shared-ui.md).

Keep controls, live results, accessibility behavior, and operational states in code. Write explanatory formulas, worked examples, callouts, and exact static charts in the content Markdown when they help the reader. Keep the introduction and supporting explanation in the database. Do not commit a second live copy of the Markdown under the route or `content_docs`.

The tool-page server renderer is `app/ui/site/tool-page-content.tsx`; it uses the sitewide `ContentMarkdown` from `app/ui/content-markdown.tsx`. Every tool route loads its row with `getRequiredToolPage`, renders `ToolPageHeader` before the interactive component, and renders `ToolPageMarkdown` after it. That article renders `usage_markdown` first when present, then `content_markdown`, so the guide remains one continuous server-rendered prose region.

Markdown may reference an approved generated marker figure with an image such as `![How the pool is assembled](marker-art://catalog/zfs-capacity)`. The explicit registry in `app/marker-art-registry.ts` resolves only known generated modules through `MarkerArt`; unknown references and arbitrary paths are rejected.

Supporting Markdown tables use the reading column's width and wrap explanations, links, and inline code. Keep the keyboard-focusable scroll region as a fallback for unusual content. This rule does not change interactive result tables or raw-output viewers, which retain their own overflow behavior.

Use `> [!NOTE]`, `> [!WARNING]`, `> [!FORMULA]`, or `> [!EXAMPLE]` for shared content blocks. A short title may follow the marker on the same line. Use `chart-bar`, `chart-line`, or `chart-donut` fenced JSON for an exact data chart. The renderer validates chart data and shows a readable error for invalid input. Ordinary headings, lists, and contextual links need no special syntax.

Preserve readable words and code identifiers. Wide comparison tables may scroll inside their own region on narrow screens; do not force every column to fit by splitting identifiers into fragments. Check computed styles as well as page width, since general prose rules can override table-specific wrapping.

## Content-only changes

A content-only change modifies the visible title, introduction, or supporting Markdown without changing the tool's inputs, calculations, data sources, results, or behavior.

When correcting a claim about the tool's coverage, data handling, accuracy, or limits, check the search title and description too. A corrected guide must not leave the old promise in a search snippet. Metadata stays in `stack127_pages` and follows `stack127_docs/seo.md`; changing it does not require changing publication flags or route-level SEO code. The tool-writing stage supplies the search title and description. Integration applies them to the development registry and checks the rendered metadata. Production metadata changes wait for the authorized publication workflow.

1. Prepare reviewed introduction and content Markdown in temporary files outside the live route. Planning and evidence may stay under `content_docs/<slug>/`, but the database remains the live copy.
2. Run a dry run against the development database:

   ```bash
   npm run stack127:tool-page:content:update -- \
     --slug dns-lookup \
     --intro-file /tmp/dns-lookup-intro.md \
     --content-file /tmp/dns-lookup-content.md
   ```

3. Add `--usage-file /tmp/dns-lookup-usage.md` when reviewed usage guidance is available. Omitting it preserves the existing value, including `null`. The file must contain meaningful nonempty Markdown. Add `--title "DNS lookup"` only when the visible heading changes. Add `--apply` after reviewing the dry-run result.
4. Render and test the page from the development database.
5. Apply the same reviewed files to production only as a separate authorized operation:

   ```bash
   npm run stack127:tool-page:content:update -- \
     --environment production \
     --confirm stack127-production \
     --slug dns-lookup \
     --intro-file /tmp/dns-lookup-intro.md \
     --content-file /tmp/dns-lookup-content.md \
     --apply
   ```

The command increments `content_revision`. It leaves `tool_version` and `tool_version_updated_at` unchanged. For a published row it updates the public `stack127_pages.updated_at`; for an unpublished row that date stays `null`.

## Functional tool changes

A functional change modifies inputs, validation, formulas, resolution behavior, data-source interpretation, results, interactive visuals, privacy behavior, or another user-observable part of the tool.

1. Change the route, engine, fixtures, and tests through the normal test-first tool workflow.
2. Choose the next semantic version. Use a patch for a compatible correction, a minor version for compatible new behavior, and a major version for an incompatible contract change.
3. Dry-run the version update against development, then apply it after the implementation and tests pass:

   ```bash
   npm run stack127:tool-page:version:update -- \
     --slug dns-lookup \
     --version 1.1.0 \
     --apply
   ```

4. Verify the rendered page and full quality gate. Apply the same version to production only as a separate authorized operation, using `--environment production --confirm stack127-production --apply`.

The command changes `tool_version` and `tool_version_updated_at`. It does not change `content_revision`. For a published row it updates the public `stack127_pages.updated_at`.

If the functional release also needs copy changes, run the content command and version command separately. This preserves both histories.

## stack127 repo synchronization

Record a repository sync only after comparing or synchronizing the hosted implementation with a stack127-owned repository. A repository page view or release check is not a sync.

```bash
npm run stack127:tool-page:repo:sync -- \
  --slug dns-lookup \
  --repo-url https://github.com/stack127labs/dns-tools \
  --repo-version 1.1.0 \
  --commit-sha 0123456789abcdef0123456789abcdef01234567 \
  --apply
```

This command updates only the `stack127_repo_*` fields and their internal row timestamp. It does not change `content_revision`, `tool_version`, or the public `updated_at`. If synchronization also changes the hosted tool, complete the functional version workflow separately.

All three commands are dry-run by default. They read `.env.local` for development or `.env.database` for production and reject `--database-url` overrides. Production writes require an explicit production environment, confirmation phrase, and `--apply`. Development mode also stops if `.env.local` and `.env.database` contain the same database URL.

## Publication and access

Publication remains controlled only by `stack127_pages.is_published`. A tool content row does not publish its route.

Row-level security exposes a tool row to anonymous and authenticated readers only when its parent registry row is a published tool. Server rendering still uses the joined registry check in `lib/tool-pages.ts`. Normal routes remain repo-owned and flat.
