# Tool interface

A stack127 tool is a visual instrument, not something to read. A first-time visitor gets their answer in a few seconds, and a pro finds every option they need one click away. The result should be clear enough that people want to share it.

This doc holds the decisions and taste specific to stack127. Good general UI practice still applies, and isn't repeated here. Words follow [writing-style.md](writing-style.md). Tokens follow [design-system.md](design-system.md). Components are in [shared-ui.md](shared-ui.md).

## Serve both people

Most people who use a tool want one or two plain answers fast, such as "what's my number?" and "how does it compare?" A smaller group needs depth: per-period breakdowns, extra plans, different methods, edge settings. A great tool serves both. Never make the common user wade through depth, and never drop the depth a pro needs just to look simple.

- **Basic** answers the common questions with the fewest inputs most people know offhand. It's always visible.
- **Advanced** holds the depth. It's where pros find everything they'd expect from a serious tool in this space. Research tells you what that is: what competitors offer, what forum users ask for, and what the old tool did.
- Rebuilding or reworking a tool never removes a working capability. Move it into Advanced, or into the page content if it's reference material. Leave something out only when nobody you named would use it, and write down why.

Every tool's plan takes a position: who most users are and their top questions, what Basic answers, what Advanced holds and for whom, and what's left out and why. Add an input because those people need it, not because a competitor has it. Cut one only for a reason a user would agree with.

## Inputs

- Basic inputs sit at the top of the workbench. Advanced is one `UiDisclosure` below them, closed by default, named for what's inside, such as `Cohorts and billing` or `Resolver settings`. Its closed summary says what's set, with `uiSetSummary`.
- Mark every required field with `required`, which shows `*` beside its label. Basic inputs are usually all required and Advanced ones all optional, and the mark still goes on, because people expect it. A field that becomes required when its partner is filled gets the mark then.
- Every Advanced input is optional. Empty means not applied, or a default the hint names, such as "Empty uses 6 × 9 in." With Advanced empty, the answer matches Basic. Don't hide a default that changes the answer without naming it.
- When a refinement needs values together, such as a customer count and a price, ask for them together inside Advanced. Filling one makes its partner required.
- Repeated rows, such as one row per month or per drive, belong in Advanced with `UiRepeatableList` unless most people need them. Each row stays on one line on wide screens. Remove stays in a fixed last column.
- Every input must change the result. If it doesn't, cut it.
- Never use a checkbox or switch to reveal more fields. Never build mode switches or tabs for Basic and Advanced.
- No text under fields, headings, options, or buttons. When a label needs explaining, give it a `hint`: one sentence behind a small `?`.
- Accept the real range of the domain. Don't cap an input below what real people enter. When the domain itself has a limit, such as a maximum the platform allows, the error names the limit and who sets it.
- Units go in a suffix or a unit select. Short important choices, up to about four, show as a visible choice row, not a dropdown.

## Default state and the button

Every tool opens with realistic example values filled in and their result showing, so the first thing anyone sees is a finished answer. Pick typical values, not extreme ones, so the first result and any comparison don't mislead. Mark the result `Example` until the person calculates their own.

One primary button, named for the result, such as `Calculate royalty` or `Look up DNS`, sits below the inputs with a quiet `Reset` beside it. The result changes only when the person presses it.

- When inputs change after a result, the old result stays but steps back (`ToolResult stale`), and a short status says `Inputs changed`. It never disappears.
- Errors show when the person presses the button: under each field, with focus on the first one. If that field is inside Advanced, open it first.
- A shared link opens and calculates right away. If a value in it is invalid, show the error the same way.
- Reset returns to the example and its result.
- Network tools, such as DNS lookups, show an example input but run only when the person presses the button, never on load.

## Empty and blocked results

The result region keeps its size and place in every state, so the page never jumps or turns into an empty band.

