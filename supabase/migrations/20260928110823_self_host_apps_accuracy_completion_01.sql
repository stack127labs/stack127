do $$
declare
  published_count integer;
  duplicate_count integer;
  placeholder_count integer;
  bad_homepage_count integer;
  exact_ram_count integer;
  exact_storage_count integer;
  unverified_ram_count integer;
  unverified_storage_count integer;
  reviewed_target_count integer;
begin
  select count(*) into published_count from public.self_host_apps
    where published and self_hosting_status = 'self_hostable';
  select count(*) into duplicate_count from public.self_host_apps
    where published and slug = any(array[
      'adguardhome','bento-pdf','cal-com','calibreweb','calibreweb-automated','chyrplite',
      'directorylister','easyappointments','enigma-12-bbs','glowingbear','godoxy','homeassistant',
      'kiwiirc','libre-chat','libre-translate','litecart','nodered','pihole','rahoot','rocketchat',
      'signaturepdf','splitpro','statpingng','svgedit','thelounge','tinyfilemanager','transfersh',
      'wikijs','zwave-js-ui'
    ]);
  select count(*) into placeholder_count
    from public.self_host_app_install_options install
    cross join lateral jsonb_array_elements(coalesce(install.options, '[]'::jsonb)) option
    where option->>'note' = 'Publisher installation documentation; verify dependencies and platform support.';
  select count(*) into bad_homepage_count from public.self_host_apps
    where published and self_hosting_status = 'self_hostable' and (
      website_url ~* '^https?://raw[.]githubusercontent[.]com/'
      or website_url ~* '^https?://apps[.]yunohost[.]org/'
      or website_url ~* '^https?://hub[.]docker[.]com/'
      or website_url ~* '^https?://forums[.]unraid[.]net/'
      or website_url ~* '^https?://forums[.]lime-technology[.]com/'
    );
  select count(*) into exact_ram_count from public.self_host_apps
    where published and self_hosting_status = 'self_hostable'
      and resource_requirement_kind in ('official_minimum','official_recommended')
      and (ram_min_mb is not null or ram_recommended_mb is not null);
  select count(*) into exact_storage_count from public.self_host_apps
    where published and self_hosting_status = 'self_hostable'
      and resource_requirement_kind in ('official_minimum','official_recommended') and storage_min_gb is not null;
  select count(*) into unverified_ram_count from public.self_host_apps
    where published and self_hosting_status = 'self_hostable' and resource_requirement_kind = 'unknown'
      and (ram_min_mb is not null or ram_recommended_mb is not null);
  select count(*) into unverified_storage_count from public.self_host_apps
    where published and self_hosting_status = 'self_hostable' and resource_requirement_kind = 'unknown'
      and storage_min_gb is not null;
  select count(*) into reviewed_target_count from public.self_host_apps
    where published and slug = any(array[
      'atticd','cac-proxy','cinny','comfyui','cozy-cloud','dendrite','edx','element-call',
      'excalidash','form-io','geometrikks-timescaledb','g3proxy','helium','hydrogen',
      'influxdb-v2','jdownloader2','kimai2','kuvasz-uptime','lxd','neos','npmplus',
      'scratch','silverstripe','stockinfo','traccar','turtl','zimbra-collaboration','zola','calcom'
    ]);
  if published_count <> 4995 then raise exception 'Expected 4995 published apps; found %', published_count; end if;
  if duplicate_count <> 29 then raise exception 'Expected 29 reviewed duplicate rows; found %', duplicate_count; end if;
  if placeholder_count <> 888 then raise exception 'Expected 888 generic install placeholders; found %', placeholder_count; end if;
  if bad_homepage_count <> 1772 then raise exception 'Expected 1772 catalog or template homepage links; found %', bad_homepage_count; end if;
  if exact_ram_count <> 14 then raise exception 'Expected 14 stated RAM requirements; found %', exact_ram_count; end if;
  if exact_storage_count <> 3 then raise exception 'Expected 3 stated storage requirements; found %', exact_storage_count; end if;
  if unverified_ram_count <> 4 then raise exception 'Expected 4 unverified RAM values; found %', unverified_ram_count; end if;
  if unverified_storage_count <> 345 then raise exception 'Expected 345 unverified storage values; found %', unverified_storage_count; end if;
  if reviewed_target_count <> 29 then raise exception 'Expected 29 reviewed app rows; found %', reviewed_target_count; end if;
end;
$$;

-- Cal.com moved its public self-hosted edition to Cal.diy.
update public.self_host_apps
set name = 'Cal.diy',
    summary = 'Self-hosted scheduling platform for booking meetings and managing calendars.',
    publisher_name = 'Cal.diy community',
    publisher_type = 'community',
    publisher_url = 'https://github.com/calcom/cal.diy',
    source_model = 'open_source',
    license = 'MIT License',
    license_spdx_id = 'MIT',
    license_type = 'permissive',
    website_url = 'https://www.cal.diy/',
    source_code_url = 'https://github.com/calcom/cal.diy',
    docs_url = 'https://www.cal.diy/',
    install_docs_url = 'https://github.com/calcom/cal.diy#readme',
    docker_url = null,
    docker_image = null,
    docker_support = 'official',
    compose_url = 'https://github.com/calcom/cal.diy/blob/main/docker-compose.yml',
    compose_support = true,
    deployment_methods = array['docker','compose']::text[],
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://cal.com/blog/cal-diy-open-source-to-closed-source',
        'https://www.cal.diy/', 'https://github.com/calcom/cal.diy',
        'https://github.com/calcom/cal.diy#readme',
        'https://github.com/calcom/cal.diy/blob/main/docker-compose.yml'
      ]::text[]) item(source_url)
      where source_url not in ('https://cal.com/', 'https://github.com/calcom/cal.com',
        'https://github.com/calcom/docker/issues', 'https://hub.docker.com/r/calcom/cal.com',
        'https://apps.yunohost.org/app/calcom', 'https://github.com/yunohost-apps/calcom_ynh',
        'https://yunohost.org/en/apps',
        'https://raw.githubusercontent.com/calcom/cal.com/HEAD/README.md',
        'https://raw.githubusercontent.com/ibracorp/unraid-templates/master/cal.com/cal.com.xml',
        'https://raw.githubusercontent.com/YunoHost/apps/master/logos/calcom.png')
      order by source_url
    ),
    updated_at = now()
where slug = 'calcom' and published;

