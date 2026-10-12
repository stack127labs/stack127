---
name: stack127-tool-frontend
description: Design and build the interface for one stack127 tool on top of its finished backend, the inputs, result, and every word in them, so people get their answer fast.
---

# stack127 tool frontend

Opus runs this in the planning session, after Sol finishes the backend. Your job is the people using this tool. Build the interface the spec planned so they get their answer fast and want to share it. A separate integration session wires the route, content, card art, and publishing after you and runs the full checks, so keep your attention on the user.

Read the spec, the backend, and `stack127_docs/tool-interface.md`. Dig into `shared-ui.md`, `design-system.md`, and `css-architecture.md` when you need them. Call the backend only through its contract. If the backend is wrong, report it for Sol instead of patching it.

1. **Interface.** Build what the spec planned inside `ToolWorkbench`, `ToolFieldRow`, and `ToolResult` from `app/ui/tools/tool-workbench.tsx`, with every word final: labels, hints, and buttons. It opens on the example and its result. Make the result something the person would want to share. Keep the client island small and the styles beside the route. Don't write your own workbench band, width, or section gaps. The page stays static, so read shared links in a `<slug>-from-url.tsx` client wrapper with `useInitialQuery()`. If the route doesn't exist yet, add a bare page with `ToolPageShell`, as `/cac-payback-calculator` does, so you can see your work.
2. **Look at it.** Open the page at desktop and mobile width as a first-time visitor. Does the eye land on the answer? Can you scan the smaller numbers without labels wrapping? Try a few values and one invalid one. Fix what feels wrong. See `skills/stack127/references/homelab-browser-and-search.md` for a headless browser.

For an existing tool, a behavior change needs a `tool_version` bump. See `stack127_docs/tool-pages.md`, and confirm the version with the coordinator.

Don't write page content, make card art, publish data, commit, push, or deploy. Return the files, what you looked at, and any backend problem.
