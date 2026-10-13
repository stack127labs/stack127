# ISBN and Barcode Toolkit

Route: `/isbn-barcode-generator`

Research: [research.md](research.md)

## People and questions

- Most users are: self-publishers about to upload a paperback or hardcover to KDP or IngramSpark, often building the cover themselves in Canva, Affinity, or InDesign. They come with: their ISBN, copied from Bowker, another ISBN agency, or KDP, and their list price. They don't know the barcode rules.
- Their top questions:
  1. "Can I get a barcode for my ISBN that I can put on my back cover?"
  2. "Is my ISBN valid?" and "Does this work with my ISBN-10?"
  3. "What size should it be for KDP?"
- Basic answers them with: the ISBN, and the list price. The price is optional. Empty prints 90000, the code for no price, which is what IngramSpark uses by default and what most authors want when prices may change.
- Advanced (`Add-on and size`) holds:
  - **Price add-on**, `Include` or `Leave off`, for publishers selling outside the US and Canada, where the five-digit code isn't used, and for anyone whose printer doesn't want it. Default `Include`.
  - **Size**, 80% to 200%, for designers and small publishers who need a set magnification for an offset printer or a fixed cover layout. Empty uses the largest size from 80% to 100% that fits KDP's suggested 2 × 1.2 in box, so a KDP author never has to work it out.
- Always on, with no input, because every user needs them and no one we serve is better off without them: the "ISBN" line above the bars, 100% black on a white box, quiet zones on both sides, outlined digits, and all three files (SVG, PDF, and a 600 ppi PNG).
- Left out:
  - **Hyphenating an ISBN typed without dashes.** That needs ISBN International's range data, a maintained dataset this version doesn't carry. If the person types dashes, the printed line keeps them. Without dashes, the line prints the 13 digits as they are, which scanners and printers accept.
  - **Prices in other currencies, $100 and above, and special codes** such as 99990 for used books. The add-on supports US dollars ($0.01 to $99.98, codes 50001 to 59998) and 90000 for no price. The other currency digits aren't in any primary source the research could read, and a wrong currency on a cover is worse than none.
  - **Working out a check digit from 12 or 9 digits.** An ISBN agency assigns the whole number. A computed check digit doesn't make a number yours, and it hides typos.
  - **Checking if an ISBN is registered or taken.** There is no public database to check against.
  - **Bar height truncation and bar width reduction.** Print-on-demand printers need neither, and both make a barcode harder to scan. An offset printer that needs bar width reduction applies it in prepress.
  - **UPC, QR, ISSN, ISMN, and EPS files.** Other jobs. Every design app that opens EPS opens PDF.
  - **Proof that the barcode scans at the printer, and KDP or IngramSpark acceptance.** No tool can promise that. The page content says to print a proof and scan it.
- Opens with: `978-0-306-40615-7` (a real, valid ISBN used as a standard example in ISBN references) and $14.99, the size empty. The result shows the barcode with price code 51499 at the largest size that fits KDP's box (90% by the width math in Known examples), marked `Example`.
- Published comparison: none. A check digit and a barcode have one right answer. The size check compares against published platform areas, which is a fact about fit, not a grade.
- Domain limits: ISBN-13 must start with 978 or 979, and 979-0 is an ISMN. A 979 number has no ISBN-10. The add-on tops out at $99.98. Size runs from 80% to 200% (BISG). KDP's box is 2 × 1.2 in; IngramSpark's area is 1.75 × 1 in. See States for how each answers.

## Why people will choose this tool

The searcher wants a barcode file they can drop on their back cover without a rejection, and to know their ISBN is right before it's printed on thousands of copies.

Where the top results fail them:

- ISBNBarcode.org rejects ISBN-10, says only "Invalid ISBN" for a typo, and its SVG has no "ISBN" line above the bars.
- Bookcoverslab shows nothing, with no reason, for a bad check digit.
- bushe.co shows a converted ISBN-10 even for an invalid ISBN-13, so a typo looks usable.
- Prolific Press charges $10 for the vector file.
- No tool shows how big the barcode prints, or whether it fits KDP's or IngramSpark's area.
- ISBNBarcode.org labels 90000 "NACS New" and 59999 "$100+", which contradicts BISG.

What this tool does better:

