import { formatIndieDate, type IndieChange } from "@/lib/indie-hacker-apps/model";
import styles from "./indie.module.css";

/** Dated sales, closures, incidents, regulator actions and licence changes, newest first. */
export function RecentChanges({ changes, categoryNames, limit = 10 }: {
  changes: Array<IndieChange & { category?: string }>;
  categoryNames?: Record<string, string>;
  limit?: number;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const shown = changes.filter((change) => change.date && change.date <= today).slice(0, limit);
  if (!shown.length) return null;
  return (
    <section>
      <h2>What changed recently?</h2>
      <ul className={styles.changes}>
        {shown.map((change) => (
          <li key={`${change.category ?? ""}-${change.slug}-${change.label}-${change.date}`}>
            <time dateTime={change.date}>{formatIndieDate(change.date)}</time>
            <div>
              <strong>{change.app}</strong> · {change.text}
              <small className={change.tone === "warning" ? styles.warning : undefined}>
                {[change.category ? categoryNames?.[change.category] : "", change.label].filter(Boolean).join(" · ").toLowerCase()}
              </small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
