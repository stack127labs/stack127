import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./viz.module.css";

export type NewestSite = { domain: string; href?: string; network: string; networkHref?: string; date: string };

/** The newest sites with their network and the day we found them (mockup `table.newest`). */
export function NewestList({ caption, sites }: { caption: string; sites: readonly NewestSite[] }) {
  return (
    <table className={styles.newest}>
      <caption className={styles.srOnly}>{caption}</caption>
      <tbody>
        {sites.map((site) => (
          <tr key={site.domain}>
            <td>{site.href ? <Link href={site.href} prefetch={false}>{site.domain}</Link> : site.domain}</td>
            <td>{site.networkHref ? <Link href={site.networkHref} prefetch={false}>{site.network}</Link> : site.network}</td>
            <td className={styles.newestDate}>{site.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Dated events, newest first, such as network changes on one site (mockup `ol.events`). */
export function EventsList({ events }: { events: readonly { date: string; text: ReactNode }[] }) {
  return (
    <ol className={styles.events}>
      {events.map((event, index) => (
        <li key={index}><span className={styles.eventDate}>{event.date}</span><span>{event.text}</span></li>
      ))}
    </ol>
  );
}
