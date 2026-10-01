"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarDays, Code2, HardDrive, MemoryStick, WalletCards } from "lucide-react";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import { HardwareFactCardContent, hardwareFactCardClassName } from "@/app/ui/directories/hardware-fact-card";
import { DirectoryCheckboxGroup, DirectoryRadioGroup, DirectoryTagSelectGroup } from "@/app/ui/directories/directory-filters";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import { ToolCatalog } from "@/app/ui/catalogs/tool-catalog";
import { backup321Art } from "@/app/(site)/(catalogs)/_components/art/backup-321";
import { BrandWordmark } from "@/app/ui/site/brand-wordmark";
import { CodeBlock } from "@/app/ui/site/code-block";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { Callout } from "@/app/ui/callout";
import { ContentBlock } from "@/app/ui/content-block";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { Faq } from "@/app/ui/faq";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { ThemeToggle } from "@/app/ui/site/theme-toggle";
import type { DateValue } from "react-aria-components";
import { UiButton, UiCheckbox, UiChoiceGroup, UiComboBox, UiDatePicker, UiDisclosure, UiDownloadAction, UiLevelSlider, UiNumberField, UiQuantityField, UiQuantityInput, UiRangeSlider, UiRawOutput, UiRepeatableList, UiSearchField, UiSelect, UiSlider, UiSwitch, UiTextArea, UiTextField, UiCopyAction, type UiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiCodeOutput, UiDataTable, UiKeyValueList, UiMetricGroup, UiPrimaryResult, UiProgressBar, UiStatus, UiTimeline, UiResultLead } from "@/app/ui/display";
import { UiFileDropzone, UiFileList, type UiFileItem, type UiFileRejection } from "@/app/ui/uploads";
import { UiBarChart, UiDonutChart, UiFlowChart, UiLineChart } from "@/app/ui/visuals";
import styles from "./components-ui.module.css";

const resolverOptions: UiOption[] = [
  { id: "cloudflare", label: "Cloudflare" },
  { id: "google", label: "Google Public DNS" },
  { id: "quad9", label: "Quad9" },
  { id: "authoritative", label: "Authoritative nameserver" },
];

const recordOptions: UiOption[] = [
  { id: "a", label: "A", searchText: "A IPv4 address" },
  { id: "aaaa", label: "AAAA", searchText: "AAAA IPv6 address" },
  { id: "mx", label: "MX", searchText: "MX mail exchange" },
  { id: "txt", label: "TXT", searchText: "TXT text record" },
];

const unitOptions: UiOption[] = [
  { id: "GB", label: "GB" },
  { id: "TB", label: "TB" },
  { id: "TiB", label: "TiB" },
];

type Drive = { id: string; capacity: number; unit: string };

