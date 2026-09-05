-- Publish the six reviewed physical-product directories at their flat routes.

insert into public.stack127_pages (
  slug,
  label,
  meta_title,
  meta_description,
  is_published,
  published_at,
  updated_at,
  cover_image_url,
  page_type,
  sitemap_priority,
  page_family
) values
  (
    'zigbee-devices',
    'Zigbee devices',
    'Zigbee compatible devices for ZHA and Zigbee2MQTT',
    'Search exact Zigbee device models and compare documented ZHA support, Zigbee2MQTT support, capabilities, OTA updates, and source evidence.',
    true,
    '2026-09-05T00:00:00.000Z',
    '2026-09-05T00:00:00.000Z',
    null,
    'CollectionPage',
    0.82,
    'catalog'
  ),
  (
    'zigbee-coordinators',
    'Zigbee coordinators',
    'Zigbee coordinators for ZHA and Zigbee2MQTT',
    'Compare exact Zigbee coordinator models, chipsets, connections, firmware families, and documented Home Assistant or Zigbee2MQTT support.',
    true,
    '2026-09-05T00:00:00.000Z',
    '2026-09-05T00:00:00.000Z',
    null,
    'CollectionPage',
    0.76,
    'catalog'
  ),
  (
    'z-wave-devices',
    'Z-Wave devices',
    'Z-Wave devices with certification and product IDs',
    'Search certified Z-Wave devices by model, region, frequency, product ID, firmware, Long Range support, and Z-Wave JS configuration evidence.',
    true,
    '2026-09-05T00:00:00.000Z',
    '2026-09-05T00:00:00.000Z',
    null,
    'CollectionPage',
    0.80,
    'catalog'
  ),
  (
    'nut-compatible-ups',
    'NUT-compatible UPS',
    'NUT-compatible UPS models and drivers',
    'Find exact UPS models supported by Network UPS Tools, including driver, connection, support level, and upstream compatibility evidence.',
    true,
    '2026-09-05T00:00:00.000Z',
    '2026-09-05T00:00:00.000Z',
    null,
    'CollectionPage',
    0.76,
    'catalog'
  ),
  (
    'local-security-cameras',
    'Local security cameras',
    'RTSP and ONVIF cameras for Frigate and Home Assistant',
    'Compare exact local security camera models by RTSP, ONVIF, PoE, resolution, substreams, audio, and recorded Frigate configurations.',
    true,
    '2026-09-05T00:00:00.000Z',
    '2026-09-05T00:00:00.000Z',
    null,
    'CollectionPage',
    0.78,
    'catalog'
  ),
  (
    'matter-devices',
    'Matter devices',
    'Matter devices list with certification evidence',
    'Search Matter-certified products by model, certificate ID, manufacturer, category, Thread, Wi-Fi, Bluetooth commissioning, and source evidence.',
    true,
    '2026-09-05T00:00:00.000Z',
    '2026-09-05T00:00:00.000Z',
    null,
    'CollectionPage',
    0.80,
    'catalog'
  )
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = coalesce(public.stack127_pages.published_at, excluded.published_at),
  updated_at = greatest(coalesce(public.stack127_pages.updated_at, excluded.updated_at), excluded.updated_at),
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority,
  page_family = excluded.page_family;
