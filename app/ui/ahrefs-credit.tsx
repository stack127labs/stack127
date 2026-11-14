import { AHREFS_ATTRIBUTION } from "@/lib/ahrefs";
import styles from "./ahrefs-credit.module.css";

/**
 * The credit Ahrefs' Domain Rating license requires next to every place DR is shown:
 * the words "Domain Rating by Ahrefs", with "Ahrefs" linking to ahrefs.com.
 */
export function AhrefsCredit({ prefix }: { prefix?: string }) {
  return <span className={styles.credit}>
    {prefix ? `${prefix} ` : null}Domain Rating by <a href={AHREFS_ATTRIBUTION.url} rel="noopener noreferrer" target="_blank">Ahrefs</a>
  </span>;
}
