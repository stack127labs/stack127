/** Page numbers with a short window around the current page. Null means a gap. */
export function paginationPages(current: number, total: number): Array<number | null> {
  if (total < 1) return [];
  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const pages: Array<number | null> = [];
  for (const page of wanted) {
    const previous = pages.at(-1);
    if (typeof previous === "number") {
      if (page - previous === 2) pages.push(previous + 1);
      else if (page - previous > 2) pages.push(null);
    }
    pages.push(page);
  }
  return pages;
}
