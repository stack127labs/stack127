---
name: stack127-tool-content-integration
description: "Integrate main-agent-approved tool-page writing into one finished stack127 tool. Use after Astra has produced reviewed title, introduction, usage_markdown, supporting Markdown, interface wording, captions, alt text, tables, lists, and approved figure references. Apply the content in development, register approved figures, add integration coverage, and verify the complete rendered page without rewriting the approved meaning or publishing it."
---

# stack127 tool content integration

## Pipeline role and model routing

In the full tool pipeline, the main orchestrator starts this worker as `gpt-5.6-luna` with `reasoning_effort: "max"` after approving Astra's exact public wording. This worker never starts another pipeline worker. It integrates and verifies the approved content; it does not become a second writer.

## Read first

1. Read `AGENTS.md`, `stack127_docs/tool-pipeline.md`, and the route ownership manifest.
2. Read `skills/stack127/test-driven-page/SKILL.md`, `skills/stack127/visual-first-content/SKILL.md`, and `skills/stack127/marker-art-draw/SKILL.md` when the approved plan includes MarkerArt.
3. Read `stack127_docs/tool-pages.md`, `design-system.md`, `css-architecture.md`, `visual-first.md`, and `writing-style.md`.
4. Read the ready research, product, interface, test, and content-plan artifacts.
5. Read the main-agent-approved title, introduction, `usage_markdown`, `content_markdown`, interface wording, captions, alt text, and source map.
6. Inspect the finished tool, its tests, current database row, and at least two established sibling tool pages. Preserve unrelated changes.

## Hard boundary

Do not rewrite public meaning, add unsupported claims, change formulas, redesign controls, alter result semantics, change the route, publish the page, or write to production. Return factual or editorial problems to the main agent for Astra. Return technical mismatches to the owning build stage.

Use the database as the only live copy of tool-page content. Temporary approved Markdown is an input to the reviewed update command, not a second permanent content store. A copy-only update increments `content_revision` and preserves `tool_version`.

Do not publish, commit, push, open a pull request, or deploy unless the user separately asks.

## Integration workflow

1. Compare the approved writing with `writing-and-seo.md`, especially the `Usage Markdown handoff`, format assignments, sources, internal links, and limitations.
2. Validate Markdown and registered figure references before any database write. Reject raw HTML, arbitrary components, missing figure IDs, unsafe URLs, and unsupported syntax.
3. Dry-run the development content update command from `stack127_docs/tool-pages.md`.
4. Apply the exact approved title, introduction, `usage_markdown`, and `content_markdown` to development only.
5. Integrate approved interface wording where the interface contract assigns it. Do not use integration as permission to alter the information model.
6. Register and generate approved figures through their owning skill and registry. Keep exact values in tables or clean charts, not MarkerArt.
7. Add or update structural and integration tests only where the content shape, renderer, figure, link, or accessibility behavior needs protection. Do not test paragraph counts or freeze incidental wording.
8. Verify the database revision, unchanged tool version, exact field hashes, unpublished state, and route ownership.

## Rendered verification

Read `skills/stack127/references/homelab-browser-and-search.md`, then use the guarded local preview and the in-app Browser when available or standalone Playwright in homelab CLI mode.

Inspect a real successful result and the complete page at a normal desktop width and at 390 px or narrower in both themes. Check:

- the introduction, workbench, result, usage guide, and supporting content in server-rendered reading order;
- that `usage_markdown` and `content_markdown` read as one continuous article without a fake glossary box or decorative divider;
- ordered lists, bullet lists, definition lists, tables, exact charts, MarkerArt, screenshots, captions, and alt text required by the approved plan;
- table focus, overflow or reflow, long links, code wrapping, headings, paragraph rhythm, and page-level overflow;
- internal links, source links, tool state, result visibility, and the absence of duplicated result narration;
- desktop and narrow layouts in dark and light themes.

Run the route's content, renderer, tool, and regression tests, followed by `npm run typecheck` and `npm run test:static`. Run broader repository gates when shared code or rendering changed. Preserve actual exit codes and distinguish target defects from unrelated repository failures.

## Completion rule

Finish only when the approved words are integrated without semantic drift, the current development row and hashes match them, required figures and formats render correctly, relevant tests pass, the page remains unpublished, and the main agent has reproducible Browser or Playwright evidence. Report changed files, content revision before and after, unchanged tool version, database environment, commands and results, widths and themes, visual backend, evidence paths, and unresolved issues.
