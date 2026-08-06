# Domain Age Checker

Route: `/domain-age`

Publication state: controlled by the exact `domain-age` row in `public.version127_pages`.

Status: plan.

## Purpose

Answer one question: how long has this domain been registered, and what does that actually tell you?

The audience is different from the rest of this folder. People checking domain age are usually evaluating a site they did not build: an SEO buyer sizing up an acquisition, someone checking whether a shop that emailed them is three weeks old, a researcher dating a piece of infrastructure. They are not debugging their own domain.

That different audience is what earns this its own route rather than a section of Domain Registration Lookup. The explanation here is about interpretation, not about RDAP.

## Input

One domain name, normalized the same way as Domain Registration Lookup. No other controls.

## What the result shows

Lead with the age, in the units a person would say out loud, then the date it derives from.

```
version127.com has been registered for 3 weeks. The registration was created on
3 July 2026 and the registry has held a record for it continuously since then,
as far as this lookup can see.
```

Then, quietly:

- the exact `registration` event timestamp as published, and in UTC
- age expressed precisely, in years, months, and days
- which server the date came from
- the `reregistration` date when the registry publishes one, which changes the answer materially, see below
- the `transfer` date when published, since a name that changed registrars recently is a different situation from one held in place
- the `last changed` date when present, because a name registered in 2004 and last changed yesterday is a different situation from one untouched for years

When a `reregistration` event is present, it leads instead of being a footnote:

```
example.com was first registered on 4 March 2003, but the registry records a
reregistration on 2 February 2026. The name was dropped at some point and
picked up again, so the current registration is 6 months old even though the
name itself has existed for 23 years.
```

Show a small horizontal time path: creation date, today, expiry date. Three points and two spans. That single visual replaces two paragraphs of explanation and shows immediately whether the domain is near renewal.

Do not show a score, a trust rating, an age percentile, or a comparison against other domains.

## Engine

The `registration` event from the registry RDAP response, plus `reregistration` when present.

Details that matter:

- `reregistration` is a registered RDAP event action and some registries publish it. When it is there, compute the current registration age from it and show the original registration date as history. When it is absent, we cannot tell a continuously held name from a re-registered one, and that is the caveat below rather than a silent assumption.
- Registrars sometimes publish a different creation date from the registry. Use the registry. If the registrar hop returns a conflicting `registration`, show the disagreement rather than hiding it, because it is genuinely interesting when it happens.
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

Then, in the explanation: what age is legitimately useful for, and what it is not. Give a real example of each rather than a list of warnings. The honest framing is that age is one input among several, most useful as a contradiction detector: a company claiming twenty years of history on a domain registered eight months ago is worth a second look.

## Content flow

1. Title and a paragraph that says what the tool returns and immediately what it means.
2. The form.
3. The age, the date, and the time path visual.
4. One divider.
5. What the creation date actually records, including the drop and re-registration case and why we can sometimes date it and usually cannot. This is the core of the page.
6. What people use domain age for, honestly: SEO evaluation, acquisition, fraud checking, and where each of those over-reads it.
7. A short note that a domain's real history needs sources this tool does not have, with `web.archive.org` named as the practical one.
8. Coverage, freshness, privacy, and a link to Domain Registration Lookup for the full record.
