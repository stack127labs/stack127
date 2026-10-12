# Tool pipeline

The main agent starts each round, checks each handoff, and doesn't repeat finished work.

Research lives in `content_docs/<slug>/research.md`. The plan lives in `content_docs/<slug>/tool-spec.md`.

The pipeline runs from a working tool through writing, development integration, and an independent audit. There's no manual pause for writing. You don't need an acceptance receipt, hashes, evidence folder, ownership manifest, or stage validator.

## Order and models

Lanes and models follow "Agent roles" in `AGENTS.md`. The main agent is the coordinator, whether it's Claude Code or Codex. It starts each round with T3's `delegate_task`, unless the round is in its own lane, so the user can watch each worker.

| Round | Work | Lane | Effort | Output |
| --- | --- | --- | --- | --- |
| 1 | Who uses the tool, deep research, and competitor review | Luna | `max` | `research.md` |
| 2 | Product, interface, and component plan | Opus, planning session | `medium` | New `tool-spec.md` with why people will choose it, Product with backend contract, Interface, catalog placement, card art brief, and new or improved shared components |
| 3 | Backend build | Sol | `high`, or `xhigh` for risky logic | Engine, API routes, data scripts, development preview row, and focused correctness test. No UI. |
| 4 | Interface build | Opus, same planning session | `high` | Tool components, styles, and every word in them |
| 5 | Content plan and writing | Opus, same planning session | `medium` | Content section, title, the route's `content/*.mdx` files, interface words, SEO text, and catalog card copy |
| 6 | Integration | Luna, its own session | `xhigh` | Route and content wiring, card art, publish manifest, development page, catalog memberships, and the full desktop and mobile checks |
| 7 | Independent audit | Sol | `high` | Release verdict and defects routed to their owner |

Sol builds the backend. The Opus planning session plans the tool, designs and builds what people see, and writes every word. Integration connects it all and checks it.

Workers don't delegate. Start each worker without unrelated conversation context.

Once the Content section and copy are ready, pass the draft to integration. Don't wait for copy from the user.

## Pace

The homelab hardware is limited, so go slow unless the user asks for speed. Work on one tool at a time, with no more than one or two agents running at once. Take a tool through its audit before starting the next. Work that several tools share, such as one engine they all use, can be built once up front.

When the user asks to go fast, tools can run in parallel, but browser checks still run one at a time.

## Sessions

Each round's worker keeps its session, so follow-ups go back to the worker that did the work.

`delegate_task` returns a `childThreadId`. Send follow-ups to that thread with `t3_thread_send`, wait for them with `t3_thread_wait`, then read the reply with `task_status`.

Planning, interface, and writing share one Opus session. The session that plans the tool writes every word in it and on its page, so labels, hints, and content agree. That session works on one tool only, so all its attention goes to that tool's users and searchers. Never give it a second tool, and never give it integration work: route wiring, card art, publishing, and check runs make it mechanical.

Research, backend, integration, and audit workers usually get one tool each too. The main agent can share one across tools when the work is small and alike. The independent audit gives the fresh read. Keep the thread IDs until the audit passes.

The prompt names the skill files to follow, the tool, route, spec path, allowed files, and stop condition.

If a worker is unavailable or fails, stop and report it. Don't fall back to another lane.

## Main agent's job

For each round:

1. Start the assigned skill with the tool, route, repo, spec path, allowed files, and stop condition.
2. Read the result and the relevant diff.
3. Send specific missing or wrong work back to the same worker or Claude Code session.
4. Start the next round when the output is usable.

After planning, read the spec against the research. Check that the plan:

- Takes a clear position on who most users are and their top 2 or 3 questions. Send back a spec that treats every input as equally important.
- Answers those questions in Basic with the fewest inputs most people know offhand.
- Keeps every Advanced field optional, and gives each one a reason and an audience.
- Opens on realistic example values with their result, and names the button for the result.
- Keeps the depth pros need in Advanced, and drops no capability the research or the old tool had without a reason.
- Shows a published comparison only where the research found matching data, and never grades.
- Answers what searchers need.
- Beats the competitors in specific ways.
- Names the components to use.
- Has a backend contract precise enough for two builders to meet in the middle.
- Is clear enough to build without guessing.

