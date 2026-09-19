-- Publish the thirteen tools only after the unpublished production release has
-- passed its migration, quality, deployment, route, sitemap, and database checks.

do $$
declare
  target_slugs constant text[] := array[
    'backup-321-calculator',
    'docker-compose-checker',
    'ip-asn-lookup',
    'self-hosted-app-resource-planner',
    'restic-retention-simulator',
    'rsync-filter-tester',
    'mqtt-discovery-checker',
    'lxc-idmap-checker',
    'kdp-book-setup-calculator',
    'kdp-metadata-checker',
    'kdp-royalty-calculator',
    'kdp-pdf-preflight-checker',
    'kdp-page-count-estimator'
  ];
  release_date constant timestamptz := '2026-09-19T00:00:00.000Z';
  target_count integer;
  updated_count integer;
begin
  select count(*)
  into target_count
  from public.stack127_pages as page
  inner join public.stack127_tool_pages as tool on tool.page_id = page.id
  where page.slug = any(target_slugs);

  if target_count <> cardinality(target_slugs) then
    raise exception 'Expected % complete tool rows before publication, found %', cardinality(target_slugs), target_count;
  end if;

  update public.stack127_pages
  set
    is_published = true,
    published_at = coalesce(published_at, release_date),
    updated_at = release_date
  where slug = any(target_slugs);

  get diagnostics updated_count = row_count;
  if updated_count <> cardinality(target_slugs) then
    raise exception 'Expected to publish % pages, updated %', cardinality(target_slugs), updated_count;
  end if;

  if exists (
    select 1
    from unnest(target_slugs) as target(slug)
    left join public.stack127_pages as page on page.slug = target.slug
    where page.id is null
      or page.is_published is distinct from true
      or page.published_at is null
      or page.updated_at is null
  ) then
    raise exception 'The thirteen-tool publication invariant failed';
  end if;
end;
$$;
