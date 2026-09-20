---
name: stack127-visual-first-content
description: Plan the explanation and visual format mix for any stack127 page, tool, directory, guide, or reference. Use during content planning and rewrites to maintain page briefs and choose media that clarify the subject. Load the shared writing-voice skill for public wording.
---

# stack127 visual-first content

Use this skill whenever the task involves page content: new copy, rewrites, side content for tools, directory descriptions, guides, anything a visitor reads.

## Pipeline use

For current tool work, record format decisions in `content_docs/<slug>/tool-spec.md`. Use a separate brief for non-tool content pages or preserve an existing historical brief. This skill does not require a particular model, worker, or session record.

## The one behavior that matters most

Before drafting, propose the format mix: what the working tool already answers, which comparisons need tables or charts, which concepts benefit from art, and which ideas need connected explanation. Challenge a format when it makes the subject harder to understand, including a request to replace useful prose with fragments. If the user has already approved the mix or asked to apply an approved direction, record it in the brief and proceed without asking again.

Visual-first is a choice of medium, not a quota. A tool stays first and primary even when the guide below it needs several substantial sections. Do not force drawings, tables, or components into a page to make writing a minority. Use the shared voice skill for connected explanations and the owning content skill for coverage.

## Workflow

1. Read `stack127_docs/visual-first.md` and read and apply `skills/stack127/stack127-writing-voice/SKILL.md`. This skill owns the format mix; the shared voice skill owns how the wording reads.
2. For tool-page copy, also read `stack127_docs/tool-pages.md`. Prepare reviewed Markdown, then use the content-only command; do not put live prose back into TSX or bump the tool version.
3. Read or write the page's planning artifact. Tool pages use `tool-spec.md`; other content pages use `brief.md`. Record who is here, the job, and what the page should show versus explain.
4. Identify the reader's questions, preserve useful existing coverage, and choose the clearest medium for each. Plan how the explanation connects, not only which facts appear.
5. Produce visuals through the pipelines:
   - concepts: marker art specs (`stack127_docs/marker-art.md`, `npm run stack127:marker-art`)
   - exact data: clean chart specs (`scripts/stack127/clean-charts/`, `npm run stack127:clean-charts`, rendered with `Chart` from `app/chart.tsx`)
   - repeated facts: tables
   - real interfaces: screenshots through `MediaFigure`, dark theme, cropped to the subject
6. Write the explanation around the chosen visuals using the shared voice skill. Do not reduce useful explanation to captions.
7. Run the shared voice skill's review pass and the owning content skill's coverage checks before calling it done.

Every proposal must include a feasibility verdict. Record enough detail to implement each required medium. For marker art, name the registered `MarkerArt` spec and component use. Do not promise a visual that the page cannot render and verify.

## Hard rules

- The brand is `stack127`, lowercase v, always.
- No em or en dashes anywhere.
- No eyebrows, decorative labels, or explanatory chrome; the visual design carries hierarchy.
- Headings are never category stickers; titles always carry the name plus the point.
- Never restate in a paragraph what a visual or table on the same page already shows.
- If a figure or chart cannot state its takeaway in one caption sentence, split it.
