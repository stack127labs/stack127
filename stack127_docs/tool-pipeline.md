# Tool pipeline

The main agent starts each round, checks each handoff, and does not repeat completed work. Research lives in `content_docs/<slug>/research.md`. The plan lives in `content_docs/<slug>/tool-spec.md`. The pipeline continues from a working tool through writing, development integration, and independent audit without a manual writing pause. No acceptance receipt, hashes, evidence folder, ownership manifest, or stage validator is required.

## Order and models

Always use the newest available Sol and Luna models. Do not pin a version number. The main agent runs on the newest Sol at `high` reasoning.

| Round | Work | Runs in | Model | Reasoning | Output |
| --- | --- | --- | --- | --- | --- |
| 1 | Deep research and competitor review | GPT worker | Newest Luna | `max` | `research.md` |
| 2 | Product, interface, and component plan | Claude Code planning session | `claude-opus-5-5` | `medium` | New `tool-spec.md` with why people will choose it, Product with backend contract, Interface, catalog placement, card art brief, and new or improved shared components |
| 3 | Backend build | GPT worker | Newest Luna | `max` | Engine, API routes, data scripts, development preview row, and focused correctness test. No UI. |
| 4 | Frontend build | Claude Code planning session | `claude-opus-5-5` | `high` | Route page, interface, tool components, styles, card art, and desktop and mobile checks |
| 5 | Content plan and writing | Claude Code writing session | `claude-opus-5-5` | `medium` | Content section, title, page copy, interface words, SEO text, and catalog card copy |
| 6 | Development content integration | GPT worker | Newest Luna | `max` | Integrated development page and catalog memberships |
| 7 | Independent audit | GPT worker | Newest Sol | `high` | Release verdict and defects routed to their owner |

Luna builds the backend. Opus builds everything people see: the page, interface, components, styles, card art, and copy.

Workers do not delegate. Start each worker without unrelated conversation context. Once the Content section and copy are ready, pass the draft to integration without waiting for user copy.

## Claude Code sessions

The main agent runs planning, frontend, and writing itself through the Claude Code CLI. It does not start a GPT worker for these rounds. Planning and frontend share one retained session, and writing gets its own, so follow-ups go back to the session that did the work. Use `--effort medium` for planning and writing, and `--effort high` when resuming the planning session for the frontend build and its fixes.

Start a session from the repo root with a new UUID:

```sh
claude -p --model claude-opus-5-5 --effort medium \
  --permission-mode bypassPermissions --session-id <uuid> "<prompt>"
```

Send follow-ups to the same session:

```sh
claude -p --model claude-opus-5-5 --effort medium \
  --permission-mode bypassPermissions --resume <uuid> "<follow-up>"
```

The prompt names the skill files to follow, the tool, route, spec path, allowed files, and stop condition. Keep the planning and writing session IDs until the audit passes. If Claude Code is unavailable or the session fails, stop and report it. Do not fall back to a GPT planner, frontend builder, or writer.

## Main-agent job

For each round:

1. Start the assigned skill with the tool, route, repo, spec path, allowed files, and stop condition.
2. Read the result and relevant diff.
3. Return concrete missing or incorrect work to the same worker or Claude Code session.
4. Start the next round when the output is usable.

After planning, the main agent reads the spec against the research. It checks that the plan answers what searchers need, beats the competitors in concrete ways, names the components to use, has a backend contract precise enough for two builders to meet in the middle, and is clear enough to build without guessing. Suggestions, planning gaps, missing component work, and weak product decisions go back to the planning session. Luna builds the backend to the contract and reports gaps instead of redesigning. Backend defects, wrong answers, and data bugs go back to Luna. Contract gaps go to the planning session. Frontend, layout, interaction, and card art problems go to the planning session at high effort. Copy problems go back to the writing session.

For writing, return factual or missing-copy corrections to the writing session first. Then ask that session to make the complete page copy easier for a general reader to follow. Preserve every useful detail and qualification; explain hard ideas plainly, with a short example where it helps, without dragging out the page. Check the revised draft before integration. After integration, read the rendered page from start to finish. Every sentence should make sense as public-facing copy. Send stray research notes, source labels, insider wording, unclear sentences, or lost detail back to the writing session, then reintegrate and check the affected copy. Keep useful source links in the page; research notes and citation markers belong only in the handoff.

