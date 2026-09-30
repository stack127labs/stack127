begin;

do $guard$
declare
  v_app_id uuid;
begin
  select id into v_app_id
  from public.self_host_apps
  where slug='ddrescue'
    and name='GNU ddrescue'
    and website_url='https://www.gnu.org/s/ddrescue/ddrescue.html'
    and publisher_url='https://www.gnu.org/s/ddrescue/ddrescue.html'
    and data_source_urls @> array['https://www.gnu.org/s/ddrescue/ddrescue.html']::text[];
  if not found then
    raise exception 'GNU ddrescue links changed since the verified batch';
  end if;

  if not exists (
    select 1 from public.self_host_app_install_options install
    where install.app_id=v_app_id
      and install.options @> jsonb_build_array(jsonb_build_object(
        'method','package','url','https://www.gnu.org/s/ddrescue/ddrescue.html'
      ))
  ) then
    raise exception 'GNU ddrescue package link changed since the verified batch';
  end if;
end
$guard$;

update public.self_host_apps app set
  website_url='https://www.gnu.org/software/ddrescue/',
  publisher_url='https://www.gnu.org/software/ddrescue/',
  data_source_urls=(
    select coalesce(array_agg(refs.url order by refs.url),'{}'::text[])
    from (
      select distinct case when url='https://www.gnu.org/s/ddrescue/ddrescue.html'
                            then 'https://www.gnu.org/software/ddrescue/' else url end as url
      from unnest(app.data_source_urls) refs(url)
    ) refs
  ),
  technical_fact_status=replace(
    app.technical_fact_status::text,
    'https://www.gnu.org/s/ddrescue/ddrescue.html',
    'https://www.gnu.org/software/ddrescue/'
  )::jsonb,
  updated_at=now()
where app.slug='ddrescue';

update public.self_host_app_install_options install set
  options=replace(
    install.options::text,
    'https://www.gnu.org/s/ddrescue/ddrescue.html',
    'https://www.gnu.org/software/ddrescue/'
  )::jsonb,
  source_urls=(
    select coalesce(array_agg(refs.url order by refs.url),'{}'::text[])
    from (
      select distinct case when url='https://www.gnu.org/s/ddrescue/ddrescue.html'
                            then 'https://www.gnu.org/software/ddrescue/' else url end as url
      from unnest(install.source_urls) refs(url)
    ) refs
  ),
  updated_at=now()
from public.self_host_apps app
where app.id=install.app_id and app.slug='ddrescue';

commit;
