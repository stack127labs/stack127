# Tool pipeline

The main agent starts focused workers, checks each handoff, and does not repeat completed work. Planning stays in one `content_docs/<slug>/tool-spec.md` file. The pipeline continues from a working tool through writing, development integration, and independent audit without a manual writing pause. No acceptance receipt, hashes, evidence folder, ownership manifest, or stage validator is required.

## Order and models

| Round | Work | Model | Reasoning | Output |
| --- | --- | --- | --- | --- |
| 1 | Research | `gpt-6-luna` | `max` | Research section |
| 2 | Product and interface plan in one retained session | `gpt-6-astra` | `low` | Product and Interface sections |
| 3 | Build and focused verification | `gpt-6-luna` | `max` | Working tool and focused correctness test |
| 4 | Content plan | `gpt-6-astra` | `low` | Content section |
| 5 | Tool writing | `gpt-6-astra` | `low` | Title, page copy, interface words, and SEO text |
| 6 | Development content integration | `gpt-6-luna` | `max` | Integrated development page |
| 7 | Independent audit and fixes | `gpt-6-sol` | `high` | Release verdict |

Workers do not delegate. Start each worker without unrelated conversation context. Reuse the same worker only where the table says one retained session. `low` is Light in the Codex model picker. Once the Content section is ready, start the writing worker and pass its draft to integration without waiting for user copy.

## Main-agent job

For each round:

1. Start the assigned skill with the tool, route, repo, spec path, allowed files, and stop condition.
2. Read the result and relevant diff.
3. Return concrete missing or incorrect work to the same worker.
4. Start the next round when the output is usable.

The main agent does not rerun research or repeat browser work. It checks the tool and runs the core tests and one production build after route and runtime work. If integration or audit later changes code, it reruns only the checks affected by that change.

## Tool spec

Use `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording. Use [shared-ui.md](shared-ui.md) to identify components and Markdown syntax the writer can use. Page specs record the reader's task, verified facts, coverage, and formats without adding separate style rules.

The content planner reads the Page structure section of `skills/stack127/tools/stack127-tool-writing/SKILL.md` and records how its title and introduction guidance applies to this tool. The writing worker then drafts from the finished spec and actual tool.

Use `skills/stack127/tools/stack127-tool-orchestrator/references/tool-spec-template.md`.

- Research records competitor patterns, user problems, sources, technical facts, opportunity, and blockers.
- Product records the job, scope, technical contract, important states, and independently known examples.
- Interface records controls, result order, components, states, accessibility, and responsive behavior.
- Content gives the writer the page promise, reader questions, proposed section and format mix, concepts, result interpretation, writing boundaries, next step, metadata direction, links, and source roles.

Keep the spec concise. Add detail when it changes the product or prevents a wrong answer. Do not create IDs, fingerprints, duplicated contracts, or status machinery.

## Verification

- Calculation, parser, and resolution logic gets a small focused unit test with independent examples.
- The builder checks the actual page at desktop and mobile width with one correct and one invalid example.
- When the in-app browser is unavailable over SSH, use the local headless browser in `skills/stack127/references/homelab-browser-and-search.md` for these checks and the later audit.
- A new database-backed route needs a development preview row to render. Use only minimal, clearly marked placeholder intro and content in that row until the writing stage supplies final copy. Preserve any existing row and do not treat the placeholder as finished writing.
- After route and runtime work, the main agent runs `npm run test:core` and `npm run build` once. The build already checks TypeScript.
- Writing hands its title, SEO text, interface words, and temporary Markdown files to integration. The live copy belongs in the database, not the spec or route.
- Integration checks the actual development page. Run a new build only if integration or audit changes route, runtime, or SEO code.
- The auditor then checks accuracy, content, and the common user flow, and reruns only checks affected by fixes.

Do not run a full-site browser suite for one tool.

## Publication and release

Development preview publication is allowed inside an authorized tool pipeline so the actual database-backed route can be reviewed. After the audit, hand the user the complete spec, verified development preview, and release verdict. Production data, commit, push, and deployment still require authorization.

When release is authorized, use the approved production content workflow and `$stack127-release-e2e`. The release workflow runs the minimum gate, builds one image, deploys it, and checks the live revision and core public endpoints.
