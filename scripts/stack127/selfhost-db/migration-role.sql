\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
  IF current_user <> 'supabase_admin'
    OR current_setting('cron.launch_active_jobs',true) IS DISTINCT FROM 'off'
    OR EXISTS (SELECT FROM public.stack127_cache_worker_wake WHERE function_url IS NOT NULL) THEN
    RAISE EXCEPTION 'Prepare the migration owner only on the isolated, neutralised target';
  END IF;
END $$;
SET LOCAL log_statement = 'none';
\getenv migration_password SELFHOST_DB_MIGRATION_PASSWORD
ALTER ROLE postgres LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS CONNECTION LIMIT 5 PASSWORD :'migration_password';
\unset migration_password
-- Ownership supplies public and migration-history DDL. These source memberships
-- are unnecessary for deployment and would broaden access beyond that purpose.
REVOKE pg_read_all_data, pg_monitor, pg_signal_backend, pg_create_subscription,
  authenticated, anon, service_role, supabase_privileged_role, authenticator FROM postgres;
ALTER ROLE postgres SET statement_timeout = '5min';
ALTER ROLE postgres SET idle_in_transaction_session_timeout = '60s';
COMMIT;