1. ISBN-10 or ISBN-13, with or without dashes or an "ISBN" prefix, and the barcode is always made from the ISBN-13.
2. An invalid ISBN gets the exact rule that failed: wrong length, a price code pasted on the end, a product barcode instead of an ISBN, a music ISMN, or a check digit that doesn't match. It never shows a conversion or a barcode for a number that fails.
3. A 979 number shows no ISBN-10, and the hint says why.
4. Free SVG, PDF, and 600 ppi PNG, each with the "ISBN" line, outlined digits, 100% black on white, and quiet zones. The PDF uses 100% K, and the PNG carries its 600 ppi, so it places at the right size in a design app.
5. The printed size in inches, and a to-scale drawing against KDP's box and IngramSpark's area, with the largest size that fits each.
6. Price codes follow BISG: 90000 means no price, $99.98 is the top, and a price above that answers with 90000 instead of an error.
7. The barcode encoding is proven in the backend test by an independent decoder.

## Product

### Promise and scope

- Primary user: a self-publisher preparing a print cover for KDP or IngramSpark.
- Main job: check an ISBN and make a print-ready EAN-13 book barcode with an optional five-digit price add-on.
- Delivered answer: whether the ISBN is valid, its ISBN-13 and ISBN-10 forms, the barcode, its price code, its size and printed size, how it fits KDP's and IngramSpark's areas, and SVG, PDF, and PNG files.
- Launch scope: ISBN-10 and ISBN-13 input, 978 and 979 numbers, EAN-13 with an EAN-5 add-on in US dollars or 90000, sizes 80% to 200%.
- Exclusions: see Left out above.

### Technical contract

Pure, synchronous TypeScript. It runs in the browser with no network calls and stores nothing. A shared link holds only the inputs.

**ISBN parsing.** In this order, first failure wins:

1. Trim. Remove a leading `ISBN`, `ISBN-10`, `ISBN-13`, or `ISBN:` label, any case, with optional `:` and spaces.
2. Remove spaces and dashes: `-`, U+2010 to U+2015, and U+2212. Remember where the dashes were for the printed line. A lowercase `x` becomes `X`.
3. Empty: `empty`.
4. Any character other than digits and `X`: `characters`.
5. `X` anywhere but the last of exactly 10 characters: `x-position`.
6. 18 digits whose first 13 start with 978 or 979: `includes-add-on`. Any other count than 10 or 13: `length`, with the count.
7. 13 digits not starting with 978 or 979: `prefix`.
8. 13 digits starting with 9790: `ismn`.
9. Check digit wrong: `check-digit`, with the form. Don't return or show the expected digit, because the typo may be elsewhere.

**Check digits.**

- ISBN-13: weights 1 and 3 in turn on the first 12 digits. Check = (10 − sum mod 10) mod 10.
- ISBN-10: weights 10 down to 2 on the first 9 digits. Check = (11 − sum mod 11) mod 11, with 10 written `X`.
- ISBN-10 to ISBN-13: `978` + the first 9 digits + a new ISBN-13 check digit.
- ISBN-13 to ISBN-10: only for 978. Drop `978`, keep the next 9 digits, add an ISBN-10 check digit. 979 gives `null`.

**Printed ISBN line.** `ISBN ` plus the ISBN-13:

- Typed as ISBN-13 with exactly 4 dashes, a 3-digit first part (`978` or `979`) and a 1-character last part: keep the dashes as typed.
- Typed as ISBN-10 with exactly 3 dashes and a 1-character last part: `978-` plus the typed parts, with the new check digit.
- Anything else: the 13 digits with no dashes.

The engine doesn't check whether the typed dash positions are the agency's. The same hyphenated form is used everywhere the ISBN shows in the result.

**Price add-on.**

| Price text | Result |
| --- | --- |
| Empty | `90000`, kind `no-price` |
| Money: optional `$`, digits, up to 2 decimals, such as `14.99`, `14.9`, `14`, `$0.01` | Cents. 1 to 9,998 gives `5` + cents in 4 digits, such as 51499. |
| Money equal to 0 | Error `zero` |
| Money of $99.99 or more | `90000`, kind `no-price`, with `limit: "above-max"`. Not an error. |
| Exactly 5 digits with no `$` or `.`: `50001` to `59998` | That code and its price |
| `90000` | No price |
| `59999` | Same as $99.99: `90000` with `above-max` |
| Any other 5-digit code, such as `00000`, `50000`, `61995`, or `99990` | Error `code` |
| Anything else, such as `abc`, `14.999`, `-5`, or `1,499` | Error `format` |

With add-on `none`, a non-empty price is error `without-add-on`. Empty is fine.

**Size.** Text, optional `%`, whole number. Empty gives `fit-kdp`: the largest whole percent from 80 to 100 whose white box fits KDP's 2 × 1.2 in box, or 80 if none does. Below 80 answers at 80, above 200 answers at 200, each with a `limit`, not an error. Not a whole number: error `format`.

