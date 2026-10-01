# Platform fees improvement plan

Goal: keep the data as it is, but make the cards clear and good-looking, make the pages easier to scan, and help search engines understand each page.

Work one step at a time. Finish a step, check it at desktop and mobile width, then start the next.

## Progress, 30 September 2026

Steps 1 to 10 are complete in development. Step 11 is complete as far as reliable official assets allow: 533 of 543 platforms have icons, with initials for the remaining 10. Step 12 remains a later product decision. Nothing has been committed or released in this run.

The reader is choosing where to sell or earn. The pages keep comparison cards short; detailed rates, facts and official sources are available in the side panels and in the HTML without JavaScript.

**Checks completed:**

- `npm run quality`, the platform-fee focused tests and `npm run build` passed.
- Six representative sections passed at desktop and mobile widths in dark and light themes. Closed mobile cards were shorter than the viewport.
- Rate panels opened with the keyboard, closed with Escape and returned focus. Hub search and the mobile section menu worked.
- Rates, full fact sentences, dates and source links were readable with JavaScript off.
- All 38 shortened URLs permanently redirect, including query parameters. The sitemap contains the 49 canonical section URLs and excludes their old addresses.
- Each unfiltered section has a registry-owned `ItemList`. Search results remain `noindex` and do not claim the complete platform list.
- The development database exactly matches all 49 section records and all 543 platform records, with the receipt and presentation migrations recorded.

**Accuracy corrections:**

The receipt review corrected or clarified 18 entries using their official sources. Shared revenue pools, fixed pay, artist markup and product costs use their published basis without an invented seller-share bar. Rate tables use a neutral "Rate" heading. Percentage bars state that other fees can reduce the payout. Design Cuts is marked closed. Genuine source conflicts remain visible.

**Remaining logo limits:**

Design Cuts (closed), SellMyApp, Dissolve, SoundClick, Made By Teachers, Craftsuprint, Unlockd, Vocal, Buy Me a Chai and Artists&Clients retain initials. Official assets were blocked or could not be reliably retrieved. Huawei now uses its official vector logo; Spreadshirt has an official brand icon.


---

## Starting point before the receipt redesign

**What is good:**

- 49 sections and 543 platforms. Each platform has sources and a checked date.
- About 1,860 facts are verified. "Not public" and "varies" are shown honestly instead of guessing.
- Canonicals, `noindex` on search results, and sitemap entries (50 URLs) are already correct.

**What is weak:**

- Cards are long and noisy. Apple has 6 rate rows, each with its own bar, and 67 cards have 4 or more.
- Bars use a 0–100% scale, so 1% and 2% show as empty grey slivers. "Your share" and "Platform fee" bars mean opposite things but look almost the same.
- Short labels are cryptic because of the 24-character limit: "+5% IAP in JP/BR; region", "EU CTC Oct 1 or later".
- Card heights vary a lot. Samsung's card is half empty next to Apple's.
- Facts use a monospace font while the headline uses the display font. The small fact icons all look the same.
- Cards have no website link, no checked date, and no summary (`summary` is passed as `""`).
- The full, sourced fact sentences never appear on the page. Only the short values do.
- The hub shows 49 tiles that all look the same, with a one-line intro. The sidebar is one long flat list.
- Section pages have no intro text.
- Every page uses the same receipt icon in the title. Section icons are picked by `sort_order` position, so reordering the sections breaks them.
- Section titles read badly: "Mobile app stores fees | stack127".
- The only structured data is a `CollectionPage`.
- Some slugs are very long, such as `selling-video-subscriptions-rentals-and-downloads`.
- The page code is written as minified one-liners, which makes it hard to change.
- Some logos are low-resolution `.ico` files. Huawei's looks blurry.

---

## 1. Clean up the page code

**Status:** Complete: readable route code and section icons stored in the section data.

Before the redesign, rewrite the platform-fees route files so they are easy to read. Do not change how anything looks or behaves.

**Files:**

- `app/(site)/(directories)/platform-fees/page.tsx`
- `app/(site)/(directories)/platform-fees/[section]/page.tsx`
- `app/(site)/(directories)/platform-fees/components.tsx`
- `app/(site)/(directories)/platform-fees/page.module.css`

**Also:**

- Store the section icon as a name on each section in the data, not a lookup by `sort_order`.

**Done when:** pages look the same as before, and `npm run quality` passes.

---

## 2. New fee card component

**Status:** Complete: the receipt card is used in all sections. Published payout and cost models keep explicit units when a platform percentage would mislead.

