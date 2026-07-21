begin;

do $$
begin
  create type public.open_project_source_model as enum (
    'open_source',
    'source_available',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.open_projects
  add column source_model public.open_project_source_model not null default 'unknown';

update public.open_projects
set source_model = case
  when license is null or btrim(license) = '' or lower(license) = 'unknown' then 'unknown'::public.open_project_source_model
  when license ~* '(elastic license|business source|sustainable use|source[- ]available|o.?saasy|proprietary|polyform|non[- ]?commercial|fair use|fair core|statamic|duplicacy|tdarr|eula|sspl|anti-capitalist|open webui|commons clause|fsl-|by-nc|additional .*terms|backend server license)'
    then 'source_available'::public.open_project_source_model
  else 'open_source'::public.open_project_source_model
end;

insert into public.open_project_field_sources (
  project_id,
  field_name,
  source,
  source_url,
  confidence,
  checked_at,
  note
)
select
  id,
  'source_model',
  'migration_license_classification',
  source_code_url,
  case when source_model = 'unknown' then 'unknown' else 'high' end,
  now(),
  case source_model
    when 'open_source' then 'Backfilled from the reviewed license label under the open-source-only data policy.'
    when 'source_available' then 'Backfilled from an explicitly restrictive or delayed-open license label.'
    else 'No verified license was available for classification.'
  end
from public.open_projects
on conflict (project_id, field_name) do update set
  source = excluded.source,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  checked_at = excluded.checked_at,
  note = excluded.note;

create index open_projects_source_model_idx
  on public.open_projects (source_model, name)
  where published = true;

commit;
