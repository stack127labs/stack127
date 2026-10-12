# Writing on stack127

Talk like a friend explaining something to another friend, whatever the situation. Don't overcomplicate it. Keep it simple enough that your friend gets it on the first read. Let it move the way talking does, one thought leading to the next. A short line that just talks to the reader is fine now and then, but never fluff up the page. Stay on the topic, and keep the writing direct and short.

Conversational, but not chatty. Talk to the reader in full sentences, with accurate facts. No jokes, no hype, no filler. Engaging doesn't mean longer; most pages should get shorter.

This guide covers how to write, which format to use, and search wording, for every page, doc, and chat. Where page content lives, and how to write each block in MDX, is in [page-content.md](page-content.md). Components are in [shared-ui.md](shared-ui.md). What goes on a tool page lives in `skills/stack127/tools/stack127-tool-writing/SKILL.md`.

## Show first

stack127 shows more than it tells. Before writing a paragraph, ask if a format would show it better. Keep the words that connect, explain, and guide.

| Format | Use it when |
| --- | --- |
| Table | The information is naturally rows and columns: options, comparisons, values, record types. |
| Numbered list | Order matters, such as steps. |
| Bullets | Related points where order doesn't matter. |
| Chart | You have accurate data to show, such as a trend, a share, or a comparison. Make it interactive only when the reader needs to hover, hide lines, or change the range. |
| Example box | A worked example with real numbers. |
| Formula box | The rule or calculation itself. |
| Note | Useful context the reader should keep in mind. |
| Warning | Something that can cost money, data, or time if missed. |
| Marker art | A concept that is hard to grasp in words, or a rough relationship with no exact data. Skip it for anything simple or obvious. |
| Paragraph | Explaining why, connecting ideas, or guiding the reader to a choice. |

Use only existing components. The MDX for each block is in [page-content.md](page-content.md) under "Writing in MDX". Chart specs are under "Charts" in [shared-ui.md](shared-ui.md). Plan and draw marker art with the marker art skills. Page copy never needs a new component.

Don't repeat a visual's values in the text. A caption gives the takeaway. Alt text says what the image shows.

## The basics

- Lead with the answer. Then explain.
- One idea per paragraph, 1 to 3 sentences.
- Keep most sentences under 20 words.
- Use the words people use. Explain a technical term the first time.
- Talk to the reader as "you". Use contractions.
- "I" or "we" is fine when it sounds natural.
- Say each thing once.
- Cut anything the reader doesn't need.

## Before and after

| Instead of | Write |
| --- | --- |
| This calculator enables users to leverage accurate royalty estimations. | Amazon takes its cut and the printing cost before you see a cent. Put in your price and page count to see what's left for you. |
| **Trials started:** the number of users who began a free trial. | Start with how many people began a trial in the month you're checking. Then add how many of them paid. |
| It is important to note that results may vary. | Results are estimates. Amazon's printing cost can change. |
| Net revenue retention is a crucial metric in today's SaaS landscape. | Net revenue retention shows how much revenue you keep from existing customers. |
| Whether you're a beginner or an expert, this tool has you covered. | (Cut it.) |

## Avoid

- Hype: crucial, essential, powerful, seamless, robust, comprehensive, ultimate, unlock, elevate, dive into.
- Fancy words: "utilize" and "leverage" (use "use"), "facilitate" (use "help").
- Canned lines: "It is important to note", "Let's explore", "In conclusion".
- "Not just X, but Y" sentences.
- Vague claims like "many experts say". Name the source or cut it.
- Endings that repeat the page.

## Keep the facts honest

- Use verified sources and the tool's real behavior. Link primary sources.
- Put a limit next to the claim it limits.
- Say when something is unknown. Unknown beats fake precision.
- Never invent experience, testing, quotes, numbers, or certainty.
- Keep exact units, technical terms that matter, and legal meaning.

## Headings, titles, and search

Write for the person searching. If they finish their task and don't go back to search, the page ranks.

- Write headings as the questions people search, like "How is KDP royalty calculated?" Use their words, not internal terms.
- Answer the question in the first sentence under the heading.
- The SEO title names the main search phrase and what the page is. Keep it short enough to show in full.
- The SEO description says what the reader can do or learn, in one or two plain sentences.
- No clickbait, keyword stuffing, or padding.
- Link when it helps the reader check a claim or take the next step. Link related stack127 pages where they're the natural next step.

## Words inside a tool

A tool is something people use, not something they read. The only words inside it are labels, hints, option names, button names, values, errors, and short status words. Everything else goes in the page content.

- Labels use the words people use, like `Trials started`, not `Trial starts in cohort`.
- A hint is one plain sentence, ideally under 12 words. It says what the input means or where to find the number. Example: `Everyone who started a trial in the same month.`
- No sentences under fields, headings, options, cards, or buttons.
- Result labels name the value. Don't explain the result in sentences.
- Never call a result good or bad. Show it next to a published range when one fits. See [tool-interface.md](tool-interface.md).

## Clean wording

- `stack127` in lowercase. Sentence case headings. Product names as their owners write them.
- Straight quotes. No em or en dashes in sentences. Ranges use "to". A lone `—` is fine in a tool as the mark for a value it can't calculate yet.
- No emojis, decorative labels, or extra bold.
- Buttons name the action, like `Check domain age`.
