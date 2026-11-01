import type { FeeCardView, FeeRateView } from './card-view';
import { FeeRatesPanel } from './fee-rates-panel';
import styles from './fee-card.module.css';

const reason = (rate: FeeRateView) => rate.percent === null && rate.value.length > 12;

function Identity({ card }: { card: FeeCardView }) {
  return <div className={styles.identity}>
    <span>
      {card.icon ? <img src={card.icon} alt="" width={30} height={30} loading="lazy" /> : <span aria-hidden="true">{card.name.slice(0, 2)}</span>}
    </span>
    <div>
      <h3><a href={card.url} target="_blank" rel="noopener noreferrer">{card.name}</a></h3>
      <p>{card.tag}</p>
    </div>
  </div>;
}

// Clear percentage fees show the seller's share before other deductions.
// Fixed pay, shared pools and base costs keep their stated unit and have no bar.
function Rates({ card }: { card: FeeCardView }) {
  const { take, second } = card;
  return <div className={styles.top}>
    <div className={styles.rates}>
      <div><strong className={reason(take) ? styles.reason : undefined}>{take.value}{take.extra && <small> {take.extra}</small>}</strong><span>{take.label}</span></div>
      {second && <div><strong>{second.value}{second.extra && <small> {second.extra}</small>}</strong><span>{second.label}</span></div>}
    </div>
    {take.percent !== null && <div className={styles.split}>
      <div aria-hidden="true">
        <span style={{ width: `${100 - take.percent}%` }} />
        <span style={{ width: `${take.percent}%` }} />
      </div>
      <p>You keep <b>{Number((100 - take.percent).toFixed(6))}%</b> before other fees</p>
    </div>}
  </div>;
}

// Always in the HTML, so search engines and AI bots can read every rate.
function AllRates({ card }: { card: FeeCardView }) {
  return <div className={styles.allRates}>
    {card.groups.length > 0 && <table className={styles.rateTable}>
      <caption>All {card.name} rates</caption>
      <thead><tr><th scope="col">Rate</th><th scope="col">When</th></tr></thead>
      {card.groups.map((group, index) => <tbody key={index}>
        <tr><th colSpan={2} scope="rowgroup">{group.label}</th></tr>
        {group.rates.map((rate, index) => <tr key={index}>
          <td className={reason(rate) ? styles.reasonValue : undefined}>{rate.value}{rate.extra && <span>{rate.extra}</span>}</td>
          <th scope="row">{rate.label}{rate.note && <span>{rate.note}</span>}</th>
        </tr>)}
      </tbody>)}
    </table>}
    {card.note && <p>{card.note}</p>}
    <div className={styles.sources}>
      <p>{card.checked ? <>Checked <time dateTime={card.checked.iso}>{card.checked.label}</time></> : 'Not checked'}</p>
      <p>Sources</p>
      <ul>{card.sources.map((source, index) => <li key={index}>
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
      </li>)}</ul>
    </div>
  </div>;
}

export function FeeCard({ card }: { card: FeeCardView }) {
  return <article id={card.id} className={styles.card}>
    <Identity card={card} />
    <Rates card={card} />
    <div className={styles.tear} aria-hidden="true" />
    <div className={styles.body}>
      <dl className={styles.lines}>
        {card.lines.map((line, index) => <div key={index}><dt>{line.label}</dt><dd>{line.value}</dd></div>)}
      </dl>
      <FeeRatesPanel summary={card.more} label={`${card.name} rates`}>
        <AllRates card={card} />
      </FeeRatesPanel>
    </div>
  </article>;
}
