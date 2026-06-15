alter table public.self_host_apps
  add column storage_and_data_notes text,
  add column github_release_count integer;

alter table public.self_host_app_github_snapshots
  add column release_count integer;

update public.self_host_apps
set storage_and_data_notes = trim(both E'\n' from concat_ws(E'\n\n', storage_model, storage_notes))
where storage_and_data_notes is null;

update public.self_host_app_github_snapshots snapshots
set release_count = apps.github_release_count
from public.self_host_apps apps
where snapshots.app_id = apps.id
  and snapshots.release_count is null;

alter table public.self_host_apps
  drop column storage_model,
  drop column storage_notes,
  drop column maintenance_notes;

alter table public.self_host_apps
  add constraint self_host_apps_github_release_count_check
    check (github_release_count is null or github_release_count >= 0);

alter table public.self_host_app_github_snapshots
  add constraint self_host_app_github_snapshots_release_count_check
    check (release_count is null or release_count >= 0);
