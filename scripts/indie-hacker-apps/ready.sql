select exists (
  select 1
  from public.indie_hacker_app_directories directory
  join public.indie_hacker_apps app on app.category = directory.category and app.jobs && directory.jobs
  where directory.slug = $1
) as ready