The main agent does not rerun research or repeat browser work. It checks the tool and runs the core tests and one production build after route and runtime work. If integration or audit later changes code, it reruns only the checks affected by that change.

## Research and tool spec

Use `stack127_docs/writing-style.md` for how to write, formats, and search wording, [shared-ui.md](shared-ui.md) for components and their syntax, and the tool writing skill for everything specific to tool pages. Page copy uses existing components only.

Luna writes `research.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/research-template.md`. It records scope, search intent, user problems, verified facts, 5 to 8 competitor reviews, a comparison table, disagreements, how stack127 can win, blockers, and sources.

Opus starts `tool-spec.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/tool-spec-template.md`. The spec links to research instead of copying it. In the writing session, Opus first completes the Content section, then drafts from the finished spec and actual tool in the same session.

- "Why people will choose this tool" records what the searcher is trying to decide, where top results fail, and what this tool does better.
- Product records the job, scope, technical contract, important states, and independently known examples.
- Product names one primary catalog and any secondary catalogs, in rank order, with a reader-task reason for each. It also gives the new tool card one visual takeaway, focal subject, and supporting relationship for a `toolSpot` marker drawing. A missing catalog is a separate catalog page task for the main agent.
- Interface records controls, result order, components, states, accessibility, and responsive behavior. It names which existing shared components the frontend uses and which new or improved shared components the planner built.
- Content records search intent and title, reader questions and where each is answered, the intro, usage, and content outline, facts and limits, and next steps.

Keep the spec concise. Add detail when it changes the product or prevents a wrong answer. Do not create IDs, fingerprints, duplicated contracts, or status machinery.

## Verification

- Calculation, parser, and resolution logic gets a small focused unit test with independent examples.
- The planner checks each new or changed shared component in the `/components-ui` gallery and on the page types that already use it, at desktop and mobile width in both themes.
- The backend gets one focused test and a direct check of one correct and one invalid example.
- The frontend step checks the actual page at desktop and mobile width in both themes with one correct and one invalid example.
- The frontend step uses `$marker-art-draw` to create a spec-backed `toolSpot`, generates its SVG and TypeScript export, and registers a tool-specific key in `lib/tool-catalog-art.ts` before the main build. The drawing must be recognizable at card size. A generic icon is not the finished art for a new tool.
- When the in-app browser is unavailable over SSH, use the local headless browser in `skills/stack127/references/homelab-browser-and-search.md` for these checks and the later audit.
- A new database-backed route needs a development preview row to render. Use only minimal, clearly marked placeholder intro and content in that row until the writing stage supplies final copy. Preserve any existing row and do not treat the placeholder as finished writing.
- After both the backend and frontend are done, the main agent runs `npm run test:core` and `npm run build` once. The build already checks TypeScript.
- Writing hands its final plain-language title, SEO text, interface words, catalog card name and description, and temporary Markdown files to integration. The live copy belongs in the database, not the spec or route.
- The main agent confirms all planned catalogs exist before integration. A new catalog needs its own registry, content, art, and page review.
- Integration dry-runs and applies the card fields, tool-specific art key, and full ordered membership list in development with `npm run stack127:tool-page:catalogs:update`. It checks the actual tool and each assigned catalog card at desktop and mobile width in both themes. Run a new build only if integration or audit changes route, runtime, or SEO code.
- The auditor checks accuracy, content, catalog cards and placement, including whether the new tool's marker drawing reads clearly at its rendered size in both themes, and the common user flow. It reports each defect with its owner: backend, frontend, or copy. The main agent sends each one to Luna, the planning session, or the writing session, then reruns only the affected checks.

Do not run a full-site browser suite for one tool.

## Publication and release

Development preview publication is allowed inside an authorized tool pipeline so the actual database-backed route can be reviewed. Memberships may be prepared before publication; catalog cards appear only for published tools. After the audit, hand the user the complete spec, verified development preview, and release verdict. Production data, commit, push, and deployment still require authorization.

When release is authorized, use the approved production content workflow and `$stack127-release-e2e`. The release workflow runs the minimum gate, builds one image, deploys it, and checks the live revision and core public endpoints.
