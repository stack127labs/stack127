---
name: stack127-tool-interface-design
description: Refine an existing stack127 tool's controls, result hierarchy, states, responsiveness, and usability without changing its engine or article content.
---

# stack127 tool interface design

Read the tool spec, `stack127_docs/tool-interface.md`, shared tool UI, rendered page, and shared writing voice.

- Make the next action and lead answer obvious.
- Keep one primary action and visible labels.
- Keep result-driving assumptions visible.
- Remove repeated facts and regions that answer no new question.
- Use tables for repeated fields, charts for exact relationships, and diagrams for real relationships.
- Reuse shared controls when their behavior fits. Keep route-specific presentation local.
- Keep overflow inside the content that needs it. Check long values and open disclosures at desktop and mobile width.
- Preserve formulas, APIs, publication state, and supporting article content unless the request includes them.

Run only focused checks for changed behavior. Verify the actual page after editing.
