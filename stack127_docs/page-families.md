# Page families

stack127 has seven page families. They share the site shell, canvas, title treatment, reading
rhythm, and design tokens. They do not pretend every kind of page has the same job.

URLs stay short and flat. A tool can live at `/dns-lookup`, a directory at `/cli-apps`, a catalog
at `/dns-tools`, and a course at `/self-hosting-for-beginners`. Words such as `tools`, `directories`,
`catalogs`, or `courses` are not required
URL prefixes.

Source ownership uses non-URL route groups:

```text
app/(site)/(catalogs)/
app/(site)/(courses)/
app/(site)/(directories)/
app/(site)/(legal)/
app/(site)/(references)/
app/(site)/(tools)/
```

The group names organize the repository and never appear in public URLs.

## Shared structure

Every page uses the shared site navigation and `AppShell`. New pages use `PageCanvas` for outer
width and spacing when the family does not already provide a deliberate full-width shell. Visible
titles and introductions use `PageHeader`. Reading content uses the classes exported by
`app/prose.ts` so heading and paragraph rhythm comes from one place.

Do not add eyebrows, kickers, overlines, decorative labels, repeated summaries, or implementation
notes to the public interface. Labels are useful only when they help someone operate a control,
read metadata, or understand a table.

## Catalogs

Catalogs combine stack127-owned pages in one place. `/dns-tools`, `/domain-tools`, and
`/storage-tools` are catalogs because their entries lead to stack127 tools. A catalog organizes
discovery but does not own the child pages or their URL namespace.

Catalog routes live under `app/(site)/(catalogs)/`.

- Link to the canonical flat route for every included page.
- Keep shared navigation and active states owned by the catalog when several pages use them.
- Do not place third-party software, hardware records, courses, or stable fact tables here.

## Directories

Directories help someone find and compare third-party software or hardware. Self-hosted apps and
terminal apps belong here.

Directory routes and their shared controls live under `app/(site)/(directories)/`.

- Use the shared directory header, controls, spacing, and filter components.
- Use cards when each result has several facts and an identity of its own.
- Use a table when people compare the same compact fields across many rows.
- Keep filters in the sidebar on wide screens and in the existing drawer on small screens.
- Do not expose crawler records, import state, editorial status, or other maintenance details.

## Courses

Courses teach a path in a fixed order. Course definitions use `lib/courses.ts`; the visible lesson
shell lives in `app/(site)/(courses)/_components/course-shell.tsx`. A course owns its title, base
path, author, lesson list, and navigation label. Individual lesson files own only their lesson
content and earned visuals.

The sidebar shows the path. The footer shows the previous and next published lessons. A lesson
must still make sense when someone arrives from search without reading the earlier lessons.

## Tools

Tools help someone answer one concrete question. The title and introduction come first, followed
by one clearly framed interface. Results remain in that frame or connect to it directly.
Supporting guidance follows with the shared prose rhythm.

Tool routes live under `app/(site)/(tools)/`. Their interactive system remains in code. Their title,
introduction, and supporting Markdown live in `public.stack127_tool_pages` and render through the
shared server content layer. Read `stack127_docs/tool-pages.md` before changing tool content or a
tool version.

Use neutral borders, calm background changes, and useful diagrams. Do not scatter inputs or results
across unrelated cards. Do not show runtime, fixture, crawler, draft, registry, or deployment terms
unless the tool itself is explicitly about those concepts.

## References

References help someone retrieve or compare stable facts. They are not a tool family and do not
receive a `stack127_tool_pages` record. Reference routes live under `app/(site)/(references)/`.
Use prose for explanation, tables for repeated fields, and anchored sections for scanning.
Keyboard shortcut tables, software license comparisons, EPP status codes, and the TLD directory
belong here.

## Info pages

Labs uses `InfoPage` as a composed project page: generous spacing,
useful icons, restrained borders, short descriptions, and obvious actions. Copy that structure when
it improves comprehension, not as decoration.

## Legal pages

About, privacy, and terms live under `app/(site)/(legal)/`. They use the shared reading system and
remain ordinary flat routes such as `/about`, `/privacy`, and `/terms`.
