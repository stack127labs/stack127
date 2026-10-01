---
name: stack127-tool-interface-plan
description: Define the controls, result hierarchy, states, shared components, and responsive behavior for one stack127 tool in tool-spec.md, and build any new or improved shared components it needs.
---

# stack127 tool interface plan

Edit the Interface section of `content_docs/<slug>/tool-spec.md`, plus shared components in `app/ui/` and their `/components-ui` gallery entries when the plan needs them.

In the tool pipeline, Opus runs this skill in the same Claude Code planning session as `$stack127-tool-product-plan`.

Read `research.md`, the "Why people will choose this tool" and Product sections, `stack127_docs/tool-interface.md`, `stack127_docs/shared-ui.md`, the `/components-ui` gallery in development, and relevant sibling tools.

Decide:

- one user question, one lead answer, and one primary action;
- the minimum visible inputs and which advanced choices genuinely change the answer;
- distinct result regions with no repeated facts;
- shared, new shared, or route-specific components for nontrivial controls;
- initial, valid, invalid, loading, empty, partial, failure, retry, reset, restored, and long-value states that apply;
- desktop and mobile order, containment, table behavior, keyboard flow, focus, and announcements.

## Components

List every existing shared component the frontend will use. When no shared component fits, or an existing one falls short, build or improve it now:

- Put it in `app/ui/` and follow `stack127_docs/shared-ui.md`, `stack127_docs/design-system.md`, and `stack127_docs/css-architecture.md`.
- Make it useful beyond this one tool. Keep calculations, data sources, and tool-specific behavior out of it.
- Add an example to the `/components-ui` gallery.
- When changing an existing component, keep the pages that use it working.
- Check it in the gallery and on the page types that use it, at desktop and mobile width in both themes. Run `npm run quality`.

Name each new or improved component in the Interface section with its import path and what it is for.

Use `stack127_docs/writing-style.md` for interface wording. Do not build the tool route, backend, or tool-specific components yet. Luna builds the backend next, then you build the frontend with `$stack127-tool-frontend` in this same session. Do not create a separate interface contract.
