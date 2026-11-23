import Link from "next/link";
import { cardIcon } from "@/lib/card-icons";
import { intentPrefetch } from "@/app/ui/site/intent-prefetch";
import styles from "./catalog-card.module.css";
import stackStyles from "./app-stack-card.module.css";

/** One home card for the app directories: a heading, then a link per directory. It has no hub page, so the head is not a link. */
export function AppStackCard({ name, iconKey, pages }: {
  name: string;
  iconKey: string;
  pages: Array<{ slug: string; name: string }>;
}) {
  const Icon = cardIcon(iconKey);
  return (
    <div className={`${styles.card} ${stackStyles.card}`}>
      <div className={styles.head}>
        <span aria-hidden="true" className={styles.icon}><Icon size={15} strokeWidth={2.2} /></span>
        <h3 className={styles.name}>{name}</h3>
        <span className={styles.count}>{pages.length} directories</span>
      </div>
      <ul className={`${styles.list} ${stackStyles.list}`}>
        {pages.map((page) => (
          <li key={page.slug}>
            <Link {...intentPrefetch} className={styles.tool} href={`/${page.slug}`}>
              <span aria-hidden="true" className={styles.arrow}>→</span>
              {page.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
