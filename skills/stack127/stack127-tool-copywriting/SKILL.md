---
name: stack127-tool-copywriting
description: Write or rewrite the words for a stack127 tool page or tool catalog: title, SEO title, meta description, card, intro, usage, content, and methodology. Lean and direct.
---

# stack127 tool copywriting

Someone came to use the tool. Every line should help them use it or trust its answer. More words make the useful line harder to find, so write as little as you can.

Read `stack127_docs/writing-style.md` first. Use the finished tool with a real example before you write.

## What you write

| Part | Goes in | Length | Its job |
| --- | --- | --- | --- |
| Title (H1) | Database | Short | The question the tool answers, in the searcher's words. |
| SEO title | Database | Under 60 characters | The tool word people search, "free", and the answer. |
| Meta description | Database | 140 to 160 characters | What they get, and one detail that sets it apart. |
| Card name and description | Database | A few words, then one short sentence | Name the task. |
| Intro | `content/intro.mdx` | 2 to 3 sentences | Their situation, what they get, and how to start. |
| Usage | `content/usage.mdx` | Under 150 words | Only the inputs that need explaining, and how to read the result. |
| Content | `content/article.mdx` | As short as it can be | What users need next: a reference table, terms they meet, doubts the result raises. |
| Methodology | Last section of `content/article.mdx` | 2 to 4 sentences | How the answer is worked out, and its limits. |

## Cut these

- Headings about one brand or one case on a general page. "Can I join Mediavine at 40,000 pageviews?" doesn't belong on a page about every network.
- Worked examples that repeat what the tool already shows when it opens.
- Explanations of controls that explain themselves, such as Reset, Copy link, or a disclosure.
- Usage lines that repeat a label or hint.
- Text that repeats a table.
- Setup lines before the point, such as "A few reasons:" or "Here's what you need to know."
- Long table cells and long bullets. One short idea each.
- Any section a user wouldn't miss if it were gone.

## Check

Read every sentence and ask: does this help the person use the tool or trust its answer? If not, cut it. Then read it again and cut once more.

- Every fact matches the tool and a primary source. Link the source.
- Headings are questions people search, answered in the first sentence.
- Run `node scripts/stack127/content/check-mdx.mjs`.

The ad network requirements checker went from 1,500 words to 550 this way. Its `content/` folder is the model to follow.

## Hand off

Give the owner every part in chat, in the order of the table, with word counts. Put it on the page only after they approve. Content goes in MDX, as `stack127_docs/page-content.md` describes. Titles, SEO text, and cards go through the publish manifest, as `stack127_docs/page-publishing.md` describes. Copy edits leave `tool_version` alone.

Catalog pages such as `/publisher-tools` follow the same rules. Their content lives in `app/(site)/(catalogs)/[slug]/content/<slug>/`.
