begin;

do $review_guard$
begin
  if not exists (
    select 1 from public.self_host_apps a
    join public.self_host_app_install_options i on i.app_id=a.id
    where a.slug='affine-community-edition'
      and a.docker_image='ghcr.io/toeverything/affine:stable'
      and a.compose_url='https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml'
      and i.options @> '[{"method":"docker","image":"ghcr.io/toeverything/affine:0.27.4@sha256:b649f5ce2384ffdf13c23bccf81d759e15973d59d0b0058af65d895a84373099"}]'::jsonb
      and i.options @> '[{"method":"compose","support_level":"community","url":"https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/affine/docker-compose.yml"}]'::jsonb
      and not i.options @> '[{"method":"compose","support_level":"official","url":"https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml"}]'::jsonb
      and i.compose_urls=ARRAY['https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/affine/docker-compose.yml']::text[]
  ) then raise exception 'AFFiNE install options changed since review'; end if;
end;
$review_guard$;

update public.self_host_app_install_options i
set options=(
      with changed_options as (
        select case
          when option->>'method'='docker' then
            jsonb_set(jsonb_set(option,'{image}','"ghcr.io/toeverything/affine:stable"'::jsonb),'{source_url}','"https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml"'::jsonb)
          else option
        end as option
        from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as item(option)
        union all
        select jsonb_build_object(
          'method','compose',
          'label','Docker Compose',
          'url','https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml',
          'image','ghcr.io/toeverything/affine:stable',
          'support_level','official',
          'source_url','https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml',
          'note',null,
          'sort_order',20
        )
      )
      select jsonb_agg(option order by coalesce((option->>'sort_order')::integer,1000))
      from changed_options
    ),
    docker_images=ARRAY['ghcr.io/toeverything/affine:stable']::text[],
    compose_urls=(select array_agg(distinct url order by url) from unnest(coalesce(i.compose_urls,'{}'::text[]) || ARRAY['https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml']::text[]) as src(url)),
    source_urls=(select array_agg(distinct url order by url) from unnest(coalesce(i.source_urls,'{}'::text[]) || ARRAY['https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml','https://github.com/toeverything/AFFiNE/pkgs/container/affine']::text[]) as src(url)),
    checked_at=now(),
    updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='affine-community-edition');

commit;
