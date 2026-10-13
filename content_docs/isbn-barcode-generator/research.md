# Research: ISBN and Barcode Toolkit

Route: `/isbn-barcode-generator` | Checked: 2026-10-13 | Competitors used: 6

## Who uses it

Most people are self-publishers about to upload a paperback or hardcover to KDP or IngramSpark. They have an ISBN, or a free KDP one, and a list price. They rarely know the barcode rules. Many use Canva, Affinity, or InDesign and need a barcode file for the back cover. Some don't need a file at all, because KDP and IngramSpark add a barcode when none is supplied.

The second group checks an ISBN they already have. They want to know if it's valid, or they need the ISBN-10 form for an older system. The third group is designers and small publishers who set price codes and print files for several editions.

These groups are inferred from the KDP and IngramSpark help pages, competitor FAQs, and vendor guides. No source gives share data.

| Group | Rough share | What they already know | Their questions, in their words |
| --- | --- | --- | --- |
| Self-publishers preparing a paperback or hardcover cover | Most (qualitative) | Their ISBN and list price. Often not the barcode rules. | "Do I need my own barcode for KDP?" Also: what barcode size KDP expects, and why KDP advises leaving the barcode area blank. |
| Self-publishers checking an ISBN | Some (qualitative) | An ISBN from a book record, sometimes an older ISBN-10 | "Does this KDP Barcode Generator support ISBN-10?" and whether an ISBN is valid. |
| Designers and small publishers setting print files and price codes | Few (qualitative) | Print formats, list prices, and printer rules | No verbatim question found. Topics seen: the five-digit price add-on, 90000, and the $99.99 limit. |

- **First few seconds:** a yes or no on the ISBN, and a barcode file that won't break a printer's or KDP's rules.
- **Inputs most people can give offhand:** the ISBN (ISBN-13 in most records, ISBN-10 in older ones) and the list price. The price code needs one choice: a US dollar price or no price. Printer size and file type usually need a lookup in the printer's help pages.
- **What pros need that most people would skip:** the exact five-digit price rules, the "ISBN" line above the bars, the quiet zone, 100% black on white, vector output, and print resolution for raster files.

## Published comparison data

None. A check digit or a barcode has one correct answer, so no published range applies. I did not use Bowker's or any retailer's price data, because I could not reach Bowker's own price page.

## Scope

What the tool should cover (proposed):

- Check an ISBN-10 or ISBN-13. Dashes and spaces are optional. Name the rule that failed.
- Convert ISBN-10 to ISBN-13. Convert back only for 978 numbers. Say why a 979 number has no ISBN-10.
- Make an EAN-13 barcode for an ISBN-13, with the word "ISBN" and the number above the bars.
- Add an optional five-digit price add-on (EAN-5): US dollars from $0.01 to $99.98, or 90000 for no price.
- Download the barcode for a print cover, and show its printed size in inches.

What it should leave out (proposed):

- Buying or registering ISBNs, and checking whether an ISBN is already taken. No public database was checked.
- Hyphenation. Two competitors claim it. It needs ISBN International's range data (see Blockers).
- Other currencies, UPC, QR, 2D, ISMN, and ISSN barcodes. The ISBN manual says the five-digit add-on is used in the US and Canada.
- Proof that the barcode scans, and any KDP or IngramSpark acceptance.
- Cover design, and where the barcode sits on the full wrap.

Adjacent tools: `kdp-pdf-preflight-checker` says it can't check the barcode area. `kdp-metadata-checker` deferred ISBNs from its first version. Neither overlaps. The feasibility review keeps this idea (`stack127_docs/tool-roadmap-feasibility-review-2026-09-24.md`, row 61).

Searches: I ran 16 searches. Two reddit searches were blocked, because reddit.com isn't reachable for search here. One IngramSpark search returned no results. One forum search returned only vendor blogs. Domains that kept showing up: bookcoverslab.com, isbnbarcode.org, prolificpress.com, barcode-maker.com, 8gwifi.org, bushe.co, ebookpbook.com, chapter.pub, coverlabpro.com, bisg.org, isbn-international.org, kdp.amazon.com, ingramspark.com, and bowker.com. Keyword volume is unknown.

