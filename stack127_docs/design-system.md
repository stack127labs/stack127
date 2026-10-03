# stack127 design system

This doc covers the rendered design and its components. For public wording and visual choices, use [writing-style.md](writing-style.md).

stack127 is simple, minimal, and playful. The pieces:

- Warm near-black by default.
- One loud chartreuse accent, used sparingly.
- Space Grotesk headings over Inter body text.
- Exactly two body text sizes.
- Monochrome icons.
- Hand-drawn marker art.

Playfulness lives in the type, the art, and the one accent. Never add it through extra boxes, tints, or decoration.

## Tokens

Source tokens live in `app/globals.css`. Component and page selectors don't. Follow `stack127_docs/css-architecture.md` for who owns which styles.

Use these semantic names for new UI:

| Group | Tokens |
| --- | --- |
| Color | `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-border-strong` |
| Accent | `--color-accent` (fills only), `--color-accent-text` (accent-colored text), `--color-accent-contrast` (text on accent fills), `--color-link` |
| Status | `--color-success-text`, `--color-warning-text`, `--color-danger-text`. Text colors only, never backgrounds. |
| Data | `--color-data-chartreuse`, `--color-data-cyan`, `--color-data-blue`, `--color-data-yellow`, `--color-data-red`, `--color-data-violet`, `--color-data-green`. Chart and allocation fills only. |
| Type | `--font-display`, `--font-sans`, `--font-mono`, `--text-body`, `--text-small`, `--line-body`, `--line-heading`, `--tracking-display`, `--weight-regular`, `--weight-semibold`, `--weight-bold` |
| Headings | `--text-h1` + `--line-h1`, `--text-h2`, `--text-h3` |
| Space | `--space-1` to `--space-14`, `--measure-prose` |
| Radius | `--radius` (2px for every bounded UI shape) |
| Effects | `--focus-ring`, `--motion-fast`, `--motion-base` |
| Layout | `--container-gutter`, `--page-padding-top`, `--page-padding-bottom`, `--top-bar-height`, `--sidebar-width` |

The old token scale is gone. That includes `--text-sm`, `--color-accent-soft`, `--shadow-card`, and similar names. All CSS uses the tokens above. If a token isn't in this table, it doesn't exist.

## Color rules

- The accent is a spotlight, not a paint bucket. Per view, `--color-accent` fills at most these: the h1 mark phrase, one primary button, the active pagination page, the focus ring, and the active tab underline. Anything else that needs attention uses `--color-accent-text` or a border.
- Text on an accent fill always uses `--color-accent-contrast`. Never white on chartreuse.
- Accent-colored text always uses `--color-accent-text`. Raw `#bafc3c` fails contrast as text on the light background.
- Semantic color only colors words, and only when the meaning is real. Use `--color-success-text`, `--color-warning-text`, and `--color-danger-text`. No tinted panels, no colored left edges, no badge soup.
- Data colors mark categories in charts and allocation figures. On their own, they never mean success, warning, or danger. They never replace labels or exact values.
- Muted text is the exception. `--color-text-muted` is only for true annotations: mono metadata rows, captions, timestamps, counts, and sidebar helper text. Card descriptions, ledes, section notes, and all reading copy use `--color-text`.

## Typography

There are three fonts, each with one job:

| Font | Token | Job |
| --- | --- | --- |
| Space Grotesk | `--font-display` | Headings and titles |
| Inter | `--font-sans` | Every sentence |
| IBM Plex Mono | `--font-mono` | Data, metadata, and code |

Body text has exactly two sizes on the whole site:

| Purpose | Token | Value |
| --- | --- | --- |
| Base, for everything | `--text-body` | `1.0625rem` |
| Small, for compact annotations only | `--text-small` | `0.875rem` |

Base is for prose, navigation, buttons, inputs, table cells, and tool results. If you're unsure, use base.

Small is only for card descriptions, metadata rows, captions, and sidebar filter items. Never use it for a paragraph of reading copy. If a page seems to need a third size, it needs a layout change instead.

Headings scale by level. All use `--font-display` at `--weight-bold` with `--tracking-display`:

| Purpose | Token | Value |
| --- | --- | --- |
| H1 | `--text-h1` + `--line-h1` | `clamp(2.6rem, 5vw, 3.6rem)` |
| H2 | `--text-h2` | `1.7rem` |
| H3 | `--text-h3` | `1.15rem` |

Every page h1 highlights one chosen phrase with a `<mark>`. The mark is an accent fill with `--color-accent-contrast` text.

## Prose layout

- Put `proseClassName` on the exact reading container.
- Add `proseFlowClassName` when that container directly holds the headings, paragraphs, lists, figures, and tables in one reading flow.
- Add `proseSectionFlowClassName` when a structural wrapper holds prose `<section>` children. The wrapper keeps its page-level spacing. The shared class controls rhythm inside each section.
- Use `--measure-prose` to keep line length comfortable.
- Reading copy uses `--color-text`, not muted.
- Don't add dividers between prose sections unless a specific reference page needs them.
- Keep section spacing calm: enough air to scan, not so much it feels like a blog.
- Keep gaps between forms, results, cards, navigation, and other structural regions in the owning page or component styles.

