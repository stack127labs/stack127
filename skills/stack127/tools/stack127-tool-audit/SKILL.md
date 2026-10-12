---
name: stack127-tool-audit
description: Independently check one complete stack127 tool for correct answers, a simple Basic flow for most people, usable interaction, responsive rendering, clear content, and release readiness.
---

# stack127 tool audit

Judge the tool as its users would, without relying on the builder's explanation. Audits are read-only. Report each defect with its owner: backend to Sol, data to Luna, design, plan, or copy to the Opus planning session, and wiring or card art to integration.

Read the spec, engine, route, `content/*.mdx`, and tests. Check against `stack127_docs/tool-interface.md`, `writing-style.md`, `page-content.md`, and `shared-ui.md`.

1. **Answers.** Check normal, boundary, and invalid examples against primary sources or hand calculations. Include unknown versus zero, units, rounding, timeouts, and escaping of untrusted output where they apply.
2. **First use and depth.** Open the real development page as the first-time visitor in the spec's "People and questions", then as a pro in this domain. Does it open on an example with its result? Can the visitor get the answer from Basic without reading? Would the pro find what serious competitors offer in Advanced? Can they scan the result, with the main answer first and smaller numbers readable? Does every required field show `*`? Does every limit answer instead of blanking? Use the Review list in `tool-interface.md`.
3. **Interaction.** Check desktop and mobile width in both themes: keyboard and focus, hints, overflow, charts, tables, links, and recovery from errors.
4. **Content.** Content follows `page-content.md`, with no placeholders left.
5. **Publication.** Development publication and version. One rank-1 primary catalog, and one card in each planned catalog. The tool-specific card art reads at real size in both themes, and an `icon` fallback blocks release. If a publish manifest exists, run its `prepare` and `preview` against development. Never write production data.

See `skills/stack127/references/homelab-browser-and-search.md` for a headless browser. After owners fix things, recheck only what changed.

Return the verdict, the defects with owners, and anything still blocking release. Don't create evidence folders, screenshots by default, or hashes.
