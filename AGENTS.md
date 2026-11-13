# stack127 agent guide

## Talking to the owner

- Write small, direct messages in simple, everyday English.
- Give the clear details: what you did, what's next, and what you need from the owner.
- Use short lists instead of long paragraphs.
- Avoid jargon. If a technical word is needed, explain it in a few plain words.

stack127 publishes tools, directories, references, courses, and useful content for indie hackers, solo developers, and digital creators. Read `stack127_docs/product-direction.md` for product scope.

## Agent roles

Follow the agent system in your global instructions (the "Agent system" section, managed in the Cockpit repo). It says which model each role is and how work is handed over, checked and reported. This guide only says which role does which work here. If that section is missing, for example in GitHub Actions, do the work yourself and say so.

| Work | Role | Effort |
| --- | --- | --- |
| Pages, components, styles, card art, design, site copy, SEO planning | `designer` | The higher level for frontend builds |
| `lib/`, API routes, scripts, migrations, tests, backend changes, infra planning | `coder` | The higher level for hard or risky work |
| Code review before a push | `reviewer` | The higher level for hard or risky work |
| Research, mass data gathering, data work | `researcher` | The higher level for deep research |

The agent the user talks to is the `lead`.

- A "shared" file, such as a skill or a general doc, doesn't decide the role. The task does: SEO planning and copy go to the `designer`, SEO runtime code goes to the `coder`, and research deliverables go to the `researcher`.
- The roles guide who does the work and who reviews it. They do not restrict which files an agent may edit when the task needs a cross-role change.
- A worker whose task needs another role does its part and lists the rest under "Needs other roles".
- Only the `lead` pushes, deploys, or writes production data, after the user authorizes it and the review passes. A worker may do it only when the `lead`'s task says so explicitly and names the reviewed commit or the exact data changes.
- Use the workspace T3 assigned. Do not create local branches or switch branches for a task. An agent already in a worktree does its work there, without adding another branch. The `lead` releases reviewed code through a pull request merged into `main`. Docs-only changes may go straight to `main`. T3 auto-pull updates the main checkout when enabled. Preserve branches attached to other agents' active worktrees.
- Workers may dry-run and apply development tool-page updates through the catalog, version, and repository-sync commands, or stage and verify selected tool and directory batches through the publishing commands. Use `--environment development` and verify the result.
- Never name a model in docs or skills. Name the role.

## Work clearly

- Use simple English and short status updates.
- Read `stack127_docs/writing-style.md` before writing or reviewing website copy. It is the only writing style guide, including visual choices, SEO wording, and editing. Use its plain language for chat and documentation too.
- Read `stack127_docs/page-content.md` before writing, moving, or reviewing page content.
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
- Directory source lives in `app/(site)/(directories)/`, including stable fact pages such as `/tld-directory`.
- Course source lives in `app/(site)/(courses)/`.
- Home, about, privacy, terms, and labs live in `app/(site)/(site-pages)/`.
- Tool source lives in `app/(site)/(tools)/<slug>/`. Every tool uses the same flat folder. Code shared by a tool family lives in `app/ui/tools/`.
- `public.stack127_pages` is the only publication registry.
- Exact published slugs are indexable and enter the sitemap. Unpublished routes return 404.
- Do not add route-owned metadata, robots, canonicals, sitemap dates, or JSON-LD to page files.
- New pages must be static and refreshed only by on-demand revalidation. The conversion of existing pages is pending. Read `stack127_docs/caching.md` before adding a page, route, or data source.
- Page families are `tool`, `directory`, `course`, `catalog`, and `site`. Use the same words in the database and code. Read `stack127_docs/page-families.md`.
- Page content lives in `content/*.mdx` beside each route: the intro, tool usage, article, and named sections. Titles, search metadata, cards, catalog memberships, versions, dates, publication, and every data record stay in the database. Read `stack127_docs/page-content.md`.
- A content change ships with a code release, through a pull request. Most pages still render content from the database. Move a page to MDX with the steps in `page-content.md` before you edit its content. Never edit page content in the database.
- Tool titles, cards, and versions live in `public.stack127_tool_pages`. Read `stack127_docs/tool-pages.md` before changing them.
- Directory titles and card text live in `public.stack127_directory_pages`. Read `stack127_docs/directory-pages.md` before changing them.
- Create, stage, publish, and update the database side of selected tools and directories with `stack127:tools:publish` or `stack127:directories:publish`. Read `stack127_docs/page-publishing.md`. Prepare a frozen batch, preview it, then apply it to development and check the real pages. After release authorization, dispatch the production batch to GitHub against the deployed main SHA. A database commit alone is not completed publication; public verification must pass.

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
- Route, shared runtime, SEO, or production configuration changes get their build from pull request CI on GitHub. Don't build locally.
- Do not run a full-site browser suite for ordinary page work.
- Do not test documentation, skill wording, hashes, receipts, exact copy, or internal file structure.

