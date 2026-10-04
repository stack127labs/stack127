import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Doodle } from "@/app/ui/site/doodle";
import styles from "./page-card.module.css";

export type PageCardCount = { label: string; value: number };

export type PageCardProps = {
  href: string;
  name: string;
  description: string;
  /** Approved marker art SVG. Without it, the icon shows large in its place. */
  art: string | null;
  icon?: LucideIcon;
  /** Footer below the description, such as a tool count or a stats list. */
  count?: ReactNode;
  /** `feature` leads the homepage. `tool` fills a catalog grid and ends with an arrow. */
  size?: "feature" | "tool";
};

/** The shared linked card. Its parent section owns the h2, so the card name is an h3. */
export function PageCard({ href, name, description, art, icon: Icon, count, size = "feature" }: PageCardProps) {
  const feature = size === "feature";
  return (
    <Link className={`${styles.card} ${feature ? styles.feature : styles.tool}`} href={href} prefetch={feature ? false : undefined}>
      <span aria-hidden="true" className={styles.art}>
        {art ? <Doodle className={styles.doodle} svg={art} /> : Icon ? <Icon className={styles.artIcon} strokeWidth={1.4} /> : null}
      </span>
      <div className={styles.copy}>
        <h3 className={styles.title}>
          {feature && Icon ? <span aria-hidden="true" className={styles.titleIcon}><Icon size={18} strokeWidth={2.2} /></span> : null}
          {name}
        </h3>
        <p className={styles.description}>{description}</p>
      </div>
      {feature
        ? count ? <div className={styles.count}>{count}</div> : null
        : <span aria-hidden="true" className={styles.arrow}>→</span>}
    </Link>
  );
}

/** Labeled numbers for a card footer, such as apps and shortcuts. */
export function PageCardCounts({ counts, label }: { counts: PageCardCount[]; label: string }) {
  return (
    <dl aria-label={label} className={styles.counts}>
      {counts.map((count) => (
        <div key={count.label}>
          <dt>{count.label}</dt>
          <dd>{count.value.toLocaleString("en-US")}</dd>
        </div>
      ))}
    </dl>
  );
}
