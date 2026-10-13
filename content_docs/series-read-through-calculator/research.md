# Research: Book Series Read-Through Calculator

Route: `/series-read-through-calculator`
Checked: 2026-10-13
Competitors used: 8

Likely catalog: KDP Tools (`/kdp-tools`). Related stack127 tools are listed under Scope.

## Who uses it

Who searches for this tool, and what they want to know. Based on search results, FAQ questions, competitor pages, and author posts. The shares are inferred, not measured.

| Group | Rough share | What they already know | Their questions, in their words |
| --- | --- | --- | --- |
| Most people: a fiction author with book 1 of a 2 to 5 book series on KDP, often running some ads | Most (inferred) | Book price, sales by title for the last 30 days, and a rough ACoS from ads. Often not the KENPC or the monthly KENP rate. | "How much can I spend on ads to get a new reader for book 1?" "Is my book 1 to book 2 rate good?" "Should I make book 1 free?" |
| Series authors with 3 to 9 books who advertise on Amazon and elsewhere | Some (inferred) | Cost per click, ad spend by title, KU reads and sales by title | "What is a new reader worth across the series?" "Does ad spend on book 1 pay if book 2 sells?" |
| Pros with 10 or more books, box sets, or cohort data | Few (inferred) | Read-through by step and by month, KU share, promo dates such as Countdown Deals | "How do I value a reader across all 10 books?" "How do Countdown Deals and KU reads change the number?" |

Context for the first group: the 2025 Written Word Media survey (1,346 responses, which the article says skews toward serious, prolific authors) found that about 80% of authors with 1 to 3 books earn under $100 a month. Many users are early in a series, not running large catalogs.

Answer in a few lines:

- What do most people want in the first few seconds? One number they can act on: what one new book 1 reader is worth across the series, and the most they can pay for that reader.
- Which inputs can most people give offhand, and which need digging? Offhand: book price, number of books, book sales for the last 30 days, and ad cost. Need digging: the KENPC page count for each book (in the KDP Select info), the monthly KENP rate, file size in MB, and any Countdown or free days in the last 90 days.
- What do pros need that most people would skip? Each step's read-through (book 2 to 3 often differs from book 1 to 2), KU reads kept apart from sales, the 3,000 KENP cap for long books, delivery cost per MB, promo prices, and the wait before royalties arrive.

## Published comparison data

Published figures people use to judge their own number.

| Figure | Source and date | Who was measured | Same definition as the tool? |
| --- | --- | --- | --- |
| Paid book 1 to book 2 read-through: "healthy" is 50 to 60%, and below 50% means investigate | Authorsgame benchmark table, "as of 2026". The page's own publication date was not found in the raw text. | Not stated. The table says the numbers vary by genre and pricing. | Partly. Sales basis. No sample or dataset cited. |
| "Many authors see something in the neighborhood of 50 to 60%" from book 1 to book 2 | Kindlepreneur, "How to Calculate Series Read-Through", updated Nov 8, 2025 | Not stated. Its worked example is 428 copies of book 1 and 247 of book 2 (57.7%). | Yes for sales. The article also covers KU reads. No dataset cited. |
| Kindle Unlimited borrow floor of 75% or more for book 1 to book 2 | Authorsgame benchmark table, "as of 2026" | Not stated | KU basis. No source cited. |
| Permafree break-even: at least 20 to 30% of readers continue to book 2. Strong series: 40 to 60%. | ScribeCount Permafree Series Calculator FAQ. Undated. | Not stated | Partly. Planning threshold, no source. |
| Book 1 to book 2 at 60% is "strong" and 35% is "thin" | BookWriter ACoS calculator page. Undated. | Not stated | Partly. Own claim, no source. |
| About 50% book 2 sell-through when book 1 is paid or 99 cents, about 12% when book 1 is permafree | KBoards forum, from a search summary only. The thread body returned HTTP 402. | Forum posters | Unverified. Context only. |
| Monthly KENP rate per page: $0.00452 (ScribeCount default, "mid-2025 average"), $0.00458 (Kindlepreneur, "Feb 2026"), $0.00482 (profitable.app, April 2026) | Third-party pages, dates as shown | Unknown. Trackers and author reports. | Partly. KDP's help pages do not publish a per-page number. KDP announces the fund each month in its community forum. Our forum search returned nothing. |
| Monthly marketing spend: $636 average across all respondents | Written Word Media 2025 survey results | Indie authors who answered. Covers all marketing, not ad spend. | No. It is total marketing, not ad spend per reader. |
| Share of authors with all books in KDP Select: 38%. None: 30%. | Written Word Media 2025 survey results | Same survey | Not a read-through figure. Useful for who uses KU. |
| Books category cost per click: about $0.30 to $1.00 | Search summaries of six vendor pages from 2026 (Ad Badger, Autron, Salesduo, Clickstera, Keywords.am, Sequence Commerce) | Vendor account data, mostly not indie authors. Categories and ad types differ. | No. Do not show as a benchmark. |

The read-through sources agree loosely on "around 50 to 60% for paid book 1 to book 2." None of them gives a sample or a method. Do not grade a user's number against that range. If the tool shows any context, label it "commonly quoted, not sourced." The KENP rates differ because they come from different months, and some are estimates. The tool should take the rate as user input with its month.

## Scope

The job: from readers moving from book 1 to later books, work out what one new book 1 reader is worth across the series. From that, work out how much the author can afford to spend to get one. That covers ads, or a free or discounted first book.

In scope:

