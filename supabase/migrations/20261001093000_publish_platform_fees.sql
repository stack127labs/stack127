-- Publish the platform fees hub and its 49 section pages after the unpublished
-- release passed its migration, build, route, and browser checks.
-- Also remove 15 unpublished registry rows left from the retired per-platform pages.

do $$
declare
  target_slugs constant text[] := array[
    'platform-fees',
    'platform-fees/mobile-app-stores',
    'platform-fees/desktop-apps',
    'platform-fees/watch-apps-and-themes',
    'platform-fees/pc-games',
    'platform-fees/console-games',
    'platform-fees/vr-games-and-apps',
    'platform-fees/browser-extensions',
    'platform-fees/app-marketplaces',
    'platform-fees/software-marketplaces',
    'platform-fees/software-checkout',
    'platform-fees/datasets',
    'platform-fees/digital-downloads',
    'platform-fees/online-stores',
    'platform-fees/design-assets',
    'platform-fees/fonts',
    'platform-fees/website-templates',
    'platform-fees/templates-and-ui-kits',
    'platform-fees/code-marketplaces',
    'platform-fees/3d-models',
    'platform-fees/3d-printing-files',
    'platform-fees/game-assets',
    'platform-fees/game-mods-and-items',
    'platform-fees/stock-photos',
    'platform-fees/stock-video',
    'platform-fees/stock-audio',
    'platform-fees/beats-and-instrumentals',
    'platform-fees/music-distribution',
    'platform-fees/books',
    'platform-fees/audiobooks',
    'platform-fees/comics-and-fiction',
    'platform-fees/course-marketplaces',
    'platform-fees/tutoring',
    'platform-fees/course-platforms',
    'platform-fees/teaching-resources',
    'platform-fees/event-tickets',
    'platform-fees/craft-patterns',
    'platform-fees/communities',
    'platform-fees/fan-subscriptions',
    'platform-fees/newsletters',
    'platform-fees/video-creators',
    'platform-fees/video-sales',
    'platform-fees/podcasts',
    'platform-fees/tips',
    'platform-fees/coaching',
    'platform-fees/freelance-services',
    'platform-fees/crowdfunding',
    'platform-fees/ai-creations',
    'platform-fees/merch-and-print-on-demand',
    'platform-fees/payments'

  ];
  stale_slugs constant text[] := array[
    'platform-fees/amazon-kdp',
    'platform-fees/apple-app-store',
    'platform-fees/chrome-web-store',
    'platform-fees/envato-market',
    'platform-fees/etsy-digital-downloads',
    'platform-fees/figma-community',
    'platform-fees/google-play',
    'platform-fees/gumroad',
    'platform-fees/jetbrains-marketplace',
    'platform-fees/patreon',
    'platform-fees/payhip',
    'platform-fees/shopify-app-store',
    'platform-fees/substack',
    'platform-fees/udemy',
    'platform-fees/youtube-partner-program'
  ];
  release_date constant timestamptz := '2026-10-01T00:00:00.000Z';
  found_count integer;
begin
  select count(*) into found_count from public.stack127_pages where slug = any(target_slugs);
  if found_count <> cardinality(target_slugs) then
    raise exception 'Expected % platform fee registry rows before publication, found %', cardinality(target_slugs), found_count;
  end if;

  select count(*) into found_count from public.platform_fee_sections;
  if found_count <> cardinality(target_slugs) - 1 then
    raise exception 'Expected % platform fee sections, found %', cardinality(target_slugs) - 1, found_count;
  end if;

  select count(*) into found_count from public.platform_fee_entries;
  if found_count = 0 then
    raise exception 'Platform fee entries are missing';
  end if;

  if exists (select 1 from public.stack127_pages where slug = any(stale_slugs) and is_published) then
    raise exception 'A retired platform fee page is published; review it before removal';
  end if;
  if exists (
    select 1 from public.stack127_pages page
    where page.slug = any(stale_slugs)
      and (exists (select 1 from public.stack127_tool_pages tool where tool.page_id = page.id)
        or exists (select 1 from public.stack127_tool_catalogs catalog where catalog.page_id = page.id))
  ) then
    raise exception 'A retired platform fee page still has dependent rows';
  end if;

  delete from public.stack127_pages where slug = any(stale_slugs);

  update public.stack127_pages
  set
    is_published = true,
    published_at = coalesce(published_at, release_date),
    updated_at = release_date
  where slug = any(target_slugs);

  select count(*) into found_count from public.stack127_pages where slug like 'platform-fees%' and is_published;
  if found_count <> cardinality(target_slugs) then
    raise exception 'Expected % published platform fee pages, found %', cardinality(target_slugs), found_count;
  end if;
end;
$$;
