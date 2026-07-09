# Version127 Writing Style

Version127 writing should be simple, useful, and specific. Write like a technical friend explaining the point clearly.

## Rules

- Say the useful thing first.
- Respect the reader's time. Explain more in fewer words, without making it hard to understand.
- Add detail when it helps someone decide, compare, configure, verify, or avoid a mistake.
- Prefer facts, links, specs, caveats, and examples over opinion.
- Use exact names, specs, versions, buttons, settings, tools, and limits when they matter.
- Do not repeat category words like "open source", "self-hosted", "AI", or "smart home" unless they add new information.
- Use plain words. No vague claims, hype adjectives, corporate voice, or filler.
- Keep paragraphs short.
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

## Long-form guides and courses

The rules above keep directory entries and references terse and factual. Long-form teaching content, like the self-hosting course, uses a warmer register on top of the same principles: first person, opinionated, and lived-in, written like one experienced person sharing what they actually did.

For that content, weave mistakes and definitions into the flow instead of adding "common mistakes" or "glossary" sections, give a real recommendation instead of a neutral survey, and avoid "X, not Y" contrast framing. See `content_docs/self-hosting-for-beginners/README.md` for the full voice guide and worked examples.
