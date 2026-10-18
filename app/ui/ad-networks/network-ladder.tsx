"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ToolbarSwitch } from "@/app/ui/table-toolbar";
import { NotPublic } from "./details";
import { AdSection } from "./section";
import { formatCount } from "./site-format";
import styles from "./niches-table.module.css";
import ladder from "./network-ladder.module.css";

export type LadderRow = {
  name: string;
  href?: string;
  /** Sites in this niche that run the network. */
  sites: number;
  /** The joining rule in words, or null when the network doesn't publish one. */
  rule: string | null;
  /** Orders "Easiest to join": lower is easier, such as the traffic minimum. Null sorts last. */
  ruleRank: number | null;
};

/**
 * Every network that runs on a niche's sites, with its count, its share of the niche, and what it
 * takes to join (mockup food page ladder). A switch orders by most used or easiest to join; it
 * hides when no network has a rule. On phones the share column hides.
 */
export function NetworkLadder({ countLabel, description, id, rows, shareLabel, title, total }: {
  /** Header of the count column, such as `food sites`. */
  countLabel: string;
  description?: ReactNode;
  id: string;
  rows: readonly LadderRow[];
  /** Header of the share column, such as `share of food sites`. */
  shareLabel: string;
  title: ReactNode;
  /** Sites in the niche, for the share. */
  total: number;
}) {
  const [order, setOrder] = useState("used");
  const hasRules = rows.some((row) => row.rule);
  const canOrder = rows.some((row) => row.ruleRank !== null);
  const top = Math.max(1, ...rows.map((row) => row.sites));
  const list = [...rows].sort((a, b) => order === "join"
    ? (a.ruleRank ?? Number.MAX_SAFE_INTEGER) - (b.ruleRank ?? Number.MAX_SAFE_INTEGER) || b.sites - a.sites
    : b.sites - a.sites);
  return (
    <AdSection
      actions={canOrder ? <ToolbarSwitch label="Order" onChange={setOrder} options={[{ value: "used", label: "Most used" }, { value: "join", label: "Easiest to join" }]} value={order} /> : undefined}
      description={description}
      id={id}
      title={title}
    >
      <div className={styles.scroll}>
        <table aria-labelledby={id} className={ladder.table}>
          <thead>
            <tr>
              <th scope="col">network</th>
              <th className={ladder.right} scope="col">{countLabel}</th>
              <th scope="col">{shareLabel}</th>
              {hasRules ? <th scope="col">to join</th> : null}
            </tr>
          </thead>
          <tbody>
            {list.map((row) => {
              const share = total ? (row.sites / total) * 100 : 0;
              return (
                <tr key={row.name}>
                  <th className={ladder.name} scope="row">{row.href ? <Link href={row.href} prefetch={false}>{row.name}</Link> : row.name}</th>
                  <td className={`${ladder.right} ${ladder.mono}`}>{formatCount(row.sites)}</td>
                  <td>
                    <span className={ladder.share}>
                      <span aria-hidden="true" className={styles.minibar}><i style={{ width: `${(row.sites / top) * 100}%` }} /></span>
                      <span className={styles.pct}>{share > 0 && share < 1 ? "<1" : share.toFixed(0)}%</span>
                    </span>
                  </td>
                  {hasRules ? <td className={ladder.rule}>{row.rule ?? <NotPublic />}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdSection>
  );
}
