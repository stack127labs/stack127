# Stack127 Agent Guide

Stack127 is a compact technical directory site. It should grow into multiple repo-owned pages for self-host apps, open-source tools, home automation, AI agents, calculators, reference pages, and related technical resources.

## Priorities

- Keep pages fast, small, and consistent across the site.
- Keep important page content server-rendered and easy for search crawlers and AI agents to read.
- Prefer structured facts when they are clearer than prose, but do not break natural explanations into labels, fragments, or a card for every fact.
- Use the shared shell, design tokens, typography, spacing, and component patterns before inventing new UI.
- Follow `stack127_docs/design-system.md`. Body text has exactly two sizes: `--text-body` for everything, `--text-small` only for card descriptions, metadata, captions, and sidebar items. The chartreuse accent is a fill for at most the h1 mark, one primary button, the active pagination page, focus, and the active tab underline; accent-colored text uses `--color-accent-text`. Muted text is only for annotations such as metadata, captions, and counts — reading copy uses `--color-text`.
- Follow `stack127_docs/css-architecture.md`. Keep `app/globals.css` limited to tokens, reset, and document defaults; colocate page and component styles with their owner.
- Follow `stack127_docs/writing-style.md` for all public-facing copy and `stack127_docs/visual-first.md` for planning what gets shown versus said. When asked to write a page, propose the visual format mix first and push back on text-heavy requests, including Teja's. Content pages need a `content_docs/<page-slug>/brief.md` before implementation.
- Apply `skills/stack127/unslop/SKILL.md` to every public sentence and to durable documentation. Remove decorative labels, canned transitions, fake quotes, filler, and other AI-shaped phrasing before considering copy complete.
- Follow `stack127_docs/page-families.md`. Catalogs, courses, tools, references, info pages, and legal pages share a predictable shell while keeping the visual format that suits their job. Page-family words do not become required URL prefixes.
- The brand is written `stack127`, lowercase v, everywhere in user-facing copy, even at the start of a sentence.
- Marker art explains concepts vaguely on purpose; clean charts (`npm run stack127:clean-charts`) state data precisely; tables compare repeated facts; screenshots prove real interfaces. Never put exact numbers in marker style and never put comparisons in paragraphs.
- Treat "simple" as composed, soulful, and easy to follow. Use full sentences, human judgment, and clear visual relationships. Avoid decorative eyebrows, floating helper text, dashboard-style sentence fragments, and oversized caveat panels.
- Never decorate a callout, result, finding, or information box with a colored line along its left edge. Use calm spacing, a neutral full border, a restrained background, or semantic text when distinction is genuinely useful. Structural connector lines in a real timeline or chain are different and may remain neutral.
- Keep dark mode as the default feel.
- Unknown or `null` is better than fake precision.

## Routing

- Pages are repo-owned Next.js routes under `app/`.
- Canonical tool and reference URLs are flat, for example `/dns-lookup` and `/zfs-capacity-calculator`. Collection pages such as `/dns-tools`, `/domain-tools`, and `/storage-tools` organize discovery but do not own child URL namespaces.
- Catalog route source lives under the non-URL route group `app/(site)/(catalogs)/`. This includes app directories, keyboard shortcuts, software license comparisons, and tool collection pages.
- Course route source lives under `app/(site)/(courses)/`; About and legal policies live under `app/(site)/(legal)/`.
- Tool route source lives under the non-URL route group `app/(site)/(tools)/<tool-slug>/`. A tool may appear in several collections while keeping one route, docs folder, and ownership manifest.
- Do not create new tool URLs under `/<collection>/<tool-slug>`. Add the flat tool to every relevant collection instead.
- Do not use Supabase-backed dynamic routing for normal site pages unless the user explicitly asks for it.
- Keep page URLs stable and human-readable.
- Public publication is controlled only by `public.stack127_pages`.
- Do not add `metadata`, `generateMetadata`, robots rules, canonical URLs, sitemap dates, or page JSON-LD inside page route files.
- Exact published slugs in `stack127_pages` are `index, follow` and appear in `/sitemap.xml`.
- Routes outside a published root return `404`, even if code exists in the repo.
- Child routes under a published root may render, but are `noindex, follow` unless their exact slug is also published in `stack127_pages`.
- Query-param variants of a published page are `noindex, follow` and stay out of the sitemap.

## Docs

- Page-specific docs live under `content_docs/<page-slug>/`.
- Tool docs use only the flat tool slug, even when a collection links to the tool.
- The folder name must match the page slug, for example `content_docs/self-host-apps/`.
- Sitewide docs live under `stack127_docs/`.
- Current operating truth belongs in `stack127_docs/`. Dated decisions, migrations, and completed work belong in `stack127_records/YYYY-MM-DD-<topic>.md`. A record may explain why the current rule exists, but it does not override a current doc.
- Do not recreate the old `content/` prose workflow.

## Scripts

- Page-specific scripts live under `scripts/<page-slug>/`.
- Temporary page scripts live under `scripts/<page-slug>/temp/`.
- Sitewide scripts live under `scripts/stack127/`.
- Do not add one-off scripts to `package.json`.
- Durable package scripts should include the page slug, for example `self-host-apps:refresh-github`.