Route each problem to its owner:

| Problem | Goes to |
| --- | --- |
| Suggestions, planning gaps, missing component work, weak product decisions | Planning session |
| Contract gaps | Planning session |
| Design, layout, and interaction problems | Planning session, at high effort |
| Backend defects and wrong answers | Sol |
| Data, wiring, and card art bugs | Integration session |
| Copy problems | Planning session |

Sol builds the backend to the contract. If the contract has gaps, Sol reports them instead of redesigning.

### Checking the writing

Send factual fixes and missing copy back to the planning session first. Then ask it to make the full page copy easier for a general reader to follow.

The rewrite keeps every useful detail and qualification. It explains hard ideas plainly, with a short example where it helps, without dragging the page out. Check the revised draft before integration.

After integration, read the rendered page from start to finish. Every sentence should make sense as public copy.

Send these back to the planning session, then reintegrate and check the affected copy:

- Stray research notes or source labels.
- Insider wording.
- Unclear sentences.
- Lost detail.

Keep useful source links in the page. Research notes and citation markers belong only in the handoff.

### What the main agent doesn't redo

The main agent doesn't rerun research or repeat browser work. It checks the tool and runs the core tests. Pull request CI runs the build.

If integration or audit later changes code, rerun only the checks that change affects.

## Research and tool spec

| For | Use |
| --- | --- |
| How to write, formats, and search wording | `stack127_docs/writing-style.md` |
| Components and their syntax | [shared-ui.md](shared-ui.md) |
| Everything specific to tool pages | The tool writing skill |

Page copy uses existing components only.

Luna writes `research.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/research-template.md`. It starts with who uses the tool and the questions they bring. Then it records scope, search intent, user problems, verified facts, published comparison data, 5 to 8 competitor reviews, a comparison table, disagreements, how stack127 can win, blockers, and sources.

Opus starts `tool-spec.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/tool-spec-template.md`. The spec links to the research instead of copying it.

After the interface, the same Opus session completes the Content section, then drafts from the finished spec and the actual tool.

| Spec section | Records |
| --- | --- |
| People and questions | Who most users are and their top questions, what Basic answers, what Advanced holds and for whom, and what's left out and why. A position, with reasons. |
| Why people will choose this tool | What the searcher is trying to decide, where top results fail, and what this tool does better. |
| Product | The job, scope, technical contract, important states, and independently known examples. |
| Product: catalogs and card art | One primary catalog and any secondary catalogs, in rank order, each with a reason based on the reader's task. One visual takeaway, focal subject, and supporting relationship for the new card's `toolSpot` marker drawing. A missing catalog is a separate catalog page task for the main agent. |
| Interface | Basic and Advanced inputs with their hints, when the result shows, the visual result, any comparison, controls, result order, components, states, accessibility, and responsive behavior. It names the existing shared components the frontend uses and the new or improved shared components the planner built. |
| Content | Search intent and title, reader questions and where each is answered, the intro, usage, and content outline, facts and limits, and next steps. |

Keep the spec short. Add detail only when it changes the product or prevents a wrong answer. Don't create IDs, fingerprints, duplicate contracts, or status machinery.

## Verification

| Step | Check |
| --- | --- |
| Calculation, parser, and resolution logic | A small focused unit test with independent examples. |
| Planner | Each new or changed shared component in the `/components-ui` gallery and on the page types that already use it, at desktop and mobile width in both themes. |
| Backend | One focused test, plus a direct check of one correct and one invalid example. |
| Interface | The planning session looks at the real page at desktop and mobile width as a first-time visitor. |
| Integration | The actual page and its catalogs at desktop and mobile width in both themes, with one correct and one invalid example. |

Integration also makes the card art. It uses `$marker-art-draw` to create a spec-backed `toolSpot`, generates its SVG and TypeScript export, and registers a tool-specific key in `lib/card-art.ts` before the main build. The drawing must be recognizable at card size. A generic icon isn't finished art for a new tool.

When the in-app browser isn't available over SSH, use the local headless browser in `skills/stack127/references/homelab-browser-and-search.md`. That applies to these checks and the later audit.

