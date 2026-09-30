BEGIN;

DO $review_guard$
BEGIN
  IF (SELECT count(*) FROM public.self_host_apps WHERE slug IN ('docuwiki','dokuwiki','forgejorunner','forgejo-runner','engitys-bifr-st','engitys-bifrost') AND published IS TRUE AND self_hosting_status='self_hostable') <> 6 THEN
    RAISE EXCEPTION 'Duplicate app set changed since review';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_apps WHERE slug='docuwiki' AND source_model='closed_source' AND source_code_url IS NULL AND license IS NULL AND name='DocuWiki') THEN
    RAISE EXCEPTION 'DocuWiki duplicate snapshot changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_apps WHERE slug='dokuwiki' AND name='Dokuwiki' AND website_url='http://www.dokuwiki.org' AND docs_url='http://www.dokuwiki.org' AND source_model='open_source' AND license='GPL-2.0') THEN
    RAISE EXCEPTION 'DokuWiki canonical snapshot changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_app_install_options i JOIN public.self_host_apps a ON a.id=i.app_id WHERE a.slug='dokuwiki' AND jsonb_array_length(i.options)=3 AND i.options @> '[{"method":"docker","image":"dokuwiki/dokuwiki:stable"}]'::jsonb AND coalesce(cardinality(i.unraid_urls),0)=0) THEN
    RAISE EXCEPTION 'DokuWiki install options changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_apps WHERE slug='forgejorunner' AND source_model='closed_source' AND source_code_url IS NULL AND license IS NULL AND name='ForgejoRunner') THEN
    RAISE EXCEPTION 'Forgejo Runner duplicate snapshot changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_apps WHERE slug='forgejo-runner' AND docs_url='https://forgejo.org/docs/latest/admin/runner-installation/' AND deployment_methods=ARRAY['yunohost']::text[] AND docker_support='none' AND compose_support IS FALSE) THEN
    RAISE EXCEPTION 'Forgejo Runner canonical snapshot changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_app_install_options i JOIN public.self_host_apps a ON a.id=i.app_id WHERE a.slug='forgejo-runner' AND jsonb_array_length(i.options)=1 AND i.options @> '[{"method":"yunohost"}]'::jsonb) THEN
    RAISE EXCEPTION 'Forgejo Runner install options changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_apps WHERE slug='engitys-bifr-st' AND source_code_url='https://github.com/engity-com/bifroest' AND source_model='open_source' AND license='Apache-2.0') THEN
    RAISE EXCEPTION 'Engity Bifröst duplicate snapshot changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_apps WHERE slug='engitys-bifrost' AND name='Engitys Bifrost' AND deployment_methods=ARRAY['docker']::text[] AND source_model='open_source' AND license='Apache License 2.0') THEN
    RAISE EXCEPTION 'Engity Bifröst canonical snapshot changed';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.self_host_app_category_links l
    JOIN public.self_host_apps a ON a.id=l.app_id
    JOIN public.self_host_app_categories c ON c.id=l.category_id
    WHERE a.slug='engitys-bifrost'
    GROUP BY a.id
    HAVING array_agg(c.slug ORDER BY c.slug)=ARRAY['ai-ml','identity-access','photos-galleries']::text[]
  ) THEN RAISE EXCEPTION 'Engity Bifröst canonical categories changed'; END IF;
  IF (SELECT count(*) FROM public.self_host_app_candidates WHERE slug='docuwiki' AND source_url='https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml' AND status='published' AND enriched_app_id=(SELECT id FROM public.self_host_apps WHERE slug='docuwiki') AND duplicate_app_id IS NULL) <> 1 THEN
    RAISE EXCEPTION 'DocuWiki candidate link changed';
  END IF;
  IF (SELECT count(*) FROM public.self_host_app_candidates WHERE slug='forgejorunner' AND source_url='https://raw.githubusercontent.com/maybegrim/unraid-templates/main/ForgejoRunner/ForgejoRunner.xml' AND status='published' AND enriched_app_id=(SELECT id FROM public.self_host_apps WHERE slug='forgejorunner') AND duplicate_app_id IS NULL) <> 1 THEN
    RAISE EXCEPTION 'Forgejo Runner candidate link changed';
  END IF;
  IF (SELECT count(*) FROM public.self_host_app_candidates WHERE slug='engitys-bifr-st' AND source_url='https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md' AND status='duplicate' AND duplicate_app_id=(SELECT id FROM public.self_host_apps WHERE slug='engitys-bifr-st')) <> 1 THEN
    RAISE EXCEPTION 'Engity Bifröst candidate link changed';
  END IF;
