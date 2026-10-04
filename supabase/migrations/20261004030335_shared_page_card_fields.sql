begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

-- Renaming preserves catalog values, defaults, grants, and asset constraints.
-- hero_art_key remains the page's hero artwork.
alter table public.stack127_catalog_pages rename column icon_key to card_icon_key;
alter table public.stack127_catalog_pages rename column home_art_key to card_art_key;

alter table public.stack127_directory_pages
  add column card_icon_key text,
  add column card_art_key text,
  add constraint stack127_directory_pages_card_asset_check check (
    (card_icon_key is null or card_icon_key ~ '^[a-z0-9-]+$')
    and (card_art_key is null or card_art_key ~ '^[a-z0-9-]+$')
  );

-- Existing update triggers compare full rows for public dates and cache events.
-- The revision trigger compares only title and Markdown, so cards do not bump it.
-- Table SELECT grants and publication policies also cover the added columns.
with cards(slug) as (
  values ('cli-apps'), ('epp-status-codes'), ('keyboard-shortcuts'),
    ('launch-directories'), ('platform-fees'), ('self-host-apps'),
    ('software-licenses-for-self-hosting'), ('tld-directory')
)
update public.stack127_directory_pages content
set card_icon_key = cards.slug, card_art_key = cards.slug
from public.stack127_pages page, cards
where content.page_id = page.id and page.page_family = 'directory'
  and page.slug = cards.slug;

notify pgrst, 'reload schema';
commit;
