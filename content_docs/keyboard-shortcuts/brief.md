# Brief: keyboard shortcuts

## Who is here

A developer or power user wants the useful keys for one of the tools they already use. They may be
checking platform support before opening a sheet, or choosing several apps for one printable page.

## The job

The catalog lets the reader compare available apps, platforms, and shortcut counts. Choosing an app
opens its full shortcut reference. The reader can then build a printable sheet with that app selected.
The catalog lives at `/keyboard-shortcuts`, and each app lives at `/keyboard-shortcuts/<app>`.
The former `/shortcuts` hub and its 26 original reference pages permanently redirect to their matching `/keyboard-shortcuts` URLs. The explicit map lives in `lib/legacy-shortcut-redirects.ts`; unknown old paths still return 404.

## Show vs say

The dotted header uses one small key-sequence drawing to identify the collection. One section per category keeps the catalog easy to scan. Each section shows its apps as compact
cards with the name, shortcut count, and Win, Mac, and Linux labels. A platform the app doesn't support shows faded and struck through. Each app reference uses grouped tables for actions and platform keys,
with short notes only where a mode or sequence needs explanation. The printable sheet remains a
separate tool. Charts, screenshots, provenance labels, and decorative copy do not belong here.

## Data rules

The structured records in `lib/shortcuts` feed both pages. Unknown keys remain unknown. Every app
keeps its official source URL and last-verified date in the data, not in the public catalog.
Candidate records may be generated for review, but they stay `noindex` until publication is approved
through `public.stack127_pages`.

## Approved keycap and layout treatment

Use the raised-edge keycaps selected from the removed preview. Render real keyboard text on the server, with plus signs inside chords and plain words between sequence steps. Each reference table has two columns, action and shortcuts. Merge identical platform bindings only when alternatives and caveats also match. Keep platform notes and unknown bindings visible. Stack the cells on small screens. The directory and app pages have no sidebar. Category headings replace generic descriptions.

## Search words

Checked 2026-10-19. See "Find the words first" in `stack127_docs/writing-style.md`.

- Main phrase: keyboard shortcuts, <app> shortcuts cheat sheet.
- Words top titles add: printable, PDF, Mac and Windows, an app count.
- SEO title: Keyboard shortcuts for 200+ apps on Mac, Windows, and Linux. The count is rounded down; update it when the records pass the next round number.
- Questions people ask and gaps in top results: not assessed in this title pass. Check them before the next content rewrite.
