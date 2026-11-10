-- Hardware facts shipped only in repository JSON. Remove their registry and
-- family rows; do not touch self-host apps or remote media objects.
delete from public.stack127_directory_record_state
where page_id in (select id from public.stack127_pages where slug in (
  'zigbee-devices', 'zigbee-coordinators', 'z-wave-devices',
  'matter-devices', 'nut-compatible-ups', 'local-security-cameras'
));
delete from public.stack127_directory_pages
where page_id in (select id from public.stack127_pages where slug in (
  'zigbee-devices', 'zigbee-coordinators', 'z-wave-devices',
  'matter-devices', 'nut-compatible-ups', 'local-security-cameras'
));
delete from public.stack127_pages where slug in (
  'zigbee-devices', 'zigbee-coordinators', 'z-wave-devices',
  'matter-devices', 'nut-compatible-ups', 'local-security-cameras'
);
-- Registry deletion triggers can enqueue a final event. Releases replace the
-- routes and sitemap; discard obsolete per-page queue and fingerprint entries.
delete from public.stack127_revalidation_events where entity_type='page' and slug in (
  'zigbee-devices', 'zigbee-coordinators', 'z-wave-devices',
  'matter-devices', 'nut-compatible-ups', 'local-security-cameras'
);
delete from public.stack127_cache_processed where entity_type='page' and slug in (
  'zigbee-devices', 'zigbee-coordinators', 'z-wave-devices',
  'matter-devices', 'nut-compatible-ups', 'local-security-cameras'
);
-- Keep app references usable, but reserve search visibility for the hub and
-- generator. Draft children also inherit this policy when later published.
update public.stack127_pages set is_indexable=false
where page_family='directory' and slug like 'keyboard-shortcuts/%'
  and is_indexable;
