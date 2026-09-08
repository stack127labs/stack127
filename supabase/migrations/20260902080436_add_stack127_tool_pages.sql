-- Split universal page publication from tool-specific Markdown and release data.
-- Existing public dates remain unchanged. The 1.0.0 values establish the first
-- tracked stack127-hosted tool baseline; they do not claim historical releases.

drop view if exists public.version127_pages;

alter table public.stack127_pages
  rename column created_at to row_created_at;

alter table public.stack127_pages
  add column id bigint generated always as identity,
  add column page_family text,
  add column row_updated_at timestamptz;

drop trigger if exists set_stack127_pages_updated_at on public.stack127_pages;

update public.stack127_pages
set
  page_family = case
    when slug = any(array[
      'caa-checker',
      'ceph-capacity-calculator',
      'dns-change-checker',
      'dns-lookup',
      'dns-trace',
      'dnssec-checker',
      'dockerignore-tester',
      'domain-age',
      'domain-availability',
      'domain-expiry',
      'domain-lookup',
      'domain-owner',
      'domain-registrar',
      'domain-report',
      'drive-reliability',
      'home-assistant-energy-entity-checker',
      'multi-tld-availability',
      'nameserver-checker',
      'nfs-firewall-rules',
      'nginx-proxy-pass-calculator',
      'punycode-converter',
      'raid-calculator',
      'raidz-expansion-planner',
      'rebuild-calculator',
      'shortcuts-cheatsheet-generator',
      'shr-calculator',
      'snapraid-mergerfs-planner',
      'soa-checker',
      'storage-growth-planner',
      'storage-layout-advisor',
      'transfer-readiness',
      'unraid-calculator',
      'zfs-capacity-calculator',
      'zfs-padding-calculator'
    ]::text[]) then 'tool'
    when slug = 'self-hosting-for-beginners'
      or slug like 'self-hosting-for-beginners/%' then 'course'
    when slug in ('about', 'privacy', 'terms') then 'legal'
    when slug in ('', 'labs') then 'info'
    else 'catalog'
  end,
  row_updated_at = updated_at;

update public.stack127_pages
set
  published_at = null,
  updated_at = null
where not is_published;

update public.stack127_pages
set
  published_at = coalesce(published_at, row_created_at),
  updated_at = greatest(
    coalesce(updated_at, published_at, row_created_at),
    coalesce(published_at, row_created_at)
  )
where is_published;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.row_updated_at = now();
  return new;
end;
$$;

alter table public.stack127_pages
  alter column page_family set not null,
  alter column row_updated_at set default now(),
  alter column row_updated_at set not null,
  alter column updated_at drop default,
  alter column updated_at drop not null;

alter table public.stack127_pages
  drop constraint stack127_pages_pkey;

alter table public.stack127_pages
  add constraint stack127_pages_pkey primary key (id),
  add constraint stack127_pages_slug_key unique (slug),
  add constraint stack127_pages_page_family_check check (
    page_family in ('tool', 'catalog', 'course', 'info', 'legal')
  ),
  add constraint stack127_pages_public_dates_check check (
    (
      is_published
      and published_at is not null
      and updated_at is not null
      and updated_at >= published_at
    )
    or (
      not is_published
      and published_at is null
      and updated_at is null
    )
  );

create trigger set_stack127_pages_row_updated_at
before update on public.stack127_pages
for each row execute function public.set_row_updated_at();

with tool_registry_rows(slug, label, meta_title, meta_description, page_family) as (
  values
    (
      'caa-checker',
      'caa checker',
      'CAA Policy Checker: who can issue your certificates? | stack127',
      'A CAA record is how a domain says which certificate authorities are allowed to hand out certificates for it.',
      'tool'
    ),
    (
      'ceph-capacity-calculator',
      'ceph capacity calculator',
      'Ceph capacity and failure-domain planner | stack127',
      'Plan a Ceph inventory by protection profile and named failure domain.',
      'tool'
    ),
    (
      'dns-change-checker',
      'dns change checker',
      'DNS Change Checker: has your change propagated? | stack127',
      'You changed a DNS record and now you want to know if the internet has caught up.',
      'tool'
    ),
    (
      'dns-lookup',
      'dns lookup',
      'DNS lookup for any domain''s records | stack127',
      'Enter a domain or hostname to see its DNS records, or choose PTR to find the hostname connected to an IP address.',
      'tool'
    ),
    (
      'dns-trace',
      'dns trace',
      'DNS Trace Explorer: follow a query from root to answer | stack127',
      'This tool follows one DNS question the long way, starting at the root nameservers at the top of DNS and walking down until it reaches the server that holds the final answer.',
      'tool'
    ),
    (
      'dnssec-checker',
      'dnssec checker',
      'DNSSEC Chain Checker: validate DS, DNSKEY, and RRSIG | stack127',
      'DNSSEC lets a domain sign its DNS answers so nobody can quietly change them on the way to you.',
      'tool'
    ),
    (
      'dockerignore-tester',
      'dockerignore tester',
      '.dockerignore Pattern Tester: see which rule decides each path | stack127',
      'Paste the .dockerignore file Docker will use and a list of context-relative paths.',
      'tool'
    ),
    (
      'domain-age',
      'domain age',
      'Domain age checker: how old is a domain? | stack127',
      'Enter a domain name to see when its current registration was created and how old it is.',
      'tool'
    ),
    (
      'domain-availability',
      'domain availability',
      'Domain availability checker: is that name taken? | stack127',
      'Check whether a domain name is already registered by asking the registry that runs the ending directly.',
      'tool'
    ),
    (
      'domain-expiry',
      'domain expiry',
      'Domain expiry checker: when does a domain expire? | stack127',
      'Check when a domain expires and, more usefully, what happens after that date passes.',
      'tool'
    ),
    (
      'domain-lookup',
      'domain lookup',
      'Domain registration lookup: the full WHOIS and RDAP record | stack127',
      'Enter any domain and see its full registration record: the registrar it sits with, when it was created, when it expires, the status codes controlling what can be done to it, its nameservers, and which contact details have been withheld.',
      'tool'
    ),
    (
      'domain-owner',
      'domain owner',
      'Domain registrant lookup: who owns this domain? | stack127',
      'Look up who a domain is registered to.',
      'tool'
    ),
    (
      'domain-registrar',
      'domain registrar',
      'Registrar lookup: find a domain''s registrar and abuse contact | stack127',
      'Look up which company a domain is registered through, along with its abuse contact and IANA ID.',
      'tool'
    ),
    (
      'domain-report',
      'domain report',
      'Domain health check: registration and DNS together | stack127',
      'Check a domain''s registration record and its live DNS in one go, and find the places where the two disagree.',
      'tool'
    ),
    (
      'drive-reliability',
      'drive reliability',
      'Drive reliability explorer | stack127',
      'Use published Backblaze drive data to inspect an exact model or compare up to three cohorts.',
      'tool'
    ),
    (
      'home-assistant-energy-entity-checker',
      'home assistant energy entity checker',
      'Home Assistant Energy Entity Eligibility Checker: find the failed picker rule | stack127',
      'Choose the intended Home Assistant Energy field, then enter or paste the sensor''s current attributes.',
      'tool'
    ),
    (
      'multi-tld-availability',
      'multi tld availability',
      'Multi-TLD availability: one name across many endings | stack127',
      'Enter one name and check it against several endings at once.',
      'tool'
    ),
    (
      'nameserver-checker',
      'nameserver checker',
      'Nameserver Delegation Checker: test NS and glue records | stack127',
      'NS records name the servers that are supposed to answer for your domain.',
      'tool'
    ),
    (
      'nfs-firewall-rules',
      'nfs firewall rules',
      'NFS Firewall Rules Planner | stack127',
      'Build a reviewable inbound-listener plan for one Linux NFS server or client.',
      'tool'
    ),
    (
      'nginx-proxy-pass-calculator',
      'nginx proxy pass calculator',
      'NGINX proxy_pass URI Calculator: see the upstream URL | stack127',
      'Enter the matched static location, incoming request target, and proxypass URL.',
      'tool'
    ),
    (
      'punycode-converter',
      'punycode converter',
      'Punycode converter: IDN to ASCII and back | stack127',
      'Convert a domain name between the readable form and the xn-- form DNS actually carries, in either direction.',
      'tool'
    ),
    (
      'raid-calculator',
      'raid calculator',
      'RAID capacity calculator for mixed drives and nested groups | stack127',
      'See theoretical usable capacity, what redundancy costs you, and how much space unequal drives strand.',
      'tool'
    ),
    (
      'raidz-expansion-planner',
      'raidz expansion planner',
      'RAIDZ expansion planner | stack127',
      'Plan how one existing, never-expanded RAIDZ vdev changes as you add disks one at a time.',
      'tool'
    ),
    (
      'rebuild-calculator',
      'rebuild calculator',
      'Rebuild window and read-error exposure calculator | stack127',
      'Estimate how long one simplified rebuild keeps an array degraded, how much source media it reads, and the modeled chance of a specified read error.',
      'tool'
    ),
    (
      'shortcuts-cheatsheet-generator',
      'shortcuts cheatsheet generator',
      'Keyboard shortcuts cheat sheet generator for your daily tools | stack127',
      'Build one printable page from the shortcuts you actually use.',
      'tool'
    ),
    (
      'shr-calculator',
      'shr calculator',
      'Synology SHR capacity calculator for mixed drives | stack127',
      'Enter individual drive capacities, choose SHR-1 or SHR-2, and get an estimated fresh-pool capacity with protection and unused tiers kept separate.',
      'tool'
    ),
    (
      'snapraid-mergerfs-planner',
      'snapraid mergerfs planner',
      'SnapRAID and mergerfs config planner | stack127',
      'Enter data, parity, content, and pool paths to generate a reviewable snapraid.conf and matching mergerfs /etc/fstab line.',
      'tool'
    ),
    (
      'soa-checker',
      'soa checker',
      'SOA Consistency Checker: compare zone serials across nameservers | stack127',
      'A zone can be answered by several nameservers, and they are all supposed to hold the same copy of your DNS.',
      'tool'
    ),
    (
      'storage-growth-planner',
      'storage growth planner',
      'Storage Growth and TCO Planner | stack127',
      'Plan a local storage purchase against your data growth and cost assumptions.',
      'tool'
    ),
    (
      'storage-layout-advisor',
      'storage layout advisor',
      'Storage layout advisor | stack127',
      'Compare layouts from the drives you have, a minimum protected-failure target, and a workload preference.',
      'tool'
    ),
    (
      'transfer-readiness',
      'transfer readiness',
      'Domain transfer readiness: can this domain be transferred? | stack127',
      'Check whether a domain can move to another registrar right now, and if not, what is stopping it.',
      'tool'
    ),
    (
      'unraid-calculator',
      'unraid calculator',
      'Unraid Main Array calculator | stack127',
      'Plan a Main Array for a homelab from explicit parity and data roles you already know, then see array-level data capacity and one future drive''s parity boundary.',
      'tool'
    ),
    (
      'zfs-capacity-calculator',
      'zfs capacity calculator',
      'ZFS pool capacity calculator for mixed vdevs | stack127',
      'Plan a fresh OpenZFS pool one top-level vdev at a time.',
      'tool'
    ),
    (
      'zfs-padding-calculator',
      'zfs padding calculator',
      'ZFS block size and padding calculator | stack127',
      'See how one uncompressed ZFS block is split into data, parity, sector rounding, and padding on a RAIDZ vdev.',
      'tool'
    )
)
insert into public.stack127_pages (
  slug,
  label,
  meta_title,
  meta_description,
  page_family,
  is_published,
  published_at,
  updated_at,
  page_type,
  sitemap_priority
)
select
  row.slug,
  row.label,
  row.meta_title,
  row.meta_description,
  row.page_family,
  false,
  null,
  null,
  'WebApplication',
  0.50
from tool_registry_rows row
on conflict (slug) do update set
  page_family = excluded.page_family;

create table public.stack127_tool_pages (
  page_id bigint primary key references public.stack127_pages(id) on delete cascade,
  title text not null,
  intro_markdown text not null,
  content_markdown text not null,
  content_revision integer not null default 1,
  tool_version text not null,
  tool_version_updated_at timestamptz not null,
  stack127_repo_url text,
  stack127_repo_version text,
  stack127_repo_commit_sha text,
  stack127_repo_synced_at timestamptz,
  row_updated_at timestamptz not null default now(),
  constraint stack127_tool_pages_title_check check (
    title = btrim(title) and length(title) > 0
  ),
  constraint stack127_tool_pages_intro_check check (
    intro_markdown = btrim(intro_markdown) and length(intro_markdown) > 0
  ),
  constraint stack127_tool_pages_content_check check (
    content_markdown = btrim(content_markdown) and length(content_markdown) > 0
  ),
  constraint stack127_tool_pages_content_revision_check check (content_revision > 0),
  constraint stack127_tool_pages_tool_version_check check (
    tool_version ~ '^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$'
  ),
  constraint stack127_tool_pages_repo_url_check check (
    stack127_repo_url is null
    or stack127_repo_url ~ '^https://github\.com/stack127labs/[A-Za-z0-9._-]+/?$'
  ),
  constraint stack127_tool_pages_repo_version_check check (
    stack127_repo_version is null or stack127_repo_url is not null
  ),
  constraint stack127_tool_pages_repo_commit_check check (
    stack127_repo_commit_sha is null
    or (
      stack127_repo_url is not null
      and stack127_repo_commit_sha ~ '^[0-9a-f]{40}([0-9a-f]{24})?$'
    )
  ),
  constraint stack127_tool_pages_repo_sync_check check (
    stack127_repo_synced_at is null or stack127_repo_url is not null
  )
);

create or replace function public.validate_stack127_tool_page_family()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  perform 1
  from public.stack127_pages
  where id = new.page_id
    and page_family = 'tool';

  if not found then
    raise exception 'stack127_tool_pages.page_id must refer to a tool page';
  end if;

  return new;
end;
$$;

create trigger validate_stack127_tool_page_family
before insert or update of page_id on public.stack127_tool_pages
for each row execute function public.validate_stack127_tool_page_family();

create or replace function public.protect_stack127_tool_page_family()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if old.page_family = 'tool'
    and new.page_family <> 'tool'
    and exists (
      select 1
      from public.stack127_tool_pages
      where page_id = old.id
    ) then
    raise exception 'remove the stack127_tool_pages row before changing its page family';
  end if;

  return new;
end;
$$;

create trigger protect_stack127_tool_page_family
before update of page_family on public.stack127_pages
for each row execute function public.protect_stack127_tool_page_family();

create or replace function public.prepare_stack127_tool_page_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if (new.title, new.intro_markdown, new.content_markdown)
    is distinct from
    (old.title, old.intro_markdown, old.content_markdown) then
    new.content_revision = old.content_revision + 1;
  elsif new.content_revision <> old.content_revision then
    raise exception 'content_revision changes only with title or Markdown content';
  end if;

  if new.tool_version is distinct from old.tool_version then
    new.tool_version_updated_at = now();
  elsif new.tool_version_updated_at <> old.tool_version_updated_at then
    raise exception 'tool_version_updated_at changes only with tool_version';
  end if;

  return new;
end;
$$;

create trigger prepare_stack127_tool_page_update
before update on public.stack127_tool_pages
for each row execute function public.prepare_stack127_tool_page_update();

