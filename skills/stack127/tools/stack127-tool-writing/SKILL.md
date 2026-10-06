---
name: stack127-tool-writing
description: Plan and write, or rewrite, the content, title, page copy, interface words, and SEO text for a stack127 tool page so anyone can follow it. Use for new tools and for simplifying or rewriting live tool pages.
---

# stack127 tool writing

Read `stack127_docs/writing-style.md` for how to write and search wording, and `stack127_docs/shared-ui.md` for components and their syntax. Read `content_docs/<slug>/research.md` and `tool-spec.md` when they exist. Check every claim against the tool and its sources.

## When to use it

In the tool pipeline, Opus runs this skill in its own Claude Code writing session after the tool is built. Plan the Content section first, then write in the same session.

It also handles rewrites of live tool pages. Read the current title, intro, usage, and content from `public.stack127_tool_pages`. Use the tool once and read its code for the exact rules and messages. Keep the facts, limits, and sources a reader needs, and cut what goes beyond the core of the tool. Write drafts to `tmp/page-publishing/<slug>/` unless the user asks to apply them. Git ignores `tmp/`, and the files stay there through release. Skip the spec step for a rewrite.

## Win the search

The page should be the best answer for the searcher. Before planning, answer three questions from the research or, for a rewrite, from a quick look at the top results:

1. What is the searcher really trying to decide or produce?
2. Where do the top results fail them?
3. What will this page do better?

Then:

- Put the tool and its answer before explanations.
- Answer the questions people really ask that the top results answer badly.
- Show a worked example with real numbers.
- Be honest about limits. Say what the tool can't tell you and when a result is an estimate.
- Use primary sources and say when the data was checked.
- Add at least one useful thing the top results don't have.

## Stay on the core

A tool page has two jobs: help the reader understand the idea behind the tool, and help them use it and trust the result. Write only what serves those jobs. Typical topics:

- what the thing is and why it matters;
- what to enter and where to find each number;
- how to read the result, with one worked example;
- the formula or rule;
- the few questions people search and ask about it.

There is no fixed list of sections. Judge each one by asking whether a typical reader of this tool would want it. If not, cut it.

Leave out:

- How the tool handles rare inputs, such as calculation limits, very small amounts, rounding, or extreme values. The result messages and the spec cover these. Explain an unusual result only when ordinary readers often see it.
- Input format rules. These belong in field hints and error messages.
- Tables or walkthroughs of special cases that exist to show the tool is correct.
- Second sections that repeat a rule already given.
- Background that doesn't help the reader use the tool or understand the result.

Longer is not better. A focused page that answers the searcher quickly beats a long page that covers everything.

## Plan first

In the pipeline, write the plan in the Content section of `content_docs/<slug>/tool-spec.md`.

1. Use the finished tool once with a real example. Note what the result shows and what a reader might misread.
2. List the questions searchers ask, from research. Keep only the ones a typical reader of this tool would ask. Drop rare cases and questions that only matter for testing the tool.
3. Map each question to where it is answered: the tool result, intro, usage, or content.
4. Outline the page with the structure below. Name each content heading as the question it answers, and pick a format for each from `writing-style.md`.
5. List what you left out on purpose, and say where it is handled instead, such as a result message, a field hint, or the spec.
6. Note the facts the page states, their sources, claims to avoid, and the next stack127 pages to link.

Refer to facts in the research instead of copying them.

## Page structure

| Part | Where it shows | What to write |
| --- | --- | --- |
| Title | Page heading | "Tool name: the question it answers", in words people search for. Example: "KDP payment date calculator: when will KDP pay you?" |
| Intro | Above the tool | 2 to 3 sentences. What you get, and what to have ready. No history or filler. |
| Usage | After the tool | Steps that need explaining, how to read the result, and one worked example. |
| Content | After usage | Short sections with question headings, each answered in its first sentence. |

### Usage steps

Every step must tell the reader something the form doesn't.

- Cut: "Pick the format." "Select Calculate."
- Keep: where to find a number, what a term means, which choice to pick when unsure.

Beginners should be able to follow along without reading steps that only name buttons.

### Content sections

Pick only what this tool's readers need. This order is a guide, not a checklist:

1. How it works: the rule or formula, with an example. For lookups and checks, what is checked and where the data comes from.
2. What the result means, including good and bad results. Use benchmarks only with a source.
3. Common mistakes people actually make.
4. Related questions people search, from research.
5. What the tool doesn't cover, in a line or two, and next stack127 tools.

Keep each section to 1 to 3 short paragraphs, or one table, list, or visual with a line or two around it.

## Keep it short and visual

- Show first. Use a table, list, chart, example, formula, note, or warning when it shows the idea better than a paragraph. See the format table in `writing-style.md`.
- Use marker art only for a concept that needs a picture, such as a flow or a rough relationship. Use at most one or two per page. Request it through the marker art skills; don't invent figure references.
- Use only existing components. Page copy never needs a new one.
- Say each idea once. The intro, usage, and content must not repeat each other.
- Say whether a number is exact, an estimate, or a rule of thumb.
- For lookups and checks, say what the result can and cannot tell the reader.
- A rewrite should not be longer than the current page unless it adds something the reader was missing. Say what you added in the handoff.

## Final pass

After corrections, reread everything as a first-time visitor. Cut repetition, padding, steps that only name buttons, and any section that goes beyond the core of the tool. Keep the details and limits a typical reader needs. Remove research notes, source labels, citation markers, and insider wording. Keep source links that help the reader.

If the main agent finds a problem on the rendered page, fix it in the same session and return the corrected words.

## Hand off the copy

Put the intro, usage, and content in separate Markdown files in `tmp/page-publishing/<slug>/`. Integration builds the publish manifest beside them. In the pipeline, apply interface-word changes in the frontend code yourself, since Opus owns the frontend. For a standalone rewrite, list suggested interface words instead.

Return:

- the file paths and word counts before and after;
- the visible title, SEO title, and SEO description;
- a short card name and task-focused card description, which appear in every assigned catalog;
- interface words changed or suggested;
- any marker art you suggest;
- sources for factual claims.

Keep the spec as planning, not a second live copy.

Copy edits move a published tool's public date without changing `tool_version`. Card-only edits refresh catalogs and keep the tool date unchanged. Functional tool changes use the version workflow in `stack127_docs/tool-pages.md`.