**Symbol geometry.** EAN-13 and EAN-5 encoding follow ISO/IEC 15420, as implemented by widely used open-source encoders. All lengths are millimetres at magnification `m`:

- Module `X` = 0.330 × m.
- EAN-13: 95 modules. Normal bar height 22.85 × m. Guard bars extend 5X below the normal bars.
- Add-on gap 9X (ISO allows 7 to 12), then the 47-module EAN-5.
- Quiet zones: left 11X. Right 7X without the add-on, 5X after the add-on. No quiet zone is ever below 3/32 in (2.38125 mm), from BISG.
- Human-readable digits below the main symbol and above the add-on bars, and a `>` quiet zone mark at the right, laid out as common encoders lay out a book barcode, scaled with `m`.
- The ISBN line above the bars, 9 pt × max(1, m), centered over the bars. If it's wider than the symbol, the white box widens to fit it, keeping at least 2.38125 mm each side.
- All text is filled outlines from an OCR-B font whose license allows embedding and redistribution. Record its source and license at the top of the glyph file. No font files, no `<text>`.
- One white rectangle covers the whole symbol, quiet zones, and text. Bars and text are black. Nothing else is drawn, and there's no border.

**Fit.** For KDP (50.8 × 30.48 mm) and IngramSpark (44.45 × 25.4 mm), compare the white box at 0.001 mm precision: fits when both its width and height are at or below the area's. Also return the largest whole percent from 80 to 200 that fits, or `null`.

**Files.**

- SVG: `width` and `height` in `in` to 4 decimals, `viewBox` in mm. White `#fff` rect, black `#000` paths. No scripts, no external references.
- PDF: one page the size of the white box, in points. Vector paths only. Bars and text in DeviceCMYK 0 0 0 1 (100% K, no rich black), the box in DeviceCMYK 0 0 0 0. No fonts. Compression optional.
- PNG: 600 ppi, 1-bit grayscale, no alpha, white box included. A `pHYs` chunk of 23,622 pixels per metre, so design apps place it at its printed size. Each bar edge rounds to the nearest pixel from its exact position. Glyph outlines fill with the nonzero rule. Any valid zlib stream is fine, including stored blocks.
- File names: `isbn-<13 digits>-<add-on code>.<ext>`, or `isbn-<13 digits>.<ext>` without the add-on.

**Privacy and security.** Nothing leaves the browser. The SVG contains only the engine's own paths, so the frontend can show it as an image.

### Backend contract

Entry file `lib/isbn-barcode-generator/engine.ts`. Sol may split internals, such as encoding, glyphs, and file writers, into sibling files in `lib/isbn-barcode-generator/`. The frontend imports only from `engine.ts`.

```ts
export type IsbnBarcodeField = "isbn" | "price" | "size";

export type IsbnBarcodeInput = Readonly<{
  isbnText: string;
  priceText: string; // "" → 90000
  addOn: string;     // "" | "include" | "none"; unknown → "include"
  sizeText: string;  // "" → fit KDP's box
}>;

export type IsbnErrorCode =
  | "empty" | "characters" | "x-position" | "length" | "includes-add-on"
  | "prefix" | "ismn" | "check-digit";

export type IsbnBarcodeError =
  | Readonly<{ field: "isbn"; code: IsbnErrorCode; digitCount?: number; form?: "isbn10" | "isbn13" }>
  | Readonly<{ field: "price"; code: "format" | "zero" | "code" | "without-add-on" }>
  | Readonly<{ field: "size"; code: "format" }>;

export type IsbnBarcodeResult =
  | Readonly<{ status: "invalid"; errors: readonly IsbnBarcodeError[] }> // every failing field, in field order
  | Readonly<{ status: "ready"; value: IsbnBarcode }>;

export type IsbnBarcode = Readonly<{
  isbn: Readonly<{
    entered: "isbn10" | "isbn13";
    isbn13: string;            // 13 digits
    isbn10: string | null;     // 10 characters; null for 979
    printedIsbn13: string;     // "978-0-306-40615-7" or "9780306406157"
    printedIsbn10: string | null; // the typed ISBN-10 with its dashes, else the 10 characters
    prefix: "978" | "979";
  }>;
  addOn: null | Readonly<{
    code: string;              // "51499" or "90000"
    priceCents: number | null; // null for 90000
    limit: null | "above-max"; // the price was $99.99 or more
  }>;
  size: Readonly<{
    percent: number;           // 80–200, the one used
    mode: "fit-kdp" | "entered";
    limit: null | "below-min" | "above-max";
  }>;
  layout: Readonly<{
    moduleMm: number;
    widthMm: number;           // white box
    heightMm: number;
  }>;
  fit: readonly Readonly<{
    area: "kdp" | "ingramspark";
    widthMm: number;
    heightMm: number;
    fits: boolean;
    largestFitPercent: number | null; // 80–200, or null when 80% doesn't fit
  }>[];                        // always KDP first, then IngramSpark
  svg: string;
  fileBaseName: string;        // without extension
  rulesVersion: string;
}>;

export function makeIsbnBarcode(input: IsbnBarcodeInput): IsbnBarcodeResult;
export function renderIsbnBarcodePdf(barcode: IsbnBarcode): Uint8Array;
export function renderIsbnBarcodePng(barcode: IsbnBarcode): Uint8Array;
```

