import Link from "next/link";
import type { MDXContent } from "mdx/types";
import type { ReactNode } from "react";
import { DetailsLayout, FactsList, KeyNumbers, NotPublic, SourcesLine, type Fact, type KeyNumber } from "@/app/ui/ad-networks/details";
import { formatDay } from "@/app/ui/ad-networks/site-format";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { UiTabs, type UiTab } from "@/app/ui/tabs";
import { NOT_PUBLIC, networkFacts } from "../ad-networks-shared";
import type { AdNetworkFacts } from "../network-facts";
import type { AdNetworkContent } from "./content";
import styles from "./network.module.css";

type KeyFact = AdNetworkFacts["keyNumbers"][number];

// The mockup's words for the labels research uses.
const keyLabels: Record<string, string> = { "your share": "revenue share" };

/** Keep the researched label and caveat intact, including product and regional limits. */
function keyNumber(item: KeyFact): KeyNumber {
  const label = item.label.charAt(0).toLowerCase() + item.label.slice(1);
  return { value: item.value, label: keyLabels[label] ?? label, note: item.note };
}

/** Tab files start at `##`. They sit under the h3 panel heading UiTabs adds, so they render one level down. */
const tabComponents = {
  h2: ({ children }: { children?: ReactNode }) => <h4>{children}</h4>,
  h3: ({ children }: { children?: ReactNode }) => <h5>{children}</h5>,
};

/** Article questions sit under the details h2, so their `##` headings render as h3. */
const articleComponents = {
  h2: ({ children }: { children?: ReactNode }) => <h3>{children}</h3>,
  h3: ({ children }: { children?: ReactNode }) => <h4>{children}</h4>,
};

function TabWords({ Words }: { Words?: MDXContent }) {
  return Words ? <div className={`${proseClassName} ${proseFlowClassName} ${styles.tabWords}`}><Words components={tabComponents} /></div> : null;
}

type FactRow = { label: string; value: string | null; note?: string };

/**
 * Fact rows for one tab: each published fact on its own row, then one `Not public` row naming
 * everything the network doesn't publish, so a tab doesn't read as a column of blanks.
 */
function factRows(rows: readonly FactRow[]): Fact[] {
  const known: Fact[] = rows.filter((row) => row.value).map((row) => ({ label: row.label, value: row.value, note: row.note }));
  // Later labels read in lower case, except names such as "Google standing".
  const missing = rows.filter((row) => !row.value).map((row, index) => (index && !/^Google\b/.test(row.label) ? row.label.toLowerCase() : row.label));
  return missing.length ? [...known, { label: "Not public", value: <NotPublic label={missing.join(", ")} /> }] : known;
}

/**
 * "What does <Network> require and pay?" (mockup `.details`): key numbers, the Joining, Pay,
 * Rules, and Service tabs, and the sources line, with the Q&A prose beside them. Numbers come from
 * network-facts.ts; the words come from the network's MDX files.
 */
export function NetworkDetails({ content, name, slug }: { content: AdNetworkContent; name: string; slug: string }) {
  const facts = networkFacts(slug);
  const { Article, Joining, Pay, Rules, Service } = content;

  const shown = facts?.keyNumbers.slice(0, 3) ?? [];
  const keyNumbers = shown.map(keyNumber);

  // Researched joining rows in network-facts.ts, in the mockup's order. "Not public" is a finding, not missing data.
  const joiningRows = facts ? factRows(facts.joining.map((row) => ({ ...row, value: row.value === NOT_PUBLIC ? null : row.value }))) : [];
  const payFacts: FactRow[] = facts ? [
    { label: "Revenue share", value: facts.revenueShare },
    { label: "Pay day", value: facts.paymentTerms },
    { label: "Minimum payout", value: facts.paymentThreshold },
    { label: "Paid by", value: facts.paymentMethods.length ? facts.paymentMethods.join(", ") : null },
  ] : [];
  // A Pay tab with nothing published leaves the rows out and lets the words explain.
  const payRows = payFacts.some((row) => row.value) ? factRows(payFacts) : [];

  const tabs: UiTab[] = [
    { id: "joining", title: "Joining", rows: joiningRows, Words: Joining },
    { id: "pay", title: "Pay", rows: payRows, Words: Pay },
    { id: "rules", title: "Rules", rows: [] as Fact[], Words: Rules },
    { id: "service", title: "Service", rows: [] as Fact[], Words: Service },
  ]
    .filter((tab) => tab.rows.length || tab.Words)
    .map(({ id, rows, title, Words }) => ({
      id,
      title,
      content: <>
        {rows.length ? <FactsList items={rows} /> : null}
        {id === "joining" ? (
          <div className={`${proseClassName} ${proseFlowClassName} ${styles.tabWords}`}>
            <p>Use the <Link href="/ad-network-requirements-checker">free ad network requirements checker</Link> to see which published rules your numbers meet.</p>
          </div>
        ) : null}
        <TabWords Words={Words} />
      </>,
    }));

  const checked = facts ? formatDay(facts.checkedAt, true) : null;

  return (
    <DetailsLayout
      prose={<div className={styles.article}><Article components={articleComponents} /></div>}
      title={`What does ${name} require and pay?`}
      titleId="details"
    >
      {keyNumbers.length ? <KeyNumbers items={keyNumbers} /> : null}
      {tabs.length ? <UiTabs label={`${name} details`} tabs={tabs} /> : null}
      {facts?.sources.length ? (
        <SourcesLine checked={checked ?? undefined} sources={facts.sources.map((source) => ({ label: source.label, href: source.url }))} />
      ) : null}
    </DetailsLayout>
  );
}
