# Writing on stack127

Talk like a friend explaining something to another friend, whatever the situation. Don't overcomplicate it. Keep it simple enough that your friend gets it on the first read. Let it move the way talking does, one thought leading to the next. A short line that just talks to the reader is fine now and then, but never fluff up the page. Stay on the topic, and keep the writing direct and short.

Conversational, but not chatty. Talk to the reader in full sentences, with accurate facts. No jokes, no hype, no filler. Engaging doesn't mean longer; most pages should get shorter.

This guide covers how to write, which format to use, titles, intros, and search wording, for every page, doc, and chat. Where page content lives, and how to write each block in MDX, is in [page-content.md](page-content.md). Components are in [shared-ui.md](shared-ui.md). What goes on a tool page lives in `skills/stack127/tools/stack127-tool-writing/SKILL.md`.

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

## Titles and search

Write for the person searching. If they finish their task and don't go back to search, the page ranks. But first they have to pick our result, and that's the title's job.

A title has two jobs. It has to use the words people type, and it has to make them want to click. A title that only does the first reads like a label, such as "Product launch directories: costs, links, and wait times". Say it the way you'd tell a friend what they'll find, in the words they searched.

### Find the words first

Before writing a title, search the page's main topic and read the first page of results. Write what you find under "Search words" in the page's `research.md` (tools) or `brief.md` (directories, catalogs, and courses):

1. **The main phrase.** The words most top results share, such as "SaaS launch directories" or "KDP royalty calculator".
2. **The words they add.** Two to four words that keep showing up in top titles, such as free, list, online, compared, vs, the year, or a count.
3. **The questions.** "People also ask", autocomplete, and related searches.
4. **The gap.** What top titles promise and the pages don't deliver, such as stale lists, paid placements, email gates, or dead links.

Use the words searchers and competitors use. If every top result says "list", say "list". If they all lead with a count, lead with ours. Then beat them on the page itself, with fresher facts, real checks, and no padding.

### The title fields

| Field | Where it shows | How to write it |
| --- | --- | --- |
| SEO title (`meta_title`) | Search results and the browser tab | The main phrase near the start, plus one clear promise. Keep it under 60 characters so it shows in full. |
| H1 (`title`) | Top of the page | The same promise, said to the person who just arrived. It can be longer and warmer than the SEO title. Keep the main phrase. |
| SEO description (`meta_description`) | Under the title in results | 140 to 160 characters. What they get, one detail that sets the page apart, and why it's worth the click. Talk to them as "you". |
| Card name and description | Homepage, catalogs, and sidebars | Short. Name the task, not the topic. |

The SEO title and H1 make the same promise in different words. Don't copy one into the other, and don't let them promise different things. Don't add "| stack127" to a title. Search results show the site name on their own.

### Patterns that work

| Page | Pattern | Example |
| --- | --- | --- |
| Directory or list | Count, what it is, who it's for | 150+ places to launch your SaaS, app, or AI tool |
| Fee or price comparison | The names people search, what you learn, the year | Gumroad vs Payhip vs Etsy fees: what you keep (2026) |
| Calculator | The tool word people search, "free", the answer | Free KDP royalty calculator: what you earn per book sold |
| Checker or lookup | The tool word people search, the question it answers | Domain age checker: how old is this domain? |
| Reference | The topic, "explained", the terms people search | Domain status codes explained, from clientHold to serverHold |
| Catalog | Count, "free", the family, the jobs | 20+ free SaaS calculators for MRR, churn, LTV, and CAC |
| Course or guide | The question, who it's for | What is self-hosting? A beginner's guide |

These are starting points, not templates to fill in. If a title reads like a form field, rewrite it.

### Numbers

A number tells people what they're getting before they click. "150+ launch directories" beats "launch directories". Use numbers often, and keep them honest.

- Count only what the page shows and has checked. Never round up or count dead entries.
- A stored title can't update itself, so round a changing count down and add a plus. 155 directories becomes "150+". The title stays true as the list grows.

  | Count | Round down to | Example |
  | --- | --- | --- |
  | Under 10 | No count in the title | |
  | 10 to 99 | 5 | 78 becomes "75+" |
  | 100 to 999 | 50 | 309 becomes "300+" |
  | 1,000 to 9,999 | 100 | 4,931 becomes "4,900+" |
  | 10,000 and up | 1,000 | 13,325 becomes "13,000+" |

