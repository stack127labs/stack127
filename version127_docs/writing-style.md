# How we write on version127

Write like you are explaining techy stuff to a smart friend. First person, plain words, no fluff. And before you write anything at all: figure out what should be shown instead of said. Most of what people "write" on this site should have been a chart, a table, a drawing, or a screenshot.

This doc is the voice. If a page does not sound like this doc, the page is wrong.

## Show first, write second

Words are the fallback medium here, not the default. Before drafting a section, ask: can the reader get this faster from a visual?

- Numbers people compare: clean chart or table. Never a paragraph of numbers.
- A concept or mental model: marker art. Wobbly on purpose, one idea per drawing.
- A real interface or result: screenshot. Proof beats description.
- Repeated facts across items: table.
- A feeling, a caveat, a recommendation, a story: sentences. This is what writing is for.

The full decision guide lives in `version127_docs/visual-first.md`. Read it before planning any page.

**And this part matters: push back.** If anyone, including Teja, says "let's write a page about software licenses", do not start writing. Say something like: "most of this page should be a verdict table and one marker drawing of how copyleft spreads, with maybe six sentences of actual writing. Here is the format I suggest." Propose the mix, then write only the parts that earned it. A request to write a page is a request to *make* a page, and making mostly means showing.

## Every page starts with a brief

Before touching a page, read (or write) `content_docs/<page-slug>/brief.md`. Half a page, three parts: who is reading, what job they came to do, and what gets shown versus said. If the brief does not exist yet, writing the brief is the first task, not the page. The format is in `visual-first.md`.

## Headings do work

A heading is not a category sticker. It either carries the whole point, or it asks the exact question the reader has. Someone skimming only the headings should get the gist of the page.

Bad: `Details`, `How it works`, `More information`, `Data handling`

Good: `A dropped and re-registered domain resets the age clock`
Good: `Why is the same code written two different ways?`
Good: `What TTL means and how to read Resolver TTL`

Question headings are great for skimmers and for search. Statement headings are great when the answer fits in the heading itself. Pick whichever tells more. Never add a decorative dot, an eyebrow above it, or a heading that just restates the previous one.

## Page titles carry the name and the point

The `<title>` lives in the `version127_pages` registry. Every title includes the page's name plus what you actually get, written like a small sentence, not a keyword pile.

Bad: `About` · `DNS Lookup` · `Check Domain Records Online Free`

Good: `About version127`
Good: `Privacy policy of version127`
Good: `DNS Lookup: check any domain's records`
Good: `Self-host apps: a directory of apps worth running yourself`

The colon is one way to join the name and the point, not a formula. "DNS lookup for any domain's records" and "Free domain lookup tools that answer from the registry" are just as good. Vary the shape naturally; never stamp the same pattern across every page.

## Simple never means less technical

This is a tech site. Plain language connects exact technical facts; it does not replace them. Keep the record types, the field names, the protocol terms, the version numbers. Cut the fluff around them, never the terms themselves. And do not write feels and mood; write what the thing does.

Bad: `TLD directory: every extension and who runs it`

Good: `TLD directory: every domain extension, its operator, and DNSSEC`

The bad one is friendlier and says less. The good one is exactly as easy to read and tells a technical reader precisely what they get. When simplifying, the test is: did a technical word disappear? If yes, put it back and simplify the connective language instead.

## The brand is version127, lowercase

Always `version127`, small v, even at the start of a sentence. Not Version127, not Version 127, not V127 in copy. The logo already spells it this way; the words follow the logo.

## Simple means composed, not chopped

Simple does not mean short fragments. A page can carry full paragraphs when the reader needs them. It feels simple because every sentence has a job and the whole page follows one path. Write as if one person who understands the subject composed it for another person. No dumps of fields, labels, and caveats.

A strong page gives the reader one path, groups related things together, makes the answer visually louder than the metadata, and explains the confusing detail exactly where the confusion happens.

## Do not build pages from labels

Never add: decorative eyebrows, labels that repeat the heading, helper sentences floating between controls, a card for every fact, oversized warning panels, or headings like "Overview" when the content can just start. If the visual design is doing its job, the page does not need little signs explaining the furniture.

Labels that do real work stay: form controls need names, table columns need headers, technical fields need exact names.

## Results read like an answer

A tool result should sound like a person telling you what happened, conclusion first, metadata quiet.

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

The good one connects the facts and keeps DNSSEC in proportion. Fewer lines is a side effect, not the goal.

## Sentence-level rules

- Say the useful thing first.
- Use exact names, versions, buttons, and limits when they matter.
- Plain words. If "techy stuff" says it, "techy stuff" is fine.
- If something is unknown, say unknown or leave it out.
- Do not repeat a fact across the heading, intro, and paragraph.
- Do not repeat category words like "open source" or "self-hosted" unless they add information.
- Caveats sit next to the claim they limit, not in a panel at the end.

Bad: `There are many factors to consider before choosing an AI agent framework.`

Good: `Start with the runtime. Some agent frameworks are built for local scripts, some expect a hosted backend, and some need browser or file access to be useful. That choice affects cost, privacy, and how much you need to supervise.`

Bad: `Use this calculator to easily calculate the correct subnet information.`

Good: `Enter an IP address and CIDR range. The calculator shows the network address, usable host range, broadcast address, and total addresses. It does not check whether that range is already used on your network.`

## Things that are banned

- Em dashes (—) and en dashes (–). Anywhere. Use a comma, a colon, or two sentences. Ranges are "10 to 15W".
- Hype words when they explain nothing: powerful, seamless, robust, ultimate, and "simple" or "easy" used as decoration.
- "It is not just x, it is y" framing.
- The mic-drop two-fragment closer ("Five pieces, one app."). It is an AI tell. Write a normal sentence or cut it.
- Intros that announce the page is important before saying anything useful.
- Marketing voice, policy voice, template voice.
- CSS uppercase or positive letter spacing to fake label hierarchy. Write labels in their real casing.

## Links

- Link the official site or docs the first time a page tells the reader to install or run something.
- If a concept goes beyond the page: link our page if we have one, or one good external source (official docs, Wikipedia) if we do not. Never half explain.

## Long-form guides and courses

Directory entries and references stay terse and factual. Teaching content, like the self-hosting course, adds warmth on the same skeleton: first person, opinionated, lived-in, one experienced person sharing what they actually did. Weave mistakes and definitions into the flow instead of "common mistakes" sections. Give a real recommendation instead of a neutral survey. See `content_docs/self-hosting-for-beginners/README.md` for that voice with worked examples.

## The reference page

`/dns-tools/dns-lookup` is the current standard: natural title and intro, a form without helper-copy clutter, an answer-first result, tables for repeated values, a small visual for the confusing relationship, and metadata that stays quiet. Steal its judgment, not its layout.

## Quick check before publishing

- Could any paragraph here have been a chart, table, drawing, or screenshot? If yes, it should be.
- Do the headings alone tell the story?
- Does the title carry the name and the point?
- Is it true, specific, and backed by the research?
- Is anything repeated?
- Does it sound like a person, or like documentation?
