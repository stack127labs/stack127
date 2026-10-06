---
name: stack127-tool-audit
description: Independently check one complete stack127 tool for correct answers, usable interaction, responsive rendering, clear content, and release readiness.
---

# stack127 tool audit

Audit-only requests are read-only. In the tool pipeline, report confirmed defects with their owner (backend, frontend, or copy) and do not fix them; the main agent sends backend defects to Sol, data defects to Luna, frontend defects to the Opus planning session, and copy to the Opus writing session.

1. Read the tool spec, engine, route, focused tests, styles, scripts, and development content. Use `stack127_docs/writing-style.md` when reviewing copy and `stack127_docs/shared-ui.md` when checking components.
2. Check several independent normal, boundary, and invalid examples against primary sources or hand calculations.
3. Use the real development page at desktop and mobile width. Follow `skills/stack127/references/homelab-browser-and-search.md` for a local headless browser when needed. Check the primary action, answer, recovery, keyboard use, focus, overflow, shared tables, charts, callouts, links, and content order where present.
4. Check basic privacy, escaping, untrusted output, timeouts, unknown versus zero, units, and rounding where they apply.
5. Confirm development publication and version state. Check that the tool has one rank-1 primary catalog, appears once with the right card in every planned published catalog, has working links and sensible ordering, and does not appear while unpublished. For a new tool, confirm its tool-specific marker drawing is present and recognizable at the rendered card size on desktop and mobile in both themes; an `icon` fallback, unclear subject, overlap, or clipped art blocks release. When the tool is unpublished, inspect the generated art at card size and flag the public-card check for publication. If a publish manifest exists, run its `prepare` and `preview` against development and confirm its readiness checks pass and its values match what you checked. Report a mismatch as an integration defect. Never write production data without authorization.
6. List wrong answers, broken common flows, accessibility failures, and responsive failures with their owner. After the owners fix them, rerun only the affected focused test or interaction.

Return the verdict, real defects and their owners, focused rechecks, and anything still blocking release. Do not create evidence folders, screenshots by default, hashes, receipts, or a second full test run.

For an existing tool, a change to inputs, results, calculations, validation, or other user-visible behavior needs a `tool_version` increase. Use a patch for a compatible fix, a minor version for compatible new behavior, and a major version for an incompatible contract change. Confirm the version with the coordinator before integration. The database moves the public date when the version changes. Copy-only edits move the date without changing the version. Card-only edits refresh catalogs and keep the tool date unchanged. See `stack127_docs/tool-pages.md`.
