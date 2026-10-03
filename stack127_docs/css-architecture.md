# CSS architecture

Keep global CSS small. A new page should be able to build its own layout without quietly changing pages that already work.

## Ownership

`app/globals.css` owns only:

- Design tokens and theme values.
- The small reset.
- Document defaults for elements such as `html`, `body`, links, form controls, and code fonts.

It must not contain class or ID selectors. A class means a component or page owns that style somewhere else.

Shared React components keep their styles in a CSS Module beside the component. Examples:

- `app/ui/site/app-shell.module.css`
- `app/ui/site/site-nav.module.css`
- `app/ui/site/prose.module.css`
- `app/ui/site/sidebar-panel.module.css`

Sitewide controls, displays, content blocks, charts, pagination, and dialogs live in `app/ui/` with their CSS Modules. Read [shared-ui.md](shared-ui.md) before adding a copy inside a route. Interactive controls and dialogs keep their client boundary. Static content components stay server-renderable.

Sidebar titles use the shared `SidebarLabel` component from `app/ui/site/app-shell.tsx`. It renders a semantic `<p>` with the heading-like title style owned by `app/ui/site/sidebar-panel.module.css`. Don't use an `h1` to `h6` for this repeated sidebar label. Don't recreate the styled paragraph inside individual routes.

### Family stylesheets

A route family with several components that work together may use one family stylesheet. It sits with the family and is imported by the family's layout. Current examples:

- `app/(site)/(tools)/(dns)/dns-tools.css`
- `app/ui/directories/directory.css`
- `app/(site)/(courses)/self-hosting-for-beginners/course.css`
- `app/(site)/(directories)/software-licenses-for-self-hosting/software-licenses.css`

Prefer CSS Modules for new components and new single-page work. Use a family stylesheet when several files in the same route family share selectors on purpose. Don't move a family stylesheet into `globals.css` for convenience.

### Tool styles

Flat tool pages live under `app/(site)/(tools)/`. The `(tools)` and family route groups never appear in a public URL.

- DNS and domain family layouts import their shared styles.
- Storage tools use CSS Modules.
- Unrelated tools don't inherit DNS or domain CSS.

## Building a page

1. Use `AppShell` with `PageCanvas` for each outer content section. `EntryHero` already includes a canvas. Use the shared navigation, sidebar-panel, prose, media, and code-block components where they fit.
2. Put the page's other styles in its route folder or beside its component.
3. Import family CSS from the nearest route layout. Import a CSS Module directly from the component that owns it.
4. Use semantic tokens from `globals.css`. Don't create another global token layer in a page file. Every bounded UI shape uses the shared 2px `--radius` token.
5. Keep reading copy inside the prose primitive. Keep controls, tables, metadata, and tool results on the compact UI scale.
6. Check the page in both themes, at desktop and mobile width.

## Typography boundary

Reading and operating are different jobs.

Long explanations use `proseClassName` from `app/ui/site/prose.ts`. It gives calm line height and consistent headings, lists, links, inline code, and keyboard keys.

| Class | Use it on |
| --- | --- |
| `proseFlowClassName` | A flat reading container, so vertical rhythm comes from the shared prose primitive instead of a route stylesheet. |
| `proseSectionFlowClassName` | A structural wrapper whose direct `<section>` children each contain prose. |
| `proseLedeClassName` | The opening paragraph. |

Shared prose flow controls spacing between reading elements and the bigger break before later headings. Route and component styles still own structural gaps between areas such as forms, results, cards, navigation, and separate article sections.

Body text has exactly two sizes on the whole site:

- `--text-body` for prose, navigation, controls, table cells, and tool results.
- `--text-small` only for card descriptions, metadata rows, captions, and sidebar filter items.

Don't add another body size in a page or component stylesheet.

Every page-level `h1` uses the shared `--text-h1` and `--line-h1` tokens. That's a responsive 2.6rem to 3.6rem size with a tight line height, set in `--font-display`. Title text may wrap within a readable measure. `PageCanvas` owns its outer position and padding. Route styles must not invent another page-title size.

Tool interfaces still read at `--text-body`. Only their metadata, counts, and captions drop to `--text-small`. A tool page may contain prose. Apply the prose class only to the explanatory region, never to the whole tool.

## Visual language

Don't decorate callouts, findings, status messages, or information boxes with a colored line along the left edge. That isn't part of the stack127 design.

Use ordinary spacing, a neutral full border, a restrained surface background, or semantic text color when the meaning really needs to stand apart.

A neutral connector that shows a real sequence, hierarchy, or DNSSEC chain is structure, not decoration. It may stay.

## Guardrail

Keep `app/globals.css` limited to tokens, reset, and document defaults. Put component and page selectors in the CSS Module that owns them.

When you change a shared component, check representative pages that use it. When you change a family stylesheet, check only that family plus any shared component it imports.

## Shared page geometry

`app/ui/site/page-canvas.module.css` owns outer page width and padding. Every family follows the self-host apps directory gutters. The responsive gutter and vertical padding tokens live in `app/globals.css`. Change those tokens to adjust spacing across the site.

`PageCanvas` defaults to a wide grid with shared section gaps.

| Option | Use it when |
| --- | --- |
| `reading` | A text-led page should cap at `--measure-prose` after padding. |
| `flow` | Prose, a directory, or another family already owns its internal layout. |
| `as="article"`, `as="main"`, or `as="section"` | Those semantics fit. |

A custom class may set internal display, columns, and gaps. It must not override the canvas margins or padding.

`EntryHero` wraps its header in a wide canvas and reserves space for its drawing. `PageHeader` limits its title and introduction while keeping the shared left edge. Don't add another canvas around it or a page-specific drawing offset.

| Page type | Canvas |
| --- | --- |
| Text-led legal pages and course lessons | `PageCanvas reading` |
| Directories, tool interfaces, card grids, and primary comparison tables | Wide |
| Tool supporting text and explanatory tables | Reading measure inside the wide canvas |

When you add a page family or change shared layout, look at representative pages at desktop and mobile width. Check header alignment, canvas gutters, reading width, and page-level overflow.
