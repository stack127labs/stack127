-- Short nav/UI label for each published page (sidebar, home cards, future chrome).
-- meta_title stays the full SEO title; label is the compact display name.

alter table public.version127_pages
  add column if not exists label text;

update public.version127_pages
set label = case slug
  when '' then 'home'
  when 'about' then 'about'
  when 'privacy' then 'privacy'
  when 'terms' then 'terms'
  when 'self-host-apps' then 'self-host apps'
  when 'software-licenses-for-self-hosting' then 'software licenses'
  when 'self-hosting-for-beginners' then 'self-hosting for beginners'
  when 'self-hosting' then 'self-hosting for beginners'
  when 'self-hosting-for-beginners/what-you-can-host' then 'what I host'
  when 'self-hosting/what-you-can-host' then 'what I host'
  when 'self-hosting-for-beginners/basic-setup' then 'the basic setup'
  when 'self-hosting/basic-setup' then 'the basic setup'
  when 'self-hosting-for-beginners/pick-your-first-server' then 'pick a server'
  when 'self-hosting/pick-your-first-server' then 'pick a server'
  when 'self-hosting-for-beginners/pick-your-operating-system' then 'pick an OS'
  when 'self-hosting/pick-your-operating-system' then 'pick an OS'
  when 'self-hosting-for-beginners/install-your-os' then 'install the OS'
  when 'self-hosting/install-your-os' then 'install the OS'
  when 'self-hosting-for-beginners/linux-ssh-basics' then 'linux + SSH'
  when 'self-hosting/linux-ssh-basics' then 'linux + SSH'
  when 'self-hosting-for-beginners/install-docker' then 'meet Docker'
  when 'self-hosting/install-docker' then 'meet Docker'
  when 'self-hosting-for-beginners/install-your-first-app' then 'install first app'
  when 'self-hosting/install-your-first-app' then 'install first app'
  when 'self-hosting-for-beginners/understand-docker-compose' then 'Docker Compose'
  when 'self-hosting/understand-docker-compose' then 'Docker Compose'
  when 'self-hosting-for-beginners/storage-and-volumes' then 'storage & volumes'
  when 'self-hosting/storage-and-volumes' then 'storage & volumes'
  when 'self-hosting-for-beginners/best-first-apps' then 'best first apps'
  when 'self-hosting/best-first-apps' then 'best first apps'
  when 'self-hosting-for-beginners/backups-before-serious-apps' then 'backups'
  when 'self-hosting/backups-before-serious-apps' then 'backups'
  when 'self-hosting-for-beginners/access-apps-safely-at-home' then 'access at home'
  when 'self-hosting/access-apps-safely-at-home' then 'access at home'
  when 'self-hosting-for-beginners/access-apps-remotely-with-tailscale' then 'remote access'
  when 'self-hosting/access-apps-remotely-with-tailscale' then 'remote access'
  when 'self-hosting-for-beginners/full-walkthrough' then 'full walkthrough'
  when 'self-hosting/full-walkthrough' then 'full walkthrough'
  else null
end
where label is null or btrim(label) = '';

-- Fallback for any future/unknown rows: last path segment with hyphens as spaces.
update public.version127_pages
set label = replace(
  case
    when slug = '' then 'home'
    when position('/' in slug) > 0 then split_part(slug, '/', -1)
    else slug
  end,
  '-',
  ' '
)
where label is null or btrim(label) = '';

alter table public.version127_pages
  alter column label set not null;

alter table public.version127_pages
  drop constraint if exists version127_pages_label_check;

alter table public.version127_pages
  add constraint version127_pages_label_check
  check (
    label = btrim(label)
    and length(label) > 0
    and length(label) <= 80
  );
