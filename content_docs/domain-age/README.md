# Domain Age Checker

Route: `/domain-age`

Publication state: controlled by the exact `domain-age` row in `public.stack127_pages`.

Status: implemented. The content flow follows the approved brief.

## Purpose

Answer one question: how long has this domain been registered, and what does that actually tell you?

The audience is different from the rest of this folder. People checking domain age are usually evaluating a site they did not build: an SEO buyer sizing up an acquisition, someone checking whether a shop that emailed them is three weeks old, a researcher dating a piece of infrastructure. They are not debugging their own domain.

That different audience is what earns this its own route rather than a section of Domain Registration Lookup. The explanation here is about interpretation, not about RDAP.

## Input

One domain name, normalized the same way as Domain Registration Lookup. No other controls.

## What the result shows

Lead with the age in the units a person would say out loud. Put the domain and the date it derives from directly below it.

```text
Current registration age
3 weeks
stack127.com, since 3 July 2026.
```

Then, quietly:

- the exact `registration` event timestamp as published, and in UTC
- a rounded age for readability, with the reported date available on the timeline
- which server the date came from
- the `reregistration` date when the registry publishes one, which changes the answer materially, see below
- the `transfer` date when published, since a name that changed registrars recently is a different situation from one held in place
- the `last changed` date when present, because a name registered in 2004 and last changed yesterday is a different situation from one untouched for years

When a `reregistration` event is present, the large age uses that later date. The timeline keeps the first registration visible:

```text
Current registration age
6 months
example.com, since 2 February 2026.

First registered  ->  Re-registered  ->  Today  ->  Registry expiry
```

Keep one short caveat below the timeline: RDAP does not say why the domain was registered again or whether ownership changed.

Show a small horizontal time path. Include registration, re-registration, transfer, last change, today, and registry expiry only when each date exists. The path becomes vertical on narrow screens. Do not invent a progress percentage because registration age has no meaningful target.

Do not show a score, a trust rating, an age percentile, or a comparison against other domains.

## Engine

The `registration` event from the registry RDAP response, plus `reregistration` when present.

Details that matter:

- `reregistration` is a registered RDAP event action and some registries publish it. When it is there, compute the current registration age from it and show the original registration date as history. When it is absent, we cannot tell a continuously held name from a re-registered one, and that is the caveat below rather than a silent assumption.
- This checker requests the registry record with `includeRegistrar: false`. It does not fetch or compare the registrar's registration date.
- Compute age from the current date at request time, in UTC, and do not cache the computed age. Cache the RDAP response, derive the age fresh. A cached "3 weeks" that is served for two days is wrong.

## What this tool cannot do

This is the tool where the caveats matter most, because domain age is the most commonly over-read fact in this whole folder.

- **Registration age is not site age.** The creation date says when the name was first registered by anyone. The current owner may have bought it last week. There is no field in RDAP that tells us when it changed hands.
- **A dropped and re-registered domain usually reads as new, and we often cannot prove it.** A registry that publishes `reregistration` lets us show both dates. Most do not, and then `registration` reflects the current registration only, with no trace of the earlier one. Treat a missing `reregistration` as unknown history, not as proof of continuous ownership.
- **Age is not trust.** Old domains are bought and repurposed for scams precisely because age reads as legitimacy. New domains are overwhelmingly ordinary.
- **It cannot date the content or the business.** Only the registration.
- **It cannot check a TLD with no RDAP service.** Read the covered and uncovered counts from `coverageSummary()` and name the specific TLD the reader entered, rather than quoting a number in page copy.
- Some ccTLD registries publish no creation date at all even when they run RDAP. That is unknown, not zero and not today.

## What the page must tell the reader

The three that must be visible without expanding anything:

1. This is when the name was registered, not when the site launched or when the current owner acquired it.
2. If a domain previously expired and was re-registered, the clock restarted, and most registries do not publish enough for us to tell either way.
3. Which registry published the date, and when we fetched it.

The supporting explanation covers what the age can establish and what it cannot. A recent registration does not disprove the age of a business, which may have used another domain before. Do not turn that difference into a verdict about trust.

## Content flow

1. One intro paragraph describing the problem, input, and answer.
2. The existing form, age result, timeline, and source evidence.
3. Supporting sections covering the registration date, website history, registration events, SEO interpretation, and missing or differing ages.
4. One wrapping comparison table for renewal, transfer, expiry, and deletion followed by registration.
5. One glossary list defining remaining unfamiliar terms used in the result.

The page brief records the September 6 expansion requested after reviewing the older-page PDF. Follow `stack127_docs/writing-style.md` and preserve the brief's coverage. Live copy belongs only in `stack127_tool_pages`; use the reviewed content command and leave `tool_version` unchanged for copy edits.
