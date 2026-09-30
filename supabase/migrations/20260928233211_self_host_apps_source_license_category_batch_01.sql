begin;
do $migration$
declare
  v_app uuid;
  v_options jsonb;
  v_categories text[];
  v_count integer;
begin
  select id into v_app from public.self_host_apps
  where slug='httpbin' and published is true
    and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null
    and license_spdx_id is null and license_type='unknown'
    and publisher_name='httpbin' and publisher_type='unknown'
    and docker_support='community';
  if v_app is null then raise exception 'httpbin record changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is distinct from '[
    {"url":"https://hub.docker.com/r/kennethreitz/httpbin","note":"Community-maintained image. Verify the publisher before pulling.","image":"kennethreitz/httpbin:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/kennethreitz/httpbin","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/httpbin.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/httpbin.xml","support_level":"community"}
  ]'::jsonb then raise exception 'httpbin install options changed since review'; end if;
  update public.self_host_app_install_options set
    options=jsonb_build_array(
      jsonb_build_object('url','https://hub.docker.com/r/kennethreitz/httpbin','note','Publisher-maintained image documented by the httpbin project.','image','kennethreitz/httpbin:latest','label','Official Docker image','method','docker','sort_order',10,'source_url','https://github.com/postmanlabs/httpbin/blob/master/README.md','support_level','official'),
      v_options->1
    ),
    docker_urls=array['https://hub.docker.com/r/kennethreitz/httpbin']::text[],
    docker_images=array['kennethreitz/httpbin:latest']::text[],
    source_urls=array(select distinct url from unnest(coalesce(source_urls,'{}')||array['https://github.com/postmanlabs/httpbin','https://github.com/postmanlabs/httpbin/blob/master/README.md','https://hub.docker.com/r/kennethreitz/httpbin']::text[]) as refs(url) order by url),
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'httpbin install option update failed'; end if;
  update public.self_host_apps set
    source_code_url='https://github.com/postmanlabs/httpbin',source_code_host='github',source_model='open_source',
    license='ISC',license_spdx_id='ISC',license_type='permissive',
    publisher_name='Kenneth Reitz',publisher_type='community',docker_support='official',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://httpbin.org/','https://github.com/postmanlabs/httpbin',
      'https://github.com/postmanlabs/httpbin/blob/master/LICENSE',
      'https://github.com/postmanlabs/httpbin/blob/master/README.md',
      'https://hub.docker.com/r/kennethreitz/httpbin'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README identifies the maintained httpbin source repository.','source_urls',jsonb_build_array('https://github.com/postmanlabs/httpbin')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project LICENSE declares the ISC License.','source_urls',jsonb_build_array('https://github.com/postmanlabs/httpbin/blob/master/LICENSE')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README identifies httpbin as a Kenneth Reitz project.','source_urls',jsonb_build_array('https://github.com/postmanlabs/httpbin/blob/master/README.md')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README documents the kennethreitz/httpbin image.','source_urls',jsonb_build_array('https://github.com/postmanlabs/httpbin/blob/master/README.md','https://hub.docker.com/r/kennethreitz/httpbin'))
    ),
    updated_at=now()
  where id=v_app and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null and license_spdx_id is null
    and license_type='unknown' and publisher_name='httpbin'
    and publisher_type='unknown' and docker_support='community';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'httpbin fact update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='hugo' and published is true
    and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null
    and license_spdx_id is null and license_type='unknown'
    and publisher_name='Hugo' and publisher_type='unknown'
    and docs_url='https://github.com/klakegg/docker-hugo/issues'
    and install_docs_url='https://github.com/klakegg/docker-hugo/issues';
  if v_app is null then raise exception 'Hugo record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['networking-dns']::text[] then raise exception 'Hugo categories changed since review'; end if;
  update public.self_host_apps set
    source_code_url='https://github.com/gohugoio/hugo',source_code_host='github',source_model='open_source',
    license='Apache-2.0',license_spdx_id='Apache-2.0',license_type='permissive',
    publisher_name='Hugo Authors',publisher_type='community',
    docs_url='https://gohugo.io/documentation/',install_docs_url='https://gohugo.io/installation/',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://gohugo.io/','https://gohugo.io/documentation/','https://gohugo.io/installation/',
      'https://github.com/gohugoio/hugo','https://github.com/gohugoio/hugo/blob/master/LICENSE'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Hugo identifies its source repository on its official site.','source_urls',jsonb_build_array('https://gohugo.io/','https://github.com/gohugoio/hugo')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Hugo states that it is distributed under the Apache 2.0 License.','source_urls',jsonb_build_array('https://gohugo.io/','https://github.com/gohugoio/hugo/blob/master/LICENSE')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Hugo site credits the Hugo Authors.','source_urls',jsonb_build_array('https://gohugo.io/'))
    ),
    updated_at=now()
  where id=v_app and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null and license_spdx_id is null
    and license_type='unknown' and publisher_name='Hugo' and publisher_type='unknown'
    and docs_url='https://github.com/klakegg/docker-hugo/issues'
    and install_docs_url='https://github.com/klakegg/docker-hugo/issues';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Hugo fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Hugo category set changed'; end if;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='content-publishing';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Hugo category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='kapacitor' and published is true and name='kapacitor'
    and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null
    and license_spdx_id is null and license_type='unknown'
    and publisher_name='kapacitor' and publisher_type='unknown'
    and summary='Data processing engine that reacts to events from time-series databases and services.'
    and docs_url='https://hub.docker.com/_/kapacitor/'
    and install_docs_url='https://hub.docker.com/_/kapacitor/';
  if v_app is null then raise exception 'Kapacitor record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['video-conferencing']::text[] then raise exception 'Kapacitor categories changed since review'; end if;
  update public.self_host_apps set
    name='Kapacitor',summary='Processes time-series data to create alerts, run ETL jobs, and detect anomalies.',
    source_code_url='https://github.com/influxdata/kapacitor',source_code_host='github',source_model='open_source',
    license='MIT',license_spdx_id='MIT',license_type='permissive',
    publisher_name='InfluxData',publisher_type='company',
    docs_url='https://docs.influxdata.com/kapacitor/v1/',
    install_docs_url='https://docs.influxdata.com/kapacitor/v1/introduction/install-docker/',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://www.influxdata.com/time-series-platform/kapacitor/',
      'https://docs.influxdata.com/kapacitor/v1/',
      'https://docs.influxdata.com/kapacitor/v1/introduction/install-docker/',
      'https://github.com/influxdata/kapacitor',
      'https://github.com/influxdata/kapacitor/blob/master/LICENSE',
      'https://hub.docker.com/_/kapacitor/'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','InfluxData maintains the Kapacitor source repository.','source_urls',jsonb_build_array('https://github.com/influxdata/kapacitor')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Kapacitor repository declares the MIT License.','source_urls',jsonb_build_array('https://github.com/influxdata/kapacitor/blob/master/LICENSE')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Kapacitor is documented and maintained by InfluxData.','source_urls',jsonb_build_array('https://docs.influxdata.com/kapacitor/v1/'))
    ),
    updated_at=now()
  where id=v_app and name='kapacitor' and source_code_url is null
    and source_code_host='unknown' and source_model='closed_source'
    and license is null and license_spdx_id is null and license_type='unknown'
    and publisher_name='kapacitor' and publisher_type='unknown'
    and docs_url='https://hub.docker.com/_/kapacitor/'
    and install_docs_url='https://hub.docker.com/_/kapacitor/';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Kapacitor fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Kapacitor category set changed'; end if;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='monitoring-status';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Kapacitor category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='mailcatcher' and published is true
    and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null
    and license_spdx_id is null and license_type='unknown'
    and publisher_name='MailCatcher' and publisher_type='unknown'
    and docker_support='community'
    and docs_url='https://github.com/sj26/mailcatcher/issues'
    and install_docs_url='https://github.com/sj26/mailcatcher/issues';
  if v_app is null then raise exception 'MailCatcher record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','email-newsletters','system-admin-hosting']::text[] then raise exception 'MailCatcher categories changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is distinct from '[
    {"url":"https://hub.docker.com/r/sj26/mailcatcher","note":"Community-maintained image. Verify the publisher before pulling.","image":"sj26/mailcatcher:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/sj26/mailcatcher","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/mailcatcher.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/mailcatcher.xml","support_level":"community"}
  ]'::jsonb then raise exception 'MailCatcher install options changed since review'; end if;
  update public.self_host_app_install_options set
    options=jsonb_build_array(
      jsonb_build_object('url','https://hub.docker.com/r/sj26/mailcatcher','note','Maintainer-published Docker image documented in the project README.','image','sj26/mailcatcher:latest','label','Official Docker image','method','docker','sort_order',10,'source_url','https://github.com/sj26/mailcatcher/blob/main/README.md','support_level','official'),
      v_options->1
    ),
    docker_urls=array['https://hub.docker.com/r/sj26/mailcatcher']::text[],
    docker_images=array['sj26/mailcatcher:latest']::text[],
    source_urls=array(select distinct url from unnest(coalesce(source_urls,'{}')||array['https://github.com/sj26/mailcatcher','https://github.com/sj26/mailcatcher/blob/main/README.md','https://hub.docker.com/r/sj26/mailcatcher']::text[]) as refs(url) order by url),
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MailCatcher install option update failed'; end if;
  update public.self_host_apps set
    source_code_url='https://github.com/sj26/mailcatcher',source_code_host='github',source_model='open_source',
    license='MIT',license_spdx_id='MIT',license_type='permissive',
    publisher_name='Samuel Cochran',publisher_type='community',docker_support='official',
    docs_url='https://github.com/sj26/mailcatcher',install_docs_url='https://github.com/sj26/mailcatcher/blob/main/README.md',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://mailcatcher.me/','https://github.com/sj26/mailcatcher',
      'https://github.com/sj26/mailcatcher/blob/main/LICENSE',
      'https://github.com/sj26/mailcatcher/blob/main/README.md',
      'https://hub.docker.com/r/sj26/mailcatcher'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Samuel Cochran publishes the MailCatcher project source.','source_urls',jsonb_build_array('https://github.com/sj26/mailcatcher')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README identifies MailCatcher as MIT licensed.','source_urls',jsonb_build_array('https://github.com/sj26/mailcatcher/blob/main/README.md','https://github.com/sj26/mailcatcher/blob/main/LICENSE')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project identifies Samuel Cochran as its copyright holder and maintainer.','source_urls',jsonb_build_array('https://github.com/sj26/mailcatcher')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README documents the sj26/mailcatcher Docker image.','source_urls',jsonb_build_array('https://github.com/sj26/mailcatcher/blob/main/README.md','https://hub.docker.com/r/sj26/mailcatcher'))
    ),
    updated_at=now()
  where id=v_app and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null and license_spdx_id is null
    and license_type='unknown' and publisher_name='MailCatcher'
    and publisher_type='unknown' and docker_support='community'
    and docs_url='https://github.com/sj26/mailcatcher/issues'
    and install_docs_url='https://github.com/sj26/mailcatcher/issues';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MailCatcher fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>3 then raise exception 'MailCatcher category set changed'; end if;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='developer-tools';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MailCatcher category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='swagger-editor' and published is true
    and name='Swagger-Editor'
    and summary='Swagger Editor lets you edit OpenAPI API definitions (OpenAPI 2.0 and OpenAPI 3.0.3) in JSON or YAML format inside your browser and to preview documentations.'
    and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null
    and license_spdx_id is null and license_type='unknown'
    and publisher_name='Swagger-Editor' and publisher_type='unknown'
    and docs_url='https://github.com/swagger-api/swagger-editor/issues'
    and install_docs_url='https://github.com/swagger-api/swagger-editor/issues'
    and docker_url='https://hub.docker.com/r/swaggerapi/swagger-editor'
    and docker_image='swaggerapi/swagger-editor:latest' and docker_support='community';
  if v_app is null then raise exception 'Swagger Editor record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['documents-pdfs','remote-access','system-admin-hosting']::text[] then raise exception 'Swagger Editor categories changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is distinct from '[
    {"url":"https://hub.docker.com/r/swaggerapi/swagger-editor","note":"Community-maintained image. Verify the publisher before pulling.","image":"swaggerapi/swagger-editor:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/swaggerapi/swagger-editor","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/swagger_editor.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/swagger_editor.xml","support_level":"community"}
  ]'::jsonb then raise exception 'Swagger Editor install options changed since review'; end if;
  update public.self_host_app_install_options set
    options=jsonb_build_array(
      jsonb_build_object('url','https://swagger.io/docs/open-source-tools/swagger-editor/','note','Official image and run instructions from the Swagger Editor docs.','image','docker.swagger.io/swaggerapi/swagger-editor:next-v5','label','Official Docker image','method','docker','sort_order',10,'source_url','https://swagger.io/docs/open-source-tools/swagger-editor/','support_level','official'),
      v_options->1
    ),
    docker_urls=array['https://swagger.io/docs/open-source-tools/swagger-editor/']::text[],
    docker_images=array['docker.swagger.io/swaggerapi/swagger-editor:next-v5']::text[],
    source_urls=array(select distinct url from unnest(coalesce(source_urls,'{}')||array['https://swagger.io/docs/open-source-tools/swagger-editor/','https://github.com/swagger-api/swagger-editor']::text[]) as refs(url) order by url),
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Swagger Editor install option update failed'; end if;
  update public.self_host_apps set
    name='Swagger Editor',summary='Browser-based editor for designing and validating OpenAPI and AsyncAPI definitions.',
    source_code_url='https://github.com/swagger-api/swagger-editor',source_code_host='github',source_model='open_source',
    license='Apache-2.0',license_spdx_id='Apache-2.0',license_type='permissive',
    publisher_name='SmartBear',publisher_type='company',
    docs_url='https://swagger.io/docs/open-source-tools/swagger-editor/',
    install_docs_url='https://swagger.io/docs/open-source-tools/swagger-editor/',
    docker_url='https://swagger.io/docs/open-source-tools/swagger-editor/',
    docker_image='docker.swagger.io/swaggerapi/swagger-editor:next-v5',docker_support='official',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://editor.swagger.io/','https://swagger.io/docs/open-source-tools/swagger-editor/',
      'https://github.com/swagger-api/swagger-editor',
      'https://github.com/swagger-api/swagger-editor/tree/main/LICENSES',
      'https://smartbear.com/'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Swagger Editor links to its official source repository.','source_urls',jsonb_build_array('https://github.com/swagger-api/swagger-editor')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Swagger Editor documentation states that the project uses Apache 2.0.','source_urls',jsonb_build_array('https://swagger.io/docs/open-source-tools/swagger-editor/')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official product documentation is published by SmartBear.','source_urls',jsonb_build_array('https://swagger.io/docs/open-source-tools/swagger-editor/','https://smartbear.com/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Swagger Editor documents this image from docker.swagger.io.','source_urls',jsonb_build_array('https://swagger.io/docs/open-source-tools/swagger-editor/'))
    ),
    updated_at=now()
  where id=v_app and name='Swagger-Editor'
    and summary='Swagger Editor lets you edit OpenAPI API definitions (OpenAPI 2.0 and OpenAPI 3.0.3) in JSON or YAML format inside your browser and to preview documentations.'
    and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null and license_spdx_id is null
    and license_type='unknown' and publisher_name='Swagger-Editor'
    and publisher_type='unknown' and docs_url='https://github.com/swagger-api/swagger-editor/issues'
    and install_docs_url='https://github.com/swagger-api/swagger-editor/issues'
    and docker_url='https://hub.docker.com/r/swaggerapi/swagger-editor'
    and docker_image='swaggerapi/swagger-editor:latest' and docker_support='community';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Swagger Editor fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>3 then raise exception 'Swagger Editor category set changed'; end if;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='developer-tools';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Swagger Editor category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='alloy' and published is true
    and website_url is null and publisher_name='grafana' and publisher_type='community'
    and docs_url='https://github.com/grafana/alloy'
    and install_docs_url='https://github.com/grafana/alloy';
  if v_app is null then raise exception 'Grafana Alloy record changed since review'; end if;
  update public.self_host_apps set
    website_url='https://grafana.com/oss/alloy-opentelemetry-collector/',
    publisher_name='Grafana Labs',publisher_type='company',
    docs_url='https://grafana.com/docs/alloy/latest/',
    install_docs_url='https://grafana.com/docs/alloy/latest/set-up/install/',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://grafana.com/oss/alloy-opentelemetry-collector/',
      'https://grafana.com/docs/alloy/latest/',
      'https://grafana.com/docs/alloy/latest/set-up/install/',
      'https://github.com/grafana/alloy',
      'https://github.com/grafana/alloy/blob/main/LICENSE'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Grafana Labs leads the Alloy project.','source_urls',jsonb_build_array('https://grafana.com/oss/alloy-opentelemetry-collector/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Grafana documents Docker as a supported way to install Alloy.','source_urls',jsonb_build_array('https://grafana.com/docs/alloy/latest/set-up/install/'))
    ),
    updated_at=now()
  where id=v_app and website_url is null and publisher_name='grafana'
    and publisher_type='community' and docs_url='https://github.com/grafana/alloy'
    and install_docs_url='https://github.com/grafana/alloy';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Grafana Alloy fact update failed'; end if;
end;
$migration$;
commit;
