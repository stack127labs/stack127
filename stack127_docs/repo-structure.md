# stack127 repo structure

The repo is organized by page. That way the site can grow without mixing docs, scripts, and data workflows.

## Pages

Every normal page is a repo-owned Next.js route under `app/`.

Routes stay in the repo. `stack127_pages` controls publication and SEO. Family tables may own structured page data.

Page content lives in `content/*.mdx` beside each route. See `stack127_docs/page-content.md`.

Interactive tool code stays under `app/(site)/(tools)/`. Tool titles, card fields, and version records live in `stack127_tool_pages`. See `stack127_docs/tool-pages.md` for who owns what and the update commands.

Directory routes stay under `app/(site)/(directories)/`. Directory titles and card text live in `stack127_directory_pages`. See `stack127_docs/directory-pages.md`.

Page source is grouped by job. The groups don't change URLs.

```text
app/(site)/(catalogs)/    # collections of stack127-owned tool pages
app/(site)/(courses)/     # ordered teaching paths
app/(site)/(directories)/ # software, hardware, platforms, and stable facts
app/(site)/(site-pages)/  # home, about, privacy, terms, and labs
app/(site)/(tools)/       # calculators, lookups, and generators
```

Shared components live in `app/ui/`, grouped by use. Page data and one-off interactions stay with their route. Generated page art stays beside its page. Tool and catalog card art lives in `app/ui/art/`.

| Group | Contains |
| --- | --- |
| Catalogs | Only the catalog route. Tool code never lives here. |
| Directories | Directory routes, including stable fact pages such as `/epp-status-codes` and `/tld-directory`. |
| Tools | Tool routes, one flat folder per tool. Code shared by a tool family lives in `app/ui/tools/<family>/`, such as `app/ui/tools/dns/`. |

See [page-families.md](page-families.md) for each family's page table.

## Page docs

Page docs live in `content_docs/<page-slug>/`. For example:

```text
content_docs/self-host-apps/
content_docs/kdp-payment-date-calculator/
content_docs/self-hosting-for-beginners/
```

Match the folder name to the page slug, so related docs are easy to find.

Older tool folders may still hold research and handoff plans from before the single `tool-spec.md` workflow. For component paths, use the current source and [shared-ui.md](shared-ui.md).

## Sitewide docs

Sitewide docs live in `stack127_docs/`.

Use this folder for design, structure, brand, SEO rules, environment notes, deployment notes, and other global decisions. Launch SEO rules go in `stack127_docs/seo.md`.

When a decision changes, update the operating doc it belongs to. Git history keeps past versions.

The live Cloudflare, DNS, caching, and origin safety setup is in `stack127_docs/cloudflare.md`.

## Scripts

| Kind | Location |
| --- | --- |
| Page scripts | `scripts/<page-slug>/` |
| Sitewide scripts | `scripts/stack127/` |
| Reviewed tool page database changes | `scripts/stack127/tool-pages/` |
| stack127-owned repository automation | `scripts/stack127/repos/`, with its scaffold in `templates/stack127-tool-repo/` |
| Throwaway scripts and generated review files | `/tmp/stack127/` |

Keep only durable scripts and reviewed source data in the repo. Third-party GitHub project data is a separate database concern.

List only durable scripts in `package.json`. Don't add one-off scripts there.

Include the page slug in package script names where you can:

```text
self-host-apps:refresh-github
self-host-apps:cache-icons
self-host-apps:audit-summaries
```

## Skills

Repo-owned Codex skills live in `skills/`:

```text
skills/self-host-apps/<skill-name>/
skills/stack127/tools/<skill-name>/
```

For example:

```text
skills/self-host-apps/enrichment/
skills/stack127/tools/stack127-tool-backend/
```

Sitewide skills live in `skills/stack127/<skill-name>/`.

The repo copy is canonical. If a skill also needs global Codex discovery, install, copy, or symlink it from the repo version. Don't edit the global copy directly.

## Environment files

Split env files by concern:

| File | Holds |
| --- | --- |
| `.env.local` | Managed development Supabase values. It must not point to a local Docker Supabase stack. |
| `.env.database` | Production database values. Include the production `DATABASE_URL`. Supabase URL and key values can live here too if a feature uses Supabase APIs. |
| `.env.deploy` | The explicit OVH production identity, plus Cloudflare, Dokploy, SSH, and deploy automation values. It must not contain generic legacy `VPS_*` keys or the Hostinger Dokploy URL. |
| `.env.analytics` | Analytics values, such as the self-hosted Umami URL and website ID. |
| `.env.homelab` | Homelab host and local administration values. |
| `.env.repos` | Local GitHub CLI and stack127 repo automation values. |

Next.js reads its standard env files automatically, including `.env.local`. It doesn't read custom split files such as `.env.database` or `.env.deploy`. Production deploy tooling has to pass those values into the runtime.

The machine-readable infrastructure identity is `scripts/stack127/deployment/targets.json`. The release workflow runs `npm run stack127:deploy:preflight` before every production deployment.

Edit `.env.deploy` one key at a time, using its secret-free example as the schema. Never replace a populated env file wholesale.

Every real file has a tracked `*.example` schema. The full key inventory, GitHub Actions scopes, Dokploy runtime lists, and rotation steps are in `stack127_docs/environment-inventory.md`.

Self-host app scripts load `.env.local` by default for local work. For production data jobs, run with `NODE_ENV=production` and either provide `.env.database`, pass `DATABASE_URL`, or pass `--database-url`.
