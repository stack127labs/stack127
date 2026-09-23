# Stack127 Design System

Use [writing-style.md](writing-style.md) for public wording and visual choices. This document covers the rendered design and its components.

Stack127 is simple, minimal, and playful: warm near-black by default, one loud chartreuse accent used sparingly, Space Grotesk headings over Inter body text, exactly two body text sizes, monochrome icons, and hand-drawn marker art. Playfulness lives in the type, the art, and the one accent — never in extra boxes, tints, or decoration.

## Tokens

The source tokens live in `app/globals.css`. Component and page selectors do not; follow `stack127_docs/css-architecture.md` for style ownership.

Use the semantic names for new UI:

| group | tokens |
| --- | --- |
| Color | `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-border-strong` |
| Accent | `--color-accent` (fills only), `--color-accent-text` (accent-colored text), `--color-accent-contrast` (text on accent fills), `--color-link` |
| Status | `--color-success-text`, `--color-warning-text`, `--color-danger-text` — text colors only, never backgrounds |
| Data | `--color-data-chartreuse`, `--color-data-cyan`, `--color-data-blue`, `--color-data-yellow`, `--color-data-red`, `--color-data-violet`, `--color-data-green` — chart and allocation fills only |
| Type | `--font-display`, `--font-sans`, `--font-mono`, `--text-body`, `--text-small`, `--line-body`, `--line-heading`, `--tracking-display`, `--weight-regular`, `--weight-semibold`, `--weight-bold` |
| Headings | `--text-h1` + `--line-h1`, `--text-h2`, `--text-h3` |
| Space | `--space-1` through `--space-14`, `--measure-prose` |
| Radius | `--radius` (2px for every bounded UI shape) |
| Effects | `--focus-ring`, `--motion-fast`, `--motion-base` |
| Layout | `--container-gutter`, `--page-padding-top`, `--page-padding-bottom`, `--top-bar-height`, `--sidebar-width` |

The previous token scale (`--text-sm`, `--color-accent-soft`, `--shadow-card`, and similar) has been removed. All CSS uses the semantic tokens above; a token that is not in this table does not exist.

## Color rules

- The accent is a spotlight, not a paint bucket. Per view, `--color-accent` fills at most: the h1 mark phrase, one primary button, the active pagination page, the focus ring, and the active tab underline. Everything else that wants attention uses `--color-accent-text` or a border.
- Text on an accent fill always uses `--color-accent-contrast`. Never white on chartreuse.
- Accent-colored text always uses `--color-accent-text`; raw `#bafc3c` fails contrast as text on the light background.
- Semantic color only colors words, and only when the meaning is real: `--color-success-text`, `--color-warning-text`, `--color-danger-text`. No tinted panels, no colored left edges, no badge soup.
- Data colors encode categories in charts and allocation figures. They never imply success, warning, or danger on their own, and they never replace labels or exact values.
- Muted text is the exception, not the default. `--color-text-muted` is reserved for true annotations: mono metadata rows, captions, timestamps, counts, and sidebar helper text. Card descriptions, ledes, section notes, and all reading copy use `--color-text`.

## Typography

Three fonts, each with one job: `--font-display` (Space Grotesk) speaks in headings and titles, `--font-sans` (Inter) carries every sentence, `--font-mono` (IBM Plex Mono) handles data, metadata, and code.

Body text has exactly two sizes on the whole site:

| purpose | token | value |
| --- | --- | --- |
| Base — everything | `--text-body` | `1.0625rem` |
| Small — compact annotations only | `--text-small` | `0.875rem` |

Base is for prose, navigation, buttons, inputs, table cells, and tool results. If you are unsure which size to use, it is base. Small is only for card descriptions, metadata rows, captions, and sidebar filter items — never a paragraph of reading copy. A page that "needs" a third size actually needs a layout change.

Headings scale by hierarchy, all in `--font-display` at `--weight-bold` with `--tracking-display`:

| purpose | token | value |
| --- | --- | --- |
| H1 | `--text-h1` + `--line-h1` | `clamp(2.6rem, 5vw, 3.6rem)` |
| H2 | `--text-h2` | `1.7rem` |
| H3 | `--text-h3` | `1.15rem` |

Every page h1 highlights one editorially chosen phrase with a `<mark>` styled as an accent fill with `--color-accent-contrast` text.