- When a list passes the next round number, update the title. When records are removed, check the title still holds.
- Fixed numbers from the subject work too, such as "the 7 KDP keyword fields" or "RAID 0, 1, 5, 6, and 10".
- In the intro and content, the exact count is fine when the page computes it from the records.

### Years

Add the year only when the facts change and someone checked them that year: fees, prices, join rules, and lists of places to submit. People search "Gumroad fees 2026" because they want current numbers. Leave the year off calculators whose math doesn't change and references that rarely change. When a page with a year is rechecked in a new year, update the year in the title. An old year costs more clicks than no year.

### Words people add

| Word | Use it when |
| --- | --- |
| free | The tool or list is free to use with no account. Most of ours are, so say it. |
| no signup | It's true and top competitors gate theirs behind an email. |
| list | The page is a list and people search "X list". |
| compared, vs | The page puts options side by side. |
| explained | The page explains each item, not just lists it. |
| best ... for | The page helps one kind of person pick, with filters or rules for that case, such as "Best ad networks for small sites". Never crown a winner the records don't support. |
| how to, what is | The page answers that exact question. |
| checker, calculator, generator, lookup | Always use the tool word people search, even when "planner" or "explorer" sounds nicer. |

### Sound like a person

Read the title out loud. If it sounds like a database label, rewrite it.

- Name what the reader wants to do, not the category. "Places to launch your SaaS" beats "Product launch directories".
- Not every title needs a colon. When every page reads "X: Y", they all sound the same. Mix in questions and plain phrases.
- Don't stack jargon. "DNSSEC checker: validate DS, DNSKEY, and RRSIG records" only speaks to people who already know the answer. Keep the one or two terms people search, and add the plain question.
- No clickbait, keyword stuffing, or padding. The page must keep every promise the title makes.

### Before and after

| Page | Before | After |
| --- | --- | --- |
| `/launch-directories` H1 | Find the right place to launch your product | 150+ places to launch your SaaS, app, or AI tool |
| `/launch-directories` SEO title | Product launch directories: costs, links, and wait times | 150+ SaaS launch directories: free, paid, and wait times |
| `/launch-directories` description | Launch boards, startup listings, and AI tool directories. Compare cost, link type, free-plan rules, and wait times, with every source page linked. | 150+ places to post your new product, from Product Hunt to AI tool lists. See which are free, which give a real link, and how long each takes. |
| `/kdp-royalty-calculator` SEO title | KDP royalty calculator for paperbacks, hardcovers, and eBooks | Free KDP royalty calculator: what you earn per book sold |
| `/saas-tools` SEO title | SaaS metrics calculators: MRR, churn, NRR, CAC, and LTV | 20+ free SaaS calculators for MRR, churn, LTV, and CAC |
| `/platform-fees/digital-products-and-stores` SEO title | Digital product platform fees: Gumroad, Payhip, Etsy, more | Gumroad vs Payhip vs Etsy fees: what you keep (2026) |

### Headings and links

- Write headings as the questions people search, like "How is KDP royalty calculated?" Use their words, not internal terms.
- Answer the question in the first sentence under the heading.
- Link when it helps the reader check a claim or take the next step. Link related stack127 pages where they're the natural next step.

## Intros

The intro is where most pages stop sounding like a friend. It's the first thing people read after clicking, so it decides whether they stay.

- Start with them, not the page. The first sentence names their situation or gives the answer. Never open with "This tool", "This page", or a description of what's listed.
- Say "you" in the first two sentences.
- Then tell them how to start: what to have ready, or what to click first.
- Two or three sentences. If the intro could sit on a competitor's page unchanged, it's too generic.

| Instead of | Write |
| --- | --- |
| Places to submit a new product, from launch boards like Product Hunt to AI tool lists and software review sites. Filter by category, cost, or link type, then open a card to see who can submit, how long review takes, and every page we checked, with its date. | Just built something and need people to see it? Here are 150+ places that take new products, from Product Hunt to AI tool lists. Filter to the free ones, then open a card to see who can submit and how long review takes. |
| Calculators for subscription businesses: recurring revenue and growth goals, churn and retention, pricing, margins, cash runway, and what it costs to win a customer. Enter your own figures. | Running a subscription business means watching a few numbers every month. Each calculator here answers one of them, like your MRR, your churn, or how long your cash lasts. Not sure which one you need? Find your question in the table below. |

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
