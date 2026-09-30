begin;

do $review_guard$
begin
  if not exists (
    select 1
    from public.self_host_apps a
    where a.slug = 'kibana'
      and a.published = true
      and a.docker_image = 'docker.elastic.co/kibana/kibana:9.4.4'
  ) then
    raise exception 'Kibana image field changed since the reviewed correction';
  end if;

  if not exists (
    select 1
    from public.self_host_app_install_options i
    join public.self_host_apps a on a.id = i.app_id
    where a.slug = 'kibana'
      and i.docker_images = array['docker.elastic.co/kibana/kibana:9.5.4']::text[]
      and i.options @> '[{"method":"docker","image":"docker.elastic.co/kibana/kibana:9.5.4"}]'::jsonb
      and i.options @> '[{"method":"compose","image":"docker.elastic.co/kibana/kibana:9.5.4"}]'::jsonb
  ) then
    raise exception 'Kibana official install options changed since the reviewed correction';
  end if;
end;
$review_guard$;

update public.self_host_apps a
set docker_image = 'docker.elastic.co/kibana/kibana:9.5.4',
    updated_at = now()
where a.slug = 'kibana';

commit;