- Ebook royalties on KDP for each book in the series, on the 70% and 35% options, with delivery cost. VAT as an optional input.
- Read-through for each step, from sales, KU page reads, or both.
- A KENP rate the user enters, with the month it came from.
- The ad spend ceiling per new reader, and the CPC or ACoS that matches it.
- Free and discounted book 1 as scenarios: free days, price matching, and Countdown Deals.

Out of scope, or Advanced at most: print profit (see `/kdp-price-profit-calculator`), profit after covers and editing, other retailers, audio, time discounting, brand halo effects, and a live feed of KENP rates.

Related stack127 tools, and how this one stays distinct:

- `/kdp-royalty-calculator` gives the royalty per copy for one book. This tool multiplies that across the series and should link to it for the per-sale figure.
- `/kdp-break-even-acos-calculator` gives the highest CPC for one book. This tool gives the series-level ceiling, which is higher, and should link to the CPC check.
- `/kindle-unlimited-kenp-earnings-calculator` gives KU earnings for one title from pages and a rate. This tool uses the same KENP rules for a series of readers, including the 3,000 cap.
- `/kdp-price-profit-calculator` compares print setups and cost-covering prices. Out of scope here.

Queries tried, each followed by reading the top pages:

- series read-through calculator, authors book 1 to book 2 tool
- book series read-through rate book 1 to book 2 data, indie authors survey
- book series lifetime value calculator, how much to spend on ads for first book
- free online KDP royalty calculator with KENP and series
- Amazon Ads break-even ACOS calculator, book series
- KDP Select Kindle Unlimited KENP pages read payment; Kindle Unlimited KENP rate per page 2026
- should I make book 1 free, permafree series read-through
- how much should I spend on Amazon ads for book 1 of my series
- average cost per click Amazon Ads books benchmark 2026
- KDP paperback printing cost; KDP Select enrollment 90 days and free promotion days
- Site-limited searches on reddit.com (blocked for this research tool) and kdpcommunity.amazon.com (no results)

Domains that keep showing up: vappingo.com (most results), kindlepreneur.com, scribecount.com, bookwriter.vip, authorsgame.com, profitable.app, bookbeam.io, writtenwordmedia.com, janefriedman.com, kboards.com (titles only), goodreads.com author posts, and Substack. For the rules, the KDP help pages on kdp.amazon.com are the source.

## Search intent

| Query | What the searcher wants | Answer they need | What current results miss |
| --- | --- | --- | --- |
| series read-through calculator | A tool: enter sales, get a percentage | Read-through for each step, and the value per reader | The top tool uses the old $9.99 band and gives no ad ceiling. Its results did not respond in our test. |
| how to calculate read-through | The formula | Next book's sales divided by the prior book's sales. For KU, full reads = pages divided by KENPC. | Kindlepreneur's KU example writes "227 ÷ 196 = 86.3%", which is the division reversed. |
| permafree series calculator; is permafree book 1 profitable | A free vs paid comparison | Monthly or long-run income for each, and the read-through where free breaks even | One rate for every step. The FAQ says rates drop 10 to 15 points per book, but the math does not. |
| KENP calculator | Pages times rate, per reader or per month | The value at the current month's rate, with the 3,000 cap | Kindlepreneur fixes its rate at Feb 2026 and has no cap. ScribeCount defaults to a mid-2025 rate. |
| how much to spend on ads for book 1; series ads break even | A maximum bid or cost per new reader | Series value per reader, the margin they want, and the CPC or ACoS that follows | Univers covers one book only. BookWriter's ACoS page did not respond in our test. |
| should I make book 1 free | A yes or no for their numbers | Lost book 1 royalties vs the series income from readers who came in free | No tool includes KDP's free rules: 5 free days per 90-day term. A price-matched free book pays zero during the match. |
| KDP Select 90 days; KDP free promotion days | The rules | The 90-day term, 5 free days, ebook exclusive to KDP during the term | Third-party guides mix old and new menu labels. The official help page is the source. |
| is 50% read-through good | A benchmark | No sourced benchmark exists | Top pages give "50 to 60%" with no data behind it. |

People also ask, and FAQ-style questions in the results:

- "What is a good read-through rate for permafree?" (ScribeCount FAQ)
- "Can I make book 1 free on Amazon?" (ScribeCount FAQ)
- "Is Permafree Book 1 Actually Profitable?" (ScribeCount page heading)
- "How to Calculate Read-Through (and why it matters!)" (ApexAuthors title)
- "How to Calculate Series Read-Through (And Why It's Important to Know)" (Kindlepreneur title)

## User problems

Evidence limits first. Reddit could not be searched from this tool. The KBoards thread body returned HTTP 402 when we followed its redirect, so we did not read it, and we did not try to get around that. The KDP community forum search returned nothing. Most rows below are titles, search summaries, and author posts, not full threads.

