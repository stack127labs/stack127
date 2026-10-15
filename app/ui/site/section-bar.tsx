import Link from "next/link";
import { intentPrefetch } from "./intent-prefetch";
import { SectionBarScroll } from "./section-bar-scroll";
import styles from "./section-bar.module.css";

/** A page opts in to a short set of related pages, independently of its sidebar. */
export type SectionNav = {
  label: string;
  href: string;
  /** The active item's exact href. Passed by the page, without a pathname lookup. */
  current: string;
  items: readonly { label: string; href: string }[];
};

export function SectionBar({ label, href, current, items }: SectionNav) {
  return (
    <nav aria-label={`${label} pages`} className={styles.bar}>
      <Link {...intentPrefetch} className={styles.identity} href={href}>{label}</Link>
      <SectionBarScroll current={current}>
        <ul className={styles.links}>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                {...intentPrefetch}
                aria-current={item.href === current ? "page" : undefined}
                className={styles.link}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </SectionBarScroll>
    </nav>
  );
}
