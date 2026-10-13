"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import {
  UiButton,
  UiChoiceGroup,
  UiDisclosure,
  UiDownloadAction,
  UiShareAction,
  UiTextField,
  uiOption,
  uiSetSummary,
  type UiShareParams,
} from "@/app/ui/controls";
import { UiActionRow, UiMetricGroup, UiPrimaryResult, UiStatus, UiStatusWord, type UiMetric } from "@/app/ui/display";
import { ToolFieldRow, ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import {
  ISBN_BARCODE_EXAMPLE_INPUT,
  makeIsbnBarcode,
  renderIsbnBarcodePdf,
  renderIsbnBarcodePng,
  type IsbnBarcode,
  type IsbnBarcodeError,
  type IsbnBarcodeField,
  type IsbnBarcodeInput,
} from "@/lib/isbn-barcode-generator/engine.ts";
import styles from "./isbn-barcode-generator.module.css";

type Input = IsbnBarcodeInput;
type Errors = Partial<Record<IsbnBarcodeField, string>>;
type Shown = { input: Input; barcode: IsbnBarcode };

const EXAMPLE: Input = ISBN_BARCODE_EXAMPLE_INPUT;
const focusOrder: IsbnBarcodeField[] = ["isbn", "price", "size"];
const addOnOptions = [uiOption("include", "Include"), uiOption("none", "Leave off")];

/* ---------------- words ---------------- */

function errorText(error: IsbnBarcodeError): string {
  if (error.field === "isbn") {
    switch (error.code) {
      case "empty": return "Enter your ISBN.";
      case "characters": return "Use digits only. An ISBN-10 can end in X.";
      case "x-position": return "X can only be the last character of an ISBN-10.";
      case "length": return `An ISBN has 10 or 13 digits. This has ${error.digitCount ?? "a different number"}.`;
      case "includes-add-on": return "This ends with a price code. Put the price in List price.";
      case "prefix": return "An ISBN-13 starts with 978 or 979. This looks like a product barcode.";
      case "ismn": return "Numbers starting 979-0 are for printed music, not books.";
      case "check-digit": return error.form === "isbn10"
        ? "The last character doesn't match the first 9 digits. Look for a typo or two swapped digits."
        : "The last digit doesn't match the first 12. Look for a typo or two swapped digits.";
    }
  }
  if (error.field === "price") {
    switch (error.code) {
      case "format": return "Enter a price like 14.99, or leave it empty.";
      case "zero": return "$0 can't be printed. Leave it empty for no price.";
      case "code": return "Price codes run from 50001 to 59998, or 90000 for no price.";
      case "without-add-on": return "Clear the price, or include the add-on.";
    }
  }
  return "Enter a whole number from 80 to 200.";
}

const usd = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" });
const MM_PER_IN = 25.4;

function inches(mm: number) {
  return (mm / MM_PER_IN).toFixed(2);
}

function areaName(area: "kdp" | "ingramspark") {
  return area === "kdp" ? "KDP" : "IngramSpark";
}

/* ---------------- inputs ---------------- */

/** The parameters a shared link carries. Anything else in the address, such as tracking tags, is ignored. */
const shareParamNames = ["isbn", "price", "addon", "size"] as const;

export function isSharedLink(get: (name: string) => string): boolean {
  return shareParamNames.some((name) => get(name) !== "");
}

export function inputFromQuery(get: (name: string) => string): Input {
  return {
    isbnText: get("isbn"),
    priceText: get("price"),
    addOn: get("addon") === "none" ? "none" : "",
    sizeText: get("size"),
  };
}

function shareParams(input: Input): UiShareParams {
  return {
    isbn: input.isbnText.trim(),
    price: input.priceText.trim(),
    addon: input.addOn === "none" ? "none" : null,
    size: input.sizeText.trim(),
  };
}

function advancedCount(input: Input) {
  return [input.addOn === "none", input.sizeText.trim() !== ""].filter(Boolean).length;
}

function errorsFrom(list: readonly IsbnBarcodeError[]): Errors {
  const errors: Errors = {};
  for (const error of list) errors[error.field] ??= errorText(error);
  return errors;
}

/** Advanced opens for a size error, and for a price the Leave off choice rejects, so the cause is visible. */
function needsAdvanced(list: readonly IsbnBarcodeError[]) {
  return list.some((error) => error.field === "size" || (error.field === "price" && error.code === "without-add-on"));
}

function firstError(errors: Errors): IsbnBarcodeField | null {
  return focusOrder.find((field) => field in errors) ?? null;
}

/* ---------------- the tool ---------------- */

export function IsbnBarcodeGenerator({ initialInput }: { initialInput?: Input }) {
  const shared = initialInput !== undefined;
  const [first] = useState(() => {
    const example = makeIsbnBarcode(EXAMPLE);
    if (example.status !== "ready") throw new Error("The ISBN barcode example must make a barcode.");
    const exampleShown: Shown = { input: EXAMPLE, barcode: example.value };
    if (!initialInput) return { input: EXAMPLE, shown: exampleShown, errors: [] as readonly IsbnBarcodeError[], stale: false };
    const result = makeIsbnBarcode(initialInput);
    return result.status === "ready"
      ? { input: initialInput, shown: { input: initialInput, barcode: result.value }, errors: [] as readonly IsbnBarcodeError[], stale: false }
      : { input: initialInput, shown: exampleShown, errors: result.errors, stale: true };
  });
  const [input, setInput] = useState<Input>(first.input);
  const [shown, setShown] = useState<Shown>(first.shown);
  const [errors, setErrors] = useState<Errors>(() => errorsFrom(first.errors));
  const [isExample, setIsExample] = useState(!shared || first.stale);
  const [isStale, setIsStale] = useState(first.stale);
  const [advancedOpen, setAdvancedOpen] = useState(needsAdvanced(first.errors));
  const [focusTarget, setFocusTarget] = useState<string | null>(shared ? firstError(errorsFrom(first.errors)) : null);
  const formRef = useRef<HTMLFormElement>(null);
  const answerRef = useRef<HTMLOutputElement>(null);

  // Focus waits for a render, so a field inside Advanced exists before it gets focus.
  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "answer") answerRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusTarget}"]`)?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  function edit(next: Input, fields: IsbnBarcodeField[]) {
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

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const result = makeIsbnBarcode(input);
    const list = result.status === "invalid" ? result.errors : [];
    const nextErrors = errorsFrom(list);
    setErrors(nextErrors);
    if (result.status === "ready") {
      setShown({ input, barcode: result.value });
      setIsExample(false);
      setIsStale(false);
    }
    if (needsAdvanced(list)) setAdvancedOpen(true);
    setFocusTarget(firstError(nextErrors) ?? "answer");
  }

  function reset() {
    const example = makeIsbnBarcode(EXAMPLE);
    setInput(EXAMPLE);
    if (example.status === "ready") setShown({ input: EXAMPLE, barcode: example.value });
    setErrors({});
    setIsExample(true);
    setIsStale(false);
    setAdvancedOpen(false);
  }

  return (
    <ToolWorkbench label="ISBN barcode generator">
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <ToolFieldRow className={styles.basicRow}>
          <UiTextField
            autoCapitalize="characters"
            dataFocusKey="isbn"
            error={errors.isbn}
            hint="ISBN-13 or ISBN-10, with or without dashes."
            inputMode="text"
            label="ISBN"
            onChange={(value) => edit({ ...input, isbnText: value }, ["isbn"])}
            required
            spellCheck={false}
            value={input.isbnText}
          />
          <UiTextField
            dataFocusKey="price"
            error={errors.price}
            hint="Empty prints 90000, the code for no price."
            inputMode="decimal"
            label="List price"
            onChange={(value) => edit({ ...input, priceText: value }, ["price"])}
            suffix="USD"
            value={input.priceText}
          />
        </ToolFieldRow>

        <UiDisclosure
          isExpanded={advancedOpen}
          label="Add-on and size"
          onExpandedChange={setAdvancedOpen}
          summary={uiSetSummary(advancedCount(input))}
        >
          <div className={styles.advanced}>
            <ToolFieldRow className={styles.pairRow}>
              <UiChoiceGroup
                dataFocusKey="addOn"
                hint="The five-digit price code to the right of the bars."
                label="Price add-on"
                onChange={(value) => edit({ ...input, addOn: value === "none" ? "none" : "" }, ["price"])}
                options={addOnOptions}
                value={input.addOn === "none" ? "none" : "include"}
              />
              <UiTextField
                dataFocusKey="size"
                error={errors.size}
                hint="Empty uses the largest size that fits KDP's 2 × 1.2 in box."
                inputMode="numeric"
                label="Size"
                onChange={(value) => edit({ ...input, sizeText: value }, ["size"])}
                suffix="%"
                value={input.sizeText}
              />
            </ToolFieldRow>
          </div>
        </UiDisclosure>

        <UiActionRow>
          {isStale ? <UiStatus>Inputs changed</UiStatus> : null}
          <UiButton type="submit" variant="primary">Make barcode</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </UiButton>
        </UiActionRow>
      </form>

      <ToolResult label="Barcode result" stale={isStale}>
        <ResultView answerRef={answerRef} isExample={isExample} isStale={isStale} shown={shown} />
      </ToolResult>
    </ToolWorkbench>
  );
}

