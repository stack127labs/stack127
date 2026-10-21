import styles from "./launch-directories.module.css";

/**
 * The credit Ahrefs' Domain Rating license requires next to every place DR is shown:
 * the words "Domain Rating by Ahrefs", with "Ahrefs" linking to ahrefs.com.
 */
export function AhrefsCredit({ prefix }: { prefix?: string }) {
  return <span className={styles.ahrefsCredit}>
    {prefix ? `${prefix} ` : null}Domain Rating by <a href="https://ahrefs.com/" rel="noopener noreferrer" target="_blank">Ahrefs</a>
  </span>;
}
