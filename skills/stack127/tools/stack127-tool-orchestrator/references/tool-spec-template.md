# <Tool name>

Route: `/<slug>`

Research: [research.md](research.md)

Opus starts this file from the research. Link to research instead of copying it.

## People and questions

Take a position from the research's "Who uses it" section. Write it as decisions, not a survey:

- Most users are: <who>. They come with: <what they know>.
- Their top questions: <2 or 3, in their words>.
- Basic answers them with: <the fewest inputs most people know offhand>.
- Advanced holds: <each option pros need>, for <who>, because <reason>. Cover what serious competitors offer and what the old tool did, if there was one.
- Left out: <what>, because <reason a user would agree with>.

## Why people will choose this tool

What the searcher is really trying to decide. Where the top results fail them. The specific things this tool does better, such as a clearer answer, honest unknowns, edge cases handled, worked examples, or dated sources. Keep it to a short list the builders and writer can check against.

## Product

### Promise and scope

Define the primary user, main job, delivered answer, launch scope, and exclusions.

### Technical contract

Define inputs, parsing, units, bounds, formulas or source precedence, rounding, output, invalid states, unknowns, partial results, privacy, and security.

### Backend contract

The exact handoff between Sol's backend and Opus's frontend. List each exported function or API route with its file path, inputs and types, output shape, errors and unknown values, and timeouts or caching. Name any data script, migration, or dataset. The frontend calls the backend only through this contract.

### Known examples

Add a small set of independently calculated normal, boundary, and invalid examples.

### Ownership

List the backend files Sol builds (engine, API routes, scripts, focused test, preview row) the interface files Opus builds (components and styles), and what integration adds (route page, content wiring, card art).

### Catalog placement

Name the primary tool catalog and any secondary catalogs in rank order. Explain the reader task that makes each placement useful. If no suitable catalog exists, flag the new catalog for the main agent to plan before integration. Do not substitute a loosely related catalog just to fill this field.

For a new tool, brief its catalog `toolSpot` marker art: one visual takeaway, a recognizable focal subject, at most one supporting object or relationship, and the intended semantic tone. Give it a tool-specific art key. The drawing has no visible words and must read at card size in both themes. This is card art, separate from optional figures in the tool article.

## Interface

### Flow

State the user question, the lead answer, the example values the tool opens with, and the button's name.

### Inputs

| Input | Basic or Advanced | Required or optional | Hint, one sentence or none | What it changes in the result |
| --- | --- | --- | --- | --- |
| | | | | |

Every Advanced input is optional. Name the Advanced disclosure for what's inside. If an input changes nothing in the result, cut it.

### Result

The answer, the visual that shows it, the few supporting numbers, and share or copy actions. Everything in the result comes from the person's inputs. Say what comparison shows, if any, and which published range it uses. No grade words.

### Components

List every existing shared component the frontend uses, with its import path. List any new or improved shared components built during planning, with what each one is for. List the tool-specific components the frontend will build, with a short description.

### Layout

How the inputs group into rows, where Advanced sits, and how the result reads at desktop and on phones: what the eye lands on first, and where the smaller numbers and detail sit.

### States

The example it opens with, stale results after an edit, invalid input, and how each domain limit answers instead of blanking. Add any other state this tool can really hit.

## Content

The planning session fills this section, after the frontend, with `skills/stack127/tools/stack127-tool-writing/SKILL.md`. Page copy uses existing components only.

### Search intent and title

The main query, what the searcher wants, the visible title, and the SEO title and description direction.

### Reader questions

The questions the page must answer, from research. For each, say where it is answered: the tool result, intro, usage, or content.

### Outline

Plan each part from the Page structure section of `skills/stack127/tools/stack127-tool-writing/SKILL.md`. The intro, usage, and content become the route's `content/intro.mdx`, `content/usage.mdx`, and `content/article.mdx`:

- Intro: what the reader gets, who it is for, what they need ready.
- Usage: only the steps that need explaining, how to read the result, and one worked example.
- Content: question headings in order, what each answers, and the format for each (table, list, chart, example, formula, note, warning, or marker art) from `stack127_docs/writing-style.md`.

### Facts, limits, and sources

Which facts the page states, their sources, and any data date. Claims the writer must avoid because the tool does not support them.

### Next step

Related stack127 tools or pages to link, and why.
