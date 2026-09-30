begin;

do $$
begin
  if (select count(*) from public.self_host_apps where slug = '45d-drive-map' and install_docs_url = 'https://github.com/unraid/45d-drivemap/releases/latest/download/45d-drivemap.plg') <> 1 then
    raise exception '45d-drive-map link changed; refusing this review batch';
  end if;
  if (select count(*) from public.self_host_apps where slug = 'agewasm' and website_url = 'https://age-wasm.ey.r.appspot.com/') <> 1 then
    raise exception 'agewasm link changed; refusing this review batch';
  end if;
  if (select count(*) from public.self_host_apps where slug = 'agregarr' and docs_url = 'https://agregarr.org/docs/') <> 1 then
    raise exception 'agregarr link changed; refusing this review batch';
  end if;
  if (select count(*) from public.self_host_apps where slug = 'aimeos' and website_url = 'https://aimeos.org/Laravel') <> 1 then
    raise exception 'aimeos link changed; refusing this review batch';
  end if;
  if (select count(*) from public.self_host_apps where slug = 'airbyte' and publisher_url = 'https://airbyte.com/company') <> 1 then
    raise exception 'airbyte link changed; refusing this review batch';
  end if;
end;
$$;

update public.self_host_apps
set install_docs_url = 'https://github.com/unraid/45d-drivemap#readme',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}'::text[]) || array['https://github.com/unraid/45d-drivemap#readme']::text[]) as s(source_url)
      order by source_url
    ),
    data_checked_at = now(),
    data_confidence = 'high',
    technical_facts_checked_at = now()
where slug = '45d-drive-map'
  and install_docs_url = 'https://github.com/unraid/45d-drivemap/releases/latest/download/45d-drivemap.plg';

update public.self_host_apps
set website_url = 'https://agewasm.marin-basic.com/',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}'::text[]) || array['https://agewasm.marin-basic.com/']::text[]) as s(source_url)
      where source_url <> 'https://age-wasm.ey.r.appspot.com/'
      order by source_url
    ),
    technical_fact_status = jsonb_set(
      replace(coalesce(technical_fact_status, '{}'::jsonb)::text, 'https://age-wasm.ey.r.appspot.com/', 'https://agewasm.marin-basic.com/')::jsonb,
      '{website}',
      jsonb_build_object(
        'status', 'published',
        'checked_at', '2026-09-30',
        'confidence', 'high',
        'note', 'The upstream repository links to this current live app.',
        'source_urls', jsonb_build_array('https://github.com/MarinX/agewasm', 'https://agewasm.marin-basic.com/')
      ),
      true
    ),
    data_checked_at = now(),
    data_confidence = 'high',
    technical_facts_checked_at = now()
where slug = 'agewasm'
  and website_url = 'https://age-wasm.ey.r.appspot.com/';

update public.self_host_apps
set docs_url = 'https://agregarr.org/docs/installation/',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}'::text[]) || array['https://agregarr.org/docs/installation/']::text[]) as s(source_url)
      where source_url <> 'https://agregarr.org/docs/'
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docs', jsonb_build_object(
        'status', 'published',
        'checked_at', '2026-09-30',
        'confidence', 'high',
        'note', 'The current official documentation starts with the installation guide.',
        'source_urls', jsonb_build_array('https://agregarr.org/docs/installation/', 'https://github.com/agregarr/agregarr')
      )
    ),
    data_checked_at = now(),
    data_confidence = 'high',
    technical_facts_checked_at = now()
where slug = 'agregarr'
  and docs_url = 'https://agregarr.org/docs/';

update public.self_host_apps
set website_url = 'https://aimeos.org/laravel-ecommerce-package',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}'::text[]) || array['https://aimeos.org/laravel-ecommerce-package']::text[]) as s(source_url)
      where source_url <> 'https://aimeos.org/Laravel'
      order by source_url
    ),
    technical_fact_status = jsonb_set(
      replace(coalesce(technical_fact_status, '{}'::jsonb)::text, 'https://aimeos.org/Laravel', 'https://aimeos.org/laravel-ecommerce-package')::jsonb,
      '{website}',
      jsonb_build_object(
        'status', 'published',
        'checked_at', '2026-09-30',
        'confidence', 'high',
        'note', 'The official site redirects the former URL to this current product page.',
        'source_urls', jsonb_build_array('https://aimeos.org/laravel-ecommerce-package', 'https://github.com/aimeos/aimeos')
      ),
      true
    ),
    data_checked_at = now(),
    data_confidence = 'high',
    technical_facts_checked_at = now()
where slug = 'aimeos'
  and website_url = 'https://aimeos.org/Laravel';

update public.self_host_apps
set publisher_url = 'https://airbyte.com/company/about-us',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}'::text[]) || array['https://airbyte.com/company/about-us']::text[]) as s(source_url)
      where source_url <> 'https://airbyte.com/company'
      order by source_url
    ),
    technical_fact_status = jsonb_set(
      coalesce(technical_fact_status, '{}'::jsonb),
      '{publisher,source_urls}',
      jsonb_build_array('https://airbyte.com/company/about-us'),
      true
    ),
    data_checked_at = now(),
    data_confidence = 'high',
    technical_facts_checked_at = now()
where slug = 'airbyte'
  and publisher_url = 'https://airbyte.com/company';

commit;
