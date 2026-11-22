import { ArrowRight, Globe } from "@/app/ui/icons";
import {
  formatIndieDate,
  freeKindLabels,
  stateLabels,
  type DirectoryApp,
  type IndieCategory,
  type IndieFact,
} from "@/lib/indie-hacker-apps/model";
import { mainJobNote, sizeLevels } from "./shared";
import styles from "./app-directory.module.css";

function costTitle(set: string, levels: number) {
  if (set === "fee") return "Card fee by seller country";
  return levels > 1 ? "Cost at each size" : "Cost";
}

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

// The side panel body. The static page server-renders a short version (factLimit) of
// each first-page app, so search engines and readers without JavaScript get the costs,
// status, and main facts. Opening a card loads the full panel from the app's JSON route.
export function AppDetailsBody({ app, view, jobLabels, factLimit }: {
  app: DirectoryApp;
  /** The directory's view of its category: only its own cost sets. */
  view: IndieCategory;
  /** Labels of every job in the research category. */
  jobLabels: Map<string, string>;
  factLimit?: number;
}) {
  const sets = Object.entries(view.sets).filter(([key]) => (app.costs[key] ?? []).some((row) => row.state !== "not_applicable"));
  const note = mainJobNote(app);

  return (
    <>
      <div className="app-detail-categories">
        {app.jobs.map((job) => <span className="category-badge" key={job}>{jobLabels.get(job) ?? job}</span>)}
      </div>
      {note ? <p className={styles.mainJob}>{note}</p> : null}
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
          <span><Globe aria-hidden="true" /> website</span>
          <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
        </a>
      </div>

      {sets.map(([key, set]) => {
        const levels = sizeLevels(view, key);
        return (
          <section className="app-detail-fact-section" key={key}>
            <h3>{costTitle(key, set.levels.length)}</h3>
            <p className={styles.sectionNote}>{set.note}</p>
            <div className="app-detail-facts">
              {app.costs[key].map((row, index) => (
                <div key={levels[index]}>
                  <span>{levels[index]}</span>
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
              <ol>{app.costs[key].map((row, index) => <li key={levels[index]}>{set.levels[index]}: {row.math}</li>)}</ol>
            </details>
          </section>
        );
      })}

      {view.show_free ? (
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

      {app.status.length || app.news ? (
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
      ) : null}

      <p className={styles.footer}>
        Every fact links to its source. Last checked {formatIndieDate(app.checked)}.
      </p>
    </>
  );
}