- **Invalid input:** the last good result stays, stepped back, while the errors point at the fields.
- **A domain rule blocks the answer:** answer with the rule instead of going blank. If the price is below the platform's minimum, the answer is that minimum, and what you'd earn at it. If a value is past a hard limit, say the limit, who sets it, and the nearest result you can give.
- **Nothing to show yet,** such as a network lookup before its first run: show the shape of the result with `—` in place of values, never a blank band or a paragraph of instructions.
- **Partial results:** one bad Advanced value hides only the part of the result it feeds, never the main answer.

## The result

The result is personal. It shows only what the person's own inputs produced.

Design it so people can scan it with a clear hierarchy. Guide the eye: the main answer is big and prominent, with its visual, where the eye lands first. Smaller numbers stay clean and readable for the people who want to dig in. Detail pros asked for in Advanced, such as a per-row table, comes after. Arrange it for this tool's answer; there is no fixed layout.

Add Share, copy, or download when useful. `UiShareAction` copies a link that reopens the same inputs. For lookups and checks, put the person's raw records in a closed disclosure.

Sources, published-figure tables, method notes, definitions, caveats, and advice go in the page content, never in the result. A short status word is fine when a number alone could mislead, such as `Provisional` with `15 days left`. Each result region answers a different question, so don't show a value twice.

### Make it visual

Pick the visual that makes this person's answer obvious. Think about the relationship you're showing: a share of a whole, a flow from one stage to the next, progress toward a goal, a ranking, a change over time, a breakdown, a position on a range. Then pick the form that shows it best.

Any Apache ECharts chart type works through our chart wrapper. If the type you need isn't in the wrapper yet, add it. See Charts in [shared-ui.md](shared-ui.md). Shared result components, a custom SVG, or marker art for a concept are fine too.

A visual must show something the numbers alone don't. A chart that repeats one number is decoration. Size a visual for reading, not to fill space. Charts are at least 260px tall.

### Comparisons

Show a published comparison only when the research found data that measures the same thing, the same way: the same definition, unit, and time window. When the person's own settings differ, such as a 30-day window against a six-month benchmark, hide the comparison. When they haven't set it, show the comparison with the source's window in its visible label, such as `Median, paid within 6 months`.

- Show where the person sits next to the range, such as with `UiRangeMarker`. Put the source's name in a hint.
- Never grade. No `good`, `bad`, `below typical`, scores, or red, yellow, and green that imply a verdict. Niches differ.
- If sources disagree or measure something else, show none. Unknown beats fake precision.

## Layout and whitespace

Every tool uses `ToolWorkbench`, `ToolFieldRow`, and `ToolResult` from `app/ui/tools/tool-workbench.tsx`. Don't write your own workbench band, width, or section gaps.

- The workbench is a full-width band. Its content uses the shared 66rem working width. That width is room, not a quota. Don't stretch a few results across it; leftover whitespace is fine when the result reads well.
- Inputs first, then the action row, then the result below one divider, all on the same left edge.
- Fields that belong to one decision share a row with `ToolFieldRow`. Unrelated fields don't share a row just to fill space. On phones every row stacks, in reading order.
- Readability beats filling space. When labels and values squeezed into columns start wrapping, use a vertical list instead.
- Spacing comes from the shared gaps: wider between regions, tighter inside a group. Group with space and alignment, not nested cards or extra borders.
- A table or chart keeps its overflow inside its own frame. Nothing causes page-level overflow.

## How a stack127 tool feels

Every tool should feel made by the same hand, while its inputs and visual fit its own job:

- The same band, working width, and spacing from `ToolWorkbench`, and the same tokens, typography, and 2px radius from [design-system.md](design-system.md). Dark by default.
- The same pieces for the same jobs: `hint` for explanations, one `UiDisclosure` for Advanced, `UiShareAction` for links, and the chart wrapper for charts.
- The same order: inputs, the action, then the result.
- Accent fill only on the primary button. Result visuals use the data colors, with the first one on the person's own value and nothing competing with it.
- Numbers in the mono font, words in the sans font, and no decoration that doesn't carry meaning.

## Good and bad tools

These show the quality bar, not a template. Each good tool looks different because its job is different. Don't copy their layouts.

