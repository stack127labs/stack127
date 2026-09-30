begin;

do $guard$
begin
  if (select count(*) from public.self_host_apps where slug=any(array['androiddebugbridge','boinc','zabbix-agent','dvwa-web','firefoxsyncserver','lancache-dns','matrix'])) <> 7 then
    raise exception 'Expected seven reviewed app records';
  end if;
end
$guard$;

update public.self_host_apps app set
  technical_fact_status=coalesce(app.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'docker_image',jsonb_build_object(
      'status','published','checked_at','2026-09-29','confidence',case when app.slug='boinc' then 'medium' else 'high' end,
      'note',case app.slug
        when 'androiddebugbridge' then 'The project documents this image for its ADB server.'
        when 'boinc' then 'The project lists this old, unmaintained client image.'
        when 'zabbix-agent' then 'Zabbix documents and publishes its agent image.'
        when 'dvwa-web' then 'The project publishes its GHCR image.'
        when 'firefoxsyncserver' then 'The archived project documents this experimental image.'
        when 'lancache-dns' then 'LanCache documents and publishes its DNS image.'
        when 'matrix' then 'Synapse documentation links the official image.'
      end,
      'source_urls',case app.slug
        when 'androiddebugbridge' then jsonb_build_array('https://github.com/BLBurgess/adb-hass-androidtv#readme','https://hub.docker.com/r/barnybbb/adb-hass-androidtv')
        when 'boinc' then jsonb_build_array('https://github.com/BOINC/boinc/wiki/Installing_on_Linux','https://hub.docker.com/r/boinc/client')
        when 'zabbix-agent' then jsonb_build_array('https://www.zabbix.com/documentation/current/en/manual/installation/containers','https://hub.docker.com/r/zabbix/zabbix-agent')
        when 'dvwa-web' then jsonb_build_array('https://github.com/digininja/DVWA/blob/master/README.md','https://github.com/digininja/DVWA/pkgs/container/dvwa')
        when 'firefoxsyncserver' then jsonb_build_array('https://github.com/mozilla-services/syncserver#runner-under-docker','https://hub.docker.com/r/mozilla/syncserver')
        when 'lancache-dns' then jsonb_build_array('https://lancache.net/docs/containers/dns/','https://hub.docker.com/r/lancachenet/lancache-dns')
        when 'matrix' then jsonb_build_array('https://element-hq.github.io/synapse/latest/setup/installation.html','https://hub.docker.com/r/matrixdotorg/synapse')
      end
    )
  ),
  data_source_urls=(select coalesce(array_agg(distinct url order by url),'{}'::text[]) from unnest(coalesce(app.data_source_urls,'{}'::text[])) refs(url)),
  updated_at=now()
where app.slug=any(array['androiddebugbridge','boinc','zabbix-agent','dvwa-web','firefoxsyncserver','lancache-dns','matrix']);

update public.self_host_app_install_options install set
  source_urls=app.data_source_urls,
  updated_at=now()
from public.self_host_apps app
where app.id=install.app_id and app.slug=any(array['androiddebugbridge','boinc','zabbix-agent','dvwa-web','firefoxsyncserver','lancache-dns','matrix']);

commit;
