# Orchestration contract

## Contents

1. Stage ownership
2. Worker prompt contract
3. Review and feedback protocol
4. Blocking and recovery

## Stage ownership

The main orchestrator creates every worker and records its actual model, reasoning setting, session identifier, input fingerprints, output paths, validator result, and feasibility verdict. Every spawn passes `model`, `reasoning_effort`, and normally `fork_turns: "none"`. Workers never delegate another pipeline stage. Required configurations are Luna as `gpt-5.6-luna` with `max`, Astra as `gpt-6-astra` with `low` which the Codex UI calls Light, and Sol as `gpt-5.6-sol` with `high`.

| Stage | Worker skill or role | Required inputs | Allowed output | Gate | Return failures to |
| --- | --- | --- | --- | --- | --- |
| Competitor-led research | Luna/max, `$stack127-tool-research` | Tool name, route, repository | One `competitive-report.md` covering operated competitors, primary-source technical truth, and feasibility | `--expect=research` | Research worker |
| Product | Astra/Light, `$stack127-tool-product-plan`; retained for interface | Ready research | `implementation-report.md`, `brief.md` | Main review and `--expect=product` before continuation | Research or product |
| Interface plan | Same Astra/Light session, `$stack127-tool-interface-plan` | Accepted product and brief | `interface-contract.md` | `--expect=interface` | Product or interface planning |
| Test design | Luna/max, `$stack127-tool-test-design`; retained for build | Ready research, product, interface, and brief | `edge-cases-and-tests.md` | Main review and `--expect=test` before continuation | Product, interface planning, or test design |
| Build | Same Luna/max session, `$stack127-tool-build` | Accepted tests and ready planning artifacts | Route, engine, tests, manifest, scoped scripts | `--expect=build`, tool-only audit, tests | Owning planning worker or builder |
| Content/SEO plan | Astra/Light, `$stack127-tool-content-seo`; retained for writing | Stable technical tool and ready artifacts | `writing-and-seo.md` and usage guide contract | Main review and content-stage validator before continuation | Owning upstream stage |
| Content generation | Same Astra/Light session, `$stack127-tool-writing` | Accepted content plan | Reviewed Markdown files only | Main-agent editorial review | Content worker |
| Content integration | Luna/max, `$stack127-tool-content-integration` | Main-agent-approved words and stable tool | Development content, figures, tests, ownership and render evidence | Content tests and responsive Browser check | Integration worker |
| Complete audit, fixes, and retesting | Sol/high, `$stack127-tool-audit` | Complete integrated page | Findings, authorized fixes, current rerun evidence | P0/P1 closed and main-agent review | Same audit session |
| Final visual handoff | Main orchestrator | Complete local page and passing gates | Visible clean tab when available, otherwise reproducible Playwright evidence | Desktop and narrow widths, both themes | Writer or builder |

Only the three approved pairs share a session: product with interface, test design with build, and content planning with writing. The main orchestrator reviews and gates the first artifact before continuing the worker. Every other worker has one pipeline role. The orchestrator owns sequencing and completion.

## Worker prompt contract

Include:

- the exact specialist skill name and absolute path;
- repository root;
- exact tool name and orchestrator-locked route;
- required input artifacts;
- allowed files or read-only scope;
- required validator;
- stop condition;
- instruction to report commands, results, blockers, and files changed.
- actual spawned model and session or worker identifier, fresh-context boundary, feasibility verdict, and acceptance artifact path.
- exact reasoning setting: Luna `max`, Astra `low`, or Sol `high`.

Do not include intended findings, preferred competitor conclusions, suspected UI defects, or a proposed fix when independent judgment is required.

Resolve the flat canonical route before delegation by inspecting the top-level namespace. Never let a worker add a collection name to the URL merely to categorize the tool. For example, a Btrfs, ZFS, RAID, disk, or filesystem calculator uses `/tool-slug` and may be linked from `/storage-tools` plus any other relevant collection.

### Research prompt shape

> This worker is `gpt-5.6-luna` with `max` reasoning. Use `$stack127-tool-research` at `<absolute skill path>` for `<tool>` at `<route>`. Start with competitor discovery and operation, then continue in the same report with primary-source technical truth, formulas, data contracts, limitations, and feasibility. If the core promise is blocked by a paid service, account, live-data operation, automation, maintained dataset, or new infrastructure, preserve the evidence and give two to four concrete decision options; do not continue dependent work. Use SearXNG with `bing,duckduckgo` when configured, run the research validator, and stop. Report the search/visual backends, evidence gaps, and files changed. Do not spawn another worker.

### Product prompt shape

> This worker is `gpt-6-astra` with `low` reasoning, shown as Light in Codex. Use `$stack127-tool-product-plan` at `<absolute skill path>` for `<route>`. Read the ready research and repository patterns, create only the implementation report and brief, run the product validator, and stop. Do not implement or spawn another worker.

### Interface-plan prompt shape

