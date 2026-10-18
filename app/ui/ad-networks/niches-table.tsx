"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { TableToolbar, ToolbarSearch, ToolbarSelect } from "@/app/ui/table-toolbar";
import { AdSection } from "./section";
import { formatCount } from "./site-format";
import styles from "./niches-table.module.css";

export type NicheTableNetwork = { name: string; href?: string; /** 0 to 1 of the niche's sites. */ share: number };

export type NicheTableRow = {
  slug: string;
  name: string;
  href?: string;
  sites: number;
  /** Confirmed live sites. Leave out to show only the count. */
  live?: number;
  /** 0 to 1 of all sorted sites. */
  share: number;
  /** The networks used most, largest first. The table shows three. */
  top: readonly NicheTableNetwork[];
  /** The easiest of the top networks to join, with its rule in words. */
  easiest?: { name: string; href?: string; rule: string };
  /** Share of the niche's sites per network slug, 0 to 1, for the network filter. */
  networkShares?: Readonly<Record<string, number>>;
};

const percent = (share: number, digits = 0) => `${(share * 100).toFixed(digits)}%`;

function ShareCell({ max, share, digits }: { max: number; share: number; digits?: number }) {
  return (
    <td className={styles.shareCell}>
      <span className={styles.shareWrap}>
        <span aria-hidden="true" className={styles.minibar}><i style={{ width: `${max ? (share / max) * 100 : 0}%` }} /></span>
        <span className={styles.pct}>{percent(share, digits)}</span>
      </span>
    </td>
  );
}

/**
 * Every niche with its site count, share of all sites, top three networks, and the easiest of
 * those to join (mockup niches table). Search narrows by name. The network filter swaps the share
 * column for that network's share in each niche and sorts by it. Columns with no data hide.
 */
export function NichesTable({ description, id, networks = [], rows, title }: {
  description: ReactNode;
  id: string;
  /** Networks for the filter. Leave empty to hide it. */
  networks?: readonly { value: string; label: string }[];
  rows: readonly NicheTableRow[];
  title: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState("");
  const [sort, setSort] = useState("sites");
  const networkLabel = networks.find((item) => item.value === network)?.label ?? "";
  const hasTop = rows.some((row) => row.top.length);
  const hasEasiest = rows.some((row) => row.easiest);
  const filterable = networks.length > 0 && rows.some((row) => row.networkShares);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    const shown = rows.filter((row) => row.name.toLowerCase().includes(term));
    const shareOf = (row: NicheTableRow) => row.networkShares?.[network] ?? 0;
    return [...shown].sort((a, b) => network ? shareOf(b) - shareOf(a) : sort === "az" ? a.name.localeCompare(b.name) : b.sites - a.sites);
  }, [network, query, rows, sort]);
  const maxShare = Math.max(0, ...rows.map((row) => row.share));
  const maxNetwork = Math.max(0, ...rows.map((row) => row.networkShares?.[network] ?? 0));

  return (
    <AdSection
      actions={(
        <TableToolbar label="Search and sort niches">
          <ToolbarSearch label="Search niches" onChange={setQuery} placeholder="Search niches" value={query} />
          {filterable ? <ToolbarSelect label="Network" onChange={setNetwork} options={[{ value: "", label: "All" }, ...networks]} value={network} /> : null}
          <ToolbarSelect disabled={Boolean(network)} label="Sort" onChange={setSort} options={[{ value: "sites", label: "Most sites" }, { value: "az", label: "A to Z" }]} value={sort} />
        </TableToolbar>
      )}
      description={<span aria-live="polite">{network ? `Niches sorted by how many of their sites use ${networkLabel}.` : description}</span>}
      id={id}
      title={title}
    >
      {list.length ? (
        <div className={styles.scroll}>
          <table aria-labelledby={id} className={styles.table}>
            <thead>
              <tr>
                <th scope="col">niche</th>
                <th className={styles.right} scope="col">sites</th>
                <th scope="col">{network ? `${networkLabel} share` : "share of all sites"}</th>
                {hasTop ? <th scope="col">top networks</th> : null}
                {hasEasiest ? <th scope="col">easiest of these to join</th> : null}
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.slug}>
                  <th className={styles.niche} scope="row">{row.href ? <Link href={row.href} prefetch={false}>{row.name}</Link> : row.name}</th>
                  <td className={`${styles.right} ${styles.mono} ${styles.count}`}>{formatCount(row.sites)}{row.live !== undefined ? <span className={styles.muted}> · {formatCount(row.live)} live</span> : null}</td>
                  {network
                    ? <ShareCell max={maxNetwork} share={row.networkShares?.[network] ?? 0} />
                    : <ShareCell digits={1} max={maxShare} share={row.share} />}
                  {hasTop ? (
                    <td className={styles.tops}>
                      <ul>
                        {row.top.slice(0, 3).map((item) => (
                          <li key={item.name}>{item.href ? <Link href={item.href} prefetch={false}>{item.name}</Link> : item.name} <span>{percent(item.share)}</span></li>
                        ))}
                      </ul>
                    </td>
                  ) : null}
                  {hasEasiest ? (
                    <td className={styles.easy}>
                      {row.easiest ? <>{row.easiest.href ? <Link href={row.easiest.href} prefetch={false}>{row.easiest.name}</Link> : row.easiest.name}<span className={styles.muted}>{row.easiest.rule}</span></> : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className={styles.empty}>No niches match. Try another word.</p>}
    </AdSection>
  );
}
