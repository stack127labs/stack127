# Marker art

Marker art is the stack127 illustration style. It uses bold hand-drawn strokes, restrained zigzag fills, and a handwritten font, like a thick marker on a dark board.

Use it for conceptual diagrams, meaningful spot art, hero art, and quiet doodles. Exact data belongs in clean charts. This doc is the single source of truth for how marker art works and how agents make it.

Two skills run this system: `skills/stack127/marker-art-suggest` and `skills/stack127/marker-art-draw`.

## How it works

Marker art is never drawn at runtime. Figures are generated at build time and shipped as static inline SVG. That means they're server rendered, crawlable, cached, and need no client JavaScript.

- A `*.spec.json` file defines each figure: figure type, the actual data, labels, icons, and a seed.
- The generator (`scripts/stack127/marker-art/generate.mjs`) turns specs into SVGs with rough.js, the library Excalidraw is built on. Run it with `npm run stack127:marker-art`.
- It writes two files next to each spec. `<name>.svg` is the canonical file you review. `<name>.ts` is the same SVG exported as a string, for bundling.
- Pages embed figures with the `MarkerArt` component (`app/ui/site/marker-art.tsx`). Pass it the imported SVG string and a caption. `MarkerArt` hands off to the sitewide `MediaFigure` diagram variant.
- Seeds make output repeatable. The same spec always renders the same strokes.

To change a figure's data, edit its spec and rerun the generator. To change the style itself, edit `scripts/stack127/marker-art/config.mjs` and regenerate everything.

## File conventions

- Specs and generated art live next to their page: `app/<page-path>/art/<figure>.spec.json`.
- Figure ids are `<page-slug>--<figure-slug>`, for example `basic-setup--five-pieces`.
- Throwaway experiments and showcases go under `/tmp/stack127/`, outside `app/`.
- Commit the generated `.svg` and `.ts` files. They're build output, but committing them keeps deploys simple and diffs easy to review.
- New icons go in `scripts/stack127/marker-art/icons.mjs`. Never draw a one-off shape for a concept that deserves a reusable icon.
- New figure types go in `scripts/stack127/marker-art/figures.mjs` once. Then every page can use them.

## Semantic color

Color always means something. Never use it for decoration or variety.

| Tone | CSS variable | Means |
| --- | --- | --- |
| ink | `--ma-ink` | Default strokes and text, neutral structure |
| sub | `--ma-sub` | Secondary text, axes, captions inside figures |
| primary | `--ma-primary` | The subject, the main thing the figure is about |
| good | `--ma-good` | Good, recommended, safe, light, cheap |
| warn | `--ma-warn` | Heavy, costly, risky, avoid |
| note | `--ma-note` | Neutral highlight, sticky notes, decision points |

Both themes define these in `app/globals.css`. Generated SVGs carry dark fallbacks, so a raw `.svg` file previews correctly on its own.

Semantic color lets people read a figure instantly. In a bar chart where heavy apps are warn and light apps are good, the point lands before anyone reads a label. If a figure uses color without meaning, it's wrong.

## Writing inside figures

- Icon and shape first, text second. If an icon exists for the concept, use it. The label supports the icon.
- Labels use the marker font. Numbers use the mono font.
- Never put text on a filled shape. Boxes that need labels get a colored stroke and no fill.
- Use [writing-style.md](writing-style.md) for figure labels, captions, and alt text.
- Every figure has exactly one takeaway, stated in the spec's `takeaway` field. That sentence becomes the SVG `<title>` for crawlers and screen readers, and usually the visible figcaption. If you can't say the takeaway in one sentence, it's two figures.

## Four roles, four compositions

Pick the role before you draw. Don't shrink a full diagram into a catalog card or blow up a small icon into a hero.

### Spot art

Spot art identifies one page or tool inside a card or compact listing.

- Draw one recognizable subject or relationship, with at most one supporting object.
- Use no visible words, axes, legends, or tiny interface controls.
- Keep the silhouette readable at the final card size. Detail that disappears there doesn't belong in the source.
- Use ink for the structure and one semantic primary stroke for the subject.
- Don't put the drawing inside another decorative box. The card is already the boundary.

### Hero art

Hero art introduces the page's subject without competing with the h1.

- Build one scene with a clear focal object and deliberate empty space.
- Keep supporting objects fewer, smaller, and quieter than the focal object.
- Avoid repeated symbols, scattered sparks, and filler marks that only take up space.
- The art may hint at a relationship, but it shouldn't need a legend or paragraph to decode.

### Explainer

An explainer makes one conceptual relationship visible.

- Set the reading direction before adding labels or connectors.
- Use alignment and closeness to show groups. Add an outline only when it marks a real boundary.
- Keep nodes big enough to recognize, and connectors far enough from text to read cleanly.
- Use the fewest labels that keep the idea. Split the figure when side branches compete with the main path.
- Use a clean chart or table when exact comparison matters.

### Doodle

A doodle is a quiet gesture in open space.

- Use one continuous idea, not a pile of unrelated marks.
- Keep it below nearby text and controls in importance.
- Doodles never carry required meaning, and they stay hidden from assistive technology.

## Visual hierarchy and restraint

