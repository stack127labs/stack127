import { ArrowRight, Globe } from "lucide-react";
import {
  formatIndieDate,
  freeKindLabels,
  stateLabels,
  type IndieApp,
  type IndieCategory,
  type IndieFact,
} from "@/lib/indie-hacker-apps/model";
import styles from "./indie.module.css";

const costTitles: Record<string, string> = {
  subs: "Newsletter cost",
  appmail: "App email cost",
  errors: "Error tracking cost",
  uptime: "Uptime cost",
  sql: "Database cost",
  files: "File storage cost",
  jobs: "Jobs cost",
  fee: "Card fee by seller country",
};

function StateNote({ state }: { state: IndieFact["state"] }) {
  const label = stateLabels[state];
  return label ? <small className={styles.state}>{label}</small> : null;
}

function FactValue({ fact }: { fact: IndieFact }) {
  return fact.url ? (
    <a href={fact.url} rel="noreferrer" target="_blank" title={fact.checked ? `Source, checked ${formatIndieDate(fact.checked)}` : "Source"}>
      {fact.value}
    </a>
  ) : <>{fact.value}</>;
}

// The panel body. The browser renders it in full when a card opens. The static page
// also server-renders a short version (factLimit) of each first-page app, so search
// engines and visitors without JavaScript get the costs, status, and main facts.
export function IndieAppDetailsBody({ app, category, factLimit }: { app: IndieApp; category: IndieCategory; factLimit?: number }) {
  const jobLabels = new Map(category.jobs.map(([id, label]) => [id, label]));
  const sets = Object.entries(category.sets).filter(([key]) => (app.costs[key] ?? []).some((row) => row.state !== "not_applicable"));
  const multiple = Object.keys(category.sets).length > 1;

  return (
    <>
      <div className="app-detail-categories">
        {app.jobs.map((job) => <span className="category-badge" key={job}>{jobLabels.get(job) ?? job}</span>)}
      </div>
      <p className="app-detail-summary">{app.line}</p>

      {app.status.map((status) => (
        <p className={`${styles.note} ${status.tone === "warning" ? styles.warning : ""}`} key={`${status.label}-${status.text}`}>
          <strong>{status.label.toLowerCase()}</strong>
          {status.date ? <> · {formatIndieDate(status.date)}</> : null}
          <span>{status.text}</span>
        </p>
      ))}

      <div className="app-detail-primary-links">
        <a className="primary" href={app.url} rel="noreferrer" target="_blank">
          <span><Globe aria-hidden="true" />website</span>
          <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
        </a>
      </div>

      {sets.map(([key, set]) => (
        <section className="app-detail-fact-section" key={key}>
          <h3>{multiple || key === "fee" ? costTitles[key] ?? "Cost" : "Cost at each size"}</h3>
          <p className={styles.sectionNote}>{set.note}</p>
          <div className="app-detail-facts">
            {app.costs[key].map((row, index) => (
              <div key={set.levels[index]}>
                <span>{set.unit ? `${set.levels[index]} ${set.unit}` : set.levels[index]}</span>
                <strong>
                  {row.v}
                  {row.plan ? <small className={styles.plan}>{row.plan}</small> : null}
                  <StateNote state={row.state === "not_applicable" ? "confirmed" : row.state} />
                </strong>
              </div>
            ))}
          </div>
          <details className={styles.math}>
            <summary>how we priced it</summary>
            <ol>{app.costs[key].map((row, index) => <li key={set.levels[index]}>{set.levels[index]}: {row.math}</li>)}</ol>
          </details>
        </section>
      ))}

      {category.show_free ? (
        <section className="app-detail-fact-section">
          <h3>Free start</h3>
          <div className="app-detail-facts">
            <div>
              <span>{freeKindLabels[app.free.kind].toLowerCase()}</span>
              <strong>{app.free.text}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {app.sections.map((section) => (
        <section className="app-detail-fact-section" key={section.title}>
          <h3>{section.title}</h3>
          <dl className={styles.facts}>
            {(factLimit ? section.facts.slice(0, factLimit) : section.facts).map((fact, index) => (
              <div key={`${fact.label}-${index}`}>
                <dt>{fact.label}</dt>
                <dd><FactValue fact={fact} /><StateNote state={fact.state} /></dd>
              </div>
            ))}
          </dl>
          {factLimit && section.facts.length > factLimit ? (
            <p className={styles.sectionNote}>{section.facts.length - factLimit} more facts in the full panel.</p>
          ) : null}
        </section>
      ))}

      <section className="app-detail-fact-section">
        <h3>Status history</h3>
        <ul className={styles.history}>
          {app.status.map((status) => (
            <li key={`${status.label}-${status.text}`}>
              {status.date ? <time dateTime={status.date}>{formatIndieDate(status.date)}</time> : null}
              {status.label}: {status.text}
            </li>
          ))}
          {app.news ? <li>{app.news}</li> : null}
        </ul>
      </section>

      <p className={styles.footer}>
        Every fact links to its source. Last checked {formatIndieDate(app.checked)}.
      </p>
    </>
  );
}
