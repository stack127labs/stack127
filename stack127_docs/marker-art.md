# Marker Art

Marker art is the stack127 illustration style: bold hand drawn strokes, zigzag fills, and a handwritten font, in the spirit of a thick marker on a dark board. It is used for every diagram, chart, and visual explainer on the site. This doc is the single source of truth for how it works and how agents produce it.

The chosen style came out of `dev-space/art-style-lab.html` (the "bold marker" candidate). The two skills that operate this system are `skills/stack127/marker-art-suggest` and `skills/stack127/marker-art-draw`.

## How it works

Marker art is never drawn at runtime. Figures are generated at build time and shipped as static inline SVG: server rendered, crawlable, cached, zero client JavaScript.

- Every figure is defined by a `*.spec.json` file: figure type, the actual data, labels, icons, a seed.
- The generator (`scripts/stack127/marker-art/generate.mjs`) turns specs into SVGs using rough.js (the library Excalidraw is built on). Run it with `npm run stack127:marker-art`.
- It emits two artifacts next to each spec: `<name>.svg` (the canonical, reviewable file) and `<name>.ts` (the same SVG exported as a string, for bundling).
- Pages embed figures with the `MarkerArt` component (`app/marker-art.tsx`), passing the imported svg string and a caption. `MarkerArt` delegates to the site-wide `MediaFigure` diagram variant.
- Seeds make output deterministic: the same spec always renders the same strokes.

To change the data in a figure, edit its spec and rerun the generator. To evolve the style itself, edit `scripts/stack127/marker-art/config.mjs` and regenerate everything.

## File conventions

- Specs and generated art live next to the page they belong to: `app/<page-path>/art/<figure>.spec.json`.
- Figure ids are `<page-slug>--<figure-slug>`, for example `basic-setup--five-pieces`.
- Throwaway explorations and showcases live in `dev-space/`, never in `app/`.
- Generated `.svg` and `.ts` files are committed. They are build artifacts, but committing them keeps deploys simple and diffs reviewable.
- New icons go into `scripts/stack127/marker-art/icons.mjs`. Never draw an ad hoc shape for a concept that deserves a reusable icon.
- New figure types go into `scripts/stack127/marker-art/figures.mjs` once, then every page can use them.

## Semantic color

Color always means something. Never use color as decoration or variety.

| Tone | CSS variable | Means |
| --- | --- | --- |
| ink | `--ma-ink` | default strokes and text, neutral structure |
| sub | `--ma-sub` | secondary text, axes, captions inside figures |
| primary | `--ma-primary` | the subject, the main thing the figure is about |
| good | `--ma-good` | good, recommended, safe, light, cheap |
| warn | `--ma-warn` | heavy, costly, risky, avoid |
| note | `--ma-note` | neutral highlight, sticky notes, decision points |

Both themes define these in `app/globals.css`. Generated SVGs carry dark fallbacks so a raw `.svg` file previews correctly on its own.

The payoff of semantic color is instant reading: in a bar chart where heavy apps are warn and light apps are good, the point lands before anyone reads a label. If a figure uses color without meaning, it is wrong.

## Writing inside figures

- Icon and shape first, text second. If an icon exists for the concept, use it; the label supports the icon.
- Keep words minimal. Labels are lowercase, short, and in the marker font. Numbers use the mono font.
- Never place text on a filled shape. Boxes that need labels get a colored stroke and no fill.
- Figure text is site copy: no em or en dashes, no hype words, and ranges written as "10 to 15W". The site writing rules apply inside SVGs too.
- Every figure has exactly one takeaway, stated in the spec's `takeaway` field. That sentence becomes the SVG `<title>` (for crawlers and screen readers) and usually the visible figcaption. If you cannot state the takeaway in one sentence, it is two figures.

## Choosing the figure type

Pick whatever shows the idea fastest. There is no fixed menu; if a better form exists for the claim, add it to the generator. Rough guide:

| The claim is about | Reach for |
| --- | --- |
| comparing amounts | bar |
| parts of a whole | donut |
| change over time | line |
| how pieces connect | flow |
| a sequence to follow | steps |
| a choice with branches | decision |
| a config file with important lines | composeMap |
| host ports versus container ports | portMap |
| replaceable app versus durable data | survival |
| private access through a tunnel | tunnel |
| layers that build on each other | stack |
| a small choice matrix | tradeoff |
| increasing trust or risk | riskLadder |
| backup proof by restore | restoreLoop |
| a grouped course path | roadmap |
| a folder, file, command, and URL workspace | workbench |
| pure decoration, no data | doodle |

## Decorative doodles

The `doodle` figure type is the one exception to "every figure has data": it decorates hero corners, margins, and empty states. Doodles use muted `sub` strokes plus at most one `primary` stroke so they whisper instead of compete. Sitewide doodle specs live in `app/(site)/art/` and render through the `Doodle` component (`app/doodle.tsx`), which is aria-hidden, unframed, and hides corner placements below 1100px. At most two doodles should be visible per viewport.

Density is a judgment call, not a quota. Show the data the point needs, and stop when a two second squint no longer gets the idea. If a figure stops scanning, split it or simplify it.

## Data accuracy

- Geometry is always computed from the numbers in the spec. Nobody eyeballs a bar length or a pie angle.
- Every spec has `source` (where the numbers came from) and `dataAsOf` (a date). Real data gets a real source; conceptual figures say so.
- The generator validates what it can: donut percentages must sum to 100, bar values must be numeric, line series need at least two points.
- Follow the site rule: unknown beats fake precision. Round honestly and do not invent decimals the source does not support.

## No overlap, no clutter

Overlapping text or crowded elements is a hard failure, not a style preference.

- The generator lints estimated text bounding boxes and errors on overlaps and labels that leave the canvas.
- The lint is heuristic (no browser at build time), so a real render review is still required: load the page, look at the figure in dark and light mode, and fix the spec if anything collides or crowds.

## Accessibility and SEO

- Every SVG has `role="img"` and a `<title>` carrying the takeaway.
- The `MarkerArt` component renders through `MediaFigure` and wraps figures in `<figure>` with a `<figcaption>`.
- Colors meet contrast on both themes because they come from the theme token sets, not from per figure choices.

## Spec quick reference

Common fields for every spec:

```json
{
  "id": "page-slug--figure-slug",
  "type": "bar | donut | line | flow | steps | decision | composeMap | portMap | survival | tunnel | stack | tradeoff | riskLadder | restoreLoop | roadmap | workbench",
  "takeaway": "one sentence, becomes the svg title and usually the caption",
  "source": "where the numbers came from",
  "dataAsOf": "YYYY-MM-DD",
  "seed": 42,
  "data": {}
}
```

See `dev-space/marker-art-samples/` for a working sample of every figure type, and `app/self-hosting-for-beginners/basic-setup/art/five-pieces.spec.json` for a live flow figure. Generate a browsable showcase of any folder with `node scripts/stack127/marker-art/generate.mjs --index <dir>`.

## Workflow

1. Suggest: the `marker-art-suggest` skill reads the page, proposes placements (where, what claim, which figure type, with the data and source). Showcase HTML only when asked.
2. Approve: the user picks what to build.
3. Draw: the `marker-art-draw` skill writes specs, runs the generator, embeds figures with `MarkerArt`, and reviews a real render in both themes.
4. Maintain: when data changes, update the spec and regenerate. When the style changes, update the config and regenerate everything.

---

_Internal doc. Created 2026-07-07, last updated 2026-07-07._
