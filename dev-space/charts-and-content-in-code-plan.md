# Charts and content in code plan

Goal: one chart system (ECharts through `UiChart`), and page content written in code, so any page can use any shared component. Data stays in the database. When every step is done and reviewed, the whole result ships to production.

Work through the steps in order. Step 0 and Part 1 ship together in pull request #35. Mark each step done here when its work is reviewed, and when its pull request merges.

## Status

| Step | What | Who | Pull request | Status |
| --- | --- | --- | --- | --- |
| 0 | Ship the current work | Opus, Sol review | #35 | Shipped in `cba975b3` |
| 1a | Chart docs and skills | Opus | #35 | Shipped in `cba975b3` |
| 1b | Move every chart to `UiChart` | Claude Opus worker, Sol review | #35 | Shipped in `cba975b3` |
| 1c | Preview server readiness fix | Sol | #35 | Shipped in `cba975b3` |
| 2a | Content design doc | Opus | #36 | Shipped in `ce282243` |
| 2b | Pilot: MDX setup, export script, two pages | Claude Opus worker, Sol for the script, Sol review | #36 | Shipped in `ce282243`: `/cac-payback-calculator` and `/epp-status-codes` |
| 2c | Docs and skills for content in code | Opus | #36 | Shipped in `ce282243` |
| 2d | Content pass: rewrite and move every published tool, directory, child, and catalog page | Claude Opus thread in its own worktree, Sol for scripts and review | #39 | Done 2026-10-10. Released in 84043484; titles, search text, and cards published to production in 25 batches, all verified |
| 2e | Cleanup and retire database content columns | Sol, Opus and Luna workers, Sol review | #42, #43 | Done 2026-10-10. #42 (released in `72f5bec7`) removed every database content reader, retired the sync commands, and made the columns optional. #43 archives the columns into `stack127_retired_page_content` and drops them |
| 3 | Production release | Coordinator | #42, #43 | Done 2026-10-10. Both releases verified on stack127.com; shortcut records, launch data, the DNS lookup version, and three shortcut page titles published |

## Decisions

| Question | Decision |
| --- | --- |
| `UiFlowChart` is a step diagram, not a data chart. Keep it or remove it? | Keep it as `UiSteps` in `app/ui/display.tsx`, next to `UiTimeline`, and show it in the Results section of the gallery. |
| Where do the version and updated date live once content is in code? | In the database, the same for every page. The publish command updates them when content changes in a way readers should see. |
| Courses are already TSX. Move them to MDX now? | Later, after the rest of this plan is done. |
| Move pages as they are, or rewrite them? | Rewrite and move in one pass, in the current writing style. Pages already rewritten with Claude only move. |
| Do child pages get their own words? | Yes. Every page a visitor can land on, except pagination, gets its own intro, title, and search text. Keyboard shortcut pages need only a two-line intro. |
| Which pages are in the pass? | Published tools, directories, directory child pages, and catalogs. Unpublished pages, courses, and site pages stay as they are. |

---

## Step 0: Ship the current work

Shipped with Part 1 in pull request #35, released to production as `cba975b3` on 2026-10-09.

The branch `chore/audit-components-page` holds uncommitted work:

- The Components UI gallery: a sidebar with one page per component type.
- Date and time pickers: a time list, a date-then-time flow, and 12-hour time by default with `hourCycle={24}` when a tool needs it.
- Field alignment: one field height, and help or error text that never moves the box. Includes fixes in three tools.
- Multi-choice groups, the unavailable checkbox and switch, and the upload labels.
- The ECharts trial at `/components-ui/echarts-trial`.
- New dependencies: `echarts` and `@internationalized/date`.

Before the pull request:

1. Restore `next-env.d.ts` if the dev server changed it.
2. Run `npm run quality`.
3. Sol reviews the diff.
4. Open the pull request against `main`. Merge after CI passes.

## Part 1: Charts become ECharts only

### 1a. Docs and skills

Write these before the migration, so the worker reads the final rules. Describe only `UiChart`.