export function ComponentGallery() {
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rebuildProgress, setRebuildProgress] = useState(68);
  const [maintenanceDate, setMaintenanceDate] = useState<DateValue | null>(null);
  const [backupConfidence, setBackupConfidence] = useState("tested");
  const [uploadStatus, setUploadStatus] = useState("Choose files or drag them into a drop zone.");
  const [pdfFiles, setPdfFiles] = useState<UiFileItem[]>([]);
  const [imageFiles, setImageFiles] = useState<UiFileItem[]>([
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

  function fileItem(file: File): UiFileItem {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    if (previewUrl) objectUrlsRef.current.add(previewUrl);
    return { id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, previewUrl, size: file.size, status: "ready", type: file.type };
  }

  function removeFile(id: string, setter: React.Dispatch<React.SetStateAction<UiFileItem[]>>) {
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
        <h1>Components UI</h1>
        <p>Working examples for tools, directories, courses, and content pages. Use the same components wherever their behavior fits.</p>
        <div className={styles.themeSwitch}><span>Theme</span><ThemeToggle /></div>
      </header>

      <section className={styles.section}>
        <h2>Cards</h2>
        <p>The live directories and catalogs use these cards. Each page supplies its own content.</p>
        <div className={styles.cardGrid}>
          <Link className={appFactCardClassName} href="/self-host-apps">
            <AppFactCardContent
              name="Example home server app"
              image={<span className={styles.cardLogo} aria-hidden="true">H</span>}
              categories={[{ name: "Home automation" }, { name: "Utilities" }]}
              summary="Run a home dashboard and connect devices on your own server."
              facts={[
                { label: "Source", value: "open source", icon: Code2 },
                { label: "Pricing", value: "free to self-host", icon: WalletCards },
                { label: "Est. RAM", value: "2–4 GB", icon: MemoryStick },
                { label: "Storage", value: "low", icon: HardDrive },
                { label: "Last update", value: "not published", icon: CalendarDays },
              ]}
            />
          </Link>
          <Link className={hardwareFactCardClassName} href="/zigbee-devices">
            <HardwareFactCardContent
              name="Example Zigbee sensor"
              image={null}
              facts={[{ label: "Connection", value: "Zigbee" }, { label: "Power", value: "battery" }]}
            />
          </Link>
        </div>
        <ToolCatalog heading="Tool catalog cards" tools={[
          { art: backup321Art, description: "Estimate local and off-site backup capacity from your data and retention plan.", href: "/backup-321-calculator", name: "3-2-1 backup calculator" },
        ]} />
      </section>

      <section className={styles.section}>
        <h2>Page pieces</h2>
        <div className={styles.pagePieces}>
          <PageHeader bordered>
            <h3><PageTitleIcon><Code2 aria-hidden="true" /></PageTitleIcon> Example page heading</h3>
            <p>A short introduction helps people decide whether this is the page they need.</p>
          </PageHeader>
          <div className={styles.pagePiecesGrid}>
            <nav aria-label="Example sidebar links" className={styles.sidebarExample}>
              <div className={styles.brandExample}><BrandWordmark /></div>
              <SidebarList items={[
                { href: "/components-ui", label: "Current section", active: true, number: "01" },
                { href: "/self-host-apps", label: "Directory", number: "02" },
                { href: "/self-hosting-for-beginners", label: "Course", number: "03" },
              ]} ordered />
            </nav>
            <div className={styles.pagePieces}>
              <CodeBlock label="example command">ssh user@example.com</CodeBlock>
              <div className={styles.markerExample}><MarkerArt svg={backup321Art} caption="One source needs a local and an off-site backup target." /></div>
            </div>
          </div>
        </div>
        <p>See a full <Link href="/self-hosting-for-beginners">course layout</Link>, <Link href="/keyboard-shortcuts">reference sidebar</Link>, and <Link href="/self-host-apps">directory filters</Link> on their live pages.</p>
      </section>

      <section className={styles.section}>
        <h2>Directory filters</h2>
        <p>Search, sort, single choices, multiple choices, and category tags share these patterns across directories.</p>
        <form action="/components-ui" className={styles.directoryFilters} data-default-sort="name" data-live-filter-form>
          <label className="directory-search"><span>Search</span><span className="directory-search-field"><input name="q" placeholder="Find a device…" type="search" /></span></label>
          <SortDropdown name="sort" options={[{ label: "Name", value: "name" }, { label: "Recently added", value: "newest" }]} value="name" />
          <DirectoryCheckboxGroup name="feature" options={[{ label: "Battery", value: "battery" }, { label: "Local control", value: "local" }]} selected={[]} title="Features" />
          <DirectoryRadioGroup name="source" options={[{ label: "Any source", value: "any" }, { label: "Official", value: "official" }]} selected="any" title="Source" />
          <DirectoryTagSelectGroup name="category" options={[{ label: "Sensors", value: "sensors" }, { label: "Switches", value: "switches" }]} selected={[]} title="Category" />
          <DirectoryFilterController />
        </form>
      </section>

      <section className={styles.section}>
        <h2>Text and selection</h2>
        <div className={styles.twoColumns}>
          <UiTextField label="DNS name" placeholder="example.com" required spellCheck={false} />
          <UiSearchField label="Filter records" onChange={setSearch} placeholder="Type to filter…" value={search} />
          <UiSelect label="Resolver" onChange={setResolver} options={resolverOptions} required value={resolver} />
          <UiComboBox label="Record type search" onChange={setRecordType} options={recordOptions} placeholder="Find a record type…" value={recordType} />
        </div>
        <UiTextArea label="Configuration" onChange={setNotes} placeholder="Paste configuration…" value={notes} />
      </section>

      <section className={styles.section}>
        <h2>Numbers and ranges</h2>
        <div className={styles.twoColumns}>
          <UiNumberField label="Drive count" max={24} min={1} onChange={setDriveCount} value={driveCount} />
          <UiQuantityField
            label="Capacity"
            min={0}
            onChange={setCapacity}
            onUnitChange={setCapacityUnit}
            unit={capacityUnit}
            units={unitOptions}
            value={capacity}
          />
          <UiQuantityInput
            label="Exact disk size"
            onChange={setExactCapacity}
            onUnitChange={setCapacityUnit}
            placeholder="18.25"
            unit={capacityUnit}
            units={unitOptions}
            value={exactCapacity}
          />
        </div>
        <UiSlider label="Free-space reserve" max={40} onChange={setReserve} value={reserve} formatOptions={{ style: "unit", unit: "percent" }} />
        <UiRangeSlider label="Drive-size range" max={24} min={1} onChange={setRange} value={range} formatOptions={{ style: "unit", unit: "terabyte" }} />
      </section>

      <section className={styles.section}>
        <h2>Choices</h2>
        <UiChoiceGroup
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
          <UiCheckbox isSelected={keepFree} onChange={setKeepFree}>Reserve 20% free space</UiCheckbox>
          <UiSwitch isSelected={liveResults} onChange={setLiveResults}>Update results while editing</UiSwitch>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Repeated rows</h2>
        <UiRepeatableList
          addLabel="Add drive"
          ariaLabel="Data drives"
          items={drives}
          onAdd={() => setDrives((current) => [...current, { id: `drive-${Date.now()}`, capacity: 8, unit: "TB" }])}
          onRemove={(id) => setDrives((current) => current.filter((drive) => drive.id !== id))}
          removeLabel={(_, index) => `Remove drive ${index + 1}`}
          renderItem={(drive, index) => (
            <UiQuantityField
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
        <UiDisclosure label="Advanced settings">
          <div className={styles.disclosureGrid}>
            <UiSelect
              label="Record size"
              options={[
                { id: "16K", label: "16 KiB" },
                { id: "128K", label: "128 KiB" },
                { id: "1M", label: "1 MiB" },
              ]}
              value="128K"
            />
          </div>
        </UiDisclosure>
      </section>

      <section className={styles.section}>
        <h2>Actions and feedback</h2>
        <form className={styles.validationForm} onSubmit={validate}>
          <UiTextField
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
          <UiActionRow>
            <UiButton onPress={() => setHostname("")} variant="ghost">Clear</UiButton>
            <UiButton type="submit" variant="secondary">Test validation</UiButton>
            <UiButton onPress={() => setStatus("Example finished.")} variant="primary">Run example</UiButton>
          </UiActionRow>
        </form>
        <UiStatus tone="success">{status}</UiStatus>
      </section>

      <section className={`${styles.section} ${styles.results}`}>
        <h2>Results</h2>
        <div className={styles.resultExample}>
          <UiPrimaryResult
            detail="After protection and the selected free-space reserve."
            label="Estimated usable capacity"
            unit="TiB"
            value="21.8"
          />
          <UiMetricGroup
            ariaLabel="Capacity summary"
            items={[
              { id: "raw", label: "Raw", value: "32", unit: "TiB" },
              { id: "protection", label: "Protection", value: "8", unit: "TiB" },
              { id: "reserve", label: "Reserve", value: "2.2", unit: "TiB" },
            ]}
          />
        </div>

        <div className={styles.resultExample}>
          <UiProgressBar label="Rebuild progress" value={rebuildProgress} />
          <UiActionRow>
            <UiButton onPress={() => setRebuildProgress(0)} variant="ghost">Reset progress</UiButton>
            <UiButton onPress={() => setRebuildProgress((current) => Math.min(100, current + 10))}>Advance 10%</UiButton>
          </UiActionRow>
        </div>

        <div className={styles.allocationExamples}>
          <div className={styles.resultExample}>
            <h3>Neutral allocation</h3>
            <UiAllocationBar
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
            <UiAllocationBar
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
            <UiAllocationBar
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

        <UiTimeline
          ariaLabel="Registration timeline"
          events={[
            { dateTime: "1995-08-14", id: "registered", label: "Registered", state: "past", value: "14 Aug 1995" },
            { dateTime: "2026-08-14", id: "changed", label: "Last changed", state: "current", value: "14 Aug 2026" },
            { dateTime: "2027-08-13", id: "expires", label: "Expires", state: "future", value: "13 Aug 2027" },
          ]}
        />

        <UiResultLead>Two authoritative nameservers returned four addresses.</UiResultLead>
        <UiKeyValueList rows={[
          { label: "Resolver", value: "Cloudflare" },
          { label: "Resolver TTL", value: "86,400 seconds" },
        ]} />
        <UiDataTable
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

        <UiCodeOutput
          actions={<UiCopyAction label="Copy command" successLabel="Command copied" value="zpool create vault raidz2 /dev/sd{a..f}" variant="ghost" />}
          code="zpool create vault raidz2 /dev/sd{a..f}"
          label="Generated command"
        />

        <UiRawOutput
          label="Registry response"
          value={{
            objectClassName: "domain",
            ldhName: "EXAMPLE.COM",
            self: "https://rdap.example.test/domain/example.com/a-very-long-unbroken-evidence-path-that-must-stay-inside-the-raw-output-viewport",
          }}
        />

        <UiActionRow>
          <UiCopyAction label="Copy summary" successLabel="Copied summary" value="Estimated usable capacity: 21.8 TiB" />
          <UiDownloadAction contents="Estimated usable capacity: 21.8 TiB\n" filename="capacity-report.txt" label="Download report" />
        </UiActionRow>
      </section>

      <section className={styles.section}>
        <h2>File uploads</h2>
        <div className={styles.uploadColumns}>
          <div className={styles.uploadExample}>
            <UiFileDropzone
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
            <UiFileList ariaLabel="Selected PDF files" files={pdfFiles} onRemove={(id) => removeFile(id, setPdfFiles)} />
          </div>
          <div className={styles.uploadExample}>
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
          </div>
        </div>
        <UiStatus tone={uploadStatus.includes("too large") || uploadStatus.includes("unsupported") || uploadStatus.includes("exceeds") ? "danger" : "neutral"}>{uploadStatus}</UiStatus>
      </section>

      <section className={styles.section}>
        <h2>Date and level selection</h2>
        <div className={styles.twoColumns}>
          <UiDatePicker description="Choose the day for the next maintenance window." label="Maintenance date" onChange={setMaintenanceDate} value={maintenanceDate} />
          <UiLevelSlider
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
          <UiBarChart
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
          <UiLineChart
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
          <UiDonutChart
            ariaLabel="Requests by service"
            caption="Each segment is part of the same total."
            data={[
              { id: "api", label: "API", value: 50 },
              { id: "worker", label: "Worker", value: 30 },
              { id: "scheduler", label: "Scheduler", value: 20 },
            ]}
          />
        </div>
        <div className={styles.flowExample}>
          <h3>PDF processing flow</h3>
          <UiFlowChart
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

      <section className={styles.section}>
        <h2>Content blocks</h2>
        <div className={styles.twoColumns}>
          <Callout title="Check the source" tone="note"><p>Use the provider's current documentation when a setting can change.</p></Callout>
          <Callout title="Back up before changing disks" tone="warning"><p>Changing a storage layout can erase the disks you select.</p></Callout>
          <ContentBlock kind="formula"><p><code>usable space = raw space × efficiency</code></p><p>Keep both values in the same unit.</p></ContentBlock>
          <ContentBlock kind="example"><p>Six 8 TB drives contain 48 TB of raw capacity before parity and overhead.</p></ContentBlock>
        </div>
        <Faq items={[{ question: "When should I use a chart?", answer: "Use one when measured values are easier to compare visually." }]} />
      </section>

      <section className={styles.section}>
        <h2>Navigation and states</h2>
        <Pagination ariaLabel="Example pages" currentPage={4} hrefForPage={(page) => `/components-ui?page=${page}`} totalPages={12} />
        <div><UiButton onPress={() => setDialogOpen(true)}>Open detail dialog</UiButton></div>
        {dialogOpen ? <DetailDialog ariaLabel="Example details" onClose={() => setDialogOpen(false)}>
          <div className={styles.dialogHeading}><h2>Example details</h2><DetailDialogClose ariaLabel="Close example details" onClose={() => setDialogOpen(false)} /></div>
          <p>This drawer keeps keyboard focus inside and returns focus to the opener when closed.</p>
          <a href="/components-ui">Example link</a>
        </DetailDialog> : null}
        <div className={styles.twoColumns}>
          <div><UiButton isDisabled>Unavailable action</UiButton></div>
          <StatePanel title="No results match those filters" action={<a href="/components-ui">Clear filters</a>}><p>Try a broader search.</p></StatePanel>
          <StatePanel state="error" title="The results could not load" action={<button onClick={() => setStatus("Ready to try again.")} type="button">Try again</button>}><p>Check your connection and retry.</p></StatePanel>
          <StatePanel state="loading" title="Checking results"><p>This may take a moment.</p></StatePanel>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Markdown content</h2>
        <p>Use the same Markdown syntax on every page that renders shared content.</p>
        <ContentMarkdown markdown={[
          "> [!NOTE] About this result",
          "> Values come from a single sample.",
          "",
          "> [!FORMULA] Percentage used",
          "> `used ÷ total × 100`",
          "",
          "> [!WARNING] Keep a backup",
          "> A disk change can remove data.",
          "",
          "> [!EXAMPLE] Small pool",
          "> 5 TB used out of 20 TB is 25% used.",
          "",
          "| Service | Requests |",
          "| --- | ---: |",
          "| API | 50 |",
          "| Worker | 30 |",
          "",
          "```bash",
          "df -h",
          "```",
          "",
          "```chart-bar",
          '{"title":"Requests by service","data":[{"id":"api","label":"API","value":50},{"id":"worker","label":"Worker","value":30}]}',
          "```",
          "",
          "```chart-line",
          '{"title":"Storage over time","valueLabel":"Used TB","data":[{"id":"jan","label":"January","xLabel":"Jan","value":5},{"id":"feb","label":"February","xLabel":"Feb","value":7}]}',
          "```",
          "",
          "```chart-donut",
          '{"title":"Work split","data":[{"id":"api","label":"API","value":50},{"id":"worker","label":"Worker","value":30}]}',
          "```",
        ].join("\n")} />
      </section>
    </main>
  );
}
