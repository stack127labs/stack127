# stack127 agent guide

stack127 publishes tools, directories, references, courses, and useful content for indie hackers, solo developers, and digital creators. Read `stack127_docs/product-direction.md` for product scope.

## Agent roles

Work is split into three default lanes. Every model follows them unless the user explicitly changes routing for a task, as described below.

| Lane | Model | Effort | Work |
| --- | --- | --- | --- |
| Opus | Newest Claude Opus | `medium`, `high` for frontend builds | Writing, design, components, frontend, site content, SEO planning, and planning how to do the work |
| Sol | Newest GPT Sol | `high`, `xhigh` for hard or risky work | Code review, backend changes, and infra planning |
| Luna | Newest GPT Luna | `xhigh`, `max` for deep research | Research, mass data gathering, and data work |

Claude Code sessions are the Opus lane. Codex sessions are Sol by default and Luna when started for research or data.

The agent the user talks to is the coordinator:

1. Do the work in your own lane.
2. Send every other lane's work with `node scripts/stack127/agents/delegate.mjs <opus|sol|luna> "<task>"`. Give the worker the goal, relevant files, constraints, and what to return. Use `--resume <session>` for follow-ups to the same worker. Claude runs delegation in the background and keeps working.
3. Review what comes back and check the diff. Send gaps back to the same worker.
4. Report to the user what each lane did.

Rules:

- Your default lane is fixed when your session starts. A task exception grants named file access without changing that default lane.
- Delegated workers never delegate again. If a task needs another lane, the worker does its part and lists the rest under "Needs other lanes". The script refuses nested delegation. Workers don't start other CLIs or agents directly, and never turn off a guard.
- Any lane may read files, run checks, and look things up. Changing files in another lane's area requires an explicit-user task exception. `scripts/stack127/agents/lanes.mjs` defines who owns which files, and the lane guard hook blocks edits outside your lane. If the guard blocks you, use the approved exception or delegate the work. Don't work around it with scripts or other tools.
- Workers may dry-run and apply development tool-page updates through the guarded content, catalog, version, and repository-sync commands. Use `--environment development` and verify the result. These commands reject development credentials that point to production. Other data scripts need a verified development workflow before a worker applies them.
- A "shared" file, such as a skill or a general doc, doesn't make another lane's task yours. The task decides the lane: SEO planning and copy go to Opus, SEO runtime code goes to Sol, and research deliverables go to Luna.
- The guard is a safety net, not a wall. Following these rules is what keeps the lanes clean.
- Delegated Claude workers run with full permissions. Pass long or sensitive task text with `--prompt-file`, not on the command line.
- Opus owns pages, components, styles, card art, and copy. Sol and Luna own `lib/`, API routes, scripts, migrations, tests, data, and infra.
- Every code change gets a Sol review before it is pushed, subject to the user's explicit review and delegation restrictions below.
- The coordinator owns release approval. After the user authorizes production work and the Sol review passes, the coordinator may release itself or approve a worker as described below. Workers without that approval cannot push, deploy, or write production data.
- Give one lane one set of files at a time, so two agents never edit the same file.
- By default, the delegate script picks the newest Sol and Luna. Claude uses the `opus` alias. A task exception can select a user-named model. Never pin a default model version in docs or skills.

### Explicit user routing for one task

The user can override the default lane and model assignments for a named task. This applies to every coordinator, including Claude, Codex, Grok, and Gemini. Use an exception only when the user explicitly says something such as "do not delegate", "do not use Claude", or "use this model to do that". A usage limit, a guard failure, or your own preference does not authorize an exception.