| Problem people repeat | Evidence link | What it means for the tool |
| --- | --- | --- |
| "What is a realistic series read-through rate?" | KBoards thread title: https://www.kboards.com/threads/what-is-a-realistic-series-read-through-rate.264285/ (title and search summary only) | People want a number to judge theirs. There is no sourced benchmark. Show what-if rates, not a grade. |
| "Calculating return on FB ads, read through" | KBoards thread title: https://www.kboards.com/threads/calculating-return-on-fb-ads-read-through.253960/ (title only) | Users run ads off Amazon too. The cost-per-reader input must work for any ad platform. |
| "AMS ads on books 2 and 3 in a series" | KBoards thread title: https://www.kboards.com/threads/ams-ads-on-books-2-3-in-a-series.263475/ (title only) | Users ask about spend on later books. Show each book's own value, not only book 1. |
| "What is your series sell-through rate for book 2 if book 1 is permafree?" | KBoards poll title: https://www.kboards.com/threads/poll-what-is-your-series-sell-through-rate-for-book-2-if-book-1-is-permafree.253708/ (title only) | A free book 1 is a live question. The tool needs a free-book scenario with its own read-through. |
| "Going permafree?" | Author post, undated: https://www.goodreads.com/author_blog_posts/24274964-going-permafree?tab=book (search snippet) | Same as above. Authors weigh a free first book against a paid one. |
| Facebook ads for book 1 carried sales into book 2 but little into KU reads, and the campaign did not recover its spend | Substack post: https://matthewwquin.substack.com/p/facebook-ads-avoiding-kindle-unlimited (search summary) | Keep KU reads and sales on separate lines. A borrow is a read, not a sale. |
| KU reports count pages, so you can't confirm a reader finished the book | Kindlepreneur article, read in full: https://kindlepreneur.com/calculate-series-read-through/ | KU read-through is an estimate. Say so in the result. |
| A KU reader's payout depends on pages read, up to 3,000 per borrow | KDP KU help, read in full: https://kdp.amazon.com/help/topic/G201541140 | A per-reader KU value needs a page estimate. Show the cap. |

## Facts to get right

| Fact | Primary source | How the tool should treat it |
| --- | --- | --- |
| 70% band on Amazon.com: $2.99 to $12.99, effective July 7, 2026. It was $2.99 to $9.99 before. Other marketplaces changed too. | KDP eBook List Price Requirements, https://kdp.amazon.com/en_US/help/topic/G200634560 | Use a dated band table, with US as the default. Show the effective date. Do not use $9.99. The repo royalty engine already uses $2.99 to $12.99. |
| 35% option: 35% × (list price − VAT). Minimum list price: $0.99 under 3 MB, $1.99 from 3 MB to under 10 MB, $2.99 from 10 MB. Maximum $200.00. | KDP Digital Book Pricing, https://kdp.amazon.com/help/topic/G200634500 (last updated April 21, 2026), and G200634560 | No delivery deduction on 35%. Flag a price below the minimum for the file size. A price under $2.99 pays 35%. |
| 70% option: 70% × (list price − VAT − delivery cost). | Same pricing page, formula text. Its example: 0.70 × (€1.99 − €0.08 − €0.10) = €1.27. | Subtract delivery before the 70% applies. Do not use the looser sentence "70% of list price, less delivery costs." |
| Delivery cost per MB: US $0.15, Canada CAD 0.15, Australia AUD 0.15, UK £0.10, DE, FR, ES, IT, NL €0.12, Japan ¥1, India ₹7, Mexico MXN 1, Brazil R$0.30. File size rounds up to the next KB. Minimum US$0.01. | Pricing page (April 21, 2026) | Input: file size in MB × rate. The user enters their own file size. |
| KDP's royalty options page says "average delivery costs are $0.06 per unit sold" | KDP royalty options, https://kdp.amazon.com/help/topic/G200644210 | Do not use as a default. It is an average and varies by file size. A 2 MB book pays $0.30 in the US. |
| Price matching: under the 70% option, the royalty is on the matched price. If the matched price falls below the 70% minimum, the book earns 35%. A free match pays zero royalty during that promotion. | Pricing page, price matching sections | Leave out of Basic. Note it in the result when the user has a matched price. |
| Countdown Deals: the promotional price keeps the same royalty option. Under 70%, if the book qualified at list price: 70% × (promo price − VAT − delivery). Under 35%: 35% × (promo price − VAT). Countdown Deals run only on Amazon.com and Amazon.co.uk. | Pricing page, promotional list price sections | A deep Countdown price stays at 70% under this text. Confirm with one real royalty report before relying on it, because it changes discounted book 1 math. |
| KU payment: only the first read of each page by each customer pays. Maximum 3,000 KENPC per title per customer, and that cap applies each time the book is borrowed and read. | KDP KU help, https://kdp.amazon.com/help/topic/G201541140 | Cap pages at 3,000 per borrow. Count first reads only. |
| KENPC counting: from the Start Reading Location, which Amazon typically sets at chapter 1, to the end. Images, charts, and graphs count. | G201541140 | Use the KENPC count from KDP Select info. Do not use the printed page count. |
| KENP payout formula: the fund × the author's pages ÷ all pages read that month. Amazon's example: a $10 million fund, 100 million pages, and 10,000 pages earns $1,000. | G201541140 | The per-page rate is the fund ÷ all pages read. The tool does not need the fund. The user enters the rate. |
| KENP rate changes monthly. Monthly figures "may change and will be finalized near the 15th of the following month." KDP announces the fund monthly in its community forum. The Royalties Estimator says to use the last announced rate. | G201541140; Royalties Estimator, https://kdp.amazon.com/en_US/help/topic/G6BZ4M9PVJ8YSCW8 | The user enters the rate and its month, labeled as the last announced rate. Do not hard-code a rate. |
| The current per-page rate is not on any KDP help page we read. The Royalties Estimator page shows a fund total of $69.4 million for August 2026, which is a fund total, not a per-page rate. | G6BZ4M9PVJ8YSCW8 | Leave the rate blank, or use a default that is labeled as an example. Do not invent a current rate. |
| Royalty timing: paid monthly, about 60 days after the end of the month the sale was reported (90 days for Expanded Distribution). | G6BZ4M9PVJ8YSCW8 | Note it for cash flow. Ad spend is paid now. Royalties arrive about two months later. |
| KDP Select: a 90-day enrollment period. The ebook must be exclusive to the Kindle Store for the term and can only be distributed through KDP and public libraries during it. Print and audio are not limited. Enrollment renews automatically unless the author opts out. | KDP Select enrollment, https://kdp.amazon.com/en_US/help/topic/GD9PMU58BV24QFZ7 | The KU and free scenarios depend on KDP Select. A wide ebook is not in KU. |
| Free Book Promotion: up to 5 free days in each 90-day enrollment period. Schedule at least one day ahead. The earliest start is day 2 of the term. Unused days do not roll over. | Free Book Promotions, https://kdp.amazon.com/en_US/help/topic/G201298240 | Cap a free scenario at 5 days per term. A permanent free listing depends on price matching, and that pays zero royalty during the match. |
| Paperback royalty (US): 50% at or below $9.98 and 60% at or above $9.99. Expanded Distribution: 40%. Royalty = rate × list price − printing cost. | Paperback Royalty, https://kdp.amazon.com/en_US/help/topic/G201834330 | If print is in scope, use both tiers. Univers Studio offers only 60%. |
| Printing cost (US, black ink): 24 to 110 pages costs $2.30 flat, regular trim. 110 to 828 pages costs $1.00 plus $0.012 per page. Large trim: $2.84 flat, and $1.00 plus $0.017 per page. | Printing cost, https://kdp.amazon.com/en_US/help/topic/G201834340 | Use for print. Amazon's calculator enforces the 24 to 828 page range (tested). |
| ACoS = ad spend ÷ ad-attributed sales. | Amazon Ads "ads math" guide, https://advertising.amazon.com/en-gb/library/guides/ads-math, does not define ACoS or the attribution window. Third-party guides do. | Define ACoS in the tool using the standard formula, and say that Amazon Ads sets the attribution. Mark the official definition as unknown. |
| 14-day Sponsored Products click window; no brand halo for books | Only a third-party summary (Vappingo). The Ads guide does not state it. | Unknown. Do not state it as fact in the tool. |
| Read-through: next book's sales ÷ prior book's sales. For KU, full reads = KU pages read ÷ KENPC. | Kindlepreneur article (formula and example, 247 ÷ 428 = 57.7%, checked in raw text) | Use the same order for every step: later book ÷ earlier book. Note that KU reads count pages, not finishes. |

