# Version127 Writing Style

Version127 writing should be simple, useful, and specific. Write like a technical friend explaining the point clearly.

## Simple means composed

Simple does not mean short, stripped down, or broken into tiny pieces. A page can use full paragraphs and detailed explanations when the reader needs them. The page should still feel calm because every sentence has a purpose and every part belongs to the same thought.

Write as if one person who understands the subject sat down and composed the page for another person. The reader should feel guided by judgment, not presented with a dump of fields, labels, caveats, and components.

A strong Version127 page:

- uses complete, natural sentences
- gives the reader one clear path through the subject
- groups related information before introducing another idea
- uses spacing, typography, tables, and diagrams to show relationships
- gives visual weight to the answer the reader came for
- keeps metadata, caveats, and technical detail quieter than the main answer
- explains the detail most likely to confuse the reader at the moment it matters

The goal is not minimal copy. The goal is an explanation that feels considered, direct, and human.

## Do not build pages from labels

Avoid treating every fact as a separate piece of interface copy. This creates pages that are technically organized but feel robotic and difficult to follow.

Do not add:

- decorative eyebrows above headings
- labels that repeat what the heading or surrounding sentence already says
- isolated helper sentences floating between controls or result blocks
- multicolored fragments inside one sentence to imitate a dashboard
- a card for every fact, flag, definition, or caveat
- oversized warning panels for secondary information
- a separate section for every small question the reader might have
- headings such as "Overview", "Key information", or "Important" when the content can begin directly

Labels are still necessary when they perform a real job. Form controls need accessible names. Tables need clear column headings. Technical details need exact field names. The rule is to remove decorative and repetitive labels, not functional ones.

## Compose the page before writing sections

Decide what the reader came to understand or accomplish. Then arrange the page around that path.

For a tool page, a useful order is usually:

1. a clear title and a natural explanation of what the tool returns
2. the tool itself
3. one composed result that gives the answer before the metadata
4. a visual, table, or example that explains the relationship most likely to confuse the reader
5. a small amount of supporting context, kept in connected sections
6. technical details that remain available without dominating the page

This is a starting shape, not a template. Use fewer sections when the idea is simple. Add depth when it helps the reader act or understand. Do not turn the outline into nine labeled blocks just because nine facts exist.

## Tool results should read like an answer

The result should sound like a knowledgeable person explaining what happened. Lead with the useful conclusion, keep timing and provider metadata nearby but quiet, and show repeated data in a table when a table makes comparison easier.

Bad:

```text
Lookup complete
example.com
8 record types checked · through Cloudflare · 6 with records · 2 without records
Checked at 11:13 in 157 ms
DNSSEC authentication reported: No
```

Good:

```text
Cloudflare returned records for six of the eight requested types. Two returned no record of the requested type.

Cloudflare did not mark this answer as authenticated. That can be normal for an unsigned name, so this result alone does not mean DNSSEC is broken.
```

The good version is not good merely because it uses fewer lines. It is good because the facts are connected, the wording explains their meaning, and DNSSEC is kept in proportion to the rest of the answer.

## Use visuals to explain relationships

A visual should replace explanation that would otherwise require the reader to assemble several facts. It should not decorate the page.

Good uses include:

- a short path showing an alias moving from one hostname to another
- a table comparing repeated fields
- a small sequence showing what happens before and after an action
- a diagram showing hierarchy, ownership, or data flow

Keep visuals quiet and native to the page. A useful visual can be three values connected by arrows. It does not need a large illustration, a dashboard, or a stack of cards.

## Current reference page

Use `/dns-tools/dns-lookup` as the current reference for this standard. Its useful patterns include:

- a title followed by a natural explanation, with no decorative eyebrow
- a form that keeps functional field names without surrounding every control with helper copy
- a result organized around the queried name, a semantic record-type navigator, and the records themselves instead of a sentence that repeats visible counts
- repeated DNS values shown in tables instead of a card for every record
- a small visual path that explains aliases and record ownership
- copy icons placed beside the values they copy, with no separate actions column or toolbar
- raw provider responses kept with the record type they belong to
- DNSSEC, timing, scope, and privacy information kept available without overpowering the records
- a few connected supporting sections instead of a glossary-shaped page

Inspect the route, result component, and rendered page before creating another Version127 tool page. Reuse the judgment and information hierarchy, not the exact headings or layout. A different subject may need a different composition.

## Rules

