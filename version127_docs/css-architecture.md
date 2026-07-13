# CSS architecture

Version127 keeps global CSS deliberately small. A new page should be able to develop its own layout without silently changing pages that already work.

## Ownership

`app/globals.css` owns only:

- design tokens and theme values;
- the small reset;
- document defaults for elements such as `html`, `body`, links, form controls, and code fonts.

It must not contain class or ID selectors. A class means a component or page owns that style somewhere else.

Shared React components keep their styles beside the component in a CSS Module. Examples include `app/app-shell.module.css`, `app/site-nav.module.css`, `app/prose.module.css`, and `app/sidebar-panel.module.css`.

Sidebar titles use the shared `SidebarLabel` component from `app/app-shell.tsx`. It renders a semantic `<p>` and applies the heading-like title style owned by `app/sidebar-panel.module.css`. Do not use an `h1` to `h6` for this repeated sidebar label, and do not recreate the styled paragraph inside individual routes.

A route family with several cooperating components may use one colocated family stylesheet imported by that family's layout. Current examples are:

- `app/(site)/dns-tools/dns-tools.css`;
- `app/(site)/self-host-apps/self-host-apps.css`;
- `app/(site)/self-hosting-for-beginners/course.css`;
- `app/(site)/software-licenses-for-self-hosting/software-licenses.css`.

Prefer CSS Modules for new components and new single-page work. Use a family stylesheet when multiple files in the same route family intentionally share selectors. Do not move a family stylesheet into `globals.css` for convenience.

## Building a page

1. Start with the shared `AppShell`, navigation, sidebar-panel, prose, media, and code-block primitives where they fit.
2. Put the page's remaining styles in its route folder or beside its component.
3. Import family CSS from the nearest route layout. Import a CSS Module directly from its owning component.
4. Use semantic tokens from `globals.css`; do not create another global token layer in a page file.
5. Keep reading copy inside the prose primitive. Keep controls, tables, metadata, and tool results on the compact UI scale.
6. Check the page in both themes and at desktop and mobile widths.

## Typography boundary

Reading and operating are different jobs.

Long explanations use `proseClassName` from `app/prose.ts`. It provides a readable measure, larger body type, calm line height, and consistent headings, lists, links, inline code, and keyboard keys. `proseLedeClassName` is available for the opening paragraph.

Every page-level `h1` uses the shared `--text-h1` and `--line-h1` typography tokens. These match the DNS Lookup title: a responsive 2.2rem to 3.2rem size with a tight line height. Route-family styles may control the title's width and surrounding spacing, but they must not invent another page-title size.

Tool interfaces stay compact. Inputs, buttons, filters, tables, record values, pills, metadata, and technical details should use the existing UI text tokens. A tool page may contain prose, but apply the prose class only to the explanatory region, never to the whole tool.

## Guardrail

`npm run test:static` fails when a class or ID selector is added to `app/globals.css`. If that happens, move the selector to its owner instead of weakening the check.

When changing a shared component, verify representative pages that use it. When changing a family stylesheet, verify only that family plus any shared component it imports.
