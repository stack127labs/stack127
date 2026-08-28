# Keyboard shortcuts publication

The keyboard shortcut catalog owns these public routes:

- `/keyboard-shortcuts` is the catalog.
- `/keyboard-shortcuts/<app-slug>` is the full reference for each of the 26 apps.
- `/shortcuts-cheatsheet-generator` builds and prints selected sheets.

The old `/shortcuts` and `/shortcuts/<app-slug>` routes were removed on August 27, 2026. They have
no redirects. Migration `20260827122558_remove_shortcut_routes.sql` removes their rows from
`public.stack127_pages`, which also removes them from the sitemap and shared SEO registry.

Migration `20260828032950_restore_keyboard_shortcut_pages.sql` publishes the 26 app references under
`/keyboard-shortcuts`. Every public route remains controlled by its exact `public.stack127_pages` row.
