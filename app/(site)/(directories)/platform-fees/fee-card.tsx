import { ExternalLink } from 'lucide-react';
import { hiddenRateCount, type FeeEntry, type ReceiptCard } from '@/lib/platform-fees/model';
import { FeeRatesPanel } from './fee-rates-panel';
import styles from './fee-card.module.css';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function Identity({ entry, tag }: { entry: FeeEntry; tag: string }) {
  return <div className={styles.identity}>
    <span className={styles.logo}>
      {entry.icon_path ? <img src={entry.icon_path} alt="" width={30} height={30} loading="lazy" /> : <span aria-hidden="true">{entry.name.slice(0, 2)}</span>}
    </span>
    <div className={styles.identityText}>
      <h2><a href={entry.website_url} target="_blank" rel="noopener noreferrer">{entry.name}<ExternalLink size={14} aria-hidden="true" /></a></h2>
      <p>{tag}</p>
    </div>
  </div>;
}

// Clear percentage fees show the seller's share before other deductions.
// Fixed pay, shared pools and base costs keep their stated unit and have no bar.
function Rates({ receipt }: { receipt: ReceiptCard }) {
  const { take, second } = receipt;
  return <div className={styles.top}>
    <div className={styles.rates}>
      <div className={styles.take}><strong className={take.percent === null && take.value.length > 12 ? styles.reason : undefined}>{take.value}{take.extra && <small> {take.extra}</small>}</strong><span>{take.label}</span></div>
      {second && <div className={styles.second}><strong>{second.value}{second.extra && <small> {second.extra}</small>}</strong><span>{second.label}</span></div>}
    </div>
    {take.percent !== null && <div className={styles.split}>
      <div className={styles.splitBar} aria-hidden="true">
        <span className={styles.keep} style={{ width: `${100 - take.percent}%` }} />
        <span className={styles.cut} style={{ width: `${take.percent}%` }} />
      </div>
      <p className={styles.splitLegend}>You keep <b>{Number((100 - take.percent).toFixed(6))}%</b> before other fees</p>
    </div>}
  </div>;
}

function Lines({ receipt }: { receipt: ReceiptCard }) {
  return <dl className={styles.lines}>
    {receipt.lines.map(line => <div key={line.label}><dt>{line.label}</dt><dd>{line.value}</dd></div>)}
  </dl>;
}

// Always server-rendered, so search engines and AI bots can read every rate.
function AllRates({ entry, receipt }: { entry: FeeEntry; receipt: ReceiptCard }) {
  const sources = entry.sources.length
    ? entry.sources.filter((source, index, all) => all.findIndex(item => item.url === source.url) === index)
    : [{ url: entry.website_url, label: 'Official website' }];
  return <div className={styles.allRates}>
    {receipt.groups.length > 0 && <table className={styles.rateTable}>
      <caption>All {entry.name} rates</caption>
      <thead><tr><th scope="col">Rate</th><th scope="col">When</th></tr></thead>
      {receipt.groups.map(group => <tbody key={group.label}>
        <tr className={styles.rateGroup}><th colSpan={2} scope="rowgroup">{group.label}</th></tr>
        {group.rates.map(rate => <tr key={`${rate.label}-${rate.value}`}>
          <td className={`${styles.rateValue}${rate.percent === null && rate.value.length > 12 ? ` ${styles.reasonValue}` : ''}`}>{rate.value}{rate.extra && <span className={styles.rateExtra}>{rate.extra}</span>}</td>
          <th scope="row">{rate.label}{rate.note && <span className={styles.rateNote}>{rate.note}</span>}</th>
        </tr>)}
      </tbody>)}
    </table>}
    {receipt.note && <p className={styles.note}>{receipt.note}</p>}
    <div className={styles.sources}>
      <p>{entry.checked_at ? <>Checked <time dateTime={entry.checked_at}>{dateFormat.format(new Date(entry.checked_at))}</time></> : 'Not checked'}</p>
      <h3>Sources</h3>
      <ul>{sources.map(source => <li key={source.url}>
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={12} aria-hidden="true" /></a>
      </li>)}</ul>
    </div>
  </div>;
}

export function FeeCard({ entry }: { entry: FeeEntry }) {
  const receipt = entry.card;
  const hidden = hiddenRateCount(receipt);
  const summary = hidden > 0 ? `+ ${hidden} more rate${hidden > 1 ? 's' : ''}` : receipt.groups.length ? 'All rates and sources' : 'Sources';
  return <article id={entry.id} className={styles.card}>
    <Identity entry={entry} tag={receipt.tag} />
    <Rates receipt={receipt} />
    <div className={styles.tear} aria-hidden="true" />
    <div className={styles.body}>
      <Lines receipt={receipt} />
      <FeeRatesPanel
        summary={summary}
        label={`${entry.name} rates`}
        heading={<Identity entry={entry} tag={receipt.tag} />}
        top={<><Rates receipt={receipt} /><Lines receipt={receipt} /></>}
      >
        <AllRates entry={entry} receipt={receipt} />
      </FeeRatesPanel>
    </div>
  </article>;
}