-- The old YunoHost Cal.com package is not an install source for Cal.diy.
update public.self_host_app_install_options
set options = coalesce((
      select jsonb_agg(option order by coalesce((option->>'sort_order')::integer, 0))
      from jsonb_array_elements(coalesce(options, '[]'::jsonb)) option
      where not (option->>'method' = 'yunohost' and option->>'url' = 'https://apps.yunohost.org/app/calcom')
    ), '[]'::jsonb),
    yunohost_urls = array(select url from unnest(coalesce(yunohost_urls, '{}'::text[])) item(url)
      where url <> 'https://apps.yunohost.org/app/calcom'),
    catalog_sources = coalesce((
      select jsonb_agg(source)
      from jsonb_array_elements(coalesce(catalog_sources, '[]'::jsonb)) source
      where source->>'source_url' <> 'https://apps.yunohost.org/app/calcom'
    ), '[]'::jsonb),
    source_urls = array(select distinct source_url from unnest(coalesce(source_urls, '{}'::text[])) item(source_url)
      where source_url <> 'https://apps.yunohost.org/app/calcom' order by source_url),
    updated_at = now()
where app_id = (select id from public.self_host_apps where slug = 'calcom');

delete from public.self_host_app_category_links
where app_id = (select id from public.self_host_apps where slug = 'calcom');
insert into public.self_host_app_category_links (app_id, category_id)
select app.id, category.id from public.self_host_apps app
join public.self_host_app_categories category on category.slug = 'calendars-contacts'
where app.slug = 'calcom'
on conflict do nothing;

-- Official project site and install links.
update public.self_host_apps
set name = 'ComfyUI',
    summary = 'Node-based interface for building and running local AI image, video, and audio workflows.',
    publisher_name = 'Comfy Org',
    publisher_url = 'https://github.com/Comfy-Org',
    website_url = 'https://comfy.org/',
    docs_url = 'https://docs.comfy.org/',
    install_docs_url = 'https://docs.comfy.org/installation/manual_install',
    docker_url = null, docker_image = null, docker_support = 'unknown',
    compose_url = null, compose_support = null, deployment_methods = array['native']::text[],
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) - 'docker' - 'compose',
    technical_facts_checked_at = now(),
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://comfy.org/','https://docs.comfy.org/',
        'https://docs.comfy.org/installation/manual_install',
        'https://docs.comfy.org/installation/system_requirements',
        'https://github.com/Comfy-Org/ComfyUI'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'comfyui' and published;
delete from public.self_host_app_category_links
where app_id = (select id from public.self_host_apps where slug = 'comfyui')
and category_id = (select id from public.self_host_app_categories where slug = 'content-publishing');

update public.self_host_apps
set publisher_name = 'Cozy Cloud', publisher_type = 'company', publisher_url = 'https://cozy.io/',
    license = 'GNU Affero General Public License v3.0', license_spdx_id = 'AGPL-3.0-only',
    license_type = 'copyleft', website_url = 'https://cozy.io/',
    source_code_url = 'https://github.com/cozy/cozy-stack',
    docs_url = 'https://docs.cozy.io/en/tutorials/selfhosting/',
    install_docs_url = 'https://docs.cozy.io/en/tutorials/selfhosting/docker/',
    docker_url = 'https://hub.docker.com/r/cozy/cozy-stack', docker_image = 'cozy/cozy-stack',
    docker_support = 'official',
    compose_url = 'https://docs.cozy.io/en/tutorials/selfhosting/docker/',
    compose_support = true, deployment_methods = array['docker','compose','native']::text[],
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://cozy.io/','https://github.com/cozy/cozy-stack',
        'https://docs.cozy.io/en/tutorials/selfhosting/',
        'https://docs.cozy.io/en/tutorials/selfhosting/docker/',
        'https://github.com/cozy/cozy-stack-compose'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'cozy-cloud' and published;

update public.self_host_apps
set name = 'Open edX',
    summary = 'Open-source learning platform for creating courses and running an online learning site.',
    publisher_name = 'Axim Collaborative', publisher_type = 'foundation',
    publisher_url = 'https://openedx.org/faq/who-governs-and-maintains-the-open-edx-project/',
    website_url = 'https://openedx.org/', source_code_url = 'https://github.com/openedx/openedx-platform',
    docs_url = 'https://docs.openedx.org/en/latest/',
    install_docs_url = 'https://docs.openedx.org/en/latest/site_ops/quickstarts/tutor_quickstart_ops.html',
    docker_url = null, docker_image = null, docker_support = 'community',
    compose_url = 'https://docs.openedx.org/en/latest/site_ops/quickstarts/tutor_quickstart_ops.html',
    compose_support = true, deployment_methods = array['compose']::text[],
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docker', jsonb_build_object('status','published','source_url','https://docs.openedx.org/en/latest/site_ops/quickstarts/tutor_quickstart_ops.html'),
      'compose', jsonb_build_object('status','published','source_url','https://docs.openedx.org/en/latest/site_ops/quickstarts/tutor_quickstart_ops.html')),
    technical_facts_checked_at = now(),
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://openedx.org/','https://openedx.org/faq/who-governs-and-maintains-the-open-edx-project/',
        'https://github.com/openedx/openedx-platform',
        'https://docs.openedx.org/en/latest/site_ops/install_configure_run_guide/installation/index.html',
        'https://docs.openedx.org/en/latest/site_ops/quickstarts/tutor_quickstart_ops.html'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'edx' and published;

update public.self_host_apps
set publisher_name = 'ByteDance', publisher_type = 'company', publisher_url = 'https://www.bytedance.com/',
    website_url = 'https://g3-project.readthedocs.io/projects/g3proxy/en/latest/',
    docs_url = 'https://g3-project.readthedocs.io/projects/g3proxy/en/latest/',
    install_docs_url = 'https://g3-project.readthedocs.io/projects/g3proxy/en/latest/',
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://g3-project.readthedocs.io/projects/g3proxy/en/latest/',
        'https://github.com/bytedance/g3/tree/master/g3proxy','https://www.bytedance.com/'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'g3proxy' and published;

update public.self_host_apps
set license = 'GNU Affero General Public License v3.0', license_spdx_id = 'AGPL-3.0-only',
    license_type = 'copyleft', website_url = 'https://turtl.it/',
    source_code_url = 'https://github.com/turtl/server',
    docs_url = 'https://github.com/turtl/server#readme',
    install_docs_url = 'https://github.com/turtl/server#readme',
    docker_url = null, docker_image = null, docker_support = 'official',
    compose_url = 'https://github.com/turtl/server/blob/HEAD/docker-compose.yml',
    compose_support = true, deployment_methods = array['native','docker','compose']::text[],
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://github.com/turtl/server','https://github.com/turtl/server#readme',
        'https://github.com/turtl/server/blob/HEAD/docker-compose.yml','https://turtl.it/'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'turtl' and published;

