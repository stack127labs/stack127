"use client";

import { AlertTriangle, Check, File, FileText, Image as ImageIcon, RefreshCw, Trash2, Upload } from "lucide-react";
import type { Ref } from "react";
import { DropZone, FileTrigger } from "react-aria-components";
import { UiButton } from "./controls";
import styles from "./uploads.module.css";

export type UiFileRejection = Readonly<{
  file: File;
  reason: "file-count" | "file-size" | "file-type";
}>;

export type UiFileDropzoneProps = Readonly<{
  acceptedFileTypes: readonly string[];
  allowsMultiple?: boolean;
  browseButtonRef?: Ref<HTMLButtonElement>;
  browseLabel?: string;
  description: string;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  label: string;
  maxFiles?: number;
  maxSizeBytes?: number;
  onFiles: (files: File[]) => void;
  onReject?: (rejections: UiFileRejection[]) => void;
}>;

function acceptsFile(file: File, acceptedFileTypes: readonly string[]) {
  if (!acceptedFileTypes.length) return true;
  const lowerName = file.name.toLowerCase();
  return acceptedFileTypes.some((accepted) => {
    const normalized = accepted.toLowerCase();
    if (normalized.startsWith(".")) return lowerName.endsWith(normalized);
    if (normalized.endsWith("/*")) return file.type.toLowerCase().startsWith(normalized.slice(0, -1));
    return file.type.toLowerCase() === normalized;
  });
}

export function validateFiles(files: File[], options: Pick<UiFileDropzoneProps, "acceptedFileTypes" | "maxFiles" | "maxSizeBytes">) {
  const accepted: File[] = [];
  const rejected: UiFileRejection[] = [];
  for (const file of files) {
    if (!acceptsFile(file, options.acceptedFileTypes)) {
      rejected.push({ file, reason: "file-type" });
      continue;
    }
    if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
      rejected.push({ file, reason: "file-size" });
      continue;
    }
    if (options.maxFiles && accepted.length >= options.maxFiles) {
      rejected.push({ file, reason: "file-count" });
      continue;
    }
    accepted.push(file);
  }
  return { accepted, rejected };
}

export function UiFileDropzone({
  acceptedFileTypes,
  allowsMultiple = false,
  browseButtonRef,
  browseLabel = "Choose files",
  description,
  disabled,
  inputRef,
  label,
  maxFiles,
  maxSizeBytes,
  onFiles,
  onReject,
}: UiFileDropzoneProps) {
  function submit(files: File[]) {
    const result = validateFiles(files, { acceptedFileTypes, maxFiles, maxSizeBytes });
    if (result.accepted.length) onFiles(result.accepted);
    if (result.rejected.length) onReject?.(result.rejected);
  }

  return (
    <div className={styles.dropzoneField}>
      <span className={styles.dropzoneLabel}>{label}</span>
      <DropZone
        aria-label={label}
        className={styles.dropzone}
        isDisabled={disabled}
        onDrop={async (event) => {
          const files = await Promise.all(event.items.filter((item) => item.kind === "file").map((item) => item.getFile()));
          submit(files);
        }}
      >
        <Upload aria-hidden="true" className={styles.dropzoneIcon} size={24} />
        <div className={styles.dropzoneCopy}>
          <strong>Drop files here</strong>
          <span>{description}</span>
        </div>
        <FileTrigger acceptedFileTypes={acceptedFileTypes} allowsMultiple={allowsMultiple} onSelect={(files) => submit(files ? Array.from(files) : [])} ref={inputRef}>
          <UiButton className={styles.browseButton} isDisabled={disabled} ref={browseButtonRef} type="button">{browseLabel}</UiButton>
        </FileTrigger>
      </DropZone>
    </div>
  );
}

export type UiFileStatus = "checking" | "error" | "queued" | "ready" | "uploading";

export type UiFileItem = Readonly<{
  id: string;
  message?: string;
  name: string;
  previewUrl?: string;
  progress?: number;
  size: number;
  status?: UiFileStatus;
  type?: string;
}>;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(bytes < 10 * 1024 ** 2 ? 1 : 0)} MB`;
}

const STATUS_LABELS: Record<UiFileStatus, string> = {
  checking: "Checking",
  error: "Needs attention",
  queued: "Queued",
  ready: "Ready",
  uploading: "Uploading",
};

export function UiFileList({ ariaLabel, files, layout = "list", onRemove, onRetry }: { ariaLabel: string; files: readonly UiFileItem[]; layout?: "grid" | "list"; onRemove?: (id: string) => void; onRetry?: (id: string) => void }) {
  if (!files.length) return null;
  return (
    <ul aria-label={ariaLabel} className={styles.fileList} data-layout={layout}>
      {files.map((file) => {
        const status = file.status ?? "ready";
        const isImage = file.type?.startsWith("image/");
        return (
          <li data-status={status} key={file.id}>
            <div className={styles.filePreview}>
              {file.previewUrl && isImage
                ? <img alt="" src={file.previewUrl} />
                : isImage
                  ? <ImageIcon aria-hidden="true" size={22} />
                  : file.type === "application/pdf"
                    ? <FileText aria-hidden="true" size={22} />
                    : <File aria-hidden="true" size={22} />}
            </div>
            <div className={styles.fileBody}>
              <strong className={styles.fileName}>{file.name}</strong>
              <span className={styles.fileMeta}>{formatFileSize(file.size)} · {STATUS_LABELS[status]}</span>
              {status === "uploading" ? <progress aria-label={`${file.name} upload progress`} max={100} value={Math.max(0, Math.min(100, file.progress ?? 0))} /> : null}
              {file.message ? <span className={styles.fileMessage}>{file.message}</span> : null}
            </div>
            <div className={styles.fileState} aria-hidden="true">
              {status === "ready" ? <Check size={18} /> : status === "error" ? <AlertTriangle size={18} /> : null}
            </div>
            <div className={styles.fileActions}>
              {status === "error" && onRetry ? <UiButton aria-label={`Retry ${file.name}`} onPress={() => onRetry(file.id)} title={`Retry ${file.name}`} variant="icon"><RefreshCw aria-hidden="true" size={17} /></UiButton> : null}
              {onRemove ? <UiButton aria-label={`Remove ${file.name}`} onPress={() => onRemove(file.id)} title={`Remove ${file.name}`} variant="icon"><Trash2 aria-hidden="true" size={17} /></UiButton> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
