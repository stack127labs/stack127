# stack127 agent guide

stack127 publishes tools, directories, references, courses, and useful content for solo builders, indie hackers, content creators, and tech tinkerers. Read `stack127_docs/product-direction.md` for product scope.

## Work clearly

- Use simple English and short status updates.
- Read `stack127_docs/writing-style.md` before writing or reviewing website copy. It is the only writing style guide, including visual choices, SEO wording, and editing. Use its plain language for chat and documentation too.
- State what is done, what remains, and what is blocked.
- Preserve unrelated worktree changes.
- Do not create process files, evidence, hashes, receipts, or tests unless they protect a real user-visible failure.

## Product quality

- Keep pages fast, server-rendered where useful, easy to read, and easy for search engines to understand.
- Follow `stack127_docs/design-system.md`, `stack127_docs/css-architecture.md`, and `stack127_docs/page-families.md`.
- Use the shared shell, `PageCanvas`, tokens, components, typography, spacing, and route-family patterns.
- Read `stack127_docs/shared-ui.md` before creating controls, tables, charts, callouts, pagination, or dialogs. Use the Components UI gallery at `/components-ui` in development for examples.
- Read `stack127_docs/tool-interface.md` for interactive tools.
- Keep dark mode as the default feel. Unknown is better than fake precision.

## Routes and publication

- Site routes live under `app/`.
- Tools and references use flat public URLs.
- Catalog source lives in `app/(site)/(catalogs)/`.
- Directory source lives in `app/(site)/(directories)/`.
- Reference source lives in `app/(site)/(references)/`.
- Course source lives in `app/(site)/(courses)/`.
- Tool source lives in `app/(site)/(tools)/`. DNS, domain, and storage tools use a shared route-group layout before `<slug>/`.
- `public.stack127_pages` is the only publication registry.
- Exact published slugs are indexable and enter the sitemap. Unpublished routes return 404.
- Do not add route-owned metadata, robots, canonicals, sitemap dates, or JSON-LD to page files.
- Tool content and versions live in `public.stack127_tool_pages`. Read `stack127_docs/tool-pages.md` before changing them.

## Files

- Page docs live in `content_docs/<slug>/`.
- Content pages use `brief.md`. Tools use one `tool-spec.md`.
- Sitewide operating docs live in `stack127_docs/`.
- Page scripts live in `scripts/<slug>/`. Shared scripts live in `scripts/stack127/`.
- Never commit secrets, generated `.next` output, test output, or temporary logs.

## Minimum checks

Read `stack127_docs/quality-workflow.md`.

- Run `npm run quality` for TypeScript and the small core suite.
- Run a focused test for calculations, parsing, data transforms, and important recovery behavior.
- Check the real changed page at desktop and mobile width.
- Codex CLI on the homelab may not have the Mac app's in-app browser. Use a local headless browser for page and interaction checks when that happens. Do not stop to ask for in-app browser access. See `skills/stack127/references/homelab-browser-and-search.md`.
- For a tool, run one correct example and one invalid-input example.
- Run `npm run build` once for route, shared runtime, SEO, or production configuration changes.
- Do not run a full-site browser suite for ordinary page work.
- Do not test documentation, skill wording, hashes, receipts, exact copy, or internal file structure.

## Skills

- General page work: `skills/stack127/page-build/SKILL.md`.
- Tool pipeline: `stack127_docs/tool-pipeline.md` and skills under `skills/stack127/tools/`.
- Existing tool review: `skills/stack127/tools/stack127-tool-audit/SKILL.md`.
- Production release: `skills/stack127/stack127-release-e2e/SKILL.md`.
- Self-host app work: skills under `skills/self-host-apps/`.
- Generated cover images: `skills/stack127/cover-image-intake/SKILL.md`.
- `.agents/skills` is a symlink adapter to the canonical `skills/` folder.

## Homelab

- Development uses managed Supabase from `.env.local`. Do not start a local Docker Supabase stack.
- `npm run dev` and `npm run start` bind to `0.0.0.0:3333`.
- Long-running servers are background services, not failed commands. Start one, wait for readiness, reuse it, and stop it when finished.
- Give the user the current Tailscale URL, not localhost. Read `stack127_docs/homelab-development.md`.
- Split secrets stay in `.env.local`, `.env.database`, `.env.deploy`, `.env.analytics`, `.env.homelab`, and `.env.repos`.

## Production

- The only production target is the OVH application in `scripts/stack127/deployment/targets.json`.
- The only production Dokploy dashboard is `https://dokploy.stack127.com`.
- The Hostinger target and `https://dokploy.ravitejaknts.com` are retired for stack127.
- Run `npm run stack127:deploy:preflight` before a release.
- A release is complete only when `HEAD`, `origin/main`, the deployed image SHA, and live health SHA match.
- Read `stack127_docs/production-deployment.md` and the release skill before deployment work.

## Data and repositories

- Read relevant page docs and script manifests before changing data or structure.
- Keep migrations, scripts, docs, and UI aligned when a schema or data workflow changes.
- `public.self_host_apps` owns published self-host app data. Discovery candidates do not publish or assign editorial facts.
- Independent stack127 repositories live under `stack127labs` and are cloned separately under `/home/teja/projects/`.
- Do not add nested checkouts, submodules, copied repositories, or hidden cross-repository dependencies.
