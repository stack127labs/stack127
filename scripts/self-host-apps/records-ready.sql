-- The directory has published records to list. Used by the directories publisher.
select count(*) > 0 as ready from public.self_host_apps where published;
