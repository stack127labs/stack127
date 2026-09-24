-- Tool catalog copy and membership live here. stack127_pages remains the sole
-- owner of public slugs, publication state, SEO fields, and public dates.
create table public.stack127_tool_catalogs (
  page_id bigint primary key references public.stack127_pages(id) on delete cascade,
  heading_before text not null,
  heading_mark text not null,
  heading_after text not null default '',
  intro text not null,
  section_heading text not null,
  icon_key text not null default 'layers',
  hero_art_key text not null default 'catalog-default',
  home_art_key text not null default 'catalog-default',
  home_order integer not null default 100,
  row_updated_at timestamptz not null default now(),
  constraint stack127_tool_catalogs_copy_check check (
    length(btrim(heading_mark)) > 0 and length(btrim(intro)) > 0
    and length(btrim(section_heading)) > 0
  ),
  constraint stack127_tool_catalogs_asset_check check (
    icon_key ~ '^[a-z0-9-]+$' and hero_art_key ~ '^[a-z0-9-]+$'
    and home_art_key ~ '^[a-z0-9-]+$'
  )
);

create table public.stack127_tool_catalog_memberships (
  catalog_page_id bigint not null references public.stack127_tool_catalogs(page_id) on delete cascade,
  tool_page_id bigint not null references public.stack127_tool_pages(page_id) on delete cascade,
  catalog_rank integer not null check (catalog_rank > 0),
  display_order integer not null check (display_order > 0),
  primary key (catalog_page_id, tool_page_id),
  unique (tool_page_id, catalog_rank),
  unique (catalog_page_id, display_order)
);

create index stack127_tool_catalog_memberships_tool_idx
  on public.stack127_tool_catalog_memberships (tool_page_id);

alter table public.stack127_tool_pages
  add column card_name text,
  add column card_description text,
  add column card_icon_key text,
  add column card_art_key text;

create or replace function public.touch_stack127_tool_page_public_date()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if (new.title, new.intro_markdown, new.usage_markdown, new.content_markdown,
      new.tool_version, new.card_name, new.card_description, new.card_icon_key, new.card_art_key)
    is distinct from
     (old.title, old.intro_markdown, old.usage_markdown, old.content_markdown,
      old.tool_version, old.card_name, old.card_description, old.card_icon_key, old.card_art_key) then
    update public.stack127_pages
    set updated_at = case when is_published then now() else null end
    where id = new.page_id;
  end if;
  return new;
end;
$$;

create function public.stack127_validate_tool_catalog_page()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if not exists (
    select 1 from public.stack127_pages
    where id = new.page_id and page_family = 'catalog'
  ) then
    raise exception 'stack127_tool_catalogs.page_id must refer to a catalog page';
  end if;
  return new;
end;
$$;

create trigger stack127_validate_tool_catalog_page
before insert or update of page_id on public.stack127_tool_catalogs
for each row execute function public.stack127_validate_tool_catalog_page();

create function public.stack127_protect_tool_catalog_family()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if old.page_family = 'catalog' and new.page_family <> 'catalog'
    and exists (select 1 from public.stack127_tool_catalogs where page_id = old.id) then
    raise exception 'remove the stack127_tool_catalogs row before changing its page family';
  end if;
  return new;
end;
$$;

create trigger stack127_protect_tool_catalog_family
before update of page_family on public.stack127_pages
for each row execute function public.stack127_protect_tool_catalog_family();

create trigger stack127_tool_catalogs_row_updated_at
before update on public.stack127_tool_catalogs
for each row execute function public.set_row_updated_at();

create function public.stack127_touch_catalog_page(p_page_id bigint)
returns void language plpgsql set search_path = pg_catalog, public as $$
begin
  update public.stack127_pages
  set updated_at = case when is_published then now() else null end
  where id = p_page_id;
end;
$$;
revoke all on function public.stack127_touch_catalog_page(bigint) from public, anon, authenticated;
grant execute on function public.stack127_touch_catalog_page(bigint) to service_role;

create function public.stack127_touch_catalog_content()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'DELETE' then
    perform public.stack127_touch_catalog_page(old.page_id);
  elsif tg_op = 'INSERT' then
    perform public.stack127_touch_catalog_page(new.page_id);
  elsif (to_jsonb(new) - 'row_updated_at') is distinct from (to_jsonb(old) - 'row_updated_at') then
    perform public.stack127_touch_catalog_page(new.page_id);
  end if;
  return null;
