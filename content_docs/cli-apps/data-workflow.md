# cli-apps data workflow

The `/cli-apps` directory is fed by a dedicated pipeline that never touches
`public.self_host_apps`. Terminal apps can be open source, source available,
freeware, freemium, paid, subscription, usage based, or closed source; the
self-host app model cannot express most of those, so the directory owns its
tables.

## Tables

- `public.terminal_apps`: published records. One row per app with verified
  facts, `last_verified_at`, and an optional `self_host_app_id` link for apps
  that also exist in the self-host apps table. The link is optional and never
  required for publication.
- `public.terminal_app_candidates`: the discovery queue. Every discovered
  record from every source lands here, including duplicates, incomplete rows,
  excluded records, and failures. Statuses: `discovered`, `duplicate`,
  `needs_review`, `enriched`, `published`, `excluded`, `failed`.
- `public.terminal_app_import_runs`: one row per collection run with
  discovered/imported/updated/error counts and notes that record rate limits,
  blocked pages, API ceilings, and filter decisions.
- `public.terminal_app_field_sources`: provenance per published field:
  which source produced it, when it was checked, and how much we trust it.

## Pipeline

1. **Discover**: one script per approved source under `scripts/cli-apps/`.
   Each exhausts what the source exposes (sitemaps, APIs, CSVs, topic pages,
   package catalogues) without arbitrary record caps. Sources that are not
   terminal-scoped (NixOS, Arch, Ubuntu, PyPI) apply a documented relevance
   predicate at collection time; scanned/rejected counts land in run notes.
2. **Dedupe** (`dedupe-candidates.mjs`): deterministic keys. Repository
   identity wins, then website identity, then normalized name. Duplicates are
   marked, never deleted; every duplicate keeps its own source URL and alias.
3. **Verify** (`verify-candidates.mjs`): fetches official evidence (GitHub
   API for repository facts, reachability probes for websites) into a batch
   file. Nothing publishes here.
4. **Cache icons** (`cache-icons.mjs`): downloads each app's official site
   favicon or repository-owner image, normalizes it to a local 256px PNG, and
   records the source URL. A generated initial tile is the last fallback.
5. **Publish** (`publish-apps.mjs`): applies reviewed records. Publication
   requires a name, an original stack127 summary, an official URL, source
   model, pricing model, a primary type, 1 to 3 reviewed categories, and a
   verification date. It also requires the cached icon and its source. Every
   published field gets a provenance row.
6. **Report** (`coverage-report.mjs`): per-source discovered, deduplicated,
   excluded, enriched, published, and failed counts.

## Rules

- Never copy a competitor description as public copy. Published summaries are
  written by stack127.
- Use `unknown` or `null` instead of guessing.
- Package names and command names are aliases, not automatically product names.
- A record without a reliable official URL or source page does not publish.
- Public cards load icons from `/cli-app-icons/`. They do not depend on a
  third-party favicon service at request time.
- The result is exhaustive across the attempted sources only. It is not proof
  that every terminal app in existence has been found.
