# Brief: DNS Lookup

## Who is here

Someone has changed a website, mail, or verification record and needs to know what DNS actually returns. They may know the value their provider expects without knowing which name, record type, or DNS source to check.

## The job

They can check the right name, compare the returned value with their provider's setup, distinguish a missing record from a failed lookup, and choose a useful next check. The guide must explain the limits of this one-source snapshot without turning into a DNS textbook.

## Show vs say

Keep the short, problem-led introduction, working form, and real results first. Use two wrapping reference tables: record types and response meanings. Explain aliases with an inline example; the live result already draws the actual path, so a second figure adds little. Connected paragraphs explain exact names, source choice, cache behavior, email verification names, DNSSEC interpretation, and data handling. Define unfamiliar terms where they become useful instead of repeating them in a separate glossary.

## Reading order

Start with the exact hostname and the scope of All. Connect that choice to the record-type reference, then explain what a returned value and its TTL mean. Follow the natural next question, why sources disagree after a change. Cover email and verification names as a concrete case where the wrong input gives an apparently empty result. Distinguish response codes and DNSSEC authentication before ending with data handling.

Keep useful existing coverage of PTR, aliases, record types, TTL, empty answers, and privacy. Replace the repeated troubleshooting table with examples and diagnostic links. Add the limits previously missing or understated: All is not subdomain discovery, one authoritative server is not a delegation audit, public results do not reproduce a private network, and an ASN country is not server geolocation.

## Scope and verification

This is a development content revision. Preserve the title, controls, engine, results, public metadata, publication state, and tool version. Use the database Markdown update command; do not store a second live copy here. Scope any explanatory-table layout adjustment to this page.

Review the rendered development copy against its prepared Markdown, run DNS engine and route tests, and inspect real lookup results plus the complete guide at desktop and mobile widths in both themes. Record source checks, content revision, and visual evidence in `writing-and-seo.md`.