## Competitor reviews

We ran or read eight tools. For the seven tools with forms, we typed real values in Chrome headless, checked the outputs by hand against the stated formulas, and noted where a page did not respond. We did not grade a tool on a result we could not reproduce.

### 1. Amazon KDP Printing Costs and Royalty Calculator (official, paperback)

URL: https://kdp.amazon.com/en_US/royalty-calculator

- [Observed] Asks for book type (paperback or hardcover), interior, trim, marketplace, page count, and list price. Shows printing cost, minimum list price, rate, and royalty for each marketplace.
- [Observed] Correct example: 300 pages, black and white, 5 x 8 in, US, list price $9.99. Printing $4.60, rate 60%, royalty $1.39. Checks: 0.60 × $9.99 − $4.60 = $1.39.
- [Observed] Edge case: 828 pages. "List price must be between $18.23 and $250.00." Checks: (1.00 + 828 × 0.012) ÷ 0.60 = $18.23.
- [Observed] Wrong input: 900 pages. "Paperback page count can't be less than 24 or greater than 828."
- [Documented] Printing cost = fixed cost + (page count × per-page cost). US paperback royalty is 50% at or below $9.98 and 60% at or above $9.99 (help pages G201834340 and G201834330). The page says Expanded Distribution is not included.
- [Inferred] This is the reference for print costs. It has no series or read-through input, so users would run each title separately.
- [Unknown] Ebook royalties are not on this page. We saw only paperback and hardcover.

```text
300 pages, $9.99 list, US black and white -> printing $4.60, royalty $1.39
```

### 2. BookWriter Series Read-Through Calculator

URL: https://www.bookwriter.vip/kdp-series-read-through-calculator

- [Observed] Inputs: Book 1 sales (last 30 days), Book 2 sales, Book 3 sales (set to 0 for a two-book series), and series price. Button: "Calculate read-through". Three books at most.
- [Observed] On load, the page shows its own example: 240, then 144, then 86, at $4.99. It gives "$6.84 per book-1 reader." Checks: $3.49 × (1 + 0.60 + 0.60 × 0.60) = $6.84. The same page also says "about $12.80 series value per reader at $4.99" and "$7.48 series value" for that example.
- [Observed] Static text says "Royalty assumed 70% inside $2.99 to $9.99." Amazon's band has been $2.99 to $12.99 since July 7, 2026, so the text is out of date.
- [Observed, headless run] Setting the price to $10.99, Book 1 sales to 0, Book 2 blank, or Book 2 to −20, then clicking the button, left the page text unchanged. The page's own scripts loaded without page errors. We did not find the cause, so we did not grade the calculator on those inputs.
- [Documented] The page says calculations run in the browser, with nothing uploaded and no signup.
- [Inferred] The three-book limit cannot model a longer series.
- [Unknown] Whether it responds in a normal browser.

```text
240 -> 144 -> 86 at $4.99 -> $6.84 per book-1 reader (page example, math checks)
```

### 3. BookWriter Amazon Ads ACoS Calculator

URL: https://www.bookwriter.vip/amazon-ads-acos-calculator

