---
name: marker-art-draw
description: Produce approved marker art figures for stack127 pages, end to end. Writes the *.spec.json files, runs the generator, embeds figures with the MarkerArt component, and verifies the rendered result in both themes. Use when the user approves art proposals or asks to draw, build, add, or update marker art on a page.
---

# Marker Art Draw

Use this skill in the current stack127 workspace to turn approved marker art proposals into live figures. The pipeline is spec first: author the meaning and composition in a spec file, let the generator draw it, and never hand-tune a generated SVG.

## First Checks

- Read `stack127_docs/marker-art.md` in full. Semantic color, data accuracy, the one takeaway rule, and the no overlap rule all bind here.
- Identify the role first: spot, hero, explainer, or doodle. Each role has a different composition and rendered-size test in `stack127_docs/marker-art.md`.
- Look at an existing spec that matches the role. Use `app/(site)/(courses)/self-hosting-for-beginners/basic-setup/art/five-pieces.spec.json` for a flow and `app/(site)/(catalogs)/_components/art/` for tool spots. Use `dev-space/marker-art-samples/` only to understand generator syntax, not as the visual quality bar.
- Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for figure labels, captions, and alt text. Keep labels brief and meaningful within the approved composition. House punctuation rules also apply inside SVG text.

## Workflow

1. Write the spec at `app/<page-path>/art/<figure-slug>.spec.json` with id `<page-slug>--<figure-slug>`. Required fields: id, type, takeaway, source, dataAsOf, seed, data.
2. Establish the silhouette, focal object, reading direction, and empty space before adding internal marks or labels. One subject or group must dominate.
3. Keep marker art conceptual. Real claims need an honest source, but exact comparisons and quotable values use the clean-chart pipeline. Never fake or eyeball a value.
4. Remove detail that does not help recognition or the takeaway. Spot art has no visible words and at most one supporting object. Avoid repeated tiny symbols, filler marks, crossing connectors, and color used for variety.
5. Run `npm run stack127:marker-art` (or pass the specific folder to `node scripts/stack127/marker-art/generate.mjs`). Fix every lint error; treat warnings as things to check visually.
6. Embed in the page: import the generated `.ts` export and render `<MarkerArt svg={...} caption="..." />` (component at `app/marker-art.tsx`). The caption usually restates the takeaway. Doodles use the documented `Doodle` path instead.
7. Verify for real: `npx tsc --noEmit`, then load the page in the browser preview. Check the figure at its actual rendered size and as a thumbnail, in dark and light themes, beside its real surrounding content. Also check desktop and mobile when the art remains visible on both.
8. Reject a figure when the subject becomes an anonymous knot of strokes, the art competes with the h1 or tool, the reading direction is unclear, or understanding depends on a caption explaining the drawing. Simplify or split it and regenerate. Never edit a generated `.svg` or `.ts` by hand.

## When the Generator Falls Short

- Need an icon that does not exist: add it to `scripts/stack127/marker-art/icons.mjs` as a parametric function, keep it in the same visual family, and use it from the spec.
- Need a figure type that does not exist: add a builder to `scripts/stack127/marker-art/figures.mjs` once, driven entirely by spec data, then use it. Update the figure choice table in `stack127_docs/marker-art.md`.
- Before extending the generator, try a stronger composition with fewer objects. A new primitive is justified only when it expresses a recurring stack127 concept.
- Never bypass the system with a hand written SVG in a page.

## Maintenance Jobs

- Data changed: edit the spec's numbers and `dataAsOf`, regenerate, re-verify.
- Style changed: edit `scripts/stack127/marker-art/config.mjs`, regenerate everything, spot check a few pages in both themes.

## Homepage card artwork

Every homepage card must have a spec-backed marker drawing in the homepage art registry. Never substitute an enlarged Lucide icon, another interface icon, a traced icon, or an ad hoc SVG for marker art. Small identity icons beside titles are separate and may remain. Add missing hardware subjects to the shared marker icon library, generate the spec artifacts, and inspect them at card size in both themes. The homepage art coverage test must pass before handoff.
