# Interface contract: Punycode and IDN Converter

Status: ready
Tool: Punycode and IDN Converter
Route: `/punycode-converter`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A technical reader inspecting an internationalized or suspicious domain or URL before copying it, looking it up, or deciding whether its characters deserve closer attention.
- Question: What are the Unicode and ASCII forms of this hostname, and what do its labels and characters show about validity, length, and mixed writing systems?
- Lead answer: One converted-forms region containing the distinct Unicode and ASCII domain or URL values, with one value when both forms are visibly identical.
- Next decision: The reader can copy the needed form, inspect a mixed or invalid label, or send the valid ASCII hostname to registration and DNS lookup tools.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name or absolute URL | What should stack127 inspect and convert? | User input | input | One field can detect Unicode, an A-label, plain ASCII, or an absolute URL without a direction switch. | Do not add separate encode and decode fields or a conversion-direction control. |
| Convert action | When should stack127 load the pinned Unicode data and calculate the result? | User submission | input | The current tool uses one deliberate browser-only action and does not need network requests while typing. | Do not auto-run on each keystroke or add another primary action. |
| Input kind | Should the result contain a hostname or a complete URL? | Derived by parsing an absolute URL with a hostname | supporting | A URL result must preserve its non-host parts while converting only its hostname. | Use the kind to label outputs. Do not add a visible mode selector. |
| Unicode and ASCII forms | What readable form and DNS form describe this exact input? | `convertName` plus preserved URL parts when present | lead | The reader came for the pair, and neither form outranks the other when they differ. | Keep both values in one region. If the rendered strings match, show one value and one copy action. |
| Unicode copy action | How can I copy the readable form? | Distinct Unicode result | input | Copying is the next action for many readers. | Render only when the Unicode value differs from the ASCII value. Do not add per-label copy actions. |
| ASCII copy action | How can I copy the DNS form? | ASCII result | input | The ASCII form is what DNS tools and many technical systems accept. | Render once. When both forms match, label the single action `Copy domain` or `Copy URL`. |
| Parsed URL scheme, credentials, port, path, query, and fragment | Which parts of a complete URL should remain unchanged? | Parsed original URL | supporting | Punycode applies to the hostname, not the rest of the URL. | Preserve these parts in both lead values. Do not show them again as key/value rows. |
| Unicode hostname | Which readable hostname should downstream explanation use? | `convertName().unicode` | supporting | Label and character analysis should use the mapped Unicode hostname rather than the full URL. | Show it inside the lead URL or domain value and label table, not as another result heading. |
| ASCII hostname | Which exact hostname does DNS carry? | `convertName().ascii` | supporting | Length checks and downstream lookup links require the A-label form. | Show it inside the lead URL or domain value and label table, not as a separate metadata value. |
| Label conversion state | Which labels use Punycode and which stay unchanged? | `LabelResult.converted` plus visible form comparison | supporting | A name commonly mixes one converted label with unchanged ASCII labels. | State `Converted` or `Unchanged` once per label row. Do not add conversion badges above the table. |
| Per-label Unicode and ASCII forms | How did each hostname label change? | `LabelResult.unicode` and `LabelResult.ascii` | supporting | Breaking the hostname at dots shows exactly where expansion occurred. | Use one label table. Repetition of the full forms is allowed only because the rows expose label boundaries. |
| Per-label scripts | Which writing systems occur inside this label? | `analyzeScripts(label.unicode).scripts` | supporting | Exact scripts support the mixed-script assessment without guessing intent. | List each script once in its label row. The assessment names only mixed labels. |
| Mixed-script assessment | Does any individual label use more than one non-neutral script? | `ScriptAnalysis.mixed` for each label | supporting | Mixed scripts inside one label deserve attention, but they do not prove spoofing. | Render one sentence for the whole result. Do not add a state pill or repeat one warning per character. |
| Latin mixed with another script | Does a mixed label use the common Latin-plus-other-script pattern? | `ScriptAnalysis.latinMixedWithOther` | supporting | It helps point to characters that can imitate familiar Latin names. | Use it to sharpen the assessment and character annotation. Do not call the domain malicious or a homograph verdict. |
| Character glyph | Which exact character appears at this position? | `describeCharacters` over every character in a non-ASCII label | evidence | The visible glyph lets the reader compare similar-looking characters directly. | Show it once per character row. Do not omit ASCII characters that occur inside the inspected non-ASCII label. |
| Code point | What Unicode scalar value identifies this character? | `CharacterDetail.codePoint` | evidence | The code point distinguishes lookalike glyphs without interpretation. | Show one code point per character row. Do not repeat it in the mixed-script sentence. |
| Unicode character name | What is the formal Unicode name for this code point? | Pinned Unicode character-name data generated from the same Unicode version as the mapping and script tables | evidence | The brief requires a named character, and a script label is not a character name. | Add a distinct `Unicode name` column. Do not reuse the current `CharacterDetail.name` value when it only repeats the script. |
| Character script | Which script property does Unicode assign to this character? | `scriptOf` and the pinned script table | evidence | It proves which glyph created a mixed label. | Show it once per character row. Add `Differs from Latin in this label` only to the relevant non-Latin row. |
| Per-label ASCII length | Does this A-label fit the 63-byte DNS label limit? | `octetLength(LabelResult.ascii)` and `MAX_LABEL_OCTETS` | supporting | Punycode expansion can make a readable label too long for DNS. | Show the exact count once in the label table. Do not add one progress bar per label. |
| Whole ASCII hostname length | Does the encoded hostname fit the 253-byte DNS name limit? | `octetLength(NameResult.ascii)` and `MAX_NAME_OCTETS` | supporting | The total limit is different from each label limit. | Show one plain value above the label table. Do not repeat it in the problems list unless it exceeds the limit. |
| Mechanical and UTS-46 problems | Can this result be used as a valid DNS hostname? | `NameResult.problems` and `LABEL_PROBLEM_TEXT` | supporting | Empty labels, bad hyphens, malformed A-labels, disallowed characters, and length failures must stay visible. | Show one plain problem list. Do not wrap each message in a finding card or repeat the same problem beside every table. |
| Successful conversion status | Did a valid name convert without detected problems? | Empty `NameResult.problems` | omit | A successful pair already answers the task, and this tool does not implement every IDNA validity rule. | Do not add a green `Valid`, `Safe`, or `Single script` banner. |
| Unicode data version and processing mode | Which pinned rules produced this result? | `UNICODE_VERSION`, UTS-46 non-transitional mapping, and STD3 ASCII rules | evidence | Versioning makes the conversion auditable and explains future differences. | Show one quiet metadata row after the evidence tables. Do not repeat the version in headings or every row. |
| Bidi and contextual-rule scope | Which IDNA checks are absent? | Current engine capability | evidence | The engine does not implement bidi, CONTEXTJ, or CONTEXTO validation, so the interface must not imply full IDNA2008 conformance. | State the omission once beside the Unicode version. Do not turn it into a large warning panel. |
| Browser-only privacy | Does the entered domain or suspicious URL leave this device? | Client-only implementation with dynamic local imports and no API route | evidence | A reader inspecting a suspicious link should know that the value is not sent to stack127. | Show one short field description before conversion. Do not repeat it in result metadata. |
| Registration lookup link | What registration facts exist for this valid domain? | ASCII hostname from a problem-free result | supporting | It continues the task without pretending conversion checks registration. | One ordinary link after results. Do not add registrar, price, or purchase data here. |
| DNS lookup link | What DNS records exist for this valid domain? | ASCII hostname from a problem-free result | supporting | It lets the reader investigate the converted hostname. | One ordinary link after results. Do not add DNS records to this converter. |
| Availability result | Can this domain be registered? | Not produced by the engine | omit | Encoding and registration are different questions. | Do not add availability language or a purchase action. The supporting page may link to the availability checker. |
| Browser display prediction | Will a browser show the Unicode or ASCII form in its address bar? | Browser-specific policies, not produced by the engine | omit | Display policy varies by browser and changes over time. | Do not label either lead form `What your browser shows`. Keep the limitation in page content. |
| Single-script confusable verdict | Does a same-script or ASCII lookalike imitate another name? | No confusables dataset or comparison target | omit | Script detection cannot catch `rn` versus `m`, `l` versus `1`, or same-script lookalikes. | The assessment must not say `Looks safe` when no label mixes scripts. |

