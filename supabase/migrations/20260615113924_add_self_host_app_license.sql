alter table public.self_host_apps
  add column if not exists license text;

update public.self_host_apps as app
set license = source.license
from (
  values
    ('immich', 'AGPL-3.0'),
    ('nextcloud', 'AGPL-3.0'),
    ('jellyfin', 'GPL-2.0'),
    ('home-assistant', 'Apache-2.0'),
    ('vaultwarden', 'AGPL-3.0'),
    ('paperless-ngx', 'GPL-3.0'),
    ('uptime-kuma', 'MIT'),
    ('pi-hole', 'EUPL-1.2'),
    ('adguard-home', 'GPL-3.0'),
    ('gitea', 'MIT')
) as source(slug, license)
where app.slug = source.slug;
