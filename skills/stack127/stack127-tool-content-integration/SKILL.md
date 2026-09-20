---
name: stack127-tool-content-integration
description: Apply approved tool-page content to one finished stack127 tool, update the development content record, verify the route and renderer, and run focused checks. Do not rewrite approved meaning or publish to production.
---

# stack127 tool content integration

Read `AGENTS.md`, `stack127_docs/tool-pipeline.md`, `stack127_docs/tool-pages.md`, the tool specification, ownership manifest, finished interface, and exact approved words.

Use the reviewed content command against development. Keep `usage_markdown` before supporting content in the shared continuous article. Register only approved safe figures. Do not keep another live Markdown copy in the repository.

Add or update focused tests that prove field loading, article order, required lists or tables, links, figure safety, and content revision behavior. Do not change the engine or `tool_version` for a copy-only update.

Verify one complete desktop rendering and one narrow mobile rendering with a real result. Check headings, links, tables, captions, overflow, themes when the content has theme-specific media, and that the guide does not duplicate the workbench.

Run route-owned tests and `npm run quality`. Use `quality:full` only when shared content rendering, routing, SEO, registry, or test infrastructure changed. Return factual or editorial changes to the writer instead of silently rewriting them.

Report the development revision, applied fields, focused checks, browser states, and publication state. Do not write production data, publish, commit, push, or deploy without authority.