Prose gaps are totals. Page layouts must not add another gap on top.

| Gap | Size |
| --- | --- |
| Between reading elements | 16px |
| Before a later `h2` in one prose flow | 32px |
| Before a later `h3` or `h4` in one prose flow | 24px |
| Between separate prose sections | 40px |

### Links

Links use `--color-link` at rest, with no underline. Hover and keyboard focus add an underline in the same color. This applies across page content and tables.

Exceptions:

- Sidebar, top-bar, and footer links keep their neutral text and navigation states, with no hover underline.
- Linked cards color their destination title.
- Filled action buttons keep contrasting text.
- Disabled navigation stays muted.

Component styles must keep this shared link treatment.

## Rules

- Dark is home. Design on `#101010` first, then check light mode. Anything that only works in one theme is wrong in both.
- Direct the eye by size, then weight, then accent, in that order. Color is the last resort.
- Use borders before shadows. The site has no decorative shadows and no gradients.
- Cards, panels, controls, tags, title marks, tables, and media frames use `--radius`. True circles may use `50%` when the shape carries meaning, such as a timeline node or numbered step. Avoid nested cards.
- Use the 4px and 8px spacing rhythm through `--space-*`.
- Use `--font-mono` for facts, slugs, versions, stats, and metadata. Never set it in uppercase with positive letter spacing.
- Sections start with a display heading and an optional lede.
- Use `--focus-ring` for focus states.
- Unknown is better than fake precision.
- When unsure, remove. If a page feels flat, add a doodle or a better sentence, not another component.

### Page canvas

Every page uses `PageCanvas` with the self-host apps directory spacing:

| Viewport | Horizontal | Top | Bottom |
| --- | --- | --- | --- |
| Wider than 900px | `clamp(24px, 2.5vw, 36px)` | 30px | 44px |
| 900px or less | 22px | 24px | 36px |

- Text-led pages use the 760px reading canvas.
- Directories, tool workbenches, primary comparison tables, and card grids use the wide canvas.
- Explanatory tables follow the reading width.
- Both canvases start at the same left edge.
- Full-width bands and rules may reach the main-column edges.

### Entry pages

Top-level entry pages use the shared dotted `EntryHero`. That includes home, catalogs, directories, course entry pages, labs, and legal pages. Individual tools, lessons, records, and dense reference pages keep a plain, task-first header.

## Components

For components across all page types, use [shared-ui.md](shared-ui.md) and the Components UI gallery at `/components-ui` in development. Tool flow and result hierarchy follow [tool-interface.md](tool-interface.md). This doc owns their visual tokens.

### Buttons

| Type | Look |
| --- | --- |
| Primary | Accent fill with `--color-accent-contrast` text. One per view. |
| Secondary | Surface with a `--color-border-strong` border. |
| Ghost | Plain text that gets a `--color-surface-2` background on hover. |

### Cards

Cards use `--color-surface` on a 1px `--color-border`, with `--radius`. A dashed `--color-border` divider sits above the mono metadata row. On hover, the border turns `--color-accent`.

Titles use `--font-display`. Descriptions use `--text-small` with `--color-text`.

Tool catalogs use the shared three-column `ToolCatalog` grid. It drops to two columns, then one. Each card has one simple tool name, one sentence, and one semantic marker spot.

### Tables

Tables use a `--color-border` outer border and row dividers, a `--color-surface-2` header row, and mono for data values. Use `UiDataTable` for structured results. Use the shared Markdown table renderer for prose.

### Directory cards

App directory cards use the approved Fact rows variant in `app-fact-card.tsx`:

- Show the actual app image beside its name and primary category. Show +N for extra categories.
- Follow the summary with labeled fact rows. Each row has a small semantic icon and a mono value.
- Use neutral solid row dividers and a stronger neutral hover border.
- Keep full values, estimates, and unknowns visible.
- The whole card opens the existing app details drawer.
- The desktop grid has three columns. It drops to two, then one, as the main column narrows.

Hardware directories use `hardware-fact-card.tsx`:

- A 200px-tall contained product image.
- One vendor and model heading. Use the product name when a grouped record has no real model identifier.
- The same `AppCardFacts` rows.
- No subtitles, summary paragraphs, repeated identity lines, or separate compatibility box. Compatibility stays a fact row next to the practical fields.
- Keep full values and the existing detail drawer.
- A missing or failed product image shows a clear placeholder, not a generated illustration.

### Tool workbench

Each tool uses one full-width workbench band.

