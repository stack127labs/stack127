"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiCheckbox, UiQuantityInput, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import { UiFileDropzone, UiFileList, type UiFileItem, type UiFileRejection, type UiFileStatus } from "@/app/ui/uploads";
import {
  calculatePlacement,
  formatDpi,
  formatPhysicalMeasurement,
  formatRawMeasurement,
  fromInches,
  KDP_IMAGE_MAX_BYTES,
  KdpImageError,
  parseKdpImageBytes,
  parsePrintDimension,
  type KdpImageHeader,
  type PlacementResult,
  type PrintUnit,
  type StoredDensity,
} from "./image-dpi";
import styles from "./kdp-image-dpi-checker.module.css";

type Axis = "width" | "height";
type SizeState = Readonly<{
  widthRaw: string;
  heightRaw: string;
  widthInches: number | null;
  heightInches: number | null;
  authoritativeAxis: Axis;
  lastValidAxis: Axis | null;
}>;
type SelectedImage = Readonly<{
  file: File;
  status: UiFileStatus;
  message?: string;
  previewUrl?: string;
  header?: KdpImageHeader;
  retryable: boolean;
}>;
type CheckResult = Readonly<{
  header: KdpImageHeader;
  mode: "inspection" | "placement";
  placement?: PlacementResult;
  widthInches?: number;
  heightInches?: number;
}>;
type FieldErrors = Readonly<{ width?: string; height?: string }>;

const imageTypes = ["image/jpeg", "image/png", ".jpg", ".jpeg", ".png"];
const units = [uiOption("in", "in"), uiOption("cm", "cm"), uiOption("mm", "mm")];
const initialSizes: SizeState = {
  widthRaw: "",
  heightRaw: "",
  widthInches: null,
  heightInches: null,
  authoritativeAxis: "width",
  lastValidAxis: null,
};

function dimensionsMessage(header: KdpImageHeader) {
  return `${header.width.toLocaleString()} × ${header.height.toLocaleString()} pixels`;
}

function unitBounds(unit: PrintUnit) {
  return unit === "cm" ? "0.0254 and 508 cm" : unit === "mm" ? "0.254 and 5,080 mm" : "0.01 and 200 in";
}

function dimensionError(raw: string, unit: PrintUnit, axis: Axis) {
  const parsed = parsePrintDimension(raw, unit);
  if (parsed.status !== "invalid") return undefined;
  const name = axis === "width" ? "Width" : "Height";
  return parsed.reason === "format"
    ? `${name} must be a positive decimal using a dot, such as 4 or .5.`
    : `${name} must be between ${unitBounds(unit)}.`;
}

function deriveOtherDimension(sizes: SizeState, header: KdpImageHeader, unit: PrintUnit): SizeState {
  const axis = sizes.authoritativeAxis;
  const raw = axis === "width" ? sizes.widthRaw : sizes.heightRaw;
  const parsed = parsePrintDimension(raw, unit);
  if (parsed.status !== "valid") {
    return axis === "width"
      ? { ...sizes, widthInches: null, heightRaw: "", heightInches: null }
      : { ...sizes, heightInches: null, widthRaw: "", widthInches: null };
  }
  const widthInches = axis === "width" ? parsed.inches : parsed.inches * header.width / header.height;
  const heightInches = axis === "height" ? parsed.inches : parsed.inches * header.height / header.width;
  return axis === "width"
    ? { ...sizes, widthInches, heightRaw: formatRawMeasurement(fromInches(heightInches, unit)), heightInches }
    : { ...sizes, heightInches, widthRaw: formatRawMeasurement(fromInches(widthInches, unit)), widthInches };
}

function formatMaximumSize(widthInches: number, heightInches: number, unit: PrintUnit) {
  const width = formatPhysicalMeasurement(widthInches, unit);
  const height = formatPhysicalMeasurement(heightInches, unit);
  return {
    value: `${width.approximate || height.approximate ? "~" : ""}${width.value} × ${height.value} ${unit}`,
    approximate: width.approximate || height.approximate,
  };
}

