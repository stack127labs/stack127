# Punycode and IDN Converter

Route: `/domain-tools/punycode-converter`

Publication state: controlled by the exact `domain-tools/punycode-converter` row in `public.version127_pages`.

Status: plan.

## Purpose

Convert a domain name between the Unicode form a person reads and the ASCII form DNS actually carries, in both directions, and show whether the name mixes scripts in a way that is used for spoofing.

This is the only tool in the folder that sends nothing anywhere. It runs entirely in the browser, has no API route, no rate limit, no cache, and no privacy question. That makes it cheap to build and cheap to run, and it is a good second thing to ship while the RDAP engine is still being built.

## Input

One field that accepts either direction and detects which:

- Unicode input, `münchen.de` or `日本.jp`, converts to the A-label form
- A-label input, `xn--mnchen-3ya.de`, converts back to Unicode
- a full URL, with the hostname extracted and the rest preserved in the output

Show both forms in the output regardless of which was entered. The reader usually wants to see the pair, not a one way conversion.

## What the result shows

```
münchen.de converts to xn--mnchen-3ya.de

Both labels are Latin script. Nothing about this name mixes scripts.
```

And for the direction people arrive with more often, a suspicious name:

```
аpple.com converts to xn--pple-43d.com

The first label mixes Cyrillic and Latin characters. The first character is
Cyrillic а, U+0430, not Latin a, U+0061. Names that mix scripts inside one
label are the standard form of a homograph attack.
```

Show, per label:

- the Unicode form and the A-label form
- which labels were actually converted, since most names have a mix of converted and unchanged labels
- the code point breakdown for any label that is not plain ASCII, with each character named, its code point, and its script
- length in octets against the 63 octet label limit and 253 octet name limit, because IDN conversion expands names and this is where people hit the limit unexpectedly

Copy actions on each form. Offer a link that carries the converted name into Domain Registration Lookup and DNS Lookup.

## Engine

Entirely client-side TypeScript in `lib/domain/punycode.ts`, with no dependency.

**Punycode itself.** RFC 3492 encode and decode is about a hundred lines and fully deterministic. Implement it directly rather than depending on Node's `punycode` module, which is deprecated, or a package. The browser's `URL` constructor does convert to A-label form, but there is no reverse in any browser API, so we need our own decoder regardless and it is cleaner to own both directions.

**Validation.** Check the mechanical rules we can check exactly: the `xn--` prefix, label length against 63 octets, total length against 253 octets, no empty labels, no leading or trailing hyphen, no hyphens in positions three and four for a non-A-label, and that a decoded label re-encodes to the same A-label. That last check catches malformed punycode that decodes to something plausible.

**UTS-46 mapping.** Do this completely rather than approximately. A "practical subset" of the IDNA mapping table is the worst option available: it is indistinguishable from the real thing on ordinary input and silently wrong on exactly the adversarial input the tool exists to examine, and there is no way for a reader to tell which they got.

So generate the full table from the Unicode `IdnaMappingTable.txt`, covering disallowed, mapped, deviation, and ignored characters, with a script under `scripts/domain-tools/` that commits the generated ranges. Requirements:

- **Pin the Unicode version** in the generated file and display it on the page. IDNA behavior changes between Unicode versions and an unversioned answer is unauditable.
- **Refresh by script with a reviewed diff**, the same discipline as the Public Suffix List.
- **Share one implementation with the engine.** `lib/domain/public-suffix.ts` also needs A-label conversion, so both use this module and there is one Unicode version across the site rather than two that drift.
- **Load the table lazily** so it does not sit in the initial bundle of every page. Range-encoded it is a fraction of the raw file, and the page is useful before it loads.

Bidi rules and CONTEXTJ/CONTEXTO validation are a further layer. Implement them or state plainly that they are not implemented. Do not claim IDNA2008 conformance the tool does not have.

**Script detection.** Mixed-script detection needs Unicode script data, generated and pinned by the same script and against the same Unicode version. Cover the full script property rather than a hand-picked list, so a name in a script we did not anticipate reports its actual script instead of "unknown".

## What this tool cannot do

- **It cannot tell you whether a name is a spoof.** Mixed script is a strong signal, not a verdict. Plenty of legitimate names in multilingual regions mix scripts, and a pure Cyrillic name is entirely normal in Cyrillic-script countries. Report what the characters are and let the reader judge.
- **It cannot detect single-script confusables.** `rn` looking like `m`, `l` looking like `1`, and `paypaI.com` with a capital i are all pure ASCII and no script check catches them. Full confusable detection needs the Unicode confusables data and a different approach, and we do not do it at launch.
- **It cannot tell you whether the name is registered.** Link to Domain Availability Checker.
- **It cannot tell you how a browser will display the name.** Browsers apply their own IDN display policies, which differ between Chrome, Firefox, and Safari and change over time. A name we show in Unicode may render as punycode in the address bar, or the reverse.
- **It cannot check email addresses.** Internationalized email is a related but separate specification.
- **It does not convert the path or query of a URL.** Only the hostname uses punycode; the rest uses percent encoding, which is a different thing. Say so when a URL is entered.

## What the page must tell the reader

- That nothing is sent anywhere. The conversion runs in the browser. This is worth stating plainly because it is unusual and it is genuinely reassuring for someone checking a suspicious link.
- That mixed script is a signal to look closer, not proof of an attack.
- That the tool does not catch lookalikes made from a single script.
- That browsers display IDNs by their own rules, so what a browser shows may differ from what is shown here.
- Which Unicode version the mapping and script data came from, and whether bidi and contextual rules are implemented.

## Content flow

1. Title and a paragraph on what punycode is and why a domain name has two forms.
2. The converter, working in both directions.
3. The result with the per-label and per-character breakdown.
4. One divider.
5. Why the two forms exist: DNS carries a limited ASCII set, so `xn--` encoding was defined to carry everything else. Keep this short and concrete with one worked example.
6. Homograph attacks explained with a real example, and what to check when a link looks wrong.
7. The length limits and why converted names get longer, with an example that exceeds 63 octets.
8. Links to Domain Availability Checker and DNS Lookup.