For a complete URL, the converter changes only the hostname. Both lead values keep the original scheme, credentials when present, port, path, query, and fragment. Punycode does not transform those parts. A URL parser may apply required percent encoding, but the interface must not suggest that path or query text was translated. Label, length, script, validation, character, and downstream lookup work always use the hostname alone.

The character-name requirement needs the formal Unicode name, such as `CYRILLIC SMALL LETTER A`, from pinned Unicode character-name data. The current `CharacterDetail.name` returns a script label and cannot fill that column. The generated name data must use the same displayed Unicode version as UTS-46 and script data so one table never mixes standards releases.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name or URL | required | yes | Empty on the clean route; no query-string prefill | visible | `ToolTextField` with text input, URL input mode, no capitalization, no autocomplete, and no spellcheck | It accepts either conversion direction and lets an absolute URL keep its non-host parts. The persistent label is `Domain name or URL *`. | Full width first. Its field description and error stay directly below it. |
| 2 | Convert domain | primary action | not applicable | No default; the user submits the form | visible | Primary `ToolButton` submit | It loads the pinned local data on first use and runs the deterministic conversion. | Full width below the field. Keep its width stable while loading. |
| 3 | Copy Unicode form | secondary action | no | Available when the Unicode and ASCII output strings differ | result | `ToolCopyAction` labeled `Copy Unicode` | It copies the readable form only after the clipboard or fallback succeeds. | Stays beside its output when space permits and moves below that value on narrow screens. |
| 4 | Copy ASCII form | secondary action | no | Available for every result | result | `ToolCopyAction` labeled `Copy ASCII`, or `Copy domain` and `Copy URL` when both forms match | It copies the form technical systems use without becoming another conversion action. | Stays beside its output when space permits and moves below that value on narrow screens. |
| 5 | Open registration lookup | secondary navigation | no | Present only for a problem-free hostname | result | Ordinary text link to `/domain-lookup?name=<ASCII hostname>` | It continues from encoding to registration facts. | Wraps below result evidence with the DNS lookup link. |
| 6 | Open DNS lookup | secondary navigation | no | Present only for a problem-free hostname | result | Ordinary text link to `/dns-lookup?name=<ASCII hostname>` | It continues from encoding to live DNS records. | Wraps below result evidence with the registration link. |

