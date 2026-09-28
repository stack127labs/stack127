"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { UiButton, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  calculatePrintSize,
  formatResolution,
  parsePixelDimension,
  parsePrintResolution,
  type ParseFailure,
  type ParsedResolution,
  type PrintSizeResult,
} from "./print-size";
import styles from "./pixels-to-print-size-calculator.module.css";

type FieldName = "width" | "height" | "resolution";
type FieldErrors = Partial<Record<FieldName, string>>;
type Calculation = Readonly<{ result: PrintSizeResult; resolution: ParsedResolution }>;

function pixelError(name: "width" | "height", failure: ParseFailure): string {
  const label = name === "width" ? "Pixel width" : "Pixel height";
  if (failure.reason === "missing") return label + " is required.";
  if (failure.reason === "format") {
    return name === "width"
      ? "Enter pixel width as a whole number without commas or units."
      : "Enter pixel height as a whole number without commas or units.";
  }
  return label + " must be between 1 and 1,000,000.";
}

function resolutionError(failure: ParseFailure): string {
  if (failure.reason === "missing") return "Print resolution is required.";
  if (failure.reason === "format") return "Enter a number with up to three decimal places, such as 300 or 200.5.";
  return "Print resolution must be between 1 and 10,000 PPI.";
}

function DimensionPair({ width, height }: { width: string; height: string }) {
  return (
    <span className={styles.dimensionPair}>
      <span className={styles.widthAxis}>{width} <span>×</span></span>
      <span className={styles.heightAxis}>{height}</span>
    </span>
  );
}

export function PixelsToPrintSizeCalculator() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [resolutionRaw, setResolutionRaw] = useState("300");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [failure, setFailure] = useState("");
  const [resetNotice, setResetNotice] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const widthRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function editField(field: FieldName, value: string) {
    if (field === "width") setWidth(value);
    if (field === "height") setHeight(value);
    if (field === "resolution") setResolutionRaw(value);

    if (calculation) setAnnouncement("Inputs changed. Calculate again.");
    setCalculation(null);
    setFailure("");
    setResetNotice("");
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetNotice("");
    setAnnouncement("");
    setFailure("");

    const parsedWidth = parsePixelDimension(width);
    const parsedHeight = parsePixelDimension(height);
    const parsedResolution = parsePrintResolution(resolutionRaw);
    const nextErrors: FieldErrors = {};
    if (parsedWidth.status === "invalid") nextErrors.width = pixelError("width", parsedWidth);
    if (parsedHeight.status === "invalid") nextErrors.height = pixelError("height", parsedHeight);
    if (parsedResolution.status === "invalid") nextErrors.resolution = resolutionError(parsedResolution);

    if (Object.keys(nextErrors).length) {
      setCalculation(null);
      setErrors(nextErrors);
      const firstInvalid = Object.keys(nextErrors)[0] as FieldName;
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[data-focus-key="' + firstInvalid + '"]')?.focus();
      });
      return;
    }

    setErrors({});
    try {
      if (parsedWidth.status !== "valid" || parsedHeight.status !== "valid" || parsedResolution.status !== "valid") {
        throw new Error("Input validation did not complete.");
      }
      const result = calculatePrintSize({
        widthPixels: parsedWidth.value,
        heightPixels: parsedHeight.value,
        resolution: parsedResolution.value,
      });
      setCalculation({ result, resolution: parsedResolution.value });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setCalculation(null);
      setFailure("Could not calculate this size. Check the values and calculate again.");
    }
  }

  function reset() {
    setWidth("");
    setHeight("");
    setResolutionRaw("300");
    setErrors({});
    setCalculation(null);
    setFailure("");
    setResetNotice("Calculator reset.");
    setAnnouncement("");
    requestAnimationFrame(() => widthRef.current?.focus());
  }

  const sizes = calculation?.result;
  const resolutionLabel = calculation ? formatResolution(calculation.resolution) : "";

  return (
    <section aria-label="Pixel to print size inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <div className={styles.pixelFields}>
          <UiTextField
            autoCapitalize="none"
            autoComplete="off"
            className={styles.field}
            dataFocusKey="width"
            error={errors.width}
            inputMode="numeric"
            inputRef={widthRef}
            label="Pixel width"
            onChange={(value) => editField("width", value)}
            placeholder="3600"
            required
            spellCheck={false}
            value={width}
          />
          <UiTextField
            autoCapitalize="none"
            autoComplete="off"
            className={styles.field}
            dataFocusKey="height"
            error={errors.height}
            inputMode="numeric"
            label="Pixel height"
            onChange={(value) => editField("height", value)}
            placeholder="2400"
            required
            spellCheck={false}
            value={height}
          />
        </div>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.resolutionField}
          dataFocusKey="resolution"
          description="Pixels per inch, often called DPI in print settings."
          error={errors.resolution}
          inputMode="decimal"
          label="Print resolution (PPI)"
          onChange={(value) => editField("resolution", value)}
          required
          spellCheck={false}
          value={resolutionRaw}
        />
        <UiActionRow>
          <div className={styles.actions}>
            <UiButton className={styles.calculateButton} type="submit" variant="primary">Calculate print size</UiButton>
            <UiButton onPress={reset} type="button" variant="ghost"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
          </div>
        </UiActionRow>
        {failure ? <UiStatus tone="danger">{failure}</UiStatus> : null}
        {resetNotice ? <UiStatus>{resetNotice}</UiStatus> : null}
        <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
      </form>

      {sizes ? (
        <section aria-label="Calculated print size" className={styles.results}>
          <div className={styles.resultContent}>
            <UiPrimaryResult
              detail={<span>Width × height at {resolutionLabel} PPI.</span>}
              inputRef={resultRef}
              label="Calculated print size"
              unit="in"
              value={<DimensionPair width={sizes.inches.displayWidth} height={sizes.inches.displayHeight} />}
            />
            <UiKeyValueList rows={[
              {
                label: "Centimeters",
                value: <DimensionPairWithUnit width={sizes.centimeters.displayWidth} height={sizes.centimeters.displayHeight} unit="cm" />,
              },
              {
                label: "Millimeters",
                value: <DimensionPairWithUnit width={sizes.millimeters.displayWidth} height={sizes.millimeters.displayHeight} unit="mm" />,
              },
            ]} />
            <p className={styles.resultNote}>Dimensions are rounded to a maximum of four decimal places. This calculation does not assess image quality.</p>
          </div>
        </section>
      ) : null}
    </section>
  );
}

function DimensionPairWithUnit({ width, height, unit }: { width: string; height: string; unit: string }) {
  return (
    <span className={styles.unitPair}>
      <DimensionPair width={width} height={height} /> <span className={styles.unit}>{unit}</span>
    </span>
  );
}
