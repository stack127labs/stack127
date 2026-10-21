select exists (
  select 1 from public.launch_directories
  where slug = $1::text and is_published
    and btrim(name) <> '' and btrim(summary) <> ''
    and cardinality(categories) > 0
) as ready;
