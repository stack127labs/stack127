---
name: stack127-tool-orchestrator
description: Build or complete one stack127 interactive tool with a risk-based workflow, one concise specification, focused tests, integrated public content, one independent review, and a generated verification receipt. Use for end-to-end tool implementation. Stop before publication or deployment unless the user separately authorizes it.
---

# stack127 tool orchestrator

Build one complete tool without forcing routine work through the largest possible process. Read `AGENTS.md`, `stack127_docs/tool-pipeline.md`, the route ownership manifest when present, and the shared tool interface rules. Inspect related tools and shared components before deciding what to add.

## Start with risk

Choose and record one level in `content_docs/<slug>/tool-spec.md`:

- `simple` for deterministic local calculations, conversions, generators, or static checks with stable rules.
- `standard` for parsers, uploads, several interacting states, uncommon formulas, or compatibility limits.
- `high` for live services, security-sensitive decisions, maintained data, background work, paid dependencies, or consequential failure modes.

Raise the level when new evidence warrants it. Explain the choice in one sentence.

## Keep one specification

Use `references/tool-spec-template.md`. The specification owns the product question, technical truth, visible interface, important states, focused tests, public content requirements, limitations, risk, and publication state.

Do not create separate competitive, implementation, interface, test, and writing reports for new work. For standard or high-risk work, add targeted source or fixture evidence only when it does not fit cleanly in the specification.

## Work sequence

1. Confirm the flat route, user job, risk, publication state, and external dependencies.
2. Complete the specification. Research only unsettled product or technical facts.
3. Add ownership and focused tests, then implement the engine, interface, and concise server-rendered content.
4. Run affected unit and browser tests while iterating. Use the change-aware repository gate before handoff.
5. Inspect a real result and invalid recovery at one desktop and one narrow mobile viewport. Add more visual cases only for route-specific behavior.
6. Run one independent final review. Use the complete `stack127-tool-audit` workflow for high-risk tools or when the user requests a full audit.
7. Fix P0 and P1 findings and rerun affected checks.
8. Generate `verification-receipt.json` with `npm run stack127:tool:verify`.

Use specialist skills only when their work is needed. A standard tool may need targeted research or test design. A simple settled calculator usually does not need separate workers or documents for each concern.

## Boundaries

- Keep the tool unpublished until publication is explicitly authorized.
- Do not write production data, commit, push, or deploy without matching authority.
- Do not hide a blocked external dependency behind a demo or stale snapshot.
- Use one primary action and one clear lead answer.
- Keep formula or parser logic outside React and protect it with deterministic tests.
- Keep public tool prose in `stack127_tool_pages` and update versions through the reviewed commands.
- Preserve relevant limitations and unknown values.

## Verification

During implementation, run focused tests. Before handoff, run:

```bash
npm run quality
npm run stack127:tool:verify -- /tool-slug \
  --risk=<simple|standard|high> \
  --review=passed \
  --review-summary="<short independent review result>"
```

Use `npm run quality:full` when shared routing, SEO, shell, registry, tool UI, or test infrastructure changed.

## Communication

Send a start update, any blocker that needs a decision, and the final result. Do not narrate every test or internal handoff.

## Handoff

Report the supported behavior, known limits, focused checks, independent review result, receipt path, publication state, and any remaining P2 follow-up. Call implementation, publication, and production release separate outcomes.
