import Link from "next/link";
import { paginationPages } from "@/lib/pagination";
import styles from "./pagination.module.css";

export function Pagination({
  ariaLabel,
  currentPage,
  hrefForPage,
  totalPages,
}: {
  ariaLabel: string;
  currentPage: number;
  hrefForPage: (page: number) => string;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const current = Math.max(1, Math.min(currentPage, totalPages));
  return (
    <nav aria-label={ariaLabel} className={styles.pagination}>
      {current > 1
        ? <Link aria-label="Previous page" href={hrefForPage(current - 1)}>‹</Link>
        : <span aria-disabled="true" aria-label="Previous page">‹</span>}
      {paginationPages(current, totalPages).map((page, index) => page === null
        ? <span aria-hidden="true" className={styles.gap} key={`gap-${index}`}>…</span>
        : page === current
          ? <span aria-current="page" key={page}>{page}</span>
          : <Link href={hrefForPage(page)} key={page}>{page}</Link>)}
      {current < totalPages
        ? <Link aria-label="Next page" href={hrefForPage(current + 1)}>›</Link>
        : <span aria-disabled="true" aria-label="Next page">›</span>}
    </nav>
  );
}
