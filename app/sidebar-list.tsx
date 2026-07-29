import Link from "next/link";
import styles from "./sidebar-list.module.css";

export type SidebarListItem = {
  href: string;
  label: string;
  /** Marks the current page: surface fill, semibold, accent number. */
  active?: boolean;
  /** Optional leading mono number, e.g. "03". */
  number?: string;
  /** Optional trailing mono count. */
  count?: string;
  /** Renders as a muted non-link row with a tag, e.g. an unpublished lesson. */
  tag?: string;
};

/**
 * The shared sidebar link list: the course-sidebar visual (small rows, mono
 * numbers, surface-2 active fill with an accent number) as one component so
 * every listing sidebar reads the same. Callers keep their own nav wrapper and
 * SidebarLabel title.
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
                {item.number ? <span className={styles.number}>{item.number}</span> : null}
                <span className={styles.label}>{item.label}</span>
                <span className={styles.tag}>{item.tag}</span>
              </span>
            </li>
          );
        }

        const content = (
          <>
            {item.number ? <span className={styles.number}>{item.number}</span> : null}
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
