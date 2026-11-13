import type { AppCategoryLink } from "@/lib/app-category-model";
import styles from "./app-category-links.module.css";

/** Every published category of a directory. On a category page, the current one is marked, not linked. */
export function AppCategoryLinks({ categories, current }: { categories: readonly AppCategoryLink[]; current?: string }) {
  if (!categories.length) return null;
  return <nav aria-label="Browse by category" className={styles.categories}>
    <h2>Browse by category</h2>
    <ul>{categories.map(category => <li key={category.slug}>
      {category.slug === current
        ? <strong aria-current="page">{category.name}</strong>
        : <a href={category.href}>{category.name}</a>}{" "}
      <span>({category.count.toLocaleString("en-US")})</span>
    </li>)}</ul>
  </nav>;
}
