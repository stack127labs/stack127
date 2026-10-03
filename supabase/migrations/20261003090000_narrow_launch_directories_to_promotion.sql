-- Launch directories list places that promote an existing product. App stores, integration
-- catalogs, MCP catalogs, and API marketplaces need a platform-specific build, so they are
-- hidden. The rows stay for research and a possible separate page.
begin;
set local lock_timeout = '10s';

do $$
declare
  out_of_scope text[] := array[
    'api-list',
    'apple-app-store',
    'atlassian-marketplace',
    'chrome-web-store',
    'cline-mcp-marketplace',
    'docker-mcp-catalog',
    'figma-community',
    'firefox-add-ons',
    'google-play',
    'jetbrains-marketplace',
    'lobehub-mcp-marketplace',
    'make-integrations',
    'mcpservers-org',
    'microsoft-edge-addons',
    'microsoft-marketplace',
    'notion-integrations',
    'official-mcp-registry',
    'rapidapi-hub',
    'shopify-app-store',
    'slack-marketplace',
    'webflow-apps',
    'wordpress-plugin-directory',
    'zapier-app-directory'
  ];
  found_count integer;
begin
  select count(*) into found_count from public.launch_directories where slug = any(out_of_scope);
  if found_count <> 23 then
    raise exception 'Expected 23 out-of-scope launch directory rows, found %', found_count;
  end if;
  update public.launch_directories set is_published = false
  where slug = any(out_of_scope) and is_published;
end $$;

commit;
