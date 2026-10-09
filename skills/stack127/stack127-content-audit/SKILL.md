---
name: stack127-content-audit
description: Deeply audit written Stack127 content pages or a list of pages for content depth, competitor coverage, reader/user flow, clarity, trust, sequencing, factual precision, and launch readiness. Use when the user asks to review, check, compare, critique, quality-check, or "deeply evaluate" article pages, course pages, guides, explainers, reference pages, legal pages, or the written content inside a page. This skill is for written/page content quality, not for optimizing tools, data directories, calculators, or application functionality except where the surrounding copy affects comprehension.
---

# Stack127 Content Audit

Use this skill in `/Users/ravitejaknts/projects/Stack127` for strict, evidence-backed audits of written Stack127 pages. The goal is to answer whether the page truly helps the intended reader, whether it is deep enough compared with competing pages, and whether a reader can move through the page or page sequence without getting confused.

## First Checks

- Read `AGENTS.md`.
- Read `stack127_docs/writing-style.md` for all writing guidance.
- Read `stack127_docs/page-content.md`. Page content lives in the route's `content/*.mdx` files. A page that hasn't moved to MDX still renders its content from the database, so read the rendered page for it.
- Read `stack127_docs/shared-ui.md` when assessing tables, charts, callouts, formulas, or other content blocks. A chart should show accurate data, read in both themes with no clipped labels, and be static unless the reader needs hover, toggles, or ranges.
- If the target belongs to a page family with docs, read `content_docs/<page-slug>/` before judging the page.
- Inspect the route/source under `app/`, the shared shell/components it uses, and any page-specific docs or manifest files that define scope.
- If the user says "check", "evaluate", "audit", or "tell me", stay read-only unless they explicitly ask for edits.
- Treat competitor pages, official docs, current screenshots, rendered output, and live URLs as time-sensitive. Verify live when available.

## Scope

Focus on written content and the page as a reading/learning experience:

- depth and completeness
- factual precision and trust
- reader sequence and concept order
- clarity for a new user
- usefulness for a technical reader
- search intent and competitor comparison
- internal links, external source quality, and next-step handoff
- visuals only insofar as they explain the written idea
- UI/layout only insofar as it affects reading, scanning, or comprehension

Do not drift into a full product, directory, database, performance, SEO, or design-system audit unless the written page depends on it.

## Audit Workflow

1. Define the target and reader.
   - List every URL, route, or page in scope.
   - Identify the likely reader: beginner, evaluator, buyer, technical operator, returning user, or search visitor.
   - State the page promise: what the reader should understand or be able to do after reading.

2. Inspect the local page.
   - Read the route's page file, its `content/*.mdx` files, and the shared page shell/components.
   - Read rendered output if a local or live URL exists. Check status, visible headings, article text, links, code blocks, visuals, sidebar/nav, and prev/next flow.
   - For page lists or courses, map the full order and check whether any term, command, tool, or assumption appears before it is taught.
   - Check links and source attribution where claims, tools, or install steps depend on external sources.

3. Research competitors deeply.
   - Find competitors for each page or page cluster, not just the top-level topic.
   - Prefer official docs, primary project docs, respected community docs, high-quality independent guides, and current ecosystem references.
   - Compare what competitors cover better, where they are shallow or too advanced, and what Stack127 can uniquely win on.
   - Do not claim "no competitor covers this" unless narrowly proven. Use "fragmented", "too advanced", "too shallow", or "covered better by X" when that is the honest result.

4. Judge depth.
   - Ask whether the page gives enough concrete detail for the reader to act, decide, verify, avoid mistakes, or know what to read next.
   - Flag vague advice, missing commands, missing screenshots, missing caveats, fake precision, unsupported recommendations, weak examples, and hand-waved "later" steps.
   - For guides and courses, separate concept depth from operational depth. A clear explanation can still fail if the reader cannot perform the step.

5. Judge flow.
   - For a single page, check the sequence from lede to close: does each paragraph earn the next one?
   - For a list of pages or a course, check the learner path from first page to last: setup assumptions, introduced concepts, repeated claims, skipped prerequisites, and handoffs.
   - Identify exact places where a new reader will likely pause, branch out, or get lost.

6. Review the writing against `stack127_docs/writing-style.md` and verify that claims match the sources and implemented behavior. Check the content rules in `stack127_docs/page-content.md`: no h1 in content, headings that step down one level at a time, no eyebrows or bold lines standing in for headings, the family's section order, and only the listed blocks.

7. Produce a strict verdict.
   - Lead with the actual answer: launch-ready, needs minor fixes, needs major revision, or do not launch.
   - Separate high, medium, and low severity findings.
   - For each finding, include the exact page/section or file/line reference when available, why it matters, and what better content would do.
   - Include a competitor benchmark summary and a page-by-page scorecard when auditing multiple pages.
   - End with the smallest practical fix plan, ordered by reader impact.

## Quality Bar

The page must give its intended reader enough verified information to complete the task. Use the shared writing guide to judge how clearly it communicates, and the coverage and competitor checks above to identify missing substance.

A course or page sequence must also:

- never require a concept before it is introduced
- avoid sending readers into open-ended work before they have the safety net for it
- include recovery or verification steps where failure is common
- make each handoff explicit: what was just learned, what is safe now, and what comes next

## Output Shape

Use a concise but strict report:

- **Verdict**: the direct answer.
- **Can A Reader Follow It?**: yes/no/mostly, with the first likely failure point.
- **Competition**: strongest competitors, what they do better, where Stack127 can win.
- **Highest Priority Findings**: severity-ordered issues with evidence.
- **Page-Level Notes**: for page lists, one short verdict per page.
- **Fix Order**: the smallest ordered set of content improvements.

When the user asks for a deep audit, do not soften the result. If the content is good, say so. If it is thin, unsafe, confusing, or behind competitors, say exactly where and why.
