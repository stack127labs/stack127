select count(*) > 0 as ready from public.self_host_apps where published and self_hosting_status = 'self_hostable';