- Follow the user's instruction without asking for the same permission again. "Do not delegate" means the coordinator does the work itself. "Do not use Claude" excludes Claude from delegation and fallback; keep any other routing restrictions the user gave. A named model must do the assigned work; do not substitute another model or fall back unless the user permits that too.
- Record the task, the user's exact routing instruction, the current session ID, the exact files that need access outside the coordinator's lane, and any permitted worker tools and named models. Keep file lists small. Use `task-exception.mjs extend --file <path>` to add files needed for the same authorized task; it preserves the routing and expiry. Default lane ownership stays unchanged.
- The agent handles the exception itself. Do not ask the user to run the helper or repeat an already explicit routing instruction. Create the temporary exception with `node scripts/stack127/agents/task-exception.mjs create`. Use `--task`, `--user-instruction`, and repeated `--file` paths. Choose `--no-delegate`, or list permitted tools in attempt order with repeated `--tool claude|codex|grok|agy`. Use `--model tool=model-id` when the user names a model. Never add a tool the user excluded. Repeating `create` for the same task, instruction, and routing reuses its exception and adds named files without resetting expiry.
- The helper uses `CODEX_THREAD_ID` or `CLAUDE_SESSION_ID` when available. Otherwise pass `--session <current-session-id>` from the current conversation. Exceptions live in ignored `tmp/agent-task-exceptions/`, match one checkout and session, and expire after 24 hours. Use `task-exception.mjs renew` only for the same unfinished task under the existing user authorization. Renewal keeps its files, instruction, and routing.
- The lane guard permits the coordinator to edit only the listed files outside its lane. Delegated workers keep their task's lane even when another model does the work. Workers cannot create, reuse, or remove coordinator exceptions, or delegate again. Production work still needs separate coordinator approval. Never turn off the guard.
- For permitted delegation, use the existing `delegate.mjs <lane>` command. It applies the exception's tool and model restrictions. Optional `--tool` and `--model` must match the exception. Pass `--task-session <current-session-id>` if the coordinator's session ID is unavailable in the environment. Do not launch workers directly or use another delegation mechanism to avoid these restrictions.
- Keep required checks and review. Use a Sol review when the user's routing permits it. If the user requires one model and excludes a separate Sol worker, that model reviews the final diff itself and reports that the review was not independent. An exception does not authorize publishing, deployment, or production writes.
- Remove the temporary exception with `node scripts/stack127/agents/task-exception.mjs remove` when the task finishes, is cancelled, or the user revokes the override. Do not remove the permanent rule or unrelated exceptions. Report whether you worked directly or used the user-selected model.

For example, after the user explicitly requests no delegation:

```bash
node scripts/stack127/agents/task-exception.mjs create \
  --task "Fix shared links" \
  --user-instruction "Do not delegate this task" \
  --file 'app/ui/tools/use-initial-query.ts' \
  --no-delegate
```

Use `status` to inspect the current exception. After the work and checks finish, use `remove`. The default routing rules apply again.

### Coordinator approval for worker production work

Once the user authorizes the production task and review passes, the coordinator can use `delegate.mjs <lane> --approve-release <full-reviewed-commit-sha> "<release task>"`. A worker may push only that reviewed commit to `origin/main` and deploy it with the release skill. If HEAD changes, the approval no longer permits release. Review the new commit before granting another approval. Approval does not change file ownership or permit nested delegation.

For separate production data commands, add `--approve-production-data` and describe the exact changes in the worker's task. The worker must dry-run, check the proposed rows, apply only those changes, and verify them. Release approval covers the reviewed release workflow and its required migrations, but no separate production data commands. Data approval alone does not permit pushing or deployment.

The helper creates approval for one worker run, lane, checkout, and task. It expires after 24 hours. New runs and follow-ups get no inherited production approval. The coordinator can approve another run within the same user-authorized task without asking the user again. Workers cannot grant or edit approval. Approved Codex workers use automatic approval review for sandbox requests. The sandbox, lane hook, and credential permissions still apply.

Fallback when a tool is out of limits:

- By default, Claude and Codex handle all work end to end. Grok and Gemini are used only when the worker's normal tool is out of usage or rate limits, or when the user explicitly selects them for a task. A normal failure is not a reason to fall back.
- Unless a task exception restricts routing, the delegate script falls back in this order: the normal tool (Claude for Opus work, Codex for Sol and Luna work), then Grok (`grok`, newest main Grok model, Grok 4.7 today), then Gemini in Antigravity (`agy`, newest Gemini Flash High, Gemini 3.8 Flash today).
- Fallback workers follow the same lanes, skills, and rules. Their results get a Sol review before anything is pushed, when Codex is available.
- Our lane guard hooks don't run in Grok or Antigravity. Grok's own deny rules block edits to existing files in the other lane, but not new files or indirect writes. Antigravity's sandbox doesn't enforce lanes at all. Check every fallback diff before moving on.
- If every tool is out of limits, stop and tell the user which tools were tried.
- Fallback covers delegated workers only. If the coordinator itself runs out, the user continues in the other tool.

Reporting:

- If a fallback was used, say so in your final message, for example: "Fallback used: Codex hit its usage limit, so Grok (grok-4.7) did the backend change."
- If delegated work is still running when you reply, end the message with "Task is not done yet." and name each tool and task, for example: "Task is not done yet. Codex is working on the KDP royalty backend."

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