> Continue the same `gpt-6-astra` worker with `low` reasoning after the main agent has accepted the product gate. Use `$stack127-tool-interface-plan` at `<absolute skill path>` for `<route>`. Create only `interface-contract.md` from the accepted product artifacts, inspect the shared tool UI and relevant sibling routes, and record component provenance. When a needed component is absent, contract a new stack127 component rather than a generic or native-looking fallback. Inspect the existing route when this is a retrofit, run the interface validator, and stop before code or tests. Do not spawn another worker.

### Test-design prompt shape

> This worker is `gpt-5.6-luna` with `max` reasoning. Use `$stack127-tool-test-design` at `<absolute skill path>` for `<route>`. Create only the edge-case and test contract from the ready product and interface artifacts, run the test validator, and stop. Return unresolved product or interface decisions upstream. Do not spawn another worker.

### Builder prompt shape

> Continue the same `gpt-5.6-luna` worker with `max` reasoning after the main agent has accepted the test contract. Use `$stack127-tool-build` at `<absolute skill path>` to implement `<route>` from its ready artifacts. Work test-first and follow the component provenance contract: reuse the shared primitive or build the approved missing stack127 component, while keeping native semantics underneath when useful. Never substitute generic browser UI. Keep the route unpublished and tool-only, operate it in the available Browser backend at required widths and themes, run required gates, and stop without prose, publication, commit, push, or deployment. Do not spawn another worker.

### Content-plan prompt shape

> This worker is `gpt-6-astra` with `low` reasoning, shown as Light in Codex. Use `$stack127-tool-content-seo` at `<absolute skill path>` for the stable tool at `<route>`. Produce only `writing-and-seo.md` with manual `COPY-*` assignments and the usage guide contract. Do not draft prose, edit the route, or spawn another worker.

### Writing prompt shape

> Continue the same `gpt-6-astra` worker with `low` reasoning after the main agent has accepted the content plan. Use `$stack127-tool-writing` at `<absolute skill path>` for the stable tool at `<route>`. Generate the approved introduction, `usage_markdown`, supporting Markdown, headings, table and list wording, captions, alt text, labels, results, and errors. Return reviewed Markdown files only. Do not integrate, test, use a browser, write to the database, or spawn another worker.

### Content integration prompt shape

> This worker is `gpt-5.6-luna` with `max` reasoning. Use `$stack127-tool-content-integration` at `<absolute skill path>` to integrate the main-agent-approved words for `<route>`. Do not rewrite public meaning. Apply the development content update, register approved figures, add integration tests, verify desktop and narrow layouts in both themes, and return current database and rendered evidence. Do not spawn another worker.

### Complete-audit prompt shape

> This worker is `gpt-5.6-sol` with `high` reasoning. Audit the complete integrated tool once with `$stack127-tool-audit`: technical correctness, tests, interface states, Browser behavior, accessibility, content, media, responsiveness, database state, and completion evidence. Preserve reproducible findings, fix every confirmed issue within the authorized scope, and rerun the complete affected tests and flows after each fix batch. Return current evidence and do not spawn another worker.

If the main agent finds a remaining issue after reviewing the target and evidence, send one consolidated correction batch back to this same Sol session.

## Review and feedback protocol

For each worker result:

1. Read the entire output artifact and relevant diff.
2. Run its deterministic gate independently.
3. Compare names, routes, fingerprints, requirements, and publication state.
4. Classify findings:
   - P0: materially wrong answer, security/privacy risk, corrupted state, or inaccessible primary job;
   - P1: common flow, recovery, responsive, accessibility, or trust failure;
   - P2: uncommon resilience or safe polish.
5. Send one consolidated feedback batch with evidence, expected outcome, and owning stage.
6. Continue the same worker for authorized corrections. The main agent returns remaining audit issues to the same Sol session.
7. Re-run the complete affected flow after fixes.

Do not drip-feed cosmetic comments while a larger flow is still untested. Do not accept a visual fix that changes action semantics or hides a capability.

## Blocking and recovery

Stop and report when:

- an authoritative formula or source cannot be resolved;
- a route or product identity needs user judgment;
- a P0/P1 decision is missing from product planning;
- required network, production data, or approval is unavailable;
- a target-owned gate or production build remains failing;
- a requested change would publish, deploy, commit, push, or expand scope.

Treat a new paid API, account, crawler, scheduled refresh, background worker, queue, storage service, review operation, maintained dataset, or other unapproved ongoing system as a blocker when the requested core promise depends on it. Name the exact blocker, evidence, affected requirements, and owning stage. Preserve independent completed artifacts and stop dependent work.

Give the user two to four concrete options. For each, state the behavior it would deliver, the cost or maintenance it adds, and the approval needed. Include approval of the dependency, a complete manual, static, or offline direction, a coherent scope reduction, or remaining blocked when those are honest choices. Do not build new infrastructure, silently reduce the promise, or ship a stale snapshot as a live tool before the user chooses.
