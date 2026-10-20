-- OWNER ONLY, before retiring source wiring. Output contains secrets: mode 0600.
\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on
\o /run/db/source-rollback.sql
SELECT 'BEGIN;';
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE oid IN (
 'public.stack127_wake_cache_worker(boolean)'::regprocedure,
 'public.stack127_queue_wake_cache_worker()'::regprocedure) ORDER BY proname;
SELECT 'DROP TRIGGER IF EXISTS stack127_wake_cache_worker ON public.stack127_revalidation_events;';
SELECT pg_get_triggerdef(oid)||';' FROM pg_trigger
 WHERE tgrelid='public.stack127_revalidation_events'::regclass
 AND tgname='stack127_wake_cache_worker' AND NOT tgisinternal;
SELECT format('UPDATE public.stack127_cache_worker_wake SET function_url=%L WHERE id;',function_url)
 FROM public.stack127_cache_worker_wake WHERE id;
SELECT format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC;',p.proname,pg_get_function_identity_arguments(p.oid))
 FROM pg_proc p WHERE p.oid IN ('public.stack127_wake_cache_worker(boolean)'::regprocedure,'public.stack127_queue_wake_cache_worker()'::regprocedure);
SELECT format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO %s%s;',p.proname,pg_get_function_identity_arguments(p.oid),
 CASE WHEN x.grantee=0 THEN 'PUBLIC' ELSE quote_ident(pg_get_userbyid(x.grantee)) END,
 CASE WHEN x.is_grantable THEN ' WITH GRANT OPTION' ELSE '' END)
 FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) x
 WHERE p.oid IN ('public.stack127_wake_cache_worker(boolean)'::regprocedure,'public.stack127_queue_wake_cache_worker()'::regprocedure)
 AND x.privilege_type='EXECUTE';
SELECT format('SELECT cron.schedule(%L,%L,%L);',jobname,schedule,command)
 FROM cron.job WHERE jobname='stack127-cache-worker';
SELECT 'SELECT cron.alter_job(jobid,active:=false) FROM cron.job WHERE jobname=''stack127-cache-worker'';'
 FROM cron.job WHERE jobname='stack127-cache-worker' AND NOT active;
SELECT coalesce((SELECT format('ALTER ROLE postgres SET default_transaction_read_only=%L;',split_part(v,'=',2))
 FROM pg_roles r CROSS JOIN LATERAL unnest(r.rolconfig) v WHERE r.rolname='postgres'
 AND v LIKE 'default_transaction_read_only=%'),'ALTER ROLE postgres RESET default_transaction_read_only;');
SELECT 'COMMIT;';
\o
