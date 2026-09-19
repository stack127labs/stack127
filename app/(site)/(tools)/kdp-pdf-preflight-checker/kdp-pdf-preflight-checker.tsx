"use client";

import { FileSearch, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolCopyAction,
  ToolDataTable,
  ToolDownloadAction,
  ToolKeyValueList,
  ToolNumberField,
  ToolResultLead,
  ToolSelect,
  ToolStatus,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import { ToolFileDropzone, ToolFileList, type ToolFileItem, type ToolFileRejection, type ToolFileStatus } from "@/app/tool-ui/tool-uploads";
import { KDP_PDF_PREFLIGHT_VERSION, analyzeKdpPdf, formatKdpPdfReport, type KdpPdfExpected, type KdpPdfResult } from "@/lib/kdp/pdf-preflight.ts";
import { calculateKdpSetup, getKdpSetupDefaults, type KdpSetupInput } from "@/lib/kdp/setup.ts";
import { KDP_MAX_FILE_MB, getKdpInteriorOptions, getKdpPageLimit, getKdpPaperOptions, getKdpTrimOptions, interiorLabel, paperLabel, type KdpBinding, type KdpInterior } from "@/lib/kdp/specs.ts";
import styles from "../_components/kdp-tool.module.css";

type FileKind = "interior" | "cover";

const kindOptions = [toolOption("interior", "Interior PDF"), toolOption("cover", "Paperback cover")];
const bindingOptions = [toolOption("paperback", "Paperback"), toolOption("hardcover", "Hardcover")];

function defaultInput(): KdpSetupInput {
  return { ...getKdpSetupDefaults(), bleed: false };
}

function pageBoxLabel(page: KdpPdfResult["pages"][number]) {
  return page.mediaBox ? `${page.mediaBox.widthInches} × ${page.mediaBox.heightInches} in` : "Unknown";
}

function differenceLabel(page: KdpPdfResult["pages"][number], expected: KdpPdfExpected) {
  if (page.widthInches === null || page.heightInches === null) return "Unknown";
  return `${(page.widthInches - expected.widthInches).toFixed(4)} × ${(page.heightInches - expected.heightInches).toFixed(4)} in`;
}

export function KdpPdfPreflightChecker() {
  const [input, setInput] = useState<KdpSetupInput>(defaultInput);
  const [kind, setKind] = useState<FileKind>("interior");
  const [file, setFile] = useState<File | null>(null);
  const [fileState, setFileState] = useState<ToolFileStatus>("ready");
  const [result, setResult] = useState<KdpPdfResult | null>(null);
  const [expected, setExpected] = useState<KdpPdfExpected | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fileButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (result?.status === "valid") resultRef.current?.focus();
  }, [result]);

  function update(next: Partial<KdpSetupInput>) {
    setInput((current) => ({ ...current, ...next }));
    setResult(null);
    setExpected(null);
    setStatus("");
  }

  function changeKind(next: FileKind) {
    setKind(next);
    if (next === "cover" && input.binding !== "paperback") changeBinding("paperback");
    setResult(null);
    setExpected(null);
    setStatus("");
  }

  function changeBinding(binding: KdpBinding) {
    const trimOptions = getKdpTrimOptions(binding);
    const trimId = trimOptions.some((trim) => trim.id === input.trimId) ? input.trimId : trimOptions[0].id;
    const interiors = getKdpInteriorOptions(binding);
    const interior = interiors.includes(input.interior) ? input.interior : interiors[0];
    update({ binding, trimId, interior, paper: getKdpPaperOptions(binding, interior)[0] });
  }

  function changeInterior(interior: KdpInterior) {
    update({ interior, paper: getKdpPaperOptions(input.binding, interior)[0] });
  }

  function selectFile(files: File[]) {
    const next = files[0] ?? null;
    setFile(next);
    setFileState("ready");
    setResult(null);
    setExpected(null);
    setStatus("");
  }

  function rejectFile(rejections: ToolFileRejection[]) {
    const reason = rejections[0]?.reason;
    setStatus(reason === "file-size"
      ? `PDF limit: ${KDP_MAX_FILE_MB} MB.`
      : reason === "file-count"
        ? "Choose one PDF at a time."
        : "Choose a PDF file.");
  }

  function removeFile() {
    setFile(null);
    setFileState("ready");
    setResult(null);
    setExpected(null);
    setStatus("PDF removed.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    setResult(null);
    setExpected(null);
    if (!file) {
      setStatus("Choose a PDF file.");
      fileButtonRef.current?.focus();
      return;
    }
    if (file.size > KDP_MAX_FILE_MB * 1024 * 1024) {
      setStatus(`PDF limit: ${KDP_MAX_FILE_MB} MB.`);
      setFileState("error");
      fileButtonRef.current?.focus();
      return;
    }
    const setup = calculateKdpSetup({ ...input, binding: kind === "cover" ? "paperback" : input.binding });
    if (setup.status !== "valid" || !setup.values) {
      setStatus("Fix KDP settings first.");
      return;
    }
    const values = setup.values;
    const pageLimit = kind === "interior" ? getKdpPageLimit(input.trimId, input.binding, input.interior, input.paper) ?? undefined : undefined;
    const nextExpected: KdpPdfExpected = {
      kind: kind === "interior" ? "interior" : "paperback-cover",
      widthInches: kind === "interior" ? values.page.widthInches : values.cover.widthInches,
      heightInches: kind === "interior" ? values.page.heightInches : values.cover.heightInches,
      trimWidthInches: values.trim.widthInches,
      trimHeightInches: values.trim.heightInches,
      expectedSpineInches: kind === "cover" ? values.spine.widthInches : undefined,
      bleed: kind === "cover" ? true : input.bleed,
      expectedPageCount: kind === "cover" ? 1 : undefined,
      pageLimit,
    };
    setBusy(true);
    setFileState("checking");
    setStatus("Checking PDF locally.");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const next = await analyzeKdpPdf({ fileName: file.name, bytes, expected: nextExpected });
      setResult(next);
      setExpected(nextExpected);
      setFileState(next.status === "valid" ? "ready" : "error");
      setStatus(next.status === "valid" ? "PDF checked locally." : "Local check failed. Choose another PDF.");
    } catch {
      setFileState("error");
      setStatus("Local check failed. Choose another PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setInput(defaultInput());
    setKind("interior");
    setFile(null);
    setFileState("ready");
    setResult(null);
    setExpected(null);
    setBusy(false);
    setStatus("Checker reset.");
    if (fileInputRef.current) fileInputRef.current.value = "";
    requestAnimationFrame(() => fileButtonRef.current?.focus());
  }

  const trimOptions = getKdpTrimOptions(kind === "cover" ? "paperback" : input.binding);
  const activeBinding = kind === "cover" ? "paperback" : input.binding;
  const interiorOptions = getKdpInteriorOptions(activeBinding);
  const paperOptions = getKdpPaperOptions(activeBinding, input.interior);
  const report = result ? formatKdpPdfReport(result) : "";
  const selectedFiles: ToolFileItem[] = file ? [{
    id: "selected-pdf",
    message: fileState === "error" ? "Choose another PDF or retry this file." : undefined,
    name: file.name,
    size: file.size,
    status: fileState,
    type: file.type || "application/pdf",
  }] : [];

  return (
    <section aria-label="PDF preflight inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <ToolFileDropzone
          acceptedFileTypes={["application/pdf", ".pdf"]}
          browseButtonRef={fileButtonRef}
          browseLabel="Choose PDF"
          description={`PDF up to ${KDP_MAX_FILE_MB} MB; stays local.`}
          disabled={busy}
          inputRef={fileInputRef}
          label="PDF file"
          maxFiles={1}
          maxSizeBytes={KDP_MAX_FILE_MB * 1024 * 1024}
          onFiles={selectFile}
          onReject={rejectFile}
        />
        <ToolFileList
          ariaLabel="Selected PDF"
          files={selectedFiles}
          onRemove={busy ? undefined : removeFile}
          onRetry={busy ? undefined : () => { void submit(); }}
        />
        <div className={styles.grid}>
          <ToolChoiceGroup label="Check scope" onChange={(value) => changeKind(value as FileKind)} options={kindOptions} value={kind} />
          {kind === "interior" ? <ToolChoiceGroup label="Binding" onChange={(value) => changeBinding(value as KdpBinding)} options={bindingOptions} value={input.binding} /> : <p className={styles.notice}>Binding: Paperback</p>}
          <ToolSelect label="Trim size" onChange={(value) => update({ trimId: value })} options={trimOptions.map((trim) => toolOption(trim.id, trim.label))} value={input.trimId} />
          <ToolSelect label="Interior" onChange={(value) => changeInterior(value as KdpInterior)} options={interiorOptions.map((interior) => toolOption(interior, interiorLabel(interior)))} value={input.interior} />
          <ToolSelect label="Paper" onChange={(value) => update({ paper: value as KdpSetupInput["paper"] })} options={paperOptions.map((paper) => toolOption(paper, paperLabel(paper)))} value={input.paper} />
          {kind === "cover" ? <ToolNumberField label="Book page count" min={1} onChange={(value) => update({ pageCount: value })} value={input.pageCount} /> : <ToolChoiceGroup label="Interior bleed" onChange={(value) => update({ bleed: value === "yes" })} options={[toolOption("no", "Without bleed"), toolOption("yes", "With bleed")]} value={input.bleed ? "yes" : "no"} />}
        </div>
        <ToolActionRow>
          <div className={styles.actions}>
            <ToolButton isDisabled={busy} onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
            <ToolButton isDisabled={busy} type="submit" variant="primary"><FileSearch aria-hidden="true" size={17} /> {busy ? "Checking PDF..." : "Check PDF"}</ToolButton>
          </div>
        </ToolActionRow>
        {status ? <ToolStatus tone={result?.status === "invalid" ? "danger" : result?.findings.length ? "warning" : "neutral"}>{status}</ToolStatus> : null}
        {result?.status === "invalid" ? <ul className={styles.issueList}>{result.findings.map((item) => <li data-severity={item.severity} key={item.code}>{item.message}</li>)}</ul> : null}
      </form>

      {result?.status === "valid" && expected ? (
        <section aria-label="PDF preflight result" className={styles.result}>
          <ToolResultLead inputRef={resultRef}>{result.findings.length ? `${result.findings.length} possible issue${result.findings.length === 1 ? "" : "s"} need review.` : "No measurable issues found."}</ToolResultLead>
          <div className={styles.actions}>
            <ToolCopyAction label="Copy report" successLabel="Report copied" value={report} withManualFallback />
            <ToolDownloadAction contents={report} filename={`${result.fileName.replace(/\.pdf$/i, "")}-preflight.txt`} label="Download report" />
          </div>
          {result.findings.length ? <ol className={styles.issueList}>{result.findings.map((item, index) => <li data-severity={item.severity} key={`${item.code}-${item.pageNumber ?? "file"}-${index}`}>{item.message}</li>)}</ol> : null}
          <ToolDataTable
            ariaLabel="PDF page geometry"
            columns={[{ id: "page", label: "Page" }, { id: "actual", label: "Actual MediaBox" }, { id: "expected", label: "Expected" }, { id: "difference", label: "Difference" }, { id: "status", label: "Status" }]}
            rows={result.pages.map((page) => ({ id: String(page.pageNumber), cells: { page: page.pageNumber, actual: pageBoxLabel(page), expected: `${expected.widthInches} × ${expected.heightInches} in`, difference: differenceLabel(page, expected), status: page.widthInches !== null && Math.abs(page.widthInches - expected.widthInches) <= 0.02 && Math.abs((page.heightInches ?? 0) - expected.heightInches) <= 0.02 ? "Measured match" : "Possible issue" } }))}
          />
          <h3 className={styles.sectionTitle}>PDF diagnostics</h3>
          <ToolKeyValueList rows={[
            { label: "Page count", value: result.pageCount },
            { label: "Font embedding", value: `${result.fonts.embedded} embedded · ${result.fonts.unembedded} not embedded · ${result.fonts.unknown} unknown` },
            { label: "Image DPI", value: result.images.total ? `${result.images.measurable} of ${result.images.total} measured${result.images.minimumDpi === null ? "" : ` · minimum ${result.images.minimumDpi} DPI`}` : "No placed images found" },
            { label: "Content operators", value: result.pages.every((page) => page.hasContents) ? "Measured on every page" : "Possible empty or unreadable page" },
            { label: "CropBox", value: result.pages.every((page) => page.boxStates.crop === "declared") ? "Declared on every page" : "Defaulted where not declared" },
            { label: "TrimBox", value: result.pages.every((page) => page.boxStates.trim === "declared") ? "Declared on every page" : "Not declared on every page" },
            { label: "BleedBox", value: result.pages.every((page) => page.boxStates.bleed === "declared") ? "Declared on every page" : "Not declared on every page" },
            { label: "EOF marker", value: result.eofPresent ? "Present" : "Possible issue" },
            { label: "Encrypted", value: result.encrypted ? "Yes" : "No" },
            { label: "File size", value: `${(result.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` },
          ]} />
          {kind === "cover" ? <p className={styles.notice}>Cover dimensions: {input.trimId} / {expected.expectedSpineInches?.toFixed(4)} / {input.trimId}; bleed .125in.</p> : null}
          <p className={styles.notice}>{KDP_PDF_PREFLIGHT_VERSION} · Rules 2026-09-16 · local. Previewer review required.</p>
        </section>
      ) : null}
    </section>
  );
}
