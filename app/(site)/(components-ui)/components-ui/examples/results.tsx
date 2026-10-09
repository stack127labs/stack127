"use client";

import { useState } from "react";
import { UiButton, UiCopyAction, UiRawOutput } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiCodeOutput, UiKeyValueList, UiMetricGroup, UiPrimaryResult, UiProgressBar, UiResultLead, UiStatusWord, UiSteps, UiTimeline } from "@/app/ui/display";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const formatTiB = (value: number | bigint) => `${value} TiB`;

export function ResultsExamples() {
  const [rebuildProgress, setRebuildProgress] = useState(68);

  return (
    <>
      <Example components={["UiPrimaryResult", "UiMetricGroup"]} note="Lead with the answer, then the numbers behind it." source="app/ui/display.tsx" title="Main answer and supporting numbers">
        <div className={styles.stack}>
          <UiPrimaryResult detail="After protection and the selected free-space reserve." label="Estimated usable capacity" unit="TiB" value="21.8" />
          <UiMetricGroup
            ariaLabel="Capacity summary"
            items={[
              { id: "raw", label: "Raw", value: "32", unit: "TiB" },
              { id: "protection", label: "Protection", value: "8", unit: "TiB" },
              { id: "reserve", label: "Reserve", value: "2.2", unit: "TiB" },
            ]}
          />
        </div>
      </Example>

      <Example components={["UiPrimaryResult"]} note="Tones mark a good, risky, or failing answer. Neutral is the default." source="app/ui/display.tsx" title="Result tones">
        <div className={styles.twoColumns}>
          <UiPrimaryResult label="Break-even ACoS" tone="success" unit="%" value="42" />
          <UiPrimaryResult label="Days until expiry" tone="warning" value="12" />
          <UiPrimaryResult detail="Lower than the printing cost." label="Royalty per sale" tone="danger" value="$0.00" />
          <UiPrimaryResult label="Monthly recurring revenue" value="$8,400" />
        </div>
      </Example>

      <Example components={["UiResultLead", "UiKeyValueList", "UiStatusWord"]} note="A full sentence first, then the facts. Status words mark a short verdict inside a row or sentence." source="app/ui/display.tsx" title="Lead sentence, facts, and status words">
        <div className={styles.stack}>
          <UiResultLead>Two authoritative nameservers returned four addresses.</UiResultLead>
          <UiKeyValueList rows={[
            { label: "Resolver", value: "Cloudflare" },
            { label: "Resolver TTL", value: "86,400 seconds" },
            { label: "DNSSEC", value: <UiStatusWord tone="success">Signed</UiStatusWord> },
            { label: "CAA record", value: <UiStatusWord tone="warning">Missing</UiStatusWord> },
          ]} />
          <p className={styles.inlineChoices}>
            <UiStatusWord>Neutral</UiStatusWord>
            <UiStatusWord tone="success">Meets target</UiStatusWord>
            <UiStatusWord tone="warning">Check this</UiStatusWord>
            <UiStatusWord tone="danger">Misses target</UiStatusWord>
          </p>
        </div>
      </Example>

      <Example components={["UiProgressBar"]} source="app/ui/display.tsx" title="Progress">
        <div className={styles.stack}>
          <UiProgressBar label="Rebuild progress" value={rebuildProgress} />
          <UiActionRow>
            <UiButton onPress={() => setRebuildProgress(0)} variant="ghost">Reset progress</UiButton>
            <UiButton onPress={() => setRebuildProgress((current) => Math.min(100, current + 10))}>Advance 10%</UiButton>
          </UiActionRow>
        </div>
      </Example>

      <Example components={["UiAllocationBar"]} note="Parts of one total. Pick the neutral, accent, or categorical palette." source="app/ui/display.tsx" title="Allocation bar">
        <div className={styles.stack}>
          <UiAllocationBar ariaLabel="Neutral allocation" formatValue={formatTiB} palette="neutral" segments={[{ id: "used", label: "Used", value: 21.8 }, { id: "free", label: "Free", value: 10.2 }]} total={32} />
          <UiAllocationBar ariaLabel="Accent allocation" formatValue={formatTiB} palette="accent" segments={[{ id: "selected", label: "Selected", value: 18 }, { id: "remaining", label: "Remaining", value: 14 }]} total={32} />
          <UiAllocationBar
            ariaLabel="Categorical allocation"
            formatValue={formatTiB}
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
      </Example>

      <Example components={["UiTimeline"]} source="app/ui/display.tsx" title="Timeline">
        <UiTimeline
          ariaLabel="Registration timeline"
          events={[
            { dateTime: "1995-08-14", id: "registered", label: "Registered", state: "past", value: "14 Aug 1995" },
            { dateTime: "2026-08-14", id: "changed", label: "Last changed", state: "current", value: "14 Aug 2026" },
            { dateTime: "2027-08-13", id: "expires", label: "Expires", state: "future", value: "13 Aug 2027" },
          ]}
        />
      </Example>

      <Example components={["UiSteps"]} note="Ordered stages and which one is done, current, or next." source="app/ui/display.tsx" title="Steps">
        <UiSteps
          ariaLabel="PDF check steps"
          steps={[
            { detail: "File type and size accepted", id: "receive", label: "Receive", state: "complete" },
            { detail: "Pages, boxes, fonts, and images", id: "inspect", label: "Inspect", state: "complete" },
            { detail: "Compare against the chosen KDP setup", id: "compare", label: "Compare", state: "current" },
            { detail: "Findings you can act on", id: "report", label: "Report", state: "pending" },
          ]}
        />
      </Example>

      <Example components={["UiCodeOutput", "UiRawOutput"]} note="Generated text people copy, and the raw response kept behind a disclosure." source="app/ui/display.tsx, app/ui/controls.tsx" title="Generated output">
        <div className={styles.stack}>
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
        </div>
      </Example>
    </>
  );
}