function formatDensity(value: number | null) {
  if (value === null || !Number.isFinite(value) || value <= 0) return "Unknown";
  const rounded = value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  return `${rounded} DPI`;
}

function densityRows(header: KdpImageHeader) {
  const counts = new Map<string, number>();
  const sources = header.densities.length ? header.densities : [{ source: "Stored density", horizontalDpi: null, verticalDpi: null } satisfies StoredDensity];
  return sources.map((density) => {
    const occurrence = (counts.get(density.source) ?? 0) + 1;
    counts.set(density.source, occurrence);
    const label = occurrence === 1 ? density.source : `${density.source} ${occurrence}`;
    if (density.unreadable) return { label, value: "Could not read stored density" };
    const horizontal = density.horizontalDpi;
    const vertical = density.verticalDpi;
    if (horizontal === null && vertical === null) return { label, value: "Unknown" };
    if (horizontal !== null && vertical !== null && Math.abs(horizontal - vertical) < 0.000001) {
      return { label, value: formatDensity(horizontal) };
    }
    return {
      label,
      value: `Horizontal ${formatDensity(horizontal)} · Vertical ${formatDensity(vertical)}`,
    };
  });
}

function errorMessage(error: unknown) {
  if (error instanceof KdpImageError) {
    if (error.code === "too-large") return "This file is larger than 25 MiB. Choose a smaller JPEG or PNG.";
    if (error.code === "resource-limit") return "This image exceeds the local limit of 20,000 pixels per side or 40 million pixels. Choose a smaller image.";
    if (error.code === "animated") return "Animated PNG files are not supported. Export one still image as PNG.";
    if (error.code === "invalid-orientation") return "The image has unreadable or conflicting orientation data. Export a fresh JPEG or PNG.";
    if (error.code === "unsupported-type") return "Unsupported file. Choose a JPEG or PNG image.";
    if (error.code === "invalid-image") return "This JPEG or PNG is incomplete or invalid. Export a fresh image or choose another file.";
  }
  return "The browser could not read this image. Export a fresh JPEG or PNG, or retry.";
}

function makeAbortError(message: string, name = "AbortError") {
  return new DOMException(message, name);
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw signal.reason ?? makeAbortError("Image inspection canceled.");
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create a local image preview.")), "image/png");
  });
}

async function inspectLocalImage(file: File, signal: AbortSignal) {
  throwIfAborted(signal);
  if (file.size > KDP_IMAGE_MAX_BYTES) throw new KdpImageError("too-large", "The image exceeds the 25 MiB file limit.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(signal);
  const header = parseKdpImageBytes(bytes);
  throwIfAborted(signal);

  if (typeof createImageBitmap !== "function") throw new Error("Image decoding is unavailable in this browser.");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    throwIfAborted(signal);
    if (bitmap.width !== header.width || bitmap.height !== header.height) {
      throw new KdpImageError("invalid-orientation", "Browser orientation does not match image metadata.");
    }
    const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
    const previewWidth = Math.max(1, Math.round(bitmap.width * scale));
    const previewHeight = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = previewWidth;
    canvas.height = previewHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare a local image preview.");
    context.drawImage(bitmap, 0, 0, previewWidth, previewHeight);
    const previewBlob = await canvasBlob(canvas);
    throwIfAborted(signal);
    return { header, previewUrl: URL.createObjectURL(previewBlob) };
  } finally {
    bitmap.close();
  }
}

function inspectWithDeadline(file: File, controller: AbortController) {
  return new Promise<Awaited<ReturnType<typeof inspectLocalImage>>>((resolve, reject) => {
    let settled = false;
    const signal = controller.signal;
    const cleanup = () => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
    };
    const finishReject = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const finishResolve = (value: Awaited<ReturnType<typeof inspectLocalImage>>) => {
      if (settled || signal.aborted) {
        URL.revokeObjectURL(value.previewUrl);
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };
    const onAbort = () => finishReject(signal.reason ?? makeAbortError("Image inspection canceled."));
    const timer = window.setTimeout(() => controller.abort(makeAbortError("Image reading timed out.", "TimeoutError")), 15_000);
    signal.addEventListener("abort", onAbort, { once: true });
    void inspectLocalImage(file, signal).then(finishResolve, finishReject);
    if (signal.aborted) onAbort();
  });
}

