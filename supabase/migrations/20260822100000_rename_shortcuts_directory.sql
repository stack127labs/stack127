-- Rename the published keyboard-shortcut directory without keeping the old slug.

update public.stack127_pages
set slug = 'keyboard-shortcuts'
where slug = 'shortcuts';
