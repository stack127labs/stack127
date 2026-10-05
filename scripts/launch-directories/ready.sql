with requested as (
  select unnest($1::text[]) as slug
), selected as (
  select directory.* from public.launch_directories directory join requested using (slug)
)
select
  (select count(*) from selected) = cardinality($1::text[])
  and cardinality($1::text[]) > 0
  and not exists (
    select 1 from selected
    where not is_published or submission_status <> 'verified' or submit_url is null
      or checked_on is null or cost_kind not in ('free', 'free_and_paid')
      or coalesce(trim(cost_tag), '') = '' or coalesce(trim(cost_label), '') = ''
      or coalesce(trim(summary), '') = '' or coalesce(trim(best_for), '') = ''
      or coalesce(trim(review_time_label), '') = '' or coalesce(trim(link_type_label), '') = ''
      or coalesce(trim(eligibility_label), '') = '' or cardinality(sources) = 0
      or not (evidence ?& array['submission', 'cost', 'review_time', 'eligibility', 'link_type'])
  )
  and (select count(*) from public.launch_directories where is_published) = $2::int
  and not exists (
    select 1 from public.launch_directories
    where is_published and (
      categories && array['community-posts', 'app-stores-integrations']::text[]
      or slug = any(array['official-mcp-registry', 'docker-mcp-catalog', 'cline-mcp-marketplace',
        'lobehub-mcp-marketplace', 'mcpservers-org', 'rapidapi-hub', 'api-list'])
    )
  ) as ready;