create or replace function public.touch_stack127_tool_page_public_date()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if (new.title, new.intro_markdown, new.content_markdown, new.tool_version)
    is distinct from
    (old.title, old.intro_markdown, old.content_markdown, old.tool_version) then
    update public.stack127_pages
    set updated_at = case when is_published then now() else null end
    where id = new.page_id;
  end if;

  return new;
end;
$$;

create trigger touch_stack127_tool_page_public_date
after update on public.stack127_tool_pages
for each row execute function public.touch_stack127_tool_page_public_date();

create index stack127_tool_pages_repo_url_idx
  on public.stack127_tool_pages (stack127_repo_url)
  where stack127_repo_url is not null;

create trigger set_stack127_tool_pages_row_updated_at
before update on public.stack127_tool_pages
for each row execute function public.set_row_updated_at();

alter table public.stack127_tool_pages enable row level security;

create policy "Published stack127 tool pages are readable"
on public.stack127_tool_pages
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.stack127_pages page
    where page.id = stack127_tool_pages.page_id
      and page.page_family = 'tool'
      and page.is_published
  )
);

revoke all on table public.stack127_tool_pages from anon, authenticated;
grant select on table public.stack127_tool_pages to anon, authenticated;

with tool_content(slug, title, intro_markdown, content_markdown, tool_version, stack127_repo_url) as (
  values
    -- tool-slug: caa-checker
    (
      'caa-checker',
      'CAA Policy Checker: who can issue your certificates?',
      $stack127_caa_checker_intro$A CAA record is how a domain says which certificate authorities are allowed to hand out certificates for it. CAA stands for Certification Authority Authorization. This tool finds the policy that actually applies to one exact name, follows how that name inherits its policy from parent domains, and then shows which authorities it lets issue normal and wildcard certificates. You get the records it found, the path it followed to find them, and the policy those records add up to.$stack127_caa_checker_intro$,
      $stack127_caa_checker_content$## How to check a CAA policy

Enter the exact hostname the certificate will cover. `www.example.com` can give a different answer from `example.com`, so use the real name from the certificate request. We ask a recursive resolver for the CAA record, follow an alias if one is in the way, and then keep walking up the original name until we hit the first policy.

## Where the effective policy comes from

A name does not have to carry its own CAA record. If it has one, that wins. If it does not, the check moves to its parent, then the parent above that, and stops at the first policy it finds. So the policy that governs a certificate is often written a level or two up, not on the exact name.

> `www.example.com` → `example.com` → `com` → `Policy in effect`
>
> The check climbs from the exact name toward the root and uses the first CAA policy it finds.

One thing an alias does not do: a CNAME can send the lookup to an alias target, but the alias target's parent domains do not join the original name's inheritance path. The result lists every place we looked, so you can see which record set actually won instead of guessing.

## Normal and wildcard certificates

`issue` covers normal certificates, the ones for a specific hostname. `issuewild` covers wildcard certificates, the ones that match a whole level like `*.example.com`. If a name has no `issuewild` record, wildcard requests fall back to the `issue` policy. If a policy has only `issuewild` and no `issue`, then CAA is not restricting normal certificates at all.

## How to read CAA records

| Field | Meaning |
| --- | --- |
| `issue` | Lets the named authority issue normal certificates for the name. |
| `issuewild` | Lets the named authority issue wildcard certificates for the name. |
| `iodef` | A mail or web address where an authority can report a policy problem it runs into. |
| Empty issuer | A value like `CAA 0 issue ";"` allows no one, which blocks that kind of issuance. |
| Critical flag | If a property is marked critical and an authority does not understand it, that authority must refuse to issue. |

Several `issue` or `issuewild` records stack rather than compete. Every authority listed under that tag is allowed.

## What this result does not promise

CAA is one permission gate in the process, not a list of certificates that already exist. This page does not read certificate history, contact an `iodef` address, or promise that an allowed authority will actually issue. That authority still has to confirm you control the domain and apply its own rules on top of the CAA answer.$stack127_caa_checker_content$,
      '1.0.0',
      'https://github.com/stack127labs/dns-tools'
    ),
    -- tool-slug: ceph-capacity-calculator
    (
      'ceph-capacity-calculator',
      'Ceph capacity and failure-domain planner',
      $stack127_ceph_capacity_calculator_intro$Plan a Ceph inventory by protection profile and named failure domain. The planner returns raw capacity, modeled usable capacity, reserve, and the effect of losing the largest modeled domain. It is a local planning model, not a live CRUSH or pool inspection.$stack127_ceph_capacity_calculator_intro$,
      $stack127_ceph_capacity_calculator_content$## Replicated and EC use different capacity ratios

Replication models one data copy divided by the replica size. Erasure coding models the data chunk count divided by the total chunk count. The planner also checks the distinct failure domains needed by the selected profile.

| Mode | Capacity ratio | Domain check |
| --- | --- | --- |
| Replicated | `1 / replica size` | Replica size distinct domains |
| Erasure coding | `k / (k + m)` | `k + m` distinct domains |

## What this model leaves out

This calculation does not inspect live CRUSH buckets, pool rules, PG counts, `min_size`, object overhead, BlueStore overhead, recovery, IOPS, or actual `ceph df` output. It also does not prove durability after a domain failure. The loss scenario is a planning model that removes the largest entered domain and keeps the selected ratio.

Reserve is a planning policy, not a Ceph nearfull threshold. Read the [Ceph pool configuration reference](https://docs.ceph.com/en/latest/rados/configuration/pool-pg-config-ref/) when live pool settings affect the question.

## Verify the plan against a real cluster

Compare the entered batches with the real OSD and CRUSH hierarchy before acting on the estimate. Check the pool rule and profile as well as the capacity view.

- `ceph osd tree` and `ceph osd crush tree` show the actual hierarchy.
- `ceph osd pool get <pool> size` and `min_size` show pool policy.
- `ceph osd erasure-code-profile get <profile>` shows live EC settings.
- `ceph df` shows the cluster view after deployment.

See the [Ceph CRUSH map documentation](https://docs.ceph.com/en/latest/rados/operations/crush-map/) and [EC profile documentation](https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/). For adjacent storage planning, return to [storage tools](/storage-tools) or compare a [ZFS capacity calculator](/zfs-capacity-calculator).

## Sharing keeps the calculation explicit

Calculation stays in your browser, and the tool makes no calculation request. Share is explicit: it puts normalized inputs in a versioned URL. Anyone with that URL can read the entered inventory labels and capacities.$stack127_ceph_capacity_calculator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: dns-change-checker
    (
      'dns-change-checker',
      'DNS Change Checker: has your change propagated?',
      $stack127_dns_change_checker_intro$You changed a DNS record and now you want to know if the internet has caught up. This tool asks the source of truth, your domain's own nameservers, whether the change is live, then checks the big public resolvers to see which ones are still handing out the old cached answer. You get the authoritative records, the cached answers, the TTLs, and the raw responses side by side.$stack127_dns_change_checker_intro$,
      $stack127_dns_change_checker_content$## How to check a DNS change

Enter the exact domain or hostname you changed, choose the record type, and run the check. If you know the new value, add it as the expected answer so the tool can tell you at a glance which servers match it. We ask your domain's authoritative nameservers first, then compare their answer with Cloudflare, Google, Quad9, and the other public resolvers available in the lookup tool.

People often call this a DNS propagation check. DNS does not push one change across the world all at once. Your nameservers publish the new answer, then each resolver replaces its cached copy when that copy is ready to refresh. This page shows those two parts separately so you can tell whether the source is correct or a cache is simply old.

## Authoritative source versus a resolver cache

Authoritative nameservers are the source of truth for your domain: they are the servers your DNS provider runs, and they hold the real records. A public resolver, like the one at 1.1.1.1 or 8.8.8.8, does not hold your records. It asks the authoritative servers once, keeps a copy of the answer for a while, and hands that copy to everyone who asks in the meantime. That saved copy is the cache. It is why a change can be live at the source and still look old to you: you are seeing a resolver's copy, not the source.

> `Your nameservers` → `Resolver cache` → `You`
>
> The source publishes the change first. Each resolver keeps its own cached copy, so it can lag behind for a while before it asks again.

If all of your authoritative servers return the new record, your DNS provider is publishing the change consistently and the rest is just caches expiring. If those authoritative servers disagree with each other, fix that first. Waiting on caches will not make an inconsistent source correct.

## What TTL means and how to read Resolver TTL

TTL, short for time to live, is roughly how long a resolver is allowed to keep reusing an answer before it has to check with the source again. A record set to 300 means five minutes; one set to 86400 means a day. When you shorten a TTL before a change, resolvers refresh sooner, so the change spreads faster. But the shorter TTL only takes effect after the old cached copy, with its old TTL, has expired.

Resolver TTL in the results is the time that resolver says is left on its current cached copy. A smaller number usually means it is close to refreshing, but treat it as a hint, not a guaranteed countdown. A resolver can refresh early, keep serving a stale answer if the source is unreachable, or answer from a different location than the one you reached a moment ago.

## When different answers are normal

Not every difference means a change is stuck. Large services return different A or AAAA records depending on where the request comes from, so two resolvers can each be correct while showing different addresses. Some providers rotate addresses between replies on purpose. The order of MX, NS, and TXT records can also shift from one answer to the next without the actual set of records changing. This checker ignores order when it compares, but it only measures the resolvers it asks. It does not claim to see DNS everywhere in the world.$stack127_dns_change_checker_content$,
      '1.0.0',
      'https://github.com/stack127labs/dns-tools'
    ),
    -- tool-slug: dns-lookup
    (
      'dns-lookup',
      'DNS lookup for any domain''s records',
      $stack127_dns_lookup_intro$Enter a domain or hostname to see its DNS records, or choose PTR to find the hostname connected to an IP address. You can check a public resolver's cached answer or ask the domain's authoritative nameserver directly. Leave All selected if you are not sure which record you need.$stack127_dns_lookup_intro$,
      $stack127_dns_lookup_content$## How to check DNS records

Enter the exact domain or hostname you want to check. `example.com`, `www.example.com`, and `mail.example.com` can each have different records, so use the name connected to the website, email service, or setup you are checking. Leave All selected to check every forward record type offered here, choose a DNS source, then select Look up DNS. To start with an IP address instead, choose PTR and enter the address.

When the answer appears, compare it with the records in your DNS provider. Public resolvers may keep an older answer in cache for a while. The authoritative option skips that cache and asks a nameserver that hosts the domain.

## What DNS lookup results mean

Read the returned value first. If the result shows an alias path, the name you entered points to another hostname and the final record belongs there. The owner name stays visible so you can see exactly where the answer came from.

> `www.example.com` → `edge.example.net` → `192.0.2.42`
>
> Here, `www.example.com` is an alias. The A record belongs to `edge.example.net`, so that owner name stays attached to the address in the result.

Resolver TTL is how much cache time a public resolver reported at the moment you looked. TTL, or time to live, is roughly how long a resolver is allowed to reuse an answer before checking again. So 300 seconds means about five minutes were left when the lookup ran. This number is often lower than the TTL the domain owner set, because part of that time has already ticked away. When you ask a nameserver directly, you see Authoritative TTL instead.

## Which DNS record type should you check?

Not sure where to start? Leave All selected. It checks the domain record types offered by this tool, including website, email, service, verification, nameserver, and DNSSEC records. PTR is separate because it starts with an IP address. If you already know what you are looking for, this table will help you choose one type.

| Type | What it shows |
| --- | --- |
| A | The IPv4 address for a domain or hostname. Check this when a website is opening the wrong server. |
| AAAA | The IPv6 address for a domain or hostname. It is worth checking when a website works on some networks but not others. |
| CNAME | The other hostname that an alias points to. You will often see this on `www` addresses, hosted services, and CDN setups. |
| MX | The servers that should receive email for the domain. A smaller preference number is tried first. |
| NS | The nameservers responsible for the domain. Check these after moving DNS to a new provider. |
| TXT | Text added for domain verification and email policies. You can read the value here, but this lookup does not tell you whether SPF, DKIM, or DMARC is configured correctly. |
| CAA | The certificate authorities allowed to issue certificates for the domain. |
| SOA | Basic information about the DNS zone, including its primary nameserver, serial number, and timing values. This is mostly useful when troubleshooting DNS provider changes. |
| SRV | The hostname and port used by a particular service, along with the order in which servers should be tried. |
| DS | A record in the parent zone that points to the DNSSEC key it trusts for this domain. |
| DNSKEY | The public keys the domain publishes for DNSSEC. Seeing a key here does not prove that the full DNSSEC setup is correct. |
| PTR | The hostname connected to an IPv4 or IPv6 address. This is often called reverse DNS and is useful when checking mail servers, logs, or an unfamiliar address. |

## When a DNS lookup helps

This tool is handy when something should be working or should have changed, and you want to see what public DNS is actually returning. If you know what value your provider gave you, compare it with the answer here.

| What is happening | Check | What to look for |
| --- | --- | --- |
| A website opens the wrong server | A, AAAA, and CNAME | Does the address or alias match the value from your host or CDN? |
| Email is not reaching the right place | MX | Do the mail servers and preference numbers match your email provider's setup? |
| A service is still waiting to verify your domain | TXT | Is the complete text value present on the exact name the service asked you to use? |
| A certificate cannot be issued | CAA | Do the CAA records allow the certificate authority you are using? |
| You moved to new nameservers | NS and SOA | Do the NS records show the new provider, and does the SOA information belong to the new zone? |
| You are checking DNSSEC | DS and DNSKEY | Are both records present? This is a useful first look, but a full DNSSEC chain check is still needed to find configuration problems. |
| You need the hostname behind an IP address | PTR | Does the returned hostname match the server or service you expected to find? |

## When the answer looks wrong

No record does not always mean the whole domain is broken. The name may exist without having the particular record type you asked for. The response below tells you what happened with this exact lookup.

| Response | What it means |
| --- | --- |
| NOERROR with records | The lookup worked and the resolver found the record type you asked for. |
| NOERROR without records | The name exists, but it does not have this record type. For example, a hostname can have an A record without having an MX record. |
| NXDOMAIN | The exact name does not exist according to this resolver. Check the spelling and make sure you used the right root domain or subdomain. |
| SERVFAIL | The resolver could not get a usable answer. The cause may be temporary, or it may involve the nameserver setup or DNSSEC. This response alone cannot tell you which one. |
| REFUSED | The resolver decided not to answer this query, usually because of its own rules. It does not prove that the domain itself is broken. |

Public resolvers can show different answers for a while after a DNS change because each one may have cached the old value at a different time. Check the returned values and Resolver TTL. You can also choose Authoritative nameserver to see what the domain's DNS host answers without waiting for a public resolver cache.

Remember that this tool only shows the DNS answer. It does not open the website, send a test email, validate SPF, DKIM, or DMARC, or check every resolver around the world.

> The name you enter is sent to the DNS source you select. Authoritative lookups use Cloudflare only to find the domain's nameserver address, then query that nameserver directly. Returned IP addresses are checked through Team Cymru's DNS service so the result can show the network and ASN, and nameserver hostnames are resolved through Cloudflare. We do not save your lookup history or include queried names and returned values in analytics.$stack127_dns_lookup_content$,
      '1.0.0',
      'https://github.com/stack127labs/dns-tools'
    ),
    -- tool-slug: dns-trace
    (
      'dns-trace',
      'DNS Trace Explorer: follow a query from root to answer',
      $stack127_dns_trace_intro$This tool follows one DNS question the long way, starting at the root nameservers at the top of DNS and walking down until it reaches the server that holds the final answer. At each hop it shows you which server it asked, what that server said, and where it pointed next. If the trip stops early, you can see the exact step where it broke.$stack127_dns_trace_intro$,
      $stack127_dns_trace_content$## How a DNS trace works

DNS is built as a chain of handoffs. The root nameservers know who runs `.com`. The `.com` nameservers know who runs `example.com`. And that domain's own nameserver holds the final record. Normally a public resolver does this whole walk for you and just hands back the result. This tool does the walk itself, in the open, so you can watch every handoff instead of trusting a single cached answer.

> `Root` → `.com` → `example.com` → `Answer`
>
> At each stop, a server either hands back the answer or points the trace one step closer to it.

## What each step tells you

Most steps end in a referral. That is just one nameserver saying, “I do not have the answer, but here are the servers that are closer to it.” It names the next set of nameservers and sends you their way.

Sometimes those next nameservers live inside the very domain you are looking up, like `ns1.example.com` serving `example.com`. That creates a loop: to find the nameserver you would need to look up the domain, but to look up the domain you need the nameserver. Glue is how DNS breaks the loop. The parent zone tacks the nameserver's IP address straight onto the referral, so the trace can move on without getting stuck. When you see glue in a step, that is the shortcut address that came bundled with the referral.

For each step, the trace keeps everything together: the server it asked, how long the reply took, the response code, the nameservers it was pointed to, any glue, the TTL, and the raw reply. That way you can trace where every detail came from.

## Where a DNS trace can stop

A healthy trace ends one of two ways: with the record you asked for, or with a clear answer that the name simply does not exist. When something is broken instead, the last step that finished is your best clue about which part of the chain to look at.

| Where it stops | What that usually means |
| --- | --- |
| At the root | The top-level domain, like the part after the last dot, may not exist, or the trace never reached a root server in the first place. |
| At the TLD | The `.com` or other TLD zone did not hand off the domain to any nameservers, so there was nowhere to go next. |
| Before the domain's server | The handoff named some nameservers, but the trace could not find a usable public address to reach them. |
| At the domain's server | The nameserver was reached but did not answer cleanly: it timed out, refused the question, returned an error, or replied without the record type you asked for. |
| After an alias | The name is a CNAME pointing somewhere else, and that target is missing, unreachable, or points back in a loop. |

## DNS trace and DNS lookup are different

DNS Lookup tells you the answer a resolver like Cloudflare, Google, or an authoritative server is handing out right now. DNS Trace Explorer skips those cached answers and walks the chain of handoffs from the root instead. Reach for the lookup when you want the answer real people are getting. Reach for the trace when you want to understand how DNS gets to that answer, or why it cannot.

> The trace runs from the stack127 server, so it shows what that one machine sees. It cannot tell you what your ISP has cached, and it does not test whether a change has spread worldwide. It can display DNSSEC records, but the [DNSSEC Chain Checker](/dnssec-checker) is the tool that verifies their signatures and chain of trust. We do not save the names you trace or count them in analytics.$stack127_dns_trace_content$,
      '1.0.0',
      'https://github.com/stack127labs/dns-tools'
    ),
    -- tool-slug: dnssec-checker
    (
      'dnssec-checker',
      'DNSSEC Chain Checker: validate DS, DNSKEY, and RRSIG',
      $stack127_dnssec_checker_intro$DNSSEC lets a domain sign its DNS answers so nobody can quietly change them on the way to you. This tool starts at the internet's root of trust and checks each signature in the chain, one link at a time, until it reaches the exact record you asked about. If a link is broken, you see which one, and the requested answer and raw evidence stay right beside the verdict.$stack127_dnssec_checker_intro$,
      $stack127_dnssec_checker_content$## How to check DNSSEC

Enter the exact domain or hostname and pick the record you want to validate. The type matters, because DNSSEC signs an answer, not a domain-wide badge. An A record can validate on its own, a missing TXT record can come with a valid signed proof that it really is absent, and a name that does not exist can come with a valid signed proof of that too. You are checking one answer at a time.

## How the chain fits together

Three record types do the work, and each has one job. A DS record is the parent zone's fingerprint of the child's key, kept at the parent so it can vouch for the child. A DNSKEY record holds the child zone's own public keys. An RRSIG record is the actual signature over a set of records, made with one of those keys. Trust flows downward: the root vouches for the top-level domain, which vouches for your domain, and every step has to agree before an answer counts as signed.

> `Root` → `DS` → `DNSKEY` → `RRSIG` → `Answer`
>
> Each link vouches for the next: the parent's DS points at the child's DNSKEY, which validates the RRSIG that signs the answer.

Simply finding DS and DNSKEY records in a zone is not enough. They have to match and the signatures have to check out, which is why this tool shows the validator's real verification steps rather than a green light for the presence of records.

## What this validator actually checks

It starts at the DNS root trust anchor and verifies each cryptographic link itself. It checks the parent's DS record against the child's DNSKEY set, confirms the key set is properly signed, and finally verifies the answer you asked for or its signed proof of absence. If a public resolver sets the AD flag to say it already validated the answer, that is kept as supporting evidence, but it does not decide the verdict here.

## What the results mean

| Field | Meaning |
| --- | --- |
| Secure | The answer is signed and every link checks out to the root. This covers a real record, a signed proof that a record is absent, and a signed NXDOMAIN proof that the name does not exist. |
| Insecure | DNSSEC is simply not in use here, and the chain confirms that on purpose. The signed chain ends at an unsigned delegation, so the answer is not protected, but nothing is broken. |
| Bogus | The name should validate but something in the chain failed: a DS link, a key, a signature, or a denial proof. Validating resolvers can turn this into a SERVFAIL, so the answer may look unreachable to real users. |
| Indeterminate | The check could not gather enough evidence for a safe verdict, often a timeout or a partial response. Run it again before you change any DNS. |

## What to fix when DNSSEC is bogus

Start with the first step that failed. A DS failure usually means the registrar still holds an old digest or key tag, so the parent is pointing at a key that is no longer there. A DNSKEY failure points to key data that is missing, expired, or signed wrong. An answer or denial failure points to the zone signatures themselves. If you are moving DNS providers, finish the new signing chain before you change the delegation, or remove the old DS safely before the old keys disappear, so trust never dangles mid-move.$stack127_dnssec_checker_content$,
      '1.0.0',
      'https://github.com/stack127labs/dns-tools'
    ),
    -- tool-slug: dockerignore-tester
    (
      'dockerignore-tester',
      '.dockerignore Pattern Tester: see which rule decides each path',
      $stack127_dockerignore_tester_intro$Paste the .dockerignore file Docker will use and a list of context-relative paths. You get an Included or Excluded verdict, the deciding line, and the full rule trace in your browser. These are path probes, not a filesystem scan or Docker build.$stack127_dockerignore_tester_intro$,
      $stack127_dockerignore_tester_content$## Start with the file Docker will actually use

Use the root `.dockerignore` when Docker builds with the file at the build-context root. If the selected Dockerfile has a sibling such as `lint.Dockerfile.dockerignore`, that file takes precedence. Test it alone because Docker does not merge it with the root file.

Useful probes sit around the boundary you are debugging: the directory named by a rule, a file below it, every exception, and the source of each `COPY` or `ADD` instruction you care about. Enter them relative to the build-context root.

## Docker patterns are ordered, not combined

Docker evaluates active lines from top to bottom. The last matching line decides whether a path is Included or Excluded, and a line beginning with `!` creates an exception. Blank lines and the historical `.` pattern are inactive after preprocessing.

| Pattern | What it does |
| --- | --- |
| `foo/bar` | Matches that context-relative path. Leading and trailing slashes are disregarded. |
| `*/temp*` | Matches names beginning with `temp` inside an immediate child directory. |
| `**/*.go` | Matches files ending in `.go` at any directory depth, including the context root. |
| `temp?` | Matches a root name such as `tempa`, where `?` stands for one character. |
| `!README.md` | Creates an exception that includes the root `README.md` if an earlier rule excluded it. |
| `# note` | Is a comment only when `#` is the first character in column 1. |

## The deciding rule is the answer; the trace explains it

Every path starts Included. A normal matching line makes it Excluded, while a matching exception makes it Included again. The deciding rule is the last line that changed that state. Earlier matches stay in the trace so the result can be audited.

The built-in example uses `docs` followed by `!docs/README.md`. `Parent` means the first rule matched an ancestor while the submitted file was resolved. It is trace evidence, not the final verdict. The later Direct exception makes `docs/README.md` Included by line 2.

## When a result surprises you, check these four things

1. **Effective source:** confirm whether the build uses the root file or a Dockerfile-specific file.
2. **Line order:** a later matching rule can reverse every earlier match.
3. **Normalized input:** compare the displayed normalized path and pattern diagnostics with what you pasted.
4. **Builder behavior:** matcher verdicts for Docker control files do not describe all transfer or copy restrictions.

## What this tester proves, and what it cannot

| Boundary | What it means |
| --- | --- |
| Path probes | Submitted paths are probes. They need not exist. |
| Matching | This is not a build or filesystem walk. It does not inspect symlinks, permissions, file sizes, or the source paths used by `COPY` and `ADD`. |
| Included | `Included` is not a safety guarantee. |
| Builder control files | `Dockerfile`, `.dockerignore`, and Dockerfile-specific ignore files have separate builder transfer behavior. |
| Effective source | A Dockerfile-specific ignore file takes precedence over the root file. The files are not merged. |
| Compatibility | This TypeScript compatibility port is pinned to and fixture-tested against Moby `patternmatcher` v0.6.1, not a claim about every current Docker build. |
| Local handling | Pattern testing uses the rules and paths already in this browser. There is no repository or file upload. |

## Confirm the final context with Docker

For end-to-end proof, run a real build against the actual context and verify the relevant `COPY` or `ADD` step. The [official Docker documentation](https://docs.docker.com/build/concepts/context/#dockerignore-files) explains file placement, pattern syntax, exceptions, and builder control files. If the machine is not ready yet, [install Docker](/self-hosting-for-beginners/install-docker) first.$stack127_dockerignore_tester_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: domain-age
    (
      'domain-age',
      'Domain age checker: how old is a domain?',
      $stack127_domain_age_intro$Enter a domain name to see when its current registration was created and how old it is.

The result shows the exact registration date, the domain’s age in plain language and, when the registry publishes enough information, whether the domain may have expired and been registered again.$stack127_domain_age_intro$,
      $stack127_domain_age_content$## What is a domain age checker?

A domain age checker answers a simple question:

> When was this domain registered, and how old is its current registration?

For example, if a domain was registered on 15 March 2005, the result might show:

- Registered: 15 March 2005
- Domain age: 21 years
- Registration expires: 15 March 2027

The date comes from the registry responsible for that domain ending.

## Why would you check a domain’s age?

### Check a suspicious website

Imagine receiving an email from a company claiming it has operated for 15 years.

You check its domain and discover that it was registered twelve days ago.

That does not automatically prove the website is a scam, but the contradiction is a useful warning sign.

### Verify a domain before buying it

A seller might advertise a domain as being 20 years old. Checking the registration date helps you confirm whether the registry record supports that claim.

It cannot tell you whether the seller owned the domain for all those years.

### Research a business or competitor

The registration date provides useful context when researching a company, website or competing product.

A recently registered domain may belong to a new project. An older domain may have been used by several unrelated businesses during its lifetime.

### Understand the domain’s SEO history

An older domain may have accumulated links, mentions and search history.

Age itself does not automatically improve Google rankings. What happened on the domain during those years matters much more than the number of years it has existed.

## What does domain age actually mean?

Domain age normally means the time since the creation date shown in the domain’s current registry record.

It does not necessarily tell you:

- When the website launched
- When the business started
- How long the current owner has owned the domain
- Whether the domain always hosted the same content
- Whether someone else previously used the domain

A domain’s registration date, website history, business age and ownership history are four different things.

## What happens if a domain expires?

Suppose a domain was originally registered in 2005, expired in 2024 and was registered again by someone else in 2026.

Its current registry record may show a creation date in 2026. The previous 19 years may no longer appear in the current registration data.

Some registries publish information that helps identify a re-registration. Many do not. When the registry does not provide enough information, the tool will say that the domain’s earlier history cannot be determined.

## What does the result show?

Enter a domain such as `stack127.com`. The result can include:

- The exact registration date
- The age in plain language
- The current expiration date, when published
- The registry responsible for the domain ending
- Re-registration information, when available
- A clear explanation when no creation date is published

## Does an old domain mean a website is trustworthy?

No.

Old domains can be sold, abandoned and repurposed. A website operating on a 20-year-old domain may have launched only a few months ago.

Domain age is most useful as a contradiction detector. If a company claims decades of history but its domain was registered recently, that is worth investigating. A new domain by itself is not proof that anything is wrong.$stack127_domain_age_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: domain-availability
    (
      'domain-availability',
      'Domain availability checker: is that name taken?',
      $stack127_domain_availability_intro$Check whether a domain name is already registered by asking the registry that runs the ending directly. No adverts, no upsell, no suggested alternatives, and no record kept of the names you try. If a name is taken you also get who holds it and when it expires.$stack127_domain_availability_intro$,
      $stack127_domain_availability_content$## How does a domain availability check work?

Every domain ending has a registry that keeps the definitive list of names registered under it. This tool asks that registry whether it holds a record for the name you typed. If it does, the name is taken. If it does not, no registration exists.

That is a different question from what a registrar's search box answers. A registrar is checking whether it can sell you something, which involves its own pricing, promotions and inventory. This checks the underlying fact.

## How do you check if a domain name is available?

Type the name with its ending, like `example.com`, and press the button. You will get one of four answers, and only one of them means go.

| Field | Meaning |
| --- | --- |
| No registration found | The registry has no record. Usually registerable, with the caveats below. |
| Taken | Somebody holds it. You also get the registrar and expiry date. |
| Cannot check | That ending publishes no registration service, so no tool can answer. |
| Check failed | The registry did not answer or refused. Not an answer about the name. |

Those last two matter. A checker that shows a failed lookup as a green tick is worse than useless, because you plan around it. Here they stay clearly marked as what they are.

## Does available always mean you can register it?

No, and this is the gap worth understanding before you plan around a free result. Several situations look identical from the outside:

- **Reserved names.** Registries hold back single letters, two letter names, country names and a long list of strings ICANN requires them to reserve. All unregistered, none available.
- **Premium pricing.** Plenty of free names are priced by the registry at hundreds or thousands a year rather than the usual fee. The registration record says nothing about price, and this is common on newer endings.
- **Registry blocklists.** Some endings block whole categories of name, and brand protection services block others.
- **Just released.** A name that finished its deletion cycle seconds ago is technically free and very likely to be caught by an automated service before you reach a checkout.

The practical move is to treat a free result as promising rather than settled, and check the price at a registrar before committing to a name.

## Why can you not just visit the website to check?

Because it gives wrong answers in both directions, and it is the most common way people get this wrong.

A registered domain with no nameservers set resolves to nothing, so the browser says the site cannot be reached and you conclude the name is free. It is not. Going the other way, some endings use a wildcard that makes unregistered names appear to resolve, so you conclude a free name is taken.

DNS answers a different question from registration. That is why this tool asks the registry rather than guessing from whether a site loads. If you do want to see what DNS is doing, the [DNS lookup tool](/dns-lookup) is the right place.

## Is it safe to check a domain name here?

There is a long-standing worry in the domain community about front running, where searching for a name somewhere leads to somebody else registering it. Worth being precise about what happens here rather than just reassuring you.

The name goes to the registry that runs the ending, because that is who has the answer, and that part is unavoidable with any tool. On this side, the registry's reply is kept briefly so repeated checks do not hammer them, stored against the domain name and nothing else. Your IP address is used for a few minutes to stop one person overloading the tools and is never written next to a lookup. No list of searched names is built, and there is nothing being sold here that would give a reason to build one.

## What if the name is already taken?

You get the registrar and the expiry date, which tells you more than a dead end. If the domain is in redemption or pending delete it is on its way out of the system, and the [expiry checker](/domain-expiry) shows exactly where it sits in that cycle.

Most good names are held by someone using them. Some are held by people waiting to sell. The registration record cannot tell you which, and neither can anyone else without asking.

## Related tools

To try one name across several endings at once, use [multi-TLD availability](/multi-tld-availability). To see the full record on a name that came back taken, use the [domain registration lookup](/domain-lookup). To see which endings can be checked at all, see the [TLD directory](/tld-directory).$stack127_domain_availability_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: domain-expiry
    (
      'domain-expiry',
      'Domain expiry checker: when does a domain expire?',
      $stack127_domain_expiry_intro$Check when a domain expires and, more usefully, what happens after that date passes. A domain does not become available the morning it expires. It goes through grace, redemption and pending delete first, and that takes two to three months. This shows the exact date, how long is left, and which stage the domain is in right now.$stack127_domain_expiry_intro$,
      $stack127_domain_expiry_content$## What does a domain expiry date mean?

It is the date the current registration period ends. It is not the date the domain stops working, and it is not the date somebody else can register it. Both of those come later, and how much later depends on your registrar.

Domains are registered for a fixed term, usually one to ten years. When the term ends the registry does not simply delete the name, because that would make an accidental lapse unrecoverable. Instead it moves through a defined sequence with a recovery window built in.

## What happens after a domain expires?

For generic endings under ICANN rules, roughly two to three months passes between the expiry date and the name being available to anyone.

| Stage | How long | What it means |
| --- | --- | --- |
| Auto renew grace | up to 45 days | The registry has already renewed the name. Your registrar decides whether to bill you or hand it back, and it can take the full period to choose. The site may still work during this time. |
| Redemption | 30 days | The domain has been deleted. Only the previous owner can recover it, and it costs a redemption fee that is considerably more than a renewal. Nobody else can register it. |
| Pending delete | 5 days | Nobody can do anything. Not recoverable, not registerable. |
| Released | immediate | Anyone can register it. |

The 30 day redemption and 5 day pending delete are required of registries. The grace period is up to 45 days and registrars use it very differently, some deleting on day one and some on day forty.

## How do you check when a domain expires?

Enter the domain above. You get the registry expiry date, how long is left in plain language, a bar showing how far through the term it is, and a marker on whichever lifecycle stage the domain currently sits in.

## My domain is expiring soon, what should I do?

The date on this page is rarely the real risk. Domains are lost to failed payments and to renewal notices arriving at an email address nobody reads any more. Both are invisible in the public record, so both are worth checking in your registrar account instead.

Three things to verify, in order: that auto renew is switched on, that the card on file has not expired, and that the contact email on the account is one you actually read. If those are right, an approaching expiry date is not a problem. If they are not, the date is the least of it.

## When will an expired domain become available?

Nobody can tell you the exact date, and any tool that gives you one is guessing. Registrars choose when to delete within the grace period, registries batch their releases differently, and the stages above are the shape rather than a schedule.

Worth being straight about the other part too: waiting for a good domain to drop is a competitive business with real money in it. Drop catching services hold multiple registry connections and take desirable names in the same second they release. If a name is genuinely valuable, refreshing this page is not going to win it.

## Which expiry date should you trust?

The registry and the registrar each publish their own, and they are separate fields rather than one field written twice. When they differ it usually means a renewal has gone through at one and not reached the other yet.

The registry date is the one that governs deletion, so that is the one to plan around, and it is what the countdown on this page uses. If your registrar shows a later date than the registry, that is worth a support ticket rather than a shrug.

## Do country domains follow the same rules?

No. Everything above describes generic endings under ICANN policy. Country endings set their own lifecycles, and several look nothing like this. Some have no redemption period at all, some hold names far longer, some release on a fixed schedule.

When you are working with one of those, the registry's own documentation is the only reliable source, and this page will show you the dates it publishes without pretending the ICANN stages apply.

## Related tools

The [status codes reference](/epp-status-codes) explains every lifecycle code in full, including `redemptionPeriod` and `pendingDelete`. For the complete record behind the date, use the [domain registration lookup](/domain-lookup), and to see whether a name is registered at all, the [availability checker](/domain-availability).$stack127_domain_expiry_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: domain-lookup
    (
      'domain-lookup',
      'Domain registration lookup: the full WHOIS and RDAP record',
      $stack127_domain_lookup_intro$Enter any domain and see its full registration record: the registrar it sits with, when it was created, when it expires, the status codes controlling what can be done to it, its nameservers, and which contact details have been withheld. The data comes straight from the registry that runs the ending, so there is nothing sitting between you and the source.$stack127_domain_lookup_intro$,
      $stack127_domain_lookup_content$## What is a domain registration lookup?

It is a query to the official database that records who holds a domain name. Every domain ending has a registry behind it, and that registry keeps a record for every name registered under it. A lookup asks for that record and shows you what it says.

You may know this as a WHOIS lookup. Same job, newer plumbing. WHOIS was a plain text service that ICANN stopped requiring on 28 January 2025, and it has been replaced by RDAP, which returns properly structured data over a secure connection. This tool uses RDAP, which is why it can tell you things a WHOIS tool cannot, such as exactly which contact fields were hidden and by what method.

## How do you look up a domain registration?

Type the domain into the box above and press the button. That is the whole thing.

You can paste in more or less anything and it will work out what you meant. A full web address like `https://www.example.co.uk/pricing` becomes `example.co.uk`. A subdomain is reduced to the part that is actually registered, and the result tells you when that happened so you are never reading about a different name than you thought. Names with accents or non-Latin characters are converted automatically and both forms are shown.

There is nothing to sign up for and no limit you will hit in normal use.

## What information does a domain lookup show?

| Field | Meaning |
| --- | --- |
| Registrar | The company the domain was bought through, plus its IANA ID and abuse contact. |
| Creation date | When the name was first registered by anyone. |
| Expiry dates | Both of them. The registry date and the registrar date are separate fields and can differ. |
| Status codes | What the registry currently allows or blocks, including transfers and deletion. |
| Nameservers | The DNS servers on record at the registry. |
| DNSSEC | Whether the domain has a DS record published at its parent. |
| Contacts | Whatever is published, plus a list of exactly what was withheld and how. |

## Why do the registry and the registrar say different things?

Because they are two different companies holding two different records, and this is the single most useful thing to understand about domain data.

The registry runs the ending. Verisign runs `.com`, Nominet runs `.uk`. There is exactly one per ending, and it is the authority on dates, status codes, nameservers and DNSSEC. The registrar is the company you bought the name from, and for most endings it is the only party holding contact details at all.

`registry` → dates, status codes, nameservers, DNSSEC

`registrar` → contacts, redaction notice, its own expiry date

This tool asks both and labels which one said what. Most tools merge them into a single tidy block, which looks cleaner and hides the disagreements. The disagreements are often the interesting part, so when two dates do not match you see both, along with which one the registry will act on.

## Why are there two expiry dates?

They are genuinely two separate fields, not one field spelled two ways. The registry expiry date is what the registry acts on when it decides to delete a name. The registrar expiry date is the registrar's own record of the same registration.

Usually they match. When they do not, it normally means a renewal has been processed at one end and has not reached the other yet. If you are working out how long you have, use the registry date, because that is the one with consequences.

## What is the difference between last changed and last updated?

A record can show three dates that all sound like "last updated" and mean completely different things. Reading the wrong one is the most common mistake people make with this data.

| Field | Meaning |
| --- | --- |
| Record last changed | When the registry's stored data for this specific domain last changed. It does not say what changed. A nameserver edit, a renewal, a contact update and a transfer all move it. |
| Registry database updated | When the registry last refreshed its own published copy. This has nothing to do with your domain. It is usually today, which is exactly why people misread it as something having just changed. |
| Fetched | When this page retrieved the answer, which may have come from a short-lived cache. |

On one real domain those first two dates were seventeen days apart. Read the wrong line and you would conclude something changed this morning when nothing had changed in over two weeks.

## Why is the owner information hidden?

For almost every generic ending it is gone, and it is not coming back. GDPR arrived in 2018, ICANN changed its rules to match, and registrant name, address, phone and email stopped being published across the board in a matter of months.

What replaced it is more useful than it sounds. Registrars now publish a structured list of exactly which fields they withheld and how, so the record tells you a phone number exists and was removed rather than staying silent about it. This tool reads that list and shows it as a table.

If you need to reach whoever is behind a domain, routes still exist, and the [registrant lookup](/domain-owner) walks through them.

## When would you use a domain lookup?

- **Checking a domain before buying it.** Creation date, expiry, status codes and transfer locks all change what you are actually getting.
- **Working out why a site is down.** A hold status explains a domain that resolves to nothing while looking perfectly registered.
- **Judging whether an email or site is legitimate.** A domain registered three weeks ago that claims twenty years of trading is worth a second look.
- **Finding who to contact about abuse.** The registrar and its abuse address are both in the record.
- **Auditing domains you own.** Expiry dates, transfer locks and nameservers in one place.

## What a domain lookup cannot tell you

- **Anything historical.** This is the current state of the record. There is no previous owner, no old nameserver, no log of what changed last month. Tools that show you that built their own archive by saving daily copies over years.
- **Who runs the website.** The registrant of a domain is often not the person operating what is on it.
- **Whether a domain is trustworthy.** Recently registered is a signal worth noticing, not a verdict.
- **Anything for endings with no registration service.** Some endings publish nothing machine readable. You get a clear "cannot check" rather than a blank that looks like an answer, and the [TLD directory](/tld-directory) lists which ones those are.

## Is this lookup private?

The name you enter is sent to the registry and registrar that run that ending, because they hold the answer. There is no way around that part.

On this side, the registry's reply is kept briefly so repeated lookups do not hammer them, stored against the domain name and nothing else. Your IP address is used for a few minutes to stop one person overloading the tools and is never written next to a lookup. No history of who searched for what is kept, and nothing here is for sale that would give a reason to.

## Related tools

For one specific part of the record there is a focused page for each: [domain age](/domain-age), [expiry and the deletion cycle](/domain-expiry), [registrar and abuse contact](/domain-registrar), [registrant details](/domain-owner), and [what each status code means](/epp-status-codes). To check the registration and the live DNS together, use the [domain report](/domain-report).$stack127_domain_lookup_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: domain-owner
    (
      'domain-owner',
      'Domain registrant lookup: who owns this domain?',
      $stack127_domain_owner_intro$Look up who a domain is registered to. For most domains the answer is that the details are hidden, so rather than showing you a wall of REDACTED and stopping there, this shows what is published, exactly which fields were withheld and how, and the routes that still work for reaching the person behind a name.$stack127_domain_owner_intro$,
      $stack127_domain_owner_content$## Can you find out who owns a domain?

Sometimes, but far less often than you would expect. Until 2018 the name, address, phone number and email of almost every domain owner were public. Then GDPR arrived, ICANN changed its rules to match, and registrars stopped publishing contact details across the board. It was not a gradual fade, it happened in a matter of months.

Where you will still see real details: organisations rather than individuals, because data protection law protects people and not companies, and some country endings that publish more than generic ones do. When the data is there, this tool shows it normally.

## What does redacted for privacy actually mean?

It means the registrar removed something before publishing the record. What is genuinely useful, and what most tools throw away, is that registrars now publish a structured list of exactly which fields they withheld and by which method. So the record can tell you a phone number exists and was removed, rather than staying silent about whether one was ever there.

The three methods mean different things:

| Field | Meaning |
| --- | --- |
| Removed | The field is gone from the record entirely. |
| Emptied | The field is still there with a blank value. This is why a registrant name sometimes appears as an empty string rather than being absent. |
| Replaced | The real value was swapped for a stand-in. This is the interesting one: a replaced email is usually a working relay or contact form that reaches the owner without exposing them. |

## How do you contact a domain owner?

Four routes, in rough order of how often they work. The result above links whichever ones exist for the domain you checked.

- **The registrar's contact form or relay address.** When one is published we link it directly. Your message reaches the owner and you do not learn who they are, which is the trade-off the system is built around.
- **The abuse contact**, for phishing, malware or spam coming from the domain. Accredited registrars must publish one and must act on reports. Using it for a general question gets you ignored, fairly.
- **ICANN's Registration Data Request Service**, for a documented legitimate interest such as a legal claim or an investigation. It is a real process with real requirements, not a form that hands over data because you asked.
- **A court order or law enforcement request**, where that applies to your situation.

## What is a domain privacy service?

Some domains list a proxy company as the owner, with names like Domains By Proxy or Privacy Protect. That is not redaction. It is a service the owner paid for, and the proxy company is genuinely the registrant of record.

The practical difference: with redaction, the real details exist in the registrar's system and are simply not published. With a proxy, a third party is standing in the middle deliberately. Either way the person behind it is not in any public source, and the published contact is the only route to them.

## Why do WHOIS sites show owner details when this does not?

Usually because they are showing you old data. Some sites hold archives scraped before 2018 and present them as current, which is why you will occasionally see a name and address that has not been accurate for years.

Others sell access to aggregated historical records. That data is real, but it is history rather than the current record, and it is worth knowing which you are looking at. This tool reads what the registry and registrar publish today and nothing else.

## What this lookup cannot do

- **Reveal a redacted owner.** There is no technique, no back door, and no paid data source used here.
- **Tell you who runs the website.** The registrant of a domain is frequently not the operator of what is on it, especially on hosted platforms.
- **Verify that published details are true.** Registrars must collect accurate data, not prove it, and published names and addresses are routinely wrong.
- **Show previous owners.** The record is current state only.

## Related tools

If what you actually want is somewhere to report abuse, the [registrar lookup](/domain-registrar) gets you there faster. For the complete record including dates and status codes, use the [domain registration lookup](/domain-lookup), and to judge whether a domain is newly set up, the [domain age checker](/domain-age).$stack127_domain_owner_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: domain-registrar
    (
      'domain-registrar',
      'Registrar lookup: find a domain''s registrar and abuse contact',
      $stack127_domain_registrar_intro$Look up which company a domain is registered through, along with its abuse contact and IANA ID. Useful when you need to report something, take over a domain from a former agency or employee, or work out where you bought a name you have had for years.$stack127_domain_registrar_intro$,
      $stack127_domain_registrar_content$## What is a domain registrar?

A registrar is a company accredited to sell domain names and hold the account they live in. When you buy a domain, a registrar is the party that actually registers it for you and where you log in to change nameservers, renew, or transfer it away.

Every registered domain has exactly one registrar at a time, and the record names it. That is what this tool reads.

## Registry, registrar, reseller: what is the difference?

Three different companies, and confusing them is why most people end up on a page like this.

`registry` → `registrar` → `reseller` → you

| Field | Meaning |
| --- | --- |
| Registry | Runs the ending. Verisign runs `.com`, Nominet runs `.uk`. One per ending. You never deal with them directly. |
| Registrar | Accredited to sell names in that ending and holds your account. This is who the record names. |
| Reseller | Whoever actually took your money. Often a hosting company selling through a registrar, and their name appears nowhere in the record. |

## Why is the registrar a company I have never heard of?

Almost always because you bought through a reseller. Plenty of hosts sell domains through Tucows, PDR or Enom, so that is the name on the official record even though your invoice says something completely different.

The practical way to find who you actually pay: search your email for a domain renewal receipt. The reseller is on that, and the registrar usually is not. Once you know both, you know which one to contact for what. Billing and support go to the reseller; the underlying registration lives with the registrar.

## How do you report abuse to a registrar?

Use the abuse contact from the result above. It is for the domain being used to cause harm: phishing pages, malware, spam campaigns. Accredited registrars are required to publish an address and to act on what arrives there.

Include the exact domain, what you observed, when it happened, and evidence such as email headers or the specific URL. Vague reports get closed. It is also not a support channel, so a complaint about a website being merely annoying or wrong will be ignored, and reasonably so.

If a registrar does not act on a genuine report, ICANN runs a complaint process that escalates it above them.

## How do you regain access to a domain you own?

This comes up when an agency, a former employee or a long-gone contractor registered the name. The registrar is the only party who can help, and they will require proof.

Expect to show that the registrant details on file match your organisation, or documentary evidence that the name belongs to you. It takes time and there is no shortcut. What this tool gives you is the correct company to start that conversation with, which is often the missing piece.

What is not in any public record: your account username, which email address the account uses, or anything that helps with a password reset.

## Can you tell when a domain changed registrar?

Sometimes. Some registries publish a transfer date and most do not. When it is there, the result shows it.

When it is missing, a recent move is genuinely invisible. The record last changed date is not a substitute, because it moves for nameserver edits, renewals, contact changes and plenty else besides a transfer. Reading it as a transfer date is a common and understandable mistake.

## What is an IANA registrar ID?

A number ICANN assigns to each accredited registrar. It is useful because registrar names get written inconsistently across systems while the number stays fixed, so if you are matching records or filing a complaint the ID is the unambiguous identifier.

## Related tools

If you are trying to move a domain, [transfer readiness](/transfer-readiness) works out what is standing in the way. For the complete record use the [domain registration lookup](/domain-lookup), and to find out who is behind the name rather than who sold it, see [domain owner lookup](/domain-owner).$stack127_domain_registrar_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: domain-report
    (
      'domain-report',
      'Domain health check: registration and DNS together',
      $stack127_domain_report_intro$Check a domain's registration record and its live DNS in one go, and find the places where the two disagree. A registry can hold one set of nameservers while the zone serves another. DNSSEC can be switched on at the registry while the chain is broken. Neither shows up if you only look at one side, which is what most tools do.$stack127_domain_report_intro$,
      $stack127_domain_report_content$## What does this report check?

Two things at once, and then the gap between them. On the registration side: registrar, dates, status codes, nameservers on record, and DNSSEC delegation. On the DNS side: the parent delegation and what the zone itself actually publishes.

The report also lists what did not run. A combined check that quietly drops a step is worse than no check, because a gap reads like a pass.

## Why do nameservers differ between the registry and DNS?

This is the mismatch worth understanding, because it produces faults that are genuinely miserable to diagnose. A nameserver list can live in three places, and they normally agree.

`registry record` → `parent delegation` → `the zone itself`

When they do not agree, you get answers that work sometimes and fail other times, depending on which server a resolver happened to ask. It usually means a nameserver change was made in one place and not the other, often during a migration that looked finished.

## Does DNSSEC enabled mean DNSSEC is working?

No, and the difference matters more than most DNSSEC settings. The registration record tells you whether a DS record exists, which is a delegation fact. It says nothing about whether the signatures validate.

A domain with DNSSEC switched on and a broken chain does not degrade gracefully. It stops resolving completely for everyone behind a validating resolver, while continuing to work fine for anyone who is not. That is why this report flags a signed delegation and sends you to the [DNSSEC chain checker](/dnssec-checker), which runs a real validator rather than reading a flag.

## Why is my domain registered but not resolving?

If DNS checks come back clean and nothing loads, the answer is often in the registration record rather than in DNS at all.

A hold status tells the registry to stop publishing the domain, so nothing under it resolves while the registration stays perfectly valid. No amount of DNS debugging reveals it, because DNS is behaving correctly by having nothing to serve. The other common cause is no nameservers on record at all. This report is where those two halves finally sit next to each other.

## Why is there no score or grade?

Because there is no single correct configuration for every domain, so a total would be inventing a standard that does not exist. A perfectly healthy domain can show several findings, and a domain scoring well can still be badly broken in a way the score never looked at.

Each finding is an observation with the evidence behind it and a link to the tool that investigates it properly. This page is for locating a problem. The focused tools are for diagnosing it.

## What this report does not cover

- **Website security.** No TLS certificates, open ports, blocklists, headers or content checks. This is not a security scanner.
- **Email deliverability.** Reading a TXT record is not validating SPF, DKIM or DMARC, and pretending otherwise would be worse than staying out of it.
- **Monitoring.** One point in time, no history, no alerts, and nothing stored.
- **Anything private.** No registrar account state, no hosting, no billing.

## Related tools

The DNS side has much deeper tools of its own: [nameserver delegation](/nameserver-checker), [SOA consistency](/soa-checker) and [CAA policy](/caa-checker). On the registration side, the [domain registration lookup](/domain-lookup) shows the complete record and [status codes](/epp-status-codes) explains anything the report flagged.$stack127_domain_report_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: drive-reliability
    (
      'drive-reliability',
      'Drive reliability explorer',
      $stack127_drive_reliability_intro$Use published Backblaze drive data to inspect an exact model or compare up to three cohorts. The explorer returns observed AFR and the exposure behind it, not a personal failure forecast for a home NAS.$stack127_drive_reliability_intro$,
      $stack127_drive_reliability_content$## Choose a period that matches the question

Quarterly, annual, and lifetime are separate Backblaze source periods. Keep a comparison inside one period, then use the exact model and capacity filters that match the drives you are considering. The source has different inclusion thresholds for each period, so a missing model result is better treated as no data than filled with a value from another scope.

Rows below the source threshold stay out of the normal result set. Turn on **Show small cohorts** only when you want to inspect one, and read its **Thin cohort** label as a warning that one failure can move the point rate sharply.

## AFR uses drive days, not drive count

The explorer calculates annualized failure rate as `failures / (drive days / 365) × 100`. Drive days are the exposure, so two models with the same drive count can still have different evidence when their observation time differs.

The point rate is paired with an approximate 95% evidence range based on the same failures and exposure. Zero observed failures makes the point rate `0.00%`, but it does not prove that another drive will not fail. Treat the range, failures, and drive days as one answer.

## Treat fleet evidence as one input, then verify your own drive

Backblaze reports an operational data-center cohort with its own workload, age mix, and observation period. This page does not inspect SMART history, firmware, workload, warranty terms, or your NAS topology, and its fleet result is not a personal failure forecast.

Filtering and selection use the bundled snapshot locally in this browser, with no network request during exploration. Share state puts only bounded filters and selected model IDs in the URL. Before acting on a result, check the drive's current SMART history and firmware, confirm the warranty or return path, and keep a tested backup. Continue with the [storage tools](/storage-tools) or the [ZFS pool capacity calculator](/zfs-capacity-calculator) when the next question is pool planning. The [official Backblaze Drive Stats data page](https://www.backblaze.com/cloud-storage/resources/hard-drive-test-data) is the source for the published cohort data.$stack127_drive_reliability_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: home-assistant-energy-entity-checker
    (
      'home-assistant-energy-entity-checker',
      'Home Assistant Energy Entity Eligibility Checker: find the failed picker rule',
      $stack127_home_assistant_energy_entity_checker_intro$Choose the intended Home Assistant Energy field, then enter or paste the sensor's current attributes. The checker compares its domain, state, classes, and unit with pinned Energy and long-term-statistics rules. It runs in this browser, but it cannot inspect recorder health or guarantee that the entity will appear.$stack127_home_assistant_energy_entity_checker_intro$,
      $stack127_home_assistant_energy_entity_checker_content$## Choose the Energy field before judging the sensor

Accumulated energy fields describe a quantity collected over time. The optional power field describes the current rate instead. That distinction changes the accepted device class, state class, and unit family.

Start with the exact field where the entity is missing. Changing that choice changes only the Energy comparison. It does not rewrite the separate long-term-statistics conclusion.

### Each Energy field accepts a specific attribute combination

| Energy field | Device class | State class | Unit family |
| --- | --- | --- | --- |
| Grid import, grid export, solar production, battery charge, battery discharge, individual device | `energy` | `total` or `total_increasing` | Energy |
| Optional power | `power` | `measurement` | Power |
| Gas | `gas` or `energy` | `total` or `total_increasing` | Gas volume with gas; energy with energy |
| Water | `water` | `total` or `total_increasing` | Water volume |

## Energy and statistics answer different questions

Energy applies the matrix for the field you selected. Long-term statistics checks the current numeric `sensor` against its own supported state-class boundary. It still cannot see recorder inclusion, stored metadata, or historical unit changes.

For example, `power`, `measurement`, and `W` can match the statistics attribute contract while failing grid import's accumulated-energy rules. Counter suitability also stays separate: an unknown or decreasing counter never becomes an automatic recommendation for `total_increasing`.

## A matching result still needs Home Assistant

A local match means the current attributes cleared the pinned comparison. It cannot guarantee that the entity appears. The [Home Assistant Energy FAQ](https://www.home-assistant.io/docs/energy/faq/) covers missing entities, and the [Home Assistant sensor documentation](https://developers.home-assistant.io/docs/core/entity/sensor/) explains state classes and counters. Entered attributes stay in this browser; the [stack127 privacy policy](/privacy) covers ordinary page requests and site analytics separately.

1. Check Developer Tools > Statistics for issues and the stored unit.
2. Confirm recorder inclusion for the entity and its integration.
3. Return to Energy settings and validate the intended field in the live instance.$stack127_home_assistant_energy_entity_checker_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: multi-tld-availability
    (
      'multi-tld-availability',
      'Multi-TLD availability: one name across many endings',
      $stack127_multi_tld_availability_intro$Enter one name and check it against several endings at once. Each is asked of the registry that runs it, and every row reports its own outcome, so a check that failed is never quietly presented as a name that is free.$stack127_multi_tld_availability_intro$,
      $stack127_multi_tld_availability_content$## How to check one name across several endings

Type the name without an ending, tick the endings you care about, and run it. Up to twelve at a time. Each row is a separate question to a different registry, which is why they settle at slightly different speeds.

This is the tool for the moment you have picked a name and want to know what you can actually get. It is not a name generator and it does not suggest alternatives.

## What do the four results mean?

| Field | Meaning |
| --- | --- |
| No registration found | The registry has no record. Usually registerable, but read the premium pricing note below before you plan around it. |
| Taken | Somebody holds it. The registrar and expiry date are shown where published. |
| Cannot check | That ending publishes no registration service, so no tool can answer. Not a statement about the name. |
| Check failed | The registry rate limited us, refused, or did not answer. Also not a statement about the name. |

Those last two are the ones to watch. A checker that renders a failed lookup as a green tick is actively harmful, because you make decisions on it. Here they stay clearly marked as unanswered.

## Why is a free name sometimes not for sale?

Because the registration record says nothing about price or eligibility. Registries reserve names, block whole categories, and price a great many ordinary strings as premium, which on newer endings can mean hundreds or thousands a year rather than the usual fee.

This matters more here than on a single check. Seeing a name free across eight endings looks like an open goal, and some of those are very likely priced well above standard. Check the price at a registrar before building anything around the result.

## Which endings should you check?

Depends what you are doing, and it is worth being honest that the default selection here leans toward generic endings. That is not a preference, it is availability: many country endings publish no registration service, so no tool can check them.

- **A business or product.** `.com` still carries the most recognition, with `.co` and your country ending as the usual fallbacks.
- **Software or a developer tool.** `.dev`, `.app` and `.io` are conventional and understood.
- **Protecting a brand.** Register the obvious variants rather than every ending in existence. Full defensive registration across the root is not achievable and not worth attempting.

Endings that cannot be checked are still selectable, and they say so plainly rather than being hidden from the list.

## Why is the check limited to twelve endings?

Each ending is a separate request to a different registry, and registries limit how often any one source may ask. Every visitor here shares one outbound address, so one person checking fifty endings on repeat can get everybody throttled across every domain tool at once.

Hence the cap, plus a per-visitor limit and a shared budget per registry. If you hit a limit, the page says so rather than returning an empty result that looks like an answer.

## Related tools

For one name with the full reasoning behind the answer, use the [domain availability checker](/domain-availability). To see who holds a name that came back taken, use the [domain registration lookup](/domain-lookup). To see every ending that exists and which ones can be checked, see the [TLD directory](/tld-directory).$stack127_multi_tld_availability_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: nameserver-checker
    (
      'nameserver-checker',
      'Nameserver Delegation Checker: test NS and glue records',
      $stack127_nameserver_checker_intro$NS records name the servers that are supposed to answer for your domain. This tool follows the whole handoff: it asks the parent zone which nameservers it points to, asks those servers what your domain says about itself, compares the two lists, checks the glue addresses that make the handoff work, and tests each server directly over both UDP and TCP.$stack127_nameserver_checker_intro$,
      $stack127_nameserver_checker_content$## How to run the check

Enter a domain, or any hostname under it. The tool works out which zone is in charge, asks that zone's parent which nameservers it hands off to, then asks those nameservers what the zone says about itself. It also looks up every nameserver's IP address and talks to each server directly, so you learn more than a plain NS lookup would tell you.

## How the handoff works

DNS is a chain of handoffs. No single server knows every domain, so each level points to the next. When someone looks up `example.com`, they start high up at the `com` zone, which does not hold your records but knows where to send the question. That pointing step is called delegation: `com` delegates `example.com` to your nameservers and steps out of the way. Your nameservers are the ones that actually hold the zone and answer for it, which is what authoritative means. They are the source, not a cache passing along someone else's copy.

> `com` → `your nameservers` → `example.com zone`
>
> The parent zone points at your nameservers, and your nameservers answer from inside your zone. Both sides should describe the same set of servers.

## What glue is and when you need it

There is a catch when a nameserver lives inside the zone it serves. If `ns1.example.com` is the server for `example.com`, a resolver cannot find `ns1.example.com` without first asking a server for `example.com`, which is the exact thing it is trying to reach. Glue breaks that loop: the parent zone publishes the IP address of `ns1.example.com` directly, so the resolver gets an address instead of a dead end. A nameserver that lives outside your zone, like `ns1.someprovider.net`, is found through normal lookups and does not need glue in your delegation.

## Reading the result

When the parent's list and your zone's own list name the same servers, the handoff is consistent and resolvers will land where you expect. For each server, "Answered" means it replied on that address at all. "Authoritative SOA" is the stronger check: the server not only replied, it claimed authority for this zone, which is what you actually want from a nameserver.

A server that shows up on only one side is the common warning sign. It usually means a provider move that was started but never finished: the new server was added in one place, or the old one was removed in one place, and the matching change never happened on the other side. Nothing breaks immediately, because resolvers may still reach a working server, but the delegation is now inconsistent and the odd server out is the first thing to reconcile.

## Fixing a mismatch

Start at the parent side, which is your registrar's delegation, and compare it against the NS records at your DNS provider. Remove old servers from both places, add every new server to both places, and add the required glue before you switch to a nameserver that lives inside the zone. If a server is listed correctly but does not answer authoritatively, fix that server or drop it from the delegation rather than waiting for DNS caches to sort it out. A stale delegation does not heal on its own.$stack127_nameserver_checker_content$,
      '1.0.0',
      'https://github.com/stack127labs/dns-tools'
    ),
    -- tool-slug: nfs-firewall-rules
    (
      'nfs-firewall-rules',
      'NFS Firewall Rules Planner',
      $stack127_nfs_firewall_rules_intro$Build a reviewable inbound-listener plan for one Linux NFS server or client. Choose the NFS version, peer CIDR, and firewall, then enter any locally verified listener ports the selected branch needs. The calculation runs in this browser and does not inspect your hosts or apply rules.$stack127_nfs_firewall_rules_intro$,
      $stack127_nfs_firewall_rules_content$## What changes between NFSv3 and NFSv4

| Protected scenario | Fixed by the protocol | Assigned locally | Important boundary |
| --- | --- | --- | --- |
| NFSv3 server | TCP 111 and 2049 | mountd, statd, lockd, and optional rquotad | Legacy UDP is added only when selected. |
| NFSv3 client | TCP 111 | statd and lockd | Server-only nfs and mountd listeners are excluded. |
| NFSv4.0 | Server TCP 2049 | Client callback TCP port | Plan the server and client host firewalls separately. |
| NFSv4.1 or later | Server TCP 2049 | None in this model | The client uses its established session for callbacks. |

## Verify NFSv3 helper ports on the protected host

NFSv3 helper programs can use ports assigned by the local system. Read the relevant `mountd`, `statd`, and `lockd` settings from the host, then confirm active listeners with `rpcinfo -p` and `ss -lntup`. The [nfs.conf manual](https://man7.org/linux/man-pages/man5/nfs.conf.5.html) names the configuration keys. Treat port numbers in articles as examples, not local facts.

Leave a helper field empty until its value is verified. An incomplete result shows only the protocol-fixed rows and names the missing facts. It deliberately withholds firewall syntax and copy output, so a partial set cannot look ready to apply.

## Treat the output as a review plan

The listener table is the neutral result. It identifies the protected host, inbound direction, allowed peer, service, protocol, destination port, and whether that port is fixed by the protocol or supplied from the real host. Review this table before the selected firewall syntax.

Firewalld output needs the active zone. UFW output assumes the matching address family is enabled. Nftables output is an expression for an existing `inet` input chain, not a new table, hook, policy, or complete ruleset. These are review fragments, not apply scripts, and existing rule order can change their effect.

## What the planner cannot verify

The planner does not read your listeners, firewall, routes, exports, permissions, SELinux policy, identity mapping, NAT, or cloud controls. It cannot prove that a rule is active, that an export is allowed, or that a mount is reachable. Routed firewalls, security groups, clustered NFS, Kerberos, RDMA, TLS, and vendor-specific NAS services are outside this model.

Entered values stay in this browser and are not added to the URL or saved by the planner. Follow the verification steps shown with the result from the NFS client, and compare the real listeners with the [RHEL NFS server documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/deploying-an-nfs-server_configuring-and-using-network-file-services). See the [privacy policy](/privacy) for the sitewide boundary.$stack127_nfs_firewall_rules_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: nginx-proxy-pass-calculator
    (
      'nginx-proxy-pass-calculator',
      'NGINX proxy_pass URI Calculator: see the upstream URL',
      $stack127_nginx_proxy_pass_calculator_intro$Enter the matched static location, incoming request target, and `proxy_pass` URL. The calculator returns the final upstream URL with a literal replacement trace and optional slash comparison. It runs in this browser, but runtime-dependent cases need verification in NGINX.$stack127_nginx_proxy_pass_calculator_intro$,
      $stack127_nginx_proxy_pass_calculator_content$## Use the location NGINX actually matched

Copy the selected literal prefix or exact location, the incoming request target, and the URL written after `proxy_pass`. This calculator checks that the request fits the supplied location, but it does not choose among a full set of location blocks.

Keep the request arguments after `?`. An omitted target URI and a target URI of `/` are different inputs, so preserve the directive exactly.

### Common static cases

These rows use location `/api/` and request `/api/users?id=42`.

| proxy_pass | Retained request | Final upstream URL |
| --- | --- | --- |
| `http://backend` | `/api/users?id=42` | `http://backend/api/users?id=42` |
| `http://backend/` | `users?id=42` | `http://backend/users?id=42` |
| `http://backend/v2` | `users?id=42` | `http://backend/v2users?id=42` |
| `http://backend/v2/` | `users?id=42` | `http://backend/v2/users?id=42` |

## Read the result as one replacement chain

With no target URI, the supported request path is retained. With a target URI, the matched location is removed, its suffix is appended to that URI, and the original request arguments follow the new path.

Concatenation is literal. `/v2` plus `users` becomes `/v2users`; `/v2/` becomes `/v2/users`. The slash comparison shows both outcomes without recommending either one.

## When the answer needs live NGINX

| Input | Why no URL is shown | What to verify |
| --- | --- | --- |
| Regex or named location | There is no literal matched prefix that this page can safely replace. | Inspect the effective location and proxy_pass without a URI. |
| rewrite before proxy_pass | break can change URI handling, while last starts another location search. | Trace the rewrite and later location in the running configuration. |
| Variables or target arguments | Runtime values or argument-merging rules are missing from the static inputs. | Resolve the variables and observe the upstream request. |
| Encoded or normalization-sensitive path | NGINX location processing uses a normalized URI, which this page does not emulate. | Compare the normalized URI with an upstream request log. |

The [official proxy_pass documentation](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass) explains the URI replacement boundary. The [NGINX rewrite documentation](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite) covers the processing flags that need broader state.

## Verify the target in the running configuration

A calculated URL does not prove that NGINX selected this location or reached the intended backend. Inspect the effective configuration with `nginx -T`, then observe `$request_uri` at a controlled upstream or in its request log. For an unknown result, include the relevant rewrite, variable values, and later location search in that check. Entered calculator values stay in this browser.$stack127_nginx_proxy_pass_calculator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: punycode-converter
    (
      'punycode-converter',
      'Punycode converter: IDN to ASCII and back',
      $stack127_punycode_converter_intro$Convert a domain name between the readable form and the `xn--` form DNS actually carries, in either direction. You also get every character that is not plain ASCII listed with its code point, which is how you spot a name built to look like a different one. It runs entirely in your browser and nothing is sent anywhere.$stack127_punycode_converter_intro$,
      $stack127_punycode_converter_content$## What is punycode?

Punycode is a way of writing any Unicode text using only the characters DNS was built to carry: letters, digits and hyphens. Encoded names are marked with an `xn--` prefix so software knows to decode them.

So `münchen.de` travels across the internet as `xn--mnchen-3ya.de`. Same domain, two representations. Your browser converts back for display, which is why you rarely see the encoded form unless something goes looking for it.

## How do you convert punycode to a domain name?

Paste either form into the box. It detects which direction you need and shows both, along with a breakdown of every part of the name.

Paste `xn--mnchen-3ya.de` and you get `münchen.de`. Paste `münchen.de` and you get the encoded form. A full web address works too, the hostname is extracted and the rest ignored.

## Why do domain names have two forms?

DNS was designed in the early 1980s for a network that was almost entirely English, and it only carries a small set of ASCII characters. That was workable then and useless for most of the world.

Rather than change DNS everywhere at once, which was never going to happen, an encoding was defined that packs any Unicode text into the characters DNS already accepted. The result is that internationalised domain names work on infrastructure that has no idea they exist.

## What is a punycode phishing attack?

It is the reason this tool has a security use. Cyrillic а and Latin a look identical in almost every typeface, and they are entirely different characters. That means `аpple.com` with a Cyrillic first letter is a completely different domain from `apple.com`, available to register, and indistinguishable in a link.

These are called homograph attacks. Mixing writing systems inside one part of a name is the usual shape, so this tool flags that and lists the exact code points so you can see which character is doing the impersonating.

Be careful with the conclusion though. Plenty of legitimate names in multilingual regions mix scripts, and a name written entirely in Cyrillic is completely normal in a Cyrillic-speaking country. Mixed script is a reason to look closely, not a verdict.

## What will this not catch?

Lookalikes built from ordinary ASCII. `paypaI.com` with a capital i, or `rn` standing in for `m`, are pure Latin characters and no script check will ever flag them.

So a clean result here is not a clean bill of health. It means the name is not using the specific trick this tool detects. Reading the characters yourself is still worth doing.

Browsers also make their own decisions about when to display a name readably and when to show the raw `xn--` version. Those rules differ between Chrome, Firefox and Safari and change over time, so what your address bar shows may not match what is here.

## Why is my converted domain name too long?

Each part of a domain has a hard limit of 63 bytes, and encoding inflates things. A handful of non-ASCII characters can easily triple in length, so a name that looks short in its readable form can exceed the limit once encoded.

People hit this unexpectedly when registering, which is why the breakdown above shows the byte count for each part against the ceiling and colours it as you approach.

## Does punycode apply to the whole URL?

No, only the domain name. The path and query string of a URL use percent encoding, which is a completely different mechanism that produces things like `%20` for a space. If you paste a full address here, the hostname is taken and the rest is ignored.

## Related tools

If a link looks wrong, converting it here shows the real characters. From there, the [domain age checker](/domain-age) will tell you how recently the name was registered, which is often the more telling signal, and the [domain registration lookup](/domain-lookup) gives you the whole record.$stack127_punycode_converter_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: raid-calculator
    (
      'raid-calculator',
      'RAID capacity calculator for mixed drives and nested groups',
      $stack127_raid_calculator_intro$See theoretical usable capacity, what redundancy costs you, and how much space unequal drives strand. RAID 10, RAID 50, and RAID 60 show their exact groups because placement changes both capacity and what can fail. Everything is calculated in your browser.$stack127_raid_calculator_intro$,
      $stack127_raid_calculator_content$## Compare RAID levels

Capacity patterns use the smallest drive inside each striped or redundant group. The write column is the classic backend operation count for one small random write. It is not an IOPS forecast.

| Layout | Minimum drives | Theoretical usable | Guaranteed tolerance | Small random write |
| --- | --- | --- | --- | --- |
| RAID 0 | 2 | `N × smallest` | None | 1 |
| RAID 1 | 2 | `Smallest` | Any N - 1 | N mirror writes |
| RAID 5 | 3 | `(N - 1) × smallest` | Any 1 | 4 |
| RAID 6 | 4 | `(N - 2) × smallest` | Any 2 | 6 |
| RAID 10 | 4, even | `Sum of mirror pair minima` | Any 1 | 2 |
| RAID 50 | 6 | `Sum of RAID 5 groups` | Any 1 | 4 per group |
| RAID 60 | 8 | `Sum of RAID 6 groups` | Any 2 | 6 per group |
| Linear | 1 | `Sum of all drives` | None | 1 |
| JBOD | 1 | `Sum of all drives` | None in this model | 1 |

## The smallest drive sets the size of every group

Striped and parity layouts write fixed-width stripes across every drive at the same offset, so each drive can contribute only as much as the smallest one in its group holds. Pair a 4 TB drive with an 8 TB drive in a mirror and you get 4 TB of protected space. The other 4 TB stays visible above as size mismatch because it is real capacity you paid for and could recover by changing the layout or the drives.

Linear and JBOD are the exceptions. They concatenate members rather than striping across them, so every supplied byte counts.

Nested layouts apply the rule per group, not across the whole array. In RAID 10 each mirror pair is capped by its own smaller drive, so the order you enter drives changes the answer. Four drives of 4, 4, 8, and 8 TB give 12 TB when paired as 4 + 4 and 8 + 8, and 8 TB when paired as 4 + 8 and 4 + 8. RAID 50 and RAID 60 behave the same way inside each parity group.

Linux md can use unequal devices in RAID 0 with layout-specific remainder zones, and that behavior has changed across kernel versions. This calculator uses the portable smallest-member model rather than emulating those layouts.

## Failure tolerance belongs to the topology, not to one number

A single tolerance number hides the thing that matters in nested layouts. RAID 10 always survives one drive failure. It may survive one failure in every mirror pair, which on eight drives means four simultaneous failures. It never survives both members of the same pair. Those situations differ entirely because of which drives fail.

RAID 50 and RAID 60 work the same way one level up. Each RAID 5 group tolerates one failure, each RAID 6 group tolerates two, and the stripe across groups tolerates the loss of no complete group. Lose one group and the array is gone.

That is why the topology above is part of the result rather than decoration. A capacity figure without the grouping is only half the answer.

## The number stops before the filesystem starts

This is array-level theoretical capacity. It is the size of the block device the array presents before anything is written to it.

Not included: array metadata, partition alignment, filesystem metadata, reserved blocks, snapshots, and application-level allocation. On a NAS appliance, also account for the system partition and swap the operating system takes from every drive.

Also not included: rebuild time, IOPS, throughput, or the probability of data loss. Those depend on hardware, workload, and drive health. A capacity calculator that invents them would be guessing.

Drives are sold in decimal terabytes, where 1 TB is 1,000,000,000,000 bytes. Operating systems often report binary tebibytes, where 1 TiB is 1,099,511,627,776 bytes. That is where roughly 9% of the numerical difference appears before RAID takes any capacity. Use the result unit control to see both.

## Common RAID capacity questions

### Can I mix different drive sizes in RAID?

Yes, in every layout listed here. RAID 0, RAID 1, RAID 5, RAID 6, RAID 10, RAID 50, and RAID 60 cap every drive at the size of the smallest one in its group. Linear and JBOD use every byte but provide no array-level redundancy.

### How much usable space do four 4 TB drives give in RAID 5?

12 TB, which is about 10.91 TiB. One drive's worth of capacity holds parity so the array can rebuild after a single drive failure.

### Why does my array show less space than this calculator?

Decimal TB against binary TiB accounts for roughly 9% of the numerical difference. Filesystem metadata and reserved blocks come next, followed by array metadata and any system partitions. This page stops before those software-specific deductions.

### Does the order I enter drives matter?

For RAID 10, yes. Adjacent drives form mirror pairs, and each pair is capped by its smaller member. For RAID 50 and RAID 60, the order decides which drives share a parity group. The order is irrelevant for every other layout in this calculator.

### Should I use RAID 5 with large drives?

The concern is the rebuild window. After one drive fails, the remaining members must be read to reconstruct it, which can take many hours on high-capacity drives. A second drive failure during that window loses a RAID 5 array. RAID 6 can survive that second failure at the cost of one more drive's capacity.

### What is the difference between Linear and JBOD?

In this calculator, nothing. Both concatenate every member and return the sum of all drives with no array-level redundancy. Vendors use JBOD inconsistently, and some use it to mean passing drives through individually, so check what your implementation means.

### Is RAID a backup?

No. RAID keeps storage available through specific drive failures. Deletion, corruption written through to every copy, ransomware, theft, and fire still affect the array.

### Does this send my drive list anywhere?

The calculation runs in your browser without a separate calculation request. After you change an input, the versioned state is placed in the URL so the layout can be restored. Anyone you share that URL with can read the encoded drive sizes.$stack127_raid_calculator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: raidz-expansion-planner
    (
      'raidz-expansion-planner',
      'RAIDZ expansion planner',
      $stack127_raidz_expansion_planner_intro$Plan how one existing, never-expanded RAIDZ vdev changes as you add disks one at a time. Enter the current and final widths, smallest member size, current physical allocation, representative block size, and `ashift` to compare modeled capacity now, immediately after each step, and at fresh final-width geometry. Capacity reported by `zfs list` or `df` remains unknown.$stack127_raidz_expansion_planner_intro$,
      $stack127_raidz_expansion_planner_content$## Get the inputs from the vdev you are widening

Use the values for one RAIDZ vdev, not totals for the whole pool. The exact output depends on the physical space already allocated and on the block geometry you choose to represent the workload.

| Input | What to use |
| --- | --- |
| Current physical allocation | Run `zpool list -vp -o name,alloc` and use the exact `ALLOC` value for the RAIDZ vdev you plan to widen. |
| Member sizes | Use the smallest existing member and the size of each planned added disk. Capacity above the smallest member stays outside this model. |
| Representative block size | Use `recordsize` for a filesystem or `volblocksize` for a zvol. Choose a size that represents the data you care about. |
| `ashift` | Use the existing vdev's allocation sector shift. For example, `ashift=12` means 4 KiB sectors. |

## Why immediate capacity can be lower than a fresh vdev

RAIDZ expansion reflows allocated data across the wider device set, but it does not logically rewrite old blocks. Those blocks keep their original data-to-parity geometry, while blocks written after expansion use the wider geometry. A later rewrite can give data new block geometry, but OpenZFS warns that reported capacity can still remain pessimistic.

**Current** is the modeled envelope at the starting width. **Immediate** keeps old logical payload and uses the wider geometry for free physical space. **Fresh** models the whole final envelope at the final width. The **geometry gap** is the difference between fresh and immediate, not a prediction of `zfs list` or `df`.

## Check the pool before you widen the vdev

The result is a capacity plan, not a safety decision. Verify the real pool and your platform before attaching a disk.

| Check | Why it matters | Source |
| --- | --- | --- |
| Supported release | RAIDZ Expansion arrived in OpenZFS 2.3. Your platform may expose it later. | [2.3.0 release](https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0) |
| Feature available | Confirm the `org.openzfs:raidz_expansion` feature is supported. | [Feature reference](https://openzfs.github.io/openzfs-docs/man/master/7/zpool-features.7.html) |
| Healthy vdev | The target RAIDZ vdev must be healthy before expansion starts. | [Attach reference](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) |
| Current backup | Capacity math cannot verify your recovery path or hardware condition. | Operational check |
| Added disk size | The new disk must be at least as large as the smallest existing member. | [Attach reference](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) |
| Operation and parity | Each attach adds one disk. RAIDZ1, RAIDZ2, or RAIDZ3 does not change. | [Layout guide](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html) |

## What this model does not know

Version 1 assumes one current RAIDZ vdev that has never been expanded, followed by one-disk steps with no writes, deletes, or rewrites between them. It uses one representative block size. Real pools contain many block sizes, metadata, slop, fragmentation, compression, snapshots, and allocation history.

The planner does not inspect your system or predict live reporting, performance, duration, or failure risk. Calculation stays in this browser and does not store or send the inputs. Share deliberately puts the normalized configuration in the URL and copies that link. Use the [ZFS pool capacity calculator](/zfs-capacity-calculator) for a fresh whole-pool plan, or [check RAIDZ padding and block geometry](/zfs-padding-calculator) for one allocation.$stack127_raidz_expansion_planner_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: rebuild-calculator
    (
      'rebuild-calculator',
      'Rebuild window and read-error exposure calculator',
      $stack127_rebuild_calculator_intro$Estimate how long one simplified rebuild keeps an array degraded, how much source media it reads, and the modeled chance of a specified read error. Use standard RAID inputs. This is an exposure model, not a data-loss guarantee.$stack127_rebuild_calculator_intro$,
      $stack127_rebuild_calculator_content$## Choose inputs that match the rebuild

Use the capacity printed for one member and keep the decimal unit that matches it. Rebuild throughput is effective end-to-end speed, not the interface speed on a drive box. For the read-error input, use the nonrecoverable read-error specification from a drive datasheet such as the [Seagate IronWolf manual](https://www.seagate.com/www-content/product-content/ironwolf/en-us/docs/100818527d.pdf).

Full member is the default read scope for a generic rebuild. Choose a smaller scope only when your implementation really reads a smaller populated portion. The page cannot infer that behavior from the RAID level alone.

## Why layouts read different amounts

The model estimates the source members needed to reconstruct one failed member. It keeps that topology visible instead of hiding it inside a risk label.

| Layout | Modeled source read | Additional read errors |
| --- | --- | --- |
| RAID 1 and RAID 10 | 1 source member | 0 |
| RAID 5 | N - 1 source members | 0 |
| RAID 6 | N - 2 minimum | 1 |

RAID 6 uses a minimum reconstruction-read model of N - 2 full-member equivalents. A real implementation may read more. The [Intel RAID guide](https://cdrdv2-public.intel.com/840787/SWUG_full_featured_entry_RAID.pdf) and the [Fujitsu RAID whitepaper](https://www.fujitsu.com/us/imagesgig5/Storage-RAID-Fast-Recovery-whitepaper.pdf) explain why parity and mirror rebuilds do not have the same read pattern.

## Read the result as exposure, not a verdict

The total degraded window adds replacement delay to copy time. Source media read is the work used for the time estimate, while modeled read-error exposure is the chance of at least one specified read error in that work.

The percentage uses a simple independent per-bit model. Read-error tolerance is a separate parity margin. Neither value is data-loss probability, rebuild-success probability, or a guarantee about a controller.

## What this model leaves out

This page models one failed member and one rebuild. It does not model a second failure arriving during the window, AFR, MTTDL, fleet correlation, filesystem behavior, controller scheduling, mixed drive sizes, or a drive recommendation.

## Verify the live rebuild next

Compare the entered throughput and read scope with the controller or filesystem status while the array is degraded. The [Intel degraded-array guidance](https://www.intel.com/content/www/us/en/support/articles/000024286/server-products/server-boards.html) is a useful starting point. This calculation runs only in this browser. Inputs are not stored or put in the URL. For adjacent planning, use the [RAID capacity calculator](/raid-calculator) or the [ZFS capacity calculator](/zfs-capacity-calculator).$stack127_rebuild_calculator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: shortcuts-cheatsheet-generator
    (
      'shortcuts-cheatsheet-generator',
      'Keyboard shortcuts cheat sheet generator for your daily tools',
      $stack127_shortcuts_cheatsheet_generator_intro$Build one printable page from the shortcuts you actually use. Choose your apps, keep the platform you work on, and trim the groups until the sheet fits the work in front of you.

The preview is the thing you will print. Each app keeps its name and each group keeps its task heading, so a key such as Ctrl+P still makes sense when several apps share the same paper.$stack127_shortcuts_cheatsheet_generator_intro$,
      $stack127_shortcuts_cheatsheet_generator_content$## Build a sheet for the work you actually do

A useful cheat sheet is smaller than the reference it came from. Pick the apps that share your desk, keep the platform you are using, and remove groups that belong to a job you do not do. A focused page has a chance of staying beside the keyboard instead of becoming another document you never open.

If you move between a terminal, an editor, and a browser, make one sheet for that loop. If you are learning one app, select only its groups and give yourself a page you can glance at without hunting through unrelated commands.

## Choose the platform before you print

Windows, macOS, and Linux often share the action but change the modifier. Keep all platforms when the sheet is for a shared desk or a team. Choose one platform when you want a quieter page and know which keyboard will be in front of you.

Some applications also use terminal settings, editor modes, or custom keymaps. The sheet keeps the documented default rows from this reference. It does not rewrite them for a personal binding file.

## Read the paper as a task list

Each app keeps its own name and each group keeps its task heading. That matters when several apps share keys such as Ctrl+P or Cmd+K. The action beside the keys tells you which app context gives the combination its meaning.

The live preview is the document that prints. If you remove an app, platform, or group, the count and the paper change with it. Groups that have no shortcut for the selected platform disappear from the sheet rather than leaving an empty heading behind.

## What this sheet does not promise

This generator does not discover shortcuts from your installed apps, inspect custom bindings, or turn undocumented actions into guesses. It prints the rows in the stack127 keyboard reference for the choices you made. For a full app page, including notes about modes and sequences, use the [keyboard shortcuts directory](/keyboard-shortcuts).

## Keep the first version deliberately short

Start with the keys that remove a repeated interruption today. When those become ordinary, make a second sheet or add another group. The point is to put the next useful action near your hand, not to turn every documented shortcut into homework.

Your selections stay in this browser while you build the sheet. Printing uses the browser's own print dialog, so the final paper follows the page you can see here.$stack127_shortcuts_cheatsheet_generator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: shr-calculator
    (
      'shr-calculator',
      'Synology SHR capacity calculator for mixed drives',
      $stack127_shr_calculator_intro$Enter individual drive capacities, choose SHR-1 or SHR-2, and get an estimated fresh-pool capacity with protection and unused tiers kept separate. Inputs stay in your browser; this page does not model expansion history or filesystem free space.$stack127_shr_calculator_intro$,
      $stack127_shr_calculator_content$## Read the capacity bands

Mixed drive sizes create separate capacity bands. The table shows how many drives reach each band and splits it into data, protection, or unused space. In SHR-2, a higher band reached by too few drives cannot form two protection slices, so it stays unused. The modeled system reserve is separate from both protection and unused space.

## Treat this as a fresh-pool estimate

The calculator converts each entry to exact bytes and models a new pool. It does not predict filesystem metadata, snapshots, quotas, fragmentation, rebuild state, expansion history, or application-visible free space. Synology's [RAID calculator](https://www.synology.com/en-uk/support/RAID_calculator) notes an approximate 10 GB system and swap reservation per drive; this page keeps that reserve separate and does not add a filesystem deduction.

## Verify the layout before you build

Use the marketed capacity printed for each intended drive, then compare the chosen mode and unit with the target NAS and [Synology's RAID guidance](https://kb.synology.com/en-uk/DSM/tutorial/What_RAID_type_is_best_for_my_storage). If your question is conventional RAID rather than SHR, use the [RAID calculator](/raid-calculator). The calculator stays in your browser. The URL stays clean until you choose Share, which puts the mode and drive capacities into a shareable URL. That URL is not a secret. For another storage planning task, [browse the storage tools](/storage-tools).$stack127_shr_calculator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: snapraid-mergerfs-planner
    (
      'snapraid-mergerfs-planner',
      'SnapRAID and mergerfs config planner',
      $stack127_snapraid_mergerfs_planner_intro$Enter data, parity, content, and pool paths to generate a reviewable `snapraid.conf` and matching mergerfs `/etc/fstab` line. The checks run in this browser and do not inspect or change your host.$stack127_snapraid_mergerfs_planner_intro$,
      $stack127_snapraid_mergerfs_planner_content$## Keep parity outside the pool

SnapRAID and mergerfs can use the same data mount paths, but they solve different problems. SnapRAID records parity and content metadata for independent disks. mergerfs presents selected branches as one pool. The generated fstab line contains data mounts only, so a parity mount cannot become a storage branch by accident.

| Layer | Role | Planner input | Boundary |
| --- | --- | --- | --- |
| SnapRAID | Parity and content metadata | Data mounts, parity mounts, and content paths | Not a live pooled mount |
| mergerfs | One path over selected branches | The ordered data mounts | Not parity or backup |

## Choose paths and verify boundaries

Use the mount roots and content locations that exist on the real host. The planner can compare path relationships and capacities, but it cannot know physical disk separation, current mounts, permissions, installed versions, filesystem health, recovery state, or whether the layout is a backup.

1. Use `findmnt` and `lsblk` to confirm mount paths and physical disk boundaries.
2. Compare the selected blocksize, excludes, and mergerfs policy with the installed manuals. Check whether FUSE permits `allow_other`.
3. Review permissions and the backup plan before saving either file under `/etc` or starting a first sync.

## What happens to entered paths?

The calculation stays in this browser. This tool does not save or send entered paths, serialize them into the URL, inspect a SnapRAID daemon, or run host commands. For syntax and option details, compare the result with the [SnapRAID manpage](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html) and [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/), then read the site [privacy notes](/privacy).$stack127_snapraid_mergerfs_planner_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: soa-checker
    (
      'soa-checker',
      'SOA Consistency Checker: compare zone serials across nameservers',
      $stack127_soa_checker_intro$A zone can be answered by several nameservers, and they are all supposed to hold the same copy of your DNS. This tool asks every one of them for the zone's SOA record, then lines the replies up so you can see if any server is out of date. SOA stands for Start of Authority: it is the single record that carries a zone's version number and its timing settings.$stack127_soa_checker_intro$,
      $stack127_soa_checker_content$## How the comparison works

Type a domain or hostname and run the check. We find the authoritative zone it belongs to, look up every nameserver's address, and ask each address directly for its SOA record. When a server answers the same way over IPv4 and IPv6, we keep those together in one row. When a server hands back a different serial or a different timing value, it gets its own row so the odd one out stands out.

> `Your zone` → `ns1` → `ns2` → `Compare SOA`
>
> Every nameserver for the zone is asked the same question, and the answers are compared side by side.

## What the serial tells you

Think of the serial as a version number for your zone. Every time you change your DNS, it should go up. When two nameservers show the same serial, they are almost certainly holding the same copy of your records. When the numbers differ, one server is behind, and the higher serial is the one a healthy secondary should catch up to.

One catch: a smaller number is not always the older one. Serials are counters that roll back to zero after they reach 4,294,967,295, so a server that just wrapped can show a low number while actually being newest. To handle that, this page compares serials with DNS serial arithmetic rather than treating them as plain numbers.

## What each SOA value means

| Field | Meaning |
| --- | --- |
| Primary | The nameserver listed as the original source of the zone, the one every other server copies from. |
| Mailbox | The contact for the zone, written as a DNS name. Read the first dot as the `@` in an email address, so `admin.example.com` means `admin@example.com`. |
| Refresh | How often a secondary checks with the primary to see if anything changed. |
| Retry | How long a secondary waits before trying again after a failed check. |
| Expire | How long a secondary keeps serving its copy while it cannot reach the primary at all, before it gives up. |
| Negative cache | How long a resolver is allowed to remember that a name does not exist. It is the lower of the SOA TTL and the MINIMUM value. |

## When a mismatch is worth worrying about

A brief difference is normal. It usually just means a change is still spreading from the primary to the secondaries and has not landed everywhere yet. What deserves a closer look is a mismatch that outlasts the refresh and retry schedule, since by then every server should have caught up. If one is stuck, check whether it can reach the primary, whether zone transfers are allowed to it, and whether it is still meant to serve the zone at all. There is no single correct timing value, so this tool just shows you what differs instead of handing out a made-up grade.$stack127_soa_checker_content$,
      '1.0.0',
      'https://github.com/stack127labs/dns-tools'
    ),
    -- tool-slug: storage-growth-planner
    (
      'storage-growth-planner',
      'Storage Growth and TCO Planner',
      $stack127_storage_growth_planner_intro$Plan a local storage purchase against your data growth and cost assumptions. The planner shows capacity after reserve, the first shortfall year, and a modeled total cost; it is not installed filesystem free space.$stack127_storage_growth_planner_intro$,
      $stack127_storage_growth_planner_content$## Choose inputs that match your homelab

Use a measured average draw for the complete system, not drive watts alone. Enter the data you have today, an annual growth assumption, and a reserve you do not want to fill. Mirror, single parity, and dual parity are equal-drive planning models, so the route rejects impossible member counts.

Drive and enclosure prices, electricity rate, replacement reserve, and backup budget are your assumptions. Growth compounds once per year. Seasonal bursts, changing growth rates, and live hardware prices are outside this version.

## Know what this model leaves out

The result is not installed filesystem free space, a reliability forecast, a performance estimate, or financial advice. It does not prove a backup exists or restores. Array redundancy is not an independent backup, and the model does not include labor, cooling, tax, migration, cloud retrieval, or currency conversion.

## Verify the plan before buying

Use the estimate to choose a capacity envelope, then check technology-specific behavior in the [ZFS capacity calculator](/zfs-capacity-calculator) and the [ZFS padding calculator](/zfs-padding-calculator). Before relying on the plan, verify an independent backup copy and a real restore path using the [CISA backup guidance](https://www.cisa.gov/stopransomware/back-up-business-data).$stack127_storage_growth_planner_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: storage-layout-advisor
    (
      'storage-layout-advisor',
      'Storage layout advisor',
      $stack127_storage_layout_advisor_intro$Compare layouts from the drives you have, a minimum protected-failure target, and a workload preference. The result is a theoretical capacity and topology model, not live filesystem space or a guarantee about a running array.$stack127_storage_layout_advisor_intro$,
      $stack127_storage_layout_advisor_content$## Choose inputs that represent the array

Use the actual member drives you are planning to place in one array or pool. Keep mixed sizes in the order you expect to group them, because the striped-mirror model pairs rows in entered order and reports any capacity that cannot be used. Keep TB and TiB distinct: they represent different byte quantities even when the label looks similar.

Set the protected-failure target from the recovery plan you need to satisfy, then use the workload choice as a stated tradeoff preference. It changes the fit rubric and ranking, not the byte arithmetic, failure tolerance, or a forecast of speed.

## Read the answer as a bounded layout model

Every eligible row starts with the raw bytes in the inventory and accounts separately for usable space, redundancy, and mixed-size mismatch. Those terms reconcile exactly for the modeled layout. The topology shows the group or vdev boundary that makes a nominal failure tolerance meaningful.

“Best fit” means the selected target and workload rubric produced the highest-ranked eligible tradeoff. It is not a universal safety, performance, backup, or health guarantee. The model does not inspect partitions, filesystem metadata, snapshots, compression, allocation history, rebuild behavior, or live expansion support.

## Verify the platform before building

Before creating storage, check the running platform's supported layout names, minimum width, failure boundary, expansion path, and recovery procedure. Compare the result with the [Linux MD documentation](https://docs.kernel.org/admin-guide/md.html) or the OpenZFS [RAIDZ](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) and [vdev](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) references before treating a layout label as equivalent on your system.

Calculation stays in this browser and the tool does not write inputs to local storage or send them to an upstream calculator. Sharing is explicit: it places the normalized choices in the URL, so anyone with that link can read them. For the next check, use the [ZFS capacity calculator](/zfs-capacity-calculator) for a detailed ZFS model or the [RAIDZ expansion planner](/raidz-expansion-planner) for a separate expansion question.$stack127_storage_layout_advisor_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: transfer-readiness
    (
      'transfer-readiness',
      'Domain transfer readiness: can this domain be transferred?',
      $stack127_transfer_readiness_intro$Check whether a domain can move to another registrar right now, and if not, what is stopping it. The answer is spread across status codes, dates and ICANN policy, so this pulls it together into a list of what is blocking you, separates the locks you can remove yourself from the ones you cannot, and is straight about the parts no public tool can see.$stack127_transfer_readiness_intro$,
      $stack127_transfer_readiness_content$## How does a domain transfer work?

Five steps, and most of the pain is in the first two.

1. Unlock the domain at your current registrar.
2. Get the authorization code, sometimes called an EPP code or auth code.
3. Start the transfer at the registrar you are moving to and pay for it.
4. Approve the confirmation email sent to the registrant address on record.
5. Wait. Registries allow the losing registrar up to five days to respond.

A transfer normally includes a year's renewal in the price, so the expiry date moves forward rather than resetting to today.

## Why is my domain transfer blocked?

Usually one of four things, and the check above tells you which. The important split is between locks your registrar set and locks the registry set, because that decides whether this takes two minutes or two weeks.

| Field | Meaning |
| --- | --- |
| `clientTransferProhibited` | Your registrar's standard lock. It is on most domains by default, it is good for security, and there is a switch in your account that turns it off. |
| `serverTransferProhibited` | The registry set this. A dispute, a court order, registry policy, or a high-security lock you may have requested yourself. You cannot remove it and your registrar has to find out why. |
| Recently registered | ICANN policy locks a newly registered domain against transfer for a period. Currently 60 days. |
| Recently transferred | The same lock applies after each move between registrars. |

## What is the 60 day transfer lock?

ICANN policy stops a domain being transferred for 60 days after it is first registered, and again for 60 days after each transfer between registrars. There is also a lock after a change of registrant, which no public tool can see because registrant changes are not published anywhere.

This is currently changing. The GNSO Council approved a reform on 12 March 2025 and the ICANN Board adopted it on 7 June 2026, shortening the locks to 30 days and removing the change of registrant lock entirely. It has not taken effect yet: an implementation review team has to draft the policy language first, and no effective date has been published. The check above uses the rule genuinely in force today, and it will not print a specific future date on which a lock lifts, because registrars measure the clock from different starting points and the policy is mid-change.

## Will transferring a domain take my site down?

It can, in two specific ways, and both are avoidable if you know about them beforehand. This is the part people find out afterwards.

**DNS hosting.** A transfer moves the registration, not your DNS. If your current registrar is also serving your zone, those records can disappear when the domain leaves, and the website and email go with them. Move DNS to its new home first, confirm it is answering, then transfer.

**DNSSEC.** If the domain is signed, the DS record has to be handled at both ends. Getting it wrong means the domain stops resolving entirely for anyone using a validating resolver, which is a total outage rather than a partial one. Check the state of the chain with the [DNSSEC chain checker](/dnssec-checker) before you start.

## What can this check not see?

Everything that lives in your registrar account rather than the public record, and any one of these can stop a transfer even when the checks above all pass.

- Whether you can actually get the authorization code.
- Whether the registrant email still works. Approval goes there, and an abandoned address is the single most common reason a transfer stalls.
- Unpaid balances or unverified contact details on the account.
- Whether a change of registrant happened recently.

Before starting a transfer, check the registrant email on file is one you can read. That one thing prevents most failed transfers.

## Do country domains transfer the same way?

No. Everything above is ICANN policy for generic endings. `.uk`, `.de` and `.nl` each run their own process with their own authorization mechanism and timings, and none of the locks described here apply to them.

For those, the registry's own documentation is the source worth reading. `.uk` transfers work by changing a tag rather than using an auth code, which surprises people coming from `.com`.

## Related tools

The [status codes reference](/epp-status-codes) explains every lock in full. The [registrar lookup](/domain-registrar) gives you contact details for the registrar you are leaving, and the [domain registration lookup](/domain-lookup) shows the whole record.$stack127_transfer_readiness_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: unraid-calculator
    (
      'unraid-calculator',
      'Unraid Main Array calculator',
      $stack127_unraid_calculator_intro$Plan a Main Array for a homelab from explicit parity and data roles you already know, then see array-level data capacity and one future drive's parity boundary. Filesystem-visible space remains unknown, and the calculator stops at that planning boundary.$stack127_unraid_calculator_intro$,
      $stack127_unraid_calculator_content$## Read the headline as array-level data capacity, not filesystem free space

The headline is a planning envelope from the current data roles you entered. It sums those data drives and keeps parity and raw installed capacity visible in the accounting below; TB or TiB changes display units, not the underlying bytes. It does not estimate filesystem-visible free space.

### Protection modes

| Mode | Failure boundary | Capacity rule |
| --- | --- | --- |
| No parity | No modeled drive-failure protection | Data roles stay visible without a parity ceiling |
| Single parity | One drive under this model | Parity must meet the largest data drive |
| Dual parity | Two drives under this model | Both parity roles must meet the largest data drive |

## Verify a planned disk change in the official Unraid docs

A blocked future drive is above the current parity ceiling, so this page names the undersized parity roles but does not perform a parity swap or rebuild. Check the official [Unraid adding-disks guide](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/) and [replacing-disks guide](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/) before making an operational change; for another storage model, use the [RAID capacity calculator](/raid-calculator), [ZFS capacity calculator](/zfs-capacity-calculator), or [RAIDZ expansion planner](/raidz-expansion-planner).

## The model leaves filesystem and operational space unknown

This array-level model excludes filesystem metadata, partition alignment, system and swap reservations, cache pools, share allocation, free-space policies, snapshots, application behavior, and performance. Parity is redundancy for the documented failure boundary, but parity is not a backup, and the result does not prove what an installed system will report.

## Your drive list stays in the browser

Local calculation is synchronous: entering roles and calculating does not send a request or write the drive list to browser storage. Sharing is explicit, and a share URL contains the normalized capacities and roles, so anyone with that link can read the configuration.$stack127_unraid_calculator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: zfs-capacity-calculator
    (
      'zfs-capacity-calculator',
      'ZFS pool capacity calculator for mixed vdevs',
      $stack127_zfs_capacity_calculator_intro$Plan a fresh OpenZFS pool one top-level vdev at a time. Add equal drives quickly, edit any drive for mixed sizes, and see estimated writable capacity, planning headroom, per-vdev failure boundaries, and every modeled loss. The calculation stays in your browser and does not predict the exact free space of an installed or expanded pool.$stack127_zfs_capacity_calculator_intro$,
      $stack127_zfs_capacity_calculator_content$## Each vdev is its own failure boundary

A ZFS pool can combine several top-level vdevs, but each vdev keeps its own capacity and redundancy rules. A six-drive RAIDZ2 and a two-drive mirror should not be flattened into one generic disk group. The calculator models them separately, then adds their data contributions. Losing a complete top-level vdev can still lose the pool. Read the official [OpenZFS vdev overview](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) before choosing a production topology.

| Layout | Minimum drives | Per-vdev tolerance |
| --- | --- | --- |
| Mirror | 2 | Any members except the last copy |
| RAIDZ1 | 2 | 1 drive |
| RAIDZ2 | 3 | 2 drives |
| RAIDZ3 | 4 | 3 drives |

## What the estimate includes

Every capacity is converted to exact bytes. The result shows mixed-size waste, mirror or parity cost, block allocation losses, OpenZFS slop, estimated writable capacity, and your separate planning target. Auxiliary devices remain inventory because they do not normally add general data capacity.

| Role | What it does | General data |
| --- | --- | --- |
| Spare | Waits to replace a failed member | No |
| SLOG | Holds the separate intent log | No |
| L2ARC | Caches reads | No |
| Special | Stores selected block classes | Separate envelope |

## Why ashift and block size change RAIDZ capacity

`ashift` sets the physical allocation sector size. `recordsize` applies to filesystems, while `volblocksize` applies to zvols. RAIDZ divides each selected logical block into sectors, adds parity, and rounds the allocation. Smaller blocks can therefore use a different proportion of the pool. The result models every block at the one size you select, not the varied block mix of a real workload. See the [OpenZFS RAIDZ allocation guide](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html).

## Slop and planning headroom are different

Slop is capacity OpenZFS keeps unavailable for normal allocation so important operations can continue near a full pool. The default model uses a 1/32 shift with the documented floor and cap. Planning headroom is the extra percentage you choose not to fill. It changes the planning target, not estimated writable capacity. The [OpenZFS module parameter reference](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html#spa-slop-shift) describes the slop setting.

## Why an installed pool can show less free space

This is a fresh-pool planning estimate, not a promise for `zpool list`, `zfs list`, TrueNAS, or another appliance. Partitioning, labels, metadata, fragmentation, snapshots, reservations, real block sizes, and allocation history can all change reported space. Previously expanded RAIDZ vdevs also keep historical allocation behavior. Use the generated `zpool create -n` command as a review aid only, then trust the values reported by the real pool after creation.$stack127_zfs_capacity_calculator_content$,
      '1.0.0',
      null
    ),
    -- tool-slug: zfs-padding-calculator
    (
      'zfs-padding-calculator',
      'ZFS block size and padding calculator',
      $stack127_zfs_padding_calculator_intro$See how one uncompressed ZFS block is split into data, parity, sector rounding, and padding on a RAIDZ vdev. Compare block sizes and inspect the exact theoretical allocation before changing `recordsize` or `volblocksize`.$stack127_zfs_padding_calculator_intro$,
      $stack127_zfs_padding_calculator_content$## What each option changes

The calculator needs five details about the block and the RAIDZ vdev that will store it.

| Option | What it means |
| --- | --- |
| RAIDZ level | RAIDZ1, RAIDZ2, or RAIDZ3. The number tells you how many parity sectors each stripe row needs. |
| Vdev width | The total number of drives in this RAIDZ vdev. |
| Workload | Choose a filesystem dataset or a zvol. This decides whether the block setting is called `recordsize` or `volblocksize`. |
| Block size | The logical size of the one block being tested. |
| `ashift` | The physical sector size ZFS uses for allocation. For example, `ashift=12` means 4 KiB sectors. |

## `recordsize` and `volblocksize` describe different blocks

`recordsize` is the largest block ZFS normally uses for file data in a dataset. A small file or the end of a file can use a smaller block. `volblocksize` is the block size used by a zvol. The calculator changes the name and valid range when you switch between these workloads.

## Why an 8 KiB block can occupy 24 KiB

Consider a six-drive RAIDZ2 vdev with `ashift=12`. Each sector is 4 KiB, so an 8 KiB logical block starts as two data sectors. RAIDZ2 adds two parity sectors, then ZFS adds two padding sectors to complete the allocation.

| Part | Sectors | Space |
| --- | --- | --- |
| Logical data | 2 | 8 KiB |
| Sector rounding | 0 | 0 B |
| Parity | 2 | 8 KiB |
| Padding | 2 | 8 KiB |
| Physical allocation | 6 | 24 KiB |

## Space efficiency is not a performance recommendation

A block size can use space efficiently in this calculation and still be a poor fit for your workload. Block size also affects reads, writes, compression opportunities, and how an application accesses data. Use the result to understand allocation, not as a universal setting for every system.

## What this calculator leaves out

This is a theoretical calculation for one uncompressed block on one RAIDZ vdev. It does not calculate:

- Compression, deduplication, or extra copies.
- Metadata, snapshots, reservations, slop space, or fragmentation.
- Special vdevs, dRAID, gang blocks, or expansion history.
- Whole-pool capacity, real free space, or storage performance.

## Your calculation stays in your browser

Typing values and calculating do not send your configuration to a server. Copy and share actions use the result only when you choose them. A shared link includes the configuration in its URL.

## Need whole-pool capacity?

Use the [ZFS pool capacity calculator](/zfs-capacity-calculator) to combine top-level vdevs and estimate writable space, redundancy, slop, and planning headroom.$stack127_zfs_padding_calculator_content$,
      '1.0.0',
      null
    )
)
insert into public.stack127_tool_pages (
  page_id,
  title,
  intro_markdown,
  content_markdown,
  content_revision,
  tool_version,
  tool_version_updated_at,
  stack127_repo_url
)
select
  page.id,
  content.title,
  content.intro_markdown,
  content.content_markdown,
  1,
  content.tool_version,
  '2026-09-02T00:00:00+05:30'::timestamptz,
  content.stack127_repo_url
from tool_content content
join public.stack127_pages page on page.slug = content.slug
where page.page_family = 'tool';
