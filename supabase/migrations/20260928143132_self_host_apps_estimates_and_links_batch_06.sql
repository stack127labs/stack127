-- Fill remaining RAM/storage estimates and add verified official documentation links.
-- Resource values are estimates, so each is labeled and includes a short basis and source URLs.
DO $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=8192,
    ram_estimate_max_mb=32768,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='The publisher lists at least 8 GB and recommends about 1 GB per high-megapixel camera, so camera count raises the estimate.',
    ram_source_urls=ARRAY['https://blueirissoftware.com/BlueIris.PDF']::text[],
    storage_estimate_min_gb=500,
    storage_estimate_max_gb=4000,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='low',
    storage_estimate_basis='Recorded video size depends on camera count, bitrate, and retention time.',
    storage_source_urls=ARRAY['https://blueirissoftware.com/BlueIris.PDF']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='blue-iris'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 5
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 100
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'blue-iris resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://blueirissoftware.com/BlueIris.PDF']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='blue-iris'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'blue-iris source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=512,
    ram_estimate_max_mb=2048,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The publisher lists 512 MB minimum and recommends 1 GB; concurrent streams and transcoding can use more.',
    ram_source_urls=ARRAY['https://getchannels.com/docs/getting-started/system-requirements/channels-dvr-server/']::text[],
    storage_estimate_min_gb=500,
    storage_estimate_max_gb=2000,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The publisher recommends 2 TB for over 250 recording hours and estimates about 8 GB per hour of HDTV.',
    storage_source_urls=ARRAY['https://getchannels.com/docs/getting-started/system-requirements/channels-dvr-server/']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='channels-dvr'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 50
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 500
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'channels-dvr resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://getchannels.com/docs/getting-started/system-requirements/channels-dvr-server/']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='channels-dvr'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'channels-dvr source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=4096,
    ram_estimate_max_mb=16384,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The project lists a 4 GB minimal configuration; more memory is useful as users and queries grow.',
    ram_source_urls=ARRAY['https://github.com/datalens-tech/datalens']::text[],
    storage_estimate_min_gb=5,
    storage_estimate_max_gb=100,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='medium',
    storage_estimate_basis='Stores PostgreSQL metadata, settings, connections, and workbooks; the connected data sources remain separate.',
    storage_source_urls=ARRAY['https://github.com/datalens-tech/datalens']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='datalens'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 1
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 20
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'datalens resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    docs_url='https://datalens.tech/docs',
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://github.com/datalens-tech/datalens', 'https://datalens.tech/docs']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='datalens'
    AND a.published IS TRUE
    AND a.docs_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'datalens source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=1024,
    ram_estimate_max_mb=8192,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='The publisher lists 512 MB minimum on Linux and 2 GB for HD transcoding; streams and transcoding needs vary.',
    ram_source_urls=ARRAY['https://emby.media/support/articles/System-Requirements.html']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='emby'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'emby resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://emby.media/support/articles/System-Requirements.html']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='emby'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'emby source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=16384,
    ram_estimate_max_mb=32768,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The project recommends 32 GB for its hobby deployment; ingestion volume affects the practical range.',
    ram_source_urls=ARRAY['https://github.com/highlight/highlight', 'https://www.highlight.io/docs/general/company/open-source/hosting/self-host-hobby']::text[],
    storage_estimate_min_gb=128,
    storage_estimate_max_gb=256,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The project recommends 256 GB disk for its hobby deployment; retained events and sessions drive storage use.',
    storage_source_urls=ARRAY['https://github.com/highlight/highlight', 'https://www.highlight.io/docs/general/company/open-source/hosting/self-host-hobby']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='highlight'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 5
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 100
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'highlight resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    docs_url='https://www.highlight.io/docs/general/company/open-source/hosting/self-host-hobby',
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://github.com/highlight/highlight', 'https://www.highlight.io/docs/general/company/open-source/hosting/self-host-hobby']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='highlight'
    AND a.published IS TRUE
    AND a.docs_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'highlight source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=8192,
    ram_estimate_max_mb=32768,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='low',
    ram_estimate_basis='A small ClickStack setup runs the observability UI, collector, and ClickHouse; ingest rate and query load drive memory use.',
    ram_source_urls=ARRAY['https://clickhouse.com/docs/use-cases/observability/clickstack/deployment', 'https://clickhouse.com/clickstack']::text[],
    storage_estimate_min_gb=50,
    storage_estimate_max_gb=500,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='low',
    storage_estimate_basis='ClickHouse stores telemetry; ingestion rate, compression, and retention drive storage use.',
    storage_source_urls=ARRAY['https://clickhouse.com/docs/use-cases/observability/clickstack/deployment', 'https://clickhouse.com/clickstack']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='hyperdx'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 5
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 100
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'hyperdx resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    docs_url='https://clickhouse.com/docs/use-cases/observability/clickstack',
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://clickhouse.com/docs/use-cases/observability/clickstack/deployment', 'https://clickhouse.com/clickstack']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='hyperdx'
    AND a.published IS TRUE
    AND a.docs_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'hyperdx source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=256,
    ram_estimate_max_mb=2048,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='The project says its dashboard uses about 80 MB of RAM; deployed application containers need separate resources.',
    ram_source_urls=ARRAY['https://github.com/goinfinite/os']::text[],
    storage_estimate_min_gb=1,
    storage_estimate_max_gb=20,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='low',
    storage_estimate_basis='Covers the base host-in-a-box service and its metadata; deployed application images and data need separate storage.',
    storage_source_urls=ARRAY['https://github.com/goinfinite/os']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='infinite-os'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 1
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 20
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'infinite-os resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://github.com/goinfinite/os']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='infinite-os'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'infinite-os source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=4096,
    ram_estimate_max_mb=16384,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The install guide lists 4 GB minimum; Elasticsearch and transaction screening can need more.',
    ram_source_urls=ARRAY['https://github.com/checkmarble/marble/blob/main/installation/README.md', 'https://github.com/checkmarble/marble/blob/main/docker-compose.yaml']::text[],
    storage_estimate_min_gb=10,
    storage_estimate_max_gb=100,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='medium',
    storage_estimate_basis='The install guide lists 10 GB minimum; database records and screening indexes grow with use.',
    storage_source_urls=ARRAY['https://github.com/checkmarble/marble/blob/main/installation/README.md', 'https://github.com/checkmarble/marble/blob/main/docker-compose.yaml']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='marble'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_kind IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'marble resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    docs_url='https://docs.checkmarble.com/',
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://github.com/checkmarble/marble/blob/main/installation/README.md', 'https://github.com/checkmarble/marble/blob/main/docker-compose.yaml', 'https://docs.checkmarble.com/']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='marble'
    AND a.published IS TRUE
    AND a.docs_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'marble source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=8192,
    ram_estimate_max_mb=32768,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The publisher''s minimum is 8 GB RAM; local AI apps and other services need more.',
    ram_source_urls=ARRAY['https://www.olares.com/docs/manual/get-started/install-olares']::text[],
    storage_estimate_min_gb=150,
    storage_estimate_max_gb=500,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The publisher requires at least a 150 GB SSD; installed apps and personal data use additional space.',
    storage_source_urls=ARRAY['https://www.olares.com/docs/manual/get-started/install-olares']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='olares'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_kind IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'olares resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    docs_url='https://www.olares.com/docs/manual/get-started/install-olares',
    website_url='https://www.olares.com/',
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://www.olares.com/', 'https://www.olares.com/docs/manual/get-started/install-olares']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='olares'
    AND a.published IS TRUE
    AND a.docs_url IS NOT DISTINCT FROM NULL
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'olares source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=1024,
    ram_estimate_max_mb=8192,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='Plex says 4 GB is typically sufficient and Linux systems may use less; concurrent streams and transcoding affect the range.',
    ram_source_urls=ARRAY['https://support.plex.tv/articles/200375666-plex-media-server-requirements/']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='plex'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'plex resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://support.plex.tv/articles/200375666-plex-media-server-requirements/']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='plex'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'plex source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=16384,
    ram_estimate_max_mb=32768,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The project requires at least 16 GB RAM for its Docker deployment; document parsing and concurrent work add load.',
    ram_source_urls=ARRAY['https://github.com/infiniflow/ragflow/blob/main/docs/quickstart.mdx']::text[],
    storage_estimate_min_gb=50,
    storage_estimate_max_gb=200,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The project requires at least 50 GB disk; document collections and indexes need room to grow.',
    storage_source_urls=ARRAY['https://github.com/infiniflow/ragflow/blob/main/docs/quickstart.mdx']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='ragflow'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 5
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 100
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'ragflow resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://github.com/infiniflow/ragflow/blob/main/docs/quickstart.mdx']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='ragflow'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'ragflow source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=4096,
    ram_estimate_max_mb=16384,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The project recommends at least 4 GB RAM and 4 CPU cores for a production self-hosted setup.',
    ram_source_urls=ARRAY['https://github.com/FrigadeHQ/trench']::text[],
    storage_estimate_min_gb=20,
    storage_estimate_max_gb=500,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='low',
    storage_estimate_basis='Stores event data in ClickHouse and Kafka; event volume and retention drive storage use.',
    storage_source_urls=ARRAY['https://github.com/FrigadeHQ/trench']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='trench'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 5
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 100
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'trench resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    docs_url='https://docs.trench.dev/quickstart',
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://github.com/FrigadeHQ/trench', 'https://docs.trench.dev/quickstart']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='trench'
    AND a.published IS TRUE
    AND a.docs_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'trench source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=4096,
    ram_estimate_max_mb=16384,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The publisher lists 4 GB RAM minimum for a small production installation of about 50 users.',
    ram_source_urls=ARRAY['https://wazo-platform.org/uc-doc/installation/']::text[],
    storage_estimate_min_gb=50,
    storage_estimate_max_gb=200,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The publisher lists 50 GB storage minimum for a small production installation; call records and recordings can grow.',
    storage_source_urls=ARRAY['https://wazo-platform.org/uc-doc/installation/']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='wazo'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_kind IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'wazo resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://wazo-platform.org/uc-doc/installation/']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='wazo'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'wazo source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=8192,
    ram_estimate_max_mb=32768,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The publisher''s baseline is about 8 GB RAM, plus 1 GB per 100 concurrent users; media services can need more.',
    ram_source_urls=ARRAY['https://docs.workadventu.re/admin/admin-self-hosting/']::text[],
    storage_estimate_min_gb=20,
    storage_estimate_max_gb=100,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The publisher suggests 20–30 GB to start for databases; messages, attachments, and maps increase storage use.',
    storage_source_urls=ARRAY['https://docs.workadventu.re/admin/admin-self-hosting/']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='workadventure'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL
    AND r.storage_estimate_min_gb IS NOT DISTINCT FROM 1
    AND r.storage_estimate_max_gb IS NOT DISTINCT FROM 20
    AND r.storage_estimate_kind='estimated';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'workadventure resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://docs.workadventu.re/admin/admin-self-hosting/']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='workadventure'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'workadventure source links changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS r SET
    ram_estimate_min_mb=8192,
    ram_estimate_max_mb=32768,
    ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The publisher lists 8 GB RAM minimum for a single-server installation; mailbox count affects the estimate.',
    ram_source_urls=ARRAY['https://zimbra.github.io/documentation/zimbra-10/single-server-install.html']::text[],
    storage_estimate_min_gb=100,
    storage_estimate_max_gb=500,
    storage_estimate_kind='estimated',
    storage_estimate_confidence='medium',
    storage_estimate_basis='The publisher lists 100 GB for production software and logs, with additional disk space needed for mail storage.',
    storage_source_urls=ARRAY['https://zimbra.github.io/documentation/zimbra-10/single-server-install.html']::text[],
    checked_at=now(),
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE a.slug='zimbra-collaboration'
    AND a.published IS TRUE
    AND r.app_id=a.id
    AND r.ram_estimate_min_mb IS NULL
    AND r.ram_estimate_max_mb IS NULL
    AND r.ram_estimate_kind IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'zimbra-collaboration resource estimates changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    data_source_urls=ARRAY(SELECT DISTINCT src.url FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY['https://zimbra.github.io/documentation/zimbra-10/single-server-install.html']::text[]) AS src(url) ORDER BY src.url),
    updated_at=now()
  WHERE a.slug='zimbra-collaboration'
    AND a.published IS TRUE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'zimbra-collaboration source links changed since review (rows updated: %)', affected; END IF;
END $$;
