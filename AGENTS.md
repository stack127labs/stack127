# stack127 agent guide

stack127 publishes tools, directories, references, courses, and useful content for indie hackers, solo developers, and digital creators. Read `stack127_docs/product-direction.md` for product scope.

## Agent roles

Work is split into three lanes. Always follow them, whether you are Claude Code or Codex.

| Lane | Model | Effort | Work |
| --- | --- | --- | --- |
| Opus | Newest Claude Opus | `medium`, `high` for frontend builds | Writing, design, components, frontend, site content, SEO planning, and planning how to do the work |
| Sol | Newest GPT Sol | `high`, `xhigh` for hard or risky work | Code review, backend changes, infra planning, and pushes or deploys the user asked for |
| Luna | Newest GPT Luna | `xhigh`, `max` for deep research | Research, mass data gathering, and data work |

Claude Code sessions are the Opus lane. Codex sessions are Sol by default and Luna when started for research or data.

The agent the user talks to is the coordinator:

1. Do the work in your own lane.
2. Send every other lane's work with `node scripts/stack127/agents/delegate.mjs <opus|sol|luna> "<task>"`. Give the worker the goal, relevant files, constraints, and what to return. Use `--resume <session>` for follow-ups to the same worker. Claude runs delegation in the background and keeps working.
3. Review what comes back and check the diff. Send gaps back to the same worker.
4. Report to the user what each lane did.

Rules:

- Your lane is fixed when your session starts. Don't switch lanes mid-task.
- Delegated workers never delegate again. If a task needs another lane, the worker does its part and lists the rest under "Needs other lanes". The script refuses nested delegation. Workers don't start other CLIs or agents directly, and never turn off a guard.
- Any lane may read files, run checks, and look things up. Changing files in another lane's area is not allowed. `scripts/stack127/agents/lanes.mjs` defines who owns which files, and the lane guard hook blocks edits outside your lane. If the guard blocks you, delegate the work. Don't work around it with scripts or other tools.
- A "shared" file, such as a skill or a general doc, doesn't make another lane's task yours. The task decides the lane: SEO planning and copy go to Opus, SEO runtime code goes to Sol, and research deliverables go to Luna.
- The guard is a safety net, not a wall. Following these rules is what keeps the lanes clean.
- Delegated Claude workers run with full permissions. Pass long or sensitive task text with `--prompt-file`, not on the command line.
- Opus owns pages, components, styles, card art, and copy. Sol and Luna own `lib/`, API routes, scripts, migrations, tests, data, infra, and release.
- Every code change gets a Sol review before it is pushed. Only Sol pushes or deploys, and only when the user asks.
- Give one lane one set of files at a time, so two agents never edit the same file.
- The delegate script picks the newest Sol and Luna. Claude uses the `opus` alias. Never pin a model version in docs or skills.

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
- New pages must be static and refreshed only by on-demand revalidation. The conversion of existing pages is pending. Read `stack127_docs/caching.md` before adding a page, route, or data source.
- Tool content and versions live in `public.stack127_tool_pages`. Read `stack127_docs/tool-pages.md` before changing them.

## Files

- Page docs live in `content_docs/<slug>/`.
- Content pages use `brief.md`. Tools use `research.md` and `tool-spec.md`.
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
- Tool page copy, including rewrites of live pages: `skills/stack127/tools/stack127-tool-writing/SKILL.md`, with `stack127_docs/writing-style.md` and `stack127_docs/shared-ui.md`. Use these repo files instead of any personal or synced copy skill.
- Production release: `skills/stack127/stack127-release-e2e/SKILL.md`.
- Self-host app work: skills under `skills/self-host-apps/`.
- Generated cover images: `skills/stack127/cover-image-intake/SKILL.md`.
- `.agents/skills` is a symlink adapter to the canonical `skills/` folder.
- `.claude/skills` holds one symlink per skill folder, because Claude Code only finds skills one level deep. When you add or rename a skill, add or update its link there.

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
