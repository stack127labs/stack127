-- The function is an event-trigger implementation detail, not a public RPC.
-- Keep it available to database administration roles only when the managed
-- project has installed it.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
