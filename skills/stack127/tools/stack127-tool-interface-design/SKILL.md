---
name: stack127-tool-interface-design
description: Refine an existing stack127 tool's controls, result hierarchy, states, responsiveness, and usability without changing its engine or article content.
---

# stack127 tool interface design

Read the tool spec, `stack127_docs/tool-interface.md`, `stack127_docs/shared-ui.md`, `stack127_docs/writing-style.md`, the `/components-ui` gallery in development, and rendered page. Use the local headless fallback in `skills/stack127/references/homelab-browser-and-search.md` if the in-app browser is unavailable.

- Make the next action and lead answer obvious.
- Keep one primary action and visible labels.
- Keep result-driving assumptions visible.
- Remove repeated facts and regions that answer no new question.
- Reuse shared controls when their behavior fits. Keep route-specific presentation local.
- Keep overflow inside the content that needs it. Check long values and open disclosures at desktop and mobile width.
- Preserve formulas, APIs, publication state, and the page's `content/*.mdx` files unless the request includes them.

Run only focused checks for changed behavior. Verify the actual page after editing.

For an existing tool, a change to inputs, results, calculations, validation, or other user-visible behavior needs a `tool_version` increase. Use a patch for a compatible fix, a minor version for compatible new behavior, and a major version for an incompatible contract change. Confirm the version with the coordinator before integration. The database moves the public date when the version changes. MDX content changes leave the version and the date alone; a date move for content-only tool changes comes later. Card-only edits refresh catalogs and keep the tool date unchanged. See `stack127_docs/tool-pages.md`.