- All display words, error sentences, and labels live in the frontend. The engine returns codes only.
- `makeIsbnBarcode` builds the SVG every time. The frontend calls the PDF and PNG functions once per result, not on every render.
- A valid ISBN with a price or size error still returns `invalid`, with the price or size error. The ISBN isn't half-shown.
- No timeouts or caching. One call should take well under 100 ms, PNG included.

**Backend test.** `tests/pages/isbn-barcode-generator/isbn-barcode-generator.test.mjs`:

- Every row in Known examples.
- Decode proof: rasterize the generated barcode with the engine's own PNG path, then decode it with an independent decoder, such as `@zxing/library` as a dev-only dependency (approved), for at least the opening example, a 979 number, 90000, 50001, 59998, no add-on, and sizes 80% and 200%. The decoded EAN-13 and the decoded EAN-5 must equal the expected digits. If the chosen decoder can't read EAN-5 add-ons, prove the add-on by comparing its 47-module pattern with a mature encoder, such as `bwip-js` as a dev-only dependency, for at least 20 codes covering every check value 0 to 9.
- The PNG starts with the PNG signature, is 1-bit grayscale, and has a `pHYs` of 23,622 per metre. The PDF starts with `%PDF-` and contains no font. The SVG contains no `<text>` and no `<script>`.

### Known examples

Worked by hand from the rules above.

