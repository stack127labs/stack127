---
name: marker-art-suggest
description: Review one or more stack127 pages and propose where marker art (hand drawn charts, diagrams, icons) would help, what each figure should show, and which figure type fits best. Use when the user asks for art suggestions, visual ideas, "where can we add marker art", or a visual review of a page. Produces proposals, not final art; build a showcase HTML only when the user explicitly asks for one.
---

# Marker Art Suggest

Use this skill in `/Users/ravitejaknts/projects/Stack127` to propose marker art placements for site pages. The output is a set of concrete, data backed proposals the user can approve. Drawing happens later, in the `marker-art-draw` skill.

## First Checks

- Read `stack127_docs/marker-art.md`. It is the law for style, semantic color, data accuracy, and figure choice.
- Read the target page(s) under `app/` in full, including any existing `art/*.spec.json` next to them, so you never propose a duplicate of an existing figure.
- Check `dev-space/marker-art-samples/` if you need to see what each figure type looks like.
- Check `stack127_docs/writing-style.md`; figure labels and captions are site copy.

## What a Good Proposal Is

A proposal is one paragraph plus a small block, per placement:

- **Where**: the exact section or paragraph the figure sits after, quoted or referenced by heading.
- **The takeaway**: the one sentence the figure exists to make instant. If the paragraph makes three claims, pick the one that benefits most from being visual.
- **Figure type and why**: pick whatever shows the idea fastest. Do not force content into the existing types; if a better form would land quicker, say so and note that the generator needs a new figure type for it.
- **The data**: the actual numbers or structure, with a source. Research real values when the claim is factual (RAM use, power draw, prices). Conceptual figures say "conceptual, no external data".
- **Tones**: which semantic colors carry the meaning (per the doc: primary is the subject, good is recommended or light, warn is heavy or risky, note is neutral highlight).

## Judgment Rules

- Propose art where a visual genuinely beats prose: comparisons, compositions, flows, sequences, decisions, and anything a reader would otherwise have to hold in their head.
- Do not propose art for content that is already instant as text, and do not decorate. A figure that adds no speed is clutter.
- Density is a judgment call. Show what the point needs; if it will not pass a two second squint, split it into two proposals.
- Respect what exists: if a page already has a figure making the same point, propose replacing or improving it rather than adding a sibling.
- The one takeaway rule is absolute: one figure, one claim.

## Output

- Present proposals in the conversation, ordered by impact, and say which you would build first and why.
- Only when the user explicitly asks for a showcase: write draft specs into `dev-space/marker-art-drafts/<page-slug>/`, run `node scripts/stack127/marker-art/generate.mjs --index dev-space/marker-art-drafts/<page-slug>`, and tell the user to open the generated `index.html`. Never write showcase files into `app/`.
- Do not touch live pages in this skill. Building happens in `marker-art-draw` after approval.
