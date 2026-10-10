# Tool pipeline

The main agent starts each round, checks each handoff, and doesn't repeat finished work.

Research lives in `content_docs/<slug>/research.md`. The plan lives in `content_docs/<slug>/tool-spec.md`.

The pipeline runs from a working tool through writing, development integration, and an independent audit. There's no manual pause for writing. You don't need an acceptance receipt, hashes, evidence folder, ownership manifest, or stage validator.

## Order and models

Lanes and models follow "Agent roles" in `AGENTS.md`. The main agent is the coordinator, whether it's Claude Code or Codex. It starts each round with T3's `delegate_task`, unless the round is in its own lane, so the user can watch each worker.

| Round | Work | Lane | Effort | Output |
| --- | --- | --- | --- | --- |
| 1 | Deep research and competitor review | Luna | `max` | `research.md` |
| 2 | Product, interface, and component plan | Opus, planning session | `medium` | New `tool-spec.md` with why people will choose it, Product with backend contract, Interface, catalog placement, card art brief, and new or improved shared components |
| 3 | Backend build | Sol | `high`, or `xhigh` for risky logic | Engine, API routes, data scripts, development preview row, and focused correctness test. No UI. |
| 4 | Frontend build | Opus, same planning session | `high` | Route page, interface, tool components, styles, card art, and desktop and mobile checks |
| 5 | Content plan and writing | Opus, writing session | `medium` | Content section, title, the route's `content/*.mdx` files, interface words, SEO text, and catalog card copy |
| 6 | Development content integration | Luna | `xhigh` | Publish manifest, integrated development page, and catalog memberships |
| 7 | Independent audit | Sol | `high` | Release verdict and defects routed to their owner |

Sol builds the backend. Opus builds everything people see: the page, interface, components, styles, card art, and copy.

Workers don't delegate. Start each worker without unrelated conversation context.

Once the Content section and copy are ready, pass the draft to integration. Don't wait for copy from the user.

## Sessions

Each round's worker keeps its session, so follow-ups go back to the worker that did the work.

`delegate_task` returns a `childThreadId`. Send follow-ups to that thread with `t3_thread_send`, wait for them with `t3_thread_wait`, then read the reply with `task_status`.

Planning and frontend share one Opus session. Writing gets its own. Keep the thread IDs until the audit passes.

The prompt names the skill files to follow, the tool, route, spec path, allowed files, and stop condition.

If a worker is unavailable or fails, stop and report it. Don't fall back to another lane.

## Main agent's job

For each round:

1. Start the assigned skill with the tool, route, repo, spec path, allowed files, and stop condition.
2. Read the result and the relevant diff.
3. Send specific missing or wrong work back to the same worker or Claude Code session.
4. Start the next round when the output is usable.

After planning, read the spec against the research. Check that the plan:

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
| Frontend, layout, interaction, and card art problems | Planning session, at high effort |
| Backend defects and wrong answers | Sol |
| Data and integration bugs | Luna |
| Copy problems | Writing session |

Sol builds the backend to the contract. If the contract has gaps, Sol reports them instead of redesigning.

### Checking the writing

Send factual fixes and missing copy back to the writing session first. Then ask that session to make the full page copy easier for a general reader to follow.

The rewrite keeps every useful detail and qualification. It explains hard ideas plainly, with a short example where it helps, without dragging the page out. Check the revised draft before integration.

After integration, read the rendered page from start to finish. Every sentence should make sense as public copy.

Send these back to the writing session, then reintegrate and check the affected copy:

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

Luna writes `research.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/research-template.md`. It records scope, search intent, user problems, verified facts, 5 to 8 competitor reviews, a comparison table, disagreements, how stack127 can win, blockers, and sources.

Opus starts `tool-spec.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/tool-spec-template.md`. The spec links to the research instead of copying it.

In the writing session, Opus first completes the Content section. Then, in the same session, it drafts from the finished spec and the actual tool.

| Spec section | Records |
| --- | --- |
| Why people will choose this tool | What the searcher is trying to decide, where top results fail, and what this tool does better. |
| Product | The job, scope, technical contract, important states, and independently known examples. |
| Product: catalogs and card art | One primary catalog and any secondary catalogs, in rank order, each with a reason based on the reader's task. One visual takeaway, focal subject, and supporting relationship for the new card's `toolSpot` marker drawing. A missing catalog is a separate catalog page task for the main agent. |
| Interface | Controls, result order, components, states, accessibility, and responsive behavior. It names the existing shared components the frontend uses and the new or improved shared components the planner built. |
| Content | Search intent and title, reader questions and where each is answered, the intro, usage, and content outline, facts and limits, and next steps. |

Keep the spec short. Add detail only when it changes the product or prevents a wrong answer. Don't create IDs, fingerprints, duplicate contracts, or status machinery.

## Verification

| Step | Check |
| --- | --- |
| Calculation, parser, and resolution logic | A small focused unit test with independent examples. |
| Planner | Each new or changed shared component in the `/components-ui` gallery and on the page types that already use it, at desktop and mobile width in both themes. |
| Backend | One focused test, plus a direct check of one correct and one invalid example. |
| Frontend | The actual page at desktop and mobile width in both themes, with one correct and one invalid example. |

The frontend step also makes the card art. It uses `$marker-art-draw` to create a spec-backed `toolSpot`, generates its SVG and TypeScript export, and registers a tool-specific key in `lib/card-art.ts` before the main build. The drawing must be recognizable at card size. A generic icon isn't finished art for a new tool.

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

The auditor reports each defect with its owner: backend, data, frontend, or copy. The main agent sends each one to Sol, Luna, the planning session, or the writing session, then reruns only the affected checks.

Don't run a full-site browser suite for one tool.

## Publication and release

You can publish a development preview inside an authorized tool pipeline, so the real database-backed route can be reviewed. Memberships can be set up before publication. Catalog cards appear only for published tools.

After the audit, give the user the complete spec, the verified development preview, the publish manifest location, and the release verdict. Production data, commits, pushes, and deployment still need authorization.

When release is authorized, follow `$stack127-release-e2e`. The code ships first: pull request, CI, merge, and the release workflow, which builds one image, deploys it, and checks the live revision and core public endpoints. Then the coordinator publishes the tool's production data with the tools publisher and its page publication workflow, as [page-publishing.md](page-publishing.md) describes. "Push to prod" covers both steps.

The coordinator does the release, or names the reviewed commit or exact production data changes in a worker's task, as described in `AGENTS.md`. Ordinary pipeline workers may apply development updates without that.