end;
$$;

create trigger stack127_touch_catalog_content
after insert or update or delete on public.stack127_tool_catalogs
for each row execute function public.stack127_touch_catalog_content();

create function public.stack127_touch_catalog_membership()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op <> 'INSERT' then
    perform public.stack127_touch_catalog_page(old.catalog_page_id);
  end if;
  if tg_op <> 'DELETE' then
    perform public.stack127_touch_catalog_page(new.catalog_page_id);
  end if;
  return null;
end;
$$;

create trigger stack127_touch_catalog_membership
after insert or update or delete on public.stack127_tool_catalog_memberships
for each row execute function public.stack127_touch_catalog_membership();

create function public.stack127_touch_tool_catalogs()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare member record;
begin
  if tg_op = 'UPDATE' and
    (new.card_name, new.card_description, new.card_icon_key, new.card_art_key)
    is not distinct from
    (old.card_name, old.card_description, old.card_icon_key, old.card_art_key) then
    return null;
  end if;
  for member in
    select distinct catalog_page_id from public.stack127_tool_catalog_memberships
    where tool_page_id = case when tg_op = 'DELETE' then old.page_id else new.page_id end
  loop
    perform public.stack127_touch_catalog_page(member.catalog_page_id);
  end loop;
  return null;
end;
$$;

create trigger stack127_touch_tool_catalogs
after insert or update or delete on public.stack127_tool_pages
for each row execute function public.stack127_touch_tool_catalogs();

create function public.stack127_touch_catalogs_on_tool_publication()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare member record;
begin
  if new.page_family = 'tool'
    and (new.is_published, new.slug) is distinct from (old.is_published, old.slug) then
    for member in
      select catalog_page_id from public.stack127_tool_catalog_memberships
      where tool_page_id = new.id
    loop
      perform public.stack127_touch_catalog_page(member.catalog_page_id);
    end loop;
  end if;
  return null;
end;
$$;

create trigger stack127_touch_catalogs_on_tool_publication
after update of is_published, slug on public.stack127_pages
for each row execute function public.stack127_touch_catalogs_on_tool_publication();

alter table public.stack127_tool_catalogs enable row level security;
alter table public.stack127_tool_catalog_memberships enable row level security;

create policy "Published tool catalogs are readable"
on public.stack127_tool_catalogs for select to anon, authenticated using (
  exists (select 1 from public.stack127_pages page
    where page.id = page_id and page.page_family = 'catalog' and page.is_published)
);

create policy "Published tool catalog memberships are readable"
on public.stack127_tool_catalog_memberships for select to anon, authenticated using (
  exists (select 1 from public.stack127_pages page
    where page.id = catalog_page_id and page.is_published)
  and exists (select 1 from public.stack127_pages page
    where page.id = tool_page_id and page.is_published)
);

revoke all on public.stack127_tool_catalogs, public.stack127_tool_catalog_memberships from anon, authenticated;
grant select on public.stack127_tool_catalogs, public.stack127_tool_catalog_memberships to anon, authenticated;

-- Preserve existing public catalog URLs and add the five planned collections.
with catalog_pages(slug, label, meta_title, meta_description, priority) as (
  values
    ('dns-tools', 'DNS tools', 'DNS tools to check records and find what broke | stack127', 'Look up DNS records, trace referrals, compare caches, and check settings for websites, email, and certificates.', 0.82),
    ('domain-tools', 'Domain tools', 'Free domain lookup tools | stack127', 'Check registration, availability, ownership, expiry, transfers, and status codes with domain tools.', 0.83),
    ('storage-tools', 'Storage tools', 'Storage planning tools | stack127', 'Plan storage capacity, backup, protection, rebuild exposure, and growth from your own drives and assumptions.', 0.80),
    ('kdp-tools', 'KDP tools', 'KDP book and publishing tools | stack127', 'Check print files, book setup, metadata, royalties, and payment timing for Amazon KDP.', 0.72),
    ('hosting-cloud-tools', 'Hosting and cloud tools', 'Hosting and cloud tools | stack127', 'Plan self-hosted app resources, inspect network details, and check server rules and proxy paths.', 0.71),
    ('developer-tools', 'Developer and system tools', 'Developer and system tools | stack127', 'Check file permissions, container configuration, sync filters, and system mappings before deployment.', 0.70),
    ('home-automation-tools', 'Home automation tools', 'Home automation tools | stack127', 'Check Home Assistant energy entities and MQTT discovery payloads before changing your setup.', 0.69),
    ('productivity-tools', 'Productivity tools', 'Productivity tools | stack127', 'Make a focused keyboard shortcut reference from the apps and actions you use.', 0.68)
)
insert into public.stack127_pages (
  slug, label, meta_title, meta_description, is_published,
  published_at, updated_at, cover_image_url, page_type, sitemap_priority, page_family
)
select slug, label, meta_title, meta_description, true, now(), now(), null,
  'CollectionPage', priority, 'catalog'
