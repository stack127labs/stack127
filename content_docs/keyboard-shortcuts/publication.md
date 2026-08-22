# Publication plan for the shortcuts reference

All shortcuts routes are intentionally unpublished in this handoff so the registry stays clean until review.

When ready to publish, flip every manifest listed below from unpublished to published and add one migration that inserts the matching rows into public.stack127_pages.

## Routes to publish together

- /keyboard-shortcuts (CollectionPage, priority 0.70)
- /shortcuts-cheatsheet-generator (WebApplication, priority 0.60)
- 26 app pages under /shortcuts (ReferencePage, priority 0.60 each):
  brave, chrome, claude-code, codex, cursor, excel, figma, firefox, ghostty,
  github, gmail, gnome, google-sheets, iterm2, macos, neovim, notion,
  opencode, pi-coding-agent, powershell, slack, vim, vscode, windows,
  windows-terminal, zed

Use labels and meta titles that match the page h1s. Keep slugs flat and stable.

## Migration sketch

```sql
insert into public.stack127_pages (
  slug, label, meta_title, meta_description, is_published,
  published_at, cover_image_url, page_type, sitemap_priority
) values
  ('keyboard-shortcuts', 'Keyboard shortcuts', 'Keyboard shortcuts for dev tools', 'Task grouped tables with per platform keys checked against official docs.', true, now(), null, 'CollectionPage', 0.70),
  ('shortcuts-cheatsheet-generator', 'Cheat sheet generator', 'Shortcuts cheat sheet generator', 'Pick apps and platforms and print one page with exactly those shortcuts.', true, now(), null, 'WebApplication', 0.60),
  ('shortcuts/brave', 'Brave shortcuts', 'Brave keyboard shortcuts on stack127', 'Documented Brave Browser shortcuts.', true, now(), null, 'ReferencePage', 0.60)
  -- repeat for every app slug above
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = true,
  updated_at = now();
```

After the migration is applied to production, rerun npm run quality and confirm test:seo:registry sees the same slugs that the manifests declare.
