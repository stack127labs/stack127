# Keyboard shortcuts publication

The keyboard shortcut catalog owns these public routes:

- `/keyboard-shortcuts` is the catalog.
- `/keyboard-shortcuts/<app-slug>` is the full reference for each published app.
- `/shortcuts-cheatsheet-generator` builds and prints selected sheets.

The old `/shortcuts` and `/shortcuts/<app-slug>` routes were removed on August 27, 2026. They have
no redirects. Migration `20260827122558_remove_shortcut_routes.sql` removes their rows from
`public.stack127_pages`, which also removes them from the sitemap and shared SEO registry.

Migration `20260828032950_restore_keyboard_shortcut_pages.sql` publishes the 26 app references under
`/keyboard-shortcuts`. Every public route remains controlled by its exact `public.stack127_pages` row.

Migration `20260903053518_publish_keyboard_shortcut_expansion.sql` publishes the remaining 192
source-checked references. The directory now has 218 published app pages. Each exact slug is in
`public.stack127_pages` and the sitemap.

Future candidate records may have generated route files and ownership manifests for QA. They stay
`noindex` until an editorial publication decision adds each exact slug to `public.stack127_pages`.