from catalog_pages
on conflict (slug) do nothing;

with catalog_content(slug, heading_before, heading_mark, heading_after, intro,
  section_heading, icon_key, hero_art_key, home_art_key, home_order) as (
  values
    ('dns-tools', 'DNS ', 'tools', ' to check records and find what broke',
      'Look up current records, trace referrals, compare cached answers, and check the DNS settings that affect websites, email, and certificates.',
      'Choose a DNS check', 'network', 'dns-tools', 'dns-tools', 10),
    ('domain-tools', 'Free domain ', 'lookup tools', ' that answer from the registry',
      'Check registration, availability, ownership, expiry, transfers, and status codes using current registry and registrar data.',
      'Choose a domain check', 'globe', 'domain-tools', 'domain-tools', 20),
    ('storage-tools', 'Storage ', 'tools', ' for planning arrays before buying drives',
      'Compare capacity, protection, rebuild exposure, growth, and cost using the drives and layout you actually plan to run.',
      'Choose a storage planner', 'layers', 'storage-tools', 'storage-tools', 30),
    ('kdp-tools', 'KDP ', 'tools', ' for planning and checking a book',
      'Check the details of a KDP book before upload, from print dimensions and images to listing fields, royalties, and payment dates.',
      'Choose a KDP check', 'book', 'kdp-tools', 'kdp-tools', 40),
    ('hosting-cloud-tools', 'Hosting and cloud ', 'tools', ' for running your own services',
      'Estimate app resources, inspect network information, and review firewall and reverse proxy settings before deployment.',
      'Choose a hosting check', 'server', 'hosting-cloud-tools', 'hosting-cloud-tools', 50),
    ('developer-tools', 'Developer and system ', 'tools', ' for checking configuration',
      'Test permissions, ignore rules, compose files, user mappings, and file sync patterns with your own inputs.',
      'Choose a system check', 'terminal', 'developer-tools', 'developer-tools', 60),
    ('home-automation-tools', 'Home automation ', 'tools', ' for checking integrations',
      'Review Home Assistant energy entities and MQTT discovery payloads before you rely on their readings or controls.',
      'Choose an automation check', 'house', 'home-automation-tools', 'home-automation-tools', 70),
    ('productivity-tools', 'Productivity ', 'tools', ' for everyday work',
      'Build a keyboard shortcut reference around the actions you use, then keep it close while you work.',
      'Choose a productivity tool', 'keyboard', 'productivity-tools', 'productivity-tools', 80)
)
insert into public.stack127_tool_catalogs (
  page_id, heading_before, heading_mark, heading_after, intro, section_heading,
  icon_key, hero_art_key, home_art_key, home_order
)
select page.id, content.heading_before, content.heading_mark, content.heading_after,
  content.intro, content.section_heading, content.icon_key, content.hero_art_key,
  content.home_art_key, content.home_order
from catalog_content content
join public.stack127_pages page on page.slug = content.slug and page.page_family = 'catalog'
on conflict (page_id) do nothing;

-- Existing tool records gain reusable card copy and approved asset keys.
update public.stack127_tool_pages tool
set card_name = coalesce(tool.card_name, page.label),
    card_description = coalesce(tool.card_description, page.meta_description),
    card_icon_key = coalesce(tool.card_icon_key, 'wrench'),
    card_art_key = coalesce(tool.card_art_key, 'catalog-default')
from public.stack127_pages page
where page.id = tool.page_id;

