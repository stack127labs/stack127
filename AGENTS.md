# Version127 Agent Guide

Version127 is a compact technical directory site. It should grow into multiple repo-owned pages for self-host apps, open-source tools, home automation, AI agents, calculators, reference pages, and related technical resources.

## Priorities

- Keep pages fast, small, and consistent across the site.
- Keep important page content server-rendered and easy for search crawlers and AI agents to read.
- Prefer structured facts over long prose.
- Use the shared shell, design tokens, typography, spacing, and component patterns before inventing new UI.
- Follow `version127_docs/writing-style.md` for content-heavy pages, summaries, legal copy, reference pages, and public-facing explanations.
- Keep dark mode as the default feel.
- Unknown or `null` is better than fake precision.

## Routing

- Pages are repo-owned Next.js routes under `app/`.
- Do not use Supabase-backed dynamic routing for normal site pages unless the user explicitly asks for it.
- Keep page URLs stable and human-readable.
- Public publication is controlled only by `public.version127_pages`.
- Do not add `metadata`, `generateMetadata`, robots rules, canonical URLs, sitemap dates, or page JSON-LD inside page route files.
- Exact published slugs in `version127_pages` are `index, follow` and appear in `/sitemap.xml`.
- Routes outside a published root return `404`, even if code exists in the repo.
- Child routes under a published root may render, but are `noindex, follow` unless their exact slug is also published in `version127_pages`.
- Query-param variants of a published page are `noindex, follow` and stay out of the sitemap.

## Docs

- Page-specific docs live under `content_docs/<page-slug>/`.
- The folder name must match the page slug, for example `content_docs/self-host-apps/`.
- Sitewide docs live under `version127_docs/`.
- Do not recreate the old `content/` prose workflow.

## Scripts

- Page-specific scripts live under `scripts/<page-slug>/`.
- Temporary page scripts live under `scripts/<page-slug>/temp/`.
- Sitewide scripts live under `scripts/version127/`.
- Do not add one-off scripts to `package.json`.
- Durable package scripts should include the page slug, for example `self-host-apps:refresh-github`.

## Skills

- Page-specific agent skills live under `skills/<page-slug>/<skill-name>/`.
- Sitewide agent skills live under `skills/version127/<skill-name>/`.
- Keep repo skills as the canonical source.
- `.agents/skills` and `.claude/skills` are symlink adapters to `skills/`; do not replace them with copied folders.
- Global Codex or Claude-facing skill installs should be copied or symlinked from the repo.
- For self-host app work, use skills under `skills/self-host-apps/` before creating new ad hoc workflows.
- For Version127 page work, read `skills/version127/test-driven-page/SKILL.md` before changing routes, SEO behavior, or publication state.
- For generated cover image intake, read `skills/version127/cover-image-intake/SKILL.md`; remove junk metadata but keep clean SEO-friendly metadata in the final JPG when tooling supports it.

## Environment

- `.env.local` is for local development and should contain the local `DATABASE_URL`.
- `.env.database` is for production database values. At minimum, production deploys need `DATABASE_URL`; Supabase API keys can also live there when a feature uses them.
- `.env.deploy` is for VPS, Cloudflare, Dokploy, and deployment automation values.
- `.env.analytics` is for analytics values such as Umami URL and site ID when needed.
- Next.js automatically reads normal Next env files such as `.env.local`. Custom split env files must be loaded explicitly by deploy tooling, scripts, command flags, or a script-level env loader.
- Never commit secrets.

## Before Changing Data Or Structure

- Read the relevant page docs in `content_docs/<page-slug>/`.
- Check `scripts/scripts.json` and the page script manifest.
- Keep migrations, seeds, docs, scripts, and UI aligned when a schema or data workflow changes.
