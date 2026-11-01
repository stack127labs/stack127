begin;

create temporary table self_host_app_cleanup on commit drop as
select slug, canonical_slug, classification
from (values
  ('immich-redis', null, 'dependency_container'),
  ('immich-postgres', null, 'dependency_container'),
  ('lucia-postgresql', null, 'dependency_container'),
  ('makerworks-postgres', null, 'dependency_container'),
  ('spamfilter-redis', null, 'dependency_container'),
  ('tubearchivist-redis', null, 'dependency_container'),
  ('onlyoffice-mysql-server', null, 'dependency_container'),
  ('couchdb-offical-docker-v1-x', 'couchdb', 'image_variant'),
  ('couchdb-v2-x', 'couchdb', 'image_variant'),
  ('elastic-search', 'elasticsearch', 'duplicate'),
  ('elasticsearch7', 'elasticsearch', 'image_variant'),
  ('elasticsearch8', 'elasticsearch', 'image_variant'),
  ('postgresql18', 'postgres', 'image_variant')
) as records(slug, canonical_slug, classification);

create temporary table self_host_app_cleanup_count on commit drop as
select count(*)::integer as published_before from public.self_host_apps
where published and self_hosting_status='self_hostable';

do $$
begin
  if (select count(*) from self_host_app_cleanup) <> 13 then
    raise exception 'Expected 13 reviewed records in cleanup manifest';
  end if;
  if (select count(*) from public.self_host_apps app join self_host_app_cleanup c using (slug)
      where app.published and app.self_hosting_status = 'self_hostable') <> 13 then
    raise exception 'Cleanup snapshot changed: expected all 13 records to remain published and self-hostable';
  end if;
  if (select count(distinct app.id) from self_host_app_cleanup c join public.self_host_apps app on app.slug=c.canonical_slug
      where c.canonical_slug is not null and app.published and app.self_hosting_status='self_hostable') <> 3 then
    raise exception 'A canonical app record is missing or unpublished';
  end if;
end $$;

-- Keep source links from every artifact record on its canonical app before unpublishing it.
update public.self_host_apps canonical
set data_source_urls = (
  select array_agg(distinct merged.url order by merged.url)
  from unnest(
    coalesce(canonical.data_source_urls, '{}') || coalesce(artifacts.urls, '{}')
  ) as merged(url)
), updated_at = now()
from (
  select c.canonical_slug, array_agg(distinct item.url) filter (where item.url is not null) as urls
  from self_host_app_cleanup c
  join public.self_host_apps artifact on artifact.slug=c.slug
  cross join lateral unnest(array[artifact.source_code_url, artifact.website_url, artifact.docs_url,
    artifact.install_docs_url, artifact.docker_url]) as item(url)
  where c.canonical_slug is not null
  group by c.canonical_slug
) artifacts
where canonical.slug=artifacts.canonical_slug;

update public.self_host_apps
set published=false, updated_at=now()
where slug in (select slug from self_host_app_cleanup);

update public.self_host_apps set name='CouchDB', updated_at=now() where slug='couchdb';
update public.self_host_apps set name='Elasticsearch', updated_at=now() where slug='elasticsearch';
update public.self_host_apps set name='PostgreSQL', updated_at=now() where slug='postgres';

do $$
begin
  if (select count(*) from public.self_host_apps where slug in (select slug from self_host_app_cleanup) and not published) <> 13 then
    raise exception 'Cleanup did not unpublish all reviewed artifacts';
  end if;
  if (select count(*) from public.self_host_apps where published and self_hosting_status='self_hostable') <>
      (select published_before - 13 from self_host_app_cleanup_count) then
    raise exception 'Unexpected cleaned published count; expected a reduction of exactly 13';
  end if;
end $$;

commit;