alter table public.stack127_tool_pages
  alter column card_name set not null,
  alter column card_description set not null,
  alter column card_icon_key set not null,
  alter column card_art_key set not null,
  add constraint stack127_tool_pages_card_check check (
    length(btrim(card_name)) > 0 and length(btrim(card_description)) > 0
    and card_icon_key ~ '^[a-z0-9-]+$' and card_art_key ~ '^[a-z0-9-]+$'
  );

-- Existing tool creation workflows can omit card fields. Their first card is
-- drawn from registry copy and can be refined independently during editing.
create function public.stack127_prepare_tool_card()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if new.card_name is null or new.card_description is null then
    select coalesce(new.card_name, page.label),
      coalesce(new.card_description, page.meta_description)
    into new.card_name, new.card_description
    from public.stack127_pages page where page.id = new.page_id;
  end if;
  new.card_icon_key = coalesce(new.card_icon_key, 'wrench');
  new.card_art_key = coalesce(new.card_art_key, 'catalog-default');
  return new;
end;
$$;

create trigger stack127_prepare_tool_card
before insert on public.stack127_tool_pages
for each row execute function public.stack127_prepare_tool_card();

with membership(catalog_slug, tool_slug, catalog_rank, display_order) as (
  values
    ('dns-tools', 'dns-lookup', 1, 1),
    ('dns-tools', 'dns-trace', 1, 2),
    ('dns-tools', 'dns-change-checker', 1, 3),
    ('dns-tools', 'nameserver-checker', 1, 4),
    ('dns-tools', 'dnssec-checker', 1, 5),
    ('dns-tools', 'soa-checker', 1, 6),
    ('dns-tools', 'caa-checker', 1, 7),
    ('dns-tools', 'domain-report', 2, 8),
    ('domain-tools', 'domain-lookup', 1, 1),
    ('domain-tools', 'domain-age', 1, 2),
    ('domain-tools', 'domain-expiry', 1, 3),
    ('domain-tools', 'domain-availability', 1, 4),
    ('domain-tools', 'multi-tld-availability', 1, 5),
    ('domain-tools', 'domain-owner', 1, 6),
    ('domain-tools', 'domain-registrar', 1, 7),
    ('domain-tools', 'transfer-readiness', 1, 8),
    ('domain-tools', 'domain-report', 1, 9),
    ('domain-tools', 'punycode-converter', 1, 10),
    ('domain-tools', 'dns-lookup', 2, 11),
    ('storage-tools', 'backup-321-calculator', 1, 1),
    ('storage-tools', 'raid-calculator', 1, 2),
    ('storage-tools', 'zfs-capacity-calculator', 1, 3),
    ('storage-tools', 'zfs-padding-calculator', 1, 4),
    ('storage-tools', 'raidz-expansion-planner', 1, 5),
    ('storage-tools', 'shr-calculator', 1, 6),
    ('storage-tools', 'unraid-calculator', 1, 7),
    ('storage-tools', 'snapraid-mergerfs-planner', 1, 8),
    ('storage-tools', 'drive-reliability', 1, 9),
    ('storage-tools', 'rebuild-calculator', 1, 10),
    ('storage-tools', 'ceph-capacity-calculator', 1, 11),
    ('storage-tools', 'storage-growth-planner', 1, 12),
    ('storage-tools', 'storage-layout-advisor', 1, 13),
    ('storage-tools', 'restic-retention-simulator', 1, 14),
    ('storage-tools', 'nfs-firewall-rules', 2, 15),
    ('kdp-tools', 'kdp-book-setup-calculator', 1, 1),
    ('kdp-tools', 'kdp-metadata-checker', 1, 2),
    ('kdp-tools', 'kdp-royalty-calculator', 1, 3),
    ('kdp-tools', 'kdp-pdf-preflight-checker', 1, 4),
    ('kdp-tools', 'kdp-image-dpi-checker', 1, 5),
    ('kdp-tools', 'kdp-page-count-estimator', 1, 6),
    ('kdp-tools', 'kdp-payment-date-calculator', 1, 7),
    ('hosting-cloud-tools', 'ip-asn-lookup', 1, 1),
    ('hosting-cloud-tools', 'nfs-firewall-rules', 1, 2),
    ('hosting-cloud-tools', 'nginx-proxy-pass-calculator', 1, 3),
    ('hosting-cloud-tools', 'self-hosted-app-resource-planner', 1, 4),
    ('hosting-cloud-tools', 'storage-layout-advisor', 2, 5),
    ('hosting-cloud-tools', 'docker-compose-checker', 2, 6),
    ('developer-tools', 'chmod-calculator', 1, 1),
    ('developer-tools', 'dockerignore-tester', 1, 2),
    ('developer-tools', 'docker-compose-checker', 1, 3),
    ('developer-tools', 'lxc-idmap-checker', 1, 4),
    ('developer-tools', 'rsync-filter-tester', 1, 5),
    ('developer-tools', 'shortcuts-cheatsheet-generator', 2, 6),
    ('home-automation-tools', 'home-assistant-energy-entity-checker', 1, 1),
    ('home-automation-tools', 'mqtt-discovery-checker', 1, 2),
    ('productivity-tools', 'shortcuts-cheatsheet-generator', 1, 1)
)
insert into public.stack127_tool_catalog_memberships (
  catalog_page_id, tool_page_id, catalog_rank, display_order
)
select catalog.id, tool.id, membership.catalog_rank, membership.display_order
from membership
join public.stack127_pages catalog on catalog.slug = membership.catalog_slug
join public.stack127_pages tool on tool.slug = membership.tool_slug
join public.stack127_tool_catalogs content on content.page_id = catalog.id
join public.stack127_tool_pages tool_content on tool_content.page_id = tool.id
on conflict (catalog_page_id, tool_page_id) do nothing;

