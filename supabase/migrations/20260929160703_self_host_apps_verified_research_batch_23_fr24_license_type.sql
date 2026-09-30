begin;
do $review_guard$
begin
 if not exists(select 1 from public.self_host_apps where slug='adsb-fr24feed' and published=true and source_model='closed_source' and license='Proprietary vendor-distributed software' and license_type='unknown') then raise exception 'adsb-fr24feed license snapshot changed since review'; end if;
end;
$review_guard$;
update public.self_host_apps
set license_type='custom',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || '{"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The feeder is proprietary vendor-distributed software with no SPDX license identifier.","source_urls":["https://support.fr24.com/support/solutions/articles/3000118488/create_ticket","https://www.flightradar24.com/blog/wp-content/uploads/2023/02/fr24feed-manual.pdf"]}}'::jsonb,
    updated_at=now()
where slug='adsb-fr24feed';
commit;