The field description reads `Conversion runs in this browser. Nothing is sent to stack127.` Enter submits. An empty value shows `Enter a domain name or URL.` below the field and focuses it. An email-shaped value shows `Enter a domain name or URL, not an email address.` An input containing a slash without an absolute URL scheme shows `Include the scheme, such as https://, when entering a full URL.` An absolute URL without a hostname or one that cannot be parsed shows `That URL does not contain a readable hostname.` These input errors do not load the Unicode data or produce a partial result.

Malformed Punycode, empty labels, invalid hyphens, disallowed characters, and DNS length failures are conversion findings, not field parsing errors. They produce the deterministic forms and evidence that can be calculated, then keep every problem visible. Related lookup links are omitted until the hostname has no problems.

Opening `/punycode-converter` leaves the address unchanged through server render and hydration. Typing, submitting, copying, and following a result state do not serialize the input or output into the current URL. There is no Share action because the two explicit copy actions already preserve the deterministic result.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Converted forms | What are the readable and DNS forms of this exact domain or URL? | Distinct reconstructed Unicode and ASCII strings | One page-owned `output` region labeled `Converted forms`, containing a semantic two-row `dl` with code values and `ToolCopyAction`. If both formatted values match, collapse them to one row labeled `Domain` or `URL` and state `Unicode and ASCII are identical.` | Do not use `ToolPrimaryResult`, a prose `X is Y` sentence, duplicate identical rows, direction tabs, or state pills. Preserve every non-host URL part in both values. |
| 2 | Validation findings | Which mechanical or UTS-46 rules did this hostname fail? | Deduplicated `problemText` values in engine order | One plain list introduced by `This hostname cannot be used as-is:` | Omit when no problems exist. Do not add a green valid message, separate finding cards, or repeat exact label and name byte counts here unless they exceed a limit. |
| 3 | Script assessment | Does any label mix writing systems, and how should I interpret that? | Labels with `scripts.mixed`, their exact scripts, and `latinMixedWithOther` | One `ToolResultLead` sentence. For mixed labels, name each affected label and its scripts, then say the result warrants inspection but does not prove spoofing. Otherwise say `No label mixes writing systems. This does not clear same-script or ASCII lookalikes.` | Judge scripts within each label, not across labels. Do not say the whole name is single-script, safe, malicious, or a confirmed homograph. |
| 4 | Whole-name length | Does the encoded hostname fit the DNS name limit? | ASCII hostname byte count and 253-byte maximum | One plain fact above the label table: `ASCII hostname length: 18 of 253 bytes.` Use danger text only when the value exceeds 253. | Do not add a progress bar, gauge, or a second value in metadata. URL path, query, and fragment bytes do not count. |
| 5 | Label breakdown | Which labels changed, which scripts do they contain, and do their encoded forms fit DNS? | Ordered `labels`, per-label scripts, conversion state, and ASCII byte count | One `ToolDataTable` with columns `Label`, `Unicode`, `ASCII for DNS`, `Scripts`, and `ASCII length`. Use `Label 1`, `Label 2`, and so on as row headers. | Keep one row per hostname label in source order. Do not split converted and unchanged labels into separate sections or use one card per label. |
| 6 | Character evidence | Which characters make up each non-ASCII label? | Every character in labels whose Unicode form contains non-ASCII, with position, glyph, code point, formal Unicode name, and script | One `ToolDataTable` with columns `Label and position`, `Character`, `Code point`, `Unicode name`, and `Script`. | Omit when every Unicode label is ASCII. Include ASCII characters that sit inside an inspected non-ASCII label. Do not call the table `Every character that is not plain ASCII`. |
| 7 | Processing metadata | Which Unicode data and IDNA checks produced this result? | `UNICODE_VERSION`, UTS-46 non-transitional processing, STD3 mode, and absent bidi and contextual validation | One quiet page-owned `dl` after both tables | Show each fact once. Do not claim full IDNA2008 conformance or repeat browser privacy here. |
| 8 | Related checks | Where can I inspect registration and DNS facts for this valid hostname? | ASCII hostname when `problems` is empty | One plain sentence with ordinary registration and DNS lookup links | Omit for an invalid result. Do not use buttons or add availability, price, or browser display claims. |
| 9 | Local loading or failure | Is the pinned browser data still loading, or did the conversion fail unexpectedly? | Dynamic import and conversion state | One `ToolStatus` below the primary action | Show only during loading or unexpected failure. Do not leave a stale prior result visible. |

