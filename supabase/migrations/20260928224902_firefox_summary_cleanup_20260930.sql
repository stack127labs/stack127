begin;
do $migration$
declare
  v_app uuid;
  v_count integer;
begin
  select id into v_app
  from public.self_host_apps
  where slug='firefox'
    and published is true
    and summary='Mozilla web browser for browsing the internet on a remote desktop.'
    and summary_source='https://www.mozilla.org/en-US/firefox/';
  if v_app is null then
    raise exception 'Firefox summary changed since review';
  end if;

  update public.self_host_apps
  set summary='Web browser from Mozilla for browsing the internet.',
      summary_confidence='high',
      updated_at=now()
  where id=v_app
    and summary='Mozilla web browser for browsing the internet on a remote desktop.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Firefox summary update failed'; end if;
end;
$migration$;
commit;