## Prose Layout

- Put `proseClassName` on the exact reading container.
- Add `proseFlowClassName` when that container directly owns the headings, paragraphs, lists, figures, and tables in one reading flow.
- Add `proseSectionFlowClassName` when a structural wrapper owns prose `<section>` children. The wrapper keeps its page-level spacing; the shared class controls rhythm inside each section.
- Use `--measure-prose` to keep line length comfortable.
- Reading copy uses `--color-text`, not muted.
- Use no default dividers between prose sections unless a specific reference page needs them.
- Keep section spacing calm: enough air to scan, not enough to feel editorial or blog-like.
- Reading elements use a 16px gap. In one prose flow, later `h2` headings sit 32px after the preceding element and later `h3` or `h4` headings sit 24px after it. Separate prose sections use one 40px break. These are total gaps, so page layouts must not add another gap on top.
- Keep gaps between forms, results, cards, navigation, and other structural regions in their owning page or component styles.
- Links use `--color-link` at rest, with no underline. Hover and keyboard focus add an underline in the same color. Apply this across page content and tables. Sidebar, top-bar, and footer links are exceptions, keeping their previous neutral text and navigation states without hover underlines. Linked cards color their destination title. Filled action buttons keep contrasting text, and disabled navigation stays muted. Component styles must preserve this shared link treatment.

## Rules

- Dark is home: design on `#101010` first, then verify light mode. Anything that only works in one theme is wrong in both.
- Every page uses `PageCanvas` and the self-host apps directory spacing: `clamp(24px, 2.5vw, 36px)` horizontally, 30px above and 44px below. At viewport widths of 900px or less, use 22px horizontally, 24px above and 36px below. Text-led pages use the 760px reading canvas. Directories, tool workbenches, primary comparison tables, and card grids use the wide canvas. Explanatory tables follow the reading width. Both start at the same left edge. Full-width bands and rules may reach the main-column edges.
- Top-level entry pages use the shared dotted `EntryHero`. This includes home, catalogs, directories, course entry pages, labs, and legal pages. Individual tools, lessons, records, and dense reference pages keep a plain task-first header.
- Direct the eye by size, then weight, then accent — in that order. Color is the last resort.
- Use borders before shadows; the site has no decorative shadows and no gradients.
- Cards, panels, controls, tags, title marks, tables, and media frames use `--radius`. True circles may use `50%` when the shape carries meaning, such as a timeline node or numbered step. Avoid nested cards.
- Use the 4px/8px spacing rhythm through `--space-*`.
- Use `--font-mono` for facts, slugs, versions, stats, and metadata. Never uppercase with positive letter spacing.
- Sections start with a display heading and an optional lede.
- Use `--focus-ring` for focus states.
- Unknown is better than fake precision.
- When unsure, remove. If a page feels flat, add a doodle or a better sentence, not another component.

## Component Direction

Use [shared-ui.md](shared-ui.md) for components across all page types and the Components UI gallery at `/components-ui` in development for examples. Interactive tool flow and result hierarchy follow [tool-interface.md](tool-interface.md). This document owns their visual tokens.

Buttons: primary is an accent fill with `--color-accent-contrast` text, one per view; secondary is surface plus `--color-border-strong` border; ghost is plain text that gains a `--color-surface-2` background on hover.

Cards: `--color-surface` on a 1px `--color-border`, `--radius`, a dashed `--color-border` divider above the mono metadata row, and a hover state that turns the border to `--color-accent`. Titles use `--font-display`; descriptions use `--text-small` with `--color-text`. Tool catalogs use the shared three-column `ToolCatalog` grid, falling to two and then one column. Each card has one simple tool name, one sentence, and one semantic marker spot.

Tables: `--color-border` outer border and row dividers, a `--color-surface-2` header row, and mono for data values. Use `UiDataTable` for structured results and the shared Markdown table renderer for prose.

App directory cards use the approved Fact rows variant in `app-fact-card.tsx`. Show the actual app image beside its name and primary category, with +N for additional categories. Follow the summary with labeled fact rows, each with a small semantic icon and a mono value. Use neutral solid row dividers and a stronger neutral hover border. Keep full values, estimates, and unknowns visible. The whole card opens the existing app details drawer. The desktop grid has three columns, falling to two and one as the main column narrows.

