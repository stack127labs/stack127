---
name: stack127-tool-interface-plan
description: Plan a stack127 tool's Basic and Advanced inputs, hints, result timing, visual result, and components in tool-spec.md, and build any new shared components it needs.
---

# stack127 tool interface plan

Opus runs this in the same planning session as `$stack127-tool-product-plan`. Fill the Interface section of `content_docs/<slug>/tool-spec.md`.

Read "People and questions", `stack127_docs/tool-interface.md` (especially "How a stack127 tool feels" and "Good and bad tools"), and `stack127_docs/shared-ui.md`. Look at the `/components-ui` gallery and a few sibling tools.

Picture two people using it: the first-time visitor from "People and questions", and a pro who knows this domain well. Plan what each of them sees, and make the calls a designer with taste would make:

- **Inputs.** Fill the Inputs table: Basic, Advanced, required or optional, the final label and hint wording, and what each input changes. Cut any input that changes nothing, and keep every option the pro needs.
- **Default state.** The example values it opens with, the result they produce, and the button's name.
- **Result.** The answer, then the visual that makes it obvious for this tool. Think about the relationship you're showing and pick the best form from any ECharts type, a shared component, or a custom SVG. Then the supporting numbers, any detail Advanced adds, and a share action if it's worth sharing.
- **Layout.** How the inputs group into `ToolFieldRow`s, and how the result reads at desktop and on phones. Ask where the eye lands first, and what someone who wants to dig in reads next.
- **States.** Stale results after an edit, invalid input, each domain limit answering instead of blanking, and anything else this tool can really hit.

Sketch the desktop and phone layouts in words in the spec before building.

If a component or chart type you need doesn't exist, build it now as a shared piece with a gallery example. Check it at desktop and mobile width in both themes, and run `npm run quality`. Name each new piece in the spec.

Don't build the tool route or backend. Sol builds the backend next, then you build the frontend with `$stack127-tool-frontend` in this session.
