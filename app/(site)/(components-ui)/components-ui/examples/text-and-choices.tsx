"use client";

import { useState } from "react";
import type { DateValue, TimeValue } from "react-aria-components";
import { UiCheckbox, UiChoiceGroup, UiComboBox, UiDatePicker, UiDateTimePicker, UiMultiChoiceGroup, UiSearchField, UiSelect, UiSwitch, UiTextArea, UiTextField, UiTimeField, type UiOption } from "@/app/ui/controls";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

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

export function TextAndChoicesExamples() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("example");
  const domainError = /^[^\s.]+(\.[^\s.]+)+$/.test(domain.trim()) ? null : "Enter a domain name, such as example.com.";
  const [notes, setNotes] = useState("");
  const [resolver, setResolver] = useState("cloudflare");
  const [recordType, setRecordType] = useState<string | null>(null);
  const [maintenanceDate, setMaintenanceDate] = useState<DateValue | null>(null);
  const [backupTime, setBackupTime] = useState<TimeValue | null>(null);
  const [launchAt, setLaunchAt] = useState<DateValue | null>(null);
  const [hourCycle, setHourCycle] = useState<12 | 24>(12);
  const [layout, setLayout] = useState("raidz1");
  const [format, setFormat] = useState("paperback");
  const [marketplaces, setMarketplaces] = useState(["us", "uk"]);
  const [recordTypes, setRecordTypes] = useState(["a"]);
  const [keepFree, setKeepFree] = useState(false);
  const [liveResults, setLiveResults] = useState(true);

  return (
    <>
      <Example components={["UiTextField"]} source="app/ui/controls.tsx" title="Text field">
        <div className={styles.twoColumns}>
          <UiTextField label="DNS name" placeholder="example.com" required spellCheck={false} />
          <UiTextField description="Shown under the field when it helps." label="Book title" placeholder="My first cookbook" />
          <UiTextField error={domainError} label="Field with an error" onChange={setDomain} required spellCheck={false} value={domain} />
          <UiTextField label="Field with a suffix" placeholder="80" suffix="pages" />
        </div>
      </Example>

      <Example components={["UiSearchField"]} source="app/ui/controls.tsx" title="Search field">
        <div className={styles.narrow}>
          <UiSearchField label="Filter records" onChange={setSearch} placeholder="Type to filter…" value={search} />
        </div>
      </Example>

      <Example components={["UiTextArea"]} source="app/ui/controls.tsx" title="Text area">
        <UiTextArea label="Configuration" onChange={setNotes} placeholder="Paste configuration…" value={notes} />
      </Example>

      <Example components={["UiSelect", "UiComboBox"]} note="Use a select for a short list. Use a combo box when people need to type to find an option." source="app/ui/controls.tsx" title="Select and combo box">
        <div className={styles.twoColumns}>
          <UiSelect label="Resolver" onChange={setResolver} options={resolverOptions} required value={resolver} />
          <UiComboBox label="Record type" onChange={setRecordType} options={recordOptions} placeholder="Find a record type…" value={recordType} />
        </div>
      </Example>

      <Example components={["UiDatePicker", "UiTimeField", "UiDateTimePicker"]} note="Type each part, or pick from the calendar or clock. In the date and time picker, choosing a day opens the time list. Times use 12 hours unless the tool sets hourCycle={24}." source="app/ui/controls.tsx" title="Date and time">
        <div className={styles.stack}>
          <UiSwitch isSelected={hourCycle === 24} onChange={(on) => setHourCycle(on ? 24 : 12)}>Show these times in 24 hours</UiSwitch>
          <div className={styles.twoColumns}>
            <UiDatePicker description="Choose the day for the next maintenance window." label="Maintenance date" onChange={setMaintenanceDate} value={maintenanceDate} />
            <UiTimeField description="Daily, in your local time." hourCycle={hourCycle} label="Backup time" onChange={setBackupTime} value={backupTime} />
            <UiDateTimePicker description="Date and time together." hourCycle={hourCycle} label="Launch at" onChange={setLaunchAt} value={launchAt} />
          </div>
        </div>
      </Example>

      <Example components={["UiChoiceGroup"]} note="Pick exactly one. Options can carry a short description." source="app/ui/controls.tsx" title="One choice">
        <div className={styles.twoColumns}>
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
          <UiChoiceGroup
            label="Book format"
            onChange={setFormat}
            options={[
              { id: "ebook", label: "Ebook", description: "Kindle edition" },
              { id: "paperback", label: "Paperback", description: "Printed on demand" },
              { id: "hardcover", label: "Hardcover", description: "Case laminate" },
            ]}
            value={format}
          />
        </div>
      </Example>

      <Example components={["UiMultiChoiceGroup"]} note="Pick any number. Each option carries a small check box, so it reads differently from a one-choice group." source="app/ui/controls.tsx" title="Several choices">
        <div className={styles.twoColumns}>
          <UiMultiChoiceGroup
            label="Marketplaces"
            onChange={setMarketplaces}
            options={[
              { id: "us", label: "Amazon.com" },
              { id: "uk", label: "Amazon.co.uk" },
              { id: "de", label: "Amazon.de" },
              { id: "jp", label: "Amazon.co.jp" },
            ]}
            value={marketplaces}
          />
          <UiMultiChoiceGroup
            description="Choose at least one record type."
            label="Record types"
            onChange={setRecordTypes}
            options={[
              { id: "a", label: "A", description: "IPv4 address" },
              { id: "aaaa", label: "AAAA", description: "IPv6 address" },
              { id: "mx", label: "MX", description: "Mail server" },
            ]}
            value={recordTypes}
          />
        </div>
      </Example>

      <Example components={["UiCheckbox", "UiSwitch"]} note="Unavailable choices are muted, with a dashed outline. An unavailable checkbox shows an X." source="app/ui/controls.tsx" title="Checkbox and switch">
        <div className={styles.inlineChoices}>
          <UiCheckbox isSelected={keepFree} onChange={setKeepFree}>Reserve 20% free space</UiCheckbox>
          <UiCheckbox isDisabled>Unavailable option</UiCheckbox>
          <UiCheckbox isDisabled isSelected>Always included</UiCheckbox>
          <UiSwitch isSelected={liveResults} onChange={setLiveResults}>Update results while editing</UiSwitch>
          <UiSwitch isDisabled>Unavailable setting</UiSwitch>
        </div>
      </Example>
    </>
  );
}