- [Observed] Inputs: book price, books in series (1 means stand-alone), and series read-through % (book 1 to book 2). Outputs: break-even ACoS for a profit target and a growth target. The button reads "Loading..." on load.
- [Observed] The page gives two different break-even figures for the same inputs ($4.99, 3 books, 55%): "131%" (series value $6.54) and "128%" (series value $6.37).
- [Observed] The 128% line shows its formula: "1 + 55% + 55% × 50% at $3.49 = $6.37". The second step uses 50% even though the input is 55%. The 50% is not an input. The 131% figure does not follow from the formula on the page.
- [Observed] Static text says "70% inside $2.99 to $9.99." Out of date, as on the series page.
- [Observed, headless run] Setting the price to $0.99, books to 1, read-through to 0%, and then to 150%, left the page unchanged, as on the series page.
- [Documented] Page text: "60% is strong, 35% thin." No source given.
- [Inferred] A user cannot see the hidden 50% second-step rate, so the 128% result looks like it follows from 55%.
- [Unknown] Whether it responds in a normal browser.

```text
$4.99, 3 books, 55% read-through -> break-even ACoS 131% and 128% on the same page
```

### 4. ScribeCount Permafree Series Calculator

URL: https://scribecount.com/tools/permafree-series-calculator

- [Observed] Inputs: book 1 price, book 1 royalty %, average sequel royalty per sale ($2.80 default), number of books, free downloads per month, paid sales per month, and read-through % per book. Output: a monthly paid vs permafree comparison and a per-book table.
- [Observed] Defaults show paid book 1 at $279, paid series at $119, and paid total at $398. Permafree: book 1 $0, series $743, total $743. Difference: +$344 per month. Checks by hand: 80 × $4.99 × 70% = $279.44. The sequel chain from 80 readers at 35% and $2.80 is $118.80. The permafree chain from 500 free readers is $742.50. The math is consistent.
- [Observed] The per-book table keeps the same 35% step at each book: 35.0, 12.3, 4.3, 1.5. The FAQ says read-through drops by 10 to 15 percentage points for each later book. The math does not do that.
- [Observed] Series length set to 1 gives "−$279/month", and paid wins. That works.
- [Observed] Read-through set to 0% left the results unchanged, which suggests the 0 is ignored (inferred). A blank free-downloads field counts as 0 with no error message (result "−$398/month").
- [Documented] FAQ: at least 20 to 30% of readers must continue to book 2 for permafree to pay. Strong series can reach 40 to 60%. No source given.
- [Inferred] The user must enter the sequel royalty. The tool does not derive it from the price band.
- [Unknown] The source for the 20 to 30% and 40 to 60% ranges.

```text
500 free downloads, 35% read-through, 5 books, $2.80 sequel royalty -> permafree +$344 per month
```

### 5. ScribeCount KENP Earnings Estimator

URL: https://scribecount.com/tools/kenp-earnings-estimator

- [Observed] Inputs: monthly KENP pages read, KENP rate per page (default $0.00452, labeled "mid-2025 average"), book price, royalty %, and the book's KENPC page count. Outputs: monthly and annual KU earnings, earnings per 1,000 pages, copies needed at the direct royalty, and pages per sale.
- [Observed] Correct example: 50,000 pages at $0.00482 gives $241.00 a month. Checks: 50,000 × $0.00482 = $241.00. Edge case: 0 pages gives $0.00. Wrong input: a blank rate silently uses $0.00452 and shows $226.00, with no error message.
- [Observed] Copy error in the output: "A reader must read 242% of your book's KENPC to equal one sale." The next line repeats "242% of your KENPC of your KENPC."
- [Observed] Static text says "Amazon KDP: 70% for $2.99 to $9.99, 35% outside that range." Out of date.
- [Documented] The page says Amazon announces the rate each month and asks users to "adjust to this month's actual rate."
- [Inferred] An annual projection at one fixed rate suggests more certainty than a monthly rate allows.
- [Unknown] Whether a 3,000 KENP cap applies. The input is monthly pages, so the cap may not apply. Not tested.

```text
50,000 KENP pages × $0.00482 -> $241.00 per month (about 69 copies at $3.49 royalty)
```

### 6. Kindlepreneur KENP Calculator

URL: https://kindlepreneur.com/kenp-calculator/

- [Observed] One input for pages in the book, and a marketplace select. On load the result is blank. The output is "Per Book Royalty" for a full read, using "Per Page Feb 2026 Royalty: $0.00458." There is no rate field.
- [Observed] Correct example: 300 pages gives $1.3740. Checks: 300 × $0.00458. Edge case: 4,000 pages gives $18.32, with no cap. Wrong input: −5 pages gives −$0.0229, with no error message.
- [Documented] Amazon's rule: a maximum of 3,000 KENPC per title per customer, applied "each time your Kindle eBook is borrowed and read" (https://kdp.amazon.com/help/topic/G201541140). At $0.00458, the cap is $13.74. The tool shows $18.32 for 4,000 pages, so long books are overstated.
- [Documented] Page text: "Amazon changes the page royalty every month."
- [Inferred] Users cannot set the current month's rate, so the figure goes stale.
- [Unknown] Whether the marketplace choice changes the rate. Not tested.

```text
300 pages, Amazon.com -> $1.3740 per full read
```

### 7. Univers Studio KDP Royalty & Ads Calculator

URL: https://univers.studio/ads-calculator/

- [Observed] Three tools in one: profitable CPC, ACOS analyzer, and budget planner. Inputs: price, royalty (60% paperback, 70% ebook KDP Select, 35% ebook standard), printing cost, target ACOS (10% to 100%), and conversion rate (1% to 30%). One book only.
- [Observed] Correct example: $4.99 at 70% with $0 printing gives royalty $3.49 (checks: 0.70 × $4.99) and max CPC $0.15 (checks: 0.30 × $4.99 × 0.10).
- [Observed] Edge case: $12.99 at 70% gives royalty $9.09 and max CPC $0.39, with no band warning. The page treats $12.99 as current.
- [Observed] Wrong input: −$4.99 gives royalty "$-1.50" and CPC "$-0.15", with no error message.
- [Observed] No file size or VAT input. Checked against KDP's formula: a 2 MB book at $4.99 in the US pays 0.70 × ($4.99 − $0.30) = $3.28, not $3.49.
- [Inferred] The paperback royalty is fixed at 60%. Paperbacks under $9.99 earn 50% under KDP's rules, so this overstates them. Not tested.
- [Documented in the page] "Conversion 5-15% is typical for KDP." No source given.

