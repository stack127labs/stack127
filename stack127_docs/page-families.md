# Page families

stack127 has four content families and one family for the site's own pages. They share the site shell, canvas, title treatment, reading rhythm, and design tokens. They don't pretend every kind of page has the same job.

| Family | `page_family` | Route group | Page table |
| --- | --- | --- | --- |
| Tool | `tool` | `(tools)` | `stack127_tool_pages` |
| Directory | `directory` | `(directories)` | `stack127_directory_pages` |
| Course | `course` | `(courses)` | Course definitions in `lib/courses.ts` |
| Catalog | `catalog` | `(catalogs)` | `stack127_catalog_pages` |
| Site page | `site` | `(site-pages)` | None |

The family name is the same in the database, the route group, and the code. `public.stack127_pages` is only the registry for URL, publication, SEO, and dates. Each family table holds that family's own columns.

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

- Every page uses the shared site navigation and `AppShell`, including its sidebar. The sidebar holds options, links between related pages, or links to page sections. It never holds reading content. See Sidebars in [design-system.md](design-system.md).
- All page families use `PageCanvas` and the same responsive gutters.
- Text-led pages use its 760px reading width. Directories, tool workbenches, tables, and card grids stay wide. Both widths start at the same left edge.
- `EntryHero` uses the canvas inside it, so entry headers and body sections line up. Don't nest canvases.
- Visible titles and introductions use `PageHeader`.
- Reading content uses the classes exported by `app/ui/site/prose.ts`, so heading and paragraph rhythm comes from one place.

Use [writing-style.md](writing-style.md) for all public wording and visual choices. Use [shared-ui.md](shared-ui.md) for common controls, tables, charts, callouts, pagination, dialogs, and Markdown content. Keep family-specific data and unusual interactions in their own route.

## Catalogs

Catalogs gather stack127's own pages in one place. `/dns-tools`, `/domain-tools`, and `/storage-tools` are catalogs because their entries lead to stack127 tools. A catalog helps people find pages. It doesn't own the child pages or their URLs.

Catalog routes live under `app/(site)/(catalogs)/`.

- Catalog copy and cards live in `stack127_catalog_pages`. See [tool-catalogs.md](tool-catalogs.md).
- Link to the canonical flat route for every included page.
- When several pages share navigation and active states, the catalog owns them.
- Don't put third-party software, hardware records, courses, or stable fact tables here.

## Directories

Directories help someone find, compare, or look up things: third-party software and hardware, platforms, and stable facts such as codes, licenses, TLDs, and keyboard shortcuts. The self-host apps, CLI apps, TLD directory, and EPP status codes all belong here. There is no separate reference family.

A directory page's title, intro, Markdown content, and card text live in `stack127_directory_pages`, the same way tool copy lives in `stack127_tool_pages`. See [directory-pages.md](directory-pages.md). Published, indexable child pages, such as `/ad-networks/<slug>`, get their own row.

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
- Use prose for explanation and anchored sections for scanning a long page. Put section links in the sidebar.
- Keep filters in the sidebar on wide screens and in the existing drawer on small screens.
- Don't show crawler records, import state, editorial status, or other maintenance details.

The page is static and shows the default view: first page, default sort, no filters. Filters, search, sort, and pagination run in a client component, and their query URLs stay `noindex`. A view worth indexing, such as a category, gets its own path. Read `stack127_docs/caching.md`.

## Courses

Courses teach a path in a fixed order.

| Part | Lives in |
| --- | --- |
| Course definitions | `lib/courses.ts` |
| Visible lesson shell | `app/ui/courses/course-shell.tsx` |

A course owns its title, base path, author, lesson list, and navigation label. Each lesson file owns only its lesson content and the visuals it needs.

The sidebar shows the path. The footer shows the previous and next published lessons. A lesson must still make sense to someone who arrives from search without reading the earlier lessons.

## Tools

Tools help someone answer one concrete question. The page order:

1. Title and introduction.
2. One clearly framed interface. Results stay in that frame or connect to it directly.
3. Supporting guidance, in the shared prose rhythm.

Tool routes live under `app/(site)/(tools)/`. The interactive part stays in code. The title, introduction, and supporting Markdown live in `public.stack127_tool_pages` and render through the shared server content layer. Read `stack127_docs/tool-pages.md` before you change tool content or a tool version.

DNS, domain, and storage tools sit under route groups inside `(tools)`. Each group layout owns its sidebar and shell, so moving between tools in that family replaces only the page content. Code shared by one group, such as DNS diagnostics or the domain tools sidebar, lives in that group folder. Shared tool shells live in `app/ui/tools/`.

The tool page is static. Values from a shared link are read in a small client wrapper with `useInitialQuery()` from `app/ui/tools/use-initial-query.ts`, never from the server page. Read `stack127_docs/caching.md`.

Use neutral borders, calm background changes, and useful diagrams. Don't scatter inputs or results across unrelated cards. Don't show runtime, fixture, crawler, draft, registry, or deployment terms unless the tool is about those things.

## Site pages

Site pages are the homepage, `/about`, `/privacy`, `/terms`, and `/labs`. They live under `app/(site)/(site-pages)/` and use `page_family = 'site'`. They have no family table.

About, privacy, terms, and Labs use `InfoPage`: generous spacing, useful icons, restrained borders, short descriptions, and obvious actions. Its sidebar links between the site pages. Text pages use the shared reading width. Labs stays wide.
