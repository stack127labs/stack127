# Shared UI

Use the components in `app/ui/` across tools, directories, catalogs, courses, references, and other pages. The Components UI gallery is at `/components-ui` in development; that route returns 404 in production. Use [writing-style.md](writing-style.md) for words and visual choices, and [design-system.md](design-system.md) for tokens and layout.

## Pick an existing component

| Need | Component |
| --- | --- |
| Text, search, dates, numbers, choices, sliders, and actions | `app/ui/controls.tsx` |
| File selection and file lists | `app/ui/uploads.tsx` |
| Results, metrics, key-value lists, tables, progress, allocation bars, and timelines | `app/ui/display.tsx` |
| Bar, line, donut, and process charts | `app/ui/visuals.tsx` |
| Notes, warnings, and recommendations | `Callout`, `Note`, `Warning` in `app/ui/callout.tsx` |
| Formulas and worked examples | `ContentBlock` in `app/ui/content-block.tsx` |
| Empty, loading, and error panels | `StatePanel` in `app/ui/state-panel.tsx` |
| URL-based page navigation | `Pagination` in `app/ui/pagination.tsx` |
| Detail drawer with focus and close behavior | `DetailDialog` and `DetailDialogClose` in `app/ui/detail-dialog.tsx` |
| FAQ with repeated questions | `Faq` in `app/ui/faq.tsx` |
| Scrollable table region | `TableFrame` in `app/ui/table-frame.tsx` |
| Markdown content | `ContentMarkdown` in `app/ui/content-markdown.tsx` |
| Page shell, headings, prose, media, code, and navigation | `app/ui/site/` |
| Software, hardware, and directory cards and filters | `app/ui/directories/` |
| Tool catalog cards and navigation | `app/ui/catalogs/` |
| Course and reference layouts | `app/ui/courses/` and `app/ui/references/` |
| Shared tool layouts and styles | `app/ui/tools/` |

`app/ui/site/` holds the shared shell, `PageCanvas`, `PageHeader`, `EntryHero`, `InfoPage`, prose classes, `MediaFigure`, `CodeBlock`, `Chart`, and `MarkerArt`. Next.js route files, the global stylesheet, and the marker-art registry stay directly under `app/`.

Callouts and formula/example blocks use compact spacing and cap themselves at the prose width, including inside a wide tool header. Use the shared component instead of adding route-specific block padding or width.

Import only what the page needs. For example:

```tsx
import { UiTextField } from "@/app/ui/controls";
import { UiDataTable } from "@/app/ui/display";
import { Callout } from "@/app/ui/callout";
```

The development gallery shows reusable controls, results, content blocks, cards, and directory filters. It links to real pages for full layouts. The TypeScript props beside each component are the full API; the table above helps choose the right one.

Use the existing component when its behavior fits. Page copy and content pages use existing components only. New or extended shared components come from the Opus planning step for a tool, when the need is shared across page types. Keep calculations, data sources, and unusual interactions with their owning page or tool. Static displays belong in server-renderable modules; interactive controls live in client modules.

## Navigation and feedback

`Pagination` takes `currentPage`, `totalPages`, an accessible `ariaLabel`, and `hrefForPage(page)`. The page owns the URL builder so active filters and sorting stay in the links. Page one uses the clean listing URL. Previous and next become inactive text at the ends.

`DetailDialog` handles Escape, outside pointer presses, keyboard focus, body scrolling, and focus return. Put the page-specific heading and facts inside it. Use `DetailDialogClose` in the heading. A page stores which item is selected; the dialog owns the common behavior.

`StatePanel` accepts `state="empty"`, `"loading"`, or `"error"`, a clear title, useful explanation, and an action when a person can recover. A tool's changing status message uses `UiStatus` instead. Static editorial warnings use `Warning` or `Callout`; they are not live alerts.

## Charts and tables

Use a clean chart for measured values. `UiBarChart` compares nonnegative categories. `UiLineChart` shows one series. It spaces categories evenly by default; set increasing numeric `xValue` values to use a measured or time axis. Long series scroll on small screens so labels stay readable. `UiDonutChart` shows nonnegative parts of one total. `UiAllocationBar` often makes parts of a total easier to compare. `UiFlowChart` and `UiTimeline` show ordered stages. Give every chart a useful title and visible values; the line chart also has a screen-reader table.

Generated static SVG bar and line charts remain available through `*.chart.json`, `npm run stack127:clean-charts`, and `Chart`. Use them when a page owns an exact, static figure. Marker art explains concepts and rough relationships.

`UiDataTable` has row and column headers, an optional caption, and optional right alignment for numeric columns. It turns into labeled rows on small screens. Markdown tables use a scrollable `TableFrame`. Keep tables readable at mobile width; let wide identifiers scroll instead of breaking every word.

## Markdown on content pages

Use `ContentMarkdown` wherever a page renders stored or authored Markdown. It keeps the same links, tables, code, callouts, charts, and marker art across page types. The tool-page renderer already uses it. Ordinary lists and headings remain the right choice for steps and related links.

### Notes, warnings, formulas, and examples

Write a callout as a blockquote with a type on its first line. A short title after the type is optional.

```md
> [!NOTE] About this estimate
> This figure assumes the same unit for every input.

> [!WARNING] Before changing disks
> Back up the data you need to keep.

> [!FORMULA] Percentage used
> `used ÷ total × 100`

> [!EXAMPLE] A 20 TB pool
> If 5 TB is used, the pool is 25% full.
```

`[!TIP]` uses the recommendation style. Standard blockquotes still render as quotes. Use one clear home for a formula or example instead of repeating it around the page.

### Code and tables

Use normal fenced code with an optional language, such as `bash`, and normal GitHub-flavored Markdown tables. Fenced code uses the shared copyable `CodeBlock`. Ordinary inline code remains inline.

### Data charts

Use a `chart-bar`, `chart-line`, or `chart-donut` code fence containing JSON. Give the chart a title, optional caption, and data with unique IDs, labels, and finite numeric values. Bar and donut values must be nonnegative. Line points also need `xLabel` and the chart needs `valueLabel`. Add increasing numeric `xValue` values when time gaps or numeric spacing matter.

````md
```chart-bar
{"title":"Requests by service","caption":"Same 15-minute sample.","data":[{"id":"api","label":"API","value":50},{"id":"worker","label":"Worker","value":30}]}
```
````

An invalid chart shows a readable error in the page, so the writer can fix its data. These fences render as server output. They do not execute arbitrary code or JSX.

Approved marker art keeps its image reference format, such as `![How the pool is assembled](marker-art://catalog/zfs-capacity)`. The registry accepts known figures only. Raw HTML does not render.

## Check a change

Open a representative page at desktop and mobile widths in both themes. Check keyboard focus, long labels, empty and error states, and whether the content still reads in order. A shared component change needs checks on the page types that use it. The gallery helps inspect variants, but the real page is the final check.
