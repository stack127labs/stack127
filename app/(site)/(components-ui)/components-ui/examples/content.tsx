import { Callout, Note, Warning } from "@/app/ui/callout";
import { ContentBlock } from "@/app/ui/content-block";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { Faq } from "@/app/ui/faq";
import { CodeBlock } from "@/app/ui/site/code-block";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

export function ContentExamples() {
  return (
    <>
      <Example components={["Callout", "Note", "Warning"]} note="Note is context to keep in mind. Warning is something that can cost money, data, or time. Recommend is a suggested choice." source="app/ui/callout.tsx" title="Callouts">
        <div className={styles.twoColumns}>
          <Note title="Check the source"><p>Use the provider&apos;s current documentation when a setting can change.</p></Note>
          <Warning title="Back up before changing disks"><p>Changing a storage layout can erase the disks you select.</p></Warning>
          <Callout title="Start with a mirror" tone="recommend"><p>Two matching drives are the simplest layout to restore.</p></Callout>
        </div>
      </Example>

      <Example components={["ContentBlock"]} note="A formula box holds the rule. An example box works it through with real numbers." source="app/ui/content-block.tsx" title="Formula and example">
        <div className={styles.twoColumns}>
          <ContentBlock kind="formula"><p><code>usable space = raw space × efficiency</code></p><p>Keep both values in the same unit.</p></ContentBlock>
          <ContentBlock kind="example"><p>Six 8 TB drives contain 48 TB of raw capacity before parity and overhead.</p></ContentBlock>
        </div>
      </Example>

      <Example components={["Faq"]} source="app/ui/faq.tsx" title="Questions">
        <Faq items={[
          { question: "When should I use a chart?", answer: "Use one when measured values are easier to compare visually." },
          { question: "Can a directory use a tool component?", answer: "Yes. Every shared component works on every page type." },
        ]} />
      </Example>

      <Example components={["CodeBlock"]} note="A command or file with a label and a copy button." source="app/ui/site/code-block.tsx" title="Code block">
        <CodeBlock label="docker-compose.yml">{`services:
  app:
    image: ghcr.io/example/app:latest
    ports:
      - "8080:80"`}</CodeBlock>
      </Example>

      <Example components={["proseClassName", "proseFlowClassName"]} note="Reading text uses the shared prose classes for headings, lists, links, and spacing." source="app/ui/site/prose.ts" title="Prose">
        <div className={`${proseClassName} ${proseFlowClassName}`}>
          <h3>What is a reverse proxy?</h3>
          <p>A reverse proxy sits in front of your apps and sends each request to the right one. It also handles <a href="/nginx-proxy-pass-calculator">HTTPS certificates</a> in one place.</p>
          <ul>
            <li>One address for many apps</li>
            <li>One place to renew certificates</li>
          </ul>
        </div>
      </Example>

      <Example components={["ContentMarkdown"]} note="Markdown on any page uses this syntax for callouts, formulas, examples, tables, code, and charts." source="app/ui/content-markdown.tsx" title="Markdown">
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
          "> [!TIP] Start small",
          "> Two drives in a mirror are enough to begin.",
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
          '{"title":"Requests by service","caption":"Same 15-minute sample.","data":[{"id":"api","label":"API","value":50},{"id":"worker","label":"Worker","value":30}]}',
          "```",
          "",
          "```chart-line",
          '{"title":"Storage over time","valueLabel":"Used TB","data":[{"id":"jan","label":"January","xLabel":"Jan","value":5},{"id":"feb","label":"February","xLabel":"Feb","value":7},{"id":"mar","label":"March","xLabel":"Mar","value":8.5},{"id":"apr","label":"April","xLabel":"Apr","value":11}]}',
          "```",
          "",
          "```chart-donut",
          '{"title":"Work split","data":[{"id":"api","label":"API","value":50},{"id":"worker","label":"Worker","value":30}]}',
          "```",
        ].join("\n")} />
      </Example>
    </>
  );
}