- Say the useful thing first.
- Respect the reader's time. Explain more in fewer words, without making it hard to understand.
- Add detail when it helps someone decide, compare, configure, verify, or avoid a mistake.
- Prefer facts, links, specs, caveats, and examples over opinion.
- Use exact names, specs, versions, buttons, settings, tools, and limits when they matter.
- Do not repeat category words like "open source", "self-hosted", "AI", or "smart home" unless they add new information.
- Use plain words. No vague claims, hype adjectives, corporate voice, or filler.
- Keep paragraphs focused. Give a thought enough room to read naturally instead of cutting it into fragments.
- Keep headings short and written normally. Do not add a decorative dot after headings.
- If something is unknown, say unknown or leave it out.
- Research the small details. Do not imply more than the research proves.
- Make the flow easy: point, context, caveat, next useful detail.

## Examples

Bad:

```text
This page provides a comprehensive overview of smart home protocols and helps users understand the best option for their setup.
```

Good:

```text
Matter, Zigbee, Z-Wave, Thread, Wi-Fi, and Bluetooth all solve different parts of a smart home setup. The useful question is not which one is best. It is which devices you own, which hub controls them, and how much local control you want.
```

Bad:

```text
There are many factors to consider before choosing an AI agent framework.
```

Good:

```text
Start with the runtime. Some agent frameworks are built for local scripts, some expect a hosted backend, and some need browser or file access to be useful. That choice affects cost, privacy, permissions, and how much you need to supervise.
```

Bad:

```text
Use this calculator to easily calculate the correct subnet information.
```

Good:

```text
Enter an IP address and CIDR range. The calculator shows the network address, usable host range, broadcast address, and total addresses. It does not check whether that range is already used on your network.
```

Bad:

```text
Status codes are important because they help developers debug websites and improve performance.
```

Good:

```text
A `404` means the server responded, but the requested page was not found. A `502` usually means a proxy or gateway could not get a valid response from the upstream server.
```

Directory summary example:

```text
Sketches diagrams, flows, and rough UI ideas with a hand-drawn whiteboard feel.
```

## Avoid

- vague words like "powerful", "seamless", "robust", "ultimate", "simple", or "easy" when they do not explain anything
- em dashes (—) and en dashes (–). Never use them anywhere on the site. Use a comma, a colon, or two sentences instead, and write ranges as "10 to 15W", not "10–15W"
- "it is not just x, it is y" framing
- the punchy two-fragment "mic-drop" summary: a short noun phrase, then another, dropped in as a neat closer ("Five pieces, one app.", "Same experience, different owner."). It is an AI tell. Write a normal sentence or cut it.
- intros that say the page is important before giving the useful answer
- claims that sound stronger than the source proves
- repeating the same fact in the heading, intro, card, and paragraph
- writing that sounds like marketing, policy, or documentation generated from a template
- Never use CSS to force UI text into uppercase. Do not add positive letter spacing to imitate spaced labels. Write labels in their intended casing and let the normal type system carry the hierarchy.

## Use

- direct sentences
- researched details
- specific nouns
- short paragraphs
- natural explanations
- examples when they reduce confusion
- caveats when they prevent bad assumptions

## Links

- Link the official site or docs the first time a page tells the reader to install or run a specific app or tool.
- When a concept goes beyond the current page: if the site covers it elsewhere or later, say so and link that page; if it is out of scope for the site, link one good external source instead of half explaining it.
- Prefer official and neutral sources (project sites, official docs, Wikipedia) over stores and blogspam.

## Flow

Every page needs a clean path through the idea.

Start with what the user came for. Add the detail that helps them understand it. Put caveats close to the claim they limit. Do not make the reader collect pieces from five places to understand one point.

Write like we are casually explaining the topic to a friend who is smart, busy, and does not want fluff.

The motto: make it simple for the user to understand.

## Quick Check

Before publishing, ask:

- Is it true?
- Is it specific?
- Did the research prove this?
- Are the important details named clearly?
- Is anything repeated?
- Can a normal reader understand it?
- Can a technical reader trust it?
- Does the page feel composed, or assembled from labels and components?
- Is the main answer visually stronger than metadata and caveats?
- Would a table or small diagram explain this better than another paragraph or card?

## Long-form guides and courses

The rules above keep directory entries and references terse and factual. Long-form teaching content, like the self-hosting course, uses a warmer register on top of the same principles: first person, opinionated, and lived-in, written like one experienced person sharing what they actually did.

For that content, weave mistakes and definitions into the flow instead of adding "common mistakes" or "glossary" sections, give a real recommendation instead of a neutral survey, and avoid "X, not Y" contrast framing. See `content_docs/self-hosting-for-beginners/README.md` for the full voice guide and worked examples.
