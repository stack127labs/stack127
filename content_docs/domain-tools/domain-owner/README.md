# Domain Registrant Lookup

Route: `/domain-tools/domain-owner`

Publication state: controlled by the exact `domain-tools/domain-owner` row in `public.version127_pages`.

Status: plan.

## Purpose

Show what is actually published about who a domain is registered to, show precisely what has been withheld and by whom, and tell the reader what routes exist to reach the registrant.

Most tools with this name imply they will reveal an owner and then show a page of "REDACTED FOR PRIVACY". That is a bait page. Ours answers the real question, which is not "who owns this" but "can I find out who owns this, and how".

The route slug is `domain-owner` because that is how people search. The page title and every heading say registrant, because that is what the field is.

## Input

One domain name, normalized as elsewhere.

## What the result shows

Lead with the honest answer, which for most gTLDs is that the data is withheld.

```
The registrant of version127.com is not published. HOSTINGER operations, UAB
removed or emptied nine registrant fields before publishing this record, and
the .com registry holds no contact data at all. The registrar publishes a
contact form for reaching the registrant without disclosing their details.
```

Then, in order:

**What is published.** Every entity the registrar returned, by role: registrar, registrant, administrative, technical, abuse, billing. For each, the jCard fields that survived. Country and state or province frequently survive redaction and are genuinely useful.

**What was withheld, field by field.** This is the part no other tool shows well, and RDAP hands it to us. The RFC 9537 `redacted` array names each removed field and the method used. Verified against `version127.com` on 28 July 2026:

| field | method | what it means |
| --- | --- | --- |
| Registry Registrant ID | `removal` | the field is absent entirely |
| Registrant Organization | `removal` | absent |
| Registrant Name | `emptyValue` | present but blank |
| Registrant Street | `emptyValue` | present but blank |
| Registrant City | `emptyValue` | present but blank |
| Registrant Postal Code | `emptyValue` | present but blank |
| Registrant Phone | `removal` | absent |
| Registrant Email | `replacementValue` | replaced with something else, usually a form URL |

Render this as a readable table, one row per redacted field, with the method translated. Do not print JSONPath expressions in the page; keep them in the raw disclosure.

**How to reach the registrant.** When the registrar publishes a `contact-uri`, link it. Verified on our own domain: the registrant vCard carried `contact-uri` pointing at the registrar's contact form. Also show the registrar abuse contact, and name ICANN's Registration Data Request Service as the route for a documented legitimate-interest request.

**Registry versus registrar.** State which is thin. `.com` is thin and publishes no contact objects, so everything on this page came from the registrar hop. When the registrar hop fails, say the contact data could not be retrieved rather than showing an empty page that reads as "no owner".

## Engine

Registry query first, then the registrar hop from the `rel: "related"` link. Contact data only exists on the registrar side for thin gTLDs, so the hop is required for this page in a way it is not for the others. When it fails, this page degrades to "could not retrieve" rather than to a blank.

Parse `vcardArray` properly. It is jCard, a nested array format, and naive property access produces wrong labels. `fn` with an empty string is redacted, not missing. `adr` carries a seven element array where individual positions can be emptied independently, and the `cc` parameter often survives when the address does not.

Parse the `redacted` array by `name.type` and `method`. Do not try to evaluate the JSONPath expressions. We use them as documentation of intent, matching by field name.

Some thick registries and many ccTLDs publish real registrant data, particularly for organizational registrants who have no GDPR protection. When it is there, show it normally without a warning wrapper.

## What this tool cannot do

- **It cannot reveal a redacted registrant.** There is no technique, no alternate endpoint, and no paid source we are willing to use that changes this.
- **It cannot see behind a privacy or proxy service.** When the registrant is "Domains By Proxy" or similar, that is the published registrant and the underlying person is not in any public record.
- **It cannot verify that published data is true.** Registrars are required to collect accurate data, not to prove it. Published names and addresses are routinely wrong.
- **It cannot show historical registrants.** RDAP returns current state only.
- **It cannot answer "who owns this site".** The registrant of the domain is often not the operator of the site, especially on hosted platforms.
- **It cannot check a TLD with no RDAP service.** Read coverage from `coverageSummary()`; never quote a fixed count in page copy.

## What the page must tell the reader

- That contact redaction is the normal, expected outcome for gTLDs, caused by GDPR and the ICANN policy that followed it, and not a limitation of this tool.
- That what is shown as withheld comes from the registrar's own machine-readable declaration, so the reader can see exactly what exists but is not public.
- The legitimate routes to registrant contact, named: the registrar's contact form or relay email, the abuse contact for abuse reports, ICANN's Registration Data Request Service for documented legal or investigative need, and a court or law enforcement process where that applies.
- That we do not sell, aggregate, or resell contact data, and that we do not build a record of who looked up what. Registration facts are cached by domain name; requester identifiers are used transiently for rate limiting and are never joined to a lookup.
- That country and organization sometimes survive redaction and are real data when present.

Do not moralize about privacy, and do not editorialize about GDPR. State the mechanism and the routes.

## Content flow

1. Title and a paragraph that says immediately that most registrant data is not public, and what the page shows instead.
2. The form.
3. Published data, withheld data, and how to make contact.
4. One divider.
5. Why the data is gone: the short factual history, GDPR in 2018, ICANN's temporary specification, and RDAP with RFC 9537 redaction signalling as the current state.
6. Who can still get it and how, as the practically useful section.
7. What privacy and proxy services are, and why the registrant shown is sometimes a company that is not the owner.
8. Coverage, thin versus thick registries, freshness, privacy, and a link to Domain Registration Lookup.
