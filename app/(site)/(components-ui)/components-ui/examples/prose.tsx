import { Note } from "@/app/ui/callout";
import { ContentBlock } from "@/app/ui/content-block";
import { ContentTable } from "@/app/ui/content-elements";
import { CodeBlock } from "@/app/ui/site/code-block";
import { proseClassName, proseFlowClassName, proseLedeClassName } from "@/app/ui/site/prose";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const flow = `${proseClassName} ${proseFlowClassName} ${styles.reading}`;

export function ProseExamples() {
  return (
    <>
      <Example
        components={["proseClassName", "proseFlowClassName"]}
        note="Every element page content can write, in one reading flow. The flow sets the gaps: 16px between elements, 32px before a later h2, and 24px before a later h3."
        source="app/ui/site/prose.ts, app/ui/site/prose.module.css"
        title="Headings and text"
        usage={{ label: "MDX", code: `## How does a reverse proxy work?

A reverse proxy sits in front of your apps and sends each request to the right one.
It also handles [HTTPS certificates](/nginx-proxy-pass-calculator) in one place.

### What it changes

Requests reach **one address**, and the proxy picks the app by *host name*.
Run \`docker compose up -d\` to start it.` }}
      >
        <div className={flow}>
          <h2>How does a reverse proxy work?</h2>
          <p>A reverse proxy sits in front of your apps and sends each request to the right one. It also handles <a href="/nginx-proxy-pass-calculator">HTTPS certificates</a> in one place.</p>
          <h3>What it changes</h3>
          <p>Requests reach <strong>one address</strong>, and the proxy picks the app by <em>host name</em>. Run <code>docker compose up -d</code> to start it.</p>
          <h4>A fourth-level heading</h4>
          <p>Use it rarely. Most pages need only h2 and h3.</p>
          <p><small>Small print, for a source line or a date checked. Checked on 9 October 2026.</small></p>
        </div>
      </Example>

      <Example
        components={["proseClassName", "proseFlowClassName"]}
        note="Bullets for related items, numbers for steps. A list may hold one nested list."
        source="app/ui/site/prose.module.css"
        title="Lists"
        usage={{ label: "MDX", code: `- One address for many apps
- One place to renew certificates
  - Certificates renew on their own
  - The proxy picks up each new one

1. Point the domain at your server.
2. Start the proxy.
3. Add one rule per app.` }}
      >
        <div className={flow}>
          <ul>
            <li>One address for many apps</li>
            <li>One place to renew certificates
              <ul>
                <li>Certificates renew on their own</li>
                <li>The proxy picks up each new one</li>
              </ul>
            </li>
          </ul>
          <ol>
            <li>Point the domain at your server.</li>
            <li>Start the proxy.</li>
            <li>Add one rule per app.</li>
          </ol>
        </div>
      </Example>

      <Example
        components={["proseClassName"]}
        note="A quote is someone else's words, such as a provider's policy. Use a callout for your own advice. A rule separates two unrelated parts of a page; most pages don't need one."
        source="app/ui/site/prose.module.css"
        title="Quote and rule"
        usage={{ label: "MDX", code: `> Registrars may deny a transfer within 60 days of a change of registrant.

---` }}
      >
        <div className={flow}>
          <blockquote><p>Registrars may deny a transfer within 60 days of a change of registrant.</p></blockquote>
          <hr />
          <p>Text after the rule continues the page.</p>
        </div>
      </Example>

      <Example
        components={["proseClassName", "proseFlowClassName", "ContentTable"]}
        note="How tables, callouts, formulas, and code sit between paragraphs. Blocks take the same 16px gap as text, so the page keeps one rhythm."
        source="app/ui/site/prose.module.css"
        title="Blocks in the flow"
      >
        <div className={flow}>
          <h2>How much does storage cost?</h2>
          <p>Cloud storage is billed per GB each month. The price drops as the tier gets colder.</p>
          <ContentTable>
            <thead><tr><th>Tier</th><th>Example price per GB per month</th></tr></thead>
            <tbody>
              <tr><td>Hot</td><td>$0.020</td></tr>
              <tr><td>Cool</td><td>$0.010</td></tr>
              <tr><td>Archive</td><td>$0.002</td></tr>
            </tbody>
          </ContentTable>
          <p>Multiply the stored amount by the tier price.</p>
          <ContentBlock kind="formula" title="Monthly cost">
            <p><code>monthly cost = stored GB × price per GB</code></p>
          </ContentBlock>
          <Note title="Prices change"><p>Check the provider&apos;s price page before you commit.</p></Note>
          <p>To see what a folder holds before you upload it, run:</p>
          <CodeBlock label="bash">du -sh ~/photos</CodeBlock>
          <p>The total is the stored amount to multiply.</p>
        </div>
      </Example>

      <Example
        components={["proseLedeClassName", "proseSectionFlowClassName"]}
        note="The lede is a page's opening paragraph. A section flow wraps separate prose sections and puts 40px between them."
        source="app/ui/site/prose.ts"
        title="Lede and sections"
        usage={{ label: "TSX", code: `<p className={proseLedeClassName}>…</p>

<div className={\`\${proseClassName} \${proseSectionFlowClassName}\`}>
  <section>…</section>
  <section>…</section>
</div>` }}
      >
        <div className={proseClassName}>
          <p className={proseLedeClassName}>Find out how long a customer takes to pay back what you spent to win them.</p>
        </div>
      </Example>
    </>
  );
}