## Tests

- Every route has one ownership manifest under `tests/pages/<route>/page.json`; `/` uses `tests/pages/home/page.json`.
- Put tests that protect one page beside that page manifest.
- Keep route-family tests in that family's `shared` folder and sitewide tests in `tests/stack127/`.
- The ownership manifest is the index for the page's docs, tests, scripts, skills, and local page artifacts. External repositories are tracked in `stack127_docs/public-repositories.md`, not copied into this repository.

## External repositories

- The private source-of-truth repository is `stack127labs/stack127`.
- External repositories belong to the `stack127labs` GitHub organization.
- External repositories are independent source-of-truth repositories. Do not keep nested checkouts, tracked copies, submodules, or runtime/build dependencies under this repository.
- Track external repository visibility, remotes, branches, source-of-truth boundaries, version/revision status, and deliberate manual-port relationships in `stack127_docs/public-repositories.md`.
- Clone an external repository separately under `/home/teja/projects/<repo-name>` when editing it. Run its own quality gate and CI from that checkout.
- If private and external projects need similar code, port a deliberate snapshot and record the source release/commit; never create an implicit cross-repository dependency.

## Skills

- Page-specific agent skills live under `skills/<page-slug>/<skill-name>/`.
- Sitewide agent skills live under `skills/stack127/<skill-name>/`.
- Keep repo skills as the canonical source.
- `.agents/skills` and `.claude/skills` are symlink adapters to `skills/`; do not replace them with copied folders.
- Global Codex or Claude-facing skill installs should be copied or symlinked from the repo.
- For self-host app work, use skills under `skills/self-host-apps/` before creating new ad hoc workflows.
- For Stack127 page work, read `skills/stack127/test-driven-page/SKILL.md` before changing routes, SEO behavior, or publication state.
- For production release or deployment work, read `skills/stack127/stack127-release-e2e/SKILL.md` before touching the release workflow, Dokploy, Cloudflare Access, or production verification.
- For generated cover image intake, read `skills/stack127/cover-image-intake/SKILL.md`; remove junk metadata but keep clean SEO-friendly metadata in the final JPG when tooling supports it.

## Environment

- `.env.local` is for managed development Supabase and should contain its development `DATABASE_URL`; do not run a local Docker Supabase stack.
- `.env.database` is for production database values. At minimum, production deploys need `DATABASE_URL`; Supabase API keys can also live there when a feature uses them.
- `.env.deploy` is for VPS, Cloudflare, Dokploy, and deployment automation values.
- `.env.analytics` is for analytics values such as Umami URL and site ID when needed.
- `.env.homelab` is for homelab host and local administration values.
- `.env.repos` is for local GitHub CLI and external-repository automation values.
- Keep the full secret-free key and runtime inventory aligned with `stack127_docs/environment-inventory.md` and the tracked `*.example` schemas.
- Next.js automatically reads normal Next env files such as `.env.local`. Custom split env files must be loaded explicitly by deploy tooling, scripts, command flags, or a script-level env loader.
- Never commit secrets.

## Remote Local Development

- When a task is running on the homelab through Codex and the user asks for a localhost link, return a Tailscale URL that the user's remote Mac can open. Do not return `localhost` or `127.0.0.1` as the user-facing link.
- Stack127's `dev` and `start` scripts bind Next.js to `0.0.0.0` on port `3333`, so the app is reachable through the homelab's Tailscale interface without exposing it to the public internet.
- Run `tailscale status` to find the current Tailscale IPv4 for this host (`teja-homelab`), then use `http://<tailscale-ip>:3333/<route>`. The address is not permanent; do not assume an old Tailscale IP.
- Keep `localhost:3333` and `127.0.0.1:3333` for checks executed on the homelab itself. See `stack127_docs/local-development.md` for the full handoff and troubleshooting steps.

## Production Deployment

- The only Stack127 production target is the dedicated OVH VPS recorded in `scripts/stack127/deployment/targets.json`.
- The only production Dokploy dashboard is `https://dokploy.stack127.com`.
- `https://dokploy.ravitejaknts.com` and the Hostinger shared VPS are legacy infrastructure and must never receive a Stack127 deployment.
- Never infer that production DNS should change because a deploy landed on a different server. Verify the deployment target first.
- Before any production deployment, run `npm run stack127:deploy:preflight`. Stop if it fails.
- A production release must satisfy `HEAD = origin/main = OVH Dokploy deployment commit = live production revision`.
- Read `stack127_docs/production-deployment.md` before deploying or changing deployment credentials, server access, Cloudflare, or Dokploy configuration.

## Before Changing Data Or Structure

- Read the relevant page docs in `content_docs/<page-slug>/`.
- Check `scripts/scripts.json` and the page script manifest.
- Keep migrations, seeds, docs, scripts, and UI aligned when a schema or data workflow changes.
- `public.open_projects` is the shared source of truth for open-source and source-available projects. Keep `source_model` accurate and read `stack127_docs/open-projects.md` before changing it.
- Page directories query the shared table by explicit fields such as `self_hosting_status`; do not create another project table for each directory.
- Keep broad discovery in `open_project_candidates`. Discovery must not publish, classify categories, or turn GitHub topics into editorial facts.
