# Keyboard shortcuts publication

Two public routes own the shortcut experience:

- `/keyboard-shortcuts` is the catalog.
- `/shortcuts-cheatsheet-generator` builds and prints selected sheets.

The old `/shortcuts` and `/shortcuts/<app-slug>` routes were removed on August 27, 2026. They have
no redirects. Migration `20260827122558_remove_shortcut_routes.sql` removes their rows from
`public.stack127_pages`, which also removes them from the sitemap and shared SEO registry.

The two surviving routes remain controlled by their exact `public.stack127_pages` rows.
