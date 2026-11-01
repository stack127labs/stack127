begin;

create temporary table self_host_app_duplicate_cleanup on commit drop as
select slug, canonical_slug
from (values
  ('actualserver', 'actual-budget'),
  ('apache-solr', 'solr'),
  ('baby-buddy', 'babybuddy'),
  ('flowise', 'flowise-ai'),
  ('lyrionmusicserver', 'lyrion-music-server'),
  ('nginx-proxy-manager', 'nginxproxymanager'),
  ('nzbhydra2', 'hydra2')
) as records(slug, canonical_slug);

do $$
begin
  if (select count(*) from self_host_app_duplicate_cleanup) <> 7 then
    raise exception 'Expected seven exact duplicate pairs in cleanup manifest';
  end if;
  if (select count(*) from public.self_host_apps app join self_host_app_duplicate_cleanup c using (slug)
      where app.published and app.self_hosting_status='self_hostable') <> 7 then
    raise exception 'Duplicate cleanup snapshot changed';
  end if;
  if (select count(distinct app.id) from self_host_app_duplicate_cleanup c
      join public.self_host_apps app on app.slug=c.canonical_slug
      where app.published and app.self_hosting_status='self_hostable') <> 7 then
    raise exception 'A canonical app record is missing or unpublished';
  end if;
end $$;

update public.self_host_apps canonical
set data_source_urls=(
  select array_agg(distinct merged.url order by merged.url)
  from unnest(coalesce(canonical.data_source_urls,'{}') || coalesce(duplicate.urls,'{}')) as merged(url)
), updated_at=now()
from (
  select c.canonical_slug,
    array_agg(distinct item.url) filter (where item.url is not null) as urls
  from self_host_app_duplicate_cleanup c
  join public.self_host_apps source on source.slug=c.slug
  cross join lateral unnest(array[source.source_code_url,source.website_url,source.docs_url,
    source.install_docs_url,source.docker_url]) as item(url)
  group by c.canonical_slug
) duplicate
where canonical.slug=duplicate.canonical_slug;

update public.self_host_apps
set published=false, updated_at=now()
where slug in (select slug from self_host_app_duplicate_cleanup);

update public.self_host_apps set name='Baby Buddy', updated_at=now() where slug='babybuddy';

commit;