Inside the label table, `Unicode` and `ASCII for DNS` show exact code text. `Converted` appears beneath the ASCII value only when the two forms differ. Otherwise the row says `Unchanged`. `Scripts` lists non-neutral scripts, or `No script characters` for a label made only from digits and hyphens. `ASCII length` uses `14 of 63 bytes`; it uses danger text above 63 and ordinary text at or below the limit. A long but valid label does not get a warning color based on an arbitrary near-limit threshold.

Inside the character table, `Label 1, character 1` identifies position without repeating the complete label on every row. The table includes formal names such as `CYRILLIC SMALL LETTER A`, not a second `Cyrillic` value. For a Latin-plus-other-script label, the non-Latin script cell appends `Differs from Latin in this label`. Color may support this text but cannot replace it.

Read without this document, the result says: `münchen.de has the Unicode form münchen.de and the ASCII form xn--mnchen-3ya.de.` The script sentence says that no label mixes scripts without clearing other lookalikes. The name-length fact and label table show where Punycode changed the hostname and whether it fits DNS. The character table proves each non-ASCII glyph with its code point, formal name, and script. Metadata identifies Unicode 16.0.0 and the checks the engine does not perform.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Paired output group | Equal Unicode and ASCII representations of one domain or URL | Not applicable. Labels, code typography, and document order show two forms without implying magnitude. | Use one adaptive output region. Collapse visibly identical forms to one row. |
| Label table | Repeated hostname labels with the same Unicode, ASCII, script, and length fields | Yes. Columns align the exact before-and-after form and limit evidence for every label. | Use `ToolDataTable`. Its viewport owns horizontal overflow. |
| Character table | Repeated character positions with the same glyph, code point, name, and script fields | Yes. One row ties each visible glyph to exact Unicode evidence. | Use `ToolDataTable`. Its viewport owns horizontal overflow. |
| Length progress bars | Each label against 63 bytes and the whole name against 253 bytes | Yes, both denominators are real, but many bars would make near-limit values look risky and slow exact comparison. | Omit. Use exact counts in one fact and one table column. |
| Conversion expansion chart | Unicode character count compared with ASCII byte count | No. Characters and bytes use different units, so bar length would imply a false direct comparison. | Omit. Show the two forms and exact ASCII byte limits. |
| Script composition chart | Share of characters assigned to each script | Yes, but character proportions do not measure spoofing risk and would duplicate the character table. | Omit. Name mixed scripts and show exact character evidence. |
| State pills or safety score | Validity, conversion, or spoofing confidence | No. The engine returns rule failures and script facts, not a calibrated safety measure. | Omit. Use plain findings and an assessment that stops short of a verdict. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean route | Empty field, visible browser-only description, enabled `Convert domain` | Absent | All result regions absent | No instructional or empty-state panel | Normal document focus. Nothing announces on load. The URL stays `/punycode-converter`. |
| Invalid empty input | Preserve blank or whitespace value | Absent | Absent | Show `Enter a domain name or URL.` once below the field | Focus the field and associate the error programmatically. |
| Invalid email or scheme-less path | Preserve the exact value | Absent | Absent | Show the specific email or missing-scheme message below the field | Focus the field. Do not load conversion data or add a second alert. |
| Invalid absolute URL | Preserve the exact value | Absent | Absent | Show `That URL does not contain a readable hostname.` below the field | Focus the field and keep the primary action available. |
| First conversion loading | Keep the field visible and disable duplicate submission. Label the stable-width button `Converting...` | Absent | Absent | A polite status says `Loading Unicode data and converting...` | Keep focus on the initiating button. Announce the loading state once. |
| Later conversion loading | Preserve the edited input and clear every previous result before work starts | Absent | Absent | Unexpected failure uses the same form-level recovery path | Keep focus stable. Never leave old forms beside new input. |
| Successful distinct conversion | Re-enable input and submit | Show one Unicode row and one ASCII row with separate copy actions | Show script assessment, whole-name length, label table, character table when applicable, metadata, and related checks | No valid or safe banner | Announce the converted-forms region once. Do not assertively announce every supporting row. |
| Successful unchanged ASCII | Re-enable input and submit | Show one `Domain` or `URL` value and `Unicode and ASCII are identical.` with one copy action | Show the no-mixed-script limit, length, label table, metadata, and related checks. Omit character table. | No empty conversion message and no duplicate output value | Announce the single result once. |
| URL conversion | Re-enable input and submit | Show two complete URLs when their hostnames differ, or one when identical | Analyze and link only the hostname. Preserve protocol, credentials, port, path, query, and fragment in lead values. | State nowhere that Punycode converted the path or query | Announce the complete converted forms. Long URLs wrap or scroll inside their output owner. |
| Mixed-script label | Re-enable input and submit | Converted forms remain the lead | Assessment names each mixed label and exact scripts. Character evidence identifies every glyph and marks the differing script in Latin-mixed labels. | State that mixed scripts warrant inspection but do not prove spoofing | Announce the assessment as a warning once after the forms. Do not label the domain malicious. |
| No mixed-script label | Re-enable input and submit | Converted forms remain the lead | Assessment says no individual label mixes scripts and immediately names the same-script and ASCII limitation | No green safety state | Announce the completed forms, not a claim of safety. |
| Malformed Punycode or disallowed character | Re-enable input and submit | Show the deterministic form or partial form the engine can produce | Show one validation list, label evidence, character evidence when applicable, and processing metadata | Omit registration and DNS links. Keep copy actions because the exact inspected string may still be needed for analysis. | Announce the validation findings as a warning after the forms. |
| Label or hostname over DNS limit | Re-enable input and submit | Show the converted forms | Validation list states the exceeded rule. The whole-name fact or label table shows the exact count in danger text. | Omit downstream lookup links. Do not truncate the value. | Announce the validation finding once. Long code values remain selectable. |
| Empty or no-data conversion | Not applicable after a nonempty parsed hostname. Every hostname yields at least one label result or a validation finding. | Absent | Absent | Treat a missing outcome as an unexpected local failure, not a successful empty state | Announce the failure once and keep the input. |
| Unexpected local failure | Preserve the exact input and re-enable submit | Absent | Clear stale output, tables, metadata, and links | Show `The browser could not convert this name. Try again.` once below the action | Announce with alert semantics. Keep focus in the form flow. |
| Copy success | Input and conversion stay unchanged | Unchanged | Only the activated action changes to `Unicode copied`, `ASCII copied`, `Domain copied`, or `URL copied` after verified success | Return the label after the short confirmation | Announce through the action label. Do not add a page-level success alert. |
| Copy failure | Input and conversion stay unchanged and the code value remains selectable | Unchanged | The activated action changes to `Copy failed` only after clipboard and fallback both fail | The reader can select and copy the visible value manually | Announce through the action label. Do not clear the result. |
| Edited input after a result | Clear forms, findings, assessment, tables, metadata, and links as soon as the value changes | Absent | Absent until the next submission | Keep the new value and local field error only | No result-removal announcement. The next submission follows normal loading behavior. |
| Long value and increased text size | Field, action, and copy controls remain operable | Code values wrap or scroll inside the forms region without truncation | Tables keep complete labels, URLs, formal names, problems, and metadata reachable | Inner table viewports may scroll. The page must not scroll horizontally. | Focus rings remain visible. Magnified text does not cover values or actions. |
| Expanded state | Not applicable. The converter has no disclosure, collapsed evidence, or hidden recovery state. | Unchanged | All required evidence stays visible after conversion | No expansion recovery is needed | No expansion announcement or focus rule is needed. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One bidirectional input | `ToolTextField` | It keeps the visible required label, browser-only description, field error, and focus target together. | Separate Unicode and ASCII fields, `ToolTextArea`, and a direction selector, because one hostname or URL determines the direction. |
| One local conversion action | Primary `ToolButton` submit | It names the result, supports lazy-loading state, and remains the retry action after local failure. | Auto-conversion while typing, reset, and a second primary action. |
| Loading and unexpected failure | `ToolStatus` | It announces one form-level state without creating a result before conversion completes. | Spinner-only feedback and repeated errors in the result area. |
| Equal converted forms | Page-owned semantic `output` containing a `dl` | The two forms are peers, each needs a stable label, selectable code, and its own action, and identical values can collapse cleanly. | `ToolPrimaryResult`, two cards, two `ToolCodeOutput` panels, tabs, and a prose `X is Y` sentence, because each overstates one form or wastes space. |
| Copy each distinct form | `ToolCopyAction` | It reports success only after the clipboard or fallback succeeds and leaves the value selectable on failure. | Custom unchecked clipboard code, icon-only buttons, and per-label copy actions. |
| Script conclusion | `ToolResultLead` with page-owned semantic text tone | One sentence can name affected labels and scripts while keeping the no-verdict limit attached. | State pills, a risk score, alert card, or green safe banner. |
| Repeated label facts | `ToolDataTable` | Labels repeat one stable form, script, and length schema and must stay in source order. | Per-label cards or prose paragraphs, because they make comparison slower. |
| Repeated character evidence | `ToolDataTable` | Characters repeat exact position, glyph, code point, name, and script fields. | Inline character chips, a confusable heatmap, or prose, because exact code point comparison matters more than decoration. |
| Processing scope | Page-owned semantic `dl` | A few quiet version and rule facts need labels without competing with the forms. | Metric cards, a large caveat panel, and raw Unicode data. |
| Related checks | Ordinary text links | Registration and DNS are separate tasks and navigation is the correct interaction. | Buttons, automatic requests, availability results, and registrar links. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. Input and primary action come first. Results stack as converted forms, validation findings when present, script assessment, whole-name length, label table, character table when present, processing metadata, and related links. Each form row aligns label, code value, and copy action. | `https://xn--e1afmkfd.xn--p1ai:8443/a/very/long/path?continue=https%3A%2F%2Fexample.com#account`, a 63-byte A-label, and `CYRILLIC SMALL LETTER A` | No page overflow. Each code value owns safe wrapping or an inner scroll. Each table viewport owns horizontal overflow. |
| Narrow mobile, 320px to 640px | Keep field, full-width action, forms, findings, assessment, name length, label table, character table, metadata, and links in the same order. In each form row, put the copy action below the code value at full or content width. | A 253-byte hostname, `xn--mgbai9azgqp6j.xn--ygbi2ammx`, and a long percent-encoded URL query | Code values wrap anywhere when safe. Table viewports alone may scroll horizontally. No output action widens the page. |
| Character table with many rows | Keep source label and character positions in order. Repeat column headers only through native table behavior, not floating cards. | A 63-character Unicode label whose encoded form remains within the DNS limit | The character table viewport owns horizontal overflow. The page scrolls vertically in normal flow. |
| Increased text size or long localization | Put every copy action below its form value before the row becomes cramped. Keep table actions and metadata in document order. | `No label mixes writing systems. This does not clear same-script or ASCII lookalikes.` at 200 percent text size | Text wraps inside its owner. Tables scroll inside their viewports. No button, code value, or focus ring is covered. |