Hardware directories use `hardware-fact-card.tsx` with a 200px-tall contained product image, one vendor/model heading, and the same `AppCardFacts` rows. Use the product name when a grouped record has no real model identifier. Do not add subtitles, summary paragraphs, repeated identity lines, or a separate compatibility box. Compatibility stays a fact row alongside the practical fields. Preserve full values and the existing detail drawer. Missing or failed product images show an explicit placeholder rather than a generated illustration.

Tools use one full-width workbench band. Its `--color-surface` background and `--color-border-strong` top and bottom rules span the entire main column beside the sidebar. The interactive content uses the shared page gutters and fills the available content width. The band has no side borders or corner radius. The form leads and results render below a `--color-border` divider in the same band. Supporting headings, paragraphs, lists, quotes, and explanatory tables stop at `--measure-prose`; primary result tables and code may use the wide canvas. Everything stays on the shared left edge. Results read like an answer: a full sentence at `--text-body` first, the data table second, and timing or provider metadata last in `--text-small` mono muted text. Do not put nested cards around the whole tool or its major sections.

Sidebars that list things use `SidebarList` from `app/ui/site/sidebar-list.tsx`: small rows, optional mono numbers and counts, and a `--color-surface-2` active fill with an accent-ink leading cell. Linear lists lead with mono numbers, non-linear lists lead with a meaningful monochrome icon, and lists with no sensible icon fall back to the quiet chevron. Do not hand-roll another sidebar link list.

Tool catalog sidebars link between published tool catalogs and mark the current catalog. Individual tools belong in the catalog's main cards, not a duplicate sidebar list. Individual tool pages keep their family tool navigation.

The homepage lists published top-level directories, tool catalogs, and references, plus the course and Labs collection. It does not list individual tools or individual reference sheets. Each card shows a meaningful count from its destination's data. New top-level collections need a home entry, identity icon, metric, and coverage test.

Each feature page has one identity icon, used in three places: its sidebar row, its home card title, and through `PageTitleIcon` (`app/ui/site/page-title-icon.tsx`) beside its h1. The h1 treatment is an unboxed, em-sized icon in `--color-accent-text`, aligned optically with the title. Feature pages also carry one marker spot doodle on their home card; the spot says what the page is in one drawing.

Callouts distinguish by a neutral `--color-border` full border and spacing alone. If the message is a warning, the key phrase uses `--color-warning-text` inside; the box itself stays neutral. Never a colored left edge.

Pagination: mono numerals in bordered squares; the current page is the one accent fill.

Tabs: the active tab gets a 2px accent bottom underline. Breadcrumbs stay muted text with the current page in `--weight-semibold`.

Drawers should use rows and dividers, sit above the top bar, and become full-screen on mobile.

Filters share input height, radius, font size, and focus styles. Selected filter tags use an `--color-accent-text` border and text, never a fill.

Short, important choices in a tool should stay visible instead of hiding inside a dropdown. Use a compact radio row with one clear accent-colored selection when people benefit from seeing every available option at once. Keep the real radio inputs for keyboard and screen-reader behavior, and let the row wrap cleanly on small screens.

Media figures should use `MediaFigure` from `app/ui/site/media-figure.tsx`. Screenshots and photos use the `image` kind; generated visual explainers use the `diagram` kind. Captions use `--text-small`. Capture screenshots in the dark theme and crop to the relevant interface.

Clean charts use `*.chart.json` specs beside the page, generated with `npm run stack127:clean-charts` and rendered with `Chart` from `app/ui/site/chart.tsx`. The generator and figure types live in `scripts/stack127/clean-charts/`. Check the rendered chart or figure in its actual page placement.

Code snippets should use `CodeBlock` from `app/ui/site/code-block.tsx`. Code surfaces stay dark in both themes, and accent color highlights only the lines the prose is talking about. Pass the exact text as string children. Do not hand-roll bare `<pre className="lesson-code">` on new pages.

Marker art has three jobs: explain (diagrams and charts with full semantic tones), greet (one spot piece per hero), and breathe (small doodles in corners, margins, and empty states — muted ink with at most one accent stroke, at most two visible per viewport, hidden below 1100px). See `stack127_docs/marker-art.md`.

Shared footers should stay small: logo, essential legal links, and rights text only. Keep them inside the shell so every route has the same minimal baseline.
