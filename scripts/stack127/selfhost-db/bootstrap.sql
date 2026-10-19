\set ON_ERROR_STOP on
SET log_statement = 'none';
SET log_min_error_statement = 'panic';
\getenv app_password STACK127_APP_PASSWORD
CREATE ROLE stack127_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 20 PASSWORD :'app_password';
\unset app_password
-- Retain image role attributes, but remove every other login password.
DO $$
DECLARE role_name text;
BEGIN
  FOR role_name IN SELECT rolname FROM pg_roles
    WHERE rolcanlogin AND rolname NOT IN ('supabase_admin', 'stack127_app')
  LOOP
    EXECUTE format('ALTER ROLE %I PASSWORD NULL', role_name);
  END LOOP;
END $$;
-- These roles are normally created by Supabase services that are not running here.
CREATE ROLE supabase_functions_admin LOGIN NOINHERIT NOSUPERUSER NOCREATEDB CREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE supabase_realtime_admin NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT CONNECT ON DATABASE postgres TO stack127_app;
ALTER ROLE stack127_app SET statement_timeout = '60s';
ALTER ROLE stack127_app SET idle_in_transaction_session_timeout = '60s';
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
-- Install pg_net separately during empty-target preparation; keep its worker off.
-- Apply app-role.sql after restore. Bootstrap grants no table access or RLS bypass.
