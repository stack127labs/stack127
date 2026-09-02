-- Keep the one-row-per-app resource planning table aligned with the app table.
-- Exact publisher requirements stay on self_host_apps; an empty row means no
-- separate planning estimate has been reviewed yet.
insert into public.self_host_app_resource_estimates (app_id)
select app.id
from public.self_host_apps app
on conflict (app_id) do nothing;