## Interface wireframes

### Desktop result

```text
Domain name or URL *
[münchen.de                                                         ]
Conversion runs in this browser. Nothing is sent to stack127.

[Convert domain]

------------------------------------------------------------------------

Converted forms

Unicode            münchen.de                              [Copy Unicode]
ASCII for DNS      xn--mnchen-3ya.de                       [Copy ASCII]

No label mixes writing systems. This does not clear same-script or
ASCII lookalikes.

ASCII hostname length: 18 of 253 bytes

Label    Unicode     ASCII for DNS      Scripts   ASCII length
Label 1  münchen     xn--mnchen-3ya     Latin     14 of 63 bytes
                   Converted
Label 2  de          de                 Latin      2 of 63 bytes
                   Unchanged

Characters in non-ASCII labels
Label and position     Character  Code point  Unicode name                  Script
Label 1, character 1   m          U+006D      LATIN SMALL LETTER M          Latin
Label 1, character 2   ü          U+00FC      LATIN SMALL LETTER U WITH...  Latin
Label 1, character 3   n          U+006E      LATIN SMALL LETTER N          Latin
...

Unicode data       16.0.0
Processing         UTS-46 non-transitional, STD3 ASCII rules
Not checked        Bidi, CONTEXTJ, and CONTEXTO rules

Open registration lookup or DNS lookup for xn--mnchen-3ya.de.
```