- Its `--color-surface` background and `--color-border-strong` top and bottom rules span the whole main column beside the sidebar.
- The band has no side borders or corner radius.
- The interactive content uses the shared page gutters and fills the content width.
- The form comes first. Results render below a `--color-border` divider in the same band.
- Supporting headings, paragraphs, lists, quotes, and explanatory tables stop at `--measure-prose`. Primary result tables and code may use the wide canvas.
- Everything stays on the shared left edge.
- Don't put nested cards around the whole tool or its major sections.

Results read like an answer, in this order:

1. A full sentence at `--text-body`.
2. The data table.
3. Timing or provider metadata in `--text-small` mono muted text.

### Sidebars

Every page keeps the sidebar. It holds the page's side space, so the main column stays at a readable width instead of stretching across the screen.

A sidebar has one of three jobs:

| Job | Examples |
| --- | --- |
| Options | Directory filters, sort, and view controls |
| Moving between related pages | Tool family lists, catalog lists, course lessons, shortcut apps |
| Jumping to page sections | Anchored sections of a long directory page |

Don't put reading content in the sidebar. That includes "about this page" paragraphs, method notes, disclaimers, and summaries. Those belong in the main column. If a page has nothing for these jobs, link to related pages instead of adding filler.

On small screens, the sidebar opens from the existing drawer. Its label names the job, for example "Filters", "Lessons", or "Sections".

Sidebars that list things use `SidebarList` from `app/ui/site/sidebar-list.tsx`. It has small rows, optional mono numbers and counts, and a `--color-surface-2` active fill with an accent-ink leading cell.

| List type | Leading cell |
| --- | --- |
| Ordered | Mono numbers |
| Unordered | A meaningful monochrome icon |
| No sensible icon | The quiet chevron |

Don't hand-roll another sidebar link list.

Tool catalog sidebars link between published tool catalogs and mark the current one. Individual tools belong in the catalog's main cards, not in a duplicate sidebar list. Individual tool pages keep their family tool navigation.

### Homepage

The homepage lists published tool catalogs, selected software directories and references, the self-hosting course, and Labs. Hardware directories stay published but are off the homepage cards and sidebar. The homepage doesn't list individual tools or individual reference sheets.

Each card shows a meaningful count from its destination's data. A new homepage collection needs an identity icon, a metric, and a marker spot.

### Identity icons

Each feature page has one identity icon, used in three places:

- Its sidebar row.
- Its home card title.
- Beside its h1, through `PageTitleIcon` (`app/ui/site/page-title-icon.tsx`).

The h1 icon is unboxed, em-sized, in `--color-accent-text`, and optically aligned with the title. Feature pages also get one marker spot doodle on their home card. The spot says what the page is in one drawing.

### Callouts

Callouts stand apart through a neutral `--color-border` full border and spacing alone. For a warning, the key phrase inside uses `--color-warning-text`. The box itself stays neutral. Never use a colored left edge.

### Small controls

| Control | Rule |
| --- | --- |
| Pagination | Mono numerals in bordered squares. The current page is the one accent fill. |
| Tabs | The active tab gets a 2px accent bottom underline. |
| Breadcrumbs | Muted text, with the current page in `--weight-semibold`. |
| Drawers | Rows and dividers. They sit above the top bar and go full-screen on mobile. |
| Filters | Share input height, radius, font size, and focus styles. Selected filter tags use an `--color-accent-text` border and text, never a fill. |

Keep short, important choices in a tool visible instead of hiding them in a dropdown. Use a compact radio row with one clear accent-colored selection when people benefit from seeing every option at once. Keep the real radio inputs for keyboard and screen readers, and let the row wrap cleanly on small screens.

### Media, charts, and code

Media figures use `MediaFigure` from `app/ui/site/media-figure.tsx`. Screenshots and photos use the `image` kind. Generated visual explainers use the `diagram` kind. Captions use `--text-small`. Capture screenshots in the dark theme and crop to the relevant interface.

Clean charts use `*.chart.json` specs beside the page. Generate them with `npm run stack127:clean-charts` and render them with `Chart` from `app/ui/site/chart.tsx`. The generator and figure types live in `scripts/stack127/clean-charts/`. Check the rendered chart or figure where it actually sits on the page.

Code snippets use `CodeBlock` from `app/ui/site/code-block.tsx`. Code surfaces stay dark in both themes. The accent highlights only the lines the prose is talking about. Pass the exact text as string children. Don't hand-roll a bare `<pre className="lesson-code">` on new pages.

### Marker art

Marker art has three jobs:

| Job | What it is |
| --- | --- |
| Explain | Diagrams and charts with full semantic tones. |
| Greet | One spot piece per hero. |
| Breathe | Small doodles in corners, margins, and empty states. Muted ink with at most one accent stroke. At most two visible per viewport. Hidden below 1100px. |

See `stack127_docs/marker-art.md`.

### Footer

Shared footers stay small: logo, the main legal links, and rights text only. Keep them inside the shell so every route has the same minimal baseline.