| Case | Input | Expected |
| --- | --- | --- |
| Opening example | `978-0-306-40615-7`, `14.99`, size empty | Valid, ISBN-10 `0306406152`, printed `978-0-306-40615-7`, add-on `51499`, mode `fit-kdp` |
| Manual example | `9780110002224` | Valid, ISBN-10 `0110002229` |
| ISBN-10 in | `0306406152` | ISBN-13 `9780306406157`, entered `isbn10` |
| ISBN-10 with dashes | `0-306-40615-2` | Printed ISBN-13 `978-0-306-40615-7` |
| X check digit | `080442957x` | ISBN-13 `9780804429573`, printed ISBN-10 `080442957X` |
| Label and spaces | `ISBN: 978 0 306 40615 7` | Valid, printed `9780306406157` (spaces aren't kept as dashes) |
| 979 | `9791032305690` | Valid, `isbn10: null`, prefix `979` |
| Bad ISBN-13 check | `9780306406158` | `check-digit`, form `isbn13` |
| Bad ISBN-10 check | `0306406153` | `check-digit`, form `isbn10` |
| ISMN | `9790000000001` | `ismn` |
| Product barcode | `4006381333931` (valid EAN) | `prefix` |
| Too short | `978030640615` | `length`, 12 |
| Add-on pasted | `9780306406157 51499` | `includes-add-on` |
| X in the middle | `03064X6152` | `x-position` |
| Letters | `978-0-306-4O615-7` (letter O) | `characters` |
| Price empty | | `90000`, `priceCents: null` |
| Lowest price | `0.01` | `50001` |
| Top price | `$99.98` | `59998` |
| One decimal | `14.9` | `51490` |
| Over the top | `99.99`, `150`, `59999` | `90000`, `limit: "above-max"` |
| Typed code | `51995` | `51995`, 1,995 cents |
| Zero | `0` | price `zero` |
| Bad codes | `00000`, `50000`, `61995`, `99990` | price `code` |
| Bad price text | `14.999`, `abc`, `1,499` | price `format` |
| Add-on off, price typed | add-on `none`, `14.99` | price `without-add-on` |
| Add-on off, empty price | add-on `none`, price empty | `addOn: null`, file base `isbn-9780306406157` |
| Size clamps | `70`, `250` | 80 `below-min`, 200 `above-max` |
| Size format | `90.5`, `big` | size `format` |
| Width at 100% with add-on | `100` | Bars and quiet zones: 11X + 151X + 2.38125 = 55.841 mm (2.198 in). Doesn't fit KDP. |
| Width at 90% | `90` | 3.267 + 44.847 + 2.38125 = 50.495 mm (1.988 in), within KDP's 50.8 mm width |
| Width at 91% | `91` | 51.030 mm, wider than KDP's box, so `fit-kdp` can't go above 90% |
| Width at 80% | `80` | 45.149 mm (1.778 in), wider than IngramSpark's 44.45 mm, so IngramSpark `largestFitPercent: null` with the add-on |
| No add-on at 100% | add-on `none`, `100` | Bars and quiet zones 3.63 + 31.35 + 2.38125 = 37.361 mm, before any widening for the ISBN line |

Widths are the bars plus quiet zones. The white box is at least this wide, and wider only if the ISBN line needs it. Heights come from the encoder layout, so the test checks them against the 1.2 in and 1 in areas rather than a hand number.

### Ownership

- Sol builds: `lib/isbn-barcode-generator/` (engine, encoding, OCR-B glyph outlines with license note, SVG, PDF, and PNG writers), the focused test above, the dev-only decoder dependency, and the development preview row.
- Opus builds: `app/(site)/(tools)/isbn-barcode-generator/isbn-barcode-generator.tsx`, `isbn-barcode-generator-from-url.tsx`, the cover-fit drawing, a CSS module only if the shared workbench can't hold the result layout, and later `content/*.mdx`.
- Integration adds: `page.tsx` and `layout.tsx`, content wiring, the `toolSpot` card art, the catalog membership, and the publish manifest.
- Shared change made in planning: `UiDownloadAction` gained `isDisabled` (see Components).

### Catalog placement

- Primary: **KDP tools** (`/kdp-tools`). Its "Which KDP tool do I need?" table needs a new row for this step, such as "Checking your ISBN and making the cover barcode", between sizing the cover and checking the cover PDF.
- Secondary: none. No other catalog serves authors, and IngramSpark users already land on KDP tools for cover work.

Card art (`toolSpot`, key `isbn-barcode-generator`):

- Takeaway: a book's back cover carries a barcode that scanners read.
- Focal subject: a book barcode, tall bars with longer guard bars and the smaller add-on block beside it, inside a white box.
- Supporting relationship: the back corner of a book behind it, so it reads as a cover barcode, not a shop label.
- Tone: neutral and practical. No digits, letters, or price tags.

## Interface

### Flow

- User question: "Give me a correct barcode for my ISBN, and is my ISBN right?"
- Lead answer: the barcode itself, with `Valid ISBN` and the ISBN-13 beside it, and the download buttons right below.
- Opens with: ISBN `978-0-306-40615-7`, list price `14.99`, Advanced empty. The result shows its barcode with 51499 at 90%, marked `Example`.
- Button: `Make barcode`, with a quiet `Reset` beside it.

### Inputs

| Input | Basic or Advanced | Required or optional | Hint, one sentence or none | What it changes in the result |
| --- | --- | --- | --- | --- |
| ISBN | Basic | Required | "ISBN-13 or ISBN-10, with or without dashes." | Everything: validity, both forms, the barcode, the ISBN line |
| List price (suffix `USD`) | Basic | Optional, empty prints 90000 | "Empty prints 90000, the code for no price." | The add-on code and its digits |
| Price add-on (`Include` / `Leave off`) | Advanced | Optional, default `Include` | "The five-digit price code to the right of the bars." | Adds or removes the add-on, the width, the fit, the file name |
| Size (suffix `%`) | Advanced | Optional, empty fits KDP's box | "Empty uses the largest size that fits KDP's 2 × 1.2 in box." | Printed size, fit, all three files |

Advanced is one `UiDisclosure` named `Add-on and size`, with `uiSetSummary`. `Include` counts as not set.

The ISBN field uses `inputMode="text"`, `autoComplete="off"`, and `spellCheck={false}`, since `X` and dashes are allowed. List price uses `inputMode="decimal"`.

### Result

Order: answer row, actions, cover fit.

1. **Answer row.** Two columns, about 3 to 2.
   - Left: the barcode, the engine's SVG shown as an `<img>` from a data URI on its own white tile, scaled to the column width (it reads at about twice its printed size on desktop). Alt text: `Barcode for ISBN 978-0-306-40615-7 with price code 51499`. This is the visual: people check the bars, the ISBN line, and the add-on digits look right before downloading.
   - Right: `UiPrimaryResult`, label `Valid ISBN`, value the printed ISBN-13 in mono, detail `From ISBN-10 0-306-40615-2` only when the person typed an ISBN-10. A `UiStatusWord` only when something could mislead: `Example`, `No price printed` (above $99.98), `Smallest size BISG allows`, or `Largest size BISG allows`. Under it, `UiMetricGroup layout="list"`:
     - `ISBN-10` → `0-306-40615-2`, or `None` with the hint "979 numbers have no ISBN-10 form." Shown only when the person typed an ISBN-13, since the detail already shows a typed ISBN-10.
     - `Price code` → `51499`, unit `$14.99`, or `90000`, unit `No price`. Hidden when the add-on is off.
     - `Size` → `90%`. Hint when `fit-kdp`: "The largest size that fits KDP's box."
     - `Printed size` → `1.99 × 1.12 in`, with mm in the unit, such as `50.5 × 28.4 mm`.
2. **Actions.** `UiActionRow`: `UiDownloadAction` `Download SVG`, `Download PDF`, `Download PNG`, then `UiShareAction` `Copy link`. All downloads have `isDisabled` while the result is stale.
3. **Cover fit.** A small custom SVG, drawn to one scale: KDP's 2 × 1.2 in box and IngramSpark's 1.75 × 1 in area as outlined rectangles sharing the bottom-left corner, and the barcode's white box filled with the first data color on top. Where it spills past an outline, it shows. Beside it, `UiMetricGroup layout="list"`:
   - `KDP box, 2 × 1.2 in` → `Fits`, or `Fits at 90% or smaller`, or `No size fits`.
   - `IngramSpark area, 1.75 × 1 in` → the same wording.
   This answers "what size for KDP?" without reading anything. The status words are facts about fit, never good or bad, and use no red or green.

No sources, advice, KDP rules, or "do I need a barcode?" in the result. Those go in the page content.

### Components

Existing shared components:

- `ToolWorkbench`, `ToolFieldRow`, `ToolResult` from `@/app/ui/tools/tool-workbench`
- `UiTextField`, `UiChoiceGroup`, `UiDisclosure`, `uiSetSummary`, `UiButton`, `UiDownloadAction`, `UiShareAction`, `uiOption` from `@/app/ui/controls`
- `UiPrimaryResult`, `UiStatusWord`, `UiStatus`, `UiMetricGroup`, `UiActionRow` from `@/app/ui/display`
- `useInitialQuery` from `@/app/ui/tools/use-initial-query`

Improved shared component, built in planning:

- `UiDownloadAction` in `app/ui/controls.tsx` now takes `isDisabled`, so a tool can turn downloads off while its result is stale. The Copy and download example in the `/components-ui` Actions and forms section shows it.

Tool-specific components:

- `IsbnBarcodeGenerator`: field state as text, press-to-calculate, stale state, error focus, Advanced open on an Advanced error, PDF and PNG bytes made once per result, and the result.
- `IsbnBarcodeGeneratorFromUrl`: reads `isbn`, `price`, `addon`, `size` with `useInitialQuery()` and renders the tool with `key={query.key}`. An unknown `addon` falls back to `include`.
- `CoverFitDrawing`: the to-scale outline drawing, from `fit` and `layout`. Strokes and fills from site tokens, so it follows the theme.

### Layout

Desktop, inside the 66rem working width:

```
[ ISBN * ________________________ ]   [ List price ________ USD ]
> Add-on and size                                          Not used
    [ Price add-on: Include | Leave off ]   [ Size ____ % ]
[ Make barcode ]  Reset                                 Inputs changed
────────────────────────────────────────────────────────────────────
┌──────────── white tile ────────────┐   Valid ISBN   [Example]
│        ISBN 978-0-306-40615-7      │   978-0-306-40615-7
│   ║│║││║│║║│║││║│  ║│║│║  5 1499 > │   ISBN-10        0-306-40615-2
│   ║│║││║│║║│║││║│  ║│║│║           │   Price code     51499  $14.99
│  9 780306 406157                   │   Size           90%
└────────────────────────────────────┘   Printed size   1.99 × 1.12 in
[ Download SVG ] [ Download PDF ] [ Download PNG ] [ Copy link ]
──
┌ KDP ─────────────┐                     KDP box, 2 × 1.2 in        Fits
│┌ IngramSpark ──┐ │                     IngramSpark area, 1.75 × 1 in
││▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▓│                        No size fits
└┴───────────────┴─┘
```

- Basic: one `ToolFieldRow`, ISBN wider than List price.
- Advanced: one `ToolFieldRow` inside the disclosure.
- The eye lands on the barcode first, then `Valid ISBN` beside it, then the download buttons.
- The cover fit drawing is about 16rem wide on desktop, its list beside it.

Phones: the rows stack in reading order. The barcode tile goes full width, then the answer and its list, then the buttons, wrapping two to a line, then the fit drawing full width with its list below. Nothing overflows the page.

### States

- **Example.** Opens on the example, with its result and `Example`. Downloads work, since the file is a real, correct barcode. The word goes after the first press of `Make barcode`.
- **Stale.** Any edit steps the result back with `ToolResult stale`, shows `Inputs changed`, and disables the three downloads, so nobody downloads the old barcode after typing their own ISBN. `Copy link` stays on and copies the link for the barcode on screen. The barcode stays visible.
- **Invalid ISBN.** On press, the error shows under the ISBN field, naming the rule, and focus moves there. The last good result stays, stepped back, with downloads off. Draft wording, final in the writing round:
  - `length`: "An ISBN has 10 or 13 digits. This has 12."
  - `includes-add-on`: "This ends with a price code. Put the price in List price."
  - `characters`: "Use digits only. An ISBN-10 can end in X."
  - `x-position`: "X can only be the last character of an ISBN-10."
  - `prefix`: "An ISBN-13 starts with 978 or 979. This looks like a product barcode."
  - `ismn`: "979-0 numbers are ISMNs for printed music, not ISBNs."
  - `check-digit`: "The last digit doesn't match the rest. Check for a mistyped or swapped digit."
- **Invalid price or size.** Same pattern on that field. A size error opens Advanced first.
- **Add-on off with a price typed.** Price field error: "Clear the price, or include the add-on."
- **Price of $99.99 or more.** Not an error. The barcode prints 90000, `Price code` shows `90000` `No price`, and the status word reads `No price printed`. The add-on can't hold a higher price, and BISG sets that limit.
- **Size below 80% or above 200%.** Not an error. The barcode uses 80% or 200%, `Size` shows it, and the status word reads `Smallest size BISG allows` or `Largest size BISG allows`.
- **979 ISBN.** `ISBN-10` shows `None`, with its hint.
- **Doesn't fit an area.** The fit list says the largest size that fits, or `No size fits`. Nothing else changes.
- **Shared link.** Opens and makes the barcode right away. If a value is invalid, errors show as on press, and the example result stays, stepped back.
- **Reset.** Returns every field, including Advanced, to the example and its result, marked `Example`.

## Content

Written after the frontend. Every number in the copy comes from engine runs: the opening example ($14.99 at the default size, 100%, and 80%), the add-on left off with and without dashes, 81%, an ISBN-10, a 979 number priced at $120, and a bad check digit.

### Search intent and title

The searcher has an ISBN and is building a print cover. They want a barcode file that won't get the cover rejected, and to know the ISBN is right. Many first want to know if they need one at all. Top results reject ISBN-10, give no reason for a bad number, drop the "ISBN" line, charge for vector files, and never say how big the barcode prints or whether it fits KDP's or IngramSpark's area.

- Visible title (H1): `ISBN barcode generator: a print-ready barcode for your book cover`
- SEO title: `Free ISBN barcode generator with price code (SVG, PDF, PNG)`
- SEO description: `Check an ISBN-10 or ISBN-13 and download a free book barcode with a price code, sized for KDP and IngramSpark covers, as SVG, PDF, or PNG.`
- Card name: `ISBN barcode generator`
- Card description: `Check an ISBN and download a print-ready cover barcode with a price code.`
- Header icon: `Barcode` from lucide, set in `page.tsx`.

### Reader questions

| Question | Where it's answered |
| --- | --- |
| Can I get a barcode for my ISBN? | Tool result and downloads. Intro. |
| Is my ISBN valid? | Tool: `Valid ISBN`, or a field error naming the rule. Article: check digit. |
| Do I need my own barcode for KDP or IngramSpark? | Article, first section. |
| Does my ISBN-10 work? Why no ISBN-10 for 979? | Tool detail and hint. Article section. |
| What do the five digits mean? What is 90000? | Tool: Price code with its dollar price. Article section with table. |
| What size should it be for KDP? | Tool: Size, Printed size, KDP fit. Article section. |
| Why won't it fit IngramSpark? | Tool: `No size fits`. Article section. |
| How do I place it in Canva, Affinity, or InDesign? | Article section with table. |
| Will it scan? | Article tip. |

### Outline

- Intro: what you get, for which books, what to type, and that it checks the ISBN first. Runs in the browser.
- Usage: what to enter (ISBN and dashes, list price and empty, when to touch Advanced), a table for reading the result, why downloads turn off after an edit, and one `Example` (the opening $14.99 paperback).
- Article:
  - `Do I need my own barcode?` KDP adds one in a blank 2 × 1.2 in box. IngramSpark's template has one. When your own file helps. A barcode must be inside the KDP cover PDF.
  - `What does the five-digit price code mean?` 5 plus cents, a code table, 90000, KDP's match rule, a link to the royalty calculator.
  - `ISBN-10 or ISBN-13: which goes on the barcode?` ISBN-13 always, conversion, 979, 979-0, one ISBN per format, free KDP ISBN limits.
  - `Why does the tool say my ISBN isn't valid?` Check digit, no guessed fix, `Formula` with the manual's example, other errors.
  - `How big should a book barcode be?` BISG 100% and 80% to 200%, the area table, KDP spacing, what Printed size includes, why 90% is the default.
  - `Why won't my barcode fit IngramSpark's area?` The two width limits with numbers, the one case that fits, keep the template barcode.
  - `How do I put the barcode on my cover?` App, file, and steps table, three rules, a link to the preflight checker, `Tip` on scanning a proof.
  - `What doesn't this tool do?`

Left out: GS1 module widths and quiet zone counts (the tool handles them), currency digits other than 5 (not verified), and hyphenation ranges (not supported).

### Facts, limits, and sources

- KDP adds a barcode if none is supplied, the 2 × 1.2 in box, rejection for art in the barcode area, price code must match list price, 100% black on white: [KDP Barcodes](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW).
- 0.25 in from spine and trim, 0.76 in from the bottom on hardcovers: [KDP Create a Hardcover Cover](https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6).
- Cover as one PDF: [KDP Create a Paperback Cover](https://kdp.amazon.com/help?topicId=G201953020).
- eBooks don't need an ISBN on KDP, free KDP ISBN limits: [KDP Get an ISBN](https://kdp.amazon.com/en_US/help/topic/GTJ8LBXL6Z4WV5QX). KDP ISBNs can't move to IngramSpark: [IngramSpark User Guide](https://www.ingramspark.com/hubfs/downloads/user-guide.pdf).
- 5 means US dollars, 90000 means no price, $99.99 can't be encoded, 100% size and 80% to 200%, 9 point line: [BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry).
- IngramSpark 1.75 × 1 in area, 100% black on white, template barcode moves but doesn't resize: [IngramSpark File Creation Guide](https://www.ingramspark.com/hubfs/downloads/file-creation-guide.pdf). 90000 when no price, may replace an unscannable barcode: [IngramSpark User Guide](https://www.ingramspark.com/hubfs/downloads/user-guide.pdf).
- ISBN-13 since 2007: [ISBN International, What is an ISBN?](https://www.isbn-international.org/content/what-isbn/10). No ISBN-10 for 979: [ISBN International, US prefixes](https://www.isbn-international.org/content/changes-united-states-isbn-prefixes). Check digit example and ISMN 979-0: [ISBN Users' Manual](https://www.isbn-international.org/sites/default/files/ISBN%20Manual%202012%20-corr.pdf).
- Sources checked by research on October 13, 2026.
- Avoid: saying the barcode will scan or be accepted, any currency but US dollars, that the tool hyphenates or checks dash positions, that IngramSpark adds a barcode to a blank area (only its template barcode is sourced), exact Canva or Affinity menu paths beyond File > Place, and "many authors" or other unsourced popularity claims.

### Next step

`/kdp-book-setup-calculator` (full cover size, linked in the size section), `/kdp-pdf-preflight-checker` (check the cover PDF, linked after placing), `/kdp-royalty-calculator` (picking the list price, linked from the price code section).

### Interface words changed in the writing round

- Price code hint: "The five digits above the small barcode on the right."
- Size hint, entered size: "100% is the standard book barcode size." Default size: "The largest size, up to 100%, that fits KDP's box."
- Printed size hint: "The whole white box, including the clear space scanners need."
- IngramSpark area hint: "The clear area IngramSpark asks for on the back cover." The template barcode fact moved to the article.
- ISMN error: "Numbers starting 979-0 are for printed music, not books."
- Zero price error: "$0 can't be printed. Leave it empty for no price."
