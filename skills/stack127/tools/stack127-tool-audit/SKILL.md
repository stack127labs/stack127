---
name: stack127-tool-audit
description: Independently check one complete stack127 tool for correct answers, usable interaction, responsive rendering, clear content, and release readiness.
---

# stack127 tool audit

Audit-only requests are read-only. In an authorized build pipeline, fix confirmed defects within the tool's scope.

1. Read the tool spec, engine, route, focused tests, styles, scripts, and development content.
2. Check several independent normal, boundary, and invalid examples against primary sources or hand calculations.
3. Use the real development page at desktop and mobile width. Check the primary action, answer, recovery, keyboard use, focus, overflow, tables, links, and content order.
4. Check basic privacy, escaping, untrusted output, timeouts, unknown versus zero, units, and rounding where they apply.
5. Confirm development publication and version state. Never write production data without authorization.
6. Fix wrong answers, broken common flows, accessibility failures, and responsive failures. Rerun only the affected focused test or interaction.

Return the verdict, real defects, fixes, focused rechecks, and anything still blocking release. Do not create evidence folders, screenshots by default, hashes, receipts, or a second full test run.
