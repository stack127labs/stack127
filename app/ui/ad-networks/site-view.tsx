import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { NetworkLogo } from "./network-logo";
import type { NetworkLogoFile } from "./network-logo-src";
import { TrafficMeter } from "./traffic-meter";
import styles from "./site-view.module.css";

export type SiteFact = { label: string; value: ReactNode };

/** A site's facts in one ruled row of up to six, wrapping to three and then two (mockup `.site-facts`). */
export function SiteFacts({ items }: { items: readonly SiteFact[] }) {
  return (
    <dl className={styles.facts}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Muted words inside a site fact, such as `· 12 yrs`. */
export function FactMuted({ children }: { children: ReactNode }) {
  return <span className={styles.muted}>{children}</span>;
}

export type SiteNetworkRow = {
  name: string;
  href?: string;
  logo: NetworkLogoFile | null;
  /** What the site's ads.txt says about it, such as `Names it as the ad manager`. */
  says: string;
  /** Status in words, such as `Confirmed live` or `Not in Google's seller list`. */
  status: string;
  /** Confirmed statuses get a filled accent dot; others an empty one. */
  confirmed: boolean;
  /** Such as `Mar 2021`. */
  since?: string;
};

/** The networks on one site, with what its ads.txt says and whether the network agrees (mockup `table.rel`). */
export function SiteNetworksTable({ caption, rows }: { caption: string; rows: readonly SiteNetworkRow[] }) {
  const since = rows.some((row) => row.since);
  return (
    <div className={styles.scroll}>
      <table className={styles.rel}>
        <caption className={styles.srOnly}>{caption}</caption>
        <thead>
          <tr><th scope="col">network</th><th scope="col">what its ads.txt says</th><th scope="col">status</th>{since ? <th className={styles.right} scope="col">since</th> : null}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td><span className={styles.net}><NetworkLogo logo={row.logo} name={row.name} />{row.href ? <Link href={row.href} prefetch={false}>{row.name}</Link> : <b>{row.name}</b>}</span></td>
              <td>{row.says}</td>
              <td><span className={styles.state} data-ok={row.confirmed || undefined}>{row.status}</span></td>
              {since ? <td className={`${styles.right} ${styles.mono}`}>{row.since ?? ""}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type AdsTxtNumber = { label: string; value: ReactNode };

/** Up to four ads.txt counts, such as lines, companies, direct, and resellers (mockup `.adstxt-nums`). */
export function AdsTxtNumbers({ items }: { items: readonly AdsTxtNumber[] }) {
  return (
    <dl className={styles.adsNumbers}>
      {items.map((item) => (
        <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
      ))}
    </dl>
  );
}

/** A small mono subheading inside a block, such as `companies with the most lines` (mockup `.sub`). */
export function BlockSubheading({ children }: { children: ReactNode }) {
  return <h4 className={styles.sub}>{children}</h4>;
}

/**
 * The first lines of an ads.txt file as we read them (mockup `pre.adstxt`). Comments are dimmed,
 * the MANAGERDOMAIN line is marked, and lines for `highlight` domains are brighter. `more` adds a
 * closing "… N more lines" comment. `fileHref` adds a link to the full file.
 */
export function AdsTxtPreview({ fileHref, highlight = [], label, more, text }: {
  fileHref?: string;
  /** Seller domains to brighten, such as `mediavine.com`. */
  highlight?: readonly string[];
  label: string;
  more?: number;
  text: string;
}) {
  const bright = new Set(highlight.map((domain) => domain.toLowerCase()));
  const lines = text.replace(/\r\n?/g, "\n").replace(/\n+$/, "").split("\n");
  const line = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.startsWith("#")) return <span className={styles.comment}>{value}</span>;
    if (/^managerdomain\s*=/i.test(trimmed)) return <mark>{value}</mark>;
    const domain = trimmed.split(",")[0]?.trim().toLowerCase();
    if (domain && bright.has(domain)) return <span className={styles.bright}>{value}</span>;
    return value;
  };
  return (
    <>
      <pre aria-label={label} className={styles.adsTxt}>
        <code>
          {lines.map((value, index) => <span key={index}>{line(value)}{"\n"}</span>)}
          {more ? <span className={styles.comment}>… {more.toLocaleString("en-US")} more {more === 1 ? "line" : "lines"}</span> : null}
        </code>
      </pre>
      {fileHref ? <a className={styles.fileLink} href={fileHref} rel="noopener nofollow"><ExternalLink aria-hidden="true" size={14} />View the full ads.txt file</a> : null}
    </>
  );
}

export type SimilarSite = { domain: string; href?: string; trafficGroup: string | null };

/** Similar sites in three columns of ruled rows, with their traffic meter (mockup `ul.similar`). */
export function SimilarSites({ sites }: { sites: readonly SimilarSite[] }) {
  return (
    <ul className={styles.similar}>
      {sites.map((site) => (
        <li key={site.domain}>
          {site.href ? <Link href={site.href} prefetch={false}>{site.domain}</Link> : <b>{site.domain}</b>}
          <span><TrafficMeter group={site.trafficGroup} /></span>
        </li>
      ))}
    </ul>
  );
}
