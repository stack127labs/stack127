-- Close verified deployment-document gaps without changing historical rows
-- that other directories may still reference during the compatibility window.

begin;

update public.self_host_apps
set install_docs_url = case slug
      when 'form-io' then 'https://help.form.io/deployments/deployment-guide'
      when 'kasm-workspaces' then 'https://www.kasmweb.com/docs/latest/install.html'
      when 'plone' then 'https://6.docs.plone.org/install/containers/index.html'
      when 'taiga' then 'https://docs.taiga.io/setup-production.html'
      else install_docs_url
    end,
    updated_at = now()
where slug in ('form-io', 'kasm-workspaces', 'plone', 'taiga');

update public.self_host_apps
set docker_support = 'unknown',
    compose_support = null,
    updated_at = now()
where slug = 'snypy'
  and docker_support = 'official'
  and docker_url is null
  and install_docs_url is null;

insert into public.self_host_app_field_sources (
  app_id, field_name, source, source_url, confidence, checked_at, note
)
select
  app.id,
  'install_docs_url',
  'official_documentation',
  app.install_docs_url,
  'high',
  now(),
  'Official container or server installation documentation.'
from public.self_host_apps app
where app.slug in ('form-io', 'kasm-workspaces', 'plone', 'taiga')
on conflict (app_id, field_name) do update set
  source = excluded.source,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  checked_at = excluded.checked_at,
  note = excluded.note;

commit;