```text
$4.99 ebook at 70%, target ACOS 30%, conversion 10% -> royalty $3.49, max CPC $0.15
```

### 8. Vappingo KDP Royalty Calculator guide

URL: https://www.vappingo.com/word-blog/kdp-royalty-calculator/

- [Observed] Titled as a calculator, but it is a guide with no form. Our page scan found only a search box and sign-up forms. The page says "Updated September 2026."
- [Observed] Facts on the page: "$12.99 current Amazon.com top price for the 70% eBook band"; print royalty rates of 50% and 60%; "$9.99 Amazon.com print threshold for the 60% standard royalty." These match the KDP pages we checked.
- [Documented in the page] It says to verify the final number against Amazon before publishing.
- [Inferred] The guide leads to paid services. The header links to services and a free quote.
- [Unknown] Whether a calculator loads later on the page. None appeared in our scan.
- Its series ads article is not a calculator. Per the search summary, it uses an illustrative 40% read-through and a break-even figure without the inputs, so use it only as an example of how sources differ.

```text
Guide only, no inputs. Figures read off the page and checked against KDP.
```

## Comparison

| Feature or answer | KDP paperback calc | BookWriter series | BookWriter ACoS | ScribeCount permafree | ScribeCount KENP | Kindlepreneur KENP | Univers Studio | Vappingo guide |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Two or more books in one calculation | No | Yes, up to 3 | Yes, up to 3 | Yes, set by user | No | No | No | Guide only |
| Read-through per step | n/a | Yes, from sales | One rate. Step 2 uses a hidden 50%. | One rate for every step | n/a | n/a | n/a | Guide only |
| 70% band at $2.99 to $12.99 | n/a (print) | No, shows $9.99 | No, shows $9.99 | User types a royalty | No, shows $9.99 | No royalty input | Yes | Yes, in text |
| Delivery cost from file size | n/a | No | No | No | No | No | No | Not seen |
| 3,000 KENP cap per borrow | n/a | n/a | n/a | n/a | Not tested | No: $18.32 at 4,000 pages | n/a | Not seen |
| Ad spend ceiling (CPC or ACoS) | No | No | Yes, but no response in our test | No | No | No | Yes | Formula in text |
| Free or discounted book 1 | n/a | No | No | Yes, monthly view | No | No | No | Series ads guide |
| Blank or negative input | Clear error messages | No response in test | No response in test | Blank = 0, no error message | Blank = default rate, no error message | Negative accepted | Negative accepted | n/a |
| Result on the page's own example | $1.39 royalty at 300 pages, checks | $6.84, checks. The page also shows $12.80 and $7.48. | 131% and 128% for the same inputs | $279, $119, $398 vs $743, checks | $226.00, checks | $1.3740, checks | $3.49 royalty, checks | n/a |

What stack127 should do, from this table:

- Show every step's read-through as its own input, and never hide a step rate.
- Use the $2.99 to $12.99 band, with the date, and the 35% rule below $2.99.
- Take delivery cost from file size. Do not use the average.
- Accept a KENP rate only with its month. Cap KU pages at 3,000 per borrow.
- Reject blank and negative inputs with a message. Do not replace them silently.

## Where competitors disagree

| Topic | What the sources say | Which is right, and why |
| --- | --- | --- |
| 70% price band | $9.99 top (both BookWriter tools, ScribeCount KENP). $12.99 (KDP pricing page, effective July 7, 2026; Univers Studio; Vappingo). | $12.99 on Amazon.com from July 7, 2026. KDP's own page states it. |
| How delivery cost enters the 70% royalty | KDP royalty options page: "70% of your list price without VAT, less delivery costs." KDP pricing page formula: 70% × (list − VAT − delivery). | The pricing page formula, which matches KDP's worked example (€1.27). The royalty options sentence is looser. |
| Average delivery cost | KDP royalty options page: "average delivery costs are $0.06 per unit sold" | Use the per-MB rate × file size. The $0.06 is an average across books of different sizes. A 2 MB book pays $0.30 in the US. |
| Series value for the same BookWriter example | "about $12.80" (intro), "$7.48" (example row), "$6.84" (result) | $6.84. It matches $3.49 × 1.96 with the stated 60% steps. The other two cannot be reproduced from the inputs shown. |
| Break-even ACoS for the same BookWriter example | "131%" and "128%" for $4.99, 3 books, 55% | The 128% comes from a hidden 50% second step. The 131% cannot be reproduced from the page's formula. A tool should show every step as an input. |
| Read-through benchmark | Authorsgame: 50 to 60% healthy. Kindlepreneur: "neighborhood of 50 to 60%". ScribeCount: 20 to 30% to break even, 40 to 60% for strong series. BookWriter: 60% strong, 35% thin. | No source behind any of them. Treat as commonly quoted, not measured. |
| How read-through changes by book | ScribeCount FAQ: drops 10 to 15 points per later book | ScribeCount's own table keeps 35% at every step. Its math and its text disagree. Use one rate per step as input. |
| KENP per-page rate | $0.00452 (mid-2025 default; a Sep 2025 page also shows it). $0.00458 (Feb 2026, Kindlepreneur). $0.00482 (April 2026, profitable.app). | Each is a different month, and two are third-party. KDP sets the rate monthly and announces it in the community forum. Use the user's rate with its month. |
| KU example arithmetic | Kindlepreneur: "227 ÷ 196 = 86.3%" | 196 ÷ 227 = 86.3%. 227 ÷ 196 = 115.8%. The article reverses the division. Its sales example (247 ÷ 428 = 57.7%) is correct. |
| Attribution window | Vappingo: 14-day Sponsored Products click window. No brand halo for books. | Not confirmed. The Amazon Ads guide we read does not state it. Keep it as unknown until Amazon's own help confirms it. |
| Paperback royalty | Univers Studio offers 60% only. KDP's paperback page: 50% at or below $9.98, 60% at or above $9.99. | KDP's paperback page. The Univers option is incomplete. |

