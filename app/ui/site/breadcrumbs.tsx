import Link from "next/link";
import type { Breadcrumb } from "@/lib/breadcrumbs";
import styles from "./breadcrumbs.module.css";

/** The trail above a page title. The last step is the page itself and isn't a link. */
export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol>
        {items.map((item, index) => (
          <li data-section={item.section || undefined} key={item.href}>
            {index < items.length - 1
              ? <Link href={item.href}>{item.name}</Link>
              : <span aria-current="page">{item.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
