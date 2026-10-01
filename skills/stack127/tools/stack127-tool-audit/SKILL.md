---
name: stack127-tool-audit
description: Independently check one complete stack127 tool for correct answers, usable interaction, responsive rendering, clear content, and release readiness.
---

# stack127 tool audit

Audit-only requests are read-only. In an authorized build pipeline, fix confirmed defects within the tool's scope.

1. Read the tool spec, engine, route, focused tests, styles, scripts, and development content. Use `stack127_docs/writing-style.md` when reviewing copy and `stack127_docs/shared-ui.md` when checking components.
2. Check several independent normal, boundary, and invalid examples against primary sources or hand calculations.
3. Use the real development page at desktop and mobile width. Follow `skills/stack127/references/homelab-browser-and-search.md` for a local headless browser when needed. Check the primary action, answer, recovery, keyboard use, focus, overflow, shared tables, charts, callouts, links, and content order where present.
4. Check basic privacy, escaping, untrusted output, timeouts, unknown versus zero, units, and rounding where they apply.
5. Confirm development publication and version state. Check that the tool has one rank-1 primary catalog, appears once with the right card in every planned published catalog, has working links and sensible ordering, and does not appear while unpublished. For a new tool, confirm its tool-specific marker drawing is present and recognizable at the rendered card size on desktop and mobile in both themes; an `icon` fallback, unclear subject, overlap, or clipped art blocks release. When the tool is unpublished, inspect the generated art at card size and flag the public-card check for publication. Never write production data without authorization.
6. Fix wrong answers, broken common flows, accessibility failures, and responsive failures. Rerun only the affected focused test or interaction.

Return the verdict, real defects, fixes, focused rechecks, and anything still blocking release. Do not create evidence folders, screenshots by default, hashes, receipts, or a second full test run.
