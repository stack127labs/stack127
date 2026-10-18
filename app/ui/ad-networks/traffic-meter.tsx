import { trafficStep, trafficText } from "./site-format";
import styles from "./traffic-meter.module.css";

/**
 * Five small steps, filled by a site's place in Chrome's list of the most visited sites, then the
 * group in muted words (mockup `.meter` + `top 10k`). Renders nothing for a missing group.
 */
export function TrafficMeter({ group, muted = true, showLabel = true }: {
  group: string | null;
  /** Muted group words, as in tables and lists. Set false inside a site fact, where the value reads plain. */
  muted?: boolean;
  showLabel?: boolean;
}) {
  if (!group) return null;
  const step = trafficStep(group);
  return (
    <span className={styles.wrap}>
      {step ? <span aria-hidden="true" className={styles.meter}>{[1, 2, 3, 4, 5].map((index) => <i data-on={index <= step || undefined} key={index} />)}</span> : null}
      {showLabel ? <span className={muted ? styles.label : undefined}>{trafficText(group)}</span> : null}
    </span>
  );
}