Build a card made for fee data. Stop using `AppFactCardContent`, which was built for self-host apps. Try it on **Mobile app stores** only. Roll it out to all sections after you have approved it.

**Chosen design:** the receipt ticket with the hero rate on top. Preview: `dev-space/platform-fees-card-styles.html`, sections 01 and 02.

```
┌─────────────────────────────────┐
│ [logo] Apple App Store      ↗   │
│        Apps and subscriptions   │  ← summary, one line
│                                 │
│ 30%        15%                  │  ← big number = what the platform takes
│ Standard   Small business       │     plus at most 1 second rate
│ ▰▰▰▰▰▰▰▱▱▱                      │  ← one bar
│ You keep 70%        Apple 30%   │
◖- - - - - - - - - - - - - - - - -◗  ← torn receipt edge
│ Start ................. $99/yr  │  ← 3 dotted receipt lines
│ Subs ......... 15% after year 1 │
│ Regions ............ Own rates  │
│ + 6 more rates                  │  ← opens all rates (step 3)
│ - - - - - - - - - - - - - - - - │
│ Checked 30 Sep 2026   Details → │
└─────────────────────────────────┘
```

**Rules:**

- The big number is always what the platform takes, in every section. That includes "your share" sections: Udemy shows 63%, not 37%. The bar and its "You keep 37%" label give the seller's side.
- Show at most one second rate next to the big number.
- One bar under the rates: accent for what you keep, grey for what the platform takes.
- No bar when the value is not a clear percentage, such as "Variable".
- Fixed amounts sit beside the big number in a smaller size: "10% + 50¢".
- 3 dotted receipt lines for the key facts (start cost, plan, card fees, and so on). Short, plain values.
- The logo and name link to the platform website (opens in a new tab).
- Under the name, a short tag of 2–4 words ("Apps and subscriptions"), not a full sentence.
- No checked date on the card. It is in the side panel.
- The bar label shows only "You keep 70%". The big number already shows the platform take.
- US pricing first. Name the first rate group "US and most regions" when other regions have their own rates.
- Every receipt line is a concrete fact. No "Can differ" or "Ask them" lines.
- Side panel: rates without bars, one plain note, then the checked date and short source names at the bottom.
- Replace cryptic short labels with plain words. No "IAP", "CTC", or "JP/BR".

**Check:**

- Desktop and mobile width. On mobile a closed card should be shorter than the screen.
- Dark and light mode.
- Keyboard: "+ N more rates" and links can be reached and opened with the keyboard.

---

## 2b. "+ N more rates"

**Status:** Complete: shared side panels with server-rendered native disclosure fallbacks. Side-panel rate tables have no decorative bars.

All rates for a platform, grouped (for example "Standard rates" and "Regional rates"). Each row has the platform take, a plain label, an optional short note, and a small bar.

**Decision:** side panel, to match self-host apps and CLI apps.

- Reuse the shared `DetailDialog` from `app/ui/detail-dialog.tsx`. Self-host apps, CLI apps, the hardware directories, and Zigbee devices already use it, so there is no new panel to build.
- The rate list is server-rendered inside the card in a `<details>` block. A small client wrapper catches the "+ N more rates" click and opens `DetailDialog` with the same content. Without JavaScript, and for bots, the `<details>` block opens in place.
- Panel content: logo, name, and summary; the big numbers and bar; the grouped rate table; the checked date and official pricing link.
- The panel itself is shared. What goes inside it belongs to platform fees.
- Making panel content readable by search engines starts with platform fees only. Other directories can follow later as their own step.

**Rules:**

- The full rate list is always in the server-rendered HTML, even when closed. Never load it on click.
- Use a real `<table>` with a caption ("All Apple App Store rates"), group headings, and row headings. Screen readers and bots then know which rate belongs to which case.
- The value is always text ("30%"). The bar is decoration only and is hidden from screen readers.
- "+ N more" counts the rates not already shown on the card.

---

## 3. Roll the card out to all sections

**Status:** Complete: all 543 cards validated; six representative sections checked in the browser. Confirmed conversion errors and pooled-share bars were corrected.

- Check sections with "Your share" (for example Fonts and Stock photos), "Your pay" (for example Tutoring), and "Variable" values. The big number must still be the platform take.
- Data work: every entry needs a grouped rate list, plain labels, and 3 receipt lines. The current `card.rates` and 24-character facts are a start, but most labels need rewriting.
- Check the longest cards (the 67 with 4 or more rates) and the shortest ones.
- Look at 5–6 different sections at desktop and mobile width.

