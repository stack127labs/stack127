---
name: stack127-tool-interface-plan
description: Define the controls, result hierarchy, states, shared components, and responsive behavior for one stack127 tool in tool-spec.md.
---

# stack127 tool interface plan

Edit only the Interface section of `content_docs/<slug>/tool-spec.md`.

Read the ready Research and Product sections, `stack127_docs/tool-interface.md`, `stack127_docs/shared-ui.md`, the `/components-ui` gallery in development, and relevant sibling tools.

Decide:

- one user question, one lead answer, and one primary action;
- the minimum visible inputs and which advanced choices genuinely change the answer;
- distinct result regions with no repeated facts;
- shared, new shared, or route-specific components for nontrivial controls;
- initial, valid, invalid, loading, empty, partial, failure, retry, reset, restored, and long-value states that apply;
- desktop and mobile order, containment, table behavior, keyboard flow, focus, and announcements.

Use `stack127_docs/writing-style.md` for interface wording. Do not implement, add tests, or create a separate interface contract.
