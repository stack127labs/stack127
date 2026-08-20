# Stack127 Repo Structure

Stack127 is organized by page surface so the site can grow without mixing docs, scripts, and data workflows.

## Pages

All normal pages are repo-owned Next.js routes under `app/`.

Use Supabase for structured data where it helps a page, but do not build normal site routing from Supabase rows unless explicitly requested.

## Page Docs

Page docs live at:

```text
content_docs/<page-slug>/
```

Examples:

```text
content_docs/self-host-apps/
content_docs/status-codes/
content_docs/seo-tools/
```

The folder name should match the page slug so related docs are easy to find.

## Sitewide Docs

Sitewide docs live at:

```text
stack127_docs/
```

Use this folder for design, structure, brand, SEO rules, environment notes, deployment notes, and other global decisions. Keep launch SEO rules in `stack127_docs/seo.md`.

The live Cloudflare, DNS, caching, and origin-safety setup is recorded in `stack127_docs/cloudflare.md`.

## Scripts

Page scripts live at:

```text
scripts/<page-slug>/
```

Temporary page scripts live at:

```text
scripts/<page-slug>/temp/
```

Sitewide scripts live at:

```text
scripts/stack127/
```

Only durable scripts should be listed in `package.json`. Avoid adding one-off scripts there.

Package script names should include the page slug where possible:

```text
self-host-apps:refresh-github
self-host-apps:cache-icons
self-host-apps:audit-summaries
```

## Skills

Repo-owned Codex skills live beside the page surface they support:

```text
skills/<page-slug>/<skill-name>/
```

Examples:

```text
skills/self-host-apps/enrichment/
skills/home-automation/research/
skills/ai-agents/tool-directory/
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
```

- `.env.local`: local development values. It should include the local `DATABASE_URL`.
- `.env.database`: production database values. It should include the production `DATABASE_URL`; Supabase URL/key values can also live here if a feature uses Supabase APIs.
- `.env.deploy`: the explicit OVH production identity plus Cloudflare, Dokploy, SSH, and deploy automation values. It must not contain generic legacy `VPS_*` keys or the Hostinger Dokploy URL.
- `.env.analytics`: analytics values such as self-hosted Umami URL and website ID.

Next.js reads standard Next env files automatically, including `.env.local`. It does not automatically read custom split files such as `.env.database` or `.env.deploy`; production deploy tooling must pass those values into the runtime environment.

The machine-readable infrastructure identity is `scripts/stack127/deployment/targets.json`. Run `npm run stack127:deploy:preflight` before every production deployment. Edit `.env.deploy` surgically and use `.env.deploy.example` as its secret-free schema; never replace a populated environment file wholesale.

Self-host app scripts load `.env.local` by default for local work. When running production data jobs, run with `NODE_ENV=production` and provide `.env.database`, pass `DATABASE_URL`, or pass `--database-url`.
