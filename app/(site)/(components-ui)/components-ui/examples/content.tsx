import { Note, Tip, Warning } from "@/app/ui/callout";
import { ContentBlock } from "@/app/ui/content-block";
import { Term, Terms } from "@/app/ui/content-elements";
import { Faq } from "@/app/ui/faq";
import { CodeBlock } from "@/app/ui/site/code-block";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

// Demos sit in the same prose flow as page content, so they look the way a page shows them.
const flow = `${proseClassName} ${proseFlowClassName} ${styles.reading}`;

export function ContentExamples() {
  return (
    <>
      <Example
        components={["Note", "Warning", "Tip", "Callout"]}
        note="A note is context to keep in mind. A warning is something that can cost money, data, or time, and it is the only one whose title takes a color. A tip is a recommendation. Without a title, each one uses its kind as the title."
        source="app/ui/callout.tsx"
        title="Callouts"
        usage={{ label: "MDX", code: `<Note title="Check the source">
Use the provider's current documentation when a setting can change.
</Note>

<Warning title="Back up before changing disks">
Changing a storage layout can erase the disks you select.
</Warning>

<Tip title="Start with a mirror">
Two matching drives are the simplest layout to restore.
</Tip>` }}
      >
        <div className={flow}>
          <Note title="Check the source"><p>Use the provider&apos;s current documentation when a setting can change.</p></Note>
          <Warning title="Back up before changing disks"><p>Changing a storage layout can erase the disks you select.</p></Warning>
          <Tip title="Start with a mirror"><p>Two matching drives are the simplest layout to restore.</p></Tip>
        </div>
      </Example>

      <Example
        components={["ContentBlock"]}
        note="A formula holds the rule once. An example works it through with real numbers. Code inside a formula reads as plain math, without code chips."
        source="app/ui/content-block.tsx"
        title="Formula and example"
        usage={{ label: "MDX", code: `<Formula title="Payback months">

\`payback months = CAC ÷ (monthly ARPA × gross margin)\`

Use gross margin as a decimal, so 80% is 0.8.

</Formula>

<Example title="A $1,200 customer">

A customer costs $1,200 to win and pays $100 a month at an 80% gross margin.
Each month returns $80, so the cost comes back in 15 months.

</Example>` }}
      >
        <div className={flow}>
          <ContentBlock kind="formula" title="Payback months">
            <p><code>payback months = CAC ÷ (monthly ARPA × gross margin)</code></p>
            <p>Use gross margin as a decimal, so 80% is 0.8.</p>
          </ContentBlock>
          <ContentBlock kind="example" title="A $1,200 customer">
            <p>A customer costs $1,200 to win and pays $100 a month at an 80% gross margin. Each month returns $80, so the cost comes back in 15 months.</p>
          </ContentBlock>
        </div>
      </Example>

      <Example
        components={["Terms", "Term"]}
        note="Words a reader may not know, each with its meaning."
        source="app/ui/content-elements.tsx"
        title="Terms"
        usage={{ label: "MDX", code: `<Terms>
<Term name="TTL">How long a resolver may keep a record before it asks again.</Term>
<Term name="Resolver">The DNS server that looks up names for your device.</Term>
</Terms>` }}
      >
        <div className={flow}>
          <Terms>
            <Term name="TTL">How long a resolver may keep a record before it asks again.</Term>
            <Term name="Resolver">The DNS server that looks up names for your device.</Term>
          </Terms>
        </div>
      </Example>

      <Example
        components={["Faq"]}
        note={<>Questions stay open, one under another. Course pages use this. In MDX, write each question as a <code>###</code> heading under a <code>##</code> heading instead.</>}
        source="app/ui/faq.tsx"
        title="Questions"
        usage={{ label: "TSX", code: `<Faq items={[
  { question: "When should I use a chart?", answer: "When measured values are easier to compare visually." },
  { question: "Can a directory use a tool component?", answer: "Yes. Every shared component works on every page type." },
]} />` }}
      >
        <Faq items={[
          { question: "When should I use a chart?", answer: <p>When measured values are easier to compare visually than to read.</p> },
          { question: "Can a directory use a tool component?", answer: <p>Yes. Every shared component works on every page type.</p> },
        ]} />
      </Example>

      <Example
        components={["CodeBlock"]}
        note="A fenced block with a language or file name shows it in the header bar. Without one, the copy button sits beside the code."
        source="app/ui/site/code-block.tsx"
        title="Code block"
        usage={{ label: "MDX", code: "```docker-compose.yml\nservices:\n  app:\n    image: ghcr.io/example/app:latest\n```\n\n```\nssh user@192.168.1.50\n```" }}
      >
        <CodeBlock label="docker-compose.yml">{`services:
  app:
    image: ghcr.io/example/app:latest
    ports:
      - "8080:80"`}</CodeBlock>
        <CodeBlock>ssh user@192.168.1.50</CodeBlock>
      </Example>
    </>
  );
}
