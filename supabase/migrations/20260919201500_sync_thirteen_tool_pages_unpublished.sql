-- Sync the 13 audited tool pages from the reviewed development state.
-- This release deliberately keeps every route unpublished. Publication is a
-- separate migration after the deployed code and production rows are verified.

with tool_registry_rows(
  slug, label, meta_title, meta_description, page_type, sitemap_priority
) as (
  values
    (
      'backup-321-calculator',
      'backup 3-2-1 calculator',
      '3-2-1 backup capacity calculator | stack127',
      $stack127_0_description$Estimate local and off-site backup capacity from protected data, growth, retention, and recovery goals.$stack127_0_description$,
      'WebApplication',
      0.50
    ),
    (
      'docker-compose-checker',
      'Docker Compose checker',
      'Docker Compose checker',
      $stack127_1_description$Check one pasted Compose file for YAML, Compose structure, and static clues.$stack127_1_description$,
      'WebApplication',
      0.50
    ),
    (
      'ip-asn-lookup',
      'IP and ASN lookup',
      'IP and ASN registration lookup',
      $stack127_2_description$Look up the RIR record for a public IP or ASN, with source-labeled BGP context when available. Registration is not geolocation or reputation.$stack127_2_description$,
      'WebApplication',
      0.50
    ),
    (
      'self-hosted-app-resource-planner',
      'self-hosted app resource planner',
      'Self-hosted app resource planner: estimate RAM and storage',
      $stack127_3_description$Plan RAM and storage for a self-hosted app mix with reviewed ranges, headroom, custom rows, and explicit unknowns. No runtime guarantee.$stack127_3_description$,
      'WebApplication',
      0.50
    ),
    (
      'restic-retention-simulator',
      'Restic retention simulator',
      'Restic retention simulator | stack127',
      $stack127_4_description$Preview which restic snapshots retention rules keep, with bucket and grouping reasons.$stack127_4_description$,
      'WebApplication',
      0.50
    ),
    (
      'rsync-filter-tester',
      'Rsync filter tester',
      'Rsync filter tester | stack127',
      $stack127_5_description$Test rsync include and exclude rules against sample paths and see the winning line.$stack127_5_description$,
      'WebApplication',
      0.50
    ),
    (
      'mqtt-discovery-checker',
      'Home Assistant MQTT discovery checker',
      'Home Assistant MQTT discovery checker | stack127',
      $stack127_6_description$Check Home Assistant MQTT discovery topics and JSON payloads with field-level findings.$stack127_6_description$,
      'WebApplication',
      0.50
    ),
    (
      'lxc-idmap-checker',
      'LXC ID mapping checker',
      'LXC ID mapping checker | stack127',
      $stack127_7_description$Check LXC UID and GID mappings, overlaps, gaps, and subordinate grant coverage.$stack127_7_description$,
      'WebApplication',
      0.50
    ),
    (
      'kdp-book-setup-calculator',
      'KDP book setup calculator',
      'KDP book setup calculator for cover size, spine, and margins',
      $stack127_8_description$Calculate KDP paperback or hardcover page, margin, spine, and full cover dimensions in inches, millimeters, and pixels. Paperback results use published inputs; hardcover results are estimates to confirm with KDP.$stack127_8_description$,
      'WebApplication',
      0.50
    ),
    (
      'kdp-metadata-checker',
      'KDP metadata checker',
      'KDP metadata checker: review title, description, and keywords',
      $stack127_9_description$Check a KDP title, subtitle, description, and seven keyword fields for documented formatting issues and local review prompts. A clean result is not KDP acceptance.$stack127_9_description$,
      'WebApplication',
      0.50
    ),
    (
      'kdp-royalty-calculator',
      'KDP royalty calculator',
      'KDP royalty calculator for US print books and eBooks',
      $stack127_10_description$Estimate US KDP royalty per sale for a paperback, hardcover, or eBook. Compare rate bands, printing or delivery costs, price floors, ad headroom, and monthly copies. Local estimate, not KDP acceptance.$stack127_10_description$,
      'WebApplication',
      0.50
    ),
    (
      'kdp-pdf-preflight-checker',
      'KDP PDF preflight checker',
      'KDP PDF preflight checker for dimensions and bleed',
      $stack127_11_description$Check a KDP interior or paperback cover PDF locally against selected trim, bleed, and cover settings. See page-level measurements and possible issues. It cannot guarantee KDP acceptance.$stack127_11_description$,
      'WebApplication',
      0.50
    ),
    (
      'kdp-page-count-estimator',
      'KDP page count estimator',
      'KDP page count estimator from words and layout choices',
      $stack127_12_description$Estimate a likely KDP print page range from words, trim, typography, margins, chapter starts, images, and front or back matter. Final pagination still comes from the typeset PDF.$stack127_12_description$,
      'WebApplication',
      0.50
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
  row.page_type,
  row.sitemap_priority
from tool_registry_rows row
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  page_family = excluded.page_family,
  is_published = false,
  published_at = null,
  updated_at = null,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority;

with tool_content(
  slug,
  title,
  intro_markdown,
  usage_markdown,
  content_markdown,
  content_revision,
  tool_version,
  tool_version_updated_at,
  stack127_repo_url,
  stack127_repo_version,
  stack127_repo_commit_sha,
  stack127_repo_synced_at
) as (
  values
    (
      'backup-321-calculator',
      '3-2-1 backup capacity calculator',
      $stack127_0_intro$Estimate the capacity for local and off-site backups from your protected data, growth, and retention plan. Add recovery targets to check whether your assumed transfer speeds leave enough time for a full restore.$stack127_0_intro$,
      $stack127_0_usage$## Plan around the data you need to restore

Start with the logical size of the files and systems you will protect, not the capacity printed on their disks. Match the unit to your measurement: GB and TB are decimal; GiB and TiB are binary. Use the growth horizon to size for the end of the planning period.

Choose a backup model and the number of restore points to retain. For full-plus-incremental, use a representative changed-data percentage per additional point. Both destinations use this same policy. Headroom is added separately to each destination after its repository estimate.

Enable the recovery check only when you have targets and realistic sustained transfer rates. Allow for transfer efficiency rather than treating a connection's advertised speed as observed restore throughput. Changing an input clears the old calculation; changing only the display unit reformats it.$stack127_0_usage$,
      $stack127_0_content$## Full backups and incremental backups need different allowances

Full-only treats every retained point as a complete copy of the projected source. Full-plus-incremental starts with one projected full and adds a changed-data allowance for each further point. That allowance is an average, not a prediction of how much will change between particular backups.

These are product-neutral capacity models. Compression, deduplication, backup-chain rules, and pruning can change what your backup software actually stores. Check its retention behavior before buying storage from this estimate alone.

## Recovery targets are not measured restore times

Recovery point objective, or RPO, is the amount of data age your plan can tolerate. Here, the check compares your backup interval with that target. Recovery time objective, or RTO, is the time allowed to recover. The calculator compares it with an estimated transfer time for the projected full source, not every retained backup. These terms come from [NIST's contingency planning guidance](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf).

Meeting either target is a planning result. Transfer time does not include finding the right backup, preparing replacement systems, restoring applications, or checking that services work. A missed target points to an assumption worth changing; a met target still needs a restore test.

## Three planned copies do not prove a 3-2-1 backup

The source, local target, and off-site target represent three planned positions. The calculator cannot verify their physical locations, storage media, isolation, encryption, or recoverability. [CISA's backup guidance](https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf) describes the arrangement; capacity arithmetic cannot establish that you have implemented it.

Check the actual target placement and access paths, then restore representative data. [CISA's ransomware guidance](https://www.cisa.gov/stopransomware/ransomware-guide) explains why isolated backups and testing matter.

Calculations run in your browser. Explicitly sharing a result creates a URL containing the normalized inputs, so anyone receiving that link can read them.$stack127_0_content$,
      4,
      '1.0.1',
      '2026-09-16T07:00:50.248Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'docker-compose-checker',
      'Docker Compose checker',
      $stack127_1_intro$Check a pasted Compose file for YAML errors, targeted Compose-model issues, and static advisories before running it. Findings include source locations when available. Your inputs are processed locally, without uploading them or running Docker.$stack127_1_intro$,
      $stack127_1_usage$## Check the file you intend to run

Paste one Compose YAML document, up to 256 KiB and 4,000 lines. If it uses variables, supply the relevant `KEY=VALUE` assignments in the optional interpolation input, up to 64 KiB and 2,000 lines. Use representative values rather than secrets where possible. The checker does not read your shell, project `.env`, or referenced files.

Fix input and YAML syntax problems first: they prevent a normalized model from being produced. For parsed files, follow each finding's path and fix direction. A source location can point to the relevant YAML node rather than the exact offending character.

Editing either input clears the previous result. An unexpected checker failure leaves your text available for another attempt. Copying the report copies diagnostic evidence, not a repaired Compose file.$stack127_1_usage$,
      $stack127_1_content$## What a static check can tell you

| Layer | What it checks | What a clean result does not establish |
| --- | --- | --- |
| YAML syntax | Whether the pasted document can be parsed safely | That it describes a usable Compose project |
| Compose model | Targeted structures, types, references, and relationships in this file | Full Specification coverage or a resolved multi-file project |
| Static advisories | Declarations worth reviewing, such as broad exposure or elevated privileges | A vulnerability finding or security verdict |

The model checks follow a targeted snapshot of the [Compose Specification reference](https://docs.docker.com/reference/compose-file/). A valid YAML document can still have Compose errors, and an advisory does not itself change model validity.

## Interpolation is separate from container environment

| Source or declaration | Its role | What this checker can use |
| --- | --- | --- |
| Pasted interpolation assignments | Explicit values for this check | Only the assignments you supply |
| Shell, project `.env`, or CLI environment files | Sources used by real Compose interpolation | Not read by the browser |
| Service `environment` | Environment values for the container | Its declaration in the pasted file |
| Service `env_file` | A file supplying container environment values | Its declaration, not the file contents |

A service's `env_file` does not fill a `${VAR}` token in this checker. Supply the interpolation assignment separately when you want to test a known value.

The checker handles `$VAR`, `${VAR}`, defaults, required values, alternatives, and escaped dollars. Empty and unset are different: `${VAR-default}` uses its default only when unset, while `${VAR:-default}` also uses it when empty. The required forms `?` and `:?` make the same unset-versus-empty distinction; `+` and `:+` select an alternative when the corresponding condition is met. Required forms can block resolution; an unresolved optional value remains a different finding. `$$` preserves a dollar sign instead of starting interpolation.

Interpolation applies to values, not YAML keys, and supported expressions can nest up to eight levels here. This is not a shell evaluator. See the [Compose interpolation reference](https://docs.docker.com/reference/compose-file/interpolation/) for the operator meanings and the [environment-source guide](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/) for real-project precedence.

## Declarations are not host facts

| Declaration | Static check | Still unknown |
| --- | --- | --- |
| `depends_on` | Referenced services and supported conditions | Whether dependencies start successfully |
| Networks and named volumes | Declared resources and service references | Whether external resources exist |
| Secrets and configs | Declarations and grants | File readability, contents, and runtime access |
| Profiles | Membership declared in the paste | Which profiles your actual command activates |
| Healthchecks | The declaration, including health-dependent relationships | Whether the application becomes ready |

Published ports are normalized for syntax and same-file overlap checks, including supported ranges and bracketed IPv6 addresses. A free-looking declaration can still collide with another process or project on the host. Likewise, declaring a healthcheck is not evidence that it will pass. Docker's [service reference](https://docs.docker.com/reference/compose-file/services/) describes these relationships.

## One paste cannot resolve every project

The obsolete `version` field does not select a legacy 2.x or 3.x schema. `include` and `extends` create a different problem: their referenced files can change the effective model. This checker does not fetch or merge them. It retains useful findings from the pasted file while marking the unresolved composition as incomplete.

## Verify with the real project

Run `docker compose config -q` using the files, project directory, environment sources, and profiles intended for deployment. Use `docker compose config --environment` to inspect the environment used for interpolation. The [docker compose config reference](https://docs.docker.com/reference/cli/docker/compose/config/) covers these project-level checks.

Neither this browser check nor configuration validation proves that an image exists, host files are accessible, ports are available, or services remain healthy. Those questions need the actual project and Docker runtime. The checker does not execute code, inspect images, or issue a security verdict.$stack127_1_content$,
      5,
      '1.0.1',
      '2026-09-16T07:00:57.879Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'ip-asn-lookup',
      'IP and ASN registration lookup',
      $stack127_2_intro$Find the regional registry record for a public IP address or autonomous system number. Compare the published registration with separate routing context when available, without treating either as a person's identity or a location.$stack127_2_intro$,
      $stack127_2_usage$## Start with the address in the evidence

Use one public IPv4 or IPv6 address from the connection or log you are investigating, or an ASN with or without the `AS` prefix. Hostnames, CIDR ranges, private addresses, and reserved values are outside this lookup's scope.

A registry's not-registered response differs from a blocked request, rate limit, timeout, or unavailable service. Retry a temporary failure before drawing a conclusion about the address. A missing routing result does not prove that an address is unrouted, and it does not invalidate a registration record that was retrieved successfully.

Before acting, open the linked registry record and check its scope. Use the raw RDAP response when you need fields beyond the summary, but handle downloaded contact information with care.$stack127_2_usage$,
      $stack127_2_content$## What the registered record means

An IP record describes a registered address range; an ASN record describes an autonomous system number or range. The holder, handle, status, and event dates belong to that registry record. They do not necessarily describe the device using an address today. A missing field means the source did not publish it, not that its value is zero or that no organization exists. [ARIN's RDAP guide](https://www.arin.net/resources/registry/whoisrws/rdap/) explains the registration service.

The country field is registration data, not device geolocation. This lookup does not identify a subscriber or person, test reachability, list open ports, or assess reputation.

## How the lookup chooses a registry

IANA's bootstrap data directs the query to a regional Internet registry's RDAP service. RDAP provides structured registration records for IP networks and ASNs. An unavailable service stays unknown; the tool does not fill the gap with a guessed holder. See the [RDAP bootstrap standard](https://www.rfc-editor.org/rfc/rfc9224) and [query standard](https://www.rfc-editor.org/rfc/rfc9082).

Your query is sent to the site's lookup service and upstream registration services. Optional IP routing context also involves a routing provider. This is not a browser-local lookup or a promise of anonymous processing.

## Registration and routing answer different questions

Registration records describe allocated resources. The separate [Team Cymru routing lookup](https://www.team-cymru.com/ip-asn-mapping) can describe an observed BGP origin and announced prefix. A route origin and registered holder can differ without either record being wrong. Keep that distinction when tracing an incident: neither record alone establishes who generated the traffic.

## Use an abuse contact with evidence

A published abuse contact gives you a reporting destination, not proof that the contact or registered holder caused an incident.

1. Record the address, timestamp and time zone, observed protocol or URL, and relevant logs.
2. Check that the registry publishes the destination for abuse reports and follow any reporting instructions it provides.
3. Send the relevant evidence, removing unrelated personal data and secrets.

The lookup cannot promise a response or identify the subscriber behind the event.$stack127_2_content$,
      4,
      '1.0.1',
      '2026-09-16T07:01:04.955Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'self-hosted-app-resource-planner',
      'Self-hosted app resource planner',
      $stack127_3_intro$Compare a self-hosted app stack's estimated RAM and storage ranges with your host budget. Keep missing estimates visible so an incomplete plan does not look like spare capacity.$stack127_3_intro$,
      $stack127_3_usage$## Build a plan for the workload you expect

Choose catalog apps using their displayed sources and assumptions, or add a custom workload with your own minimum and maximum estimates. Quantity multiplies both ends of each range. Use GiB for RAM and decimal GB for storage.

Enter the resources available to this stack, allowing for other workloads on the host. Headroom reserves the selected percentage of each budget once; it is not a separate multiplier on every app. The default is a starting assumption, not a universal operating rule.

Leave an estimate unknown when you do not have evidence for it. Fill in both ends of a custom range when you do: a partial or reversed range needs correction. Revisit the plan when user activity, retained data, indexing, or media processing changes.$stack127_3_usage$,
      $stack127_3_content$## An estimate needs a workload behind it

The planner totals RAM and app storage, not CPU requirements or a complete hardware specification. A reviewed catalog estimate has a stated basis, confidence, and source date. Reviewed does not mean official, measured on your host, or suitable for every installation. A custom estimate carries the assumptions you supply.

Read that evidence before treating a range as your workload. A small personal database and a heavily indexed shared service can have very different needs even when they run the same app.

## Read fit as a planning range

| Status | Comparison with the available budget | What it means for the plan |
| --- | --- | --- |
| Within | The maximum estimate fits | The whole estimated range fits, including equality |
| Tight | The minimum fits but the maximum does not | Workload variation can exceed the budget |
| Over | Even the minimum exceeds the budget | The entered budget cannot cover the estimated range |
| Unknown | One or more required estimates are missing | The known subtotal cannot settle the full requirement |

The binding resource is the complete dimension with the largest maximum-demand-to-budget ratio. It is a way to compare the entered ranges, not a measured bottleneck. CPU notes remain qualitative and are not added into a CPU total.

## Resource limits do not predict demand

A Docker memory limit constrains a container; it does not establish how much memory the application needs. Reservations and limits also serve different purposes. Setting a low limit to make a plan fit can leave the application short of memory rather than reduce its workload. See [Docker's resource-constraint documentation](https://docs.docker.com/engine/containers/resource_constraints/) before translating estimates into container settings.

Run a representative workload and compare observed use with your assumptions. [Docker's `stats` command](https://docs.docker.com/reference/cli/docker/container/stats/) can help with container usage, but the planner itself collects no host telemetry and cannot guarantee that a stack will run well.

The site loads the catalog evidence; calculations using your selected workloads and budgets then run locally in the browser. That does not mean catalog loading or the rest of the site makes no network requests.$stack127_3_content$,
      4,
      '1.0.1',
      '2026-09-16T07:01:12.498Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'restic-retention-simulator',
      'Restic retention simulator',
      $stack127_4_intro$Preview which snapshots a retention policy keeps, with a reason for each decision. The simulator reads your supplied JSON without opening a restic repository.$stack127_4_intro$,
      $stack127_4_usage$## Choose snapshot groups and retention periods

Start with a JSON array of snapshot records, not an object containing a `snapshots` property. The simulator accepts 1 to 1,000 records. Each needs a unique `id` and an ISO date and time in `time`. Use restic's `hostname` field; the older `host` spelling also works. `paths` and `tags` are optional arrays of strings.

Choose one grouping field: host, paths, or tags. Each group receives its own retention calculation. This tool's host-only default is not a statement about the defaults of your installed restic command.

Set an IANA timezone before comparing daily or weekly decisions. Calendar boundaries follow that timezone, and weeks start on Monday. An unrecognized nonempty timezone produces a warning and uses UTC instead.

Each keep count accepts a whole number from 0 to 365. Zero turns that rule off; at least one rule must be active. The retained set is the union of all active rules, so a snapshot stays if any rule selects it. When a calendar rule finds fewer occupied periods than requested, the model also retains the oldest snapshot in that group.

Invalid JSON, duplicate IDs, invalid times, or an all-zero policy prevent a result. Editing clears the old trace, so preview the policy again after a correction. A row marked pruned means no implemented rule selected it. Nothing has been deleted.

Snapshot input stays in this tool's browser memory. It is not sent to a server or saved in a URL or browser storage. Copying a trace is an explicit clipboard action.$stack127_4_usage$,
      $stack127_4_content$## Calendar counts versus elapsed windows

A daily retention count is not an age cutoff. Empty calendar periods do not use up the count: the rules work back through periods that contain snapshots. The [restic retention documentation](https://restic.readthedocs.io/en/stable/060_forget.html) explains this distinction and how retention rules combine.

| Policy concept | What it counts | Boundary |
| --- | --- | --- |
| Keep last | Individual snapshots, newest first | Applied separately to each selected group |
| Daily, weekly, monthly, yearly | Occupied calendar periods, selecting the newest snapshot in each | Uses the selected timezone; empty periods do not consume a count |
| Keep within | An elapsed retention window | Not implemented by this simulator |

## Verify the policy against your repository

This is a bounded retention model, not a restic command runner. It omits hourly rules, keep-within rules, tag selectors, and combined grouping keys. It cannot estimate reclaimed bytes because it does not inspect repository data or shared file content.

Before changing retention, compare the trace with `restic forget --dry-run` using your intended grouping and installed restic version. Review the selected snapshots before running a command that changes the repository. The simulator neither forgets snapshots nor prunes stored data.$stack127_4_content$,
      2,
      '1.0.0',
      '2026-09-15T18:30:00.000Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'rsync-filter-tester',
      'Rsync filter tester',
      $stack127_5_intro$Test ordered include and exclude rules against a sample file tree. See which rule decides each path and which descendants cannot be visited.$stack127_5_intro$,
      $stack127_5_usage$## Test paths from the transfer root

Paste `+` include rules and `-` exclude rules in the order you intend to use them. A standalone `!` clears the rules above it. Supply unique relative paths, one per line, and mark directories with a trailing slash. The model accepts up to 1,000 rules and 1,000 paths; absolute paths, duplicate paths, character classes, and unsupported rule modifiers are rejected.

Make the path list representative of the transfer, including the directories leading to the files you care about. The leading slash in an anchored filter refers to this transfer root, not your machine's filesystem root.

Choose what happens to an unmatched path: include or exclude. The first matching rule decides each visited path. Put specific exceptions before a broader rule that would catch them.

An excluded parent stops traversal. Its descendants are unvisited, even if a later include rule would match a child. This also happens when the unmatched default excludes the parent. If a desired file is unvisited, inspect its ancestors before changing the file's own rule.

Invalid rules or paths leave the editors available without a trace. Editing clears the previous result; test again after reordering a rule. Copying the report does not run a transfer.

The tool evaluates these rules and paths in browser memory. It does not send them to a host or server or save them in a URL or browser storage.$stack127_5_usage$,
      $stack127_5_content$## Rsync pattern scope

Pattern scope and rule order solve different problems. Scope determines whether a pattern matches a path; order determines whether that match gets a chance to decide it. The [rsync manual](https://rsync.samba.org/ftp/rsync/rsync.1) documents the full filter language. This tester implements only the subset below and the ordered include, exclude, and clear rules.

| Pattern | Scope | Example |
| --- | --- | --- |
| `*.conf` | A basename at any depth | Can match `app.conf` or `etc/app.conf` |
| `/etc/*.conf` | Anchored at the transfer root; `*` does not cross a slash | Can match `etc/app.conf`, not `etc/app/site.conf` |
| `**` | Can cross directory separators | `/logs/**` can match paths below `logs/` at several depths |
| `?` | One non-slash character | `part?.txt` can match `part1.txt`, not `part12.txt` |
| Trailing `/` | Directories only | `cache/` matches a directory named `cache` |

## Verify the real transfer

The supplied tree is the entire world this model sees. It does not inspect symlinks, permissions, shell expansion, daemon modules, delete behavior, or per-directory merge files. An included path here is not proof that the real transfer can read or copy it.

Use `rsync --dry-run` with the intended source root, destination, options, and installed version before copying. Check the command's own output as well as this trace, especially when changing traversal or deletion options.$stack127_5_content$,
      2,
      '1.0.0',
      '2026-09-15T18:30:00.000Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'mqtt-discovery-checker',
      'Home Assistant MQTT discovery checker',
      $stack127_6_intro$Check a discovery topic and JSON payload before publishing. Findings identify field problems without connecting to your MQTT broker.$stack127_6_intro$,
      $stack127_6_usage$## Check a topic with its payload

Enter the discovery prefix used by your installation, then paste the complete topic and its JSON object payload. The default prefix is `homeassistant`; this checker accepts a one-segment prefix.

Topics follow `prefix/component/object_id/config` or `prefix/component/node_id/object_id/config`. Topic IDs use letters, digits, underscores, or hyphens. A state topic is not a discovery topic: the configuration topic must end in `config`.

Use the component that the payload is meant to create. The sensor and binary sensor profiles require a state topic; the button profile requires a command topic. Common abbreviations such as `uniq_id`, `stat_t`, and `dev` are recognized. Other recognized components receive common-field checks, not a complete component-specific validation.

Correct the field or JSON path named in each finding, then check again. Malformed JSON, unsafe integer values, an invalid topic, or a missing required profile topic can block the check. Editing clears previous findings. The normalized JSON view is evidence of what was parsed, not a repaired payload, and copying it does not publish it.

The topic and payload stay in this tool's browser memory. They are not sent to a server or broker or saved in a URL or browser storage.$stack127_6_usage$,
      $stack127_6_content$## What the discovery status establishes

The status describes this checker's supported profile. It does not describe the state of your broker or a Home Assistant entity.

| Status | Meaning | Next check |
| --- | --- | --- |
| Valid | The implemented profile found no blocking issue | Confirm the exact component's requirements and test in your installation |
| Partial | Warnings or common-field-only coverage leave questions open | Review the named paths and component-specific documentation |
| Invalid | The supplied topic or payload has a blocking problem | Correct the indicated field and run a fresh check |

## When valid discovery still creates no entity

Discovery depends on more than the configuration text. This checker does not publish or subscribe, inspect retained messages or broker permissions, execute templates, or verify that Home Assistant receives the message. It cannot prove that an entity was created or that its state updates.

Use the [Home Assistant MQTT discovery documentation](https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery) and the page for your exact component to finish the check. Compare those requirements with your installed Home Assistant version. The local profiles do not implement every component schema or every release.$stack127_6_content$,
      2,
      '1.0.0',
      '2026-09-15T18:30:00.000Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'lxc-idmap-checker',
      'LXC ID mapping checker',
      $stack127_7_intro$Check supplied UID and GID ranges, resolve a container ID to its host ID, and compare the matched range with optional subordinate grants.$stack127_7_intro$,
      $stack127_7_usage$## Check the map and matching grant file

Enter UID and GID map lines separately. Each line contains its `u` or `g` type, container start, host start, and length. Choose whether to query a UID or GID, then enter the container ID you want to resolve.

For an ID inside a mapped range, the host ID is `host start + container ID - container start`. The range starts at the supplied start and contains exactly the supplied length. Its last included ID is therefore `start + length - 1`, which is the inclusive endpoint shown in the result. IDs may not exceed 4,294,967,294; lengths must be positive and both endpoints must fit.

To check subordinate grants, paste `owner:start:length` rows into the matching grant field and supply the exact owner. UID grants come from `/etc/subuid`; GID grants come from `/etc/subgid`. One cannot substitute for the other. This checker requires one matching-owner grant to cover the entire matched host range, not just the queried ID.

Malformed lines, zero lengths, endpoint overflow, and overlapping container or host ranges prevent a result. Gaps are findings rather than automatic parse failures. A query outside the supplied map produces an unmapped answer. Editing clears the old diagnosis, so check again after changing a range or owner.

The supplied maps and grants are processed in browser memory. The tool does not read your host's files, send these inputs to a server, or save them in a URL or browser storage. Copying a report is explicit.$stack127_7_usage$,
      $stack127_7_content$## Mapping and grant results are separate

A map describes an ID translation. A subordinate grant describes a range allocated to an owner. Neither alone proves access to a file or mount. The [LXC configuration reference](https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html) defines the map format, while the [subuid manual](https://man7.org/linux/man-pages/man5/subuid.5.html) explains subordinate UID allocations.

| Result | What was checked | What remains unknown |
| --- | --- | --- |
| Mapped host ID | The query falls inside a supplied range and its offset resolves | Whether this map is active on the host |
| Unmapped query | No supplied range contains the queried ID | Whether the running container uses a different map |
| Grant covered | One matching-owner grant of the correct type covers the full matched host range | Whether the host configuration permits the intended operation |
| Grant missing | Grants were supplied, but none meets that full-range coverage check | Whether the supplied grant text matches the current host files |
| Grant unknown | No grant evidence was supplied for the check | Whether the required allocation exists |

## Check permissions on the actual host

If the arithmetic and grants look right but a bind mount still fails, inspect the running namespace, file ownership, and ACLs on the host. This tool does not inspect those states, infer default mappings, start a container, or test mount access. A covered grant is not a runtime permission verdict.$stack127_7_content$,
      2,
      '1.0.0',
      '2026-09-15T18:30:00.000Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'kdp-book-setup-calculator',
      'KDP book setup calculator',
      $stack127_8_intro$Calculate interior dimensions, minimum margins, spine width, and full cover size for a KDP print setup. Paperback geometry uses the selected paper and ink rules; hardcover cover dimensions remain a planning estimate to confirm with KDP.$stack127_8_intro$,
      $stack127_8_usage$## Use the setup that matches your final book

Choose the binding, trim, paper, and interior you intend to publish. Use the final formatted page count when available. An odd count rounds up to the next even count, which then drives the margin band, spine, and page-range check.

Select interior bleed according to the interior design, not whether the cover extends to its edge. Choose units for the layout software you use and DPI for pixel targets. Pixel dimensions are conversion targets, not evidence that an exported PDF has the right resolution or size.

An unsupported combination prevents calculation. A supported combination outside its page range can still produce dimensions with a warning; those numbers do not make the book eligible. Reading direction changes the cover segment order, not its dimensions, and does not verify language eligibility.

Editing the setup clears the previous calculation. After revising the book, calculate again before copying its receipt. Setup values are calculated in your browser; this tool reads no manuscript or PDF.$stack127_8_usage$,
      $stack127_8_content$## Page count changes more than the spine

A thicker book needs a wider inside margin at the relevant page-count boundary. This calculator applies the minimum margin band to the effective even page count, so an odd count near a boundary can change more than the final number of pages. Minimum margins are production constraints, not a complete typography or readability recommendation. See [KDP's submission guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950).

Paper and ink also change spine width. The calculation uses the selected profile's coefficient from [KDP's paperback cover requirements](https://kdp.amazon.com/en_US/help/topic/G201953020), including the published groundwood coefficient. Do not carry a spine measurement from one paper or color choice into another setup.

## Interior bleed does not switch cover bleed off

Interior bleed adds 0.125 inch to the page width and 0.25 inch to its height. Without interior bleed, the page matches the trim size. The paperback cover has its own required outer bleed regardless of that interior setting.

The calculations start from inch-based dimensions, then convert to millimeters and rounded pixel targets. Changing the display unit does not select a different paper rule or create a new print specification.

## Confirm hardcover geometry with KDP's template

The hardcover estimate uses the documented 0.51-inch wrap and 0.4-inch hinge allowances. The reviewed [hardcover cover guidance](https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6) does not supply the single closed total-width formula used by this local planning model. Treat its spine and full cover size as estimates, not an official template.

Use [KDP's cover calculator](https://kdp.amazon.com/cover-calculator) with the final book settings before preparing the cover file. This tool's dated source table cannot inspect the exported PDF, check the design, or establish KDP acceptance.$stack127_8_content$,
      3,
      '1.1.0',
      '2026-09-16T11:43:55.881Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'kdp-metadata-checker',
      'KDP metadata checker',
      $stack127_9_intro$Review your title, subtitle, description, and keyword fields before entering them in KDP. The checker separates documented formatting findings from local review prompts and provides an approximate description preview, without rewriting your text.$stack127_9_intro$,
      $stack127_9_usage$## Check the source you intend to submit

Provide a title and description. The subtitle and seven keyword slots are optional, so leave unused slots empty. Paste the description's source markup when checking formatted text; the visible preview alone does not contain everything counted toward its limit.

Correct the field named in each finding and check again. After edits, the previous checked snapshot can remain visible with a recheck notice. It does not describe the changed draft until you run a fresh check. Invalid input produces no metadata result.

The description preview is an approximation, not an Amazon preview or a repaired source file. Copy source copies the original description, including any markup that still needs correction.$stack127_9_usage$,
      $stack127_9_content$## Counts and warnings answer different questions

A clean local result is not KDP acceptance. Deterministic checks identify the documented formatting boundaries implemented here; warnings ask you to review a pattern or local heuristic. Duplicate phrases and title overlap can deserve attention without proving that KDP will reject a field.

The warning for a keyword over 50 Unicode characters is a stack127 review prompt. It is not an official KDP field limit, byte limit, or pass/fail rule. KDP's [keyword guidance](https://kdp.amazon.com/en_US/help/topic/G201298500) remains the source for how to choose relevant terms.

### Title and subtitle share a local count

[KDP's metadata guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560) require title and subtitle together to contain fewer than 200 characters. This checker normalizes line endings, counts Unicode code points, and adds one separator when both fields contain text. That explains why its combined count can exceed the sum of the two visible field counts by one.

This is a defined local counting method, not a reproduction of KDP's private Unicode counter or confirmation that the title matches the cover.

### Description markup uses part of the budget

The 4,000-character description limit includes HTML tags. A short-looking preview can therefore have longer source text. The checker separately flags unsupported tags, attributes, incomplete markup, and malformed nesting, while preserving what you entered. See [KDP's description guidance](https://kdp.amazon.com/en_US/help/topic/G201189630) and [formatting troubleshooting](https://kdp.amazon.com/en_US/help/topic/GC4VASCGNQP6LQ7L).

Fix the named source issue before relying on the preview. The tool does not silently repair HTML or promise that Amazon will render it identically.

## Finish the review in KDP

The checker cannot judge truthfulness, trademarks, categories, cover matching, or the full meaning of promotional language. It does not reproduce KDP's private automated systems or human review. After correcting the source, use KDP's current [book detail resources](https://kdp.amazon.com/en_US/help/topic/G202105800) and review the actual form. Metadata checks and book-file checks remain separate tasks.

Your entered metadata stays in this browser check. It is not sent to a server, saved in browser storage or the URL, or passed to an AI writer. Copying the description is an explicit action; the tool does not submit it to KDP.$stack127_9_content$,
      3,
      '1.1.0',
      '2026-09-16T11:44:06.303Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'kdp-royalty-calculator',
      'KDP royalty calculator for US print books and eBooks',
      $stack127_10_intro$Estimate royalty per sale for an Amazon.com paperback, hardcover, or eBook in USD. Compare the modeled price floor and deductions, then see what a sale could contribute toward advertising or an optional monthly royalty target.$stack127_10_intro$,
      $stack127_10_usage$## Use the edition you intend to price

For print, match the trim, paper, and interior to the book and use the final formatted page count when available. Odd counts round up to an even effective count before the printing-cost and page-range checks. Unsupported combinations or effective counts outside the selected range prevent a result.

For an eBook, use the file-size assumption relevant to the delivery-cost estimate and choose the royalty option you want to examine. A selected 70% option outside this model's eligible price band falls back to 35% with a warning. It does not mean the calculator verified every other condition for 70% eligibility.

Leave the monthly target blank if you only need per-sale economics. A zero target needs zero copies; a positive target cannot produce a meaningful copy count when the modeled royalty is zero or negative. Compare the valid price rows to understand a boundary, not as a list of recommended prices.$stack127_10_usage$,
      $stack127_10_content$## Print and eBook royalties use different deductions

For print, the model applies the royalty rate to list price, then subtracts printing cost. On Amazon.com, the checked print rates are 50% through $9.98 and 60% from $9.99. Printing cost depends on the format, trim class, paper, ink, and effective page count; some short-book branches use a fixed cost. See KDP's [paperback costs](https://kdp.amazon.com/en_US/help/topic/G201834340), [paperback royalties](https://kdp.amazon.com/en_US/help/topic/G201834330), [hardcover costs](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H), and [hardcover royalties](https://kdp.amazon.com/en_US/help/topic/G77F3WPD3KQLJTFS).

For an eligible 70% eBook scenario, delivery cost is subtracted before applying the rate. The 35% branch has no delivery deduction. The local US model rounds file size up to kilobytes and applies the checked $0.15-per-MB delivery rate with a $0.01 minimum. It rounds monetary calculations at defined cent boundaries and displays USD estimates to two decimal places. These are modeled amounts, not a live order quote. KDP's [digital pricing rules](https://kdp.amazon.com/en_US/help/topic/G200634500) describe the delivery deduction.

The checked Amazon.com 70% price band is $2.99 through $12.99. Outside that band, this model uses 35%. Its 35% minimum price depends on file size, so a larger file can change price eligibility even though that branch has no delivery deduction. Consult [KDP's eBook price requirements](https://kdp.amazon.com/en_US/help/topic/G200634560) for the bands and other conditions. The calculator does not verify account requirements, public-domain status, or the required relationship to a physical edition's price.

## A price floor is not a pricing recommendation

The print floor is the minimum modeled price covering printing cost under the applicable rate band. It does not account for editing, design, marketing, or your time. Royalty is therefore not author profit, and the floor says nothing about demand.

Break-even ad spend is a ceiling based on positive royalty per sale. Spending that full amount would consume the modeled royalty before other expenses. Break-even ACoS expresses that ceiling as a share of list price; neither figure recommends a campaign budget or predicts conversion.

Monthly copies divide the target by the modeled cent-based royalty and round up to a whole sale. That is unit arithmetic, not a sales forecast. With no positive royalty, there is no positive ad headroom or meaningful positive-target copy count.

## Confirm the scenario in KDP

This calculator covers Amazon.com in USD and standard print distribution, not Expanded Distribution or other marketplaces. It does not model taxes, refunds, promotions, price matching, or account-specific adjustments.

Scenario calculations run locally in your browser. The tool does not contact your Amazon account or submit a price. Check the dated source rules against KDP's current guidance and confirm the actual edition in your publishing workflow before relying on the estimate.$stack127_10_content$,
      3,
      '1.1.0',
      '2026-09-16T11:44:17.791Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'kdp-pdf-preflight-checker',
      'KDP PDF preflight checker',
      $stack127_11_intro$Check a finished interior or paperback cover PDF against your selected KDP setup. The report points to measurable file and page issues for review; it does not decide whether KDP will accept the book.$stack127_11_intro$,
      $stack127_11_usage$## Compare the export with its intended setup

Use the final PDF you intend to submit, within the 650 MB file limit. Match the trim, binding, paper, ink, and bleed settings to that export. Interior checks support paperback and hardcover; cover checks support paperback only.

For a cover, supply the book's final even page count, not the number of pages in the cover file. The cover PDF itself must contain one page. This check does not silently round an odd book count. Interior checks use the actual page count read from the PDF.

Follow a possible issue to its page or property, then compare the measured and expected values in the report. An unreadable file or unsupported extraction is different from a completed measurement. If you change the file or settings during inspection, the old work is cleared; run the check for the new selection.

The selected PDF is read in your browser, without uploading it. Copy and download actions export a text report, not a repaired PDF or a visual preview.$stack127_11_usage$,
      $stack127_11_content$## A measurement is narrower than an approval

The checker reads page count, dimensions, mixed page sizes, and available PDF page boxes. It also reports font-embedding information, measurable image resolution, and file or content warnings where extraction supports them.

Unknown means the check could not establish the fact. Not measured means no usable measurement was made; not declared describes missing explicit metadata. None is a pass. A missing optional page box is not automatically a defect, because PDF boxes can have defaults. The [PDF 1.7 reference](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf) defines those boxes and their relationships.

The size comparison uses the page's MediaBox and a stack127 tolerance of 0.02 inch. That tolerance is a local comparison rule, not an allowance published by KDP. A report with no measurable issues means only that the implemented checks found none.

## Interior bleed and cover bleed are different calculations

For an interior without bleed, expected page size matches the trim. With bleed, the expected page gains 0.125 inch in width and 0.25 inch in height. The extra width is asymmetric because interior bleed is added at the outside edge, not both sides. See [KDP's trim, bleed, and margin guidance](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6).

A paperback cover combines back, spine, front, and outer bleed. Its expected spine depends on the final book page count and selected paper and ink, so checking a cover against an earlier manuscript count can produce the wrong expectation. The [paperback cover requirements](https://kdp.amazon.com/en_US/help/topic/G201953020) are the source for that geometry.

## Some print problems need a visual or manual check

Embedded-font evidence does not prove a commercial font license. Image-resolution checks apply only to placements the parser can measure; they do not prove that every image will print well. The checker cannot verify visible ink bounds, safe margins, gutter placement, color acceptance, or barcode placement, and it does not render a preview for visual review.

Correct the source document, export again, and recheck the final file. Then use KDP's Print Previewer and current [formatting and review guidance](https://kdp.amazon.com/en_US/help/topic/G201834260). The report's dated ruleset does not replace [KDP's submission requirements](https://kdp.amazon.com/en_US/help/topic/G201857950) or its review of your upload.$stack127_11_content$,
      3,
      '1.1.0',
      '2026-09-16T11:44:25.927Z'::timestamptz,
      null,
      null,
      null,
      null
    ),
    (
      'kdp-page-count-estimator',
      'KDP page count estimator',
      $stack127_12_intro$Estimate a print-page range from your manuscript's word count and proposed layout. Adjust trim, typography, margins, and added pages to explore the plan before the book is typeset.$stack127_12_intro$,
      $stack127_12_usage$## Separate body text from added pages

Use the body-text word count, then choose the trim and layout assumptions you intend to test. Font class is a model choice, not a selection of an installed typeface. Set margins that leave a positive text area; a larger page does not help if its margins use the extra space.

Enter image pages, front matter, and back matter separately. With body text present, the model also adds one page per chapter as an allowance. It does not predict actual chapter breaks or right-hand starts. With zero words, body pages and the chapter allowance are zero, but explicit added pages still count.

Compare plausible layouts using the range, not just its midpoint. Invalid counts or impossible text areas produce no estimate. A gutter warning asks you to review the margin assumption; it does not automatically change the layout. Run a new estimate after changing your assumptions.

The calculation uses local numeric inputs. You do not upload a manuscript or a font file.$stack127_12_usage$,
      $stack127_12_content$## What changes words per page?

| Layout choice | Effect in this model | What it cannot capture |
| --- | --- | --- |
| Trim size | Changes the available page width and height | How the manuscript flows onto that page |
| Font class and point size | Change estimated character width and line capacity | The actual metrics of a particular typeface |
| Line spacing | Changes the estimated number of lines | Paragraph styles, headings, and local spacing overrides |
| Margins | Reduce the usable text area | Whether the final design places content correctly |

Usable width is trim width minus inside and outside margins; usable height is trim height minus top and bottom margins. The estimator combines that area with average character-width and word-length assumptions, then applies a density range. These are stack127 modeling choices, not a KDP pagination formula or a universal words-per-page rule.

The final range includes the entered additions and rounds each endpoint up to an even page count. It remains a planning range. The model does not choose paper or ink, so it cannot establish a universal maximum page count for the book.

## Replace the estimate with the final PDF

Real typefaces, paragraph breaks, artwork, and chapter layouts determine the exported page count. Once the book is typeset, use that actual count to check its selected format against [KDP's submission guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950). Then use [KDP's cover calculator](https://kdp.amazon.com/cover-calculator) for the final cover setup. An estimated count is not the final input for a production spine or an acceptance decision.$stack127_12_content$,
      3,
      '1.1.0',
      '2026-09-16T11:44:34.939Z'::timestamptz,
      null,
      null,
      null,
      null
    )
)
insert into public.stack127_tool_pages (
  page_id,
  title,
  intro_markdown,
  usage_markdown,
  content_markdown,
  content_revision,
  tool_version,
  tool_version_updated_at,
  stack127_repo_url,
  stack127_repo_version,
  stack127_repo_commit_sha,
  stack127_repo_synced_at
)
select
  page.id,
  content.title,
  content.intro_markdown,
  content.usage_markdown,
  content.content_markdown,
  content.content_revision,
  content.tool_version,
  content.tool_version_updated_at,
  content.stack127_repo_url,
  content.stack127_repo_version,
  content.stack127_repo_commit_sha,
  content.stack127_repo_synced_at::timestamptz
from tool_content content
join public.stack127_pages page on page.slug = content.slug
where page.page_family = 'tool'
on conflict (page_id) do update set
  title = excluded.title,
  intro_markdown = excluded.intro_markdown,
  usage_markdown = excluded.usage_markdown,
  content_markdown = excluded.content_markdown,
  tool_version = excluded.tool_version,
  stack127_repo_url = excluded.stack127_repo_url,
  stack127_repo_version = excluded.stack127_repo_version,
  stack127_repo_commit_sha = excluded.stack127_repo_commit_sha,
  stack127_repo_synced_at = excluded.stack127_repo_synced_at;

do $$
declare
  mismatch_count integer;
begin
  with expected(
    slug,
    content_revision,
    tool_version,
    title_md5,
    intro_md5,
    usage_md5,
    content_md5
  ) as (
    values
    (
      'backup-321-calculator',
      4,
      '1.0.1',
      '9524a4f4b25f3f4f84dd0994db030a15',
      '549a032a20c8fbdd9e433372a3fe9d19',
      '23d5674dc1bd26dafe58337d6a953337',
      '055c2a9167deb552fa3ff9a39e6bc79a'
    ),
    (
      'docker-compose-checker',
      5,
      '1.0.1',
      '7edb72f8efab00ec94a35e939028210c',
      '74634381f0581bcdac655d91a7fc4222',
      '6d2797efcd2453e0e841f0c585f5e6b3',
      '27bf56e56407f51e36432c541cf4080d'
    ),
    (
      'ip-asn-lookup',
      4,
      '1.0.1',
      '34c58b26a34fa1d637ecc0ba362aa407',
      '064082c0dc32051f38e9d1163b3a2bf6',
      '37509b5b0e7370e8fc14484566ea1ee9',
      'e73fa0955de6e73a8a7d11930531fc66'
    ),
    (
      'self-hosted-app-resource-planner',
      4,
      '1.0.1',
      '5b3207d54b1c8d17e1973f40aa9f9e2a',
      'c32a656a33eef5ea06ff4ebdb5d6c151',
      '28632ed7b2f184507572a8b4e0637911',
      'b5357e725add486a55a04cc7c7842c9a'
    ),
    (
      'restic-retention-simulator',
      2,
      '1.0.0',
      'c93dcd35700339a62939cf5f28c678f4',
      'ddd746bc3892efcfdcf18c72ea7fbe50',
      '48cbbffdff5dd3d53e2dbc6c0279be46',
      'a343e4c9a6e99bda2b240f3dc00f8549'
    ),
    (
      'rsync-filter-tester',
      2,
      '1.0.0',
      'bf56ed9138d732aaf9c7d9fbf337579f',
      '3ecb8c971a670602df2a6046ad09d41b',
      '63db8513d4b1ad4928b672d24ed3c4ef',
      'f6c6573bb86843893054aa2ef6ff5fd7'
    ),
    (
      'mqtt-discovery-checker',
      2,
      '1.0.0',
      'd24917db8d5e360c8d50a4c7733f6a4d',
      '0b9153fe7a50cf38172892f49b81e11d',
      '200def8a8e436f5f2ae5240e7066ebef',
      '1dea0a11872d0ad2bf2288bfc897b3b8'
    ),
    (
      'lxc-idmap-checker',
      2,
      '1.0.0',
      'ab451c11890d700eb8a7ec9d57c175dd',
      'f349b6c2266c6eeb95a069e813ebbc53',
      '8711b63b3179955199dc7377367f8d8f',
      'fe3fa59443892525f5d2c83587c41b9f'
    ),
    (
      'kdp-book-setup-calculator',
      3,
      '1.1.0',
      '29b2faeb7742dc69090a5ecc0d44e796',
      '57fb072463eafdb046c23567efc0b60e',
      '6e2054b989876f07457ea892b2021850',
      '7525427ce9f52b3088589977de5363d6'
    ),
    (
      'kdp-metadata-checker',
      3,
      '1.1.0',
      'f1c69037e9bae65491df198b2a9e2f98',
      '3e04641370c64cf4a304adeb71e46373',
      'f6f4bc54423737602c27b4f81972c6d8',
      '9ed5b7fbcedb78a12259fcc01538104c'
    ),
    (
      'kdp-royalty-calculator',
      3,
      '1.1.0',
      '3cf1fb523ffa6554b99efc5f701aaa98',
      'eaa5642926280bc1ba6b0cf001365663',
      '919d14c76028fbf62713eaf130b5e97a',
      '5827e3c1f7c2cfdc52c4dc365d8de676'
    ),
    (
      'kdp-pdf-preflight-checker',
      3,
      '1.1.0',
      '112d58a628896b405098d2ec28255786',
      'e269221fc48ce36df9c1d45cf0da2e49',
      'd767c8dc3b0dcbb84eadf85913c55fcd',
      '59e0f227e8b5b58c5f3d7afdbde872be'
    ),
    (
      'kdp-page-count-estimator',
      3,
      '1.1.0',
      'a401a17b0aff68e0960193a1f4dfe8f5',
      '3746aa86f1a2144dd1a526f4eec17ecb',
      '801b17516a23add0cdfb0b1359b91ac4',
      '896277b960927ebf725eebe6ed86f240'
    )
  )
  select count(*)
  into mismatch_count
  from expected
  left join public.stack127_pages page on page.slug = expected.slug
  left join public.stack127_tool_pages tool on tool.page_id = page.id
  where page.id is null
    or page.page_family <> 'tool'
    or page.is_published
    or page.published_at is not null
    or page.updated_at is not null
    or tool.page_id is null
    or tool.content_revision <> expected.content_revision
    or tool.tool_version <> expected.tool_version
    or md5(tool.title) <> expected.title_md5
    or md5(tool.intro_markdown) <> expected.intro_md5
    or md5(tool.usage_markdown) <> expected.usage_md5
    or md5(tool.content_markdown) <> expected.content_md5;

  if mismatch_count <> 0 then
    raise exception '13-tool unpublished sync failed for % row(s)', mismatch_count;
  end if;

  if (
    select count(*)
    from public.stack127_pages
    where slug in ('backup-321-calculator', 'docker-compose-checker', 'ip-asn-lookup', 'self-hosted-app-resource-planner', 'restic-retention-simulator', 'rsync-filter-tester', 'mqtt-discovery-checker', 'lxc-idmap-checker', 'kdp-book-setup-calculator', 'kdp-metadata-checker', 'kdp-royalty-calculator', 'kdp-pdf-preflight-checker', 'kdp-page-count-estimator')
  ) <> 13 then
    raise exception '13-tool unpublished sync did not produce exactly 13 registry rows';
  end if;
end;
$$;
