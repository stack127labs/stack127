Yes. Human speed is the right call here.

I’d start with **one main table** called `self_host_apps`, but I would still add **one small history table** for GitHub stats later, because 90-day stats do not belong well inside the main app row.

I would also have one simple `categories` table and link apps to categories through `self_host_app_categories`. Apps can honestly belong to more than one category without forcing an artificial primary bucket.

For V1, this is the shape I’d use.

```sql
categories
```

**Categories**

```text
id
slug
name
description
icon_key
created_at
updated_at
```

`icon_key` stores the visual icon reference for that category, such as `images`, `network`, or `code-2`. The frontend maps these keys to our icon renderer and falls back safely if a key is missing.

```sql
self_host_app_categories
```

**App Category Links**

```text
app_id
category_id
created_at
```

Use this join table for all app/category membership. Do not store category IDs as an array on `self_host_apps`, and do not force a primary category unless we intentionally add that idea later.

```sql
self_host_apps
```

**Core Identity**

```text
id
slug
name
description
status
created_at
updated_at
last_checked_at
```

`description` should be your human-friendly one-liner.

Example:

> Photo and video backup app that gives you a private Google Photos-like library on your own server.

Not:

> Open-source self-hosted photo management solution.

**Media**

```text
icon_url
icon_source
screenshots jsonb
youtube_video_url
```

`screenshots` can be an array:

```json
[
  {
    "url": "https://...",
    "type": "web",
    "caption": "Main photo library"
  },
  {
    "url": "https://...",
    "type": "mobile",
    "caption": "iOS backup screen"
  }
]
```

**Editorial / HomeLabHQ Opinion**

```text
get_started text
verdict text
good_fit text[]
watch_outs text[]
known_issues text[]
```

This is the most valuable part. This is where HomeLabHQ becomes more than a directory.

**Links**

```text
website_url
source_code_url
demo_url
docker_url
install_docs_url
docs_url
```

**Deployment**

```text
deployment_methods text[]
docker_support text
compose_support boolean
requires_database boolean
database_types text[]
requires_redis boolean
requires_object_storage boolean
supported_platforms text[]
```

Examples:

```text
deployment_methods = ["docker", "docker-compose", "bare-metal"]
docker_support = "official"
supported_platforms = ["web", "ios", "android"]
```

**Resources**

```text
ram_required_mb
ram_recommended_mb
storage_required_gb
cpu_notes text
gpu_notes text
```

For unknown values, keep them nullable. Do not fake precision.

**Storage / Backup**

```text
storage_and_data_notes text
backup_details text
backup_difficulty text
backup_criticality text
raid_notes text
```

Examples:

```text
storage_and_data_notes = "User media files, generated thumbnails, configuration, and database state."
backup_criticality = "high"
backup_difficulty = "moderate"
```

`storage_and_data_notes` combines storage model and storage notes so the page can explain where data lives without splitting the same idea across two fields.

`backup_details` can be deeper than a one-liner. For important apps, it should explain what to back up together, what restore testing should prove, and what beginners should not assume.

I’d use `raid_notes`, not `raid_details`, because RAID advice will often be contextual. Be precise where useful, like mirrored disks, RAIDZ1, or RAIDZ2, but always explain that RAID is not backup.

**Maintenance / Health**

```text
actively_maintained boolean
maintenance_status text
last_release_at
last_commit_at
```

`maintenance_status` values:

```text
active
slow_but_alive
possibly_stale
archived
unknown
```

**GitHub Stats Current Snapshot**

```text
github_owner
github_repo
github_stars
github_forks
github_open_issues
github_open_pull_requests
github_latest_release
github_latest_release_at
github_last_commit_at
github_commit_count_90d
github_release_count_90d
github_release_count
github_updated_at
github_checked_at
```

I would skip “clones” unless you own the repo. Public GitHub clone counts are generally not available for random repos.

**Alternatives / Replacements**

```text
alternative_app_ids uuid[]
replaces_apps text[]
```

Example:

```json
alternative_app_ids = ["immich-id", "photoprism-id"]
replaces_apps = ["Google Photos", "iCloud Photos", "Amazon Photos"]
```

**Client Apps**

```text
client_apps jsonb
```

Example:

```json
[
  {
    "platform": "iOS",
    "url": "https://apps.apple.com/...",
    "official": true
  },
  {
    "platform": "Android",
    "url": "https://play.google.com/...",
    "official": true
  }
]
```

**Hardware / VPS Recommendations**

For now, keep it as JSON:

```text
hardware_recommendations jsonb
```

Example:

```json
[
  {
    "type": "mini_pc",
    "label": "Good fit for Intel N100 mini PCs",
    "reason": "Enough CPU for small photo libraries without heavy transcoding.",
    "affiliate_url": "https://...",
    "image_url": "https://...",
    "price_note": "Usually $150-$250"
  }
]
```

Later this can become its own table. Not now.

**Trust / Metadata**

```text
data_confidence text
notes text
published boolean
```

`data_confidence` values:

```text
high
medium
low
unknown
```

For the history part, I strongly recommend this second table:

```sql
self_host_app_github_snapshots
```

Columns:

```text
id
app_id
snapshot_date
stars
forks
open_issues
open_pull_requests
latest_release
latest_release_at
last_commit_at
commit_count_90d
release_count_90d
created_at
```

This keeps your main app table clean while allowing charts later.

So the practical V1 setup is:

```text
self_host_apps
self_host_app_github_snapshots
```

That’s it.

My advice: don’t over-normalize yet. Use normal columns for things you filter/sort by, and `jsonb` for flexible things like screenshots, client apps, hardware recommendations, and badges. This keeps us moving fast without trapping the product later.
