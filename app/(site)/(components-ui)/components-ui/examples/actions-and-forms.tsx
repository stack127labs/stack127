"use client";

import { useRef, useState, type FormEvent } from "react";
import { RotateCcw } from "lucide-react";
import { UiButton, UiCopyAction, UiDisclosure, UiDownloadAction, UiQuantityField, UiRepeatableList, UiSelect, UiShareAction, UiTextField, uiSetSummary, type UiOption } from "@/app/ui/controls";
import { UiActionRow, UiStatus } from "@/app/ui/display";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const unitOptions: UiOption[] = [
  { id: "GB", label: "GB" },
  { id: "TB", label: "TB" },
];

const recordSizeOptions: UiOption[] = [
  { id: "16K", label: "16 KiB" },
  { id: "128K", label: "128 KiB" },
  { id: "1M", label: "1 MiB" },
];

type Drive = { id: string; capacity: number; unit: string };

export function ActionsAndFormsExamples() {
  const [hostname, setHostname] = useState("");
  const [recordSize, setRecordSize] = useState("128K");
  const [windowDays, setWindowDays] = useState("");
  const [annualShare, setAnnualShare] = useState("");
  const advancedSet = [windowDays, annualShare].filter((value) => value.trim()).length;
  const [hostnameError, setHostnameError] = useState<string | null>(null);
  const [status, setStatus] = useState("Enter a hostname, then check it.");
  const hostnameRef = useRef<HTMLInputElement>(null);
  const [drives, setDrives] = useState<Drive[]>([
    { id: "drive-1", capacity: 8, unit: "TB" },
    { id: "drive-2", capacity: 8, unit: "TB" },
  ]);

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
    <>
      <Example components={["UiButton", "UiActionRow"]} note="Use one primary button per form. Buttons name the action." source="app/ui/controls.tsx, app/ui/display.tsx" title="Buttons">
        <UiActionRow>
          <UiButton variant="primary">Check domain</UiButton>
          <UiButton variant="secondary">Add example</UiButton>
          <UiButton variant="ghost">Clear</UiButton>
          <UiButton aria-label="Reset" variant="icon"><RotateCcw aria-hidden="true" size={17} /></UiButton>
          <UiButton isDisabled>Unavailable</UiButton>
        </UiActionRow>
      </Example>

      <Example components={["UiTextField", "UiButton", "UiStatus"]} note="Submit with an empty field to see the error. Focus moves back to the field." source="app/ui/controls.tsx, app/ui/display.tsx" title="Form validation">
        <form className={styles.stack} onSubmit={validate}>
          <div className={styles.narrow}>
            <UiTextField
              error={hostnameError}
              inputRef={hostnameRef}
              label="Hostname"
              onChange={(value) => {
                setHostname(value);
                if (hostnameError) setHostnameError(null);
              }}
              placeholder="nas.example.com"
              required
              spellCheck={false}
              value={hostname}
            />
          </div>
          <UiActionRow>
            <UiButton type="submit" variant="primary">Check hostname</UiButton>
            <UiButton onPress={() => setHostname("")} variant="ghost">Clear</UiButton>
          </UiActionRow>
          <UiStatus tone={hostnameError ? "danger" : "neutral"}>{hostnameError ?? status}</UiStatus>
        </form>
      </Example>

      <Example components={["UiCopyAction", "UiDownloadAction"]} note="Turn a download off with isDisabled while its result is stale." source="app/ui/controls.tsx" title="Copy and download">
        <UiActionRow>
          <UiCopyAction label="Copy summary" successLabel="Copied summary" value="Estimated usable capacity: 21.8 TiB" />
          <UiDownloadAction contents={"Estimated usable capacity: 21.8 TiB\n"} filename="capacity-report.txt" label="Download report" />
          <UiDownloadAction contents={"Estimated usable capacity: 21.8 TiB\n"} filename="capacity-report.csv" isDisabled label="Download CSV" />
        </UiActionRow>
      </Example>

      <Example components={["UiRepeatableList"]} note="Adding a row moves focus to it. Removing a row moves focus to the next one. With minItems, remove turns off at the minimum; try removing the last drive." source="app/ui/controls.tsx" title="Repeated rows">
        <UiRepeatableList
          addLabel="Add drive"
          ariaLabel="Data drives"
          items={drives}
          minItems={1}
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
      </Example>

      <Example components={["UiDisclosure", "uiSetSummary"]} note="Advanced holds optional refinements, closed by default. Name it for what's inside. While closed, the summary says what's set. Empty fields change nothing." source="app/ui/controls.tsx" title="Advanced settings">
        <UiDisclosure label="Cohorts and billing" summary={uiSetSummary(advancedSet)}>
          <div className={styles.twoColumns}>
            <UiTextField hint="Days each trial gets to pay, counted from its start." inputMode="numeric" label="Follow-up window" onChange={setWindowDays} placeholder="30" suffix="days" value={windowDays} />
            <UiTextField hint="Share of new customers who pick a yearly plan." inputMode="decimal" label="Annual-plan share" onChange={setAnnualShare} placeholder="20" suffix="%" value={annualShare} />
          </div>
        </UiDisclosure>
      </Example>

      <Example components={["UiDisclosure"]} note="A disclosure can also hold evidence or diagnostics, such as raw responses." source="app/ui/controls.tsx" title="Diagnostics">
        <UiDisclosure label="Pool settings" summary={`${recordSizeOptions.find((option) => option.id === recordSize)?.label} record size`}>
          <div className={styles.narrow}>
            <UiSelect
              label="Record size"
              onChange={setRecordSize}
              options={recordSizeOptions}
              value={recordSize}
            />
          </div>
        </UiDisclosure>
      </Example>

      <Example components={["UiShareAction"]} note="Copies a link that reopens the tool with the same inputs. Empty values stay out of the link." source="app/ui/controls.tsx" title="Share link">
        <UiActionRow>
          <UiShareAction params={{ trials: 200, paid: 22, price: 29, window: "" }} />
        </UiActionRow>
      </Example>
    </>
  );
}