## Skills

- General page work: `skills/stack127/page-build/SKILL.md`.
- Tool pages, new or reworked: `skills/stack127/stack127-tool-page/SKILL.md`. One tool at a time, with the owner: the plan and the copy each wait for their yes.
- Tool page and tool catalog copy: `skills/stack127/stack127-tool-copywriting/SKILL.md`, with `stack127_docs/writing-style.md`. Use these repo files instead of any personal or synced copy skill.
- Directory page copy, including rewrites of live pages: `skills/stack127/stack127-directory-writing/SKILL.md`.
- Production release: `skills/stack127/stack127-release-e2e/SKILL.md`.
- Self-host app work: skills under `skills/self-host-apps/`.
- Generated cover images: `skills/stack127/cover-image-intake/SKILL.md`.
- `.agents/skills` is a symlink adapter to the canonical `skills/` folder.
- `.claude/skills` holds one symlink per skill folder, because Claude Code only finds skills one level deep. When you add or rename a skill, add or update its link there.

## Homelab

Scheduled ad-networks collectors, syncs, snapshots, and backups run on OVH. Weekly niche sorting runs on homelab. Other scheduled project automation stays on homelab.

- Development uses managed Supabase from `.env.local`. Do not start a local Docker Supabase stack.
- `npm run dev` and `npm run start` bind to `0.0.0.0:3333`.
- Long-running servers are background services, not failed commands. Start one, wait for readiness, reuse it, and stop it when finished.
- Give the user the current Tailscale URL, not localhost. Read `stack127_docs/homelab-development.md`.
- Split secrets stay in `.env.local`, `.env.database`, `.env.deploy`, `.env.analytics`, `.env.homelab`, and `.env.repos`. Infisical is their source: change values with `infisical-env set`, not by editing the files. See `stack127_docs/environment-inventory.md`.
- When you add, move, rename, or remove a scheduled job, workflow, or server timer, update its entry in `stack127_docs/monitoring.json` in the same change. Read `stack127_docs/automation-monitor.md`.
- Before you add or change anything that runs without a person (a timer, cron job, worker, T3 schedule, or scheduled workflow), read `workflow/runners.md` in the Cockpit checkout (`/srv/data/projects/cockpit` on the homelab, `~/projects/cockpit` on the Macs) and follow it. It has to survive restarts, crashes, and overloads.

## Production

- The production backend target is the OVH application in `scripts/stack127/deployment/targets.json`.
- The only production Dokploy dashboard is `https://dokploy.stack127.com`.
- The Hostinger target and `https://dokploy.ravitejaknts.com` are retired for stack127.
- Builds and release checks run on GitHub, not on the homelab. Don't run `npm run build` locally. Code goes through a pull request, where CI runs the core tests and the build. Merging it deploys.
- "Push to prod" means the whole release: pull request, CI fixes, merge, deploy, and production data steps such as registry rows.
- A release is complete only when the merge commit, `origin/main`, the deployed image SHA, and live health SHA match.
- In Cloudflare hosting mode, free static assets serve public pages. OVH keeps the API and stays the rollback site. Read the hosting switches and cutover sequence in `stack127_docs/cloudflare.md` before release, cache, or SEO work. A Cloudflare release is complete only when `/frontend-release.json` also shows the merge commit.
- Read `stack127_docs/production-deployment.md` and the release skill before deployment work.

## Data and repositories

- Read relevant page docs and script manifests before changing data or structure.
- Keep migrations, scripts, docs, and UI aligned when a schema or data workflow changes.
- `public.self_host_apps` owns published self-host app data. Discovery candidates do not publish or assign editorial facts.
- Independent stack127 repositories live under `stack127labs` and are cloned separately under `/srv/data/projects/`.
- Do not add nested checkouts, submodules, copied repositories, or hidden cross-repository dependencies.
