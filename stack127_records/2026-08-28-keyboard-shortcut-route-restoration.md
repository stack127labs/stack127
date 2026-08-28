# Keyboard shortcut route restoration

On August 28, 2026, the individual keyboard shortcut references returned under
`/keyboard-shortcuts/<app-slug>`.

The August 27 route cleanup correctly removed `/shortcuts` and `/shortcuts/<app-slug>`, but it also
removed the individual app references. That second removal was too broad. The catalog and all app
references now share the `/keyboard-shortcuts` family:

- `/keyboard-shortcuts` is the app catalog.
- `/keyboard-shortcuts/<app-slug>` is the full reference for one app.
- `/shortcuts-cheatsheet-generator` remains the separate printable sheet tool.
- `/shortcuts` and `/shortcuts/<app-slug>` remain deleted without redirects.

Route coverage tests now compare the shortcut data files, route folders, and page ownership
manifests so they cannot drift apart silently.
