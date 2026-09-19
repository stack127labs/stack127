with tool_registry_rows(slug, label, meta_title, meta_description) as (
  values
    (
      'restic-retention-simulator',
      'Restic retention simulator',
      'Restic retention simulator | stack127',
      'Preview which restic snapshots retention rules keep, with bucket and grouping reasons.'
    ),
    (
      'rsync-filter-tester',
      'Rsync filter tester',
      'Rsync filter tester | stack127',
      'Test rsync include and exclude rules against sample paths and see the winning line.'
    ),
    (
      'mqtt-discovery-checker',
      'Home Assistant MQTT discovery checker',
      'Home Assistant MQTT discovery checker | stack127',
      'Check Home Assistant MQTT discovery topics and JSON payloads with field-level findings.'
    ),
    (
      'lxc-idmap-checker',
      'LXC ID mapping checker',
      'LXC ID mapping checker | stack127',
      'Check LXC UID and GID mappings, overlaps, gaps, and subordinate grant coverage.'
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
  'tool',
  false,
  null,
  null,
  'WebApplication',
  0.50
from tool_registry_rows row
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  page_family = excluded.page_family,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority;

with tool_content(slug, title, intro_markdown, content_markdown, tool_version) as (
  values
    (
      'restic-retention-simulator',
      'Restic retention simulator',
      $stack127_restic_intro$Paste restic snapshot JSON, choose retention rules and a grouping key, and preview which snapshots would stay. The simulator runs in your browser and explains every keep or prune decision without opening a repository.$stack127_restic_intro$,
      $stack127_restic_content$## Read the retention preview

`keep-last` chooses the newest snapshots in each group. Daily, weekly, monthly, and yearly rules choose the newest snapshot in each calendar bucket using the selected timezone. When a calendar rule asks for more periods than the snapshot history contains, restic also preserves the oldest snapshot in that group.

Grouping matters because each host, path set, or tag set gets its own retention choices. The table shows the normalized snapshot time, its exact group, and every rule that kept it.

## What this simulator checks

The model covers `keep-last`, `keep-daily`, `keep-weekly`, `keep-monthly`, and `keep-yearly` for supplied snapshot metadata. It does not connect to a repository, delete data, or model `keep-within` rules. Compare a result with the [restic forget documentation](https://restic.readthedocs.io/en/stable/060_forget.html) before changing a live policy.

For related planning, browse [storage tools](/storage-tools) or check a broader [3-2-1 backup plan](/backup-321-calculator).$stack127_restic_content$,
      '1.0.0'
    ),
    (
      'rsync-filter-tester',
      'Rsync filter tester',
      $stack127_rsync_intro$Paste ordered rsync filter rules and representative paths to see which rule wins. The tester runs locally and distinguishes included, excluded, and unvisited paths before you run a transfer.$stack127_rsync_intro$,
      $stack127_rsync_content$## Read the path trace

Rsync checks filter rules in order, so the first matching rule decides a path. A single `*` stays within one path segment, `**` can cross directories, and a trailing slash limits a pattern to directories. If a parent directory is excluded, supplied children are marked unvisited because rsync would not descend into that parent.

## Supported filter subset

This checker supports ordered `+` and `-` rules, `!` resets, `*`, `**`, `?`, anchored paths, directory-only patterns, and an explicit default for unmatched paths. It rejects rule modifiers and character classes instead of guessing at syntax it does not model.

Use the [rsync filter rules manual](https://rsync.samba.org/ftp/rsync/rsync.1) for merge files, perishable rules, sender or receiver modifiers, and filesystem behavior. You can also browse [storage tools](/storage-tools) or review a [3-2-1 backup plan](/backup-321-calculator).$stack127_rsync_content$,
      '1.0.0'
    ),
    (
      'mqtt-discovery-checker',
      'Home Assistant MQTT discovery checker',
      $stack127_mqtt_intro$Paste a Home Assistant MQTT discovery topic and JSON payload to catch structural errors before publishing it. The checker runs in your browser and separates blocking errors from fields that still need component-specific review.$stack127_mqtt_intro$,
      $stack127_mqtt_content$## Read the discovery result

The topic check verifies the discovery prefix, supported component, optional node ID, object ID, and final `config` segment. The payload check accepts common Home Assistant abbreviations, verifies identity and device metadata, and checks required state or command topics for the covered sensor, binary sensor, and button profiles.

A partial result means the topic and common fields are usable, but this version does not claim full validation for that component. The checker also rejects JSON integers that JavaScript cannot preserve exactly.

## What this result cannot prove

This is a static check. It does not connect to an MQTT broker, inspect retained messages, test templates, confirm entity creation, or replace the [Home Assistant MQTT integration documentation](https://www.home-assistant.io/integrations/mqtt/).

Browse the [self-hosted app directory](/self-host-apps) for adjacent home automation software, and read the [privacy policy](/privacy) for the site's data boundary.$stack127_mqtt_content$,
      '1.0.0'
    ),
    (
      'lxc-idmap-checker',
      'LXC ID mapping checker',
      $stack127_lxc_intro$Paste LXC UID and GID map lines, add the matching subordinate grants when you have them, and query one container ID. The checker shows the host ID, range boundaries, overlap problems, and whether one grant covers the complete matched range.$stack127_lxc_intro$,
      $stack127_lxc_content$## Read the mapping result

An ID maps by offset: host start plus the queried container ID's distance from the container start. The checker validates container-side and host-side overlaps, gaps, zero lengths, and the usable Linux ID range before doing that arithmetic.

UID and GID grants are checked independently for the named owner. A covered result means one supplied grant contains the full matched host range. A missing result means the map arithmetic works but the supplied grant data does not cover that range.

## What a static check leaves out

The checker does not read `/etc/subuid`, `/etc/subgid`, LXC configuration, bind mounts, ACLs, or current kernel state. Confirm the final configuration against the [LXC idmap reference](https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html) and the [subuid manual](https://man7.org/linux/man-pages/man5/subuid.5.html).

For related setup guidance, start with [self-hosting for beginners](/self-hosting-for-beginners) or browse the [self-hosted app directory](/self-host-apps).$stack127_lxc_content$,
      '1.0.0'
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
  '2026-09-16T00:00:00+05:30'::timestamptz,
  null
from tool_content content
join public.stack127_pages page on page.slug = content.slug
where page.page_family = 'tool'
on conflict (page_id) do nothing;
