import type { AppCategoryLink } from "@/lib/app-category-model";
import styles from "./app-category.module.css";

export function AppCategoryLinks({ categories, current }: { categories: readonly AppCategoryLink[]; current?: string }) {
  const links = categories.filter(category => category.slug !== current);
  if (!links.length) return null;
  return <nav aria-label="Browse by category" className={styles.categories}>
    <h2>Browse by category</h2>
    <ul>{links.map(category => <li key={category.slug}>
      <a href={category.href}>{category.name}</a> <span>({category.count.toLocaleString("en-US")})</span>
    </li>)}</ul>
  </nav>;
}