For `example.com`, the lead collapses to one row:

```text
Converted form

Domain             example.com                              [Copy domain]
Unicode and ASCII are identical.
```

### Narrow mobile result

```text
Domain name or URL *
[аpple.com                       ]
Conversion runs in this browser.
Nothing is sent to stack127.

[         Convert domain        ]

----------------------------------

Converted forms

Unicode
аpple.com
[Copy Unicode]

ASCII for DNS
xn--pple-43d.com
[Copy ASCII]

The label аpple mixes Cyrillic and
Latin. Inspect its characters. This
does not prove spoofing.

ASCII hostname length: 16 of 253 bytes

Label breakdown                 -> contained table scroll
Label | Unicode | ASCII | Scripts | ASCII length

Character evidence              -> contained table scroll
Position | Character | Code point | Unicode name | Script

Unicode data
16.0.0
Processing
UTS-46 non-transitional, STD3 ASCII rules
Not checked
Bidi, CONTEXTJ, and CONTEXTO rules

Open registration lookup
Open DNS lookup
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain name or URL *
[münchen.de or https://xn--mnchen-3ya.de/path]
Conversion runs in this browser. Nothing is sent to stack127.
[         Convert domain        ]

EMPTY INPUT
Domain name or URL *               <- focus
[                                  ]
Enter a domain name or URL.

SCHEME-LESS PATH
[example.com/path                  ]
Include the scheme, such as https://, when entering a full URL.

LOADING
[          Converting...          ]  disabled, busy
Loading Unicode data and converting...
No prior result remains visible.

COMPLETE URL
Unicode URL
https://münchen.de/path?q=one#part
ASCII URL
https://xn--mnchen-3ya.de/path?q=one#part
Only the hostname differs.

MIXED SCRIPT
The label аpple mixes Cyrillic and Latin. Inspect its characters.
This is a warning sign, not proof of spoofing.
Label 1, character 1 | а | U+0430 | CYRILLIC SMALL LETTER A | Cyrillic
                                                Differs from Latin in this label

MALFORMED OR PARTIAL
Converted form
xn--!!!.com
This hostname cannot be used as-is:
- This is not valid Punycode, so it cannot be decoded.
Related registration and DNS links are absent.

OVER LIMIT
ASCII hostname length: 68 of 253 bytes
Label 1 | 64 of 63 bytes
The complete value remains visible and selectable.

EMPTY OR NO DATA
Not applicable. A missing outcome is an unexpected local failure.

UNEXPECTED FAILURE
The browser could not convert this name. Try again.
[         Convert domain         ]  enabled retry

COPY FAILURE
xn--mnchen-3ya.de                 [Copy failed]
The code value remains selectable.

EXPANDED
Not applicable. No result or recovery is hidden in a disclosure.
```