END;
$review_guard$;

-- Correct DokuWiki metadata and merge the valid community Unraid template.
UPDATE public.self_host_apps AS a SET
  name='DokuWiki',
  summary='File-based wiki for documentation and knowledge bases, with revision history and access controls.',
  summary_source='https://www.dokuwiki.org/dokuwiki',
  summary_confidence='high',
  website_url='https://www.dokuwiki.org/dokuwiki',
  docs_url='https://www.dokuwiki.org/',
  data_source_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(array_remove(array_remove(coalesce(a.data_source_urls,ARRAY[]::text[]),'http://www.dokuwiki.org'),'http://www.dokuwiki.org/') || ARRAY['https://www.dokuwiki.org/dokuwiki','https://www.dokuwiki.org/','https://www.dokuwiki.org/install','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  updated_at=now()
WHERE a.slug='dokuwiki';

UPDATE public.self_host_app_install_options AS i SET
  options=i.options || '[{"method":"unraid","label":"Unraid community template","url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml","source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml","image":"dokuwiki/dokuwiki:stable","note":"Community template using the official DokuWiki image.","support_level":"community","sort_order":35}]'::jsonb,
  unraid_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(i.unraid_urls,ARRAY[]::text[]) || ARRAY['https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  source_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://www.dokuwiki.org/dokuwiki','https://www.dokuwiki.org/install','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  updated_at=now()
FROM public.self_host_apps AS a
WHERE i.app_id=a.id AND a.slug='dokuwiki' AND NOT i.options @> '[{"method":"unraid"}]'::jsonb;

UPDATE public.self_host_app_resource_estimates AS e SET
  ram_estimate_basis='Estimate for a small personal wiki; plugins, uploads, and concurrent reads affect RAM.',
  ram_source_urls=ARRAY['https://www.dokuwiki.org/dokuwiki','https://www.dokuwiki.org/install']::text[],
  storage_estimate_basis='Estimate for a small wiki; page revisions and media uploads drive storage growth.',
  storage_source_urls=ARRAY['https://www.dokuwiki.org/dokuwiki','https://www.dokuwiki.org/install']::text[],
  updated_at=now()
FROM public.self_host_apps AS a WHERE e.app_id=a.id AND a.slug='dokuwiki';

UPDATE public.self_host_apps AS a SET
  name='DokuWiki',
  website_url='https://www.dokuwiki.org/dokuwiki',
  docs_url='https://www.dokuwiki.org/',
  source_code_url='https://github.com/dokuwiki/dokuwiki',
  source_code_host='github',
  source_full_name='dokuwiki/dokuwiki',
  source_model='open_source'::public.self_host_app_source_model,
  license='GPL-2.0',
  license_type='copyleft'::public.self_host_app_license_type,
  published=false,
  updated_at=now()
WHERE a.slug='docuwiki';

DELETE FROM public.self_host_app_category_links l USING public.self_host_apps a WHERE l.app_id=a.id AND a.slug='docuwiki';
INSERT INTO public.self_host_app_category_links(app_id,category_id)
SELECT a.id,c.id FROM public.self_host_apps a CROSS JOIN public.self_host_app_categories c WHERE a.slug='docuwiki' AND c.slug='wikis' ON CONFLICT DO NOTHING;
UPDATE public.self_host_app_resource_estimates e SET
  ram_estimate_min_mb=256,ram_estimate_max_mb=2048,ram_estimate_kind='estimated',ram_estimate_confidence='low',
  ram_estimate_basis='Estimate for a small personal wiki; plugins, uploads, and concurrent reads affect RAM.',
  ram_source_urls=ARRAY['https://www.dokuwiki.org/dokuwiki','https://www.dokuwiki.org/install']::text[],
  storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
  storage_estimate_basis='Estimate for a small wiki; page revisions and media uploads drive storage growth.',
  storage_source_urls=ARRAY['https://www.dokuwiki.org/dokuwiki','https://www.dokuwiki.org/install']::text[],
  checked_at=now(),updated_at=now()
FROM public.self_host_apps a WHERE e.app_id=a.id AND a.slug='docuwiki';

-- Correct Forgejo Runner and add its current official binary, Docker, and Compose paths.
UPDATE public.self_host_apps AS a SET
  summary='Runs Forgejo Actions workflows on a separate runner host or container.',
  summary_source='https://forgejo.org/docs/latest/admin/actions/',
  summary_confidence='high',
  docs_url='https://forgejo.org/docs/latest/admin/actions/',
  install_docs_url='https://forgejo.org/docs/latest/admin/actions/installation/docker/',
  docker_url='https://forgejo.org/docs/latest/admin/actions/installation/docker/',
  docker_image='data.forgejo.org/forgejo/runner:13',
  compose_url='https://forgejo.org/docs/latest/admin/actions/installation/docker/',
  deployment_methods=ARRAY['binary','compose','docker','yunohost']::text[],
  docker_support='official',
  compose_support=true,
  data_source_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://forgejo.org/docs/latest/admin/actions/','https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://forgejo.org/docs/latest/admin/actions/installation/binary/','https://code.forgejo.org/forgejo/runner']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
    'docker',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Forgejo documents the official runner OCI image and Docker install.','source_urls',jsonb_build_array('https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://code.forgejo.org/forgejo/runner')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Forgejo documents data.forgejo.org/forgejo/runner:13.','source_urls',jsonb_build_array('https://forgejo.org/docs/latest/admin/actions/installation/docker/')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Forgejo documents a Docker Compose example for the runner.','source_urls',jsonb_build_array('https://forgejo.org/docs/latest/admin/actions/installation/docker/')),
    'binary',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Forgejo documents signed binary installation.','source_urls',jsonb_build_array('https://forgejo.org/docs/latest/admin/actions/installation/binary/'))
  ),
  updated_at=now()
WHERE a.slug='forgejo-runner';

UPDATE public.self_host_app_install_options AS i SET
  options=(SELECT jsonb_agg(CASE WHEN item->>'method'='yunohost' THEN jsonb_set(item,'{note}','null'::jsonb,true) ELSE item END ORDER BY (item->>'sort_order')::integer) FROM jsonb_array_elements(i.options) AS x(item)) || '[{"method":"docker","label":"Docker image","url":"https://forgejo.org/docs/latest/admin/actions/installation/docker/","source_url":"https://forgejo.org/docs/latest/admin/actions/installation/docker/","image":"data.forgejo.org/forgejo/runner:13","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://forgejo.org/docs/latest/admin/actions/installation/docker/","source_url":"https://forgejo.org/docs/latest/admin/actions/installation/docker/","image":"data.forgejo.org/forgejo/runner:13","note":"Official example includes a privileged Docker-in-Docker service.","support_level":"official","sort_order":20},{"method":"binary","label":"Linux binary","url":"https://forgejo.org/docs/latest/admin/actions/installation/binary/","source_url":"https://forgejo.org/docs/latest/admin/actions/installation/binary/","image":null,"note":"Requires Git and a separate container runtime for isolated jobs.","support_level":"official","sort_order":30}]'::jsonb,
  docker_urls=ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/docker/']::text[],
  docker_images=ARRAY['data.forgejo.org/forgejo/runner:13']::text[],
  compose_urls=ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/docker/']::text[],
  binary_urls=ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/binary/']::text[],
  source_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://forgejo.org/docs/latest/admin/actions/installation/binary/']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  checked_at=now(),updated_at=now()
FROM public.self_host_apps a WHERE i.app_id=a.id AND a.slug='forgejo-runner' AND NOT i.options @> '[{"method":"docker"}]'::jsonb;

UPDATE public.self_host_app_resource_estimates AS e SET
  ram_estimate_min_mb=512,ram_estimate_max_mb=4096,ram_estimate_kind='estimated',ram_estimate_confidence='low',
  ram_estimate_basis='Estimate for one small runner; concurrent workflows and their toolchains can use several GB.',
  ram_source_urls=ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://forgejo.org/docs/latest/admin/actions/installation/binary/']::text[],
  storage_estimate_min_gb=10,storage_estimate_max_gb=100,storage_estimate_kind='estimated',storage_estimate_confidence='low',
  storage_estimate_basis='Estimate for runner config, cache, and container images; workflow build size and retention drive growth.',
  storage_source_urls=ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://forgejo.org/docs/latest/admin/actions/installation/binary/']::text[],
  checked_at=now(),updated_at=now()
FROM public.self_host_apps a WHERE e.app_id=a.id AND a.slug='forgejo-runner';

UPDATE public.self_host_apps AS a SET
  name='Forgejo Runner',
  website_url='https://forgejo.org',
  docs_url='https://forgejo.org/docs/latest/admin/actions/',
  install_docs_url='https://forgejo.org/docs/latest/admin/actions/installation/docker/',
  docker_url='https://forgejo.org/docs/latest/admin/actions/installation/docker/',
  docker_image='data.forgejo.org/forgejo/runner:13',
  compose_url='https://forgejo.org/docs/latest/admin/actions/installation/docker/',
  deployment_methods=ARRAY['binary','compose','docker']::text[],
  docker_support='official',compose_support=true,
  source_code_url='https://code.forgejo.org/forgejo/runner',
  source_code_host='forgejo',source_full_name='forgejo/runner',
  source_model='open_source'::public.self_host_app_source_model,
  license='GNU General Public License v3.0 or later',license_type='copyleft'::public.self_host_app_license_type,
  published=false,
  data_source_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://forgejo.org/docs/latest/admin/actions/','https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://forgejo.org/docs/latest/admin/actions/installation/binary/','https://code.forgejo.org/forgejo/runner']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  updated_at=now()
WHERE a.slug='forgejorunner';

DELETE FROM public.self_host_app_category_links l USING public.self_host_apps a WHERE l.app_id=a.id AND a.slug='forgejorunner';
INSERT INTO public.self_host_app_category_links(app_id,category_id)
SELECT a.id,c.id FROM public.self_host_apps a CROSS JOIN public.self_host_app_categories c WHERE a.slug='forgejorunner' AND c.slug='developer-tools' ON CONFLICT DO NOTHING;
UPDATE public.self_host_app_resource_estimates e SET
  ram_estimate_min_mb=512,ram_estimate_max_mb=4096,ram_estimate_kind='estimated',ram_estimate_confidence='low',
  ram_estimate_basis='Estimate for one small runner; concurrent workflows and their toolchains can use several GB.',
  ram_source_urls=ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://forgejo.org/docs/latest/admin/actions/installation/binary/']::text[],
  storage_estimate_min_gb=10,storage_estimate_max_gb=100,storage_estimate_kind='estimated',storage_estimate_confidence='low',
  storage_estimate_basis='Estimate for runner config, cache, and container images; workflow build size and retention drive growth.',
  storage_source_urls=ARRAY['https://forgejo.org/docs/latest/admin/actions/installation/docker/','https://forgejo.org/docs/latest/admin/actions/installation/binary/']::text[],
  checked_at=now(),updated_at=now()
FROM public.self_host_apps a WHERE e.app_id=a.id AND a.slug='forgejorunner';

-- Correct Engity's Bifröst identity, category, host installation, and estimates.
UPDATE public.self_host_apps AS a SET
  name='Engity''s Bifröst',
  summary='Customizable SSH server with SSH key or OpenID Connect login and local, Docker, or Kubernetes sessions.',
  summary_source='https://bifroest.engity.org/',
  summary_confidence='high',
  website_url='https://bifroest.engity.org/',
  docs_url='https://bifroest.engity.org/',
  install_docs_url='https://bifroest.engity.org/setup/on-host/',
  deployment_methods=ARRAY['binary','docker']::text[],
  data_source_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://bifroest.engity.org/','https://bifroest.engity.org/setup/on-host/','https://bifroest.engity.org/setup/in-docker/','https://github.com/engity-com/bifroest']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
    'binary',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Official host installation guide provides downloadable binaries.','source_urls',jsonb_build_array('https://bifroest.engity.org/setup/on-host/'))
  ),
  updated_at=now()
WHERE a.slug='engitys-bifrost';

UPDATE public.self_host_app_install_options AS i SET
  options=i.options || '[{"method":"binary","label":"Host binary","url":"https://bifroest.engity.org/setup/on-host/","source_url":"https://bifroest.engity.org/setup/on-host/","image":null,"note":"Downloads a binary and installs a system service.","support_level":"official","sort_order":20}]'::jsonb,
  binary_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(i.binary_urls,ARRAY[]::text[]) || ARRAY['https://bifroest.engity.org/setup/on-host/']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  source_urls=ARRAY(SELECT DISTINCT u.url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://bifroest.engity.org/setup/on-host/']::text[]) AS u(url) WHERE u.url IS NOT NULL ORDER BY u.url),
  checked_at=now(),updated_at=now()
FROM public.self_host_apps a WHERE i.app_id=a.id AND a.slug='engitys-bifrost' AND NOT i.options @> '[{"method":"binary"}]'::jsonb;

DELETE FROM public.self_host_app_category_links l USING public.self_host_apps a WHERE l.app_id=a.id AND a.slug='engitys-bifrost';
INSERT INTO public.self_host_app_category_links(app_id,category_id)
SELECT a.id,c.id FROM public.self_host_apps a CROSS JOIN public.self_host_app_categories c WHERE a.slug='engitys-bifrost' AND c.slug IN ('remote-access','security-privacy') ON CONFLICT DO NOTHING;
UPDATE public.self_host_app_resource_estimates e SET
  ram_estimate_min_mb=256,ram_estimate_max_mb=2048,ram_estimate_kind='estimated',ram_estimate_confidence='low',
  ram_estimate_basis='Estimate for a small SSH gateway; concurrent sessions and session environments affect RAM.',
  ram_source_urls=ARRAY['https://bifroest.engity.org/','https://bifroest.engity.org/setup/on-host/','https://bifroest.engity.org/setup/in-docker/']::text[],
  storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
  storage_estimate_basis='Estimate for program files and logs; local user home directories add storage.',
  storage_source_urls=ARRAY['https://bifroest.engity.org/','https://bifroest.engity.org/setup/on-host/','https://bifroest.engity.org/setup/in-docker/']::text[],
  checked_at=now(),updated_at=now()
FROM public.self_host_apps a WHERE e.app_id=a.id AND a.slug='engitys-bifrost';

-- Point duplicate candidates to canonical apps and hide the duplicate app rows.
UPDATE public.self_host_app_candidates SET status='duplicate',duplicate_app_id=(SELECT id FROM public.self_host_apps WHERE slug='dokuwiki'),enriched_app_id=NULL,duplicate_reason='Same DokuWiki application as canonical listing.',updated_at=now()
WHERE slug='docuwiki' AND source_url='https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml';
UPDATE public.self_host_app_candidates SET status='duplicate',duplicate_app_id=(SELECT id FROM public.self_host_apps WHERE slug='forgejo-runner'),enriched_app_id=NULL,duplicate_reason='Same Forgejo Runner application as canonical listing.',updated_at=now()
WHERE slug='forgejorunner' AND source_url='https://raw.githubusercontent.com/maybegrim/unraid-templates/main/ForgejoRunner/ForgejoRunner.xml';
UPDATE public.self_host_app_candidates SET duplicate_app_id=(SELECT id FROM public.self_host_apps WHERE slug='engitys-bifrost'),enriched_app_id=NULL,duplicate_reason='Same Engity Bifröst application as canonical listing.',updated_at=now()
WHERE slug='engitys-bifr-st' AND source_url='https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md';
UPDATE public.self_host_apps SET published=false,updated_at=now() WHERE slug IN ('docuwiki','forgejorunner','engitys-bifr-st');

DO $post_guard$
BEGIN
  IF (SELECT count(*) FROM public.self_host_apps WHERE slug IN ('docuwiki','forgejorunner','engitys-bifr-st') AND published IS FALSE) <> 3 THEN
    RAISE EXCEPTION 'Duplicate listings remain published';
  END IF;
  IF (SELECT count(*) FROM public.self_host_app_candidates WHERE (slug='docuwiki' AND status='duplicate' AND duplicate_app_id=(SELECT id FROM public.self_host_apps WHERE slug='dokuwiki')) OR (slug='forgejorunner' AND status='duplicate' AND duplicate_app_id=(SELECT id FROM public.self_host_apps WHERE slug='forgejo-runner')) OR (slug='engitys-bifr-st' AND status='duplicate' AND duplicate_app_id=(SELECT id FROM public.self_host_apps WHERE slug='engitys-bifrost'))) <> 3 THEN
    RAISE EXCEPTION 'Duplicate candidates do not point to canonical apps';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_app_install_options i JOIN public.self_host_apps a ON a.id=i.app_id WHERE a.slug='dokuwiki' AND i.options @> '[{"method":"unraid","url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/docuwiki.xml"}]'::jsonb) THEN
    RAISE EXCEPTION 'DokuWiki community install option missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_app_install_options i JOIN public.self_host_apps a ON a.id=i.app_id WHERE a.slug='forgejo-runner' AND i.options @> '[{"method":"docker","image":"data.forgejo.org/forgejo/runner:13"}]'::jsonb AND i.options @> '[{"method":"compose"}]'::jsonb AND i.options @> '[{"method":"binary"}]'::jsonb) THEN
    RAISE EXCEPTION 'Forgejo Runner official install options missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_app_install_options i JOIN public.self_host_apps a ON a.id=i.app_id WHERE a.slug='engitys-bifrost' AND i.options @> '[{"method":"binary","url":"https://bifroest.engity.org/setup/on-host/"}]'::jsonb) THEN
    RAISE EXCEPTION 'Engity Bifröst host install option missing';
  END IF;
  IF (SELECT count(*) FROM public.self_host_app_category_links l JOIN public.self_host_apps a ON a.id=l.app_id JOIN public.self_host_app_categories c ON c.id=l.category_id WHERE a.slug='engitys-bifrost' AND c.slug IN ('remote-access','security-privacy')) <> 2 THEN
    RAISE EXCEPTION 'Engity Bifröst categories incorrect';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.self_host_apps WHERE slug='forgejo-runner' AND published IS TRUE AND source_model='open_source' AND license='GNU General Public License v3.0 or later' AND docker_image='data.forgejo.org/forgejo/runner:13') THEN
    RAISE EXCEPTION 'Forgejo Runner canonical app verification failed';
  END IF;
END;
$post_guard$;

COMMIT;
