"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { UiStatus } from "@/app/ui/display";
import { UiFileDropzone, UiFileList, type UiFileItem, type UiFileRejection } from "@/app/ui/uploads";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

export function FileUploadsExamples() {
  const [uploadStatus, setUploadStatus] = useState("Choose files or drag them into a drop zone.");
  const [pdfFiles, setPdfFiles] = useState<UiFileItem[]>([]);
  const [imageFiles, setImageFiles] = useState<UiFileItem[]>([
    { id: "sample-cover", name: "course-cover.jpg", previewUrl: "/course-images/self-hosting-for-beginners/mini-pc-usb-installer-boot.jpg", size: 2_481_324, status: "ready", type: "image/jpeg" },
    { id: "sample-progress", name: "dashboard-capture.jpg", previewUrl: "/course-images/self-hosting-for-beginners/immich-photo-timeline-library.jpg", progress: 64, size: 4_018_221, status: "uploading", type: "image/jpeg" },
    { id: "sample-error", message: "Image is 28 MB; the limit is 20 MB.", name: "full-resolution-export.png", size: 28 * 1024 ** 2, status: "error", type: "image/png" },
  ]);
  const objectUrlsRef = useRef(new Set<string>());

  useEffect(() => () => {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
  }, []);

  function fileItem(file: File): UiFileItem {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    if (previewUrl) objectUrlsRef.current.add(previewUrl);
    return { id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, previewUrl, size: file.size, status: "ready", type: file.type };
  }

  function removeFile(id: string, setter: Dispatch<SetStateAction<UiFileItem[]>>) {
    setter((current) => {
      const removed = current.find((file) => file.id === id);
      if (removed?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.previewUrl);
        objectUrlsRef.current.delete(removed.previewUrl);
      }
      return current.filter((file) => file.id !== id);
    });
  }

  function rejectionMessage(rejections: UiFileRejection[]) {
    const first = rejections[0];
    if (!first) return;
    const reason = first.reason === "file-size" ? "is too large" : first.reason === "file-type" ? "has an unsupported type" : "exceeds the file limit";
    setUploadStatus(`${first.file.name} ${reason}.`);
  }

  const rejected = uploadStatus.includes("too large") || uploadStatus.includes("unsupported") || uploadStatus.includes("exceeds");

  return (
    <>
      <Example components={["UiFileDropzone", "UiFileList"]} note="The drop zone works for any file type. Each page sets the accepted types, the file count, and the size limit. This one takes one PDF, like the KDP PDF preflight checker. With one file, the labels say &quot;a file&quot;. Set dropLabel to name the type." source="app/ui/uploads.tsx" title="One file">
        <div className={styles.stack}>
          <UiFileDropzone
            acceptedFileTypes={["application/pdf"]}
            browseLabel="Choose PDF"
            dropLabel="Drop a PDF here"
            description="One PDF up to 650 MB. The file stays local until the tool starts its own processing step."
            label="PDF document"
            maxFiles={1}
            maxSizeBytes={650 * 1024 ** 2}
            onFiles={(files) => {
              setPdfFiles(files.map(fileItem));
              setUploadStatus(`${files[0]?.name ?? "PDF"} is ready.`);
            }}
            onReject={rejectionMessage}
          />
          <UiFileList ariaLabel="Selected PDF files" files={pdfFiles} onRemove={(id) => removeFile(id, setPdfFiles)} />
        </div>
      </Example>

      <Example components={["UiFileDropzone", "UiFileList"]} note="With allowsMultiple, the labels say &quot;files&quot;. This one takes up to eight images and shows them as a grid with ready, uploading, and error states." source="app/ui/uploads.tsx" title="Several files">
        <div className={styles.stack}>
          <UiFileDropzone
            acceptedFileTypes={["image/png", "image/jpeg", "image/webp"]}
            allowsMultiple
            browseLabel="Choose images"
            description="PNG, JPEG, or WebP. Add up to eight images at once, 20 MB each."
            label="Images"
            maxFiles={8}
            maxSizeBytes={20 * 1024 ** 2}
            onFiles={(files) => {
              setImageFiles((current) => [...current.filter((item) => item.id !== "sample-error"), ...files.map(fileItem)]);
              setUploadStatus(`${files.length} image${files.length === 1 ? "" : "s"} added.`);
            }}
            onReject={rejectionMessage}
          />
          <UiFileList
            ariaLabel="Selected images"
            files={imageFiles}
            layout="grid"
            onRemove={(id) => removeFile(id, setImageFiles)}
            onRetry={(id) => setImageFiles((current) => current.map((file) => file.id === id ? { ...file, message: "Waiting for a smaller replacement.", status: "queued" } : file))}
          />
          <UiStatus tone={rejected ? "danger" : "neutral"}>{uploadStatus}</UiStatus>
        </div>
      </Example>
    </>
  );
}
