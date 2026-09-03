# Keyboard shortcuts expansion

On September 1, 2026, the AltPlusCtrl keyboard-shortcut backlog was reviewed against official
sources. The backlog now contains a decision for all 263 candidate apps:

- 192 are verified and have typed shortcut records with source URLs and verification dates.
- 71 are blocked because the available official material does not support a reliable reference in
  the current page contract.
- 0 remain unstarted.

The verified records generate the catalog summary, lazy loaders, app routes, and ownership
manifests. On September 3, 2026, all 192 verified expansion routes were approved for publication.
Migration `20260903053518_publish_keyboard_shortcut_expansion.sql` adds their exact
`public.stack127_pages` rows. The catalog now contains 218 published app references.

Current operating rules remain in `content_docs/keyboard-shortcuts/brief.md`,
`content_docs/keyboard-shortcuts/publication.md`, and
`content_docs/keyboard-shortcuts/coverage-audit.md`.
