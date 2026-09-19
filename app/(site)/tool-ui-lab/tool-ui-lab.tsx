"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { DateValue } from "react-aria-components";
import {
  ToolActionRow,
  ToolAllocationBar,
  ToolButton,
  ToolCheckbox,
  ToolChoiceGroup,
  ToolComboBox,
  ToolCodeOutput,
  ToolDataTable,
  ToolDatePicker,
  ToolDisclosure,
  ToolDownloadAction,
  ToolKeyValueList,
  ToolLevelSlider,
  ToolMetricGroup,
  ToolNumberField,
  ToolQuantityField,
  ToolQuantityInput,
  ToolPrimaryResult,
  ToolProgressBar,
  ToolRangeSlider,
  ToolRawOutput,
  ToolRepeatableList,
  ToolSearchField,
  ToolSelect,
  ToolSlider,
  ToolStatus,
  ToolSwitch,
  ToolTimeline,
  ToolTextArea,
  ToolTextField,
  ToolCopyAction,
  ToolResultLead,
  type ToolOption,
} from "@/app/tool-ui/tool-controls";
import { ToolFileDropzone, ToolFileList, type ToolFileItem, type ToolFileRejection } from "@/app/tool-ui/tool-uploads";
import { ToolBarChart, ToolFlowChart, ToolLineChart } from "@/app/tool-ui/tool-visuals";
import styles from "./tool-ui-lab.module.css";

const resolverOptions: ToolOption[] = [
  { id: "cloudflare", label: "Cloudflare" },
  { id: "google", label: "Google Public DNS" },
  { id: "quad9", label: "Quad9" },
  { id: "authoritative", label: "Authoritative nameserver" },
];

const recordOptions: ToolOption[] = [
  { id: "a", label: "A", searchText: "A IPv4 address" },
  { id: "aaaa", label: "AAAA", searchText: "AAAA IPv6 address" },
  { id: "mx", label: "MX", searchText: "MX mail exchange" },
  { id: "txt", label: "TXT", searchText: "TXT text record" },
];

const unitOptions: ToolOption[] = [
  { id: "GB", label: "GB" },
  { id: "TB", label: "TB" },
  { id: "TiB", label: "TiB" },
];

type Drive = { id: string; capacity: number; unit: string };