## Search intent

| Query | What the searcher wants | Answer they need | What current results miss |
| --- | --- | --- | --- |
| ISBN-10 to ISBN-13 converter | One number in, the other form out | The converted ISBN, with a valid or invalid flag. ISBN-10 only for 978 numbers. | bushe.co shows a converted ISBN-10 even when the ISBN-13 is invalid (observed). Few explain why a 979 number can't convert. |
| ISBN check digit validator, "is my ISBN valid" | Yes or no, and the reason | Which check failed, and what to do next | isbnbarcode.org says only "Invalid ISBN" (observed). |
| ISBN barcode generator | A barcode file for a cover | EAN-13 with the "ISBN" line above, a correct quiet zone, and a print-ready file | isbnbarcode.org's SVG has digits only and no "ISBN" line (observed). Few show the printed size in inches. |
| KDP barcode generator, KDP barcode size | Whether they need one, and the size | KDP adds one automatically if none is supplied. The size and clear area. | Bookcoverslab answers the size in FAQ text. Vendor guides disagree on size (see Where competitors disagree). |
| Five-digit price barcode, EAN-5 | A correct price code | The currency digit, the cents, 90000 for no price, and the $99.99 limit | isbnbarcode.org previews 90000 as "NACS New" and 59999 as "$100+" (observed). |
| IngramSpark barcode | Its required clear area | A 1.75 by 1 in white box, 100% black | No tested barcode tool showed IngramSpark's rules. Bookcoverslab links to an IngramSpark cover creator only. |

No "People also ask" wording was found. The search tool didn't show the panel, so none of the questions above is verified as PAA wording.

## User problems