-- Copy the edited card text and approved marker-art references from the old pages.
update public.stack127_tool_pages content set card_name = 'DNS lookup', card_description = 'See the records returned by a public resolver or the domain''s authoritative nameserver.', card_art_key = 'dns-lookup' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dns-lookup';
update public.stack127_tool_pages content set card_name = 'DNS trace', card_description = 'Follow referrals from the root servers to find where a lookup stops.', card_art_key = 'dns-trace' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dns-trace';
update public.stack127_tool_pages content set card_name = 'DNS change checker', card_description = 'Compare the authoritative answer with the copies still held by public resolver caches.', card_art_key = 'dns-change-checker' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dns-change-checker';
update public.stack127_tool_pages content set card_name = 'Nameserver checker', card_description = 'Check the parent handoff, glue records, and whether every nameserver answers.', card_art_key = 'nameserver-checker' from public.stack127_pages page where page.id = content.page_id and page.slug = 'nameserver-checker';
update public.stack127_tool_pages content set card_name = 'DNSSEC checker', card_description = 'Validate the signed chain from the root to one DNS answer.', card_art_key = 'dnssec-checker' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dnssec-checker';
update public.stack127_tool_pages content set card_name = 'SOA checker', card_description = 'Compare the serial and timing values served by every nameserver.', card_art_key = 'soa-checker' from public.stack127_pages page where page.id = content.page_id and page.slug = 'soa-checker';
update public.stack127_tool_pages content set card_name = 'CAA checker', card_description = 'Find which certificate authorities may issue normal and wildcard certificates.', card_art_key = 'caa-checker' from public.stack127_pages page where page.id = content.page_id and page.slug = 'caa-checker';
update public.stack127_tool_pages content set card_name = 'Domain lookup', card_description = 'Read the registrar, dates, status codes, nameservers, and published contact fields.', card_art_key = 'domain-lookup' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-lookup';
update public.stack127_tool_pages content set card_name = 'Domain age checker', card_description = 'Find the registration date and measure the domain''s age without treating it as the age of the website.', card_art_key = 'domain-age' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-age';
update public.stack127_tool_pages content set card_name = 'Domain expiry checker', card_description = 'See the expiry date and the renewal or deletion stages that may follow it.', card_art_key = 'domain-expiry' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-expiry';
update public.stack127_tool_pages content set card_name = 'Domain availability', card_description = 'Ask the registry whether a domain is registered, available, or unknown.', card_art_key = 'domain-availability' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-availability';
update public.stack127_tool_pages content set card_name = 'Multi-TLD availability', card_description = 'Check one name across several domain endings and keep each registry answer separate.', card_art_key = 'multi-tld-availability' from public.stack127_pages page where page.id = content.page_id and page.slug = 'multi-tld-availability';
update public.stack127_tool_pages content set card_name = 'Registrant lookup', card_description = 'See which owner details are public, which were withheld, and how contact may still work.', card_art_key = 'domain-owner' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-owner';
update public.stack127_tool_pages content set card_name = 'Registrar lookup', card_description = 'Find the registrar, its abuse contact, and any reseller shown in the record.', card_art_key = 'domain-registrar' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-registrar';
update public.stack127_tool_pages content set card_name = 'Transfer readiness', card_description = 'Check visible transfer blocks and separate what you can fix from what the lookup cannot see.', card_art_key = 'transfer-readiness' from public.stack127_pages page where page.id = content.page_id and page.slug = 'transfer-readiness';
update public.stack127_tool_pages content set card_name = 'Domain report', card_description = 'Check registration and live DNS together, then surface the places where they disagree.', card_art_key = 'domain-report' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-report';
update public.stack127_tool_pages content set card_name = 'Punycode converter', card_description = 'Convert between a readable internationalized name and the ASCII form used by DNS.', card_art_key = 'punycode-converter' from public.stack127_pages page where page.id = content.page_id and page.slug = 'punycode-converter';
update public.stack127_tool_pages content set card_name = '3-2-1 backup calculator', card_description = 'Size local and off-site targets from your backup plan.', card_art_key = 'backup-321-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'backup-321-calculator';
update public.stack127_tool_pages content set card_name = 'RAID calculator', card_description = 'Compare RAID capacity, mixed-drive waste, group layouts, and failure boundaries.', card_art_key = 'raid-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'raid-calculator';
update public.stack127_tool_pages content set card_name = 'ZFS capacity calculator', card_description = 'Model vdevs, RAIDZ allocation, slop space, special roles, and planning headroom.', card_art_key = 'zfs-capacity-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'zfs-capacity-calculator';
update public.stack127_tool_pages content set card_name = 'ZFS padding calculator', card_description = 'See how one block is divided into data, parity, and padding.', card_art_key = 'zfs-padding-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'zfs-padding-calculator';
update public.stack127_tool_pages content set card_name = 'RAIDZ expansion planner', card_description = 'Compare capacity as a RAIDZ vdev grows by one drive at a time.', card_art_key = 'raidz-expansion-planner' from public.stack127_pages page where page.id = content.page_id and page.slug = 'raidz-expansion-planner';
update public.stack127_tool_pages content set card_name = 'SHR calculator', card_description = 'Estimate fresh-pool SHR-1 or SHR-2 capacity from a mixed set of drive sizes.', card_art_key = 'shr-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'shr-calculator';
update public.stack127_tool_pages content set card_name = 'Unraid calculator', card_description = 'Assign parity and data roles, then check capacity and the size limit for a future drive.', card_art_key = 'unraid-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'unraid-calculator';
update public.stack127_tool_pages content set card_name = 'SnapRAID and mergerfs planner', card_description = 'Build reviewable SnapRAID and mergerfs configuration from your disk and mount paths.', card_art_key = 'snapraid-mergerfs-planner' from public.stack127_pages page where page.id = content.page_id and page.slug = 'snapraid-mergerfs-planner';
update public.stack127_tool_pages content set card_name = 'Drive reliability explorer', card_description = 'Compare observed Backblaze failure rates and exposure for specific drive models.', card_art_key = 'drive-reliability' from public.stack127_pages page where page.id = content.page_id and page.slug = 'drive-reliability';
update public.stack127_tool_pages content set card_name = 'Rebuild exposure calculator', card_description = 'Estimate rebuild time, source reads, and modeled read-error exposure while degraded.', card_art_key = 'rebuild-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'rebuild-calculator';
update public.stack127_tool_pages content set card_name = 'Ceph capacity planner', card_description = 'Model usable capacity, reserve, and the loss of the largest named failure domain.', card_art_key = 'ceph-capacity-calculator' from public.stack127_pages page where page.id = content.page_id and page.slug = 'ceph-capacity-calculator';
update public.stack127_tool_pages content set card_name = 'Storage growth planner', card_description = 'Compare reserve, the first capacity shortfall, and total cost as stored data grows.', card_art_key = 'storage-growth-planner' from public.stack127_pages page where page.id = content.page_id and page.slug = 'storage-growth-planner';
update public.stack127_tool_pages content set card_name = 'Storage layout advisor', card_description = 'Compare layouts against your drives, failure target, and workload preference.', card_art_key = 'storage-layout-advisor' from public.stack127_pages page where page.id = content.page_id and page.slug = 'storage-layout-advisor';

