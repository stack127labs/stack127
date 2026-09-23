# Stack127 Repo Structure

Stack127 is organized by page so the site can grow without mixing docs, scripts, and data workflows.

## Pages

All normal pages are repo-owned Next.js routes under `app/`.

Routes remain repo-owned. `stack127_pages` controls publication and SEO, while family tables may own
structured page data. Interactive tool code stays under `app/(site)/(tools)/`; tool titles,
introductions, supporting Markdown, and version records live in `stack127_tool_pages`. See
`stack127_docs/tool-pages.md` for the ownership boundary and update commands.

Page source is grouped by job without changing URLs:

```text
app/(site)/(catalogs)/    # collections of stack127-owned pages
app/(site)/(courses)/     # ordered teaching paths
app/(site)/(directories)/ # third-party software and hardware directories
app/(site)/(legal)/       # about, privacy, and terms
app/(site)/(references)/  # stable facts, codes, and comparisons
app/(site)/(tools)/       # calculators, lookups, and generators
```

Shared components live in `app/ui/`, grouped by use. Page data and one-off interactions stay with
their route. Generated page art stays beside its page.

Catalogs contain links to stack127-owned pages. Directories contain third-party software and
hardware records. References contain stable facts, codes, and comparisons. Do not place
`/epp-status-codes`, `/tld-directory`, or another reference under `(tools)`.

## Page Docs

Page docs live at:

```text
content_docs/<page-slug>/
```

Examples:

```text
content_docs/self-host-apps/
content_docs/kdp-payment-date-calculator/
content_docs/self-hosting-for-beginners/
```

The folder name should match the page slug so related docs are easy to find.
Older tool folders may still contain research and handoff plans from before the single
`tool-spec.md` workflow. Use the current source and [shared-ui.md](shared-ui.md) for component paths.

## Sitewide Docs

Sitewide docs live at:

```text
stack127_docs/
```

Use this folder for design, structure, brand, SEO rules, environment notes, deployment notes, and other global decisions. Keep launch SEO rules in `stack127_docs/seo.md`.

Update the relevant operating doc when a decision changes. Git history holds past versions.

The live Cloudflare, DNS, caching, and origin-safety setup is recorded in `stack127_docs/cloudflare.md`.

## Scripts

Page scripts live at:

```text
scripts/<page-slug>/
```

Put throwaway scripts and generated review files under `/tmp/stack127/`. Keep only durable scripts
and reviewed source data in the repository.

Sitewide scripts live at:

```text
scripts/stack127/
```

Reviewed tool-page database mutations live under `scripts/stack127/tool-pages/`. stack127-owned
repository automation lives under `scripts/stack127/repos/`; its scaffold is
`templates/stack127-tool-repo/`. Third-party GitHub project data remains a separate database concern.

Only durable scripts should be listed in `package.json`. Avoid adding one-off scripts there.

Package script names should include the page slug where possible:

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

Examples:

```text
skills/self-host-apps/enrichment/
skills/stack127/tools/stack127-tool-build/
```

Sitewide skills live at:

```text
skills/stack127/<skill-name>/
```

The repo copy is canonical. If a skill also needs to be available through global Codex discovery, install, copy, or symlink the global skill from the repo version instead of editing the global copy directly.

## Environment Files

Use split env files by concern:

```text
.env.local
.env.database
.env.deploy
.env.analytics
.env.homelab
.env.repos
```

- `.env.local`: managed development Supabase values. It must not point to a local Docker Supabase stack.
- `.env.database`: production database values. It should include the production `DATABASE_URL`; Supabase URL/key values can also live here if a feature uses Supabase APIs.
- `.env.deploy`: the explicit OVH production identity plus Cloudflare, Dokploy, SSH, and deploy automation values. It must not contain generic legacy `VPS_*` keys or the Hostinger Dokploy URL.
- `.env.analytics`: analytics values such as self-hosted Umami URL and website ID.
- `.env.homelab`: homelab host and local administration values.
- `.env.repos`: local GitHub CLI and stack127 repo automation values.

Next.js reads standard Next env files automatically, including `.env.local`. It does not automatically read custom split files such as `.env.database` or `.env.deploy`; production deploy tooling must pass those values into the runtime environment.

The machine-readable infrastructure identity is `scripts/stack127/deployment/targets.json`. Run `npm run stack127:deploy:preflight` before every production deployment. Edit `.env.deploy` surgically and use its secret-free example as the schema; never replace a populated environment file wholesale.

Every real file has a tracked `*.example` schema. The complete key inventory,
GitHub Actions scopes, Dokploy runtime lists, and rotation procedure are in
`stack127_docs/environment-inventory.md`.

Self-host app scripts load `.env.local` by default for local work. When running production data jobs, run with `NODE_ENV=production` and provide `.env.database`, pass `DATABASE_URL`, or pass `--database-url`.