update public.self_host_apps
set publisher_name = 'Silverstripe', publisher_url = 'https://www.silverstripe.org/',
    source_code_url = 'https://github.com/silverstripe/silverstripe-cms',
    docs_url = 'https://docs.silverstripe.org/en/6/',
    install_docs_url = 'https://docs.silverstripe.org/en/6/getting_started/',
    deployment_methods = array['package','native']::text[],
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://github.com/silverstripe/silverstripe-cms','https://docs.silverstripe.org/en/6/',
        'https://docs.silverstripe.org/en/6/getting_started/','https://www.silverstripe.org/'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'silverstripe' and published;

update public.self_host_apps
set docs_url = 'https://docs.neos.io/',
    install_docs_url = 'https://docs.neos.io/guide/installation-development-setup',
    docker_url = null, docker_image = null, docker_support = 'unknown',
    compose_url = null, compose_support = null, deployment_methods = array['native']::text[],
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) - 'docker' - 'compose',
    technical_facts_checked_at = now(),
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://docs.neos.io/','https://docs.neos.io/guide/installation-development-setup',
        'https://docs.neos.io/guide/installation-development-setup/docker-and-docker-compose-setup'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'neos' and published;

update public.self_host_apps
set publisher_name = 'Zimbra', publisher_type = 'company', publisher_url = 'https://www.zimbra.com/',
    source_model = 'open_source',
    license = 'Zimbra Public License (source); Zimbra Public EULA (binaries)',
    license_spdx_id = null, license_type = 'mixed', pricing_model = 'freemium',
    source_code_url = 'https://github.com/Zimbra/zm-build',
    docs_url = 'https://www.zimbra.com/product/documentation/',
    install_docs_url = 'https://zimbra.github.io/installguides/latest/single.html',
    docker_url = null, docker_image = null, docker_support = 'unknown',
    compose_url = null, compose_support = null, deployment_methods = array['binary']::text[],
    ram_min_mb = 8192, storage_min_gb = null, resource_requirement_kind = 'official_minimum',
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) - 'docker' - 'compose',
    technical_facts_checked_at = now(),
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://www.zimbra.com/','https://www.zimbra.com/license/index.html',
        'https://github.com/Zimbra/zm-build','https://zimbra.github.io/installguides/latest/single.html'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'zimbra-collaboration' and published;

update public.self_host_apps
set website_url = 'https://www.traccar.org/', publisher_url = 'https://github.com/traccar',
    docs_url = 'https://www.traccar.org/documentation/',
    install_docs_url = 'https://www.traccar.org/docker/',
    docker_url = 'https://hub.docker.com/r/traccar/traccar',
    docker_image = 'traccar/traccar:latest', docker_support = 'official',
    compose_url = 'https://www.traccar.org/docker/', compose_support = true,
    deployment_methods = array['docker','compose','binary']::text[],
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docker', jsonb_build_object('status','published','source_url','https://www.traccar.org/docker/'),
      'compose', jsonb_build_object('status','published','source_url','https://www.traccar.org/docker/')),
    technical_facts_checked_at = now(),
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://www.traccar.org/','https://www.traccar.org/docker/',
        'https://www.traccar.org/documentation/','https://www.traccar.org/download/',
        'https://hub.docker.com/r/traccar/traccar'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'traccar' and published;

-- Correct high-confidence license and source mismatches from the project repositories.
with corrections(slug, license, spdx, license_kind, source_url, homepage, docs, install_docs) as (
  values
    ('atticd','Apache License 2.0','Apache-2.0','permissive','https://github.com/zhaofengli/attic','https://docs.attic.rs/','https://docs.attic.rs/','https://docs.attic.rs/'),
    ('cac-proxy','GNU Affero General Public License v3.0','AGPL-3.0','copyleft',null,null,null,null),
    ('cinny','GNU Affero General Public License v3.0','AGPL-3.0','copyleft',null,'https://cinny.in/','https://github.com/cinnyapp/cinny#readme','https://github.com/cinnyapp/cinny#readme'),
    ('dendrite','GNU Affero General Public License v3.0 or commercial license','AGPL-3.0','mixed',null,null,null,null),
    ('element-call','GNU Affero General Public License v3.0 or commercial license','AGPL-3.0','mixed',null,null,null,null),
    ('excalidash','GNU Affero General Public License v3.0','AGPL-3.0','copyleft',null,null,null,null),
    ('form-io','Open Software License 3.0','OSL-3.0','copyleft',null,'https://form.io/','https://github.com/formio/formio#readme','https://github.com/formio/formio#readme'),
    ('geometrikks-timescaledb','MIT License','MIT','permissive','https://github.com/GilbN/geometrikks','https://github.com/GilbN/geometrikks','https://github.com/GilbN/geometrikks#readme','https://github.com/GilbN/geometrikks#quickstart'),
    ('helium','Apache License 2.0','Apache-2.0','permissive',null,'https://www.heliumedu.com/','https://api.heliumedu.com/docs','https://github.com/HeliumEdu/platform#readme'),
    ('hydrogen','GNU Affero General Public License v3.0 or commercial license','AGPL-3.0','mixed','https://github.com/element-hq/hydrogen-web',null,null,null),
    ('influxdb-v2','MIT License','MIT','permissive','https://github.com/influxdata/influxdb/tree/main-2.x','https://docs.influxdata.com/influxdb/v2/','https://docs.influxdata.com/influxdb/v2/','https://docs.influxdata.com/influxdb/v2/install/'),
    ('jdownloader2','GNU General Public License',null,'copyleft',null,'https://jdownloader.org/','https://jdownloader.org/download/index','https://jdownloader.org/download/index'),
    ('kimai2','GNU Affero General Public License v3.0','AGPL-3.0','copyleft','https://github.com/kimai/kimai','https://www.kimai.org/','https://www.kimai.org/documentation/','https://www.kimai.org/documentation/installation.html'),
    ('kuvasz-uptime','GNU Affero General Public License v3.0','AGPL-3.0','copyleft',null,null,null,null),
    ('lxd','GNU Affero General Public License v3.0 (some files Apache-2.0)','AGPL-3.0','mixed',null,null,null,null),
    ('npmplus','GNU Affero General Public License v3.0','AGPL-3.0','copyleft',null,null,null,null),
    ('scratch','GNU Affero General Public License v3.0','AGPL-3.0','copyleft','https://github.com/scratchfoundation/scratch-editor','https://scratch.mit.edu/','https://github.com/scratchfoundation/scratch-editor#readme','https://github.com/scratchfoundation/scratch-editor#readme'),
    ('turtl','GNU Affero General Public License v3.0','AGPL-3.0','copyleft',null,null,null,null),
    ('zola','European Union Public Licence 1.2 (current code); MIT (older code)','EUPL-1.2','mixed',null,null,null,null)
)
update public.self_host_apps app
set license = corrections.license,
    license_spdx_id = corrections.spdx,
    license_type = corrections.license_kind::public.self_host_app_license_type,
    source_code_url = coalesce(corrections.source_url, app.source_code_url),
    website_url = coalesce(corrections.homepage, app.website_url),
    docs_url = coalesce(corrections.docs, app.docs_url),
    install_docs_url = coalesce(corrections.install_docs, app.install_docs_url),
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
        app.source_code_url, corrections.source_url, corrections.homepage, corrections.docs, corrections.install_docs
      ]::text[]) item(source_url)
      where source_url is not null order by source_url
    ),
    updated_at = now()