-- The primary catalog supplies a useful icon for new tools.
update public.stack127_tool_pages content set card_icon_key = catalog.icon_key from public.stack127_tool_catalog_memberships member join public.stack127_tool_catalogs catalog on catalog.page_id = member.catalog_page_id where member.tool_page_id = content.page_id and member.catalog_rank = 1;

-- Preserve the distinct icons already used in the three original tool sidebars.
update public.stack127_tool_pages content set card_icon_key = 'search' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dns-lookup';
update public.stack127_tool_pages content set card_icon_key = 'route' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dns-trace';
update public.stack127_tool_pages content set card_icon_key = 'refresh-cw' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dns-change-checker';
update public.stack127_tool_pages content set card_icon_key = 'server' from public.stack127_pages page where page.id = content.page_id and page.slug = 'nameserver-checker';
update public.stack127_tool_pages content set card_icon_key = 'shield-check' from public.stack127_pages page where page.id = content.page_id and page.slug = 'dnssec-checker';
update public.stack127_tool_pages content set card_icon_key = 'file-clock' from public.stack127_pages page where page.id = content.page_id and page.slug = 'soa-checker';
update public.stack127_tool_pages content set card_icon_key = 'file-key' from public.stack127_pages page where page.id = content.page_id and page.slug = 'caa-checker';
update public.stack127_tool_pages content set card_icon_key = 'file-search' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-lookup';
update public.stack127_tool_pages content set card_icon_key = 'calendar-clock' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-age';
update public.stack127_tool_pages content set card_icon_key = 'calendar-x' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-expiry';
update public.stack127_tool_pages content set card_icon_key = 'badge-check' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-availability';
update public.stack127_tool_pages content set card_icon_key = 'layers' from public.stack127_pages page where page.id = content.page_id and page.slug = 'multi-tld-availability';
update public.stack127_tool_pages content set card_icon_key = 'user-search' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-owner';
update public.stack127_tool_pages content set card_icon_key = 'building2' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-registrar';
update public.stack127_tool_pages content set card_icon_key = 'arrow-left-right' from public.stack127_pages page where page.id = content.page_id and page.slug = 'transfer-readiness';
update public.stack127_tool_pages content set card_icon_key = 'clipboard-list' from public.stack127_pages page where page.id = content.page_id and page.slug = 'domain-report';
update public.stack127_tool_pages content set card_icon_key = 'languages' from public.stack127_pages page where page.id = content.page_id and page.slug = 'punycode-converter';
update public.stack127_tool_pages content set card_icon_key = 'shield-check' from public.stack127_pages page where page.id = content.page_id and page.slug = 'backup-321-calculator';
update public.stack127_tool_pages content set card_icon_key = 'hard-drive' from public.stack127_pages page where page.id = content.page_id and page.slug = 'raid-calculator';
update public.stack127_tool_pages content set card_icon_key = 'database' from public.stack127_pages page where page.id = content.page_id and page.slug = 'zfs-capacity-calculator';
update public.stack127_tool_pages content set card_icon_key = 'columns3' from public.stack127_pages page where page.id = content.page_id and page.slug = 'zfs-padding-calculator';
update public.stack127_tool_pages content set card_icon_key = 'chevrons-right' from public.stack127_pages page where page.id = content.page_id and page.slug = 'raidz-expansion-planner';
update public.stack127_tool_pages content set card_icon_key = 'hard-drive' from public.stack127_pages page where page.id = content.page_id and page.slug = 'shr-calculator';
update public.stack127_tool_pages content set card_icon_key = 'server' from public.stack127_pages page where page.id = content.page_id and page.slug = 'unraid-calculator';
update public.stack127_tool_pages content set card_icon_key = 'git-branch' from public.stack127_pages page where page.id = content.page_id and page.slug = 'snapraid-mergerfs-planner';
update public.stack127_tool_pages content set card_icon_key = 'activity' from public.stack127_pages page where page.id = content.page_id and page.slug = 'drive-reliability';
update public.stack127_tool_pages content set card_icon_key = 'refresh-cw' from public.stack127_pages page where page.id = content.page_id and page.slug = 'rebuild-calculator';
update public.stack127_tool_pages content set card_icon_key = 'server-cog' from public.stack127_pages page where page.id = content.page_id and page.slug = 'ceph-capacity-calculator';
update public.stack127_tool_pages content set card_icon_key = 'trending-up' from public.stack127_pages page where page.id = content.page_id and page.slug = 'storage-growth-planner';
update public.stack127_tool_pages content set card_icon_key = 'layout-grid' from public.stack127_pages page where page.id = content.page_id and page.slug = 'storage-layout-advisor';

