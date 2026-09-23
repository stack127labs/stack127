# Marker Art

Marker art is the stack127 illustration style: bold hand-drawn strokes, restrained zigzag fills, and a handwritten font, in the spirit of a thick marker on a dark board. It is used for conceptual diagrams, meaningful spot art, hero art, and quiet doodles. Exact data belongs in clean charts. This doc is the single source of truth for how marker art works and how agents produce it.

The two skills that operate this system are `skills/stack127/marker-art-suggest` and `skills/stack127/marker-art-draw`.

## How it works

Marker art is never drawn at runtime. Figures are generated at build time and shipped as static inline SVG: server rendered, crawlable, cached, zero client JavaScript.

- Every figure is defined by a `*.spec.json` file: figure type, the actual data, labels, icons, a seed.
- The generator (`scripts/stack127/marker-art/generate.mjs`) turns specs into SVGs using rough.js (the library Excalidraw is built on). Run it with `npm run stack127:marker-art`.
- It emits two artifacts next to each spec: `<name>.svg` (the canonical, reviewable file) and `<name>.ts` (the same SVG exported as a string, for bundling).
- Pages embed figures with the `MarkerArt` component (`app/ui/site/marker-art.tsx`), passing the imported svg string and a caption. `MarkerArt` delegates to the site-wide `MediaFigure` diagram variant.
- Seeds make output deterministic: the same spec always renders the same strokes.

To change the data in a figure, edit its spec and rerun the generator. To evolve the style itself, edit `scripts/stack127/marker-art/config.mjs` and regenerate everything.

## File conventions

- Specs and generated art live next to the page they belong to: `app/<page-path>/art/<figure>.spec.json`.
- Figure ids are `<page-slug>--<figure-slug>`, for example `basic-setup--five-pieces`.
- Throwaway explorations and showcases belong under `/tmp/stack127/`, outside `app/`.
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
- Labels use the marker font. Numbers use the mono font.
- Never place text on a filled shape. Boxes that need labels get a colored stroke and no fill.
- Use [writing-style.md](writing-style.md) for figure labels, captions, and alt text.
- Every figure has exactly one takeaway, stated in the spec's `takeaway` field. That sentence becomes the SVG `<title>` (for crawlers and screen readers) and usually the visible figcaption. If you cannot state the takeaway in one sentence, it is two figures.

## Four roles, four compositions

Choose the role before drawing. Do not shrink a full diagram into a catalog card or enlarge a small icon into a hero.

### Spot art

Spot art identifies one page or tool inside a card or compact listing.

- Draw one recognizable subject or relationship, with at most one supporting object.
- Use no visible words, axes, legends, or miniature interface controls.
- Keep the silhouette readable at the final card size. Detail that disappears there does not belong in the source.
- Use ink for the structure and one semantic primary stroke for the subject.
- Do not put the drawing inside another decorative box. The card already provides the boundary.

### Hero art

Hero art introduces the page's subject without competing with the h1.

- Build one composed scene with a clear focal object and deliberate empty space.
- Keep supporting objects fewer, smaller, and quieter than the focal object.
- Avoid repeated symbols, scattered sparks, and filler marks used only to occupy space.
- The art may suggest a relationship, but it should not require a legend or paragraph to decode.

### Explainer

An explainer makes one conceptual relationship visible.

- Establish the reading direction before adding labels or connectors.
- Use alignment and proximity to show groups. Add an outline only when it defines a real boundary.
- Keep nodes large enough to recognize and connectors far enough from text to read cleanly.
- Use the fewest labels that preserve the idea. Split a figure when secondary branches compete with the main path.
- Use a clean chart or table when exact comparison matters.

### Doodle

A doodle is a quiet gesture in open space.

- Use one continuous idea, not a collection of unrelated marks.
- Keep it subordinate to nearby text and controls.
- Doodles never carry required meaning and stay hidden from assistive technology.

## Visual hierarchy and restraint

