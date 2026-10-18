import type { MDXContent } from "mdx/types";
import type { ReactNode } from "react";
import { DetailsLayout, FactsList, KeyNumbers, NotPublic, SourcesLine, type Fact, type KeyNumber } from "@/app/ui/ad-networks/details";
import { formatDay } from "@/app/ui/ad-networks/site-format";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { UiTabs, type UiTab } from "@/app/ui/tabs";
import { NOT_PUBLIC, joinPhrase, joiningNumbers, networkFacts } from "../ad-networks-shared";
import type { AdNetworkFacts } from "../network-facts";
import type { AdNetworkContent } from "./content";
import styles from "./network.module.css";

type KeyFact = AdNetworkFacts["keyNumbers"][number];

// The mockup's words for the labels research uses.
const keyLabels: Record<string, string> = { "your share": "revenue share" };

/**
 * One key number in the mockup's form: the value, then a short label. A joining rule reads as
 * `sessions a month to join`; anything after the first `;` in its note stays as a caveat.
 */
function keyNumber(item: KeyFact, joining: boolean): KeyNumber {
  const [first = "", ...rest] = (item.note ?? "").split(";");
  if (joining) {
    const phrase = joinPhrase(item);
    if (phrase.startsWith(item.value) && phrase.length > item.value.length) {
      // joinPhrase keeps only the unit; whatever it drops ("or 2 million …", ", for new sites") stays as the caveat.
      const alternative = first.match(/\s(or\s+[^,]*\d.*)$/i)?.[1];
      const clause = first.replace(/\s+or\s+(?=[^,]*\d).*$/i, "").split(",").slice(1).join(",").trim();
      const caveat = [alternative, clause, rest.join(";").trim()].filter(Boolean).join("; ");
      return { value: item.value, label: `${phrase.slice(item.value.length).trim()} to join`, note: caveat || undefined };
    }
  }
  const label = item.label.charAt(0).toLowerCase() + item.label.slice(1);
  return { value: item.value, label: keyLabels[label] ?? label, note: [first, ...rest].join(";").trim() || undefined };
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

/** Fact rows for one tab, or nothing when the network publishes none of them. */
function factRows(rows: readonly { label: string; value: string | null; note?: string }[]): Fact[] {
  if (!rows.some((row) => row.value)) return [];
  return rows.map((row) => ({ label: row.label, value: row.value ?? <NotPublic />, note: row.note }));
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
  const joining = facts ? joiningNumbers(facts) : [];
  const keyNumbers = shown.map((item) => keyNumber(item, joining.includes(item)));

  // Researched joining rows in network-facts.ts, in the mockup's order. "Not public" is a finding, not missing data.
  const joiningRows: Fact[] = facts ? facts.joining.map((row) => ({
    label: row.label,
    value: row.value === NOT_PUBLIC ? <NotPublic /> : row.value,
    note: row.note,
  })) : [];
  const payRows = facts ? factRows([
    { label: "Revenue share", value: facts.revenueShare },
    { label: "Pay day", value: facts.paymentTerms },
    { label: "Minimum payout", value: facts.paymentThreshold },
    { label: "Paid by", value: facts.paymentMethods.length ? facts.paymentMethods.join(", ") : null },
  ]) : [];

  const tabs: UiTab[] = [
    { id: "joining", title: "Joining", rows: joiningRows, Words: Joining },
    { id: "pay", title: "Pay", rows: payRows, Words: Pay },
    { id: "rules", title: "Rules", rows: [] as Fact[], Words: Rules },
    { id: "service", title: "Service", rows: [] as Fact[], Words: Service },
  ]
    .filter((tab) => tab.rows.length || tab.Words)
    .map(({ id, rows, title, Words }) => ({ id, title, content: <>{rows.length ? <FactsList items={rows} /> : null}<TabWords Words={Words} /></> }));

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
