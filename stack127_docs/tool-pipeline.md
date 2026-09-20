# Tool pipeline

The main agent starts focused workers, checks each handoff, and does not repeat completed work. Planning stays in one `content_docs/<slug>/tool-spec.md` file. No acceptance receipt, hashes, evidence folder, ownership manifest, or stage validator is required.

## Order and models

| Round | Work | Model | Reasoning | Output |
| --- | --- | --- | --- | --- |
| 1 | Research | `gpt-5.6-luna` | `max` | Research section |
| 2 | Product and interface plan in one retained session | `gpt-6-astra` | `low` | Product and Interface sections |
| 3 | Build and focused verification | `gpt-5.6-luna` | `max` | Working tool and focused correctness test |
| 4 | Content plan and writing in one retained session | `gpt-6-astra` | `low` | Content section and reviewed words |
| 5 | Development content integration | `gpt-5.6-luna` | `max` | Integrated development page |
| 6 | Independent audit and fixes | `gpt-5.6-sol` | `high` | Release verdict |

Workers do not delegate. Start each worker without unrelated conversation context. Reuse the same worker only where the table says one retained session.

## Main-agent job

For each round:

1. Start the assigned skill with the tool, route, repo, spec path, allowed files, and stop condition.
2. Read the result and relevant diff.
3. Return concrete missing or incorrect work to the same worker.
4. Start the next round when the output is usable.

The main agent does not rerun research, rewrite specialist content, or repeat browser work. It runs the core tests and one production build at the end.

## Tool spec

Use `skills/stack127/tools/stack127-tool-orchestrator/references/tool-spec-template.md`.

- Research records competitor patterns, user problems, sources, technical facts, opportunity, and blockers.
- Product records the job, scope, technical contract, important states, and independently known examples.
- Interface records controls, result order, components, states, accessibility, and responsive behavior.
- Content records search intent, useful explanations, formats, metadata direction, links, and sources.

Keep the spec concise. Add detail when it changes the product or prevents a wrong answer. Do not create IDs, fingerprints, duplicated contracts, or status machinery.

## Verification

- Calculation, parser, and resolution logic gets a small focused unit test with independent examples.
- The builder checks the actual page at desktop and mobile width with one correct and one invalid example.
- Integration checks the real development page after content is applied.
- The auditor independently checks accuracy and the common user flow, then reruns only checks affected by fixes.
- The main agent runs `npm run test:core` and `npm run build` once after all route, runtime, and content integration work. The build already checks TypeScript.

Do not run a full-site browser suite for one tool.

## Publication and release

Development preview publication is allowed inside an authorized tool pipeline so the actual database-backed route can be reviewed. Production data, commit, push, and deployment still require authorization.

When release is authorized, use the approved production content workflow and `$stack127-release-e2e`. The release workflow runs the minimum gate, builds one image, deploys it, and checks the live revision and core public endpoints.