update public.stack127_tool_pages content
set card_art_key = catalog.hero_art_key
from public.stack127_tool_catalog_memberships member
join public.stack127_tool_catalogs catalog on catalog.page_id = member.catalog_page_id
where member.tool_page_id = content.page_id
  and member.catalog_rank = 1
  and content.card_art_key = 'catalog-default';

with specific_art(slug, art_key) as (
  values
    ('dockerignore-tester', 'dockerignore-tester'),
    ('home-assistant-energy-entity-checker', 'home-assistant-energy-entity-checker'),
    ('nfs-firewall-rules', 'nfs-firewall-rules'),
    ('nginx-proxy-pass-calculator', 'nginx-proxy-pass-calculator')
)
update public.stack127_tool_pages content
set card_art_key = art.art_key
from specific_art art
join public.stack127_pages page on page.slug = art.slug
where page.id = content.page_id;

-- Use a tool-specific icon where no reviewed marker drawing exists.
update public.stack127_tool_pages
set card_art_key = 'icon'
where card_art_key in (
  'none', 'kdp-tools', 'hosting-cloud-tools', 'developer-tools',
  'home-automation-tools', 'productivity-tools'
);

with new_tool_icons(slug, icon_key) as (
  values
    ('kdp-book-setup-calculator', 'book'),
    ('kdp-metadata-checker', 'file-search'),
    ('kdp-royalty-calculator', 'trending-up'),
    ('kdp-pdf-preflight-checker', 'file-search'),
    ('kdp-image-dpi-checker', 'image'),
    ('kdp-page-count-estimator', 'book'),
    ('kdp-payment-date-calculator', 'calendar-clock'),
    ('ip-asn-lookup', 'globe'),
    ('nfs-firewall-rules', 'server'),
    ('nginx-proxy-pass-calculator', 'route'),
    ('self-hosted-app-resource-planner', 'server-cog'),
    ('chmod-calculator', 'shield-check'),
    ('dockerignore-tester', 'file-search'),
    ('docker-compose-checker', 'layers'),
    ('lxc-idmap-checker', 'user-search'),
    ('rsync-filter-tester', 'refresh-cw'),
    ('home-assistant-energy-entity-checker', 'activity'),
    ('mqtt-discovery-checker', 'network'),
    ('shortcuts-cheatsheet-generator', 'keyboard')
)
update public.stack127_tool_pages content
set card_icon_key = icons.icon_key
from new_tool_icons icons
join public.stack127_pages page on page.slug = icons.slug
where page.id = content.page_id;

