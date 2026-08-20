---
name: stack127-visual-first-content
description: Use when writing, planning, or rewriting content for any stack127 page, tool, directory, guide, or reference. Enforces the visual-first workflow, page briefs, the push-back protocol against text-heavy requests, and the writing voice.
---

# stack127 visual-first content

Use this skill whenever the task involves page content: new copy, rewrites, side content for tools, directory descriptions, guides, anything a visitor reads.

## The one behavior that matters most

When the request is "write a page about X", do not write. First answer with the format proposal: what should be a chart, a table, a marker drawing, a screenshot, and which few things genuinely need sentences. Challenge text-first requests, including Teja's, and suggest the format that lets a reader scan instead of read. Only after the mix is agreed do you produce anything.

## Workflow

1. Read `stack127_docs/visual-first.md` and `stack127_docs/writing-style.md`. They are short and they are the law.
2. Read or write `content_docs/<page-slug>/brief.md`: who is here, the job, show vs say. No brief, no content.
3. List the page's claims and assign each a medium. Default is not-prose.
4. Produce visuals through the pipelines:
   - concepts: marker art specs (`stack127_docs/marker-art.md`, `npm run stack127:marker-art`)
   - exact data: clean chart specs (`scripts/stack127/clean-charts/`, `npm run stack127:clean-charts`, rendered with `Chart` from `app/chart.tsx`)
   - repeated facts: tables
   - real interfaces: screenshots through `MediaFigure`, dark theme, cropped to the subject
5. Write the connecting sentences last: first person, casual, plain words, no repetition, headings that carry the gist or ask the reader's question.
6. Run the quick check at the end of `writing-style.md` before calling it done.

## Hard rules

- The brand is `stack127`, lowercase v, always.
- No em or en dashes anywhere.
- No eyebrows, decorative labels, or explanatory chrome; the visual design carries hierarchy.
- Headings are never category stickers; titles always carry the name plus the point.
- Never restate in a paragraph what a visual or table on the same page already shows.
- If a figure or chart cannot state its takeaway in one caption sentence, split it.