from corrections
where app.slug = corrections.slug and app.published;

-- Correct project facts with their own official pages.
update public.self_host_apps
set name = 'Attic',
    summary = 'Self-hosted Nix binary cache backed by S3-compatible storage.',
    publisher_name = 'zhaofengli', publisher_type = 'individual', publisher_url = 'https://github.com/zhaofengli',
    source_model = 'open_source', source_code_url = 'https://github.com/zhaofengli/attic',
    website_url = 'https://docs.attic.rs/', docs_url = 'https://docs.attic.rs/',
    install_docs_url = 'https://docs.attic.rs/',
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://github.com/zhaofengli/attic','https://docs.attic.rs/'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'atticd' and published;

update public.self_host_apps
set name = 'InfluxDB 2',
    summary = 'Open-source time-series database for storing and querying measurements and events.',
    source_model = 'open_source', website_url = 'https://docs.influxdata.com/influxdb/v2/',
    source_code_url = 'https://github.com/influxdata/influxdb/tree/main-2.x',
    docs_url = 'https://docs.influxdata.com/influxdb/v2/',
    install_docs_url = 'https://docs.influxdata.com/influxdb/v2/install/',
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://github.com/influxdata/influxdb/tree/main-2.x',
        'https://docs.influxdata.com/influxdb/v2/',
        'https://docs.influxdata.com/influxdb/v2/install/'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'influxdb-v2' and published;

update public.self_host_apps
set name = 'GeoMetrikks',
    summary = 'Tracks and maps requests from reverse-proxy access logs.',
    publisher_name = 'GilbN', publisher_type = 'individual', publisher_url = 'https://github.com/GilbN',
    source_model = 'open_source', source_code_url = 'https://github.com/GilbN/geometrikks',
    website_url = 'https://github.com/GilbN/geometrikks',
    docs_url = 'https://github.com/GilbN/geometrikks#readme',
    install_docs_url = 'https://github.com/GilbN/geometrikks#quickstart',
    docker_url = 'https://github.com/GilbN/geometrikks/pkgs/container/geometrikks',
    docker_image = 'ghcr.io/gilbn/geometrikks:latest', docker_support = 'official',
    compose_url = 'https://github.com/GilbN/geometrikks/blob/main/docker-compose.yml',
    compose_support = true, deployment_methods = array['docker','compose']::text[],
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://github.com/GilbN/geometrikks',
        'https://github.com/GilbN/geometrikks/blob/main/docker-compose.yml',
        'https://github.com/GilbN/geometrikks/pkgs/container/geometrikks'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'geometrikks-timescaledb' and published;

update public.self_host_apps
set source_code_url = 'https://github.com/oss-apps/split-pro',
    website_url = 'https://splitpro.app/',
    docs_url = 'https://github.com/oss-apps/split-pro#readme',
    install_docs_url = 'https://github.com/oss-apps/split-pro/blob/main/docker/README.md',
    docker_url = 'https://github.com/oss-apps/split-pro/pkgs/container/splitpro',
    docker_image = 'ghcr.io/oss-apps/splitpro:v2.1.5',
    docker_support = 'official',
    compose_url = 'https://github.com/oss-apps/split-pro/blob/main/docker/prod/compose.yml',
    compose_support = true,
    deployment_methods = array['docker','compose']::text[],
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://github.com/oss-apps/split-pro',
        'https://github.com/oss-apps/split-pro/blob/main/docker/README.md',
        'https://github.com/oss-apps/split-pro/blob/main/docker/prod/compose.yml',
        'https://github.com/oss-apps/split-pro/pkgs/container/splitpro',
        'https://apps.truenas.com/catalog/split-pro_community/'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'split-pro' and published;

delete from public.self_host_app_category_links
where app_id = (select id from public.self_host_apps where slug = 'split-pro');
insert into public.self_host_app_category_links (app_id, category_id)
select app.id, category.id from public.self_host_apps app
join public.self_host_app_categories category on category.slug = 'finance-budgeting'
where app.slug = 'split-pro'
on conflict do nothing;

update public.self_host_apps
set website_url = 'https://github.com/SVG-Edit/svgedit',
    docs_url = 'https://github.com/SVG-Edit/svgedit#readme',
    install_docs_url = 'https://github.com/SVG-Edit/svgedit#readme',
    data_source_urls = array(
      select distinct source_url from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
        'https://github.com/SVG-Edit/svgedit',
        'https://github.com/SVG-Edit/svgedit#readme',
        'https://apps.yunohost.org/app/svgedit'
      ]::text[]) item(source_url) order by source_url),
    updated_at = now()
where slug = 'svg-edit' and published;

-- A template, registry, forum, or appliance listing is not the app's homepage.
update public.self_host_apps
set website_url = null, updated_at = now()
where published and self_hosting_status = 'self_hostable' and (
  website_url ~* '^https?://raw[.]githubusercontent[.]com/'
  or website_url ~* '^https?://apps[.]yunohost[.]org/'
  or website_url ~* '^https?://hub[.]docker[.]com/'
  or website_url ~* '^https?://forums[.]unraid[.]net/'
  or website_url ~* '^https?://forums[.]lime-technology[.]com/'
);

