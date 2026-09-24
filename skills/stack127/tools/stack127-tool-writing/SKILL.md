---
name: stack127-tool-writing
description: Write the title, page copy, interface words, and SEO text for a finished stack127 tool using the shared writing guide.
---

# stack127 tool writing

Read `stack127_docs/writing-style.md`, `stack127_docs/shared-ui.md`, and the tool's ready `tool-spec.md`. Verify claims against the implemented tool and its sources.

## When to use it

Run after `$stack127-tool-content-seo` has completed the spec, as the normal writing stage in the tool pipeline. It also handles standalone tool-copy requests. Check that the planned claims match the finished tool before drafting.

## Page structure

| Part | What it should do |
| --- | --- |
| Title | Use "Tool name: the question it answers or the outcome it helps with." Choose words people naturally search for. |
| Introduction | Establish the reader's situation and explain the basic solution. Include a simple formula with enough context to calculate the answer, then explain how the tool helps apply it. Make the introduction useful on its own. |
| Usage | Help readers choose inputs and understand the result. |
| Supporting content | Follow usage with the explanation the reader still needs. If a formula requires several steps or assumptions, introduce its principle briefly above the tool and explain the calculation here with a worked example. |

For example:

- Domain age checker: how old is a domain?
- KDP payment date calculator: when will KDP pay you?

Distinguish exact answers, estimates, and rules of thumb. For lookups and checks, explain what is checked and what the result can tell the reader. Give each explanation one clear home so later sections build on it instead of repeating it.

When a note, warning, formula, example, table, or chart helps, use the supported Markdown syntax in `stack127_docs/shared-ui.md`. Keep ordinary steps and links in normal Markdown.

## Final readability pass

After factual and missing-copy corrections, stay in the same writing session for a separate final pass over the title, introduction, usage, supporting content, interface words, and SEO text. Make the page simple for a general reader to follow. Keep every useful detail, limitation, and distinction. Explain difficult ideas in plain words and add a short example where it makes the idea easier to grasp. Cut repetition and avoid stretching a simple point.

Read the result as public-facing copy. Remove research notes, source labels, citation markers, and insider wording from the page text. Keep useful links to sources where they help the reader. If the main agent finds a copy problem on the rendered page, revise it in this same session and return the corrected words for integration.

## Hand off the copy

Put the introduction, usage, and supporting content in separate temporary Markdown files outside the repo. Return their absolute paths with the visible title, any interface-word changes, SEO title and description, a short tool card name and task-focused card description, and sources for factual claims. The card words belong to the tool row and appear in every assigned catalog. The integration worker uses this draft; it does not wait for a manual rewrite. Keep the spec as planning, not a second live copy. Content integration and publication use their own workflows.
