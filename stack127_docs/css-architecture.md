# CSS architecture

Stack127 keeps global CSS deliberately small. A new page should be able to develop its own layout without silently changing pages that already work.

## Ownership

`app/globals.css` owns only:

- design tokens and theme values;
- the small reset;
- document defaults for elements such as `html`, `body`, links, form controls, and code fonts.

It must not contain class or ID selectors. A class means a component or page owns that style somewhere else.

Shared React components keep their styles beside the component in a CSS Module. Examples include `app/app-shell.module.css`, `app/site-nav.module.css`, `app/prose.module.css`, and `app/sidebar-panel.module.css`.

Sidebar titles use the shared `SidebarLabel` component from `app/app-shell.tsx`. It renders a semantic `<p>` and applies the heading-like title style owned by `app/sidebar-panel.module.css`. Do not use an `h1` to `h6` for this repeated sidebar label, and do not recreate the styled paragraph inside individual routes.

A route family with several cooperating components may use one colocated family stylesheet imported by that family's layout. Current examples are:

- `app/(site)/(catalogs)/dns-tools/dns-tools.css`;
- `app/(site)/(directories)/_components/directory.css`;
- `app/(site)/(courses)/self-hosting-for-beginners/course.css`;
- `app/(site)/(references)/software-licenses-for-self-hosting/software-licenses.css`.

Prefer CSS Modules for new components and new single-page work. Use a family stylesheet when multiple files in the same route family intentionally share selectors. Do not move a family stylesheet into `globals.css` for convenience.

Flat tool pages live under `app/(site)/(tools)/`. The `(tools)` segment never appears in a public URL. A tool page imports only the family stylesheet it actually uses; storage and unrelated tools do not inherit DNS or domain CSS.

## Building a page

1. Use `AppShell` with `PageCanvas` for each outer content section. `EntryHero` already includes a canvas. Use the shared navigation, sidebar-panel, prose, media, and code-block components where they fit.
2. Put the page's remaining styles in its route folder or beside its component.
3. Import family CSS from the nearest route layout. Import a CSS Module directly from its owning component.
4. Use semantic tokens from `globals.css`; do not create another global token layer in a page file. Every bounded UI shape uses the shared 2px `--radius` token.
5. Keep reading copy inside the prose primitive. Keep controls, tables, metadata, and tool results on the compact UI scale.
6. Check the page in both themes and at desktop and mobile widths.

## Typography boundary

Reading and operating are different jobs.

Long explanations use `proseClassName` from `app/prose.ts`. It provides calm line height, and consistent headings, lists, links, inline code, and keyboard keys. Add `proseFlowClassName` to a flat reading container so vertical rhythm comes from the shared prose primitive instead of a route stylesheet. Add `proseSectionFlowClassName` to a structural wrapper whose direct `<section>` children each contain prose. `proseLedeClassName` is available for the opening paragraph.

Shared prose flow controls spacing between reading elements and the stronger break before later headings. Route and component styles continue to own structural gaps between areas such as forms, results, cards, navigation, and separate article sections.

Body text has exactly two sizes on the whole site: `--text-body` for prose, navigation, controls, table cells, and tool results, and `--text-small` only for card descriptions, metadata rows, captions, and sidebar filter items. Do not introduce another body size in a page or component stylesheet.

Every page-level `h1` uses the shared `--text-h1` and `--line-h1` typography tokens: a responsive 2.6rem to 3.6rem size with a tight line height, set in `--font-display`. Title text may wrap within a readable measure. `PageCanvas` owns its outer position and padding; route styles must not invent another page-title size.

Tool interfaces still read at `--text-body`; only their metadata, counts, and captions drop to `--text-small`. A tool page may contain prose, but apply the prose class only to the explanatory region, never to the whole tool.

## Visual language

Do not decorate callouts, findings, status messages, or information boxes with a colored line along the left edge. That treatment is not part of the Stack127 design language. Prefer ordinary spacing, a neutral full border, a restrained surface background, or semantic text color when the meaning genuinely needs distinction. A neutral connector that shows a real sequence, hierarchy, or DNSSEC chain is structural rather than decorative and may remain.

## Guardrail

`npm run test:static` fails when a class or ID selector is added to `app/globals.css`. If that happens, move the selector to its owner instead of weakening the check.

When changing a shared component, verify representative pages that use it. When changing a family stylesheet, verify only that family plus any shared component it imports.

## Shared page geometry

`app/page-canvas.module.css` owns outer page width and padding. Every family follows the self-host apps directory gutters. The responsive gutter and vertical padding tokens live in `app/globals.css`. Change those tokens to adjust spacing across the site.

`PageCanvas` defaults to a wide grid with shared section gaps. Add `reading` to cap a text-led page at `--measure-prose` after padding. Use `flow` when prose, a directory, or another family already owns its internal layout. Use `as="article"`, `as="main"`, or `as="section"` when those semantics fit. A custom class may set internal display, columns, and gaps, but must not override the canvas margins or padding.

`EntryHero` wraps its header in a wide canvas and reserves space for its drawing. `PageHeader` limits its title and introduction while keeping the shared left edge. Do not add another canvas around it or a page-specific drawing offset. Text-led legal pages and course lessons use `PageCanvas reading`. Directories, tool interfaces, card grids, and primary comparison tables stay wide. Tool supporting text and explanatory tables use the reading measure inside the wide canvas.

`npm run test:static` rejects native outer wrappers directly inside `AppShell`, nested canvases, obsolete width variants, and custom canvas geometry. `tests/stack127/page-spacing.spec.ts` measures header and canvas alignment across page families, seven viewport widths, and both themes. Keep these checks when adding a new family or changing shared layout.