update public.self_host_apps
set docs_url = regexp_replace(docs_url, '^https://raw[.]githubusercontent[.]com/([^/]+/[^/]+)/([^/]+)/(README[.](md|rst))$', 'https://github.com/\1/blob/\2/\3', 'i'),
    install_docs_url = regexp_replace(install_docs_url, '^https://raw[.]githubusercontent[.]com/([^/]+/[^/]+)/([^/]+)/(README[.](md|rst))$', 'https://github.com/\1/blob/\2/\3', 'i'),
    updated_at = now()
where published and self_hosting_status = 'self_hostable'
  and (docs_url ~* '^https://raw[.]githubusercontent[.]com/[^/]+/[^/]+/[^/]+/README[.](md|rst)$'
    or install_docs_url ~* '^https://raw[.]githubusercontent[.]com/[^/]+/[^/]+/[^/]+/README[.](md|rst)$');

-- Replace generic YunoHost links and raw installer files with app-specific catalog or project pages.
with app_links as (
  select app.id, app.source_code_url,
    (select url from unnest(coalesce(app.data_source_urls,'{}'::text[])) item(url)
      where url ~* '^https://apps[.]yunohost[.]org/app/[^/?#]+/?$' order by url limit 1) as yunohost_app_url
  from public.self_host_apps app
  where app.published and app.self_hosting_status = 'self_hostable'
)
update public.self_host_apps app
set docs_url = case when app.docs_url = 'https://yunohost.org/en/apps'
      then coalesce(app_links.source_code_url, app_links.yunohost_app_url) else app.docs_url end,
    install_docs_url = case when app.install_docs_url = 'https://yunohost.org/en/apps'
      then coalesce(app_links.yunohost_app_url, app_links.source_code_url) else app.install_docs_url end,
    updated_at = now()
from app_links
where app.id = app_links.id
  and (app.docs_url = 'https://yunohost.org/en/apps' or app.install_docs_url = 'https://yunohost.org/en/apps');

update public.self_host_apps app
set docs_url = case
      when app.docs_url ~* '^https?://raw[.]githubusercontent[.]com/.*[.](xml|json|png|svg)$'
        then app.source_code_url else app.docs_url end,
    install_docs_url = case
      when app.install_docs_url ~* '^https?://raw[.]githubusercontent[.]com/.*[.](xml|json|png|svg)$'
        then app.source_code_url else app.install_docs_url end,
    updated_at = now()
where app.published and app.self_hosting_status = 'self_hostable'
  and (app.docs_url ~* '^https?://raw[.]githubusercontent[.]com/.*[.](xml|json|png|svg)$'
    or app.install_docs_url ~* '^https?://raw[.]githubusercontent[.]com/.*[.](xml|json|png|svg)$');

update public.self_host_apps
set ram_min_mb = null, ram_recommended_mb = null, updated_at = now()
where published and self_hosting_status = 'self_hostable'
  and resource_requirement_kind = 'unknown'
  and (ram_min_mb is not null or ram_recommended_mb is not null);

update public.self_host_apps
set storage_min_gb = null, updated_at = now()
where published and self_hosting_status = 'self_hostable'
  and resource_requirement_kind = 'unknown' and storage_min_gb is not null;

-- All apps get an estimate when the publisher gives no requirement. Package caps stay separate.
with categories as (
  select link.app_id, array_agg(distinct category.slug) as slugs
  from public.self_host_app_category_links link
  join public.self_host_app_categories category on category.id = link.category_id
  group by link.app_id
), apps as (
  select app.id, app.slug, app.name, lower(coalesce(app.summary,'') || ' ' || app.name) as purpose,
    coalesce(categories.slugs, '{}'::text[]) as categories,
    coalesce(app.source_code_url, app.website_url, app.publisher_url, app.data_source_urls[1]) as source_url,
    app.ram_min_mb is null and app.ram_recommended_mb is null as needs_ram,
    app.storage_min_gb is null as needs_storage
  from public.self_host_apps app left join categories on categories.app_id = app.id
  where app.published and app.self_hosting_status = 'self_hostable'
), classified as (
  select apps.*,
    (categories && array['photos-galleries','file-sharing-sync','storage-backup','media-servers','music-audio','ebooks-libraries','email-newsletters','documents-pdfs']::text[]
      or purpose ~* '(photo library|media library|file hosting|cloud drive|backup|music server|video library|email server|mail server|document storage|e-book library|recordings)') as stores_user_data,
    ('ai-ml' = any(categories) and purpose ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation|comfyui)') as local_model
  from apps
), ranges as (
  select classified.*,
    case
      when slug = 'edx' then 4096
      when slug = 'cozy-cloud' then 2048
      when slug = 'traccar' then 512
      when local_model then 8192
      when 'ai-ml' = any(categories) then 2048
      when categories && array['databases','search']::text[] then 1024
      when categories && array['media-servers','video-conferencing','games']::text[] then 1024
      else 256
    end as ram_min,
    case
      when slug = 'edx' then 16384
      when slug = 'cozy-cloud' then 8192
      when slug = 'traccar' then 4096
      when local_model then 32768
      when 'ai-ml' = any(categories) then 8192
      when categories && array['databases','search','media-servers','video-conferencing','games']::text[] then 8192
      else 2048
    end as ram_max,
    case
      when slug in ('grafanapromtail','promtail') then 1
      when slug = 'zimbra-collaboration' then 100
      when slug = 'edx' then 20
      when slug = 'cozy-cloud' then 50
      when slug = 'traccar' then 5
      when local_model then 20
      when 'games' = any(categories) then 10
      when categories && array['databases','search','monitoring-status']::text[] then 5
      when stores_user_data then 50
      else 1
    end as storage_min,
    case
      when slug in ('grafanapromtail','promtail') then 10
      when slug = 'zimbra-collaboration' then 500
      when slug = 'edx' then 100
      when slug = 'cozy-cloud' then 500
      when slug = 'traccar' then 100
      when local_model then 100
      when 'games' = any(categories) then 100
      when categories && array['databases','search','monitoring-status']::text[] then 100
      when stores_user_data then 500
      else 20
    end as storage_max,
    case
      when slug = 'zimbra-collaboration' then 'Official production guidance starts at 100 GB for software and logs; mail storage needs extra space.'
      when local_model then 'Small local model workload; model size and outputs vary.'
      when categories && array['databases','search']::text[] then 'Small single-node service; data volume and request load vary.'
      when categories && array['media-servers','video-conferencing','games']::text[] then 'Small single-node service; active users and stored content vary.'
      else 'Typical small self-hosted instance; workload and stored data vary.'
    end as basis
  from classified
)
insert into public.self_host_app_resource_estimates (
  app_id, ram_estimate_min_mb, ram_estimate_max_mb, ram_estimate_kind, ram_estimate_confidence,
  ram_estimate_basis, ram_source_urls, ram_note, storage_estimate_min_gb, storage_estimate_max_gb,
  storage_estimate_kind, storage_estimate_confidence, storage_estimate_basis, storage_source_urls,
  storage_note, checked_at
)
select id, case when needs_ram then ram_min end, case when needs_ram then ram_max end,
  case when needs_ram then 'estimated' end, case when needs_ram then 'low' end,
  case when needs_ram then basis end, case when needs_ram and source_url is not null then array[source_url] else '{}'::text[] end, null,
  case when needs_storage then storage_min end, case when needs_storage then storage_max end,
  case when needs_storage then 'estimated' end, case when needs_storage then 'low' end,
  case when needs_storage then basis end, case when needs_storage and source_url is not null then array[source_url] else '{}'::text[] end,
  null, now()