- Start with the silhouette and the main relationship. Add inner marks only after the figure reads without them.
- One shape or group leads. Supporting shapes must be clearly smaller, lighter, or simpler.
- Keep empty space around the focal object. A full canvas isn't a finished canvas.
- Color shows meaning. Don't alternate tones for variety.
- Keep stroke weight and roughness the same within one figure. Extra wobble doesn't make a weak composition look handmade.
- Avoid tiny repeated objects, crossing connectors, centered text inside irregular shapes, and labels sitting on lines.
- Don't use generic tech symbols when a page-specific object or relationship can identify the subject.
- Never add art just because a region feels empty. Fix spacing first. Draw only when the image adds identity or understanding.

## Choosing the figure type

Pick whatever shows the idea fastest. There's no fixed menu. If a better form exists for the claim, add it to the generator. A rough guide:

| The claim is about | Reach for |
| --- | --- |
| Comparing approximate or conceptual amounts | bar |
| A conceptual part of a whole | donut |
| A conceptual direction of change | line |
| How pieces connect | flow |
| A sequence to follow | steps |
| A choice with branches | decision |
| A config file with important lines | composeMap |
| Host ports versus container ports | portMap |
| Replaceable app versus durable data | survival |
| Private access through a tunnel | tunnel |
| Layers that build on each other | stack |
| A small choice matrix | tradeoff |
| Increasing trust or risk | riskLadder |
| Backup proof by restore | restoreLoop |
| A grouped course path | roadmap |
| A folder, file, command, and URL workspace | workbench |
| A small semantic drawing for a catalog card | toolSpot |
| Pure decoration, no data | doodle |

Density is a judgment call, not a quota. Show the data the point needs. Stop when a two-second squint no longer gets the idea. If a figure stops scanning, split or simplify it.

## Decorative doodles

The `doodle` figure type is the one exception to "every figure has data." It decorates hero corners, margins, and empty states.

- Doodles use muted `sub` strokes plus at most one `primary` stroke, so they whisper instead of compete.
- Sitewide doodle specs live in `app/(site)/art/`.
- They render through the `Doodle` component (`app/ui/site/doodle.tsx`). It's aria-hidden, unframed, and hides corner placements below 1100px.
- At most two doodles should be visible per viewport.

## Homepage card artwork

Every homepage card needs a spec-backed marker drawing registered in `lib/card-art.ts`. Directories and catalogs store its key in `card_art_key`. The course and Labs keep their keys in the homepage code.

- Never swap in an enlarged Lucide icon, another interface icon, a traced icon, or a one-off SVG for marker art.
- Small identity icons beside titles are separate and may stay.
- Add missing subjects to the shared marker icon library, generate the spec files, and check them at card size in both themes.

## Data accuracy

- Marker art doesn't show exact values. Use the clean-chart pipeline when a reader needs to compare, quote, or reproduce a number.
- Geometry always comes from the numbers in the spec. Nobody eyeballs a bar length or a pie angle.
- Every spec has `source` (where the numbers came from) and `dataAsOf` (a date). Real data gets a real source. Conceptual figures say they're conceptual.
- The generator checks what it can: donut percentages must add up to 100, bar values must be numbers, and line series need at least two points.
- Unknown beats fake precision. Round honestly and don't invent decimals the source doesn't support.

## No overlap, no clutter

Overlapping text or crowded elements is a hard failure, not a style preference.

- The generator checks estimated text bounding boxes. It errors on overlaps and on labels that leave the canvas.
- That check is a guess, since there's no browser at build time. You still need a real render review: load the page, look at the figure in dark and light mode, and fix the spec if anything collides or crowds.

## Review at the size people see

The source SVG can look clean while the rendered figure fails. Review each figure in its real component and viewport.

| Role | Check |
| --- | --- |
| Spot art | Look at it at the card's real size. If the subject turns into an anonymous knot of strokes, simplify it. |
| Hero art | Look at it beside the real h1 and introduction. It should support their reading order, not pull attention away. |
| Explainer | Look at desktop and mobile layouts. Labels must stay readable without zooming or horizontal scrolling. |
| Doodle | Look at the whole viewport. Remove it if it makes the page busier or creates a false focal point. |

Check hierarchy and semantic tones in both dark and light themes, not just basic contrast.

Do a thumbnail check as well as a close look. The takeaway should survive when the details aren't visible.

## Accessibility and SEO

- Every SVG has `role="img"` and a `<title>` with the takeaway.
- The `MarkerArt` component renders through `MediaFigure` and wraps figures in `<figure>` with a `<figcaption>`.
- Colors meet contrast in both themes because they come from the theme token sets, not from choices made per figure.

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

For live examples, see `app/(site)/(courses)/self-hosting-for-beginners/basic-setup/art/five-pieces.spec.json` (a flow figure) and `app/ui/art/` (tool spots).

To build a browsable showcase of a draft folder, run `node scripts/stack127/marker-art/generate.mjs --index <dir>`.

## Workflow

1. Suggest. The `marker-art-suggest` skill reads the page and proposes placements: where, what claim, which figure type, and the data and source. It builds showcase HTML only when asked.
2. Approve. The user picks what to build.
3. Draw. The `marker-art-draw` skill writes specs, runs the generator, embeds figures with `MarkerArt`, and reviews a real render in both themes.
4. Maintain. When data changes, update the spec and regenerate. When the style changes, update the config and regenerate everything.

---

_Internal doc. Created 2026-07-07, last updated 2026-09-04._