## Removed or rejected

- Replace the existing `Unicode is ASCII` sentence with one labeled forms region. Two values deserve equal labels, and identical values should not appear twice.
- Remove the existing status pill and `Converted, single script`, `Plain ASCII`, `Mixes writing systems`, and `Not a valid domain name` badge copy. Plain conclusions and exact findings are harder to misread as a safety verdict.
- Remove green styling from a successful conversion. This engine does not check confusables, browser display policy, bidi rules, or contextual rules.
- Replace `Nothing about this name mixes writing systems` with `No label mixes writing systems.` Different labels may legitimately use different scripts, and the check operates within each label.
- Detect and report every label whose `ScriptAnalysis.mixed` value is true. Do not limit the assessment to Latin mixed with another script.
- Add the copy actions required by the brief. Do not add copy actions to every label or character row.
- Preserve a complete URL in both lead forms. Do not discard its scheme, port, path, query, or fragment after extracting the hostname.
- Add the whole ASCII hostname length against 253 bytes. The current per-label values do not cover the name limit.
- Rename the character section to `Characters in non-ASCII labels`. The current table includes ASCII characters whenever their label also contains non-ASCII.
- Add formal Unicode character names from pinned data. Do not label a repeated script value as the character name.
- Replace one boxed finding per validation problem with one plain list. The messages have the same scope and do not need competing containers.
- Remove the arbitrary warning treatment above 50 bytes. A label is valid through 63 bytes and invalid above 63.
- Do not add a conversion-direction switch, encode and decode tabs, per-label cards, safety score, confusable score, script chart, expansion chart, progress bars, or raw Unicode data disclosure.
- Do not add availability, registration, DNS, price, browser-display, email, or trademark results inside the converter.
- Do not leave a previous result visible after the input changes or a new conversion starts.
- Do not serialize input or output into the clean route during hydration or interaction.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A completed conversion renders exactly one `Converted forms` output region. Distinct Unicode and ASCII strings appear as two labeled rows, while identical formatted strings collapse to one labeled row and one copy action. | Browser fixtures for Unicode, A-label, uppercase ASCII, and plain ASCII input |
| UI-002 | deduplication | The interface has no `Unicode is ASCII` prose duplicate, repeated identical lead values, result pill, per-label copy actions, duplicate Unicode version, or repeated privacy message. | Browser text-count and DOM assertions |
| UI-003 | visual-truth | Results use one forms group and repeated-record label and character tables. They contain no progress bar, timeline, score, gauge, allocation, script chart, expansion chart, or per-item card grid. | DOM role assertions and Browser inspection |
| UI-004 | responsive | At 320px and 200 percent text size, the order remains input, action, forms, findings, script assessment, total length, label table, character table, metadata, and links. The document has no horizontal overflow, and each table owns its column overflow. | Browser measurements in dark and light themes |
| UI-005 | url | Opening `/punycode-converter` leaves the URL unchanged through hydration. Typing, converting, copying, errors, and completed results do not rewrite it. | Browser URL and history assertions |
| UI-006 | input | Empty, email-shaped, scheme-less path, malformed absolute URL, and missing-host URL values show one precise field error, focus the input, preserve its value, and produce no result. | Browser keyboard and validation tests |
| UI-007 | local operation | The workbench states once that conversion runs in the browser and sends nothing to stack127. Conversion makes no API or navigation request. | Browser network interception and copy assertion |
| UI-008 | loading | First use keeps the input visible, clears stale results, prevents duplicate submission, retains button width, and announces `Loading Unicode data and converting...`. | Browser delayed-module fixture and live-region assertion |
| UI-009 | conversion | `münchen.de` and `xn--mnchen-3ya.de` both produce Unicode `münchen.de` and ASCII `xn--mnchen-3ya.de`. `日本.jp` converts to `xn--wgv71a.jp`. | Browser fixtures traced to engine tests |
| UI-010 | URL handling | A complete URL converts only its hostname. Scheme, credentials, port, path, query, and fragment remain present in both lead values, and downstream links receive only the ASCII hostname. | Browser URL fixtures with ports, queries, fragments, Unicode paths, and credentials |
| UI-011 | copy | Each distinct form has one labeled copy action. Identical forms have one action. Success appears only after verified clipboard or fallback success, and failure leaves the visible code selectable. | Browser clipboard success and failure fixtures |
| UI-012 | script assessment | Every label with more than one non-neutral script is named with its exact scripts. A clean result says only that no individual label mixes scripts and names the same-script and ASCII limitation. | Browser Latin-Cyrillic, Greek-Cyrillic, single-script, and cross-label fixtures |
| UI-013 | no verdict | No result uses `Safe`, `Malicious`, `Spoof`, `Homograph detected`, or another attack verdict. Mixed-script copy says to inspect the characters and states that the signal is not proof. | Forbidden-text assertions over mixed and unmixed fixtures |
| UI-014 | validation | Empty labels, long labels, long hostnames, bad hyphens, malformed Punycode, disallowed characters, and leading combining marks render one deduplicated problem list and omit downstream lookup links. | Browser fixtures traced to every `LabelProblem` value |
| UI-015 | limits | The interface shows the ASCII hostname byte count against 253 once and each A-label byte count against 63 once. Values at 63 remain ordinary; values above 63 or 253 use danger text and remain untruncated. | Browser boundary fixtures at 62, 63, 64, 252, 253, and 254 bytes |
| UI-016 | label table | The label table preserves source order and shows one row per label with ordinal, Unicode form, ASCII form, conversion state, scripts, and exact ASCII byte length. | Browser fixtures with converted, unchanged, empty, and multi-script labels |
| UI-017 | character evidence | Every character in a non-ASCII label appears with position, glyph, code point, formal Unicode name, and script. ASCII characters inside that label remain present, while an all-ASCII hostname omits the table. | Browser fixtures for `münchen`, `аpple`, combining marks, and an ASCII hostname |
| UI-018 | Unicode consistency | Character names, scripts, UTS-46 mapping, and the displayed Unicode version come from one pinned Unicode release. The metadata states non-transitional UTS-46, STD3 rules, and absent bidi, CONTEXTJ, and CONTEXTO validation. | Dataset version assertion and Browser metadata check |
| UI-019 | related checks | A problem-free result links the ASCII hostname to Domain Registration Lookup and DNS Lookup. A result with any problem has neither link and never displays registration, availability, DNS, price, or purchase data. | Browser link and forbidden-content assertions |
| UI-020 | failure | An unexpected local import or conversion failure clears stale output, preserves the input, shows one alert, and leaves `Convert domain` available for retry. | Browser rejected-import fixture and alert-count assertion |
| UI-021 | accessibility | The required label and privacy description are programmatic and visible, errors are associated and focused, loading and completed forms are announced once, tables retain headers, copy actions have distinct names, and every action works by keyboard with visible focus. | Browser accessibility-tree, keyboard, live-region, and theme checks |

## Open questions and blockers

- None. The brief requires complete-URL preservation, formal character names, both DNS length limits, and mixed-script evidence without a verdict. The pinned Unicode release already supplies the version boundary. Formal names must come from the matching Unicode character-name data rather than the current script-label field.
