# Orchestration contract

## Contents

1. Stage ownership
2. Worker prompt contract
3. Review and feedback protocol
4. Blocking and recovery

## Stage ownership

| Stage | Worker skill or role | Required inputs | Allowed output | Gate | Return failures to |
| --- | --- | --- | --- | --- | --- |
| Research | `$version127-tool-research` | Tool name, route, repository | `competitive-report.md` | `--expect=research` | Research worker |
| Product | `$version127-tool-product-plan` | Ready research | `implementation-report.md`, `brief.md` | `--expect=product` | Research or product |
| Test design | `$version127-tool-test-design` | Ready research and product | `edge-cases-and-tests.md` | `--expect=test` | Product or test design |
| Build | `$version127-tool-build` | Ready research, product, tests, brief | Route, engine, tests, manifest, scoped scripts | `--expect=build`, tool-only audit, tests | Owning planning worker or builder |
| Independent QA | Read-only Browser or Playwright reviewer | Running local route and contracts | Findings only | P0/P1 closed | Builder or product |
| Competitive re-review | Fresh read-only reviewer using the selected visual backend | Finished tool and research URLs | Findings appended to research or reported | Technical gaps closed | Research, product, or builder |
| Content/SEO plan | `$version127-tool-content-seo` | Stable technical tool and ready artifacts | `writing-and-seo.md` only | Content-stage validator | Owning upstream stage |
| Writing | `$version127-tool-writing` | Stable tool, ready artifacts, and content plan when present | Server-rendered page content, route styles, tests, ownership update | Content tests, responsive Browser check, `--expect=handoff` | Writer or owning upstream stage |
| Final visual handoff | Main orchestrator | Complete local page and passing gates | Visible clean tab when available, otherwise reproducible Playwright evidence | Desktop and narrow widths, both themes | Writer or builder |

Never ask a worker to cross two stage boundaries. The orchestrator owns sequencing and completion.

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

Do not include intended findings, preferred competitor conclusions, suspected UI defects, or a proposed fix when independent judgment is required.

Resolve the flat canonical route before delegation by inspecting the top-level namespace. Never let a worker add a collection name to the URL merely to categorize the tool. For example, a Btrfs, ZFS, RAID, disk, or filesystem calculator uses `/tool-slug` and may be linked from `/storage-tools` plus any other relevant collection.

### Research prompt shape

> Use `$version127-tool-research` at `<absolute skill path>` for `<tool>` at `<route>`. Work only on the competitive report, use SearXNG with `bing,duckduckgo` when configured, operate real competitors in the available Browser backend, run the research validator, and stop. Report the search/visual backends, evidence gaps, and files changed.

### Product prompt shape

> Use `$version127-tool-product-plan` at `<absolute skill path>` for `<route>`. Read the ready research and repository patterns, create only the implementation report and brief, run the product validator, and stop. Do not implement.

### Test-design prompt shape

> Use `$version127-tool-test-design` at `<absolute skill path>` for `<route>`. Create only the edge-case and test contract from ready upstream artifacts, run the test validator, and stop. Return unresolved product decisions upstream.

### Builder prompt shape

> Use `$version127-tool-build` at `<absolute skill path>` to implement `<route>` from its ready artifacts. Work test-first, keep the route unpublished and tool-only, operate it in the available Browser backend at required widths and themes, run required gates, and stop without prose, publication, commit, push, or deployment.

### Independent QA prompt shape

> Inspect `<local URL>` as a user. Read the contracts and the Browser QA checklist. Do not edit files. Exercise the complete tool at all required widths and themes using the available Browser backend, measure overflow and visibility, and return only reproducible P0/P1/P2 findings with backend-labelled evidence.

### Content-plan prompt shape

> Use `$version127-tool-content-seo` at `<absolute skill path>` for the stable tool at `<route>`. Produce only `writing-and-seo.md` with manual `COPY-*` assignments. Do not draft prose or edit the route.

### Writing prompt shape

> Use `$version127-tool-writing` at `<absolute skill path>` for the stable tool at `<route>`. Write the content part in a simple style that is easy for anyone to understand. Keep it simple and do not overcomplicate the page. Add tests before prose, keep the tool primary, verify desktop and narrow layouts in both themes using the available Browser backend, preserve the unpublished state, and stop with the clean local URL and backend-labelled evidence for the main orchestrator.

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
6. Continue the same worker for corrections when retained context helps; use a fresh reviewer to verify.
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

Name the exact blocker, the evidence gathered, the owning stage, and the smallest user decision needed. Preserve completed artifacts and never bypass a validator.
