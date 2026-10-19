---
name: stack127-tool-writing
description: Plan and write, or rewrite, the content, title, page copy, interface words, and SEO text for a stack127 tool page so anyone can follow it. Use for new tools and for simplifying or rewriting live tool pages.
---

# stack127 tool writing

You're writing for one person: someone who just searched for this tool because something is bugging them. Talk to them like a friend who knows the subject. Get what they're stuck on, explain it simply, and clear up every doubt they'd still have. Then stop.

Before you write, read the research and spec, and use the finished tool with a real example. Think about this person. What's going on for them? What are they trying to decide? What would they still wonder after seeing the answer? Read the intros of two or three other tools in the same catalog, so this page sounds like its own and not like theirs.

Read "Search words" in `research.md`. If it's missing or older than the live results, search the main phrase and add it, following "Find the words first" in `writing-style.md`. The title, H1, description, intro, and question headings use those words.

Read `stack127_docs/writing-style.md` for the voice and `stack127_docs/page-content.md` for the files and MDX blocks. Check every claim against the tool and its sources.

## The page

| Part | Lives in | Its job |
| --- | --- | --- |
| Intro | `content/intro.mdx` | Meet the reader where they are, hook them with their own problem, and point them to the tool. Follow "Intros" in `writing-style.md`. |
| Usage | `content/usage.mdx` | Walk a new user through the tool as if you're sitting beside them: what each input means, what to try, and how to read the result. A conversation, not a glossary. |
| Content | `content/article.mdx` | What helps them next. Mention related stack127 tools where they naturally come up, linked inside the sentence, never as a list. Leave out anything this reader doesn't need. Published figures and their sources go here, never in the result. Never call a number good or bad. |
| Interface words | Frontend code | Labels and one-sentence hints. See "Words inside a tool" in `writing-style.md`. |
| Title, SEO title, description, card copy | Database, through the publisher | The tool word people search, "free" when it is, and the answer it gives. Follow "Titles and search" in `writing-style.md`. |

In the pipeline, the Opus session that planned the tool writes its page, after planning the spec's Content section. Use this skill for rewrites of live tool pages too, editing the route's MDX directly, and for catalog pages such as `/dns-tools`, whose content lives in `app/(site)/(catalogs)/[slug]/content/`.

## Hand off

Run `node scripts/stack127/content/check-mdx.mjs`. In the pipeline, apply interface word changes in the frontend code yourself. For a standalone rewrite, list them instead.

Before handing off, read the title and intro out loud. If they sound like a label or a spec sheet, rewrite them.

Return the MDX paths with word counts, the search words you targeted, the title, SEO title and description, the card name and description, the interface words, and sources for factual claims.

Content edits leave `tool_version` and the public date alone. See `stack127_docs/tool-pages.md`.
