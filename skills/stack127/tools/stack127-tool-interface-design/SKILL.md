---
name: stack127-tool-interface-design
description: Refine an existing stack127 tool's inputs, result, and layout so it's simple for most people, without changing its engine or article content.
---

# stack127 tool interface design

Read the tool spec, `stack127_docs/tool-interface.md`, and the rendered page. Look at it as a first-time visitor would. Where does it make them read, dig for a number, or wonder what the result means? Fix that:

- Move refinements most people skip into Advanced, and turn helper text into hints.
- Make the result about the person's own numbers, with a visual that makes it obvious.
- Move sources and caveats out of the result and into the page content.

Keep formulas, APIs, publication state, and `content/*.mdx` unless the request includes them. If simplifying needs an engine change, such as a required field becoming optional, stop and report it for Sol. A bigger rework follows "Rework an existing tool" in `stack127_docs/tool-pipeline.md`.

Check the real page at desktop and mobile width after editing. A behavior change needs a `tool_version` bump. See `stack127_docs/tool-pages.md`.
