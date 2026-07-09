# Version127 Design System

Version127 uses a compact technical interface: near-black by default, low-radius surfaces, quiet borders, compact UI typography, readable prose typography, and structured facts over long prose.

## Tokens

The source tokens live in `app/globals.css`.

Use the semantic names for new UI:

| group | tokens |
| --- | --- |
| Color | `--color-bg`, `--color-surface`, `--color-surface-solid`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent`, `--color-link` |
| Status | `--color-success-*`, `--color-warning-*`, `--color-danger-*` |
| Type | `--font-sans`, `--font-mono`, `--text-*`, `--line-*` |
| Prose | `--text-prose`, `--text-prose-lg`, `--line-prose`, `--measure-prose`, `--color-text-prose` |
| Headings | `--text-h1`, `--text-h2`, `--text-h3`, `--text-h4` |
| Space | `--space-1` through `--space-14` |
| Radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill` |
| Effects | `--focus-ring`, `--shadow-card`, `--shadow-elevated`, `--motion-fast`, `--motion-base` |
| Layout | `--top-bar-height`, `--sidebar-width`, `--site-max-width`, `--site-gutter` |

Legacy aliases like `--background`, `--surface`, `--text`, `--muted`, `--line`, and `--brand` still exist so older styles keep working. New CSS should use the semantic tokens.

## Typography

Version127 uses two typography modes.

Compact UI typography is for dense product surfaces: cards, filters, nav, buttons, pills, metadata, tables, drawers, and stats. Keep these small and scannable.

Prose typography is for reading surfaces: legal pages, about pages, reference notes, guide copy, and any area with multiple paragraphs. Scope it with `.prose`; do not make it page-wide when the page also contains cards or tools.

| purpose | token | current value |
| --- | --- | --- |
| H1 | `--text-h1` | `1.55rem` |
| H2 | `--text-h2` | `1.22rem` |
| H3 | `--text-h3` | `1.05rem` |
| H4 | `--text-h4` | `0.95rem` |
| Prose body | `--text-prose` | `1rem` |
| Prose lede | `--text-prose-lg` | `1.08rem` |
| Prose line height | `--line-prose` | `1.7` |
| Prose measure | `--measure-prose` | `760px` |
| Prose color | `--color-text-prose` | less muted than metadata |

The older `--text-*` tokens are still the compact UI scale. Use them for interface density, not long reading.

## Prose Layout

- Put `.prose` on the exact reading container.
- Use `--measure-prose` to keep line length comfortable.
- Keep paragraphs slightly less muted than metadata with `--color-text-prose`.
- Use no default dividers between prose sections unless a specific reference page needs them.
- Keep section spacing calm: enough air to scan, not enough to feel editorial or blog-like.
- Write headings normally in the source text, for example `Privacy`, `What we collect`, and `External links`.
- Use links in blue with subtle hover underline.

## Rules

- Dark mode is the default feel: almost black, not blue-black, and not pure black.
- Use borders and dividers before shadows.
- Keep cards and panels low-radius.
- Avoid nested cards.
- Outer radius should visually account for inner radius plus padding.
- Use the 4px/8px spacing rhythm through `--space-*`.
- Use sans for normal UI and mono for facts, slugs, versions, stats, and metadata.
- Keep compact UI text and reading text separate. Cards, filters, nav, metadata, buttons, pills, tables, and drawers should use the compact UI tokens.
- Use `.prose` for readable paragraphs, legal copy, about copy, reference notes, and any page area where people need to read multiple paragraphs.
- Do not apply prose typography to an entire page when the page mixes prose and UI cards. Scope it to the reading container.
- Prose paragraphs should use `--text-prose`, `--line-prose`, `--measure-prose`, and `--color-text-prose`.
- Prose headings should use `--text-h1` through `--text-h4` instead of reusing one generic heading size.
- Keep controls compact and consistent.
- Use `--focus-ring` for focus states.
- Use blue only for links, focus, selected states, and important actions.
- Use green/yellow/red only for status.
- User-facing headings should not end with a decorative dot.
- Keep user-facing headings in normal sentence case unless a proper noun or acronym needs different casing.
- Prefer structured facts over prose.
- Unknown is better than fake precision.

## Component Direction

Buttons should have clear hierarchy: strong contrast for primary, surface plus border for secondary, and plain accent text for simple links.

Cards should use stable grids, compact text, subtle hover borders, and no layout shift.

Drawers should use rows and dividers, sit above the top bar, and become full-screen on mobile.

Filters should use the label plus horizontal-line pattern and share input height, radius, font size, and focus styles.

Media figures should use `MediaFigure` from `app/media-figure.tsx`. Screenshots and photos use the `image` kind: borderless, centered, text-width by default, and height-capped so tall images stay contained. Generated visual explainers use the `diagram` kind so instructional SVGs can keep their framed treatment without forcing that frame onto real images.

Shared footers should stay small: logo, essential legal links, and rights text only. Keep them inside the shell so every route has the same minimal baseline.