from ranges
on conflict (app_id) do update set
  ram_estimate_min_mb = excluded.ram_estimate_min_mb,
  ram_estimate_max_mb = excluded.ram_estimate_max_mb,
  ram_estimate_kind = excluded.ram_estimate_kind,
  ram_estimate_confidence = excluded.ram_estimate_confidence,
  ram_estimate_basis = excluded.ram_estimate_basis,
  ram_source_urls = excluded.ram_source_urls,
  ram_note = null,
  storage_estimate_min_gb = excluded.storage_estimate_min_gb,
  storage_estimate_max_gb = excluded.storage_estimate_max_gb,
  storage_estimate_kind = excluded.storage_estimate_kind,
  storage_estimate_confidence = excluded.storage_estimate_confidence,
  storage_estimate_basis = excluded.storage_estimate_basis,
  storage_source_urls = excluded.storage_source_urls,
  storage_note = null,
  checked_at = excluded.checked_at, updated_at = now();

-- Remove fake install buttons and mark catalog packages as community installs.
with prepared as (
  select install.app_id,
    coalesce(jsonb_agg(
      case
        when option->>'method' in ('truenas_scale','unraid','umbrel','yunohost','casaos')
          then jsonb_set(option,'{support_level}','"community"'::jsonb,true)
        when option->>'method' = 'docker' and (
          option->>'source_url' ilike '%apps.truenas.com/%' or option->>'source_url' ilike '%apps.yunohost.org/%'
          or option->>'source_url' ilike '%getumbrel/umbrel-apps%' or option->>'source_url' ilike '%IceWhaleTech/CasaOS-AppStore%'
          or option->>'source_url' ilike '%unraid%')
          then jsonb_set(option,'{support_level}','"community"'::jsonb,true)
        else option
      end order by ordinal
    ) filter (where option->>'note' is distinct from 'Publisher installation documentation; verify dependencies and platform support.'),'[]'::jsonb) as options
  from public.self_host_app_install_options install
  cross join lateral jsonb_array_elements(coalesce(install.options,'[]'::jsonb)) with ordinality as items(option,ordinal)
  group by install.app_id
)
update public.self_host_app_install_options install
set options = prepared.options,
    native_urls = array(select url from unnest(coalesce(install.native_urls,'{}'::text[])) item(url)
      where not exists (select 1 from jsonb_array_elements(coalesce(install.options,'[]'::jsonb)) old_option
        where old_option->>'method'='native' and old_option->>'note'='Publisher installation documentation; verify dependencies and platform support.' and old_option->>'url'=url)),
    package_urls = array(select url from unnest(coalesce(install.package_urls,'{}'::text[])) item(url)
      where not exists (select 1 from jsonb_array_elements(coalesce(install.options,'[]'::jsonb)) old_option
        where old_option->>'method'='package' and old_option->>'note'='Publisher installation documentation; verify dependencies and platform support.' and old_option->>'url'=url)),
    binary_urls = array(select url from unnest(coalesce(install.binary_urls,'{}'::text[])) item(url)
      where not exists (select 1 from jsonb_array_elements(coalesce(install.options,'[]'::jsonb)) old_option
        where old_option->>'method'='binary' and old_option->>'note'='Publisher installation documentation; verify dependencies and platform support.' and old_option->>'url'=url)),
    source_urls = array(select distinct source_url from unnest(coalesce(install.source_urls,'{}'::text[])) item(source_url)
      where exists (select 1 from jsonb_array_elements(prepared.options) kept_option where kept_option->>'source_url'=source_url)
      order by source_url),
    updated_at = now()
from prepared where prepared.app_id = install.app_id;

-- Keep links and install sources from exact duplicates on the preferred listing.
with duplicate_map(duplicate_slug,keeper_slug) as (
  values
    ('adguardhome','adguard-home'),('bento-pdf','bentopdf'),('cal-com','calcom'),
    ('calibreweb','calibre-web'),('calibreweb-automated','calibre-web-automated'),
    ('chyrplite','chyrp-lite'),('directorylister','directory-lister'),
    ('easyappointments','easy-appointments'),('enigma-12-bbs','enigma-1-2-bbs'),
    ('glowingbear','glowing-bear'),('godoxy','go-doxy'),('homeassistant','home-assistant'),
    ('kiwiirc','kiwi-irc'),('libre-chat','librechat'),('libre-translate','libretranslate'),
    ('litecart','mycart'),('nodered','node-red'),('pihole','pi-hole'),('rahoot','razzia'),
    ('rocketchat','rocket-chat'),('signaturepdf','signature-pdf'),('splitpro','split-pro'),
    ('statpingng','statping-ng'),('svgedit','svg-edit'),('thelounge','the-lounge'),
    ('tinyfilemanager','tiny-file-manager'),('transfersh','transfer-sh'),
    ('wikijs','wiki-js'),('zwave-js-ui','z-wave-js-ui')
), merged as (
  select keeper.id,
    coalesce(keeper.website_url, duplicate.website_url) as website_url,
    coalesce(keeper.docs_url, duplicate.docs_url) as docs_url,
    coalesce(keeper.install_docs_url, duplicate.install_docs_url) as install_docs_url,
    array(select distinct source from unnest(coalesce(keeper.data_source_urls,'{}'::text[]) || coalesce(duplicate.data_source_urls,'{}'::text[])) item(source)
      where source is not null order by source) sources
  from duplicate_map
  join public.self_host_apps keeper on keeper.slug=duplicate_map.keeper_slug
  join public.self_host_apps duplicate on duplicate.slug=duplicate_map.duplicate_slug
  where duplicate_map.duplicate_slug <> 'cal-com'
)
update public.self_host_apps keeper
set website_url=merged.website_url,
    docs_url=merged.docs_url,
    install_docs_url=merged.install_docs_url,
    data_source_urls=merged.sources,
    updated_at=now()
