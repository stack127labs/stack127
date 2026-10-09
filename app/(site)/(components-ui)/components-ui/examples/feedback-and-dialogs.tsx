"use client";

import { useState } from "react";
import { siteDoodleSparkArt } from "@/app/(site)/art/site--doodle-spark";
import { UiButton } from "@/app/ui/controls";
import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { HiddenDetails, hiddenDetailsHtml } from "@/app/ui/directories/hidden-details";
import { UiActionRow, UiStatus } from "@/app/ui/display";
import { Doodle } from "@/app/ui/site/doodle";
import { StatePanel } from "@/app/ui/state-panel";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const records = [
  { slug: "photo-library", name: "Example photo library", body: <><p>Back up phone photos and browse them on your own server.</p><p>Needs 2 to 4 GB of RAM.</p></> },
  { slug: "password-vault", name: "Example password vault", body: <><p>Keep passwords in a vault you host yourself.</p><p>Runs in under 1 GB of RAM.</p></> },
];

export function FeedbackAndDialogsExamples() {
  const [status, setStatus] = useState("Ready.");
  const [openRecord, setOpenRecord] = useState<{ name: string; html: string } | null>(null);

  function openDetails(slug: string, name: string) {
    setOpenRecord({ name, html: hiddenDetailsHtml("gallery-record", slug) ?? "" });
  }

  return (
    <>
      <Example components={["UiStatus"]} note="A changing status message. Screen readers announce it. Danger uses an alert." source="app/ui/display.tsx" title="Status message">
        <div className={styles.stack}>
          <UiStatus>{status}</UiStatus>
          <UiStatus tone="success">example.com is available.</UiStatus>
          <UiStatus tone="warning">The registry answered slowly. Results may be out of date.</UiStatus>
          <UiStatus tone="danger">The lookup failed. Check the name and try again.</UiStatus>
          <UiActionRow>
            <UiButton onPress={() => setStatus("Checking example.com…")}>Change the first message</UiButton>
          </UiActionRow>
        </div>
      </Example>

      <Example components={["StatePanel"]} note="Empty, loading, and error panels. Give a clear title, a short reason, and a way forward." source="app/ui/state-panel.tsx" title="State panels">
        <div className={styles.twoColumns}>
          <StatePanel action={<a href="/components-ui/feedback-and-dialogs">Clear filters</a>} title="No results match those filters" visual={<Doodle svg={siteDoodleSparkArt} />}><p>Try a broader search.</p></StatePanel>
          <StatePanel state="loading" title="Checking results"><p>This may take a moment.</p></StatePanel>
          <StatePanel action={<button onClick={() => setStatus("Ready to try again.")} type="button">Try again</button>} state="error" title="The results could not load"><p>Check your connection and retry.</p></StatePanel>
        </div>
      </Example>

      <Example
        components={["DetailDialog", "DetailDialogClose", "HiddenDetails"]}
        note="A side drawer for one record. It keeps focus inside, closes with Escape, and returns focus to the opener. HiddenDetails keeps each record's details in the page HTML, so search engines can read them before anyone opens the drawer."
        source="app/ui/detail-dialog.tsx, app/ui/directories/hidden-details.tsx"
        title="Detail drawer"
      >
        <UiActionRow>
          {records.map((record) => (
            <UiButton key={record.slug} onPress={() => openDetails(record.slug, record.name)}>Open {record.name.toLowerCase()}</UiButton>
          ))}
        </UiActionRow>
        <HiddenDetails items={records} prefix="gallery-record" />
        {openRecord ? (
          <DetailDialog ariaLabel={`${openRecord.name} details`} onClose={() => setOpenRecord(null)}>
            <div className={styles.dialogHeading}>
              <h2>{openRecord.name}</h2>
              <DetailDialogClose ariaLabel={`Close ${openRecord.name} details`} onClose={() => setOpenRecord(null)} />
            </div>
            <div dangerouslySetInnerHTML={{ __html: openRecord.html }} />
          </DetailDialog>
        ) : null}
      </Example>
    </>
  );
}
