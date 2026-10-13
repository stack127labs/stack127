# Page families

stack127 has four content families and one family for the site's own pages. They share the site shell, canvas, title treatment, reading rhythm, and design tokens. They don't pretend every kind of page has the same job.

| Family | `page_family` | Route group | Page table |
| --- | --- | --- | --- |
| Tool | `tool` | `(tools)` | `stack127_tool_pages` |
| Directory | `directory` | `(directories)` | `stack127_directory_pages` |
| Course | `course` | `(courses)` | `stack127_course_pages` and `stack127_course_lessons` |
| Catalog | `catalog` | `(catalogs)` | `stack127_catalog_pages` |
| Site page | `site` | `(site-pages)` | None |

The family name is the same in the database, the route group, and the code. `public.stack127_pages` is only the registry for URL, publication, SEO, and dates. Each family table holds that family's own columns.

`is_published` controls whether a page is public. `is_indexable` controls search indexing, sitemap inclusion, and JSON-LD. Set it to `false` for thin child pages, filtered views, or public pages still being improved. Published noindex pages can still appear in site lists and sidebars.

URLs stay short and flat:

| Page | Example |
| --- | --- |
| Tool | `/dns-lookup` |
| Directory | `/cli-apps` |
| Catalog | `/dns-tools` |
| Course | `/self-hosting-for-beginners` |

You don't need prefixes such as `tools`, `directories`, `catalogs`, or `courses` in the URL.

Source code is grouped with route groups that don't appear in URLs:

```text
app/(site)/(catalogs)/
app/(site)/(courses)/
app/(site)/(directories)/
app/(site)/(site-pages)/
app/(site)/(tools)/
```

The group names organize the repository. They never appear in public URLs.

## Shared structure

- Every page uses the shared site navigation and `AppShell`. Each page picks its sidebar position: `left` for navigation and options, `right` for related pages and section links, or `none`. Prefer `left`. A sidebar never holds reading content. See Sidebars in [design-system.md](design-system.md).
- All page families use `PageCanvas` and the same responsive gutters.
- Text-led pages use its 760px reading width. Directories, tool workbenches, tables, and card grids stay wide. With a sidebar, both widths start at the same left edge. With no sidebar, reading sections center.
- `EntryHero` uses the canvas inside it, so entry headers and body sections line up. Don't nest canvases.
- Visible titles and introductions use `PageHeader`.
- Reading content uses the classes exported by `app/ui/site/prose.ts`, so heading and paragraph rhythm comes from one place.

Use [writing-style.md](writing-style.md) for all public wording and visual choices. Use [shared-ui.md](shared-ui.md) for common controls, tables, charts, callouts, pagination, and dialogs. Use [page-content.md](page-content.md) for where page content lives and the section order of each family. Keep family-specific data and unusual interactions in their own route.

## Catalogs

Catalogs gather stack127's own pages in one place. `/dns-tools`, `/domain-tools`, and `/storage-tools` are catalogs because their entries lead to stack127 tools. A catalog helps people find pages. It doesn't own the child pages or their URLs.

Catalog routes live under `app/(site)/(catalogs)/`.

- Catalog titles and cards live in `stack127_catalog_pages`. Each catalog's intro and article live in `content/<slug>/` under the shared catalog route. See [page-content.md](page-content.md). `display_order` controls catalog ordering. Public dates come from the registry. See [tool-catalogs.md](tool-catalogs.md).
- Link to the canonical flat route for every included page.
- When several pages share navigation and active states, the catalog owns them.
- Don't put third-party software, hardware records, courses, or stable fact tables here.

## Directories

Directories help someone find, compare, or look up things: third-party software and hardware, platforms, and stable facts such as codes, licenses, TLDs, and keyboard shortcuts. The self-host apps, CLI apps, TLD directory, and EPP status codes all belong here. There is no separate reference family.

A directory page's introduction and sections live in `content/*.mdx` beside its route. Its title and card text live in `stack127_directory_pages`, the same way a tool's live in `stack127_tool_pages`. See [directory-pages.md](directory-pages.md). Published, indexable child pages, such as `/ad-networks/<slug>`, get their own row.

Directory records live in one of two places. Decide which in the directory's brief when you create it.

| Records | Where |
| --- | --- |
| Small, edited by hand, rarely change | Code, next to the route or in `lib/` |
| Large, or updated by a script | A database table for that directory |

