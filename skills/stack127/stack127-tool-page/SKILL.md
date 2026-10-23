---
name: stack127-tool-page
description: Build or rework one stack127 tool page with the owner, from their idea to a published page. The plan and the copy each wait for the owner's yes. Use for every tool page.
---

# stack127 tool page

One tool at a time. The owner brings a tool name and a rough idea. You plan it with them, build it, write it, and publish it. Quality over speed.

You run this yourself. Use helpers where they do a part better, as "Agent roles" in `AGENTS.md` describes: Luna or Haiku for research, Sol for hard backend logic. Read what comes back before you use it.

## Steps

1. **Research.** Find who searches for this, what they already know, and what they want answered. Use real searches, "People also ask", forums, and 3 to 5 competitors you actually try. Check every fact that drives an answer against a primary source. Write `content_docs/<slug>/research.md` with only what changes the tool.
2. **Plan.** Write a short `content_docs/<slug>/tool-spec.md`. See "The spec" below. Then show the owner, in the T3 chat:
   - **A mockup** of the inputs, the Advanced section, and the result, as one HTML page with `html_render`. Make it look like the site: dark theme, colors and fonts from `app/globals.css`, and the shapes of our shared components. Fill it with realistic example values and the result they'd really give.
   - **How it works**, in plain English: what goes in, how the answer is worked out, and what comes out. Write it for someone new to coding.
3. **Refine.** Change the plan and mockup until the owner says yes, and show each version in chat. Then update `tool-spec.md` to match.
4. **Build.** The logic first, then the interface, matching the agreed mockup. Follow `stack127_docs/tool-interface.md` and `stack127_docs/shared-ui.md`, and wire the route like `/cac-payback-calculator`. Add one focused test for the logic. Run `npm run quality`. Check the real page at desktop and mobile width in both themes, with one correct and one invalid example. Give the owner the Tailscale preview URL.
5. **Copy.** Follow `$stack127-tool-copywriting`. Give the owner the copy in chat. Don't put it on the page yet.
6. **Finish.** When the owner approves the copy, add it to the route's `content/*.mdx`. Make the card art with `$marker-art-draw`. Publish to development with the tools publisher, as `stack127_docs/page-publishing.md` describes, and check the real page and its catalog card.
7. **Release.** Get a Sol review of the diff and fix what it finds. Then ask the owner once before running `$stack127-release-e2e`.

Preview with `npm run dev`, which refreshes the page list first. Draft titles in development are fine before the copy is approved, and you should stop any server you started once you're done.

## Judgement

The plan is where a tool goes right or wrong. Check each point before you show it:

- **Ask only what people know offhand.** If a number can be worked out from another input, work it out. Never ask for the same thing twice in different words.
- **Require the least that gives a real answer.** Usually one or two inputs. Everything else is optional, and blank means unknown.
- **Estimate instead of "can't tell".** People come for an answer. Give a best estimate, mark it as one, and say what would sharpen it. A result full of unknowns has failed.
- **Every input changes the result.** If it doesn't, cut it.
- **Most important inputs first.** Put related inputs side by side.
- **Advanced is for few people.** Each field there is optional and has a reason to exist.
- **The answer comes first.** One line that answers the question, then the detail.
- **Look like the site.** Reuse shared components and the patterns sibling tools use. Don't invent a new style.

Example: the first ad network requirements checker asked for domain age and registration date, asked for traffic twice, and filled the result with "can't tell". The version that shipped asks seven things people know, requires two, and returns a ranked shortlist of estimates.

## The spec

Keep `tool-spec.md` short. It holds what a builder needs to build without guessing, and nothing else:

- **Who and why.** Who uses it, the question they bring, and what they get.
- **Inputs.** A table: label, Basic or Advanced, required or optional, hint, and what it changes.
- **Result.** What shows first, then the rest. The example values the tool opens with, and their result.
- **How it works.** The rules or formula, with sources. Invalid input, limits, and unknowns.
- **Build.** The files, the main functions, and the shared components used.
- **Page.** Route, catalog, and the card art idea.

## Reworking a live tool

Use the same steps, starting from the live page and its spec. A change to inputs or results needs a `tool_version` bump. See `stack127_docs/tool-pages.md`.
