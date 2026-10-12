"use client";

import { useState } from "react";
import { UiButton, UiCopyAction, UiRawOutput } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiCodeOutput, UiRangeMarker, UiKeyValueList, UiMetricGroup, UiPrimaryResult, UiProgressBar, UiResultLead, UiStatusWord, UiSteps, UiTimeline, UiUnitGrid } from "@/app/ui/display";
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
              { id: "reserve", label: "Reserve", value: "2.2", unit: "TiB", hint: "Free space kept back so the pool stays fast." },
            ]}
          />
        </div>
      </Example>

      <Example components={["UiMetricGroup"]} note="The list layout gives one row per number, label left and value right, for numbers people read down a column." source="app/ui/display.tsx" title="Supporting numbers as a list">
        <div className={styles.stack}>
          <UiMetricGroup
            ariaLabel="Trial numbers"
            items={[
              { id: "not-paid", label: "Didn't pay", value: "460" },
              { id: "per-paid", label: "Trials per paying customer", value: "12.5", hint: "How many trial starts it took for each one that paid." },
              { id: "mrr", label: "New MRR", value: "$1,960.00" },
            ]}
            layout="list"
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

      <Example components={["UiRangeMarker"]} note="Where a value sits next to published ranges. Position only, never a grade. The hint names each range's source. An optional range under the track shows where the person's own value probably sits, such as at a small sample size." source="app/ui/display.tsx" title="Range marker">
        <div className={styles.stack}>
          <UiRangeMarker
            ariaLabel="Your trial conversion rate next to published ranges"
            bands={[
              { id: "median", from: 4, to: 6, label: "Median, no-card trials", valueText: "4 to 6%", hint: "ChartMogul survey of 200 software products, January 2026." },
              { id: "top", from: 10, to: 15, label: "Top quarter, no-card trials", valueText: "10 to 15%", hint: "ChartMogul survey of 200 software products, January 2026." },
            ]}
            max={30}
            maxText="30%"
            minText="0%"
            range={{ from: 5.92, to: 10.72, label: "Likely range at 500 starts", valueText: "5.92 to 10.72%", hint: "The true rate is probably in this range. Fewer starts make it wider." }}
            value={8}
            valueText="8%"
          />
          <UiRangeMarker
            ariaLabel="A value near the start of the scale"
            bands={[{ id: "median", from: 4, to: 6, label: "Median", valueText: "4 to 6%" }]}
            max={30}
            maxText="30%"
            minText="0%"
            value={1.5}
            valueText="1.5%"
          />
        </div>
      </Example>

      <Example components={["UiUnitGrid"]} note="A share of a group, as filled units out of 100. The last unit fills partly. Use it for rates of people or items. An optional target outlines the units up to a goal." source="app/ui/display.tsx" title="Unit grid">
        <div className={styles.twoColumns}>
          <UiUnitGrid ariaLabel="Paid out of every 100 who started" emptyLabel="Didn't pay" filled={13.22} filledLabel="Paid" target={{ amount: 20, label: "At 20%", valueText: "20 of every 100" }} valueText="13.22 of every 100" />
          <UiUnitGrid ariaLabel="Drives that failed out of every 100" emptyLabel="Still running" filled={4.5} filledLabel="Failed" tone="neutral" valueText="4.5 of every 100" />
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
