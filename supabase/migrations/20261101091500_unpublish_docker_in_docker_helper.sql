begin;

do $$
begin
  if (select count(*) from public.self_host_apps
      where slug='docker-in-docker-dind' and published and self_hosting_status='self_hostable') <> 1 then
    raise exception 'Docker-in-Docker cleanup snapshot changed';
  end if;
end $$;

update public.self_host_apps
set published=false, updated_at=now()
where slug='docker-in-docker-dind';

commit;
