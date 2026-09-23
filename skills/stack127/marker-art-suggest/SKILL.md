---
name: marker-art-suggest
description: Review one or more stack127 pages and propose where marker art (hand drawn charts, diagrams, icons) would help, what each figure should show, and which figure type fits best. Use when the user asks for art suggestions, visual ideas, "where can we add marker art", or a visual review of a page. Produces proposals, not final art; build a showcase HTML only when the user explicitly asks for one.
---

# Marker Art Suggest

Use this skill in the current stack127 workspace to propose marker art placements for site pages. The output is a small set of concrete proposals the user can approve. Drawing happens later, in the `marker-art-draw` skill.

## First Checks

- Read `stack127_docs/marker-art.md`. It is the law for style, semantic color, data accuracy, and figure choice.
- Read the target page(s) under `app/` in full, including any existing `art/*.spec.json` next to them, so you never propose a duplicate of an existing figure.
- Inspect the real rendered placement when possible. Use the local headless fallback in `skills/stack127/references/homelab-browser-and-search.md` if the in-app browser is unavailable. A catalog spot, hero, explainer, and doodle solve different problems and cannot share one composition by resizing it.
- Use live figures matching the intended role as the visual reference. Their `*.spec.json` files also show the generator syntax.
- Read `stack127_docs/writing-style.md` when proposing figure labels, captions, or alt text.

## Decide Whether Art Earns the Space

- Name the user question or page identity the art will clarify.
- Do not propose art for a region that only needs better spacing or hierarchy.
- Do not illustrate a sentence that is already easier to read than the drawing.
- Do not use marker art for exact values or comparisons. Propose a clean chart or table instead.
- Prefer one strong, page-specific object or relationship over a collage of related symbols.
- If the art needs a paragraph to explain it, propose a simpler figure or no figure.

## Compose Before Naming a Figure Type

For every proposal, define:

- role: spot, hero, explainer, or doodle;
- one takeaway;
- focal object or group;
- reading direction;
- necessary supporting objects;
- semantic use of color;
- final rendered placement and approximate size;
- what must be removed for the figure to remain clear at that size.

Only then choose an existing figure type or explain why a new recurring type is needed. Spot proposals use no visible text and at most one supporting object. Hero proposals preserve empty space and stay subordinate to the h1. Explainers show one relationship with the fewest necessary labels. Doodles never carry required meaning.

## What a Good Proposal Is

A proposal is one paragraph plus a small block, per placement:

- **Where**: the exact section or paragraph the figure sits after, quoted or referenced by heading.
- **The takeaway**: the one sentence the figure exists to make instant. If the paragraph makes three claims, pick the one that benefits most from being visual.
- **Figure type and why**: pick whatever shows the idea fastest. Do not force content into the existing types; if a better form would land quicker, say so and note that the generator needs a new figure type for it.
- **The structure**: the actual relationship, with a source when the claim is factual. Conceptual figures say "conceptual, no external data". Exact numbers, prices, and measurements belong in a clean chart or table.
- **Tones**: which semantic colors carry the meaning (per the doc: primary is the subject, good is recommended or light, warn is heavy or risky, note is neutral highlight).

## Judgment Rules

- Propose art where a visual genuinely beats prose: comparisons, compositions, flows, sequences, decisions, and anything a reader would otherwise have to hold in their head.
- Do not propose art for content that is already instant as text, and do not decorate. A figure that adds no speed is clutter.
- Density is a judgment call. Show what the point needs; if it will not pass a two second squint, split it into two proposals.
- Judge at the final rendered size. Detail that disappears in a card or beside a hero is clutter even when the source SVG looks clean.
- Respect what exists: if a page already has a figure making the same point, propose replacing or improving it rather than adding a sibling.
- The one takeaway rule is absolute: one figure, one claim.

## Output

- Present proposals in the conversation, ordered by impact, and say which you would build first and why.
- Only when the user explicitly asks for a showcase: write draft specs under `/tmp/stack127/marker-art-drafts/<page-slug>/`, run `node scripts/stack127/marker-art/generate.mjs --index /tmp/stack127/marker-art-drafts/<page-slug>`, and tell the user to open its `index.html`. Keep draft showcases outside `app/`.
- Do not touch live pages in this skill. Building happens in `marker-art-draw` after approval.
