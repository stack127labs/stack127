import { SourcesLine } from "@/app/ui/ad-networks/details";
import { formatDay } from "@/app/ui/ad-networks/site-format";
import { networkFacts } from "../ad-networks-shared";
import { adNetworkShortFacts, type AdNetworkShortFact } from "../network-short-facts";
import styles from "./network.module.css";

function FactList({ label, rows }: { label: string; rows: readonly AdNetworkShortFact[] }) {
  return (
    <div>
      <p className={styles.listLabel}>{label}</p>
      <dl className={styles.list}>
        {rows.map((row, index) => (
          <div key={index}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * "What does <Network> require and pay?": two short lists, "To join" and "Pay", from
 * network-short-facts.ts, then the sources line from network-facts.ts. No lists, no section.
 */
export function NetworkDetails({ name, slug }: { name: string; slug: string }) {
  const short = adNetworkShortFacts[slug];
  if (!short || (!short.join.length && !short.pay.length)) return null;
  const facts = networkFacts(slug);
  const checked = facts ? formatDay(facts.checkedAt, true) : null;

  return (
    <section aria-labelledby="details" className={styles.details}>
      <h2 id="details">What does {name} require and pay?</h2>
      <div className={styles.lists}>
        {short.join.length ? <FactList label="To join" rows={short.join} /> : null}
        {short.pay.length ? <FactList label="Pay" rows={short.pay} /> : null}
      </div>
      {facts?.sources.length ? (
        <SourcesLine checked={checked ?? undefined} sources={facts.sources.map((source) => ({ label: source.label, href: source.url }))} />
      ) : null}
    </section>
  );
}
