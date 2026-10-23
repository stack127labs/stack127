# Shared UI

Use the components in `app/ui/` across tools, directories, catalogs, courses, references, and other pages.

The Components UI gallery is at `/components-ui` in development. That route returns 404 in production. Use [writing-style.md](writing-style.md) for words and visual choices, and [design-system.md](design-system.md) for tokens and layout.

## Pick an existing component

| Need | Component |
| --- | --- |
| Text, search, dates, numbers, choices, sliders, and actions | `app/ui/controls.tsx` |
| File selection and file lists | `app/ui/uploads.tsx` |
| Results, metrics, key-value lists, tables, progress, allocation bars, range markers, unit grids, steps, and timelines | `app/ui/display.tsx` |
| Interactive charts on pages | `UiChart` in `app/ui/charts/chart.tsx` |
| Charts nobody needs to interact with, such as in articles | `UiStaticChart` in `app/ui/charts/chart-static.tsx` |
| Charts of data computed in the browser, such as tool results | `UiLiveChart` in `app/ui/charts/chart-client.tsx` |
| Notes, warnings, and recommendations | `Callout`, `Note`, `Warning`, `Tip` in `app/ui/callout.tsx` |
| Formulas and worked examples | `ContentBlock` in `app/ui/content-block.tsx` |
| Empty, loading, and error panels | `StatePanel` in `app/ui/state-panel.tsx` |
| Breadcrumbs above a page title | `getBreadcrumbs` or `getToolBreadcrumbs` in `lib/breadcrumbs.ts`, passed to `PageHeader`'s `breadcrumbs` |
| URL-based page navigation | `Pagination` in `app/ui/pagination.tsx` |
| A section's 3 to 6 main pages | `SectionBar` in `app/ui/site/section-bar.tsx`, through `AppShell`'s optional `sectionNav`. Pass `label`, home `href`, active `current` href, and `items` with `label` and `href`. |
| Detail drawer with focus and close behavior | `DetailDialog` and `DetailDialogClose` in `app/ui/detail-dialog.tsx` |
| FAQ with repeated questions | `Faq` in `app/ui/faq.tsx` |
| Scrollable table region | `TableFrame` in `app/ui/table-frame.tsx` |
| Tabs that search engines and find-in-page can read | `UiTabs` in `app/ui/tabs.tsx` |
| A stats report: question groups, side-by-side blocks, headline numbers, ranked bars | `Report`, `ReportGroup`, `ReportRow`, `ReportBlock`, `ReportNumbers`, `ReportFigure`, `ReportBars` in `app/ui/report.tsx` |
| Search, select, and switch controls beside a section heading, and the large hero search box | `TableToolbar`, `ToolbarSearch`, `ToolbarSelect`, `ToolbarSwitch` in `app/ui/table-toolbar.tsx` |
| Server-drawn data visuals: ranked bars, stacked bars, donut, columns, lines, flows, strips, treemap, heatmap, timelines | `app/ui/ad-networks/viz/`. See [Data visuals](#data-visuals). |
| Ad network parts: logo tile, network card, sections, details, sites, niches, ladder, and site view | `app/ui/ad-networks/`. See [Ad network parts](#ad-network-parts). |
| Page content blocks in MDX | `mdx-components.tsx`, built on `app/ui/content-elements.tsx`. See [page-content.md](page-content.md). |
| Page shell, headings, prose, media, code, and navigation | `app/ui/site/` |
| Linked page cards for tools, catalogs, directories, the course, and Labs | `PageCard`, `ToolCard`, `CatalogCard`, `DirectoryCard` in `app/ui/cards/` |
| Software and hardware record cards, and directory filters | `app/ui/directories/` |
| Tool catalog grid and navigation | `app/ui/catalogs/` |
| Course and directory layouts | `app/ui/courses/` and `app/ui/directories/` |
| Shared tool layouts and styles | `app/ui/tools/` |

`app/ui/site/` holds the shared shell, `PageCanvas`, `PageHeader`, `EntryHero`, `InfoPage`, prose classes, `MediaFigure`, `CodeBlock`, and `MarkerArt`. Next.js route files, the global stylesheet, and the marker-art registry stay directly under `app/`.

Callouts and formula or example blocks use compact spacing. They cap themselves at the prose width, even inside a wide tool header. Use the shared component instead of adding route-specific block padding or width.

Import only what the page needs. For example:

```tsx
import { UiTextField } from "@/app/ui/controls";
import { UiDataTable } from "@/app/ui/display";
import { Callout } from "@/app/ui/callout";
```

The gallery is the component library. It groups components by what they do, not by the page family that first used them, because any page can use any component. Its sidebar links one page per section: text and choices, numbers and sliders, actions and forms, file uploads, filters and sorting, results, tables, charts, data visuals, cards, content, prose, media and art, feedback and dialogs, navigation, and page layout. `/components-ui` lists every section and its components. Page layout links to real pages for full layouts, and to `/components-ui/sidebar-modes/left`, `/right`, and `/none`, which show the real shell with each sidebar position. The TypeScript props beside each component are the full API. The table above helps you pick the right one.

To add a component to the gallery, add an `Example` to the matching file in `app/(site)/(components-ui)/components-ui/examples/` and add its name to that section in `sections.ts`. Add a new section only when no existing type fits.

Show each look once. When a thin wrapper renders the same thing as another component, such as `ToolCard` over `PageCard`, list both names on one example instead of drawing the card twice. A component content can use gets a `usage` snippet with the MDX to write.

### When to add a component

- Use the existing component when its behavior fits.
- Page copy and content pages use existing components only.
- New or extended shared components come from a tool's build step, when more than one page type needs them.
- Keep calculations, data sources, and unusual interactions with the page or tool that owns them.
- Static displays go in server-renderable modules. Interactive controls go in client modules.

## Tool inputs and results

These pieces carry the rules in [tool-interface.md](tool-interface.md): simple Basic inputs, optional Advanced inputs, no text under fields, and personal visual results.

| Need | Use |
| --- | --- |
| The tool's band, working width, field rows, and result region | `ToolWorkbench`, `ToolFieldRow`, and `ToolResult` in `app/ui/tools/tool-workbench.tsx`. Every tool uses them instead of its own workbench CSS. `ToolResult stale` turns a result's visuals gray when its inputs changed; pair it with an `Inputs changed` status. |
| A required field | The `required` prop on any field, choice group, or select. It shows `*` beside the label, and screen readers hear `Required`. |
| Explain a label in one sentence | The `hint` prop on any field, choice group, select, slider, or date control. It draws a small `?` beside the label. The sentence shows on hover, keyboard focus, and tap, and screen readers hear it as the field's description. |
| Optional refinements | `UiDisclosure` below the Basic inputs, named for what's inside. Pass `summary={uiSetSummary(count)}` so the closed row says `Not used` or `2 set`. Control `isExpanded` to open it when a field inside has an error. |
| Your value against a published range | `UiRangeMarker` in `app/ui/display.tsx`. It draws a neutral track, the published bands, and a `You` marker. It never grades. Each band can carry a `hint` naming its source. An optional `range` draws where the person's own value probably sits, such as a likely range at a small sample size. Its legend is a vertical list, one row per range with its value on the right. |
| A share of people or items, such as 8 of every 100 who started a trial | `UiUnitGrid` in `app/ui/display.tsx`. It fills units out of 100, row by row, with a partly filled last unit. An optional `target` outlines the units up to a goal. |
| Supporting result numbers | `UiMetricGroup` in `app/ui/display.tsx`. The default lays numbers out in columns. `layout="list"` gives one row per number, label on the left and value on the right, for numbers people read down. Each item can carry a `hint`. |
| A link that reopens the tool with the same inputs | `UiShareAction` in `app/ui/controls.tsx`. Pass the inputs as `params`. It copies the link without changing the address bar, and falls back to a selectable link when copying fails. |

Don't use `description` on tool fields. It stays for forms outside tools, such as feedback forms, where a visible line under the field is the right choice.

## Navigation and feedback

`Pagination` takes `currentPage`, `totalPages`, an accessible `ariaLabel`, and `hrefForPage(page)`. The page owns the URL builder, so active filters and sorting stay in the links. Page one uses the clean listing URL. Previous and next turn into inactive text at the ends. `variant="words"` shows `Previous` and `Next` in words, each only when there is a page to go to, as in the ad networks sites table.

`DetailDialog` handles Escape, outside pointer presses, keyboard focus, body scrolling, and focus return. Put the page-specific heading and facts inside it, with `DetailDialogClose` in the heading. The page stores which item is selected. The dialog owns the shared behavior.

`StatePanel` takes `state="empty"`, `"loading"`, or `"error"`, a clear title, a useful explanation, and an action when the person can recover.

| Message | Use |
| --- | --- |
| Empty, loading, or error panel | `StatePanel` |
| A tool's changing status message | `UiStatus` |
| Static editorial warning | `Warning` or `Callout`. These aren't live alerts. |

## Tabs

`UiTabs` takes an accessible `label` and `tabs`, each with an `id`, a `title`, and server-rendered `content`. Every panel is in the page HTML under its own heading (`headingLevel`, h3 by default), so search engines read every panel and the page works without scripts. After hydration the tab row appears, the panel headings hide visually, and inactive panels get `hidden="until-found"`. Find-in-page still reaches hidden text and opens its tab through `beforematch`. Arrow keys, Home, and End move between tabs. Use tabs only for parallel sets of facts a reader picks between, such as Joining, Pay, Rules, and Service. Long reading content stays as prose.

## Reports

`app/ui/report.tsx` lays out stats pages: a `Report` with an optional h2 title and a mono note, then `ReportGroup`s headed by the question each answers, split by hairlines. A `ReportRow` puts related `ReportBlock`s side by side and stacks them on phones: `1-1`, `2-1`, `1-1-1` (two columns on tablets, third block below), or `2-1-1` (a wide block, then two narrow ones). A row left with one block takes the full width. Each block has a short mono `label` and a one-line `description`, then a visual from [Data visuals](#data-visuals). `ReportNumbers` shows up to four headline numbers between hairlines (`ruled`, label above) or up to three loose inside a block (`plain`, value above). `ReportFigure` is one big number with a note. `ReportBars` is `RankedBars` with the report's names; `tone="current"` highlights one row.

Where data isn't collected yet, hide the block, row, or group. Don't print a "not collected yet" line and never fill a block with sample numbers.

## Data visuals

`app/ui/ad-networks/viz/` holds the data visuals approved in the ad networks mockups (`dev-space/ad-networks-mockups/`). The ad networks section uses these, not ECharts. Any page may use them when the shape fits. They take plain data as props and hold no sample data.

Each one renders on the server, so it shows without scripts and search engines read it. Small client code adds only hover, tap, arrow keys, the period switch, and a redraw at the box's real width so SVG text stays 12px. Before that redraw the server SVG scales to fit. Charts with 60 values or fewer carry a visually hidden data table. Colors come from the `.tokens` steps in `viz.module.css`: `ac`, `ac2`, `ac3` for accent strengths, `n1`, `n2`, `n3` for neutrals, and `track` for unknown. Each visual draws sensibly with one item. Hiding a visual with no items is the page's job.

| Component | File | Shows |
| --- | --- | --- |
| `RankedBars` | `bars.tsx` | Ranked bars with exact values. `tone="highlight"` fills only the page's own row. |
| `StackBar` | `bars.tsx` | Parts of one whole as a thin bar with a legend. |
| `MoveBars` | `bars.tsx` | Switches as `from → to`, a bar, and a count. |
| `VizLegend`, `VizDataTable` | `parts.tsx` | Swatch legend, and the hidden data table. |
| `Donut` | `donut.tsx` | Parts of a whole as a ring with a legend beside it. |
| `TypeScale` | `type-scale.tsx` | Labels sized by share, such as domain endings. |
| `PublisherBlocks` | `publisher-blocks.tsx` | Companies as blocks sized by site count. |
| `ColumnChart` | `columns.tsx` | One column per group, in HTML. Traffic groups, networks per site, file sizes. |
| `AreaLine` | `area-line.tsx` | One count over time with hover, tap, and arrow keys. |
| `JoinedLeftBars` | `joined-left.tsx` | Joined above and left below a line, with a 30 days / 90 days switch. Give a period `slots` and each point a `slot` when only days with changes are passed. |
| `SwitchFlow` | `switch-flow.tsx` | Where sites came from and went to. |
| `AgeStrip` | `age-strip.tsx` | Registration years: histogram, middle half, median, oldest, newest. |
| `SizeStacks` | `size-stacks.tsx` | One 100% bar per size group, split by network. |
| `NewestList`, `EventsList` | `lists.tsx` | Newest sites, and dated events. |
| `Treemap` | `treemap.tsx` | Parts of a whole as linked blocks. |
| `Heatmap` | `heatmap.tsx` | Rows by columns, darker for bigger values. |
| `MultiLine` | `multi-line.tsx` | A few series over time, named at the line ends. |
| `DivergingBars` | `diverging-bars.tsx` | Gains and losses around a center line. |
| `ScatterPlot` | `scatter-plot.tsx` | Items by a step on x and a count on y. |
| `DotPlot` | `dot-plot.tsx` | One value per row on a shared scale. |
| `StackedColumns` | `stacked-columns.tsx` | Totals over time with an accent part. |
| `HistoryGantt` | `history-gantt.tsx` | One bar per network across the years. |

## Ad network parts

`app/ui/ad-networks/` holds the other parts of the ad networks pages and the checker:

- `NetworkLogo` (`network-logo.tsx`): the square icon on a white tile, `card` (32px) or `title` (in an h1). Pass `networkLogo(slug)` from `network-logo-src.ts`, which finds `public/ad-networks/logos/<slug>.png` on the server. Without a file it shows the first letter.
- `NetworkCard`, `NetworkGrid`, `SortNote` (`network-card.tsx`): the directory card with the confirmed-share ring and its bubble, the four-across grid, and the line saying how cards are sorted. Leave `join` out to hide the card footer.
- `AdSection`, `SectionHead`, `SectionNote` (`section.tsx`): a section asked as a question, with optional controls and a one-line description. Sections in a row are split by a hairline.
- `DetailsLayout`, `KeyNumbers`, `FactsList`, `NotPublic`, `SourcesLine` (`details.tsx`): the network details area, used with `UiTabs`.
- `SitesTable` (`sites-table.tsx`): see [Tables](#tables).
- `NichesTable` (`niches-table.tsx`) and `NetworkLadder` (`network-ladder.tsx`): the niches list with search, network filter, and sort, and the networks on one niche with a most used / easiest to join switch.
- `SiteFacts`, `SiteNetworksTable`, `AdsTxtNumbers`, `AdsTxtPreview`, `SimilarSites`, `BlockSubheading` (`site-view.tsx`): the site view in the checker.
- `TrafficMeter` (`traffic-meter.tsx`): the five-step traffic meter and rank group.
- `site-format.ts`: shared site formats, such as domain age and traffic group words.

## Charts

Every chart in this section is Apache ECharts through one wrapper. Pass data; the wrapper draws it in the site style, in both themes. Give every chart a useful title. The ad networks section doesn't use ECharts: it uses the mockup visuals in [Data visuals](#data-visuals).

Any ECharts chart type can be used. The kinds below are already in the wrapper. When a different type shows the data better, such as a sunburst, boxplot, calendar, or pictorial bar, add it. See [Add a chart type](#add-a-chart-type).

| Component | Use |
| --- | --- |
| `UiChart` | Interactive charts on pages. The server draws the chart as SVG, so it shows before scripts load and search engines see it. The browser then adds hover, toggles, and ranges. |
| `UiStaticChart` | Charts drawn on the server only. It sends no chart script. Use it for articles and reference pages. |
| `UiLiveChart` | The same chart for data computed in the browser, such as a tool's result. Use it inside client components. It draws once the data exists. |

All three take a `spec`: the chart's `kind`, its data, a `title`, an optional `caption`, and a number `format`.

| `kind` | Shows |
| --- | --- |
| `line` | One or more series over time, numbers, or labels. |
| `area` | One series as a filled line. |
| `stacked-area` | Parts that add up to a total over time. |
| `bar` | A few values compared across categories. |
| `stacked-bar` | Parts of a total, per category. |
| `horizontal-bar` | Rankings and long category names. Values sit at the end of each bar. |
| `donut` | Parts of one total, with the total in the middle. |
| `scatter` | Two measures for each item. |
| `heatmap` | A value across two categories, such as hour and weekday. |
| `funnel` | Stages that narrow, in order, such as visitors to trials to paid. |
| `gauge` | One value against a scale, such as progress toward a goal. |
| `treemap` | Parts of a total as blocks. Better than a donut for many parts. |
| `sankey` | Amounts flowing from one group to the next, such as MRR movements. |
| `radar` | Several measures compared as shapes. |

`format` is `number`, `compact`, `bytes`, `currency`, `percent`, `date`, or `datetime`. Line and scatter charts also take `xFormat`. Line x values are dates as milliseconds, numbers, or labels. Labels give a category axis and are read by position: list every series' points in the same order. A label may repeat.

### Interactive or static

In `UiChart` and `UiLiveChart`, each series name toggles its line, and a dim name is off. Hover shows every visible value at that point. Time charts with `range` add range buttons, From and To dates, and a slider. Only ranges shorter than the data appear.

`UiStaticChart` draws on the server only and sends no chart script. Use it for articles and reference pages where nobody needs hover or ranges. Static charts sit at reading width. Its file never imports the interactive chart, so a page that uses only static charts loads no chart code.

Interactive charts load about 170 to 190 KB of compressed script on the pages that use them. Funnel, gauge, treemap, sankey, and radar load their extra script only on a page that draws one. Use a static chart unless hover, toggles, or ranges help the reader.

### Page weight

- Every server drawing goes into the page HTML twice: once as SVG and once for the browser. Lines and bars are small. Scatters and heatmaps draw one shape per point, so they get heavy fast.
- Thin long series on the server with `thinPoints` from `app/ui/charts/chart-data.ts`. It keeps the line's shape. About 2,000 points is plenty for any screen.
- Summarize data before a large scatter or heatmap. If a page needs every value, add a table or a download.
- Google reads only the first 2 MB of a page's HTML. The gallery's Charts section shows a page weight panel to check against.

### Accessibility

Charts with up to 60 values carry a visually hidden data table. Larger charts get a short description from their title, caption, and series names. When people need the exact numbers of a large chart, show a `UiDataTable` or a download next to it.

### Add a chart type

1. Register it. `app/ui/charts/echarts-more.ts` loads in the browser only for charts that need it, so most new types go there. Add the kind to `moreKinds` in `chart-option.ts`. Use `app/ui/charts/echarts.ts` only for a type most chart pages will draw.
2. Add its data shape, option, legend, and hidden data table in `app/ui/charts/chart-option.ts`.
3. Add a gallery example in the Charts section, and check it at desktop and mobile width in both themes.

Rules for every chart setting:

- Take every color from the `ink` and `seriesInk` placeholders in `chart-option.ts`. `charts.module.css` maps them to site tokens, which is how charts follow the theme. Gradients and rgba colors skip that mapping. Use opacity for lighter and darker.
- Turn off hover color changes with `emphasis: { disabled: true }`. ECharts would compute a new color outside the mapping. Tooltips stay on.
- Draw SVG only. A canvas can't follow the theme.
- Chart text uses the mono font. `echarts.ts` measures text by it, so labels never clip.
- Keep server and browser drawings the same: fixed `en-US` formats and UTC dates.
- Text drawn on colored shapes uses the `onShape` style, which outlines it in the page color so it reads in both themes.

## Tables

`UiDataTable` has row and column headers, an optional caption, and optional right alignment for number columns. It turns into labeled rows on small screens.

`SitesTable` in `app/ui/ad-networks/sites-table.tsx` lists ad network sites. The page passes the server-rendered first page as `initial`, its `defaultSort`, a fixed `scope` (`network` or `niche`), the `columns` and `sorts` to show, and optional `nicheFilter` and `networkFilter`. The response's `availableColumns`, `availableSorts`, and `availableFilters` hide anything with no data yet, and the sort select hides when one option is left. Search, filters, sort, and pages fetch the cached `/api/ad-networks/sites` route and keep their state in the URL, such as `?q=&niche=&page=2`. On phones each row becomes a two-line block.

`ToolbarSelect` is built on React Aria, so there is no native `<select>`. Like a native select it is as wide as its longest option.

Content tables written in Markdown use a scrollable `TableFrame`. Keep tables readable at mobile width. Let wide identifiers scroll instead of breaking every word.

## Steps and timelines

`UiSteps` shows ordered stages and which one is done, current, or next. `UiTimeline` shows dated events. Use a timeline only when its axis is time. `UiAllocationBar` shows parts of a total and is often easier to compare than a donut. Its `neutral` palette suits a two-part split, `accent` puts focus on one part, and `categorical` keeps three or more parts distinct. Never color parts red, yellow, or green by position, because that implies a verdict.

## Content blocks

Page content is MDX beside each route. [page-content.md](page-content.md) lists every block content can use and how to write it: notes, warnings, tips, formulas, examples, terms, charts, data tables, and marker art. `mdx-components.tsx` maps them to the shared elements in `app/ui/content-elements.tsx`, so every page renders them the same way.

- Use a note for context, a warning for something that can cost money, data, or time, and a tip for a recommendation.
- Give a formula or example one clear home instead of repeating it around the page.
- Ordinary lists and headings are still the right choice for steps and related links. A plain `>` blockquote renders as a quote.
- Fenced code with an optional language, such as `bash`, uses the shared copyable `CodeBlock`. Inline code stays inline.
- Use a Markdown table for simple rows. Use `UiDataTable` when rows need headers or labeled rows on phones.
- Draw a chart with `<UiStaticChart spec={…} />`, using the spec from [Charts](#charts). Use `UiChart` only when the reader needs hover, toggles, or ranges.
- Embed approved marker art with `<MarkerArt figure="catalog/zfs-capacity" alt="…" />`. The figure must be registered in `app/marker-art-registry.json`.

`ContentMarkdown` in `app/ui/content-markdown.tsx` renders pages whose content is still in the database: course pages, the ad network pages, and pages not yet moved to MDX. It uses the same elements, so moved and unmoved pages look the same. It isn't in the gallery, because new content is MDX. Remove it once nothing renders database content.

## Check a change

Open a representative page at desktop and mobile width, in both themes. Check:

- Keyboard focus.
- Long labels.
- Empty and error states.
- Whether the content still reads in order.

A shared component change needs checks on the page types that use it. The gallery helps you inspect variants, but the real page is the final check.