**Good: an MRR goal calculator.** It opens with an example: $4,000 MRR now, a $10,000 goal, and 8% monthly growth, with the result already showing. The answer reads `12 months`, with the goal month under it. A line chart shows the MRR path rising to meet a flat goal line. Two small numbers answer the next questions: the growth needed to get there 6 months sooner, and the new MRR needed each month. Advanced, `Churn, expansion, and monthly targets`, holds what a growth lead models, including a different growth rate per quarter.

**Good: a domain expiry check.** One field with an example domain, and `Check expiry`. Before the first run, the result shows its shape with `—`. After it, the answer reads `Expires in 43 days`, with the date. A bar runs from the registration date to the expiry date, with a marker for today. The registrar and auto-renew status sit below as two small facts. The raw RDAP response is in a closed disclosure.

**Good: a RAID capacity planner.** It opens with four 8 TB drives in RAID 5 and its result. The answer reads `24 TB usable`, and a bar beside it splits the raw space into usable, parity, and reserve, with `Survives 1 drive failure` as a status. Advanced, `Mixed drives and reserve`, lets a pro list each drive's size and set a free-space reserve, and the result adds a per-drive table.

**Bad: the form you have to read.** A sentence under every field. A checkbox that reveals five more required fields. An input most people would have to work out by hand before they get any number.

**Bad: the gutted tool.** It looks simple because the options pros relied on were deleted, such as mixed drive sizes in a RAID planner. Pros leave, and the page has less to say than its competitors.

**Bad: the stretched result.** Three short results spread across the full width. A legend squeezed into three columns, so every label wraps onto two lines and the eye zigzags to find its value.

**Bad: the blank error.** A retention period past the provider's limit makes the whole result disappear. The person has to guess the limit, and the page jumps.

**Bad: the report in the result.** The number, then three sentences explaining it, a table of published studies, and method notes.

**Bad: the dashboard.** Eight equal cards with no lead answer. A donut with one slice. A green `Good` badge based on someone else's average.

## URL state

A tool lives at one clean URL, such as `/raid-calculator`. The tool never changes the URL on its own: not on load, not after a result, and not when someone presses Share.

Sharing is the only way state gets into a URL. `UiShareAction` copies a link with the current inputs. Opening that link restores them and calculates. A link counts as shared only when it carries the tool's own parameters. Ignore anything else, such as `utm_source`, and open on the normal example.

Tool pages stay static, so the server page never reads `searchParams`. A small client wrapper, `<slug>-from-url.tsx`, reads a shared link with `useInitialQuery()` from `app/ui/tools/use-initial-query.ts` and renders the tool with `key={query.key}`. `dns-lookup` is the reference. See [caching.md](caching.md).

## Components

Use the shared components in `app/ui/` and the `/components-ui` gallery. When nothing fits, build a shared component that more than one tool can use, with a gallery example. Keep tool-specific behavior in the route. Never fall back to an unstyled native control because the stack127 piece doesn't exist yet.

## Plan before you build

New tools and major redesigns need an agreed plan in `content_docs/<slug>/tool-spec.md` first, from `skills/stack127/stack127-tool-page/SKILL.md`. Small fixes that don't change inputs, results, or layout can skip it.

## Review

Look at the rendered tool at desktop and mobile width, in both themes.

- Does it open on a realistic example with its result showing?
- Can a first-time visitor get their answer without reading anything but labels?
- Would a pro find what they expect in Advanced? Did any capability the research or the old tool had go missing?
- Can someone scan the result: the main answer and its visual first, smaller numbers readable, and no label squeezed until it wraps?
- Does every required field show `*`?
- Does the result keep its place when inputs change, are invalid, or hit a domain limit? Does a limit answer instead of blanking?
- Does every input change the result?
- Is everything in the result about the person's own inputs, shown so it's obvious at a glance?
- Is any word in the workbench more than a label, hint, option, button, value, error, or status?
- Does the URL stay clean until someone presses Share?
- Does it work with a keyboard, with visible focus, and without page overflow?
