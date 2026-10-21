import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CategoryIcon } from "@/app/ui/site/category-icon";
import type { LaunchDirectory } from "@/lib/launch-directories";
import { LaunchLogo } from "./launch-logo";
import { cardDescription, costShort, domainOf, isSubmitReady, linkShort, submitStatusText, waitShort } from "./launch-format";
import styles from "./launch-directories.module.css";

export type LaunchCategory = { value: string; label: string; iconKey: string };

/** The record fields a card shows, so pages can ship a smaller record to the browser. */
export type LaunchCardRecord = Pick<LaunchDirectory,
  "slug" | "name" | "icon_url" | "website_url" | "submit_url" | "submission_status" | "categories" | "summary" | "best_for"
  | "cost_kind" | "lowest_paid_price_usd" | "link_type_kind" | "review_wait" | "domain_rating">;

export function launchHref(slug: string) {
  return `/launch-directories/${slug}`;
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return <div>
    <dt>{label}</dt>
    <dd data-unknown={value ? undefined : true}>{value ?? "Not stated"}</dd>
  </div>;
}

/**
 * One place in a three-up grid: logo, name, category, and DR, a two-line description, then cost,
 * link, and review wait. The name link stretches over the card; the site and Submit links sit above it.
 */
export function LaunchCard({ action, category, directory, eager = false, linked = true }: {
  /** Replaces the site link at the bottom left, such as a Compare button. */
  action?: ReactNode;
  category: LaunchCategory | undefined;
  directory: LaunchCardRecord;
  eager?: boolean;
  /** False when the place has no published page yet, so the card never links to a 404. */
  linked?: boolean;
}) {
  const extra = directory.categories.length - 1;
  return <article className={styles.card}>
    <div className={styles.cardTop}>
      <LaunchLogo eager={eager} iconUrl={directory.icon_url} name={directory.name} />
      <div className={styles.cardIdentity}>
        <h3 className={styles.cardName}>{linked ? <Link href={launchHref(directory.slug)} prefetch={false}>{directory.name}</Link> : directory.name}</h3>
        {category ? <span className={styles.cardCategory}>
          <CategoryIcon iconKey={category.iconKey} />{category.label}{extra > 0 ? <span> +{extra}</span> : null}
        </span> : null}
      </div>
      {directory.domain_rating !== null ? <div className={styles.cardDr}>
        <b>{directory.domain_rating}</b>
        <span>Domain Rating<br />by <a href="https://ahrefs.com/" rel="noopener noreferrer" target="_blank">Ahrefs</a></span>
      </div> : null}
    </div>
    <p className={styles.cardDescription}>{cardDescription(directory)}</p>
    <dl className={styles.cardFacts}>
      <Fact label="cost" value={costShort(directory)} />
      <Fact label="link" value={linkShort(directory)} />
      <Fact label="review" value={waitShort(directory)} />
    </dl>
    <div className={styles.cardActions}>
      {action ?? <a href={directory.website_url} rel="noopener noreferrer" target="_blank">{domainOf(directory.website_url)}</a>}
      {isSubmitReady(directory)
        ? <a className={styles.cardSubmit} href={directory.submit_url ?? undefined} rel="noopener noreferrer" target="_blank">
          Submit<span className={styles.srOnly}> to {directory.name}</span> <ArrowRight aria-hidden="true" size={13} strokeWidth={2.2} />
        </a>
        : <span className={styles.cardMuted}>{submitStatusText(directory)}</span>}
    </div>
  </article>;
}

/** Cards three across, two on tablets, one on phones. */
export function LaunchGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