## How stack127 can win

- What the searcher needs that no top result gives: one answer that puts series value, KU reads, and the ad ceiling on one page. The top tool covers read-through only, and its results did not respond in our test. ScribeCount covers free vs paid only. Univers covers one book.
- Mistakes competitors make that we will avoid: the old $9.99 band (three tools); a fixed KENP rate (Kindlepreneur, Feb 2026); no 3,000 KENP cap (Kindlepreneur, $18.32 for 4,000 pages); blank and negative inputs that pass silently; results that disagree with the page's own example; a hidden step rate; FAQ text that disagrees with the math; a reversed division in an example; and benchmarks graded as good or bad.
- Questions the page must answer to be the most useful result:
  1. What is one new book 1 reader worth across the series?
  2. What is the most I can pay for one new reader, and what CPC or ACoS does that mean?
  3. Which read-through should I use, and where in my KDP reports do I find the numbers?
  4. Does a free or discounted book 1 pay, under KDP's free and Countdown rules?
  5. Why is my royalty report lower than the estimate? Delivery cost, VAT, price matching, and KU timing are the usual causes.
  6. Which KENP rate do I use, and which month is it from?
- Content angles competitors skip:
  - Worked examples built from Amazon's own formulas, such as the €1.27 example and a $4.99 book with a 2 MB file.
  - Honest limits: the read-through is unknown until the author has data, there is no sourced benchmark, and KU reads count pages, not finishes.
  - Dated sources, with the effective date of the $12.99 band.
  - Sensitivity in place of a grade: show the result at 30%, 50%, and 70% read-through.
  - Cash timing: royalties arrive about 60 days after the month of sale, while ad spend is paid up front.
- Scope candidates for the planner to test. The planner decides the interface.
  - Basic: US ebook price, number of books, book 1 and book 2 sales for the last 30 days, and cost per click or cost per new reader. Output: the value of one new book 1 reader, and the most to pay for one.
  - Advanced: each step's read-through, file size and delivery cost, VAT for other marketplaces, KU pages per book with the KENP rate and its month, Countdown or free days, and paperback.
- Reuse existing code. `lib/kdp/royalty-calculator.ts` already uses the $2.99 to $12.99 band. `lib/kdp/kenp.ts` has `KDP_KENP_SOURCES` and a `rateBasis` label (`kdp-reported` or `planning-assumption`). Use the same labels so the two tools agree.

## Blockers

- No live KENP rate. The monthly per-page rate is not on any KDP help page we read. The KDP community forum search returned nothing for September or October 2026. The tool needs the user's rate with its month, labeled as entered. This limits automatic rates, not the build.
- No sourced read-through benchmark. The tool should not grade results. This is not a build blocker.
- Ad attribution. Amazon's Ads guide does not define ACoS or the attribution window. Use the standard ACoS formula and mark the window as unknown until Amazon's help confirms it.
- Countdown and price-matching royalties come from KDP's text. Confirm one real royalty report before release, since discounted book 1 depends on this rule. We have no KDP account access here.
- Reddit could not be searched. The KBoards thread is gated (HTTP 402 through its redirect). The KDP community forum returned nothing. User evidence is thinner than planned.
- The two BookWriter calculators did not respond in headless Chrome. We did not find the cause. Re-test in a normal browser before citing them as working or broken.
- No paid APIs, accounts, maintained datasets, or background jobs are needed. Nothing here needs approval.

## Sources

Official KDP and Amazon pages (all checked 2026-10-13):

