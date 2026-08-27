# Route family consolidation

On August 27, 2026, page source moved into four non-URL route groups:

- `(catalogs)` owns directories, software license comparisons, and collection pages.
- `(courses)` owns ordered lesson routes.
- `(legal)` owns About, privacy, and terms.
- `(tools)` continues to own calculators, lookups, and generators.

Public URLs did not change. The short-lived `/shortcuts/<app-slug>` family was deleted without
redirects. `/keyboard-shortcuts` now links each app directly to a configured cheatsheet generator.
The shortcut records remain in `lib/shortcuts` because the catalog and generator both use them.
