-- Run after release through an administrator connection on the self-hosted DB.
-- Every write is rolled back. ON_ERROR_STOP is supplied by the psql command.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL ROLE stack127_app;

DO $$
DECLARE signature text;
BEGIN
  IF current_user <> 'stack127_app' THEN RAISE EXCEPTION 'Wrong application role'; END IF;
  FOREACH signature IN ARRAY ARRAY[
    'public.stack127_app_category_count(text)',
    'public.stack127_check_app_category_publication()',
    'public.stack127_remove_published_app_category_links()',
    'public.stack127_touch_directory_records()'
  ] LOOP
    IF NOT has_function_privilege(current_user,signature,'EXECUTE') THEN
      RAISE EXCEPTION 'Missing EXECUTE on %',signature;
    END IF;
  END LOOP;
END;
$$;

SELECT current_user,
  public.stack127_app_category_count('cli-apps/categories/development') AS cli_apps,
  public.stack127_app_category_count('self-host-apps/categories/ai-ml') AS self_host_apps;

-- Exercise actual sync-trigger paths with a real visible change, not a no-op.
UPDATE public.self_host_apps SET summary=summary || ' [role verification]'
WHERE id=(SELECT id FROM public.self_host_apps WHERE published AND self_hosting_status='self_hostable' LIMIT 1);
UPDATE public.terminal_apps SET summary=summary || ' [role verification]'
WHERE slug=(SELECT slug FROM public.terminal_apps WHERE published LIMIT 1);
-- Fires the publication guard and its count call when the CLI category is public.
UPDATE public.stack127_pages SET is_published=is_published
WHERE slug='cli-apps/categories/development';

ROLLBACK;
