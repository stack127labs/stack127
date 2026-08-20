---
name: marker-art-draw
description: Produce approved marker art figures for stack127 pages, end to end. Writes the *.spec.json files, runs the generator, embeds figures with the MarkerArt component, and verifies the rendered result in both themes. Use when the user approves art proposals or asks to draw, build, add, or update marker art on a page.
---

# Marker Art Draw

Use this skill in `/Users/ravitejaknts/projects/Stack127` to turn approved marker art proposals into live figures. The pipeline is spec first: you author data and layout in a spec file, the generator draws it, and nothing is ever hand tuned inside a generated SVG.

## First Checks

- Read `stack127_docs/marker-art.md` in full. Semantic color, data accuracy, the one takeaway rule, and the no overlap rule all bind here.
- Look at an existing spec (for example `app/self-hosting/basic-setup/art/five-pieces.spec.json`) and the samples in `dev-space/marker-art-samples/` before writing your first spec.
- Figure labels and captions are site copy: check `stack127_docs/writing-style.md`. No em or en dashes anywhere, including inside SVG text.

## Workflow

1. Write the spec at `app/<page-path>/art/<figure-slug>.spec.json` with id `<page-slug>--<figure-slug>`. Required fields: id, type, takeaway, source, dataAsOf, seed, data.
2. Data is sacred: real claims get researched numbers and a source; the generator computes all geometry from them. Never fake or eyeball a value.
3. Run `npm run stack127:marker-art` (or pass the specific folder to `node scripts/stack127/marker-art/generate.mjs`). Fix every lint error; treat warnings as things to check visually.
4. Embed in the page: import the generated `.ts` export and render `<MarkerArt svg={...} caption="..." />` (component at `app/marker-art.tsx`). The caption usually restates the takeaway.
5. Verify for real: `npx tsc --noEmit`, then load the page in the browser preview. Check the figure in dark and light mode, confirm nothing overlaps or crowds, and confirm the figure reads in a two second squint. The lint is heuristic; your eyes are the final gate.
6. If anything collides or reads slowly, fix the spec (positions, fewer labels, a second figure) and regenerate. Never edit a generated `.svg` or `.ts` by hand.

## When the Generator Falls Short

- Need an icon that does not exist: add it to `scripts/stack127/marker-art/icons.mjs` as a parametric function, keep it in the same visual family, and use it from the spec.
- Need a figure type that does not exist: add a builder to `scripts/stack127/marker-art/figures.mjs` once, driven entirely by spec data, then use it. Update the figure choice table in `stack127_docs/marker-art.md`.
- Never bypass the system with a hand written SVG in a page.

## Maintenance Jobs

- Data changed: edit the spec's numbers and `dataAsOf`, regenerate, re-verify.
- Style changed: edit `scripts/stack127/marker-art/config.mjs`, regenerate everything, spot check a few pages in both themes.
