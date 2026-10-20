\set ON_ERROR_STOP on
DO $$
BEGIN
  IF current_user <> 'supabase_admin' OR NOT EXISTS (SELECT FROM pg_roles WHERE rolname='stack127_app') THEN
    RAISE EXCEPTION 'This preparation is only for the isolated target';
  END IF;
  IF current_setting('cron.launch_active_jobs',true) IS DISTINCT FROM 'off'
     OR 'pg_net'=ANY(string_to_array(replace(current_setting('shared_preload_libraries'),' ',''),',')) THEN
    RAISE EXCEPTION 'Stop cron and remove pg_net from preloads before preparing the target';
  END IF;
  IF EXISTS (SELECT FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p')) THEN
    RAISE EXCEPTION 'Target is not empty; do not discard an existing rehearsal or live database';
  END IF;
END $$;
-- Schema-limited pg_dump omits extension definitions. Keep the image's
-- extensions and install the compatible pg_net SQL while its worker is off.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions VERSION '0.20.4';
DO $$
BEGIN
  IF (SELECT extversion FROM pg_extension WHERE extname='pg_net') IS DISTINCT FROM '0.20.4' THEN
    RAISE EXCEPTION 'Review pg_net version before restoring';
  END IF;
END $$;
-- Keep initdb's special public-schema baseline (including PUBLIC USAGE).
ALTER SCHEMA public OWNER TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO PUBLIC;
ALTER ROLE supabase_admin SET search_path TO "$user", public, auth, extensions;
DROP SCHEMA IF EXISTS supabase_migrations CASCADE;
-- Replace only image helper functions that the archive supplies. Their event
-- triggers serve local PostgREST/GraphQL services, which are not running here.
DO $$
DECLARE item record;
BEGIN
  FOR item IN
    SELECT p.oid::regprocedure AS identity FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='extensions' AND p.prokind='f'
      AND NOT EXISTS (SELECT FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')
  LOOP
    EXECUTE format('DROP FUNCTION %s CASCADE',item.identity);
  END LOOP;
END $$;
ALTER SCHEMA extensions OWNER TO postgres;
-- Omit the SCHEMA - public and SCHEMA - extensions entries from pg_restore's use-list, keeping
-- their ACL/comment entries and all helper functions. Do not drop the extensions schema.