- [KDP eBook List Price Requirements](https://kdp.amazon.com/en_US/help/topic/G200634560): 70% band $2.99 to $12.99 effective July 7, 2026; 35% minimums and $200 maximum.
- [KDP Digital Book Pricing](https://kdp.amazon.com/help/topic/G200634500): royalty formulas, delivery cost per MB, price matching, Countdown Deals; last updated April 21, 2026.
- [KDP royalty options](https://kdp.amazon.com/help/topic/G200644210): 70% and 35% options; "average delivery costs are $0.06 per unit sold"; €1.27 worked example.
- [KDP Kindle Unlimited royalties and KENPC](https://kdp.amazon.com/help/topic/G201541140): 3,000 KENPC cap, first reads, payout formula, monthly fund and 15th finalization date.
- [KDP Select royalties](https://kdp.amazon.com/en_US/help/topic/G201541130): fund review monthly, first reads (read through the page summary only).
- [KDP Royalties Estimator](https://kdp.amazon.com/en_US/help/topic/G6BZ4M9PVJ8YSCW8): KENP rate changes monthly; use the last announced rate; payment about 60 days after the month of sale; fund total $69.4 million for August 2026.
- [KDP Select enrollment](https://kdp.amazon.com/en_US/help/topic/GD9PMU58BV24QFZ7): 90-day term; ebook exclusive to the Kindle Store; distribution limited to KDP and public libraries during the term; automatic renewal.
- [KDP Free Book Promotions](https://kdp.amazon.com/en_US/help/topic/G201298240): up to 5 free days per 90-day enrollment; start on day 2 or later; no rollover.
- [KDP Printing cost](https://kdp.amazon.com/en_US/help/topic/G201834340): fixed plus per-page formula; US black ink table.
- [KDP Paperback royalty](https://kdp.amazon.com/en_US/help/topic/G201834330): 50% and 60% tiers; Expanded Distribution 40%; royalty formula.
- [KDP Printing Costs and Royalty Calculator](https://kdp.amazon.com/en_US/royalty-calculator): tested, paperback only.
- [Amazon Ads: ads math](https://advertising.amazon.com/en-gb/library/guides/ads-math): checked for ACoS and attribution; neither is defined there.

Published research and guides:

- [Authorsgame, Series vs Standalone](https://authorsgame.com/read-the-market/series-vs-standalone-first-book): read-through benchmark table "as of 2026"; KU borrow floor 75%.
- [Kindlepreneur, How to Calculate Series Read-Through](https://kindlepreneur.com/calculate-series-read-through/): updated Nov 8, 2025; 50 to 60% phrase; 247 ÷ 428 example; reversed KU division.
- [Written Word Media, 2025 Indie Author Survey Results](https://www.writtenwordmedia.com/2025-indie-author-survey-results-insights-into-self-publishing-for-authors/): 1,346 responses; 1 to 3 books and under $100 a month; KDP Select split; $636 average marketing spend.
- [Vappingo, KDP Royalty Calculator: Current 2026 Pricing Rules](https://www.vappingo.com/word-blog/kdp-royalty-calculator/): updated September 2026; guide only.
- [Vappingo, Amazon Ads for series books](https://www.vappingo.com/word-blog/amazon-ads-series-books/): search summary only; 14-day window claim not verified.
- [Jane Friedman, Amazon ads article](https://janefriedman.com/amazon-ads-cant-live-with-em-cant-live-without-em/): paywalled; the bid figure was not visible. Not used for numbers.
- [profitable.app, KENP rate](https://profitable.app/kdp/stats/kenp-rate): third-party April 2026 figure of $0.00482. Search summary only.
- [Bookbloom, KENP calculator](https://www.bookbloom.io/tools/kenp-calculator): third-party September 2025 figure of $0.00452. Search summary only.
- Ad cost per click vendor pages, search summaries only: [Ad Badger](https://www.adbadger.com/blog/amazon-advertising-stats/), [Autron](https://autron.ai/blog/amazon-advertising-benchmarks-2026), [Salesduo](https://salesduo.com/blog/amazon-advertising-benchmarks/), [Clickstera](https://clickstera.com/blog/amazon-advertising-benchmarks-2026-cpc-ctr-a-co-s-ta-co-s-by-category), [Keywords.am](https://keywords.am/blog/amazon-cpc-benchmarks/), [Sequence Commerce](https://sequencecommerce.com/amazon-advertising-benchmarks/).

Tools tested or read:

- [ScribeCount Permafree Series Calculator](https://scribecount.com/tools/permafree-series-calculator): tested; FAQ read.
- [ScribeCount KENP Earnings Estimator](https://scribecount.com/tools/kenp-earnings-estimator): tested.
- [Kindlepreneur KENP Calculator](https://kindlepreneur.com/kenp-calculator/): tested.
- [BookWriter Series Read-Through Calculator](https://www.bookwriter.vip/kdp-series-read-through-calculator): tested; no response in headless run.
- [BookWriter Amazon Ads ACoS Calculator](https://www.bookwriter.vip/amazon-ads-acos-calculator): tested; no response in headless run.
- [Univers Studio KDP Royalty & Ads Calculator](https://univers.studio/ads-calculator/): tested.

Community and author sources (titles, search summaries, or gated; not read in full):

- [KBoards, What is a realistic series read-through rate?](https://www.kboards.com/threads/what-is-a-realistic-series-read-through-rate.264285/): HTTP 402 through its redirect; title and summary only.
- [KBoards, Calculating return on FB ads, read through](https://www.kboards.com/threads/calculating-return-on-fb-ads-read-through.253960/): title only.
- [KBoards, AMS ads on books 2 and 3 in a series](https://www.kboards.com/threads/ams-ads-on-books-2-3-in-a-series.263475/): title only.
- [KBoards poll, sell-through for book 2 if book 1 is permafree](https://www.kboards.com/threads/poll-what-is-your-series-sell-through-rate-for-book-2-if-book-1-is-permafree.253708/): title only.
- [Goodreads author post, Going permafree?](https://www.goodreads.com/author_blog_posts/24274964-going-permafree?tab=book): undated; search snippet.
- [Substack, Facebook ads avoiding Kindle Unlimited](https://matthewwquin.substack.com/p/facebook-ads-avoiding-kindle-unlimited): search summary.

Repo files used:

- `lib/kdp/royalty-calculator.ts` (the $2.99 to $12.99 band).
- `lib/kdp/kenp.ts` (`KDP_KENP_SOURCES`, `rateBasis`).
- `content_docs/kdp-royalty-calculator/tool-spec.md`, `content_docs/kindle-unlimited-kenp-earnings-calculator/tool-spec.md`, `content_docs/kdp-break-even-acos-calculator/tool-spec.md`, `content_docs/kdp-price-profit-calculator/tool-spec.md`, and `content_docs/kdp-tools/brief.md` (related tool jobs and the catalog brief).