- Start with the silhouette and major relationship. Add internal marks only after the figure already reads without them.
- One shape or group is dominant. Supporting shapes must be visibly smaller, lighter, or simpler.
- Preserve empty space around the focal object. A full canvas is not a finished canvas.
- Color identifies meaning. Do not alternate tones to create variety.
- Keep stroke weight and roughness consistent inside one figure. Extra wobble does not make weak composition feel handmade.
- Avoid tiny repeated objects, crossing connectors, centered text inside irregular shapes, and labels resting on lines.
- Do not use generic technology symbols when a page-specific object or relationship can identify the subject.
- Never add art merely because a region feels empty. Fix spacing first; draw only when the image carries identity or understanding.

## Choosing the figure type

Pick whatever shows the idea fastest. There is no fixed menu; if a better form exists for the claim, add it to the generator. Rough guide:

| The claim is about | Reach for |
| --- | --- |
| comparing approximate or conceptual amounts | bar |
| a conceptual part of a whole | donut |
| a conceptual direction of change | line |
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
| a small semantic drawing for a catalog card | toolSpot |
| pure decoration, no data | doodle |

## Decorative doodles

The `doodle` figure type is the one exception to "every figure has data": it decorates hero corners, margins, and empty states. Doodles use muted `sub` strokes plus at most one `primary` stroke so they whisper instead of compete. Sitewide doodle specs live in `app/(site)/art/` and render through the `Doodle` component (`app/ui/site/doodle.tsx`), which is aria-hidden, unframed, and hides corner placements below 1100px. At most two doodles should be visible per viewport.

Density is a judgment call, not a quota. Show the data the point needs, and stop when a two second squint no longer gets the idea. If a figure stops scanning, split it or simplify it.

## Data accuracy

- Marker art does not present exact values. Use the clean-chart pipeline when a reader needs to compare, quote, or reproduce a number.
- Geometry is always computed from the numbers in the spec. Nobody eyeballs a bar length or a pie angle.
- Every spec has `source` (where the numbers came from) and `dataAsOf` (a date). Real data gets a real source; conceptual figures say so.
- The generator validates what it can: donut percentages must sum to 100, bar values must be numeric, line series need at least two points.
- Follow the site rule: unknown beats fake precision. Round honestly and do not invent decimals the source does not support.

## No overlap, no clutter

Overlapping text or crowded elements is a hard failure, not a style preference.

- The generator lints estimated text bounding boxes and errors on overlaps and labels that leave the canvas.
- The lint is heuristic (no browser at build time), so a real render review is still required: load the page, look at the figure in dark and light mode, and fix the spec if anything collides or crowds.

## Review at the size people see

The source SVG can look clean while the rendered figure fails. Review each figure in its real component and viewport.

- Spot art: inspect it at the card's actual size. If its subject becomes an anonymous knot of strokes, simplify it.
- Hero art: inspect it beside the real h1 and introduction. It should support their reading order, not pull attention away.
- Explainer: inspect desktop and mobile layouts. Labels must remain readable without zooming or horizontal scrolling.
- Doodle: inspect the whole viewport. Remove it when it makes the page feel busier or creates a false focal point.
- Dark and light themes: verify hierarchy and semantic tones in both, not just basic contrast.

Use a thumbnail check as well as a close inspection. The takeaway should survive when details are no longer visible.

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

See `app/(site)/(courses)/self-hosting-for-beginners/basic-setup/art/five-pieces.spec.json` for a live flow figure and `app/(site)/(catalogs)/_components/art/` for live tool spots. Generate a browsable showcase of a draft folder with `node scripts/stack127/marker-art/generate.mjs --index <dir>`.

## Workflow

1. Suggest: the `marker-art-suggest` skill reads the page, proposes placements (where, what claim, which figure type, with the data and source). Showcase HTML only when asked.
2. Approve: the user picks what to build.
3. Draw: the `marker-art-draw` skill writes specs, runs the generator, embeds figures with `MarkerArt`, and reviews a real render in both themes.
4. Maintain: when data changes, update the spec and regenerate. When the style changes, update the config and regenerate everything.

---

_Internal doc. Created 2026-07-07, last updated 2026-09-04._

## Homepage card artwork

Every homepage card must have a spec-backed marker drawing in the homepage art registry. Never substitute an enlarged Lucide icon, another interface icon, a traced icon, or an ad hoc SVG for marker art. Small identity icons beside titles are separate and may remain. Add missing hardware subjects to the shared marker icon library, generate the spec artifacts, and inspect them at card size in both themes. The homepage art coverage test must pass before handoff.
