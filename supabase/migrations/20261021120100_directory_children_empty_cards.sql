begin;
set local lock_timeout = '10s';
-- Directory children do not need catalog card copy. Allow a paired empty value;
-- retain trimmed, nonempty text for every row that supplies either card field.
alter table public.stack127_directory_pages drop constraint stack127_directory_pages_card_check;
alter table public.stack127_directory_pages add constraint stack127_directory_pages_card_check check (
  (card_name = '' and card_description = '') or
  (card_name = btrim(card_name) and length(card_name) > 0
    and card_description = btrim(card_description) and length(card_description) > 0)
);
commit;
