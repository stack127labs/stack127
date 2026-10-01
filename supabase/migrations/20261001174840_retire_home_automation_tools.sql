-- Retire the tools first so membership triggers can update the catalog before
-- its own registry row is removed. Foreign keys also remove their content rows
-- and catalog memberships. Hardware directories remain published.
delete from public.stack127_pages
where slug in (
  'home-assistant-energy-entity-checker',
  'mqtt-discovery-checker'
);

delete from public.stack127_pages
where slug = 'home-automation-tools';