A new database-backed route needs reviewed development rows to render. Use the publisher for its title, search metadata, cards, catalog memberships, and version. Page words live in MDX. Do not fill retired Markdown fields or use old placeholder preview scripts.

After the backend and frontend are both done, the main agent runs `npm run quality`. The full build runs in pull request CI on GitHub when the user asks to push to prod. Don't build on the homelab.

Writing hands integration its final plain-language title, SEO text, interface words, catalog card name and description, and the page content as MDX files in the route's `content/` folder. See [page-content.md](page-content.md). The spec holds the plan, not the page content.

Before integration, the main agent confirms every planned catalog exists. A new catalog needs its own registry row, content, art, and page review.

Integration wires the MDX files into the route and runs the content check. It then writes one publish manifest for the tool, as [page-publishing.md](page-publishing.md) describes. It holds the registry fields, title, the content fields the publisher still requires, card fields, tool-specific art key, full ordered catalog list, and readiness requirements. A new catalog the tool needs goes in the same manifest. Integration then works in development:

1. With the dev server and local cache watcher running, run the tools publisher's `prepare`, `preview`, and `apply` against development. `apply` also checks the public page.
2. Check the actual tool and each assigned catalog card at desktop and mobile width in both themes.
3. Run a new build only if integration or audit changes route, runtime, or SEO code.

Content fixes after integration edit the MDX files. Title, search text, and card fixes update the manifest, then run the publisher in development again. That keeps the manifest ready for production. The single-purpose tool-page commands are fine for a quick development check, but the manifest must end with the same values.

The auditor checks accuracy, content, catalog cards and placement, and the common user flow. That includes whether the new tool's marker drawing reads clearly at its rendered size in both themes.

The auditor reports each defect with its owner: backend, data, wiring, design, or copy. The main agent sends each one to Sol, the integration session, or the planning session, then reruns only the affected checks.

Don't run a full-site browser suite for one tool.

## Rework an existing tool

Use this path when a live tool breaks the rules in [tool-interface.md](tool-interface.md), such as too many required inputs, text under fields, checkbox reveals, or sources in the result. The engine's math stays right. What changes is who the tool serves first and how it shows the answer.

| Round | Work | Lane | Output |
| --- | --- | --- | --- |
| 1 | Add "Who uses it" and "Published comparison data" to the existing `research.md`. Don't redo the rest. | Luna, `xhigh` | Updated `research.md` |
| 2 | Rewrite People and questions, then the Interface section. List the engine changes needed, such as making a required field optional. | Opus planning session, `medium` | Updated `tool-spec.md` |
| 3 | Engine changes and their focused test, only if round 2 needs any. | Sol, `high` | Engine and test |
| 4 | Rebuild the interface with `$stack127-tool-frontend`. | Opus planning session, `high` | Tool component and styles |
| 5 | Update the page content with `$stack127-tool-writing`. Move anything cut from the tool into it. Put the published figures and sources in the article. | Opus planning session, `medium` | Updated `content/*.mdx` and interface words |
| 6 | Independent audit. | Sol, `high` | Release verdict |

A rework changes inputs and results, so it's a minor `tool_version` increase. Delete older planning docs in `content_docs/<slug>/` that the new spec replaces, such as `brief.md` or `interface-contract.md`. Work through the list one tool at a time, as "Pace" describes. Give each tool its own Opus planning session, and sync with main before you start.

## Publication and release

You can publish a development preview inside an authorized tool pipeline, so the real database-backed route can be reviewed. Memberships can be set up before publication. Catalog cards appear only for published tools.

After the audit, give the user the complete spec, the verified development preview, the publish manifest location, and the release verdict. Production data, commits, pushes, and deployment still need authorization.

When release is authorized, follow `$stack127-release-e2e`. The code ships first: pull request, CI, merge, and the release workflow, which builds one image, deploys it, and checks the live revision and core public endpoints. Then the coordinator publishes the tool's production data with the tools publisher and its page publication workflow, as [page-publishing.md](page-publishing.md) describes. "Push to prod" covers both steps.

The coordinator does the release, or names the reviewed commit or exact production data changes in a worker's task, as described in `AGENTS.md`. Ordinary pipeline workers may apply development updates without that.
