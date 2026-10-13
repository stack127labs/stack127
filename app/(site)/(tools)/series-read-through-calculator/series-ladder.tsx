import { UiHint } from "@/app/ui/controls";
import { UiStatusWord } from "@/app/ui/display";
import type { SeriesBookValues } from "@/lib/kdp/series-read-through.ts";
import styles from "./series-read-through-calculator.module.css";

const usd = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" });

export function seriesMoney(cents: number) {
  return usd.format(cents / 100);
}

/** Basis points as a percent with at most one decimal, such as 55% or 56.7%. */
export function seriesPercent(basisPoints: number) {
  return `${(basisPoints / 100).toFixed(1).replace(/\.0$/, "")}%`;
}

/** Readers out of every 100 who start book 1. */
function reachText(basisPoints: number) {
  const readers = Math.round(basisPoints / 100);
  return basisPoints > 0 && readers === 0 ? "<1" : readers.toLocaleString("en-US");
}

export function bookStatus(book: SeriesBookValues): string | null {
  if (book.free) return "Free";
  if (book.limit?.kind === "below-minimum") return "KDP minimum";
  if (book.limit?.kind === "above-maximum") return "KDP maximum";
  if (book.rate === 35) return "35%";
  return null;
}

/**
 * One row per book: how many of every 100 book 1 readers reach it, the step from the book before,
 * and what it adds to one reader's value. Bars scale to the longest reach, so a step above 100% fits.
 */
export function SeriesLadder({ books }: { books: readonly SeriesBookValues[] }) {
  const longest = Math.max(...books.map((book) => book.reachBasisPoints), 1);
  return (
    <figure className={styles.ladder}>
      <figcaption className={styles.ladderTitle}>
        Readers and earnings by book
        <UiHint label="Read-through" text="A step tops 100% when a book had more readers than the one before." />
      </figcaption>
      <div aria-hidden="true" className={styles.ladderHead}>
        <span>Book</span>
        <span>Readers of 100</span>
        <span>Read-through</span>
        <span>Adds per reader</span>
      </div>
      <ol aria-hidden="true" className={styles.ladderRows}>
        {books.map((book) => {
          const status = bookStatus(book);
          return (
            <li className={styles.ladderRow} key={book.index}>
              <span className={styles.ladderName}>
                Book {book.index + 1}
                {status ? <UiStatusWord>{status}</UiStatusWord> : null}
              </span>
              <span className={styles.ladderTrack}>
                <span className={styles.ladderBar} style={{ width: `${(book.reachBasisPoints / longest) * 100}%` }} />
              </span>
              <span className={styles.ladderReach}>
                {reachText(book.reachBasisPoints)}
                <span className={styles.phoneOnly}> of 100</span>
              </span>
              <span className={styles.ladderStep} data-empty={book.stepBasisPoints === null || undefined}>
                <span className={styles.phoneOnly}>step </span>
                {book.stepBasisPoints === null ? "—" : seriesPercent(book.stepBasisPoints)}
              </span>
              <span className={styles.ladderEarns}>{seriesMoney(book.contributionCents)}</span>
            </li>
          );
        })}
      </ol>
      <div className={styles.visuallyHidden}>
        <table>
          <caption>Readers and earnings by book</caption>
          <thead>
            <tr>
              <th scope="col">Book</th>
              <th scope="col">Readers of every 100 who start book 1</th>
              <th scope="col">Read-through from the book before</th>
              <th scope="col">Adds to one reader&apos;s value</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.index}>
                <th scope="row">Book {book.index + 1}{bookStatus(book) ? `, ${bookStatus(book)}` : ""}</th>
                <td>{reachText(book.reachBasisPoints)}</td>
                <td>{book.stepBasisPoints === null ? "None" : seriesPercent(book.stepBasisPoints)}</td>
                <td>{seriesMoney(book.contributionCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
