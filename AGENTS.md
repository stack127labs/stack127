# Version127 Agent Guide

Version127 is a compact technical directory site. It should grow into multiple repo-owned pages for self-host apps, open-source tools, home automation, AI agents, calculators, reference pages, and related technical resources.

## Priorities

- Keep pages fast, small, and consistent across the site.
- Keep important page content server-rendered and easy for search crawlers and AI agents to read.
- Prefer structured facts when they are clearer than prose, but do not break natural explanations into labels, fragments, or a card for every fact.
- Use the shared shell, design tokens, typography, spacing, and component patterns before inventing new UI.
- Follow `version127_docs/design-system.md`. Body text has exactly two sizes: `--text-body` for everything, `--text-small` only for card descriptions, metadata, captions, and sidebar items. The chartreuse accent is a fill for at most the h1 mark, one primary button, the active pagination page, focus, and the active tab underline; accent-colored text uses `--color-accent-text`. Muted text is only for annotations such as metadata, captions, and counts — reading copy uses `--color-text`.
- Follow `version127_docs/css-architecture.md`. Keep `app/globals.css` limited to tokens, reset, and document defaults; colocate page and component styles with their owner.
- Follow `version127_docs/writing-style.md` for all public-facing copy and `version127_docs/visual-first.md` for planning what gets shown versus said. When asked to write a page, propose the visual format mix first and push back on text-heavy requests, including Teja's. Content pages need a `content_docs/<page-slug>/brief.md` before implementation.
- The brand is written `version127`, lowercase v, everywhere in user-facing copy, even at the start of a sentence.
- Marker art explains concepts vaguely on purpose; clean charts (`npm run version127:clean-charts`) state data precisely; tables compare repeated facts; screenshots prove real interfaces. Never put exact numbers in marker style and never put comparisons in paragraphs.
- Treat "simple" as composed, soulful, and easy to follow. Use full sentences, human judgment, and clear visual relationships. Avoid decorative eyebrows, floating helper text, dashboard-style sentence fragments, and oversized caveat panels.
- Never decorate a callout, result, finding, or information box with a colored line along its left edge. Use calm spacing, a neutral full border, a restrained background, or semantic text when distinction is genuinely useful. Structural connector lines in a real timeline or chain are different and may remain neutral.
- Keep dark mode as the default feel.
- Unknown or `null` is better than fake precision.

## Routing

- Pages are repo-owned Next.js routes under `app/`.
- Canonical tool and reference URLs are flat, for example `/dns-lookup` and `/zfs-capacity-calculator`. Collection pages such as `/dns-tools`, `/domain-tools`, and `/storage-tools` organize discovery but do not own child URL namespaces.
- Tool route source lives under the non-URL route group `app/(site)/(tools)/<tool-slug>/`. A tool may appear in several collections while keeping one route, docs folder, and ownership manifest.
- Do not create new tool URLs under `/<collection>/<tool-slug>`. Add the flat tool to every relevant collection instead.
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
- Tool docs use only the flat tool slug, even when a collection links to the tool.
- The folder name must match the page slug, for example `content_docs/self-host-apps/`.
- Sitewide docs live under `version127_docs/`.
- Do not recreate the old `content/` prose workflow.

## Scripts

- Page-specific scripts live under `scripts/<page-slug>/`.
- Temporary page scripts live under `scripts/<page-slug>/temp/`.
- Sitewide scripts live under `scripts/version127/`.
- Do not add one-off scripts to `package.json`.
- Durable package scripts should include the page slug, for example `self-host-apps:refresh-github`.

## Tests

- Every route has one ownership manifest under `tests/pages/<route>/page.json`; `/` uses `tests/pages/home/page.json`.
- Put tests that protect one page beside that page manifest.
- Keep route-family tests in that family's `shared` folder, sitewide tests in `tests/version127/`, and public-repository contract tests in `tests/repos/<repo-name>/`.
- The ownership manifest is the index for the page's docs, tests, scripts, skills, and public repository copies. Do not recreate a central hand-maintained page coverage registry.

## Public repositories

- The private source-of-truth repository is `RaviTejaKNTS/version127`.
- Public repositories belong to the `version127` GitHub organization.
- Keep the complete local public-repository tree under `repos/<repo-name>/`.
- Synchronization from the private application into `repos/` must use an explicit allowlist and a check mode. Never use a blind two-way copy.
- Publish a public repository only after its local quality gate and secret scan pass.

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

## Production Deployment

- The only Version127 production target is the dedicated OVH VPS recorded in `scripts/version127/deployment/targets.json`.
- The only production Dokploy dashboard is `https://dokploy.version127.com`.
- `https://dokploy.ravitejaknts.com` and the Hostinger shared VPS are legacy infrastructure and must never receive a Version127 deployment.
- Never infer that production DNS should change because a deploy landed on a different server. Verify the deployment target first.
- Before any production deployment, run `npm run version127:deploy:preflight`. Stop if it fails.
- A production release must satisfy `HEAD = origin/main = OVH Dokploy deployment commit = live production revision`.
- Read `version127_docs/production-deployment.md` before deploying or changing deployment credentials, server access, Cloudflare, or Dokploy configuration.

## Before Changing Data Or Structure

- Read the relevant page docs in `content_docs/<page-slug>/`.
- Check `scripts/scripts.json` and the page script manifest.
- Keep migrations, seeds, docs, scripts, and UI aligned when a schema or data workflow changes.
- `public.open_projects` is the shared source of truth for open-source and source-available projects. Keep `source_model` accurate and read `version127_docs/open-projects.md` before changing it.
- Page directories query the shared table by explicit fields such as `self_hosting_status`; do not create another project table for each directory.
- Keep broad discovery in `open_project_candidates`. Discovery must not publish, classify categories, or turn GitHub topics into editorial facts.