/* ---------------- the result ---------------- */

function statusWords(barcode: IsbnBarcode, isExample: boolean): ReactNode[] {
  const words: string[] = [];
  if (isExample) words.push("Example");
  if (barcode.addOn?.limit === "above-max") words.push("No price printed");
  if (barcode.size.limit === "below-min") words.push("Smallest size BISG allows");
  if (barcode.size.limit === "above-max") words.push("Largest size BISG allows");
  return words.map((word) => <UiStatusWord key={word}>{word}</UiStatusWord>);
}

function detailsFor(barcode: IsbnBarcode): UiMetric[] {
  const { isbn, addOn, size, layout } = barcode;
  const items: UiMetric[] = [];
  if (isbn.entered === "isbn13") {
    items.push(isbn.printedIsbn10
      ? { id: "isbn10", label: "ISBN-10", value: isbn.printedIsbn10 }
      : { id: "isbn10", label: "ISBN-10", hint: "ISBNs starting with 979 have no ISBN-10 form.", value: "None" });
  }
  if (addOn) {
    const unit = addOn.priceCents !== null
      ? usd.format(addOn.priceCents / 100)
      : addOn.limit === "above-max" ? "No price, over $99.98" : "No price";
    items.push({ id: "price", label: "Price code", hint: "The five digits above the small barcode on the right.", unit, value: addOn.code });
  }
  items.push({
    id: "size",
    label: "Size",
    hint: size.mode === "fit-kdp" ? "The largest size, up to 100%, that fits KDP's box." : "100% is the standard book barcode size.",
    value: `${size.percent}%`,
  });
  items.push({
    id: "printed",
    label: "Printed size",
    hint: "The whole white box, including the clear space scanners need.",
    value: `${inches(layout.widthMm)} × ${inches(layout.heightMm)} in`,
  });
  return items;
}

