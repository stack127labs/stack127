\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
  IF current_user <> 'supabase_admin' OR NOT EXISTS (SELECT FROM pg_roles WHERE rolname='stack127_app') THEN
    RAISE EXCEPTION 'Run only as the isolated target administrator after role bootstrap';
  END IF;
  IF current_setting('cron.launch_active_jobs',true) IS DISTINCT FROM 'off'
     OR 'pg_net'=ANY(string_to_array(replace(current_setting('shared_preload_libraries'),' ',''),',')) THEN
    RAISE EXCEPTION 'Keep target cron and the pg_net worker disabled while applying rehearsal privileges';
  END IF;
  IF EXISTS (SELECT FROM public.stack127_cache_worker_wake WHERE function_url IS NOT NULL) THEN
    RAISE EXCEPTION 'Neutralise the copied wake URL before applying rehearsal privileges';
  END IF;
END $$;
ALTER ROLE stack127_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT CONNECT ON DATABASE postgres TO stack127_app;
GRANT USAGE ON SCHEMA public, extensions, supabase_migrations TO stack127_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO stack127_app;
-- Routine consumers may read credentials and wake state, but only the admin
-- changes these deployment settings directly. Definer routines keep their owners.
REVOKE INSERT, UPDATE, DELETE ON public.stack127_cache_credentials, public.stack127_cache_worker_wake FROM stack127_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO stack127_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO stack127_app;
-- Migrations run as the restored object owner. Defaults cover object ACLs only:
-- new tables still need enabled RLS and reviewed backend policies before use.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO stack127_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO stack127_app;
GRANT SELECT ON ALL TABLES IN SCHEMA supabase_migrations TO stack127_app;
REVOKE CREATE ON SCHEMA public, extensions, supabase_migrations FROM stack127_app;
-- The Node worker verifies retirement of the old scheduled wake. pg_cron hides
-- other users' jobs with RLS, so expose only this one job name to that reader.
-- pg_cron normally exposes scheduling through PUBLIC EXECUTE. Schema access
-- must not turn the worker's read check into permission to create jobs. This
-- isolated cluster has no other scheduler clients; the owner retains access.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA cron FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA cron TO stack127_app;
GRANT SELECT ON cron.job TO stack127_app;
DROP POLICY IF EXISTS stack127_worker_wiring_read ON cron.job;
CREATE POLICY stack127_worker_wiring_read ON cron.job FOR SELECT TO stack127_app
  USING (jobname = 'stack127-cache-worker');
DO $$
DECLARE item record;
BEGIN
  FOR item IN
    SELECT c.relname,c.relrowsecurity FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p')
  LOOP
    IF NOT item.relrowsecurity THEN
      RAISE EXCEPTION 'Review RLS before granting backend access to %', item.relname;
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS stack127_backend_access ON public.%I', item.relname);
    IF item.relname IN ('stack127_cache_credentials','stack127_cache_worker_wake') THEN
      EXECUTE format('CREATE POLICY stack127_backend_access ON public.%I FOR SELECT TO stack127_app USING (true)',item.relname);
    ELSE
      EXECUTE format('CREATE POLICY stack127_backend_access ON public.%I FOR ALL TO stack127_app USING (true) WITH CHECK (true)',item.relname);
    END IF;
  END LOOP;
END $$;
COMMIT;
