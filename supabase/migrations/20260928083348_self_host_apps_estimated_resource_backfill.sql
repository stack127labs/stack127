-- Fill RAM and storage values for the published directory. These are broad
-- planning estimates for one small self-hosted instance, not vendor requirements.
with app_categories as (
  select
    link.app_id,
    array_agg(distinct category.slug order by category.slug) as categories
  from public.self_host_app_category_links as link
  join public.self_host_app_categories as category on category.id = link.category_id
  group by link.app_id
), app_sources as (
  select
    app.id as app_id,
    coalesce(
      nullif(source.urls, '{}'::text[]),
      app.data_source_urls[1:1],
      '{}'::text[]
    ) as urls
  from public.self_host_apps as app
  left join lateral (
    select array_agg(distinct url order by url) as urls
    from unnest(array_remove(array[
      app.website_url,
      app.source_code_url,
      app.docs_url,
      app.install_docs_url,
      app.docker_url
    ]::text[], null::text)) as links(url)
  ) as source on true
), apps as (
  select
    app.id,
    app.slug,
    app.name,
    app.summary,
    app.storage_profile,
    coalesce(categories.categories, '{}'::text[]) as categories,
    coalesce(sources.urls, '{}'::text[]) as source_urls,
    app.ram_min_mb is null
      and app.ram_recommended_mb is null
      and app.ram_default_limit_mb is null as needs_ram_estimate,
    app.storage_min_gb is null as needs_storage_estimate
  from public.self_host_apps as app
  left join app_categories as categories on categories.app_id = app.id
  left join app_sources as sources on sources.app_id = app.id
  where app.published = true
    and app.self_hosting_status = 'self_hostable'
), planned as (
  select
    apps.*,
    case
      when 'ai-ml' = any(categories)
        and (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' then 8192
      when categories && array['databases', 'search']::text[] then 2048
      when 'ai-ml' = any(categories) then 1024
      when categories && array['media-servers', 'video-conferencing']::text[] then 2048
      when categories && array['monitoring-status', 'system-admin-hosting', 'networking-dns', 'identity-access']::text[] then 1024
      when 'games' = any(categories) then 1024
      else 512
    end as ram_min_estimate_mb,
    case
      when 'ai-ml' = any(categories)
        and (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' then 32768
      when categories && array['databases', 'search']::text[] then 8192
      when 'ai-ml' = any(categories) then 8192
      when categories && array['media-servers', 'video-conferencing', 'games']::text[] then 8192
      when categories && array['monitoring-status', 'system-admin-hosting', 'networking-dns', 'identity-access']::text[] then 4096
      else 4096
    end as ram_max_estimate_mb,
    case
      when 'ai-ml' = any(categories)
        and (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' then
        'Estimated for one self-hosted node running a local model. Model size, context, GPU use, and concurrent requests can raise RAM above this range.'
      when categories && array['databases', 'search']::text[] then
        'Estimated for a small single-node database or search service. Dataset size and query load can raise RAM above this range.'
      when 'ai-ml' = any(categories) then
        'Estimated for one small self-hosted AI service. A connected model runtime can raise RAM above this range.'
      when categories && array['media-servers', 'video-conferencing']::text[] then
        'Estimated for one small media or video service. Transcoding and active sessions can raise RAM above this range.'
      when 'games' = any(categories) then
        'Estimated for one small private game server. World size and player count can raise RAM above this range.'
      else
        'Estimated for one small self-hosted instance with light home or lab traffic.'
    end as ram_estimate_basis,
    case storage_profile
      when 'tiny' then 0.5
      when 'low' then 1
      when 'medium' then 10
      when 'high' then 100
      when 'depends' then 10
      when 'unknown' then
        case
          when 'ai-ml' = any(categories)
            and (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' then 20
          when categories && array['photos-galleries', 'file-sharing-sync', 'storage-backup', 'media-servers', 'music-audio', 'ebooks-libraries']::text[] then 50
          when categories && array['databases', 'search', 'monitoring-status', 'games', 'video-conferencing']::text[] then 10
          else 1
        end
      else 1
    end as storage_min_estimate_gb,
    case storage_profile
      when 'tiny' then 2
      when 'low' then 10
      when 'medium' then 100
      when 'high' then 1000
      when 'depends' then 500
      when 'unknown' then
        case
          when 'ai-ml' = any(categories)
            and (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' then 100
          when categories && array['photos-galleries', 'file-sharing-sync', 'storage-backup', 'media-servers', 'music-audio', 'ebooks-libraries']::text[] then 500
          when categories && array['databases', 'search', 'monitoring-status', 'games', 'video-conferencing']::text[] then 100
          else 20
        end
      else 20
    end as storage_max_estimate_gb,
    case
      when storage_profile = 'unknown' and categories && array[
        'photos-galleries', 'file-sharing-sync', 'storage-backup', 'media-servers', 'music-audio', 'ebooks-libraries'
      ]::text[] then
        'Estimated for a small personal library or backup set. Stored files can grow beyond this range.'
      when storage_profile = 'unknown' and 'ai-ml' = any(categories) then
        'Estimated for one small model cache and application files. Model size and number of models can raise storage above this range.'
      when storage_profile = 'unknown' and categories && array[
        'databases', 'search', 'monitoring-status', 'games', 'video-conferencing'
      ]::text[] then
        'Estimated for a small dataset, log-retention window, game world, or recording set. Actual stored data can grow beyond this range.'
      when storage_profile = 'unknown' then
        'Estimated for application files and a small configuration set. User content can grow beyond this range.'
      else
        'Estimated for a small single-node setup based on the recorded storage profile. User content can grow beyond this range.'
    end as storage_estimate_basis
  from apps
)
insert into public.self_host_app_resource_estimates (
  app_id,
  ram_estimate_min_mb,
  ram_estimate_max_mb,
  ram_estimate_kind,
  ram_estimate_confidence,
  ram_estimate_basis,
  ram_source_urls,
  ram_note,
  storage_estimate_min_gb,
  storage_estimate_max_gb,
  storage_estimate_kind,
  storage_estimate_confidence,
  storage_estimate_basis,
  storage_source_urls,
  storage_note,
  checked_at
)
select
  planned.id,
  case when planned.needs_ram_estimate then planned.ram_min_estimate_mb else null end,
  case when planned.needs_ram_estimate then planned.ram_max_estimate_mb else null end,
  case when planned.needs_ram_estimate then 'estimated' else null end,
  case when planned.needs_ram_estimate then 'low' else null end,
  case when planned.needs_ram_estimate then planned.ram_estimate_basis else null end,
  case when planned.needs_ram_estimate then planned.source_urls else '{}'::text[] end,
  case when planned.needs_ram_estimate then 'Small single-node workload estimate.' else null end,
  case when planned.needs_storage_estimate then planned.storage_min_estimate_gb else null end,
  case when planned.needs_storage_estimate then planned.storage_max_estimate_gb else null end,
  case when planned.needs_storage_estimate then 'estimated' else null end,
  case when planned.needs_storage_estimate then 'low' else null end,
  case when planned.needs_storage_estimate then planned.storage_estimate_basis else null end,
  case when planned.needs_storage_estimate then planned.source_urls else '{}'::text[] end,
  case when planned.needs_storage_estimate then 'Small self-hosted use estimate.' else null end,
  now()
from planned
where planned.needs_ram_estimate or planned.needs_storage_estimate
on conflict (app_id) do update set
  ram_estimate_min_mb = coalesce(self_host_app_resource_estimates.ram_estimate_min_mb, excluded.ram_estimate_min_mb),
  ram_estimate_max_mb = coalesce(self_host_app_resource_estimates.ram_estimate_max_mb, excluded.ram_estimate_max_mb),
  ram_estimate_kind = coalesce(self_host_app_resource_estimates.ram_estimate_kind, excluded.ram_estimate_kind),
  ram_estimate_confidence = coalesce(self_host_app_resource_estimates.ram_estimate_confidence, excluded.ram_estimate_confidence),
  ram_estimate_basis = coalesce(self_host_app_resource_estimates.ram_estimate_basis, excluded.ram_estimate_basis),
  ram_source_urls = case
    when cardinality(self_host_app_resource_estimates.ram_source_urls) > 0 then self_host_app_resource_estimates.ram_source_urls
    else excluded.ram_source_urls
  end,
  ram_note = coalesce(self_host_app_resource_estimates.ram_note, excluded.ram_note),
  storage_estimate_min_gb = coalesce(self_host_app_resource_estimates.storage_estimate_min_gb, excluded.storage_estimate_min_gb),
  storage_estimate_max_gb = coalesce(self_host_app_resource_estimates.storage_estimate_max_gb, excluded.storage_estimate_max_gb),
  storage_estimate_kind = coalesce(self_host_app_resource_estimates.storage_estimate_kind, excluded.storage_estimate_kind),
  storage_estimate_confidence = coalesce(self_host_app_resource_estimates.storage_estimate_confidence, excluded.storage_estimate_confidence),
  storage_estimate_basis = coalesce(self_host_app_resource_estimates.storage_estimate_basis, excluded.storage_estimate_basis),
  storage_source_urls = case
    when cardinality(self_host_app_resource_estimates.storage_source_urls) > 0 then self_host_app_resource_estimates.storage_source_urls
    else excluded.storage_source_urls
  end,
  storage_note = coalesce(self_host_app_resource_estimates.storage_note, excluded.storage_note),
  checked_at = coalesce(self_host_app_resource_estimates.checked_at, excluded.checked_at),
  updated_at = now();
