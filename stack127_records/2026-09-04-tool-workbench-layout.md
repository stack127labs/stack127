# Tool workbench layout

On 2026-09-04, stack127 replaced the rounded outer frame on every interactive tool with one shared workbench band.

The sidebar and page introduction remain unchanged. The surface background and strong top and bottom rules span the entire main column beside the sidebar. The controls stay centered at the page's normal tool width. The band has no side borders or outer radius. Inputs, buttons, tables, and other controls keep the shared 2px radius where their boundaries help usability. Results stay in the same band and use an internal divider when needed. Supporting content keeps its normal reading width.

The shared presentation is owned by `app/(site)/_components/tool-workbench.css`. Every tool exposes `data-tool-workbench`, and `tests/pages/tools/shared/tool-workbench.test.mjs` keeps the route inventory and visual contract aligned.
