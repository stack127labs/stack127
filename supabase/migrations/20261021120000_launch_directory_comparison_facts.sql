begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

alter table public.launch_directories
  add column domain_rating smallint check (domain_rating between 0 and 100),
  add column domain_rating_checked_on date,
  add column traffic_bucket text check (traffic_bucket in ('top_1k','top_10k','top_100k','top_1m','below_1m')),
  add column traffic_checked_on date,
  add column listing_indexed boolean,
  add column listing_indexed_checked_on date,
  add column review_wait_label text check (length(review_wait_label) between 1 and 40 and review_wait_label = btrim(review_wait_label)),
  add column review_wait_min_days numeric check (review_wait_min_days >= 0 and review_wait_min_days < 'Infinity'::numeric),
  add column review_wait_max_days numeric check (review_wait_max_days >= 0 and review_wait_max_days < 'Infinity'::numeric),
  add column lowest_paid_price_usd numeric(10,2) check (lowest_paid_price_usd > 0 and lowest_paid_price_usd < 'Infinity'::numeric),
  add column price_tiers jsonb check (jsonb_typeof(price_tiers) = 'array'),
  add constraint launch_directories_review_wait_range_check check (review_wait_min_days <= review_wait_max_days);

-- The source fingerprint uses to_jsonb(directory), and the existing meaningful
-- record projection excludes only bookkeeping. Both already include these fields.
-- Every child uses this snapshot for comparisons and similar places. Touch all
-- registered children after a meaningful dataset edit, including publication and
-- removal. Their page events cover new identities before the next cache-map sync.
create function public.stack127_touch_launch_directory_children()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare changed boolean; child_slug text;
begin
  if tg_op = 'INSERT' then
    select exists(select 1 from new_rows r where public.stack127_directory_record_value('launch_directories',to_jsonb(r)) is not null) into changed;
  elsif tg_op = 'DELETE' then
    select exists(select 1 from old_rows r where public.stack127_directory_record_value('launch_directories',to_jsonb(r)) is not null) into changed;
  else
    with before as (select public.stack127_directory_record_value('launch_directories',to_jsonb(r)) value from old_rows r),
      after as (select public.stack127_directory_record_value('launch_directories',to_jsonb(r)) value from new_rows r),
      changes as ((select value from before except select value from after) union (select value from after except select value from before))
    select exists(select 1 from changes where value is not null) into changed;
  end if;
  if changed then
    for child_slug in select slug from public.stack127_pages
      where page_family='directory' and slug like 'launch-directories/%' and is_published order by slug
    loop
      perform public.stack127_touch_page(child_slug,'launch_directories');
    end loop;
  end if;
  return null;
end;
$$;
revoke all on function public.stack127_touch_launch_directory_children() from public, anon, authenticated;
grant execute on function public.stack127_touch_launch_directory_children() to service_role;
create trigger stack127_touch_launch_children_insert after insert on public.launch_directories
  referencing new table as new_rows for each statement execute function public.stack127_touch_launch_directory_children();
create trigger stack127_touch_launch_children_update after update on public.launch_directories
  referencing old table as old_rows new table as new_rows for each statement execute function public.stack127_touch_launch_directory_children();
create trigger stack127_touch_launch_children_delete after delete on public.launch_directories
  referencing old table as old_rows for each statement execute function public.stack127_touch_launch_directory_children();
commit;
