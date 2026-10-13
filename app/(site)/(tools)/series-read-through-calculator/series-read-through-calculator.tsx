"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  UiButton,
  UiChoiceGroup,
  UiDisclosure,
  UiQuantityInput,
  UiRepeatableList,
  UiShareAction,
  UiTextField,
  uiOption,
  uiSetSummary,
  type UiShareParams,
} from "@/app/ui/controls";
import {
  UiActionRow,
  UiDataTable,
  UiMetricGroup,
  UiPrimaryResult,
  UiStatus,
  UiStatusWord,
  type UiMetric,
} from "@/app/ui/display";
import { ToolFieldRow, ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import {
  SERIES_MAX_BOOKS,
  SERIES_MIN_BOOKS,
  calculateSeriesReadThrough,
  type SeriesReadThroughInput,
  type SeriesReadThroughValues,
} from "@/lib/kdp/series-read-through.ts";
import { SeriesLadder, bookStatus, seriesMoney as money } from "./series-ladder";
import styles from "./series-read-through-calculator.module.css";

type BookRow = { id: string; priceText: string; salesText: string; kuPagesText: string; kenpcText: string };
type Input = Omit<SeriesReadThroughInput, "books"> & { books: BookRow[] };
type Values = SeriesReadThroughValues;
type Errors = Partial<Record<string, string>>;
type Shown = { input: Input; values: Values };

let rowCount = 0;
function bookRow(priceText = "", salesText = "", kuPagesText = "", kenpcText = ""): BookRow {
  rowCount += 1;
  return { id: `book-${rowCount}`, priceText, salesText, kuPagesText, kenpcText };
}

const emptyFields = {
  fileSizeText: "",
  kenpRateText: "",
  kenpMonthText: "",
  adCostText: "",
  adCostUnit: "acos",
  conversionText: "",
  profitTargetText: "",
  dealPriceText: "",
  dealKind: "price-change",
  dealReadThroughText: "",
} as const;

function exampleInput(): Input {
  return { ...emptyFields, books: [bookRow("4.99", "100"), bookRow("4.99", "55"), bookRow("4.99", "44")] };
}

const adUnits = [uiOption("acos", "% ACoS"), uiOption("per-reader", "$ per reader")];
const dealKinds = [uiOption("price-change", "Price change"), uiOption("countdown", "Countdown Deal")];
const partFields = ["fileSize", "kenpRate", "kenpMonth", "adCost", "adCostUnit", "conversion", "profitTarget", "dealPrice", "dealKind", "dealReadThrough"];

function isAdvanced(field: string) {
  return partFields.includes(field) || field.startsWith("kuPages.") || field.startsWith("kenpc.");
}

/** Errors in the order the fields appear on the page. */
function firstError(errors: Errors, bookCount: number): string | null {
  const order = [
    ...Array.from({ length: bookCount }, (_, index) => [`price.${index}`, `sales.${index}`]).flat(),
    "books",
    "fileSize",
    "kenpRate",
    "kenpMonth",
    ...Array.from({ length: bookCount }, (_, index) => [`kuPages.${index}`, `kenpc.${index}`]).flat(),
    "adCost",
    "adCostUnit",
    "conversion",
    "profitTarget",
    "dealPrice",
    "dealKind",
    "dealReadThrough",
  ];
  return order.find((field) => errors[field]) ?? null;
}

function hasKuPages(row: BookRow) {
  const text = row.kuPagesText.trim().replace(/,/g, "");
  return text !== "" && !/^0+$/.test(text);
}

function engineInput(input: Input): SeriesReadThroughInput {
  return { ...input, books: input.books.map(({ id: _id, ...book }) => book) };
}

function calculate(input: Input) {
  return calculateSeriesReadThrough(engineInput(input));
}

function advancedCount(input: Input) {
  return [
    input.fileSizeText,
    input.kenpRateText,
    input.kenpMonthText,
    input.books.some((row) => row.kuPagesText.trim() || row.kenpcText.trim()) ? "ku" : "",
    input.adCostText,
    input.conversionText,
    input.profitTargetText,
    input.dealPriceText,
    input.dealReadThroughText,
  ].filter((value) => value.trim() !== "").length;
}

/* ---------------- shared links ---------------- */

const shareParamNames = ["p", "s", "ku", "kc", "size", "rate", "month", "ad", "adu", "cv", "profit", "deal", "dk", "drt"] as const;

export function isSharedLink(get: (name: string) => string): boolean {
  return shareParamNames.some((name) => get(name) !== "");
}

export function inputFromQuery(get: (name: string) => string): Input {
  const list = (name: string) => (get(name) === "" ? [] : get(name).split(","));
  const prices = list("p");
  const sales = list("s");
  const pages = list("ku");
  const kenpcs = list("kc");
  const count = Math.min(SERIES_MAX_BOOKS, Math.max(SERIES_MIN_BOOKS, prices.length, sales.length));
  return {
    books: Array.from({ length: count }, (_, index) => bookRow(prices[index] ?? "", sales[index] ?? "", pages[index] ?? "", kenpcs[index] ?? "")),
    fileSizeText: get("size"),
    kenpRateText: get("rate"),
    kenpMonthText: get("month"),
    adCostText: get("ad"),
    adCostUnit: get("adu") === "per-reader" ? "per-reader" : "acos",
    conversionText: get("cv"),
    profitTargetText: get("profit"),
    dealPriceText: get("deal"),
    dealKind: get("dk") === "countdown" ? "countdown" : "price-change",
    dealReadThroughText: get("drt"),
  };
}

function shareParams(input: Input): UiShareParams {
  // Counts can carry thousands commas, which would split the lists, so they travel as plain digits.
  const join = (key: keyof Omit<BookRow, "id">, plain = false) => {
    const values = input.books.map((row) => (plain ? row[key].trim().replace(/,/g, "") : row[key].trim()));
    return values.some((value) => value !== "") ? values.join(",") : null;
  };
  const usesDeal = input.dealPriceText.trim() !== "";
  return {
    p: join("priceText"),
    s: join("salesText", true),
    ku: join("kuPagesText", true),
    kc: join("kenpcText", true),
    size: input.fileSizeText.trim() || null,
    rate: input.kenpRateText.trim() || null,
    month: input.kenpMonthText.trim() || null,
    ad: input.adCostText.trim() || null,
    adu: input.adCostText.trim() && input.adCostUnit === "per-reader" ? "per-reader" : null,
    cv: input.conversionText.trim() || null,
    profit: input.profitTargetText.trim() || null,
    deal: input.dealPriceText.trim() || null,
    dk: usesDeal && input.dealKind === "countdown" ? "countdown" : null,
    drt: usesDeal ? input.dealReadThroughText.trim() || null : null,
  };
}

/* ---------------- the tool ---------------- */

export function SeriesReadThroughCalculator({ initialInput }: { initialInput?: Input }) {
  const shared = initialInput !== undefined;
  const [first] = useState(() => {
    const example = exampleInput();
    const exampleResult = calculate(example);
    if (exampleResult.status !== "calculated") throw new Error("The series read-through example must calculate.");
    const exampleShown: Shown = { input: example, values: exampleResult.values };
    if (!initialInput) return { input: example, shown: exampleShown, errors: {} as Errors, stale: false };
    const result = calculate(initialInput);
    return result.status === "calculated"
      ? { input: initialInput, shown: { input: initialInput, values: result.values }, errors: result.fieldErrors as Errors, stale: false }
      : { input: initialInput, shown: exampleShown, errors: result.fieldErrors as Errors, stale: true };
  });
  const [input, setInput] = useState<Input>(first.input);
  const [shown, setShown] = useState<Shown>(first.shown);
  const [errors, setErrors] = useState<Errors>(first.errors);
  const [isExample, setIsExample] = useState(!shared || first.stale);
  const [isStale, setIsStale] = useState(first.stale);
  const [advancedOpen, setAdvancedOpen] = useState(Object.keys(first.errors).some(isAdvanced));
  const [focusTarget, setFocusTarget] = useState<string | null>(shared ? firstError(first.errors, first.input.books.length) : null);
  const formRef = useRef<HTMLFormElement>(null);
  const answerRef = useRef<HTMLOutputElement>(null);

  // Focus waits for a render, so a field inside Advanced exists before it gets focus.
  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "answer") answerRef.current?.focus();
    else if (focusTarget === "books") formRef.current?.querySelector<HTMLElement>("[data-repeatable-add]")?.focus();
    else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusTarget}"]`)?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  function edit(next: Input, fields: string[]) {
    setInput(next);
    setIsStale(true);
    if (fields.some((field) => field in errors)) {
      setErrors((current) => {
        const rest = { ...current };
        for (const field of fields) delete rest[field];
        return rest;
      });
    }
  }

  function setField(key: Exclude<keyof Input, "books">, value: string, fields: string[]) {
    edit({ ...input, [key]: value }, fields);
  }

  function setBook(index: number, key: keyof Omit<BookRow, "id">, value: string, fields: string[]) {
    edit({ ...input, books: input.books.map((row, at) => (at === index ? { ...row, [key]: value } : row)) }, fields);
  }

  /** Row errors are keyed by position, so they stop matching once the list changes length. */
  function dropBookErrors() {
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !/^(price|sales|kuPages|kenpc)\.|^books$/.test(key))));
  }

  function addBook() {
    const last = input.books[input.books.length - 1];
    edit({ ...input, books: [...input.books, bookRow(last?.priceText ?? "")] }, []);
    dropBookErrors();
  }

  function removeBook(id: string) {
    edit({ ...input, books: input.books.filter((row) => row.id !== id) }, []);
    dropBookErrors();
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const result = calculate(input);
    const nextErrors = result.fieldErrors as Errors;
    setErrors(nextErrors);
    if (result.status === "calculated") {
      setShown({ input, values: result.values });
      setIsExample(false);
      setIsStale(false);
    }
    const target = firstError(nextErrors, input.books.length);
    if (target && isAdvanced(target)) setAdvancedOpen(true);
    setFocusTarget(target ?? "answer");
  }

  function reset() {
    const example = exampleInput();
    const result = calculate(example);
    setInput(example);
    if (result.status === "calculated") setShown({ input: example, values: result.values });
    setErrors({});
    setIsExample(true);
    setIsStale(false);
    setAdvancedOpen(false);
  }

  const usesKu = input.books.some(hasKuPages);
  const atMax = input.books.length >= SERIES_MAX_BOOKS;

  return (
    <ToolWorkbench label="KDP series read-through calculator">
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <div className={styles.books}>
          <UiRepeatableList
            addDescription={errors.books ?? (atMax ? `Up to ${SERIES_MAX_BOOKS} books` : undefined)}
            addDescriptionIsError={Boolean(errors.books)}
            addDisabled={atMax}
            addLabel="Add book"
            ariaLabel="Books in the series"
            items={input.books}
            minItems={SERIES_MIN_BOOKS}
            onAdd={addBook}
            onRemove={removeBook}
            removeLabel={(_, index) => `Remove book ${index + 1}`}
            renderItem={(row, index) => (
              <div aria-label={`Book ${index + 1}`} className={styles.bookRow} data-later={index > 0 || undefined} role="group">
                <span aria-hidden="true" className={styles.bookName}>Book {index + 1}</span>
                <UiTextField
                  dataFocusKey={`price.${index}`}
                  error={errors[`price.${index}`]}
                  hint={index === 0 ? "The Kindle price on Amazon.com. Use 0 for a free book." : undefined}
                  inputMode="decimal"
                  label="Price"
                  onChange={(value) => setBook(index, "priceText", value, [`price.${index}`, "dealPrice", "dealKind", "adCost"])}
                  required
                  suffix="USD"
                  value={row.priceText}
                />
                <UiTextField
                  dataFocusKey={`sales.${index}`}
                  error={errors[`sales.${index}`]}
                  hint={index === 0 ? "Use the same dates for every book, such as the last 30 days. For a free book, enter free downloads." : undefined}
                  inputMode="numeric"
                  label="Copies sold"
                  onChange={(value) => setBook(index, "salesText", value, [`sales.${index}`])}
                  required
                  value={row.salesText}
                />
              </div>
            )}
          />
        </div>

        <UiDisclosure
          isExpanded={advancedOpen}
          label="File size, KU reads, ads, and deals"
          onExpandedChange={setAdvancedOpen}
          summary={uiSetSummary(advancedCount(input))}
        >
          <div className={styles.advanced}>
            <ToolFieldRow className={styles.thirds}>
              <UiTextField
                dataFocusKey="fileSize"
                error={errors.fileSize}
                hint="Empty uses 2 MB. KDP shows your size on the pricing page."
                inputMode="decimal"
                label="Converted file size"
                onChange={(value) => setField("fileSizeText", value, ["fileSize"])}
                placeholder="2"
                suffix="MB"
                value={input.fileSizeText}
              />
            </ToolFieldRow>

            <section aria-label="Kindle Unlimited" className={styles.group}>
              <h3 className={styles.groupLabel}>Kindle Unlimited</h3>
              <ToolFieldRow className={styles.thirds}>
                <UiTextField
                  dataFocusKey="kenpRate"
                  error={errors.kenpRate}
                  hint="KDP's per-page rate for the month the pages were read."
                  inputMode="decimal"
                  label="KENP rate per page"
                  onChange={(value) => setField("kenpRateText", value, ["kenpRate"])}
                  required={usesKu}
                  suffix="USD"
                  value={input.kenpRateText}
                />
                <UiTextField
                  dataFocusKey="kenpMonth"
                  error={errors.kenpMonth}
                  hint="The month the rate is for, as year and month."
                  label="Rate month"
                  onChange={(value) => setField("kenpMonthText", value, ["kenpMonth"])}
                  placeholder="YYYY-MM"
                  required={usesKu}
                  value={input.kenpMonthText}
                />
              </ToolFieldRow>
              <div className={styles.kuRows}>
                {input.books.map((row, index) => (
                  <div aria-label={`Book ${index + 1} KU reads`} className={styles.kuRow} data-later={index > 0 || undefined} key={row.id} role="group">
                    <span aria-hidden="true" className={styles.bookName}>Book {index + 1}</span>
                    <UiTextField
                      dataFocusKey={`kuPages.${index}`}
                      error={errors[`kuPages.${index}`]}
                      hint={index === 0 ? "KENP read in KDP Reports, over the same dates as its sales." : undefined}
                      inputMode="numeric"
                      label="KU pages read"
                      onChange={(value) => setBook(index, "kuPagesText", value, [`kuPages.${index}`, `kenpc.${index}`, "kenpRate", "kenpMonth"])}
                      value={row.kuPagesText}
                    />
                    <UiTextField
                      dataFocusKey={`kenpc.${index}`}
                      error={errors[`kenpc.${index}`]}
                      hint={index === 0 ? "On your Bookshelf, open Promote and Advertise for the book." : undefined}
                      inputMode="numeric"
                      label="KENPC"
                      onChange={(value) => setBook(index, "kenpcText", value, [`kenpc.${index}`])}
                      required={hasKuPages(row)}
                      suffix="pages"
                      value={row.kenpcText}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section aria-label="Ads" className={styles.group}>
              <h3 className={styles.groupLabel}>Ads</h3>
              <ToolFieldRow className={styles.thirds}>
                <UiQuantityInput
                  dataFocusKey="adCost"
                  error={errors.adCost ?? errors.adCostUnit}
                  hint="What ads cost you now, as ACoS on book 1 or per new reader."
                  label="Your ad cost"
                  onChange={(value) => setField("adCostText", value, ["adCost"])}
                  onUnitChange={(value) => setField("adCostUnit", value, ["adCost", "adCostUnit"])}
                  unit={input.adCostUnit}
                  units={adUnits}
                  value={input.adCostText}
                />
                <UiTextField
                  dataFocusKey="conversion"
                  error={errors.conversion}
                  hint="Book 1 orders divided by ad clicks."
                  inputMode="decimal"
                  label="Conversion rate"
                  onChange={(value) => setField("conversionText", value, ["conversion"])}
                  suffix="%"
                  value={input.conversionText}
                />
                <UiTextField
                  dataFocusKey="profitTarget"
                  error={errors.profitTarget}
                  hint="Empty means break even."
                  inputMode="decimal"
                  label="Profit to keep per reader"
                  onChange={(value) => setField("profitTargetText", value, ["profitTarget"])}
                  suffix="USD"
                  value={input.profitTargetText}
                />
              </ToolFieldRow>
            </section>

            <section aria-label="Book 1 deal" className={styles.group}>
              <h3 className={styles.groupLabel}>Book 1 deal</h3>
              <ToolFieldRow className={styles.thirds}>
                <UiTextField
                  dataFocusKey="dealPrice"
                  error={errors.dealPrice}
                  hint="A sale price for book 1. Use 0 for free."
                  inputMode="decimal"
                  label="Deal price"
                  onChange={(value) => setField("dealPriceText", value, ["dealPrice", "dealKind"])}
                  suffix="USD"
                  value={input.dealPriceText}
                />
                <UiChoiceGroup
                  dataFocusKey="dealKind"
                  error={errors.dealKind}
                  hint="A Countdown Deal keeps the 70% royalty below $2.99."
                  label="Deal type"
                  name="dealKind"
                  onChange={(value) => setField("dealKind", value, ["dealKind", "dealPrice"])}
                  options={dealKinds}
                  value={input.dealKind}
                />
                <UiTextField
                  dataFocusKey="dealReadThrough"
                  error={errors.dealReadThrough}
                  hint="Empty uses your own book 1 to book 2 rate."
                  inputMode="decimal"
                  label="Deal readers who read book 2"
                  onChange={(value) => setField("dealReadThroughText", value, ["dealReadThrough"])}
                  suffix="%"
                  value={input.dealReadThroughText}
                />
              </ToolFieldRow>
            </section>
          </div>
        </UiDisclosure>

        <UiActionRow>
          {isStale ? <UiStatus>Inputs changed</UiStatus> : null}
          <UiButton type="submit" variant="primary">Calculate reader value</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </UiButton>
        </UiActionRow>
      </form>

      <ToolResult label="Reader value result" stale={isStale}>
        <ResultView answerRef={answerRef} isExample={isExample} shown={shown} />
      </ToolResult>
    </ToolWorkbench>
  );
}

/* ---------------- the result ---------------- */

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function readersText(readers: number) {
  return readers > 0 && readers < 1 ? "<1" : whole.format(readers);
}

function leadMetrics(values: Values, input: Input): UiMetric[] {
  const profitSet = input.profitTargetText.trim() !== "" && (values.ads?.profitTargetCents ?? 0) > 0;
  return [
    {
      id: "acos",
      label: profitSet ? "Highest ACoS on book 1" : "Break-even ACoS on book 1",
      hint: "Ad spend ÷ ad sales, as Amazon Ads reports it.",
      value: values.highestAcosTenths === null ? "—" : `${(values.highestAcosTenths / 10).toFixed(1)}%`,
    },
    {
      id: "ten-points",
      label: "10 more points to book 2 adds",
      hint: "What one new reader is worth extra if 10 more of every 100 read book 2.",
      value: values.tenPointsCents === null ? "—" : money(values.tenPointsCents),
    },
  ];
}

function adMetrics(values: Values, input: Input): UiMetric[] | null {
  const ads = values.ads;
  const used = [input.adCostText, input.conversionText, input.profitTargetText].some((text) => text.trim() !== "");
  if (!ads || !used) return null;
  const items: UiMetric[] = [];
  if (ads.profitTargetCents > 0) {
    items.push({ id: "most", label: "Most to pay per reader", hint: "The reader's value, less the profit you keep.", value: money(ads.mostToPayCents) });
  }
  if (ads.cost) {
    items.push({ id: "cost", label: "Your cost per reader", value: money(ads.cost.costCents) });
    items.push({ id: "left", label: "Left per reader after ads", value: money(ads.cost.leftCents) });
  }
  if (ads.highestCpcCents !== null) {
    items.push({ id: "cpc", label: "Highest CPC", hint: "The most per click that still leaves your profit per reader.", value: money(ads.highestCpcCents) });
  }
  return items.length ? items : null;
}

function dealMetrics(values: Values): UiMetric[] | null {
  const deal = values.deal;
  if (!deal) return null;
  return [
    {
      id: "royalty",
      label: deal.kind === "free" ? "Royalty on a free copy" : `Royalty at ${money(deal.priceCents)}`,
      value: `${money(deal.royaltyCents)}${deal.rate ? ` at ${deal.rate}%` : ""}`,
    },
    { id: "value", label: "Each deal reader is worth", value: deal.valueCents === null ? "—" : money(deal.valueCents) },
    {
      id: "match",
      label: "Deal copies to match one full-price reader",
      value: deal.copiesToMatchTenths === null ? "—" : (deal.copiesToMatchTenths / 10).toFixed(1),
    },
  ];
}

function bookTable(values: Values) {
  const withKu = values.books.some((book) => book.ku);
  const columns = [
    { id: "book", label: "Book" },
    { id: "price", label: "Price", align: "right" as const },
    { id: "royalty", label: "Royalty per copy", align: "right" as const },
    ...(withKu ? [
      { id: "sales", label: "Copies sold", align: "right" as const },
      { id: "kuReads", label: "KU full reads", align: "right" as const },
      { id: "kuRead", label: "KU per full read", align: "right" as const },
    ] : []),
    { id: "readers", label: "Readers", align: "right" as const },
    { id: "worth", label: "Worth from this book on", align: "right" as const },
  ];
  const rows = values.books.map((book) => {
    const status = bookStatus(book);
    return {
      id: String(book.index),
      cells: {
        book: `Book ${book.index + 1}`,
        price: (
          <span className={styles.cell}>
            {book.limit ? <UiStatusWord>{status}</UiStatusWord> : null}
            {book.free ? "Free" : money(book.priceCents)}
          </span>
        ),
        royalty: book.free ? "$0.00" : `${money(book.royaltyCents)} at ${book.rate}%`,
        sales: whole.format(book.sales),
        kuReads: book.ku ? readersText(book.ku.fullReads) : "—",
        kuRead: book.ku ? (
          <span className={styles.cell}>
            {book.ku.capped ? <UiStatusWord>Capped</UiStatusWord> : null}
            {money(book.ku.perFullReadCents)}
          </span>
        ) : "—",
        readers: readersText(book.readers),
        worth: book.worthFromHereCents === null ? "—" : money(book.worthFromHereCents),
      },
    };
  });
  return <UiDataTable ariaLabel="Per book" columns={columns} rows={rows} />;
}

function ResultView({ answerRef, isExample, shown }: { answerRef: RefObject<HTMLOutputElement | null>; isExample: boolean; shown: Shown }) {
  const { input, values } = shown;
  const ads = adMetrics(values, input);
  const deal = dealMetrics(values);
  const count = values.books.length;

  return (
    <>
      <div className={styles.top}>
        <div className={styles.lead}>
          <UiPrimaryResult
            detail={(
              <span className={styles.detail}>
                {`across ${count} books`}
                {isExample ? <UiStatusWord>Example</UiStatusWord> : null}
              </span>
            )}
            inputRef={answerRef}
            label="A new book 1 reader is worth"
            value={money(values.readerValueCents)}
          />
          <UiMetricGroup ariaLabel="Ad ceiling and read-through gain" items={leadMetrics(values, input)} />
        </div>
        <SeriesLadder books={values.books} />
      </div>

      {ads || deal ? (
        <div className={styles.parts}>
          {ads ? (
            <section aria-label="Ads" className={styles.part}>
              <h3 className={styles.partLabel}>
                Ads
                {values.ads?.noRoom ? <UiStatusWord>No room for ad spend</UiStatusWord> : null}
              </h3>
              <UiMetricGroup ariaLabel="Ads" items={ads} layout="list" />
            </section>
          ) : null}
          {deal ? (
            <section aria-label="Book 1 deal" className={styles.part}>
              <h3 className={styles.partLabel}>
                Book 1 deal
                {values.deal?.usedOwnRate ? <UiStatusWord>Uses your book 2 rate</UiStatusWord> : null}
              </h3>
              <UiMetricGroup ariaLabel="Book 1 deal" items={deal} layout="list" />
            </section>
          ) : null}
        </div>
      ) : null}

      {bookTable(values)}

      <div className={styles.footer}>
        {values.kenp ? <UiStatus>{`KU at $${values.kenp.rateText} per page, ${values.kenp.month} rate`}</UiStatus> : null}
        <UiShareAction params={shareParams(input)} />
      </div>
    </>
  );
}
