alter table public.self_host_apps
  add column icon_url text,
  add column icon_source text,
  add column good_fit text[] not null default '{}',
  add column watch_outs text[] not null default '{}';

update public.self_host_apps
set
  good_fit = best_for,
  watch_outs = array_cat(not_best_for, known_issues)
where cardinality(good_fit) = 0
  and cardinality(watch_outs) = 0;
