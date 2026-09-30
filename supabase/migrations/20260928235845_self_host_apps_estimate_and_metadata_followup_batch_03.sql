begin;
do $migration$
declare
  v_app uuid;
  v_categories text[];
  v_count integer;
  v_key text;
  v_status jsonb;
begin
  select id into v_app from public.self_host_apps
  where slug='bark-server' and published is true
    and name='Bark Server' and publisher_name='Finb' and publisher_type='community'
    and source_code_url='https://github.com/Finb/bark-server'
  for update;
  if v_app is null then raise exception 'Bark Server publisher changed since follow-up review'; end if;
  update public.self_host_apps set
    publisher_name='Feng (Finb)',publisher_type='individual',
    publisher_url='https://github.com/Finb',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array['https://github.com/Finb']::text[]) as refs(url) order by url),
    technical_fact_status=jsonb_set(
      coalesce(technical_fact_status,'{}'::jsonb),
      '{publisher}',
      jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official repository belongs to Feng (Finb).','source_urls',jsonb_build_array('https://github.com/Finb','https://github.com/Finb/bark-server')),
      true
    ),
    updated_at=now()
  where id=v_app and publisher_name='Finb' and publisher_type='community';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Bark Server publisher correction failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='magicmirror' and published is true and name='MagicMirror²'
    and source_code_url='https://github.com/MagicMirrorOrg/MagicMirror'
  for update;
  if v_app is null then raise exception 'MagicMirror record changed since follow-up review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['calendars-contacts','dashboards']::text[] then raise exception 'MagicMirror categories changed since follow-up review'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='dashboards';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MagicMirror category correction failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='musicbrainz-picard' and published is true
    and name='MusicBrainz Picard' and persistent_storage is null
  for update;
  if v_app is null then raise exception 'MusicBrainz Picard record changed since follow-up review'; end if;
  update public.self_host_apps set persistent_storage=true,updated_at=now()
  where id=v_app and persistent_storage is null;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MusicBrainz Picard persistence update failed'; end if;
  update public.self_host_app_resource_estimates set
    storage_estimate_min_gb=50,storage_estimate_max_gb=500,
    storage_estimate_basis='Includes a typical personal music library and app data; lossless collections can need more space.',
    storage_source_urls=array['https://picard.musicbrainz.org/','https://picard.musicbrainz.org/downloads/','https://github.com/metabrainz/picard']::text[],
    storage_note=null,checked_at=now(),updated_at=now()
  where app_id=v_app and storage_estimate_min_gb=1 and storage_estimate_max_gb=5
    and storage_estimate_basis='Estimate covers the application profile and cache; a mounted music library needs separate storage.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MusicBrainz Picard storage estimate changed since follow-up review'; end if;
  update public.self_host_apps set
    technical_fact_status=jsonb_set(
      coalesce(technical_fact_status,'{}'::jsonb),
      '{persistence}',
      jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Picard reads and edits local music files.','source_urls',jsonb_build_array('https://picard.musicbrainz.org/','https://github.com/metabrainz/picard')),
      true
    )
  where id=v_app;

  for v_app in
    select id from public.self_host_apps where slug in ('alloy','bark-server','iptvnator-backend','magicmirror','musicbrainz-picard')
  loop
    select technical_fact_status into v_status from public.self_host_apps where id=v_app;
    foreach v_key in array array['source_code','license','publisher','docker','compose','database','persistence','native'] loop
      if v_status ? v_key then
        v_status:=jsonb_set(v_status,array[v_key,'checked_at'],to_jsonb('2026-09-29'::text),false);
      end if;
    end loop;
    update public.self_host_apps set technical_fact_status=v_status where id=v_app;
  end loop;
end
$migration$;
commit;
