-- First reviewed HTTP 404 batch: corrected official links and OpenTaco summary.
BEGIN;

DO $guarded_review$
BEGIN
  UPDATE public.self_host_apps AS a
  SET publisher_url = NULL,
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://apps.yunohost.org/app/243-game',
          'https://github.com/YunoHost-Apps/243-game_ynh'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '7aca1605-90cb-4a97-9372-24080eb3b952'
    AND a.slug = '243-game'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/hgentry';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: 243-game'; END IF;

  UPDATE public.self_host_apps AS a
  SET docs_url = 'https://allthemods.github.io/alltheguides/',
      install_docs_url = NULL,
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://allthemods.github.io/alltheguides/',
          'https://allthemods.github.io/alltheguides/help/server/',
          'https://www.curseforge.com/minecraft/modpacks/all-the-mods-9'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '01c0755b-1348-472f-8362-55e04766908c'
    AND a.slug = 'all-the-mods-9-mohistmc'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/Cobbert/docker-allthemods9/pulls'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Cobbert/docker-allthemods9/pulls';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: all-the-mods-9-mohistmc'; END IF;

  UPDATE public.self_host_apps AS a
  SET docs_url = 'https://github.com/boubli/AMUD-Dashboard#readme',
      install_docs_url = 'https://github.com/boubli/AMUD-Dashboard/blob/main/DEPLOY.md',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/boubli/AMUD-Dashboard',
          'https://github.com/boubli/AMUD-Dashboard/blob/main/DEPLOY.md'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'cd59442d-6e3b-420d-8d51-370c84a94303'
    AND a.slug = 'amud-agent'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/boubli/AMUD-Dashboard/discussions'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/boubli/AMUD-Dashboard/discussions';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: amud-agent'; END IF;

  UPDATE public.self_host_apps AS a
  SET website_url = NULL,
      publisher_url = 'https://gitlab.com/commento',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://gitlab.com/commento',
          'https://gitlab.com/commento/commento'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '12a3fb1e-82b5-44ad-a4a4-4b1c039fde9d'
    AND a.slug = 'commento'
    AND a.website_url IS NOT DISTINCT FROM 'https://commento.io/'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://commento.io/';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: commento'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_code_url = 'https://github.com/apache/couchdb-docker',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://docs.couchdb.org/en/stable/install/docker.html',
          'https://github.com/apache/couchdb-docker'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'a01263d7-6432-4621-9f94-b879205dd24b'
    AND a.slug = 'couchdb-v2-x'
    AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/apache/docker-couchdb';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: couchdb-v2-x'; END IF;

  UPDATE public.self_host_apps AS a
  SET docs_url = 'https://www.drawio.com/docs/',
      install_docs_url = 'https://github.com/jgraph/docker-drawio',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://www.drawio.com/docs/',
          'https://github.com/jgraph/docker-drawio'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '7c4a8ab4-c409-402e-85ab-1d42cf9b699c'
    AND a.slug = 'diagramsnet'
    AND a.docs_url IS NOT DISTINCT FROM 'https://www.diagrams.net/doc'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://www.diagrams.net/doc';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: diagramsnet'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_code_url = 'https://github.com/YunoHost-Apps/django-fritzconnection_ynh',
      docs_url = 'https://apps.yunohost.org/app/django-fritzconnection',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://apps.yunohost.org/app/django-fritzconnection',
          'https://github.com/YunoHost-Apps/django-fritzconnection_ynh'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '61fd5e11-f3dc-4a40-b964-4c3905af14ac'
    AND a.slug = 'django-fritzconnection'
    AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/jedie/django-fritzconnection'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/jedie/django-fritzconnection';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: django-fritzconnection'; END IF;

  UPDATE public.self_host_apps AS a
  SET summary = 'Self-hostable platform for managing Terraform and OpenTofu state and running infrastructure changes.',
      docs_url = 'https://docs.digger.dev/',
      install_docs_url = NULL,
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://docs.digger.dev/',
          'https://opentaco.dev/',
          'https://github.com/diggerhq/digger'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '57937616-c0e8-4fde-82f8-9b2455926a53'
    AND a.slug = 'digger'
    AND a.summary IS NOT DISTINCT FROM 'Runs Terraform and OpenTofu plans from pull requests using existing CI workers and a small orchestration service.'
    AND a.docs_url IS NULL
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://docs.digger.dev/ce/self-host/deploy-helm';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: digger'; END IF;
END;
$guarded_review$;

COMMIT;
