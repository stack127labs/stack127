-- Draft only. Reviewed links 31-60 from the full self-host-apps link audit.
-- Reviewed against live production values immediately before application. Ergonode publisher profile was verified live and left unchanged.
BEGIN;

DO $guarded_review$
BEGIN
  UPDATE public.self_host_apps AS a
  SET docker_url = 'https://github.com/bambanah/deemix/pkgs/container/deemix',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/bambanah/deemix/blob/main/README.md',
          'https://github.com/bambanah/deemix/pkgs/container/deemix'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'a4e096ea-7ff0-4ff0-a817-f9ea1ddc6ae0'
    AND a.slug = 'deemix'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.docker_url IS NOT DISTINCT FROM 'https://registry.hub.docker.com/r/ghcr.io/bambanah/deemix';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: deemix'; END IF;

  UPDATE public.self_host_apps AS a
  SET docs_url = 'https://apps.yunohost.org/app/django_example',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://apps.yunohost.org/app/django_example',
          'https://github.com/YunoHost-Apps/django_example_ynh'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'c4bdc37a-f954-4172-93a8-ee5374a6398a'
    AND a.slug = 'django-example'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/jedie/django-example';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: django-example'; END IF;

  UPDATE public.self_host_apps AS a
  SET docs_url = 'https://apps.yunohost.org/app/django-for-runners',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://apps.yunohost.org/app/django-for-runners',
          'https://github.com/YunoHost-Apps/django-for-runners_ynh'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'f6252fc9-4a04-4c8c-a499-5428a81f134c'
    AND a.slug = 'django-for-runners'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/jedie/django-for-runners';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: django-for-runners'; END IF;

  UPDATE public.self_host_apps AS a
  SET docker_url = 'https://github.com/ajnart/dcm/pkgs/container/dcm',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/ajnart/dcm',
          'https://github.com/ajnart/dcm/pkgs/container/dcm'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'c4331710-8e83-49ff-b8d7-e69b919afe2e'
    AND a.slug = 'docker-compose-maker'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.docker_url IS NOT DISTINCT FROM 'https://registry.hub.docker.com/r/ghcr.io/ajnart/dcm';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: docker-compose-maker'; END IF;

  UPDATE public.self_host_apps AS a
  SET docker_url = 'https://github.com/Sloth-on-meth/DoorOpener#docker-compose-recommended',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/Sloth-on-meth/DoorOpener',
          'https://github.com/Sloth-on-meth/DoorOpener#docker-compose-recommended'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'e98b0323-f615-4e62-83d5-4b38ea30de90'
    AND a.slug = 'dooropener'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.docker_url IS NOT DISTINCT FROM 'https://registry.hub.docker.com/r/ghcr.io/sloth-on-meth/dooropener';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: dooropener'; END IF;

  UPDATE public.self_host_apps AS a
  SET docker_url = 'https://hub.docker.com/r/vectorim/element-web',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/element-hq/element-web/blob/develop/docs/install.md',
          'https://hub.docker.com/r/vectorim/element-web'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '5e947e15-bb93-439e-9996-eb1b426cae1b'
    AND a.slug = 'element'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/element-hq/element-web/blob/HEAD/modules/Dockerfile';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: element'; END IF;

  UPDATE public.self_host_apps AS a
  SET docs_url = 'https://git.collinwebdesigns.de/oscar.krause/fastapi-dls/-/tree/main',
      install_docs_url = 'https://git.collinwebdesigns.de/oscar.krause/fastapi-dls/-/blob/main/README.md',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://git.collinwebdesigns.de/oscar.krause/fastapi-dls/-/tree/main',
          'https://git.collinwebdesigns.de/oscar.krause/fastapi-dls/-/blob/main/README.md'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = 'b31224ab-fda1-49b9-bc2e-5769734519fc'
    AND a.slug = 'fastapi-dls'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.docs_url IS NOT DISTINCT FROM 'https://git.collinwebdesigns.de/oscar.krause/fastapi-dls/-/issues'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://git.collinwebdesigns.de/oscar.krause/fastapi-dls/-/issues';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: fastapi-dls'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_code_url = 'https://github.com/rix1337/FeedCrawler',
      docs_url = 'https://github.com/rix1337/FeedCrawler#readme',
      install_docs_url = 'https://github.com/rix1337/FeedCrawler#readme',
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/rix1337/FeedCrawler',
          'https://github.com/rix1337/FeedCrawler#readme'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '4cdc047a-12cb-472d-97bb-044c57b89beb'
    AND a.slug = 'feedcrawler'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/rix1337/feedcrawler'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/rix1337/FeedCrawler/issues/new'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/rix1337/FeedCrawler/issues/new';
  IF NOT FOUND THEN RAISE EXCEPTION 'Guard failed: feedcrawler'; END IF;
END;
$guarded_review$;

COMMIT;