The hardware and smart home directories, such as cameras, coordinators, UPS models, and smart home devices, are also directories. They're still published but get no new work. See [product-direction.md](product-direction.md).

Directory routes live under `app/(site)/(directories)/`. Shared directory controls live in `app/ui/directories/`.

- Use the shared directory header, controls, spacing, filter components, `Pagination`, `DetailDialog`, and `StatePanel` where they fit.
- Use cards when each result has several facts and its own identity.
- Use a table when people compare the same short fields across many rows.
- Use prose for explanation and anchored sections for scanning a long page. Put section links in a right sidebar.
- Keep filters in a left sidebar on wide screens and in the existing drawer on small screens. A directory with no filters or sections doesn't need a sidebar.
- Don't show crawler records, import state, editorial status, or other maintenance details.

The page is static and shows the default view: first page, default sort, no filters. Filters, search, sort, and pagination run in a client component, and their query URLs stay `noindex`. A view worth indexing, such as a category, gets its own path. Read `stack127_docs/caching.md`.

## Courses

Courses teach a path in a fixed order.

| Part | Lives in |
| --- | --- |
| Course copy and author | `public.stack127_course_pages` |
| Lesson titles, sidebar labels, and order | `public.stack127_course_lessons` |
| Cached server reader | `lib/course-pages.ts` |
| Visible lesson shell | `app/ui/courses/course-shell.tsx` |

The course registry slug supplies its base path. Its content row holds `title`, `intro_markdown`, optional `content_markdown`, the four shared card fields, `author_name`, `author_avatar_url`, and `navigation_label`. Each lesson row links its registry page to the course with `course_page_id` and holds `title`, `sidebar_label`, and `display_order`. Titles use `<mark>` for an accent. The landing page is also the first lesson.

Registry `is_published` controls lesson links. Unpublished lessons stay in the sidebar with a "soon" label. Each lesson file keeps its JSX body and visuals. For a meaningful JSX edit, put `touch_reason` on that lesson in a reviewed course publisher plan. The publisher freezes its previous date and skips the touch on retry. `getRequiredCourse` reads one cached snapshot with the `stack127-course-pages` tag. Course and lesson changes queue all course routes because their headers and navigation share those definitions.

The shell uses each lesson's registry `updated_at`. Different course copy moves the course date. Different lesson copy moves that lesson's date. Identical updates leave public dates alone. Initial migration seeds preserve existing dates; any missing registry rows start unpublished with null dates.

The sidebar shows the path. The footer shows the previous and next published lessons. A lesson must still make sense to someone who arrives from search without reading the earlier lessons.

## Tools

Tools help someone answer one concrete question. The page order:

1. Title and introduction.
2. One clearly framed interface. Results stay in that frame or connect to it directly.
3. Supporting guidance, in the shared prose rhythm.

Tool routes live under `app/(site)/(tools)/`. The interactive part and the page content stay in code: the introduction, usage, and article are MDX files beside the route. The title, version, and card fields live in `public.stack127_tool_pages`. Read `stack127_docs/tool-pages.md` before you change tool content or a tool version.

Every tool sits in its own flat folder, `app/(site)/(tools)/<slug>/`. There are no tool family route groups. Each tool page renders its shell and left sidebar through `ToolPageShell`. Code shared by a tool family, such as DNS diagnostics or the domain lookup client, lives in `app/ui/tools/<family>/`. Shared tool shells live in `app/ui/tools/`.

The tool page is static. Values from a shared link are read in a small client wrapper with `useInitialQuery()` from `app/ui/tools/use-initial-query.ts`, never from the server page. Read `stack127_docs/caching.md`.

Use neutral borders, calm background changes, and useful diagrams. Don't scatter inputs or results across unrelated cards. Don't show runtime, fixture, crawler, draft, registry, or deployment terms unless the tool is about those things.

## Site pages

Site pages are the homepage, `/about`, `/privacy`, `/terms`, and `/labs`. They live under `app/(site)/(site-pages)/` and use `page_family = 'site'`. They have no family table. Their words are in the route's TSX and move to MDX later.

About, privacy, terms, and Labs use `InfoPage`: generous spacing, useful icons, restrained borders, short descriptions, and obvious actions. Its sidebar links between the site pages. Text pages use the shared reading width. Labs stays wide.