from merged where keeper.id=merged.id;

with duplicate_map(duplicate_slug,keeper_slug) as (
  values
    ('adguardhome','adguard-home'),('bento-pdf','bentopdf'),('cal-com','calcom'),
    ('calibreweb','calibre-web'),('calibreweb-automated','calibre-web-automated'),
    ('chyrplite','chyrp-lite'),('directorylister','directory-lister'),
    ('easyappointments','easy-appointments'),('enigma-12-bbs','enigma-1-2-bbs'),
    ('glowingbear','glowing-bear'),('godoxy','go-doxy'),('homeassistant','home-assistant'),
    ('kiwiirc','kiwi-irc'),('libre-chat','librechat'),('libre-translate','libretranslate'),
    ('litecart','mycart'),('nodered','node-red'),('pihole','pi-hole'),('rahoot','razzia'),
    ('rocketchat','rocket-chat'),('signaturepdf','signature-pdf'),('splitpro','split-pro'),
    ('statpingng','statping-ng'),('svgedit','svg-edit'),('thelounge','the-lounge'),
    ('tinyfilemanager','tiny-file-manager'),('transfersh','transfer-sh'),
    ('wikijs','wiki-js'),('zwave-js-ui','z-wave-js-ui')
), pairs as (
  select keeper.app_id as keeper_id,
    keeper.options as keeper_options, duplicate.options as duplicate_options,
    keeper.catalog_sources as keeper_catalog_sources, duplicate.catalog_sources as duplicate_catalog_sources,
    keeper.docker_urls as keeper_docker_urls, duplicate.docker_urls as duplicate_docker_urls,
    keeper.docker_images as keeper_docker_images, duplicate.docker_images as duplicate_docker_images,
    keeper.compose_urls as keeper_compose_urls, duplicate.compose_urls as duplicate_compose_urls,
    keeper.truenas_scale_urls as keeper_truenas_scale_urls, duplicate.truenas_scale_urls as duplicate_truenas_scale_urls,
    keeper.unraid_urls as keeper_unraid_urls, duplicate.unraid_urls as duplicate_unraid_urls,
    keeper.umbrel_urls as keeper_umbrel_urls, duplicate.umbrel_urls as duplicate_umbrel_urls,
    keeper.yunohost_urls as keeper_yunohost_urls, duplicate.yunohost_urls as duplicate_yunohost_urls,
    keeper.casaos_urls as keeper_casaos_urls, duplicate.casaos_urls as duplicate_casaos_urls,
    keeper.runtipi_urls as keeper_runtipi_urls, duplicate.runtipi_urls as duplicate_runtipi_urls,
    keeper.cosmos_urls as keeper_cosmos_urls, duplicate.cosmos_urls as duplicate_cosmos_urls,
    keeper.openmediavault_urls as keeper_openmediavault_urls, duplicate.openmediavault_urls as duplicate_openmediavault_urls,
    keeper.synology_urls as keeper_synology_urls, duplicate.synology_urls as duplicate_synology_urls,
    keeper.qnap_urls as keeper_qnap_urls, duplicate.qnap_urls as duplicate_qnap_urls,
    keeper.proxmox_urls as keeper_proxmox_urls, duplicate.proxmox_urls as duplicate_proxmox_urls,
    keeper.home_assistant_os_urls as keeper_home_assistant_os_urls, duplicate.home_assistant_os_urls as duplicate_home_assistant_os_urls,
    keeper.kubernetes_urls as keeper_kubernetes_urls, duplicate.kubernetes_urls as duplicate_kubernetes_urls,
    keeper.helm_urls as keeper_helm_urls, duplicate.helm_urls as duplicate_helm_urls,
    keeper.native_urls as keeper_native_urls, duplicate.native_urls as duplicate_native_urls,
    keeper.binary_urls as keeper_binary_urls, duplicate.binary_urls as duplicate_binary_urls,
    keeper.package_urls as keeper_package_urls, duplicate.package_urls as duplicate_package_urls,
    keeper.other_urls as keeper_other_urls, duplicate.other_urls as duplicate_other_urls,
    keeper.source_urls as keeper_source_urls, duplicate.source_urls as duplicate_source_urls
  from duplicate_map
  join public.self_host_apps keeper_app on keeper_app.slug=duplicate_map.keeper_slug
  join public.self_host_apps duplicate_app on duplicate_app.slug=duplicate_map.duplicate_slug
  join public.self_host_app_install_options keeper on keeper.app_id=keeper_app.id
  join public.self_host_app_install_options duplicate on duplicate.app_id=duplicate_app.id
  where duplicate_map.duplicate_slug <> 'cal-com'
), merged as (
  select keeper_id,
    coalesce((
      select jsonb_agg(option order by sort_order, method, url)
      from (
        select distinct on (entry->>'method', entry->>'url')
          entry as option,
          coalesce((entry->>'sort_order')::integer, 0) as sort_order,
          coalesce(entry->>'method', '') as method,
          coalesce(entry->>'url', '') as url
        from jsonb_array_elements(coalesce(keeper_options, '[]'::jsonb) || coalesce(duplicate_options, '[]'::jsonb)) with ordinality as options(entry, ordinal)
        where entry->>'note' is distinct from 'Publisher installation documentation; verify dependencies and platform support.'
        order by entry->>'method', entry->>'url', ordinal
      ) unique_options
    ), '[]'::jsonb) as options,
    coalesce((
      select jsonb_agg(entry order by entry->>'source', entry->>'source_url')
      from (
        select distinct entry
        from jsonb_array_elements(coalesce(keeper_catalog_sources, '[]'::jsonb) || coalesce(duplicate_catalog_sources, '[]'::jsonb)) as sources(entry)
      ) unique_sources
    ), '[]'::jsonb) as catalog_sources,
    array(select distinct url from unnest(coalesce(keeper_docker_urls,'{}'::text[]) || coalesce(duplicate_docker_urls,'{}'::text[])) item(url) where url is not null order by url) as docker_urls,
    array(select distinct url from unnest(coalesce(keeper_docker_images,'{}'::text[]) || coalesce(duplicate_docker_images,'{}'::text[])) item(url) where url is not null order by url) as docker_images,
    array(select distinct url from unnest(coalesce(keeper_compose_urls,'{}'::text[]) || coalesce(duplicate_compose_urls,'{}'::text[])) item(url) where url is not null order by url) as compose_urls,
    array(select distinct url from unnest(coalesce(keeper_truenas_scale_urls,'{}'::text[]) || coalesce(duplicate_truenas_scale_urls,'{}'::text[])) item(url) where url is not null order by url) as truenas_scale_urls,
    array(select distinct url from unnest(coalesce(keeper_unraid_urls,'{}'::text[]) || coalesce(duplicate_unraid_urls,'{}'::text[])) item(url) where url is not null order by url) as unraid_urls,
    array(select distinct url from unnest(coalesce(keeper_umbrel_urls,'{}'::text[]) || coalesce(duplicate_umbrel_urls,'{}'::text[])) item(url) where url is not null order by url) as umbrel_urls,
    array(select distinct url from unnest(coalesce(keeper_yunohost_urls,'{}'::text[]) || coalesce(duplicate_yunohost_urls,'{}'::text[])) item(url) where url is not null order by url) as yunohost_urls,
    array(select distinct url from unnest(coalesce(keeper_casaos_urls,'{}'::text[]) || coalesce(duplicate_casaos_urls,'{}'::text[])) item(url) where url is not null order by url) as casaos_urls,
    array(select distinct url from unnest(coalesce(keeper_runtipi_urls,'{}'::text[]) || coalesce(duplicate_runtipi_urls,'{}'::text[])) item(url) where url is not null order by url) as runtipi_urls,
    array(select distinct url from unnest(coalesce(keeper_cosmos_urls,'{}'::text[]) || coalesce(duplicate_cosmos_urls,'{}'::text[])) item(url) where url is not null order by url) as cosmos_urls,
    array(select distinct url from unnest(coalesce(keeper_openmediavault_urls,'{}'::text[]) || coalesce(duplicate_openmediavault_urls,'{}'::text[])) item(url) where url is not null order by url) as openmediavault_urls,
    array(select distinct url from unnest(coalesce(keeper_synology_urls,'{}'::text[]) || coalesce(duplicate_synology_urls,'{}'::text[])) item(url) where url is not null order by url) as synology_urls,
    array(select distinct url from unnest(coalesce(keeper_qnap_urls,'{}'::text[]) || coalesce(duplicate_qnap_urls,'{}'::text[])) item(url) where url is not null order by url) as qnap_urls,
    array(select distinct url from unnest(coalesce(keeper_proxmox_urls,'{}'::text[]) || coalesce(duplicate_proxmox_urls,'{}'::text[])) item(url) where url is not null order by url) as proxmox_urls,
    array(select distinct url from unnest(coalesce(keeper_home_assistant_os_urls,'{}'::text[]) || coalesce(duplicate_home_assistant_os_urls,'{}'::text[])) item(url) where url is not null order by url) as home_assistant_os_urls,
    array(select distinct url from unnest(coalesce(keeper_kubernetes_urls,'{}'::text[]) || coalesce(duplicate_kubernetes_urls,'{}'::text[])) item(url) where url is not null order by url) as kubernetes_urls,
    array(select distinct url from unnest(coalesce(keeper_helm_urls,'{}'::text[]) || coalesce(duplicate_helm_urls,'{}'::text[])) item(url) where url is not null order by url) as helm_urls,
    array(select distinct url from unnest(coalesce(keeper_native_urls,'{}'::text[]) || coalesce(duplicate_native_urls,'{}'::text[])) item(url) where url is not null order by url) as native_urls,
    array(select distinct url from unnest(coalesce(keeper_binary_urls,'{}'::text[]) || coalesce(duplicate_binary_urls,'{}'::text[])) item(url) where url is not null order by url) as binary_urls,
    array(select distinct url from unnest(coalesce(keeper_package_urls,'{}'::text[]) || coalesce(duplicate_package_urls,'{}'::text[])) item(url) where url is not null order by url) as package_urls,
    array(select distinct url from unnest(coalesce(keeper_other_urls,'{}'::text[]) || coalesce(duplicate_other_urls,'{}'::text[])) item(url) where url is not null order by url) as other_urls,
    array(select distinct url from unnest(coalesce(keeper_source_urls,'{}'::text[]) || coalesce(duplicate_source_urls,'{}'::text[])) item(url) where url is not null order by url) as source_urls
  from pairs
)
update public.self_host_app_install_options install
set options=merged.options,
    catalog_sources=merged.catalog_sources,
    docker_urls=merged.docker_urls,
    docker_images=merged.docker_images,
    compose_urls=merged.compose_urls,
    truenas_scale_urls=merged.truenas_scale_urls,
    unraid_urls=merged.unraid_urls,
    umbrel_urls=merged.umbrel_urls,
    yunohost_urls=merged.yunohost_urls,
    casaos_urls=merged.casaos_urls,
    runtipi_urls=merged.runtipi_urls,
    cosmos_urls=merged.cosmos_urls,
    openmediavault_urls=merged.openmediavault_urls,
    synology_urls=merged.synology_urls,
    qnap_urls=merged.qnap_urls,
    proxmox_urls=merged.proxmox_urls,
    home_assistant_os_urls=merged.home_assistant_os_urls,
    kubernetes_urls=merged.kubernetes_urls,
    helm_urls=merged.helm_urls,
    native_urls=merged.native_urls,
    binary_urls=merged.binary_urls,
    package_urls=merged.package_urls,
    other_urls=merged.other_urls,
    source_urls=merged.source_urls,
    updated_at=now()
from merged where merged.keeper_id=install.app_id;

update public.self_host_apps set published=false,updated_at=now()
where published and slug=any(array[
  'adguardhome','bento-pdf','cal-com','calibreweb','calibreweb-automated','chyrplite',
  'directorylister','easyappointments','enigma-12-bbs','glowingbear','godoxy','homeassistant',
  'kiwiirc','libre-chat','libre-translate','litecart','nodered','pihole','rahoot','rocketchat',
  'signaturepdf','splitpro','statpingng','svgedit','thelounge','tinyfilemanager','transfersh',
  'wikijs','zwave-js-ui'
]);
