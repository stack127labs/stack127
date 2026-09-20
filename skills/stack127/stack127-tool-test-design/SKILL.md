---
name: stack127-tool-test-design
description: Design focused correctness, boundary, recovery, security, accessibility, state, and browser checks for one stack127 tool. Use when risk or behavior needs a deliberate test plan. Do not implement the tests or page.
---

# stack127 tool test design

Turn the tool specification into the smallest test set that protects its real risks. Update the `Focused checks` section of `content_docs/<slug>/tool-spec.md`. Do not create a separate edge-case report for new work.

## Scale by risk

- Simple: normal result, key boundary, invalid recovery, deterministic formula or transformation, one desktop flow, and one mobile flow.
- Standard: simple coverage plus parser alternatives, state restoration, upload or async failures, compatibility limits, and meaningful security cases.
- High: standard coverage plus abuse limits, privacy, upstream disagreement, partial data, freshness, timeouts, schema drift, and recovery from dependency failure.

Use P0 for wrong consequential answers, security or privacy problems, corrupted state, and an inaccessible primary job. Use P1 for common flow, recovery, browser-state, or accessibility failures. Use P2 for uncommon polish.

Choose the smallest effective level:

- Node tests for formulas, parsers, validation, serialization, and invariants.
- Route or API tests for trust boundaries, upstream behavior, caching, and limits.
- Playwright for rendered interaction, focus, keyboard use, announcements, responsive layout, and history.
- Shared tests for sitewide layout, themes, SEO, and navigation.

Each case states exact input or setup, expected system result, visible recovery, test level, and oracle or source. Do not use vague expectations such as "handle gracefully". Record why a risk family does not apply instead of inventing tests for it.

Every P0 and P1 behavior needs an automated check unless automation cannot observe it. In that case, give one repeatable manual check and the reason.