export function ToolUiLab() {
  const [resolver, setResolver] = useState("cloudflare");
  const [recordType, setRecordType] = useState<string | null>(null);
  const [driveCount, setDriveCount] = useState(4);
  const [capacity, setCapacity] = useState(8);
  const [capacityUnit, setCapacityUnit] = useState("GB");
  const [reserve, setReserve] = useState(20);
  const [range, setRange] = useState([4, 12]);
  const [layout, setLayout] = useState("raidz1");
  const [keepFree, setKeepFree] = useState(false);
  const [liveResults, setLiveResults] = useState(true);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [exactCapacity, setExactCapacity] = useState("");
  const [hostname, setHostname] = useState("");
  const [hostnameError, setHostnameError] = useState<string | null>(null);
  const [status, setStatus] = useState("All examples are ready.");
  const [rebuildProgress, setRebuildProgress] = useState(68);
  const [maintenanceDate, setMaintenanceDate] = useState<DateValue | null>(null);
  const [backupConfidence, setBackupConfidence] = useState("tested");
  const [uploadStatus, setUploadStatus] = useState("Choose files or drag them into a drop zone.");
  const [pdfFiles, setPdfFiles] = useState<ToolFileItem[]>([]);
  const [imageFiles, setImageFiles] = useState<ToolFileItem[]>([
    { id: "sample-cover", name: "course-cover.jpg", previewUrl: "/course-images/self-hosting-for-beginners/mini-pc-usb-installer-boot.jpg", size: 2_481_324, status: "ready", type: "image/jpeg" },
    { id: "sample-progress", name: "dashboard-capture.jpg", previewUrl: "/course-images/self-hosting-for-beginners/immich-photo-timeline-library.jpg", progress: 64, size: 4_018_221, status: "uploading", type: "image/jpeg" },
    { id: "sample-error", message: "Image is 28 MB; the limit is 20 MB.", name: "full-resolution-export.png", size: 28 * 1024 ** 2, status: "error", type: "image/png" },
  ]);
  const hostnameRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const [drives, setDrives] = useState<Drive[]>([
    { id: "drive-1", capacity: 8, unit: "TB" },
    { id: "drive-2", capacity: 8, unit: "TB" },
  ]);

  useEffect(() => () => {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
  }, []);

  function fileItem(file: File): ToolFileItem {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    if (previewUrl) objectUrlsRef.current.add(previewUrl);
    return { id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, previewUrl, size: file.size, status: "ready", type: file.type };
  }

  function removeFile(id: string, setter: React.Dispatch<React.SetStateAction<ToolFileItem[]>>) {
    setter((current) => {
      const removed = current.find((file) => file.id === id);
      if (removed?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.previewUrl);
        objectUrlsRef.current.delete(removed.previewUrl);
      }
      return current.filter((file) => file.id !== id);
    });
  }

  function rejectionMessage(rejections: ToolFileRejection[]) {
    const first = rejections[0];
    if (!first) return;
    const reason = first.reason === "file-size" ? "is too large" : first.reason === "file-type" ? "has an unsupported type" : "exceeds the file limit";
    setUploadStatus(`${first.file.name} ${reason}.`);
  }

  function validate(event: FormEvent) {
    event.preventDefault();
    if (!hostname.trim()) {
      setHostnameError("Enter a hostname.");
      hostnameRef.current?.focus();
      return;
    }
    setHostnameError(null);
    setStatus(`${hostname.trim()} is ready to check.`);
  }

  function updateDrive(id: string, patch: Partial<Drive>) {
    setDrives((current) => current.map((drive) => drive.id === id ? { ...drive, ...patch } : drive));
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Tool components</h1>
        <p>Working controls and result formats used by stack127 tools.</p>
      </header>

      <section className={styles.section}>
        <h2>Text and selection</h2>
        <div className={styles.twoColumns}>
          <ToolTextField label="DNS name" placeholder="example.com" required spellCheck={false} />
          <ToolSearchField label="Filter records" onChange={setSearch} placeholder="Type to filter…" value={search} />
          <ToolSelect label="Resolver" onChange={setResolver} options={resolverOptions} required value={resolver} />
          <ToolComboBox label="Record type search" onChange={setRecordType} options={recordOptions} placeholder="Find a record type…" value={recordType} />
        </div>
        <ToolTextArea label="Configuration" onChange={setNotes} placeholder="Paste configuration…" value={notes} />
      </section>

      <section className={styles.section}>
        <h2>Numbers and ranges</h2>
        <div className={styles.twoColumns}>
          <ToolNumberField label="Drive count" max={24} min={1} onChange={setDriveCount} value={driveCount} />
          <ToolQuantityField
            label="Capacity"
            min={0}
            onChange={setCapacity}
            onUnitChange={setCapacityUnit}
            unit={capacityUnit}
            units={unitOptions}
            value={capacity}
          />
          <ToolQuantityInput
            label="Exact disk size"
            onChange={setExactCapacity}
            onUnitChange={setCapacityUnit}
            placeholder="18.25"
            unit={capacityUnit}
            units={unitOptions}
            value={exactCapacity}
          />
        </div>
        <ToolSlider label="Free-space reserve" max={40} onChange={setReserve} value={reserve} formatOptions={{ style: "unit", unit: "percent" }} />
        <ToolRangeSlider label="Drive-size range" max={24} min={1} onChange={setRange} value={range} formatOptions={{ style: "unit", unit: "terabyte" }} />
      </section>

      <section className={styles.section}>
        <h2>Choices</h2>
        <ToolChoiceGroup
          label="Layout"
          onChange={setLayout}
          options={[
            { id: "mirror", label: "Mirror" },
            { id: "raidz1", label: "RAIDZ1" },
            { id: "raidz2", label: "RAIDZ2" },
          ]}
          value={layout}
        />
        <div className={styles.inlineChoices}>
          <ToolCheckbox isSelected={keepFree} onChange={setKeepFree}>Reserve 20% free space</ToolCheckbox>
          <ToolSwitch isSelected={liveResults} onChange={setLiveResults}>Update results while editing</ToolSwitch>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Repeated rows</h2>
        <ToolRepeatableList
          addLabel="Add drive"
          ariaLabel="Data drives"
          items={drives}
          onAdd={() => setDrives((current) => [...current, { id: `drive-${Date.now()}`, capacity: 8, unit: "TB" }])}
          onRemove={(id) => setDrives((current) => current.filter((drive) => drive.id !== id))}
          renderItem={(drive, index) => (
            <ToolQuantityField
              label={`Drive ${index + 1} capacity`}
              min={0}
              onChange={(value) => updateDrive(drive.id, { capacity: value })}
              onUnitChange={(unit) => updateDrive(drive.id, { unit })}
              unit={drive.unit}
              units={unitOptions}
              value={drive.capacity}
            />
          )}
        />
        <ToolDisclosure label="Advanced settings">
          <div className={styles.disclosureGrid}>
            <ToolSelect
              label="Record size"
              options={[
                { id: "16K", label: "16 KiB" },
                { id: "128K", label: "128 KiB" },
                { id: "1M", label: "1 MiB" },
              ]}
              value="128K"
            />
          </div>
        </ToolDisclosure>
      </section>

      <section className={styles.section}>
        <h2>Actions and feedback</h2>
        <form className={styles.validationForm} onSubmit={validate}>
          <ToolTextField
            error={hostnameError}
            inputRef={hostnameRef}
            label="Required hostname"
            onChange={(value) => {
              setHostname(value);
              if (hostnameError) setHostnameError(null);
            }}
            placeholder="nas.example.com"
            required
            spellCheck={false}
            value={hostname}
          />
          <ToolActionRow>
            <ToolButton onPress={() => setHostname("")} variant="ghost">Clear</ToolButton>
            <ToolButton type="submit" variant="secondary">Test validation</ToolButton>
            <ToolButton onPress={() => setStatus("Example finished.")} variant="primary">Run example</ToolButton>
          </ToolActionRow>
        </form>
        <ToolStatus tone="success">{status}</ToolStatus>
      </section>

      <section className={`${styles.section} ${styles.results}`}>
        <h2>Results</h2>
        <div className={styles.resultExample}>
          <ToolPrimaryResult
            detail="After protection and the selected free-space reserve."
            label="Estimated usable capacity"
            unit="TiB"
            value="21.8"
          />
          <ToolMetricGroup
            ariaLabel="Capacity summary"
            items={[
              { id: "raw", label: "Raw", value: "32", unit: "TiB" },
              { id: "protection", label: "Protection", value: "8", unit: "TiB" },
              { id: "reserve", label: "Reserve", value: "2.2", unit: "TiB" },
            ]}
          />
        </div>

        <div className={styles.resultExample}>
          <ToolProgressBar label="Rebuild progress" value={rebuildProgress} />
          <ToolActionRow>
            <ToolButton onPress={() => setRebuildProgress(0)} variant="ghost">Reset progress</ToolButton>
            <ToolButton onPress={() => setRebuildProgress((current) => Math.min(100, current + 10))}>Advance 10%</ToolButton>
          </ToolActionRow>
        </div>

        <div className={styles.allocationExamples}>
          <div className={styles.resultExample}>
            <h3>Neutral allocation</h3>
            <ToolAllocationBar
              ariaLabel="Neutral allocation"
              formatValue={(value) => `${value} TiB`}
              palette="neutral"
              segments={[
                { id: "used", label: "Used", value: 21.8 },
                { id: "free", label: "Free", value: 10.2 },
              ]}
              total={32}
            />
          </div>

          <div className={styles.resultExample}>
            <h3>Accent allocation</h3>
            <ToolAllocationBar
              ariaLabel="Accent allocation"
              formatValue={(value) => `${value} TiB`}
              palette="accent"
              segments={[
                { id: "selected", label: "Selected", value: 18 },
                { id: "remaining", label: "Remaining", value: 14 },
              ]}
              total={32}
            />
          </div>

          <div className={styles.resultExample}>
            <h3>Categorical allocation</h3>
            <ToolAllocationBar
              ariaLabel="Categorical allocation"
              formatValue={(value) => `${value} TiB`}
              palette="categorical"
              segments={[
                { id: "data", label: "Data", value: 14 },
                { id: "parity", label: "Parity", value: 8 },
                { id: "snapshots", label: "Snapshots", value: 4 },
                { id: "reserve", label: "Reserve", value: 3 },
                { id: "metadata", label: "Metadata", value: 3 },
              ]}
              total={32}
            />
          </div>
        </div>

        <ToolTimeline
          ariaLabel="Registration timeline"
          events={[
            { dateTime: "1995-08-14", id: "registered", label: "Registered", state: "past", value: "14 Aug 1995" },
            { dateTime: "2026-08-14", id: "changed", label: "Last changed", state: "current", value: "14 Aug 2026" },
            { dateTime: "2027-08-13", id: "expires", label: "Expires", state: "future", value: "13 Aug 2027" },
          ]}
        />

        <ToolResultLead>Two authoritative nameservers returned four addresses.</ToolResultLead>
        <ToolKeyValueList rows={[
          { label: "Resolver", value: "Cloudflare" },
          { label: "Resolver TTL", value: "86,400 seconds" },
        ]} />
        <ToolDataTable
          ariaLabel="Nameserver addresses"
          columns={[
            { id: "address", label: "Address" },
            { id: "network", label: "Network" },
            { id: "provider", label: "Provider" },
            { id: "country", label: "Country" },
            { id: "asn", label: "ASN" },
          ]}
          rows={[
            { id: "one", cells: { address: "108.162.195.210", network: "108.162.195.0/24", provider: "Cloudflare", country: "US", asn: "AS13335" } },
            { id: "two", cells: { address: "2606:4700:58::a29f:c2d2", network: "2606:4700:50::/44", provider: "Cloudflare", country: "US", asn: "AS13335" } },
          ]}
        />

        <ToolCodeOutput
          actions={<ToolCopyAction label="Copy command" successLabel="Command copied" value="zpool create vault raidz2 /dev/sd{a..f}" variant="ghost" />}
          code="zpool create vault raidz2 /dev/sd{a..f}"
          label="Generated command"
        />

        <ToolRawOutput
          label="Registry response"
          value={{
            objectClassName: "domain",
            ldhName: "EXAMPLE.COM",
            self: "https://rdap.example.test/domain/example.com/a-very-long-unbroken-evidence-path-that-must-stay-inside-the-raw-output-viewport",
          }}
        />

        <ToolActionRow>
          <ToolCopyAction label="Copy summary" successLabel="Copied summary" value="Estimated usable capacity: 21.8 TiB" />
          <ToolDownloadAction contents="Estimated usable capacity: 21.8 TiB\n" filename="capacity-report.txt" label="Download report" />
        </ToolActionRow>
      </section>

      <section className={styles.section}>
        <h2>File uploads</h2>
        <div className={styles.uploadColumns}>
          <div className={styles.uploadExample}>
            <ToolFileDropzone
              acceptedFileTypes={["application/pdf"]}
              browseLabel="Choose PDF"
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
            <ToolFileList ariaLabel="Selected PDF files" files={pdfFiles} onRemove={(id) => removeFile(id, setPdfFiles)} />
          </div>
          <div className={styles.uploadExample}>
            <ToolFileDropzone
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
            <ToolFileList
              ariaLabel="Selected images"
              files={imageFiles}
              layout="grid"
              onRemove={(id) => removeFile(id, setImageFiles)}
              onRetry={(id) => setImageFiles((current) => current.map((file) => file.id === id ? { ...file, message: "Waiting for a smaller replacement.", status: "queued" } : file))}
            />
          </div>
        </div>
        <ToolStatus tone={uploadStatus.includes("too large") || uploadStatus.includes("unsupported") || uploadStatus.includes("exceeds") ? "danger" : "neutral"}>{uploadStatus}</ToolStatus>
      </section>

      <section className={styles.section}>
        <h2>Date and level selection</h2>
        <div className={styles.twoColumns}>
          <ToolDatePicker description="Choose the day for the next maintenance window." label="Maintenance date" onChange={setMaintenanceDate} value={maintenanceDate} />
          <ToolLevelSlider
            label="Backup confidence"
            levels={[
              { description: "A backup job has been configured but not restored.", id: "configured", label: "Configured" },
              { description: "A test restore completed with representative data.", id: "tested", label: "Tested" },
              { description: "Restore checks run on a schedule and alert on failure.", id: "monitored", label: "Monitored" },
              { description: "Restore timing and ownership are documented for production use.", id: "production", label: "Production" },
            ]}
            onChange={setBackupConfidence}
            value={backupConfidence}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Charts and flows</h2>
        <div className={styles.chartGrid}>
          <ToolBarChart
            ariaLabel="Requests handled by service"
            caption="Successful requests during the same 15-minute sample."
            data={[
              { id: "api", label: "API", value: 1840 },
              { id: "worker", label: "Worker", value: 1210 },
              { id: "scheduler", label: "Scheduler", value: 680 },
              { id: "webhook", label: "Webhook", value: 420 },
            ]}
            formatValue={(value) => value.toLocaleString("en")}
          />
          <ToolLineChart
            ariaLabel="Storage use over six months"
            caption="Measured pool use, not provisioned capacity."
            formatValue={(value) => `${value} TB`}
            points={[
              { id: "apr", label: "April 2026", value: 8.2, xLabel: "Apr" },
              { id: "may", label: "May 2026", value: 9.1, xLabel: "May" },
              { id: "jun", label: "June 2026", value: 9.8, xLabel: "Jun" },
              { id: "jul", label: "July 2026", value: 11.4, xLabel: "Jul" },
              { id: "aug", label: "August 2026", value: 12.2, xLabel: "Aug" },
              { id: "sep", label: "September 2026", value: 13.6, xLabel: "Sep" },
            ]}
            valueLabel="Used storage"
          />
        </div>
        <div className={styles.flowExample}>
          <h3>PDF processing flow</h3>
          <ToolFlowChart
            ariaLabel="PDF processing flow"
            stages={[
              { detail: "File type and size accepted", id: "receive", label: "Receive", state: "complete" },
              { detail: "Pages, boxes, fonts, and images", id: "inspect", label: "Inspect", state: "complete" },
              { detail: "Compare against the selected KDP setup", id: "compare", label: "Compare", state: "current" },
              { detail: "Readable findings and report", id: "report", label: "Report", state: "pending" },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