---

## 4. Make the facts readable for search engines and AI bots

**Status:** Complete: every sourced fact is server-rendered in the section sources disclosure, along with the per-card grouped rates, notes and dates.

Cards stay visual and short. The detail must still be in the page HTML so Google, Bing, and AI crawlers can read it. Many AI crawlers do not run JavaScript, so anything added on click is invisible to them.

- Server-render everything: card values, the full rate table, and the checked dates. Nothing is fetched on click.
- Content inside a closed `<details>` block is fine for search engines. It is real content that people can open, not hidden text.
- Use plain words in labels, such as "Small Business Program" or "Japan and Brazil in-app". Bots quote these as they are.
- Each card is an `<article>` with the platform name as its heading.
- The full sourced fact sentences go on the per-platform page (step 12). Until then, they can go in the rate table notes or the sources dialog.
- Structured data (`ItemList`) is covered in step 8.
- Optional later: a plain-text or Markdown version of each section for AI tools, generated from the same data.

---

## 5. Section intros

**Status:** Complete: all 49 intros live in section data; each page shows the newest platform checked date.

Each section page gets 2–3 plain sentences above the cards, saying what usually decides the fee in that category. Example: "App stores take 15–30%. Small-business programs cut that to 15%."

- Store the intro in the section data, not in page files.
- Show "Last checked" for the section, using the newest checked date of its platforms.
- Follow `stack127_docs/writing-style.md`.

---

## 6. Better titles and descriptions

**Status:** Complete: all 49 section titles and descriptions are synced into the development publication registry.

These live in `public.stack127_pages`, so this is a data change, not a code change.

| Now | Better |
|---|---|
| Mobile app stores fees \| stack127 | Mobile app store fees compared: Apple, Google Play, Samsung (2026) |

- Write a title and description for each of the 49 sections.
- Name the 2–3 best-known platforms in each title and description.
- Keep titles under about 60 characters where possible.

---

## 7. Group the hub and sidebar

**Status:** Complete: eight groups in both places. Hub ranges use verified headline fee percentages and identify partial coverage.

Put the 49 sections into 6–8 groups:

- Apps and software
- Digital products and stores
- Creative assets
- Music and audio
- Writing and books
- Teaching and courses
- Creators and communities
- Payments

**Hub page:**

- A short intro that explains how to use the page.
- A heading for each group, with its sections under it.
- Each tile shows its section icon, platform count, and fee range (for example "10–30%") if that can be worked out from verified data.

**Sidebar:** the same groups, so the list is shorter and easier to scan.

---

## 8. Structured data

**Status:** Complete: the shared registry layer attaches the platform ItemList to each published, unfiltered section page.

- Add an `ItemList` of platforms on each section page.
- Build it in the shared registry and JSON-LD layer, not in page files.
- Only use names, URLs, and checked facts. No invented ratings.

---

## 9. Links between sections

**Status:** Complete: three related sections per section, stored in data and linked below the cards.

- Add a "Related sections" block at the bottom of each section page. Example: Course stores ↔ Course marketplaces ↔ Tutoring.
- Store the related sections in the section data.

---

## 10. Shorter slugs

**Status:** Complete: 38 shorter canonical paths, permanent redirects and matching registry/sitemap entries. Database section IDs remain stable.

Do this before the long URLs get indexed.

- Shorten the long ones. Example: `selling-video-subscriptions-rentals-and-downloads` → `video-sales`.
- Redirect the old URLs to the new ones.
- Update `stack127_pages` and the sitemap to match.

---

## 11. Logos

**Status:** Complete with the official-asset limits listed above. Coverage is 533 of 543, with genuine initial fallbacks.

- Replace blurry `.ico` logos with PNG or SVG, starting with Huawei.
- Check the 11 platforms that have no logo.

---

## 12. Per-platform pages (decide later)

**Status:** Deferred: choose the URL pattern and scope in a separate run after reviewing these completed section pages.

People search for "patreon fees", "gumroad fees", and "etsy fees" far more than for category names. Almost every platform appears in only one section (542 unique names; only PayHere is in two), so each platform could have its own page.

- Choose the URL pattern: `/platform-fees/<section>/<platform>` or a flat `/patreon-fees`.
- Each page shows all facts, sources, checked dates, and similar platforms.
- This is a big step. Decide after steps 1–9 are done.

---

## Checks for every step

- `npm run quality`
- Look at the changed page at desktop and mobile width.
- `npm run build` for steps that change routes, SEO, or structured data (6, 8, 10, 12).