| File | What it says |
| --- | --- |
| `stack127_docs/shared-ui.md` | The Charts section: `UiChart`, its chart types, interactive or static, how to add a chart type, the color rules, and page weight limits. |
| `stack127_docs/design-system.md` | Chart colors come from the placeholder list mapped to the data tokens. Charts work in both themes. |
| `stack127_docs/tool-interface.md` | When a tool result needs a chart, and when a plain value or table is better. |
| `stack127_docs/writing-style.md` | When a chart helps the reader, and when an interactive chart is worth its weight. |
| `skills/stack127/tools/stack127-tool-interface-plan/SKILL.md` | Plan result charts with `UiChart`. |
| `skills/stack127/tools/stack127-tool-frontend/SKILL.md` | Build result charts with `UiChart`. |
| `skills/stack127/tools/stack127-tool-audit/SKILL.md` | Check charts in both themes, label clipping, legend, tooltip, and page weight. |
| `skills/stack127/stack127-content-audit/SKILL.md` | The same chart checks for content pages. |

Chart rules to write down:

- Add a chart type in `app/ui/charts/echarts.ts`, then its data shape and settings in `chart-option.ts`, then a gallery example.
- Every color comes from the placeholder list in `chart-option.ts`. No gradients and no rgba colors. Use opacity for lighter and darker.
- Turn off hover color changes. Tooltips stay on.
- SVG only. Canvas can't follow the theme.
- Chart text uses the mono font. Text measuring depends on it.
- Interactive charts load about 170 to 190 KB of script, compressed. Use a static chart when nobody needs hover or ranges.
- Dense charts make heavy HTML. Thin long lines on the server with `thinPoints`. Summarize data first for large scatters and heatmaps.

### 1b. Move every chart to `UiChart`

Give this to a Claude Opus worker.

1. Make `UiChart` final: the gallery's Charts section shows the `UiChart` examples, and the separate "ECharts trial" section goes away. Keep the page weight panel as a gallery tool.
   - Pages use `UiChart`, which draws on the server. Tool results computed in the browser use `UiLiveChart`, the same chart without a server drawing.
   - Charts take an optional caption. Line x values may be labels, which give a category axis.
   - Small charts carry a visually hidden data table for screen readers.
   - Rename `UiFlowChart` to `UiSteps` and move it to `app/ui/display.tsx`.
2. Change the chart blocks in `app/ui/content-markdown.tsx` (`chart-bar`, `chart-line`, `chart-donut`) to render static `UiChart` charts. This covers the time until content moves to code.
3. Delete the old charts:
   - `app/ui/visuals.tsx` and its stylesheet, after `UiSteps` moves out.
   - `app/ui/site/chart.tsx`.
   - `scripts/stack127/clean-charts/` and the `stack127:clean-charts` npm script. No page uses them.
4. Run a read-only query for chart blocks in live database content, and confirm each still renders.
5. Checks: `npm run quality`, plus a browser check of the gallery and every live page with a chart, at desktop and mobile width, in both themes.
6. Sol review, then the pull request.

### 1c. Preview server readiness fix

`scripts/stack127/homelab-preview.mjs` waits 3 seconds per readiness request and 90 seconds in total. On the homelab disk the first compile takes longer, so the script stops a healthy server. Give each request and the total wait more time. This is a small Sol task.

## Part 2: Page content moves to code

### What moves and what stays

| Moves to code | Stays in the database |
| --- | --- |
| Intro, usage text, article content, and content blocks of tool, directory, catalog, and site pages | The publication registry, page titles, descriptions, SEO fields, card text, versions, and dates |
| | All data records: self-host apps, TLDs, shortcuts, launch directories, and the rest |

Child pages built from data stay one template in code that reads the records. Never one code file per record.

### 2a. Content design doc

Write `stack127_docs/page-content.md`:

- **Files:** each page has `intro.mdx` and `content.mdx` beside its route. TSX keeps the layout and anything interactive.
- **MDX setup:** `@next/mdx`, rendered on the server. One components file lists everything content may use: headings and prose, the note, warning, formula, and example callouts, `UiDataTable`, `UiChart`, code blocks, figures, marker art, and links. MDX can't use anything outside that list.
- **Guardrails:**
  - One heading hierarchy. Content never has its own h1.
  - No eyebrows, kickers, or decorative labels.
  - One text style.
  - A fixed section order for each page family.
  - No raw HTML or inline styles.
  - A small check script fails the build when a file breaks the structure rules.
- **Releases:** a content change is a code release. Version and date fields stay in the database and follow the decision above.

### 2b. Pilot

1. Sol writes one export script. It copies a page's database content into MDX files and converts callouts and chart blocks into components.
2. A Claude Opus worker moves one tool and one directory, then cleans them to the guardrails.
3. Checks:
   - The visible text is the same before and after.
   - Titles, descriptions, and SEO fields are unchanged.
   - Before and after screenshots at desktop and mobile width, in both themes.
   - The pages stay static.
   - Record the build time.
4. Sol review, then the pull request.

Fix any setup problem here, on two pages, before the batches start.

### 2c. Docs and skills for content in code

Ships in the pilot's pull request, not earlier, so agents on `main` never follow docs for a setup that isn't there yet. Describe only the new model.

- Docs: `tool-pages.md`, `directory-pages.md`, `page-publishing.md`, `page-families.md`, `caching.md`, `writing-style.md`, `shared-ui.md` for the MDX block list, and the "Routes and publication" section of `CLAUDE.md`.
- Skills: tool writing, directory writing, tool content integration, page build, tool orchestrator, tool audit, content audit, and release where it covers content.

### 2d. Content pass

Rewrite every published tool, directory, directory child, and catalog page in the current writing style, and move it to MDX in the same pass. Search titles and descriptions are rewritten too, as if the page were new.

- **Move only:** the 21 tools already rewritten with Claude: every `kdp-*` tool, `kindle-unlimited-kenp-earnings-calculator`, `pixels-to-print-size-calculator`, `break-even-mrr-calculator`, `cac-payback-calculator` (already moved), `customer-acquisition-cost-calculator`, `customer-lifetime-value-calculator`, and `ltv-cac-calculator`.
- **Rewrite and move:** the other 50 published tools, the 14 published directories, their 226 published child pages (218 keyboard shortcut apps and 8 platform fee categories), and the 8 published catalogs. `/epp-status-codes` is already moved, but its words still need the rewrite.
- **Out:** unpublished pages, pagination, courses, and site pages.
- One branch, committed often, released once at the end: Sol review, one pull request, then the production publisher batch for titles and search metadata.

### 2e. Cleanup

After every page is moved and checked in production:

1. Page renderers stop reading the database content columns.
2. Retire the content sync commands. Publish commands keep the registry, SEO, version, and data flows.
   - The publisher stops requiring `intro_markdown` and `content_markdown` for new pages, and stops validating the `*_markdown` fields. Until then, new tool and directory manifests fill them with one summary sentence, as `stack127_docs/page-publishing.md` says.
3. A migration freezes or drops the old content columns. This is a production data step and needs the user's authorization at that point.

## Step 3: Production release

When steps 0 to 2e are merged:

1. Follow `skills/stack127/stack127-release-e2e/SKILL.md`.
2. Confirm the merge commit, `origin/main`, the deployed image SHA, and the live health SHA match.
3. In Cloudflare hosting mode, confirm `/frontend-release.json` shows the merge commit.
4. Check a sample of real pages in production at desktop and mobile width: one tool, one directory, one catalog, one site page, and every page with a chart.

## Risks

| Risk | Guard |
| --- | --- |
| SEO changes from moving content | Text match check. Titles and SEO fields don't move. |
| MDX with Next 16 and Turbopack | The pilot proves it first. |
| Build time with a few hundred MDX files | Measure in the pilot. |
| Large diffs that are hard to review | Batches by page family. |
| Chart script weight on phones | Static charts by default. Interactive only where hover or ranges help. |
