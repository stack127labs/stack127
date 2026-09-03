# Route family split

On 3 September 2026, stack127 split the old mixed `(catalogs)` route group into three
non-URL route groups.

- `(catalogs)` contains collections of stack127-owned pages: DNS tools, domain tools,
  and storage tools.
- `(directories)` contains third-party software and hardware listings.
- `(references)` contains stable facts, codes, comparisons, and keyboard shortcut pages.

The move did not change any public URL, publication state, page content, or SEO behavior.
Shared directory controls moved with the directory routes. Keyboard shortcut navigation
moved with the reference routes. The route-family test fixes the membership of all three
groups so the old mixture does not return.

The release gate also exposed a cold-load timeout on `/self-host-apps`. The route had been
loading complete detail records for every published app before paginating. It now loads a
compact filter index in bounded reads and fetches complete records only for the current page.
