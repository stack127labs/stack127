import Link from "next/link";
import { paginationPages } from "@/lib/pagination";
import styles from "./pagination.module.css";

export function Pagination({
  ariaLabel,
  currentPage,
  hrefForPage,
  totalPages,
  variant = "arrows",
}: {
  ariaLabel: string;
  currentPage: number;
  hrefForPage: (page: number) => string;
  totalPages: number;
  /**
   * `arrows` (default) keeps ‹ and › at both ends. `words` reads like the ad networks mockup's
   * pager: `Previous` and `Next` in words, each shown only when there is a page to go to.
   */
  variant?: "arrows" | "words";
}) {
  if (totalPages <= 1) return null;
  const current = Math.max(1, Math.min(currentPage, totalPages));
  if (variant === "words") {
    return (
      <nav aria-label={ariaLabel} className={styles.pagination} data-variant="words">
        {current > 1 ? <Link prefetch={false} href={hrefForPage(current - 1)} rel="prev">Previous</Link> : null}
        {paginationPages(current, totalPages).map((page, index) => page === null
          ? <span aria-hidden="true" className={styles.gap} key={`gap-${index}`}>…</span>
          : page === current
            ? <span aria-current="page" key={page}>{page}</span>
            : <Link href={hrefForPage(page)} key={page} prefetch={false}>{page}</Link>)}
        {current < totalPages ? <Link prefetch={false} href={hrefForPage(current + 1)} rel="next">Next</Link> : null}
      </nav>
    );
  }
  return (
    <nav aria-label={ariaLabel} className={styles.pagination}>
      {current > 1
        ? <Link aria-label="Previous page" prefetch={false} href={hrefForPage(current - 1)}>‹</Link>
        : <span aria-disabled="true" aria-label="Previous page">‹</span>}
      {paginationPages(current, totalPages).map((page, index) => page === null
        ? <span aria-hidden="true" className={styles.gap} key={`gap-${index}`}>…</span>
        : page === current
          ? <span aria-current="page" key={page}>{page}</span>
          : <Link href={hrefForPage(page)} key={page} prefetch={false}>{page}</Link>)}
      {current < totalPages
        ? <Link aria-label="Next page" prefetch={false} href={hrefForPage(current + 1)}>›</Link>
        : <span aria-disabled="true" aria-label="Next page">›</span>}
    </nav>
  );
}