function fitValue(fit: IsbnBarcode["fit"][number]) {
  if (fit.fits) return "Fits";
  if (fit.largestFitPercent !== null) return `Fits at ${fit.largestFitPercent}% or smaller`;
  return "No size fits";
}

function fitItems(barcode: IsbnBarcode): UiMetric[] {
  return barcode.fit.map((fit) => ({
    id: fit.area,
    label: `${areaName(fit.area)} ${fit.area === "kdp" ? "box" : "area"}, ${inches(fit.widthMm).replace(/\.?0+$/, "")} × ${inches(fit.heightMm).replace(/\.?0+$/, "")} in`,
    hint: fit.area === "kdp"
      ? "The barcode area KDP suggests on the back cover."
      : "The clear area IngramSpark asks for on the back cover.",
    value: fitValue(fit),
  }));
}

function ResultView({
  answerRef,
  isExample,
  isStale,
  shown,
}: {
  answerRef: RefObject<HTMLOutputElement | null>;
  isExample: boolean;
  isStale: boolean;
  shown: Shown;
}) {
  const { input, barcode } = shown;
  const { isbn } = barcode;
  const words = statusWords(barcode, isExample);
  const imageSrc = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(barcode.svg)}`, [barcode.svg]);
  const alt = `Barcode for ISBN ${isbn.printedIsbn13}${barcode.addOn ? ` with price code ${barcode.addOn.code}` : ""}`;
  const name = barcode.fileBaseName;

  return (
    <>
      <div className={styles.top}>
        <div className={styles.tile}>
          {/* Shown in proportion to its printed width, so a smaller or larger size looks it. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- the engine's own SVG, shown as a data URI */}
          <img alt={alt} className={styles.barcode} src={imageSrc} style={{ width: `${(barcode.layout.widthMm * 0.6).toFixed(1)}rem` }} />
        </div>
        <div className={styles.facts}>
          <UiPrimaryResult
            detail={isbn.entered === "isbn10" || words.length ? (
              <span className={styles.detail}>
                {isbn.entered === "isbn10" ? <span>From ISBN-10 {isbn.printedIsbn10}</span> : null}
                {words.length ? <span className={styles.status}>{words}</span> : null}
              </span>
            ) : undefined}
            inputRef={answerRef}
            label="Valid ISBN"
            value={<span className={styles.isbn}>{isbn.printedIsbn13}</span>}
          />
          <UiMetricGroup ariaLabel="Barcode details" items={detailsFor(barcode)} layout="list" />
        </div>
      </div>

      <div className={styles.actions}>
        <UiDownloadAction contents={barcode.svg} filename={`${name}.svg`} isDisabled={isStale} label="Download SVG" mimeType="image/svg+xml" />
        <UiDownloadAction contents={() => renderIsbnBarcodePdf(barcode) as BlobPart} filename={`${name}.pdf`} isDisabled={isStale} label="Download PDF" mimeType="application/pdf" />
        <UiDownloadAction contents={() => renderIsbnBarcodePng(barcode) as BlobPart} filename={`${name}.png`} isDisabled={isStale} label="Download PNG" mimeType="image/png" />
        <UiShareAction params={shareParams(input)} />
      </div>

      <div className={styles.fit}>
        <CoverFitDrawing barcode={barcode} />
        <UiMetricGroup ariaLabel="Room on the back cover" items={fitItems(barcode)} layout="list" />
      </div>
    </>
  );
}

/* ---------------- cover fit drawing ---------------- */

/** KDP's box, IngramSpark's area, and the barcode's white box, to one scale and sharing a bottom-left corner. */
function CoverFitDrawing({ barcode }: { barcode: IsbnBarcode }) {
  const [kdp, ingram] = barcode.fit;
  const { widthMm, heightMm } = barcode.layout;
  const pad = 1;
  const width = Math.max(kdp.widthMm, ingram.widthMm, widthMm) + pad * 2;
  const height = Math.max(kdp.heightMm, ingram.heightMm, heightMm) + pad * 2;
  const bottom = height - pad;
  const box = (w: number, h: number) => ({ x: pad, y: bottom - h, width: w, height: h });

  return (
    <figure className={styles.drawing}>
      <svg
        aria-label={`Your barcode, ${inches(widthMm)} by ${inches(heightMm)} in, drawn against KDP's box and IngramSpark's area`}
        role="img"
        viewBox={`0 0 ${width.toFixed(2)} ${height.toFixed(2)}`}
      >
        <rect className={styles.drawingBarcode} {...box(widthMm, heightMm)} />
        <rect className={styles.drawingKdp} {...box(kdp.widthMm, kdp.heightMm)} />
        <rect className={styles.drawingIngram} {...box(ingram.widthMm, ingram.heightMm)} />
      </svg>
      <figcaption className={styles.legend}>
        <span><i aria-hidden="true" className={styles.keyBarcode} />Your barcode</span>
        <span><i aria-hidden="true" className={styles.keyKdp} />KDP</span>
        <span><i aria-hidden="true" className={styles.keyIngram} />IngramSpark</span>
      </figcaption>
    </figure>
  );
}
