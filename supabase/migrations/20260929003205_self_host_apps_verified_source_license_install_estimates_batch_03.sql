begin;

do $migration$
declare
  v_app uuid;
  v_count integer;
  v_categories text[];
  v_options jsonb;
  v_new_options jsonb;
  v_item record;
begin
  if (
    select count(*)
    from (values
      ('dependency-track-api-server','Dependency-Track-API-Server','https://github.com/DependencyTrack/dependency-track/issues','dependencytrack/apiserver'),
      ('firefly-iii-data-importer','Firefly-III-Data-Importer','https://docs.firefly-iii.org/','fireflyiii/data-importer:latest'),
      ('gitea-runner','Gitea-Runner','https://gitea.com/gitea/act_runner','gitea/act_runner'),
      ('librenms','librenms','https://www.librenms.org/','librenms/librenms:latest'),
      ('openbooks','Openbooks','https://evan-buss.github.io/openbooks/','evanbuss/openbooks:latest'),
      ('plantuml','PlantUML','https://plantuml.com/','plantuml/plantuml-server:latest'),
      ('solr','solr','https://lucene.apache.org/solr/','bitnami/solr:latest'),
      ('tile38','Tile38','https://tile38.com/','tile38/tile38')
    ) expected(slug, old_name, old_website, old_image)
    join public.self_host_apps app on app.slug=expected.slug
      and app.name=expected.old_name
      and app.website_url=expected.old_website
      and app.docker_image=expected.old_image
      and app.published is true
      and app.self_hosting_status='self_hostable'
      and app.source_code_url is null
      and app.source_model='closed_source'
      and app.license is null
      and app.license_spdx_id is null
      and app.license_type='unknown'::public.self_host_app_license_type
      and app.publisher_type='unknown'
  ) <> 8 then
    raise exception 'Batch 03 source records changed since review';
  end if;

  for v_item in
    select * from (values
      ('dependency-track-api-server',array['ai-ml','project-task-management','security-privacy']::text[],array['security-privacy']::text[]),
      ('firefly-iii-data-importer',array['ai-ml','finance-budgeting','security-privacy']::text[],array['finance-budgeting']::text[]),
      ('gitea-runner',array['developer-tools']::text[],array['developer-tools']::text[]),
      ('librenms',array['ai-ml','databases','monitoring-status']::text[],array['monitoring-status']::text[]),
      ('openbooks',array['ebooks-libraries','search','video-conferencing']::text[],array['ebooks-libraries','search']::text[]),
      ('plantuml',array['ai-ml','project-task-management','system-admin-hosting']::text[],array['developer-tools']::text[]),
      ('solr',array['search']::text[],array['search']::text[]),
      ('tile38',array['project-task-management']::text[],array['databases']::text[])
    ) reviewed(slug, old_categories, new_categories)
  loop
    select id into v_app from public.self_host_apps where slug=v_item.slug for update;
    select coalesce(array_agg(category.slug order by category.slug),'{}'::text[])
      into v_categories
    from public.self_host_app_category_links link
    join public.self_host_app_categories category on category.id=link.category_id
    where link.app_id=v_app;
    if v_categories is distinct from v_item.old_categories then
      raise exception 'Batch 03 categories changed for %',v_item.slug;
    end if;
    delete from public.self_host_app_category_links where app_id=v_app;
    insert into public.self_host_app_category_links(app_id,category_id)
    select v_app,category.id from public.self_host_app_categories category
    where category.slug=any(v_item.new_categories);
    get diagnostics v_count=row_count;
    if v_count<>cardinality(v_item.new_categories) then
      raise exception 'Batch 03 category assignment failed for %',v_item.slug;
    end if;
  end loop;

  update public.self_host_apps app set
    name=reviewed.name,
    summary=reviewed.summary,
    website_url=reviewed.website_url,
    source_code_url=reviewed.source_code_url,
    source_code_host=reviewed.source_code_host,
    docs_url=reviewed.docs_url,
    install_docs_url=reviewed.install_docs_url,
    license=reviewed.license,
    license_spdx_id=reviewed.license_spdx_id,
    license_type=reviewed.license_type::public.self_host_app_license_type,
    source_model='open_source',
    publisher_name=reviewed.publisher_name,
    publisher_type=reviewed.publisher_type,
    publisher_url=reviewed.publisher_url,
    docker_url=reviewed.docker_url,
    docker_image=reviewed.docker_image,
    docker_support='official',
    compose_support=reviewed.compose_support,
    compose_url=reviewed.compose_url,
    requires_database=reviewed.requires_database,
    database_types=reviewed.database_types,
    persistent_storage=reviewed.persistent_storage,
    pricing_model='free',
    deployment_methods=reviewed.deployment_methods,
    surfaces=reviewed.surfaces,
    summary_source='curated',
    summary_confidence='high',
    github_project_id=coalesce(app.github_project_id,github_project.id),
    data_source_urls=array(
      select distinct source_url
      from unnest(coalesce(app.data_source_urls,'{}'::text[])||reviewed.data_source_urls) as refs(source_url)
      order by source_url
    ),
    updated_at=now()
  from (values
    ('dependency-track-api-server','Dependency-Track API Server','API server for Dependency-Track, which analyzes software bills of materials for security risks.','https://dependencytrack.org/','https://github.com/DependencyTrack/dependency-track','github','https://docs.dependencytrack.org/','https://dependencytrack.org/','Apache-2.0','Apache-2.0','permissive','OWASP Dependency-Track Project','community','https://dependencytrack.org/','https://hub.docker.com/r/dependencytrack/apiserver','dependencytrack/apiserver:latest','https://dependencytrack.org/docker-compose.yml','official',true,true,array['postgresql']::text[],true,array['docker','compose','unraid']::text[],array['web']::text[],array['https://dependencytrack.org/','https://github.com/DependencyTrack/dependency-track','https://github.com/DependencyTrack/dependency-track/blob/master/LICENSE.txt','https://docs.dependencytrack.org/','https://docs.dependencytrack.org/getting-started/deploy-docker/','https://docs.dependencytrack.org/getting-started/database-support/','https://hub.docker.com/r/dependencytrack/apiserver']::text[]),
    ('firefly-iii-data-importer','Firefly III Data Importer','Imports bank transactions and files into the self-hosted Firefly III finance manager.','https://firefly-iii.org/','https://github.com/firefly-iii/data-importer','github','https://docs.firefly-iii.org/how-to/data-importer/','https://docs.firefly-iii.org/how-to/data-importer/installation/docker/','AGPL-3.0-or-later','AGPL-3.0-or-later','copyleft','James Cole (JC5)','individual','https://github.com/JC5','https://hub.docker.com/r/fireflyiii/data-importer','fireflyiii/data-importer:latest','https://github.com/firefly-iii/docker/blob/main/docker-compose-importer.yml','official',true,false,'{}'::text[],false,array['docker','compose','unraid']::text[],array['web']::text[],array['https://firefly-iii.org/','https://github.com/firefly-iii/data-importer','https://github.com/firefly-iii/data-importer/blob/main/readme.md','https://github.com/firefly-iii/data-importer/blob/main/composer.json','https://docs.firefly-iii.org/how-to/data-importer/','https://docs.firefly-iii.org/how-to/data-importer/installation/docker/','https://github.com/firefly-iii/docker/blob/main/docker-compose-importer.yml','https://hub.docker.com/r/fireflyiii/data-importer']::text[]),
    ('gitea-runner','Gitea Runner','Runner for executing Gitea Actions workflows on your own machine.','https://docs.gitea.com/runner/','https://gitea.com/gitea/act_runner','gitea','https://docs.gitea.com/runner/','https://docs.gitea.com/runner/installation/docker/','MIT','MIT','permissive','Gitea Project','community','https://about.gitea.com/','https://hub.docker.com/r/gitea/runner','gitea/runner:3','https://docs.gitea.com/runner/installation/docker/','official',true,false,'{}'::text[],true,array['docker','compose','unraid']::text[],array['cli']::text[],array['https://gitea.com/gitea/act_runner','https://docs.gitea.com/runner/','https://docs.gitea.com/usage/actions/faq/','https://docs.gitea.com/runner/installation/docker/','https://hub.docker.com/r/gitea/runner']::text[]),
    ('librenms','LibreNMS','Auto-discovering network monitoring system for devices, services, and performance data.','https://www.librenms.org/','https://github.com/LibreNMS/LibreNMS','github','https://docs.librenms.org/','https://docs.librenms.org/Installation/Docker/','GPL-3.0-or-later','GPL-3.0-or-later','copyleft','LibreNMS Project','community','https://www.librenms.org/','https://hub.docker.com/r/librenms/librenms','librenms/librenms:latest','https://github.com/librenms/docker/tree/master/examples/compose','official',true,true,array['mysql','mariadb']::text[],true,array['docker','compose','unraid']::text[],array['web']::text[],array['https://github.com/LibreNMS/LibreNMS','https://github.com/LibreNMS/LibreNMS/blob/master/composer.json','https://docs.librenms.org/','https://docs.librenms.org/Installation/Docker/','https://docs.librenms.org/Support/Example-Hardware-Setup/','https://github.com/librenms/docker/tree/master/examples/compose','https://hub.docker.com/r/librenms/librenms']::text[]),
    ('openbooks','OpenBooks','Web interface for searching and downloading ebooks over IRC.','https://evan-buss.github.io/openbooks/','https://github.com/evan-buss/openbooks','github','https://github.com/evan-buss/openbooks/blob/master/README.md','https://github.com/evan-buss/openbooks/blob/master/docker.md','MIT','MIT','permissive','Evan Buss','individual','https://github.com/evan-buss','https://hub.docker.com/r/evanbuss/openbooks','evanbuss/openbooks:latest','https://github.com/evan-buss/openbooks/blob/master/docker.md','official',true,false,'{}'::text[],true,array['docker','compose','unraid']::text[],array['web']::text[],array['https://github.com/evan-buss/openbooks','https://github.com/evan-buss/openbooks/blob/master/LICENSE','https://github.com/evan-buss/openbooks/blob/master/README.md','https://github.com/evan-buss/openbooks/blob/master/docker.md','https://evan-buss.github.io/openbooks/','https://hub.docker.com/r/evanbuss/openbooks']::text[]),
    ('plantuml','PlantUML Server','Web app that turns PlantUML text into UML diagrams.','https://plantuml.com/','https://github.com/plantuml/plantuml-server','github','https://plantuml.com/','https://github.com/plantuml/plantuml-server/blob/master/README.md','GPL-3.0','GPL-3.0','copyleft','PlantUML Project','community','https://plantuml.com/','https://hub.docker.com/r/plantuml/plantuml-server','plantuml/plantuml-server:jetty','https://github.com/plantuml/plantuml-server/blob/master/docker-compose.yml','official',true,false,'{}'::text[],false,array['docker','compose','unraid']::text[],array['web']::text[],array['https://plantuml.com/','https://github.com/plantuml/plantuml-server','https://github.com/plantuml/plantuml-server/blob/master/README.md','https://github.com/plantuml/plantuml-server/blob/master/docker-compose.yml','https://hub.docker.com/r/plantuml/plantuml-server']::text[]),
    ('solr','Apache Solr','Search platform for indexing and querying full-text, vector, and geospatial data.','https://solr.apache.org/','https://github.com/apache/solr','github','https://solr.apache.org/guide/solr/latest/','https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html','Apache-2.0','Apache-2.0','permissive','Apache Software Foundation','foundation','https://www.apache.org/','https://hub.docker.com/_/solr','solr','https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html','official',true,false,'{}'::text[],true,array['docker','compose','unraid']::text[],array['web']::text[],array['https://solr.apache.org/','https://github.com/apache/solr','https://github.com/apache/solr/blob/main/LICENSE.txt','https://solr.apache.org/guide/solr/latest/','https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html','https://solr.apache.org/guide/solr/latest/deployment-guide/installing-solr.html','https://hub.docker.com/_/solr']::text[]),
    ('tile38','Tile38','In-memory geospatial database for spatial queries and real-time geofencing.','https://tile38.com/','https://github.com/tidwall/tile38','github','https://tile38.com/','https://tile38.com/topics/installation','MIT','MIT','permissive','Joshua Baker (tidwall)','individual','https://github.com/tidwall','https://hub.docker.com/r/tile38/tile38','tile38/tile38',null,'official',false,false,'{}'::text[],true,array['docker','unraid']::text[],array['cli']::text[],array['https://tile38.com/','https://github.com/tidwall/tile38','https://github.com/tidwall/tile38/blob/master/LICENSE','https://tile38.com/topics/installation','https://tile38.com/topics/replication','https://hub.docker.com/r/tile38/tile38']::text[])
  ) reviewed(
    slug,name,summary,website_url,source_code_url,source_code_host,docs_url,install_docs_url,
    license,license_spdx_id,license_type,publisher_name,publisher_type,publisher_url,
    docker_url,docker_image,compose_url,docker_support,compose_support,requires_database,
    database_types,persistent_storage,deployment_methods,surfaces,data_source_urls
  )
  left join public.github_projects github_project
    on lower(github_project.full_name)=lower(case reviewed.slug
      when 'dependency-track-api-server' then 'DependencyTrack/dependency-track'
      when 'firefly-iii-data-importer' then 'firefly-iii/data-importer'
      when 'librenms' then 'LibreNMS/LibreNMS'
      when 'openbooks' then 'evan-buss/openbooks'
      when 'plantuml' then 'plantuml/plantuml-server'
      when 'solr' then 'apache/solr'
      when 'tile38' then 'tidwall/tile38'
      else null end)
  where app.slug=reviewed.slug
    and app.source_code_url is null
    and app.source_model='closed_source'
    and app.license is null
    and app.license_type='unknown'::public.self_host_app_license_type;
  get diagnostics v_count=row_count;
  if v_count<>8 then raise exception 'Batch 03 app fact update failed'; end if;

  for v_item in
    select * from (values
      ('dependency-track-api-server','dependencytrack/apiserver','https://hub.docker.com/r/dependencytrack/apiserver','https://hub.docker.com/r/dependencytrack/apiserver','https://raw.githubusercontent.com/Frooodle/unraid-templates/main/dependency-track-api-server.xml','dependencytrack/apiserver:latest','API server image','https://dependencytrack.org/docker-compose.yml','https://dependencytrack.org/','Starts the API server and web frontend.',true),
      ('firefly-iii-data-importer','fireflyiii/data-importer:latest','https://hub.docker.com/r/fireflyiii/data-importer/','https://hub.docker.com/r/fireflyiii/data-importer/','https://raw.githubusercontent.com/MattFaz/unraid_templates/main/fireflyiii-dataimporter.xml','fireflyiii/data-importer:latest','Docker image','https://github.com/firefly-iii/docker/blob/main/docker-compose-importer.yml','https://docs.firefly-iii.org/how-to/data-importer/installation/docker/','Includes the Firefly III app, database, and importer.',true),
      ('gitea-runner','gitea/act_runner','https://hub.docker.com/r/gitea/act_runner','https://hub.docker.com/r/gitea/runner','https://raw.githubusercontent.com/d3vyce/unraid-template/main/templates/gitea-runner.xml','gitea/runner:3','Docker image','https://docs.gitea.com/runner/installation/docker/','https://docs.gitea.com/runner/installation/docker/','Gitea documents the official runner image and Compose setup.',true),
      ('librenms','librenms/librenms:latest','https://hub.docker.com/r/librenms/librenms/','https://hub.docker.com/r/librenms/librenms/','https://raw.githubusercontent.com/A75G/docker-templates/master/templates/librenms.xml','librenms/librenms:latest','Docker image','https://github.com/librenms/docker/tree/master/examples/compose','https://docs.librenms.org/Installation/Docker/','LibreNMS documents this image and its Compose deployment.',true),
      ('openbooks','evanbuss/openbooks:latest','https://hub.docker.com/r/evanbuss/openbooks','https://hub.docker.com/r/evanbuss/openbooks','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/openbooks.xml','evanbuss/openbooks:latest','Docker image','https://github.com/evan-buss/openbooks/blob/master/docker.md','https://github.com/evan-buss/openbooks/blob/master/docker.md','The project Docker guide includes a Compose example.',true),
      ('plantuml','plantuml/plantuml-server:latest','https://hub.docker.com/r/plantuml/plantuml-server','https://hub.docker.com/r/plantuml/plantuml-server','https://raw.githubusercontent.com/RafaelCenzano/unraid-templates/main/plantuml/plantuml.xml','plantuml/plantuml-server:jetty','Docker image','https://github.com/plantuml/plantuml-server/blob/master/docker-compose.yml','https://github.com/plantuml/plantuml-server/blob/master/README.md','The PlantUML Server project supplies this image and Compose file.',true),
      ('solr','bitnami/solr:latest','https://hub.docker.com/r/bitnami/solr/','https://hub.docker.com/_/solr','https://raw.githubusercontent.com/A75G/docker-templates/master/templates/solr.xml','solr','Docker image','https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html','https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html','The Apache Solr guide documents this official image and Compose setup.',true),
      ('tile38','tile38/tile38','https://hub.docker.com/r/tile38/tile38/','https://hub.docker.com/r/tile38/tile38','https://raw.githubusercontent.com/andaks/unraid-templates/master/tile38/tile38.xml','tile38/tile38','Docker image',null,'https://tile38.com/topics/installation','Tile38 documents Docker installation.',false)
    ) install_rows(slug,old_image,old_docker_url,new_docker_url,unraid_url,new_image,docker_label,compose_url,install_source,compose_note,add_compose)
  loop
    select id into v_app from public.self_host_apps where slug=v_item.slug;
    select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
    if v_options is null or jsonb_typeof(v_options)<>'array'
      or not (v_options @> jsonb_build_array(jsonb_build_object('method','docker','image',v_item.old_image,'url',v_item.old_docker_url,'support_level','community')))
      or not (v_options @> jsonb_build_array(jsonb_build_object('method','unraid','source_url',v_item.unraid_url,'support_level','community'))) then
      raise exception 'Batch 03 install options changed for %',v_item.slug;
    end if;
    v_new_options:=jsonb_build_array(jsonb_build_object(
      'url',v_item.new_docker_url,
      'note',case v_item.slug
        when 'dependency-track-api-server' then 'Official Dependency-Track API server image.'
        when 'firefly-iii-data-importer' then 'Official Firefly III Data Importer image.'
        when 'gitea-runner' then 'Official Gitea Runner image.'
        when 'librenms' then 'Official LibreNMS image.'
        when 'openbooks' then 'Image documented by the OpenBooks project.'
        when 'plantuml' then 'Official PlantUML Server Jetty image.'
        when 'solr' then 'Official Apache Solr image.'
        else 'Image documented by the Tile38 project.' end,
      'image',v_item.new_image,'label',v_item.docker_label,'method','docker','sort_order',10,
      'source_url',v_item.install_source,'support_level','official'
    ));
    if v_item.add_compose then
      v_new_options:=v_new_options||jsonb_build_array(jsonb_build_object(
        'url',v_item.compose_url,'note',v_item.compose_note,'image',null,
        'label','Docker Compose','method','compose','sort_order',20,
        'source_url',v_item.install_source,'support_level','official'
      ));
    end if;
    v_new_options:=v_new_options||jsonb_build_array(
      (select value from jsonb_array_elements(v_options) as entries(value) where value->>'method'='unraid' limit 1)
    );
    update public.self_host_app_install_options set
      options=v_new_options,
      docker_urls=array[v_item.new_docker_url]::text[],
      docker_images=array[v_item.new_image]::text[],
      compose_urls=case when v_item.add_compose then array[v_item.compose_url]::text[] else array[]::text[] end,
      source_urls=array(
        select distinct source_url
        from unnest(coalesce(source_urls,'{}'::text[])||array[v_item.new_docker_url,v_item.install_source]::text[]||case when v_item.add_compose then array[v_item.compose_url]::text[] else array[]::text[] end) as refs(source_url)
        order by source_url
      ),
      checked_at=now(),updated_at=now()
    where app_id=v_app;
    get diagnostics v_count=row_count;
    if v_count<>1 then raise exception 'Batch 03 install update failed for %',v_item.slug; end if;
  end loop;

  update public.self_host_app_resource_estimates estimate set
    ram_estimate_min_mb=reviewed.ram_min,ram_estimate_max_mb=reviewed.ram_max,
    ram_estimate_kind='estimated',ram_estimate_confidence=reviewed.ram_confidence,
    ram_estimate_basis=reviewed.ram_basis,ram_source_urls=reviewed.ram_sources,
    ram_note=null,
    storage_estimate_min_gb=reviewed.storage_min,storage_estimate_max_gb=reviewed.storage_max,
    storage_estimate_kind='estimated',storage_estimate_confidence=reviewed.storage_confidence,
    storage_estimate_basis=reviewed.storage_basis,storage_source_urls=reviewed.storage_sources,
    storage_note=null,checked_at=now(),updated_at=now()
  from public.self_host_apps app
  join (values
    ('dependency-track-api-server',2048::numeric,8192::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.',2048::numeric,8192::numeric,10::numeric,100::numeric,'SBOM volume, analysis backlog, and the PostgreSQL portfolio drive memory and database storage.','Small self-hosted database with the API service; project inventory and analysis history determine space.',array['https://docs.dependencytrack.org/getting-started/deploy-docker/']::text[],array['https://dependencytrack.org/','https://docs.dependencytrack.org/getting-started/deploy-docker/']::text[],'medium','low'),
    ('firefly-iii-data-importer',2048::numeric,8192::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.',512::numeric,2048::numeric,1::numeric,10::numeric,'PHP importer handles one household’s bank and file imports; file size and concurrent imports drive memory.','Importer image plus optional /import files; transaction records live in Firefly III.',array['https://github.com/firefly-iii/data-importer','https://docs.firefly-iii.org/how-to/data-importer/installation/docker/']::text[],array['https://docs.firefly-iii.org/how-to/data-importer/installation/docker/','https://github.com/firefly-iii/docker/blob/main/docker-compose-importer.yml']::text[],'medium','low'),
    ('gitea-runner',256::numeric,2048::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.',512::numeric,2048::numeric,10::numeric,100::numeric,'Runner process is small; workflow containers can use substantially more RAM.','Runner state is small; cached job images and Docker-in-Docker data root use disk.',array['https://docs.gitea.com/runner/installation/docker/']::text[],array['https://docs.gitea.com/runner/installation/docker/']::text[],'low','low'),
    ('librenms',2048::numeric,8192::numeric,5::numeric,100::numeric,'Small single-node service; data volume and request load vary.','Small single-node service; data volume and request load vary.',2048::numeric,4096::numeric,20::numeric,100::numeric,'Small network monitoring stack with LibreNMS and its database; device count and polling history drive use.','Device count and retention drive MySQL or MariaDB, RRD, and log storage.',array['https://docs.librenms.org/Support/Example-Hardware-Setup/','https://docs.librenms.org/Installation/Docker/']::text[],array['https://docs.librenms.org/Support/Example-Hardware-Setup/','https://docs.librenms.org/Installation/Docker/']::text[],'medium','low'),
    ('openbooks',1024::numeric,8192::numeric,5::numeric,100::numeric,'Small single-node service; data volume and request load vary.','Small single-node service; data volume and request load vary.',128::numeric,512::numeric,1::numeric,100::numeric,'Small Go web service; search activity and download concurrency drive memory.','The optional /books volume holds downloaded books; collection size sets storage use.',array['https://github.com/evan-buss/openbooks/blob/master/docker.md']::text[],array['https://github.com/evan-buss/openbooks/blob/master/docker.md']::text[],'medium','low'),
    ('plantuml',2048::numeric,8192::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.',512::numeric,2048::numeric,1::numeric,10::numeric,'Java diagram-rendering service; diagram size and simultaneous renders drive memory.','Small image and temporary render files; no saved diagram collection.',array['https://github.com/plantuml/plantuml-server/blob/master/README.md']::text[],array['https://github.com/plantuml/plantuml-server/blob/master/README.md']::text[],'medium','medium'),
    ('solr',1024::numeric,8192::numeric,5::numeric,100::numeric,'Small single-node service; data volume and request load vary.','Small single-node service; data volume and request load vary.',1024::numeric,8192::numeric,5::numeric,500::numeric,'Java heap, query load, and the size of the persisted search index drive RAM and disk use.','The /var/solr volume stores search indexes and logs; indexed data size sets disk use.',array['https://solr.apache.org/guide/solr/latest/deployment-guide/system-requirements.html','https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html']::text[],array['https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html']::text[],'low','low'),
    ('tile38',256::numeric,2048::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.',256::numeric,4096::numeric,1::numeric,100::numeric,'Tile38 keeps indexed records in memory; the geospatial dataset size drives RAM.','Tile38 writes its persistent records to the configured data directory.',array['https://github.com/tidwall/tile38','https://tile38.com/topics/installation']::text[],array['https://tile38.com/topics/replication','https://tile38.com/topics/installation']::text[],'low','low')
  ) reviewed(slug,old_ram_min,old_ram_max,old_storage_min,old_storage_max,old_ram_basis,old_storage_basis,ram_min,ram_max,storage_min,storage_max,ram_basis,storage_basis,ram_sources,storage_sources,ram_confidence,storage_confidence)
    on app.slug=reviewed.slug
  where estimate.app_id=app.id
    and estimate.ram_estimate_min_mb=reviewed.old_ram_min
    and estimate.ram_estimate_max_mb=reviewed.old_ram_max
    and estimate.storage_estimate_min_gb=reviewed.old_storage_min
    and estimate.storage_estimate_max_gb=reviewed.old_storage_max
    and estimate.ram_estimate_basis=reviewed.old_ram_basis
    and estimate.storage_estimate_basis=reviewed.old_storage_basis;
  get diagnostics v_count=row_count;
  if v_count<>8 then raise exception 'Batch 03 resource estimates changed since review'; end if;

  update public.self_host_apps app set
    technical_fact_status=coalesce(app.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official project source repository verified.','source_urls',jsonb_build_array(app.source_code_url)),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','License identifier verified in the project repository or official project documentation.','source_urls',jsonb_build_array(app.source_code_url)),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Publisher identity checked against official project pages.','source_urls',jsonb_build_array(app.publisher_url,app.source_code_url)),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official project documentation identifies this Docker deployment.','source_urls',jsonb_build_array(app.install_docs_url)),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official image and registry page verified.','source_urls',jsonb_build_array(app.docker_url,app.install_docs_url)),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note',case app.slug
        when 'dependency-track-api-server' then 'Current Dependency-Track 5.1 deployments use PostgreSQL.'
        when 'firefly-iii-data-importer' then 'The importer sends data to Firefly III over its API and has no separate database.'
        when 'gitea-runner' then 'The runner connects to Gitea and does not use a database.'
        when 'librenms' then 'Official Docker Compose setup includes MySQL or MariaDB.'
        when 'openbooks' then 'The project Docker guide runs OpenBooks without a database.'
        when 'plantuml' then 'The server renders diagrams without a database.'
        when 'solr' then 'Solr stores its own search index and does not require an external database.'
        else 'Tile38 is the database service and does not require an external database.' end,'source_urls',to_jsonb(app.data_source_urls)),
      'persistence',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note',case app.slug
        when 'dependency-track-api-server' then 'The API server and database retain Dependency-Track data.'
        when 'firefly-iii-data-importer' then 'Import records go to Firefly III; /import is an optional input-files mount.'
        when 'gitea-runner' then 'Gitea documents persistent /data and a separate Docker image cache.'
        when 'librenms' then 'Compose persists LibreNMS and database state.'
        when 'openbooks' then 'The project uses /books to keep downloaded ebooks.'
        when 'plantuml' then 'The server renders diagrams temporarily and has no diagram library.'
        when 'solr' then 'The official image stores indexes and logs in /var/solr.'
        else 'Tile38 persists its records in the configured data directory.' end,'source_urls',to_jsonb(app.data_source_urls)),
      'compose',case when app.slug='tile38'
        then jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The official installation page documents Docker, package, and binary installs, but no Compose deployment.','source_urls',jsonb_build_array('https://tile38.com/topics/installation'))
        else jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official project documentation provides this Compose deployment.','source_urls',jsonb_build_array(app.compose_url)) end
    ),
    updated_at=now()
  where app.slug in ('dependency-track-api-server','firefly-iii-data-importer','gitea-runner','librenms','openbooks','plantuml','solr','tile38')
    and app.source_model='open_source';
  get diagnostics v_count=row_count;
  if v_count<>8 then raise exception 'Batch 03 verification facts failed'; end if;
end
$migration$;

commit;