export function KdpImageDpiChecker() {
  const [selected, setSelected] = useState<SelectedImage | null>(null);
  const [unit, setUnit] = useState<PrintUnit>("in");
  const [keepProportions, setKeepProportions] = useState(true);
  const [sizes, setSizes] = useState<SizeState>(initialSizes);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<CheckResult | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fileButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const generationRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);
  const currentPreviewUrlRef = useRef<string | null>(null);
  const selectedBatchRef = useRef(false);
  const extrasIgnoredRef = useRef(false);
  const unitRef = useRef<PrintUnit>("in");
  const lockRef = useRef(true);
  const sizesRef = useRef<SizeState>(initialSizes);
  const headerRef = useRef<KdpImageHeader | null>(null);
  const focusResultRef = useRef(false);

  useEffect(() => {
    if (result && focusResultRef.current) {
      focusResultRef.current = false;
      resultRef.current?.focus();
    }
  }, [result]);

  useEffect(() => () => {
    generationRef.current += 1;
    activeControllerRef.current?.abort(makeAbortError("Image inspection canceled."));
    if (currentPreviewUrlRef.current) URL.revokeObjectURL(currentPreviewUrlRef.current);
  }, []);

  function setSizesNow(next: SizeState) {
    sizesRef.current = next;
    setSizes(next);
  }

  function revokePreview() {
    if (currentPreviewUrlRef.current) URL.revokeObjectURL(currentPreviewUrlRef.current);
    currentPreviewUrlRef.current = null;
  }

  function cancelInspection() {
    activeControllerRef.current?.abort(makeAbortError("Image inspection canceled."));
    activeControllerRef.current = null;
    generationRef.current += 1;
    setBusy(false);
  }

  function beginInspection(file: File, generation: number) {
    const controller = new AbortController();
    activeControllerRef.current = controller;
    setBusy(true);
    void inspectWithDeadline(file, controller).then(({ header, previewUrl }) => {
      if (generation !== generationRef.current || controller.signal.aborted) {
        URL.revokeObjectURL(previewUrl);
        return;
      }
      currentPreviewUrlRef.current = previewUrl;
      headerRef.current = header;
      setSelected((current) => current?.file === file
        ? { ...current, status: "ready", message: dimensionsMessage(header), previewUrl, header, retryable: false }
        : current);
      if (lockRef.current) setSizesNow(deriveOtherDimension(sizesRef.current, header, unitRef.current));
      setStatus(extrasIgnoredRef.current ? "Image ready. Additional files were ignored." : "Image ready.");
    }).catch((error: unknown) => {
      if (generation !== generationRef.current) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      const timedOut = error instanceof DOMException && error.name === "TimeoutError";
      setSelected((current) => current?.file === file
        ? {
          ...current,
          status: "error",
          message: timedOut ? "Reading this image took too long. Retry it or choose another JPEG or PNG." : errorMessage(error),
          previewUrl: undefined,
          header: undefined,
          retryable: timedOut || !(error instanceof KdpImageError),
        }
        : current);
      headerRef.current = null;
      revokePreview();
      setStatus("");
    }).finally(() => {
      if (generation === generationRef.current) {
        setBusy(false);
        activeControllerRef.current = null;
      }
    });
  }

  function selectFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    selectedBatchRef.current = true;
    extrasIgnoredRef.current = false;
    queueMicrotask(() => { selectedBatchRef.current = false; });
    cancelInspection();
    const generation = generationRef.current;
    setResult(null);
    setErrors({});
    headerRef.current = null;
    revokePreview();
    setSelected({ file, status: "checking", message: undefined, retryable: false });
    if (lockRef.current) {
      const axis = sizesRef.current.authoritativeAxis;
      setSizesNow(axis === "width"
        ? { ...sizesRef.current, heightRaw: "", heightInches: null }
        : { ...sizesRef.current, widthRaw: "", widthInches: null });
    }
    setStatus("Reading image locally.");
    beginInspection(file, generation);
  }

  function rejectFiles(rejections: UiFileRejection[]) {
    if (!rejections.length) return;
    if (selectedBatchRef.current) {
      extrasIgnoredRef.current = true;
      setStatus("Reading image locally. Additional files were ignored.");
      return;
    }
    const rejection = rejections[0];
    cancelInspection();
    setResult(null);
    setErrors({});
    headerRef.current = null;
    revokePreview();
    const message = rejection.reason === "file-size"
      ? "This file is larger than 25 MiB. Choose a smaller JPEG or PNG."
      : rejection.reason === "file-count"
        ? "Choose one image at a time."
        : "Unsupported file. Choose a JPEG or PNG image.";
    setSelected({ file: rejection.file, status: "error", message, retryable: false });
    if (lockRef.current) {
      const axis = sizesRef.current.authoritativeAxis;
      setSizesNow(axis === "width"
        ? { ...sizesRef.current, heightRaw: "", heightInches: null }
        : { ...sizesRef.current, widthRaw: "", widthInches: null });
    }
    setStatus("");
  }

  function updateDimension(axis: Axis, raw: string) {
    const nextUnit = unitRef.current;
    const parsed = parsePrintDimension(raw, nextUnit);
    const next: SizeState = {
      ...sizesRef.current,
      [axis === "width" ? "widthRaw" : "heightRaw"]: raw,
      [axis === "width" ? "widthInches" : "heightInches"]: parsed.status === "valid" ? parsed.inches : null,
      authoritativeAxis: axis,
      lastValidAxis: parsed.status === "valid" ? axis : sizesRef.current.lastValidAxis,
    };
    const header = headerRef.current;
    setSizesNow(keepProportions && header ? deriveOtherDimension(next, header, nextUnit) : keepProportions
      ? axis === "width" ? { ...next, heightRaw: "", heightInches: null } : { ...next, widthRaw: "", widthInches: null }
      : next);
    setResult(null);
    setErrors({});
    setStatus("Size changed. Check the image again.");
  }

  function changeUnit(nextValue: string) {
    const nextUnit = nextValue as PrintUnit;
    if (nextUnit === unitRef.current) return;
    unitRef.current = nextUnit;
    setUnit(nextUnit);
    const current = sizesRef.current;
    setSizesNow({
      ...current,
      widthRaw: current.widthInches === null ? current.widthRaw : formatRawMeasurement(fromInches(current.widthInches, nextUnit)),
      heightRaw: current.heightInches === null ? current.heightRaw : formatRawMeasurement(fromInches(current.heightInches, nextUnit)),
    });
    setResult(null);
    setErrors({});
    setStatus("Size changed. Check the image again.");
  }

  function changeProportions(selectedValue: boolean) {
    lockRef.current = selectedValue;
    setKeepProportions(selectedValue);
    if (selectedValue) {
      const axis = sizesRef.current.lastValidAxis ?? "width";
      const current = sizesRef.current;
      const raw = axis === "width" ? current.widthRaw : current.heightRaw;
      const parsed = parsePrintDimension(raw, unitRef.current);
      const recalculated = { ...current, authoritativeAxis: axis };
      if (parsed.status === "valid" && headerRef.current) setSizesNow(deriveOtherDimension(recalculated, headerRef.current, unitRef.current));
      else if (axis === "width") setSizesNow({ ...recalculated, widthInches: parsed.status === "valid" ? parsed.inches : null, heightRaw: "", heightInches: null });
      else setSizesNow({ ...recalculated, heightInches: parsed.status === "valid" ? parsed.inches : null, widthRaw: "", widthInches: null });
    }
    setResult(null);
    setErrors({});
    setStatus("Size changed. Check the image again.");
  }

  function removeImage() {
    cancelInspection();
    setSelected(null);
    setResult(null);
    setErrors({});
    headerRef.current = null;
    revokePreview();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStatus("Image removed.");
    requestAnimationFrame(() => fileButtonRef.current?.focus());
  }

  function retryImage() {
    if (!selected?.retryable) return;
    cancelInspection();
    revokePreview();
    headerRef.current = null;
    const generation = generationRef.current;
    setSelected({ ...selected, status: "checking", message: undefined, previewUrl: undefined, header: undefined, retryable: false });
    setStatus("Reading image locally.");
    beginInspection(selected.file, generation);
  }

  function reset() {
    cancelInspection();
    setSelected(null);
    unitRef.current = "in";
    lockRef.current = true;
    headerRef.current = null;
    sizesRef.current = initialSizes;
    revokePreview();
    setUnit("in");
    setKeepProportions(true);
    setSizes(initialSizes);
    setResult(null);
    setErrors({});
    setStatus("Checker reset.");
    if (fileInputRef.current) fileInputRef.current.value = "";
    requestAnimationFrame(() => fileButtonRef.current?.focus());
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    if (!selected || selected.status !== "ready" || !selected.header) {
      if (!selected) setStatus("Choose a JPEG or PNG image first.");
      fileButtonRef.current?.focus();
      return;
    }

    const widthParsed = parsePrintDimension(sizes.widthRaw, unitRef.current);
    const heightParsed = parsePrintDimension(sizes.heightRaw, unitRef.current);
    const nextErrors: { width?: string; height?: string } = {};
    if (widthParsed.status === "invalid") nextErrors.width = dimensionError(sizes.widthRaw, unitRef.current, "width");
    if (heightParsed.status === "invalid") nextErrors.height = dimensionError(sizes.heightRaw, unitRef.current, "height");
    if (!keepProportions && widthParsed.status === "blank" && heightParsed.status === "valid") nextErrors.width = "Enter a width or enable Keep proportions to derive it.";
    if (!keepProportions && heightParsed.status === "blank" && widthParsed.status === "valid") nextErrors.height = "Enter a height or enable Keep proportions to derive it.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus("");
      requestAnimationFrame(() => document.querySelector<HTMLInputElement>(`[data-focus-key="${nextErrors.width ? "width" : "height"}"]`)?.focus());
      return;
    }

    setErrors({});
    if (widthParsed.status === "blank" && heightParsed.status === "blank") {
      focusResultRef.current = true;
      setResult({ header: selected.header, mode: "inspection" });
      setStatus("");
      return;
    }
    if (widthParsed.status !== "valid" || heightParsed.status !== "valid") return;
    const widthInches = sizes.widthInches ?? widthParsed.inches;
    const heightInches = sizes.heightInches ?? heightParsed.inches;
    const placement = calculatePlacement(selected.header, widthInches, heightInches);
    focusResultRef.current = true;
    setResult({ header: selected.header, mode: "placement", placement, widthInches, heightInches });
    setStatus("");
  }

  const selectedFiles: UiFileItem[] = selected ? [{
    id: "selected-image",
    message: selected.message,
    name: selected.file.name,
    previewUrl: selected.previewUrl,
    size: selected.file.size,
    status: selected.status,
    type: selected.previewUrl ? "image/png" : selected.file.type || "image/unknown",
  }] : [];

  const placementResult = result?.mode === "placement" ? result.placement : undefined;
  const maximum = result
    ? formatMaximumSize(result.header.width / 300, result.header.height / 300, unit)
    : null;
  const effective = placementResult ? formatDpi(placementResult.controllingDpi) : "";
  const densityInfoRows = result ? densityRows(result.header).map(({ label, value }) => ({ label, value })) : [];

  return (
    <section aria-label="KDP image DPI checker inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit}>
        <div aria-describedby="kdp-image-file-required" aria-label="Image file, required" className={styles.fileGroup} role="group">
          <span className={styles.visuallyHidden} id="kdp-image-file-required">Required. Choose one JPEG or PNG image.</span>
          <UiFileDropzone
            acceptedFileTypes={imageTypes}
            browseButtonRef={fileButtonRef}
            browseLabel="Choose image"
            description="JPEG or PNG, up to 25 MiB. Checked in your browser."
            inputRef={fileInputRef}
            label="Image file *"
            maxFiles={1}
            maxSizeBytes={KDP_IMAGE_MAX_BYTES}
            onFiles={selectFiles}
            onReject={rejectFiles}
          />
        </div>
        {selected ? (
          <div role={selected.status === "error" ? "alert" : undefined}>
            <UiFileList
              ariaLabel="Selected image"
              files={selectedFiles}
              onRemove={removeImage}
              onRetry={selected.retryable ? retryImage : undefined}
            />
          </div>
        ) : null}

        <fieldset className={styles.sizeGroup}>
          <legend>Print size</legend>
          <p>Enter the image's printed size, or leave both blank to inspect its pixels.</p>
          <div className={styles.sizeFields}>
            <UiQuantityInput
              dataFocusKey="width"
              error={errors.width}
              label="Width"
              onChange={(raw) => updateDimension("width", raw)}
              onUnitChange={changeUnit}
              unit={unit}
              unitAriaLabel="Print size unit, width"
              units={units}
              value={sizes.widthRaw}
            />
            <UiQuantityInput
              dataFocusKey="height"
              error={errors.height}
              label="Height"
              onChange={(raw) => updateDimension("height", raw)}
              onUnitChange={changeUnit}
              unit={unit}
              unitAriaLabel="Print size unit, height"
              units={units}
              value={sizes.heightRaw}
            />
          </div>
          <UiCheckbox isSelected={keepProportions} onChange={changeProportions}>Keep proportions</UiCheckbox>
        </fieldset>

        <UiActionRow>
          <div className={styles.actions}>
            <UiButton isDisabled={busy} type="submit" variant="primary">{busy ? "Reading image..." : "Check image"}</UiButton>
            <UiButton onPress={reset} type="button" variant="ghost">Reset</UiButton>
          </div>
        </UiActionRow>
        {status ? <UiStatus>{status}</UiStatus> : null}
      </form>

      {result && maximum ? (
        <section aria-label="Image check result" className={styles.results}>
          {result.mode === "inspection" ? (
            <UiPrimaryResult
              detail="Enter a print size to check effective resolution."
              inputRef={resultRef}
              label="Maximum size at 300 DPI"
              tone="neutral"
              value={maximum.value}
            />
          ) : placementResult ? (
            <>
              <UiPrimaryResult
                detail={`${formatPhysicalMeasurement(result.widthInches ?? 0, unit).value} × ${formatPhysicalMeasurement(result.heightInches ?? 0, unit).value} ${unit}. ${placementResult.assessment}`}
                inputRef={resultRef}
                label="Effective resolution"
                tone={placementResult.tone}
                unit="DPI"
                value={effective}
              />
              {Math.abs(placementResult.horizontalDpi - placementResult.verticalDpi) > 1e-9 ? (
                <UiKeyValueList rows={[
                  { label: "Horizontal resolution", value: `${formatDpi(placementResult.horizontalDpi)} DPI` },
                  { label: "Vertical resolution", value: `${formatDpi(placementResult.verticalDpi)} DPI` },
                ]} />
              ) : null}
              <UiKeyValueList rows={[{ label: "Maximum size at 300 DPI", value: maximum.value }]} />
              {placementResult.exceeds600Dpi ? <p className={styles.resultNote}>One or both axes exceed 600 DPI, which may increase the file size. The 300-DPI assessment still applies.</p> : null}
              {placementResult.distorted ? <p className={styles.resultNote}>This placement stretches the image by more than 0.1% compared with its original proportions.</p> : null}
              <p className={styles.resultNote}>This checks resolution at the entered size. Review the exported book in KDP's previewer and with a proof copy.</p>
            </>
          ) : null}

          <div className={styles.density}>
            <h3>Stored density</h3>
            <UiKeyValueList rows={densityInfoRows} />
            {result.header.densityConflict ? <p className={styles.resultNote}>Stored density sources disagree. Their values are shown separately.</p> : null}
            {result.header.densityUnreadable ? <p className={styles.resultNote}>Some stored density metadata could not be read.</p> : null}
            <p className={styles.resultNote}>Stored tags do not add pixels or establish resolution at the entered print size.</p>
          </div>
        </section>
      ) : null}
    </section>
  );
}