| Problem people repeat | Evidence link | What it means for the tool |
| --- | --- | --- |
| Covers are rejected when artwork or text sits in the barcode area | [KDP Barcodes](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW) says covers with images or text in the barcode location are rejected. [CoverLab Pro](https://coverlabpro.com/blog/kdp-cover-rejected-common-fixes) repeats it, but it's a sales page. | Show the clear area in inches. Say that KDP adds a barcode when none is supplied. |
| Do I need my own barcode? | [Bookcoverslab FAQ](https://bookcoverslab.com/tools/kdp-barcode-generator) asks "Do I need my own barcode for KDP?" [A self-publishing guide](https://help.selfpublishing.com/do-i-need-a-barcode-for-my-cover) uses the same question. | Answer first: KDP adds one when none is supplied. Say when a file helps, such as a designer, a PDF the author builds, or a printer that needs one. |
| ISBN-10 or ISBN-13? Will my old number work? | Bookcoverslab FAQ asks "Does this KDP Barcode Generator support ISBN-10?" isbnbarcode.org rejects ISBN-10 input (observed). | Accept both, and show a clear conversion. |
| What do the five digits mean? | [ebookpbook, EAN-5 add-on book barcode](https://www.ebookpbook.com/2026/06/15/ean-5-add-on-book-barcode/) (search result only, vendor blog). isbnbarcode.org states a $99.99 maximum on its price page. | Explain the code in plain words, and make 90000 the clear "no price" choice. |

I found no forum or community threads. The forum search returned vendor blogs only. The rows above come from KDP and IngramSpark help, competitor FAQs, and vendor guides. Treat vendor guides as signals, not as proof of how common a problem is.

## Facts to get right

| Fact | Primary source | How the tool should treat it |
| --- | --- | --- |
| ISBN-13 check digit: the first 12 digits are weighted 1 and 3 in turn. Check digit is 10 minus (sum mod 10), with 0 when the remainder is 0. Example: 978-0-11-000222-4 sums to 56, check digit 4. | [ISBN Users' Manual, Appendix A1.1](https://www.isbn-international.org/sites/default/files/ISBN%20Manual%202012%20-corr.pdf), read 2026-10-13 | Implement exactly. Use the manual's example as a test. |
| ISBN-10 check digit: mod 11, with weights 10 to 2 on the first nine digits. A check value of 10 is written as X. Example: 0306406152 sums to 132, which is 12 times 11, so it's valid. 080442957X sums to 199, so its check digit is X. | ISBN.org FAQ, text from the search summary only (direct fetch returned 403). Arithmetic checked here. ISO 2108 not accessed. | Implement. Confirm the wording against ISO 2108 or the ISBN.org FAQ before release. |
| ISBN-10 to ISBN-13: add 978, keep the first nine digits, and recalculate the check digit. | Not on the ISBN International pages I could read. Matches bushe.co (observed) and the MathWorld example (secondary). | Implement. Mark the primary text as pending. |
| A 979 number has no ISBN-10 form. Converting one causes duplicate ISBNs and order errors. | [ISBN International, changes to US prefixes](https://www.isbn-international.org/content/changes-united-states-isbn-prefixes), page submitted 2019-11-29 | Say "no ISBN-10 form" for 979 numbers. Don't convert them. |
| 979-0 numbers are ISMN music codes, not ISBNs. | [ISBN Users' Manual](https://www.isbn-international.org/sites/default/files/ISBN%20Manual%202012%20-corr.pdf), ISMN section ("prefix 979-0") | Flag 979-0 as an ISMN, not an ISBN. isbnbarcode.org says "Error formatting ISBN" (observed). bushe.co calls it valid, which only checks the digits. |
| ISBN-13 is required for all new ISBNs since 1 January 2007. | [ISBN International, What is an ISBN?](https://www.isbn-international.org/content/what-isbn/10) | Treat ISBN-10 as legacy input, and convert it. |
| Each product form needs its own ISBN. The ISBN International page names paperback, EPUB, and PDF. | Same page | The barcode is for print formats. [KDP](https://kdp.amazon.com/en_US/help/topic/GTJ8LBXL6Z4WV5QX) says an eBook doesn't need an ISBN there. |
| The ISBN goes in human-readable form above the bars, preceded by "ISBN". BISG asks for 9 point or larger. | [ISBN Users' Manual, section 8.2](https://www.isbn-international.org/sites/default/files/ISBN%20Manual%202012%20-corr.pdf); [BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry) | Put the "ISBN" line above the bars. Competitor SVGs don't have it (observed). |
| Price add-on: the first digit 5 means US dollars. 50001 to 59998 covers $0.01 to $99.98. 59999 ($99.99) cannot be encoded. The add-on is optional. | [BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry); [ISBN Users' Manual, section 8.3](https://www.isbn-international.org/sites/default/files/ISBN%20Manual%202012%20-corr.pdf) for the US and Canada | Accept 50001 to 59998. Refuse other values with a reason. |
| Special add-on codes: 90000 means no price ("ignore for pricing"). 99990 is for used books, 99991 for desk copies, and 00000 must not be used. Manual section 8.3 reserves 90000 to 98999 for publisher use. | [BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry); manual section 8.3 | Use 90000 as the "no price" default. Refuse 00000. Don't offer the NACS codes. |
| Currency digits 6 (Canadian dollars) and 0 (pounds) appear in competitor previews. | Not in the primary sources I read. Observed on isbnbarcode.org only. | Unknown. Decide before release whether to support them. |
| KDP: the price code should match the list price, if one is included. IngramSpark: up to two price extensions, and 90000 when no price is set. | [KDP Barcodes](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW); [IngramSpark User Guide](https://www.ingramspark.com/hubfs/downloads/user-guide.pdf) | Remind users to match the list price. Default to 90000. |
| Barcode size at 100%: the BISG symbol is 1 inch high by 2-3/16 inches wide, including the optional add-on. Allowed range is 80% to 200%. Cover 2 needs at least 90%. At 80%, the symbol is about 1-3/4 by 13/16 inches. | [BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry) | Generate at 100% and show the printed size. Warn below 80%. |
| KDP's barcode box: suggested 2 by 1.2 inches (50.8 by 30.5 mm), minimum 1.4 by 0.8 inches. Keep at least 0.25 inches from the spine and trim. Hardcover: at least 0.76 inches from the bottom edge. | [KDP Barcodes](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW); [KDP Create a Hardcover Cover](https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6) | Use these as the zone for placement checks. KDP's minimum width (1.4 inches) is below BISG's 80% width (1.75 inches). That may mean the symbol without the add-on. Inferred, not confirmed. |
| IngramSpark: a clear area of 1.75 by 1 inch, or 1.25 by 1 inch for a generic barcode. The barcode is 100% black on a white box. A template barcode may be moved, not resized. IngramSpark may replace an unscannable barcode without notice. | [IngramSpark File Creation Guide](https://www.ingramspark.com/hubfs/downloads/file-creation-guide.pdf); [IngramSpark User Guide](https://www.ingramspark.com/hubfs/downloads/user-guide.pdf) | Show the 1.75 by 1 inch area for IngramSpark. Tell users the printer may replace a bad barcode. |
| Quiet zone: 3/32 inch on each side of the bars. A ">" marker sits inside the right quiet zone. No printed border around the barcode. | [BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry) | Keep at least 3/32 inch of white on each side in every export. |
| Colours: BISG allows black or dark blue bars on a white, yellow, or red background. KDP requires 100% black on a solid white background. IngramSpark requires 100% black on a white box. | BISG; [KDP Barcodes](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW); IngramSpark File Creation Guide | Use 100% black on white only. This is the strictest rule. |
| Resolution: KDP prefers vector art. Raster art should be 300 PPI. IngramSpark's quick reference gives 600 ppi for 1-bit black and white line art. | [KDP Barcodes](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW); IngramSpark File Creation Guide | Ship vector. Offer a 600 ppi raster. Applying the 600 ppi rule to a barcode is inferred. |
| KDP takes a cover as one PDF with the back, spine, and front. A supplied barcode must be inside that PDF, or KDP adds its own. | [KDP Create a Paperback Cover](https://kdp.amazon.com/help?topicId=G201953020) | Treat the export as an asset for the author's PDF, not a separate KDP upload. |
| Free ISBNs: the KDP free ISBN covers paperback and hardcover only, works only with KDP, and isn't available to low-content books. An IngramSpark free ISBN can't be used on other platforms. KDP-owned or KDP-exclusive ISBNs can't be transferred to IngramSpark. | [KDP Get an ISBN](https://kdp.amazon.com/en_US/help/topic/GTJ8LBXL6Z4WV5QX); IngramSpark User Guide | Explain this in the help text. The IngramSpark rule covers transfers only. Whether a KDP ISBN may appear on an IngramSpark barcode is unknown. |
| 978 and 979 are both used. 979-8 is for the US and its territories. The page is dated 2019 and says "from early 2020", so its current status is not verified. | [ISBN International, US prefixes](https://www.isbn-international.org/content/changes-united-states-isbn-prefixes) | Accept any 978 or 979 ISBN-13. Don't use the prefix to infer the country. |
| EAN-5 check digit and parity patterns, and EAN-13 module widths. | GS1 General Specifications returned 403. The GS1 reference page is 12 MB, and the copy I downloaded had no EAN text. | Unknown. Blocker. Don't implement the parity table until it's checked against GS1 or a verified test set. |
| Scan testing. | No barcode decoder is installed on this homelab (zbarimg is missing). | Unknown. Blocker for tests. |

## Competitor reviews

Each tool ran in headless Chrome with the same inputs: 9780306406157 (valid), 978-0-306-40615-7 (hyphenated), 0306406152 (ISBN-10), 080442957X (ISBN-10 with X), 9780306406158 (bad check digit), 9791032305690 (valid 979-10), and 9790000000001 (979-0). Price inputs were 51995, 90000, 50000, 00000, 59999, 5199, and 61995. Each tool got the inputs it accepted.

### 1. ISBNBarcode.org ISBN and price barcode generators

URL: [isbnbarcode.org](https://isbnbarcode.org/) and [price barcode page](https://isbnbarcode.org/price-barcode)

- [Observed] The ISBN page asks for a 13-digit ISBN. It offers PNG, JPG, PDF, and SVG downloads. ISBN-10 input (0306406152) gets "Invalid ISBN. Please enter a valid 13-digit ISBN starting with 978 or 979."
- [Observed] Valid 9780306406157 gave a preview and downloads. A bad check digit (9780306406158) gets the same generic message. 9790000000001 gets "Error formatting ISBN. Please check the ISBN and try again." The valid 979-10 number 9791032305690 showed no error text.
- [Observed] The downloaded SVG is 224 by 138 px, with 31 rectangles for the bars. The digits are monospace text, not outlines. There is no "ISBN" line above the bars. The PNG is 1166 by 654 px, RGBA.
- [Observed] Price page: 51995 previews as "$19.95". 61995 previews as "C$19.95". 00000 previews as "£0.00". 5199 gets "Invalid price code. Please enter exactly 5 digits". 90000 previews as "NACS New". 50000 previews as "NACS Trade". 59999 previews as "$100+", while the same page says "Maximum price: $99.99 (9999 cents)".
- [Documented] The page says it creates ISBN barcodes "with correct automatic hyphenation".
- [Inferred] A user with an ISBN-10 hits a dead end. The NACS labels would confuse someone who expects a "no price" code.
- [Unknown] Whether the barcodes scan. No decoder is installed here, so I did not test that.

```text
9780306406157 -> preview, PNG/JPG/PDF/SVG
0306406152 -> Invalid ISBN (no conversion)
51995 -> $19.95; 90000 -> NACS New; 59999 -> $100+
```

### 2. Bookcoverslab KDP Barcode Generator

URL: [bookcoverslab.com/tools/kdp-barcode-generator](https://bookcoverslab.com/tools/kdp-barcode-generator)

- [Observed] One field: "Paste your ISBN-13 or ISBN-10". Paperback and hardcover buttons. Output is a preview image.
- [Observed] ISBN-10 0306406152 shows a barcode preview. Bad check digit 9780306406158 shows no preview and no error text.
- [Documented] The FAQ says the download is SVG, so it scales cleanly in Canva, Affinity, and Adobe tools. The feature list names "ISBN-10 to ISBN-13 conversion" and "KDP barcode box and clearance rules".
- [Documented] FAQ questions include "Do I need my own barcode for KDP?", "Does this KDP Barcode Generator support ISBN-10?", and "What format does this tool export?". Other FAQs ask about the barcode size KDP expects and why Amazon advises leaving the barcode area blank.
- [Inferred] A user who gets no preview gets no reason. The FAQ explains size in words, not in a check.
- [Unknown] The SVG's size, and whether its digits are outlined. I did not download the file.

```text
0306406152 -> barcode preview
9780306406158 -> no preview, no message
```

### 3. Prolific Press Free ISBN Barcode Generator

URL: [prolificpress.com/barcode-creator](https://prolificpress.com/barcode-creator/)

- [Observed] Field: "ISBN number". Note: "With or without the dashes. Leave them out and we place them exactly where your ISBN agency would." Button: "Show my free barcode". A price field has the placeholder "01895".
- [Observed] The page's comparison table lists a scannable ISBN and EAN-13 barcode in both tiers. "PNG at 600 dpi, JPG at 300 dpi" and "Vector EPS + PDF" are listed in the premium column.
- [Observed] The free output didn't render in my run, so I did not check it.
- [Documented] The premium tier costs $10, shown on the button "Pay $10 with PayPal".
- [Inferred] Anyone who needs a vector file for print pays $10 for it.
- [Unknown] The free output's format and quality. What the price field does.

```text
9780306406157 -> Show my free barcode -> not captured
```

### 4. bushe.co ISBN Validator & Converter

URL: [bushe.co/tools/isbn-validator](https://bushe.co/tools/isbn-validator/)

- [Observed] One field for ISBN-10 or ISBN-13. The result updates as you type.
- [Observed] 0306406152: "ISBN-10 ... valid" and "As ISBN-13: 9780306406157". 9780306406157: valid, "As ISBN-10: 0306406152". 080442957X: valid, "As ISBN-13: 9780804429573".
- [Observed] 9780306406158: "NOT valid", but it still shows "As ISBN-10: 0306406152". 9791032305690 (979-10): valid, with no ISBN-10 line. 9790000000001 (979-0): valid, with no range note.
- [Documented] The page says it validates ISBN-10 or ISBN-13 and converts between the two.
- [Inferred] A converted number shown for an invalid ISBN can make a typo look usable.
- [Unknown] Whether it explains the failed check, or the ISMN range.

```text
0306406152 -> valid, 9780306406157
9780306406158 -> NOT valid, still shows 0306406152
9791032305690 -> valid, no ISBN-10
```

### 5. 8gwifi ISBN Validator & Barcode Generator

URL: [8gwifi.org/isbn-validator.jsp](https://8gwifi.org/isbn-validator.jsp)

- [Observed] One field: "Enter ISBN-10 or ISBN-13 (dashes are optional)". Actions: Validate ISBN, Convert Format, and Calculate Check Digit. Sample ISBNs include "979 Prefix" and an "X Check Digit" example.
- [Observed] The results didn't appear in the page sections I read, so I could not compare its messages. I did not get a barcode from it in this run.
- [Inferred] The site is a general utility site with many unrelated tools. Some users may treat it as a developer tool, not a print tool.
- [Unknown] Its validation messages, conversion output, and barcode output.

```text
0306406152 -> Validate ISBN -> result not captured
```

### 6. Barcode-Maker.com EAN-5 Generator

URL: [barcode-maker.com/Ean5](https://barcode-maker.com/Ean5)

- [Observed] A general barcode tool with a long format list, including EAN-13, EAN-5, ISBN, ISMN, ISSN, and QR. For EAN-5 you paste values one per line and click "Create sequence". 51995 made barcode images at 165 by 48 px.
- [Documented] The page offers label printing and a show-text toggle.
- [Inferred] It runs no ISBN checks and shows no price labels. Users must already know the rules.
- [Unknown] Whether the EAN-5 encoding is correct. I did not decode the image.

```text
51995 -> EAN-5 image, 165 by 48 px
```

### Official tools

None found. Bowker's pages describe ISBN rules and link to barcode suppliers. ISBN International publishes the rules. I found no free official generator or converter.

## Comparison

| Feature or answer | ISBNBarcode.org | Bookcoverslab | Prolific Press | bushe.co | 8gwifi | Barcode-Maker | What stack127 should do |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Accepts ISBN-10 | No | Yes | Not tested | Yes | Yes | No ISBN logic | Accept both |
| Shows conversion | No | Yes (stated) | Not tested | Yes | Convert action, not captured | No | Convert only valid input |
| Message for bad check digit | "Invalid ISBN" (generic) | No message | Not tested | "NOT valid" | Not captured | None | Name the failed check |
| 979-0 (ISMN) | "Error formatting ISBN" | Not tested | Not tested | "valid" (digits only) | "979 Prefix" sample | None | Flag as ISMN |
| Valid 979-10 number | No error shown | Not tested | Not tested | Valid, no ISBN-10 | Not captured | None | Accept, no ISBN-10 |
| "ISBN" line above bars | No (SVG has digits only) | Not seen | Not seen | n/a | n/a | n/a | Include it |
| Price add-on | Yes. Labels include $, C$, and £. 90000 shows "NACS New". | No | Price field (placeholder 01895) | No | No | Yes (EAN-5 only) | Accept 50001 to 59998 and 90000 |
| Price above $99.99 | Previews 59999 as "$100+" | n/a | n/a | n/a | n/a | n/a | Refuse with the reason |
| Downloads | PNG, JPG, PDF, SVG | SVG | Premium: EPS, PDF, 600 dpi PNG | None seen | None seen | Images | Vector first, plus a 600 ppi PNG |
| Size guidance in inches | Not seen | KDP size in FAQ text | Not seen | No | No | No | Show the KDP, IngramSpark, and BISG sizes |
| Hyphenation | Claimed | Not tested | Claimed | None | Dashes optional | None | Defer. Needs range data. |

## Where competitors disagree

1. **Barcode size.** BISG gives a symbol 1 inch high by 2-3/16 inches wide at 100%, including the optional add-on. KDP suggests a 2 by 1.2 inch box, with a 1.4 by 0.8 inch minimum. IngramSpark asks for a 1.75 by 1 inch white area. The vendor guide at chapter.pub says about 2 by 1.2 inches at full scale. These numbers measure different things. Use BISG for the symbol size, and the KDP and IngramSpark areas for placement checks. chapter.pub's table also lists 1.0 inch high where its text says 1.2 inches, so I did not use that table.
2. **Background colour.** BISG allows white, yellow, or red. KDP and IngramSpark require white. Use white only.
3. **Top price.** ISBNBarcode.org states a $99.99 maximum but previews 59999 as "$100+". BISG says $99.99 cannot be encoded. Use BISG.
4. **The 90000 label.** BISG says 90000 means no price, to be ignored for pricing. ISBNBarcode.org previews it as "NACS New". Use BISG.
5. **Currency digits.** The manual says the add-on is used in the US and Canada. ISBNBarcode.org uses 6 for Canadian dollars and 0 for pounds. I did not confirm either digit in a primary source.
6. **Conversion of invalid input.** bushe.co shows an ISBN-10 for an invalid ISBN-13. A conversion from an invalid number has no meaning. Show conversions only for valid input.
7. **Hyphenation.** Two competitors claim automatic hyphenation. I did not check the claim against ISBN International's range data.
8. **The "ISBN" line.** The manual and BISG require "ISBN" above the bars. ISBNBarcode.org's SVG has none.

## How stack127 can win

- Start with the decision. KDP adds a barcode when none is supplied, and IngramSpark does too. Say when a file helps: a designer, a PDF the author builds, or a printer that needs one.
- Name the rule that failed. Competitors say "Invalid" or nothing. Explain the check that failed, what 979-0 means, and why a 979 number has no ISBN-10.
- Never show a converted ISBN for invalid input. Never show an ISBN-10 for a 979 number.
- Spell out the price code. The first digit 5 means US dollars. 50001 to 59998 covers $0.01 to $99.98. 90000 means no price. $99.99 cannot be encoded. Competitors show "$100+" and NACS labels.
- Show the three sizes side by side: the BISG symbol, the KDP zone, and the IngramSpark area. Show the printed size in inches for each export.
- Make the file print-ready: vector output with outlined digits, the "ISBN" line above the bars, 100% black on white, and at least 3/32 inch of white on each side. Offer a 600 ppi PNG.
- Be honest about scanning. The tool can't prove a barcode scans. Say to print a proof and scan it before ordering. IngramSpark says it may replace an unscannable barcode without notice. KDP says it replaces a barcode that doesn't meet its specifications.
- Don't put the vector file behind a paywall. Prolific charges $10 for it.

## Blockers

1. **EAN-5 check weights and parity table.** Not verified. The GS1 General Specifications PDF returned 403. The GS1 reference page is 12 MB, and the copy I downloaded had no EAN text. Needs the GS1 section or a licensed copy, plus test vectors, before anyone codes the add-on.
2. **GS1 quiet zone and module widths.** I have only BISG's 3/32 inch figure. Needs GS1, or a printed proof checked by a scanner.
3. **ISBN-10 check rule, primary text.** ISBN.org returned 403, and the Bowker FAQ refused the connection. ISO 2108 is a paid standard. Needs a retry, or the ISO text, before release.
4. **Hyphenation.** Needs ISBN International's range data, a maintained dataset. Needs approval before it's included.
5. **Scan tests.** No barcode decoder is installed here (zbarimg is missing). Adding one to the tests needs approval.
6. **IngramSpark barcode file formats.** Not stated in the primary guides. The 600 ppi rule is for line art, and applying it here is inferred.
7. **KDP barcode file formats.** KDP prefers vector and asks for 300 PPI raster. It gives no list of accepted formats.
8. **Currency digits 0 and 6.** Not confirmed in primary sources.

No other blockers. No paid APIs are needed.

## Sources

- [BISG, Barcoding Guidelines for the U.S. Book Industry](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry), checked 2026-10-13. The page says it was last updated in August 2025.
- [ISBN International, The ISBN Users' Manual (2012, corrected)](https://www.isbn-international.org/sites/default/files/ISBN%20Manual%202012%20-corr.pdf), checked 2026-10-13.
- [ISBN International, What is an ISBN?](https://www.isbn-international.org/content/what-isbn/10), checked 2026-10-13.
- [ISBN International, Changes to United States ISBN prefixes](https://www.isbn-international.org/content/changes-united-states-isbn-prefixes), checked 2026-10-13. The page was submitted 2019-11-29.
- [KDP, Barcodes](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW), checked 2026-10-13.
- [KDP, Get an ISBN](https://kdp.amazon.com/en_US/help/topic/GTJ8LBXL6Z4WV5QX), checked 2026-10-13.
- [KDP, Create a Paperback Cover](https://kdp.amazon.com/help?topicId=G201953020), checked 2026-10-13.
- [KDP, Create a Hardcover Cover](https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6), checked 2026-10-13.
- [IngramSpark, File Creation Guide (PDF)](https://www.ingramspark.com/hubfs/downloads/file-creation-guide.pdf), checked 2026-10-13. The file is dated 2026-08-24.
- [IngramSpark, User Guide (PDF)](https://www.ingramspark.com/hubfs/downloads/user-guide.pdf), checked 2026-10-13. The file is dated 2026-09-15.
- [ISBNBarcode.org](https://isbnbarcode.org/) and [price barcode page](https://isbnbarcode.org/price-barcode), observed 2026-10-13.
- [Bookcoverslab KDP Barcode Generator](https://bookcoverslab.com/tools/kdp-barcode-generator), observed 2026-10-13.
- [Prolific Press Free ISBN Barcode Generator](https://prolificpress.com/barcode-creator/), observed 2026-10-13.
- [bushe.co ISBN Validator & Converter](https://bushe.co/tools/isbn-validator/), observed 2026-10-13.
- [8gwifi ISBN Validator & Barcode Generator](https://8gwifi.org/isbn-validator.jsp), observed 2026-10-13. Partial: results not captured.
- [Barcode-Maker EAN-5 Generator](https://barcode-maker.com/Ean5), observed 2026-10-13. Partial: image not decoded.
- [ISBN.org FAQ](https://www.isbn.org/faqs_general_questions). Search summary only. The direct fetch returned 403.
- [Bowker ISBN FAQ](https://commerce.bowker.com/standards/home/isbn/us/isbnqa.asp). The fetch refused the connection, so I did not use it.
- [GS1 General Specifications](https://www.gs1.org/docs/barcodes/GS1_General_Specifications.pdf). The fetch returned 403, so I did not use it.
- [Chapter.pub, barcode on book cover placement](https://blog.chapter.pub/barcode-on-book-cover-placement/). Vendor guide, used only in Where competitors disagree.
- [ebookpbook, EAN-5 add-on book barcode](https://www.ebookpbook.com/2026/06/15/ean-5-add-on-book-barcode/). Search result only, vendor blog.
- [CoverLab Pro, KDP cover rejected](https://coverlabpro.com/blog/kdp-cover-rejected-common-fixes). Search result only, sales page.
- [Self-publishing guide, do I need a barcode for my cover](https://help.selfpublishing.com/do-i-need-a-barcode-for-my-cover). Search result only.
- [MathWorld, ISBN](https://mathworld.wolfram.com/ISBN.html). Search summary only. Secondary cross-check for the ISBN-13 check digit.
- [Lightning Source, cover barcode and price extension](https://help.lightningsource.com/hc/en-us/articles/5293920968589-Cover-Barcode-Price-Extension). The page returned 404, so I did not use it.
