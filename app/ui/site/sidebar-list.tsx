import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./sidebar-list.module.css";

export type SidebarListItem = {
  href: string;
  label: string;
  /** Marks the current page: surface fill, semibold, accent leading cell. */
  active?: boolean;
  /** Optional leading mono number, e.g. "03". */
  number?: string;
  /** Optional leading icon, e.g. a 15px Lucide icon. */
  icon?: ReactNode;
  /** Optional trailing mono count. */
  count?: string;
  /** Renders as a muted non-link row with a tag, e.g. an unpublished lesson. */
  tag?: string;
};

function LeadingCell({ item }: { item: SidebarListItem }) {
  if (item.number) {
    return <span className={styles.number}>{item.number}</span>;
  }
  if (item.icon) {
    return (
      <span aria-hidden="true" className={styles.icon}>
        {item.icon}
      </span>
    );
  }
  // Non-linear lists without a meaningful icon still get a quiet marker.
  return (
    <span aria-hidden="true" className={styles.icon}>
      <ChevronRight size={14} strokeWidth={2.2} />
    </span>
  );
}

/**
 * The shared sidebar link list: the course-sidebar visual (small rows, mono
 * numbers or monochrome icons, surface-2 active fill with an accent leading
 * cell) as one component so every listing sidebar reads the same. Callers keep
 * their own nav wrapper and SidebarLabel title.
 */
export function SidebarList({
  items,
  ordered = false,
}: {
  items: SidebarListItem[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag className={styles.list}>
      {items.map((item) => {
        if (item.tag) {
          return (
            <li className={styles.item} key={item.href || item.label}>
              <span className={styles.itemStatic}>
                <LeadingCell item={item} />
                <span className={styles.label}>{item.label}</span>
                <span className={styles.tag}>{item.tag}</span>
              </span>
            </li>
          );
        }

        const content = (
          <>
            <LeadingCell item={item} />
            <span className={styles.label}>{item.label}</span>
            {item.count ? <span className={styles.count}>{item.count}</span> : null}
          </>
        );

        return (
          <li
            className={item.active ? `${styles.item} ${styles.itemActive}` : styles.item}
            key={item.href}
          >
            {item.href.startsWith("#") ? (
              <a aria-current={item.active ? "page" : undefined} href={item.href}>
                {content}
              </a>
            ) : (
              <Link aria-current={item.active ? "page" : undefined} href={item.href}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ListTag>
  );
}