-- The original figure filenames use short subjects instead of full tool slugs.
with legacy_art(slug, art_key) as (
  values
    ('backup-321-calculator', 'backup-321'),
    ('caa-checker', 'caa'),
    ('ceph-capacity-calculator', 'ceph'),
    ('dns-change-checker', 'dns-change'),
    ('dnssec-checker', 'dnssec'),
    ('multi-tld-availability', 'multi-tld'),
    ('nameserver-checker', 'nameserver'),
    ('punycode-converter', 'punycode'),
    ('raid-calculator', 'raid'),
    ('raidz-expansion-planner', 'raidz-expansion'),
    ('rebuild-calculator', 'rebuild'),
    ('shr-calculator', 'shr'),
    ('snapraid-mergerfs-planner', 'snapraid-mergerfs'),
    ('soa-checker', 'soa'),
    ('storage-growth-planner', 'storage-growth'),
    ('storage-layout-advisor', 'storage-layout'),
    ('unraid-calculator', 'unraid'),
    ('zfs-capacity-calculator', 'zfs-capacity'),
    ('zfs-padding-calculator', 'zfs-padding')
)
update public.stack127_tool_pages content
set card_art_key = art.art_key
from legacy_art art
join public.stack127_pages page on page.slug = art.slug
where page.id = content.page_id;

update public.stack127_tool_pages content
set card_name = 'Self-hosted app resource planner'
from public.stack127_pages page
where page.id = content.page_id
  and page.slug = 'self-hosted-app-resource-planner';
